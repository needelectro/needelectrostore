import React from 'react';
import { useERP } from '../services/erpStore';
import {
  TrendingUp, Wallet, ShoppingCart, AlertTriangle, CalendarClock,
  Boxes, Users, Wrench, ArrowUpRight, ArrowDownRight, Plus,
  DollarSign, CheckCircle2, PackageCheck, Zap, Receipt, RotateCcw,
  Building, ShieldCheck
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
    expenses, services, settings, branches, selectedBranch 
  } = useERP();

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Real-time Financial Metrics
  const todaySalesList = sales.filter(s => s.createdAt.startsWith(todayStr));
  const todaySales = todaySalesList.reduce((sum, s) => sum + s.grandTotal, 0);

  // Direct COGS of today's sales (Quantity × Actual Cost)
  const todayCOGS = todaySalesList.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const unitCost = prod?.costPrice || (item.unitPrice * 0.78);
      return iSum + (unitCost * item.quantity);
    }, 0);
  }, 0);

  const todayGrossProfit = todaySales - todayCOGS;

  // Today's cash/digital collection: regular sales paid + down payments + EMI collections today
  const todaySalesCollection = todaySalesList.reduce((sum, s) => sum + s.paidAmount, 0);
  const todayEmiPayments = emiPayments.filter(p => p.paymentDate === todayStr);
  const todayEmiCollection = todayEmiPayments.reduce((sum, p) => sum + p.amount + (p.penaltyPaid || 0), 0);
  const totalTodayCollection = todaySalesCollection + todayEmiCollection;

  // Operating Expenses
  const todayExpensesList = expenses.filter(e => e.date === todayStr);
  const todayExpenses = todayExpensesList.reduce((sum, e) => sum + e.amount, 0);

  // Honest Net Operating Profit = Gross Profit - Operating Expenses
  const todayNetProfit = todayGrossProfit - todayExpenses;

  // Monthly stats
  const currentMonth = todayStr.substring(0, 7);
  const monthSalesList = sales.filter(s => s.createdAt.startsWith(currentMonth));
  const monthSales = monthSalesList.reduce((sum, s) => sum + s.grandTotal, 0);
  const monthCOGS = monthSalesList.reduce((sum, s) => {
    return sum + s.items.reduce((iSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      const unitCost = prod?.costPrice || (item.unitPrice * 0.78);
      return iSum + (unitCost * item.quantity);
    }, 0);
  }, 0);
  const monthGrossProfit = monthSales - monthCOGS;
  const monthExpenses = expenses.filter(e => e.date.startsWith(currentMonth)).reduce((sum, e) => sum + e.amount, 0);
  const monthNetProfit = monthGrossProfit - monthExpenses;

  // Stock valuation
  const totalStockValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
  const lowStockCount = products.filter(p => p.currentStock <= p.minStock).length;

  // Receivables & Payables
  const customerDirectDue = customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
  const activeEmiAccounts = emiAccounts.filter(e => e.status === 'ACTIVE');
  const totalPendingEmi = activeEmiAccounts.reduce((sum, e) => sum + e.remainingBalance, 0);
  const totalReceivables = customerDirectDue + totalPendingEmi;
  const totalPayables = suppliers.reduce((sum, s) => sum + (s.currentPayable || 0), 0);

  // EMI stats
  const todayEmiDueAmount = emiAccounts.reduce((sum, e) => {
    return sum + e.installments
      .filter(i => i.dueDate === todayStr && i.status !== 'PAID')
      .reduce((iSum, i) => iSum + (i.amount - i.paidAmount), 0);
  }, 0);
  const overdueEmiCount = emiAccounts.filter(e => e.installments.some(i => i.status === 'OVERDUE')).length;

  // Services
  const pendingServices = services.filter(s => s.status === 'Pending' || s.status === 'In Progress').length;
  const completedServices = services.filter(s => s.status === 'Completed').length;

  // Dynamic 7-Day Performance Chart (computed from real dates)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dailyPerformanceData = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - idx));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = idx === 6 ? 'Today' : `${dayNames[d.getDay()]} ${d.getDate()}`;

    // Sales on that date
    const daySalesList = sales.filter(s => s.createdAt.startsWith(dateStr));
    const daySalesTotal = daySalesList.reduce((sum, s) => sum + s.grandTotal, 0);
    const daySalesPaid = daySalesList.reduce((sum, s) => sum + s.paidAmount, 0);

    // EMI collections on that date
    const dayEmiPaid = emiPayments.filter(p => p.paymentDate === dateStr).reduce((sum, p) => sum + p.amount + (p.penaltyPaid || 0), 0);
    const dayCollection = daySalesPaid + dayEmiPaid;

    // Expenses on that date
    const dayExp = expenses.filter(e => e.date === dateStr).reduce((sum, e) => sum + e.amount, 0);

    return {
      day: dayName,
      sales: daySalesTotal,
      collection: dayCollection,
      expenses: dayExp,
      emi: dayEmiPaid
    };
  });

  // Dynamic Category Sales Contribution
  const categoryRevenueMap: Record<string, number> = {};
  sales.forEach(s => {
    s.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const cat = prod?.category || 'General Electronics';
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + (item.unitPrice * item.quantity);
    });
  });

  const categoryColors = ['#2563eb', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
  const totalCatRevenue = Object.values(categoryRevenueMap).reduce((a, b) => a + b, 0);
  
  const categoryData = Object.keys(categoryRevenueMap).length > 0
    ? Object.entries(categoryRevenueMap).map(([name, val], idx) => ({
        name,
        value: totalCatRevenue > 0 ? Math.round((val / totalCatRevenue) * 100) : 0,
        amount: val,
        color: categoryColors[idx % categoryColors.length]
      }))
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Welcome & Quick Actions Bar */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Zap size={28} color="var(--brand-accent)" />
            Real-Time Business Command Center
          </h1>
          <p>
            Operating Branch: <strong>{selectedBranch.name}</strong> • Currency: <strong>৳ BDT</strong> • Live Single Source of Truth
          </p>
        </div>

        {/* Quick Actions Shortcuts */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate('pos')}>
            <ShoppingCart size={15} /> New POS Sale
          </button>
          <button className="btn btn-warning btn-sm" onClick={() => onNavigate('emi', 'new')}>
            <CalendarClock size={15} /> New Laptop EMI
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('emi')}>
            <Wallet size={15} /> Collect EMI
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('purchases')}>
            <Boxes size={15} /> Add Purchase
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('returns')}>
            <RotateCcw size={15} /> Process Return
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('service')}>
            <Wrench size={15} /> New Service Job
          </button>
        </div>
      </div>

      {/* Row 1: Key Financial KPIs */}
      <div className="kpi-grid">
        {/* Today's Sales */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Today's Sales (Revenue)</span>
            <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="kpi-value">৳{todaySales.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Gross billing ({todaySalesList.length} invoices generated)
          </div>
        </div>

        {/* Today's Collection */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Today's Cash/Digital Collection</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>৳{totalTodayCollection.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Sales Paid (৳{todaySalesCollection.toLocaleString()}) + EMI (৳{todayEmiCollection.toLocaleString()})
          </div>
        </div>

        {/* Today's Gross & Net Profit */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Today's Operating Net Profit</span>
            <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: todayNetProfit >= 0 ? '#10b981' : '#ef4444' }}>
            ৳{todayNetProfit.toLocaleString()}
          </div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Gross Profit ৳{todayGrossProfit.toLocaleString()} − Exp ৳{todayExpenses.toLocaleString()}
          </div>
        </div>

        {/* Monthly Net Operating Profit */}
        <div className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-title">Monthly Net Profit (MTD)</span>
            <div className="kpi-icon" style={{ background: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#10b981' }}>৳{monthNetProfit.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Month Sales: ৳{monthSales.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Row 2: Secondary Business Metrics (Receivables, Payables, Stock & EMI) */}
      <div className="kpi-grid">
        {/* Total Receivables */}
        <div className="kpi-card erp-card-interactive" onClick={() => onNavigate('accounting')}>
          <div className="kpi-top">
            <span className="kpi-title">Total Receivables (মোট বকেয়া)</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <Wallet size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>৳{totalReceivables.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            EMI: ৳{totalPendingEmi.toLocaleString()} • Customer Due: ৳{customerDirectDue.toLocaleString()}
          </div>
        </div>

        {/* Total Payables */}
        <div className="kpi-card erp-card-interactive" onClick={() => onNavigate('purchases')}>
          <div className="kpi-top">
            <span className="kpi-title">Supplier Payables (পাওনাদার)</span>
            <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
              <Receipt size={20} />
            </div>
          </div>
          <div className="kpi-value" style={{ color: totalPayables > 0 ? '#ef4444' : '#10b981' }}>
            ৳{totalPayables.toLocaleString()}
          </div>
          <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
            Dues to tech & hardware distributors
          </div>
        </div>

        {/* Total Stock Valuation */}
        <div className="kpi-card erp-card-interactive" onClick={() => onNavigate('inventory')}>
          <div className="kpi-top">
            <span className="kpi-title">Total Inventory Valuation</span>
            <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Boxes size={20} />
            </div>
          </div>
          <div className="kpi-value">৳{totalStockValue.toLocaleString()}</div>
          <div className="kpi-footer" style={{ color: lowStockCount > 0 ? '#ef4444' : '#10b981' }}>
            {lowStockCount > 0 ? `${lowStockCount} items at low stock threshold` : 'Healthy stock levels across branches'}
          </div>
        </div>

        {/* Active EMI & Overdue Status */}
        <div className="kpi-card erp-card-interactive" onClick={() => onNavigate('emi')}>
          <div className="kpi-top">
            <span className="kpi-title">Active EMI & Collections</span>
            <div className="kpi-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <CalendarClock size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeEmiAccounts.length} Active Accounts</div>
          <div className="kpi-footer" style={{ color: overdueEmiCount > 0 ? '#ef4444' : '#10b981' }}>
            {overdueEmiCount > 0 ? `⚠️ ${overdueEmiCount} Overdue accounts require follow-up` : `Due Today: ৳${todayEmiDueAmount.toLocaleString()}`}
          </div>
        </div>
      </div>

      {/* Row 3: Interactive Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Dynamic 7-Day Trend */}
        <div className="erp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>7-Day Sales, Inflows & Expenses</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Live daily relational comparison from sales, EMI collections & expenses</p>
            </div>
            <span className="badge badge-info">Real-Time</span>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyPerformanceData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `৳${v >= 1000 ? `${Math.round(v/1000)}k` : v}`} />
                <Tooltip 
                  formatter={(val: any) => [`৳${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }} 
                />
                <Legend />
                <Area type="monotone" dataKey="sales" name="Sales Billing (৳)" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="collection" name="Cash/Bank Collected (৳)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCol)" />
                <Area type="monotone" dataKey="expenses" name="Expenses (৳)" stroke="#ef4444" strokeWidth={1.5} fillOpacity={0.2} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Revenue Contribution */}
        <div className="erp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Sales by Category Share</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Calculated dynamically from itemized invoice records</p>
            </div>
            <span className="badge badge-neutral">Live Catalog</span>
          </div>

          <div style={{ height: '260px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={92}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (৳${item.payload.amount?.toLocaleString() || 0})`,
                      name
                    ]}
                    contentStyle={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>No Sales Recorded Yet</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Create sales via the POS terminal to populate live category distributions.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Invoices & Overdue Action Terminal */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        {/* Recent Invoices */}
        <div className="erp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Recent Customer Invoices</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate('sales')}>
              View All Invoices &rarr;
            </button>
          </div>

          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.length > 0 ? (
                  sales.slice(0, 5).map(s => (
                    <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => onNavigate('sales', s.id)}>
                      <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>{s.invoiceNumber}</td>
                      <td>
                        <div>{s.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.customerPhone}</div>
                      </td>
                      <td>
                        <span className={`badge ${s.saleType === 'EMI' ? 'badge-warning' : 'badge-neutral'}`}>
                          {s.saleType}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>৳{s.grandTotal.toLocaleString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-success">{s.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>No Customer Sales Yet</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Issue your first real invoice via POS or Laptop EMI to see records here.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority EMI Watchlist */}
        <div className="erp-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarClock size={18} color="#f59e0b" />
              Priority EMI Installment Watchlist
            </h3>
            <button className="btn btn-warning btn-sm" onClick={() => onNavigate('emi')}>
              Open EMI Hub &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {emiAccounts.length > 0 ? (
              emiAccounts.slice(0, 4).map(acc => {
                const overdueInst = acc.installments.find(i => i.status === 'OVERDUE');
                const dueTodayInst = acc.installments.find(i => i.status === 'DUE_TODAY');
                const nextDueInst = overdueInst || dueTodayInst || acc.installments.find(i => i.status === 'UPCOMING');

                return (
                  <div 
                    key={acc.id}
                    className="erp-card erp-card-interactive"
                    onClick={() => onNavigate('emi', acc.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderLeft: `4px solid ${overdueInst ? '#ef4444' : dueTodayInst ? '#f59e0b' : '#10b981'}`
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                        {acc.customerName} ({acc.emiNumber})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Product: {acc.productName} • SN: {acc.serialNumber}
                      </div>
                      {nextDueInst && (
                        <div style={{ fontSize: '0.75rem', marginTop: '2px', color: overdueInst ? '#ef4444' : dueTodayInst ? '#f59e0b' : 'var(--text-muted)' }}>
                          Inst #{nextDueInst.installmentNumber}: ৳{nextDueInst.amount.toLocaleString()} ({nextDueInst.status}) — Due: {nextDueInst.dueDate}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>
                        Bal: ৳{acc.remainingBalance.toLocaleString()}
                      </div>
                      <span className={`badge ${overdueInst ? 'badge-danger' : dueTodayInst ? 'badge-warning' : 'badge-success'}`}>
                        {overdueInst ? 'OVERDUE' : dueTodayInst ? 'DUE TODAY' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>No Active EMI Accounts</div>
                <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>When laptops are sold under installment plans, repayment schedules will appear here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

