// NEED ELECTRO ERP - Comprehensive Type Definitions

export type BranchCode = 'DHK-MAIN' | 'CTG-01' | 'CENTRAL-WH';

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  isWarehouse: boolean;
  active: boolean;
}

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'SALES' 
  | 'ACCOUNTANT' 
  | 'INVENTORY' 
  | 'TECHNICIAN' 
  | 'ELECTRICIAN'
  | string;

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: UserRole;
  roleId?: string;
  branchId: string;
  primaryBranchId?: string;
  allowedBranchIds?: string[];
  phone: string;
  password?: string;
  passwordHash?: string;
  employeeId?: string;
  avatar?: string;
  active: boolean;
  status: AccountStatus;
  mustChangePassword?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
  isActive: boolean;
}

export interface Permission {
  id: string;
  module: string;
  action: string;
  label: string;
  description: string;
  isSensitive: boolean;
}

export interface SetupStatus {
  isSuperAdminConfigured: boolean;
  isCompanyConfigured: boolean;
  isMainBranchConfigured: boolean;
  isWarehouseConfigured: boolean;
  isFinancialAccountsConfigured: boolean;
  isPaymentMethodsConfigured: boolean;
  isEmiPlansConfigured: boolean;
  isInvoiceSettingsConfigured: boolean;
  isNotificationConfigured: boolean;
  isOpeningBalancesConfigured: boolean;
  initialSetupCompleted: boolean;
  systemMode: 'DEMO' | 'PRODUCTION';
}

export interface OpeningBalanceEntry {
  id: string;
  date: string;
  type: 'CASH' | 'BANK' | 'MOBILE_BANKING' | 'CUSTOMER_DUE' | 'SUPPLIER_PAYABLE' | 'STOCK';
  targetId: string;
  targetName: string;
  amount: number;
  notes?: string;
  approvedBy: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  token: string;
  loginTime: string;
  rememberMe: boolean;
  isLocked: boolean;
  systemMode?: 'DEMO' | 'PRODUCTION';
}

export type ProductCategory = 
  | 'Laptop'
  | 'Desktop'
  | 'Monitor'
  | 'Smartphone'
  | 'Tablet'
  | 'Printer'
  | 'CCTV'
  | 'Router'
  | 'Networking'
  | 'Computer Accessories'
  | 'Laptop Accessories'
  | 'Electrical Products'
  | 'Cables'
  | 'Chargers'
  | 'Adapters'
  | 'Other Gadgets';

export interface LaptopSpecifications {
  processor: string;
  ram: string;
  storage: string;
  display: string;
  gpu?: string;
  operatingSystem: string;
  batteryCondition: string; // e.g. "92% Health (4-5 hrs)"
  physicalCondition: string; // e.g. "Grade A+ pristine"
  generation: string; // e.g. "11th Gen"
  color: string;
}

export interface ElectricalSpecifications {
  voltageRating?: string;
  currentRating?: string;
  powerWattage?: string;
  cableGauge?: string;
  material?: string;
  electricalType?: string;
  phase?: string;
  warrantyPeriod?: string;
}

export interface CCTVSpecifications {
  resolution?: string;
  cameraType?: string;
  lens?: string;
  nightVision?: string;
  connectivity?: string;
  storageSupport?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  brand: string;
  model: string;
  description: string;
  imageUrl?: string;
  purchasePrice: number;
  costPrice: number;
  retailPrice: number;
  wholesalePrice: number;
  emiPrice: number;
  currentStock: number;
  minStock: number;
  supplierId: string;
  warrantyPeriodMonths: number;
  isSerialized: boolean;
  status: 'ACTIVE' | 'DISCONTINUED' | 'OUT_OF_STOCK';
  specs?: LaptopSpecifications | ElectricalSpecifications | CCTVSpecifications | Record<string, string>;
  createdAt: string;
}

export type SerialStatus = 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'DEFECTIVE' | 'RETURNED';

export interface SerialServiceRecord {
  date: string;
  serviceId: string;
  issue: string;
  resolution: string;
  technicianName: string;
}

export interface ProductSerial {
  id: string;
  serialNumber: string;
  productId: string;
  branchId: string;
  status: SerialStatus;
  purchaseId: string;
  purchaseDate: string;
  supplierId: string;
  purchaseCost: number;
  // Sale details if sold:
  saleInvoiceId?: string;
  saleDate?: string;
  customerId?: string;
  emiAccountId?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  serviceHistory: SerialServiceRecord[];
}

