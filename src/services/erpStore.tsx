import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Branch, User, Product, ProductSerial, Supplier, Customer, Sale,
  EMIPlan, EMIAccount, EMIInstallment, EMIPaymentRecord, ServiceJob,
  Technician, Expense, SystemSettings, InventoryTransaction, AuditLog,
  WarrantyClaim, LedgerEntry, PaymentMethod, UserRole,
  Purchase, FinancialAccount, Investment, Employee, AttendanceRecord, ProductReturn,
  SupplierPayment, FundTransfer, AttendanceStatus,
  Role, Permission, SetupStatus, OpeningBalanceEntry, AccountStatus,
  ProductCategoryConfig, BrandConfig, ConfigurablePaymentMethod, ExpenseCategoryConfig,
  ServiceCategoryConfig, WarrantyRuleConfig, DynamicNotificationTemplate,
  PriceChangeAudit, CustomerMergeAudit, PosSettings, InventoryRules,
  CashAdjustment, CustomerPayment, OtherIncome, OwnerWithdrawal
} from '../types';
import {
  INITIAL_SETTINGS, INITIAL_BRANCHES, INITIAL_USERS, INITIAL_EMI_PLANS,
  INITIAL_SUPPLIERS, INITIAL_PRODUCTS, INITIAL_PRODUCT_SERIALS,
  INITIAL_CUSTOMERS, INITIAL_EMI_ACCOUNTS, INITIAL_EMI_PAYMENTS,
  INITIAL_SALES, INITIAL_TECHNICIANS, INITIAL_SERVICES, INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS, INITIAL_INVENTORY_TRANSACTIONS,
  INITIAL_PURCHASES, INITIAL_FINANCIAL_ACCOUNTS, INITIAL_INVESTMENTS,
  INITIAL_EMPLOYEES, INITIAL_ATTENDANCE, INITIAL_RETURNS,
  INITIAL_ROLES, INITIAL_PERMISSIONS, INITIAL_SETUP_STATUS, INITIAL_OPENING_BALANCES,
  INITIAL_CATEGORIES_CONFIG, INITIAL_BRANDS, INITIAL_PAYMENT_METHODS_CONFIG,
  INITIAL_EXPENSE_CATEGORIES, INITIAL_SERVICE_CATEGORIES, INITIAL_WARRANTY_RULES,
  INITIAL_NOTIFICATION_TEMPLATES, INITIAL_POS_SETTINGS, INITIAL_INVENTORY_RULES
} from './mockData';
import { getStoredData, setStoredData, clearAllStoredData, exportAllDataJSON, importAllDataJSON } from './storage';
import { hashPassword, verifyPassword } from './authCrypto';
import { api, getSessionToken, setSessionToken, clearSessionToken } from './api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
}

