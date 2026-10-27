import React, { useState, useEffect } from 'react';
import { useERP } from '../services/erpStore';
import {
  LayoutDashboard, ShoppingCart, ReceiptText, CalendarClock, Boxes,
  Truck, Users, PackageSearch, ShieldCheck, Wrench, Wallet,
  PieChart, BookOpen, UserCheck, GitFork, BarChart3,
  Lock, ScrollText, Settings, ChevronRight, Zap, RotateCcw, Sliders, Landmark,
  User, Globe, X, ShoppingBag, Sparkles, FileText, Scale, Camera, Star
} from 'lucide-react';
import { NeedElectroLogo } from './NeedElectroLogo';
import { UserProfileModal } from './UserProfileModal';
import { ChangePasswordModal } from './auth/ChangePasswordModal';
import { useLanguage } from '../services/languageContext';

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
    hasPermission,
    quotations 
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

  const { isBangla, formatNumber } = useLanguage();

  const navGroups: NavGroup[] = [
    {
      group: isBangla ? 'প্রধান কার্যক্রম' : 'Core Operations',
      items: [
        { id: 'dashboard', label: isBangla ? 'ড্যাশবোর্ড' : 'Dashboard', icon: LayoutDashboard },
        { id: 'pos', label: isBangla ? 'পিওএস / সেলস বিলিং' : 'POS / Billing', icon: ShoppingCart, highlight: true },
        { id: 'sales', label: isBangla ? 'বিক্রয় ও ইনভয়েস' : 'Sales & Invoices', icon: ReceiptText },
        { id: 'quotations', label: isBangla ? 'কোটেশন ব্যবস্থাপনা' : 'Sales Quotations', icon: FileText, badge: quotations.length > 0 ? formatNumber(quotations.length) : undefined, badgeColor: '#008CFF' },
        { id: 'returns', label: isBangla ? 'রিটার্ন ও আরএমএ' : 'Returns & RMA', icon: RotateCcw },
        { id: 'emi', label: isBangla ? 'ল্যাপটপ ইএমআই সিস্টেম' : 'Laptop EMI System', icon: CalendarClock, badge: overdueCount > 0 ? formatNumber(overdueCount) : undefined, badgeColor: '#ef4444' },
        { id: 'inventory', label: isBangla ? 'ইনভেন্টরি ও সিরিয়াল' : 'Inventory & Serials', icon: Boxes, badge: lowStockCount > 0 ? formatNumber(lowStockCount) : undefined, badgeColor: '#f59e0b' },
        { id: 'purchases', label: isBangla ? 'ক্রয় ও স্টক ইন' : 'Purchase Inflow', icon: Truck },
        { id: 'products', label: isBangla ? 'পণ্য ক্যাটালগ' : 'Product Catalog', icon: PackageSearch }
      ]
    },
    {
      group: isBangla ? 'গ্রাহক ও সেবা' : 'People & CRM',
      items: [
        { id: 'customers', label: isBangla ? 'গ্রাহক সিআরএম' : 'Customer CRM', icon: Users },
        { id: 'suppliers', label: isBangla ? 'সাপ্লায়ার্স' : 'Suppliers', icon: Truck },
        { id: 'service', label: isBangla ? 'সার্ভিস ও মেরামত' : 'Service & Repair', icon: Wrench, badge: pendingServicesCount > 0 ? formatNumber(pendingServicesCount) : undefined, badgeColor: '#38bdf8' },
        { id: 'warranty', label: isBangla ? 'ওয়ারেন্টি ও ক্লেইম' : 'Warranty & Claims', icon: ShieldCheck }
      ]
    },
    {
      group: isBangla ? 'অর্থ ও হিসাবরক্ষণ' : 'Finance & Accounts',
      items: [
        { id: 'cash_management', label: isBangla ? 'নগদ ও ক্যাশ ফান্ড' : 'Cash & Liquidity', icon: Landmark, highlight: true },
        { id: 'accounting', label: isBangla ? 'অ্যাকাউন্টিং ও লাভ-ক্ষতি' : 'Accounting & P&L', icon: PieChart },
        { id: 'ledgers', label: isBangla ? 'গ্রাহক ও সাপ্লায়ার লেজার' : 'Customer & Supplier Ledgers', icon: BookOpen },
        { id: 'expenses', label: isBangla ? 'খরচ ব্যবস্থাপনা' : 'Expense Manager', icon: Wallet },
        { id: 'reports', label: isBangla ? 'রিপোর্ট ও অ্যানালিটিক্স' : 'Reports & Analytics', icon: BarChart3 }
      ]
    },
    {
      group: isBangla ? 'এন্টারপ্রাইজ কন্ট্রোল' : 'Enterprise Control',
      items: [
        { id: 'website_management', label: isBangla ? 'ওয়েবসাইট ম্যানেজমেন্ট হাব' : 'Website Management Hub', icon: Globe, badge: 'SYNC', badgeColor: '#008CFF', highlight: true },
        { id: 'website_orders', label: isBangla ? 'অনলাইন অর্ডার' : 'Online Store Orders', icon: ShoppingBag, badge: 'STORE', badgeColor: '#10b981' },
        { id: 'product_reviews', label: isBangla ? 'পণ্য রিভিউ ও রেটিং' : 'Product Reviews', icon: Star, badge: 'REVIEWS', badgeColor: '#f59e0b' },
        { id: 'control_center', label: isBangla ? 'সিস্টেম কন্ট্রোল সেন্টার' : 'System Control Center', icon: Sliders, badge: 'SUPER', badgeColor: '#2563eb' },
        { id: 'banners', label: isBangla ? 'স্টোর ব্যানার ও স্লাইডার' : 'Store Banners & Hero', icon: Sparkles, badge: 'HERO', badgeColor: '#0084d6' },
        { id: 'gallery_updates', label: isBangla ? 'ফটো গ্যালারি ও বিজনেস আপডেট' : 'Gallery & Updates', icon: Camera, badge: 'NEW', badgeColor: '#f59e0b' },
        { id: 'guides_cms', label: isBangla ? 'বায়িং গাইড সিএমএস' : 'Guides & Content CMS', icon: BookOpen, badge: 'CMS', badgeColor: '#10b981' },
        { id: 'seo_management', label: isBangla ? 'এসইও ম্যানেজমেন্ট' : 'SEO Management', icon: Globe, badge: 'SEO', badgeColor: '#06b6d4' },
        { id: 'legal_templates', label: isBangla ? 'লিগ্যাল ও চুক্তি টেমপ্লেট' : 'Legal & Contract Terms', icon: Scale, badge: 'LEGAL', badgeColor: '#8b5cf6' },
        { id: 'employees', label: isBangla ? 'কর্মচারী ও টেকনিশিয়ান' : 'Employees & Techs', icon: UserCheck },
        { id: 'branches', label: isBangla ? 'শাখা ও ট্রান্সফার' : 'Branches & Transfers', icon: GitFork },
        { id: 'roles', label: isBangla ? 'রোল ও পারমিশন' : 'Roles & RBAC', icon: Lock },
        { id: 'audit', label: isBangla ? 'অডিট লগ' : 'Audit Logs', icon: ScrollText },
        { id: 'settings', label: isBangla ? 'সিস্টেম সেটিংস' : 'System Settings', icon: Settings }
      ]
    },
    {
      group: isBangla ? 'অ্যাকাউন্ট ও অ্যাক্সেস' : 'My Account & Access',
      items: [
        { id: 'user_profile', label: isBangla ? 'আমার প্রোফাইল' : 'My Profile & Account', icon: User, highlight: true }
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