export type TransactionType = 
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'DAMAGE'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'SERVICE'
  | 'EXCHANGE';

export interface InventoryTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  type: TransactionType;
  productId: string;
  productName: string;
  branchId: string;
  fromBranchId?: string;
  toBranchId?: string;
  quantity: number; // positive or negative
  unitCost: number;
  totalValue: number;
  openingStock: number;
  closingStock: number;
  referenceType?: 'PURCHASE' | 'INVOICE' | 'RETURN' | 'TRANSFER' | 'ADJUSTMENT';
  referenceId?: string;
  serialNumbers?: string[];
  notes?: string;
  createdBy: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  openingBalance: number;
  currentPayable: number;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number;
  subtotal: number;
  serialNumbers: string[];
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  date: string;
  status: 'Draft' | 'Received' | 'Partially Paid' | 'Paid' | 'Cancelled';
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
}

export interface GuarantorDetails {
  name: string;
  relationship: string;
  phone: string;
  nid: string;
  address: string;
  occupation?: string;
}

export interface Customer {
  id: string;
  customerId: string; // e.g. "CUST-1001"
  name: string;
  phone: string;
  email?: string;
  address: string;
  nid: string; // National ID card (vital in Bangladesh for EMI)
  guarantor?: GuarantorDetails;
  customerPhoto?: string;
  creditLimit: number;
  currentBalance: number; // positive = owed by customer
  notes?: string;
  createdAt: string;
}

export type PaymentMethod = 
  | 'Cash'
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Bank Transfer'
  | 'Card'
  | 'Mixed Payment'
  | 'EMI';

export interface PaymentBreakdown {
  method: PaymentMethod;
  amount: number;
  transactionRef?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  warrantyMonths: number;
  isSerialized: boolean;
  serialNumbers: string[];
}

export interface Sale {
  id: string;
  invoiceNumber: string; // e.g. "INV-2026-0001"
  customerId: string;
  customerName: string;
  customerPhone: string;
  branchId: string;
  date: string;
  items: SaleItem[];
  subtotal: number;
  overallDiscount: number;
  vatAmount: number;
  vatPercent: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  payments: PaymentBreakdown[];
  saleType: 'REGULAR' | 'EMI';
  emiAccountId?: string;
  status: 'COMPLETED' | 'RETURNED' | 'VOID';
  salespersonId: string;
  salespersonName: string;
  notes?: string;
  createdAt: string;
}

// EMI Subsystem Types
export interface EMIPlan {
  id: string;
  name: string; // e.g. "6 Months Standard Tech"
  durationMonths: number; // 3, 6, 9, 12, 24
  minDownPaymentPercent: number; // e.g. 20%
  interestRatePercent: number; // e.g. 0% (0% interest) or 5%
  processingFee: number; // e.g. 500 BDT
  lateFeePerDay: number; // e.g. 50 BDT
  gracePeriodDays: number; // e.g. 5 days
  isActive: boolean;
  version?: number;
  description?: string;
  eligibilityRules?: string;
  termsText?: string;
}

export type EMIInstallmentStatus = 
  | 'UPCOMING'
  | 'DUE_TODAY'
  | 'PAID'
  | 'PARTIALLY_PAID'
  | 'OVERDUE'
  | 'WAIVED';

export interface EMIInstallment {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  penaltyAmount: number;
  paidAmount: number;
  paidDate?: string;
  status: EMIInstallmentStatus;
  receiptNumber?: string;
  paymentMethod?: PaymentMethod;
}

export interface EMIAccount {
  id: string;
  emiNumber: string; // e.g. "EMI-2026-001"
  saleInvoiceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerNid: string;
  guarantor?: GuarantorDetails;
  productId: string;
  productName: string;
  serialNumber: string;
  laptopPrice: number;
  downPayment: number;
  financedAmount: number;
  durationMonths: number;
  monthlyInstallment: number;
  totalPayable: number;
  totalPaid: number;
  remainingBalance: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'DEFAULTED' | 'SETTLED';
  installments: EMIInstallment[];
  contractTerms: string;
  approvedBy: string;
  createdAt: string;
}

export interface EMIPaymentRecord {
  id: string;
  receiptNumber: string; // e.g. "RCP-2026-001"
  emiAccountId: string;
  emiNumber: string;
  installmentId: string;
  installmentNumber: number;
  customerId: string;
  customerName: string;
  amount: number;
  penaltyPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  collectedBy: string;
  notes?: string;
}