interface ERPContextType {
  // Auth & Session
  isAuthenticated: boolean;
  isLocked: boolean;
  login: (email: string, password: string, rememberMe?: boolean, branchId?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  lockSession: () => void;
  unlockSession: (password: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission: (moduleOrPermission: string) => boolean;
  refreshFromDatabase: () => Promise<boolean>;
  refreshSales: () => Promise<Sale[]>;

  // Master State
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  branches: Branch[];
  selectedBranch: Branch;
  setSelectedBranchId: (id: string) => void;
  addBranch: (branchData: Omit<Branch, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateBranch: (branchData: Branch) => Promise<{ success: boolean; error?: string }>;
  deleteBranch: (branchId: string) => Promise<{ success: boolean; error?: string }>;
  currentUser: User;
  setCurrentUserId: (id: string) => void;
  users: User[];

  // Role & Permissions
  roles: Role[];
  permissionsList: Permission[];
  createRole: (roleData: Omit<Role, 'id'>) => { success: boolean; error?: string };
  updateRole: (roleData: Role) => { success: boolean; error?: string };
  deleteRole: (roleId: string) => { success: boolean; error?: string };

  // User Management
  createUser: (userData: { name: string; email: string; phone: string; role: UserRole; branchId: string; allowedBranchIds?: string[]; employeeId?: string; password: string; status?: AccountStatus; username?: string }) => Promise<{ success: boolean; error?: string; user?: User }>;
  updateUser: (userData: User) => { success: boolean; error?: string };
  setUserStatus: (userId: string, status: AccountStatus) => { success: boolean; error?: string };
  resetUserPassword: (userId: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  revokeUserSessions: (userId: string) => { success: boolean; error?: string };

  // Setup, System Mode & Opening Balances
  setupStatus: SetupStatus;
  updateSetupStatus: (statusUpdates: Partial<SetupStatus>) => void;
  completeInitialSetup: (adminData: { name: string; email: string; phone: string; username?: string; password: string }, companyData?: Partial<SystemSettings>) => Promise<{ success: boolean; error?: string }>;
  openingBalances: OpeningBalanceEntry[];
  recordOpeningBalance: (entry: Omit<OpeningBalanceEntry, 'id' | 'createdAt'>) => { success: boolean; error?: string };

  // Entities
  products: Product[];
  serials: ProductSerial[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  purchases: Purchase[];
  returns: ProductReturn[];
  investments: Investment[];
  financialAccounts: FinancialAccount[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  emiPlans: EMIPlan[];
  emiAccounts: EMIAccount[];
  emiPayments: EMIPaymentRecord[];
  technicians: Technician[];
  services: ServiceJob[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  inventoryTransactions: InventoryTransaction[];
  ledgerEntries: LedgerEntry[];
  warrantyClaims: WarrantyClaim[];
  otherIncomes: OtherIncome[];
  ownerWithdrawals: OwnerWithdrawal[];

  // Toasts
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Active print / modal target
  activeInvoiceToPrint: Sale | null;
  setActiveInvoiceToPrint: (sale: Sale | null) => void;
  activeEmiAgreementToPrint: EMIAccount | null;
  setActiveEmiAgreementToPrint: (account: EMIAccount | null) => void;
  activeThermalReceiptToPrint: Sale | null;
  setActiveThermalReceiptToPrint: (sale: Sale | null) => void;
  activeBarcodeToPrint: { product: Product; serials?: string[] } | null;
  setActiveBarcodeToPrint: (data: { product: Product; serials?: string[] } | null) => void;

  // Core Business Actions
  createSale: (saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt'>, emiPlanConfig?: { planId: string; downPayment: number; durationMonths: number }, paymentAccountId?: string) => Promise<{ success: boolean; sale?: Sale; error?: string }>;
  collectEMIPayment: (emiAccountId: string, installmentId: string, amount: number, penaltyAmount: number, paymentMethod: PaymentMethod, ref?: string, notes?: string, accountId?: string) => Promise<{ success: boolean; error?: string; receiptNumber?: string }>;
  createProduct: (productData: Omit<Product, 'id' | 'createdAt'>, initialSerials?: string[]) => Promise<{ success: boolean; error?: string; product?: Product; expense?: any }>;
  updateProduct: (productData: Product) => Promise<{ success: boolean; error?: string }>;
  createPurchase: (purchaseData: {
    supplierId: string;
    supplierName?: string;
    branchId: string;
    items: { productId: string; productName?: string; quantity: number; costPrice: number; serials?: string[]; serialNumbers?: string[] }[];
    subtotal?: number;
    total?: number;
    paidAmount: number;
    dueAmount?: number;
    paymentMethod: string;
    notes?: string;
    depositAccountId?: string;
  }) => Promise<{ success: boolean; error?: string; purchase?: Purchase }>;
  recordSupplierPayment: (supplierId: string, amount: number, paymentMethod: PaymentMethod, accountId?: string, reference?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  recordReturn: (returnData: Omit<ProductReturn, 'id' | 'returnNumber' | 'createdAt' | 'handledBy'>) => Promise<{ success: boolean; error?: string; returnRecord?: ProductReturn }>;
  collectCustomerDue: (customerId: string, amount: number, paymentMethod: PaymentMethod, accountId?: string, reference?: string, notes?: string) => Promise<{ success: boolean; error?: string; receiptNumber?: string }>;
  recordCashAdjustment: (adjustmentData: { amount: number; type: 'INFLOW' | 'OUTFLOW'; reason: string; accountId?: string; paymentMethod?: string; reference?: string; notes?: string; branchId?: string }) => Promise<{ success: boolean; error?: string; adjustment?: CashAdjustment }>;
  recordInvestment: (investmentData: Omit<Investment, 'id' | 'referenceNumber' | 'createdAt' | 'createdBy'> & {
    investorPhone?: string;
    investorEmail?: string;
    investorNid?: string;
    investorAddress?: string;
    sharePercentage?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  transferFunds: (fromAccountId: string, toAccountId: string, amount: number, fee?: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  recordOtherIncome: (incomeData: { category: string; amount: number; date: string; accountId?: string; paymentMethod?: string; reference?: string; description: string; receivedFrom?: string; branchId?: string }) => Promise<{ success: boolean; error?: string; income?: OtherIncome }>;
  recordOwnerWithdrawal: (withdrawalData: { ownerName: string; amount: number; date: string; sourceAccountId?: string; paymentMethod?: string; reference?: string; purpose?: string }) => Promise<{ success: boolean; error?: string; withdrawal?: OwnerWithdrawal }>;
  reverseTransaction: (options: { transactionId?: string; referenceNumber?: string; reason: string }) => Promise<{ success: boolean; error?: string }>;
  recordAttendance: (employeeId: string, status: AttendanceStatus, notes?: string) => Promise<{ success: boolean; error?: string }>;
  disburseSalary: (employeeId: string, month: string, paymentMethod: PaymentMethod, accountId?: string) => Promise<{ success: boolean; error?: string }>;
  createEmployee: (empData: Omit<Employee, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateEmployee: (emp: Employee) => Promise<{ success: boolean; error?: string }>;
  createFinancialAccount: (accountData: Omit<FinancialAccount, 'id'>) => Promise<{ success: boolean; error?: string }>;
  stockAdjustment: (productId: string, branchId: string, quantityDiff: number, reason: string, serialNumbers?: string[]) => Promise<{ success: boolean; error?: string }>;
  stockTransfer: (productId: string, fromBranchId: string, toBranchId: string, quantity: number, serialNumbers?: string[]) => Promise<{ success: boolean; error?: string }>;
  createCustomer: (customerData: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'currentBalance'>) => Promise<{ success: boolean; error?: string; customer?: Customer }>;
  updateCustomer: (customer: Customer) => Promise<{ success: boolean; error?: string }>;
  createSupplier: (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'currentPayable'>) => Promise<{ success: boolean; error?: string; supplier?: Supplier }>;
  createServiceJob: (jobData: Omit<ServiceJob, 'id' | 'jobCardNumber' | 'createdAt' | 'partsUsed' | 'totalBill' | 'paymentStatus'>) => Promise<{ success: boolean; error?: string; job?: ServiceJob }>;
  updateServiceStatus: (jobId: string, status: ServiceJob['status'], partsUsed?: ServiceJob['partsUsed'], laborCost?: number, paymentStatus?: 'UNPAID' | 'PAID', paymentMethod?: PaymentMethod) => Promise<{ success: boolean; error?: string }>;
  createExpense: (expenseData: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt' | 'createdBy'>) => Promise<{ success: boolean; error?: string; expense?: Expense }>;
  submitWarrantyClaim: (claimData: Omit<WarrantyClaim, 'id' | 'claimNumber' | 'claimDate' | 'status'>) => Promise<{ success: boolean; error?: string; claim?: WarrantyClaim }>;
  resolveWarrantyClaim: (claimId: string, status: WarrantyClaim['status'], notes: string) => Promise<{ success: boolean; error?: string }>;
  saveEMIPlan: (plan: EMIPlan) => void;
  saveEMIPlanWithVersioning: (plan: EMIPlan, reason?: string) => Promise<{ success: boolean; error?: string }>;
  deleteEMIPlan: (id: string) => Promise<{ success: boolean; error?: string }>;
  resetEMIPlansToDefaults: () => Promise<{ success: boolean; error?: string }>;

  // Control Center Master Configurations
  categoriesConfig: ProductCategoryConfig[];
  saveCategoryConfig: (cat: ProductCategoryConfig) => Promise<{ success: boolean; error?: string }>;
  deleteCategoryConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  brandsConfig: BrandConfig[];
  saveBrandConfig: (brand: BrandConfig) => Promise<{ success: boolean; error?: string }>;
  deleteBrandConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  paymentMethodsConfig: ConfigurablePaymentMethod[];
  savePaymentMethodConfig: (pm: ConfigurablePaymentMethod) => Promise<{ success: boolean; error?: string }>;
  deletePaymentMethodConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  expenseCategoriesConfig: ExpenseCategoryConfig[];
  saveExpenseCategoryConfig: (cat: ExpenseCategoryConfig) => Promise<{ success: boolean; error?: string }>;
  deleteExpenseCategoryConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  serviceCategoriesConfig: ServiceCategoryConfig[];
  saveServiceCategoryConfig: (sc: ServiceCategoryConfig) => Promise<{ success: boolean; error?: string }>;
  deleteServiceCategoryConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  warrantyRulesConfig: WarrantyRuleConfig[];
  saveWarrantyRuleConfig: (wr: WarrantyRuleConfig) => Promise<{ success: boolean; error?: string }>;
  deleteWarrantyRuleConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  notificationTemplatesConfig: DynamicNotificationTemplate[];
  saveNotificationTemplateConfig: (tpl: DynamicNotificationTemplate) => Promise<{ success: boolean; error?: string }>;
  deleteNotificationTemplateConfig: (id: string) => Promise<{ success: boolean; error?: string }>;
  priceAuditLog: PriceChangeAudit[];
  updateProductPrice: (productId: string, updates: { retailPrice?: number; emiPrice?: number; wholesalePrice?: number; purchasePrice?: number; costPrice?: number }, reason: string) => Promise<{ success: boolean; error?: string }>;
  customerMergeAudit: CustomerMergeAudit[];
  mergeCustomers: (sourceCustomerId: string, targetCustomerId: string, reason: string) => Promise<{ success: boolean; error?: string; audit?: CustomerMergeAudit }>;
  posSettings: PosSettings;
  updatePosSettings: (updates: Partial<PosSettings>) => Promise<void>;
  inventoryRules: InventoryRules;
  updateInventoryRules: (updates: Partial<InventoryRules>) => Promise<void>;

  // Super Admin Master Omnipotent Controls
  updateSale: (saleId: string, updates: Partial<Sale>) => Promise<{ success: boolean; error?: string }>;
  deleteSale: (saleId: string) => Promise<{ success: boolean; error?: string }>;
  recordInvoicePayment: (invoiceId: string, paymentData: { amount: number; paymentMethod: PaymentMethod; accountId?: string; reference?: string; notes?: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateEMIAccount: (accountId: string, updates: Partial<EMIAccount>) => Promise<{ success: boolean; error?: string }>;
  deleteEMIAccount: (accountId: string) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; error?: string }>;
  deleteCustomer: (customerId: string) => Promise<{ success: boolean; error?: string }>;
  updateSupplier: (supplierId: string, updates: Partial<Supplier>) => Promise<{ success: boolean; error?: string }>;
  deleteSupplier: (supplierId: string) => Promise<{ success: boolean; error?: string }>;
  updatePurchase: (purchaseId: string, updates: Partial<Purchase>) => Promise<{ success: boolean; error?: string }>;
  deletePurchase: (purchaseId: string) => Promise<{ success: boolean; error?: string }>;
  updateReturn: (returnId: string, updates: Partial<ProductReturn>) => Promise<{ success: boolean; error?: string }>;
  deleteReturn: (returnId: string) => Promise<{ success: boolean; error?: string }>;
  updateExpense: (expenseId: string, updates: Partial<Expense>) => Promise<{ success: boolean; error?: string }>;
  deleteExpense: (expenseId: string) => Promise<{ success: boolean; error?: string }>;
  updateServiceJob: (jobId: string, updates: Partial<ServiceJob>) => Promise<{ success: boolean; error?: string }>;
  deleteServiceJob: (jobId: string) => Promise<{ success: boolean; error?: string }>;
  updateWarrantyClaim: (claimId: string, updates: Partial<WarrantyClaim>) => Promise<{ success: boolean; error?: string }>;
  deleteWarrantyClaim: (claimId: string) => Promise<{ success: boolean; error?: string }>;
  deleteEmployee: (employeeId: string) => Promise<{ success: boolean; error?: string }>;

  // Utilities
  exportDatabase: () => string;
  importDatabase: (json: string) => boolean;
}

const ERPContext = createContext<ERPContextType | null>(null);

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State initialization with local storage backup
  const [settings, setSettings] = useState<SystemSettings>(() => getStoredData('settings', INITIAL_SETTINGS));
  const [branches, setBranches] = useState<Branch[]>(() => getStoredData('branches', INITIAL_BRANCHES));
  const [selectedBranchId, setSelectedBranchIdState] = useState<string>(() => branches[0]?.id || 'branch-1');
  const [users, setUsers] = useState<User[]>(() => getStoredData('users', INITIAL_USERS));
  const [authSession, setAuthSession] = useState<{ isAuthenticated: boolean; userId: string; isLocked: boolean }>(() => 
    getStoredData('auth_session', { isAuthenticated: false, userId: 'user-1', isLocked: false })
  );
  const [currentUserId, setCurrentUserIdState] = useState<string>(() => authSession.userId || users[0]?.id || 'user-1');

  useEffect(() => {
    setStoredData('auth_session', authSession);
  }, [authSession]);

  const [products, setProducts] = useState<Product[]>(() => getStoredData('products', []));
  const [serials, setSerials] = useState<ProductSerial[]>(() => getStoredData('serials', []));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStoredData('suppliers', []));
  const [customers, setCustomers] = useState<Customer[]>(() => getStoredData('customers', []));
  const [sales, setSales] = useState<Sale[]>(() => getStoredData('sales', []));
  const [emiPlans, setEmiPlans] = useState<EMIPlan[]>(() => getStoredData('emi_plans', INITIAL_EMI_PLANS));
  const [emiAccounts, setEmiAccounts] = useState<EMIAccount[]>(() => getStoredData('emi_accounts', []));
  const [emiPayments, setEmiPayments] = useState<EMIPaymentRecord[]>(() => getStoredData('emi_payments', []));
  const [technicians, setTechnicians] = useState<Technician[]>(() => getStoredData('technicians', INITIAL_TECHNICIANS));
  const [services, setServices] = useState<ServiceJob[]>(() => getStoredData('services', []));
  const [expenses, setExpenses] = useState<Expense[]>(() => getStoredData('expenses', []));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStoredData('audit_logs', []));
  const [inventoryTransactions, setInventoryTransactions] = useState<InventoryTransaction[]>(() => getStoredData('inventory_transactions', []));
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => getStoredData('warranty_claims', []));
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(() => getStoredData('ledger_entries', []));
  const [otherIncomes, setOtherIncomes] = useState<OtherIncome[]>(() => getStoredData('other_incomes', []));
  const [ownerWithdrawals, setOwnerWithdrawals] = useState<OwnerWithdrawal[]>(() => getStoredData('owner_withdrawals', []));
  const [purchases, setPurchases] = useState<Purchase[]>(() => getStoredData('purchases', []));
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(() => getStoredData('financial_accounts', INITIAL_FINANCIAL_ACCOUNTS));
  const [investments, setInvestments] = useState<Investment[]>(() => getStoredData('investments', []));
  const [employees, setEmployees] = useState<Employee[]>(() => getStoredData('employees', INITIAL_EMPLOYEES));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => getStoredData('attendance', []));
  const [returns, setReturns] = useState<ProductReturn[]>(() => getStoredData('returns', []));
  const [roles, setRoles] = useState<Role[]>(() => getStoredData('roles', INITIAL_ROLES));
  const [permissionsList, setPermissionsList] = useState<Permission[]>(() => getStoredData('permissions', INITIAL_PERMISSIONS));
  const [setupStatus, setSetupStatus] = useState<SetupStatus>(() => getStoredData('setup_status', INITIAL_SETUP_STATUS));
  const [openingBalances, setOpeningBalances] = useState<OpeningBalanceEntry[]>(() => getStoredData('opening_balances', []));

  // Control Center Configurations & Audits
  const [categoriesConfig, setCategoriesConfig] = useState<ProductCategoryConfig[]>(() => getStoredData('categories_config', INITIAL_CATEGORIES_CONFIG));
  const [brandsConfig, setBrandsConfig] = useState<BrandConfig[]>(() => getStoredData('brands_config', INITIAL_BRANDS));
  const [paymentMethodsConfig, setPaymentMethodsConfig] = useState<ConfigurablePaymentMethod[]>(() => getStoredData('payment_methods_config', INITIAL_PAYMENT_METHODS_CONFIG));
  const [expenseCategoriesConfig, setExpenseCategoriesConfig] = useState<ExpenseCategoryConfig[]>(() => getStoredData('expense_categories', INITIAL_EXPENSE_CATEGORIES));
  const [serviceCategoriesConfig, setServiceCategoriesConfig] = useState<ServiceCategoryConfig[]>(() => getStoredData('service_categories', INITIAL_SERVICE_CATEGORIES));
  const [warrantyRulesConfig, setWarrantyRulesConfig] = useState<WarrantyRuleConfig[]>(() => getStoredData('warranty_rules', INITIAL_WARRANTY_RULES));
  const [notificationTemplatesConfig, setNotificationTemplatesConfig] = useState<DynamicNotificationTemplate[]>(() => getStoredData('notification_templates', INITIAL_NOTIFICATION_TEMPLATES));
  const [priceAuditLog, setPriceAuditLog] = useState<PriceChangeAudit[]>(() => getStoredData('price_audit_log', []));
  const [customerMergeAudit, setCustomerMergeAudit] = useState<CustomerMergeAudit[]>(() => getStoredData('customer_merge_audit', []));
  const [posSettings, setPosSettings] = useState<PosSettings>(() => getStoredData('pos_settings', INITIAL_POS_SETTINGS));
  const [inventoryRules, setInventoryRules] = useState<InventoryRules>(() => getStoredData('inventory_rules', INITIAL_INVENTORY_RULES));

  // Modals / Prints
  const [activeInvoiceToPrint, setActiveInvoiceToPrint] = useState<Sale | null>(null);
  const [activeEmiAgreementToPrint, setActiveEmiAgreementToPrint] = useState<EMIAccount | null>(null);
  const [activeThermalReceiptToPrint, setActiveThermalReceiptToPrint] = useState<Sale | null>(null);
  const [activeBarcodeToPrint, setActiveBarcodeToPrint] = useState<{ product: Product; serials?: string[] } | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Persist handlers
  useEffect(() => { setStoredData('settings', settings); }, [settings]);
  useEffect(() => { setStoredData('branches', branches); }, [branches]);
  useEffect(() => { setStoredData('users', users); }, [users]);
  useEffect(() => { setStoredData('products', products); }, [products]);
  useEffect(() => { setStoredData('serials', serials); }, [serials]);
  useEffect(() => { setStoredData('suppliers', suppliers); }, [suppliers]);
  useEffect(() => { setStoredData('customers', customers); }, [customers]);
  useEffect(() => { setStoredData('sales', sales); }, [sales]);
  useEffect(() => { setStoredData('purchases', purchases); }, [purchases]);
  useEffect(() => { setStoredData('financial_accounts', financialAccounts); }, [financialAccounts]);
  useEffect(() => { setStoredData('investments', investments); }, [investments]);
  useEffect(() => { setStoredData('employees', employees); }, [employees]);
  useEffect(() => { setStoredData('attendance', attendance); }, [attendance]);
  useEffect(() => { setStoredData('returns', returns); }, [returns]);
  useEffect(() => { setStoredData('emi_plans', emiPlans); }, [emiPlans]);
  useEffect(() => { setStoredData('emi_accounts', emiAccounts); }, [emiAccounts]);
  useEffect(() => { setStoredData('emi_payments', emiPayments); }, [emiPayments]);
  useEffect(() => { setStoredData('technicians', technicians); }, [technicians]);
  useEffect(() => { setStoredData('services', services); }, [services]);
  useEffect(() => { setStoredData('expenses', expenses); }, [expenses]);
  useEffect(() => { setStoredData('audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { setStoredData('inventory_transactions', inventoryTransactions); }, [inventoryTransactions]);
  useEffect(() => { setStoredData('warranty_claims', warrantyClaims); }, [warrantyClaims]);
  useEffect(() => { setStoredData('ledger_entries', ledgerEntries); }, [ledgerEntries]);
  useEffect(() => { setStoredData('other_incomes', otherIncomes); }, [otherIncomes]);
  useEffect(() => { setStoredData('owner_withdrawals', ownerWithdrawals); }, [ownerWithdrawals]);
  useEffect(() => { setStoredData('roles', roles); }, [roles]);
  useEffect(() => { setStoredData('permissions', permissionsList); }, [permissionsList]);
  useEffect(() => { setStoredData('setup_status', setupStatus); }, [setupStatus]);
  useEffect(() => { setStoredData('opening_balances', openingBalances); }, [openingBalances]);
  useEffect(() => { setStoredData('categories_config', categoriesConfig); }, [categoriesConfig]);
  useEffect(() => { setStoredData('brands_config', brandsConfig); }, [brandsConfig]);
  useEffect(() => { setStoredData('payment_methods_config', paymentMethodsConfig); }, [paymentMethodsConfig]);
  useEffect(() => { setStoredData('expense_categories', expenseCategoriesConfig); }, [expenseCategoriesConfig]);
  useEffect(() => { setStoredData('service_categories', serviceCategoriesConfig); }, [serviceCategoriesConfig]);
  useEffect(() => { setStoredData('warranty_rules', warrantyRulesConfig); }, [warrantyRulesConfig]);
  useEffect(() => { setStoredData('notification_templates', notificationTemplatesConfig); }, [notificationTemplatesConfig]);
  useEffect(() => { setStoredData('price_audit_log', priceAuditLog); }, [priceAuditLog]);
  useEffect(() => { setStoredData('customer_merge_audit', customerMergeAudit); }, [customerMergeAudit]);
  useEffect(() => { setStoredData('pos_settings', posSettings); }, [posSettings]);
  useEffect(() => { setStoredData('inventory_rules', inventoryRules); }, [inventoryRules]);

  const refreshSales = async (): Promise<Sale[]> => {
    try {
      const res = await api.sales.getSales();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setSales(res.data);
        setStoredData('sales', res.data);
        return res.data;
      }
    } catch (e: any) {
      console.warn('Direct sales fetch notice:', e.message);
    }
    return [];
  };

  const refreshFromDatabase = async (): Promise<boolean> => {
    try {
      const res = await api.bootstrap.getAll();
      if (res && res.success && res.data) {
        const d = res.data;
        if (d.settings) setSettings(d.settings);
        if (Array.isArray(d.branches)) setBranches(d.branches);
        if (d.posSettings) setPosSettings(d.posSettings);
        if (d.inventoryRules) setInventoryRules(d.inventoryRules);
        if (d.setupStatus) setSetupStatus(d.setupStatus);
        if (Array.isArray(d.categoriesConfig)) setCategoriesConfig(d.categoriesConfig);
        if (Array.isArray(d.brandsConfig)) setBrandsConfig(d.brandsConfig);
        if (Array.isArray(d.paymentMethodsConfig)) setPaymentMethodsConfig(d.paymentMethodsConfig);
        if (Array.isArray(d.expenseCategoriesConfig)) setExpenseCategoriesConfig(d.expenseCategoriesConfig);
        if (Array.isArray(d.serviceCategoriesConfig)) setServiceCategoriesConfig(d.serviceCategoriesConfig);
        if (Array.isArray(d.warrantyRulesConfig)) setWarrantyRulesConfig(d.warrantyRulesConfig);
        if (Array.isArray(d.notificationTemplatesConfig)) setNotificationTemplatesConfig(d.notificationTemplatesConfig);

        if (Array.isArray(d.roles) && d.roles.length > 0) setRoles(d.roles);
        if (Array.isArray(d.permissionsList) && d.permissionsList.length > 0) setPermissionsList(d.permissionsList);
        if (Array.isArray(d.users) && d.users.length > 0) setUsers(d.users);

        if (Array.isArray(d.products) && d.products.length > 0) setProducts(d.products);
        if (Array.isArray(d.serials)) setSerials(d.serials);
        if (Array.isArray(d.customers) && d.customers.length > 0) setCustomers(d.customers);
        if (Array.isArray(d.suppliers) && d.suppliers.length > 0) setSuppliers(d.suppliers);
        if (Array.isArray(d.sales) && d.sales.length > 0) setSales(d.sales);
        if (Array.isArray(d.purchases)) setPurchases(d.purchases);
        if (Array.isArray(d.returns)) setReturns(d.returns);
        if (Array.isArray(d.expenses) && d.expenses.length > 0) setExpenses(d.expenses);
        if (Array.isArray(d.services)) setServices(d.services);
        if (Array.isArray(d.technicians)) setTechnicians(d.technicians);
        if (Array.isArray(d.warrantyClaims)) setWarrantyClaims(d.warrantyClaims);
        if (Array.isArray(d.investments) && d.investments.length > 0) setInvestments(d.investments);
        if (Array.isArray(d.financialAccounts) && d.financialAccounts.length > 0) setFinancialAccounts(d.financialAccounts);
        if (Array.isArray(d.employees)) setEmployees(d.employees);
        if (Array.isArray(d.emiPlans) && d.emiPlans.length > 0) {
          setEmiPlans(d.emiPlans);
        } else if (!emiPlans || emiPlans.length === 0) {
          setEmiPlans(INITIAL_EMI_PLANS);
        }
        if (Array.isArray(d.emiAccounts)) setEmiAccounts(d.emiAccounts);
        if (Array.isArray(d.emiPayments)) setEmiPayments(d.emiPayments);
        if (Array.isArray(d.inventoryTransactions)) setInventoryTransactions(d.inventoryTransactions);
        if (Array.isArray(d.ledgerEntries)) setLedgerEntries(d.ledgerEntries);
        if (Array.isArray(d.auditLogs)) setAuditLogs(d.auditLogs);
        if (Array.isArray(d.priceAuditLog)) setPriceAuditLog(d.priceAuditLog);
        if (Array.isArray(d.customerMergeAudit)) setCustomerMergeAudit(d.customerMergeAudit);
        if (Array.isArray(d.openingBalances)) setOpeningBalances(d.openingBalances);
        if (Array.isArray(d.otherIncomes)) setOtherIncomes(d.otherIncomes);
        if (Array.isArray(d.ownerWithdrawals)) setOwnerWithdrawals(d.ownerWithdrawals);

        // If sales wasn't in bootstrap payload or was empty, also pull from direct sales endpoint
        if (!Array.isArray(d.sales) || d.sales.length === 0) {
          await refreshSales();
        }
        return true;
      }
    } catch (err: any) {
      console.warn('Database sync notice:', err.message);
      await refreshSales();
    }
    return false;
  };

  // Hydrate from database on mount & verify session
  useEffect(() => {
    let isMounted = true;
    const initDatabaseState = async () => {
      try {
        const setupRes = await api.auth.getSetupStatus().catch(() => null);
        if (setupRes?.success && setupRes.data && isMounted) {
          setSetupStatus(prev => ({ ...prev, ...setupRes.data }));
        }

        const token = getSessionToken();
        if (token) {
          const sessionRes = await api.auth.getSession().catch(() => null);
          if (sessionRes?.success && sessionRes.user && isMounted) {
            setAuthSession({
              isAuthenticated: true,
              userId: sessionRes.user.id,
              isLocked: false
            });
            setCurrentUserIdState(sessionRes.user.id);
            if (sessionRes.user.branchId) {
              setSelectedBranchIdState(sessionRes.user.branchId);
            }
          } else {
            clearSessionToken();
            if (isMounted) {
              setAuthSession({ isAuthenticated: false, userId: '', isLocked: false });
            }
          }
        } else {
          // If no token exists, ensure local session reflects unauthenticated state so fresh login is requested
          if (authSession.isAuthenticated && isMounted) {
            setAuthSession({ isAuthenticated: false, userId: '', isLocked: false });
          }
        }

        await refreshFromDatabase();
      } catch (e) {
        console.warn('Backend connection initialization:', e);
      }
    };

    initDatabaseState();
    return () => { isMounted = false; };
  }, []);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      type,
      title,
      message,
      timestamp: Date.now()
    };
    setToasts(prev => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const DEFAULT_FALLBACK_BRANCH: Branch = {
    id: '',
    name: 'No Branch Configured',
    code: 'NONE',
    address: '',
    phone: '',
    email: '',
    isWarehouse: false,
    active: false,
  };

  const DEFAULT_FALLBACK_USER: User = {
    id: 'usr-admin-default',
    name: 'Administrator',
    email: 'info.needelectro@gmail.com',
    role: 'SUPER_ADMIN',
    branchId: 'br-main',
    allowedBranchIds: ['br-main'],
    active: true,
    status: 'ACTIVE',
    phone: '01712-345678',
    createdAt: '2025-01-01'
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || branches[0] || DEFAULT_FALLBACK_BRANCH;
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || DEFAULT_FALLBACK_USER;

  const logAction = (module: AuditLog['module'], action: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      module,
      recordId,
      details,
      ipAddress: '127.0.0.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // -------------------------------------------------------------
  // PRODUCTION AUTHENTICATION & DATABASE-DRIVEN RBAC (MODULE.ACTION)
  // -------------------------------------------------------------
  const hasPermission = (moduleOrPermission: string): boolean => {
    if (!authSession.isAuthenticated) return false;
    
    // Super Admin has unrestricted, permanent master access
    if (currentUser.role === 'SUPER_ADMIN') return true;

    // Look up database-driven role
    const userRole = roles.find(r => r.code === currentUser.role || r.id === currentUser.roleId || r.name.toLowerCase() === currentUser.role.toLowerCase());
    const assignedPermissions = userRole?.permissions || [];

    if (assignedPermissions.includes('*')) return true;

    const target = moduleOrPermission.toLowerCase().trim();

    // Direct match or wildcard module match (e.g., 'sales.create' or 'sales.*')
    if (target.includes('.')) {
      const [mod] = target.split('.');
      if (assignedPermissions.includes(`${mod}.*`)) return true;
      return assignedPermissions.includes(target);
    }

    // High-level module check for navigation & sidebar routing (e.g. 'pos', 'sales', 'emi', 'accounting')
    return assignedPermissions.some(perm => {
      if (perm === target) return true;
      if (perm.startsWith(`${target}.`)) return true;
      if (target === 'pos' && (perm.startsWith('sales.') || perm === 'pos.view')) return true;
      if (target === 'inventory' && (perm.startsWith('inventory.') || perm.startsWith('products.'))) return true;
      if (target === 'accounting' && (perm.startsWith('accounting.') || perm.startsWith('financial.'))) return true;
      if (target === 'service' && (perm.startsWith('services.') || perm.startsWith('service.'))) return true;
      if (target === 'warranty' && perm.startsWith('warranty.')) return true;
      if (target === 'ledgers' && (perm.startsWith('accounting.') || perm.startsWith('customers.') || perm.startsWith('suppliers.'))) return true;
      if (target === 'cash_management' && (perm.startsWith('cash.') || perm.startsWith('accounting.') || perm.startsWith('financial.') || perm === 'cash_management')) return true;
      if ((target === 'control_center' || target === 'seo_management') && (perm.startsWith('settings.') || perm === 'control_center' || perm === 'settings')) return true;
      return false;
    });
  };

  const login = async (
    email: string,
    password: string,
    rememberMe: boolean = true,
    branchId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await api.auth.login(cleanEmail, password, rememberMe, branchId);
      if (res && res.success && res.token && res.user) {
        setSessionToken(res.token, rememberMe);
        setAuthSession({
          isAuthenticated: true,
          userId: res.user.id,
          isLocked: false
        });
        setCurrentUserIdState(res.user.id);
        const activeBranch = branchId || res.user.branchId || 'branch-1';
        setSelectedBranchIdState(activeBranch);

        // Fetch freshly authenticated data from centralized SQLite DB
        await refreshFromDatabase();

        logAction('SETTINGS', 'LOGIN_SUCCESS', res.user.id, `User ${res.user.name} (${res.user.email}) logged in successfully as ${res.user.role}.`);
        addToast('success', `Welcome, ${res.user.name.split(' ')[0]}!`, `Authenticated as ${res.user.role}.`);
        return { success: true };
      }
      const errMsg = (res as any)?.error || 'Authentication failed.';
      addToast('error', 'Authentication Failed', errMsg);
      return { success: false, error: errMsg };
    } catch (err: any) {
      const errMsg = err.message || 'Authentication failed.';
      addToast('error', 'Authentication Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    clearSessionToken();
    logAction('SETTINGS', 'LOGOUT', currentUser.id, `User ${currentUser.name} signed out.`);
    setAuthSession({ isAuthenticated: false, userId: '', isLocked: false });
    addToast('info', 'Signed Out', 'You have been logged out of NEED ELECTRO ERP.');
    refreshFromDatabase();
  };

  const lockSession = () => {
    setAuthSession(prev => ({ ...prev, isLocked: true }));
    addToast('warning', 'Terminal Locked', 'Session locked for security. Enter your password to resume.');
  };

  const unlockSession = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.unlock(password);
      if (res && res.success) {
        setAuthSession(prev => ({ ...prev, isLocked: false }));
        addToast('success', 'Terminal Resumed', `Welcome back, ${currentUser.name.split(' ')[0]}.`);
        return { success: true };
      }
      addToast('error', 'Unlock Failed', 'Incorrect password.');
      return { success: false, error: 'Incorrect password.' };
    } catch (err: any) {
      addToast('error', 'Unlock Failed', err.message || 'Incorrect password.');
      return { success: false, error: err.message || 'Incorrect password.' };
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.changePassword(oldPassword, newPassword);
      if (res && res.success) {
        addToast('success', 'Password Updated', 'Security credentials updated on central database.');
        logAction('SETTINGS', 'PASSWORD_CHANGE', currentUser.id, `User ${currentUser.name} updated their password.`);
        return { success: true };
      }
      return { success: false, error: (res as any)?.error || 'Password change failed.' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // -------------------------------------------------------------
  // USER ACCOUNT MANAGEMENT (SUPER ADMIN / ADMIN CONTROL)
  // -------------------------------------------------------------
  const createUser = async (userData: {
    name: string;
    email: string;
    phone: string;
    role: UserRole;
    branchId: string;
    allowedBranchIds?: string[];
    employeeId?: string;
    password: string;
    status?: AccountStatus;
    username?: string;
  }): Promise<{ success: boolean; error?: string; user?: User }> => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Only administrators can create user accounts.' };
    }

    const cleanEmail = userData.email.trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'A user account with this email address already exists.' };
    }

    // Do NOT allow normal administrators to create another Super Admin unless Super Admin
    if (userData.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only the Super Admin master account can create another Super Admin.' };
    }

    const pass = userData.password || 'needelectro2026';
    const passwordHash = await hashPassword(pass);
    const roleObj = roles.find(r => r.code === userData.role || r.name === userData.role);

    const newUser: User = {
      id: 'user-' + Date.now(),
      name: userData.name.trim(),
      email: cleanEmail,
      username: userData.username?.toLowerCase().trim() || cleanEmail.split('@')[0],
      role: userData.role,
      roleId: roleObj?.id,
      branchId: userData.branchId,
      allowedBranchIds: userData.allowedBranchIds || [userData.branchId],
      phone: userData.phone,
      employeeId: userData.employeeId,
      password: pass,
      passwordHash,
      active: userData.status ? userData.status === 'ACTIVE' : true,
      status: userData.status || 'ACTIVE',
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);
    logAction('SETTINGS', 'USER_CREATED', newUser.id, `Super Admin created account for ${newUser.name} (${newUser.email}) with role ${newUser.role} assigned to branch ${newUser.branchId}.`);
    addToast('success', 'User Account Created', `Staff account for ${newUser.name} created successfully.`);

    // Persist user to central SQLite database
    api.auth.createUser({
      name: userData.name.trim(),
      email: cleanEmail,
      username: userData.username?.toLowerCase().trim() || cleanEmail.split('@')[0],
      role: userData.role,
      roleId: roleObj?.id,
      branchId: userData.branchId,
      allowedBranchIds: userData.allowedBranchIds || [userData.branchId],
      phone: userData.phone,
      employeeId: userData.employeeId,
      password: pass,
      status: userData.status || 'ACTIVE'
    }).catch(err => console.error('Failed to sync user creation to database:', err));

    return { success: true, user: newUser };
  };

  const updateUser = (userData: User): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to update users.' };
    }

    // Protect Super Admin from demotion by non-super admin
    const existing = users.find(u => u.id === userData.id);
    if (existing?.role === 'SUPER_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Cannot modify Super Admin privileges.' };
    }

    setUsers(prev => prev.map(u => u.id === userData.id ? { ...u, ...userData } : u));
    logAction('SETTINGS', 'USER_UPDATED', userData.id, `Updated account profile for ${userData.name}.`);
    addToast('success', 'User Updated', `Account details for ${userData.name} saved.`);

    // Persist to central SQLite database
    api.auth.updateUser(userData.id, userData).catch(err => console.error('Failed to sync user to database:', err));

    return { success: true };
  };

  const setUserStatus = (userId: string, status: AccountStatus): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized to change user account status.' };
    }

    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found.' };

    if (target.role === 'SUPER_ADMIN' && status !== 'ACTIVE') {
      return { success: false, error: 'The Super Admin account cannot be disabled or suspended.' };
    }

    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      status,
      active: status === 'ACTIVE'
    } : u));

    logAction('SETTINGS', 'USER_STATUS_CHANGED', userId, `Changed status of ${target.name} to ${status}. Historical business records preserved.`);
    addToast('info', 'Status Updated', `Account for ${target.name} set to ${status}.`);

    // Persist to central SQLite database
    api.auth.setUserStatus(userId, status).catch(err => console.error('Failed to sync user status to database:', err));

    return { success: true };
  };

  const resetUserPassword = async (userId: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'ADMIN' && currentUser.id !== userId) {
      return { success: false, error: 'Unauthorized to reset password.' };
    }

    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found.' };

    const passwordHash = await hashPassword(newPassword);

    setUsers(prev => prev.map(u => u.id === userId ? {
      ...u,
      password: newPassword,
      passwordHash,
      failedLoginAttempts: 0,
      lockedUntil: undefined
    } : u));

    logAction('SETTINGS', 'PASSWORD_RESET', userId, `Password reset performed for user ${target.name} (${target.email}).`);
    addToast('success', 'Password Reset', `Password successfully updated for ${target.name}.`);

    // Persist to central SQLite database
    api.auth.resetPassword(userId, newPassword).catch(err => console.error('Failed to reset password on database:', err));

    return { success: true };
  };

  const revokeUserSessions = (userId: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admin can revoke active sessions.' };
    }
    const target = users.find(u => u.id === userId);
    if (!target) return { success: false, error: 'User not found.' };

    if (authSession.userId === userId) {
      setAuthSession({ isAuthenticated: false, userId: '', isLocked: false });
    }
    logAction('SETTINGS', 'SESSION_REVOKED', userId, `Revoked all active sessions for ${target.name}.`);
    addToast('info', 'Sessions Revoked', `All active sessions for ${target.name} terminated.`);
    return { success: true };
  };

  // -------------------------------------------------------------
  // DATABASE-DRIVEN ROLE MANAGEMENT
  // -------------------------------------------------------------
  const createRole = (roleData: Omit<Role, 'id'>): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admin can create new custom roles.' };
    }

    const newRole: Role = {
      ...roleData,
      id: 'role-' + Date.now(),
      isSystem: false
    };

    setRoles(prev => [...prev, newRole]);
    logAction('SETTINGS', 'ROLE_CREATED', newRole.id, `Created custom role ${newRole.name} (${newRole.code}) with ${newRole.permissions.length} permissions.`);
    addToast('success', 'Role Created', `Role ${newRole.name} created.`);

    // Persist to central SQLite database
    api.auth.createRole(roleData).catch(err => console.error('Failed to sync role to database:', err));

    return { success: true };
  };

