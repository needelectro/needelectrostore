import React, { useState, useEffect, useMemo } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Landmark, ArrowUpRight, ArrowDownRight, Wallet, DollarSign,
  TrendingUp, Calendar, Filter, Plus, RefreshCw, Search,
  Download, Printer, AlertTriangle, ShieldCheck, CheckCircle2,
  FileSpreadsheet, ArrowLeftRight, HelpCircle, Layers, X, CreditCard,
  Briefcase, UserPlus, Receipt, Coins, Calculator, Check, ShoppingBag, ArrowRight
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
    collectCustomerDue, addToast, settings, selectedBranch, recordInvestment,
    transferFunds, createExpense
  } = useERP();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  // Filter States
  const [dateRange, setDateRange] = useState<'today' | 'yesterday' | 'this_week' | 'this_month' | 'prev_month' | 'custom'>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFLOW' | 'OUTFLOW' | 'PURCHASES'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<CashSummary | null>(null);

  // Modals
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showDueModal, setShowDueModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showPettyModal, setShowPettyModal] = useState(false);

  // Transfer Form State
  const [transferFromId, setTransferFromId] = useState(financialAccounts[0]?.id || 'acc-1');
  const [transferToId, setTransferToId] = useState(financialAccounts[1]?.id || financialAccounts[0]?.id || 'acc-2');
  const [transferAmount, setTransferAmount] = useState<number>(5000);
  const [transferFee, setTransferFee] = useState<number>(0);
  const [transferReference, setTransferReference] = useState('');
  const [transferNotes, setTransferNotes] = useState('');
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Daily Cash Register & Drawer Reconciliation Form State
  const [note1000, setNote1000] = useState<number>(0);
  const [note500, setNote500] = useState<number>(0);
  const [note200, setNote200] = useState<number>(0);
  const [note100, setNote100] = useState<number>(0);
  const [note50, setNote50] = useState<number>(0);
  const [note20, setNote20] = useState<number>(0);
  const [note10, setNote10] = useState<number>(0);
  const [looseCoins, setLooseCoins] = useState<number>(0);
  const [useDirectCount, setUseDirectCount] = useState(false);
  const [directCountedTotal, setDirectCountedTotal] = useState<number>(0);
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconcileReason, setReconcileReason] = useState<string>('CASH_SHORTAGE');
  const [reconcileCustomReason, setReconcileCustomReason] = useState<string>('');
  const [reconcileHistory, setReconcileHistory] = useState<any[]>([]);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'movements' | 'reconciliations'>('movements');
  const [isAutoReconciling, setIsAutoReconciling] = useState(false);
  const [isSubmittingCount, setIsSubmittingCount] = useState(false);

  // Quick Petty Cash Form State
  const [pettyCategory, setPettyCategory] = useState<string>('Office Supplies & Snacks');
  const [pettyAmount, setPettyAmount] = useState<number>(150);
  const [pettyAccountId, setPettyAccountId] = useState(financialAccounts.find(a => a.type === 'CASH')?.id || financialAccounts[0]?.id || 'acc-1');
  const [pettyDescription, setPettyDescription] = useState('');
  const [isSubmittingPetty, setIsSubmittingPetty] = useState(false);

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

      const [res, reconRes] = await Promise.all([
        api.cashManagement.getCashSummary(params),
        api.cashManagement.getReconciliations({ limit: '100' })
      ]);
      if (res && res.success) {
        setSummaryData(res.data);
      } else {
        addToast('error', 'Error Loading Cash Data', (res as any)?.error || 'Failed to fetch cash position.');
      }
      if (reconRes && reconRes.success && Array.isArray(reconRes.data)) {
        setReconcileHistory(reconRes.data);
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

      const isPurchaseRelated = 
        item.type === 'PURCHASE' || 
        item.type === 'SUPPLIER_PAYMENT' || 
        item.typeLabel.toLowerCase().includes('purchase') ||
        item.description.toLowerCase().includes('purchase') ||
        item.description.toLowerCase().includes('supplier');

      const matchesType = 
        typeFilter === 'ALL' 
          ? true 
          : typeFilter === 'PURCHASES'
            ? isPurchaseRelated
            : item.direction === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [summaryData?.movements, searchQuery, typeFilter]);

  // Daily Cash Reconciliation Computations
  const primaryCashAccount = useMemo(() => {
    return financialAccounts.find(a => a.type === 'CASH') || financialAccounts[0];
  }, [financialAccounts]);

  const expectedPhysicalCash = useMemo(() => {
    return primaryCashAccount ? Number(primaryCashAccount.balance) : (summaryData?.currentCash || 0);
  }, [primaryCashAccount, summaryData]);

  const calculatedDenominationsTotal = useMemo(() => {
    return (
      (note1000 * 1000) +
      (note500 * 500) +
      (note200 * 200) +
      (note100 * 100) +
      (note50 * 50) +
      (note20 * 20) +
      (note10 * 10) +
      (Number(looseCoins) || 0)
    );
  }, [note1000, note500, note200, note100, note50, note20, note10, looseCoins]);

  const totalPhysicalCounted = useDirectCount ? directCountedTotal : calculatedDenominationsTotal;
  const cashDiscrepancy = totalPhysicalCounted - expectedPhysicalCash;

  // Handle Fund Transfer Submit
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transferFromId === transferToId) {
      alert('Source and destination financial accounts must be different.');
      return;
    }
    if (transferAmount <= 0) {
      alert('Transfer amount must be greater than 0.');
      return;
    }

    const sourceAcc = financialAccounts.find(a => a.id === transferFromId);
    const totalRequired = transferAmount + (Number(transferFee) || 0);
    if (sourceAcc && Number(sourceAcc.balance) < totalRequired) {
      alert(`Insufficient funds in ${sourceAcc.name}. Current balance: ৳${Number(sourceAcc.balance).toLocaleString('en-IN')}`);
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const res = await transferFunds(
        transferFromId,
        transferToId,
        transferAmount,
        transferFee,
        `${transferReference ? `Ref: ${transferReference} - ` : ''}${transferNotes || 'Inter-account fund transfer'}`
      );

      if (res.success) {
        setShowTransferModal(false);
        setTransferAmount(5000);
        setTransferFee(0);
        setTransferReference('');
        setTransferNotes('');
        await fetchCashData();
      }
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Handle Physical Drawer Count Submission & Reconciliation (Section 19)
  const handleSaveCashCount = async (autoAdjust: boolean = false) => {
    if (autoAdjust && !isSuperAdmin) {
      alert('Super Admin or Admin authorization is required to apply automated variance adjustments.');
      return;
    }

    const finalReason = autoAdjust
      ? (reconcileReason === 'OTHER' ? reconcileCustomReason.trim() : reconcileReason)
      : (reconcileNotes || 'Physical Drawer Audit');

    if (autoAdjust && cashDiscrepancy !== 0 && !finalReason) {
      addToast('error', 'Adjustment Reason Required', 'A clear justification reason is strictly required to adjust cash discrepancies in the accounting ledger.');
      return;
    }

    setIsSubmittingCount(true);
    try {
      const denominations = useDirectCount ? undefined : {
        note1000,
        note500,
        note200,
        note100,
        note50,
        note20,
        note10,
        looseCoins
      };

      const res = await api.cashManagement.recordCashCount({
        accountId: primaryCashAccount?.id || 'acc-1',
        systemBalance: expectedPhysicalCash,
        physicalBalance: totalPhysicalCounted,
        denominations,
        reason: finalReason,
        notes: reconcileNotes,
        autoAdjust
      });

      if (res && res.success) {
        if (autoAdjust) {
          addToast('success', 'Drawer Reconciled & Adjusted', `Physical count (৳${totalPhysicalCounted.toLocaleString('en-IN')}) saved and variance adjusted by ৳${Math.abs(cashDiscrepancy).toLocaleString('en-IN')}.`);
        } else {
          addToast('success', 'Physical Count Logged', `Cash drawer physical count of ৳${totalPhysicalCounted.toLocaleString('en-IN')} successfully audited.`);
        }
        setShowReconcileModal(false);
        await fetchCashData();
      } else {
        addToast('error', 'Reconciliation Error', (res as any)?.error || 'Failed to save cash count session.');
      }
    } catch (err: any) {
      addToast('error', 'Reconciliation Error', err.message || 'Unable to record drawer count.');
    } finally {
      setIsSubmittingCount(false);
    }
  };

  // Handle Quick Petty Cash Submit
  const handlePettyCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pettyAmount <= 0) {
      alert('Petty cash amount must be greater than 0.');
      return;
    }
    if (!pettyDescription.trim()) {
      alert('Description/voucher reason is required.');
      return;
    }

    setIsSubmittingPetty(true);
    try {
      const res = await createExpense({
        category: pettyCategory as any,
        amount: pettyAmount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Cash',
        branchId: selectedBranch.id,
        description: `[Petty Cash] ${pettyDescription.trim()}`,
        accountId: pettyAccountId,
      } as any);

      if (res.success) {
        setShowPettyModal(false);
        setPettyAmount(150);
        setPettyDescription('');
        await fetchCashData();
      }
    } finally {
      setIsSubmittingPetty(false);
    }
  };

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
            className="btn"
            onClick={() => setShowReconcileModal(true)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.45rem',
              background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
              cursor: 'pointer'
            }}
          >
            <Calculator size={15} /> Daily Cash Closing
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => setShowTransferModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#38bdf8', color: '#38bdf8' }}
          >
            <ArrowLeftRight size={15} /> Transfer Funds
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => setShowPettyModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderColor: '#f59e0b', color: '#f59e0b' }}
          >
            <Receipt size={15} /> Quick Petty Cash
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
          FINANCIAL ACCOUNTS & CASH DRAWERS OVERVIEW
          ------------------------------------------------------------- */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wallet size={16} style={{ color: 'var(--brand-primary)' }} />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Active Cash Drawers, Banks & Digital Wallets
              <span style={{ 
                background: 'rgba(0, 140, 255, 0.1)', 
                color: '#008CFF', 
                padding: '0.15rem 0.5rem', 
                borderRadius: '999px', 
                fontSize: '0.75rem', 
                fontWeight: 700,
              }}>
                Total: ৳{financialAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0).toLocaleString('en-IN')}
              </span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--brand-primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            Transfer Between Accounts <ArrowRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '0.85rem'
        }}>
          {financialAccounts.map((acc) => {
            const isCash = acc.type === 'CASH';
            const isBank = acc.type === 'BANK';
            const bal = Number(acc.balance);

            return (
              <div
                key={acc.id}
                style={{
                  background: 'var(--bg-card)',
                  border: isCash ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.15rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isCash && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    background: '#10b981',
                    color: '#000',
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '0.15rem 0.55rem',
                    borderBottomLeftRadius: '6px',
                    letterSpacing: '0.5px'
                  }}>
                    PHYSICAL CASH
                  </div>
                )}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isCash ? 'rgba(16, 185, 129, 0.12)' : isBank ? 'rgba(56, 189, 248, 0.12)' : 'rgba(236, 72, 153, 0.12)',
                      color: isCash ? '#10b981' : isBank ? '#38bdf8' : '#ec4899'
                    }}>
                      {isCash ? <Coins size={15} /> : isBank ? <Landmark size={15} /> : <CreditCard size={15} />}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {acc.accountNumber || (isCash ? 'Main Showroom Counter' : 'Account')}
                      </div>
                    </div>
                  </div>

                  <div style={{ margin: '0.65rem 0 0.4rem' }}>
                    <div style={{ fontSize: '1.45rem', fontWeight: 900, color: bal < 0 ? '#ef4444' : 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                      ৳{bal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setTransferFromId(acc.id);
                      const target = financialAccounts.find(a => a.id !== acc.id);
                      if (target) setTransferToId(target.id);
                      setShowTransferModal(true);
                    }}
                    style={{
                      background: 'var(--bg-card-muted, rgba(125, 125, 125, 0.08))',
                      border: '1px solid var(--border-color)',
                      borderRadius: '5px',
                      color: 'var(--text-secondary)',
                      fontSize: '0.725rem',
                      fontWeight: 600,
                      padding: '0.25rem 0.6rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <ArrowLeftRight size={11} /> Transfer
                  </button>
                </div>
              </div>
            );
          })}
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
          8 & 9. DAILY CASH FLOW & CASH MANAGEMENT DASHBOARD METRICS
          ------------------------------------------------------------- */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Daily Cash Flow & Position (Active Period: {dateRange.toUpperCase().replace('_', ' ')})
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            All metrics calculated dynamically from database ledger transactions
          </span>
        </div>

        {/* Tier 1: Today's Real-Time Daily Cash Position */}
        <div className="kpi-grid" style={{ marginBottom: '1rem' }}>
          {/* Current Cash */}
          <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
            <div className="kpi-top">
              <span className="kpi-title">Current Physical Cash</span>
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                <Wallet size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#10b981' }}>
              ৳{summaryData ? summaryData.physicalCash.toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
              Actual physical cash notes in showroom drawer
            </div>
          </div>

          {/* Today's Cash In */}
          <div className="kpi-card" style={{ borderLeft: '4px solid #008CFF' }}>
            <div className="kpi-top">
              <span className="kpi-title">Today's Cash In</span>
              <div className="kpi-icon" style={{ background: 'rgba(0, 140, 255, 0.15)', color: '#008CFF' }}>
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#008CFF' }}>
              +৳{summaryData ? (summaryData.todayPhysicalInflow ?? summaryData.todayInflow).toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: '#008CFF' }}>
              Cash sales, dues & collections received today
            </div>
          </div>

          {/* Today's Cash Out */}
          <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
            <div className="kpi-top">
              <span className="kpi-title">Today's Cash Out</span>
              <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                <ArrowDownRight size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#ef4444' }}>
              -৳{summaryData ? (summaryData.todayPhysicalOutflow ?? summaryData.todayOutflow).toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: '#ef4444' }}>
              Cash purchases, expenses & payouts today
            </div>
          </div>

          {/* Today's Net Movement */}
          <div className="kpi-card" style={{ borderLeft: `4px solid ${(summaryData?.todayNetMovement || 0) >= 0 ? '#10b981' : '#ef4444'}` }}>
            <div className="kpi-top">
              <span className="kpi-title">Today's Net Movement</span>
              <div className="kpi-icon" style={{
                background: (summaryData?.todayNetMovement || 0) >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: (summaryData?.todayNetMovement || 0) >= 0 ? '#10b981' : '#ef4444'
              }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: (summaryData?.todayNetMovement || 0) >= 0 ? '#10b981' : '#ef4444' }}>
              {(summaryData?.todayNetMovement || 0) >= 0 ? '+' : ''}৳{summaryData ? (summaryData.todayNetMovement ?? (summaryData.todayInflow - summaryData.todayOutflow)).toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
              Cash In minus Cash Out today
            </div>
          </div>
        </div>

        {/* Tier 2: Period Dynamics & Drawer Closing Expectations */}
        <div className="kpi-grid">
          {/* Opening Cash */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-title">Period Opening Cash</span>
              <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                <Layers size={18} />
              </div>
            </div>
            <div className="kpi-value">
              ৳{summaryData ? summaryData.openingCash.toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
              Starting balance prior to selected period
            </div>
          </div>

          {/* Total Period Inflow */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-title">Period Total Cash In</span>
              <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#10b981' }}>
              +৳{summaryData ? summaryData.totalInflow.toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
              All cash receipts within active period
            </div>
          </div>

          {/* Expected Closing Cash */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-title">Expected Closing Cash</span>
              <div className="kpi-icon" style={{ background: 'rgba(168, 85, 247, 0.12)', color: '#a855f7' }}>
                <Calculator size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: '#a855f7' }}>
              ৳{summaryData ? (summaryData.closingCash ?? (summaryData.openingCash + summaryData.totalInflow - summaryData.totalOutflow)).toLocaleString('en-IN') : '0'}
            </div>
            <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>
              Opening Cash + Cash In − Cash Out
            </div>
          </div>

          {/* Drawer Variance / Difference */}
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-title">Cash Variance / Difference</span>
              <div className="kpi-icon" style={{
                background: cashDiscrepancy === 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                color: cashDiscrepancy === 0 ? '#10b981' : '#ef4444'
              }}>
                <Coins size={18} />
              </div>
            </div>
            <div className="kpi-value" style={{ color: cashDiscrepancy === 0 ? '#10b981' : cashDiscrepancy > 0 ? '#38bdf8' : '#ef4444' }}>
              {cashDiscrepancy > 0 ? '+' : ''}৳{cashDiscrepancy.toLocaleString('en-IN')}
            </div>
            <div className="kpi-footer" style={{ color: cashDiscrepancy === 0 ? '#10b981' : '#ef4444' }}>
              {cashDiscrepancy === 0 ? '✓ Physical drawer perfectly balanced' : `Expected vs Physical (${cashDiscrepancy > 0 ? 'Excess' : 'Shortage'})`}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          18 & 25. PAYMENT METHOD ACCOUNTS & BRANCH CASH DISTRIBUTION
          ------------------------------------------------------------- */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {/* Section 18: Payment Method Accounts */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={17} style={{ color: 'var(--brand-primary)' }} />
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Payment Method Accounts</h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Separate balances maintained
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            {[
              { id: 'Cash', label: 'Physical Cash', color: '#10b981', icon: <Wallet size={15} /> },
              { id: 'bKash', label: 'bKash Merchant/Personal', color: '#e11d48', icon: <CreditCard size={15} /> },
              { id: 'Nagad', label: 'Nagad Wallet', color: '#ea580c', icon: <CreditCard size={15} /> },
              { id: 'Rocket', label: 'Rocket (DBBL)', color: '#9333ea', icon: <CreditCard size={15} /> },
              { id: 'Bank', label: 'Bank (Islami / Bank Asia)', color: '#0284c7', icon: <Landmark size={15} /> },
              { id: 'Card', label: 'Debit / Credit Card POS', color: '#059669', icon: <CreditCard size={15} /> }
            ].map(m => {
              const stat = summaryData?.paymentMethodStats?.[m.id];
              const balance = stat?.balance ?? (m.id === 'Cash' ? (summaryData?.physicalCash || 0) : 0);
              const inVal = stat?.inflow || 0;
              const outVal = stat?.outflow || 0;

              return (
                <div key={m.id} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem 0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: m.color }}>{m.icon}</span> {m.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: balance >= 0 ? m.color : '#ef4444' }}>
                    ৳{balance.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', justifyContent: 'space-between' }}>
                    <span>In: +৳{inVal.toLocaleString('en-IN')}</span>
                    <span>Out: -৳{outVal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 25: Branch Cash Distribution */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark size={17} style={{ color: '#008CFF' }} />
              <h4 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem' }}>Branch Cash Distribution</h4>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Non-mixed branch balances
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {(summaryData?.branchStats && summaryData.branchStats.length > 0 ? summaryData.branchStats : [
              { name: 'Main Showroom', balance: summaryData?.physicalCash || 0, inflow: summaryData?.totalInflow || 0, outflow: summaryData?.totalOutflow || 0 },
              { name: 'Branch 2 (Service Center)', balance: 0, inflow: 0, outflow: 0 },
              { name: 'Central Warehouse', balance: 0, inflow: 0, outflow: 0 }
            ]).map((b, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>{b.name}</div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    In: +৳{b.inflow.toLocaleString('en-IN')} | Out: -৳{b.outflow.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>
                    ৳{b.balance.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    Physical Cash
                  </div>
                </div>
              </div>
            ))}
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
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
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
              { label: 'Transfers Received (Inflow)', value: summaryData?.inflowBreakdown.transfersIn || 0, desc: 'Inter-branch & inter-account cash transfers in' },
              { label: 'Technical & Electrical Service', value: summaryData?.inflowBreakdown.serviceIncome || 0, desc: 'Repairs & labor charges collected' },
              { label: 'Other Cash Income', value: summaryData?.inflowBreakdown.otherIncome || 0, desc: 'Non-product revenue, scrap carton sales, rebates' },
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
              { label: 'Owner Withdrawals & Drawings', value: summaryData?.outflowBreakdown.otherOutflows || 0, desc: 'Owner personal drawings and equity reduction' },
              { label: 'Employee & Staff Salaries', value: summaryData?.outflowBreakdown.salaryPayments || 0, desc: 'Monthly disbursements & commissions' },
              { label: 'Customer Refunds (RMA)', value: summaryData?.outflowBreakdown.refunds || 0, desc: 'Goods returned & cash disbursed' },
              { label: 'Transfers Disbursed (Outflow)', value: summaryData?.outflowBreakdown.transfersOut || 0, desc: 'Inter-branch & inter-account cash transfers out' },
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
        {/* Toggle between Cash Movements Ledger and Physical Cash Difference Reports */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveLedgerTab('movements')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeLedgerTab === 'movements' ? 'var(--brand-primary)' : 'rgba(255, 255, 255, 0.05)',
              color: activeLedgerTab === 'movements' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Receipt size={16} /> Cash Transactions Ledger
          </button>

          <button
            type="button"
            onClick={() => setActiveLedgerTab('reconciliations')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: 'none',
              background: activeLedgerTab === 'reconciliations' ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
              color: activeLedgerTab === 'reconciliations' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={16} /> Physical Cash Difference Reporting & Audits ({reconcileHistory.length})
          </button>
        </div>

        {activeLedgerTab === 'movements' ? (
          <div>
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

            {/* Inflow / Outflow / Purchases Filter */}
            <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              {([
                { key: 'ALL', label: 'All Moves' },
                { key: 'INFLOW', label: 'Inflows Only (+)' },
                { key: 'OUTFLOW', label: 'Outflows Only (−)' },
                { key: 'PURCHASES', label: '🛒 Purchases & Buying' }
              ] as const).map(t => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTypeFilter(t.key)}
                  style={{
                    padding: '0.35rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: typeFilter === t.key ? 700 : 500,
                    background: typeFilter === t.key ? (t.key === 'PURCHASES' ? '#f59e0b' : 'var(--brand-primary)') : 'var(--bg-card)',
                    color: typeFilter === t.key ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
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
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
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
    ) : (
      /* DIFFERENCE REPORTING & PHYSICAL RECONCILIATIONS VIEW */
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} /> Physical Cash Reconciliation & Difference Reporting
            </h3>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Audit log of all physical drawer counts, variance tracking, and required adjustment justifications
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowReconcileModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}
          >
            <Calculator size={15} /> Perform Physical Cash Count
          </button>
        </div>

        {/* Reconciliation KPI Summary */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL RECONCILIATION AUDITS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.25rem' }}>
              {reconcileHistory.length}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>BALANCED SESSIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981', marginTop: '0.25rem' }}>
              {reconcileHistory.filter(r => Number(r.difference) === 0).length}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SHORTAGES DETECTED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginTop: '0.25rem' }}>
              {reconcileHistory.filter(r => Number(r.difference) < 0).length}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>ADJUSTED WITH REASON</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '0.25rem' }}>
              {reconcileHistory.filter(r => r.status === 'ADJUSTED').length}
            </div>
          </div>
        </div>

        {/* Reconciliations Table */}
        <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.825rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card-muted)', position: 'sticky', top: 0, zIndex: 10 }}>
                <th>Date & Time</th>
                <th>Count Session #</th>
                <th>Target Account</th>
                <th style={{ textAlign: 'right' }}>Expected Cash (৳)</th>
                <th style={{ textAlign: 'right' }}>Physical Counted (৳)</th>
                <th style={{ textAlign: 'right' }}>Difference (৳)</th>
                <th>Audit Status</th>
                <th>Adjustment Reason & Justification</th>
                <th>Auditor</th>
              </tr>
            </thead>
            <tbody>
              {reconcileHistory.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Calculator size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
                    <div>No physical cash counts recorded yet. Click "Perform Physical Cash Count" to audit drawer.</div>
                  </td>
                </tr>
              ) : (
                reconcileHistory.map((rec) => {
                  const diff = Number(rec.difference);
                  const isBalanced = diff === 0;
                  return (
                    <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                      <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}{' '}
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(rec.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10b981' }}>
                          {rec.sessionNumber}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                        {rec.accountName}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#38bdf8' }}>
                        ৳{Number(rec.expectedBalance).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                        ৳{Number(rec.physicalBalance).toLocaleString('en-IN')}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800 }}>
                        <span style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          background: isBalanced ? 'rgba(16, 185, 129, 0.15)' : diff > 0 ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isBalanced ? '#10b981' : diff > 0 ? '#38bdf8' : '#ef4444'
                        }}>
                          {diff > 0 ? '+' : ''}৳{diff.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: rec.status === 'BALANCED'
                            ? 'rgba(16, 185, 129, 0.2)'
                            : rec.status === 'ADJUSTED'
                            ? 'rgba(245, 158, 11, 0.2)'
                            : 'rgba(239, 68, 68, 0.2)',
                          color: rec.status === 'BALANCED' ? '#10b981' : rec.status === 'ADJUSTED' ? '#f59e0b' : '#ef4444'
                        }}>
                          {rec.status}
                        </span>
                      </td>
                      <td style={{ maxWidth: '240px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.775rem' }}>
                          {rec.reason || (isBalanced ? '✓ Normal Balance' : '—')}
                        </div>
                        {rec.notes && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {rec.notes}
                          </div>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {rec.performedBy}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
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

      {/* -------------------------------------------------------------
          MODAL 4: INTER-ACCOUNT FUND TRANSFER
          ------------------------------------------------------------- */}
      {showTransferModal && (
        <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowLeftRight size={18} style={{ color: '#38bdf8' }} />
                <h3 className="modal-title">Inter-Account Fund Transfer</h3>
              </div>
              <button className="btn-close" onClick={() => setShowTransferModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="modal-body">
              <div style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.78rem',
                color: '#38bdf8',
                marginBottom: '1rem'
              }}>
                <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                <strong>Internal Liquidity Movement:</strong> Moving money between Cash Drawers, Bank Accounts, or Digital Wallets updates ledger accounts without affecting business revenue or profit.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Source Account (From) *</label>
                  <select 
                    className="form-control"
                    value={transferFromId}
                    onChange={e => setTransferFromId(e.target.value)}
                    required
                  >
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (৳{Number(a.balance).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination Account (To) *</label>
                  <select 
                    className="form-control"
                    value={transferToId}
                    onChange={e => setTransferToId(e.target.value)}
                    required
                  >
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (৳{Number(a.balance).toLocaleString('en-IN')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Transfer Amount (৳ BDT) *</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={transferAmount}
                    onChange={e => setTransferAmount(Math.max(1, Number(e.target.value)))}
                    min={1}
                    step="any"
                    required
                    style={{ fontSize: '1.2rem', fontWeight: 700 }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Fee / Charge (৳)</label>
                  <input 
                    type="number"
                    className="form-control"
                    placeholder="e.g. 15"
                    value={transferFee || ''}
                    onChange={e => setTransferFee(Math.max(0, Number(e.target.value)))}
                    min={0}
                    step="any"
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Reference / TrxID / Cheque #</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. bKash TrxID or Cheque # 992812"
                  value={transferReference}
                  onChange={e => setTransferReference(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Transfer Notes</label>
                <input 
                  type="text"
                  className="form-control"
                  placeholder="e.g. End of day cash deposit to bank"
                  value={transferNotes}
                  onChange={e => setTransferNotes(e.target.value)}
                />
              </div>

              {/* LIVE BALANCE PREVIEW */}
              {(() => {
                const fromAcc = financialAccounts.find(a => a.id === transferFromId);
                const toAcc = financialAccounts.find(a => a.id === transferToId);
                const fromBal = fromAcc ? Number(fromAcc.balance) : 0;
                const toBal = toAcc ? Number(toAcc.balance) : 0;
                const totalDeduct = transferAmount + (Number(transferFee) || 0);

                return (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    fontSize: '0.8rem',
                    marginBottom: '1.25rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{fromAcc?.name} remaining:</span>
                      <strong style={{ color: fromBal - totalDeduct >= 0 ? 'var(--text-primary)' : '#ef4444' }}>
                        ৳{(fromBal - totalDeduct).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{toAcc?.name} new balance:</span>
                      <strong style={{ color: '#10b981' }}>
                        ৳{(toBal + transferAmount).toLocaleString('en-IN')}
                      </strong>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowTransferModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmittingTransfer}
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', border: 'none' }}
                >
                  {isSubmittingTransfer ? 'Processing...' : 'Execute Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 5: DAILY CASH REGISTER CLOSING & PHYSICAL DRAWER RECONCILIATION
          ------------------------------------------------------------- */}
      {showReconcileModal && (
        <div className="modal-overlay" onClick={() => setShowReconcileModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={20} style={{ color: '#10b981' }} />
                <h3 className="modal-title">Daily Cash Register Closing & Reconciliation</h3>
              </div>
              <button className="btn-close" onClick={() => setShowReconcileModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', padding: '1.25rem 1.5rem' }}>
              {/* REGISTER STATUS BANNER */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>SYSTEM EXPECTED DRAWER CASH</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>
                    ৳{expectedPhysicalCash.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Based on cash sales & expenses</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>PHYSICAL COUNTED TOTAL</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '0.2rem' }}>
                    ৳{totalPhysicalCounted.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>Physical cash notes in drawer</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 600 }}>VARIANCE / DISCREPANCY</div>
                  <div style={{
                    fontSize: '1.35rem',
                    fontWeight: 800,
                    color: cashDiscrepancy === 0 ? '#10b981' : cashDiscrepancy > 0 ? '#38bdf8' : '#ef4444',
                    marginTop: '0.2rem'
                  }}>
                    {cashDiscrepancy > 0 ? '+' : ''}৳{cashDiscrepancy.toLocaleString('en-IN')}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: cashDiscrepancy === 0 ? '#10b981' : cashDiscrepancy > 0 ? '#38bdf8' : '#ef4444'
                  }}>
                    {cashDiscrepancy === 0 ? '✓ Balanced' : cashDiscrepancy > 0 ? 'Excess Discovered' : 'Shortage Detected'}
                  </div>
                </div>
              </div>

              {/* INPUT MODE TOGGLE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Physical Cash Count Method:
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => setUseDirectCount(false)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: !useDirectCount ? 700 : 500,
                      background: !useDirectCount ? 'var(--brand-primary)' : 'var(--bg-card-muted, rgba(125, 125, 125, 0.08))',
                      color: !useDirectCount ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    Note Breakdown (BDT)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseDirectCount(true)}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: useDirectCount ? 700 : 500,
                      background: useDirectCount ? 'var(--brand-primary)' : 'var(--bg-card-muted, rgba(125, 125, 125, 0.08))',
                      color: useDirectCount ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      cursor: 'pointer'
                    }}
                  >
                    Direct Lump-Sum Total
                  </button>
                </div>
              </div>

              {/* DENOMINATION COUNTER */}
              {!useDirectCount ? (
                <div style={{
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem',
                  marginBottom: '1.25rem'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {[
                      { note: 1000, value: note1000, setter: setNote1000 },
                      { note: 500, value: note500, setter: setNote500 },
                      { note: 200, value: note200, setter: setNote200 },
                      { note: 100, value: note100, setter: setNote100 },
                      { note: 50, value: note50, setter: setNote50 },
                      { note: 20, value: note20, setter: setNote20 },
                      { note: 10, value: note10, setter: setNote10 },
                    ].map(n => (
                      <div key={n.note} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '70px' }}>৳{n.note} note:</span>
                        <input
                          type="number"
                          className="form-control"
                          min={0}
                          value={n.value || ''}
                          onChange={e => n.setter(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0 pcs"
                          style={{ width: '85px', textAlign: 'center', padding: '0.3rem' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '70px', textAlign: 'right' }}>
                          = ৳{(n.value * n.note).toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '70px' }}>Coins & change:</span>
                      <input
                        type="number"
                        className="form-control"
                        min={0}
                        value={looseCoins || ''}
                        onChange={e => setLooseCoins(Math.max(0, Number(e.target.value) || 0))}
                        placeholder="৳ amount"
                        style={{ width: '85px', textAlign: 'center', padding: '0.3rem' }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '70px', textAlign: 'right' }}>
                        = ৳{(Number(looseCoins) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Physical Cash Counted (৳ BDT) *</label>
                  <input 
                    type="number"
                    className="form-control"
                    value={directCountedTotal || ''}
                    onChange={e => setDirectCountedTotal(Math.max(0, Number(e.target.value)))}
                    placeholder="Enter total counted cash in drawer"
                    style={{ fontSize: '1.3rem', fontWeight: 700 }}
                  />
                </div>
              )}

              {/* RECONCILIATION NOTES */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Cashier Closing Notes & Observations</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  placeholder="Optional notes regarding shift handoff, missing change, or closing remarks..."
                  value={reconcileNotes}
                  onChange={e => setReconcileNotes(e.target.value)}
                />
              </div>

              {/* AUTO-ADJUSTMENT ACTION (IF DISCREPANCY) */}
              {cashDiscrepancy !== 0 && totalPhysicalCounted > 0 && (
                <div style={{
                  background: cashDiscrepancy > 0 ? 'rgba(56, 189, 248, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: cashDiscrepancy > 0 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.825rem', marginBottom: '0.6rem' }}>
                    <strong style={{ color: cashDiscrepancy > 0 ? '#38bdf8' : '#ef4444' }}>
                      Variance Action Required ({cashDiscrepancy > 0 ? 'Excess' : 'Shortage'} of ৳{Math.abs(cashDiscrepancy).toLocaleString('en-IN')}):
                    </strong>
                    <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem', fontSize: '0.75rem' }}>
                      In accordance with accounting rules, a justification reason is mandatory to book an adjusting transaction into the central ledger.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        Adjustment Reason *
                      </label>
                      <select
                        className="form-control"
                        style={{ fontSize: '0.8rem' }}
                        value={reconcileReason}
                        onChange={e => setReconcileReason(e.target.value)}
                      >
                        <option value="CASH_SHORTAGE">Cash Shortage (Counter / Shift Discrepancy)</option>
                        <option value="CASH_EXCESS">Cash Excess (Customer Overpayment / Unrecorded Inflow)</option>
                        <option value="CHANGE_CALCULATION_ERROR">Change Calculation Error</option>
                        <option value="UNRECORDED_EXPENSE">Unrecorded Petty Cash Expense</option>
                        <option value="THEFT_OR_LOSS">Theft or Missing Store Cash</option>
                        <option value="DRAWER_COUNT_CORRECTION">Drawer Count Physical Verification Correction</option>
                        <option value="OTHER">Other Specific Reason (Write details below)</option>
                      </select>
                    </div>

                    {reconcileReason === 'OTHER' && (
                      <div>
                        <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          Specify Reason Details *
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          style={{ fontSize: '0.8rem' }}
                          placeholder="Detailed explanation for cash variance..."
                          value={reconcileCustomReason}
                          onChange={e => setReconcileCustomReason(e.target.value)}
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveCashCount(true)}
                    disabled={isSubmittingCount}
                    className="btn"
                    style={{
                      background: cashDiscrepancy > 0 ? '#0284c7' : '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      padding: '0.5rem 1rem',
                      width: '100%',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {isSubmittingCount ? 'Reconciling & Adjusting...' : `Approve & Auto-Reconcile Variance (${cashDiscrepancy > 0 ? '+' : ''}৳${cashDiscrepancy.toLocaleString()})`}
                  </button>
                </div>
              )}

              {/* ACTIONS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={14} /> Print Closing Sheet
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    onClick={() => setShowReconcileModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    disabled={isSubmittingCount}
                    onClick={() => handleSaveCashCount(false)}
                  >
                    {isSubmittingCount ? 'Saving Count...' : 'Save & Audit Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL 6: QUICK PETTY CASH OUTFLOW
          ------------------------------------------------------------- */}
      {showPettyModal && (
        <div className="modal-overlay" onClick={() => setShowPettyModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={18} style={{ color: '#f59e0b' }} />
                <h3 className="modal-title">Record Quick Petty Cash Outflow</h3>
              </div>
              <button className="btn-close" onClick={() => setShowPettyModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePettyCashSubmit} className="modal-body">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Expense Category *</label>
                <select 
                  className="form-control"
                  value={pettyCategory}
                  onChange={e => setPettyCategory(e.target.value)}
                  required
                >
                  <option value="Office Supplies & Snacks">Office Supplies, Snacks & Tea</option>
                  <option value="Logistics & Delivery">Courier & Rickshaw Delivery</option>
                  <option value="Shop Maintenance">Shop Repairs & Cleaning</option>
                  <option value="Utility Bills">Electricity, Water & Internet</option>
                  <option value="Other">Other Operational Petty Cash</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Disbursing Cash Drawer / Account *</label>
                <select 
                  className="form-control"
                  value={pettyAccountId}
                  onChange={e => setPettyAccountId(e.target.value)}
                  required
                >
                  {financialAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type}) — Balance: ৳{Number(a.balance).toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label">Petty Cash Amount (৳ BDT) *</label>
                <input 
                  type="number"
                  className="form-control"
                  value={pettyAmount}
                  onChange={e => setPettyAmount(Math.max(1, Number(e.target.value)))}
                  min={1}
                  step="any"
                  required
                  style={{ fontSize: '1.25rem', fontWeight: 700 }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">Voucher Description / Purpose *</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  placeholder="e.g. Rickshaw fare for urgent courier dispatch to Sreemangal"
                  value={pettyDescription}
                  onChange={e => setPettyDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowPettyModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn"
                  disabled={isSubmittingPetty}
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700
                  }}
                >
                  {isSubmittingPetty ? 'Disbursing...' : 'Disburse Petty Cash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
