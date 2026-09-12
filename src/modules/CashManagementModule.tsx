import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Landmark, ArrowUpRight, ArrowDownRight, Wallet, DollarSign,
  TrendingUp, Calendar, Filter, Plus, RefreshCw, Search,
  Download, Printer, AlertTriangle, ShieldCheck, CheckCircle2,
  FileSpreadsheet, ArrowLeftRight, HelpCircle, Layers, X, CreditCard,
  Briefcase, UserPlus
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { CashSummary, CashMovementRecord, PaymentMethod, CashAdjustmentReason } from '../types';
import { api } from '../services/api';

interface CashManagementModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const CashManagementModule: React.FC<CashManagementModuleProps> = ({ onNavigate }) => {
  const { 
    currentUser, financialAccounts, customers, recordCashAdjustment,
    collectCustomerDue, addToast, settings, selectedBranch, recordInvestment
  } = useERP();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  // Filter States
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'prev_month' | 'custom'>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<CashSummary | null>(null);

  // Modals
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  // Investment Form State
  const [invAmount, setInvAmount] = useState<number>(50000);
  const [invType, setInvType] = useState<string>('CAPITAL_INVESTMENT');
  const [invAccountId, setInvAccountId] = useState(financialAccounts[0]?.id || 'acc-1');
  const [invPaymentMethod, setInvPaymentMethod] = useState<PaymentMethod>('Cash');
  const [invDate, setInvDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [invReference, setInvReference] = useState('');
  const [invNotes, setInvNotes] = useState('');

  // Investor Info
  const [investorName, setInvestorName] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorNid, setInvestorNid] = useState('');
  const [investorAddress, setInvestorAddress] = useState('');
  const [sharePercentage, setSharePercentage] = useState<string>('');
  const [isSubmittingInv, setIsSubmittingInv] = useState(false);

  // Adjustment Form State
  const [adjAmount, setAdjAmount] = useState<number>(1000);
  const [adjType, setAdjType] = useState<'INFLOW' | 'OUTFLOW'>('INFLOW');
  const [adjReason, setAdjReason] = useState<CashAdjustmentReason>('CASH_EXCESS');
  const [adjAccountId, setAdjAccountId] = useState(financialAccounts[0]?.id || 'acc-1');
  const [adjPaymentMethod, setAdjPaymentMethod] = useState<string>('Cash');
  const [adjReference, setAdjReference] = useState('');
  const [adjNotes, setAdjNotes] = useState('');
  const [isSubmittingAdj, setIsSubmittingAdj] = useState(false);

  // Quick Due Collection Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [duePayAmount, setDuePayAmount] = useState<number>(0);
  const [duePaymentMethod, setDuePaymentMethod] = useState<PaymentMethod>('Cash');
  const [dueAccountId, setDueAccountId] = useState<string>(financialAccounts[0]?.id || 'acc-1');
  const [dueReference, setDueReference] = useState('');
  const [dueNotes, setDueNotes] = useState('');
  const [isSubmittingDue, setIsSubmittingDue] = useState(false);

  // Fetch Live Cash Position & Ledger from Backend Engine
  const fetchCashData = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string> = {
        range: dateRange,
      };
      if (dateRange === 'custom') {
        if (customStartDate) params.startDate = customStartDate;
        if (customEndDate) params.endDate = customEndDate;
      }
      if (methodFilter !== 'ALL') {
        params.paymentMethod = methodFilter;
      }

