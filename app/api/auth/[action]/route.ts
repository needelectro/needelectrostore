// NEED ELECTRO ERP — Authentication Action Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  authenticateRequest,
} from '@/lib/auth';
import { loginSchema, changePasswordSchema } from '@/lib/validations';

export async function POST(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = params.action;

  try {
    // 1. SETUP STATUS
    if (action === 'setup-status') {
      const setup = await prisma.setupStatus.findUnique({ where: { id: 'main' } });
      const userCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
      return NextResponse.json({
        success: true,
        data: {
          initialSetupCompleted: setup ? setup.initialSetupCompleted : userCount > 0,
          isSuperAdminConfigured: userCount > 0,
        },
      });
    }

    // 2. INITIAL SETUP (Super Admin Creation)
    if (action === 'initial-setup') {
      const existingSuperAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' },
      });

      if (existingSuperAdmin) {
        return NextResponse.json(
          { success: false, error: 'Initial setup has already been completed.' },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { name, email, phone, password, companyName } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, error: 'Name, email, and password are required.' },
          { status: 400 }
        );
      }

      // Ensure main branch
      const branch = await prisma.branch.upsert({
        where: { code: 'DHK-MAIN' },
        update: {},
        create: {
          id: 'branch-main-1',
          name: 'NEED ELECTRO Main Showroom',
          code: 'DHK-MAIN',
          address: 'Central Road, Moulvibazar',
          phone: phone || '+880 1733-983752',
          email,
          isWarehouse: false,
          active: true,
        },
      });

      // Ensure superadmin role
      const role = await prisma.role.upsert({
        where: { code: 'SUPER_ADMIN' },
        update: {},
        create: {
          id: 'role-superadmin',
          name: 'Super Administrator',
          code: 'SUPER_ADMIN',
          description: 'Full unconstrained system authority',
          isSystem: true,
          permissions: ['*'],
          isActive: true,
        },
      });

      const user = await prisma.user.create({
        data: {
          id: 'user-superadmin-1',
          name,
          email,
          username: 'superadmin',
          role: 'SUPER_ADMIN',
          roleId: role.id,
          branchId: branch.id,
          primaryBranchId: branch.id,
          allowedBranchIds: [branch.id],
          phone,
          passwordHash: hashPassword(password),
          status: 'ACTIVE',
        },
      });

      if (companyName) {
        await prisma.systemSettings.upsert({
          where: { id: 'main' },
          update: { companyName },
          create: { id: 'main', companyName },
        });
      }

      await prisma.setupStatus.upsert({
        where: { id: 'main' },
        update: { initialSetupCompleted: true, setupDate: new Date(), initializedBy: email },
        create: { id: 'main', initialSetupCompleted: true, setupDate: new Date(), initializedBy: email },
      });

      return NextResponse.json({
        success: true,
        message: 'Super Admin successfully initialized.',
      });
    }

    // 3. LOGIN
    if (action === 'login') {
      const body = await req.json();
      const parsed = loginSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.errors[0].message },
          { status: 400 }
        );
      }

      const { email, password, rememberMe, branchId } = parsed.data;
      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const userAgent = req.headers.get('user-agent') || 'Browser';

      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: email.toLowerCase() }, { username: email }],
        },
        include: {
          roleRel: true,
          branch: true,
        },
      });

      if (!user) {
        await prisma.loginHistory.create({
          data: {
            id: 'log-' + Date.now(),
            email,
            status: 'FAILED',
            ipAddress: ip,
            userAgent,
            details: 'Invalid email or user not found',
          },
        });
        return NextResponse.json(
          { success: false, error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Verify password (accounts are never locked)
      const isValid = verifyPassword(password, user.passwordHash);
      if (!isValid) {
        const failedAttempts = (user.failedLoginAttempts || 0) + 1;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: null, // Never lock any account
          },
        });

        await prisma.loginHistory.create({
          data: {
            id: 'log-' + Date.now(),
            userId: user.id,
            email,
            status: 'FAILED',
            ipAddress: ip,
            userAgent,
            details: `Failed attempt ${failedAttempts}`,
          },
        });

        return NextResponse.json(
          { success: false, error: 'Invalid email or password.' },
          { status: 401 }
        );
      }

      // Check active status
      if (user.status !== 'ACTIVE' || !user.active) {
        return NextResponse.json(
          { success: false, error: `Account is ${user.status.toLowerCase()}. Please contact Super Admin.` },
          { status: 403 }
        );
      }

      // Successful login - reset failed attempts & update login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      });

      // Create session
      const token = generateSecureToken();
      const durationDays = rememberMe ? 30 : 1;
      const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

      await prisma.session.create({
        data: {
          id: 'sess-' + Date.now(),
          token,
          userId: user.id,
          expiresAt,
          ipAddress: ip,
          userAgent,
        },
      });

      // Record successful login history
      await prisma.loginHistory.create({
        data: {
          id: 'log-' + Date.now(),
          userId: user.id,
          email: user.email,
          status: 'SUCCESS',
          ipAddress: ip,
          userAgent,
          details: `Authenticated via ${user.role}`,
        },
      });

      // Determine active branch
      let activeBranchId = branchId || user.branchId;
      if (branchId && user.allowedBranchIds) {
        const allowed = Array.isArray(user.allowedBranchIds) ? user.allowedBranchIds : [];
        if (!allowed.includes(branchId) && user.role !== 'SUPER_ADMIN') {
          activeBranchId = user.branchId;
        }
      }

      const responseUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        roleId: user.roleId,
        branchId: activeBranchId,
        primaryBranchId: user.primaryBranchId || user.branchId,
        allowedBranchIds: user.allowedBranchIds || [user.branchId],
        phone: user.phone,
        status: user.status,
        mustChangePassword: user.mustChangePassword,
        permissions: user.roleRel?.permissions || [],
      };

      const res = NextResponse.json({
        success: true,
        token,
        user: responseUser,
      });

      // Set HTTP-only session cookie for web browser
      res.cookies.set('nec_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: durationDays * 24 * 60 * 60,
      });

      return res;
    }

    // 4. LOGOUT
    if (action === 'logout') {
      const user = await authenticateRequest(req);
      if (user && user.token) {
        await prisma.session.updateMany({
          where: { token: user.token },
          data: { isRevoked: true },
        });
      }

      const res = NextResponse.json({ success: true, message: 'Signed out successfully.' });
      res.cookies.delete('nec_session');
      return res;
    }

    // 5. SESSION VERIFICATION
    if (action === 'session') {
      const user = await authenticateRequest(req);
      if (!user) {
        return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        authenticated: true,
        user,
      });
    }

    // 6. UNLOCK SCREEN
    if (action === 'unlock') {
      const user = await authenticateRequest(req);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 });
      }

      const body = await req.json();
      const { password } = body;
      if (!password) {
        return NextResponse.json({ success: false, error: 'Password required' }, { status: 400 });
      }

      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !verifyPassword(password, dbUser.passwordHash)) {
        return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 });
      }

      return NextResponse.json({ success: true, message: 'Session unlocked' });
    }

    // 7. CHANGE PASSWORD
    if (action === 'change-password') {
      const user = await authenticateRequest(req);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
      }

      const body = await req.json();
      const parsed = changePasswordSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
      }

      const { oldPassword, newPassword } = parsed.data;
      const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
      if (!dbUser || !verifyPassword(oldPassword, dbUser.passwordHash)) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashPassword(newPassword),
          mustChangePassword: false,
        },
      });

      await prisma.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'PASSWORD_CHANGE',
          module: 'AUTH',
          recordId: user.id,
          details: 'User successfully changed password',
        },
      });

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    }

    return NextResponse.json({ success: false, error: 'Unknown auth action' }, { status: 404 });
  } catch (err: any) {
    console.error(`Auth [${action}] error:`, err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { action: string } }
) {
  const action = params.action;

  if (action === 'setup-status') {
    const setup = await prisma.setupStatus.findUnique({ where: { id: 'main' } });
    const userCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    return NextResponse.json({
      success: true,
      data: {
        initialSetupCompleted: setup ? setup.initialSetupCompleted : userCount > 0,
        isSuperAdminConfigured: userCount > 0,
      },
    });
  }

  if (action === 'session') {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, authenticated: false }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  }

  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}
