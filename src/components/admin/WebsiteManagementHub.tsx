'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe, LayoutDashboard, Sparkles, Image as ImageIcon,
  FileText, Tag, Navigation, Settings, Plus, Edit2, Trash2,
  CheckCircle2, AlertTriangle, AlertCircle, RefreshCw, Eye,
  ExternalLink, Search, Filter, ShoppingBag, Wrench, ShieldCheck,
  ChevronRight, Save, ToggleLeft, ToggleRight, X, ArrowUpDown,
  Laptop, Calendar, DollarSign, Bell, Truck, Phone, MessageCircle
} from 'lucide-react';
import { api } from '@/src/services/api';
import { BannersManager } from './BannersManager';

type WebsiteHubTab = 
  | 'dashboard'
  | 'homepage'
  | 'banners'
  | 'pages'
  | 'coupons'
  | 'navigation'
  | 'settings';

interface DashboardStats {
  products: {
    total: number;
    published: number;
    unpublished: number;
    featured: number;
    lowStock: number;
    outOfStock: number;
  };
  categories: {
    active: number;
  };
  banners: {
    active: number;
  };
  orders: {
    total: number;
    pending: number;
    delivered: number;
    recent: any[];
  };
  bookings: {
    total: number;
    pending: number;
    recent: any[];
  };
  guides: {
    total: number;
    published: number;
  };
  pages: {
    total: number;
  };
  coupons: {
    active: number;
  };
  recentActivity: any[];
  warnings: string[];
  systemStatus: string;
}

interface BannerItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  targetUrl?: string | null;
  buttonText?: string | null;
  sortOrder: number;
  isActive: boolean;
  placement: string;
  startDate?: string | null;
  endDate?: string | null;
}

interface PageItem {
  id: string;
  slug: string;
  title: string;
  titleBn?: string | null;
  content: string;
  seoTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
  updatedAt: string;
}

interface CouponItem {
  id: string;
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
}

interface WebsiteManagementHubProps {
  onNavigate?: (module: string, targetId?: string) => void;
  initialTab?: WebsiteHubTab;
}

