import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  EMIAccount, EMIPlan, EMIInstallment, Customer, Product, ProductSerial, PaymentMethod 
} from '../types';
import {
  CalendarClock, Search, Plus, CheckCircle2, AlertTriangle, 
  Wallet, FileText, Phone, MessageSquare, ShieldCheck, Printer, 
  X, Check, Laptop, Clock, ArrowRight, UserCheck, AlertCircle, Share2
} from 'lucide-react';

interface EMIModuleProps {
  initialMode?: string;
  onNavigate: (module: string, targetId?: string) => void;
}

export const EMIModule: React.FC<EMIModuleProps> = ({ initialMode, onNavigate }) => {
  const { 
    emiAccounts, emiPlans, emiPayments, customers, products, serials, 
    collectEMIPayment, createSale, createCustomer, selectedBranch, currentUser, 
    setActiveEmiAgreementToPrint, settings, updateSettings, saveEMIPlan,
    addToast, refreshFromDatabase
  } = useERP();

  const [isEvaluatingOverdue, setIsEvaluatingOverdue] = useState(false);

  const handleRunOverdueEvaluation = async () => {
    setIsEvaluatingOverdue(true);
    try {
      const res = await fetch('/api/emi/evaluate-overdue', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Overdue Audit Completed', `Evaluated ${data.data?.processedInstallments || 0} installments. Newly overdue: ${data.data?.newlyOverdueCount || 0}. Penalty accrued: ৳${data.data?.totalPenaltyAccrued || 0}`);
        if (refreshFromDatabase) await refreshFromDatabase();
      } else {
        addToast('error', 'Audit Failed', data.error || 'Failed to run overdue evaluation');
      }
    } catch (err: any) {
      addToast('error', 'Audit Error', err.message);
    } finally {
      setIsEvaluatingOverdue(false);
    }
  };

  // Active View Tab: 'dashboard' | 'accounts' | 'collect' | 'new_emi' | 'reminders' | 'plans'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'collect' | 'new_emi' | 'reminders' | 'plans'>(
    initialMode === 'new' ? 'new_emi' : 'dashboard'
  );

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE'>('ALL');

  // Selected Account for Detailed Drawer
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // WIZARD STATE: CREATE NEW EMI SALE
  // -------------------------------------------------------------
  const [wizardCustomerType, setWizardCustomerType] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [selectedCustId, setSelectedCustId] = useState<string>(customers[0]?.id || '');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustNid, setNewCustNid] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorNid, setGuarantorNid] = useState('');
  const [guarantorRelationship, setGuarantorRelationship] = useState('Family Member');
  const [guarantorAddress, setGuarantorAddress] = useState('');

  // Laptop Selection
  const laptopProducts = products.filter(p => p.category === 'Laptop' && p.status === 'ACTIVE');
  const [selectedProdId, setSelectedProdId] = useState<string>(laptopProducts[0]?.id || '');
  const availableSerials = serials.filter(s => s.productId === selectedProdId && s.status === 'AVAILABLE');
  const [selectedSerial, setSelectedSerial] = useState<string>(availableSerials[0]?.serialNumber || '');

  // Plan Selection
  const [selectedPlanId, setSelectedPlanId] = useState<string>(emiPlans[0]?.id || '');
  const currentPlan = emiPlans.find(p => p.id === selectedPlanId) || emiPlans[0];
  const currentProduct = products.find(p => p.id === selectedProdId) || laptopProducts[0];

  const laptopPrice = currentProduct ? (currentProduct.emiPrice || currentProduct.retailPrice) : 50000;
  const defaultDownPayment = Math.round((laptopPrice * (currentPlan?.minDownPaymentPercent || 25)) / 100);
  const [customDownPayment, setCustomDownPayment] = useState<number>(defaultDownPayment);
  const [downPaymentMethod, setDownPaymentMethod] = useState<PaymentMethod>('bKash');

  // Dynamic calculations
  const downPayment = customDownPayment > 0 ? customDownPayment : defaultDownPayment;
  const financedAmount = Math.max(0, laptopPrice - downPayment);
  const durationMonths = currentPlan ? currentPlan.durationMonths : 6;
  const monthlyInstallment = durationMonths > 0 ? Math.round(financedAmount / durationMonths) : 0;

  // -------------------------------------------------------------
  // COLLECTION TERMINAL STATE
  // -------------------------------------------------------------
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectAccount, setCollectAccount] = useState<EMIAccount | null>(null);
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string>('');
  const [collectionAmount, setCollectionAmount] = useState<number>(0);
  const [penaltyAmount, setPenaltyAmount] = useState<number>(0);
  const [collectionMethod, setCollectionMethod] = useState<PaymentMethod>('bKash');
  const [collectionRef, setCollectionRef] = useState('');
  const [collectionNotes, setCollectionNotes] = useState('');

  // -------------------------------------------------------------
  // REMINDER MODAL
  // -------------------------------------------------------------
  const [activeReminderAccount, setActiveReminderAccount] = useState<EMIAccount | null>(null);
  const [reminderLanguage, setReminderLanguage] = useState<'EN' | 'BN'>('BN');

  // Compute Overall Stats
  const totalEmiFinanced = emiAccounts.reduce((sum, e) => sum + e.financedAmount, 0);
  const totalEmiCollected = emiAccounts.reduce((sum, e) => sum + e.totalPaid, 0);
  const totalOutstanding = emiAccounts.reduce((sum, e) => sum + e.remainingBalance, 0);
  const overdueAccounts = emiAccounts.filter(e => e.installments.some(i => i.status === 'OVERDUE'));
  const dueTodayAccounts = emiAccounts.filter(e => e.installments.some(i => i.status === 'DUE_TODAY'));

  // Filtered Accounts
  const filteredAccounts = emiAccounts.filter(acc => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = acc.emiNumber.toLowerCase().includes(q) ||
                         acc.customerName.toLowerCase().includes(q) ||
                         acc.customerPhone.toLowerCase().includes(q) ||
                         acc.serialNumber.toLowerCase().includes(q);

    if (statusFilter === 'ACTIVE') return matchesQuery && acc.status === 'ACTIVE';
    if (statusFilter === 'COMPLETED') return matchesQuery && acc.status === 'COMPLETED';
    if (statusFilter === 'OVERDUE') return matchesQuery && acc.installments.some(i => i.status === 'OVERDUE');
    return matchesQuery;
  });

  // Handle Create EMI Sale Execution
  const handleExecuteEmiSale = async () => {
    if (!currentProduct) {
      alert('Please select a valid laptop product.');
      return;
    }

    if (!selectedSerial) {
      alert(`No available serial number found for ${currentProduct.name}! Cannot proceed without a physical serial number.`);
      return;
    }

    let customerId = selectedCustId;
    let customerName = '';
    let customerPhone = '';

    if (wizardCustomerType === 'NEW') {
      if (!newCustName.trim() || !newCustPhone.trim() || !newCustNid.trim()) {
        alert('Please enter customer full name, phone number, and National ID (NID).');
        return;
      }
      const newCust = {
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        address: newCustAddress.trim(),
        nid: newCustNid.trim(),
        guarantor: guarantorName ? {
          name: guarantorName.trim(),
          relationship: guarantorRelationship,
          phone: guarantorPhone.trim(),
          nid: guarantorNid.trim(),
          address: guarantorAddress.trim()
        } : undefined,
        creditLimit: 100000
      };
      // create customer directly via store
      const cRes = await createCustomer(newCust);
      if (!cRes.success || !cRes.customer) {
        alert(`Failed to save customer: ${cRes.error}`);
        return;
      }
      customerId = cRes.customer.id;
      customerName = cRes.customer.name;
      customerPhone = cRes.customer.phone;
    } else {
      const existing = customers.find(c => c.id === selectedCustId);
      if (!existing) {
        alert('Please select an existing customer.');
        return;
      }
      customerName = existing.name;
      customerPhone = existing.phone;
    }

    // Trigger Sale creation with EMI flag
    const res = await createSale({
      customerId,
      customerName,
      customerPhone,
      branchId: selectedBranch.id,
      date: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: currentProduct.id,
          productName: currentProduct.name,
          sku: currentProduct.sku,
          category: 'Laptop',
          quantity: 1,
          unitPrice: laptopPrice,
          discount: 0,
          total: laptopPrice,
          warrantyMonths: currentProduct.warrantyPeriodMonths || 12,
          isSerialized: true,
          serialNumbers: [selectedSerial]
        }
      ],
      subtotal: laptopPrice,
      overallDiscount: 0,
      vatAmount: 0,
      vatPercent: 0,
      grandTotal: laptopPrice,
      paidAmount: downPayment,
      dueAmount: financedAmount,
      payments: [{ method: downPaymentMethod, amount: downPayment }],
      saleType: 'EMI',
      status: 'COMPLETED',
      salespersonId: currentUser.id,
      salespersonName: currentUser.name,
      notes: `Laptop EMI contract for ${durationMonths} months. Down Payment: ৳${downPayment.toLocaleString()}`
    }, {
      planId: selectedPlanId,
      downPayment,
      durationMonths
    });

    if (res.success && res.sale) {
      alert(`EMI Sale Completed! Invoice: ${res.sale.invoiceNumber}. EMI Account created with full repayment schedule.`);
      setActiveTab('accounts');
    } else {
      alert(`Error creating EMI sale: ${res.error}`);
    }
  };

  // Select Account in Collection Screen
  const handleSelectAccountForCollection = (acc: EMIAccount) => {
    setCollectAccount(acc);
    // Find next unpaid or overdue installment
    const firstUnpaid = acc.installments.find(i => i.status === 'OVERDUE') ||
                        acc.installments.find(i => i.status === 'DUE_TODAY') ||
                        acc.installments.find(i => i.status === 'UPCOMING') ||
                        acc.installments[0];

    if (firstUnpaid) {
      setSelectedInstallmentId(firstUnpaid.id);
      setCollectionAmount(firstUnpaid.amount - firstUnpaid.paidAmount);
      setPenaltyAmount(firstUnpaid.penaltyAmount || 0);
    }
  };

  // Submit EMI Payment Collection
  const handleCollectSubmit = async () => {
    if (!collectAccount || !selectedInstallmentId) {
      alert('Please select an account and installment.');
      return;
    }

    if (collectionAmount <= 0) {
      alert('Collection amount must be greater than 0.');
      return;
    }

    const res = await collectEMIPayment(
      collectAccount.id,
      selectedInstallmentId,
      collectionAmount,
      penaltyAmount,
      collectionMethod,
      collectionRef,
      collectionNotes
    );

    if (res.success) {
      // Reload current account from state
      const updated = emiAccounts.find(a => a.id === collectAccount.id);
      if (updated) setCollectAccount(updated);
      setCollectionNotes('');
      setCollectionRef('');
    } else {
      alert(`Collection failed: ${res.error}`);
    }
  };

  // Generate Notification Text
  const getNotificationText = (acc: EMIAccount, lang: 'EN' | 'BN') => {
    const overdueInst = acc.installments.find(i => i.status === 'OVERDUE');
    const dueTodayInst = acc.installments.find(i => i.status === 'DUE_TODAY');
    const targetInst = overdueInst || dueTodayInst || acc.installments.find(i => i.status === 'UPCOMING');

    if (!targetInst) return '';

    let template = lang === 'EN' 
      ? (overdueInst ? settings.notificationTemplateOverdueEn : settings.notificationTemplateDueSoonEn)
      : (overdueInst ? settings.notificationTemplateOverdueBn : settings.notificationTemplateDueSoonBn);

    return template
      .replace('{CUSTOMER_NAME}', acc.customerName)
      .replace('{AMOUNT}', targetInst.amount.toLocaleString())
      .replace('{PRODUCT_NAME}', acc.productName)
      .replace('{SERIAL}', acc.serialNumber)
      .replace('{DUE_DATE}', targetInst.dueDate)
      .replace('{DAYS_OVERDUE}', '12')
      .replace('{PENALTY}', String(targetInst.penaltyAmount || 300))
      .replace('{EMI_NUMBER}', acc.emiNumber);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <CalendarClock size={28} color="#f59e0b" />
            Laptop EMI & Installment Management System
          </h1>
          <p>
            Configurable Hire-Purchase plans, automated amortization schedules, instant collection terminal & legal contract generation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn btn-sm btn-secondary"
            onClick={handleRunOverdueEvaluation}
            disabled={isEvaluatingOverdue}
            title="Run daily overdue audit and penalty calculation across all active accounts"
          >
            <Clock size={16} /> {isEvaluatingOverdue ? 'Auditing...' : 'Audit Overdue Penalties'}
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'new_emi' ? 'btn-primary' : 'btn-warning'}`}
            onClick={() => setActiveTab('new_emi')}
          >
            <Plus size={16} /> New Laptop EMI Contract
          </button>
          <button 
            className={`btn btn-sm ${activeTab === 'collect' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('collect')}
          >
            <Wallet size={16} /> Collection Terminal
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Overview & Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'accounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('accounts')}
        >
          All Accounts ({emiAccounts.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'collect' ? 'active' : ''}`}
          onClick={() => setActiveTab('collect')}
        >
          Collect EMI Payment
        </button>
        <button 
          className={`tab-btn ${activeTab === 'new_emi' ? 'active' : ''}`}
          onClick={() => setActiveTab('new_emi')}
        >
          + New EMI Sale Wizard
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reminders' ? 'active' : ''}`}
          onClick={() => setActiveTab('reminders')}
        >
          SMS / WhatsApp Reminders ({overdueAccounts.length + dueTodayAccounts.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          Configurable Plans ({emiPlans.length})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Active EMI Portfolio</span>
                <div className="kpi-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
                  <CalendarClock size={20} />
                </div>
              </div>
              <div className="kpi-value">৳{totalOutstanding.toLocaleString()}</div>
              <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
                Across {emiAccounts.length} client accounts
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Total Collected to Date</span>
                <div className="kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
                  <Wallet size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#10b981' }}>৳{totalEmiCollected.toLocaleString()}</div>
              <div className="kpi-footer" style={{ color: '#10b981' }}>
                <CheckCircle2 size={14} /> Down payments + Monthly installments
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Overdue Delinquent Accounts</span>
                <div className="kpi-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: overdueAccounts.length > 0 ? '#ef4444' : 'inherit' }}>
                {overdueAccounts.length} Accounts
              </div>
              <div className="kpi-footer" style={{ color: '#ef4444' }}>
                {overdueAccounts.length > 0 ? 'Urgent follow-up required' : 'Zero overdue defaults'}
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Collection Ratio</span>
                <div className="kpi-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
                  <ShieldCheck size={20} />
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#38bdf8' }}>
                {totalEmiFinanced > 0 ? Math.round((totalEmiCollected / (totalEmiFinanced + emiAccounts.reduce((s, a) => s + a.downPayment, 0))) * 100) : 100}%
              </div>
              <div className="kpi-footer" style={{ color: 'var(--text-secondary)' }}>
                Healthy repayment rate
              </div>
            </div>
          </div>

          {/* Overdue & Today Due Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
            {/* Overdue */}
            <div className="erp-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} /> Overdue EMI Accounts ({overdueAccounts.length})
                </h3>
                <button className="btn btn-sm btn-danger" onClick={() => setActiveTab('reminders')}>
                  Broadcast Overdue Notices
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {overdueAccounts.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No overdue accounts currently.
                  </div>
                ) : (
                  overdueAccounts.map(acc => {
                    const overdueInst = acc.installments.find(i => i.status === 'OVERDUE');
                    return (
                      <div 
                        key={acc.id}
                        className="erp-card erp-card-interactive"
                        onClick={() => { setSelectedAccountId(acc.id); }}
                        style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #ef4444' }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                            {acc.customerName} — {acc.emiNumber}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Phone: <strong>{acc.customerPhone}</strong> • Laptop: {acc.productName}
                          </div>
                          {overdueInst && (
                            <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>
                              Installment #{overdueInst.installmentNumber}: ৳{overdueInst.amount.toLocaleString()} + ৳{overdueInst.penaltyAmount} late fee (Due: {overdueInst.dueDate})
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAccountForCollection(acc);
                              setActiveTab('collect');
                            }}
                          >
                            Collect
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Due Today */}
            <div className="erp-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={18} /> Payments Due Today ({dueTodayAccounts.length})
                </h3>
                <span className="badge badge-warning">Today: 2026-09-06</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {dueTodayAccounts.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No installments due today.
                  </div>
                ) : (
                  dueTodayAccounts.map(acc => {
                    const dueInst = acc.installments.find(i => i.status === 'DUE_TODAY');
                    return (
                      <div 
                        key={acc.id}
                        className="erp-card erp-card-interactive"
                        onClick={() => { setSelectedAccountId(acc.id); }}
                        style={{ padding: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '4px solid #f59e0b' }}
                      >
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                            {acc.customerName} — {acc.emiNumber}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Phone: {acc.customerPhone} • {acc.productName}
                          </div>
                          {dueInst && (
                            <div style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600', marginTop: '2px' }}>
                              Installment #{dueInst.installmentNumber}: ৳{dueInst.amount.toLocaleString()} due today
                            </div>
                          )}
                        </div>

                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectAccountForCollection(acc);
                            setActiveTab('collect');
                          }}
                        >
                          Collect
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: ALL ACCOUNTS TABLE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'accounts' && (
        <div className="erp-card" style={{ padding: '1.25rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by EMI ID, Name, Phone, Serial..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['ALL', 'ACTIVE', 'OVERDUE', 'COMPLETED'] as const).map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>EMI Number</th>
                  <th>Customer Name & Phone</th>
                  <th>Laptop & Serial Number</th>
                  <th>Duration</th>
                  <th style={{ textAlign: 'right' }}>Total Price</th>
                  <th style={{ textAlign: 'right' }}>Paid</th>
                  <th style={{ textAlign: 'right' }}>Remaining</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(acc => {
                  const hasOverdue = acc.installments.some(i => i.status === 'OVERDUE');
                  return (
                    <tr key={acc.id}>
                      <td style={{ fontWeight: '700', color: 'var(--brand-primary)' }}>
                        {acc.emiNumber}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{acc.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{acc.customerPhone}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '500' }}>{acc.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          SN: <strong>{acc.serialNumber}</strong>
                        </div>
                      </td>
                      <td>{acc.durationMonths} Months</td>
                      <td style={{ textAlign: 'right' }}>৳{acc.laptopPrice.toLocaleString()}</td>
                      <td style={{ textAlign: 'right', color: '#10b981', fontWeight: '600' }}>
                        ৳{acc.totalPaid.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', color: acc.remainingBalance > 0 ? '#ef4444' : 'inherit', fontWeight: '700' }}>
                        ৳{acc.remainingBalance.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${hasOverdue ? 'badge-danger' : acc.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>
                          {hasOverdue ? 'OVERDUE' : acc.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedAccountId(acc.id)}
                            title="View Schedule & Statement"
                          >
                            Schedule
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => setActiveEmiAgreementToPrint(acc)}
                            title="Print Hire-Purchase Legal Agreement"
                          >
                            <FileText size={15} color="var(--brand-primary)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DEDICATED EMI COLLECTION SCREEN */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'collect' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
          {/* Left: Find & View Account Schedule */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={18} color="var(--brand-primary)" />
              1. Select EMI Account to Collect Payment
            </h3>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by customer name, phone number, EMI number..."
                className="form-input"
                style={{ paddingLeft: '32px' }}
                value={collectionSearch}
                onChange={e => setCollectionSearch(e.target.value)}
              />
            </div>

            {/* Quick Pick Account List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', marginBottom: '1.25rem' }}>
              {emiAccounts
                .filter(a => a.status === 'ACTIVE')
                .filter(a => !collectionSearch || 
                  a.customerName.toLowerCase().includes(collectionSearch.toLowerCase()) || 
                  a.customerPhone.includes(collectionSearch) ||
                  a.emiNumber.toLowerCase().includes(collectionSearch.toLowerCase())
                )
                .map(acc => (
                  <div
                    key={acc.id}
                    className="erp-card erp-card-interactive"
                    onClick={() => handleSelectAccountForCollection(acc)}
                    style={{
                      padding: '0.75rem 1rem',
                      background: collectAccount?.id === acc.id ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                      border: `1px solid ${collectAccount?.id === acc.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.875rem' }}>
                        {acc.customerName} ({acc.emiNumber})
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Phone: {acc.customerPhone} • {acc.productName} (SN: {acc.serialNumber})
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', color: '#ef4444', fontSize: '0.875rem' }}>
                        Bal: ৳{acc.remainingBalance.toLocaleString()}
                      </div>
                      <span className={`badge ${acc.installments.some(i => i.status === 'OVERDUE') ? 'badge-danger' : 'badge-warning'}`}>
                        {acc.installments.some(i => i.status === 'OVERDUE') ? 'OVERDUE' : 'ACTIVE'}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {/* Installments Table for Selected Account */}
            {collectAccount ? (
              <div>
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                    Installment Breakdown for {collectAccount.emiNumber}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Click an installment to populate payment
                  </span>
                </div>

                <div className="table-container">
                  <table className="erp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Due Date</th>
                        <th style={{ textAlign: 'right' }}>Amount</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'right' }}>Receipt No</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectAccount.installments.map(inst => (
                        <tr 
                          key={inst.id}
                          onClick={() => {
                            if (inst.status !== 'PAID') {
                              setSelectedInstallmentId(inst.id);
                              setCollectionAmount(inst.amount - inst.paidAmount);
                              setPenaltyAmount(inst.penaltyAmount || 0);
                            }
                          }}
                          style={{
                            cursor: inst.status === 'PAID' ? 'default' : 'pointer',
                            background: selectedInstallmentId === inst.id ? 'var(--bg-active)' : undefined
                          }}
                        >
                          <td style={{ fontWeight: '700' }}>#{inst.installmentNumber}</td>
                          <td>{inst.dueDate}</td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>৳{inst.amount.toLocaleString()}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${inst.status === 'PAID' ? 'badge-success' : inst.status === 'OVERDUE' ? 'badge-danger' : inst.status === 'DUE_TODAY' ? 'badge-warning' : 'badge-neutral'}`}>
                              {inst.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                            {inst.receiptNumber || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Please select an EMI account from the list above.
              </div>
            )}
          </div>

          {/* Right: Payment Collection Terminal */}
          <div className="erp-card" style={{ padding: '1.25rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={18} color="#10b981" />
              2. Record Installment Payment
            </h3>

            {collectAccount ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                  <div><strong>Customer:</strong> {collectAccount.customerName}</div>
                  <div><strong>Account:</strong> {collectAccount.emiNumber} ({collectAccount.productName})</div>
                  <div><strong>Remaining Total:</strong> <span style={{ color: '#ef4444', fontWeight: 'bold' }}>৳{collectAccount.remainingBalance.toLocaleString()}</span></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Select Installment to Settle *</label>
                  <select
                    className="form-select"
                    value={selectedInstallmentId}
                    onChange={e => {
                      setSelectedInstallmentId(e.target.value);
                      const inst = collectAccount.installments.find(i => i.id === e.target.value);
                      if (inst) {
                        setCollectionAmount(inst.amount - inst.paidAmount);
                        setPenaltyAmount(inst.penaltyAmount || 0);
                      }
                    }}
                  >
                    {collectAccount.installments.map(inst => (
                      <option key={inst.id} value={inst.id} disabled={inst.status === 'PAID'}>
                        Installment #{inst.installmentNumber} (Due: {inst.dueDate}) — ৳{inst.amount.toLocaleString()} [{inst.status}]
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Principal Amount (৳) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={collectionAmount}
                      onChange={e => setCollectionAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Late Fee / Penalty (৳)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={penaltyAmount}
                      onChange={e => setPenaltyAmount(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Channel *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
                    {(['bKash', 'Nagad', 'Cash', 'Rocket', 'Bank Transfer', 'Card'] as PaymentMethod[]).map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCollectionMethod(m)}
                        style={{
                          padding: '0.5rem 0.25rem',
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${collectionMethod === m ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                          background: collectionMethod === m ? 'var(--bg-active)' : 'var(--bg-card-muted)',
                          color: collectionMethod === m ? 'var(--brand-primary)' : 'var(--text-primary)',
                          fontWeight: '700',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Trx ID / Bank Deposit Ref</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. BK9A887123"
                    value={collectionRef}
                    onChange={e => setCollectionRef(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Collection Remarks</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Collected at counter / online"
                    value={collectionNotes}
                    onChange={e => setCollectionNotes(e.target.value)}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>
                    <span>Total To Collect:</span>
                    <span style={{ color: '#10b981' }}>
                      ৳{(collectionAmount + penaltyAmount).toLocaleString()}
                    </span>
                  </div>

                  <button
                    className="btn btn-success btn-lg"
                    onClick={handleCollectSubmit}
                    style={{ width: '100%' }}
                  >
                    <Check size={18} /> Confirm Collection & Issue Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select an account on the left to begin collection.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: NEW EMI SALE WIZARD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'new_emi' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.25rem' }}>
          {/* Left: Input Form */}
          <div className="erp-card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Laptop size={22} color="#2563eb" />
              New Laptop Hire-Purchase (EMI) Contract Wizard
            </h3>

            {/* Step 1: Customer Profile */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--brand-primary)' }}>
                  1. Customer & Guarantor Details
                </span>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    className={`btn btn-sm ${wizardCustomerType === 'EXISTING' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWizardCustomerType('EXISTING')}
                  >
                    Existing Customer
                  </button>
                  <button
                    className={`btn btn-sm ${wizardCustomerType === 'NEW' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWizardCustomerType('NEW')}
                  >
                    + Register New Customer
                  </button>
                </div>
              </div>

              {wizardCustomerType === 'EXISTING' ? (
                <div className="form-group">
                  <label className="form-label">Select Customer</label>
                  <select
                    className="form-select"
                    value={selectedCustId}
                    onChange={e => setSelectedCustId(e.target.value)}
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) — NID: {c.nid || 'Verified'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Customer Full Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Shakawat Hossain"
                      value={newCustName}
                      onChange={e => setNewCustName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Phone *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 01711-556677"
                      value={newCustPhone}
                      onChange={e => setNewCustPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">National ID (NID) Number *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="10 or 17 digit NID"
                      value={newCustNid}
                      onChange={e => setNewCustNid(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Present Residential Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Sector 10, Uttara, Dhaka"
                      value={newCustAddress}
                      onChange={e => setNewCustAddress(e.target.value)}
                    />
                  </div>

                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', fontWeight: '700', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Guarantor Information (জামিনদারের বিবরণ):
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guarantor Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Abdul Karim"
                      value={guarantorName}
                      onChange={e => setGuarantorName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guarantor Phone</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="01819-..."
                      value={guarantorPhone}
                      onChange={e => setGuarantorPhone(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Laptop & Serial Number Selection */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--brand-primary)', display: 'block', marginBottom: '0.75rem' }}>
                2. Laptop & Physical Serial Number Selection
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Choose Laptop Model *</label>
                  <select
                    className="form-select"
                    value={selectedProdId}
                    onChange={e => {
                      setSelectedProdId(e.target.value);
                      const sers = serials.filter(s => s.productId === e.target.value && s.status === 'AVAILABLE');
                      setSelectedSerial(sers[0]?.serialNumber || '');
                    }}
                  >
                    {laptopProducts.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} — ৳{(p.emiPrice || p.retailPrice).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Physical Serial Number *</label>
                  <select
                    className="form-select"
                    value={selectedSerial}
                    onChange={e => setSelectedSerial(e.target.value)}
                  >
                    {availableSerials.length === 0 ? (
                      <option value="">No Available Serial! Out of Stock</option>
                    ) : (
                      availableSerials.map(s => (
                        <option key={s.id} value={s.serialNumber}>
                          {s.serialNumber} (Available in {selectedBranch.name})
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Step 3: Configure EMI Plan & Down Payment */}
            <div>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--brand-primary)', display: 'block', marginBottom: '0.75rem' }}>
                3. EMI Plan & Down Payment Terms
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">EMI Tenure Plan *</label>
                  <select
                    className="form-select"
                    value={selectedPlanId}
                    onChange={e => {
                      setSelectedPlanId(e.target.value);
                      const plan = emiPlans.find(p => p.id === e.target.value);
                      if (plan) {
                        setCustomDownPayment(Math.round((laptopPrice * plan.minDownPaymentPercent) / 100));
                      }
                    }}
                  >
                    {emiPlans.filter(p => p.isActive).map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} ({plan.durationMonths} Months, Min {plan.minDownPaymentPercent}% Down)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Down Payment Collected (৳) *</label>
                  <input
                    type="number"
                    className="form-input"
                    value={customDownPayment}
                    onChange={e => setCustomDownPayment(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Down Payment Method</label>
                  <select
                    className="form-select"
                    value={downPaymentMethod}
                    onChange={e => setDownPaymentMethod(e.target.value as PaymentMethod)}
                  >
                    {(['bKash', 'Nagad', 'Cash', 'Rocket', 'Bank Transfer', 'Card'] as PaymentMethod[]).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Real-time Calculation Summary & Agreement Preview */}
          <div className="erp-card" style={{ padding: '1.25rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1rem' }}>
              EMI Contract Amortization Preview
            </h3>

            <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Laptop EMI Total:</span>
                <strong>৳{laptopPrice.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                <span>Down Payment Received:</span>
                <strong>-৳{downPayment.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem', fontWeight: 'bold', color: 'var(--brand-primary)' }}>
                <span>Financed Principal:</span>
                <span>৳{financedAmount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f59e0b', fontWeight: '800', fontSize: '1.1rem', marginTop: '4px' }}>
                <span>Monthly Installment:</span>
                <span>৳{monthlyInstallment.toLocaleString()} / mo</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Tenure: {durationMonths} consecutive monthly installments
              </div>
            </div>

            {/* Generated Installment Dates Table */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Proposed Payment Schedule:
              </div>
              <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <table className="erp-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Due Date</th>
                      <th style={{ textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: durationMonths }).map((_, idx) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + idx + 1);
                      return (
                        <tr key={idx}>
                          <td>Installment #{idx + 1}</td>
                          <td>{d.toISOString().split('T')[0]}</td>
                          <td style={{ textAlign: 'right', fontWeight: 'bold' }}>৳{monthlyInstallment.toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
              onClick={handleExecuteEmiSale}
            >
              <CheckCircle2 size={18} />
              Execute EMI Contract & Generate Agreement
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: AUTOMATED BILINGUAL REMINDERS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'reminders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="erp-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Bilingual Installment Notification Hub</h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Broadcast SMS & WhatsApp payment reminders in English and Bengali to upcoming and overdue clients.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn btn-sm ${reminderLanguage === 'BN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setReminderLanguage('BN')}
              >
                বাংলা (Bengali)
              </button>
              <button 
                className={`btn btn-sm ${reminderLanguage === 'EN' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setReminderLanguage('EN')}
              >
                English
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
            {[...overdueAccounts, ...dueTodayAccounts].map(acc => {
              const isOverdue = acc.installments.some(i => i.status === 'OVERDUE');
              const msg = getNotificationText(acc, reminderLanguage);

              return (
                <div 
                  key={acc.id}
                  className="erp-card"
                  style={{
                    padding: '1.25rem',
                    borderLeft: `4px solid ${isOverdue ? '#ef4444' : '#f59e0b'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>{acc.customerName}</span>
                      <span className={`badge ${isOverdue ? 'badge-danger' : 'badge-warning'}`}>
                        {isOverdue ? 'OVERDUE NOTICE' : 'DUE TODAY'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Phone: <strong>{acc.customerPhone}</strong> • Account: {acc.emiNumber} • {acc.productName}
                    </div>

                    {/* Preview Box */}
                    <div style={{
                      background: 'var(--bg-card-muted)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem',
                      fontSize: '0.8125rem',
                      lineHeight: '1.5',
                      fontFamily: reminderLanguage === 'BN' ? 'var(--font-bangla)' : 'inherit',
                      color: 'var(--text-primary)'
                    }}>
                      {msg}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <a
                      href={`https://wa.me/88${acc.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-success btn-sm"
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      <Share2 size={15} /> Send WhatsApp
                    </a>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => alert(`SMS Dispatched to ${acc.customerPhone} successfully via Greenweb/Onnorokom SMS Gateway!`)}
                      style={{ flex: 1 }}
                    >
                      <MessageSquare size={15} /> Send SMS
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: CONFIGURABLE EMI PLANS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {emiPlans.map(plan => (
            <div key={plan.id} className="erp-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-info">{plan.durationMonths} Months Plan</span>
                <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-neutral'}`}>
                  {plan.isActive ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                {plan.name}
              </h3>

              <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                <div>Minimum Down Payment: <strong>{plan.minDownPaymentPercent}%</strong></div>
                <div>Interest Markup: <strong>{plan.interestRatePercent}%</strong></div>
                <div>Processing Fee: <strong>৳{plan.processingFee}</strong></div>
                <div>Late Fee Per Day: <strong>৳{plan.lateFeePerDay}</strong></div>
                <div>Grace Period: <strong>{plan.gracePeriodDays} days</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: Detailed Account Drawer with Statement & Agreement Print */}
      {selectedAccountId && (
        (() => {
          const acc = emiAccounts.find(a => a.id === selectedAccountId);
          if (!acc) return null;

          return (
            <div className="modal-overlay" style={{ zIndex: 10000 }}>
              <div className="modal-content modal-content-lg" style={{ maxHeight: '92vh' }}>
                <div className="modal-header">
                  <div className="modal-title">
                    <CalendarClock size={20} color="#f59e0b" />
                    EMI Account Ledger: {acc.emiNumber} — {acc.customerName}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedAccountId(null)}>
                    <X size={16} />
                  </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Summary Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Laptop Model</div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{acc.productName}</div>
                      <div style={{ fontSize: '0.7rem', color: '#2563eb' }}>SN: {acc.serialNumber}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Price</div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>৳{acc.laptopPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Paid</div>
                      <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#10b981' }}>৳{acc.totalPaid.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remaining Balance</div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#ef4444' }}>৳{acc.remainingBalance.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                      Installment Repayment Amortization
                    </h4>
                    <div className="table-container">
                      <table className="erp-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Due Date</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                            <th style={{ textAlign: 'right' }}>Paid</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'right' }}>Receipt / Paid On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acc.installments.map(inst => (
                            <tr key={inst.id}>
                              <td style={{ fontWeight: '700' }}>Inst #{inst.installmentNumber}</td>
                              <td>{inst.dueDate}</td>
                              <td style={{ textAlign: 'right', fontWeight: '600' }}>৳{inst.amount.toLocaleString()}</td>
                              <td style={{ textAlign: 'right', color: '#10b981' }}>৳{inst.paidAmount.toLocaleString()}</td>
                              <td style={{ textAlign: 'center' }}>
                                <span className={`badge ${inst.status === 'PAID' ? 'badge-success' : inst.status === 'OVERDUE' ? 'badge-danger' : inst.status === 'DUE_TODAY' ? 'badge-warning' : 'badge-neutral'}`}>
                                  {inst.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                                {inst.receiptNumber ? `${inst.receiptNumber} (${inst.paidDate})` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setActiveEmiAgreementToPrint(acc);
                    }}
                  >
                    <Printer size={15} /> Print Hire-Purchase Agreement
                  </button>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      handleSelectAccountForCollection(acc);
                      setSelectedAccountId(null);
                      setActiveTab('collect');
                    }}
                  >
                    Collect Payment Now
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};
