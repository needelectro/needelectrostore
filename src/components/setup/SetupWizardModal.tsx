import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import { 
  Building, MapPin, Store, CreditCard, DollarSign, Calendar, 
  FileText, Bell, CheckCircle2, ChevronRight, ChevronLeft, Save, X, AlertTriangle 
} from 'lucide-react';
import { PaymentMethod } from '../../types';

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupWizardModal: React.FC<SetupWizardModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, updateSettings, branches, emiPlans, saveEMIPlan, 
    updateSetupStatus, setupStatus, addToast 
  } = useERP();

  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Company
  const [companyName, setCompanyName] = useState(settings.companyName || 'NEED ELECTRO');
  const [tagline, setTagline] = useState(settings.companyTagline || 'Trusted Electrical and Technological Solutions');
  const [sisterConcern, setSisterConcern] = useState(settings.sisterConcern || 'A sister Concern Of AMDADS GROUP');
  const [phone, setPhone] = useState(settings.phone || '01733-983752');
  const [email, setEmail] = useState(settings.email || 'needelectro23@gmail.com');
  const [website, setWebsite] = useState(settings.website || 'www.needelectro.com');
  const [address, setAddress] = useState(settings.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar');
  const [vatNo, setVatNo] = useState(settings.vatRegistrationNo || 'BIN: 002948123-0102');
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol || '৳');

  // Step 2: Main Branch
  const [branchName, setBranchName] = useState(branches[0]?.name || 'Main Branch Moulvibazar');
  const [branchCode, setBranchCode] = useState(branches[0]?.code || 'MB-MAIN');
  const [branchAddress, setBranchAddress] = useState(branches[0]?.address || 'Shop#5, MR Plaza, Kusumbag, Moulvibazar');
  const [branchPhone, setBranchPhone] = useState(branches[0]?.phone || '01733-983752');

  // Step 3: Warehouse
  const [warehouseName, setWarehouseName] = useState('Central Warehouse & Service Hub');
  const [warehouseCode, setWarehouseCode] = useState('CENTRAL-WH');
  const [warehouseAddress, setWarehouseAddress] = useState('Sreemangal Road Industrial Area, Moulvibazar');

  // Step 4: Financial Accounts
  const [hasCash, setHasCash] = useState(true);
  const [hasBank, setHasBank] = useState(true);
  const [hasBkash, setHasBkash] = useState(true);
  const [hasNagad, setHasNagad] = useState(true);
  const [hasRocket, setHasRocket] = useState(true);

  // Step 5: Payment Methods
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({
    'Cash': true,
    'bKash': true,
    'Nagad': true,
    'Rocket': true,
    'Bank Transfer': true,
    'Card': true,
    'Credit/Due': true,
    'EMI': true
  });

  // Step 6: EMI Plans
  const [plans, setPlans] = useState(emiPlans);

  // Step 7: Invoice & Receipts
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || 'INV-2026-');
  const [emiPrefix, setEmiPrefix] = useState(settings.emiPrefix || 'EMI-2026-');
  const [receiptPrefix, setReceiptPrefix] = useState('REC-2026-');
  const [termsText, setTermsText] = useState('Goods sold with authentic manufacturer warranty. Laptop EMI defaults incur daily late fine.');

  // Step 8: Notifications
  const [enableSms, setEnableSms] = useState(settings.enableSmsNotifications);
  const [enableWhatsapp, setEnableWhatsapp] = useState(settings.enableWhatsappNotifications);

  if (!isOpen) return null;

  const totalSteps = 8;

  const stepsList = [
    { num: 1, title: 'Company', icon: Building },
    { num: 2, title: 'Main Branch', icon: Store },
    { num: 3, title: 'Warehouse', icon: MapPin },
    { num: 4, title: 'Accounts', icon: DollarSign },
    { num: 5, title: 'Payments', icon: CreditCard },
    { num: 6, title: 'EMI Plans', icon: Calendar },
    { num: 7, title: 'Invoicing', icon: FileText },
    { num: 8, title: 'Notifications', icon: Bell }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    // Save settings
    updateSettings({
      companyName,
      companyTagline: tagline,
      sisterConcern,
      phone,
      email,
      website,
      address,
      vatRegistrationNo: vatNo,
      currencySymbol,
      invoicePrefix,
      emiPrefix,
      enableSmsNotifications: enableSms,
      enableWhatsappNotifications: enableWhatsapp
    });

    // Update setup status
    updateSetupStatus({
      isCompanyConfigured: true,
      isMainBranchConfigured: true,
      isWarehouseConfigured: true,
      isFinancialAccountsConfigured: true,
      isPaymentMethodsConfigured: true,
      isEmiPlansConfigured: true,
      isInvoiceSettingsConfigured: true,
      isNotificationConfigured: enableSms || enableWhatsapp
    });

    addToast('success', 'Setup Wizard Completed', 'All company, branch, payment, and EMI configurations saved.');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 10, 25, 0.88)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1.5rem',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '92vh',
        background: '#0f172a',
        border: '1px solid rgba(2, 132, 199, 0.35)',
        borderRadius: '24px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(2, 132, 199, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 2rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.15) 0%, transparent 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-primary" style={{ padding: '3px 8px', fontSize: '0.72rem' }}>
                SETUP WIZARD
              </span>
              <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', marginTop: '0.25rem' }}>
              First-Time ERP Guided Configuration
            </h2>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ color: '#94a3b8' }}>
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.6)',
          overflowX: 'auto'
        }}>
          {stepsList.map(s => {
            const Icon = s.icon;
            const isDone = s.num < currentStep;
            const isCurrent = s.num === currentStep;
            return (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                style={{
                  flex: 1,
                  minWidth: '95px',
                  padding: '0.75rem 0.5rem',
                  background: isCurrent ? 'rgba(2, 132, 199, 0.15)' : 'transparent',
                  border: 'none',
                  borderBottom: isCurrent ? '2px solid #0284c7' : '2px solid transparent',
                  color: isCurrent ? '#38bdf8' : (isDone ? '#10b981' : '#64748b'),
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.72rem',
                  fontWeight: isCurrent ? 700 : 500,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {isDone ? <CheckCircle2 size={13} color="#10b981" /> : <Icon size={13} />}
                  <span>{s.num}. {s.title}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Body Container */}
        <div style={{ padding: '2rem', overflowY: 'auto', flex: 1 }}>
          {/* STEP 1: COMPANY */}
          {currentStep === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 1 — Company Profile & Corporate Branding
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Define company name, parent group affiliation, official contact channels, and currency.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Company Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Sister Concern Affiliation
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={sisterConcern}
                    onChange={e => setSisterConcern(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Company Tagline
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Official Phone / Hotline *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Official Email *
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Currency & Symbol
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={currencySymbol}
                    onChange={e => setCurrencySymbol(e.target.value)}
                    placeholder="BDT (৳)"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Showroom Address *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Bangladesh VAT BIN
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={vatNo}
                    onChange={e => setVatNo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MAIN BRANCH */}
          {currentStep === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 2 — Primary Operating Branch
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Configure your flagship retail showroom location. This serves as the default operational terminal.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={branchName}
                    onChange={e => setBranchName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Branch Code *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Physical Address *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={branchAddress}
                  onChange={e => setBranchAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Branch Telephone / Contact
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={branchPhone}
                  onChange={e => setBranchPhone(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: WAREHOUSE */}
          {currentStep === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 3 — Central Warehouse & Inventory Depot
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Configure the primary receiving warehouse for bulk tech shipments and serial barcode tagging.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Warehouse Name *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={warehouseName}
                    onChange={e => setWarehouseName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Warehouse Code *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={warehouseCode}
                    onChange={e => setWarehouseCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Warehouse Location *
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={warehouseAddress}
                  onChange={e => setWarehouseAddress(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 4: FINANCIAL ACCOUNTS */}
          {currentStep === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 4 — Core Financial Accounts
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Enable the standard chart of accounts for cash, commercial banks, and Bangladesh mobile financial services.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { name: 'Showroom Cash Drawer (BDT)', active: hasCash, set: setHasCash, desc: 'Point of sale physical register' },
                  { name: 'Bank Asia Commercial A/C', active: hasBank, set: setHasBank, desc: 'Corporate checking account' },
                  { name: 'bKash Merchant Account', active: hasBkash, set: setHasBkash, desc: 'Mobile QR and checkout collections' },
                  { name: 'Nagad Merchant Wallet', active: hasNagad, set: setHasNagad, desc: 'Post office digital wallet' },
                  { name: 'Rocket Merchant Wallet', active: hasRocket, set: setHasRocket, desc: 'DBBL mobile banking' },
                ].map((acc, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: `1px solid ${acc.active ? '#0284c7' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>{acc.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{acc.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={acc.active}
                      onChange={e => acc.set(e.target.checked)}
                      style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: PAYMENT METHODS */}
          {currentStep === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 5 — Payment Methods Configuration
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Enable or disable tender payment options available at the POS checkout counter.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {Object.keys(enabledMethods).map(method => (
                  <label
                    key={method}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: `1px solid ${enabledMethods[method] ? '#10b981' : 'rgba(255, 255, 255, 0.08)'}`,
                      borderRadius: '12px',
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff' }}>
                      {method}
                    </span>
                    <input
                      type="checkbox"
                      checked={enabledMethods[method]}
                      onChange={e => setEnabledMethods(prev => ({ ...prev, [method]: e.target.checked }))}
                      style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 6: EMI PLANS */}
          {currentStep === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 6 — Standard Laptop EMI Installment Plans
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Configure active installment tenures, minimum down payments, and late fine rules.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {plans.map(p => (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(30, 41, 59, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '12px',
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Duration: {p.durationMonths} Months • Min Down-payment: {p.minDownPaymentPercent}% • Interest: {p.interestRatePercent}% • Late Fine: ৳{p.lateFeePerDay}/day
                      </div>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: INVOICING */}
          {currentStep === 7 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 7 — Invoice, EMI Contract & Receipt Numbering
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Configure transaction-safe serial prefix identifiers and legal terms and conditions.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Sales Invoice Prefix
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={invoicePrefix}
                    onChange={e => setInvoicePrefix(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    EMI Account Prefix
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={emiPrefix}
                    onChange={e => setEmiPrefix(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                    Payment Receipt Prefix
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    value={receiptPrefix}
                    onChange={e => setReceiptPrefix(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                  Terms & Conditions (Printed on A4 Invoice & Thermal Receipt)
                </label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={termsText}
                  onChange={e => setTermsText(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 8: NOTIFICATIONS */}
          {currentStep === 8 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
                  Step 8 — SMS & WhatsApp Notification Gateways
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                  Configure automated due date reminders and payment acknowledgments.
                </p>
              </div>

              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#fde68a'
              }}>
                <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.8125rem' }}>
                  <strong>Gateway Credentials Requirement:</strong> External SMS and WhatsApp gateways only activate when verified API tokens are provisioned in System Settings. The ERP will never report fake delivery status.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>SMS Notifications</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>English & Bengali SMS dispatch</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableSms}
                    onChange={e => setEnableSms(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#0284c7' }}
                  />
                </label>

                <label style={{
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>WhatsApp Business Alerts</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Rich invoice and receipt dispatches</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWhatsapp}
                    onChange={e => setEnableWhatsapp(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div style={{
          padding: '1.25rem 2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0a1020',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handlePrev}
            disabled={currentStep === 1}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ color: '#94a3b8' }}
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: currentStep === totalSteps ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : undefined
              }}
            >
              {currentStep === totalSteps ? (
                <>
                  <Save size={16} />
                  <span>Finalize ERP Setup</span>
                </>
              ) : (
                <>
                  <span>Next Step</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
