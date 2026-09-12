import React, { useState } from 'react';
import { useERP } from '../services/erpStore';
import { 
  Sliders, ShieldCheck, Building, Package, DollarSign, Receipt, 
  CreditCard, Layers, Wrench, Shield, Bell, Lock, Activity, 
  Save, Plus, Edit2, Trash2, CheckCircle2, AlertTriangle, AlertCircle, 
  Download, Upload, Search, Filter, Eye, Users, 
  ArrowRight, Check, X, Smartphone, Globe, Mail, Phone, Calendar, 
  Hash, Tag, FileText, ChevronRight, Laptop, Monitor, Wifi, Zap,
  Key, Database, UserCheck, Moon, Sun, ArrowLeftRight
} from 'lucide-react';
import { 
  ProductCategoryConfig, BrandConfig, ConfigurablePaymentMethod, 
  ExpenseCategoryConfig, ServiceCategoryConfig, WarrantyRuleConfig, 
  DynamicNotificationTemplate, CategoryAttribute, Branch, User, AccountStatus,
  PosSettings, InventoryRules
} from '../types';

import { MasterEntityHub } from '../components/admin/MasterEntityHub';

type ControlCenterTab = 
  | 'master_crud'
  | 'business'
  | 'catalog'
  | 'pricing'
  | 'sales_pos'
  | 'emi'
  | 'inventory'
  | 'finance'
  | 'services'
  | 'warranty'
  | 'notifications'
  | 'security'
  | 'maintenance';

interface ControlCenterModuleProps {
  onNavigate: (module: string, targetId?: string) => void;
  initialTab?: ControlCenterTab;
}

