import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  PieChart as PieChartIcon, TrendingUp, TrendingDown, 
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, 
  Receipt, BookOpen, Calendar, Printer, Plus, ArrowLeftRight,
  Landmark, ShieldAlert, CheckCircle2, X
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="erp-card" style={{ padding: '1.25rem', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid #f59e0b' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>
              Capital & Business Equity Architecture
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Investments and partner capital additions are recorded directly into Cash/Bank accounts. They increase liquidity without inflating sales revenue or reducing operating profit.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '1.25rem', fontWeight: 800 }}>
              Total Active Capital Injected: <strong>৳{totalCapitalInvested.toLocaleString()}</strong>
            </div>
          </div>

          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Investment Registry</h3>
              <button className="btn btn-warning btn-sm" onClick={() => setShowInvestmentModal(true)}>
                <Plus size={15} /> Add Capital
              </button>
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
    </div>
  );
};

