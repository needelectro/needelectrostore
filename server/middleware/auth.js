// NEED ELECTRO ERP — Authentication & RBAC Middleware
import { db } from '../db.js';

export function authenticate(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-session-token']) {
    token = req.headers['x-session-token'];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const session = db.prepare(`
      SELECT s.id as session_id, s.token, s.user_id, s.expires_at, s.is_revoked,
             u.name, u.email, u.username, u.role, u.role_id, u.branch_id,
             u.primary_branch_id, u.allowed_branch_ids, u.status, u.phone,
             r.permissions as role_permissions
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id OR u.role = r.code
      WHERE s.token = ? AND s.is_revoked = 0
    `).get(token);

    if (!session) {
      req.user = null;
      return next();
    }

    // Check expiration
    if (new Date(session.expires_at).getTime() < Date.now()) {
      db.prepare('UPDATE sessions SET is_revoked = 1 WHERE id = ?').run(session.session_id);
      req.user = null;
      return next();
    }

    // Check user account status
    if (session.status !== 'ACTIVE') {
      req.user = null;
      return next();
    }

    // Update session active timestamp
    db.prepare("UPDATE sessions SET last_active_at = datetime('now') WHERE id = ?").run(session.session_id);

    let permissions = [];
    try {
      if (session.role_permissions) {
        permissions = JSON.parse(session.role_permissions);
      }
    } catch (e) {
      permissions = [];
    }

    let allowedBranches = [session.branch_id];
    try {
      if (session.allowed_branch_ids) {
        allowedBranches = JSON.parse(session.allowed_branch_ids);
      }
    } catch (e) {}

    req.user = {
      id: session.user_id,
      name: session.name,
      email: session.email,
      username: session.username,
      role: session.role,
      roleId: session.role_id,
      branchId: session.branch_id,
      primaryBranchId: session.primary_branch_id || session.branch_id,
      allowedBranchIds: allowedBranches,
      status: session.status,
      phone: session.phone,
      permissions,
      token: session.token
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    req.user = null;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required. Please sign in.' });
  }
  next();
}

export function requireSuperAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required.' });
  }
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, error: 'Access restricted. Super Admin clearance required.' });
  }
  next();
}

export function requirePermission(permissionCode) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }

    // Super Admin has unrestricted access to all operations
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const perms = req.user.permissions || [];
    if (perms.includes('*') || perms.includes(permissionCode)) {
      return next();
    }

    // Support module wildcard: e.g. "sales.*" matches "sales.view", "sales.create"
    const [mod] = permissionCode.split('.');
    if (mod && perms.includes(`${mod}.*`)) {
      return next();
    }

    // Legacy fallback mapping
    const legacyCode = 'perm_' + permissionCode.replace('.', '_');
    if (perms.includes(legacyCode)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: `Access restricted. Your account role (${req.user.role}) does not possess authorization '${permissionCode}'.`
    });
  };
}