export interface WarrantyClaim {
  id: string;
  claimNumber: string;
  serialNumber: string;
  productName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  invoiceNumber: string;
  issueDescription: string;
  claimDate: string;
  status: 'PENDING' | 'IN_INSPECTION' | 'APPROVED_REPAIR' | 'APPROVED_REPLACE' | 'REJECTED';
  resolutionNotes?: string;
  resolvedDate?: string;
}

export type ServiceType = 
  | 'Laptops, Computers, CCTV, Computer Accessories'
  | 'Complete electrical work of the house'
  | 'Safe and modern smart electric solutions'
  | 'CCTV camera installation and setup services'
  | 'Electrical Installation'
  | 'Electrical Repair'
  | 'Home Service'
  | 'Office Service'
  | 'CCTV Installation'
  | 'Networking'
  | 'Computer Service'
  | 'Laptop Service'
  | 'Maintenance';

export type ServiceStatus = 
  | 'Pending'
  | 'Assigned'
  | 'On The Way'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled';

export interface ServicePartUsed {
  productId: string;
  productName: string;
  serialNumber?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ServiceJob {
  id: string;
  jobCardNumber: string; // e.g. "JOB-2026-001"
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceType: ServiceType;
  deviceOrSite: string; // e.g. "Dell Latitude 7400" or "Office 3-Phase DB Board"
  serialNumber?: string;
  reportedIssue: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  status: ServiceStatus;
  partsUsed: ServicePartUsed[];
  laborCost: number;
  totalBill: number;
  paymentStatus: 'UNPAID' | 'PAID';
  paymentMethod?: PaymentMethod;
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  email: string;
  specialization: string[]; // e.g. ["Electrical Wiring", "Laptop Chip Level Repair", "CCTV"]
  activeJobsCount: number;
  completedJobsCount: number;
  totalEarnings: number;
  rating: number;
}

export type ExpenseCategory = 
  | 'Office Rent'
  | 'Electricity'
  | 'Transport'
  | 'Salary'
  | 'Marketing'
  | 'Purchase Expenses'
  | 'Service Expenses'
  | 'Office Supplies & Snacks'
  | 'Other';

export interface Expense {
  id: string;
  voucherNumber: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  branchId: string;
  description: string;
  attachmentName?: string;
  createdBy: string;
  createdAt: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  partyId: string;
  referenceType: 'INVOICE' | 'PAYMENT' | 'EMI' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT';
  referenceNumber: string;
  description: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: 'POS' | 'EMI' | 'INVENTORY' | 'PURCHASE' | 'CUSTOMER' | 'SERVICE' | 'ACCOUNTING' | 'SETTINGS';
  recordId: string;
  details: string;
  ipAddress?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  designation?: string;
  branchId: string;
  monthlySalary: number;
  salesCommissionRate: number; // e.g. 1.5%
  joinedDate: string;
  nid?: string;
  address?: string;
  emergencyContact?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
}

export interface SupplierPayment {
  id: string;
  voucherNumber: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  accountId?: string;
  reference?: string;
  notes?: string;
  paidBy: string;
}

export type ReturnType = 'CUSTOMER_RETURN' | 'DEFECTIVE_RMA' | 'WARRANTY' | 'EXCHANGE';

export interface ReturnItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  refundAmount: number;
  serialNumbers?: string[];
  condition: 'RESALEABLE' | 'DAMAGED' | 'UNDER_REPAIR';
}

export interface ProductReturn {
  id: string;
  returnNumber: string;
  date: string;
  saleInvoiceId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  returnType: ReturnType;
  reason: string;
  items: ReturnItem[];
  totalRefundAmount: number;
  refundMethod: PaymentMethod;
  accountId?: string;
  status: 'COMPLETED' | 'PENDING_INSPECTION' | 'REJECTED';
  handledBy: string;
  notes?: string;
  createdAt: string;
}

export type InvestmentType = 'EQUITY' | 'DIRECTOR_LOAN' | 'WORKING_CAPITAL' | 'OTHER';

export interface Investment {
  id: string;
  referenceNumber: string;
  investorName: string;
  amount: number;
  date: string;
  investmentType: InvestmentType;
  depositAccountId: string;
  paymentMethod: PaymentMethod;
  reference?: string;
  status: 'ACTIVE' | 'RETURNED' | 'CONVERTED';
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export type AccountType = 'CASH' | 'BANK' | 'MOBILE_BANKING';

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  accountNumber: string;
  bankName?: string;
  branchName?: string;
  balance: number;
  currency: string;
  isActive: boolean;
}

