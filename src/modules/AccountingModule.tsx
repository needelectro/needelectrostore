import React, { useState, useEffect } from 'react';
import { useERP } from '../services/erpStore';
import { 
  PieChart as PieChartIcon, TrendingUp, TrendingDown, 
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, 
  Receipt, BookOpen, Calendar, Printer, Plus, ArrowLeftRight,
  Landmark, ShieldAlert, CheckCircle2, X, Users, Percent,
  Lock, Unlock, ShieldCheck, Sparkles, Clock, FileText,
  RefreshCw, AlertCircle, ArrowDown, ArrowUp, Info, RotateCcw, Check, CreditCard,
  Download
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { InvestmentType, AccountType, Investment } from '../types';
import { api } from '../services/api';
import { InvestmentSuccessModal } from '../components/accounting/InvestmentSuccessModal';

interface AccountingModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({ onNavigate }) => {
  const { 
    sales, emiPayments, expenses, suppliers, customers, emiAccounts, 
    products, services, selectedBranch, financialAccounts, investments,
    recordInvestment, transferFunds, recordOtherIncome, recordOwnerWithdrawal,
    reverseTransaction, addToast, otherIncomes, ownerWithdrawals, ledgerEntries,
    setActiveInvestmentMemoToPrint, currentUser
  } = useERP();

  const [activeTab, setActiveTab] = useState<'pnl' | 'accounts' | 'statements' | 'cash_flow' | 'investments'>('pnl');

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showOtherIncomeModal, setShowOtherIncomeModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [selectedLedgerItem, setSelectedLedgerItem] = useState<any>(null);
  const [showReversalModal, setShowReversalModal] = useState(false);
  const [itemToReverse, setItemToReverse] = useState<any>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [isSubmittingReversal, setIsSubmittingReversal] = useState(false);

  // Other Income Form State
  const [otherIncomeCategory, setOtherIncomeCategory] = useState('Scrap & Packaging Sale');
  const [otherIncomeAmount, setOtherIncomeAmount] = useState<number>(1000);
  const [otherIncomeAccountId, setOtherIncomeAccountId] = useState(financialAccounts[0]?.id || 'acc-1');
  const [otherIncomeDesc, setOtherIncomeDesc] = useState('');
  const [otherIncomeFrom, setOtherIncomeFrom] = useState('');
  const [otherIncomeDate, setOtherIncomeDate] = useState(new Date().toISOString().split('T')[0]);
  const [otherIncomeRef, setOtherIncomeRef] = useState('');
  const [isSubmittingOtherIncome, setIsSubmittingOtherIncome] = useState(false);

  // Owner Withdrawal Form State
  const [withdrawalOwner, setWithdrawalOwner] = useState('Amdadur Rahman');
  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(5000);
  const [withdrawalAccountId, setWithdrawalAccountId] = useState(financialAccounts[0]?.id || 'acc-1');
  const [withdrawalPurpose, setWithdrawalPurpose] = useState('Personal Drawing');
  const [withdrawalDate, setWithdrawalDate] = useState(new Date().toISOString().split('T')[0]);
  const [withdrawalRef, setWithdrawalRef] = useState('');
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  // Account Statement State
  const [statementAccountId, setStatementAccountId] = useState(financialAccounts[0]?.id || 'acc-1');
  const [statementRange, setStatementRange] = useState('this_month');
  const [customStmtStart, setCustomStmtStart] = useState('');
  const [customStmtEnd, setCustomStmtEnd] = useState('');
  const [statementData, setStatementData] = useState<any>(null);
  const [isLoadingStatement, setIsLoadingStatement] = useState(false);

  // Cash Flow Report State
  const [cashFlowRange, setCashFlowRange] = useState('this_month');
  const [customCfStart, setCustomCfStart] = useState('');
  const [customCfEnd, setCustomCfEnd] = useState('');
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [isLoadingCashFlow, setIsLoadingCashFlow] = useState(false);

  // Transfer Form State
  const [fromAccountId, setFromAccountId] = useState(financialAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(financialAccounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(10000);
  const [transferRef, setTransferRef] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Investment Form State
  const [investorName, setInvestorName] = useState('');
  const [investorPhone, setInvestorPhone] = useState('');
  const [investorEmail, setInvestorEmail] = useState('');
  const [investorAddress, setInvestorAddress] = useState('');
  const [investorOrganization, setInvestorOrganization] = useState('');
  const [investAmount, setInvestAmount] = useState<number>(300000);
  const [investDate, setInvestDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [investType, setInvestType] = useState<InvestmentType>('EQUITY');
  const [targetAccountId, setTargetAccountId] = useState(financialAccounts[0]?.id || '');
  const [investPaymentMethod, setInvestPaymentMethod] = useState('Cash');
  const [investPurpose, setInvestPurpose] = useState('Business Capital');
  const [investDescription, setInvestDescription] = useState('');
  const [investRef, setInvestRef] = useState('');
  const [investNotes, setInvestNotes] = useState('');
  const [isSubmittingInvest, setIsSubmittingInvest] = useState(false);
  const [newlyCreatedInvestment, setNewlyCreatedInvestment] = useState<Investment | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Super Admin Investor Management State
  const [adminInvestorData, setAdminInvestorData] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);
  const [isLoadingInvestorData, setIsLoadingInvestorData] = useState<boolean>(false);
  const [showCreateInvestorModal, setShowCreateInvestorModal] = useState<boolean>(false);
  const [showAddCapitalToInvestorModal, setShowAddCapitalToInvestorModal] = useState<boolean>(false);
  const [selectedInvestorForCapital, setSelectedInvestorForCapital] = useState<any>(null);

  // Create Investor Form
  const [newInvestorName, setNewInvestorName] = useState('');
  const [newInvestorEmail, setNewInvestorEmail] = useState('');
  const [newInvestorPhone, setNewInvestorPhone] = useState('');
  const [newInvestorPassword, setNewInvestorPassword] = useState('');
  const [newInvestorInitialAmount, setNewInvestorInitialAmount] = useState<number>(50000);
  const [newInvestorDate, setNewInvestorDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [newInvestorAccountId, setNewInvestorAccountId] = useState(financialAccounts[0]?.id || '');
  const [newInvestorNotes, setNewInvestorNotes] = useState('');

  // Add Capital Form
  const [addCapitalAmount, setAddCapitalAmount] = useState<number>(20000);
  const [addCapitalDate, setAddCapitalDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [addCapitalAccountId, setAddCapitalAccountId] = useState(financialAccounts[0]?.id || '');
  const [addCapitalNotes, setAddCapitalNotes] = useState('');

  const [isFinalizing, setIsFinalizing] = useState(false);

  const loadAdminInvestorData = async (year = selectedYear, month = selectedMonth) => {
    try {
      setIsLoadingInvestorData(true);
      const res = await fetch(`/api/admin/investors?year=${year}&month=${month}`);
      const json = await res.json();
      if (json.success) {
        setAdminInvestorData(json.data);
      }
    } catch (err) {
      console.error('Error loading admin investor data:', err);
    } finally {
      setIsLoadingInvestorData(false);
    }
  };

  const loadAccountStatement = async () => {
    try {
      setIsLoadingStatement(true);
      const params: Record<string, string> = {
        accountId: statementAccountId,
        range: statementRange,
      };
      if (statementRange === 'custom') {
        if (customStmtStart) params.startDate = customStmtStart;
        if (customStmtEnd) params.endDate = customStmtEnd;
      }
      const res = await api.accounting.getLedger(params);
      if (res && res.success) {
        setStatementData(res.data);
      }
    } catch (err: any) {
      console.error('Error loading account statement:', err);
    } finally {
      setIsLoadingStatement(false);
    }
  };

  const loadCashFlow = async () => {
    try {
      setIsLoadingCashFlow(true);
      const params: Record<string, string> = {
        range: cashFlowRange,
      };
      if (cashFlowRange === 'custom') {
        if (customCfStart) params.startDate = customCfStart;
        if (customCfEnd) params.endDate = customCfEnd;
      }
      const res = await api.accounting.getCashFlow(params);
      if (res && res.success) {
        setCashFlowData(res.data);
      }
    } catch (err: any) {
      console.error('Error loading cash flow:', err);
    } finally {
      setIsLoadingCashFlow(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'statements') {
      loadAccountStatement();
    }
  }, [activeTab, statementAccountId, statementRange, customStmtStart, customStmtEnd]);

  useEffect(() => {
    if (activeTab === 'cash_flow') {
      loadCashFlow();
    }
  }, [activeTab, cashFlowRange, customCfStart, customCfEnd]);

  // Synchronize modal account selections when financial accounts load
  useEffect(() => {
    if (financialAccounts && financialAccounts.length > 0) {
      if (!targetAccountId || !financialAccounts.some(a => a.id === targetAccountId)) {
        setTargetAccountId(financialAccounts[0].id);
      }
      if (!fromAccountId || !financialAccounts.some(a => a.id === fromAccountId)) {
        setFromAccountId(financialAccounts[0].id);
      }
      if (!toAccountId || !financialAccounts.some(a => a.id === toAccountId)) {
        setToAccountId(financialAccounts[1]?.id || financialAccounts[0].id);
      }
      if (!withdrawalAccountId || !financialAccounts.some(a => a.id === withdrawalAccountId)) {
        setWithdrawalAccountId(financialAccounts[0].id);
      }
      if (!statementAccountId || !financialAccounts.some(a => a.id === statementAccountId)) {
        setStatementAccountId(financialAccounts[0].id);
      }
      if (!otherIncomeAccountId || !financialAccounts.some(a => a.id === otherIncomeAccountId)) {
        setOtherIncomeAccountId(financialAccounts[0].id);
      }
      if (!newInvestorAccountId || !financialAccounts.some(a => a.id === newInvestorAccountId)) {
        setNewInvestorAccountId(financialAccounts[0].id);
      }
      if (!addCapitalAccountId || !financialAccounts.some(a => a.id === addCapitalAccountId)) {
        setAddCapitalAccountId(financialAccounts[0].id);
      }
    }
  }, [financialAccounts]);

  const handleOtherIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otherIncomeAmount <= 0) {
      alert('Income amount must be greater than 0.');
      return;
    }
    if (!otherIncomeDesc.trim()) {
      alert('Description is required for other income.');
      return;
    }
    setIsSubmittingOtherIncome(true);
    try {
      const res = await recordOtherIncome({
        category: otherIncomeCategory,
        amount: Number(otherIncomeAmount),
        date: otherIncomeDate,
        accountId: otherIncomeAccountId,
        description: otherIncomeDesc.trim(),
        receivedFrom: otherIncomeFrom.trim() || undefined,
        reference: otherIncomeRef.trim() || undefined,
      });
      if (res.success) {
        setShowOtherIncomeModal(false);
        setOtherIncomeAmount(1000);
        setOtherIncomeDesc('');
        setOtherIncomeFrom('');
        setOtherIncomeRef('');
        if (activeTab === 'statements') loadAccountStatement();
        if (activeTab === 'cash_flow') loadCashFlow();
      }
    } finally {
      setIsSubmittingOtherIncome(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawalAmount <= 0) {
      alert('Withdrawal amount must be greater than 0.');
      return;
    }
    if (!withdrawalOwner.trim()) {
      alert('Owner name is required.');
      return;
    }
    setIsSubmittingWithdrawal(true);
    try {
      const res = await recordOwnerWithdrawal({
        ownerName: withdrawalOwner.trim(),
        amount: Number(withdrawalAmount),
        date: withdrawalDate,
        sourceAccountId: withdrawalAccountId,
        purpose: withdrawalPurpose.trim() || undefined,
        reference: withdrawalRef.trim() || undefined,
      });
      if (res.success) {
        setShowWithdrawalModal(false);
        setWithdrawalAmount(5000);
        setWithdrawalPurpose('Personal Drawing');
        setWithdrawalRef('');
        if (activeTab === 'statements') loadAccountStatement();
        if (activeTab === 'cash_flow') loadCashFlow();
      }
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const handleReversalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reversalReason.trim()) {
      alert('Please provide a mandatory reversal reason for audit trail integrity.');
      return;
    }
    setIsSubmittingReversal(true);
    try {
      const res = await reverseTransaction({
        referenceNumber: itemToReverse?.referenceNumber || itemToReverse?.id,
        reason: reversalReason.trim(),
      });
      if (res.success) {
        setShowReversalModal(false);
        setItemToReverse(null);
        setReversalReason('');
        if (activeTab === 'statements') loadAccountStatement();
        if (activeTab === 'cash_flow') loadCashFlow();
      }
    } finally {
      setIsSubmittingReversal(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'investments') {
      loadAdminInvestorData(selectedYear, selectedMonth);
    }
  }, [activeTab, selectedYear, selectedMonth]);

  const handleCreateInvestorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvestorName.trim() || !newInvestorEmail.trim() || !newInvestorPassword.trim()) {
      alert('Please fill in name, email, and password.');
      return;
    }

    try {
      const res = await fetch('/api/admin/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-investor',
          name: newInvestorName.trim(),
          email: newInvestorEmail.trim(),
          phone: newInvestorPhone.trim(),
          password: newInvestorPassword.trim(),
          initialAmount: newInvestorInitialAmount,
          depositAccountId: newInvestorAccountId || financialAccounts[0]?.id,
          date: newInvestorDate,
          notes: newInvestorNotes.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowCreateInvestorModal(false);
        setNewInvestorName('');
        setNewInvestorEmail('');
        setNewInvestorPhone('');
        setNewInvestorPassword('');
        setNewInvestorInitialAmount(50000);
        setNewInvestorNotes('');
        loadAdminInvestorData();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Request failed: ${err.message}`);
    }
  };

  const handleAddCapitalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestorForCapital || addCapitalAmount <= 0) {
      alert('Please specify a valid capital amount.');
      return;
    }

    try {
      const res = await fetch('/api/admin/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-investment',
          investorId: selectedInvestorForCapital.id,
          amount: addCapitalAmount,
          depositAccountId: addCapitalAccountId || financialAccounts[0]?.id,
          date: addCapitalDate,
          notes: addCapitalNotes.trim(),
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        setShowAddCapitalToInvestorModal(false);
        setSelectedInvestorForCapital(null);
        setAddCapitalAmount(20000);
        setAddCapitalNotes('');
        loadAdminInvestorData();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Request failed: ${err.message}`);
    }
  };

  const handleFinalizePeriod = async () => {
    if (!confirm(`Are you sure you want to finalize and lock the financial period for ${adminInvestorData?.currentPreview?.periodLabel}? This will freeze investor profit calculations for this month.`)) {
      return;
    }
    try {
      setIsFinalizing(true);
      const res = await fetch('/api/admin/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalize-month',
          year: selectedYear,
          month: selectedMonth,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        loadAdminInvestorData();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Finalization failed: ${err.message}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleReopenPeriod = async () => {
    if (!confirm(`Reopening will unlock this financial period for modifications. Are you sure?`)) {
      return;
    }
    try {
      setIsFinalizing(true);
      const res = await fetch('/api/admin/investors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reopen-month',
          year: selectedYear,
          month: selectedMonth,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert(json.message);
        loadAdminInvestorData();
      } else {
        alert(`Error: ${json.error}`);
      }
    } catch (err: any) {
      alert(`Reopen failed: ${err.message}`);
    } finally {
      setIsFinalizing(false);
    }
  };

  // Calculations
  // Total Gross Sales Revenue
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);

  // Completed Services Revenue
  const totalServiceRevenue = services
    .filter(s => s.status === 'Completed')
    .reduce((sum, s) => sum + (s.totalBill || 0), 0);

  const totalBusinessRevenue = totalSalesRevenue + totalServiceRevenue;

  // True Direct Cost of Goods Sold (COGS)
  const totalCOGS = sales.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const unitCost = prod?.costPrice || (item.unitPrice * 0.78);
      return iSum + (unitCost * item.quantity);
    }, 0);
  }, 0);

  // Collections received (Sales paid + EMI collected)
  const salesPaidTotal = sales.reduce((sum, s) => sum + s.paidAmount, 0);
  const emiPaidTotal = emiPayments.reduce((sum, p) => sum + p.amount + (p.penaltyPaid || 0), 0);
  const totalCashCollected = salesPaidTotal + emiPaidTotal;

  // Operating Expenses
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Gross & Net Operating Profit
  const grossProfit = totalBusinessRevenue - totalCOGS;
  const netOperatingProfit = grossProfit - totalOperatingExpenses;

  // Receivables (Customer Dues + Pending EMI)
  const customerDirectDue = customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
  const pendingEmiReceivables = emiAccounts
    .filter(e => e.status === 'ACTIVE')
    .reduce((sum, e) => sum + e.remainingBalance, 0);
  const totalReceivables = customerDirectDue + pendingEmiReceivables;

  // Payables (Supplier balances)
  const totalPayables = suppliers.reduce((sum, s) => sum + s.currentPayable, 0);

  // Total Liquid Cash & Bank Balances
  const totalLiquidCash = financialAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Total Capital Injected (Investments)
  const totalCapitalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);

  // Financial Trend Data for Chart
  const monthlyFinancialData = [
    { month: 'Apr', revenue: 280000, cogs: 210000, expenses: 38000, profit: 32000 },
    { month: 'May', revenue: 340000, cogs: 255000, expenses: 42000, profit: 43000 },
    { month: 'Jun', revenue: 410000, cogs: 305000, expenses: 45000, profit: 60000 },
    { month: 'Jul', revenue: 390000, cogs: 290000, expenses: 44000, profit: 56000 },
    { month: 'Aug', revenue: 480000, cogs: 360000, expenses: 52000, profit: 68000 },
    { month: 'Sep (Current)', revenue: totalBusinessRevenue, cogs: Math.round(totalCOGS), expenses: totalOperatingExpenses, profit: Math.round(netOperatingProfit) }
  ];

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      alert('Source and destination accounts must be different.');
      return;
    }
    if (transferAmount <= 0) {
      alert('Transfer amount must be positive.');
      return;
    }

    const res = await transferFunds(
      fromAccountId,
      toAccountId,
      transferAmount,
      0,
      transferNotes || `Transfer Ref: ${transferRef || 'DIRECT'}`
    );

    if (res.success) {
      setShowTransferModal(false);
      setTransferAmount(10000);
      setTransferRef('');
      setTransferNotes('');
    } else {
      alert(`Transfer failed: ${res.error}`);
    }
  };

  const handleInvestmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investorName.trim()) {
      alert('Please enter investor name.');
      return;
    }
    if (investAmount <= 0) {
      alert('Investment amount must be positive.');
      return;
    }

    const targetAcc = financialAccounts.find(a => a.id === targetAccountId) || financialAccounts[0];
    const resolvedMethod = investPaymentMethod || (targetAcc?.type === 'CASH' ? 'Cash' : 'Bank Transfer');

    setIsSubmittingInvest(true);
    try {
      const res = await recordInvestment({
        investorName: investorName.trim(),
        amount: investAmount,
        date: investDate || new Date().toISOString().split('T')[0],
        investmentType: investType,
        depositAccountId: targetAcc?.id || 'acc-1',
        paymentMethod: resolvedMethod as any,
        reference: investRef.trim() || undefined,
        status: 'ACTIVE',
        notes: investNotes.trim() || undefined,
        investorPhone: investorPhone.trim() || undefined,
        investorEmail: investorEmail.trim() || undefined,
        investorAddress: investorAddress.trim() || undefined,
        organization: investorOrganization.trim() || undefined,
        purpose: investPurpose.trim() || undefined,
        description: investDescription.trim() || undefined,
      });

      if (res.success && res.investment) {
        setShowInvestmentModal(false);
        setNewlyCreatedInvestment(res.investment);
        setShowSuccessModal(true);

        // Reset form
        setInvestorName('');
        setInvestorPhone('');
        setInvestorEmail('');
        setInvestorAddress('');
        setInvestorOrganization('');
        setInvestAmount(300000);
        setInvestPurpose('Business Capital');
        setInvestDescription('');
        setInvestRef('');
        setInvestNotes('');
      } else {
        alert(`Failed to record investment: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      alert(`Error recording investment: ${err.message}`);
    } finally {
      setIsSubmittingInvest(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <PieChartIcon size={28} color="var(--brand-primary)" />
            Commercial Accounting, Accounts & Capital
          </h1>
          <p>
            Real-time P&L statement, Cash & Bank accounts, fund transfers, capital investments, and receivables.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
          >
            <Printer size={15} /> Print Statement
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowOtherIncomeModal(true)}
            style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
          >
            <Plus size={15} /> Other Income
          </button>
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => setShowWithdrawalModal(true)}
            style={{ color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            <ArrowDown size={15} /> Owner Withdrawal
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowTransferModal(true)}
          >
            <ArrowLeftRight size={15} /> Transfer Funds
          </button>
          <button 
            className="btn btn-warning btn-sm"
            onClick={() => setShowInvestmentModal(true)}
          >
            <Plus size={15} /> Add Capital / Investment
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="tabs-nav" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
        <button 
          className={`tab-btn ${activeTab === 'pnl' ? 'active' : ''}`}
          onClick={() => setActiveTab('pnl')}
        >
          P&L Statement & Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Cash & Bank Accounts ({financialAccounts.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'statements' ? 'active' : ''}`}
          onClick={() => setActiveTab('statements')}
        >
          <BookOpen size={15} style={{ marginRight: '6px' }} /> Account Statement & Central Ledger
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cash_flow' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash_flow')}
        >
          <TrendingUp size={15} style={{ marginRight: '6px' }} /> Cash Flow Report
        </button>
        <button 
          className={`tab-btn ${activeTab === 'investments' ? 'active' : ''}`}
          onClick={() => setActiveTab('investments')}
        >
          Capital & Investments ({investments.length})
        </button>
      </div>

      {/* TAB 1: P&L STATEMENT */}
      {activeTab === 'pnl' && (
        <>
          {/* Main KPI Row */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Gross Operating Revenue</span>
                <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="kpi-value">৳{totalBusinessRevenue.toLocaleString()}</div>
              <div className="kpi-footer" style={{ color: '#10b981' }}>
                Sales (৳{totalSalesRevenue.toLocaleString()}) + Service (৳{totalServiceRevenue.toLocaleString()})
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Net Operating Profit</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: netOperatingProfit >= 0 ? '#10b981' : '#ef4444' }}>
                ৳{Math.round(netOperatingProfit).toLocaleString()}
              </div>
              <div className="kpi-footer" style={{ color: '#10b981' }}>
                Gross Profit ৳{Math.round(grossProfit).toLocaleString()} − Exp ৳{totalOperatingExpenses.toLocaleString()}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Total Receivables (বকেয়া)</span>
                <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
                  <Wallet size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#f59e0b' }}>৳{totalReceivables.toLocaleString()}</div>
              <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
                EMI: ৳{pendingEmiReceivables.toLocaleString()} • Customer Due: ৳{customerDirectDue.toLocaleString()}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Supplier Payables (পাওনাদার)</span>
                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                  <Receipt size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#ef4444' }}>৳{totalPayables.toLocaleString()}</div>
              <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
                Dues to distributors & suppliers
              </div>
            </div>
          </div>

          {/* Financial Bar Chart: Revenue vs COGS vs Net Profit */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Monthly Financial Performance & Margins</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Real Revenue vs Actual COGS vs Operating Expenses</p>
              </div>
              <span className="badge badge-info">৳ BDT</span>
            </div>

            <div style={{ height: '280px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyFinancialData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `৳${v >= 1000 ? `${Math.round(v/1000)}k` : v}`} />
                  <Tooltip 
                    formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px' }} 
                  />
                  <Legend />
                  <Bar dataKey="revenue" name="Total Revenue (৳)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cogs" name="Actual COGS (৳)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Operating Expenses (৳)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Net Profit (৳)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Statement Table (P&L Breakdown) */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem' }}>
              Standard Profit & Loss Statement (September 2026)
            </h3>

            <div className="table-container">
              <table className="erp-table">
                <tbody>
                  {/* Income */}
                  <tr style={{ background: 'var(--bg-card-muted)', fontWeight: 'bold' }}>
                    <td colSpan={2}>1. OPERATING REVENUE / INCOME</td>
                    <td style={{ textAlign: 'right' }}>Amount (৳)</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '2rem' }}>POS Regular Cash Sales Revenue</td>
                    <td>Immediate cleared payments</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      ৳{sales.filter(s => s.saleType === 'REGULAR').reduce((sum, s) => sum + s.grandTotal, 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '2rem' }}>Laptop EMI Financed Sales</td>
                    <td>Booked hire-purchase contracts</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      ৳{sales.filter(s => s.saleType === 'EMI').reduce((sum, s) => sum + s.grandTotal, 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '2rem' }}>Service & Repair Completed Revenue</td>
                    <td>Completed electrical, CCTV & laptop repair labor</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>
                      ৳{totalServiceRevenue.toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid var(--border-color)' }}>
                    <td>Total Gross Operating Revenue</td>
                    <td></td>
                    <td style={{ textAlign: 'right', color: '#2563eb', fontSize: '1rem' }}>
                      ৳{totalBusinessRevenue.toLocaleString()}
                    </td>
                  </tr>

                  {/* COGS */}
                  <tr style={{ background: 'var(--bg-card-muted)', fontWeight: 'bold' }}>
                    <td colSpan={2}>2. DIRECT COST OF GOODS SOLD (COGS)</td>
                    <td style={{ textAlign: 'right' }}></td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '2rem' }}>Actual Recorded Cost of Sold Units</td>
                    <td>Computed from supplier purchase price per unit</td>
                    <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: '600' }}>
                      -৳{Math.round(totalCOGS).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid var(--border-color)' }}>
                    <td>Gross Profit Margin</td>
                    <td></td>
                    <td style={{ textAlign: 'right', color: '#10b981', fontSize: '1rem' }}>
                      ৳{Math.round(grossProfit).toLocaleString()}
                    </td>
                  </tr>

                  {/* Expenses */}
                  <tr style={{ background: 'var(--bg-card-muted)', fontWeight: 'bold' }}>
                    <td colSpan={2}>3. OPERATING EXPENSES (Vouchers)</td>
                    <td style={{ textAlign: 'right' }}></td>
                  </tr>
                  {expenses.map(exp => (
                    <tr key={exp.id}>
                      <td style={{ paddingLeft: '2rem' }}>{exp.category}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{exp.description}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>-৳{exp.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid var(--border-color)' }}>
                    <td>Total Operating Expenses</td>
                    <td></td>
                    <td style={{ textAlign: 'right', color: '#ef4444' }}>-৳{totalOperatingExpenses.toLocaleString()}</td>
                  </tr>

                  {/* Net Profit */}
                  <tr style={{ background: 'var(--bg-active)', borderTop: '2px solid var(--brand-primary)', fontSize: '1.1rem', fontWeight: '800' }}>
                    <td>NET OPERATING PROFIT (নিট লাভ)</td>
                    <td>Gross Profit − Operating Expenses</td>
                    <td style={{ textAlign: 'right', color: '#10b981' }}>৳{Math.round(netOperatingProfit).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: CASH & BANK ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Executive Multi-Account Liquidity Dashboard */}
          <div className="erp-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)', border: '1px solid rgba(0, 140, 255, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.4rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> Central Account Ledger Engine Active
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                  Total Available Money: ৳{financialAccounts.reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                </h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Live mathematical balances derived directly from single-source-of-truth transaction ledger entries.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowTransferModal(true)}
                >
                  <ArrowLeftRight size={14} /> Transfer Funds
                </button>
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    setStatementAccountId(financialAccounts[0]?.id || 'acc-1');
                    setActiveTab('statements');
                  }}
                  style={{ color: '#38bdf8', borderColor: '#38bdf8' }}
                >
                  <BookOpen size={14} /> View Account Statement
                </button>
              </div>
            </div>

            {/* Account Type Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.85rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Wallet size={14} /> MAIN CASH / DRAWER
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>
                  ৳{financialAccounts.filter(a => a.type === 'CASH' || a.id === 'acc-1').reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Showroom Counter Cash</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.85rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Landmark size={14} /> BANK ACCOUNTS
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>
                  ৳{financialAccounts.filter(a => a.type === 'BANK').reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Commercial Banking</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.85rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ec4899', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={14} /> bKash WALLET
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ec4899', marginTop: '4px' }}>
                  ৳{financialAccounts.filter(a => a.id.toLowerCase().includes('bkash') || a.name.toLowerCase().includes('bkash')).reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Merchant & Personal</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', padding: '0.85rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontSize: '0.75rem', color: '#ea580c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CreditCard size={14} /> Nagad WALLET
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ea580c', marginTop: '4px' }}>
                  ৳{financialAccounts.filter(a => a.id.toLowerCase().includes('nagad') || a.name.toLowerCase().includes('nagad')).reduce((sum, a) => sum + Number(a.balance), 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Digital Cash Agent</div>
              </div>
            </div>
          </div>

          {/* Individual Accounts Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1rem' }}>
            {financialAccounts.map(acc => {
              const isCash = acc.type === 'CASH' || acc.id === 'acc-1';
              const isBank = acc.type === 'BANK';
              const isBkash = acc.id.includes('bkash') || acc.name.toLowerCase().includes('bkash');
              const isNagad = acc.id.includes('nagad') || acc.name.toLowerCase().includes('nagad');
              const themeColor = isCash ? '#10b981' : isBank ? '#38bdf8' : isBkash ? '#ec4899' : isNagad ? '#ea580c' : 'var(--brand-primary)';

              return (
                <div key={acc.id} className="erp-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `4px solid ${themeColor}` }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{acc.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {acc.accountNumber || (isCash ? 'Physical Cash Drawer' : acc.type)} {acc.bankName ? `• ${acc.bankName}` : ''}
                        </div>
                      </div>
                      <span className="badge" style={{ background: `${themeColor}20`, color: themeColor, fontWeight: 700, fontSize: '0.75rem' }}>
                        {acc.type}
                      </span>
                    </div>

                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: Number(acc.balance) >= 0 ? themeColor : '#ef4444', margin: '0.75rem 0' }}>
                      ৳{Number(acc.balance).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setStatementAccountId(acc.id);
                        setActiveTab('statements');
                      }}
                      style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <BookOpen size={12} /> Statement
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        setFromAccountId(acc.id);
                        setShowTransferModal(true);
                      }}
                      style={{ fontSize: '0.75rem' }}
                    >
                      Transfer Out &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: ACCOUNT STATEMENTS & CENTRAL LEDGER */}
      {activeTab === 'statements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Statement Filter Toolbar */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <label style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Account:</label>
                <select 
                  className="form-control"
                  style={{ minWidth: '220px', fontWeight: 700 }}
                  value={statementAccountId}
                  onChange={e => setStatementAccountId(e.target.value)}
                >
                  {financialAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type}) — ৳{Number(a.balance).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Selector */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'all', label: 'All Time' },
                  { id: 'custom', label: 'Custom' },
                ].map(r => (
                  <button 
                    key={r.id}
                    className={`btn btn-sm ${statementRange === r.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setStatementRange(r.id)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range Inputs */}
            {statementRange === 'custom' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From:</label>
                <input 
                  type="date"
                  className="form-control"
                  style={{ maxWidth: '170px' }}
                  value={customStmtStart}
                  onChange={e => setCustomStmtStart(e.target.value)}
                />
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To:</label>
                <input 
                  type="date"
                  className="form-control"
                  style={{ maxWidth: '170px' }}
                  value={customStmtEnd}
                  onChange={e => setCustomStmtEnd(e.target.value)}
                />
              </div>
            )}

            {/* Statement Summary KPI Cards */}
            {statementData && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Opening Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ৳{Number(statementData.openingBalance || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Total Inflows (Debit +)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                    +৳{Number(statementData.totalDebit || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Total Outflows (Credit −)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}>
                    −৳{Number(statementData.totalCredit || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(0, 140, 255, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>Closing / Available Balance</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
                    ৳{Number(statementData.closingBalance || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statement Transaction Ledger Table */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} color="var(--brand-primary)" />
                  Account Statement Ledger Entries
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Every financial movement affecting this account. Click any row to inspect transaction audit details.
                </p>
              </div>

              <button 
                className="btn btn-outline btn-sm"
                onClick={loadAccountStatement}
                disabled={isLoadingStatement}
              >
                <RefreshCw size={13} className={isLoadingStatement ? 'animate-spin' : ''} /> Refresh Statement
              </button>
            </div>

            {isLoadingStatement ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
                Loading central ledger entries...
              </div>
            ) : statementData?.entries && statementData.entries.length > 0 ? (
              <div className="table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Date & Time</th>
                      <th>Reference #</th>
                      <th>Type</th>
                      <th>Description</th>
                      <th style={{ textAlign: 'right' }}>Debit (+)</th>
                      <th style={{ textAlign: 'right' }}>Credit (−)</th>
                      <th style={{ textAlign: 'right' }}>Running Balance</th>
                      <th style={{ textAlign: 'center' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.entries.map((entry: any) => {
                      const isDebit = Number(entry.debit) > 0;
                      const isReversed = entry.status === 'REVERSED';

                      return (
                        <tr 
                          key={entry.id}
                          style={{
                            cursor: 'pointer',
                            opacity: isReversed ? 0.65 : 1,
                            background: isReversed ? 'rgba(239, 68, 68, 0.04)' : undefined
                          }}
                          onClick={() => setSelectedLedgerItem(entry)}
                          title="Click to view transaction details"
                        >
                          <td style={{ fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                            {new Date(entry.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.825rem' }}>
                            {entry.referenceNumber}
                          </td>
                          <td>
                            <span className={`badge ${
                              entry.referenceType.includes('SALE') ? 'badge-success' :
                              entry.referenceType.includes('PURCHASE') ? 'badge-warning' :
                              entry.referenceType.includes('EXPENSE') ? 'badge-danger' :
                              entry.referenceType.includes('INVESTMENT') ? 'badge-info' :
                              'badge-secondary'
                            }`} style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                              {entry.referenceType}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.825rem', maxWidth: '280px' }}>
                            {entry.description}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: isDebit ? '#10b981' : 'var(--text-muted)' }}>
                            {isDebit ? `+৳${Number(entry.debit).toLocaleString()}` : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: !isDebit ? '#ef4444' : 'var(--text-muted)' }}>
                            {!isDebit ? `−৳${Number(entry.credit).toLocaleString()}` : '—'}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>
                            ৳{Number(entry.runningBalance).toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${isReversed ? 'badge-danger' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                              {entry.status || 'COMPLETED'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                            {!isReversed && (
                              <button 
                                className="btn btn-ghost btn-sm"
                                style={{ color: '#ef4444', fontSize: '0.725rem', padding: '0.2rem 0.5rem' }}
                                onClick={() => {
                                  setItemToReverse(entry);
                                  setShowReversalModal(true);
                                }}
                                title="Reverse this financial movement"
                              >
                                <RotateCcw size={12} /> Reverse
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No ledger entries found for this account in the selected period.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CASH FLOW REPORT */}
      {activeTab === 'cash_flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Filter Bar */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="#10b981" />
                  Periodic Cash Flow Statement
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Cash In, Cash Out, Inter-account transfers and net liquidity change
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'custom', label: 'Custom' },
                ].map(r => (
                  <button 
                    key={r.id}
                    className={`btn btn-sm ${cashFlowRange === r.id ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setCashFlowRange(r.id)}
                    style={{ fontSize: '0.78rem' }}
                  >
                    {r.label}
                  </button>
                ))}
                <button 
                  className="btn btn-outline btn-sm"
                  onClick={loadCashFlow}
                  disabled={isLoadingCashFlow}
                >
                  <RefreshCw size={13} className={isLoadingCashFlow ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {cashFlowRange === 'custom' && (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From:</label>
                <input 
                  type="date"
                  className="form-control"
                  style={{ maxWidth: '170px' }}
                  value={customCfStart}
                  onChange={e => setCustomCfStart(e.target.value)}
                />
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To:</label>
                <input 
                  type="date"
                  className="form-control"
                  style={{ maxWidth: '170px' }}
                  value={customCfEnd}
                  onChange={e => setCustomCfEnd(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Cash Flow KPI Summary Cards */}
          {cashFlowData && (
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-title">Opening Cash Balance</span>
                  <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                    <Wallet size={18} />
                  </div>
                </div>
                <div className="kpi-value">৳{Number(cashFlowData.openingBalance || 0).toLocaleString()}</div>
                <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>Start of period liquidity</div>
              </div>

              <div className="kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
                <div className="kpi-top">
                  <span className="kpi-title">Total Cash In</span>
                  <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                    <ArrowUpRight size={18} />
                  </div>
                </div>
                <div className="kpi-value" style={{ color: '#10b981' }}>
                  +৳{Number(cashFlowData.totalCashIn || 0).toLocaleString()}
                </div>
                <div className="kpi-footer" style={{ color: '#10b981' }}>Receipts + Capital + Dues</div>
              </div>

              <div className="kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
                <div className="kpi-top">
                  <span className="kpi-title">Total Cash Out</span>
                  <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                    <ArrowDownRight size={18} />
                  </div>
                </div>
                <div className="kpi-value" style={{ color: '#ef4444' }}>
                  −৳{Number(cashFlowData.totalCashOut || 0).toLocaleString()}
                </div>
                <div className="kpi-footer" style={{ color: '#ef4444' }}>Purchases + Expenses + Drawings</div>
              </div>

              <div className="kpi-card" style={{ borderLeft: `4px solid ${Number(cashFlowData.netCashFlow || 0) >= 0 ? '#10b981' : '#ef4444'}` }}>
                <div className="kpi-top">
                  <span className="kpi-title">Net Cash Flow</span>
                  <div className="kpi-icon" style={{
                    background: Number(cashFlowData.netCashFlow || 0) >= 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                    color: Number(cashFlowData.netCashFlow || 0) >= 0 ? '#10b981' : '#ef4444'
                  }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="kpi-value" style={{ color: Number(cashFlowData.netCashFlow || 0) >= 0 ? '#10b981' : '#ef4444' }}>
                  {Number(cashFlowData.netCashFlow || 0) >= 0 ? '+' : ''}৳{Number(cashFlowData.netCashFlow || 0).toLocaleString()}
                </div>
                <div className="kpi-footer" style={{ color: 'var(--text-muted)' }}>Closing: ৳{Number(cashFlowData.closingBalance || 0).toLocaleString()}</div>
              </div>
            </div>
          )}

          {/* Categorized Inflow vs Outflow Breakdown */}
          {cashFlowData?.breakdown && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {/* Inflow Breakdown */}
              <div className="erp-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 800 }}>
                  <ArrowUp size={16} /> Cash Inflow Sources
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'POS & Upfront Cash Sales', val: cashFlowData.breakdown.sales || 0 },
                    { label: 'Customer Due Collections', val: cashFlowData.breakdown.customerDues || 0 },
                    { label: 'Laptop EMI Financing Receipts', val: cashFlowData.breakdown.emi || 0 },
                    { label: 'Other Business Income', val: cashFlowData.breakdown.otherIncome || 0 },
                    { label: 'Capital Investments (Equity)', val: cashFlowData.breakdown.investments || 0 },
                    { label: 'Inter-Account Transfers In', val: cashFlowData.transfersIn || 0 },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'var(--bg-card-muted)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.825rem' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.val > 0 ? '#10b981' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                        ৳{Number(item.val).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outflow Breakdown */}
              <div className="erp-card" style={{ padding: '1.25rem' }}>
                <h4 style={{ margin: '0 0 1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.95rem', fontWeight: 800 }}>
                  <ArrowDown size={16} /> Cash Outflow Allocations
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { label: 'Inventory Purchases (Upfront Cash)', val: cashFlowData.breakdown.purchases || 0 },
                    { label: 'Supplier Due Payments', val: cashFlowData.breakdown.supplierPayments || 0 },
                    { label: 'Operating Business Expenses', val: cashFlowData.breakdown.expenses || 0 },
                    { label: 'Owner Drawings & Withdrawals', val: cashFlowData.breakdown.withdrawals || 0 },
                    { label: 'Staff Salaries Disbursed', val: cashFlowData.breakdown.salaries || 0 },
                    { label: 'Customer RMA Returns & Refunds', val: cashFlowData.breakdown.refunds || 0 },
                    { label: 'Inter-Account Transfers Out', val: cashFlowData.transfersOut || 0 },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0.65rem', background: 'var(--bg-card-muted)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.825rem' }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.val > 0 ? '#ef4444' : 'var(--text-muted)', fontSize: '0.85rem' }}>
                        ৳{Number(item.val).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CAPITAL & INVESTMENTS */}
      {activeTab === 'investments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Architecture Banner */}
          <div className="erp-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 800 }}>
                  <ShieldCheck size={20} />
                  <span style={{ fontSize: '1.1rem' }}>Investor Capital & 25% Net Profit Sharing Engine</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '650px', lineHeight: 1.6 }}>
                  NEED ELECTRO ERP strictly maintains financial separation: investor capital is held as equity liquidity, separate from operating revenues. Monthly profit distribution is calculated strictly as <strong>25% of Net Operating Profit</strong> allocated proportionally to active investor capital.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--bg-card)', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Active Investor Capital</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981' }}>
                    ৳{(adminInvestorData?.totalActiveInvestment || totalCapitalInvested).toLocaleString()}
                  </div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'var(--border-color)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profit Pool Share</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
                    25.0%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 1: INVESTOR ROSTER & EQUITY SHARES */}
          <div className="erp-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Users size={18} color="var(--brand-primary)" />
                  Investor Accounts & Equity Ownership
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Manage authorized investor logins and their respective capital stakes
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowCreateInvestorModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} /> Create Investor Account
                </button>
                <button 
                  className="btn btn-warning btn-sm"
                  onClick={() => setShowInvestmentModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} /> Add Capital
                </button>
              </div>
            </div>

            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Investor ID</th>
                    <th>Investor Name</th>
                    <th>Login Email</th>
                    <th>Contact Phone</th>
                    <th style={{ textAlign: 'right' }}>Active Capital (৳)</th>
                    <th style={{ textAlign: 'center' }}>Equity Stake (%)</th>
                    <th style={{ textAlign: 'center' }}>Portal Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminInvestorData?.investors && adminInvestorData.investors.length > 0 ? (
                    adminInvestorData.investors.map((inv: any) => (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                          {inv.investorId}
                        </td>
                        <td style={{ fontWeight: 700 }}>
                          {inv.name}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {inv.email}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {inv.phone || '—'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                          ৳{inv.totalInvestment.toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className="badge badge-info" style={{ fontWeight: 800, fontSize: '0.8rem' }}>
                            {inv.sharePercentage}%
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span className={`badge ${inv.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => {
                              setSelectedInvestorForCapital(inv);
                              setShowAddCapitalToInvestorModal(true);
                            }}
                            title="Add more capital to this investor"
                            style={{ color: 'var(--brand-primary)', fontWeight: 700 }}
                          >
                            + Add Capital
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        {isLoadingInvestorData ? 'Loading investor roster...' : 'No investor profiles found. Click "Create Investor Account" above to register an investor.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 2: MONTHLY PROFIT SETTLEMENT & FINALIZATION */}
          <div className="erp-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={18} color="#10b981" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                    Monthly Profit Settlement & Finalization (25% Investor Pool)
                  </h3>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Review live monthly accounting performance, calculate 25% pool distribution, and lock the period
                </p>
              </div>

              {/* Month Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select
                  className="form-control"
                  style={{ width: '130px' }}
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>

                <select
                  className="form-control"
                  style={{ width: '90px' }}
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                </select>
              </div>
            </div>

            {/* Financial Performance Overview for Selected Month */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>1. Monthly Revenue</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                  ৳{(adminInvestorData?.currentPreview?.revenue || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Completed Sales</div>
              </div>

              <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>2. Cost of Goods (COGS)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.25rem' }}>
                  ৳{(adminInvestorData?.currentPreview?.cogs || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Direct Inventory Cost</div>
              </div>

              <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>3. Operating Expenses</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ef4444', marginTop: '0.25rem' }}>
                  ৳{(adminInvestorData?.currentPreview?.expenses || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Operational Expenses</div>
              </div>

              <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>4. Net Operating Profit</div>
                <div style={{
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  color: (adminInvestorData?.currentPreview?.netProfit || 0) >= 0 ? '#10b981' : '#ef4444',
                  marginTop: '0.25rem'
                }}>
                  ৳{(adminInvestorData?.currentPreview?.netProfit || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Revenue − COGS − Expenses</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                padding: '1rem',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700 }}>5. 25% Investor Pool</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '0.25rem' }}>
                  ৳{(adminInvestorData?.currentPreview?.investorProfitPool || 0).toLocaleString()}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Distributable to Investors</div>
              </div>
            </div>

            {/* Investor Distribution Table for Selected Month */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                Investor-Wise Profit Distribution ({adminInvestorData?.currentPreview?.periodLabel})
              </div>

              <div className="table-container">
                <table className="erp-table">
                  <thead>
                    <tr>
                      <th>Investor ID</th>
                      <th>Investor Name</th>
                      <th style={{ textAlign: 'right' }}>Active Capital (৳)</th>
                      <th style={{ textAlign: 'center' }}>Equity Share (%)</th>
                      <th style={{ textAlign: 'right' }}>Calculated Profit Share (৳)</th>
                      <th style={{ textAlign: 'center' }}>Formula Validation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminInvestorData?.currentPreview?.distribution && adminInvestorData.currentPreview.distribution.length > 0 ? (
                      adminInvestorData.currentPreview.distribution.map((dist: any) => (
                        <tr key={dist.id}>
                          <td style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{dist.investorId}</td>
                          <td style={{ fontWeight: 700 }}>{dist.name}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>৳{dist.investmentAmount.toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="badge badge-info">{dist.sharePercentage}%</span>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 900, color: '#10b981', fontSize: '1rem' }}>
                            ৳{dist.profitShare.toLocaleString()}
                          </td>
                          <td style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ৳{(adminInvestorData?.currentPreview?.investorProfitPool || 0).toLocaleString()} × {dist.sharePercentage}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                          No active investors to distribute profit to.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Finalization Action Bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-card-muted)',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                {adminInvestorData?.currentPreview?.isFinalized ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-success" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                      <CheckCircle2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Finalized & Locked
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Approved by <strong>{adminInvestorData?.currentPreview?.finalizedBy || 'Super Admin'}</strong> on{' '}
                      {adminInvestorData?.currentPreview?.finalizedAt ? new Date(adminInvestorData.currentPreview.finalizedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-warning" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}>
                      <Clock size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                      Pending Finalization (Live Estimate)
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Investors currently view ongoing live figures. Finalize to lock numbers.
                    </span>
                  </div>
                )}
              </div>

              <div>
                {adminInvestorData?.currentPreview?.isFinalized ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleReopenPeriod}
                    disabled={isFinalizing}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Unlock size={14} /> Reopen Financial Period
                  </button>
                ) : (
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={handleFinalizePeriod}
                    disabled={isFinalizing}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Lock size={14} /> Finalize & Lock {adminInvestorData?.currentPreview?.periodLabel}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: ORIGINAL CAPITAL DEPOSIT REGISTRY */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Capital Injections & Investment Ledger</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>All historical capital deposits recorded into business cash/bank accounts</p>
              </div>
            </div>

            <div className="table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Investment No</th>
                    <th>Investor</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                    <th>Date</th>
                    <th>Account</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>No investments recorded yet.</div>
                        <div style={{ fontSize: '0.8rem' }}>Click &quot;Add Capital / Investment&quot; to deposit capital with automatic A4 Investment Memo generation.</div>
                      </td>
                    </tr>
                  ) : (
                    investments.map(inv => {
                      const acc = financialAccounts.find(a => a.id === inv.depositAccountId);
                      const isRev = inv.status === 'REVERSED';
                      const canReverse = (currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN') && !isRev;

                      return (
                        <tr key={inv.id}>
                          <td style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--brand-primary)' }}>
                            {inv.referenceNumber || inv.reference || inv.id}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{inv.investorName}</div>
                            {inv.organization && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.organization}</div>
                            )}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: isRev ? '#ef4444' : '#10b981' }}>
                            BDT {Number(inv.amount).toLocaleString()}
                          </td>
                          <td>
                            {inv.date ? new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{acc?.name || 'Main Cash'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{inv.paymentMethod || 'Cash'}</div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                background: isRev ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                color: isRev ? '#ef4444' : '#10b981',
                                border: `1px solid ${isRev ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                              }}
                            >
                              {isRev ? 'REVERSED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => setActiveInvestmentMemoToPrint(inv)}
                                title="View official A4 Investment Memo"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <FileText size={13} />
                                View Memo
                              </button>

                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setActiveInvestmentMemoToPrint(inv);
                                  setTimeout(() => window.print(), 300);
                                }}
                                title="Print A4 Investment Memo"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <Printer size={13} />
                                Print
                              </button>

                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => setActiveInvestmentMemoToPrint(inv)}
                                title="Download official A4 PDF"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              >
                                <Download size={13} />
                                PDF
                              </button>

                              {canReverse && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => {
                                    setItemToReverse({
                                      referenceNumber: inv.referenceNumber || inv.reference,
                                      referenceType: 'INVESTMENT',
                                      description: `Capital Investment by ${inv.investorName}`,
                                      debit: inv.amount,
                                      credit: 0,
                                    });
                                    setShowReversalModal(true);
                                  }}
                                  title="Reverse investment transaction (Super Admin)"
                                  style={{ color: '#ef4444', padding: '0.25rem 0.45rem', fontSize: '0.75rem' }}
                                >
                                  <RotateCcw size={13} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FUND TRANSFER */}
      {showTransferModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title">
                <ArrowLeftRight size={20} color="var(--brand-primary)" />
                Transfer Treasury Funds Between Accounts
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowTransferModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Source Account (From)</label>
                  <select 
                    className="form-control"
                    value={fromAccountId}
                    onChange={e => setFromAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.length === 0 ? (
                      <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                    ) : (
                      financialAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Available: ৳{Number(a.balance || 0).toLocaleString()})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label">Destination Account (To)</label>
                  <select 
                    className="form-control"
                    value={toAccountId}
                    onChange={e => setToAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.length === 0 ? (
                      <option value="acc-2">Bank Asia Current Account</option>
                    ) : (
                      financialAccounts.map(a => (
                        <option key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                          {a.name} (Current: ৳{Number(a.balance || 0).toLocaleString()})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label">Transfer Amount (৳)</label>
                  <input 
                    type="number"
                    className="form-control"
                    min="1"
                    value={transferAmount}
                    onChange={e => setTransferAmount(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Reference / Slip Number (Optional)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. ATM-DEP-9941"
                    value={transferRef}
                    onChange={e => setTransferRef(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Notes</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Cash deposited from showroom drawer into City Bank"
                    value={transferNotes}
                    onChange={e => setTransferNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CAPITAL / INVESTMENT */}
      {showInvestmentModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-lg" style={{ maxWidth: '640px' }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="var(--brand-primary)" />
                Record Capital / Investment Addition
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInvestmentModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInvestmentSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '72vh', overflowY: 'auto' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.08)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  💎 Capital investments automatically credit the target cash/bank account and post to the Central Account Ledger. A certified <strong>A4 Investment Memo</strong> is immediately generated upon saving.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Investor / Partner Name *</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Amdadur Rahman"
                      value={investorName}
                      onChange={e => setInvestorName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. 01733-983752"
                      value={investorPhone}
                      onChange={e => setInvestorPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email"
                      className="form-control"
                      placeholder="e.g. investor@example.com"
                      value={investorEmail}
                      onChange={e => setInvestorEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Organization / Entity</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Need Electro Capital"
                      value={investorOrganization}
                      onChange={e => setInvestorOrganization(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Investor Address</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Kusumbag, Moulvibazar, Sylhet, Bangladesh"
                    value={investorAddress}
                    onChange={e => setInvestorAddress(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Capital Amount (৳) *</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="1"
                      value={investAmount}
                      onChange={e => setInvestAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Investment Type</label>
                    <select 
                      className="form-control"
                      value={investType}
                      onChange={e => setInvestType(e.target.value as InvestmentType)}
                    >
                      <option value="EQUITY">Equity (Owner Capital)</option>
                      <option value="SEED_FUNDING">Seed Funding (Startup Capital)</option>
                      <option value="DIRECTOR_LOAN">Director Loan</option>
                      <option value="WORKING_CAPITAL">Working Capital</option>
                      <option value="OTHER">Other Investment</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Investment Date *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={investDate}
                      onChange={e => setInvestDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Payment Method *</label>
                    <select
                      className="form-control"
                      value={investPaymentMethod}
                      onChange={e => setInvestPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="bKash">bKash Business</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Deposit Target Account *</label>
                    <select 
                      className="form-control"
                      value={targetAccountId}
                      onChange={e => setTargetAccountId(e.target.value)}
                      required
                    >
                      {financialAccounts.length === 0 ? (
                        <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                      ) : (
                        financialAccounts.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.type}) — Current: ৳{Number(a.balance || 0).toLocaleString()}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">External Reference (Optional)</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. CHQ-883921 / SLIP-102"
                      value={investRef}
                      onChange={e => setInvestRef(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Purpose</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Business Capital / Bulk Procurement"
                      value={investPurpose}
                      onChange={e => setInvestPurpose(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="form-label">Description</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Working capital injection"
                      value={investDescription}
                      onChange={e => setInvestDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Notes / Terms</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Special terms or agreements"
                    value={investNotes}
                    onChange={e => setInvestNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvestmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning" disabled={isSubmittingInvest}>
                  {isSubmittingInvest ? 'Recording Capital...' : 'Deposit Capital & Generate Memo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL: INVESTMENT ADDED & MEMO READY */}
      {showSuccessModal && newlyCreatedInvestment && (
        <InvestmentSuccessModal
          investment={newlyCreatedInvestment}
          onViewMemo={() => {
            setActiveInvestmentMemoToPrint(newlyCreatedInvestment);
            setShowSuccessModal(false);
          }}
          onPrintMemo={() => {
            setActiveInvestmentMemoToPrint(newlyCreatedInvestment);
            setShowSuccessModal(false);
            setTimeout(() => window.print(), 350);
          }}
          onDownloadPDF={() => {
            setActiveInvestmentMemoToPrint(newlyCreatedInvestment);
            setShowSuccessModal(false);
          }}
          onClose={() => {
            setShowSuccessModal(false);
            setNewlyCreatedInvestment(null);
          }}
        />
      )}

      {/* MODAL: CREATE INVESTOR ACCOUNT */}
      {showCreateInvestorModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} color="var(--brand-primary)" />
                Create Authorized Investor Account
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateInvestorModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateInvestorSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)'
                }}>
                  💡 Creating an investor account issues a dedicated secure credential. When this user logs in, they are immediately redirected to the restricted <strong>Investor Portal</strong> without access to internal ERP records.
                </div>

                <div>
                  <label className="form-label">Full Name *</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Tariqul Islam"
                    value={newInvestorName}
                    onChange={e => setNewInvestorName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Login Email *</label>
                    <input 
                      type="email"
                      className="form-control"
                      placeholder="tariqul@example.com"
                      value={newInvestorEmail}
                      onChange={e => setNewInvestorEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input 
                      type="tel"
                      className="form-control"
                      placeholder="+880 1711-XXXXXX"
                      value={newInvestorPhone}
                      onChange={e => setNewInvestorPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Initial Password *</label>
                  <input 
                    type="password"
                    className="form-control"
                    placeholder="Secure password for investor portal"
                    value={newInvestorPassword}
                    onChange={e => setNewInvestorPassword(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Initial Investment Amount (৳)</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="0"
                      value={newInvestorInitialAmount}
                      onChange={e => setNewInvestorInitialAmount(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="form-label">Deposit Account</label>
                    <select 
                      className="form-control"
                      value={newInvestorAccountId}
                      onChange={e => setNewInvestorAccountId(e.target.value)}
                    >
                      {financialAccounts.length === 0 ? (
                        <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                      ) : (
                        financialAccounts.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.type})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {newInvestorInitialAmount > 0 && (
                  <div>
                    <label className="form-label">Investment Date</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={newInvestorDate}
                      onChange={e => setNewInvestorDate(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="form-label">Internal Notes / Terms</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Partner agreement signed 12 Sep 2026"
                    value={newInvestorNotes}
                    onChange={e => setNewInvestorNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateInvestorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Investor Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CAPITAL TO EXISTING INVESTOR */}
      {showAddCapitalToInvestorModal && selectedInvestorForCapital && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wallet size={20} color="#10b981" />
                Add Capital Injection for {selectedInvestorForCapital.name} ({selectedInvestorForCapital.investorId})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAddCapitalToInvestorModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddCapitalSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: 'var(--bg-card-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Capital Stake</div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#10b981' }}>
                      ৳{selectedInvestorForCapital.totalInvestment.toLocaleString()} ({selectedInvestorForCapital.sharePercentage}%)
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Investor ID</div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                      {selectedInvestorForCapital.investorId}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Additional Capital (৳) *</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="1"
                      value={addCapitalAmount}
                      onChange={e => setAddCapitalAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Investment Date *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={addCapitalDate}
                      onChange={e => setAddCapitalDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Receiving Financial Account</label>
                  <select 
                    className="form-control"
                    value={addCapitalAccountId}
                    onChange={e => setAddCapitalAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.length === 0 ? (
                      <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                    ) : (
                      financialAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="form-label">Transaction Notes / Reference</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Bank wire ref #99831"
                    value={addCapitalNotes}
                    onChange={e => setAddCapitalNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCapitalToInvestorModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Confirm Capital Addition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD OTHER INCOME */}
      {showOtherIncomeModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} color="#10b981" />
                Record Other Business Income (Non-Product Revenue)
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowOtherIncomeModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleOtherIncomeSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Income Category *</label>
                  <select 
                    className="form-control"
                    value={otherIncomeCategory}
                    onChange={e => setOtherIncomeCategory(e.target.value)}
                    required
                  >
                    <option value="Scrap & Packaging Sale">Scrap & Packaging Carton Sale</option>
                    <option value="Commission & Rebate">Supplier Cash Rebate / Commission</option>
                    <option value="Rental / Sublet">Office / Space Sublet Income</option>
                    <option value="Bank Profit / Interest">Bank Interest / Profit Deposit</option>
                    <option value="Delivery / Logistics Fee">Logistics / Courier Charges Collected</option>
                    <option value="Miscellaneous Income">Miscellaneous / Other Income</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Amount (৳) *</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="1"
                      value={otherIncomeAmount}
                      onChange={e => setOtherIncomeAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Receiving Account *</label>
                    <select 
                      className="form-control"
                      value={otherIncomeAccountId}
                      onChange={e => setOtherIncomeAccountId(e.target.value)}
                      required
                    >
                      {financialAccounts.length === 0 ? (
                        <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                      ) : (
                        financialAccounts.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.type})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Date *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={otherIncomeDate}
                      onChange={e => setOtherIncomeDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Received From (Payer)</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bhanga Trader / Courier / Bank"
                      value={otherIncomeFrom}
                      onChange={e => setOtherIncomeFrom(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Description / Source Details *</label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    placeholder="Explain the source and purpose of this money received..."
                    value={otherIncomeDesc}
                    onChange={e => setOtherIncomeDesc(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Reference Number (Optional)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. SLIP-1029 / Money Receipt #"
                    value={otherIncomeRef}
                    onChange={e => setOtherIncomeRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowOtherIncomeModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success" disabled={isSubmittingOtherIncome}>
                  {isSubmittingOtherIncome ? 'Posting...' : 'Record Income & Credit Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD OWNER WITHDRAWAL */}
      {showWithdrawalModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowDown size={20} color="#f59e0b" />
                Record Owner Withdrawal (Capital / Drawing Outflow)
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowWithdrawalModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleWithdrawalSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.8rem', color: '#f59e0b' }}>
                  ℹ️ Owner withdrawals reduce business equity liquidity and the source account balance. They are strictly separate from operational expenses and do not distort P&L calculations.
                </div>

                <div>
                  <label className="form-label">Owner Name *</label>
                  <input 
                    type="text"
                    className="form-control"
                    value={withdrawalOwner}
                    onChange={e => setWithdrawalOwner(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Amount (৳) *</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="1"
                      value={withdrawalAmount}
                      onChange={e => setWithdrawalAmount(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Deduct From Account *</label>
                    <select 
                      className="form-control"
                      value={withdrawalAccountId}
                      onChange={e => setWithdrawalAccountId(e.target.value)}
                      required
                    >
                      {financialAccounts.length === 0 ? (
                        <option value="acc-1">Main Cash Drawer (Default Cash Vault)</option>
                      ) : (
                        financialAccounts.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.type}) — Bal: ৳{Number(a.balance || 0).toLocaleString()}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Date *</label>
                    <input 
                      type="date"
                      className="form-control"
                      value={withdrawalDate}
                      onChange={e => setWithdrawalDate(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Purpose / Drawing Reason</label>
                    <input 
                      type="text"
                      className="form-control"
                      placeholder="e.g. Personal family expense / Director drawing"
                      value={withdrawalPurpose}
                      onChange={e => setWithdrawalPurpose(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Voucher / Cheque Reference (Optional)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. CHQ-998231 / Cash Voucher #09"
                    value={withdrawalRef}
                    onChange={e => setWithdrawalRef(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowWithdrawalModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning" disabled={isSubmittingWithdrawal}>
                  {isSubmittingWithdrawal ? 'Deducting...' : 'Confirm Withdrawal & Deduct Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TRANSACTION DETAILS INSPECTOR */}
      {selectedLedgerItem && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen size={20} color="var(--brand-primary)" />
                Ledger Transaction Audit Record
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedLedgerItem(null)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Transaction Reference</div>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>{selectedLedgerItem.referenceNumber}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Transaction Type</div>
                  <div style={{ fontWeight: 700 }}>{selectedLedgerItem.referenceType}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Date & Time</div>
                  <div style={{ fontWeight: 600 }}>{new Date(selectedLedgerItem.date).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Status</div>
                  <span className={`badge ${selectedLedgerItem.status === 'REVERSED' ? 'badge-danger' : 'badge-success'}`}>
                    {selectedLedgerItem.status || 'COMPLETED'}
                  </span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Description</div>
                <div style={{ padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                  {selectedLedgerItem.description}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Debit (Inflow)</div>
                  <div style={{ fontWeight: 800, color: '#10b981', fontSize: '1.1rem' }}>
                    ৳{Number(selectedLedgerItem.debit).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#ef4444' }}>Credit (Outflow)</div>
                  <div style={{ fontWeight: 800, color: '#ef4444', fontSize: '1.1rem' }}>
                    ৳{Number(selectedLedgerItem.credit).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(0, 140, 255, 0.08)', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--brand-primary)' }}>Account Balance</div>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.1rem' }}>
                    ৳{Number(selectedLedgerItem.runningBalance).toLocaleString()}
                  </div>
                </div>
              </div>

              {selectedLedgerItem.performedBy && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem' }}>
                  Recorded by: <strong>{selectedLedgerItem.performedBy}</strong>
                </div>
              )}
            </div>

            <div className="modal-footer">
              {selectedLedgerItem.status !== 'REVERSED' && (
                <button 
                  className="btn btn-outline"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={() => {
                    setItemToReverse(selectedLedgerItem);
                    setSelectedLedgerItem(null);
                    setShowReversalModal(true);
                  }}
                >
                  <RotateCcw size={14} /> Reverse Transaction
                </button>
              )}
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedLedgerItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSACTION REVERSAL CONFIRMATION */}
      {showReversalModal && itemToReverse && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                <AlertCircle size={20} />
                Financial Reversal Confirmation
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReversalModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReversalSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', fontSize: '0.85rem' }}>
                  ⚠️ <strong>Audit Integrity Rule:</strong> Financial transactions are never silently deleted. Reversing this transaction ({itemToReverse.referenceNumber}) will generate an equal and counteracting balancing ledger entry and restore the account balance.
                </div>

                <div style={{ background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div><strong>Reference:</strong> {itemToReverse.referenceNumber}</div>
                  <div><strong>Type:</strong> {itemToReverse.referenceType}</div>
                  <div><strong>Description:</strong> {itemToReverse.description}</div>
                  <div><strong>Effect:</strong> {Number(itemToReverse.debit) > 0 ? `Debit +৳${Number(itemToReverse.debit).toLocaleString()}` : `Credit −৳${Number(itemToReverse.credit).toLocaleString()}`}</div>
                </div>

                <div>
                  <label className="form-label">Mandatory Reason for Reversal *</label>
                  <textarea 
                    className="form-control"
                    rows={3}
                    placeholder="Enter explicit reason (e.g. Customer returned goods, entered wrong payment method, duplicate entry)..."
                    value={reversalReason}
                    onChange={e => setReversalReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReversalModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={isSubmittingReversal}>
                  {isSubmittingReversal ? 'Reversing...' : 'Confirm & Reverse Financial Impact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

