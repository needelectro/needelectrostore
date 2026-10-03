// NEED ELECTRO ERP — User Individual Update & Delete Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission, hashPassword } from '@/lib/auth';

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
    const { name, email, phone, role, roleId, branchId, allowedBranchIds, employeeId, status, password } = body;

    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Protect Super Admin account from role demotion by non-superadmins
    if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Cannot modify Super Admin account privileges' }, { status: 403 });
    }

    // Validate email uniqueness if changing
    const cleanEmail = email ? email.trim().toLowerCase() : undefined;
    if (cleanEmail && cleanEmail !== targetUser.email.toLowerCase()) {
      const existing = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          id: { not: params.id },
        },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'An account with this email address already exists.' }, { status: 400 });
      }
    }

    // Hash new password if supplied
    let newPasswordHash: string | undefined = undefined;
    if (password && typeof password === 'string' && password.trim().length >= 6) {
      newPasswordHash = hashPassword(password.trim());
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(cleanEmail && { email: cleanEmail }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(role && { role }),
        ...(roleId !== undefined && { roleId }),
        ...(branchId && { branchId, primaryBranchId: branchId }),
        ...(allowedBranchIds !== undefined && { allowedBranchIds }),
        ...(employeeId !== undefined && { employeeId: employeeId ? employeeId.trim() : null }),
        ...(status && { status, active: status === 'ACTIVE' }),
        ...(newPasswordHash && { passwordHash: newPasswordHash, mustChangePassword: false }),
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
        details: `Super Admin ${user.name} updated profile for user ${targetUser.name} (${cleanEmail || targetUser.email})`,
      },
    });

    return NextResponse.json({ success: true, message: 'User updated successfully', data: updated });
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

  const url = new URL(req.url);
  const isForce = url.searchParams.get('force') === 'true' || url.searchParams.get('permanent') === 'true';

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

    if (targetUser.role === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Only Super Admin can delete a Super Admin account.' }, { status: 403 });
    }

    // Check if user has historical sales transactions
    const salesCount = await prisma.sale.count({ where: { salespersonId: targetUser.id } });
    const hasLinkedRecords = Boolean(targetUser.investor || salesCount > 0);

    await prisma.$transaction(async (tx) => {
      // Always revoke / remove all active sessions
      await tx.session.deleteMany({
        where: { userId: targetUser.id },
      });

      if (hasLinkedRecords && !isForce) {
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
        // Permanent deletion: safely decouple investor profile if exists
        if (targetUser.investor) {
          await tx.investorMonthlyProfit.deleteMany({ where: { investorId: targetUser.investor.id } });
          await tx.investment.updateMany({
            where: { investorId: targetUser.investor.id },
            data: { investorId: null },
          });
          await tx.investor.delete({ where: { id: targetUser.investor.id } });
        }

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

    const msg = (hasLinkedRecords && !isForce)
      ? `User ${targetUser.name} has historical transactions and was safely deactivated without data loss.`
      : `User ${targetUser.name} permanently deleted successfully.`;

    return NextResponse.json({ success: true, message: msg });
  } catch (err: any) {
    console.error('User deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

