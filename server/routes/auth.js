// NEED ELECTRO ERP — Production Authentication & User/RBAC Routes
import { Router } from 'express';
import { db, transaction, hashPassword, verifyPassword, generateSecureToken } from '../db.js';
import { requireAuth, requireSuperAdmin, requirePermission } from '../middleware/auth.js';

export const authRouter = Router();

/**
 * 1. Check Initial Setup Status
 */
authRouter.get('/setup-status', (req, res) => {
  try {
    const status = db.prepare('SELECT * FROM setup_status WHERE id = ?').get('main');
    const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN'").get().count;

    res.json({
      success: true,
      data: {
        isSuperAdminConfigured: superAdminCount > 0,
        initialSetupCompleted: status ? Boolean(status.initial_setup_completed && superAdminCount > 0) : false,
        systemMode: status?.system_mode || 'PRODUCTION',
        isCompanyConfigured: Boolean(status?.is_company_configured),
        isMainBranchConfigured: Boolean(status?.is_main_branch_configured),
        isWarehouseConfigured: Boolean(status?.is_warehouse_configured)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 2. Complete First-Time Initial System Setup
 */
authRouter.post('/initial-setup', (req, res) => {
  try {
    const status = db.prepare('SELECT * FROM setup_status WHERE id = ?').get('main');
    const superAdminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'SUPER_ADMIN'").get().count;

    // Prevent unauthorized recreation if setup is already completed
    if (status && status.initial_setup_completed && superAdminCount > 0) {
      return res.status(403).json({
        success: false,
        error: 'System setup has already been completed. First-time setup endpoint is locked.'
      });
    }

    const { name, email, phone, username, password, companyData } = req.body;

    if (!email || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Valid email and a secure password of at least 8 characters are required.'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username ? username.trim().toLowerCase() : cleanEmail.split('@')[0];
    const passwordHash = hashPassword(password);

    transaction(() => {
      // Check if user exists
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
      let adminId = 'user-superadmin-1';

      if (existingUser) {
        adminId = existingUser.id;
        db.prepare(`
          UPDATE users
          SET name = ?, username = ?, role = 'SUPER_ADMIN', role_id = 'role-superadmin',
              branch_id = 'branch-1', primary_branch_id = 'branch-1',
              allowed_branch_ids = '["branch-1", "branch-2", "branch-3"]',
              phone = ?, password_hash = ?, active = 1, status = 'ACTIVE',
              failed_login_attempts = 0, locked_until = NULL
          WHERE id = ?
        `).run(name || 'Amdadur Rahman', cleanUsername, phone || '01733-983752', passwordHash, adminId);
      } else {
        db.prepare(`
          INSERT INTO users (
            id, name, email, username, role, role_id, branch_id, primary_branch_id,
            allowed_branch_ids, phone, password_hash, active, status,
            failed_login_attempts, created_at
          ) VALUES (?, ?, ?, ?, 'SUPER_ADMIN', 'role-superadmin', 'branch-1', 'branch-1', '["branch-1", "branch-2", "branch-3"]', ?, ?, 1, 'ACTIVE', 0, datetime('now'))
        `).run(adminId, name || 'Amdadur Rahman', cleanEmail, cleanUsername, phone || '01733-983752', passwordHash);
      }

      // Update company info if provided
      if (companyData) {
        db.prepare(`
          UPDATE system_settings
          SET company_name = COALESCE(?, company_name),
              company_tagline = COALESCE(?, company_tagline),
              phone = COALESCE(?, phone),
              email = COALESCE(?, email),
              address = COALESCE(?, address),
              updated_at = datetime('now')
          WHERE id = 'main'
        `).run(
          companyData.companyName, companyData.companyTagline,
          companyData.phone, companyData.email, companyData.address
        );
      }

      // Mark setup as permanently completed
      db.prepare(`
        UPDATE setup_status
        SET is_super_admin_configured = 1, initial_setup_completed = 1,
            is_company_configured = 1, is_main_branch_configured = 1,
            is_warehouse_configured = 1, system_mode = 'PRODUCTION'
        WHERE id = 'main'
      `).run();

      // Log setup audit
      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'INITIAL_SETUP_COMPLETED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), adminId, name || 'Amdadur Rahman', adminId,
        `First-time ERP setup completed. Super Admin account provisioned for ${cleanEmail}.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({
      success: true,
      message: 'Super Admin master account configured successfully. You may now log in.'
    });
  } catch (err) {
    console.error('Initial setup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 3. Production User Login
 */
authRouter.post('/login', (req, res) => {
  try {
    const { email, password, rememberMe, branchId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email/username and password are required.' });
    }

    const identifier = email.trim().toLowerCase();
    const user = db.prepare(`
      SELECT u.*, r.permissions as role_permissions
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.code
      WHERE LOWER(u.email) = ? OR LOWER(u.username) = ?
    `).get(identifier, identifier);

    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    if (!user) {
      db.prepare(`
        INSERT INTO login_history (id, user_id, email, status, ip_address, user_agent, details, created_at)
        VALUES (?, NULL, ?, 'FAILED', ?, ?, 'User account not found', datetime('now'))
      `).run('log-' + Date.now(), identifier, clientIp, userAgent);

      return res.status(401).json({ success: false, error: 'Invalid login credentials.' });
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'This account has been suspended by System Administration. Contact contact.amdadur@gmail.com for assistance.'
      });
    }
    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'This account is deactivated. Contact the Super Admin.'
      });
    }
    if (user.status === 'PENDING') {
      return res.status(403).json({
        success: false,
        error: 'Account approval pending. Please contact your manager.'
      });
    }

    // Check lockout
    if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
      const minutesRemaining = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Try again in ${minutesRemaining} minutes.`
      });
    }

    // Verify password
    const isMatch = verifyPassword(password, user.password_hash);

    if (!isMatch) {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockSql = 'failed_login_attempts = ?';
      const params = [attempts];

      if (attempts >= 5) {
        // Lock for 15 minutes
        lockSql += ", locked_until = datetime('now', '+15 minutes')";
      }

      db.prepare(`UPDATE users SET ${lockSql} WHERE id = ?`).run(...params, user.id);

      db.prepare(`
        INSERT INTO login_history (id, user_id, email, status, ip_address, user_agent, details, created_at)
        VALUES (?, ?, ?, 'FAILED', ?, ?, ?, datetime('now'))
      `).run('log-' + Date.now(), user.id, user.email, clientIp, userAgent, `Incorrect password. Attempt ${attempts}/5.`);

      return res.status(401).json({
        success: false,
        error: attempts >= 5
          ? 'Account locked for 15 minutes due to multiple failed login attempts.'
          : `Invalid password. ${5 - attempts} attempts remaining before temporary lockout.`
      });
    }

    // Password verified! Reset failed attempts and update last login
    db.prepare(`
      UPDATE users
      SET failed_login_attempts = 0, locked_until = NULL, last_login_at = datetime('now')
      WHERE id = ?
    `).run(user.id);

    // Create session token
    const token = generateSecureToken();
    const durationDays = rememberMe ? 30 : 1;
    const expiresAt = new Date(Date.now() + durationDays * 86400000).toISOString();

    db.prepare(`
      INSERT INTO sessions (id, token, user_id, created_at, expires_at, last_active_at, ip_address, user_agent, is_revoked)
      VALUES (?, ?, ?, datetime('now'), ?, datetime('now'), ?, ?, 0)
    `).run('sess-' + Date.now(), token, user.id, expiresAt, clientIp, userAgent);

    // Record login in history & audit log
    db.prepare(`
      INSERT INTO login_history (id, user_id, email, status, ip_address, user_agent, details, created_at)
      VALUES (?, ?, ?, 'SUCCESS', ?, ?, 'Successful authentication', datetime('now'))
    `).run('log-' + Date.now(), user.id, user.email, clientIp, userAgent);

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
      VALUES (?, datetime('now'), ?, ?, 'LOGIN_SUCCESS', 'SETTINGS', ?, ?, ?)
    `).run(
      'audit-' + Date.now(), user.id, user.name, user.id,
      `User ${user.name} (${user.email}) logged in successfully as ${user.role}.`,
      clientIp
    );

    let permissions = [];
    try {
      if (user.role_permissions) permissions = JSON.parse(user.role_permissions);
    } catch (e) {}

    let allowedBranches = [user.branch_id];
    try {
      if (user.allowed_branch_ids) allowedBranches = JSON.parse(user.allowed_branch_ids);
    } catch (e) {}

    const selectedBranch = branchId || user.branch_id;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        roleId: user.role_id,
        branchId: selectedBranch,
        primaryBranchId: user.primary_branch_id || user.branch_id,
        allowedBranchIds: allowedBranches,
        phone: user.phone,
        status: user.status,
        permissions,
        lastLoginAt: user.last_login_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 4. Logout
 */
authRouter.post('/logout', requireAuth, (req, res) => {
  try {
    if (req.user?.token) {
      db.prepare('UPDATE sessions SET is_revoked = 1 WHERE token = ?').run(req.user.token);
    }

    db.prepare(`
      INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
      VALUES (?, datetime('now'), ?, ?, 'LOGOUT', 'SETTINGS', ?, ?, ?)
    `).run(
      'audit-' + Date.now(), req.user.id, req.user.name, req.user.id,
      `User ${req.user.name} signed out.`,
      req.ip || '127.0.0.1'
    );

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 5. Current Session Verification
 */
authRouter.get('/session', requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * 6. Change Current User Password
 */
authRouter.post('/change-password', requireAuth, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Current password and a new password of at least 8 characters are required.'
      });
    }

    const user = db.prepare('SELECT id, name, password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!user || !verifyPassword(oldPassword, user.password_hash)) {
      return res.status(400).json({ success: false, error: 'Current password does not match.' });
    }

    const newHash = hashPassword(newPassword);

    transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?').run(newHash, req.user.id);

      // Invalidate all other active sessions except current
      db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ? AND token != ?').run(req.user.id, req.user.token);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'PASSWORD_CHANGE', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, req.user.id,
        `User ${req.user.name} updated security credentials. Other sessions revoked.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 7. Terminal Unlock
 */
authRouter.post('/unlock', requireAuth, (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required to unlock.' });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ success: false, error: 'Incorrect password.' });
    }

    res.json({ success: true, message: 'Terminal unlocked.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 8. User Management: List All Users
 */
authRouter.get('/users', requireAuth, requirePermission('users.manage'), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, name, email, username, role, role_id, branch_id, primary_branch_id,
             allowed_branch_ids, phone, employee_id, avatar, active, status,
             must_change_password, last_login_at, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    const formatted = users.map(u => ({
      ...u,
      allowedBranchIds: u.allowed_branch_ids ? JSON.parse(u.allowed_branch_ids) : [u.branch_id],
      active: Boolean(u.active)
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 9. User Management: Create Staff Account
 */
authRouter.post('/users', requireAuth, requirePermission('users.manage'), (req, res) => {
  try {
    const { name, email, phone, role, branchId, allowedBranchIds, employeeId, password, status, username } = req.body;

    if (!name || !email || !role || !branchId) {
      return res.status(400).json({ success: false, error: 'Name, email, role, and branch are mandatory.' });
    }

    // Restrict creating Super Admin unless current user is Super Admin
    if (role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only the Super Admin can grant Super Admin clearance.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email address already exists.' });
    }

    const cleanUsername = username ? username.trim().toLowerCase() : cleanEmail.split('@')[0];
    const initialPass = password && password.length >= 8 ? password : 'NeedElectro@2026';
    const passwordHash = hashPassword(initialPass);
    const roleRow = db.prepare('SELECT id FROM roles WHERE code = ? OR name = ?').get(role, role);

    const newId = 'user-' + Date.now();
    const branchesJson = JSON.stringify(allowedBranchIds || [branchId]);

    transaction(() => {
      db.prepare(`
        INSERT INTO users (
          id, name, email, username, role, role_id, branch_id, primary_branch_id,
          allowed_branch_ids, phone, employee_id, password_hash, active, status,
          failed_login_attempts, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, 0, datetime('now'))
      `).run(
        newId, name.trim(), cleanEmail, cleanUsername, role, roleRow?.id || null,
        branchId, branchId, branchesJson, phone || '', employeeId || null,
        passwordHash, status || 'ACTIVE'
      );

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'USER_CREATED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, newId,
        `Created staff account for ${name} (${cleanEmail}) with role ${role} at branch ${branchId}.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({
      success: true,
      message: `Account for ${name} created successfully.`,
      user: {
        id: newId,
        name,
        email: cleanEmail,
        username: cleanUsername,
        role,
        branchId,
        status: status || 'ACTIVE'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 10. User Management: Update User Account
 */
authRouter.put('/users/:id', requireAuth, requirePermission('users.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, role, branchId, allowedBranchIds, status, employeeId } = req.body;

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Protect Super Admin from modification by non-Super Admin
    if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Cannot modify Super Admin accounts.' });
    }

    const roleRow = role ? db.prepare('SELECT id FROM roles WHERE code = ? OR name = ?').get(role, role) : null;
    const branchesJson = allowedBranchIds ? JSON.stringify(allowedBranchIds) : targetUser.allowed_branch_ids;

    transaction(() => {
      db.prepare(`
        UPDATE users
        SET name = COALESCE(?, name),
            phone = COALESCE(?, phone),
            role = COALESCE(?, role),
            role_id = COALESCE(?, role_id),
            branch_id = COALESCE(?, branch_id),
            allowed_branch_ids = ?,
            status = COALESCE(?, status),
            employee_id = COALESCE(?, employee_id)
        WHERE id = ?
      `).run(name, phone, role, roleRow?.id, branchId, branchesJson, status, employeeId, id);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'USER_UPDATED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Updated account profile for ${targetUser.name} (${targetUser.email}).`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 11. User Management: Set Account Status (Activate/Deactivate/Suspend)
 */
authRouter.post('/users/:id/status', requireAuth, requirePermission('users.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value.' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Cannot alter Super Admin status.' });
    }

    transaction(() => {
      db.prepare('UPDATE users SET status = ?, active = ? WHERE id = ?').run(status, status === 'ACTIVE' ? 1 : 0, id);

      if (status !== 'ACTIVE') {
        db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?').run(id);
      }

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'USER_STATUS_CHANGE', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Changed account status of ${targetUser.name} to ${status}.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: `Account status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 12. User Management: Admin Password Reset
 */
authRouter.post('/users/:id/reset-password', requireAuth, requirePermission('users.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }

    const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (targetUser.role === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Only Super Admin can reset Super Admin password.' });
    }

    const newHash = hashPassword(newPassword);

    transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, must_change_password = 1 WHERE id = ?').run(newHash, id);
      db.prepare('UPDATE sessions SET is_revoked = 1 WHERE user_id = ?').run(id);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'PASSWORD_RESET', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Admin ${req.user.name} reset password for staff member ${targetUser.name}.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: `Password reset successfully for ${targetUser.name}.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 13. RBAC: Roles List & CRUD
 */
authRouter.get('/roles', requireAuth, (req, res) => {
  try {
    const roles = db.prepare('SELECT * FROM roles ORDER BY is_system DESC, name ASC').all();
    const formatted = roles.map(r => ({
      ...r,
      permissions: r.permissions ? JSON.parse(r.permissions) : [],
      isSystem: Boolean(r.is_system),
      isActive: Boolean(r.is_active)
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.post('/roles', requireAuth, requirePermission('roles.manage'), (req, res) => {
  try {
    const { name, code, description, permissions } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, error: 'Role name and unique code are required.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = db.prepare('SELECT id FROM roles WHERE code = ?').get(cleanCode);
    if (existing) {
      return res.status(400).json({ success: false, error: 'A role with this code already exists.' });
    }

    const newId = 'role-' + Date.now();
    const permsJson = JSON.stringify(permissions || []);

    transaction(() => {
      db.prepare(`
        INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
        VALUES (?, ?, ?, ?, 0, ?, 1, datetime('now'))
      `).run(newId, name.trim(), cleanCode, description || '', permsJson);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'ROLE_CREATED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, newId,
        `Created custom RBAC role '${name}' (${cleanCode}) with ${permissions?.length || 0} permissions.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: `Role '${name}' created.`, roleId: newId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.put('/roles/:id', requireAuth, requirePermission('roles.manage'), (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions, isActive } = req.body;

    const existing = db.prepare('SELECT * FROM roles WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Role not found.' });
    }

    if (existing.code === 'SUPER_ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Cannot modify Super Admin permissions.' });
    }

    const permsJson = permissions ? JSON.stringify(permissions) : existing.permissions;

    transaction(() => {
      db.prepare(`
        UPDATE roles
        SET name = COALESCE(?, name),
            description = COALESCE(?, description),
            permissions = ?,
            is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(name, description, permsJson, isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active, id);

      db.prepare(`
        INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
        VALUES (?, datetime('now'), ?, ?, 'ROLE_UPDATED', 'SETTINGS', ?, ?, ?)
      `).run(
        'audit-' + Date.now(), req.user.id, req.user.name, id,
        `Updated role permissions and details for '${existing.name}'.`,
        req.ip || '127.0.0.1'
      );
    });

    res.json({ success: true, message: 'Role updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 14. Permissions List
 */
authRouter.get('/permissions', requireAuth, (req, res) => {
  try {
    const permissions = db.prepare('SELECT * FROM permissions ORDER BY module ASC, action ASC').all();
    const formatted = permissions.map(p => ({
      ...p,
      isSensitive: Boolean(p.is_sensitive)
    }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * 15. Login History Audit
 */
authRouter.get('/login-history', requireAuth, requirePermission('audit.view'), (req, res) => {
  try {
    const history = db.prepare('SELECT * FROM login_history ORDER BY created_at DESC LIMIT 200').all();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