  const updateRole = (roleData: Role): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admin can modify roles and permissions.' };
    }

    setRoles(prev => prev.map(r => r.id === roleData.id ? roleData : r));
    logAction('SETTINGS', 'ROLE_UPDATED', roleData.id, `Updated permissions for role ${roleData.name}.`);
    addToast('success', 'Role Saved', `Permissions for ${roleData.name} updated.`);

    // Persist to central SQLite database
    api.auth.updateRole(roleData.id, roleData).catch(err => console.error('Failed to sync role update to database:', err));

    return { success: true };
  };

  const deleteRole = (roleId: string): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admin can delete roles.' };
    }

    const target = roles.find(r => r.id === roleId);
    if (!target) return { success: false, error: 'Role not found.' };
    if (target.isSystem) return { success: false, error: 'System roles cannot be deleted.' };

    if (users.some(u => u.role === target.code || u.roleId === target.id)) {
      return { success: false, error: 'Cannot delete role while user accounts are assigned to it.' };
    }

    setRoles(prev => prev.filter(r => r.id !== roleId));
    logAction('SETTINGS', 'ROLE_DELETED', roleId, `Deleted custom role ${target.name}.`);
    addToast('info', 'Role Removed', `Custom role ${target.name} removed.`);
    return { success: true };
  };

  // -------------------------------------------------------------
  // INITIAL SUPER ADMIN SETUP & SYSTEM CONFIGURATION WIZARD
  // -------------------------------------------------------------
  const completeInitialSetup = async (
    adminData: { name: string; email: string; phone: string; username?: string; password: string },
    companyData?: Partial<SystemSettings>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.auth.initialSetup({
        name: adminData.name,
        email: adminData.email,
        phone: adminData.phone,
        username: adminData.username,
        password: adminData.password,
        companyData
      });

      if (res && res.success) {
        // Log in immediately as the newly provisioned Super Admin
        const loginRes = await login(adminData.email, adminData.password);
        if (loginRes.success) {
          addToast('success', 'System Initialized', 'Super Admin master account configured on central database.');
          return { success: true };
        }
      }
      return { success: false, error: (res as any)?.error || 'Setup failed' };
    } catch (err: any) {
      addToast('error', 'Setup Failed', err.message || 'Setup request failed.');
      return { success: false, error: err.message || 'Setup request failed.' };
    }
  };

  const updateSetupStatus = (statusUpdates: Partial<SetupStatus>) => {
    setSetupStatus(prev => ({ ...prev, ...statusUpdates }));
    logAction('SETTINGS', 'SETUP_STATUS_UPDATED', 'GLOBAL', 'Updated ERP setup checklist status.');
  };

  const recordOpeningBalance = (entry: Omit<OpeningBalanceEntry, 'id' | 'createdAt'>): { success: boolean; error?: string } => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, error: 'Only Super Admin can authorize opening balance entries.' };
    }

    const newEntry: OpeningBalanceEntry = {
      ...entry,
      id: 'ob-' + Date.now(),
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    setOpeningBalances(prev => [newEntry, ...prev]);

    // Update financial account balance if cash / bank / mobile banking
    if (entry.type === 'CASH' || entry.type === 'BANK' || entry.type === 'MOBILE_BANKING') {
      setFinancialAccounts(prev => prev.map(acc => {
        if (acc.id === entry.targetId || acc.name.toLowerCase().includes(entry.targetName.toLowerCase())) {
          return { ...acc, balance: acc.balance + entry.amount };
        }
        return acc;
      }));
    }

    // Post double-entry ledger entry
    const newLedger: LedgerEntry = {
      id: 'led-ob-' + Date.now(),
      date: entry.date,
      partyType: entry.type === 'SUPPLIER_PAYABLE' ? 'SUPPLIER' : 'CUSTOMER',
      partyId: entry.targetId || 'OB-SYS',
      referenceType: 'ADJUSTMENT',
      referenceNumber: 'OB-' + Date.now().toString().slice(-6),
      description: `Opening Balance Authorization: ${entry.notes || entry.targetName}`,
      debit: entry.type === 'SUPPLIER_PAYABLE' ? 0 : entry.amount,
      credit: entry.type === 'SUPPLIER_PAYABLE' ? entry.amount : 0,
      runningBalance: entry.amount
    };
    setLedgerEntries(prev => [newLedger, ...prev]);

    logAction('ACCOUNTING', 'OPENING_BALANCE_RECORDED', newEntry.id, `Super Admin authorized opening balance of ৳${entry.amount.toLocaleString()} for ${entry.targetName} (${entry.type}).`);
    addToast('success', 'Opening Balance Posted', `৳${entry.amount.toLocaleString()} posted to ${entry.targetName}.`);

    // Persist opening balance to central SQLite database
    api.accounting.recordOpeningBalance(entry).catch(err => console.error('Failed to sync opening balance to database:', err));

    return { success: true };
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    addToast('success', 'Settings Updated', 'System configuration has been saved successfully.');
    logAction('SETTINGS', 'UPDATE_SETTINGS', 'GLOBAL', 'Updated system preferences and templates.');

    // Persist to central SQLite database
    api.settings.updateSettings(newSettings).catch(err => console.error('Failed to sync settings to database:', err));
  };

    // -------------------------------------------------------------
  // BUSINESS RULE 1 & 2: POS SALE WITH SERIAL VALIDATION & EMI CREATION
  // -------------------------------------------------------------
  const createSale = async (
    saleData: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt'>,
    emiPlanConfig?: { planId: string; downPayment: number; durationMonths: number },
    paymentAccountId?: string
  ): Promise<{ success: boolean; sale?: Sale; error?: string }> => {
    // 1. Stock & Serial Number Validation
    for (const item of saleData.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.currentStock < item.quantity) {
        return { success: false, error: `Insufficient stock for ${prod.name}. Available: ${prod.currentStock}, Requested: ${item.quantity}` };
      }

      if (item.isSerialized) {
        if (item.serialNumbers.length !== item.quantity) {
          return { success: false, error: `Please select exactly ${item.quantity} serial number(s) for ${item.productName}.` };
        }
      }
    }

    try {
      const res = await api.sales.createSale(saleData, emiPlanConfig, paymentAccountId);
      if (!res || !res.success || !res.sale) {
        const err = (res as any)?.error || 'Sale transaction failed.';
        addToast('error', 'Sale Failed', err);
        return { success: false, error: err };
      }

      let completedSale: Sale = res.sale;
      if (!completedSale.items || !Array.isArray(completedSale.items) || completedSale.items.length === 0) {
        completedSale = {
          ...completedSale,
          items: (saleData.items as any[]) || [],
        };
      }
      if (!completedSale.payments) {
        completedSale = {
          ...completedSale,
          payments: (saleData.payments as any) || [],
        };
      }

      await refreshFromDatabase();

      const displayTotal = Number(completedSale.grandTotal || 0).toLocaleString();
      logAction('POS', 'CREATE_SALE', completedSale.invoiceNumber, `Created invoice ${completedSale.invoiceNumber} total ৳${displayTotal} for ${completedSale.customerName}`);
      addToast('success', 'Sale Completed!', `Invoice ${completedSale.invoiceNumber} generated successfully.`);

      return { success: true, sale: completedSale };
    } catch (err: any) {
      const errMsg = err.message || 'Error communicating with database during sale.';
      addToast('error', 'Sale Error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // BUSINESS RULE 5 & 6: EMI PAYMENT COLLECTION & INSTANT LEDGER UPDATE
  // -------------------------------------------------------------
  const collectEMIPayment = async (
    emiAccountId: string,
    installmentId: string,
    amount: number,
    penaltyAmount: number,
    paymentMethod: PaymentMethod,
    ref?: string,
    notes?: string,
    accountId?: string
  ): Promise<{ success: boolean; error?: string; receiptNumber?: string }> => {
    if (amount <= 0) {
      return { success: false, error: 'Collection amount must be greater than 0!' };
    }

    try {
      const res = await api.emi.collectPayment({
        emiAccountId,
        installmentId,
        amount,
        penaltyAmount,
        paymentMethod,
        ref,
        notes,
        accountId
      });

      if (!res || !res.success) {
        const err = (res as any)?.error || 'EMI collection failed.';
        addToast('error', 'Collection Failed', err);
        return { success: false, error: err };
      }

      const receiptNumber = res.receiptNumber || 'RCP-' + Date.now().toString().slice(-4);
      await refreshFromDatabase();

      logAction('EMI', 'COLLECT_PAYMENT', receiptNumber, `Collected ৳${amount.toLocaleString()} for EMI installment`);
      addToast('success', 'EMI Collected!', `Receipt ${receiptNumber} created.`);

      return { success: true, receiptNumber };
    } catch (err: any) {
      const errMsg = err.message || 'Error communicating with database during EMI collection.';
      addToast('error', 'Collection Error', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // PURCHASE & INVENTORY RESTOCKING (CENTRAL DATABASE TRANSACTIONS)
  // -------------------------------------------------------------
  const createPurchase = async (
    purchaseData: {
      supplierId: string;
      supplierName?: string;
      branchId: string;
      items: { productId: string; productName?: string; quantity: number; costPrice: number; serials?: string[]; serialNumbers?: string[] }[];
      subtotal?: number;
      total?: number;
      paidAmount: number;
      dueAmount?: number;
      paymentMethod: string;
      notes?: string;
      depositAccountId?: string;
    }
  ): Promise<{ success: boolean; error?: string; purchase?: Purchase }> => {
    try {
      const res = await api.purchases.createPurchase(purchaseData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to record purchase.';
        addToast('error', 'Purchase Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      const invoiceNumber = res.purchase?.invoiceNumber || '';
      logAction('PURCHASE', 'CREATE_PURCHASE', invoiceNumber, `Recorded purchase from supplier. Total: ৳${(res.purchase?.total || 0).toLocaleString()}`);
      addToast('success', 'Purchase Recorded', `Inventory increased and purchase bill ${invoiceNumber} created.`);
      return { success: true, purchase: res.purchase };
    } catch (err: any) {
      const errMsg = err.message || 'Database error processing purchase.';
      addToast('error', 'Purchase Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // SUPPLIER PAYMENT & LEDGER OUTFLOW
  // -------------------------------------------------------------
  const recordSupplierPayment = async (
    supplierId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    accountId?: string,
    reference?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (amount <= 0) return { success: false, error: 'Payment amount must be greater than 0' };

    try {
      const res = await api.suppliers.recordPayment(supplierId, { amount, paymentMethod, accountId, reference, notes });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Supplier payment failed.';
        addToast('error', 'Payment Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      logAction('PURCHASE', 'SUPPLIER_PAYMENT', supplierId, `Paid ৳${amount.toLocaleString()} to supplier via ${paymentMethod}`);
      addToast('success', 'Payment Recorded', `Payment of ৳${amount.toLocaleString()} recorded and ledger reconciled.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error recording supplier payment.';
      addToast('error', 'Payment Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // CONTROLLED PRODUCT RETURN & REVERSAL ENGINE
  // -------------------------------------------------------------
  const recordReturn = async (
    returnData: Omit<ProductReturn, 'id' | 'returnNumber' | 'createdAt' | 'handledBy'>
  ): Promise<{ success: boolean; error?: string; returnRecord?: ProductReturn }> => {
    try {
      const res = await api.returns.createReturn(returnData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to process return.';
        addToast('error', 'Return Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      logAction('POS', 'PROCESS_RETURN', returnData.saleInvoiceId, `Processed product return for invoice ${returnData.saleInvoiceId} (৳${returnData.totalRefundAmount})`);
      addToast('success', 'Return Processed', 'Product return processed and balances reconciled.');
      return { success: true, returnRecord: res.data };
    } catch (err: any) {
      const errMsg = err.message || 'Error processing return on database.';
      addToast('error', 'Return Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // CUSTOMER DUE COLLECTION (CASH INFLOW)
  // -------------------------------------------------------------
  const collectCustomerDue = async (
    customerId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    accountId?: string,
    reference?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string; receiptNumber?: string }> => {
    if (amount <= 0) return { success: false, error: 'Payment amount must be greater than 0' };

    try {
      const res = await api.customers.collectDue(customerId, { amount, paymentMethod, accountId, reference, notes });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Customer due collection failed.';
        addToast('error', 'Collection Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      const receiptNumber = (res as any)?.data?.receiptNumber || '';
      logAction('CUSTOMER', 'DUE_COLLECTED', customerId, `Collected ৳${amount.toLocaleString()} due via ${paymentMethod}. Receipt: ${receiptNumber}`);
      addToast('success', 'Due Payment Collected', `Received ৳${amount.toLocaleString()} from customer. Receipt #${receiptNumber}`);
      return { success: true, receiptNumber };
    } catch (err: any) {
      const errMsg = err.message || 'Error collecting customer due.';
      addToast('error', 'Collection Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // SUPER ADMIN CASH ADJUSTMENTS
  // -------------------------------------------------------------
  const recordCashAdjustment = async (
    adjustmentData: {
      amount: number;
      type: 'INFLOW' | 'OUTFLOW';
      reason: string;
      accountId?: string;
      paymentMethod?: string;
      reference?: string;
      notes?: string;
      branchId?: string;
    }
  ): Promise<{ success: boolean; error?: string; adjustment?: CashAdjustment }> => {
    try {
      const res = await api.cashManagement.createAdjustment(adjustmentData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Cash adjustment failed.';
        addToast('error', 'Adjustment Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      const adj = (res as any)?.data;
      logAction('ACCOUNTING', 'CASH_ADJUSTMENT', adj?.id || 'main', `Adjusted cash: ${adjustmentData.type} ৳${adjustmentData.amount.toLocaleString()} (${adjustmentData.reason})`);
      addToast('success', 'Cash Adjustment Applied', `Adjusted ৳${adjustmentData.amount.toLocaleString()} [${adjustmentData.type}] successfully.`);
      return { success: true, adjustment: adj };
    } catch (err: any) {
      const errMsg = err.message || 'Error executing cash adjustment.';
      addToast('error', 'Adjustment Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // INVESTMENT & CAPITAL INFLOW (NON-REVENUE)
  // -------------------------------------------------------------
  const recordInvestment = async (
    investmentData: Omit<Investment, 'id' | 'referenceNumber' | 'createdAt' | 'createdBy'> & {
      investorPhone?: string;
      investorEmail?: string;
      investorNid?: string;
      investorAddress?: string;
      sharePercentage?: number;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.accounting.recordInvestment(investmentData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to record investment.';
        addToast('error', 'Investment Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      logAction('ACCOUNTING', 'RECORD_INVESTMENT', investmentData.depositAccountId, `Recorded ৳${investmentData.amount.toLocaleString()} investment from ${investmentData.investorName}`);
      addToast('success', 'Capital Inflow Recorded', `Investment of ৳${investmentData.amount.toLocaleString()} from ${investmentData.investorName} deposited.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error recording investment.';
      addToast('error', 'Investment Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // INTER-ACCOUNT FUND TRANSFERS
  // -------------------------------------------------------------
  const transferFunds = async (
    fromAccountId: string,
    toAccountId: string,
    amount: number,
    fee: number = 0,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.accounting.transferFunds({ fromAccountId, toAccountId, amount, fee, notes });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Transfer failed.';
        addToast('error', 'Transfer Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      logAction('ACCOUNTING', 'TRANSFER_FUNDS', `${fromAccountId} -> ${toAccountId}`, `Transferred ৳${amount.toLocaleString()} (Fee: ৳${fee})`);
      addToast('success', 'Transfer Completed', `৳${amount.toLocaleString()} successfully transferred.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error executing fund transfer.';
      addToast('error', 'Transfer Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // OTHER INCOME (NON-PRODUCT REVENUE)
  // -------------------------------------------------------------
  const recordOtherIncome = async (incomeData: {
    category: string;
    amount: number;
    date: string;
    accountId?: string;
    paymentMethod?: string;
    reference?: string;
    description: string;
    receivedFrom?: string;
    branchId?: string;
  }): Promise<{ success: boolean; error?: string; income?: OtherIncome }> => {
    try {
      const res = await api.accounting.recordOtherIncome(incomeData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to record other income.';
        addToast('error', 'Income Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      const income = (res as any).data;
      logAction('ACCOUNTING', 'OTHER_INCOME', income?.id || 'income', `Recorded other income: ৳${Number(incomeData.amount).toLocaleString()} (${incomeData.category})`);
      addToast('success', 'Other Income Recorded', `৳${Number(incomeData.amount).toLocaleString()} added to account balance.`);
      return { success: true, income };
    } catch (err: any) {
      const errMsg = err.message || 'Error recording other income.';
      addToast('error', 'Income Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // OWNER WITHDRAWAL (EQUITY REDUCTION)
  // -------------------------------------------------------------
  const recordOwnerWithdrawal = async (withdrawalData: {
    ownerName: string;
    amount: number;
    date: string;
    sourceAccountId?: string;
    paymentMethod?: string;
    reference?: string;
    purpose?: string;
  }): Promise<{ success: boolean; error?: string; withdrawal?: OwnerWithdrawal }> => {
    try {
      const res = await api.accounting.recordWithdrawal(withdrawalData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to record withdrawal.';
        addToast('error', 'Withdrawal Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      const withdrawal = (res as any).data;
      logAction('ACCOUNTING', 'OWNER_WITHDRAWAL', withdrawal?.id || 'withdrawal', `Owner withdrawal: ৳${Number(withdrawalData.amount).toLocaleString()} by ${withdrawalData.ownerName}`);
      addToast('success', 'Withdrawal Recorded', `৳${Number(withdrawalData.amount).toLocaleString()} deducted from account.`);
      return { success: true, withdrawal };
    } catch (err: any) {
      const errMsg = err.message || 'Error recording withdrawal.';
      addToast('error', 'Withdrawal Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // CENTRAL FINANCIAL REVERSAL ENGINE
  // -------------------------------------------------------------
  const reverseTransaction = async (options: {
    transactionId?: string;
    referenceNumber?: string;
    reason: string;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.accounting.reverseTransaction({
        referenceNumber: options.referenceNumber || options.transactionId || '',
        reason: options.reason
      });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to reverse transaction.';
        addToast('error', 'Reversal Failed', err);
        return { success: false, error: err };
      }

      await refreshFromDatabase();
      logAction('ACCOUNTING', 'TRANSACTION_REVERSED', options.referenceNumber || options.transactionId || '', `Reversed transaction: ${options.reason}`);
      addToast('success', 'Transaction Reversed', 'Account balance restored and reversal logged.');
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error reversing transaction.';
      addToast('error', 'Reversal Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // EMPLOYEE ATTENDANCE & PAYROLL
  // -------------------------------------------------------------
  const recordAttendance = async (
    employeeId: string,
    status: AttendanceStatus,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, error: 'Employee not found' };

    const today = new Date().toISOString().split('T')[0];
    const existingIdx = attendance.findIndex(a => a.employeeId === employeeId && a.date === today);

    const record: AttendanceRecord = {
      id: existingIdx !== -1 ? attendance[existingIdx].id : 'att-' + Date.now(),
      employeeId,
      employeeName: emp.name,
      date: today,
      status,
      checkInTime: status === 'PRESENT' || status === 'LATE' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      notes
    };

    if (existingIdx !== -1) {
      setAttendance(prev => prev.map((a, i) => i === existingIdx ? record : a));
    } else {
      setAttendance(prev => [record, ...prev]);
    }

    addToast('info', 'Attendance Updated', `${emp.name} marked as ${status}`);
    return { success: true };
  };

  const disburseSalary = async (
    employeeId: string,
    month: string,
    paymentMethod: PaymentMethod,
    accountId?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return { success: false, error: 'Employee not found' };

    await createExpense({
      category: 'Salary',
      amount: emp.monthlySalary,
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      branchId: emp.branchId || selectedBranch.id,
      description: `Monthly salary disbursement for ${emp.name} (${emp.designation || emp.role}) - ${month}`
    });

    if (accountId) {
      setFinancialAccounts(prev => prev.map(a => a.id === accountId ? { ...a, balance: Math.max(0, a.balance - emp.monthlySalary) } : a));
    }

    logAction('ACCOUNTING', 'SALARY_DISBURSEMENT', emp.id, `Disbursed ৳${emp.monthlySalary.toLocaleString()} salary to ${emp.name}`);
    addToast('success', 'Salary Disbursed', `৳${emp.monthlySalary.toLocaleString()} paid to ${emp.name}`);
    return { success: true };
  };

  const createEmployee = async (empData: Omit<Employee, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + Date.now()
    };
    setEmployees(prev => [...prev, newEmp]);
    addToast('success', 'Employee Added', `${newEmp.name} registered.`);
    return { success: true };
  };

  const updateEmployee = async (emp: Employee): Promise<{ success: boolean; error?: string }> => {
    setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
    addToast('success', 'Employee Updated', 'Staff details saved.');
    return { success: true };
  };

  const createFinancialAccount = async (accountData: Omit<FinancialAccount, 'id'>): Promise<{ success: boolean; error?: string }> => {
    const newAcc: FinancialAccount = {
      ...accountData,
      id: 'acc-' + Date.now()
    };
    setFinancialAccounts(prev => [...prev, newAcc]);
    addToast('success', 'Account Added', `${newAcc.name} created.`);
    return { success: true };
  };

  const addBranch = async (branchData: Omit<Branch, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.addBranch(branchData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to add branch.';
        addToast('error', 'Branch Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'BRANCH_CREATED', res.branchId || '', `Configured branch/warehouse '${branchData.name}' (${branchData.code})`);
      addToast('success', 'Branch Added', `${branchData.name} configured successfully.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error configuring branch.';
      addToast('error', 'Branch Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateBranch = async (branchData: Branch): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.updateBranch(branchData.id, branchData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to update branch.';
        addToast('error', 'Branch Update Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'BRANCH_UPDATED', branchData.id, `Updated branch/warehouse '${branchData.name}' (${branchData.code})`);
      addToast('success', 'Branch Updated', `${branchData.name} updated successfully.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error updating branch.';
      addToast('error', 'Branch Update Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const deleteBranch = async (branchId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const targetBranch = branches.find(b => b.id === branchId);
      const res = await api.settings.deleteBranch(branchId);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to delete branch.';
        addToast('error', 'Branch Deletion Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      if (selectedBranchId === branchId) {
        const nextBranch = branches.find(b => b.id !== branchId);
        setSelectedBranchIdState(nextBranch?.id || '');
      }
      logAction('SETTINGS', 'BRANCH_DELETED', branchId, `Removed branch '${targetBranch?.name || branchId}'`);
      addToast('success', 'Branch Removed', `${targetBranch?.name || 'Branch'} was removed.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error deleting branch.';
      addToast('error', 'Branch Deletion Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Stock Adjustment
  const stockAdjustment = async (productId: string, branchId: string, quantityDiff: number, reason: string, serialNumbers?: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.products.stockAdjust({ productId, branchId, quantityDiff, reason, serialNumbers });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Stock adjustment failed.';
        addToast('error', 'Adjustment Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      const prod = products.find(p => p.id === productId);
      logAction('INVENTORY', 'STOCK_ADJUST', prod?.sku || productId, `Adjusted ${prod?.name || productId} by ${quantityDiff}. Reason: ${reason}`);
      addToast('info', 'Stock Adjusted', `Stock adjusted by ${quantityDiff > 0 ? '+' : ''}${quantityDiff}.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error adjusting stock on database.';
      addToast('error', 'Adjustment Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Multi-Branch Stock Transfer
  const stockTransfer = async (productId: string, fromBranchId: string, toBranchId: string, quantity: number, serialNumbers?: string[]): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.products.stockTransfer({ productId, fromBranchId, toBranchId, quantity, serialNumbers });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Stock transfer failed.';
        addToast('error', 'Transfer Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('INVENTORY', 'TRANSFER', productId, `Transferred ${quantity} units between branches.`);
      addToast('success', 'Stock Transferred', `${quantity} units transferred.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error transferring stock.';
      addToast('error', 'Transfer Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Product CRUD
  const createProduct = async (productData: Omit<Product, 'id' | 'createdAt'>, initialSerials?: string[]): Promise<{ success: boolean; error?: string; product?: Product; expense?: any }> => {
    try {
      const res = await api.products.createProduct(productData, initialSerials);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to create product.';
        addToast('error', 'Product Creation Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('INVENTORY', 'CREATE_PRODUCT', res.product?.sku || productData.sku, `Created product ${productData.name}`);
      if (res.expense) {
        addToast('success', 'Product & Expense Recorded', `${productData.name} registered. ৳${Number(res.expense.amount || 0).toLocaleString()} recorded under 'Purchase Expenses'.`);
      } else {
        addToast('success', 'Product Added', `${productData.name} added successfully.`);
      }
      return { success: true, product: res.product, expense: res.expense };
    } catch (err: any) {
      const errMsg = err.message || 'Error adding product to database.';
      addToast('error', 'Product Creation Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateProduct = async (productData: Product): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.products.updateProduct(productData.id, productData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to update product.';
        addToast('error', 'Product Update Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('INVENTORY', 'UPDATE_PRODUCT', productData.sku, `Updated details for ${productData.name}`);
      addToast('success', 'Product Updated', `${productData.name} saved.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error saving product changes.';
      addToast('error', 'Product Update Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Customer CRUD
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'currentBalance'>): Promise<{ success: boolean; error?: string; customer?: Customer }> => {
    try {
      const res = await api.customers.createCustomer(customerData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to create customer.';
        addToast('error', 'Customer Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('CUSTOMER', 'CREATE_CUSTOMER', res.customer?.customerId || '', `Added customer ${customerData.name} (${customerData.phone})`);
      addToast('success', 'Customer Added', `${customerData.name} registered.`);
      return { success: true, customer: res.customer };
    } catch (err: any) {
      const errMsg = err.message || 'Error creating customer on database.';
      addToast('error', 'Customer Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateCustomer = async (customer: Customer): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.customers.updateCustomer(customer.id, customer);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to update customer.';
        addToast('error', 'Customer Update Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('CUSTOMER', 'UPDATE_CUSTOMER', customer.customerId, `Updated info for ${customer.name}`);
      addToast('success', 'Customer Updated', 'Changes saved successfully.');
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error saving customer updates.';
      addToast('error', 'Customer Update Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Supplier CRUD
  const createSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'currentPayable'>): Promise<{ success: boolean; error?: string; supplier?: Supplier }> => {
    try {
      const res = await api.suppliers.createSupplier(supplierData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to create supplier.';
        addToast('error', 'Supplier Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('PURCHASE', 'CREATE_SUPPLIER', res.supplierId || '', `Registered supplier ${supplierData.name} (${supplierData.company})`);
      addToast('success', 'Supplier Added', `${supplierData.name} saved.`);
      return { success: true, supplier: { ...supplierData, id: res.supplierId, currentPayable: 0, createdAt: new Date().toISOString().split('T')[0] } };
    } catch (err: any) {
      const errMsg = err.message || 'Error creating supplier on database.';
      addToast('error', 'Supplier Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Service Management
  const createServiceJob = async (jobData: Omit<ServiceJob, 'id' | 'jobCardNumber' | 'createdAt' | 'partsUsed' | 'totalBill' | 'paymentStatus'>): Promise<{ success: boolean; error?: string; job?: ServiceJob }> => {
    try {
      const res = await api.services.createService(jobData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to create service job.';
        addToast('error', 'Service Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      const cardNum = res.jobCardNumber || '';
      logAction('SERVICE', 'CREATE_JOB', cardNum, `Created service job ${cardNum} for ${jobData.customerName}`);
      addToast('success', 'Job Card Created', `${cardNum} assigned.`);
      return { success: true, job: { ...jobData, id: res.jobId, jobCardNumber: cardNum, partsUsed: [], totalBill: jobData.laborCost || 0, paymentStatus: 'UNPAID', createdAt: new Date().toISOString().split('T')[0] } };
    } catch (err: any) {
      const errMsg = err.message || 'Error creating service job.';
      addToast('error', 'Service Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const updateServiceStatus = async (
    jobId: string,
    status: ServiceJob['status'],
    partsUsed?: ServiceJob['partsUsed'],
    laborCost?: number,
    paymentStatus?: 'UNPAID' | 'PAID',
    paymentMethod?: PaymentMethod
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.services.updateService(jobId, { status, partsUsed, laborCost, paymentStatus, paymentMethod });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to update service.';
        addToast('error', 'Service Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      addToast('info', 'Service Updated', `Status updated to ${status}`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error updating service status.';
      addToast('error', 'Service Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Expense Management
  const createExpense = async (expenseData: Omit<Expense, 'id' | 'voucherNumber' | 'createdAt' | 'createdBy'>): Promise<{ success: boolean; error?: string; expense?: Expense }> => {
    try {
      const res = await api.expenses.createExpense(expenseData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to record expense.';
        addToast('error', 'Expense Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('ACCOUNTING', 'CREATE_EXPENSE', expenseData.category, `Recorded ${expenseData.category} expense of ৳${expenseData.amount.toLocaleString()}`);
      addToast('success', 'Expense Recorded', `Expense of ৳${expenseData.amount.toLocaleString()} registered.`);
      return { success: true, expense: res.data };
    } catch (err: any) {
      const errMsg = err.message || 'Error recording expense on database.';
      addToast('error', 'Expense Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Warranty
  const submitWarrantyClaim = async (claimData: Omit<WarrantyClaim, 'id' | 'claimNumber' | 'claimDate' | 'status'>): Promise<{ success: boolean; error?: string; claim?: WarrantyClaim }> => {
    try {
      const res = await api.warranty.createClaim(claimData);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to submit warranty claim.';
        addToast('error', 'Claim Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      const claimNum = res.claimNumber || '';
      addToast('info', 'Claim Submitted', `Warranty claim ${claimNum} logged.`);
      return { success: true, claim: { ...claimData, id: 'claim-' + Date.now(), claimNumber: claimNum, claimDate: new Date().toISOString().split('T')[0], status: 'PENDING' } };
    } catch (err: any) {
      const errMsg = err.message || 'Error submitting warranty claim.';
      addToast('error', 'Claim Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const resolveWarrantyClaim = async (claimId: string, status: WarrantyClaim['status'], notes: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.warranty.resolveClaim(claimId, { status, notes });
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to resolve warranty claim.';
        addToast('error', 'Claim Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      addToast('success', 'Claim Updated', `Claim marked as ${status}`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error resolving warranty claim.';
      addToast('error', 'Claim Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const saveEMIPlan = (plan: EMIPlan) => {
    api.emi.savePlan(plan).then(() => refreshFromDatabase()).catch(err => console.error('Failed to sync EMI plan to database:', err));
    addToast('success', 'Plan Saved', 'EMI Plan configuration updated on database.');
  };

  const saveEMIPlanWithVersioning = async (plan: EMIPlan, reason?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const existing = emiPlans.find(p => p.id === plan.id);
      const newVersion = existing ? ((existing.version || 1) + 1) : 1;
      const updatedPlan: EMIPlan = {
        ...plan,
        version: newVersion
      };

      const res = await api.emi.savePlan(updatedPlan);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to save EMI plan.';
        addToast('error', 'Plan Save Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('EMI', 'UPDATE_EMI_PLAN', plan.id, `Updated EMI Plan "${plan.name}" to Version ${newVersion}: ${reason || 'Plan terms modified'}`);
      addToast('success', 'EMI Plan Versioned', `Plan "${plan.name}" updated to v${newVersion}. Existing active contracts preserved.`);
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error saving EMI plan.';
      addToast('error', 'Plan Save Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const deleteEMIPlan = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.emi.deletePlan(id);
      if (!res || !res.success) {
        const err = (res as any)?.error || 'Failed to archive EMI plan.';
        addToast('error', 'Plan Archive Failed', err);
        return { success: false, error: err };
      }
      await refreshFromDatabase();
      logAction('EMI', 'DELETE_EMI_PLAN', id, `Archived EMI Plan ID: ${id}`);
      addToast('success', 'Plan Archived', 'EMI Plan has been deactivated.');
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error archiving plan.';
      addToast('error', 'Plan Archive Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  const resetEMIPlansToDefaults = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.emi.getPlans({ reset: true });
      if (!res || !res.success) {
        throw new Error('Failed to reset default plans');
      }
      await refreshFromDatabase();
      addToast('success', 'Default Plans Restored', 'Standard 3M, 6M, 9M, and 12M plans loaded.');
      return { success: true };
    } catch (err: any) {
      const errMsg = err.message || 'Error restoring plans.';
      addToast('error', 'Reset Failed', errMsg);
      return { success: false, error: errMsg };
    }
  };

  // -------------------------------------------------------------
  // SUPER ADMIN SYSTEM CONTROL CENTER IMPLEMENTATION
  // -------------------------------------------------------------
  const saveCategoryConfig = async (cat: ProductCategoryConfig): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.saveCategory(cat);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save category.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_CATEGORY', cat.id, `Configured product category: ${cat.name}`);
      addToast('success', 'Category Saved', `Category "${cat.name}" has been configured.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteCategoryConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const cat = categoriesConfig.find(c => c.id === id);
      const res = await api.settings.deleteCategory(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete category.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_CATEGORY', id, `Deleted category: ${cat?.name}`);
      addToast('info', 'Category Removed', `Category "${cat?.name}" deleted.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveBrandConfig = async (brand: BrandConfig): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.saveBrand(brand);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save brand.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_BRAND', brand.id, `Configured brand: ${brand.name}`);
      addToast('success', 'Brand Saved', `Brand "${brand.name}" updated.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteBrandConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const b = brandsConfig.find(x => x.id === id);
      const res = await api.settings.deleteBrand(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete brand.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_BRAND', id, `Deleted brand: ${b?.name}`);
      addToast('info', 'Brand Removed', `Brand "${b?.name}" deleted.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const savePaymentMethodConfig = async (pm: ConfigurablePaymentMethod): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.savePaymentMethod(pm);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save payment method.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_PAYMENT_METHOD', pm.id, `Configured payment method: ${pm.name}`);
      addToast('success', 'Payment Method Saved', `Payment method "${pm.name}" saved.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deletePaymentMethodConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const pm = paymentMethodsConfig.find(p => p.id === id);
      const res = await api.settings.deletePaymentMethod(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete payment method.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_PAYMENT_METHOD', id, `Deleted payment method: ${pm?.name}`);
      addToast('info', 'Payment Method Removed', `Payment method "${pm?.name}" deleted.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveExpenseCategoryConfig = async (cat: ExpenseCategoryConfig): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.saveExpenseCategory(cat);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save expense category.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_EXPENSE_CATEGORY', cat.id, `Configured expense category: ${cat.name}`);
      addToast('success', 'Expense Category Saved', `Saved "${cat.name}".`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteExpenseCategoryConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.deleteExpenseCategory(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete expense category.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_EXPENSE_CATEGORY', id, 'Deleted expense category');
      addToast('info', 'Expense Category Removed', 'Category removed.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveServiceCategoryConfig = async (sc: ServiceCategoryConfig): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.saveServiceCategory(sc);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save service category.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_SERVICE_CATEGORY', sc.id, `Configured service category: ${sc.name}`);
      addToast('success', 'Service Category Saved', `Saved "${sc.name}".`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteServiceCategoryConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.deleteServiceCategory(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete service category.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_SERVICE_CATEGORY', id, 'Deleted service category');
      addToast('info', 'Service Category Removed', 'Service category removed.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveWarrantyRuleConfig = async (wr: WarrantyRuleConfig): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.saveWarrantyRule(wr);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save warranty rule.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_WARRANTY_RULE', wr.id, `Configured warranty rule for: ${wr.categoryName}`);
      addToast('success', 'Warranty Rule Saved', `Updated "${wr.categoryName}".`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteWarrantyRuleConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.deleteWarrantyRule(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete warranty rule.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_WARRANTY_RULE', id, 'Deleted warranty rule');
      addToast('info', 'Warranty Rule Removed', 'Rule deleted.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const saveNotificationTemplateConfig = async (tpl: DynamicNotificationTemplate): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.saveNotificationTemplate(tpl);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to save notification template.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'SAVE_NOTIFICATION_TEMPLATE', tpl.id, `Configured notification template: ${tpl.name}`);
      addToast('success', 'Template Saved', `Template "${tpl.name}" updated.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteNotificationTemplateConfig = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.settings.deleteNotificationTemplate(id);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Failed to delete notification template.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'DELETE_NOTIFICATION_TEMPLATE', id, 'Deleted notification template');
      addToast('info', 'Template Removed', 'Notification template removed.');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updatePosSettings = async (updates: Partial<PosSettings>): Promise<void> => {
    try {
      await api.settings.updatePosSettings(updates);
      await refreshFromDatabase();
      logAction('SETTINGS', 'UPDATE_POS_SETTINGS', 'pos-settings', 'POS and Invoicing configuration updated');
      addToast('success', 'POS Settings Updated', 'POS rules successfully saved to database.');
    } catch (err: any) {
      addToast('error', 'POS Settings Failed', err.message);
    }
  };

  const updateInventoryRules = async (updates: Partial<InventoryRules>): Promise<void> => {
    try {
      await api.settings.updateInventoryRules(updates);
      await refreshFromDatabase();
      logAction('SETTINGS', 'UPDATE_INVENTORY_RULES', 'inv-rules', 'Inventory rules and serial number tracking updated');
      addToast('success', 'Inventory Rules Updated', 'Stock rules successfully saved to database.');
    } catch (err: any) {
      addToast('error', 'Inventory Rules Failed', err.message);
    }
  };

  const updateProductPrice = async (productId: string, updates: { retailPrice?: number; emiPrice?: number; wholesalePrice?: number; purchasePrice?: number; costPrice?: number }, reason: string): Promise<{ success: boolean; error?: string }> => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };

    try {
      const res = await api.products.updatePrice(productId, updates, reason);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Price update failed.' };
      }
      await refreshFromDatabase();
      logAction('SETTINGS', 'UPDATE_PRICE', prod.id, `Price update for ${prod.name} (${prod.sku}): ${reason}`);
      addToast('success', 'Price Updated', `Price updated with immutable audit log.`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const mergeCustomers = async (sourceCustomerId: string, targetCustomerId: string, reason: string): Promise<{ success: boolean; error?: string; audit?: CustomerMergeAudit }> => {
    if (sourceCustomerId === targetCustomerId) {
      return { success: false, error: 'Source and target customer cannot be the same.' };
    }
    const source = customers.find(c => c.id === sourceCustomerId);
    const target = customers.find(c => c.id === targetCustomerId);
    if (!source || !target) {
      return { success: false, error: 'Source or target customer not found.' };
    }

    try {
      const res = await api.customers.mergeCustomers(sourceCustomerId, targetCustomerId, reason);
      if (!res || !res.success) {
        return { success: false, error: (res as any)?.error || 'Customer merge failed.' };
      }
      await refreshFromDatabase();
      logAction('CUSTOMER', 'MERGE_CUSTOMERS', target.id, `Merged customer ${source.name} (${source.phone}) into ${target.name}.`);
      addToast('success', 'Customers Merged', `Successfully merged ${source.name} into ${target.name}.`);
      return { success: true, audit: res.data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  // -------------------------------------------------------------
  // SUPER ADMIN MASTER CRUD & OMNIPOTENT OVERRIDE HANDLERS
  // -------------------------------------------------------------
  const updateSale = async (saleId: string, updates: Partial<Sale>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.sales.updateSale(saleId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update sale.');
      await refreshFromDatabase();
      logAction('POS', 'SUPER_ADMIN_UPDATE_SALE', saleId, `Updated sale ${updates.invoiceNumber || saleId}`);
      addToast('success', 'Sale Updated', `Sale ${updates.invoiceNumber || ''} updated successfully.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteSale = async (saleId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const s = sales.find(x => x.id === saleId);
      const res = await api.sales.deleteSale(saleId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete sale.');
      await refreshFromDatabase();
      logAction('POS', 'SUPER_ADMIN_DELETE_SALE', saleId, `Deleted sale ${s?.invoiceNumber || saleId}`);
      addToast('info', 'Sale Deleted', `Sale ${s?.invoiceNumber || saleId} permanently removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const recordInvoicePayment = async (
    invoiceId: string,
    paymentData: { amount: number; paymentMethod: PaymentMethod; accountId?: string; reference?: string; notes?: string }
  ): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const res = await api.sales.recordPayment(invoiceId, paymentData);
      if (!res || !res.success) {
        throw new Error((res as any)?.error || 'Failed to record invoice payment.');
      }
      await refreshFromDatabase();
      const s = sales.find(x => x.id === invoiceId || x.invoiceNumber === invoiceId);
      logAction('POS', 'INVOICE_PAYMENT_RECORDED', invoiceId, `Recorded payment ৳${paymentData.amount.toLocaleString()} for invoice ${s?.invoiceNumber || invoiceId}`);
      addToast('success', 'Payment Recorded', `Payment of ৳${paymentData.amount.toLocaleString()} recorded successfully.`);
      return { success: true, data: res.data };
    } catch (err: any) {
      addToast('error', 'Payment Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateEMIAccount = async (accountId: string, updates: Partial<EMIAccount>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.emi.updateAccount(accountId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update EMI account.');
      await refreshFromDatabase();
      const emiNum = updates.emiNumber || accountId;
      logAction('EMI', 'SUPER_ADMIN_UPDATE_EMI', accountId, `Updated EMI Account ${emiNum}`);
      addToast('success', 'EMI Account Updated', `EMI Account ${emiNum} updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteEMIAccount = async (accountId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const a = emiAccounts.find(x => x.id === accountId);
      const res = await api.emi.deleteAccount(accountId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete EMI account.');
      await refreshFromDatabase();
      const emiNum = a?.emiNumber || accountId;
      logAction('EMI', 'SUPER_ADMIN_DELETE_EMI', accountId, `Deleted EMI Account ${emiNum}`);
      addToast('info', 'EMI Account Deleted', `EMI Account ${emiNum} removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteProduct = async (productId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const p = products.find(x => x.id === productId);
      const res = await api.products.deleteProduct(productId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete product.');
      await refreshFromDatabase();
      logAction('INVENTORY', 'SUPER_ADMIN_DELETE_PRODUCT', productId, `Deleted product ${p?.name || productId}`);
      addToast('info', 'Product Deleted', `Product ${p?.name || productId} removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteCustomer = async (customerId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const c = customers.find(x => x.id === customerId);
      const res = await api.customers.deleteCustomer(customerId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete customer.');
      await refreshFromDatabase();
      logAction('CUSTOMER', 'SUPER_ADMIN_DELETE_CUSTOMER', customerId, `Deleted customer ${c?.name || customerId}`);
      addToast('info', 'Customer Deleted', `Customer ${c?.name || customerId} removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateSupplier = async (supplierId: string, updates: Partial<Supplier>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.suppliers.updateSupplier(supplierId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update supplier.');
      await refreshFromDatabase();
      logAction('PURCHASE', 'SUPER_ADMIN_UPDATE_SUPPLIER', supplierId, `Updated supplier ${updates.name || supplierId}`);
      addToast('success', 'Supplier Updated', `Supplier ${updates.name || ''} updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteSupplier = async (supplierId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const s = suppliers.find(x => x.id === supplierId);
      const res = await api.suppliers.deleteSupplier(supplierId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete supplier.');
      await refreshFromDatabase();
      logAction('PURCHASE', 'SUPER_ADMIN_DELETE_SUPPLIER', supplierId, `Deleted supplier ${s?.name || supplierId}`);
      addToast('info', 'Supplier Deleted', `Supplier ${s?.name || supplierId} removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updatePurchase = async (purchaseId: string, updates: Partial<Purchase>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.purchases.updatePurchase(purchaseId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update purchase.');
      await refreshFromDatabase();
      logAction('PURCHASE', 'SUPER_ADMIN_UPDATE_PURCHASE', purchaseId, `Updated purchase ${updates.invoiceNumber || purchaseId}`);
      addToast('success', 'Purchase Updated', `Purchase order updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deletePurchase = async (purchaseId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const p = purchases.find(x => x.id === purchaseId);
      const res = await api.purchases.deletePurchase(purchaseId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete purchase.');
      await refreshFromDatabase();
      logAction('PURCHASE', 'SUPER_ADMIN_DELETE_PURCHASE', purchaseId, `Deleted purchase ${p?.invoiceNumber || purchaseId}`);
      addToast('info', 'Purchase Deleted', `Purchase order removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateReturn = async (returnId: string, updates: Partial<ProductReturn>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.returns.updateReturn(returnId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update return.');
      await refreshFromDatabase();
      logAction('POS', 'SUPER_ADMIN_UPDATE_RETURN', returnId, `Updated return ${updates.returnNumber || returnId}`);
      addToast('success', 'Return Updated', `Return record updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteReturn = async (returnId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const r = returns.find(x => x.id === returnId);
      const res = await api.returns.deleteReturn(returnId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete return.');
      await refreshFromDatabase();
      logAction('POS', 'SUPER_ADMIN_DELETE_RETURN', returnId, `Deleted return ${r?.returnNumber || returnId}`);
      addToast('info', 'Return Deleted', `Return record removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateExpense = async (expenseId: string, updates: Partial<Expense>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.expenses.updateExpense(expenseId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update expense.');
      await refreshFromDatabase();
      logAction('ACCOUNTING', 'SUPER_ADMIN_UPDATE_EXPENSE', expenseId, `Updated expense ${updates.voucherNumber || expenseId}`);
      addToast('success', 'Expense Updated', `Expense voucher updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteExpense = async (expenseId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const e = expenses.find(x => x.id === expenseId);
      const res = await api.expenses.deleteExpense(expenseId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete expense.');
      await refreshFromDatabase();
      logAction('ACCOUNTING', 'SUPER_ADMIN_DELETE_EXPENSE', expenseId, `Deleted expense ${e?.voucherNumber || expenseId}`);
      addToast('info', 'Expense Deleted', `Expense voucher removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateServiceJob = async (jobId: string, updates: Partial<ServiceJob>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.services.updateService(jobId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update service job.');
      await refreshFromDatabase();
      logAction('SERVICE', 'SUPER_ADMIN_UPDATE_SERVICE', jobId, `Updated service job ${updates.jobCardNumber || jobId}`);
      addToast('success', 'Service Job Updated', `Service job updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteServiceJob = async (jobId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const j = services.find(x => x.id === jobId);
      const res = await api.services.deleteService(jobId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete service job.');
      await refreshFromDatabase();
      logAction('SERVICE', 'SUPER_ADMIN_DELETE_SERVICE', jobId, `Deleted service job ${j?.jobCardNumber || jobId}`);
      addToast('info', 'Service Job Deleted', `Service job removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const updateWarrantyClaim = async (claimId: string, updates: Partial<WarrantyClaim>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.warranty.resolveClaim(claimId, updates);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to update warranty claim.');
      await refreshFromDatabase();
      logAction('SERVICE', 'SUPER_ADMIN_UPDATE_WARRANTY', claimId, `Updated warranty claim ${updates.claimNumber || claimId}`);
      addToast('success', 'Claim Updated', `Warranty claim updated.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Update Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteWarrantyClaim = async (claimId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const c = warrantyClaims.find(x => x.id === claimId);
      const res = await api.warranty.deleteClaim(claimId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete warranty claim.');
      await refreshFromDatabase();
      logAction('SERVICE', 'SUPER_ADMIN_DELETE_WARRANTY', claimId, `Deleted warranty claim ${c?.claimNumber || claimId}`);
      addToast('info', 'Claim Deleted', `Warranty claim removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteEmployee = async (employeeId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const u = users.find(x => x.id === employeeId || x.employeeId === employeeId);
      const targetId = u ? u.id : employeeId;
      const res = await api.auth.deleteUser(targetId);
      if (!res || !res.success) throw new Error((res as any)?.error || 'Failed to delete user.');
      await refreshFromDatabase();
      logAction('SETTINGS', 'SUPER_ADMIN_DELETE_USER', targetId, `Deleted user ${u?.name || targetId}`);
      addToast('info', 'User Deleted', `User ${u?.name || targetId} removed.`);
      return { success: true };
    } catch (err: any) {
      addToast('error', 'Delete Failed', err.message);
      return { success: false, error: err.message };
    }
  };

  const exportDatabase = () => exportAllDataJSON();

  const importDatabase = (json: string) => {
    const ok = importAllDataJSON(json);
    if (ok) {
      window.location.reload();
      return true;
    }
    return false;
  };

  return (
    <ERPContext.Provider
      value={{
        isAuthenticated: authSession.isAuthenticated,
        isLocked: authSession.isLocked,
        login,
        logout,
        lockSession,
        unlockSession,
        changePassword,
        hasPermission,
        refreshFromDatabase,
        refreshSales,
        settings,
        updateSettings,
        branches,
        selectedBranch,
        setSelectedBranchId: setSelectedBranchIdState,
        addBranch,
        updateBranch,
        deleteBranch,
        currentUser,
        setCurrentUserId: setCurrentUserIdState,
        users,
        roles,
        permissionsList,
        createRole,
        updateRole,
        deleteRole,
        createUser,
        updateUser,
        setUserStatus,
        resetUserPassword,
        revokeUserSessions,
        setupStatus,
        updateSetupStatus,
        completeInitialSetup,
        openingBalances,
        recordOpeningBalance,
        products,
        serials,
        suppliers,
        customers,
        sales,
        purchases,
        returns,
        investments,
        financialAccounts,
        employees,
        attendance,
        emiPlans,
        emiAccounts,
        emiPayments,
        technicians,
        services,
        expenses,
        auditLogs,
        inventoryTransactions,
        ledgerEntries,
        warrantyClaims,
        otherIncomes,
        ownerWithdrawals,
        toasts,
        addToast,
        removeToast,
        activeInvoiceToPrint,
        setActiveInvoiceToPrint,
        activeEmiAgreementToPrint,
        setActiveEmiAgreementToPrint,
        activeThermalReceiptToPrint,
        setActiveThermalReceiptToPrint,
        activeBarcodeToPrint,
        setActiveBarcodeToPrint,
        createSale,
        collectEMIPayment,
        createProduct,
        updateProduct,
        createPurchase,
        recordSupplierPayment,
        recordReturn,
        collectCustomerDue,
        recordCashAdjustment,
        recordInvestment,
        transferFunds,
        recordOtherIncome,
        recordOwnerWithdrawal,
        reverseTransaction,
        recordAttendance,
        disburseSalary,
        createEmployee,
        updateEmployee,
        createFinancialAccount,
        stockAdjustment,
        stockTransfer,
        createCustomer,
        updateCustomer,
        createSupplier,
        createServiceJob,
        updateServiceStatus,
        createExpense,
        submitWarrantyClaim,
        resolveWarrantyClaim,
        saveEMIPlan,
        saveEMIPlanWithVersioning,
        deleteEMIPlan,
        resetEMIPlansToDefaults,
        categoriesConfig,
        saveCategoryConfig,
        deleteCategoryConfig,
        brandsConfig,
        saveBrandConfig,
        deleteBrandConfig,
        paymentMethodsConfig,
        savePaymentMethodConfig,
        deletePaymentMethodConfig,
        expenseCategoriesConfig,
        saveExpenseCategoryConfig,
        deleteExpenseCategoryConfig,
        serviceCategoriesConfig,
        saveServiceCategoryConfig,
        deleteServiceCategoryConfig,
        warrantyRulesConfig,
        saveWarrantyRuleConfig,
        deleteWarrantyRuleConfig,
        notificationTemplatesConfig,
        saveNotificationTemplateConfig,
        deleteNotificationTemplateConfig,
        priceAuditLog,
        updateProductPrice,
        customerMergeAudit,
        mergeCustomers,
        posSettings,
        updatePosSettings,
        inventoryRules,
        updateInventoryRules,
        updateSale,
        deleteSale,
        recordInvoicePayment,
        updateEMIAccount,
        deleteEMIAccount,
        deleteProduct,
        deleteCustomer,
        updateSupplier,
        deleteSupplier,
        updatePurchase,
        deletePurchase,
        updateReturn,
        deleteReturn,
        updateExpense,
        deleteExpense,
        updateServiceJob,
        deleteServiceJob,
        updateWarrantyClaim,
        deleteWarrantyClaim,
        deleteEmployee,
        exportDatabase,
        importDatabase
      }}
    >
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
