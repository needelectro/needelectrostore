// NEED ELECTRO ERP — Users CRUD Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission, hashPassword } from '@/lib/auth';
import { createUserSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'users', 'view') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      roleId: true,
      branchId: true,
      primaryBranchId: true,
      allowedBranchIds: true,
      phone: true,
      employeeId: true,
      avatar: true,
      active: true,
      status: true,
      mustChangePassword: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'users', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name, email, phone, username, password, role, branchId, allowedBranchIds, employeeId, status } = parsed.data;

    // Check email uniqueness
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ email: email.toLowerCase() }, ...(username ? [{ username }] : [])],
      },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'A user with this email or username already exists.' }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        id: 'user-' + Date.now(),
        name,
        email: email.toLowerCase(),
        username: username || email.split('@')[0],
        phone,
        passwordHash: hashPassword(password),
        role,
        branchId,
        primaryBranchId: branchId,
        allowedBranchIds: allowedBranchIds || [branchId],
        employeeId,
        status: status || 'ACTIVE',
        active: status === 'ACTIVE',
        mustChangePassword: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'USER_CREATED',
        module: 'USERS',
        recordId: newUser.id,
        details: `Created user ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully.',
      user: newUser,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Failed to create user' }, { status: 500 });
  }
}
