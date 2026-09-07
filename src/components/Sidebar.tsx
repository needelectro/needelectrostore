import React from 'react';
import { useERP } from '../services/erpStore';
import {
  LayoutDashboard, ShoppingCart, ReceiptText, CalendarClock, Boxes,
  Truck, Users, PackageSearch, ShieldCheck, Wrench, Wallet,
  PieChart, BookOpen, UserCheck, GitFork, BarChart3,
  Lock, ScrollText, Settings, X, ChevronRight, Zap, RotateCcw, Sliders
} from 'lucide-react';
import { NeedElectroLogo } from './NeedElectroLogo';

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
  const { settings, emiAccounts, products, services, hasPermission } = useERP();

  // Badges
  const overdueCount = emiAccounts.filter(e => e.installments.some(i => i.status === 'OVERDUE')).length;
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;
  const pendingServicesCount = services.filter(s => s.status === 'Pending').length;

  const navGroups: NavGroup[] = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
        { id: 'accounting', label: 'Accounting & P&L', icon: PieChart },
        { id: 'ledgers', label: 'Customer & Supplier Ledgers', icon: BookOpen },
        { id: 'expenses', label: 'Expense Manager', icon: Wallet },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      group: 'Enterprise Control',
      items: [
        { id: 'control_center', label: 'System Control Center', icon: Sliders, badge: 'SUPER', badgeColor: '#2563eb' },
        { id: 'employees', label: 'Employees & Techs', icon: UserCheck },
        { id: 'branches', label: 'Branches & Transfers', icon: GitFork },
        { id: 'roles', label: 'Roles & RBAC', icon: Lock },
        { id: 'audit', label: 'Audit Logs', icon: ScrollText },
        { id: 'settings', label: 'System Settings', icon: Settings }
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

          <button className="btn btn-ghost btn-sm mobile-close-btn" onClick={onClose} style={{ display: 'none' }}>
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
                        setActiveModule(item.id);
                        if (window.innerWidth < 1024) onClose();
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
    </>
  );
};
