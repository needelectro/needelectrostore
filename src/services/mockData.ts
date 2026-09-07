// NEED ELECTRO ERP — Production Baseline Configuration & Schema Templates
// Clean master data: NO fake statistics, NO fake products, NO fake sales, NO fake customers
import { 
  Branch, User, Product, ProductSerial, Supplier, Customer, 
  Sale, EMIPlan, EMIAccount, EMIPaymentRecord, ServiceJob, 
  Technician, Expense, SystemSettings, InventoryTransaction, AuditLog,
  Purchase, FinancialAccount, Investment, Employee, AttendanceRecord, ProductReturn,
  Role, Permission, SetupStatus, OpeningBalanceEntry,
  ProductCategoryConfig, BrandConfig, ConfigurablePaymentMethod, ExpenseCategoryConfig,
  ServiceCategoryConfig, WarrantyRuleConfig, DynamicNotificationTemplate,
  PosSettings, InventoryRules
} from '../types';

export const INITIAL_SETTINGS: SystemSettings = {
  companyName: 'NEED ELECTRO',
  companyTagline: 'Trusted Electrical & Technological Solutions',
  sisterConcern: 'A sister Concern Of AMDADS GROUP',
  mainBranchName: 'Main Branch Moulvibazar',
  phone: '01733-983752',
  email: 'needelectro23@gmail.com',
  website: 'www.needelectro.com',
  address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar',
  vatRegistrationNo: 'BIN: 002948123-0102',
  invoicePrefix: 'INV-2026-',
  emiPrefix: 'EMI-2026-',
  defaultVatPercent: 5,
  currencySymbol: '৳',
  currencyCode: 'BDT',
  enableSmsNotifications: true,
  enableWhatsappNotifications: true,
  notificationTemplateDueSoonEn: 'Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI installment of ৳{AMOUNT} for {PRODUCT_NAME} (Serial: {SERIAL}) is due on {DUE_DATE}. Pay via bKash/Nagad or visit our showroom at Shop#5, MR Plaza, Kusumbag, Moulvibazar. Hotline: 01733-983752.',
  notificationTemplateDueSoonBn: 'সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME} (সিরিয়াল: {SERIAL})-এর মাসিক কিস্তি ৳{AMOUNT} আগামী {DUE_DATE} তারিখে পরিশোধযোগ্য। বিকাশ/নগদ বা আমাদের শোরুম (শপ#৫, এমআর প্লাজা, কুসুমবাগ, মৌলভীবাজার)-এ জমা দিন। হেল্পলাইন: 01733-983752।',
  notificationTemplateOverdueEn: 'URGENT: Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI payment of ৳{AMOUNT} is OVERDUE by {DAYS_OVERDUE} days. Please pay immediately. NEED ELECTRO (A sister Concern Of AMDADS GROUP), Kusumbag, Moulvibazar. Hotline: 01733-983752.',
  notificationTemplateOverdueBn: 'জরুরি নোটিশ: সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME}-এর কিস্তি ৳{AMOUNT} বিগত {DAYS_OVERDUE} দিন যাবত বকেয়া রয়েছে। জরিমানা এড়াতে অবিলম্বে পরিশোধ করুন। নিড ইলেক্ট্রো, কুসুমবাগ, মৌলভীবাজার। ফোন: 01733-983752।',
  theme: 'dark',
  facebookUrl: 'https://facebook.com/needelectro',
  youtubeUrl: 'https://youtube.com/@needelectro',
  linkedinUrl: 'https://linkedin.com/company/needelectro',
  whatsappNumber: '+8801733983752',
  supportEmail: 'contact.amdadur@gmail.com',
  footerText: 'NEED ELECTRO — Trusted Electrical & Technological Solutions. Moulvibazar, Bangladesh.',
  accentColor: '#008CFF'
};

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Main Branch Moulvibazar',
    code: 'MB-MAIN',
    address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar',
    phone: '01733-983752',
    email: 'needelectro23@gmail.com',
    isWarehouse: false,
    active: true
  },
  {
    id: 'branch-2',
    name: 'Kusumbag Tech & CCTV Hub',
    code: 'MB-TECH',
    address: 'MR Plaza Level 1, Kusumbag, Moulvibazar',
    phone: '01733-983752',
    email: 'sales@needelectro.com',
    isWarehouse: false,
    active: true
  },
  {
    id: 'branch-3',
    name: 'Central Warehouse & Service Hub',
    code: 'CENTRAL-WH',
    address: 'Sreemangal Road Industrial Area, Moulvibazar',
    phone: '01733-983752',
    email: 'service@needelectro.com',
    isWarehouse: true,
    active: true
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'user-superadmin-1',
    name: 'Amdadur Rahman',
    email: 'contact.amdadur@gmail.com',
    username: 'amdadur',
    role: 'SUPER_ADMIN',
    roleId: 'role-superadmin',
    branchId: 'branch-1',
    allowedBranchIds: ['branch-1', 'branch-2', 'branch-3'],
    phone: '01733-983752',
    active: true,
    status: 'ACTIVE',
    failedLoginAttempts: 0,
    createdAt: '2026-01-01'
  }
];

