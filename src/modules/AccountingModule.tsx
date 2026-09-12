import React, { useState, useEffect } from 'react';
import { useERP } from '../services/erpStore';
import { 
  PieChart as PieChartIcon, TrendingUp, TrendingDown, 
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, 
  Receipt, BookOpen, Calendar, Printer, Plus, ArrowLeftRight,
  Landmark, ShieldAlert, CheckCircle2, X, Users, Percent,
  Lock, Unlock, ShieldCheck, Sparkles, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { InvestmentType, AccountType } from '../types';

interface AccountingModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const AccountingModule: React.FC<AccountingModuleProps> = ({ onNavigate }) => {
  const { 
    sales, emiPayments, expenses, suppliers, customers, emiAccounts, 
    products, services, selectedBranch, financialAccounts, investments,
    recordInvestment, transferFunds
  } = useERP();

  const [activeTab, setActiveTab] = useState<'pnl' | 'accounts' | 'investments'>('pnl');

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);

  // Transfer Form State
  const [fromAccountId, setFromAccountId] = useState(financialAccounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(financialAccounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState<number>(10000);
  const [transferRef, setTransferRef] = useState('');
  const [transferNotes, setTransferNotes] = useState('');

  // Investment Form State
  const [investorName, setInvestorName] = useState('');
  const [investAmount, setInvestAmount] = useState<number>(100000);
  const [investType, setInvestType] = useState<InvestmentType>('EQUITY');
  const [targetAccountId, setTargetAccountId] = useState(financialAccounts[0]?.id || '');
  const [investRef, setInvestRef] = useState('');
  const [investNotes, setInvestNotes] = useState('');

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
  const [newInvestorAccountId, setNewInvestorAccountId] = useState(financialAccounts[0]?.id || '');
  const [newInvestorNotes, setNewInvestorNotes] = useState('');

  // Add Capital Form
  const [addCapitalAmount, setAddCapitalAmount] = useState<number>(20000);
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

    const targetAcc = financialAccounts.find(a => a.id === targetAccountId);
    const paymentMethod = targetAcc?.type === 'CASH' ? 'Cash' : 'Bank Transfer';

    const res = await recordInvestment({
      investorName: investorName.trim(),
      amount: investAmount,
      date: new Date().toISOString().split('T')[0],
      investmentType: investType,
      depositAccountId: targetAccountId,
      paymentMethod,
      reference: investRef || `INV-${Date.now().toString().slice(-4)}`,
      status: 'ACTIVE',
      notes: investNotes
    });

    if (res.success) {
      setShowInvestmentModal(false);
      setInvestorName('');
      setInvestAmount(100000);
      setInvestRef('');
      setInvestNotes('');
    } else {
      alert(`Failed to record investment: ${res.error}`);
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
          >
            <Printer size={15} /> Print Statement
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
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'pnl' ? 'active' : ''}`}
          onClick={() => setActiveTab('pnl')}
        >
          P&L Statement & Financial Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          Cash & Bank Accounts ({financialAccounts.length})
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
          {/* Summary Banner */}
          <div className="erp-card" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(16,185,129,0.08))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total Liquid Treasury Funds</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Combined cash in hand, bank accounts, and mobile banking wallets</p>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--brand-primary)' }}>
                ৳{totalLiquidCash.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Accounts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {financialAccounts.map(acc => (
              <div key={acc.id} className="erp-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {acc.accountNumber || acc.type} {acc.bankName ? `• ${acc.bankName}` : ''}
                      </div>
                    </div>
                    <span className="badge badge-info">{acc.type}</span>
                  </div>

                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: acc.balance >= 0 ? 'var(--text-primary)' : '#ef4444', margin: '0.75rem 0' }}>
                    ৳{acc.balance.toLocaleString()}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Status: Active</span>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setFromAccountId(acc.id);
                      setShowTransferModal(true);
                    }}
                  >
                    Transfer Out &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                    <th>Ref ID</th>
                    <th>Investor Name</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Target Account</th>
                    <th style={{ textAlign: 'right' }}>Capital Amount (৳)</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(inv => {
                    const acc = financialAccounts.find(a => a.id === inv.depositAccountId);
                    return (
                      <tr key={inv.id}>
                        <td style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{inv.reference || inv.id}</td>
                        <td style={{ fontWeight: 700 }}>{inv.investorName}</td>
                        <td>
                          <span className="badge badge-warning">{inv.investmentType}</span>
                        </td>
                        <td>{inv.date}</td>
                        <td>{acc?.name || 'Cash/Bank Account'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                          ৳{inv.amount.toLocaleString()}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.notes || '—'}</td>
                      </tr>
                    );
                  })}
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
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} (Available: ৳{a.balance.toLocaleString()})
                      </option>
                    ))}
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
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id} disabled={a.id === fromAccountId}>
                        {a.name} (Current: ৳{a.balance.toLocaleString()})
                      </option>
                    ))}
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
          <div className="modal-content modal-content-md">
            <div className="modal-header">
              <div className="modal-title">
                <Plus size={20} color="var(--brand-primary)" />
                Record Capital / Investment Addition
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowInvestmentModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleInvestmentSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="form-label">Investor / Partner Name</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Amdadur Rahman (Founder)"
                    value={investorName}
                    onChange={e => setInvestorName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">Investment Type</label>
                    <select 
                      className="form-control"
                      value={investType}
                      onChange={e => setInvestType(e.target.value as InvestmentType)}
                    >
                      <option value="EQUITY">Equity (Owner Capital)</option>
                      <option value="SEED_FUNDING">Seed Funding (Startup Capital)</option>
                      <option value="LOAN">Director Loan</option>
                      <option value="PARTNER">Partner Contribution</option>
                      <option value="RETAINED_EARNING">Retained Earning</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Capital Amount (৳)</label>
                    <input 
                      type="number"
                      className="form-control"
                      min="1"
                      value={investAmount}
                      onChange={e => setInvestAmount(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Deposit Target Account</label>
                  <select 
                    className="form-control"
                    value={targetAccountId}
                    onChange={e => setTargetAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Reference Number (Optional)</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. CHQ-883921"
                    value={investRef}
                    onChange={e => setInvestRef(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Notes</label>
                  <input 
                    type="text"
                    className="form-control"
                    placeholder="e.g. Working capital injection for laptop bulk procurement"
                    value={investNotes}
                    onChange={e => setInvestNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvestmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warning">
                  Deposit Capital
                </button>
              </div>
            </form>
          </div>
        </div>
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
                      {financialAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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

                <div>
                  <label className="form-label">Additional Capital Amount (৳) *</label>
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
                  <label className="form-label">Receiving Financial Account</label>
                  <select 
                    className="form-control"
                    value={addCapitalAccountId}
                    onChange={e => setAddCapitalAccountId(e.target.value)}
                    required
                  >
                    {financialAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
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
    </div>
  );
};