export const WebsiteManagementHub: React.FC<WebsiteManagementHubProps> = ({ onNavigate, initialTab }) => {
  const [activeTab, setActiveTab] = useState<WebsiteHubTab>(initialTab || 'dashboard');
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Dashboard State
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // 2. Homepage & Settings State
  const [webSettings, setWebSettings] = useState<any>({
    companyName: 'NEED ELECTRO',
    companyTagline: 'Trusted Electrical & Technological Solutions',
    phone: '+880 1733-983752',
    email: 'contact.amdadur@gmail.com',
    supportEmail: 'info.needelectro@gmail.com',
    announcementText: '🔥 Flash Sale: Up to 15% discount on HP & Dell Laptops + 7-Day Replacement Guarantee!',
    announcementActive: true,
    announcementLink: '/laptops',
    maintenanceMode: false,
    accentColor: '#008CFF',
  });

  // 3. Banners State
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: 'Official Showroom & Nationwide Delivery',
    imageUrl: '/logo-dark-transparent.png',
    mobileImageUrl: '',
    targetUrl: '/laptops',
    buttonText: 'Shop Now',
    sortOrder: 0,
    isActive: true,
    placement: 'HERO',
  });

  // 4. Pages CMS State
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [pageForm, setPageForm] = useState({
    slug: '',
    title: '',
    titleBn: '',
    content: '',
    seoTitle: '',
    metaDescription: '',
    isPublished: true,
  });

  // 5. Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 10,
    minOrderAmount: 1000,
    maxDiscountAmount: 2000,
    usageLimit: 100,
    isActive: true,
  });

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Initial Fetcher
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes, bannersRes, pagesRes, couponsRes] = await Promise.all([
        api.websiteDashboard.getStats().catch(() => ({ success: false, data: null })),
        api.websiteSettings.getSettings().catch(() => ({ success: false, data: null })),
        fetch('/api/banners?activeOnly=false').then(r => r.json()).catch(() => ({ success: false, data: [] })),
        api.pages.getPages().catch(() => ({ success: false, data: [] })),
        api.coupons.getCoupons().catch(() => ({ success: false, data: [] })),
      ]);

      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (settingsRes.success && settingsRes.data) setWebSettings(settingsRes.data);
      if (bannersRes.success && bannersRes.data) setBanners(bannersRes.data);
      if (pagesRes.success && pagesRes.data) setPages(pagesRes.data);
      if (couponsRes.success && couponsRes.data) setCoupons(couponsRes.data);
    } catch (err: any) {
      console.error('Website hub load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler: Save Website Settings & Homepage
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.websiteSettings.updateSettings(webSettings);
      if (res.success) {
        showToast('success', 'Website & Homepage Settings synchronized successfully!');
      } else {
        throw new Error((res as any)?.error || 'Failed to save settings');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error updating settings');
    }
  };

  // Handler: Banner CRUD
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title.trim()) {
      showToast('error', 'Banner title is required');
      return;
    }
    try {
      if (editingBanner) {
        const res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerForm),
        });
        const json = await res.json();
        if (json.success) {
          showToast('success', 'Banner updated successfully!');
        } else {
          throw new Error(json.error || 'Failed to update banner');
        }
      } else {
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bannerForm),
        });
        const json = await res.json();
        if (json.success) {
          showToast('success', 'New banner published successfully!');
        } else {
          throw new Error(json.error || 'Failed to create banner');
        }
      }
      setIsBannerModalOpen(false);
      // Refresh
      const bRes = await fetch('/api/banners?activeOnly=false').then(r => r.json());
      if (bRes.success) setBanners(bRes.data);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving banner');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setBanners(prev => prev.filter(b => b.id !== id));
        showToast('success', 'Banner removed.');
      } else {
        throw new Error(json.error);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete banner');
    }
  };

  // Handler: Pages CRUD
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageForm.slug.trim() || !pageForm.title.trim() || !pageForm.content.trim()) {
      showToast('error', 'Slug, title, and content are required.');
      return;
    }
    try {
      const res = await api.pages.savePage(pageForm);
      if (res.success) {
        showToast('success', `Page "${pageForm.title}" saved & synchronized!`);
        setIsPageModalOpen(false);
        const pRes = await api.pages.getPages();
        if (pRes.success) setPages(pRes.data);
      } else {
        throw new Error((res as any)?.error || 'Failed to save page');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error saving page');
    }
  };

  // Handler: Coupons CRUD
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code.trim()) {
      showToast('error', 'Coupon code is required');
      return;
    }
    try {
      if (editingCoupon) {
        const res = await api.coupons.updateCoupon(editingCoupon.id, couponForm);
        if (res.success) {
          showToast('success', `Coupon ${couponForm.code} updated!`);
        } else {
          throw new Error((res as any)?.error);
        }
      } else {
        const res = await api.coupons.createCoupon(couponForm);
        if (res.success) {
          showToast('success', `Coupon ${couponForm.code} created!`);
        } else {
          throw new Error((res as any)?.error);
        }
      }
      setIsCouponModalOpen(false);
      const cRes = await api.coupons.getCoupons();
      if (cRes.success) setCoupons(cRes.data);
    } catch (err: any) {
      showToast('error', err.message || 'Error saving coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      const res = await api.coupons.deleteCoupon(id);
      if (res.success) {
        setCoupons(prev => prev.filter(c => c.id !== id));
        showToast('success', 'Coupon deleted.');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting coupon');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1440px', margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '12px 20px',
          borderRadius: '8px',
          background: toastMsg.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 600,
          fontSize: '0.875rem'
        }}>
          {toastMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #002B5B 0%, #008CFF 100%)',
        borderRadius: '16px',
        padding: '1.75rem 2rem',
        color: '#fff',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(0, 140, 255, 0.25)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '0.05em' }}>
            <Sparkles size={13} />
            <span>ENTERPRISE STOREFRONT ENGINE</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Website Management &amp; Customer Store Synchronization
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.875rem', maxWidth: '650px' }}>
            Authoritative admin console to configure homepage sections, manage banners, edit content pages, issue coupons, inspect orders, and synchronize the customer-facing storefront in real-time.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 700,
              textDecoration: 'none',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Eye size={16} />
            <span>View Live Website</span>
            <ExternalLink size={14} />
          </a>
          <button
            onClick={fetchAllData}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              background: '#fff',
              color: '#002B5B',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Sync Data</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '10px',
        marginBottom: '1.5rem'
      }}>
        {[
          { id: 'dashboard', label: 'Website Dashboard', icon: LayoutDashboard },
          { id: 'homepage', label: 'Homepage & Hero', icon: Sparkles },
          { id: 'banners', label: 'Banners & Campaigns', icon: ImageIcon, badge: banners.length },
          { id: 'pages', label: 'Pages & Content CMS', icon: FileText, badge: pages.length },
          { id: 'coupons', label: 'Coupons & Discounts', icon: Tag, badge: coupons.length },
          { id: 'navigation', label: 'Navigation & Footer', icon: Navigation },
          { id: 'settings', label: 'Storefront Settings', icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as WebsiteHubTab)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? '#008CFF' : 'var(--bg-card-muted)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{t.label}</span>
              {t.badge !== undefined && (
                <span style={{
                  padding: '1px 6px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  background: isActive ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
                  color: isActive ? '#fff' : 'var(--text-muted)'
                }}>
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION A: WEBSITE DASHBOARD                              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Health & Warnings Bar */}
          {stats?.warnings && stats.warnings.length > 0 && (
            <div style={{
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} />
                <span>Storefront Diagnostics &amp; Operational Warnings</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: '1.5' }}>
                {stats.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PUBLISHED PRODUCTS</span>
                <Laptop size={18} color="#008CFF" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {stats?.products.published ?? 0}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {stats?.products.total ?? 0}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                ● {stats?.products.featured ?? 0} Featured on Homepage
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE PROMOTIONS</span>
                <ImageIcon size={18} color="#10b981" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {stats?.banners.active ?? 0}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}> Banners</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#008CFF', marginTop: '4px', fontWeight: 600 }}>
                ● {stats?.coupons.active ?? 0} Active Coupon Codes
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING ORDERS</span>
                <ShoppingBag size={18} color="#f59e0b" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {stats?.orders.pending ?? 0}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {stats?.orders.total ?? 0}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>
                ● {stats?.orders.delivered ?? 0} Successfully Delivered
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>SERVICE BOOKINGS</span>
                <Wrench size={18} color="#8b5cf6" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {stats?.bookings.pending ?? 0}
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}> / {stats?.bookings.total ?? 0}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '4px', fontWeight: 600 }}>
                ● Online Customer Technician Requests
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.25rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Quick Storefront Workflows
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <button
                onClick={() => onNavigate && onNavigate('website_orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <ShoppingBag size={18} color="#10b981" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Manage Orders</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Inspect, dispatch &amp; print invoices</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Laptop size={18} color="#008CFF" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Product Catalog</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Publish, update prices &amp; stock</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('guides_cms')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <FileText size={18} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Guides &amp; SEO CMS</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Publish price &amp; buying guides</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('service')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Wrench size={18} color="#8b5cf6" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Service Bookings</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assign technicians &amp; track jobs</div>
                </div>
              </button>

              <button
                onClick={() => onNavigate && onNavigate('image_recovery')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'var(--bg-card-muted)',
                  border: '1px solid #8b5cf6',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <Sparkles size={18} color="#8b5cf6" />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#8b5cf6' }}>AI Image Recovery</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automate missing product images</div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Orders & Recent Service Bookings Dual Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
            {/* Recent Orders */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShoppingBag size={16} color="#008CFF" />
                  <span>Recent Customer Orders</span>
                </h3>
                <button
                  onClick={() => onNavigate && onNavigate('website_orders')}
                  style={{ background: 'none', border: 'none', color: '#008CFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  View All →
                </button>
              </div>

              {(!stats?.orders.recent || stats.orders.recent.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No online orders recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.orders.recent.map((ord: any) => (
                    <div
                      key={ord.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-card-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{ord.orderNumber}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {ord.customerName} • {ord.customerPhone}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: '#008CFF' }}>৳{Number(ord.total).toLocaleString()}</div>
                        <span style={{
                          display: 'inline-block',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: ord.orderStatus === 'DELIVERED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: ord.orderStatus === 'DELIVERED' ? '#10b981' : '#f59e0b'
                        }}>
                          {ord.orderStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Bookings */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wrench size={16} color="#8b5cf6" />
                  <span>Recent Service Bookings</span>
                </h3>
                <button
                  onClick={() => onNavigate && onNavigate('service')}
                  style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  View All →
                </button>
              </div>

              {(!stats?.bookings.recent || stats.bookings.recent.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  No online service bookings yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stats.bookings.recent.map((bk: any) => (
                    <div
                      key={bk.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--bg-card-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700 }}>{bk.jobCardNumber}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {bk.customerName} • {bk.serviceType}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: bk.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: bk.status === 'Completed' ? '#10b981' : '#ef4444'
                        }}>
                          {bk.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION B: HOMEPAGE MANAGEMENT                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'homepage' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Announcement Bar Control */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                  Global Announcement Bar
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                  Top marquee announcement banner visible across the entire customer website.
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={webSettings.announcementActive}
                  onChange={(e) => setWebSettings({ ...webSettings, announcementActive: e.target.checked })}
                />
                <span>Active on Storefront</span>
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Announcement Message Text
                </label>
                <input
                  type="text"
                  value={webSettings.announcementText || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, announcementText: e.target.value })}
                  placeholder="e.g. 🔥 Flash Sale: Get up to 15% discount on HP & Dell Laptops!"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Destination Link URL
                </label>
                <input
                  type="text"
                  value={webSettings.announcementLink || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, announcementLink: e.target.value })}
                  placeholder="e.g. /laptops or /guides"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            {/* Live Preview Box */}
            {webSettings.announcementActive && (
              <div style={{
                background: 'linear-gradient(90deg, #008CFF 0%, #002B5B 100%)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>PREVIEW:</span>
                <span>{webSettings.announcementText}</span>
              </div>
            )}
          </div>

          {/* Section Visibility & Toggles */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Homepage Sections Visibility
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {[
                { title: 'Hero Carousel & Banners', desc: 'Main promotional slider and badges', enabled: true },
                { title: '7-Column Category Tiles', desc: 'Laptops, CCTV, PCs, Electricals, Networking', enabled: true },
                { title: 'Product Showcase Tabs', desc: 'Featured, Bestsellers, New Arrivals', enabled: true },
                { title: 'Certified Technical Services', desc: 'Electrician & CCTV installation CTA', enabled: true },
                { title: 'Authorized Brand Grid', desc: 'HP, Dell, Hikvision, Schneider, Dahua', enabled: true },
                { title: 'Guides & Buying Advice Hub', desc: 'Laptop prices & product comparisons', enabled: true },
                { title: 'Customer Trust & Guarantee', desc: '7-Day replacement, genuine serial tracking', enabled: true },
              ].map((sec, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-muted)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{sec.title}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{sec.desc}</div>
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)' }}>
                    ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#008CFF',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            <span>Save Homepage Configurations</span>
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION C: BANNERS & CAMPAIGNS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'banners' && (
        <div style={{ marginTop: '-0.5rem' }}>
          <BannersManager />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION D: PAGES & CONTENT CMS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'pages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                Storefront Pages &amp; Policy Management
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Control official company pages, warranty terms, return policies, and shipping rates with live customer website preview.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingPage(null);
                setPageForm({
                  slug: '',
                  title: '',
                  titleBn: '',
                  content: '',
                  seoTitle: '',
                  metaDescription: '',
                  isPublished: true,
                });
                setIsPageModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#008CFF',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Create New Page</span>
            </button>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-card-muted)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>PAGE TITLE</th>
                  <th style={{ padding: '12px 16px' }}>ROUTE SLUG</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                  <th style={{ padding: '12px 16px' }}>LAST UPDATED</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                      {p.title}
                      {p.titleBn && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.titleBn}</div>}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <a
                        href={`/${p.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: '#008CFF', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
                      >
                        <span>/{p.slug}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: p.isPublished ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                        color: p.isPublished ? '#10b981' : '#64748b'
                      }}>
                        {p.isPublished ? 'PUBLISHED' : 'DRAFT'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {new Date(p.updatedAt).toLocaleDateString('en-BD')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setEditingPage(p);
                          setPageForm({
                            slug: p.slug,
                            title: p.title,
                            titleBn: p.titleBn || '',
                            content: p.content,
                            seoTitle: p.seoTitle || '',
                            metaDescription: p.metaDescription || '',
                            isPublished: p.isPublished,
                          });
                          setIsPageModalOpen(true);
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-card-muted)',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Edit Content
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION E: COUPONS & DISCOUNTS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'coupons' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                Promotional Coupons &amp; Discount Codes
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Configure coupon codes validated authoritatively by the server during checkout.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCoupon(null);
                setCouponForm({
                  code: '',
                  description: '',
                  discountType: 'PERCENTAGE',
                  discountValue: 10,
                  minOrderAmount: 1000,
                  maxDiscountAmount: 2000,
                  usageLimit: 100,
                  isActive: true,
                });
                setIsCouponModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: '#008CFF',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} />
              <span>Create Coupon</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {coupons.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0, 140, 255, 0.1)',
                      color: '#008CFF',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      fontSize: '0.95rem'
                    }}>
                      {c.code}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      background: c.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                      color: c.isActive ? '#10b981' : '#64748b'
                    }}>
                      {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', margin: '4px 0' }}>
                    {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `৳${c.discountValue} OFF`}
                  </div>
                  {c.description && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 8px 0' }}>
                      {c.description}
                    </p>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Min Order: <strong>৳{Number(c.minOrderAmount).toLocaleString()}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Redemptions: {c.usageCount} {c.usageLimit ? `/ ${c.usageLimit}` : '(Unlimited)'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => {
                      setEditingCoupon(c);
                      setCouponForm({
                        code: c.code,
                        description: c.description || '',
                        discountType: c.discountType,
                        discountValue: Number(c.discountValue),
                        minOrderAmount: Number(c.minOrderAmount),
                        maxDiscountAmount: c.maxDiscountAmount ? Number(c.maxDiscountAmount) : 0,
                        usageLimit: c.usageLimit || 0,
                        isActive: c.isActive,
                      });
                      setIsCouponModalOpen(true);
                    }}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-card-muted)', cursor: 'pointer' }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION F: NAVIGATION & FOOTER                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'navigation' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Header &amp; Public Social Links
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={webSettings.facebookUrl || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/needelectro"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  YouTube Channel URL
                </label>
                <input
                  type="text"
                  value={webSettings.youtubeUrl || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, youtubeUrl: e.target.value })}
                  placeholder="https://youtube.com/@needelectro"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  WhatsApp Direct Support Number
                </label>
                <input
                  type="text"
                  value={webSettings.whatsappNumber || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, whatsappNumber: e.target.value })}
                  placeholder="+8801733983752"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Customer Support Email
                </label>
                <input
                  type="text"
                  value={webSettings.supportEmail || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, supportEmail: e.target.value })}
                  placeholder="contact.amdadur@gmail.com"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#008CFF',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            <span>Update Navigation &amp; Links</span>
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-SECTION G: STOREFRONT SETTINGS                            */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Storefront Identity &amp; Mode
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Store Name
                </label>
                <input
                  type="text"
                  value={webSettings.companyName || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, companyName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Tagline
                </label>
                <input
                  type="text"
                  value={webSettings.companyTagline || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, companyTagline: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Primary Contact Phone
                </label>
                <input
                  type="text"
                  value={webSettings.phone || ''}
                  onChange={(e) => setWebSettings({ ...webSettings, phone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Brand Accent Color Hex
                </label>
                <input
                  type="text"
                  value={webSettings.accentColor || '#008CFF'}
                  onChange={(e) => setWebSettings({ ...webSettings, accentColor: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div style={{ padding: '1rem', background: 'var(--bg-card-muted)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
                <input
                  type="checkbox"
                  checked={webSettings.maintenanceMode}
                  onChange={(e) => setWebSettings({ ...webSettings, maintenanceMode: e.target.checked })}
                />
                <div>
                  <div>Maintenance Mode</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    When enabled, customer checkout is temporarily paused for catalog auditing.
                  </div>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#008CFF',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Save size={16} />
            <span>Save Storefront Settings</span>
          </button>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT BANNER                                   */}
      {/* ------------------------------------------------------------- */}
      {isBannerModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Headline Title *
                </label>
                <input
                  type="text"
                  required
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="e.g. Premium Business Laptops at Unbeatable Prices"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Subtitle / Promo Text
                </label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="e.g. HP EliteBook, Dell Latitude, Lenovo ThinkPad with 7-Day Replacement"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Top Badge Text
                  </label>
                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                    placeholder="e.g. FLASH SALE"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Button CTA Text
                  </label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({ ...bannerForm, buttonText: e.target.value })}
                    placeholder="e.g. Browse Laptops"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Image URL / Asset Path *
                </label>
                <input
                  type="text"
                  required
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  placeholder="/logo-dark-transparent.png"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Destination Target URL
                  </label>
                  <input
                    type="text"
                    value={bannerForm.targetUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, targetUrl: e.target.value })}
                    placeholder="/laptops"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={bannerForm.sortOrder}
                    onChange={(e) => setBannerForm({ ...bannerForm, sortOrder: parseInt(e.target.value, 10) || 0 })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  checked={bannerForm.isActive}
                  onChange={(e) => setBannerForm({ ...bannerForm, isActive: e.target.checked })}
                />
                <span>Active on Homepage Slider</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsBannerModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', background: '#008CFF', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT PAGE (CMS)                               */}
      {/* ------------------------------------------------------------- */}
      {isPageModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '720px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {editingPage ? `Edit Page: /${editingPage.slug}` : 'Create New Page'}
              </h3>
              <button
                onClick={() => setIsPageModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Page Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={pageForm.title}
                    onChange={(e) => setPageForm({ ...pageForm, title: e.target.value })}
                    placeholder="e.g. Return and Refund Policy"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Route Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={pageForm.slug}
                    onChange={(e) => setPageForm({ ...pageForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="return-refund-policy"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  SEO Meta Description
                </label>
                <input
                  type="text"
                  value={pageForm.metaDescription}
                  onChange={(e) => setPageForm({ ...pageForm, metaDescription: e.target.value })}
                  placeholder="Official policy and terms description for search engine previews"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Page Content (Markdown &amp; Clean Text) *
                </label>
                <textarea
                  required
                  rows={12}
                  value={pageForm.content}
                  onChange={(e) => setPageForm({ ...pageForm, content: e.target.value })}
                  placeholder="## Section Title&#10;Write formatted policy or informational content here..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    fontSize: '0.825rem',
                    lineHeight: '1.5'
                  }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={pageForm.isPublished}
                  onChange={(e) => setPageForm({ ...pageForm, isPublished: e.target.checked })}
                />
                <span>Published &amp; Indexable on Customer Store</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsPageModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', background: '#008CFF', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE / EDIT COUPON                                   */}
      {/* ------------------------------------------------------------- */}
      {isCouponModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '1.75rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
              </h3>
              <button
                onClick={() => setIsCouponModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FLASH10"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: 800, fontFamily: 'monospace' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Discount Type
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (৳ BDT)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                    Minimum Order (৳ BDT)
                  </label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>
                  Description / Campaign Notes
                </label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. Special 10% discount for Moulvibazar customers"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>
                <input
                  type="checkbox"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                />
                <span>Active for Checkout</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card-muted)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', background: '#008CFF', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