export const INITIAL_EMI_PLANS: EMIPlan[] = [
  {
    id: 'emi-plan-3m',
    name: '3 Months Quick Tech Plan',
    durationMonths: 3,
    minDownPaymentPercent: 30,
    interestRatePercent: 0,
    processingFee: 300,
    lateFeePerDay: 50,
    gracePeriodDays: 5,
    isActive: true,
    description: 'Short 3-month plan with 30% down payment.',
    eligibilityRules: 'Requires National ID & verified local guarantor.',
    termsText: 'Default beyond 15 days results in hardware lock.'
  },
  {
    id: 'emi-plan-6m',
    name: '6 Months Popular Laptop Plan',
    durationMonths: 6,
    minDownPaymentPercent: 25,
    interestRatePercent: 0,
    processingFee: 500,
    lateFeePerDay: 50,
    gracePeriodDays: 5,
    isActive: true,
    description: 'Standard 6-month laptop financing with 0% interest.',
    eligibilityRules: 'Original NID copy, electricity bill, and one verified guarantor.',
    termsText: 'Monthly installment due within 10th of every calendar month.'
  },
  {
    id: 'emi-plan-9m',
    name: '9 Months Easy Installment',
    durationMonths: 9,
    minDownPaymentPercent: 20,
    interestRatePercent: 2,
    processingFee: 800,
    lateFeePerDay: 50,
    gracePeriodDays: 7,
    isActive: true,
    description: 'Extended 9-month plan with flexible monthly payments.',
    eligibilityRules: 'Valid trade license or employee salary slip required.',
    termsText: 'Hardware warranty remains valid subject to regular installment payments.'
  },
  {
    id: 'emi-plan-12m',
    name: '12 Months Enterprise Student/Pro Plan',
    durationMonths: 12,
    minDownPaymentPercent: 20,
    interestRatePercent: 4,
    processingFee: 1000,
    lateFeePerDay: 50,
    gracePeriodDays: 7,
    isActive: true,
    description: 'Annual 12-month installment plan for students and professionals.',
    eligibilityRules: 'Strict background verification with two local guarantors.',
    termsText: 'Ownership transfer completed upon payment of final installment receipt.'
  }
];

export const INITIAL_FINANCIAL_ACCOUNTS: FinancialAccount[] = [
  {
    id: 'acc-1',
    name: 'Main Cash Drawer',
    type: 'CASH',
    accountNumber: 'CASH-MB-01',
    balance: 0,
    currency: 'BDT',
    isActive: true
  },
  {
    id: 'acc-2',
    name: 'Bank Asia Current Account',
    type: 'BANK',
    accountNumber: '03933005821',
    bankName: 'Bank Asia PLC',
    branchName: 'Moulvibazar Branch',
    balance: 0,
    currency: 'BDT',
    isActive: true
  },
  {
    id: 'acc-3',
    name: 'bKash Merchant Wallet',
    type: 'MOBILE_BANKING',
    accountNumber: '01733-983752',
    bankName: 'bKash Limited',
    branchName: 'Merchant Account',
    balance: 0,
    currency: 'BDT',
    isActive: true
  },
  {
    id: 'acc-4',
    name: 'Nagad Merchant Wallet',
    type: 'MOBILE_BANKING',
    accountNumber: '01733-983752',
    bankName: 'Nagad Digital',
    branchName: 'Merchant Account',
    balance: 0,
    currency: 'BDT',
    isActive: true
  },
  {
    id: 'acc-5',
    name: 'Rocket Corporate Account',
    type: 'MOBILE_BANKING',
    accountNumber: '01733-983752-9',
    bankName: 'Dutch-Bangla Bank',
    branchName: 'MFS Corporate',
    balance: 0,
    currency: 'BDT',
    isActive: true
  }
];

