import React, { useState, useMemo } from 'react';
import { useERP } from '../services/erpStore';
import {
  TrendingUp, Wallet, ShoppingCart, AlertTriangle, CalendarClock,
  Boxes, Users, Wrench, ArrowUpRight, ArrowDownRight, Plus,
  DollarSign, CheckCircle2, PackageCheck, Zap, Receipt, RotateCcw,
  Building, ShieldCheck, Landmark, ArrowRight, Sparkles, ChevronRight,
  Clock, Check, AlertCircle, Eye, RefreshCw, BarChart3, Layers,
  CreditCard, Smartphone, Laptop, Tv, Shield, FileText, Activity
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface DashboardModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({ onNavigate }) => {
  const { 
    sales, emiAccounts, emiPayments, products, customers, suppliers,
    expenses, services, settings, branches, selectedBranch,
    financialAccounts, investments, purchases, currentUser, hasPermission
  } = useERP();

  const [perfTimeframe, setPerfTimeframe] = useState<'7D' | '30D' | '3M' | '6M' | '1Y'>('7D');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = todayStr.substring(0, 7);

  // Role permissions
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isManager = currentUser?.role === 'MANAGER' || isSuperAdmin;
  const isAccountant = currentUser?.role === 'ACCOUNTANT' || isSuperAdmin;
  const canViewFinance = isSuperAdmin || isManager || isAccountant;
  const canViewInvestments = isSuperAdmin || isAccountant;

  // 1. Real-Time Financial & Sales Calculations
  const todaySalesList = useMemo(() => sales.filter(s => s.date === todayStr || s.createdAt?.startsWith(todayStr)), [sales, todayStr]);
  const todaySales = useMemo(() => todaySalesList.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0), [todaySalesList]);
  const todayCollected = useMemo(() => todaySalesList.reduce((sum, s) => sum + (Number(s.paidAmount) || 0), 0), [todaySalesList]);

  // Today's EMI collections
  const todayEmiPayments = useMemo(() => emiPayments.filter(p => p.paymentDate === todayStr), [emiPayments, todayStr]);
  const todayEmiCollected = useMemo(() => todayEmiPayments.reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.penaltyPaid) || 0), 0), [todayEmiPayments]);
  const totalTodayCashInflow = todayCollected + todayEmiCollected;

  // Monthly stats
  const monthSalesList = useMemo(() => sales.filter(s => s.date?.startsWith(currentMonth) || s.createdAt?.startsWith(currentMonth)), [sales, currentMonth]);
  const monthSales = useMemo(() => monthSalesList.reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0), [monthSalesList]);
  const monthExpenses = useMemo(() => expenses.filter(e => e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0), [expenses, currentMonth]);
  
  // COGS and Profit
  const monthCOGS = useMemo(() => {
    return monthSalesList.reduce((sum, s) => {
      return sum + (s.items || []).reduce((iSum, item) => {
        const prod = products.find(p => p.id === item.productId);
        const unitCost = Number(prod?.costPrice) || (Number(item.unitPrice) * 0.78);
        return iSum + (unitCost * Number(item.quantity || 1));
      }, 0);
    }, 0);
  }, [monthSalesList, products]);

  const monthGrossProfit = monthSales - monthCOGS;
  const monthNetProfit = monthGrossProfit - monthExpenses;

  // Cash and Liquidity (Section 31)
  const totalCashBalance = useMemo(() => financialAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0), [financialAccounts]);
  const mainCashDrawer = useMemo(() => financialAccounts.find(a => a.id === 'acc-1') || financialAccounts[0], [financialAccounts]);
  const physicalCashBalance = useMemo(() => financialAccounts.filter(a => a.type === 'CASH').reduce((sum, a) => sum + (Number(a.balance) || 0), 0), [financialAccounts]);
  const digitalBankBalance = useMemo(() => financialAccounts.filter(a => a.type !== 'CASH').reduce((sum, a) => sum + (Number(a.balance) || 0), 0), [financialAccounts]);

  const todayCashInflow = useMemo(() => {
    const salesCash = todaySalesList.reduce((sum, s) => {
      if (Array.isArray(s.payments) && s.payments.length > 0) {
        return sum + s.payments.filter(p => p.method?.toLowerCase() === 'cash').reduce((pSum, p) => pSum + (Number(p.amount) || 0), 0);
      }
      return sum + ((s as any).paymentMethod?.toLowerCase() === 'cash' ? (Number(s.paidAmount) || 0) : 0);
    }, 0);
    const emiCash = todayEmiPayments.filter(p => p.paymentMethod?.toLowerCase() === 'cash').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    return salesCash + emiCash;
  }, [todaySalesList, todayEmiPayments]);

  const todayCashOutflow = useMemo(() => {
    return expenses.filter(e => e.date === todayStr && e.paymentMethod?.toLowerCase() === 'cash').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }, [expenses, todayStr]);

  const todayNetCash = todayCashInflow - todayCashOutflow;

  const paymentMethodBalances = useMemo(() => [
    { name: 'Physical Cash', amount: physicalCashBalance, color: '#10b981' },
    { name: 'bKash Wallet', amount: Number(financialAccounts.find(a => a.name.toLowerCase().includes('bkash'))?.balance || 0), color: '#e11d48' },
    { name: 'Nagad Wallet', amount: Number(financialAccounts.find(a => a.name.toLowerCase().includes('nagad'))?.balance || 0), color: '#ea580c' },
    { name: 'Bank Accounts', amount: financialAccounts.filter(a => a.type === 'BANK').reduce((sum, a) => sum + Number(a.balance || 0), 0), color: '#0284c7' }
  ], [financialAccounts, physicalCashBalance]);

  const branchCashBalances = useMemo(() => branches.map(b => {
    const bAccounts = financialAccounts.filter(a => (a as any).branchId === b.id || (!(a as any).branchId && b.id === 'branch-1'));
    const bal = bAccounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
    return { name: b.name, balance: bal };
  }), [branches, financialAccounts]);

  // Stock and Inventory
  const totalStockValue = useMemo(() => products.reduce((sum, p) => sum + (Number(p.currentStock || 0) * (Number(p.costPrice) || 0)), 0), [products]);
  const lowStockProducts = useMemo(() => products.filter(p => Number(p.currentStock || 0) <= Number(p.minStock || 5)), [products]);

  // Receivables & Dues
  const customerDirectDue = useMemo(() => customers.reduce((sum, c) => sum + (Number(c.currentBalance) > 0 ? Number(c.currentBalance) : 0), 0), [customers]);
  const activeEmiAccounts = useMemo(() => emiAccounts.filter(e => e.status === 'ACTIVE'), [emiAccounts]);
  const totalPendingEmi = useMemo(() => activeEmiAccounts.reduce((sum, e) => sum + (Number(e.remainingBalance) || 0), 0), [activeEmiAccounts]);
  const totalReceivables = customerDirectDue + totalPendingEmi;

  // EMI metrics
  const todayEmiDueAmount = useMemo(() => {
    return emiAccounts.reduce((sum, e) => {
      return sum + (e.installments || [])
        .filter(i => i.dueDate === todayStr && i.status !== 'PAID')
        .reduce((iSum, i) => iSum + (Number(i.amount) - Number(i.paidAmount || 0)), 0);
    }, 0);
  }, [emiAccounts, todayStr]);

  const overdueEmiAccounts = useMemo(() => emiAccounts.filter(e => (e.installments || []).some(i => i.status === 'OVERDUE')), [emiAccounts]);
  const monthEmiCollection = useMemo(() => emiPayments.filter(p => p.paymentDate?.startsWith(currentMonth)).reduce((sum, p) => sum + (Number(p.amount) || 0), 0), [emiPayments, currentMonth]);

  // Services
  const pendingServices = useMemo(() => services.filter(s => s.status === 'Pending' || s.status === 'In Progress'), [services]);
  const completedServices = useMemo(() => services.filter(s => s.status === 'Completed'), [services]);

  // Investments
  const totalInvestments = useMemo(() => investments.reduce((sum, i) => sum + (Number(i.amount) || 0), 0), [investments]);

  // Due sales
  const dueSalesList = useMemo(() => sales.filter(s => (Number(s.dueAmount) || 0) > 0 || ((Number(s.grandTotal) || 0) - (Number(s.paidAmount) || 0)) > 0.01), [sales]);

  // Chart Data: Dynamic range
  const performanceChartData = useMemo(() => {
    const days = perfTimeframe === '7D' ? 7 : perfTimeframe === '30D' ? 30 : perfTimeframe === '3M' ? 90 : 180;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = days <= 7 
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : days <= 30 
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'short' });

      // Aggregate sales on that day
      const daySales = sales
        .filter(s => s.date === dateKey || s.createdAt?.startsWith(dateKey))
        .reduce((sum, s) => sum + (Number(s.grandTotal) || 0), 0);

      // Aggregate expenses on that day
      const dayExpenses = expenses
        .filter(e => e.date === dateKey)
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      const dayProfit = Math.max(0, (daySales * 0.22) - dayExpenses);

      data.push({
        date: dayLabel,
        revenue: daySales,
        expenses: dayExpenses,
        profit: Math.round(dayProfit)
      });
    }
    return data;
  }, [sales, expenses, perfTimeframe]);

  // Recent timeline activities
  const recentActivities = useMemo(() => {
    const acts: Array<{ id: string; type: string; title: string; subtitle: string; time: string; amount?: number; tag: string; tagColor: string }> = [];

    // Sales activities
    sales.slice(0, 5).forEach(s => {
      acts.push({
        id: `sale-${s.id}`,
        type: 'SALE',
        title: `Sale Invoice ${s.invoiceNumber}`,
        subtitle: `${s.customerName} • ${(s.items || []).map(i => i.productName).join(', ') || 'Electronic Goods'}`,
        time: s.date || 'Recent',
        amount: Number(s.grandTotal),
        tag: 'Sale',
        tagColor: '#10b981'
      });
    });

    // EMI collections
    emiPayments.slice(0, 3).forEach(p => {
      const acct = emiAccounts.find(a => a.id === p.emiAccountId);
      acts.push({
        id: `emi-${p.id}`,
        type: 'EMI',
        title: `EMI Installment Collected`,
        subtitle: `${acct?.customerName || 'Customer'} • Account #${acct?.emiNumber || 'EMI'}`,
        time: p.paymentDate || 'Recent',
        amount: Number(p.amount),
        tag: 'EMI',
        tagColor: '#008CFF'
      });
    });

    // Expenses
    expenses.slice(0, 3).forEach(e => {
      acts.push({
        id: `exp-${e.id}`,
        type: 'EXPENSE',
        title: `Operating Expense: ${e.category}`,
        subtitle: e.description || 'Showroom operation',
        time: e.date || 'Recent',
        amount: Number(e.amount),
        tag: 'Expense',
        tagColor: '#ef4444'
      });
    });

    return acts.slice(0, 6);
  }, [sales, emiPayments, emiAccounts, expenses]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2.5rem',
      paddingBottom: '3rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
    }}>

      {/* =========================================================================
          SECTION 4: HERO SECTION (Electric Blue to Dark Navy Gradient)
          ========================================================================= */}
      <section style={{
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #002B5B 0%, #0052A3 50%, #008CFF 100%)',
        color: '#ffffff',
        padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2.5rem)',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 140, 255, 0.35)',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        {/* Decorative Radial Grid Glow */}
        <div style={{
          position: 'absolute',
          top: '-40%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem'
        }}>
          {/* Top Brand Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            width: 'fit-content'
          }}>
            <Sparkles size={14} color="#38bdf8" />
            <span>Need Electro Enterprise ERP • {selectedBranch.name}</span>
          </div>

          {/* Hero Main Headline */}
          <div style={{ maxWidth: '820px' }}>
            <h1 style={{
              fontSize: 'clamp(1.5rem, 5vw, 3rem)',
              fontWeight: 900,
              lineHeight: 1.18,
              letterSpacing: '-0.025em',
              margin: '0 0 0.85rem 0',
              color: '#ffffff'
            }}>
              Welcome to <span style={{ color: '#67e8f9' }}>NEED ELECTRO</span> ERP
            </h1>
            <p style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              fontWeight: 400
            }}>
              <strong>Powering smarter business management.</strong> Monitor your sales, revenue, inventory, services, EMI, customers, finance and business performance from one intelligent platform.
            </p>
          </div>

          {/* Today's Business Dynamic Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
            gap: '1.25rem',
            background: 'rgba(7, 18, 38, 0.45)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '18px',
            padding: '1.25rem clamp(0.85rem, 2.5vw, 1.75rem)'
          }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Today's Business Sales
              </span>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>
                ৳{todaySales.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#86efac', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Paid: ৳{todayCollected.toLocaleString()}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Today's Orders & Invoices
              </span>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem' }}>
                {todaySalesList.length} <span style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Invoices</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                Commercial retail & showroom
              </div>
            </div>

            <div 
              onClick={() => onNavigate('cash_management')}
              style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
              title="Open Cash Management System"
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Cash Position (Available)</span>
                <span style={{ fontSize: '0.7rem', color: '#fef08a' }}>Ledger →</span>
              </span>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#fef08a', marginTop: '0.2rem' }}>
                ৳{totalCashBalance.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                ৳{physicalCashBalance.toLocaleString()} drawer • ৳{digitalBankBalance.toLocaleString()} bank/digital
              </div>
            </div>

            <div
              style={{
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
              onClick={() => onNavigate('website_orders')}
              title="Open Online Website Orders & Store Management"
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  <span>Online Storefront</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: '#67e8f9' }}>Orders →</span>
              </span>
              <div style={{ fontSize: '1.9rem', fontWeight: 900, color: '#ffffff', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>Store Live</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color: '#67e8f9', textDecoration: 'underline', fontWeight: 600 }}
                >
                  View Storefront ↗
                </a>
                <span>•</span>
                <span onClick={(e) => { e.stopPropagation(); onNavigate('banners'); }} style={{ color: '#fef08a', cursor: 'pointer', fontWeight: 600 }}>
                  Banners
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: HERO QUICK ACTIONS
          ========================================================================= */}
      <section style={{ marginTop: '-0.75rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
          flexWrap: 'wrap'
        }}>
          {(!hasPermission || hasPermission('pos')) && (
            <button
              onClick={() => onNavigate('pos')}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                background: 'linear-gradient(135deg, #008CFF 0%, #0066CC 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.4rem',
                fontSize: '0.92rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0, 140, 255, 0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              <ShoppingCart size={16} />
              <span>Create Sale</span>
            </button>
          )}

          {(!hasPermission || hasPermission('customers')) && (
            <button
              onClick={() => onNavigate('customers')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                borderRadius: '12px',
                padding: '0.75rem 1.3rem',
                fontSize: '0.92rem',
                fontWeight: 600
              }}
            >
              <Users size={16} color="var(--brand-primary)" />
              <span>Add Customer</span>
            </button>
          )}

          {(!hasPermission || hasPermission('products')) && (
            <button
              onClick={() => onNavigate('products')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                borderRadius: '12px',
                padding: '0.75rem 1.3rem',
                fontSize: '0.92rem',
                fontWeight: 600
              }}
            >
              <Boxes size={16} color="#10b981" />
              <span>Add Product</span>
            </button>
          )}

          {(!hasPermission || hasPermission('emi')) && (
            <button
              onClick={() => onNavigate('emi')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                borderRadius: '12px',
                padding: '0.75rem 1.3rem',
                fontSize: '0.92rem',
                fontWeight: 600
              }}
            >
              <CalendarClock size={16} color="#f59e0b" />
              <span>Collect EMI</span>
            </button>
          )}

          {(!hasPermission || hasPermission('expenses')) && (
            <button
              onClick={() => onNavigate('expenses')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                borderRadius: '12px',
                padding: '0.75rem 1.3rem',
                fontSize: '0.92rem',
                fontWeight: 600
              }}
            >
              <Receipt size={16} color="#ef4444" />
              <span>Add Expense</span>
            </button>
          )}

          {(!hasPermission || hasPermission('service')) && (
            <button
              onClick={() => onNavigate('service')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                borderRadius: '12px',
                padding: '0.75rem 1.3rem',
                fontSize: '0.92rem',
                fontWeight: 600
              }}
            >
              <Wrench size={16} color="#8b5cf6" />
              <span>New Service</span>
            </button>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 16: BUSINESS ALERTS ("Attention Required")
          ========================================================================= */}
      {(overdueEmiAccounts.length > 0 || lowStockProducts.length > 0 || dueSalesList.length > 0 || pendingServices.length > 0) && (
        <section style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '1.5rem 1.75rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Attention Required</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time operational alerts
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            {overdueEmiAccounts.length > 0 && (
              <div 
                onClick={() => onNavigate('emi')}
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.6rem', borderRadius: '10px' }}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {overdueEmiAccounts.length} Overdue EMI Accounts
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#ef4444', fontWeight: 600 }}>
                      Requires customer follow-up
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#ef4444" />
              </div>
            )}

            {lowStockProducts.length > 0 && (
              <div 
                onClick={() => onNavigate('products')}
                style={{
                  background: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '0.6rem', borderRadius: '10px' }}>
                    <Boxes size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {lowStockProducts.length} Products Low in Stock
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
                      Re-order threshold reached
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#f59e0b" />
              </div>
            )}

            {dueSalesList.length > 0 && (
              <div 
                onClick={() => onNavigate('sales')}
                style={{
                  background: 'rgba(0, 140, 255, 0.08)',
                  border: '1px solid rgba(0, 140, 255, 0.25)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ background: 'rgba(0, 140, 255, 0.15)', color: '#008CFF', padding: '0.6rem', borderRadius: '10px' }}>
                    <Receipt size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {dueSalesList.length} Customer Invoices with Due
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#008CFF', fontWeight: 600 }}>
                      ৳{customerDirectDue.toLocaleString()} uncollected
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#008CFF" />
              </div>
            )}

            {pendingServices.length > 0 && (
              <div 
                onClick={() => onNavigate('service')}
                style={{
                  background: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.25)',
                  borderRadius: '14px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', padding: '0.6rem', borderRadius: '10px' }}>
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                      {pendingServices.length} Pending Service Jobs
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#8b5cf6', fontWeight: 600 }}>
                      Technician workshop queue
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} color="#8b5cf6" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 6: BUSINESS AT A GLANCE ("Everything Your Business Needs, In One Place")
          ========================================================================= */}
      <section>
        <div style={{ marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Enterprise Metrics
          </span>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0.2rem 0 0.4rem 0', color: 'var(--text-primary)' }}>
            Everything Your Business Needs, In One Place
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
            Real-time status across commercial sales, inventory, customers, technical service, and financing.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Card 1: Sales */}
          <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Commercial Sales</span>
                <div style={{ background: 'rgba(0, 140, 255, 0.12)', color: '#008CFF', padding: '0.5rem', borderRadius: '10px' }}>
                  <ShoppingCart size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                ৳{monthSales.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                This Month ({monthSalesList.length} invoices) • Today: ৳{todaySales.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onNavigate('sales')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: 'var(--brand-primary)', fontWeight: 700 }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Products & Inventory */}
          <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Products & Stock</span>
                <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.5rem', borderRadius: '10px' }}>
                  <Boxes size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {products.length} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Items</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: lowStockProducts.length > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '0.35rem' }}>
                {lowStockProducts.length > 0 ? `${lowStockProducts.length} items low stock` : 'Healthy stock levels'} • ৳{totalStockValue.toLocaleString()} val
              </div>
            </div>
            <button
              onClick={() => onNavigate('products')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 3: Customers */}
          <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Customers & CRM</span>
                <div style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', padding: '0.5rem', borderRadius: '10px' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {customers.length} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Clients</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: customerDirectDue > 0 ? '#f59e0b' : 'var(--text-muted)', marginTop: '0.35rem' }}>
                Receivables: ৳{customerDirectDue.toLocaleString()} uncollected
              </div>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#8b5cf6', fontWeight: 700 }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 4: Services */}
          <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Workshop Services</span>
                <div style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', padding: '0.5rem', borderRadius: '10px' }}>
                  <Wrench size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {pendingServices.length} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {completedServices.length} completed • Electrical & Laptop repairs
              </div>
            </div>
            <button
              onClick={() => onNavigate('service')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#f59e0b', fontWeight: 700 }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 5: EMI */}
          <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Laptop EMI</span>
                <div style={{ background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', padding: '0.5rem', borderRadius: '10px' }}>
                  <CalendarClock size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {activeEmiAccounts.length} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>Contracts</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Outstanding: ৳{totalPendingEmi.toLocaleString()} • Month coll: ৳{monthEmiCollection.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => onNavigate('emi')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#ec4899', fontWeight: 700 }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 6: Finance */}
          {canViewFinance && (
            <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Monthly Net Profit</span>
                  <div style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', padding: '0.5rem', borderRadius: '10px' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: monthNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
                  ৳{monthNetProfit.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Gross: ৳{monthGrossProfit.toLocaleString()} • Exp: ৳{monthExpenses.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => onNavigate('reports')}
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#10b981', fontWeight: 700 }}
              >
                <span>View Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Card 7: Cash Available */}
          <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Current Cash</span>
                <div style={{ background: 'rgba(0, 140, 255, 0.12)', color: '#008CFF', padding: '0.5rem', borderRadius: '10px' }}>
                  <Wallet size={18} />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#008CFF' }}>
                ৳{totalCashBalance.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Across Cash & Bank Accounts
              </div>
            </div>
            <button
              onClick={() => onNavigate('cash_management')}
              className="btn btn-ghost btn-sm"
              style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#008CFF', fontWeight: 700 }}
            >
              <span>View Details</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 8: Investment */}
          {canViewInvestments && (
            <div className="erp-card" style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Capital Investments</span>
                  <div style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', padding: '0.5rem', borderRadius: '10px' }}>
                    <Landmark size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  ৳{totalInvestments.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  {investments.length} Active Investors recorded
                </div>
              </div>
              <button
                onClick={() => onNavigate('accounting')}
                className="btn btn-ghost btn-sm"
                style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'space-between', color: '#a855f7', fontWeight: 700 }}
              >
                <span>View Details</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6B: CASH & LIQUIDITY COMMAND CENTER (SECTION 31 INTEGRATION)
          ========================================================================= */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(9, 17, 34, 0.9) 0%, rgba(13, 27, 42, 0.95) 100%)',
        borderRadius: '20px',
        padding: '1.75rem 2rem',
        border: '1px solid rgba(0, 140, 255, 0.25)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(0, 140, 255, 0.2), rgba(16, 185, 129, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#008CFF',
              border: '1px solid rgba(0, 140, 255, 0.3)'
            }}>
              <Wallet size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0, color: '#f8fafc' }}>
                Cash Management & Liquidity Position
              </h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Real-time transactional cash flow tracking. Click any figure to inspect underlying ledger records.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('cash_management')}
            className="btn"
            style={{
              background: 'linear-gradient(135deg, #008CFF 0%, #0066CC 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.55rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <span>Open Cash Control Center</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* 5-Card Cash Performance Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          {/* Physical Cash */}
          <div 
            onClick={() => onNavigate('cash_management')}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.15rem',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Physical Cash in Hand
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#10b981', marginTop: '0.2rem' }}>
              ৳{physicalCashBalance.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Showroom counter vault
            </span>
          </div>

          {/* Today's Cash In */}
          <div 
            onClick={() => onNavigate('cash_management')}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.15rem',
              border: '1px solid rgba(0, 140, 255, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008CFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Cash Inflow
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#008CFF', marginTop: '0.2rem' }}>
              +৳{todayCashInflow.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Sales & dues collected today
            </span>
          </div>

          {/* Today's Cash Out */}
          <div 
            onClick={() => onNavigate('cash_management')}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.15rem',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Cash Outflow
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#ef4444', marginTop: '0.2rem' }}>
              -৳{todayCashOutflow.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Cash expenses & payouts
            </span>
          </div>

          {/* Today's Net Cash Movement */}
          <div 
            onClick={() => onNavigate('cash_management')}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.15rem',
              border: `1px solid ${todayNetCash >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: todayNetCash >= 0 ? '#10b981' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Net Movement
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: todayNetCash >= 0 ? '#10b981' : '#ef4444', marginTop: '0.2rem' }}>
              {todayNetCash >= 0 ? '+' : ''}৳{todayNetCash.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Net cash change today
            </span>
          </div>

          {/* Total Liquid Funds */}
          <div 
            onClick={() => onNavigate('cash_management')}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '14px',
              padding: '1.15rem',
              border: '1px solid rgba(254, 240, 138, 0.3)',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
          >
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fef08a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Business Liquidity
            </span>
            <div style={{ fontSize: '1.65rem', fontWeight: 900, color: '#fef08a', marginTop: '0.2rem' }}>
              ৳{totalCashBalance.toLocaleString()}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Physical cash + bank balances
            </span>
          </div>
        </div>

        {/* Breakdown Dual Cards: Payment Methods + Branch Cash */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Payment Methods */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                Cash by Payment Method
              </span>
              <button 
                onClick={() => onNavigate('cash_management')} 
                style={{ background: 'transparent', border: 'none', color: '#008CFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                View Ledger →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {paymentMethodBalances.map((m, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onNavigate('cash_management')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {m.name}
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: m.color }}>
                    ৳{m.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Branch Cash */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '14px',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc' }}>
                Cash by Branch
              </span>
              <button 
                onClick={() => onNavigate('cash_management')} 
                style={{ background: 'transparent', border: 'none', color: '#008CFF', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Inspect Branches →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {branchCashBalances.map((b, idx) => (
                <div 
                  key={idx} 
                  onClick={() => onNavigate('cash_management')}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {b.name}
                  </span>
                  <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#10b981' }}>
                    ৳{b.balance.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FEATURED BUSINESS SECTION ("One Platform. Complete Business Control.")
          ========================================================================= */}
      <section style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Integrated Architecture
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.3rem 0 0.6rem 0', color: 'var(--text-primary)' }}>
            One Platform. Complete Business Control.
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>
            Every departmental workflow connects seamlessly into unified double-entry books and audited inventory.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Module 1: Sales & POS */}
          <div 
            onClick={() => onNavigate('pos')}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #008CFF 0%, #0055b3 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <ShoppingCart size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Sales & POS
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              High-speed barcode checkout, A4 tax invoice & 80mm POS thermal printing, cash/bKash/bank split payments, and customer due management.
            </p>
            <span style={{ color: 'var(--brand-primary)', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Launch POS Terminal <ArrowRight size={13} />
            </span>
          </div>

          {/* Module 2: Inventory & Products */}
          <div 
            onClick={() => onNavigate('inventory')}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Boxes size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Inventory & Products
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Serialized IMEI and barcode stock tracking, automated re-order alerts, warranty management, and supplier purchasing ledger.
            </p>
            <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Inspect Inventory <ArrowRight size={13} />
            </span>
          </div>

          {/* Module 3: Laptop EMI */}
          <div 
            onClick={() => onNavigate('emi')}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <CalendarClock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Laptop EMI
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Automated installment payment schedules, penalty calculations, guarantor records, SMS alerts, and legal contract generation.
            </p>
            <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Manage EMI Contracts <ArrowRight size={13} />
            </span>
          </div>

          {/* Module 4: Electrical Services */}
          <div 
            onClick={() => onNavigate('service')}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Wrench size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Electrical Services
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Commercial electrical maintenance, CCTV installation, smart home automation, technician dispatch, and service job billing.
            </p>
            <span style={{ color: '#8b5cf6', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              View Service Queue <ArrowRight size={13} />
            </span>
          </div>

          {/* Module 5: Accounting */}
          <div 
            onClick={() => onNavigate('accounting')}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Receipt size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Accounting & Cash
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Double-entry ledgers, expense categorization, financial accounts liquidity, capital investments, and audited profit & loss.
            </p>
            <span style={{ color: '#ec4899', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Accounting Overview <ArrowRight size={13} />
            </span>
          </div>

          {/* Module 6: Customer CRM */}
          <div 
            onClick={() => onNavigate('customers')}
            style={{
              padding: '1.75rem',
              borderRadius: '18px',
              background: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>
              Customer Management
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Corporate & retail customer profiles, credit limit enforcement, ledger statement exports, and payment collection receipts.
            </p>
            <span style={{ color: '#06b6d4', fontSize: '0.85rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Client Directory <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: LIVE BUSINESS STATISTICS & SECTION 10: CURRENT CASH
          ========================================================================= */}
      <section>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          {/* Highlight Cash Card */}
          <div style={{
            gridColumn: 'span 2',
            background: 'linear-gradient(135deg, #001f44 0%, #003366 100%)',
            borderRadius: '20px',
            padding: '2rem',
            color: '#ffffff',
            border: '1px solid rgba(0, 140, 255, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 43, 91, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Your Business, At a Glance • Cash Balance
                </span>
                <span className="badge badge-success" style={{ background: '#10b981', color: '#ffffff', fontWeight: 700 }}>
                  Audited Liquidity
                </span>
              </div>
              <div style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 900, color: '#fef08a' }}>
                ৳{totalCashBalance.toLocaleString()}
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: '0.5rem 0 1.5rem 0' }}>
                Total liquid capital available in Moulvibazar showroom cash and connected official bank accounts.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
              paddingTop: '1.25rem',
              marginBottom: '1.25rem'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Cash in Hand</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  ৳{(Number(mainCashDrawer?.balance) || 0).toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Today's Total Inflow</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#86efac', marginTop: '2px' }}>
                  +৳{totalTodayCashInflow.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Today's Expenses</span>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fca5a5', marginTop: '2px' }}>
                  -৳{expenses.filter(e => e.date === todayStr).reduce((sum, e) => sum + Number(e.amount), 0).toLocaleString()}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => onNavigate('cash_management')}
                className="btn"
                style={{
                  background: 'linear-gradient(135deg, #008CFF 0%, #0066CC 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  padding: '0.65rem 1.4rem'
                }}
              >
                View Cash Management →
              </button>
            </div>
          </div>

          {/* Monthly Performance Live Stats Card */}
          <div className="erp-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Monthly Financial Summary
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly Revenue</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>৳{monthSales.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Monthly Expenses</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ef4444' }}>৳{monthExpenses.toLocaleString()}</span>
                </div>
                {canViewFinance && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Net Profit</span>
                    <span style={{ fontWeight: 900, fontSize: '1.25rem', color: monthNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
                      ৳{monthNetProfit.toLocaleString()}
                    </span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Active Customers</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{customers.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Catalog Products</span>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{products.length}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('reports')}
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '1.25rem', width: '100%' }}
            >
              Comprehensive Reports
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 9: REVENUE PERFORMANCE ANALYTICS CHART
          ========================================================================= */}
      <section className="erp-card" style={{ padding: '2rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.3rem 0', color: 'var(--text-primary)' }}>
              Business Performance
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Track how NEED ELECTRO is growing across revenue, expenses, and operating margins.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--bg-card-muted)', padding: '0.25rem', borderRadius: '10px' }}>
            {(['7D', '30D', '3M', '6M', '1Y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setPerfTimeframe(tf)}
                style={{
                  background: perfTimeframe === tf ? 'var(--brand-primary)' : 'transparent',
                  color: perfTimeframe === tf ? '#ffffff' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#008CFF" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#008CFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} tickFormatter={v => `৳${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-card)', 
                  borderColor: 'var(--border-color)', 
                  borderRadius: '12px',
                  boxShadow: 'var(--shadow-lg)'
                }}
                formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
              />
              <Legend />
              <Area type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#008CFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="profit" name="Net Margin" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={1.5} fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* =========================================================================
          SECTION 11: PRODUCT & INVENTORY SHOWCASE
          ========================================================================= */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Stock Catalog
            </span>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0.2rem 0 0.2rem 0', color: 'var(--text-primary)' }}>
              Product & Inventory
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
              Live showcase of electronics hardware, laptops, and accessories.
            </p>
          </div>

          <button
            onClick={() => onNavigate('products')}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <span>View All Products</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          {products.slice(0, 4).map(prod => (
            <div 
              key={prod.id} 
              className="erp-card"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease',
                position: 'relative'
              }}
            >
              <div>
                <div style={{
                  height: '130px',
                  borderRadius: '12px',
                  background: 'var(--bg-card-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  overflow: 'hidden'
                }}>
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <Laptop size={44} color="var(--brand-primary)" style={{ opacity: 0.8 }} />
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {prod.name}
                  </h4>
                  <span className={`badge ${prod.currentStock > prod.minStock ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                    {prod.currentStock > 0 ? `${prod.currentStock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  SKU: {prod.sku || 'NE-ITEM'} • {prod.category}
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Selling Price</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
                    ৳{(Number(prod.retailPrice) || 0).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('pos')}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Sell
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 12: LAPTOP EMI & SECTION 14: SERVICES (Side-by-Side Grid)
          ========================================================================= */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '1.5rem'
      }}>
        {/* EMI Section */}
        <div className="erp-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ec4899', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Financing Journey
              </span>
              <span className="badge badge-warning" style={{ fontWeight: 700 }}>
                {activeEmiAccounts.length} Active Plans
              </span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 0.3rem 0', color: 'var(--text-primary)' }}>
              Flexible Laptop EMI
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1.5rem 0' }}>
              Track every customer installment journey from sale to final agreement release.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '1rem',
              background: 'var(--bg-card-muted)',
              padding: '1.25rem',
              borderRadius: '16px'
            }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Due Today</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>
                  ৳{todayEmiDueAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overdue Accounts</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginTop: '2px' }}>
                  {overdueEmiAccounts.length}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Collected This Month</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  ৳{monthEmiCollection.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Receivable</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                  ৳{totalPendingEmi.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('emi')}
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
          >
            Manage EMI Contracts →
          </button>
        </div>

        {/* Services Section */}
        <div className="erp-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Technical Solutions
              </span>
              <span className="badge badge-neutral" style={{ fontWeight: 700 }}>
                {services.length} Total Jobs
              </span>
            </div>
            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, margin: '0 0 0.3rem 0', color: 'var(--text-primary)' }}>
              Electrical & Technical Services
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '0 0 1.25rem 0' }}>
              Installation, electrical maintenance, CCTV, smart home, and computer repair tickets.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
              {['Electrical Maintenance', 'CCTV Installation', 'Smart Home', 'Laptop Support', 'Troubleshooting'].map(cat => (
                <span 
                  key={cat}
                  style={{
                    background: 'var(--bg-card-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '0.3rem 0.65rem',
                    borderRadius: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)'
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '0.5rem',
              textAlign: 'center'
            }}>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem 0.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#3b82f6' }}>
                  {services.filter(s => s.status === 'Pending').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending</div>
              </div>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem 0.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b' }}>
                  {services.filter(s => s.status === 'In Progress').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>In Progress</div>
              </div>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem 0.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#10b981' }}>
                  {services.filter(s => s.status === 'Completed').length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Completed</div>
              </div>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem 0.5rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                  {services.length}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('service')}
            className="btn btn-secondary"
            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
          >
            Manage Services →
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 13: OUR CUSTOMERS & SECTION 15: RECENT REAL ACTIVITIES
          ========================================================================= */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
        gap: '1.5rem'
      }}>
        {/* Customer Directory Glance */}
        <div className="erp-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                Our Customers
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {customers.length} registered business & retail client profiles.
              </p>
            </div>
            <button 
              onClick={() => onNavigate('customers')}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--brand-primary)', fontWeight: 700 }}
            >
              View All →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {customers.slice(0, 4).map(c => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {c.phone} • {c.address || 'Retail Client'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    fontWeight: 700, 
                    color: Number(c.currentBalance) > 0 ? '#f59e0b' : '#10b981' 
                  }}>
                    {Number(c.currentBalance) > 0 ? `৳${Number(c.currentBalance).toLocaleString()} Due` : 'Clear Balance'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's Happening Now (Timeline) */}
        <div className="erp-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '0 0 0.25rem 0', color: 'var(--text-primary)' }}>
                What's Happening Now
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                Real-time operational activity feed.
              </p>
            </div>
            <Activity size={18} color="var(--brand-primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {recentActivities.map(act => (
              <div 
                key={act.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.95rem',
                  borderRadius: '12px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span 
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.5rem',
                      borderRadius: '6px',
                      background: `${act.tagColor}15`,
                      color: act.tagColor,
                      border: `1px solid ${act.tagColor}30`
                    }}
                  >
                    {act.tag}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {act.subtitle}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  {act.amount !== undefined && (
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ৳{act.amount.toLocaleString()}
                    </div>
                  )}
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {act.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 17: INVESTMENT OVERVIEW (Role-Restricted: Super Admin / Accountant)
          ========================================================================= */}
      {canViewInvestments && (
        <section style={{
          background: 'linear-gradient(135deg, rgba(0, 43, 91, 0.4) 0%, rgba(0, 140, 255, 0.15) 100%)',
          border: '1px solid rgba(0, 140, 255, 0.25)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <ShieldCheck size={15} /> Executive Clearance Only
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, margin: '0.2rem 0 0.3rem 0', color: 'var(--text-primary)' }}>
                Investment & Equity Overview
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
                Capital injections, shareholder allocations, and corporate dividend pool.
              </p>
            </div>

            <button
              onClick={() => onNavigate('accounting')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Manage Investments</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem'
          }}>
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Investment</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                ৳{totalInvestments.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Equity & seed capital</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Investors</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '0.35rem' }}>
                {investments.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered stakeholders</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Net Profit</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: monthNetProfit >= 0 ? '#10b981' : '#ef4444', marginTop: '0.35rem' }}>
                ৳{monthNetProfit.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Post-COGS & expense pool</span>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Audited Liquid Cash</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#008CFF', marginTop: '0.35rem' }}>
                ৳{totalCashBalance.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Business cash reserves</span>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 18: CALL TO ACTION (CTA SECTION)
          ========================================================================= */}
      <section style={{
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #002B5B 0%, #008CFF 100%)',
        color: '#ffffff',
        padding: '3rem 2.5rem',
        textAlign: 'center',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -15px rgba(0, 140, 255, 0.35)'
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.5rem)', fontWeight: 900, margin: '0 0 1rem 0', color: '#ffffff' }}>
            Everything You Need to Run NEED ELECTRO
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'rgba(255, 255, 255, 0.9)', margin: '0 0 2rem 0', lineHeight: 1.6 }}>
            <strong>Sales. Products. Services. EMI. Finance. Customers.</strong> All connected in one intelligent system built for commercial electronics retail and workshops.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('pos')}
              className="btn"
              style={{
                background: '#ffffff',
                color: '#002B5B',
                border: 'none',
                borderRadius: '12px',
                padding: '0.85rem 1.8rem',
                fontSize: '0.98rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)'
              }}
            >
              Open POS Billing Terminal
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="btn"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '12px',
                padding: '0.85rem 1.8rem',
                fontSize: '0.98rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View Business Reports
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 19: CORPORATE FOOTER
          ========================================================================= */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '2rem',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
            NEED ELECTRO
          </div>
          <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
            Trusted Electrical & Technological Solutions
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span>ERP v1.0 Production</span>
          <span>•</span>
          <span>Branch: {selectedBranch.name}</span>
          <span>•</span>
          <span>© {new Date().getFullYear()} All Rights Reserved</span>
        </div>
      </footer>

    </div>
  );
};