      const res = await api.cashManagement.getCashSummary(params);
      if (res && res.success) {
        setSummaryData(res.data);
      } else {
        addToast('error', 'Error Loading Cash Data', (res as any)?.error || 'Failed to fetch cash position.');
      }
    } catch (err: any) {
      console.error('Failed to load cash position:', err);
      addToast('error', 'Network Error', err.message || 'Unable to sync with cash management engine.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashData();
  }, [dateRange, customStartDate, customEndDate, methodFilter]);

  // Set default customer when due modal opens
  const customersWithDue = useMemo(() => {
    return customers.filter(c => Number(c.currentBalance) > 0);
  }, [customers]);

  useEffect(() => {
    if (customersWithDue.length > 0 && !selectedCustomerId) {
      setSelectedCustomerId(customersWithDue[0].id);
      setDuePayAmount(Number(customersWithDue[0].currentBalance));
    }
  }, [customersWithDue, selectedCustomerId]);

  const handleCustomerSelectChange = (cId: string) => {
    setSelectedCustomerId(cId);
    const cust = customers.find(c => c.id === cId);
    if (cust) {
      setDuePayAmount(Number(cust.currentBalance));
    }
  };

  // Filter Ledger Records
  const filteredLedger = useMemo(() => {
    if (!summaryData?.movements) return [];
    return summaryData.movements.filter(item => {
      const matchesSearch = 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.user.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = 
        typeFilter === 'ALL' || item.direction === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [summaryData?.movements, searchQuery, typeFilter]);

  // Handle Adjustment Submit
  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Only Super Admin or Admin can perform authorized cash adjustments.');
      return;
    }
    if (adjAmount <= 0) {
      alert('Adjustment amount must be positive.');
      return;
    }

    setIsSubmittingAdj(true);
    try {
      const res = await recordCashAdjustment({
        amount: adjAmount,
        type: adjType,
        reason: adjReason,
        accountId: adjAccountId,
        paymentMethod: adjPaymentMethod,
        reference: adjReference || undefined,
        notes: adjNotes || undefined,
      });

      if (res.success) {
        setShowAdjustmentModal(false);
        setAdjAmount(1000);
        setAdjReference('');
        setAdjNotes('');
        fetchCashData();
      }
    } finally {
      setIsSubmittingAdj(false);
    }
  };

  // Handle Due Collection Submit
  const handleDueCollectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Please select a customer with an outstanding due balance.');
      return;
    }
    if (duePayAmount <= 0) {
      alert('Payment amount must be greater than 0.');
      return;
    }

    setIsSubmittingDue(true);
    try {
      const res = await collectCustomerDue(
        selectedCustomerId,
        duePayAmount,
        duePaymentMethod,
        dueAccountId,
        dueReference || undefined,
        dueNotes || undefined
      );

      if (res.success) {
        setShowDueModal(false);
        setDueReference('');
        setDueNotes('');
        fetchCashData();
      }
    } finally {
      setIsSubmittingDue(false);
    }
  };

  // Handle Investment Submit
  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Only Super Admin or Admin can record capital investments.');
      return;
    }
    if (!investorName.trim()) {
      alert('Investor full name is required.');
      return;
    }
    if (invAmount <= 0) {
      alert('Investment amount must be greater than 0.');
      return;
    }
    if (!invAccountId) {
      alert('Please select a target deposit account.');
      return;
    }

    setIsSubmittingInv(true);
    try {
      const res = await recordInvestment({
        investorName: investorName.trim(),
        amount: invAmount,
        date: invDate,
        investmentType: invType as any,
        depositAccountId: invAccountId,
        paymentMethod: invPaymentMethod,
        reference: invReference.trim() || undefined,
        status: 'ACTIVE',
        notes: invNotes.trim() || undefined,
        investorPhone: investorPhone.trim() || undefined,
        investorEmail: investorEmail.trim() || undefined,
        investorNid: investorNid.trim() || undefined,
        investorAddress: investorAddress.trim() || undefined,
        sharePercentage: sharePercentage ? Number(sharePercentage) : undefined,
      });

      if (res.success) {
        setShowInvestmentModal(false);
        setInvestorName('');
        setInvestorPhone('');
        setInvestorEmail('');
        setInvestorNid('');
        setInvestorAddress('');
        setSharePercentage('');
        setInvAmount(50000);
        setInvReference('');
        setInvNotes('');
        await fetchCashData();
      }
    } catch (err: any) {
      console.error('Investment submit error:', err);
    } finally {
      setIsSubmittingInv(false);
    }
  };

  // CSV Export for Ledger
  const handleExportCSV = () => {
    if (!filteredLedger.length) {
      alert('No transaction records to export.');
      return;
    }

    const headers = ['Date', 'Transaction ID', 'Type', 'Description', 'Reference', 'Payment Method', 'Cash In (BDT)', 'Cash Out (BDT)', 'Running Balance (BDT)', 'Staff / User', 'Branch'];
    const rows = filteredLedger.map(m => [
      new Date(m.date).toLocaleString('en-GB'),
      m.transactionId,
      m.typeLabel,
      `"${m.description.replace(/"/g, '""')}"`,
      `"${m.reference.replace(/"/g, '""')}"`,
      m.paymentMethod,
      m.cashIn,
      m.cashOut,
      m.runningBalance,
      m.user,
      m.branch
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEED_ELECTRO_CASH_LEDGER_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="module-container">
      {/* -------------------------------------------------------------
          MODULE HEADER & QUICK ACTIONS
          ------------------------------------------------------------- */}
      <div className="module-header" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(0, 140, 255, 0.2), rgba(16, 185, 129, 0.2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#008CFF',
              border: '1px solid rgba(0, 140, 255, 0.3)'
            }}>
              <Landmark size={20} />
            </div>
            <div>
              <h1 className="module-title" style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800 }}>
                Cash Balance & Position Management
              </h1>
              <p className="module-subtitle" style={{ margin: 0, fontSize: '0.85rem' }}>
                Real-time transactional liquidity tracking derived directly from ERP business movements
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-outline"
            onClick={fetchCashData}
            title="Refresh Live Database Cash"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /> Refresh
          </button>

          <button 
            className="btn btn-outline"
            onClick={handleExportCSV}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} /> Export Ledger CSV
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => setShowDueModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#008CFF', color: '#008CFF' }}
          >
            <Plus size={15} /> Collect Customer Due
          </button>

          {isSuperAdmin && (
            <>
              <button 
                className="btn btn-primary"
                onClick={() => setShowAdjustmentModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeftRight size={15} /> Cash Adjustment
              </button>

              <button 
                className="btn"
                onClick={() => setShowInvestmentModal(true)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Add Investment
              </button>
            </>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          1. EXECUTIVE HERO: CURRENT CASH BALANCE (HIGHLY VISIBLE)
          ------------------------------------------------------------- */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(9, 17, 34, 0.95) 0%, rgba(13, 27, 42, 0.95) 100%)',
        border: '1px solid rgba(0, 140, 255, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '240px',
          height: '240px',
          background: 'radial-gradient(circle, rgba(0, 140, 255, 0.12) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                fontSize: '0.725rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                ● Live Available Business Liquidity
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                (Opening Cash + Inflows − Outflows)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px' }}>
                ৳{summaryData ? summaryData.currentCash.toLocaleString('en-IN') : '...'}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {settings.currencyCode || 'BDT'} Available
              </span>
            </div>

            <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              True current business money available in drawer & banking channels. Fully isolated from inventory valuation and unrealized sales revenue.
            </p>
          </div>

          {/* Breakdown: Physical Cash vs Digital/Bank */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            background: 'rgba(0, 0, 0, 0.35)',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            flexWrap: 'wrap'
          }}>
            <div style={{ minWidth: '150px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <Wallet size={14} style={{ color: '#10b981' }} />
                <span>Physical Cash in Hand</span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>
                ৳{summaryData ? summaryData.physicalCash.toLocaleString('en-IN') : '0'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                Showroom drawer / vault
              </div>
            </div>

            <div style={{ width: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />

            <div style={{ minWidth: '150px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                <CreditCard size={14} style={{ color: '#38bdf8' }} />
                <span>Digital & Bank Balance</span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>
                ৳{summaryData ? summaryData.digitalBankCash.toLocaleString('en-IN') : '0'}
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                bKash, Nagad, Bank Asia, Islami Bank
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          DATE RANGE & FILTER BAR
          ------------------------------------------------------------- */}
      <div className="filter-bar" style={{
        background: 'var(--bg-card)',
        padding: '0.85rem 1.25rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        {/* Quick Date Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.25rem' }}>
            Period:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'prev_month', label: 'Previous Month' },
            { id: 'custom', label: 'Custom' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setDateRange(p.id as any)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: dateRange === p.id ? 700 : 500,
                background: dateRange === p.id ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.04)',
                color: dateRange === p.id ? '#ffffff' : 'var(--text-secondary)',
                border: dateRange === p.id ? '1px solid var(--brand-primary)' : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {dateRange === 'custom' && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input 
              type="date"
              className="form-control"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
            <input 
              type="date"
              className="form-control"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
            />
          </div>
        )}

        {/* Payment Method Filter */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Channel:</span>
          <select 
            className="form-control"
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', minWidth: '130px' }}
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash Drawer</option>
            <option value="bKash">bKash</option>
            <option value="Nagad">Nagad</option>
            <option value="Bank">Bank Asia / Islami Bank</option>
          </select>
        </div>
      </div>

      {/* -------------------------------------------------------------
          PERIOD METRICS GRID
          ------------------------------------------------------------- */}
      <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
        {/* Opening Cash */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Opening Cash</span>
            <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <Layers size={18} />
            </div>
          </div>
          <div className="kpi-value">
            ৳{summaryData ? summaryData.openingCash.toLocaleString('en-IN') : '0'}
          </div>
          <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
            Available balance prior to selected period
          </div>
        </div>

        {/* Total Inflow */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Cash Inflow</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <ArrowUpRight size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>
            +৳{summaryData ? summaryData.totalInflow.toLocaleString('en-IN') : '0'}
          </div>
          <div className="kpi-footer" style={{ color: '#10b981' }}>
            Today: +৳{summaryData ? summaryData.todayInflow.toLocaleString('en-IN') : '0'} | Mo: +৳{summaryData ? summaryData.thisMonthInflow.toLocaleString('en-IN') : '0'}
          </div>
        </div>

        {/* Total Outflow */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Total Cash Outflow</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <ArrowDownRight size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#ef4444' }}>
            -৳{summaryData ? summaryData.totalOutflow.toLocaleString('en-IN') : '0'}
          </div>
          <div className="kpi-footer" style={{ color: '#ef4444' }}>
            Today: -৳{summaryData ? summaryData.todayOutflow.toLocaleString('en-IN') : '0'} | Mo: -৳{summaryData ? summaryData.thisMonthOutflow.toLocaleString('en-IN') : '0'}
          </div>
        </div>

        {/* Net Period Cash Flow */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Net Cash Flow</span>
            <div className="kpi-icon" style={{
              background: (summaryData?.netCashFlow || 0) >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: (summaryData?.netCashFlow || 0) >= 0 ? '#10b981' : '#ef4444'
            }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: (summaryData?.netCashFlow || 0) >= 0 ? '#10b981' : '#ef4444' }}>
            {(summaryData?.netCashFlow || 0) >= 0 ? '+' : ''}৳{summaryData ? summaryData.netCashFlow.toLocaleString('en-IN') : '0'}
          </div>
          <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
            Inflow minus Outflow within period
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CRITICAL REQUIREMENT: CASH VS PROFIT EXPLICIT DISTINCTION
          ------------------------------------------------------------- */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid rgba(0, 140, 255, 0.25)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(0, 140, 255, 0.15)',
            color: '#008CFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <HelpCircle size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
              Cash Balance vs Accounting Profit Reconciliation
            </h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Mandatory business check: Cash balance is actual liquidity. Accounting profit is Revenue minus COGS and Expenses.
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          background: 'var(--bg-card-muted)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          marginBottom: '1rem'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT CASH LIQUIDITY</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#008CFF' }}>
              ৳{summaryData ? summaryData.cashVsProfit.currentCashBalance.toLocaleString('en-IN') : '0'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Available money in hand</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>GROSS SALES REVENUE</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
              ৳{summaryData ? summaryData.cashVsProfit.totalRevenue.toLocaleString('en-IN') : '0'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Invoice values generated</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>COST OF GOODS SOLD (COGS)</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
              ৳{summaryData ? summaryData.cashVsProfit.totalCOGS.toLocaleString('en-IN') : '0'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Product purchase cost basis</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>OPERATING EXPENSES</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ef4444' }}>
              ৳{summaryData ? summaryData.cashVsProfit.totalOperatingExpenses.toLocaleString('en-IN') : '0'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Shop & business overhead</span>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET OPERATING PROFIT</span>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              color: (summaryData?.cashVsProfit.netOperatingProfit || 0) >= 0 ? '#10b981' : '#ef4444'
            }}>
              ৳{summaryData ? summaryData.cashVsProfit.netOperatingProfit.toLocaleString('en-IN') : '0'}
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Revenue − COGS − Expenses</span>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          flexWrap: 'wrap',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.85rem'
        }}>
          <div>
            ⏳ <strong>Customer Dues Pending:</strong> ৳{summaryData ? summaryData.cashVsProfit.uncollectedSalesDue.toLocaleString('en-IN') : '0'} (Earned as revenue, not yet in cash)
          </div>
          <div>
            🏢 <strong>Supplier Payables Due:</strong> ৳{summaryData ? summaryData.cashVsProfit.unpaidPurchasesPayable.toLocaleString('en-IN') : '0'} (Procured stock, not yet paid in cash)
          </div>
          <div>
            💎 <strong>Capital Investments:</strong> ৳{summaryData ? summaryData.cashVsProfit.capitalInvestments.toLocaleString('en-IN') : '0'} (Increases cash, excluded from revenue)
          </div>
          <div>
            🌱 <strong>Seed Funding:</strong> ৳{summaryData ? summaryData.cashVsProfit.seedFunding.toLocaleString('en-IN') : '0'} (Increases cash, excluded from profit)
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          INFLOW & OUTFLOW CATEGORY BREAKDOWN GRIDS
          ------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {/* INFLOWS CARD */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Cash Inflow Sources</h4>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981' }}>
              +৳{summaryData ? summaryData.totalInflow.toLocaleString('en-IN') : '0'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { label: 'Product Sales (Actual Paid)', value: summaryData?.inflowBreakdown.salesCollections || 0, desc: 'Immediate cash collected at POS counter' },
              { label: 'Customer Due Collections', value: summaryData?.inflowBreakdown.customerDueCollections || 0, desc: 'Settlement of prior credit sales' },
              { label: 'Laptop EMI Collections', value: summaryData?.inflowBreakdown.emiCollections || 0, desc: 'Installment payments & down payments' },
              { label: 'Capital Investments', value: summaryData?.inflowBreakdown.investments || 0, desc: 'Partner equity & founder investments' },
              { label: 'Seed Funding', value: summaryData?.inflowBreakdown.seedFunding || 0, desc: 'Separate startup seed contributions' },
              { label: 'Technical & Electrical Service', value: summaryData?.inflowBreakdown.serviceIncome || 0, desc: 'Repairs & labor charges collected' },
              { label: 'Cash Inflow Adjustments', value: summaryData?.inflowBreakdown.adjustmentsInflow || 0, desc: 'Excess, corrections, manual deposits' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: item.value > 0 ? '#10b981' : 'var(--text-muted)' }}>
                  ৳{item.value.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* OUTFLOWS CARD */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
              <h4 style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Cash Outflow Sources</h4>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>
              -৳{summaryData ? summaryData.totalOutflow.toLocaleString('en-IN') : '0'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { label: 'Product Purchases (Paid Upfront)', value: summaryData?.outflowBreakdown.purchasePayments || 0, desc: 'Immediate supplier payments upon receipt' },
              { label: 'Supplier Due Payments', value: summaryData?.outflowBreakdown.supplierPayments || 0, desc: 'Payable vouchers cleared to suppliers' },
              { label: 'Operating Business Expenses', value: summaryData?.outflowBreakdown.operatingExpenses || 0, desc: 'Rent, electricity, packaging, logistics, tea' },
              { label: 'Employee & Staff Salaries', value: summaryData?.outflowBreakdown.salaryPayments || 0, desc: 'Monthly disbursements & commissions' },
              { label: 'Customer Refunds (RMA)', value: summaryData?.outflowBreakdown.refunds || 0, desc: 'Goods returned & cash disbursed' },
              { label: 'Cash Outflow Adjustments', value: summaryData?.outflowBreakdown.adjustmentsOutflow || 0, desc: 'Shortages, withdrawals, corrections' },
            ].map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)'
              }}>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: item.value > 0 ? '#ef4444' : 'var(--text-muted)' }}>
                  ৳{item.value.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          CASH MOVEMENT HISTORY / TRANSACTION LEDGER
          ------------------------------------------------------------- */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
              Cash Movement History & Running Balance Ledger
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Complete chronological audit ledger of every single cash movement with automatic running balance
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                placeholder="Search ledger..."
                className="form-control"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2rem', width: '220px', fontSize: '0.8rem' }}
              />
            </div>

            {/* Inflow / Outflow Filter */}
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              {(['ALL', 'INFLOW', 'OUTFLOW'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: typeFilter === t ? 700 : 500,
                    background: typeFilter === t ? 'var(--brand-primary)' : 'var(--bg-card)',
                    color: typeFilter === t ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {t === 'ALL' ? 'All Moves' : t === 'INFLOW' ? 'Inflows Only' : 'Outflows Only'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card-muted)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th>Date & Time</th>
                <th>Transaction ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>Reference</th>
                <th>Method / Channel</th>
                <th style={{ textAlign: 'right' }}>Cash In (+)</th>
                <th style={{ textAlign: 'right' }}>Cash Out (−)</th>
                <th style={{ textAlign: 'right' }}>Running Balance</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No cash transactions recorded within this timeframe.
                  </td>
                </tr>
              ) : (
                filteredLedger.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(row.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, fontFamily: 'monospace', color: '#38bdf8' }}>
                      {row.transactionId}
                    </td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: row.direction === 'INFLOW' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        color: row.direction === 'INFLOW' ? '#10b981' : '#ef4444'
                      }}>
                        {row.typeLabel}
                      </span>
                    </td>
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {row.description}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {row.reference || '—'}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        fontSize: '0.75rem'
                      }}>
                        {row.paymentMethod}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                      {row.cashIn > 0 ? `+৳${row.cashIn.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#ef4444' }}>
                      {row.cashOut > 0 ? `−৳${row.cashOut.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: '#f8fafc', fontSize: '0.875rem' }}>
                      ৳{row.runningBalance.toLocaleString('en-IN')}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {row.user}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* -------------------------------------------------------------
          MODAL 1: SUPER ADMIN CASH ADJUSTMENT
          ------------------------------------------------------------- */}
      {showAdjustmentModal && (
        <div className="modal-overlay" onClick={() => setShowAdjustmentModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeftRight size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 className="modal-title">Authorized Cash Adjustment</h3>
              </div>
              <button className="btn-close" onClick={() => setShowAdjustmentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit} className="modal-body">
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.78rem',
                color: '#f59e0b',
                marginBottom: '1rem'
              }}>
                <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                <strong>Super Admin Policy:</strong> Every manual cash modification is permanently logged in the compliance audit trail with previous and new balances.
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Adjustment Direction</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setAdjType('INFLOW'); setAdjReason('CASH_EXCESS'); }}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: adjType === 'INFLOW' ? '2px solid #10b981' : '1px solid var(--border-color)',
                      background: adjType === 'INFLOW' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      color: adjType === 'INFLOW' ? '#10b981' : 'var(--text-muted)'
                    }}
                  >
                    + Cash Inflow (Excess / Deposit)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAdjType('OUTFLOW'); setAdjReason('CASH_SHORTAGE'); }}
                    style={{
                      flex: 1,
                      padding: '0.65rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      border: adjType === 'OUTFLOW' ? '2px solid #ef4444' : '1px solid var(--border-color)',
                      background: adjType === 'OUTFLOW' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                      color: adjType === 'OUTFLOW' ? '#ef4444' : 'var(--text-muted)'
                    }}
                  >
                    − Cash Outflow (Shortage / Withdrawal)
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Adjustment Reason *</label>
                <select 
                  className="form-control"
                  value={adjReason}
                  onChange={e => setAdjReason(e.target.value as any)}
                  required
                >
                  {adjType === 'INFLOW' ? (
                    <>
                      <option value="CASH_EXCESS">Cash Excess Discovered</option>
                      <option value="MANUAL_DEPOSIT">Manual Cash Deposit</option>
                      <option value="OPENING_BALANCE_CORRECTION">Opening Balance Correction</option>
                      <option value="OTHER">Other Approved Receipt</option>
                    </>
                  ) : (
                    <>
                      <option value="CASH_SHORTAGE">Cash Shortage Discovered</option>
                      <option value="MANUAL_WITHDRAWAL">Manual Cash Withdrawal</option>
                      <option value="OPENING_BALANCE_CORRECTION">Opening Balance Correction</option>
                      <option value="OTHER">Other Approved Payment</option>
                    </>
                  )}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Adjustment Amount (৳ BDT) *</label>
                <input 
                  type="number"
                  className="form-control"
                  value={adjAmount}
                  onChange={e => setAdjAmount(Number(e.target.value))}
                  min={1}
                  step="any"
                  required
                  style={{ fontSize: '1.2rem', fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Target Financial Account / Drawer *</label>
                <select 
                  className="form-control"
                  value={adjAccountId}
                  onChange={e => setAdjAccountId(e.target.value)}
                  required
                >
                  {financialAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type}) — Current: ৳{Number(a.balance).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reference / Voucher Number</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. AUDIT-CORR-01 or DEP-RECEIPT-99"
                  value={adjReference}
                  onChange={e => setAdjReference(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Mandatory Audit Note / Explanation *</label>
                <textarea 
                  className="form-control"
                  rows={3}
                  placeholder="Provide precise business justification for this adjustment..."
                  value={adjNotes}
                  onChange={e => setAdjNotes(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowAdjustmentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmittingAdj}
                >
                  {isSubmittingAdj ? 'Executing...' : 'Apply Authorized Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 2: QUICK CUSTOMER DUE COLLECTION
          ------------------------------------------------------------- */}
      {showDueModal && (
        <div className="modal-overlay" onClick={() => setShowDueModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <DollarSign size={18} style={{ color: '#10b981' }} />
                <h3 className="modal-title">Collect Customer Credit Due</h3>
              </div>
              <button className="btn-close" onClick={() => setShowDueModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDueCollectionSubmit} className="modal-body">
              {customersWithDue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={36} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                  <p>No customers currently have outstanding credit dues.</p>
                </div>
              ) : (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Select Customer with Outstanding Due *</label>
                    <select 
                      className="form-control"
                      value={selectedCustomerId}
                      onChange={e => handleCustomerSelectChange(e.target.value)}
                      required
                    >
                      {customersWithDue.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.phone}) — Outstanding Due: ৳{Number(c.currentBalance).toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Payment Amount Collected (৳ BDT) *</label>
                    <input 
                      type="number"
                      className="form-control"
                      value={duePayAmount}
                      onChange={e => setDuePayAmount(Number(e.target.value))}
                      min={1}
                      max={Number(customers.find(c => c.id === selectedCustomerId)?.currentBalance || 9999999)}
                      step="any"
                      required
                      style={{ fontSize: '1.2rem', fontWeight: 700 }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Payment Channel *</label>
                    <select 
                      className="form-control"
                      value={duePaymentMethod}
                      onChange={e => setDuePaymentMethod(e.target.value as any)}
                      required
                    >
                      <option value="Cash">Cash in Hand</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Deposit Target Account *</label>
                    <select 
                      className="form-control"
                      value={dueAccountId}
                      onChange={e => setDueAccountId(e.target.value)}
                      required
                    >
                      {financialAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Payment Reference / TrxID</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. bKash TrxID or Receipt #"
                      value={dueReference}
                      onChange={e => setDueReference(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Notes</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="Optional collection notes"
                      value={dueNotes}
                      onChange={e => setDueNotes(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      onClick={() => setShowDueModal(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isSubmittingDue}
                    >
                      {isSubmittingDue ? 'Processing...' : 'Record Payment & Reconcile'}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 3: ADD CAPITAL INVESTMENT & INVESTOR INFO
          ------------------------------------------------------------- */}
      {showInvestmentModal && (
        <div className="modal-overlay" onClick={() => setShowInvestmentModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={20} style={{ color: '#10b981' }} />
                <h3 className="modal-title">Add Capital Investment & Investor Info</h3>
              </div>
              <button className="btn-close" onClick={() => setShowInvestmentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvestmentSubmit} className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                color: '#10b981',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem'
              }}>
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Non-Revenue Capital Inflow:</strong> Recording an investment directly increases business cash/bank liquidity without counting as taxable sales revenue. All investor records are permanently archived in the accounting registry.
                </div>
              </div>

              {/* SECTION 1: INVESTMENT DETAILS */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
                  <DollarSign size={16} color="#10b981" /> 1. Investment & Capital Inflow
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Investment Amount (৳ BDT) *</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>৳ {invAmount ? invAmount.toLocaleString('en-IN') : '0'}</span>
                    </label>
                    <input 
                      type="number"
                      className="form-control"
                      value={invAmount || ''}
                      onChange={e => setInvAmount(Math.max(0, Number(e.target.value)))}
                      min={1}
                      step="any"
                      required
                      placeholder="e.g. 100000"
                      style={{ fontSize: '1.15rem', fontWeight: 700, borderColor: 'rgba(16, 185, 129, 0.4)' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Investment Type *</label>
                    <select 
                      className="form-control"
                      value={invType}
                      onChange={e => setInvType(e.target.value)}
                      required
                    >
                      <option value="CAPITAL_INVESTMENT">Partner / Founder Capital</option>
                      <option value="SEED_FUNDING">Seed Funding / Working Capital</option>
                      <option value="EQUITY">Equity Stake (Strategic Investor)</option>
                      <option value="DIRECTOR_LOAN">Director / Founder Loan (Repayable)</option>
                      <option value="OTHER">Other Capital Injection</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deposit Target Account *</label>
                    <select 
                      className="form-control"
                      value={invAccountId}
                      onChange={e => setInvAccountId(e.target.value)}
                      required
                    >
                      {financialAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type}) — Current: ৳{Number(a.balance).toLocaleString('en-IN')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Channel *</label>
                    <select 
                      className="form-control"
                      value={invPaymentMethod}
                      onChange={e => setInvPaymentMethod(e.target.value as any)}
                      required
                    >
                      <option value="Cash">Cash in Hand / Showroom Vault</option>
                      <option value="Bank">Bank Deposit / Transfer</option>
                      <option value="bKash">bKash Business / Personal</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Investment Date *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={invDate}
                      onChange={e => setInvDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Transaction Reference / Cheque #</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Cheque #5021 or Trx ID"
                      value={invReference}
                      onChange={e => setInvReference(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: INVESTOR PROFILE */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.1rem',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
                  <UserPlus size={16} color="#008CFF" /> 2. Investor Information & Terms
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label">Investor Full Name *</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Kohes Ahmed or Mr. Kamal"
                      value={investorName}
                      onChange={e => setInvestorName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Investor Phone Number</label>
                    <input 
                      type="tel"
                      className="form-control"
                      placeholder="e.g. 017XXXXXXXX"
                      value={investorPhone}
                      onChange={e => setInvestorPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Investor Email</label>
                    <input 
                      type="email"
                      className="form-control"
                      placeholder="e.g. investor@gmail.com"
                      value={investorEmail}
                      onChange={e => setInvestorEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">National ID (NID) / Passport</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. NID # 1993827482"
                      value={investorNid}
                      onChange={e => setInvestorNid(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Investor Address / City</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gulshan, Dhaka"
                      value={investorAddress}
                      onChange={e => setInvestorAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Equity / Share Ownership (%)</label>
                    <input 
                      type="number"
                      className="form-control"
                      placeholder="e.g. 20 (optional)"
                      value={sharePercentage}
                      onChange={e => setSharePercentage(e.target.value)}
                      min={0}
                      max={100}
                      step="any"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.85rem' }}>
                  <label className="form-label">Investment Terms, ROI & Agreement Notes</label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    placeholder="e.g. 25% profit share on hardware sales, quarterly dividends, or capital return terms..."
                    value={invNotes}
                    onChange={e => setInvNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* LIVE RECONCILIATION SUMMARY PREVIEW */}
              <div style={{
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px dashed rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.8rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Depositing: </span>
                  <strong style={{ color: '#10b981' }}>৳{invAmount ? invAmount.toLocaleString('en-IN') : '0'}</strong>
                  <span style={{ color: 'var(--text-muted)' }}> into </span>
                  <strong>{financialAccounts.find(a => a.id === invAccountId)?.name || 'Account'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Investor: </span>
                  <strong>{investorName || 'New Investor'}</strong>
                  {sharePercentage && <span style={{ color: '#008CFF', fontWeight: 600 }}> ({sharePercentage}% equity)</span>}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowInvestmentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  disabled={isSubmittingInv}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.35)',
                    padding: '0.6rem 1.4rem'
                  }}
                >
                  {isSubmittingInv ? 'Recording Investment...' : '+ Record Investment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
