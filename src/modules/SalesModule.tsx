import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../services/erpStore';
import { Sale, PaymentMethod } from '../types';
import { 
  ReceiptText, Search, Printer, FileText, Eye, 
  RotateCcw, Calendar, Check, X, ArrowUpRight,
  Edit2, Trash2, Save, ShieldCheck, RefreshCw, Database, AlertCircle,
  CreditCard, Copy, Share2, Filter, ChevronDown, CheckCircle2,
  Clock, DollarSign, User, Phone, MapPin, Tag, ShoppingCart, Truck
} from 'lucide-react';

import { getInvoiceItemSpecs, formatWarrantyInfo } from '../services/invoiceSpecsHelper';
import { WebsiteOrdersManager } from '../components/admin/WebsiteOrdersManager';
import { QuotationsManager } from '../components/quotations/QuotationsManager';

interface SalesModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
  initialTab?: 'INVOICES' | 'QUOTATIONS' | 'WEBSITE_ORDERS';
}

export const SalesModule: React.FC<SalesModuleProps> = ({ onNavigate, initialTab }) => {
  const { 
    sales, products, branches, financialAccounts, setActiveInvoiceToPrint, setActiveThermalReceiptToPrint,
    currentUser, updateSale, deleteSale, recordInvoicePayment, refreshSales, refreshFromDatabase, addToast,
    quotations 
  } = useERP();

  // Search & Filtering States - Initialized from URL query params
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('q') || p.get('search') || '';
    }
    return '';
  });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DUE' | 'PAID' | 'PARTIALLY_PAID' | 'EMI' | 'CANCELLED' | 'RETURNED'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const s = (p.get('status') || '').toUpperCase();
      if (['DUE', 'PAID', 'PARTIALLY_PAID', 'EMI', 'CANCELLED', 'RETURNED'].includes(s)) {
        return s as any;
      }
      if (s === 'COMPLETED') return 'PAID';
    }
    return 'ALL';
  });
  const [dateFilter, setDateFilter] = useState<'ALL' | 'TODAY' | 'YESTERDAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'INVOICES' | 'QUOTATIONS' | 'WEBSITE_ORDERS'>(initialTab || 'INVOICES');

  useEffect(() => {
    if (initialTab) {
      setViewMode(initialTab);
    }
  }, [initialTab]);

  // Keep URL search params in sync without replacing other query parameters (e.g. page)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentParams = new URLSearchParams(window.location.search);
    let changed = false;

    if (statusFilter !== 'ALL') {
      if (currentParams.get('status') !== statusFilter.toLowerCase()) {
        currentParams.set('status', statusFilter.toLowerCase());
        changed = true;
      }
    } else if (currentParams.has('status')) {
      currentParams.delete('status');
      changed = true;
    }

    if (searchQuery.trim()) {
      if (currentParams.get('q') !== searchQuery.trim()) {
        currentParams.set('q', searchQuery.trim());
        changed = true;
      }
    } else if (currentParams.has('q')) {
      currentParams.delete('q');
      changed = true;
    }

    if (changed) {
      const searchStr = currentParams.toString();
      const newUrl = searchStr ? `${window.location.pathname}?${searchStr}` : window.location.pathname;
      window.history.replaceState(window.history.state, '', newUrl);
    }
  }, [statusFilter, searchQuery]);

  // Modal States
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);
  const [paymentSale, setPaymentSale] = useState<Sale | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentAccountId, setPaymentAccountId] = useState<string>(financialAccounts[0]?.id || '');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Super Admin / Manager Edit Sale Modal State
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  // Permissions
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = currentUser?.role === 'ADMIN';
  const canEdit = isSuperAdmin || isAdmin || currentUser?.role === 'MANAGER' || (currentUser as any)?.permissions?.sales?.edit;
  const canCancel = isSuperAdmin || isAdmin;
  const canRecordPayment = isSuperAdmin || isAdmin || canEdit || currentUser?.role === 'CASHIER' || currentUser?.role === 'SALES';

  // Auto-fetch latest database sales on mount
  useEffect(() => {
    let isMounted = true;
    const loadLatestSales = async () => {
      try {
        await refreshSales();
      } catch (e) {
        console.warn('Auto sales sync notice:', e);
      }
    };
    loadLatestSales();
    return () => { isMounted = false; };
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const updatedSales = await refreshSales();
      await refreshFromDatabase();
      addToast('success', 'Database Synchronized', `Successfully synced ${updatedSales.length} invoices with central database.`);
    } catch (e: any) {
      addToast('error', 'Sync Notice', e.message || 'Failed to sync with database.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Duplicate Invoice into POS
  const handleDuplicateInvoice = (sale: Sale) => {
    try {
      if (!sale.items || sale.items.length === 0) {
        addToast('error', 'Cannot Duplicate', 'Invoice has no line items to copy.');
        return;
      }
      const cartItems = sale.items.map(item => ({
        ...item,
        availableSerials: [],
        serialNumbers: [], // Clear serials for new sale
      }));
      sessionStorage.setItem('needelectro_duplicate_cart', JSON.stringify(cartItems));
      addToast('info', 'Invoice Cloned', `Copied ${cartItems.length} items to POS billing terminal.`);
      onNavigate('pos');
    } catch (e: any) {
      addToast('error', 'Error Duplicating', e.message);
    }
  };

  // Open Quick Record Payment Modal
  const handleOpenPaymentModal = (sale: Sale) => {
    const due = Number(sale.dueAmount || 0);
    setPaymentSale(sale);
    setPaymentAmount(due);
    setPaymentMethod('Cash');
    setPaymentAccountId(financialAccounts[0]?.id || '');
    setPaymentRef('');
    setPaymentNotes(`Payment for ${sale.invoiceNumber}`);
  };

  // Submit Quick Record Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentSale) return;
    if (paymentAmount <= 0) {
      addToast('error', 'Invalid Amount', 'Payment amount must be greater than 0.');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const res = await recordInvoicePayment(paymentSale.id, {
        amount: paymentAmount,
        paymentMethod,
        accountId: paymentAccountId,
        reference: paymentRef,
        notes: paymentNotes,
      });

      if (res.success) {
        setPaymentSale(null);
        if (viewingSale && viewingSale.id === paymentSale.id) {
          setViewingSale(null);
        }
      }
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Cancel / Reverse Invoice
  const handleCancelInvoice = async (sale: Sale) => {
    const due = Number(sale.dueAmount || 0);
    const paid = Number(sale.paidAmount || 0);
    const msg = `⚠️ [INVOICE CANCELLATION & REVERSAL]\n\nAre you sure you want to cancel invoice ${sale.invoiceNumber}?\n\nCustomer: ${sale.customerName}\nGrand Total: ৳${sale.grandTotal.toLocaleString()}\nCash Inflow to Reverse: ৳${paid.toLocaleString()}\nReceivable to Reverse: ৳${due.toLocaleString()}\n\nAll inventory stock will be restored and serial numbers released back to AVAILABLE.`;
    
    if (window.confirm(msg)) {
      await deleteSale(sale.id);
    }
  };

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // 1. Status Filter
      const due = Number(s.dueAmount) || 0;
      const paid = Number(s.paidAmount) || 0;
      const total = Number(s.grandTotal) || 0;
      const isCancelled = s.status === 'CANCELLED' || s.status === 'VOID';
      const isReturned = s.status === 'RETURNED';

      if (statusFilter === 'DUE') {
        if (isCancelled || isReturned || due <= 0) return false;
      } else if (statusFilter === 'PAID') {
        if (isCancelled || isReturned || due > 0) return false;
      } else if (statusFilter === 'PARTIALLY_PAID') {
        if (isCancelled || isReturned || due <= 0 || paid <= 0) return false;
      } else if (statusFilter === 'EMI') {
        if (s.saleType !== 'EMI') return false;
      } else if (statusFilter === 'CANCELLED') {
        if (!isCancelled) return false;
      } else if (statusFilter === 'RETURNED') {
        if (!isReturned) return false;
      }

      // 2. Branch Filter
      if (selectedBranchId !== 'ALL' && s.branchId !== selectedBranchId) {
        return false;
      }

      // 3. Payment Method Filter
      if (selectedPaymentMethod !== 'ALL') {
        const pmts = (s.payments as any[]) || [];
        const hasMethod = pmts.some(p => String(p.method || '').toLowerCase() === selectedPaymentMethod.toLowerCase());
        if (!hasMethod) return false;
      }

      // 4. Date Filter
      if (dateFilter !== 'ALL') {
        const saleDate = new Date(s.createdAt || s.date);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateFilter === 'TODAY') {
          if (saleDate < startOfToday) return false;
        } else if (dateFilter === 'YESTERDAY') {
          const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
          if (saleDate < startOfYesterday || saleDate >= startOfToday) return false;
        } else if (dateFilter === 'WEEK') {
          const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (saleDate < sevenDaysAgo) return false;
        } else if (dateFilter === 'MONTH') {
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          if (saleDate < startOfMonth) return false;
        } else if (dateFilter === 'CUSTOM') {
          if (customStartDate && saleDate < new Date(customStartDate + 'T00:00:00')) return false;
          if (customEndDate && saleDate > new Date(customEndDate + 'T23:59:59')) return false;
        }
      }

      // 5. Query Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const invMatch = (s.invoiceNumber || '').toLowerCase().includes(q);
        const nameMatch = (s.customerName || '').toLowerCase().includes(q);
        const phoneMatch = (s.customerPhone || '').includes(q);
        const notesMatch = (s.notes || '').toLowerCase().includes(q);
        const itemMatch = (s.items || []).some(i => 
          (i.productName || '').toLowerCase().includes(q) ||
          (i.sku || '').toLowerCase().includes(q) ||
          (Array.isArray(i.serialNumbers) && i.serialNumbers.some((sn: string) => sn.toLowerCase().includes(q)))
        );

        if (!invMatch && !nameMatch && !phoneMatch && !notesMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    });
  }, [sales, statusFilter, selectedBranchId, selectedPaymentMethod, dateFilter, customStartDate, customEndDate, searchQuery]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalInvoices = sales.length;
    const totalVolume = sales.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
    const totalPaid = sales.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0);
    const totalDue = sales.reduce((sum, s) => sum + (Number(s.dueAmount) || 0), 0);

    const todayInvoicesList = sales.filter(s => new Date(s.createdAt || s.date) >= today);
    const todaySales = todayInvoicesList.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);
    const todayCount = todayInvoicesList.length;

    const dueCount = sales.filter(s => (Number(s.dueAmount) || 0) > 0 && s.status !== 'CANCELLED').length;
    const paidCount = sales.filter(s => (Number(s.dueAmount) || 0) <= 0 && s.status !== 'CANCELLED').length;
    const emiCount = sales.filter(s => s.saleType === 'EMI').length;
    const cancelledCount = sales.filter(s => s.status === 'CANCELLED' || s.status === 'VOID').length;

    return {
      totalInvoices,
      totalVolume,
      totalPaid,
      totalDue,
      todayCount,
      todaySales,
      dueCount,
      paidCount,
      emiCount,
      cancelledCount,
    };
  }, [sales]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ReceiptText size={28} color="#008CFF" />
              Invoice Management & Sales Engine
            </h1>
            <span 
              className="badge badge-success" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '5px', 
                padding: '0.25rem 0.65rem', 
                fontSize: '0.78rem',
                fontWeight: 700,
                borderRadius: '6px'
              }}
            >
              <Database size={13} /> {sales.length} Live Invoices
            </span>
          </div>
          <p>
            Complete commercial invoice lifecycle: A4 Tax Invoices, 80mm POS Receipts, Due Collections, Reconciliations & Audit History.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={handleManualSync}
            disabled={isSyncing}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            title="Force refresh invoices from PostgreSQL database"
          >
            <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
            {isSyncing ? 'Syncing...' : 'Sync Database'}
          </button>

          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onNavigate('pos')}
            style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#008CFF', borderColor: '#008CFF' }}
          >
            <ShoppingCart size={15} /> + Open POS Terminal
          </button>
        </div>
      </div>

      {/* Mode Switcher: Invoices vs Quotations vs Website Orders */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setViewMode('INVOICES')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: viewMode === 'INVOICES' ? 700 : 500,
            color: viewMode === 'INVOICES' ? '#fff' : 'var(--text-secondary)',
            background: viewMode === 'INVOICES' ? 'var(--brand-primary)' : 'var(--bg-card)',
            border: '1px solid',
            borderColor: viewMode === 'INVOICES' ? 'var(--brand-primary)' : 'var(--border-color)',
            cursor: 'pointer'
          }}
        >
          <ReceiptText size={15} />
          Invoices &amp; Showroom Sales
        </button>

        <button
          onClick={() => setViewMode('QUOTATIONS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: viewMode === 'QUOTATIONS' ? 700 : 500,
            color: viewMode === 'QUOTATIONS' ? '#fff' : 'var(--text-secondary)',
            background: viewMode === 'QUOTATIONS' ? 'var(--brand-primary)' : 'var(--bg-card)',
            border: '1px solid',
            borderColor: viewMode === 'QUOTATIONS' ? 'var(--brand-primary)' : 'var(--border-color)',
            cursor: 'pointer'
          }}
        >
          <FileText size={15} />
          Sales Quotations
          {quotations.length > 0 && (
            <span style={{
              background: viewMode === 'QUOTATIONS' ? 'rgba(255,255,255,0.25)' : 'var(--brand-primary)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '999px',
              marginLeft: '4px'
            }}>
              {quotations.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setViewMode('WEBSITE_ORDERS')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
            fontWeight: viewMode === 'WEBSITE_ORDERS' ? 700 : 500,
            color: viewMode === 'WEBSITE_ORDERS' ? '#fff' : 'var(--text-secondary)',
            background: viewMode === 'WEBSITE_ORDERS' ? 'var(--brand-primary)' : 'var(--bg-card)',
            border: '1px solid',
            borderColor: viewMode === 'WEBSITE_ORDERS' ? 'var(--brand-primary)' : 'var(--border-color)',
            cursor: 'pointer'
          }}
        >
          <Truck size={15} />
          Website Online &amp; COD Orders
        </button>
      </div>

      {viewMode === 'QUOTATIONS' ? (
        <QuotationsManager
          onNavigateToInvoice={(inv) => {
            setViewMode('INVOICES');
            setSearchQuery(inv);
          }}
        />
      ) : viewMode === 'WEBSITE_ORDERS' ? (
        <WebsiteOrdersManager />
      ) : (
        <>
          {/* KPI Summary Dashboard Strip */}
          <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Invoiced Amount</span>
            <div className="kpi-icon" style={{ background: 'rgba(0, 140, 255, 0.12)', color: '#008CFF' }}>
              <ReceiptText size={20} />
            </div>
          </div>
          <div className="kpi-value">৳{metrics.totalVolume.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Across {metrics.totalInvoices} total invoices
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Today's Invoices & Sales</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>৳{metrics.todaySales.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: '#10b981' }}>
            {metrics.todayCount} invoice(s) generated today
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Collected (Cash/Bank)</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>৳{metrics.totalPaid.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            {metrics.paidCount} invoice(s) paid in full
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Outstanding Receivable Due</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <AlertCircle size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>৳{metrics.totalDue.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: '#f59e0b', fontWeight: 600 }}>
            {metrics.dueCount} invoice(s) with pending due
          </div>
        </div>
      </div>

      {/* Invoices List with Advanced Multi-Filter */}
      <div className="erp-card" style={{ padding: '1.25rem' }}>
        {/* Top Filter Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '340px', maxWidth: '100%' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Invoice #, Customer, Serial #, SKU..."
              className="form-input"
              style={{ paddingLeft: '32px' }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Quick Status Tabs */}
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('ALL')}
            >
              All Invoices ({sales.length})
            </button>

            <button
              className={`btn btn-sm ${statusFilter === 'DUE' ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('DUE')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontWeight: 600,
                ...(statusFilter === 'DUE' ? {
                  background: '#f59e0b',
                  borderColor: '#d97706',
                  color: '#ffffff',
                } : {})
              }}
            >
              <AlertCircle size={13} />
              <span>Due</span>
              {metrics.dueCount > 0 && (
                <span style={{
                  background: statusFilter === 'DUE' ? '#ffffff' : '#f59e0b',
                  color: statusFilter === 'DUE' ? '#d97706' : '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  borderRadius: '10px',
                }}>
                  {metrics.dueCount}
                </span>
              )}
            </button>

            <button
              className={`btn btn-sm ${statusFilter === 'PAID' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('PAID')}
            >
              Paid
            </button>

            <button
              className={`btn btn-sm ${statusFilter === 'PARTIALLY_PAID' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('PARTIALLY_PAID')}
            >
              Partial
            </button>

            <button
              className={`btn btn-sm ${statusFilter === 'EMI' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('EMI')}
            >
              EMI ({metrics.emiCount})
            </button>

            <button
              className={`btn btn-sm ${statusFilter === 'CANCELLED' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setStatusFilter('CANCELLED')}
            >
              Cancelled
            </button>
          </div>
        </div>

        {/* Secondary Filter Strip (Date, Branch, Payment Method) */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-surface, rgba(0,0,0,0.03))', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Calendar size={15} color="var(--brand-primary)" />
            <span style={{ fontWeight: 600 }}>Date Range:</span>
            <select
              className="form-select form-select-sm"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as any)}
              style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="YESTERDAY">Yesterday</option>
              <option value="WEEK">Last 7 Days</option>
              <option value="MONTH">This Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {dateFilter === 'CUSTOM' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="date"
                className="form-input form-input-sm"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to</span>
              <input
                type="date"
                className="form-input form-input-sm"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                style={{ padding: '0.2rem 0.4rem', fontSize: '0.8rem' }}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', marginLeft: 'auto' }}>
            <span style={{ fontWeight: 600 }}>Branch:</span>
            <select
              className="form-select form-select-sm"
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              style={{ width: '150px', padding: '0.25rem 0.5rem', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>Payment Method:</span>
            <select
              className="form-select form-select-sm"
              value={selectedPaymentMethod}
              onChange={e => setSelectedPaymentMethod(e.target.value)}
              style={{ width: '130px', padding: '0.25rem 0.5rem', fontSize: '0.82rem' }}
            >
              <option value="ALL">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="bKash">bKash</option>
              <option value="Nagad">Nagad</option>
              <option value="Rocket">Rocket</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date & Time</th>
                <th>Customer Information</th>
                <th>Items & Serials</th>
                <th style={{ textAlign: 'right' }}>Total (৳)</th>
                <th style={{ textAlign: 'right' }}>Paid (৳)</th>
                <th style={{ textAlign: 'right' }}>Due (৳)</th>
                <th style={{ textAlign: 'center' }}>Type</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => {
                const due = Number(sale.dueAmount) || 0;
                const paid = Number(sale.paidAmount) || 0;
                const total = Number(sale.grandTotal) || 0;
                const isCancelled = sale.status === 'CANCELLED' || sale.status === 'VOID';

                // Determine display badge for status
                let badgeClass = 'badge-success';
                let statusLabel: string = sale.status || 'COMPLETED';

                if (isCancelled) {
                  badgeClass = 'badge-danger';
                  statusLabel = 'CANCELLED';
                } else if (sale.status === 'RETURNED') {
                  badgeClass = 'badge-neutral';
                  statusLabel = 'RETURNED';
                } else if (sale.saleType === 'EMI') {
                  badgeClass = 'badge-warning';
                  statusLabel = 'EMI SALE';
                } else if (due > 0 && paid > 0) {
                  badgeClass = 'badge-info';
                  statusLabel = 'PARTIAL';
                } else if (due > 0) {
                  badgeClass = 'badge-warning';
                  statusLabel = 'DUE';
                } else {
                  badgeClass = 'badge-success';
                  statusLabel = 'PAID';
                }

                return (
                  <tr key={sale.id}>
                    <td>
                      <button
                        onClick={() => setViewingSale(sale)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#008CFF',
                          fontWeight: 800,
                          cursor: 'pointer',
                          fontFamily: 'monospace',
                          fontSize: '0.88rem',
                          padding: 0,
                          textAlign: 'left'
                        }}
                        title="Click to view full invoice details"
                      >
                        {sale.invoiceNumber}
                      </button>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {sale.branchName || 'Showroom'}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{sale.date}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sale.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{sale.customerPhone}</div>
                      {(sale as any).customerType && (sale as any).customerType !== 'RETAIL' && (
                        <span style={{ fontSize: '0.68rem', background: 'rgba(0,140,255,0.1)', color: '#008CFF', padding: '1px 4px', borderRadius: '3px' }}>
                          {(sale as any).customerType}
                        </span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {(sale.items || []).map(i => `${i.productName} (x${i.quantity})`).join(', ') || 'Commercial Sale'}
                      </div>
                      {(() => {
                        const serialsList = (sale.items || []).flatMap(i => {
                          if (Array.isArray(i.serialNumbers)) return i.serialNumbers;
                          if (typeof (i as any).serials === 'string') return (i as any).serials.split(',').map((s: string) => s.trim()).filter(Boolean);
                          if (Array.isArray((i as any).serials)) return (i as any).serials;
                          if ((i as any).serialNumber) return [(i as any).serialNumber];
                          return [];
                        });
                        return serialsList.length > 0 ? (
                          <div style={{ fontSize: '0.72rem', color: '#008CFF', fontFamily: 'monospace', fontWeight: 600 }}>
                            S/N: {serialsList.join(', ')}
                          </div>
                        ) : null;
                      })()}
                    </td>

                    <td style={{ textAlign: 'right', fontWeight: 800 }}>
                      ৳{total.toLocaleString()}
                    </td>

                    <td style={{ textAlign: 'right', color: '#10b981', fontWeight: 700 }}>
                      ৳{paid.toLocaleString()}
                    </td>

                    <td style={{ 
                      textAlign: 'right', 
                      color: due > 0 ? '#d97706' : 'var(--text-muted)', 
                      fontWeight: due > 0 ? 800 : 'normal',
                      backgroundColor: due > 0 ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                      borderRadius: '4px',
                      padding: '4px 8px'
                    }}>
                      {due > 0 ? `৳${due.toLocaleString()}` : '৳0'}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${sale.saleType === 'EMI' ? 'badge-warning' : 'badge-neutral'}`}>
                        {sale.saleType}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${badgeClass}`}>{statusLabel}</span>
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center', alignItems: 'center' }}>
                        {/* View Invoice */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setViewingSale(sale)}
                          title="View Invoice Details"
                          style={{ padding: '0.25rem 0.4rem', color: '#008CFF' }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Print A4 */}
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveInvoiceToPrint(sale)}
                          title="Print A4 Tax Invoice"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
                        >
                          <Printer size={13} /> A4
                        </button>

                        {/* Record Payment (if due > 0) */}
                        {due > 0 && !isCancelled && canRecordPayment && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleOpenPaymentModal(sale)}
                            title="Record Customer Due Payment"
                            style={{ padding: '0.25rem 0.45rem', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            <CreditCard size={13} /> Pay
                          </button>
                        )}

                        {/* Edit Sale (Super Admin / Admin / Manager) */}
                        {canEdit && !isCancelled && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => {
                              setEditingSale(sale);
                              setEditForm({ ...sale });
                            }}
                            title="Master Edit Invoice"
                            style={{ padding: '0.25rem 0.4rem', color: '#f59e0b' }}
                          >
                            <Edit2 size={13} />
                          </button>
                        )}

                        {/* Cancel Invoice (Super Admin / Admin only) */}
                        {canCancel && !isCancelled && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleCancelInvoice(sale)}
                            title="Cancel & Reverse Invoice"
                            style={{ padding: '0.25rem 0.4rem', color: '#ef4444' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Search size={32} color="var(--text-muted)" />
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>No invoices found matching criteria.</div>
                      <div style={{ fontSize: '0.82rem' }}>Try clearing filters or searching by a different customer name or invoice number.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW INVOICE MODAL */}
      {viewingSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            borderRadius: '12px',
            width: '90vw',
            maxWidth: '750px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#002B5B',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ReceiptText size={20} color="#008CFF" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Invoice Details — {viewingSale.invoiceNumber}
                </h3>
                <span className="badge badge-primary">{viewingSale.status || 'COMPLETED'}</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setViewingSale(null)} style={{ color: '#fff' }}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Customer & Meta Box */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1rem', background: 'var(--bg-surface, rgba(0,0,0,0.1))', padding: '1rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase' }}>Customer Information</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: '2px' }}>{viewingSale.customerName}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone: {viewingSale.customerPhone}</div>
                  {viewingSale.customerAddress && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Address: {viewingSale.customerAddress}</div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase' }}>Invoice Summary</div>
                  <div style={{ fontSize: '0.85rem' }}>Date: <strong>{viewingSale.date}</strong></div>
                  <div style={{ fontSize: '0.85rem' }}>Salesperson: <strong>{viewingSale.salespersonName || 'Showroom'}</strong></div>
                  <div style={{ fontSize: '0.85rem' }}>Sale Type: <strong>{viewingSale.saleType} SALE</strong></div>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 700 }}>Line Items</h4>
                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product & Specifications</th>
                        <th style={{ textAlign: 'center' }}>Warranty</th>
                        <th style={{ textAlign: 'center' }}>Qty</th>
                        <th style={{ textAlign: 'right' }}>Unit Price</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(viewingSale.items || []).map((item, idx) => {
                        let itemSerials: string[] = [];
                        if (Array.isArray(item.serialNumbers) && item.serialNumbers.length > 0) {
                          itemSerials = item.serialNumbers;
                        } else if (typeof (item as any).serials === 'string' && (item as any).serials.trim()) {
                          itemSerials = (item as any).serials.split(',').map((s: string) => s.trim()).filter(Boolean);
                        } else if (Array.isArray((item as any).serials) && (item as any).serials.length > 0) {
                          itemSerials = (item as any).serials;
                        } else if ((item as any).serialNumber && typeof (item as any).serialNumber === 'string') {
                          itemSerials = [(item as any).serialNumber.trim()];
                        }

                        const specs = getInvoiceItemSpecs(item, products);
                        const warrantyInfo = formatWarrantyInfo(item.warrantyMonths, viewingSale.date || viewingSale.createdAt);

                        return (
                          <tr key={item.id || idx}>
                            <td>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{item.productName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                SKU: {item.sku} | Category: {item.category}
                              </div>

                              {/* Product Specifications Badge Container */}
                              {specs.length > 0 && (
                                <div style={{
                                  marginTop: '4px',
                                  padding: '4px 8px',
                                  background: 'rgba(0, 140, 255, 0.05)',
                                  border: '1px solid rgba(0, 140, 255, 0.18)',
                                  borderRadius: '4px',
                                  fontSize: '0.72rem',
                                  lineHeight: '1.4'
                                }}>
                                  <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: specs.length > 2 ? 'repeat(2, 1fr)' : '1fr',
                                    gap: '2px 8px'
                                  }}>
                                    {specs.map((s, sIdx) => (
                                      <div key={sIdx} style={{ display: 'flex', gap: '4px' }}>
                                        <span style={{ fontWeight: 700, color: 'var(--brand-primary, #008CFF)' }}>{s.label}:</span>
                                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.value}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {itemSerials.length > 0 && (
                                <div style={{ marginTop: '2px', fontSize: '0.75rem', color: '#008CFF', fontFamily: 'monospace', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ background: 'rgba(0, 140, 255, 0.1)', padding: '1px 5px', borderRadius: '3px', fontSize: '0.7rem' }}>S/N:</span>
                                  <span>{itemSerials.join(', ')}</span>
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                              <div style={{ fontWeight: 700 }}>{warrantyInfo.durationText}</div>
                              {warrantyInfo.expiryText && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                  Until: {warrantyInfo.expiryText}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ textAlign: 'right' }}>৳{Number(item.unitPrice).toLocaleString()}</td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{Number(item.total).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <strong>৳{Number(viewingSale.subtotal || 0).toLocaleString()}</strong>
                  </div>
                  {Number(viewingSale.overallDiscount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                      <span>Discount:</span>
                      <strong>-৳{Number(viewingSale.overallDiscount).toLocaleString()}</strong>
                    </div>
                  )}
                  {Number(viewingSale.vatAmount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>VAT ({viewingSale.vatPercent}%):</span>
                      <strong>+৳{Number(viewingSale.vatAmount).toLocaleString()}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid var(--border-color)', borderBottom: '2px solid var(--border-color)', fontSize: '1rem', fontWeight: 800 }}>
                    <span>Grand Total:</span>
                    <span>৳{Number(viewingSale.grandTotal || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}>
                    <span>Paid Amount:</span>
                    <span>৳{Number(viewingSale.paidAmount || 0).toLocaleString()}</span>
                  </div>
                  {Number(viewingSale.dueAmount || 0) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', fontWeight: 800 }}>
                      <span>Balance Due:</span>
                      <span>৳{Number(viewingSale.dueAmount).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-surface, rgba(0,0,0,0.05))'
            }}>
              <div>
                {Number(viewingSale.dueAmount || 0) > 0 && canRecordPayment && (
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => {
                      const s = viewingSale;
                      setViewingSale(null);
                      handleOpenPaymentModal(s);
                    }}
                    style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CreditCard size={14} /> Record Due Payment
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    const s = viewingSale;
                    setViewingSale(null);
                    setActiveThermalReceiptToPrint(s);
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <ReceiptText size={14} /> 80mm Receipt
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    const s = viewingSale;
                    setViewingSale(null);
                    setActiveInvoiceToPrint(s);
                  }}
                  style={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', background: '#008CFF', borderColor: '#008CFF' }}
                >
                  <Printer size={14} /> Official A4 Invoice
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setViewingSale(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK RECORD PAYMENT MODAL */}
      {paymentSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            border: '2px solid #008CFF',
            borderRadius: '12px',
            width: '90vw',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#002B5B',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={18} color="#008CFF" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                  Record Payment — {paymentSale.invoiceNumber}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPaymentSale(null)} style={{ color: '#fff' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(0,140,255,0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(0,140,255,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span>Customer:</span>
                  <strong>{paymentSale.customerName}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '4px' }}>
                  <span>Invoice Total:</span>
                  <span>৳{Number(paymentSale.grandTotal).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginTop: '4px', fontWeight: 800, color: '#f59e0b' }}>
                  <span>Current Due Balance:</span>
                  <span>৳{Number(paymentSale.dueAmount).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Payment Amount (৳) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={Number(paymentSale.dueAmount)}
                  className="form-input"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Payment Method *</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                    <option value="Bank">Bank</option>
                    <option value="Card">Card</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontWeight: 700 }}>Deposit Account *</label>
                  <select
                    className="form-select"
                    value={paymentAccountId}
                    onChange={e => setPaymentAccountId(e.target.value)}
                  >
                    {financialAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Reference / Trx ID</label>
                <input
                  type="text"
                  placeholder="e.g. TrxID-9X82B"
                  className="form-input"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontWeight: 700 }}>Remarks / Notes</label>
                <input
                  type="text"
                  className="form-input"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setPaymentSale(null)} disabled={isProcessingPayment}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-success" 
                  disabled={isProcessingPayment || paymentAmount <= 0}
                  style={{ fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Check size={16} />
                  {isProcessingPayment ? 'Recording...' : `Collect ৳${paymentAmount.toLocaleString()}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUPER ADMIN / MANAGER MASTER EDIT MODAL */}
      {editingSale && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }}>
          <div style={{
            background: 'var(--bg-card, #1e293b)',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            width: '90vw',
            maxWidth: '680px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#f59e0b" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  Master Invoice Edit — {editingSale.invoiceNumber}
                </h3>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSale(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setIsSaving(true);
              const res = await updateSale(editingSale.id, editForm);
              setIsSaving(false);
              if (res.success) {
                setEditingSale(null);
              }
            }} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '1rem' }}>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Invoice Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.invoiceNumber || ''}
                    onChange={e => setEditForm({ ...editForm, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Sale Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editForm.date ? new Date(editForm.date).toISOString().slice(0, 10) : ''}
                    onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Customer Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.customerName || ''}
                    onChange={e => setEditForm({ ...editForm, customerName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Customer Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.customerPhone || ''}
                    onChange={e => setEditForm({ ...editForm, customerPhone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Grand Total (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.grandTotal || 0}
                    onChange={e => {
                      const grandTotal = Number(e.target.value);
                      const paidAmount = Number(editForm.paidAmount || 0);
                      setEditForm({ ...editForm, grandTotal, dueAmount: Math.max(0, grandTotal - paidAmount) });
                    }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Paid Amount (৳)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editForm.paidAmount || 0}
                    onChange={e => {
                      const paidAmount = Number(e.target.value);
                      const grandTotal = Number(editForm.grandTotal || 0);
                      setEditForm({ ...editForm, paidAmount, dueAmount: Math.max(0, grandTotal - paidAmount) });
                    }}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Invoice Status</label>
                  <select
                    className="form-select"
                    value={editForm.status || 'COMPLETED'}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="PAID">PAID</option>
                    <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
                    <option value="DUE">DUE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
                <div>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Salesperson Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.salespersonName || ''}
                    onChange={e => setEditForm({ ...editForm, salespersonName: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '0.75rem' }}>Notes / Remarks</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={editForm.notes || ''}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div style={{
                padding: '1rem 1.5rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                background: 'rgba(0,0,0,0.2)'
              }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingSale(null)} disabled={isSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                  <Save size={15} />
                  {isSaving ? 'Saving...' : 'Save & Overwrite Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
