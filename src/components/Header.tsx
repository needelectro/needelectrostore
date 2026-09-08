import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Search, Sun, Moon, Bell, User, Building, 
  ShoppingCart, AlertTriangle, Clock, Wrench, ChevronDown, Zap,
  Lock, LogOut, KeyRound, ShieldAlert
} from 'lucide-react';
import { NeedElectroLogo } from './NeedElectroLogo';
import { ChangePasswordModal } from './auth/ChangePasswordModal';

interface HeaderProps {
  onOpenSearch: () => void;
  onNavigateToModule: (moduleName: string, targetId?: string) => void;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onNavigateToModule, toggleSidebar }) => {
  const { 
    settings, updateSettings, branches, selectedBranch, setSelectedBranchId, 
    currentUser, emiAccounts, products, services,
    lockSession, logout 
  } = useERP();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Compute live notifications
  const overdueEmi = emiAccounts.filter(e => e.installments.some(i => i.status === 'OVERDUE'));
  const dueTodayEmi = emiAccounts.filter(e => e.installments.some(i => i.status === 'DUE_TODAY'));
  const lowStockProds = products.filter(p => p.currentStock <= p.minStock);
  const pendingJobs = services.filter(s => s.status === 'Pending');

  const totalNotifications = overdueEmi.length + dueTodayEmi.length + lowStockProds.length + pendingJobs.length;

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="header no-print" style={{
      height: 'var(--header-height)',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Left: Mobile Toggle & Global Search Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '500px' }}>
        <button 
          className="btn btn-ghost btn-sm" 
          onClick={toggleSidebar}
          style={{ display: 'flex', alignItems: 'center', padding: '0.2rem' }}
          title="Toggle Navigation"
        >
          <NeedElectroLogo size="sm" variant="icon-only" />
        </button>

        {/* Global Search Bar */}
        <div 
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.45rem 0.85rem',
            width: '100%',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            transition: 'all var(--transition-fast)'
          }}
        >
          <Search size={16} />
          <span style={{ flex: 1 }}>Search Products, Serials, Invoices, EMI...</span>
          <kbd style={{
            fontSize: '0.7rem',
            background: 'var(--bg-card-muted)',
            border: '1px solid var(--border-color)',
            padding: '1px 5px',
            borderRadius: '4px'
          }}>
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Branch Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-card-muted)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <Building size={14} color="var(--brand-primary)" />
          <select 
            value={selectedBranch.id} 
            onChange={e => setSelectedBranchId(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {branches.map(b => (
              <option key={b.id} value={b.id} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                {b.name} ({b.code})
              </option>
            ))}
          </select>
        </div>

        {/* Quick New Sale POS Shortcut */}
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => onNavigateToModule('pos')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ShoppingCart size={15} />
          <span>POS Terminal</span>
        </button>

        {/* Theme Toggle */}
        <button 
          className="btn btn-ghost btn-sm"
          onClick={toggleTheme}
          style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)' }}
          title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {settings.theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#3b82f6" />}
        </button>

        {/* Notification Bell with Badge */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ padding: '0.5rem', position: 'relative', borderRadius: 'var(--radius-md)' }}
          >
            <Bell size={18} />
            {totalNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)'
              }}>
                {totalNotifications}
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div 
              className="erp-card"
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '340px',
                zIndex: 100,
                padding: '0',
                boxShadow: 'var(--shadow-lg)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>Real-time Notifications</span>
                <span className="badge badge-neutral">{totalNotifications} alerts</span>
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {overdueEmi.map(e => (
                  <div 
                    key={e.id}
                    onClick={() => { onNavigateToModule('emi', e.id); setShowNotifications(false); }}
                    style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                  >
                    <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: '600', color: '#ef4444' }}>Overdue EMI Installment</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{e.customerName} ({e.emiNumber}) has overdue installment!</div>
                    </div>
                  </div>
                ))}

                {dueTodayEmi.map(e => (
                  <div 
                    key={e.id}
                    onClick={() => { onNavigateToModule('emi', e.id); setShowNotifications(false); }}
                    style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                  >
                    <Clock size={16} color="#f59e0b" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: '600', color: '#f59e0b' }}>EMI Payment Due Today</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{e.customerName} ({e.emiNumber}) installment due today.</div>
                    </div>
                  </div>
                ))}

                {lowStockProds.map(p => (
                  <div 
                    key={p.id}
                    onClick={() => { onNavigateToModule('inventory', p.id); setShowNotifications(false); }}
                    style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                  >
                    <AlertTriangle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: '600' }}>Low Stock Alert</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{p.name}: only {p.currentStock} left (Min: {p.minStock})</div>
                    </div>
                  </div>
                ))}

                {pendingJobs.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => { onNavigateToModule('service', s.id); setShowNotifications(false); }}
                    style={{ padding: '0.75rem 1rem', cursor: 'pointer', display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}
                  >
                    <Wrench size={16} color="#38bdf8" style={{ marginTop: '2px' }} />
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: '600' }}>Pending Service Request</div>
                      <div style={{ color: 'var(--text-secondary)' }}>{s.jobCardNumber}: {s.serviceType} for {s.customerName}</div>
                    </div>
                  </div>
                ))}

                {totalNotifications === 0 && (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                    No pending alerts. All systems normal!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div style={{ position: 'relative' }}>
          <button 
            className="btn btn-ghost btn-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.6rem', borderRadius: 'var(--radius-md)' }}
          >
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
              {currentUser.name.charAt(0)}
            </div>
            <div style={{ textAlign: 'left', lineHeight: '1.2', display: 'none' }} className="user-text-lg">
              <div style={{ fontSize: '0.8125rem', fontWeight: '700' }}>{currentUser.name.split(' ')[0]}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{currentUser.role}</div>
            </div>
            <ChevronDown size={14} />
          </button>

          {/* User / Role Switcher Menu */}
          {showUserMenu && (
            <div 
              className="erp-card"
              style={{
                position: 'absolute',
                top: '44px',
                right: 0,
                width: '260px',
                zIndex: 100,
                padding: '0.75rem',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.65rem' }}>
                <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>{currentUser.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{currentUser.email}</div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '6px' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{currentUser.role}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{selectedBranch.name.split(' ')[0]}</span>
                </div>
              </div>

              {/* Security Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingBottom: '0.65rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.65rem' }}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    lockSession();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-active)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Lock size={15} color="var(--brand-accent)" />
                  <span>Lock Terminal Screen</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    setIsPasswordModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-active)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <KeyRound size={15} color="#10b981" />
                  <span>Change Password</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0.45rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} color="#ef4444" />
                  <span style={{ fontWeight: 'bold' }}>Sign Out / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </header>
  );
};