export interface FundTransfer {
  id: string;
  transferNumber: string;
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  fee: number;
  reference?: string;
  transferredBy: string;
  notes?: string;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ON_LEAVE' | 'ABSENT';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

export interface SystemSettings {
  companyName: string;
  companyTagline: string;
  sisterConcern: string;
  mainBranchName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  vatRegistrationNo: string;
  invoicePrefix: string;
  emiPrefix: string;
  defaultVatPercent: number;
  currencySymbol: string;
  currencyCode: string;
  enableSmsNotifications: boolean;
  enableWhatsappNotifications: boolean;
  notificationTemplateDueSoonEn: string;
  notificationTemplateDueSoonBn: string;
  notificationTemplateOverdueEn: string;
  notificationTemplateOverdueBn: string;
  theme: 'dark' | 'light';
  logoUrl?: string;
  faviconUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  whatsappNumber?: string;
  supportEmail?: string;
  footerText?: string;
  accentColor?: string;
}

// Super Admin System Control Center Types
export interface CategoryAttribute {
  id: string;
  name: string;
  code: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';
  options?: string[];
  required: boolean;
  unit?: string;
}

export interface ProductCategoryConfig {
  id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  subcategories: string[];
  attributes: CategoryAttribute[];
  isSerializedDefault: boolean;
  defaultWarrantyMonths: number;
  isActive: boolean;
  sortOrder: number;
}

export interface BrandConfig {
  id: string;
  name: string;
  code: string;
  categoryIds: string[];
  logoUrl?: string;
  website?: string;
  description?: string;
  isActive: boolean;
}

export interface ConfigurablePaymentMethod {
  id: string;
  name: string;
  code: string;
  type: 'CASH' | 'BANK' | 'MFS' | 'CARD' | 'OTHER';
  linkedAccountId: string;
  accountNumber?: string;
  chargePercent: number;
  instructions?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ExpenseCategoryConfig {
  id: string;
  name: string;
  code: string;
  description?: string;
  isTaxDeductible: boolean;
  isActive: boolean;
}

export interface ServiceCategoryConfig {
  id: string;
  name: string;
  code: string;
  defaultLaborCost: number;
  estimatedDurationHours: number;
  warrantyDays: number;
  description?: string;
  isActive: boolean;
}

export interface WarrantyRuleConfig {
  id: string;
  categoryName: string;
  defaultMonths: number;
  termsText: string;
  replacementAllowed: boolean;
  repairAllowed: boolean;
  voidConditions: string;
  isActive: boolean;
}

export interface DynamicNotificationTemplate {
  id: string;
  code: string;
  name: string;
  channel: 'SMS' | 'WHATSAPP' | 'EMAIL';
  triggerEvent: string;
  subjectTemplate?: string;
  templateEn: string;
  templateBn: string;
  placeholders: string[];
  isActive: boolean;
}

export interface PriceChangeAudit {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  priceType: 'RETAIL' | 'EMI' | 'WHOLESALE' | 'PURCHASE';
  oldPrice: number;
  newPrice: number;
  changedBy: string;
  reason: string;
  timestamp: string;
}

export interface CustomerMergeAudit {
  id: string;
  sourceCustomerId: string;
  sourceCustomerName: string;
  targetCustomerId: string;
  targetCustomerName: string;
  movedInvoicesCount: number;
  movedEmiAccountsCount: number;
  movedServiceJobsCount: number;
  performedBy: string;
  timestamp: string;
  reason: string;
}

export interface PosSettings {
  invoicePrefix: string;
  nextInvoiceNumber: number;
  returnWindowDays: number;
  enablePosDiscounts: boolean;
  maxDiscountPercent: number;
  enableCreditSales: boolean;
  requireCustomerPhone: boolean;
  defaultInvoiceNotes: string;
  receiptFooterText: string;
  taxPercent: number;
  printLogoOnReceipt: boolean;
  printWarrantyOnReceipt: boolean;
}

export interface InventoryRules {
  lowStockThresholdDefault: number;
  enableOutOfStockWarnings: boolean;
  allowNegativeStock: boolean;
  serialTrackingMandatoryCategories: string[];
  autoGenerateBarcode: boolean;
  barcodePrefix: string;
  requireApprovalForInterBranchTransfer: boolean;
}

