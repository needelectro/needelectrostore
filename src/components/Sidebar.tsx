import React, { useState, useEffect } from 'react';
import { useERP } from '../services/erpStore';
import {
  LayoutDashboard, ShoppingCart, ReceiptText, CalendarClock, Boxes,
  Truck, Users, PackageSearch, ShieldCheck, Wrench, Wallet,
  PieChart, BookOpen, UserCheck, GitFork, BarChart3,
  Lock, ScrollText, Settings, ChevronRight, Zap, RotateCcw, Sliders, Landmark,
  User, Globe, X, ShoppingBag, Sparkles
} from 'lucide-react';
import { NeedElectroLogo } from './NeedElectroLogo';
import { UserProfileModal } from './UserProfileModal';
import { ChangePasswordModal } from './auth/ChangePasswordModal';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (moduleName: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  highlight?: boolean;
  badge?: string | number;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  setActiveModule,
  isOpen,
  onClose
}) => {
  const { 
    currentUser, 
    selectedBranch, 
    settings, 
    emiAccounts, 
    products, 
    services, 
    hasPermission 
  } = useERP();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Close drawer on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Badges
  const overdueCount = emiAccounts.filter(e => e.installments.some(i => i.status === 'OVERDUE')).length;
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const pendingServicesCount = services.filter(s => s.status === 'Pending').length;

  const navGroups: NavGroup[] = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'website_orders', label: 'Online Store Orders', icon: ShoppingBag, badge: 'STORE', badgeColor: '#10b981' },
        { id: 'pos', label: 'POS / Billing', icon: ShoppingCart, highlight: true },
        { id: 'sales', label: 'Sales & Invoices', icon: ReceiptText },
        { id: 'returns', label: 'Returns & RMA', icon: RotateCcw },
        { id: 'emi', label: 'Laptop EMI System', icon: CalendarClock, badge: overdueCount > 0 ? overdueCount : undefined, badgeColor: '#ef4444' },
        { id: 'inventory', label: 'Inventory & Serials', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: '#f59e0b' },
        { id: 'purchases', label: 'Purchase Inflow', icon: Truck },
        { id: 'products', label: 'Product Catalog', icon: PackageSearch }
      ]
    },
    {
      group: 'People & CRM',
      items: [
        { id: 'customers', label: 'Customer CRM', icon: Users },
        { id: 'suppliers', label: 'Suppliers', icon: Truck },
        { id: 'service', label: 'Service & Repair', icon: Wrench, badge: pendingServicesCount > 0 ? pendingServicesCount : undefined, badgeColor: '#38bdf8' },
        { id: 'warranty', label: 'Warranty & Claims', icon: ShieldCheck }
      ]
    },
    {
      group: 'Finance & Accounts',
      items: [
        { id: 'cash_management', label: 'Cash & Liquidity', icon: Landmark, highlight: true },
        { id: 'accounting', label: 'Accounting & P&L', icon: PieChart },
        { id: 'ledgers', label: 'Customer & Supplier Ledgers', icon: BookOpen },
        { id: 'expenses', label: 'Expense Manager', icon: Wallet },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      group: 'Enterprise Control',
      items: [
        { id: 'website_management', label: 'Website Management Hub', icon: Globe, badge: 'SYNC', badgeColor: '#008CFF', highlight: true },
        { id: 'control_center', label: 'System Control Center', icon: Sliders, badge: 'SUPER', badgeColor: '#2563eb' },
        { id: 'banners', label: 'Store Banners & Hero', icon: Sparkles, badge: 'HERO', badgeColor: '#0084d6' },
        { id: 'guides_cms', label: 'Guides & Content CMS', icon: BookOpen, badge: 'CMS', badgeColor: '#10b981' },
        { id: 'seo_management', label: 'SEO Management', icon: Globe, badge: 'SEO', badgeColor: '#06b6d4' },
        { id: 'employees', label: 'Employees & Techs', icon: UserCheck },
        { id: 'branches', label: 'Branches & Transfers', icon: GitFork },
        { id: 'roles', label: 'Roles & RBAC', icon: Lock },
        { id: 'audit', label: 'Audit Logs', icon: ScrollText },
        { id: 'settings', label: 'System Settings', icon: Settings }
      ]
    },
    {
      group: 'My Account & Access',
      items: [
        { id: 'user_profile', label: 'My Profile & Account', icon: User, highlight: true }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="modal-overlay no-print" 
          onClick={onClose}
          style={{ zIndex: 90, display: 'block', background: 'rgba(0,0,0,0.5)' }} 
        />
      )}

      <aside className={`sidebar no-print ${isOpen ? 'sidebar-open' : ''}`} style={{
        width: 'var(--sidebar-width)',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 95,
        transition: 'all var(--transition-normal)'
      }}>
        {/* Brand Header */}
        <div style={{
          padding: '1rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <NeedElectroLogo 
            size="sm" 
            showTagline={true} 
            showDots={false}
            showSisterConcern={false}
          />
          {/* Accessible Close Button for Mobile Drawer */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="sidebar-close-btn"
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card-muted)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0
            }}
          >
            <X size={18} />
          </button>
        </div>



        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.75rem' }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '1.25rem' }}>
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--text-muted)',
                padding: '0 0.75rem',
                marginBottom: '0.4rem'
              }}>
                {group.group}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;

                  const isAllowed = hasPermission(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'user_profile') {
                          setShowProfileModal(true);
                          onClose();
                          return;
                        }
                        setActiveModule(item.id);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.6rem 0.75rem',
                        borderRadius: 'var(--radius-md)',
                        background: isActive 
                          ? 'var(--bg-active)' 
                          : item.highlight 
                            ? 'rgba(37, 99, 235, 0.08)' 
                            : 'transparent',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--brand-primary)' : 'transparent',
                        color: isActive 
                          ? 'var(--brand-primary)' 
                          : item.highlight 
                            ? 'var(--text-primary)' 
                            : 'var(--text-secondary)',
                        fontWeight: isActive ? '700' : '500',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        textAlign: 'left',
                        opacity: isAllowed ? 1 : 0.65
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Icon size={18} color={isActive ? 'var(--brand-primary)' : item.highlight ? '#38bdf8' : 'currentColor'} />
                        <span>{item.label}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {!isAllowed && (
                          <span title="Restricted for your role" style={{ opacity: 0.8 }}>
                            <Lock size={12} color="var(--text-muted)" />
                          </span>
                        )}
                        {item.badge !== undefined && isAllowed && (
                          <span style={{
                            background: item.badgeColor || '#ef4444',
                            color: '#ffffff',
                            borderRadius: '99px',
                            padding: '1px 6px',
                            fontSize: '0.65rem',
                            fontWeight: 'bold'
                          }}>
                            {item.badge}
                          </span>
                        )}
                        {isActive && <ChevronRight size={14} color="var(--brand-primary)" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer with Official Business Card Affiliation */}
        <div style={{
          padding: '0.75rem 1rem',
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-card-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.68rem',
            color: 'var(--text-muted)'
          }}>
            <span>Main Branch Moulvibazar</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
            </div>
          </div>

          {/* Quick Storefront Links */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.35rem',
            marginTop: '0.2rem'
          }}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.4rem',
                borderRadius: '6px',
                background: 'rgba(0, 132, 214, 0.12)',
                border: '1px solid rgba(0, 132, 214, 0.25)',
                color: 'var(--brand-primary)',
                fontSize: '0.65rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Storefront</span>
              <span style={{ fontSize: '0.7rem' }}>↗</span>
            </a>
            <a
              href="/track-order"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.4rem',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                color: '#10b981',
                fontSize: '0.65rem',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              <span>Tracking</span>
              <span style={{ fontSize: '0.7rem' }}>↗</span>
            </a>
          </div>

          <div style={{
            background: 'rgba(2, 132, 199, 0.08)',
            border: '1px solid rgba(2, 132, 199, 0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.35rem 0.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              — A sister Concern Of —
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--brand-accent)', letterSpacing: '0.06em' }}>
              AMDADS GROUP
            </div>
          </div>
        </div>
      </aside>

      {showProfileModal && (
        <UserProfileModal onClose={() => setShowProfileModal(false)} />
      )}

      {isPasswordModalOpen && (
        <ChangePasswordModal onClose={() => setIsPasswordModalOpen(false)} />
      )}
    </>
  );
};
