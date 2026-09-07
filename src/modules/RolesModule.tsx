import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Lock, ShieldCheck, Check, X, UserPlus, Users, KeyRound, 
  Building, Edit, Trash2, Power, AlertCircle, Copy, ShieldAlert, 
  Settings, CheckCircle2, History, AlertTriangle 
} from 'lucide-react';
import { User, Role, AccountStatus, UserRole, Permission } from '../types';
import { SetupWizardModal } from '../components/setup/SetupWizardModal';
import { OpeningBalancesModal } from '../components/setup/OpeningBalancesModal';

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

  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES' | 'MATRIX' | 'SETUP'>('USERS');

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
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleCode, setNewRoleCode] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<string[]>([]);

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

  // Handle Create Role Submit
  const handleCreateRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleCode.trim()) {
      addToast('error', 'Validation Error', 'Role name and unique code are required.');
      return;
    }

    const res = createRole({
      name: newRoleName,
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
    }
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
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', textTransform: 'uppercase', fontWeight: 700 }}>Environment</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: setupStatus?.systemMode === 'PRODUCTION' ? '#10b981' : '#f59e0b', marginTop: '0.35rem' }}>
            {setupStatus?.systemMode || 'DEMO'} MODE
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
                onClick={() => setIsCreateRoleOpen(true)}
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

                  {isSuperAdmin && !role.isSystem && (
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

      {/* CREATE ROLE MODAL */}
      {isCreateRoleOpen && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="var(--brand-primary)" />
                <span>Create Custom Database Role</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsCreateRoleOpen(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateRoleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Initial Permissions Matrix</label>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {permissionsList.map(p => {
                      const isSelected = newRolePermissions.includes(`${p.module}.${p.action}`);
                      return (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={e => {
                              const key = `${p.module}.${p.action}`;
                              if (e.target.checked) {
                                setNewRolePermissions(prev => [...prev, key]);
                              } else {
                                setNewRolePermissions(prev => prev.filter(k => k !== key));
                              }
                            }}
                            style={{ accentColor: '#0284c7' }}
                          />
                          <span>{p.label} <code style={{ color: '#38bdf8' }}>({p.module}.{p.action})</code></span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateRoleOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Custom Role
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