// Production Clean Entities (Zero Fake Data)
export const INITIAL_SUPPLIERS: Supplier[] = [];
export const INITIAL_PRODUCTS: Product[] = [];
export const INITIAL_PRODUCT_SERIALS: ProductSerial[] = [];
export const INITIAL_CUSTOMERS: Customer[] = [];
export const INITIAL_EMI_ACCOUNTS: EMIAccount[] = [];
export const INITIAL_EMI_PAYMENTS: EMIPaymentRecord[] = [];
export const INITIAL_SALES: Sale[] = [];
export const INITIAL_TECHNICIANS: Technician[] = [];
export const INITIAL_SERVICES: ServiceJob[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_INVENTORY_TRANSACTIONS: InventoryTransaction[] = [];
export const INITIAL_PURCHASES: Purchase[] = [];
export const INITIAL_INVESTMENTS: Investment[] = [];
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_RETURNS: ProductReturn[] = [];
export const INITIAL_OPENING_BALANCES: OpeningBalanceEntry[] = [];

export const INITIAL_PERMISSIONS: Permission[] = [
  { id: 'perm_dash_view', module: 'dashboard', action: 'view', label: 'View Dashboard', description: 'Access operational overview', isSensitive: false },
  { id: 'perm_dash_profit', module: 'dashboard', action: 'view_profit', label: 'View Gross & Net Profit', description: 'Sensitive financial performance metrics', isSensitive: true },
  { id: 'perm_sales_view', module: 'sales', action: 'view', label: 'View Sales & Invoices', description: 'View past transactions and bills', isSensitive: false },
  { id: 'perm_sales_create', module: 'sales', action: 'create', label: 'Create Sales (POS)', description: 'Issue invoices and complete sales', isSensitive: false },
  { id: 'perm_sales_discount', module: 'sales', action: 'apply_discount', label: 'Apply Custom Discounts', description: 'Discounts exceeding standard limits', isSensitive: true },
  { id: 'perm_sales_void', module: 'sales', action: 'void', label: 'Void/Cancel Sale', description: 'Revoke or cancel existing sales invoices', isSensitive: true },
  { id: 'perm_sales_return', module: 'sales', action: 'return', label: 'Process Sales Returns', description: 'Accept returned merchandise & refund', isSensitive: true },
  { id: 'perm_emi_view', module: 'emi', action: 'view', label: 'View EMI Accounts', description: 'Access customer installment ledgers', isSensitive: false },
  { id: 'perm_emi_create', module: 'emi', action: 'create', label: 'Approve EMI Sale', description: 'Authorize laptop financing agreements', isSensitive: true },
  { id: 'perm_emi_collect', module: 'emi', action: 'collect', label: 'Collect EMI Payments', description: 'Collect installments and issue vouchers', isSensitive: false },
  { id: 'perm_emi_settings', module: 'emi', action: 'manage_plans', label: 'Manage EMI Plans', description: 'Configure interest rates, durations & fees', isSensitive: true },
  { id: 'perm_inv_view', module: 'inventory', action: 'view', label: 'View Stock Levels', description: 'View real-time item counts & serials', isSensitive: false },
  { id: 'perm_inv_adjust', module: 'inventory', action: 'adjust', label: 'Stock Adjustment', description: 'Correction of physical inventory counts', isSensitive: true },
  { id: 'perm_inv_transfer', module: 'inventory', action: 'transfer', label: 'Stock Transfer', description: 'Inter-branch stock transfers', isSensitive: false },
  { id: 'perm_inv_serials', module: 'inventory', action: 'manage_serials', label: 'Manage Serial Numbers', description: 'Track and audit serialized assets', isSensitive: false },
  { id: 'perm_purch_view', module: 'purchases', action: 'view', label: 'View Purchase Orders', description: 'Access supplier bills', isSensitive: false },
  { id: 'perm_purch_create', module: 'purchases', action: 'create', label: 'Record Purchase', description: 'Register vendor intake and payables', isSensitive: false },
  { id: 'perm_prod_view', module: 'products', action: 'view', label: 'View Products', description: 'Search product specs and prices', isSensitive: false },
  { id: 'perm_prod_create', module: 'products', action: 'create', label: 'Add Products', description: 'Create new items in global catalog', isSensitive: false },
  { id: 'perm_prod_edit', module: 'products', action: 'edit', label: 'Edit Product Details', description: 'Update descriptions and specs', isSensitive: false },
  { id: 'perm_prod_pricing', module: 'products', action: 'edit_pricing', label: 'Change Prices (Retail/EMI)', description: 'Modify retail or EMI price lists', isSensitive: true },
  { id: 'perm_cust_view', module: 'customers', action: 'view', label: 'View Customers', description: 'Search customer histories', isSensitive: false },
  { id: 'perm_cust_create', module: 'customers', action: 'create', label: 'Create Customer', description: 'Register new retail or EMI clients', isSensitive: false },
  { id: 'perm_cust_merge', module: 'customers', action: 'merge', label: 'Merge Duplicate Accounts', description: 'Consolidate multiple customer profiles', isSensitive: true },
  { id: 'perm_supp_view', module: 'suppliers', action: 'view', label: 'View Suppliers', description: 'Browse supplier profiles', isSensitive: false },
  { id: 'perm_supp_manage', module: 'suppliers', action: 'manage', label: 'Manage Suppliers & Pay', description: 'Add suppliers and disburse vendor payments', isSensitive: true },
  { id: 'perm_serv_view', module: 'service', action: 'view', label: 'View Service Jobs', description: 'Track repair and installation tickets', isSensitive: false },
  { id: 'perm_serv_manage', module: 'service', action: 'manage', label: 'Manage Service & Bill', description: 'Assign technicians and bill parts', isSensitive: false },
  { id: 'perm_warr_view', module: 'warranty', action: 'view', label: 'View Warranty Records', description: 'Check serial warranty claims', isSensitive: false },
  { id: 'perm_warr_claims', module: 'warranty', action: 'process_claims', label: 'Process Warranty Claims', description: 'Approve RMA or free repairs', isSensitive: false },
  { id: 'perm_acct_view', module: 'accounting', action: 'view', label: 'View Accounting Ledgers', description: 'Access general ledger and P&L', isSensitive: true },
  { id: 'perm_acct_transfer', module: 'accounting', action: 'transfer_funds', label: 'Internal Fund Transfers', description: 'Move cash between accounts', isSensitive: true },
  { id: 'perm_acct_invest', module: 'accounting', action: 'manage_investments', label: 'Record Capital & Equity', description: 'Manage equity and investments', isSensitive: true },
  { id: 'perm_exp_view', module: 'expenses', action: 'view', label: 'View Expenses', description: 'Browse operating expenditures', isSensitive: false },
  { id: 'perm_exp_create', module: 'expenses', action: 'create', label: 'Record Expense', description: 'Create expense vouchers', isSensitive: false },
  { id: 'perm_rep_view', module: 'reports', action: 'view', label: 'View Reports', description: 'Generate business & sales reports', isSensitive: false },
  { id: 'perm_rep_export', module: 'reports', action: 'export', label: 'Export Data (PDF/Excel)', description: 'Download corporate spreadsheets', isSensitive: true },
  { id: 'perm_emp_view', module: 'employees', action: 'view', label: 'View Employees', description: 'Browse staff roster', isSensitive: false },
  { id: 'perm_emp_manage', module: 'employees', action: 'manage', label: 'Manage Staff & Payroll', description: 'Add staff and record attendance', isSensitive: true },
  { id: 'perm_roles_manage', module: 'roles', action: 'manage', label: 'Manage Roles & RBAC', description: 'Configure security permissions', isSensitive: true },
  { id: 'perm_users_manage', module: 'users', action: 'manage', label: 'Manage User Accounts', description: 'Create staff accounts', isSensitive: true },
  { id: 'perm_audit_view', module: 'audit', action: 'view', label: 'View Audit Trails', description: 'Inspect security and financial logs', isSensitive: true },
  { id: 'perm_settings_manage', module: 'settings', action: 'manage', label: 'Modify System Settings', description: 'Master company parameters', isSensitive: true },
  { id: 'perm_backup_manage', module: 'backup', action: 'manage', label: 'Database Backup & Restore', description: 'Manage database snapshots and restore', isSensitive: true }
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role-superadmin',
    name: 'Super Admin',
    code: 'SUPER_ADMIN',
    description: 'Absolute unrestricted system control and configuration.',
    isSystem: true,
    permissions: INITIAL_PERMISSIONS.map(p => p.id),
    isActive: true
  },
  {
    id: 'role-admin',
    name: 'Administrator',
    code: 'ADMIN',
    description: 'Full branch management, inventory, sales, customer, and reporting authority.',
    isSystem: true,
    permissions: INITIAL_PERMISSIONS.filter(p => p.id !== 'perm_backup_manage').map(p => p.id),
    isActive: true
  },
  {
    id: 'role-manager',
    name: 'Branch Manager',
    code: 'MANAGER',
    description: 'Supervises branch sales, customer credit, EMI approvals, and stock transfers.',
    isSystem: true,
    permissions: [
      'perm_dash_view', 'perm_sales_view', 'perm_sales_create', 'perm_sales_discount', 'perm_sales_return',
      'perm_emi_view', 'perm_emi_create', 'perm_emi_collect',
      'perm_inv_view', 'perm_inv_adjust', 'perm_inv_transfer', 'perm_inv_serials',
      'perm_purch_view', 'perm_purch_create',
      'perm_prod_view', 'perm_prod_create', 'perm_prod_edit',
      'perm_cust_view', 'perm_cust_create', 'perm_cust_merge',
      'perm_supp_view', 'perm_supp_manage',
      'perm_serv_view', 'perm_serv_manage',
      'perm_warr_view', 'perm_warr_claims',
      'perm_exp_view', 'perm_exp_create',
      'perm_rep_view', 'perm_rep_export',
      'perm_emp_view'
    ],
    isActive: true
  },
  {
    id: 'role-sales',
    name: 'Sales Executive',
    code: 'SALES',
    description: 'Handles POS retail billing, EMI customer inquiries, and installment payments.',
    isSystem: true,
    permissions: [
      'perm_dash_view', 'perm_sales_view', 'perm_sales_create',
      'perm_emi_view', 'perm_emi_collect',
      'perm_inv_view', 'perm_prod_view',
      'perm_cust_view', 'perm_cust_create',
      'perm_serv_view', 'perm_warr_view'
    ],
    isActive: true
  },
  {
    id: 'role-accountant',
    name: 'Senior Accountant',
    code: 'ACCOUNTANT',
    description: 'Oversees general ledgers, accounts receivable/payable, expenses, and financial reports.',
    isSystem: true,
    permissions: [
      'perm_dash_view', 'perm_dash_profit', 'perm_sales_view', 'perm_emi_view', 'perm_emi_collect',
      'perm_purch_view', 'perm_supp_view', 'perm_supp_manage',
      'perm_acct_view', 'perm_acct_transfer', 'perm_acct_invest',
      'perm_exp_view', 'perm_exp_create', 'perm_rep_view', 'perm_rep_export'
    ],
    isActive: true
  },
  {
    id: 'role-inventory',
    name: 'Inventory Specialist',
    code: 'INVENTORY',
    description: 'Controls warehouse intake, serial scanning, stock adjustments, and goods dispatch.',
    isSystem: true,
    permissions: [
      'perm_dash_view', 'perm_inv_view', 'perm_inv_adjust', 'perm_inv_transfer', 'perm_inv_serials',
      'perm_purch_view', 'perm_purch_create', 'perm_prod_view', 'perm_prod_create', 'perm_prod_edit'
    ],
    isActive: true
  },
  {
    id: 'role-technician',
    name: 'Senior Technician',
    code: 'TECHNICIAN',
    description: 'Field technician for electrical installations, CCTV setup, and laptop repair jobs.',
    isSystem: true,
    permissions: ['perm_serv_view', 'perm_serv_manage', 'perm_warr_view', 'perm_warr_claims', 'perm_inv_view'],
    isActive: true
  },
  {
    id: 'role-electrician',
    name: 'Electrician',
    code: 'ELECTRICIAN',
    description: 'On-site electrical service, wiring, DB board fitting, and customer maintenance.',
    isSystem: true,
    permissions: ['perm_serv_view', 'perm_serv_manage', 'perm_warr_view', 'perm_warr_claims', 'perm_inv_view'],
    isActive: true
  },
  {
    id: 'role-employee',
    name: 'General Staff',
    code: 'EMPLOYEE',
    description: 'Standard staff member with basic dashboard and attendance features.',
    isSystem: true,
    permissions: ['perm_dash_view'],
    isActive: true
  }
];

