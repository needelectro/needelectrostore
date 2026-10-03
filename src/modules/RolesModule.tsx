import React, { useState, useMemo } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Lock, ShieldCheck, Check, X, UserPlus, Users, KeyRound, 
  Building, Edit, Trash2, Power, AlertCircle, Copy, ShieldAlert, 
  Settings, CheckCircle2, History, AlertTriangle, Database, Search, Sparkles
} from 'lucide-react';
import { User, Role, AccountStatus, UserRole, Permission } from '../types';
import { SetupWizardModal } from '../components/setup/SetupWizardModal';
import { OpeningBalancesModal } from '../components/setup/OpeningBalancesModal';
import { DatabaseConfigManager } from '../components/admin/DatabaseConfigManager';
import { INITIAL_PERMISSIONS } from '../services/mockData';

interface RolesModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const RolesModule: React.FC<RolesModuleProps> = ({ onNavigate }) => {
  const { 
    currentUser, users, roles, permissionsList, branches, employees, 
    createUser, updateUser, setUserStatus, resetUserPassword, revokeUserSessions, 
    createRole, updateRole, deleteRole, setupStatus, auditLogs, addToast 
  } = useERP();

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'MATRIX' | 'DATABASE' | 'SETUP'>('USERS');

  // Modals state
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [isResetPassOpen, setIsResetPassOpen] = useState(false);
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isOpeningBalancesOpen, setIsOpeningBalancesOpen] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<User | null>(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('SALES');
  const [newUserBranch, setNewUserBranch] = useState(branches[0]?.id || 'branch-1');
  const [newUserAllowedBranches, setNewUserAllowedBranches] = useState<string[]>([branches[0]?.id || 'branch-1']);
  const [newUserEmpId, setNewUserEmpId] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserStatus, setNewUserStatus] = useState<AccountStatus>('ACTIVE');

  // Reset Password Form State
  const [resetPassValue, setResetPassValue] = useState('');

  // New Role Form State
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);
  const [rolePermSearch, setRolePermSearch] = useState('');

  // Available permissions with robust fallback
  const availablePermissions = useMemo<Permission[]>(() => {
    if (Array.isArray(permissionsList) && permissionsList.length > 0) {
      return permissionsList;
    }
    return INITIAL_PERMISSIONS;
  }, [permissionsList]);

  // Grouped permissions by module
  const permissionsByModule = useMemo(() => {
    const map: Record<string, Permission[]> = {};
    availablePermissions.forEach(p => {
      const q = rolePermSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        p.label.toLowerCase().includes(q) || 
        p.module.toLowerCase().includes(q) || 
        p.action.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q));

      if (matchesSearch) {
        if (!map[p.module]) map[p.module] = [];
        map[p.module].push(p);
      }
    });
    return map;
  }, [availablePermissions, rolePermSearch]);

  const filteredModuleKeys = Object.keys(permissionsByModule);

  const MODULE_GROUPS: Record<string, { label: string; icon: string }> = {
    dashboard: { label: 'Dashboard & Executive Analytics', icon: '📊' },
    sales: { label: 'Point of Sale (POS) & Billing', icon: '🛒' },
    emi: { label: 'Laptop EMI & Financing', icon: '📅' },
    inventory: { label: 'Inventory & Serial Numbers', icon: '📦' },
    purchases: { label: 'Supplier Purchases & Inflow', icon: '🚚' },
    products: { label: 'Product Catalog & Pricing', icon: '🏷️' },
    customers: { label: 'Customers CRM & Receivables', icon: '👥' },
    suppliers: { label: 'Suppliers Directory & Dues', icon: '🏢' },
    service: { label: 'Service & Device Repairs', icon: '🔧' },
    warranty: { label: 'Warranty & Claims', icon: '🛡️' },
    accounting: { label: 'Central Accounting & P&L', icon: '📈' },
    cash: { label: 'Cash Vault & Reconciliation', icon: '🏦' },
    expenses: { label: 'Showroom Operational Expenses', icon: '👛' },
    reports: { label: 'Reports & Data Exports', icon: '📑' },
    employees: { label: 'Staff & Attendance HR', icon: '👔' },
    roles: { label: 'Roles & Access Control', icon: '🔐' },
    users: { label: 'Staff Accounts Provisioning', icon: '👤' },
    audit: { label: 'Audit Logs & Security Trails', icon: '📜' },
    settings: { label: 'System Settings & Branding', icon: '⚙️' },
    backup: { label: 'Database Backup & Restore', icon: '🗄️' },
    branches: { label: 'Multi-Branch & Warehouses', icon: '🏬' },
    control_center: { label: 'System Control Center', icon: '🎛️' },
    seo: { label: 'Website SEO & Geo-Targeting', icon: '🌐' }
  };

  // Filter & Search
  const [userSearch, setUserSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filtered Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.phone.includes(userSearch);
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeUsersCount = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedUsersCount = users.filter(u => u.status === 'SUSPENDED' || u.status === 'INACTIVE').length;

  // Handle Create User
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      addToast('error', 'Validation Error', 'Name and corporate email are required.');
      return;
    }

    const res = await createUser({
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      branchId: newUserBranch,
      allowedBranchIds: newUserAllowedBranches,
      employeeId: newUserEmpId || undefined,
      password: newUserPassword || 'needelectro2026',
      status: newUserStatus
    });

    if (res.success) {
      setIsCreateUserOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
    }
  };

  // Handle Reset Password Submit
  const handleResetPassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAction || !resetPassValue) return;

    if (resetPassValue.length < 6) {
      addToast('error', 'Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const res = await resetUserPassword(selectedUserForAction.id, resetPassValue);
    if (res.success) {
      setIsResetPassOpen(false);
      setResetPassValue('');
      setSelectedUserForAction(null);
    }
  };

  // Handle Open Create Role Modal
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setNewRoleName('');
    setNewRoleCode('');
    setNewRoleDesc('');
    setNewRolePermissions([]);
    setRolePermSearch('');
    setIsCreateRoleOpen(true);
  };

  // Handle Open Edit Role Modal
  const handleOpenEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleCode(role.code);
    setNewRoleDesc(role.description || '');
    setNewRolePermissions(role.permissions || []);
    setRolePermSearch('');
    setIsCreateRoleOpen(true);
  };

  // Handle Role Submit (Create or Update)
  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      addToast('error', 'Validation Error', 'Role name and unique code are required.');
      return;
    }

    if (editingRole) {
      updateRole({
        ...editingRole,
        name: newRoleName.trim(),
        description: newRoleDesc.trim(),
        permissions: newRolePermissions,
      });
      setIsCreateRoleOpen(false);
      setEditingRole(null);
      return;
    }

    const res = createRole({
      name: newRoleName.trim(),
      code: newRoleCode.toUpperCase().replace(/\s+/g, '_'),
      description: newRoleDesc || 'Configurable operational role',
      isSystem: false,
      isActive: true,
      permissions: newRolePermissions
    });

    if (res.success) {
      setIsCreateRoleOpen(false);
      setNewRoleName('');
      setNewRoleCode('');
      setNewRoleDesc('');
      setNewRolePermissions([]);
      setEditingRole(null);
    }
  };

  const handleTogglePerm = (key: string, id: string, checked: boolean) => {
    if (checked) {
      setNewRolePermissions(prev => Array.from(new Set([...prev, key])));
    } else {
      setNewRolePermissions(prev => prev.filter(k => k !== key && k !== id));
    }
  };

  const handleToggleModuleAll = (perms: Permission[], select: boolean) => {
    const keys = perms.map(p => `${p.module}.${p.action}`);
    if (select) {
      setNewRolePermissions(prev => Array.from(new Set([...prev, ...keys])));
    } else {
      setNewRolePermissions(prev => prev.filter(k => !keys.includes(k)));
    }
  };

  const handleSelectAllPerms = () => {
    const allKeys = availablePermissions.map(p => `${p.module}.${p.action}`);
    setNewRolePermissions(allKeys);
  };

  // Toggle permission for a role in the permission matrix
  const handleToggleMatrixPermission = (role: Role, permId: string) => {
    if (!isSuperAdmin) {
      addToast('error', 'Unauthorized', 'Only Super Admin can modify role permissions.');
      return;
    }
    if (role.code === 'SUPER_ADMIN') {
      addToast('warning', 'Permanent Access', 'Super Admin master account has unrestricted permanent permissions.');
      return;
    }

    const hasIt = role.permissions.includes(permId);
    const updatedPerms = hasIt 
      ? role.permissions.filter(p => p !== permId)
      : [...role.permissions, permId];

    updateRole({
      ...role,
      permissions: updatedPerms
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <ShieldCheck size={28} color="var(--brand-primary)" />
            Enterprise Access Management & Security Controls
          </h1>
          <p>
            Database-driven RBAC, granular MODULE.ACTION matrix, staff provisioning, and Super Admin oversight.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="badge badge-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
            Logged in as: {currentUser.role}
          </span>
          {isSuperAdmin && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setIsCreateUserOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserPlus size={15} />
              <span>New Staff Account</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        <div className="erp-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Accounts</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>{users.length}</div>
        </div>

        <div className="erp-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>Active Users</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>{activeUsersCount}</div>
        </div>

        <div className="erp-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700 }}>Suspended / Inactive</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>{suspendedUsersCount}</div>
        </div>

        <div className="erp-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', textTransform: 'uppercase', fontWeight: 700 }}>Defined Roles</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>{roles.length}</div>
        </div>

        <div className="erp-card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 700 }}>Security Status</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '0.35rem' }}>
            ENFORCED
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem'
      }}>
        {[
          { key: 'USERS', label: `Staff Accounts (${users.length})`, icon: Users },
          { key: 'ROLES', label: `Database Roles (${roles.length})`, icon: ShieldCheck },
          { key: 'MATRIX', label: 'Granular Permission Matrix', icon: Lock },
          { key: 'DATABASE', label: 'Database & Cloud Config', icon: Database },
          { key: 'SETUP', label: 'Super Admin Overview & Setup', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} btn-sm`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'USERS' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          {/* Filters Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flex: 1 }}>
              <input
                type="text"
                className="form-input"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search staff by name, email, or phone..."
                style={{ maxWidth: '360px' }}
              />

              <select
                className="form-select"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {isSuperAdmin && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setIsCreateUserOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <UserPlus size={15} />
                <span>Add User Account</span>
              </button>
            )}
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>User / Email</th>
                  <th>Role</th>
                  <th>Primary Branch</th>
                  <th>Allowed Branches</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => {
                  const primaryBranch = branches.find(b => b.id === user.branchId);
                  const isCurrent = user.id === currentUser.id;
                  const isUserSuperAdmin = user.role === 'SUPER_ADMIN';

                  return (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>
                          {user.name}
                          {isCurrent && <span className="badge badge-info" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.email} • {user.phone}</div>
                        {user.employeeId && (
                          <div style={{ fontSize: '0.7rem', color: '#38bdf8' }}>EMP: {user.employeeId}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                          {primaryBranch?.name || user.branchId}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {isUserSuperAdmin ? (
                            <span style={{ color: '#10b981', fontWeight: 700 }}>All Branches (Unrestricted)</span>
                          ) : (
                            user.allowedBranchIds?.map(bid => {
                              const b = branches.find(br => br.id === bid);
                              return b ? b.code : bid;
                            }).join(', ') || primaryBranch?.code
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          user.status === 'ACTIVE' ? 'badge-success' : 
                          user.status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'
                        }`} style={{ fontSize: '0.72rem' }}>
                          {user.status || (user.active ? 'ACTIVE' : 'INACTIVE')}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {user.lastLoginAt || 'Never'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {/* Reset Password */}
                          <button
                            className="btn btn-secondary btn-sm"
                            title="Reset Security Password"
                            onClick={() => {
                              setSelectedUserForAction(user);
                              setIsResetPassOpen(true);
                            }}
                            style={{ padding: '4px 8px' }}
                          >
                            <KeyRound size={14} />
                          </button>

                          {/* Revoke Sessions */}
                          {isSuperAdmin && (
                            <button
                              className="btn btn-secondary btn-sm"
                              title="Revoke Active Sessions"
                              onClick={() => revokeUserSessions(user.id)}
                              style={{ padding: '4px 8px' }}
                            >
                              <Power size={14} />
                            </button>
                          )}

                          {/* Toggle Account Status */}
                          {isSuperAdmin && !isUserSuperAdmin && (
                            <button
                              className={`btn ${user.status === 'ACTIVE' ? 'btn-danger' : 'btn-success'} btn-sm`}
                              title={user.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                              onClick={() => {
                                const nextStatus: AccountStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
                                setUserStatus(user.id, nextStatus);
                              }}
                              style={{ padding: '4px 8px' }}
                            >
                              {user.status === 'ACTIVE' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DATABASE ROLES */}
      {activeTab === 'ROLES' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>Database-Driven User Roles</h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                All access is governed by dynamic roles stored in the database. Custom roles can be tailored for specialized staff.
              </p>
            </div>
            {isSuperAdmin && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleOpenCreateRole}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <ShieldCheck size={15} />
                <span>Create Custom Role</span>
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {roles.map(role => (
              <div 
                key={role.id} 
                className="erp-card" 
                style={{ 
                  padding: '1.25rem',
                  border: role.code === 'SUPER_ADMIN' ? '1px solid rgba(2, 132, 199, 0.4)' : undefined
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                        {role.name}
                      </h4>
                      {role.isSystem ? (
                        <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>System Role</span>
                      ) : (
                        <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>Custom</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {role.code}
                    </span>
                  </div>

                  {isSuperAdmin && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenEditRole(role)}
                        title="Configure Role Permissions"
                        style={{ color: '#38bdf8' }}
                      >
                        <Edit size={16} />
                      </button>
                      {!role.isSystem && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => deleteRole(role.id)}
                          title="Delete Custom Role"
                          style={{ color: '#ef4444' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', lineHeight: '1.4', marginBottom: '1rem' }}>
                  {role.description}
                </p>

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 700, marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Granted Capabilities:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {role.permissions.includes('*') ? (
                      <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                        * Master Unrestricted Access
                      </span>
                    ) : (
                      role.permissions.slice(0, 8).map(perm => (
                        <span key={perm} className="badge badge-secondary" style={{ fontSize: '0.68rem', fontFamily: 'monospace' }}>
                          {perm}
                        </span>
                      ))
                    )}
                    {role.permissions.length > 8 && (
                      <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                        +{role.permissions.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GRANULAR PERMISSION MATRIX */}
      {activeTab === 'MATRIX' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              Granular MODULE.ACTION Security Matrix
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Permissions are enforced on both the client interface and state management transactions. Sensitive operations are highlighted with shields.
            </p>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th style={{ minWidth: '220px' }}>Permission & Module</th>
                  <th style={{ minWidth: '120px' }}>Code</th>
                  {roles.map(r => (
                    <th key={r.id} style={{ textAlign: 'center', minWidth: '95px' }}>
                      {r.name.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionsList.map(perm => (
                  <tr key={perm.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {perm.isSensitive ? (
                          <span title="Sensitive Authorization" style={{ display: 'inline-flex' }}>
                            <ShieldAlert size={14} color="#f59e0b" />
                          </span>
                        ) : (
                          <CheckCircle2 size={14} color="#38bdf8" />
                        )}
                        <span style={{ fontWeight: 600, color: perm.isSensitive ? '#fde68a' : '#ffffff' }}>
                          {perm.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{perm.description}</div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.72rem', color: '#38bdf8' }}>
                        {perm.module}.{perm.action}
                      </code>
                    </td>
                    {roles.map(role => {
                      const isGranted = role.permissions.includes('*') || 
                                        role.permissions.includes(`${perm.module}.*`) || 
                                        role.permissions.includes(`${perm.module}.${perm.action}`);
                      const isSuper = role.code === 'SUPER_ADMIN';

                      return (
                        <td key={role.id} style={{ textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isGranted}
                            disabled={isSuper || !isSuperAdmin}
                            onChange={() => handleToggleMatrixPermission(role, `${perm.module}.${perm.action}`)}
                            style={{
                              width: '18px',
                              height: '18px',
                              accentColor: isSuper ? '#10b981' : '#0284c7',
                              cursor: isSuper || !isSuperAdmin ? 'not-allowed' : 'pointer'
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUPER ADMIN OVERVIEW & SETUP STATUS */}
      {activeTab === 'SETUP' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
          {/* Setup Checklist */}
          <div className="erp-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>System Setup Status (Req 66)</h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Audit status of fundamental ERP configuration components.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsSetupWizardOpen(true)}
              >
                Launch Setup Wizard
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { title: 'Company Identity & VAT BIN', status: setupStatus?.isCompanyConfigured, desc: 'Corporate name, address, phone, VAT registration' },
                { title: 'Super Admin Master Account', status: setupStatus?.isSuperAdminConfigured, desc: 'Master administrator credentials configured' },
                { title: 'Main Operating Branch', status: setupStatus?.isMainBranchConfigured, desc: 'Flagship showroom terminal established' },
                { title: 'Central Tech Warehouse', status: setupStatus?.isWarehouseConfigured, desc: 'Primary inventory depot for serial tagging' },
                { title: 'Core Financial Accounts', status: setupStatus?.isFinancialAccountsConfigured, desc: 'Cash drawer, Bank Asia, bKash/Nagad accounts' },
                { title: 'Payment Tender Methods', status: setupStatus?.isPaymentMethodsConfigured, desc: 'Cash, Card, MFS, Bank transfer, and EMI enabled' },
                { title: 'EMI Installment Plans', status: setupStatus?.isEmiPlansConfigured, desc: '3M, 6M, 12M plans with interest and late fees' },
                { title: 'Transaction Invoicing Rules', status: setupStatus?.isInvoiceSettingsConfigured, desc: 'INV-, EMI-, and REC- serial prefix generators' },
                { title: 'SMS & WhatsApp Notifications', status: setupStatus?.isNotificationConfigured, desc: 'Gateways require live API token credentials' },
                { title: 'Opening Balance Ledger', status: setupStatus?.isOpeningBalancesConfigured, desc: 'Starting cash, bank, stock, and capital authorized' },
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: 'rgba(30, 41, 59, 0.4)',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{item.title}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{item.desc}</div>
                  </div>
                  {item.status ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Check size={12} /> Configured
                    </span>
                  ) : (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> Incomplete
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', gap: '0.75rem' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsOpeningBalancesOpen(true)}
                style={{ flex: 1 }}
              >
                Post / Audit Opening Balances
              </button>
            </div>
          </div>

          {/* Security & Audit Logs Stream */}
          <div className="erp-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff' }}>
                Recent Security & Admin Audit Log
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Immutable chronological log of staff logins, role updates, and system changes.
              </p>
            </div>

            <div style={{ overflowY: 'auto', maxHeight: '520px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {auditLogs.slice(0, 15).map(log => (
                <div 
                  key={log.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '10px',
                    padding: '0.75rem',
                    fontSize: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#38bdf8' }}>{log.action}</span>
                    <span style={{ color: '#64748b' }}>{log.timestamp}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', marginBottom: '4px' }}>{log.details}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.7rem' }}>By: {log.userName} • IP: {log.ipAddress || '127.0.0.1'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & CLOUD CONFIGURATION ENGINE */}
      {activeTab === 'DATABASE' && (
        <DatabaseConfigManager />
      )}

      {/* CREATE USER MODAL */}
      {isCreateUserOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={18} color="var(--brand-primary)" />
                <span>Create Staff User Account</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsCreateUserOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newUserName}
                      onChange={e => setNewUserName(e.target.value)}
                      placeholder="e.g. Shakil Mahmud"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Corporate Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      value={newUserEmail}
                      onChange={e => setNewUserEmail(e.target.value)}
                      placeholder="shakil@needelectro.com"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newUserPhone}
                      onChange={e => setNewUserPhone(e.target.value)}
                      placeholder="01711-000000"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Link to Employee Record</label>
                    <select
                      className="form-select"
                      value={newUserEmpId}
                      onChange={e => setNewUserEmpId(e.target.value)}
                    >
                      <option value="">-- Optional: Link Employee --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Assigned Role *</label>
                    <select
                      className="form-select"
                      value={newUserRole}
                      onChange={e => setNewUserRole(e.target.value as any)}
                      required
                    >
                      {roles.map(r => (
                        <option key={r.id} value={r.code}>{r.name} ({r.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Primary Branch *</label>
                    <select
                      className="form-select"
                      value={newUserBranch}
                      onChange={e => {
                        setNewUserBranch(e.target.value);
                        if (!newUserAllowedBranches.includes(e.target.value)) {
                          setNewUserAllowedBranches(prev => [...prev, e.target.value]);
                        }
                      }}
                      required
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Allowed Branches */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Multi-Branch Permissions (Allowed Branches)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {branches.map(b => {
                      const isChecked = newUserAllowedBranches.includes(b.id);
                      return (
                        <label key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={e => {
                              if (e.target.checked) {
                                setNewUserAllowedBranches(prev => [...prev, b.id]);
                              } else {
                                setNewUserAllowedBranches(prev => prev.filter(id => id !== b.id));
                              }
                            }}
                            style={{ accentColor: '#0284c7' }}
                          />
                          <span>{b.code} ({b.name.split(' ')[0]})</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Temporary Password *</label>
                    <input
                      type="password"
                      className="form-input"
                      value={newUserPassword}
                      onChange={e => setNewUserPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Account Initial Status</label>
                    <select
                      className="form-select"
                      value={newUserStatus}
                      onChange={e => setNewUserStatus(e.target.value as any)}
                    >
                      <option value="ACTIVE">ACTIVE (Ready to Login)</option>
                      <option value="PENDING">PENDING (Awaiting Approval)</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateUserOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Account with Hashed Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPassOpen && selectedUserForAction && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <KeyRound size={18} color="var(--brand-primary)" />
                <span>Reset Staff Password</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsResetPassOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleResetPassSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                  Resetting credentials for: <strong>{selectedUserForAction.name}</strong> ({selectedUserForAction.email})
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">New Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    value={resetPassValue}
                    onChange={e => setResetPassValue(e.target.value)}
                    placeholder="Enter new strong password"
                    required
                    autoFocus
                  />
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                    Will be salted and hashed with PBKDF2-HMAC-SHA256 immediately.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsResetPassOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Password Hash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROLE MODAL */}
      {isCreateRoleOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={20} color="var(--brand-primary)" />
                <span>{editingRole ? `Configure Role Permissions — ${editingRole.name}` : 'Create Custom Database Role'}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => { setIsCreateRoleOpen(false); setEditingRole(null); }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, padding: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Role Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRoleName}
                      onChange={e => setNewRoleName(e.target.value)}
                      placeholder="e.g. CCTV Field Supervisor"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Role Code *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newRoleCode}
                      onChange={e => setNewRoleCode(e.target.value)}
                      placeholder="e.g. CCTV_SUPERVISOR"
                      disabled={Boolean(editingRole && editingRole.isSystem)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role Description</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    value={newRoleDesc}
                    onChange={e => setNewRoleDesc(e.target.value)}
                    placeholder="Brief scope of responsibilities for this role..."
                  />
                </div>

                {/* Permissions Selector Header */}
                <div style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  padding: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>
                        Permissions Matrix
                      </span>
                      <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                        {newRolePermissions.length} of {availablePermissions.length} selected
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={handleSelectAllPerms}
                        style={{ fontSize: '0.72rem', color: '#38bdf8' }}
                      >
                        ✓ Select All ({availablePermissions.length})
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        onClick={() => setNewRolePermissions([])}
                        style={{ fontSize: '0.72rem', color: '#ef4444' }}
                      >
                        ✕ Clear All
                      </button>
                    </div>
                  </div>

                  {/* Permission Search Input */}
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Search permissions by name, module, or keyword..."
                      value={rolePermSearch}
                      onChange={e => setRolePermSearch(e.target.value)}
                      style={{ paddingLeft: '2rem', height: '34px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* Grouped Permissions Accordion / Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {filteredModuleKeys.map(modKey => {
                    const groupMeta = MODULE_GROUPS[modKey] || { label: modKey.toUpperCase(), icon: '📁' };
                    const modPerms = permissionsByModule[modKey] || [];
                    const selectedInMod = modPerms.filter(p => newRolePermissions.includes(`${p.module}.${p.action}`) || newRolePermissions.includes(p.id));
                    const isAllSelected = modPerms.length > 0 && selectedInMod.length === modPerms.length;

                    return (
                      <div
                        key={modKey}
                        style={{
                          background: 'rgba(30, 41, 59, 0.4)',
                          border: '1px solid rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff' }}>
                            <span>{groupMeta.icon}</span>
                            <span>{groupMeta.label}</span>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                              ({selectedInMod.length}/{modPerms.length})
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-ghost btn-xs"
                            onClick={() => handleToggleModuleAll(modPerms, !isAllSelected)}
                            style={{ fontSize: '0.7rem', color: isAllSelected ? '#f59e0b' : '#38bdf8' }}
                          >
                            {isAllSelected ? 'Deselect Section' : 'Select All Section'}
                          </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.4rem' }}>
                          {modPerms.map(p => {
                            const key = `${p.module}.${p.action}`;
                            const isChecked = newRolePermissions.includes(key) || newRolePermissions.includes(p.id);

                            return (
                              <label
                                key={p.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '8px',
                                  padding: '6px 8px',
                                  borderRadius: '6px',
                                  background: isChecked ? 'rgba(2, 132, 199, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                                  border: `1px solid ${isChecked ? 'rgba(2, 132, 199, 0.35)' : 'transparent'}`,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={e => handleTogglePerm(key, p.id, e.target.checked)}
                                  style={{ marginTop: '2px', accentColor: '#0284c7' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                                    <span>{p.label}</span>
                                    {p.isSensitive && (
                                      <span title="Sensitive Action" style={{ display: 'inline-flex' }}>
                                        <ShieldAlert size={12} color="#f59e0b" />
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '0.6875rem', color: '#94a3b8', lineHeight: '1.2' }}>
                                    {p.description}
                                  </div>
                                  <code style={{ fontSize: '0.65rem', color: '#38bdf8' }}>
                                    {p.module}.{p.action}
                                  </code>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setIsCreateRoleOpen(false); setEditingRole(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>{editingRole ? 'Update Role Permissions' : 'Save Custom Role'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Wizard Modal */}
      <SetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
      />

      {/* Opening Balances Modal */}
      <OpeningBalancesModal
        isOpen={isOpeningBalancesOpen}
        onClose={() => setIsOpeningBalancesOpen(false)}
      />
    </div>
  );
};
