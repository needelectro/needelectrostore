import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Settings, Save, Download, Upload, 
  Building, Phone, Globe, DollarSign, MessageSquare, Sun, Moon, ShieldCheck, Wrench, CheckCircle2,
  Check, AlertTriangle, Sparkles
} from 'lucide-react';
import { NeedElectroLogo } from '../components/NeedElectroLogo';
import { SetupWizardModal } from '../components/setup/SetupWizardModal';
import { OpeningBalancesModal } from '../components/setup/OpeningBalancesModal';

interface SettingsModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ onNavigate }) => {
  const { 
    settings, updateSettings, 
    exportDatabase, importDatabase, setupStatus, currentUser
  } = useERP();

  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);
  const [isOpeningBalancesOpen, setIsOpeningBalancesOpen] = useState(false);

  // Local state for settings form
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyTagline, setCompanyTagline] = useState(settings.companyTagline);
  const [sisterConcern, setSisterConcern] = useState(settings.sisterConcern || 'A sister Concern Of AMDADS GROUP');
  const [mainBranchName, setMainBranchName] = useState(settings.mainBranchName || 'Main Branch Moulvibazar');
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [website, setWebsite] = useState(settings.website);
  const [address, setAddress] = useState(settings.address);
  const [vatRegistrationNo, setVatRegistrationNo] = useState(settings.vatRegistrationNo);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [emiPrefix, setEmiPrefix] = useState(settings.emiPrefix);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);

  // Notification templates
  const [templateDueSoonEn, setTemplateDueSoonEn] = useState(settings.notificationTemplateDueSoonEn);
  const [templateDueSoonBn, setTemplateDueSoonBn] = useState(settings.notificationTemplateDueSoonBn);
  const [templateOverdueEn, setTemplateOverdueEn] = useState(settings.notificationTemplateOverdueEn);
  const [templateOverdueBn, setTemplateOverdueBn] = useState(settings.notificationTemplateOverdueBn);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      companyTagline,
      sisterConcern,
      mainBranchName,
      phone,
      email,
      website,
      address,
      vatRegistrationNo,
      invoicePrefix,
      emiPrefix,
      currencySymbol,
      notificationTemplateDueSoonEn: templateDueSoonEn,
      notificationTemplateDueSoonBn: templateDueSoonBn,
      notificationTemplateOverdueEn: templateOverdueEn,
      notificationTemplateOverdueBn: templateOverdueBn
    });
  };

  const handleExportJSON = () => {
    const json = exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeedElectro_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = importDatabase(content);
        if (ok) alert('Backup database imported successfully! Reloading...');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header" style={{ marginBottom: '0.25rem' }}>
        <div className="page-title-group">
          <h1>
            <Settings size={28} color="var(--brand-primary)" />
            System Configuration & Administration
          </h1>
          <p>
            Branding, Bangladesh VAT registration, EMI notification templates (EN/BN), and JSON database backup/recovery.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
            <Download size={15} /> Export JSON Backup
          </button>
        </div>
      </div>

      {/* Setup Status Checklist Card (Req 66) */}
      <div className="erp-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={20} color="#38bdf8" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                System Setup Status (Req 66)
              </h3>
            </div>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              {Object.values(setupStatus || {}).filter(v => v === true).length} of 10 Configured
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { title: 'Company Identity', ok: setupStatus?.isCompanyConfigured },
              { title: 'Super Admin Account', ok: setupStatus?.isSuperAdminConfigured },
              { title: 'Main Operating Branch', ok: setupStatus?.isMainBranchConfigured },
              { title: 'Central Tech Warehouse', ok: setupStatus?.isWarehouseConfigured },
              { title: 'Financial Accounts', ok: setupStatus?.isFinancialAccountsConfigured },
              { title: 'Payment Tender Methods', ok: setupStatus?.isPaymentMethodsConfigured },
              { title: 'EMI Installment Plans', ok: setupStatus?.isEmiPlansConfigured },
              { title: 'Invoice Prefix / Terms', ok: setupStatus?.isInvoiceSettingsConfigured },
              { title: 'Notification Gateways', ok: setupStatus?.isNotificationConfigured },
              { title: 'Opening Balance Ledger', ok: setupStatus?.isOpeningBalancesConfigured },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                {item.ok ? <Check size={14} color="#10b981" /> : <AlertTriangle size={14} color="#f59e0b" />}
                <span style={{ color: item.ok ? '#ffffff' : '#94a3b8' }}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsSetupWizardOpen(true)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>Launch 8-Step Setup Wizard</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsOpeningBalancesOpen(true)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <DollarSign size={14} />
            <span>Authorize Opening Balances</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Section 1: Business Identity & Branding */}
        <div className="erp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="var(--brand-primary)" />
            1. Corporate Identity & Tax Credentials
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Company Legal Name *</label>
              <input
                type="text"
                className="form-input"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline *</label>
              <input
                type="text"
                className="form-input"
                value={companyTagline}
                onChange={e => setCompanyTagline(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Hotline Phone Numbers</label>
              <input
                type="text"
                className="form-input"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Website URL</label>
              <input
                type="text"
                className="form-input"
                value={website}
                onChange={e => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Parent Concern / Affiliation (From Card)</label>
              <input
                type="text"
                className="form-input"
                value={sisterConcern}
                onChange={e => setSisterConcern(e.target.value)}
                placeholder="A sister Concern Of AMDADS GROUP"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Primary HQ Branch Title</label>
              <input
                type="text"
                className="form-input"
                value={mainBranchName}
                onChange={e => setMainBranchName(e.target.value)}
                placeholder="Main Branch Moulvibazar"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Head Showroom Address (Shop#5, MR Plaza, Kusumbag)</label>
              <input
                type="text"
                className="form-input"
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">VAT BIN / Registration No</label>
              <input
                type="text"
                className="form-input"
                value={vatRegistrationNo}
                onChange={e => setVatRegistrationNo(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Business Card Master Visualizer */}
        <div className="erp-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05), rgba(15, 23, 42, 0.2))', border: '1px solid rgba(2, 132, 199, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--brand-accent)" />
              Official Business Card & Brand Identity Preview
            </h3>
            <span style={{ fontSize: '0.75rem', background: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '99px', fontWeight: 'bold' }}>
              Moulvibazar HQ Standard
            </span>
          </div>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            This design renders all live ERP branding exactly as printed on the official NEED ELECTRO corporate business card and showroom banner:
          </p>

          {/* Visual Business Card Simulation */}
          <div style={{
            background: '#f8fafc',
            color: '#0f172a',
            borderRadius: '16px',
            border: '2px solid #bae6fd',
            boxShadow: '0 10px 25px -5px rgba(2, 132, 199, 0.2)',
            overflow: 'hidden',
            maxWidth: '850px',
            margin: '0 auto'
          }}>
            {/* Main Card Body */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', minHeight: '340px' }}>
              {/* Left Column */}
              <div style={{
                background: '#ffffff',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRight: '1px solid #e2e8f0',
                position: 'relative'
              }}>
                {/* Contact List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0369a1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      📍
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{mainBranchName}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0369a1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      📞
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#0284c7' }}>{phone}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0369a1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🌐
                    </div>
                    <span style={{ color: '#334155' }}>{website}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0369a1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      ✉️
                    </div>
                    <span style={{ color: '#334155' }}>{email}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#0369a1', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      🏬
                    </div>
                    <span style={{ color: '#334155', fontWeight: '500' }}>{address}</span>
                  </div>
                </div>

                {/* Sister Concern Affiliation Footer */}
                <div style={{
                  marginTop: '1.5rem',
                  paddingTop: '0.75rem',
                  borderTop: '2px solid #e0f2fe',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '0.06em' }}>
                    — A sister Concern Of —
                  </div>
                  <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0369a1', letterSpacing: '0.04em' }}>
                    AMDADS GROUP
                  </div>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '1px', background: '#0284c7' }} />
                    <span style={{ width: '5px', height: '5px', borderRadius: '1px', background: '#0284c7' }} />
                    <span style={{ width: '5px', height: '5px', borderRadius: '1px', background: '#0284c7' }} />
                  </div>
                </div>
              </div>

              {/* Right Column: Logo Banner & 4 Services */}
              <div style={{
                background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1rem' }}>
                  <NeedElectroLogo variant="master-image" size="lg" theme="light" />
                </div>

                {/* Services Section Header */}
                <div style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  borderRadius: '20px 0 0 20px',
                  padding: '0.35rem 1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  width: 'fit-content',
                  marginBottom: '0.75rem',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                }}>
                  <span>Our Services</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>● ● ●</span>
                </div>

                {/* 4 Exact Services from Card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                      💻
                    </div>
                    <span>Laptops, Computers, CCTV, Computer Accessories</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                      🏠
                    </div>
                    <span>Complete electrical work of the house</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                      💡
                    </div>
                    <span>Safe and modern smart electric solutions</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                      📱
                    </div>
                    <span>Mobile App & Website Development</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0 }}>
                      📹
                    </div>
                    <span>CCTV camera installation and setup services</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Numbering Prefixes & Currency */}
        <div className="erp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <DollarSign size={18} color="#10b981" />
            2. Invoicing, Currency & Numbering Sequences
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Invoice Prefix</label>
              <input
                type="text"
                className="form-input"
                value={invoicePrefix}
                onChange={e => setInvoicePrefix(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">EMI Account Prefix</label>
              <input
                type="text"
                className="form-input"
                value={emiPrefix}
                onChange={e => setEmiPrefix(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input
                type="text"
                className="form-input"
                value={currencySymbol}
                onChange={e => setCurrencySymbol(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Bilingual EMI Notification Templates */}
        <div className="erp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="#f59e0b" />
            3. Automated Bilingual EMI Notification Templates
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Due Soon / Upcoming Notice (English)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={templateDueSoonEn}
                onChange={e => setTemplateDueSoonEn(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Due Soon / Upcoming Notice (বাংলা / Bengali)</label>
              <textarea
                className="form-textarea"
                rows={3}
                style={{ fontFamily: 'var(--font-bangla)' }}
                value={templateDueSoonBn}
                onChange={e => setTemplateDueSoonBn(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overdue Notice Template (English)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={templateOverdueEn}
                onChange={e => setTemplateOverdueEn(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overdue Notice Template (বাংলা / Bengali)</label>
              <textarea
                className="form-textarea"
                rows={3}
                style={{ fontFamily: 'var(--font-bangla)' }}
                value={templateOverdueBn}
                onChange={e => setTemplateOverdueBn(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Database Import & Disaster Recovery */}
        <div className="erp-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            4. Database Backup & JSON Restore
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Backup all tables, invoices, serial numbers, customers, and accounting journals to an offline JSON file.
          </p>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
              <Download size={15} /> Download Full Database JSON
            </button>

            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={15} /> Restore from JSON File
              <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={18} /> Save System Settings
          </button>
        </div>
      </form>

      {/* Guided Setup & Opening Balances Modals */}
      <SetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
      />

      <OpeningBalancesModal
        isOpen={isOpeningBalancesOpen}
        onClose={() => setIsOpeningBalancesOpen(false)}
      />
    </div>
  );
};