export const INITIAL_SETUP_STATUS: SetupStatus = {
  isSuperAdminConfigured: false,
  isCompanyConfigured: true,
  isMainBranchConfigured: true,
  isWarehouseConfigured: true,
  isFinancialAccountsConfigured: true,
  isPaymentMethodsConfigured: true,
  isEmiPlansConfigured: true,
  isInvoiceSettingsConfigured: true,
  isNotificationConfigured: true,
  isOpeningBalancesConfigured: false,
  initialSetupCompleted: false,
  systemMode: 'PRODUCTION'
};

export const INITIAL_CATEGORIES_CONFIG: ProductCategoryConfig[] = [
  {
    id: 'cat-laptop',
    name: 'Laptops & Ultrabooks',
    code: 'LAPTOPS',
    description: 'Refurbished and brand new laptops, notebooks & workstations',
    icon: 'Laptop',
    subcategories: ['Business Laptops', 'Gaming Laptops', 'Ultrabooks', 'Student Laptops', 'Mobile Workstations'],
    attributes: [
      { id: 'attr-proc', name: 'Processor', code: 'processor', type: 'TEXT', required: true },
      { id: 'attr-gen', name: 'Generation', code: 'generation', type: 'TEXT', required: true },
      { id: 'attr-ram', name: 'RAM Capacity', code: 'ram', type: 'SELECT', options: ['8GB', '16GB', '32GB', '64GB'], required: true },
      { id: 'attr-storage', name: 'Storage', code: 'storage', type: 'SELECT', options: ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'], required: true },
      { id: 'attr-display', name: 'Display Size & Panel', code: 'display', type: 'TEXT', required: true },
      { id: 'attr-gpu', name: 'Graphics (GPU)', code: 'gpu', type: 'TEXT', required: false },
      { id: 'attr-battery', name: 'Battery Health %', code: 'batteryCondition', type: 'TEXT', required: false },
      { id: 'attr-condition', name: 'Physical Condition', code: 'physicalCondition', type: 'SELECT', options: ['Brand New', 'Grade A+ Pristine', 'Grade A Light Use', 'Open Box'], required: true }
    ],
    isSerializedDefault: true,
    defaultWarrantyMonths: 12,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 'cat-desktop',
    name: 'Computers & Desktops',
    code: 'DESKTOPS',
    description: 'Custom desktop PCs, All-in-One systems, and mini PCs',
    icon: 'Monitor',
    subcategories: ['All-in-One PCs', 'Custom Gaming Rigs', 'Office Desktop PCs', 'Mini PCs'],
    attributes: [
      { id: 'attr-cpu', name: 'CPU', code: 'processor', type: 'TEXT', required: true },
      { id: 'attr-mobo', name: 'Motherboard', code: 'motherboard', type: 'TEXT', required: true },
      { id: 'attr-ram', name: 'RAM', code: 'ram', type: 'TEXT', required: true },
      { id: 'attr-casing', name: 'Casing & PSU', code: 'casing', type: 'TEXT', required: false }
    ],
    isSerializedDefault: true,
    defaultWarrantyMonths: 24,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 'cat-cctv',
    name: 'CCTV & Surveillance',
    code: 'CCTV',
    description: 'Security cameras, NVR/DVR recorders, IP cameras, power supplies',
    icon: 'Shield',
    subcategories: ['IP Cameras', 'HD Analog Cameras', 'PTZ Cameras', 'NVR/DVR Recorders', 'Hard Disks'],
    attributes: [
      { id: 'attr-res', name: 'Resolution', code: 'resolution', type: 'SELECT', options: ['2MP 1080p', '4MP 2K', '5MP', '8MP 4K'], required: true },
      { id: 'attr-night', name: 'Night Vision Mode', code: 'nightVision', type: 'SELECT', options: ['Infrared IR', 'ColorVu / Full Color', 'Smart Dual Light'], required: true },
      { id: 'attr-chan', name: 'Channels', code: 'channels', type: 'TEXT', required: false }
    ],
    isSerializedDefault: true,
    defaultWarrantyMonths: 24,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 'cat-electrical',
    name: 'Electrical Products',
    code: 'ELECTRICAL',
    description: 'Breakers, DB boards, industrial cables, smart switches, LED lighting',
    icon: 'Zap',
    subcategories: ['Circuit Breakers', 'Distribution Boards', 'Smart Home Switches', 'Industrial Cables', 'LED Commercial Lighting', 'Solar Solutions'],
    attributes: [
      { id: 'attr-volt', name: 'Voltage Rating', code: 'voltageRating', type: 'TEXT', required: true },
      { id: 'attr-watt', name: 'Power Wattage', code: 'powerWattage', type: 'TEXT', required: false },
      { id: 'attr-gauge', name: 'Cable Gauge (RM/Gauge)', code: 'cableGauge', type: 'TEXT', required: false },
      { id: 'attr-cert', name: 'Safety Certification', code: 'certification', type: 'TEXT', required: false }
    ],
    isSerializedDefault: false,
    defaultWarrantyMonths: 36,
    isActive: true,
    sortOrder: 4
  },
  {
    id: 'cat-accessories',
    name: 'Gadgets & Accessories',
    code: 'ACCESSORIES',
    description: 'Chargers, docks, adapters, keyboards, mice, Wi-Fi routers',
    icon: 'Package',
    subcategories: ['Original Laptop Adapters', 'Keyboards & Mice', 'Wi-Fi Routers', 'Power Banks', 'Headphones & Speakers'],
    attributes: [
      { id: 'attr-compat', name: 'Compatibility', code: 'compatibility', type: 'TEXT', required: false }
    ],
    isSerializedDefault: false,
    defaultWarrantyMonths: 6,
    isActive: true,
    sortOrder: 5
  }
];

export const INITIAL_BRANDS: BrandConfig[] = [
  { id: 'brand-dell', name: 'Dell', code: 'DELL', categoryIds: ['cat-laptop', 'cat-desktop'], logoUrl: '', website: 'https://dell.com', description: 'Latitude, Precision, XPS series', isActive: true },
  { id: 'brand-hp', name: 'HP', code: 'HP', categoryIds: ['cat-laptop', 'cat-desktop'], logoUrl: '', website: 'https://hp.com', description: 'EliteBook, ProBook, Pavilion series', isActive: true },
  { id: 'brand-lenovo', name: 'Lenovo', code: 'LENOVO', categoryIds: ['cat-laptop', 'cat-desktop'], logoUrl: '', website: 'https://lenovo.com', description: 'ThinkPad, Yoga, IdeaPad series', isActive: true },
  { id: 'brand-apple', name: 'Apple', code: 'APPLE', categoryIds: ['cat-laptop', 'cat-desktop', 'cat-accessories'], logoUrl: '', website: 'https://apple.com', description: 'MacBook Air, MacBook Pro series', isActive: true },
  { id: 'brand-hikvision', name: 'Hikvision', code: 'HIKVISION', categoryIds: ['cat-cctv'], logoUrl: '', website: 'https://hikvision.com', description: 'Leading global surveillance', isActive: true },
  { id: 'brand-dahua', name: 'Dahua', code: 'DAHUA', categoryIds: ['cat-cctv'], logoUrl: '', website: 'https://dahuasecurity.com', description: 'Professional IP security cameras', isActive: true },
  { id: 'brand-schneider', name: 'Schneider Electric', code: 'SCHNEIDER', categoryIds: ['cat-electrical'], logoUrl: '', website: 'https://se.com', description: 'Premium circuit protection', isActive: true },
  { id: 'brand-havells', name: 'Havells', code: 'HAVELLS', categoryIds: ['cat-electrical'], logoUrl: '', website: 'https://havells.com', description: 'Industrial cables and switchgear', isActive: true }
];

export const INITIAL_PAYMENT_METHODS_CONFIG: ConfigurablePaymentMethod[] = [
  { id: 'pm-1', name: 'Cash', code: 'CASH', type: 'CASH', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: 0, instructions: 'Accepted at counter. Verify currency security strips.', isActive: true, sortOrder: 1 },
  { id: 'pm-2', name: 'bKash Merchant', code: 'BKASH', type: 'MFS', linkedAccountId: 'acc-3', accountNumber: '01733-983752', chargePercent: 1.5, instructions: 'Scan QR code or use Merchant Pay.', isActive: true, sortOrder: 2 },
  { id: 'pm-3', name: 'Nagad Merchant', code: 'NAGAD', type: 'MFS', linkedAccountId: 'acc-4', accountNumber: '01733-983752', chargePercent: 1.2, instructions: 'Pay using Nagad Merchant payment.', isActive: true, sortOrder: 3 },
  { id: 'pm-4', name: 'Rocket Pay', code: 'ROCKET', type: 'MFS', linkedAccountId: 'acc-5', accountNumber: '01733-983752-9', chargePercent: 1.2, instructions: 'Use DBBL Rocket Merchant payment.', isActive: true, sortOrder: 4 },
  { id: 'pm-5', name: 'Bank Asia Transfer', code: 'BANK_ASIA', type: 'BANK', linkedAccountId: 'acc-2', accountNumber: '03933005821', chargePercent: 0, instructions: 'BEFTN / NPSB / RTGS deposit to Need Electro.', isActive: true, sortOrder: 5 },
  { id: 'pm-6', name: 'Credit / Debit Card (POS)', code: 'CARD_POS', type: 'CARD', linkedAccountId: 'acc-2', accountNumber: '', chargePercent: 2.0, instructions: 'Visa, MasterCard, Amex via counter POS swipe.', isActive: true, sortOrder: 6 },
  { id: 'pm-7', name: 'Credit / Customer Due', code: 'CREDIT_SALE', type: 'OTHER', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: 0, instructions: 'Allowed only for pre-approved credit accounts.', isActive: true, sortOrder: 7 },
  { id: 'pm-8', name: 'Laptop EMI Facility', code: 'EMI_SALE', type: 'OTHER', linkedAccountId: 'acc-1', accountNumber: '', chargePercent: 0, instructions: 'Financed via Need Electro EMI installment system.', isActive: true, sortOrder: 8 }
];

export const INITIAL_EXPENSE_CATEGORIES: ExpenseCategoryConfig[] = [
  { id: 'exp-rent', name: 'Office Rent', code: 'OFFICE_RENT', description: 'Showroom premises rent', isTaxDeductible: true, isActive: true },
  { id: 'exp-elec', name: 'Electricity & Utility', code: 'ELECTRICITY', description: 'BPDB electricity bills', isTaxDeductible: true, isActive: true },
  { id: 'exp-net', name: 'Internet & Communications', code: 'INTERNET', description: 'Fiber line & telephone', isTaxDeductible: true, isActive: true },
  { id: 'exp-sal', name: 'Staff Salaries & Commission', code: 'SALARY', description: 'Monthly employee compensation', isTaxDeductible: true, isActive: true },
  { id: 'exp-trans', name: 'Transport & Courier', code: 'TRANSPORT', description: 'Logistics and fuel', isTaxDeductible: true, isActive: true },
  { id: 'exp-mkt', name: 'Marketing & Advertising', code: 'MARKETING', description: 'Facebook ads & banners', isTaxDeductible: true, isActive: true },
  { id: 'exp-maint', name: 'Maintenance & Repairs', code: 'MAINTENANCE', description: 'Showroom equipment repair', isTaxDeductible: true, isActive: true },
  { id: 'exp-snack', name: 'Office Supplies & Hospitality', code: 'OFFICE_SUPPLIES', description: 'Tea, snacks, stationary', isTaxDeductible: true, isActive: true },
  { id: 'exp-other', name: 'Other Operating Expenses', code: 'OTHER', description: 'Miscellaneous operating costs', isTaxDeductible: true, isActive: true }
];

export const INITIAL_SERVICE_CATEGORIES: ServiceCategoryConfig[] = [
  { id: 'sc-laptop', name: 'Laptop Chip-Level Servicing', code: 'LAPTOP_REPAIR', defaultLaborCost: 800, estimatedDurationHours: 4, warrantyDays: 30, description: 'Motherboard chip repair, BIOS flashing, display replacement', isActive: true },
  { id: 'sc-cctv', name: 'CCTV Installation & Setup', code: 'CCTV_INSTALL', defaultLaborCost: 1500, estimatedDurationHours: 6, warrantyDays: 90, description: 'Surveillance cabling, camera mounting, DVR configuration', isActive: true },
  { id: 'sc-elec-house', name: 'House Electrical Wiring', code: 'HOUSE_WIRING', defaultLaborCost: 5000, estimatedDurationHours: 16, warrantyDays: 180, description: 'Complete building wiring, DB board dressing, earthing', isActive: true },
  { id: 'sc-smart-home', name: 'Smart Switch Automation', code: 'SMART_HOME', defaultLaborCost: 2000, estimatedDurationHours: 3, warrantyDays: 60, description: 'Wi-Fi smart breaker & relay installation', isActive: true }
];

export const INITIAL_WARRANTY_RULES: WarrantyRuleConfig[] = [
  { id: 'wr-laptop', categoryName: 'Laptops & Ultrabooks', defaultMonths: 12, termsText: 'Motherboard and display covered. Physical drop, liquid spill, and unauthorized opening void warranty.', replacementAllowed: false, repairAllowed: true, voidConditions: 'Burn mark, liquid trace, broken seal', isActive: true },
  { id: 'wr-cctv', categoryName: 'CCTV & Surveillance', defaultMonths: 24, termsText: 'Manufacturer warranty covering camera sensor and DVR board against factory defect.', replacementAllowed: true, repairAllowed: true, voidConditions: 'High voltage lightning surge, physical damage', isActive: true },
  { id: 'wr-electrical', categoryName: 'Electrical Products', defaultMonths: 36, termsText: 'Full replacement guarantee for circuit breakers against manufacturing defect.', replacementAllowed: true, repairAllowed: false, voidConditions: 'Overload fire burning due to improper gauge wire', isActive: true }
];

export const INITIAL_NOTIFICATION_TEMPLATES: DynamicNotificationTemplate[] = [
  {
    id: 'tpl-due-soon',
    code: 'EMI_DUE_SOON',
    name: 'EMI Due Soon Reminder (3 Days)',
    channel: 'SMS',
    triggerEvent: '3 Days Before Due Date',
    subjectTemplate: 'NEED ELECTRO: EMI Installment Due Reminder',
    templateEn: 'Dear {{customer_name}}, your NEED ELECTRO EMI installment of ৳{{installment_amount}} for {{product_name}} (Serial: {{serial_number}}) is due on {{due_date}}. Pay via bKash Merchant (01733983752) or visit Shop#5, MR Plaza, Moulvibazar. Hotline: 01733-983752.',
    templateBn: 'সম্মানিত {{customer_name}}, নিড ইলেক্ট্রো-তে আপনার {{product_name}}-এর কিস্তি ৳{{installment_amount}} আগামী {{due_date}} তারিখে পরিশোধযোগ্য। বিকাশ মার্চেন্ট (01733983752) অথবা মৌলভীবাজার শোরুমে জমা দিন। হটলাইন: 01733-983752।',
    placeholders: ['{{customer_name}}', '{{product_name}}', '{{serial_number}}', '{{installment_amount}}', '{{due_date}}', '{{company_name}}'],
    isActive: true
  },
  {
    id: 'tpl-overdue',
    code: 'EMI_OVERDUE',
    name: 'EMI Installment Overdue Alert',
    channel: 'WHATSAPP',
    triggerEvent: 'When Installment is Past Due Date',
    subjectTemplate: 'URGENT: NEED ELECTRO EMI Overdue Alert',
    templateEn: 'URGENT: Dear {{customer_name}}, your EMI payment of ৳{{installment_amount}} for {{product_name}} is OVERDUE by {{days_overdue}} days. A late penalty of ৳{{late_fee}} is accumulating daily. Please settle immediately. NEED ELECTRO, MR Plaza, Kusumbag, Moulvibazar. Phone: 01733-983752.',
    templateBn: 'জরুরি নোটিশ: সম্মানিত {{customer_name}}, আপনার {{product_name}}-এর কিস্তি ৳{{installment_amount}} বিগত {{days_overdue}} দিন ধরে বকেয়া রয়েছে। জরিমানা এড়াতে অবিলম্বে পরিশোধ করুন। নিড ইলেক্ট্রো, কুসুমবাগ, মৌলভীবাজার। ফোন: 01733-983752।',
    placeholders: ['{{customer_name}}', '{{product_name}}', '{{installment_amount}}', '{{days_overdue}}', '{{late_fee}}', '{{company_name}}'],
    isActive: true
  }
];

export const INITIAL_POS_SETTINGS: PosSettings = {
  invoicePrefix: 'INV-2026-',
  nextInvoiceNumber: 1001,
  returnWindowDays: 7,
  enablePosDiscounts: true,
  maxDiscountPercent: 15,
  enableCreditSales: true,
  requireCustomerPhone: true,
  defaultInvoiceNotes: '1. Certified warranty claims require original printed invoice and serial sticker intact.\n2. Burnt chips, physical drop impact, and liquid spills strictly void all warranty.\n3. Goods sold can be exchanged within 7 days if defective and in pristine packaging.',
  receiptFooterText: 'NEED ELECTRO — Trusted Electrical & Technological Solutions. A sister concern of AMDADS GROUP. Thank you for your trust!',
  taxPercent: 5,
  printLogoOnReceipt: true,
  printWarrantyOnReceipt: true
};

export const INITIAL_INVENTORY_RULES: InventoryRules = {
  lowStockThresholdDefault: 3,
  enableOutOfStockWarnings: true,
  allowNegativeStock: false,
  serialTrackingMandatoryCategories: ['Laptop', 'CCTV', 'Desktop', 'Smartphone', 'Monitor'],
  autoGenerateBarcode: true,
  barcodePrefix: 'NE-',
  requireApprovalForInterBranchTransfer: true
};
