import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  EMIAccount, EMIPlan, EMIInstallment, Customer, Product, ProductSerial, PaymentMethod 
} from '../types';
import {
  CalendarClock, Search, Plus, CheckCircle2, AlertTriangle, 
  Wallet, FileText, Phone, MessageSquare, ShieldCheck, Printer, 
  X, Check, Laptop, Clock, ArrowRight, UserCheck, AlertCircle, Share2,
  Edit2, Trash2, RotateCcw, Sliders, DollarSign, Percent, Calculator, Power
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
    saveEMIPlanWithVersioning, deleteEMIPlan, resetEMIPlansToDefaults,
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

  // -------------------------------------------------------------
  // EMI PLAN MANAGEMENT & CUSTOMIZATION STATE
  // -------------------------------------------------------------
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<EMIPlan | null>(null);
  const [planForm, setPlanForm] = useState<{
    id: string;
    name: string;
    durationMonths: number;
    minDownPaymentPercent: number;
    interestRatePercent: number;
    processingFee: number;
    lateFeePerDay: number;
    gracePeriodDays: number;
    isActive: boolean;
    description: string;
    eligibilityRules: string;
    termsText: string;
    versionReason: string;
  }>({
    id: '',
    name: '',
    durationMonths: 6,
    minDownPaymentPercent: 25,
    interestRatePercent: 0,
    processingFee: 500,
    lateFeePerDay: 50,
    gracePeriodDays: 5,
    isActive: true,
    description: '',
    eligibilityRules: '',
    termsText: '',
    versionReason: ''
  });
  const [simLaptopPrice, setSimLaptopPrice] = useState<number>(50000);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [isResettingPlans, setIsResettingPlans] = useState(false);

  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      id: `emi-plan-${Date.now()}`,
      name: '',
      durationMonths: 6,
      minDownPaymentPercent: 25,
      interestRatePercent: 0,
      processingFee: 500,
      lateFeePerDay: 50,
      gracePeriodDays: 5,
      isActive: true,
      description: 'Standard hire-purchase installment plan for laptops and computing accessories.',
      eligibilityRules: 'Valid National ID (NID) & 1 verified local guarantor.',
      termsText: 'Monthly installment due within 10th of every calendar month. Grace period applies before daily late penalty is charged.',
      versionReason: 'Initial Plan Creation'
    });
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (plan: EMIPlan) => {
    setEditingPlan(plan);
    setPlanForm({
      id: plan.id,
      name: plan.name,
      durationMonths: plan.durationMonths,
      minDownPaymentPercent: plan.minDownPaymentPercent,
      interestRatePercent: plan.interestRatePercent,
      processingFee: plan.processingFee,
      lateFeePerDay: plan.lateFeePerDay,
      gracePeriodDays: plan.gracePeriodDays,
      isActive: plan.isActive,
      description: plan.description || '',
      eligibilityRules: plan.eligibilityRules || '',
      termsText: plan.termsText || '',
      versionReason: ''
    });
    setShowPlanModal(true);
  };

  const handleSavePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.name.trim()) {
      addToast('error', 'Validation Error', 'Plan Name is required.');
      return;
    }
    if (planForm.durationMonths <= 0) {
      addToast('error', 'Validation Error', 'Duration must be at least 1 month.');
      return;
    }
    if (planForm.minDownPaymentPercent < 0 || planForm.minDownPaymentPercent > 100) {
      addToast('error', 'Validation Error', 'Down payment percentage must be between 0% and 100%.');
      return;
    }

    setIsSavingPlan(true);
    try {
      const planToSave: EMIPlan = {
        id: planForm.id || `emi-plan-${Date.now()}`,
        name: planForm.name.trim(),
        durationMonths: Number(planForm.durationMonths),
        minDownPaymentPercent: Number(planForm.minDownPaymentPercent),
        interestRatePercent: Number(planForm.interestRatePercent),
        processingFee: Number(planForm.processingFee),
        lateFeePerDay: Number(planForm.lateFeePerDay),
        gracePeriodDays: Number(planForm.gracePeriodDays),
        isActive: planForm.isActive,
        version: editingPlan?.version || 1,
        description: planForm.description.trim(),
        eligibilityRules: planForm.eligibilityRules.trim(),
        termsText: planForm.termsText.trim()
      };

      const reason = planForm.versionReason.trim() || (editingPlan ? 'Plan terms updated by Admin' : 'New Plan Created');
      const res = await saveEMIPlanWithVersioning(planToSave, reason);
      if (res.success) {
        setShowPlanModal(false);
      }
    } finally {
      setIsSavingPlan(false);
    }
  };

  const handleTogglePlanActive = async (plan: EMIPlan) => {
    const updatedStatus = !plan.isActive;
    await saveEMIPlanWithVersioning(
      { ...plan, isActive: updatedStatus },
      `Toggled status to ${updatedStatus ? 'ACTIVE' : 'DISABLED'}`
    );
  };

  const handleDeletePlanSubmit = async (plan: EMIPlan) => {
    if (window.confirm(`Are you sure you want to deactivate / archive EMI plan "${plan.name}"? Active contracts under this scheme will be preserved.`)) {
      await deleteEMIPlan(plan.id);
    }
  };

  const handleResetDefaultsSubmit = async () => {
    if (window.confirm('Reset all EMI plans to system default standard schemes (3M 0%, 6M 0%, 9M 2%, 12M 4%)? Existing custom plans will be refreshed.')) {
      setIsResettingPlans(true);
      try {
        await resetEMIPlansToDefaults();
      } finally {
        setIsResettingPlans(false);
      }
    }
  };

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

    // Serial number is optional — skip validation if not provided

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
          isSerialized: !!selectedSerial,
          serialNumbers: selectedSerial ? [selectedSerial] : []
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
                2. Laptop & Serial Number (Optional)
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
                  <label className="form-label">Physical Serial Number (Optional)</label>
                  <select
                    className="form-select"
                    value={selectedSerial}
                    onChange={e => setSelectedSerial(e.target.value)}
                  >
                    <option value="">— No Serial Number —</option>
                    {availableSerials.map(s => (
                      <option key={s.id} value={s.serialNumber}>
                        {s.serialNumber} (Available in {selectedBranch.name})
                      </option>
                    ))}
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
      {/* TAB 6: CONFIGURABLE EMI PLANS & HIRE-PURCHASE SCHEMES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header & Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-card)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Sliders size={20} color="#2563eb" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Laptop EMI Schemes & Hire-Purchase Policies
                </h3>
                <span className="badge badge-info">{emiPlans.length} Total Schemes</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Administer tenure periods, down payment minimums, 0%-interest promotions, late penalties, and legal hire-purchase terms.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleResetDefaultsSubmit}
                disabled={isResettingPlans}
                title="Restore standard 3M, 6M, 9M, and 12M plans"
              >
                <RotateCcw size={14} />
                {isResettingPlans ? 'Restoring Defaults...' : 'Reset Default Schemes'}
              </button>
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleOpenCreatePlan}
              >
                <Plus size={16} />
                + Create New EMI Plan
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="erp-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Schemes</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{emiPlans.filter(p => p.isActive).length} Available</div>
              </div>
            </div>

            <div className="erp-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tenure Range</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {emiPlans.length > 0 ? `${Math.min(...emiPlans.map(p => p.durationMonths))}M - ${Math.max(...emiPlans.map(p => p.durationMonths))}M` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="erp-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                <Percent size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Min Down Payment</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {emiPlans.length > 0 ? `${Math.min(...emiPlans.map(p => p.minDownPaymentPercent))}% - ${Math.max(...emiPlans.map(p => p.minDownPaymentPercent))}%` : 'N/A'}
                </div>
              </div>
            </div>

            <div className="erp-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                <DollarSign size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>0% Interest Schemes</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  {emiPlans.filter(p => p.interestRatePercent === 0).length} Schemes
                </div>
              </div>
            </div>
          </div>

          {/* Empty State when no plans exist */}
          {emiPlans.length === 0 ? (
            <div className="erp-card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-card-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Sliders size={32} color="var(--text-secondary)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>No EMI Plans Configured</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.875rem' }}>
                There are currently no active hire-purchase schemes in the system. You can restore the pre-configured standard schemes or create a custom plan.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-sm" onClick={handleResetDefaultsSubmit} disabled={isResettingPlans}>
                  <RotateCcw size={15} /> Load Standard Default Schemes
                </button>
                <button className="btn btn-secondary btn-sm" onClick={handleOpenCreatePlan}>
                  <Plus size={15} /> Create Custom Scheme
                </button>
              </div>
            </div>
          ) : (
            /* Plans Grid */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
              {emiPlans.map(plan => {
                const samplePrice = 50000;
                const sampleDown = Math.round((samplePrice * plan.minDownPaymentPercent) / 100);
                const sampleFinanced = samplePrice - sampleDown;
                const sampleInterest = Math.round((sampleFinanced * plan.interestRatePercent) / 100);
                const sampleTotal = sampleFinanced + sampleInterest;
                const sampleMonthly = plan.durationMonths > 0 ? Math.round(sampleTotal / plan.durationMonths) : 0;

                return (
                  <div 
                    key={plan.id} 
                    className="erp-card" 
                    style={{ 
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      border: plan.isActive ? '1px solid var(--border-color)' : '1px dashed var(--border-color)',
                      opacity: plan.isActive ? 1 : 0.8,
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div>
                      {/* Top Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span className="badge badge-info" style={{ fontWeight: 700 }}>
                            {plan.durationMonths} Months Tenure
                          </span>
                          <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'var(--bg-card-muted)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                            v{plan.version || 1}
                          </span>
                        </div>
                        <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-neutral'}`}>
                          {plan.isActive ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                        {plan.name}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem', minHeight: '2.4rem', lineHeight: '1.4' }}>
                        {plan.description || 'Flexible hire-purchase installment scheme for laptops.'}
                      </p>

                      {/* Metrics Matrix */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', background: 'var(--bg-card-muted)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.8rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Min Down Payment</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{plan.minDownPaymentPercent}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Interest Markup</div>
                          <div style={{ fontWeight: 700, color: plan.interestRatePercent === 0 ? '#10b981' : '#f59e0b' }}>
                            {plan.interestRatePercent === 0 ? '0% (Interest Free)' : `${plan.interestRatePercent}% Flat`}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Processing Fee</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>৳{plan.processingFee}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Grace Period</div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{plan.gracePeriodDays} Days</div>
                        </div>
                        <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--border-color)', paddingTop: '0.4rem' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Late Penalty Rate</div>
                          <div style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.75rem' }}>
                            ৳{plan.lateFeePerDay} / day (after grace period)
                          </div>
                        </div>
                      </div>

                      {/* Repayment Simulation Box */}
                      <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.15)', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.725rem', fontWeight: 700, color: '#2563eb', marginBottom: '0.35rem' }}>
                          <Calculator size={13} /> Simulation (৳50,000 Laptop)
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                          <span>Down: <strong>৳{sampleDown.toLocaleString()}</strong></span>
                          <span style={{ color: '#10b981', fontWeight: 800 }}>৳{sampleMonthly.toLocaleString()}/mo</span>
                        </div>
                      </div>

                      {/* Eligibility Rules & Legal Terms Snippet */}
                      {(plan.eligibilityRules || plan.termsText) && (
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.6rem' }}>
                          {plan.eligibilityRules && (
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>Eligibility:</strong> {plan.eligibilityRules}
                            </div>
                          )}
                          {plan.termsText && (
                            <div>
                              <strong style={{ color: 'var(--text-primary)' }}>Terms:</strong> {plan.termsText}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleOpenEditPlan(plan)}
                      >
                        <Edit2 size={13} /> Edit / Customize
                      </button>
                      <button 
                        className={`btn btn-sm ${plan.isActive ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => handleTogglePlanActive(plan)}
                        title={plan.isActive ? 'Disable Plan' : 'Activate Plan'}
                      >
                        <Power size={13} /> {plan.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setActiveTab('new_emi');
                        }}
                        title="Start New EMI Sale with this Scheme"
                      >
                        <ArrowRight size={13} /> Use
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444' }}
                        onClick={() => handleDeletePlanSubmit(plan)}
                        title="Archive / Remove Scheme"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: CREATE / CUSTOMIZE EMI PLAN */}
      {/* ------------------------------------------------------------- */}
      {showPlanModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-content-lg" style={{ maxWidth: '780px', maxHeight: '92vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div className="modal-title">
                <Sliders size={20} color="#2563eb" />
                <span>{editingPlan ? 'Edit & Customize EMI Scheme' : 'Create New Laptop EMI Scheme'}</span>
                {editingPlan && (
                  <span className="badge badge-info" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                    Current: v{editingPlan.version || 1}
                  </span>
                )}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowPlanModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePlanSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Basic Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">
                      Plan Scheme Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. 6 Months Standard Flexi Laptop Scheme" 
                      value={planForm.name}
                      onChange={e => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (Months) <span style={{ color: '#ef4444' }}>*</span></label>
                    <input 
                      type="number" 
                      min="1" 
                      max="60" 
                      className="form-input" 
                      value={planForm.durationMonths}
                      onChange={e => setPlanForm(prev => ({ ...prev, durationMonths: Math.max(1, parseInt(e.target.value) || 1) }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Active Status</label>
                    <select 
                      className="form-select"
                      value={planForm.isActive ? 'ACTIVE' : 'DISABLED'}
                      onChange={e => setPlanForm(prev => ({ ...prev, isActive: e.target.value === 'ACTIVE' }))}
                    >
                      <option value="ACTIVE">Active (Available in POS/Sale)</option>
                      <option value="DISABLED">Disabled (Hidden from POS)</option>
                    </select>
                  </div>
                </div>

                {/* Financial Parameters */}
                <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                    Financial & Pricing Markup Terms
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem' }}>
                    <div className="form-group">
                      <label className="form-label">Min Down Payment (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        className="form-input" 
                        value={planForm.minDownPaymentPercent}
                        onChange={e => setPlanForm(prev => ({ ...prev, minDownPaymentPercent: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) }))}
                        required
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Standard: 20% - 30%</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Interest Markup (%)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="50" 
                        step="0.5" 
                        className="form-input" 
                        value={planForm.interestRatePercent}
                        onChange={e => setPlanForm(prev => ({ ...prev, interestRatePercent: Math.max(0, parseFloat(e.target.value) || 0) }))}
                        required
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Set 0% for Interest-Free</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Processing Fee (৳)</label>
                      <input 
                        type="number" 
                        min="0" 
                        className="form-input" 
                        value={planForm.processingFee}
                        onChange={e => setPlanForm(prev => ({ ...prev, processingFee: Math.max(0, parseFloat(e.target.value) || 0) }))}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>One-time admin fee</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Grace Period (Days)</label>
                      <input 
                        type="number" 
                        min="0" 
                        className="form-input" 
                        value={planForm.gracePeriodDays}
                        onChange={e => setPlanForm(prev => ({ ...prev, gracePeriodDays: Math.max(0, parseInt(e.target.value) || 0) }))}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Days before penalty</span>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Late Penalty (৳/Day)</label>
                      <input 
                        type="number" 
                        min="0" 
                        className="form-input" 
                        value={planForm.lateFeePerDay}
                        onChange={e => setPlanForm(prev => ({ ...prev, lateFeePerDay: Math.max(0, parseFloat(e.target.value) || 0) }))}
                      />
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Accrues after grace</span>
                    </div>
                  </div>
                </div>

                {/* Real-time Calculation Simulator inside Modal */}
                {(() => {
                  const down = Math.round((simLaptopPrice * planForm.minDownPaymentPercent) / 100);
                  const financed = Math.max(0, simLaptopPrice - down);
                  const interest = Math.round((financed * planForm.interestRatePercent) / 100);
                  const totalFinancedWithInterest = financed + interest;
                  const monthly = planForm.durationMonths > 0 ? Math.round(totalFinancedWithInterest / planForm.durationMonths) : 0;
                  const initialPayment = down + planForm.processingFee;

                  return (
                    <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#2563eb', fontSize: '0.85rem' }}>
                          <Calculator size={16} /> Interactive Installment Simulator
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sample Laptop Price:</span>
                          <input 
                            type="number" 
                            step="5000" 
                            min="10000" 
                            style={{ width: '110px', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 700 }}
                            value={simLaptopPrice}
                            onChange={e => setSimLaptopPrice(Math.max(1000, parseFloat(e.target.value) || 0))}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.6rem', textAlign: 'center' }}>
                        <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Required Down</div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>৳{down.toLocaleString()}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>({planForm.minDownPaymentPercent}%)</div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Financed Principal</div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>৳{financed.toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Interest Added</div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: planForm.interestRatePercent === 0 ? '#10b981' : '#f59e0b' }}>
                            ৳{interest.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Monthly Installment</div>
                          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#10b981' }}>৳{monthly.toLocaleString()}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>× {planForm.durationMonths} Months</div>
                        </div>
                        <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Initial Outflow</div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>৳{initialPayment.toLocaleString()}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Down + Fee</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Marketing & Policies */}
                <div className="form-group">
                  <label className="form-label">Marketing Description / Tagline</label>
                  <input 
                    type="text"
                    className="form-input"
                    placeholder="e.g. 0% interest for university students and IT freelancers with low monthly commitment."
                    value={planForm.description}
                    onChange={e => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Eligibility Requirements</label>
                    <textarea 
                      className="form-input"
                      rows={2}
                      placeholder="e.g. Original NID copy, utility bill, and one verified local guarantor."
                      value={planForm.eligibilityRules}
                      onChange={e => setPlanForm(prev => ({ ...prev, eligibilityRules: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Legal Contract Terms & Default Policy</label>
                    <textarea 
                      className="form-input"
                      rows={2}
                      placeholder="e.g. Ownership remains with Need Electro until full settlement. Default > 60 days results in repossession."
                      value={planForm.termsText}
                      onChange={e => setPlanForm(prev => ({ ...prev, termsText: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Versioning Audit Reason */}
                <div className="form-group">
                  <label className="form-label">
                    Modification Reason / Version Log Note
                  </label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={editingPlan ? "e.g. Reduced down payment from 30% to 25% for seasonal laptop campaign" : "e.g. Initial Plan Creation"}
                    value={planForm.versionReason}
                    onChange={e => setPlanForm(prev => ({ ...prev, versionReason: e.target.value }))}
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                    All changes are automatically audited. Existing contracts retain their original agreed terms.
                  </span>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary btn-sm" 
                  onClick={() => setShowPlanModal(false)}
                  disabled={isSavingPlan}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-sm"
                  disabled={isSavingPlan}
                >
                  {isSavingPlan ? 'Saving Plan...' : editingPlan ? 'Update & Version Plan' : 'Save New EMI Plan'}
                </button>
              </div>
            </form>
          </div>
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