export const ControlCenterModule: React.FC<ControlCenterModuleProps> = ({ onNavigate, initialTab }) => {
  const {
    settings, updateSettings, branches, addBranch, updateBranch, deleteBranch, users, roles,
    products, customers, financialAccounts, auditLogs,
    categoriesConfig, saveCategoryConfig, deleteCategoryConfig,
    brandsConfig, saveBrandConfig, deleteBrandConfig,
    paymentMethodsConfig, savePaymentMethodConfig, deletePaymentMethodConfig,
    expenseCategoriesConfig, saveExpenseCategoryConfig, deleteExpenseCategoryConfig,
    serviceCategoriesConfig, saveServiceCategoryConfig, deleteServiceCategoryConfig,
    warrantyRulesConfig, saveWarrantyRuleConfig, deleteWarrantyRuleConfig,
    notificationTemplatesConfig, saveNotificationTemplateConfig, deleteNotificationTemplateConfig,
    priceAuditLog, updateProductPrice, customerMergeAudit, mergeCustomers,
    posSettings, updatePosSettings, inventoryRules, updateInventoryRules,
    emiPlans, saveEMIPlanWithVersioning, currentUser, addToast,
    exportDatabase, importDatabase, setupStatus
  } = useERP();

  const [activeTab, setActiveTab] = useState<ControlCenterTab>(
    initialTab || (currentUser.role === 'SUPER_ADMIN' ? 'master_crud' : 'business')
  );

  // -------------------------------------------------------------
  // TAB 1: BUSINESS PROFILE & BRANCHES
  // -------------------------------------------------------------
  const [bizForm, setBizForm] = useState({
    companyName: settings.companyName,
    companyTagline: settings.companyTagline,
    sisterConcern: settings.sisterConcern,
    phone: settings.phone,
    email: settings.email,
    supportEmail: settings.supportEmail || 'info.needelectro@gmail.com',
    website: settings.website,
    address: settings.address,
    vatRegistrationNo: settings.vatRegistrationNo,
    facebookUrl: settings.facebookUrl || '',
    youtubeUrl: settings.youtubeUrl || '',
    linkedinUrl: settings.linkedinUrl || '',
    whatsappNumber: settings.whatsappNumber || '',
    footerText: settings.footerText || ''
  });

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(bizForm);
    addToast('success', 'Business Profile Saved', 'Company master information has been successfully updated.');
  };

  // Branch Modal state
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranchInControl, setEditingBranchInControl] = useState<Branch | null>(null);
  const [newBranch, setNewBranch] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    isWarehouse: false,
    active: true
  });

  const handleOpenAddBranchInControl = () => {
    setEditingBranchInControl(null);
    setNewBranch({ name: '', code: '', address: '', phone: '', email: '', isWarehouse: false, active: true });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranchInControl = (b: Branch) => {
    setEditingBranchInControl(b);
    setNewBranch({
      name: b.name,
      code: b.code,
      address: b.address || '',
      phone: b.phone || '',
      email: b.email || '',
      isWarehouse: Boolean(b.isWarehouse),
      active: b.active !== undefined ? b.active : true
    });
    setIsBranchModalOpen(true);
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.name.trim() || !newBranch.code.trim()) {
      addToast('error', 'Validation Error', 'Branch Name and Code are mandatory.');
      return;
    }
    if (editingBranchInControl) {
      const res = await updateBranch({
        ...editingBranchInControl,
        ...newBranch,
        name: newBranch.name.trim(),
        code: newBranch.code.trim().toUpperCase()
      });
      if (res.success) {
        setIsBranchModalOpen(false);
        setEditingBranchInControl(null);
        setNewBranch({ name: '', code: '', address: '', phone: '', email: '', isWarehouse: false, active: true });
      }
    } else {
      const res = await addBranch({
        ...newBranch,
        name: newBranch.name.trim(),
        code: newBranch.code.trim().toUpperCase()
      });
      if (res.success) {
        setIsBranchModalOpen(false);
        setNewBranch({ name: '', code: '', address: '', phone: '', email: '', isWarehouse: false, active: true });
      }
    }
  };

  const handleDeleteBranchInControl = async (b: Branch) => {
    if (window.confirm(`Are you sure you want to permanently delete branch '${b.name}' (${b.code})?`)) {
      await deleteBranch(b.id);
    }
  };

  // -------------------------------------------------------------
  // TAB 2: PRODUCT CATALOG & CUSTOM ATTRIBUTES
  // -------------------------------------------------------------
  const [selectedCatId, setSelectedCatId] = useState<string>(categoriesConfig[0]?.id || 'cat-laptop');
  const selectedCategory = categoriesConfig.find(c => c.id === selectedCatId) || categoriesConfig[0];

  // Category Edit Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<ProductCategoryConfig | null>(null);

  // New Attribute inside selected Category
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [newAttr, setNewAttr] = useState<Partial<CategoryAttribute>>({
    name: '',
    code: '',
    type: 'TEXT',
    options: [],
    required: false,
    unit: ''
  });
  const [attrOptionsRaw, setAttrOptionsRaw] = useState('');

  const handleOpenCatModal = (cat?: ProductCategoryConfig) => {
    if (cat) {
      setEditingCat({ ...cat });
    } else {
      setEditingCat({
        id: 'cat-' + Date.now(),
        name: '',
        code: '',
        description: '',
        icon: 'Package',
        subcategories: [],
        attributes: [],
        isSerializedDefault: false,
        defaultWarrantyMonths: 12,
        isActive: true,
        sortOrder: categoriesConfig.length + 1
      });
    }
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.name.trim()) return;
    saveCategoryConfig(editingCat);
    setIsCatModalOpen(false);
  };

  const handleSaveAttribute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newAttr.name || !newAttr.code) return;
    const optionsArray = newAttr.type === 'SELECT' ? attrOptionsRaw.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const attribute: CategoryAttribute = {
      id: 'attr-' + Date.now(),
      name: newAttr.name,
      code: newAttr.code.toLowerCase().replace(/\s+/g, '_'),
      type: newAttr.type as any || 'TEXT',
      options: optionsArray,
      required: !!newAttr.required,
      unit: newAttr.unit
    };

    const updatedCat: ProductCategoryConfig = {
      ...selectedCategory,
      attributes: [...selectedCategory.attributes, attribute]
    };
    saveCategoryConfig(updatedCat);
    setIsAttrModalOpen(false);
    setNewAttr({ name: '', code: '', type: 'TEXT', options: [], required: false, unit: '' });
    setAttrOptionsRaw('');
  };

  const handleDeleteAttribute = (attrId: string) => {
    if (!selectedCategory) return;
    const updatedCat: ProductCategoryConfig = {
      ...selectedCategory,
      attributes: selectedCategory.attributes.filter(a => a.id !== attrId)
    };
    saveCategoryConfig(updatedCat);
  };

  // Brand Modal
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandConfig | null>(null);

  const handleOpenBrandModal = (brand?: BrandConfig) => {
    if (brand) {
      setEditingBrand({ ...brand });
    } else {
      setEditingBrand({
        id: 'brand-' + Date.now(),
        name: '',
        code: '',
        categoryIds: [selectedCatId],
        website: '',
        isActive: true
      });
    }
    setIsBrandModalOpen(true);
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand || !editingBrand.name.trim()) return;
    saveBrandConfig(editingBrand);
    setIsBrandModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 3: PRICE MANAGEMENT & AUDIT LOG
  // -------------------------------------------------------------
  const [priceSelectedProductId, setPriceSelectedProductId] = useState<string>(products[0]?.id || '');
  const selectedPriceProduct = products.find(p => p.id === priceSelectedProductId);
  const [priceUpdates, setPriceUpdates] = useState({
    retailPrice: 0,
    emiPrice: 0,
    wholesalePrice: 0,
    purchasePrice: 0,
    costPrice: 0,
    reason: ''
  });

  const handleSelectPriceProduct = (prodId: string) => {
    setPriceSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setPriceUpdates({
        retailPrice: prod.retailPrice,
        emiPrice: prod.emiPrice,
        wholesalePrice: prod.wholesalePrice,
        purchasePrice: prod.purchasePrice,
        costPrice: prod.costPrice,
        reason: ''
      });
    }
  };

  const handleApplyPriceChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPriceProduct) return;
    if (!priceUpdates.reason.trim()) {
      addToast('error', 'Audit Requirement', 'A detailed justification/reason is required for price adjustments.');
      return;
    }
    updateProductPrice(selectedPriceProduct.id, {
      retailPrice: priceUpdates.retailPrice,
      emiPrice: priceUpdates.emiPrice,
      wholesalePrice: priceUpdates.wholesalePrice
    }, priceUpdates.reason);
  };

  // -------------------------------------------------------------
  // TAB 4: SALES & POS SETTINGS & PAYMENT METHODS
  // -------------------------------------------------------------
  const [posForm, setPosForm] = useState<PosSettings>({ ...posSettings });

  const handleSavePosSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePosSettings(posForm);
  };

  // Payment Method Modal
  const [isPmModalOpen, setIsPmModalOpen] = useState(false);
  const [editingPm, setEditingPm] = useState<ConfigurablePaymentMethod | null>(null);

  const handleOpenPmModal = (pm?: ConfigurablePaymentMethod) => {
    if (pm) {
      setEditingPm({ ...pm });
    } else {
      setEditingPm({
        id: 'pm-' + Date.now(),
        name: '',
        code: '',
        type: 'MFS',
        linkedAccountId: financialAccounts[0]?.id || 'acc-1',
        accountNumber: '',
        chargePercent: 0,
        instructions: '',
        isActive: true,
        sortOrder: paymentMethodsConfig.length + 1
      });
    }
    setIsPmModalOpen(true);
  };

  const handleSavePm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPm || !editingPm.name) return;
    savePaymentMethodConfig(editingPm);
    setIsPmModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 5: EMI PLANS & VERSIONING
  // -------------------------------------------------------------
  const [isEmiModalOpen, setIsEmiModalOpen] = useState(false);
  const [editingEmiPlan, setEditingEmiPlan] = useState<{ plan: Partial<any>; reason: string }>({
    plan: {
      id: 'emi-plan-' + Date.now(),
      name: '',
      durationMonths: 6,
      minDownPaymentPercent: 20,
      interestRatePercent: 0,
      processingFee: 500,
      lateFeePerDay: 50,
      gracePeriodDays: 5,
      isActive: true,
      description: '',
      termsText: 'Standard Hire-Purchase Installment Contract'
    },
    reason: ''
  });

  const handleOpenEmiModal = (plan?: any) => {
    if (plan) {
      setEditingEmiPlan({
        plan: { ...plan },
        reason: 'Periodic revision of interest, fees or duration parameters'
      });
    } else {
      setEditingEmiPlan({
        plan: {
          id: 'emi-plan-' + Date.now(),
          name: '',
          durationMonths: 6,
          minDownPaymentPercent: 20,
          interestRatePercent: 0,
          processingFee: 500,
          lateFeePerDay: 50,
          gracePeriodDays: 5,
          isActive: true,
          description: '',
          termsText: 'Standard Hire-Purchase Installment Contract'
        },
        reason: 'Initial creation of new installment package'
      });
    }
    setIsEmiModalOpen(true);
  };

  const handleSaveEmiPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmiPlan.plan.name) return;
    saveEMIPlanWithVersioning(editingEmiPlan.plan as any, editingEmiPlan.reason);
    setIsEmiModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 6: INVENTORY & SERIAL RULES
  // -------------------------------------------------------------
  const [invForm, setInvForm] = useState<InventoryRules>({ ...inventoryRules });

  const handleSaveInventoryRules = (e: React.FormEvent) => {
    e.preventDefault();
    updateInventoryRules(invForm);
  };

  const toggleSerialCategory = (catName: string) => {
    const list = invForm.serialTrackingMandatoryCategories || [];
    const exists = list.includes(catName);
    const updated = exists ? list.filter((c: string) => c !== catName) : [...list, catName];
    setInvForm({ ...invForm, serialTrackingMandatoryCategories: updated });
  };

  // -------------------------------------------------------------
  // TAB 7: FINANCE & EXPENSES
  // -------------------------------------------------------------
  const [isExpModalOpen, setIsExpModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<ExpenseCategoryConfig | null>(null);

  const handleOpenExpModal = (exp?: ExpenseCategoryConfig) => {
    if (exp) {
      setEditingExp({ ...exp });
    } else {
      setEditingExp({
        id: 'exp-' + Date.now(),
        name: '',
        code: '',
        description: '',
        isTaxDeductible: true,
        isActive: true
      });
    }
    setIsExpModalOpen(true);
  };

  const handleSaveExp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExp || !editingExp.name) return;
    saveExpenseCategoryConfig(editingExp);
    setIsExpModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 8: SERVICE & REPAIR CATEGORIES
  // -------------------------------------------------------------
  const [isScModalOpen, setIsScModalOpen] = useState(false);
  const [editingSc, setEditingSc] = useState<ServiceCategoryConfig | null>(null);

  const handleOpenScModal = (sc?: ServiceCategoryConfig) => {
    if (sc) {
      setEditingSc({ ...sc });
    } else {
      setEditingSc({
        id: 'sc-' + Date.now(),
        name: '',
        code: '',
        defaultLaborCost: 500,
        estimatedDurationHours: 4,
        warrantyDays: 30,
        description: '',
        isActive: true
      });
    }
    setIsScModalOpen(true);
  };

  const handleSaveSc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSc || !editingSc.name) return;
    saveServiceCategoryConfig(editingSc);
    setIsScModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 9: WARRANTY POLICIES
  // -------------------------------------------------------------
  const [isWrModalOpen, setIsWrModalOpen] = useState(false);
  const [editingWr, setEditingWr] = useState<WarrantyRuleConfig | null>(null);

  const handleOpenWrModal = (wr?: WarrantyRuleConfig) => {
    if (wr) {
      setEditingWr({ ...wr });
    } else {
      setEditingWr({
        id: 'wr-' + Date.now(),
        categoryName: '',
        defaultMonths: 12,
        termsText: 'Standard official manufacturer and service warranty terms.',
        replacementAllowed: true,
        repairAllowed: true,
        voidConditions: 'Physical drop impact, burned chips, water spillage, unapproved tampering.',
        isActive: true
      });
    }
    setIsWrModalOpen(true);
  };

  const handleSaveWr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWr || !editingWr.categoryName) return;
    saveWarrantyRuleConfig(editingWr);
    setIsWrModalOpen(false);
  };

  // -------------------------------------------------------------
  // TAB 10: NOTIFICATION TEMPLATES
  // -------------------------------------------------------------
  const [selectedTplId, setSelectedTplId] = useState<string>(notificationTemplatesConfig[0]?.id || 'tpl-due-soon');
  const selectedTpl = notificationTemplatesConfig.find(t => t.id === selectedTplId) || notificationTemplatesConfig[0];
  const [tplEditForm, setTplEditForm] = useState<DynamicNotificationTemplate>({ ...selectedTpl });
  const [tplLangTab, setTplLangTab] = useState<'en' | 'bn'>('bn');

  const handleSelectTpl = (tplId: string) => {
    setSelectedTplId(tplId);
    const t = notificationTemplatesConfig.find(x => x.id === tplId);
    if (t) setTplEditForm({ ...t });
  };

  const handleSaveTpl = (e: React.FormEvent) => {
    e.preventDefault();
    saveNotificationTemplateConfig(tplEditForm);
  };

  const insertPlaceholder = (ph: string) => {
    if (tplLangTab === 'bn') {
      setTplEditForm({ ...tplEditForm, templateBn: tplEditForm.templateBn + ' ' + ph });
    } else {
      setTplEditForm({ ...tplEditForm, templateEn: tplEditForm.templateEn + ' ' + ph });
    }
  };

  // -------------------------------------------------------------
  // TAB 11: SECURITY, USERS & RBAC
  // -------------------------------------------------------------
  const [twoFactorEnforced, setTwoFactorEnforced] = useState(false);

  // -------------------------------------------------------------
  // TAB 12: SYSTEM MAINTENANCE, CUSTOMER MERGE & BACKUP
  // -------------------------------------------------------------
  const [sourceCustId, setSourceCustId] = useState(customers[0]?.id || '');
  const [targetCustId, setTargetCustId] = useState(customers[1]?.id || '');
  const [mergeReason, setMergeReason] = useState('Duplicate customer phone profiles identified during showroom audit');

  const handleMergeCustomers = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceCustId === targetCustId) {
      addToast('error', 'Selection Error', 'Source and target customers must be different.');
      return;
    }
    const confirm = window.confirm('Are you sure you want to merge these customers? Invoices, EMI accounts, and service job history will be transferred to the target customer. This operation is permanent.');
    if (!confirm) return;
    mergeCustomers(sourceCustId, targetCustId, mergeReason);
  };

  const handleExportJSON = () => {
    const json = exportDatabase();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NeedElectro_Master_Config_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('success', 'Backup Generated', 'Complete ERP database and control configuration exported.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (!parsed.settings && !parsed.users) {
            addToast('error', 'Invalid Format', 'Uploaded file does not match NEED ELECTRO ERP backup schema.');
            return;
          }
          const ok = importDatabase(content);
          if (ok) addToast('success', 'Restored', 'System data restored successfully.');
        } catch (err) {
          addToast('error', 'Import Failed', 'Corrupt JSON file provided.');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(2, 132, 199, 0.3)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 8px 20px -4px rgba(2, 132, 199, 0.5)'
          }}>
            <Sliders size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                Super Admin Control Center
              </h1>
              <span style={{
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                letterSpacing: '0.05em'
              }}>
                MASTER CLEARANCE
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.35rem 0 0' }}>
              Centralized enterprise management, dynamic catalog rules, pricing policies, and system administration for NEED ELECTRO.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleExportJSON}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={15} />
            Export Config
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onNavigate('dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            Return to ERP
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {[
          { id: 'master_crud', label: '👑 Master Entity Hub', icon: ShieldCheck },
          { id: 'business', label: 'Company & Branches', icon: Building },
          { id: 'catalog', label: 'Catalog & Attributes', icon: Package },
          { id: 'pricing', label: 'Pricing & Audits', icon: DollarSign },
          { id: 'sales_pos', label: 'Sales & POS', icon: Receipt },
          { id: 'emi', label: 'EMI Plans & Rules', icon: CreditCard },
          { id: 'inventory', label: 'Inventory Rules', icon: Layers },
          { id: 'finance', label: 'Chart of Accounts', icon: Activity },
          { id: 'services', label: 'Service & Repairs', icon: Wrench },
          { id: 'warranty', label: 'Warranty Policies', icon: Shield },
          { id: 'notifications', label: 'Notification Center', icon: Bell },
          { id: 'security', label: 'Users & Security', icon: Lock },
          { id: 'maintenance', label: 'Maintenance & Merging', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ControlCenterTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                background: isActive ? 'var(--brand-primary)' : 'var(--bg-card)',
                border: '1px solid',
                borderColor: isActive ? 'var(--brand-primary)' : 'var(--border-color)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT AREAS */}

      {/* ========================================================================= */}
      {/* 0. SUPER ADMIN UNIVERSAL MASTER ENTITY HUB */}
      {/* ========================================================================= */}
      {activeTab === 'master_crud' && (
        <MasterEntityHub />
      )}

      {/* ========================================================================= */}
      {/* 1. BUSINESS PROFILE & BRANCHES */}
      {/* ========================================================================= */}
      {activeTab === 'business' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Company Info Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={20} color="var(--brand-primary)" />
              Company Information & Branding
            </h3>

            <form onSubmit={handleSaveBusiness} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Company Legal Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={bizForm.companyName}
                  onChange={e => setBizForm({ ...bizForm, companyName: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Company Tagline</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={bizForm.companyTagline}
                  onChange={e => setBizForm({ ...bizForm, companyTagline: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Parent / Sister Concern Text</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={bizForm.sisterConcern}
                  onChange={e => setBizForm({ ...bizForm, sisterConcern: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Showroom Hotline</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={bizForm.phone}
                    onChange={e => setBizForm({ ...bizForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">WhatsApp Number</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={bizForm.whatsappNumber}
                    onChange={e => setBizForm({ ...bizForm, whatsappNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Corporate Email</label>
                  <input 
                    type="email" 
                    className="form-control"
                    value={bizForm.email}
                    onChange={e => setBizForm({ ...bizForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Support Email</label>
                  <input 
                    type="email" 
                    className="form-control"
                    value={bizForm.supportEmail}
                    onChange={e => setBizForm({ ...bizForm, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Website Domain</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={bizForm.website}
                  onChange={e => setBizForm({ ...bizForm, website: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Headquarters / Showroom Address</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  value={bizForm.address}
                  onChange={e => setBizForm({ ...bizForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">VAT / BIN Registration No.</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={bizForm.vatRegistrationNo}
                  onChange={e => setBizForm({ ...bizForm, vatRegistrationNo: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Invoice & Receipt Footer Statement</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  value={bizForm.footerText}
                  onChange={e => setBizForm({ ...bizForm, footerText: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} />
                Save Business Information
              </button>
            </form>
          </div>

          {/* Branches & Warehouses Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                    Branches & Warehouses
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                    Multi-location showroom and central warehouse hub control
                  </p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleOpenAddBranchInControl}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} />
                  Add Branch
                </button>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Location Name</th>
                      <th>Type</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {branches.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                          No branches configured yet. Click 'Add Branch' above to register your first location.
                        </td>
                      </tr>
                    ) : (
                      branches.map(b => (
                        <tr key={b.id}>
                          <td>
                            <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{b.code}</span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{b.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.address || '—'}</div>
                          </td>
                          <td>
                            <span className={`badge ${b.isWarehouse ? 'badge-warning' : 'badge-primary'}`}>
                              {b.isWarehouse ? 'Warehouse' : 'Showroom'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.8rem' }}>{b.phone || '—'}</td>
                          <td>
                            <span className={`badge ${b.active ? 'badge-success' : 'badge-danger'}`}>
                              {b.active ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                              <button 
                                className="btn btn-secondary btn-xs" 
                                title="Edit Branch"
                                onClick={() => handleOpenEditBranchInControl(b)}
                                style={{ padding: '0.2rem 0.45rem' }}
                              >
                                <Edit2 size={12} />
                              </button>
                              <button 
                                className="btn btn-danger btn-xs" 
                                title="Delete Branch"
                                onClick={() => handleDeleteBranchInControl(b)}
                                style={{ padding: '0.2rem 0.45rem' }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Social Media Links Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={18} color="var(--brand-primary)" />
                Social Media Channels
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>Facebook Page URL</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={bizForm.facebookUrl}
                    onChange={e => setBizForm({ ...bizForm, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/needelectro"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>YouTube Channel URL</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={bizForm.youtubeUrl}
                    onChange={e => setBizForm({ ...bizForm, youtubeUrl: e.target.value })}
                    placeholder="https://youtube.com/@needelectro"
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '0.8rem' }}>LinkedIn Profile</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={bizForm.linkedinUrl}
                    onChange={e => setBizForm({ ...bizForm, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/needelectro"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CATALOG, CATEGORIES & DYNAMIC ATTRIBUTES */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          {/* Categories Sidebar List */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                Categories ({categoriesConfig.length})
              </h3>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenCatModal()}
                style={{ padding: '0.25rem 0.5rem' }}
              >
                <Plus size={14} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {categoriesConfig.map(cat => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    background: selectedCatId === cat.id ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-card-muted)',
                    border: '1px solid',
                    borderColor: selectedCatId === cat.id ? 'var(--brand-primary)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{cat.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      {cat.attributes?.length || 0} Custom Attributes
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '0.2rem' }}
                      onClick={(e) => { e.stopPropagation(); handleOpenCatModal(cat); }}
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Brands Management Section */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0 }}>
                  Brands Directory ({brandsConfig.length})
                </h4>
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ padding: '0.2rem 0.5rem' }}
                  onClick={() => handleOpenBrandModal()}
                >
                  <Plus size={13} />
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {brandsConfig.map(b => (
                  <span 
                    key={b.id} 
                    className="badge badge-secondary"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleOpenBrandModal(b)}
                  >
                    {b.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Category Attributes Builder */}
          {selectedCategory && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                      {selectedCategory.name} Custom Specifications
                    </h3>
                    <span className="badge badge-primary">{selectedCategory.code}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                    {selectedCategory.description || 'Category-specific technical specifications and validation rules.'}
                  </p>
                </div>

                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsAttrModalOpen(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Plus size={15} />
                  Add Field / Attribute
                </button>
              </div>

              {/* Subcategories preview */}
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Configured Subcategories
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {selectedCategory.subcategories?.map((sub, i) => (
                    <span key={i} className="badge badge-primary" style={{ background: 'rgba(2, 132, 199, 0.12)', color: 'var(--brand-primary)' }}>
                      {sub}
                    </span>
                  ))}
                  {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No subcategories configured.</span>
                  )}
                </div>
              </div>

              {/* Attributes Table */}
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Attribute Name</th>
                      <th>Key / Code</th>
                      <th>Data Type</th>
                      <th>Mandatory?</th>
                      <th>Predefined Options / Unit</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCategory.attributes?.map(attr => (
                      <tr key={attr.id}>
                        <td style={{ fontWeight: 600 }}>{attr.name}</td>
                        <td><code>{attr.code}</code></td>
                        <td>
                          <span className="badge badge-secondary">{attr.type}</span>
                        </td>
                        <td>
                          {attr.required ? (
                            <span className="badge badge-danger">Required</span>
                          ) : (
                            <span className="badge badge-secondary">Optional</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          {attr.options && attr.options.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                              {attr.options.slice(0, 4).map((opt, oi) => (
                                <span key={oi} style={{ background: 'var(--bg-card-muted)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                  {opt}
                                </span>
                              ))}
                              {attr.options.length > 4 && <span>+{attr.options.length - 4} more</span>}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>{attr.unit ? `Unit: ${attr.unit}` : 'Free text input'}</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDeleteAttribute(attr.id)}
                            style={{ color: '#ef4444' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!selectedCategory.attributes || selectedCategory.attributes.length === 0) && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No attributes configured yet. Click "Add Field / Attribute" to define custom specs for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRICE MANAGEMENT & IMMUTABLE AUDIT LOG */}
      {/* ========================================================================= */}
      {activeTab === 'pricing' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Price Modifier Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} color="var(--brand-primary)" />
              Product Price Management
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Re-price products with immutable audit logging. Historical invoices, payments, and active EMI terms remain protected.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Select Product to Re-Price</label>
              <select 
                className="form-control"
                value={priceSelectedProductId}
                onChange={e => handleSelectPriceProduct(e.target.value)}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku}) — Current: ৳{p.retailPrice.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {selectedPriceProduct && (
              <form onSubmit={handleApplyPriceChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    CURRENT PRICING METRICS
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Cost Price</div>
                      <div style={{ fontWeight: 700 }}>৳{selectedPriceProduct.costPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Retail Price</div>
                      <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>৳{selectedPriceProduct.retailPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>EMI Price</div>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>৳{selectedPriceProduct.emiPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="form-label">New Retail Price (৳)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={priceUpdates.retailPrice}
                      onChange={e => setPriceUpdates({ ...priceUpdates, retailPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">New EMI Price (৳)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={priceUpdates.emiPrice}
                      onChange={e => setPriceUpdates({ ...priceUpdates, emiPrice: Number(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">New Wholesale Price (৳)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={priceUpdates.wholesalePrice}
                    onChange={e => setPriceUpdates({ ...priceUpdates, wholesalePrice: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="form-label">
                    Audit Justification / Reason for Price Change <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    placeholder="e.g. Dollar exchange rate adjustment, official importer tariff update, Eid promotional repricing"
                    value={priceUpdates.reason}
                    onChange={e => setPriceUpdates({ ...priceUpdates, reason: e.target.value })}
                    required
                  />
                </div>

                <div style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <ShieldCheck size={16} />
                  <span>Section 95 Protected: Historical sales invoices and past customer installments remain immutable.</span>
                </div>

                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Save size={16} />
                  Apply Audited Price Change
                </button>
              </form>
            )}
          </div>

          {/* Immutable Price Change Audit Log Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Price Change Audit Trail
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Permanent log of all historical price modifications
                </p>
              </div>
              <span className="badge badge-secondary">{priceAuditLog.length} Records</span>
            </div>

            <div className="table-responsive" style={{ maxHeight: '480px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price Type</th>
                    <th>Old ➔ New</th>
                    <th>Reason & User</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {priceAuditLog.map(log => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.productName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.sku}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary">{log.priceType}</span>
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        <span style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>৳{log.oldPrice.toLocaleString()}</span>
                        {' ➔ '}
                        <span style={{ color: '#10b981' }}>৳{log.newPrice.toLocaleString()}</span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{log.reason}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>By: {log.changedBy}</div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {log.timestamp}
                      </td>
                    </tr>
                  ))}
                  {priceAuditLog.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No price adjustments recorded yet. Changes made on the left will generate immutable audit logs here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SALES & POS SETTINGS & PAYMENT METHODS */}
      {/* ========================================================================= */}
      {activeTab === 'sales_pos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {/* POS Rules Form */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt size={20} color="var(--brand-primary)" />
              POS & Invoicing Operational Rules
            </h3>

            <form onSubmit={handleSavePosSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Invoice Prefix</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={posForm.invoicePrefix}
                    onChange={e => setPosForm({ ...posForm, invoicePrefix: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Next Sequence No.</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={posForm.nextInvoiceNumber}
                    onChange={e => setPosForm({ ...posForm, nextInvoiceNumber: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Return Window (Days)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={posForm.returnWindowDays}
                    onChange={e => setPosForm({ ...posForm, returnWindowDays: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">VAT / Tax Rate (%)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={posForm.taxPercent}
                    onChange={e => setPosForm({ ...posForm, taxPercent: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Max Allowed POS Discount (%)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={posForm.maxDiscountPercent}
                    onChange={e => setPosForm({ ...posForm, maxDiscountPercent: Number(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox"
                      checked={posForm.enablePosDiscounts}
                      onChange={e => setPosForm({ ...posForm, enablePosDiscounts: e.target.checked })}
                    />
                    <span>Allow Cashier POS Discounts</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.35rem' }}>
                    <input 
                      type="checkbox"
                      checked={posForm.enableCreditSales}
                      onChange={e => setPosForm({ ...posForm, enableCreditSales: e.target.checked })}
                    />
                    <span>Allow Due / Credit Sales</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="form-label">Default Invoice Terms & Notes</label>
                <textarea 
                  className="form-control"
                  rows={3}
                  value={posForm.defaultInvoiceNotes}
                  onChange={e => setPosForm({ ...posForm, defaultInvoiceNotes: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Thermal Receipt Footer</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  value={posForm.receiptFooterText}
                  onChange={e => setPosForm({ ...posForm, receiptFooterText: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} />
                Save POS Settings
              </button>
            </form>
          </div>

          {/* Configurable Payment Methods */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Configured Payment Gateways
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Payment methods linked directly to real balance accounts
                </p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenPmModal()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                Add Method
              </button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Method Name</th>
                    <th>Linked Account</th>
                    <th>Fee %</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentMethodsConfig.map(pm => {
                    const acc = financialAccounts.find(a => a.id === pm.linkedAccountId);
                    return (
                      <tr key={pm.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{pm.name}</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{pm.accountNumber || pm.type}</div>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{acc ? acc.name : 'Unlinked'}</span>
                        </td>
                        <td>{pm.chargePercent}%</td>
                        <td>
                          <span className={`badge ${pm.isActive ? 'badge-success' : 'badge-danger'}`}>
                            {pm.isActive ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenPmModal(pm)}
                          >
                            <Edit2 size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EMI PLANS & CONTRACT VERSIONING */}
      {/* ========================================================================= */}
      {activeTab === 'emi' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                  EMI & Hire-Purchase Plans
                </h3>
                <span className="badge badge-primary">Plan Versioning Enabled</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Configurable installment packages. Editing a plan automatically increments its version, protecting existing customer contracts from retroactive changes.
              </p>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenEmiModal()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} />
              Create New EMI Plan
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Plan Name</th>
                  <th>Duration</th>
                  <th>Min Down Pay %</th>
                  <th>Interest Rate %</th>
                  <th>Fees & Penalties</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {emiPlans.map(plan => (
                  <tr key={plan.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{plan.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{plan.description || 'Standard plan'}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{plan.durationMonths} Months</span>
                    </td>
                    <td>{plan.minDownPaymentPercent}%</td>
                    <td>
                      <span className={`badge ${plan.interestRatePercent === 0 ? 'badge-success' : 'badge-warning'}`}>
                        {plan.interestRatePercent === 0 ? '0% Interest' : `${plan.interestRatePercent}% APR`}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      <div>Fee: ৳{plan.processingFee}</div>
                      <div style={{ color: '#ef4444' }}>Late: ৳{plan.lateFeePerDay}/day (Grace: {plan.gracePeriodDays}d)</div>
                    </td>
                    <td>
                      <span className="badge badge-secondary">v{plan.version || 1}</span>
                    </td>
                    <td>
                      <span className={`badge ${plan.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {plan.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleOpenEmiModal(plan)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Edit2 size={13} />
                        Update Plan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. INVENTORY RULES & SERIAL TRACKING */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="var(--brand-primary)" />
              Stock Thresholds & Transfer Policies
            </h3>

            <form onSubmit={handleSaveInventoryRules} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Global Low Stock Alert Threshold</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={invForm.lowStockThresholdDefault}
                  onChange={e => setInvForm({ ...invForm, lowStockThresholdDefault: Number(e.target.value) })}
                  required
                />
                <small style={{ color: 'var(--text-muted)' }}>Items with stock below this number highlight in red across inventory views.</small>
              </div>

              <div>
                <label className="form-label">System Barcode Prefix</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={invForm.barcodePrefix}
                  onChange={e => setInvForm({ ...invForm, barcodePrefix: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--bg-card-muted)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox"
                    checked={invForm.enableOutOfStockWarnings}
                    onChange={e => setInvForm({ ...invForm, enableOutOfStockWarnings: e.target.checked })}
                  />
                  <span>Alert cashier when selling out-of-stock items</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox"
                    checked={invForm.allowNegativeStock}
                    onChange={e => setInvForm({ ...invForm, allowNegativeStock: e.target.checked })}
                  />
                  <span>Allow negative inventory (over-selling authorization)</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input 
                    type="checkbox"
                    checked={invForm.requireApprovalForInterBranchTransfer}
                    onChange={e => setInvForm({ ...invForm, requireApprovalForInterBranchTransfer: e.target.checked })}
                  />
                  <span>Require Branch Manager approval for inter-branch transfers</span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Save size={16} />
                Save Inventory Rules
              </button>
            </form>
          </div>

          {/* Mandatory Serial Categories Checklist */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Serial Number Tracking Enforcement
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Select which product categories mandate individual serial number scanning during Goods Inward (Purchase) and Checkout (POS/EMI).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categoriesConfig.map(cat => {
                const isMandatory = (invForm.serialTrackingMandatoryCategories || []).includes(cat.name);
                return (
                  <div 
                    key={cat.id}
                    onClick={() => toggleSerialCategory(cat.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: isMandatory ? 'rgba(2, 132, 199, 0.1)' : 'var(--bg-card-muted)',
                      border: '1px solid',
                      borderColor: isMandatory ? 'var(--brand-primary)' : 'var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.code}</div>
                    </div>
                    <span className={`badge ${isMandatory ? 'badge-primary' : 'badge-secondary'}`}>
                      {isMandatory ? 'Mandatory Serials' : 'Batch Quantity'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. CHART OF ACCOUNTS & EXPENSE CATEGORIES */}
      {/* ========================================================================= */}
      {activeTab === 'finance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Financial Balance Accounts */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Financial Accounts
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Cash in hand, Bank corporate accounts, and MFS merchant wallets
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Account Name</th>
                    <th>Type</th>
                    <th>A/C No.</th>
                    <th>Current Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {financialAccounts.map(acc => (
                    <tr key={acc.id}>
                      <td style={{ fontWeight: 600 }}>{acc.name}</td>
                      <td>
                        <span className="badge badge-secondary">{acc.type}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{acc.accountNumber}</td>
                      <td style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                        ৳{acc.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense Categories Manager */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Expense Categories ({expenseCategoriesConfig.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Classifications for operational overheads and vouchers
                </p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenExpModal()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                Add Category
              </button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Code</th>
                    <th>Tax Deductible?</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseCategoriesConfig.map(cat => (
                    <tr key={cat.id}>
                      <td style={{ fontWeight: 600 }}>{cat.name}</td>
                      <td><code>{cat.code}</code></td>
                      <td>
                        {cat.isTaxDeductible ? (
                          <span className="badge badge-success">Tax Deductible</span>
                        ) : (
                          <span className="badge badge-secondary">Non-Deductible</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenExpModal(cat)}
                        >
                          <Edit2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. SERVICE & REPAIR CATEGORIES */}
      {/* ========================================================================= */}
      {activeTab === 'services' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Technical Service & Repair Classifications
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Standard labor pricing, estimated technician turnaround hours, and repair service warranties.
              </p>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenScModal()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} />
              Add Service Category
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Service Classification</th>
                  <th>Code</th>
                  <th>Default Labor Fee</th>
                  <th>Estimated Duration</th>
                  <th>Service Warranty</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {serviceCategoriesConfig.map(sc => (
                  <tr key={sc.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sc.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sc.description}</div>
                    </td>
                    <td><code>{sc.code}</code></td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>৳{sc.defaultLaborCost.toLocaleString()}</td>
                    <td>{sc.estimatedDurationHours} Hours</td>
                    <td>
                      <span className="badge badge-primary">{sc.warrantyDays} Days Guarantee</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenScModal(sc)}
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. WARRANTY POLICIES */}
      {/* ========================================================================= */}
      {activeTab === 'warranty' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
                Category Warranty Rules & Disclaimers
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Default coverage durations, replacement vs repair clauses, and void conditions printed on invoices.
              </p>
            </div>

            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleOpenWrModal()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <Plus size={15} />
              Add Warranty Rule
            </button>
          </div>

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Product Scope</th>
                  <th>Duration</th>
                  <th>Policy Details</th>
                  <th>Void Conditions</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warrantyRulesConfig.map(wr => (
                  <tr key={wr.id}>
                    <td style={{ fontWeight: 600 }}>{wr.categoryName}</td>
                    <td>
                      <span className="badge badge-primary">{wr.defaultMonths} Months</span>
                    </td>
                    <td style={{ fontSize: '0.825rem' }}>
                      <div>{wr.termsText}</div>
                      <div style={{ marginTop: '0.2rem', display: 'flex', gap: '0.35rem' }}>
                        {wr.replacementAllowed && <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Replacement Allowed</span>}
                        {wr.repairAllowed && <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Repair Allowed</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.775rem', color: '#ef4444' }}>{wr.voidConditions}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleOpenWrModal(wr)}
                      >
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 10. DYNAMIC NOTIFICATION CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
          {/* Templates list */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
              Notification Templates ({notificationTemplatesConfig.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notificationTemplatesConfig.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTpl(tpl.id)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    background: selectedTplId === tpl.id ? 'rgba(2, 132, 199, 0.15)' : 'var(--bg-card-muted)',
                    border: '1px solid',
                    borderColor: selectedTplId === tpl.id ? 'var(--brand-primary)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tpl.name}</div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem' }}>
                    <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{tpl.channel}</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{tpl.code}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Live Editor */}
          {selectedTpl && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>
                    {tplEditForm.name}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Trigger Event: {tplEditForm.triggerEvent}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setTplLangTab('bn')}
                    className={`btn btn-sm ${tplLangTab === 'bn' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    বাংলা (Bangla)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTplLangTab('en')}
                    className={`btn btn-sm ${tplLangTab === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Dynamic Placeholders Tag Cloud */}
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Click to Insert Dynamic Placeholder Tag
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {tplEditForm.placeholders?.map((ph, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => insertPlaceholder(ph)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        borderRadius: '4px',
                        background: 'rgba(2, 132, 199, 0.15)',
                        border: '1px solid rgba(2, 132, 199, 0.4)',
                        color: 'var(--brand-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {ph}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveTpl} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {tplLangTab === 'bn' ? (
                  <div>
                    <label className="form-label">Bangla Template Body (ইউনিকোড বাংলা)</label>
                    <textarea 
                      className="form-control"
                      rows={5}
                      value={tplEditForm.templateBn}
                      onChange={e => setTplEditForm({ ...tplEditForm, templateBn: e.target.value })}
                      style={{ fontSize: '0.95rem', lineHeight: '1.6' }}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="form-label">English Template Body</label>
                    <textarea 
                      className="form-control"
                      rows={5}
                      value={tplEditForm.templateEn}
                      onChange={e => setTplEditForm({ ...tplEditForm, templateEn: e.target.value })}
                      style={{ fontSize: '0.95rem', lineHeight: '1.6' }}
                    />
                  </div>
                )}

                {/* Live Preview Card */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(15, 23, 42, 0.6))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Smartphone size={14} />
                    SIMULATED CUSTOMER MESSAGE PREVIEW
                  </div>
                  <div style={{ fontSize: '0.875rem', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                    {(tplLangTab === 'bn' ? tplEditForm.templateBn : tplEditForm.templateEn)
                      .replace('{{customer_name}}', 'Amdadur Rahman')
                      .replace('{{product_name}}', 'HP EliteBook 840 G8')
                      .replace('{{serial_number}}', 'HP840-2026-9812')
                      .replace('{{installment_amount}}', '5,250')
                      .replace('{{due_date}}', '2026-09-15')
                      .replace('{{invoice_number}}', 'INV-2026-0042')
                      .replace('{{grand_total}}', '65,000')
                      .replace('{{paid_amount}}', '20,000')
                      .replace('{{company_name}}', 'NEED ELECTRO')}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Save size={16} />
                  Save Template
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 11. SECURITY, USERS & RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 101 Master Super Admin Account Badge */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(37, 99, 235, 0.4)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Section 101 — Master Administrator Account
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Amdadur Rahman
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Primary Email: <strong style={{ color: '#fff' }}>contact.amdadur@gmail.com</strong> (PBKDF2-HMAC-SHA256 Encrypted)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-success" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                Status: ACTIVE & VERIFIED
              </span>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('roles')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Key size={14} />
                Manage Role Matrix
              </button>
            </div>
          </div>

          {/* User Accounts Overview */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
                  Staff Login Accounts ({users.length})
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Employees provisioned with role-based access credentials
                </p>
              </div>
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => onNavigate('roles')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <Plus size={15} />
                Provision Staff User
              </button>
            </div>

            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Name & Email</th>
                    <th>Role Assigned</th>
                    <th>Branch Authorization</th>
                    <th>Account Status</th>
                    <th>Last Active</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'SUPER_ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-secondary">{u.branchId}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                          {u.status || (u.active ? 'ACTIVE' : 'INACTIVE')}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {u.lastLoginAt || 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 12. MAINTENANCE, CUSTOMER MERGING & BACKUP */}
      {/* ========================================================================= */}
      {activeTab === 'maintenance' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Customer Merging Tool */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} color="var(--brand-primary)" />
              Customer Duplicate Detection & Merge Tool
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Safely merge duplicate customer records. All invoices, installment schedules, and service jobs move to the target customer.
            </p>

            <form onSubmit={handleMergeCustomers} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Source Customer (To Be Deactivated)</label>
                <select 
                  className="form-control"
                  value={sourceCustId}
                  onChange={e => setSourceCustId(e.target.value)}
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) — {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Target Customer (Master Profile to Retain)</label>
                <select 
                  className="form-control"
                  value={targetCustId}
                  onChange={e => setTargetCustId(e.target.value)}
                  required
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone}) — {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Merge Reason</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={mergeReason}
                  onChange={e => setMergeReason(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <ArrowLeftRight size={16} />
                Execute Safe Customer Merge
              </button>
            </form>

            {customerMergeAudit.length > 0 && (
              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  RECENT MERGE OPERATIONS
                </div>
                {customerMergeAudit.slice(0, 3).map(m => (
                  <div key={m.id} style={{ fontSize: '0.75rem', padding: '0.4rem 0', borderBottom: '1px dashed var(--border-color)' }}>
                    Merged <strong>{m.sourceCustomerName}</strong> into <strong>{m.targetCustomerName}</strong> ({m.movedInvoicesCount} invoices, {m.movedEmiAccountsCount} EMIs).
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Health & Backup */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={20} color="var(--brand-primary)" />
              System Diagnostics & Database Backup
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Registered Products</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{products.length}</div>
              </div>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Profiles</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{customers.length}</div>
              </div>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active EMI Plans</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{emiPlans.length}</div>
              </div>
              <div style={{ background: 'var(--bg-card-muted)', padding: '0.85rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Audit Logs</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>{auditLogs.length}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button 
                className="btn btn-primary"
                onClick={handleExportJSON}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                <Download size={16} />
                Download Complete ERP Backup (JSON)
              </button>

              <label className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <Upload size={16} />
                Restore ERP Backup (JSON)
                <input 
                  type="file" 
                  accept=".json"
                  onChange={handleImportJSON}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Add Branch Modal */}
      {isBranchModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              {editingBranchInControl ? `Edit Branch: ${editingBranchInControl.name}` : 'Add New Branch / Warehouse'}
            </h3>
            <form onSubmit={handleCreateBranch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Branch Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newBranch.name}
                  onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder="e.g. Sreemangal Road Branch"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={newBranch.code}
                    onChange={e => setNewBranch({ ...newBranch, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SM-01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Phone</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={newBranch.phone}
                    onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                    placeholder="01733-983752"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Address</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newBranch.address}
                  onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                  placeholder="Location address in Moulvibazar"
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0' }}>
                <input 
                  type="checkbox"
                  checked={newBranch.isWarehouse}
                  onChange={e => setNewBranch({ ...newBranch, isWarehouse: e.target.checked })}
                />
                <span>This location functions as a Central Warehouse</span>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsBranchModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingBranchInControl ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add/Edit Category Modal */}
      {isCatModalOpen && editingCat && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Product Category</h3>
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingCat.name}
                  onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingCat.code}
                    onChange={e => setEditingCat({ ...editingCat, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Default Warranty (Mo.)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingCat.defaultWarrantyMonths}
                    onChange={e => setEditingCat({ ...editingCat, defaultWarrantyMonths: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Subcategories (comma separated)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingCat.subcategories?.join(', ') || ''}
                  onChange={e => setEditingCat({
                    ...editingCat,
                    subcategories: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g. Gaming Laptop, Ultrabook, Business Laptop"
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingCat.description || ''}
                  onChange={e => setEditingCat({ ...editingCat, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={editingCat.isSerializedDefault}
                    onChange={e => setEditingCat({ ...editingCat, isSerializedDefault: e.target.checked })}
                  />
                  <span>Mandate Serial Tracking</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={editingCat.isActive}
                    onChange={e => setEditingCat({ ...editingCat, isActive: e.target.checked })}
                  />
                  <span>Active Category</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCatModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Category Attribute Modal */}
      {isAttrModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
              Add Spec Attribute for {selectedCategory?.name}
            </h3>
            <form onSubmit={handleSaveAttribute} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Attribute Label</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newAttr.name}
                  onChange={e => setNewAttr({ ...newAttr, name: e.target.value, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g. Battery Health, RAM Type, Night Vision"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Key / Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={newAttr.code}
                    onChange={e => setNewAttr({ ...newAttr, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Data Type</label>
                  <select 
                    className="form-control"
                    value={newAttr.type}
                    onChange={e => setNewAttr({ ...newAttr, type: e.target.value as any })}
                  >
                    <option value="TEXT">Text Field</option>
                    <option value="SELECT">Select Dropdown</option>
                    <option value="NUMBER">Number</option>
                    <option value="BOOLEAN">Yes / No Toggle</option>
                  </select>
                </div>
              </div>

              {newAttr.type === 'SELECT' && (
                <div>
                  <label className="form-label">Dropdown Options (comma-separated)</label>
                  <textarea 
                    className="form-control"
                    rows={2}
                    value={attrOptionsRaw}
                    onChange={e => setAttrOptionsRaw(e.target.value)}
                    placeholder="e.g. 8GB DDR4, 16GB DDR4, 16GB DDR5, 32GB DDR5"
                  />
                </div>
              )}

              <div>
                <label className="form-label">Unit of Measurement (Optional)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={newAttr.unit}
                  onChange={e => setNewAttr({ ...newAttr, unit: e.target.value })}
                  placeholder="e.g. GB, Meters, GHz, Watts, Volt"
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0' }}>
                <input 
                  type="checkbox"
                  checked={newAttr.required}
                  onChange={e => setNewAttr({ ...newAttr, required: e.target.checked })}
                />
                <span>Required field when creating a product in this category</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAttrModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Attribute</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add/Edit Brand Modal */}
      {isBrandModalOpen && editingBrand && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '440px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Brand</h3>
            <form onSubmit={handleSaveBrand} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Brand Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingBrand.name}
                  onChange={e => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Brand Code</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingBrand.code}
                  onChange={e => setEditingBrand({ ...editingBrand, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Official Website</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingBrand.website || ''}
                  onChange={e => setEditingBrand({ ...editingBrand, website: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsBrandModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Brand</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add/Edit Payment Method Modal */}
      {isPmModalOpen && editingPm && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Payment Method</h3>
            <form onSubmit={handleSavePm} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Method Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingPm.name}
                  onChange={e => setEditingPm({ ...editingPm, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Code</label>
                  <input 
                    type="text" 
                    className="form-control"
                    value={editingPm.code}
                    onChange={e => setEditingPm({ ...editingPm, code: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Fee / Charge %</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="form-control"
                    value={editingPm.chargePercent}
                    onChange={e => setEditingPm({ ...editingPm, chargePercent: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Linked Financial Account</label>
                <select 
                  className="form-control"
                  value={editingPm.linkedAccountId}
                  onChange={e => setEditingPm({ ...editingPm, linkedAccountId: e.target.value })}
                >
                  {financialAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type}) — ৳{a.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Merchant / Account Number</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingPm.accountNumber || ''}
                  onChange={e => setEditingPm({ ...editingPm, accountNumber: e.target.value })}
                  placeholder="e.g. 01733-983752"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsPmModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Payment Method</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add/Edit EMI Plan Modal */}
      {isEmiModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Configure EMI Plan</h3>
              <span className="badge badge-primary">Versioned</span>
            </div>
            <form onSubmit={handleSaveEmiPlan} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Plan Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingEmiPlan.plan.name || ''}
                  onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, name: e.target.value } })}
                  placeholder="e.g. 6 Months Standard Tech"
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label">Duration (Mo)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingEmiPlan.plan.durationMonths || 6}
                    onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, durationMonths: Number(e.target.value) } })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Min Down %</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingEmiPlan.plan.minDownPaymentPercent || 20}
                    onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, minDownPaymentPercent: Number(e.target.value) } })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Interest %</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingEmiPlan.plan.interestRatePercent || 0}
                    onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, interestRatePercent: Number(e.target.value) } })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label className="form-label">Processing Fee (৳)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingEmiPlan.plan.processingFee || 0}
                    onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, processingFee: Number(e.target.value) } })}
                  />
                </div>
                <div>
                  <label className="form-label">Late Fee/Day (৳)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingEmiPlan.plan.lateFeePerDay || 0}
                    onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, lateFeePerDay: Number(e.target.value) } })}
                  />
                </div>
                <div>
                  <label className="form-label">Grace Days</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingEmiPlan.plan.gracePeriodDays || 0}
                    onChange={e => setEditingEmiPlan({ ...editingEmiPlan, plan: { ...editingEmiPlan.plan, gracePeriodDays: Number(e.target.value) } })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Reason for Revision (Audited)</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingEmiPlan.reason}
                  onChange={e => setEditingEmiPlan({ ...editingEmiPlan, reason: e.target.value })}
                  placeholder="e.g. Festive promotion, rate adjustment"
                  required
                />
              </div>

              <div style={{
                background: 'rgba(2, 132, 199, 0.1)',
                padding: '0.65rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                color: 'var(--brand-primary)'
              }}>
                ℹ️ Saving will create a new version of this plan. All existing customer contracts will preserve their original terms.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEmiModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Versioned Plan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Add/Edit Expense Category Modal */}
      {isExpModalOpen && editingExp && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '440px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Expense Category</h3>
            <form onSubmit={handleSaveExp} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Category Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingExp.name}
                  onChange={e => setEditingExp({ ...editingExp, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Code</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingExp.code}
                  onChange={e => setEditingExp({ ...editingExp, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: '0.5rem 0' }}>
                <input 
                  type="checkbox"
                  checked={editingExp.isTaxDeductible}
                  onChange={e => setEditingExp({ ...editingExp, isTaxDeductible: e.target.checked })}
                />
                <span>Qualifies as Tax-Deductible Business Expense</span>
              </label>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsExpModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Expense Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Add/Edit Service Category Modal */}
      {isScModalOpen && editingSc && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Service Classification</h3>
            <form onSubmit={handleSaveSc} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Classification Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingSc.name}
                  onChange={e => setEditingSc({ ...editingSc, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label className="form-label">Default Labor Fee (৳)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingSc.defaultLaborCost}
                    onChange={e => setEditingSc({ ...editingSc, defaultLaborCost: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Warranty Guarantee (Days)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={editingSc.warrantyDays}
                    onChange={e => setEditingSc({ ...editingSc, warrantyDays: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Estimated Turnaround Duration (Hours)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={editingSc.estimatedDurationHours}
                  onChange={e => setEditingSc({ ...editingSc, estimatedDurationHours: Number(e.target.value) })}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsScModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Service Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Add/Edit Warranty Rule Modal */}
      {isWrModalOpen && editingWr && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90%', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Configure Warranty Policy</h3>
            <form onSubmit={handleSaveWr} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Category / Product Scope</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={editingWr.categoryName}
                  onChange={e => setEditingWr({ ...editingWr, categoryName: e.target.value })}
                  placeholder="e.g. CCTV Cameras & DVRs"
                  required
                />
              </div>
              <div>
                <label className="form-label">Duration (Months)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={editingWr.defaultMonths}
                  onChange={e => setEditingWr({ ...editingWr, defaultMonths: Number(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Terms & Policy Text</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  value={editingWr.termsText}
                  onChange={e => setEditingWr({ ...editingWr, termsText: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label">Void Conditions</label>
                <textarea 
                  className="form-control"
                  rows={2}
                  value={editingWr.voidConditions}
                  onChange={e => setEditingWr({ ...editingWr, voidConditions: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', margin: '0.5rem 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={editingWr.replacementAllowed}
                    onChange={e => setEditingWr({ ...editingWr, replacementAllowed: e.target.checked })}
                  />
                  <span>Replacement Guarantee</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox"
                    checked={editingWr.repairAllowed}
                    onChange={e => setEditingWr({ ...editingWr, repairAllowed: e.target.checked })}
                  />
                  <span>Free Service Repair</span>
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsWrModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Warranty Policy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
