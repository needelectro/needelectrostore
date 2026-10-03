// NEED ELECTRO ERP — Role Individual Modification Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'roles', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { name, description, permissions, isActive } = await req.json();

  const role = await prisma.role.findUnique({ where: { id: params.id } });
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
  }

  // Prevent modifying critical system roles
  if (role.code === 'SUPER_ADMIN' && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Cannot modify SUPER_ADMIN role' }, { status: 403 });
  }

  await prisma.role.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(permissions && { permissions }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  return NextResponse.json({ success: true, message: 'Role updated successfully' });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin can delete roles.' }, { status: 403 });
  }

  const role = await prisma.role.findUnique({ where: { id: params.id } });
  if (!role) {
    return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
  }

  if (role.isSystem) {
    return NextResponse.json({ success: false, error: 'System core roles cannot be deleted' }, { status: 400 });
  }

  // Check if any users have this role
  const userWithRole = await prisma.user.findFirst({
    where: {
      OR: [
        { role: role.code },
        { roleId: role.id }
      ]
    }
  });

  if (userWithRole) {
    return NextResponse.json({
      success: false,
      error: `Cannot delete role "${role.name}" because active staff account "${userWithRole.name}" is assigned to it.`
    }, { status: 400 });
  }

  await prisma.role.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true, message: `Role "${role.name}" permanently deleted.` });
}

