// NEED ELECTRO ERP — User Individual Update & Delete Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'users', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { name, phone, role, branchId, allowedBranchIds, employeeId, status } = body;

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Protect Super Admin account from role demotion by non-superadmins
    if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot modify Super Admin account' }, { status: 403 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(branchId && { branchId }),
        ...(allowedBranchIds && { allowedBranchIds }),
        ...(employeeId !== undefined && { employeeId }),
        ...(status && { status, active: status === 'ACTIVE' }),
      },
    });

    await prisma.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'USER_UPDATED',
        module: 'USERS',
        recordId: targetUser.id,
        details: `Updated user ${targetUser.name}`,
      },
    });

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete users.' }, { status: 403 });
  }

  if (user.id === params.id) {
    return NextResponse.json({ success: false, error: 'Cannot delete your own active Super Admin account.' }, { status: 400 });
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        investor: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Check if user has historical business records
    const [salesCount, purchasesCount] = await Promise.all([
      prisma.sale.count({ where: { salespersonId: targetUser.id } }),
      prisma.purchase.count({ where: { branchId: targetUser.branchId } }),
    ]);

    const hasLinkedRecords = Boolean(targetUser.investor || salesCount > 0);

    await prisma.$transaction(async (tx) => {
      // Always revoke all active sessions
      await tx.session.updateMany({
        where: { userId: targetUser.id, isRevoked: false },
        data: { isRevoked: true },
      });

      if (hasLinkedRecords) {
        // Safe Deactivation to preserve historical business transactions & investor profile
        await tx.user.update({
          where: { id: targetUser.id },
          data: {
            status: 'DEACTIVATED',
            active: false,
          },
        });

        await tx.auditLog.create({
          data: {
            id: 'audit-' + Date.now(),
            userId: user.id,
            userName: user.name,
            action: 'USER_DEACTIVATED',
            module: 'USERS',
            recordId: targetUser.id,
            details: `Super Admin ${user.name} safely deactivated user ${targetUser.name} (${targetUser.email}) preserving historical transactions.`,
          },
        });
      } else {
        // No historical dependencies - safe to delete
        await tx.session.deleteMany({ where: { userId: targetUser.id } });
        await tx.user.delete({ where: { id: targetUser.id } });

        await tx.auditLog.create({
          data: {
            id: 'audit-' + Date.now(),
            userId: user.id,
            userName: user.name,
            action: 'SUPER_ADMIN_USER_DELETE',
            module: 'USERS',
            recordId: targetUser.id,
            details: `Super Admin ${user.name} permanently deleted user ${targetUser.name} (${targetUser.email})`,
          },
        });
      }
    });

    const msg = hasLinkedRecords
      ? `User ${targetUser.name} has historical records and was safely deactivated without data loss.`
      : `User ${targetUser.name} deleted successfully.`;

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    console.error('User deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

