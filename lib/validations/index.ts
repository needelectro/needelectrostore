// NEED ELECTRO ERP — Zod Enterprise Validation Schemas
import { z } from 'zod';

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(true),
  branchId: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number is required'),
  username: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().min(1, 'Role is required'),
  branchId: z.string().min(1, 'Branch assignment is required'),
  allowedBranchIds: z.array(z.string()).optional(),
  employeeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional().default('ACTIVE'),
});

// 2. Sales & POS Schemas
export const quotationItemSchema = z.object({
  productId: z.string().optional().nullable(),
  productName: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  unitOfMeasure: z.string().optional().default('Unit'),
  catalogPriceSnapshot: z.number().nonnegative().optional().default(0),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  discount: z.number().nonnegative().optional().default(0),
  taxPercent: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
  lineTotal: z.number().nonnegative().optional(),
  warrantyMonths: z.number().int().nonnegative().optional().default(0),
  specsSnapshot: z.any().optional(),
  productSnapshot: z.any().optional(),
  sortOrder: z.number().int().optional().default(0),
});

export const createQuotationSchema = z.object({
  quotationNumber: z.string().optional(),
  referenceNumber: z.string().optional().nullable(),
  customerId: z.string().optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  companyName: z.string().optional().nullable(),
  customerPhone: z.string().min(1, 'Customer phone number is required'),
  customerEmail: z.string().optional().nullable(),
  billingAddress: z.string().optional().nullable(),
  deliveryAddress: z.string().optional().nullable(),
  branchId: z.string().optional().nullable(),
  quotationDate: z.string().optional().nullable(),
  validUntil: z.string().min(1, 'Validity date is required'),
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED']).optional().default('DRAFT'),
  subtotal: z.number().nonnegative().optional(),
  discountTotal: z.number().nonnegative().optional().default(0),
  vatPercent: z.number().nonnegative().optional().default(0),
  vatAmount: z.number().nonnegative().optional().default(0),
  deliveryCharge: z.number().nonnegative().optional().default(0),
  serviceCharge: z.number().nonnegative().optional().default(0),
  otherCharges: z.number().nonnegative().optional().default(0),
  grandTotal: z.number().nonnegative().optional(),
  paymentTerms: z.string().optional().nullable(),
  deliveryTerms: z.string().optional().nullable(),
  warrantyTerms: z.string().optional().nullable(),
  customerNotes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  salespersonId: z.string().optional().nullable(),
  salespersonName: z.string().optional().nullable(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required in the quotation'),
});

export const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  productName: z.string(),
  sku: z.string(),
  category: z.string(),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  discount: z.number().nonnegative().optional().default(0),
  total: z.number().nonnegative(),
  warrantyMonths: z.number().int().nonnegative().optional().default(0),
  isSerialized: z.boolean().optional().default(false),
  serialNumbers: z.array(z.string()).optional(),
  description: z.string().optional(),
  taxPercent: z.number().nonnegative().optional().default(0),
  taxAmount: z.number().nonnegative().optional().default(0),
});

export const createSaleSchema = z.object({
  saleData: z.object({
    invoiceNumber: z.string().optional(),
    customerId: z.string().min(1, 'Customer is required'),
    customerName: z.string().min(1, 'Customer name is required'),
    customerPhone: z.string().min(1, 'Customer phone is required'),
    customerEmail: z.string().optional(),
    customerType: z.string().optional().default('RETAIL'),
    billingAddress: z.string().optional(),
    shippingAddress: z.string().optional(),
    branchId: z.string().min(1, 'Branch is required'),
    subtotal: z.number().nonnegative(),
    overallDiscount: z.number().nonnegative().optional().default(0),
    vatAmount: z.number().nonnegative().optional().default(0),
    vatPercent: z.number().nonnegative().optional().default(0),
    deliveryCharge: z.number().nonnegative().optional().default(0),
    serviceCharge: z.number().nonnegative().optional().default(0),
    otherCharges: z.number().nonnegative().optional().default(0),
    grandTotal: z.number().nonnegative(),
    paidAmount: z.number().nonnegative().optional().default(0),
    dueAmount: z.number().nonnegative().optional().default(0),
    previousDue: z.number().optional().default(0),
    totalDue: z.number().optional().default(0),
    changeAmount: z.number().optional().default(0),
    payments: z.array(
      z.object({
        method: z.string(),
        amount: z.number().nonnegative('Payment amount cannot be negative'),
        accountId: z.string().optional(),
        ref: z.string().optional(),
      })
    ).optional(),
    saleType: z.enum(['REGULAR', 'EMI']).optional().default('REGULAR'),
    items: z.array(saleItemSchema).min(1, 'At least one item is required in the sale'),
    salespersonId: z.string().optional(),
    salespersonName: z.string().optional(),
    notes: z.string().optional(),
    metadata: z.any().optional(),
  }),
  emiPlanConfig: z.object({
    planId: z.string().optional(),
    durationMonths: z.number().int().positive(),
    downPayment: z.number().nonnegative(),
    financedAmount: z.number().nonnegative(),
    monthlyInstallment: z.number().positive(),
    totalPayable: z.number().positive(),
    guarantor: z.object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relation: z.string().optional(),
      address: z.string().optional(),
      nid: z.string().optional(),
    }).optional(),
  }).optional(),
  paymentAccountId: z.string().optional(),
});

// 3. EMI Collection Schema
export const collectEmiPaymentSchema = z.object({
  emiAccountId: z.string().min(1, 'EMI Account ID is required'),
  installmentId: z.string().min(1, 'Installment ID is required'),
  amount: z.number().positive('Payment amount must be greater than 0'),
  penaltyAmount: z.number().nonnegative().optional().default(0),
  paymentMethod: z.string().optional().default('CASH'),
  ref: z.string().optional(),
  notes: z.string().optional(),
  accountId: z.string().optional(),
});

// 4. Product Schemas
export const createProductSchema = z.object({
  productData: z.object({
    name: z.string().min(2, 'Product name is required'),
    sku: z.string().min(2, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    model: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().optional(),
    images: z.array(z.string()).optional(),
    purchasePrice: z.number().nonnegative().optional().default(0),
    costPrice: z.number().nonnegative().optional().default(0),
    retailPrice: z.number().nonnegative().optional().default(0),
    wholesalePrice: z.number().nonnegative().optional().default(0),
    emiPrice: z.number().nonnegative().optional().default(0),
    currentStock: z.number().int().nonnegative().optional().default(0),
    minStock: z.number().int().nonnegative().optional().default(5),
    supplierId: z.string().optional(),
    warrantyPeriodMonths: z.number().int().nonnegative().optional().default(0),
    isSerialized: z.boolean().optional().default(false),
    status: z.enum(['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK']).optional().default('ACTIVE'),
    isPublished: z.boolean().optional().default(true),
    isFeatured: z.boolean().optional().default(false),
    specs: z.record(z.any()).optional(),
  }),
  initialSerials: z.array(z.string()).optional(),
});

export const bannerSchema = z.object({
  title: z.string().min(2, 'Banner title is required'),
  subtitle: z.string().optional(),
  badge: z.string().optional(),
  imageUrl: z.string().min(1, 'Banner image is required'),
  mobileImageUrl: z.string().optional(),
  targetUrl: z.string().optional(),
  buttonText: z.string().optional().default('Shop Now'),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().optional().default(true),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  placement: z.string().optional().default('HERO'),
});

export const createWebsiteOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().regex(/^(\+?880|0)?1[3-9]\d{8}$/, 'Valid Bangladeshi mobile number (11 digits e.g. 017XXXXXXXX) is required'),
  customerEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  deliveryAddress: z.string().min(5, 'Full delivery address with house/road/area is required'),
  district: z.string().min(2, 'District is required'),
  deliveryArea: z.string().optional(),
  deliveryNotes: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'BANK']).default('COD'),
  couponCode: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().int().positive('Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one item'),
});

export const stockAdjustSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  branchId: z.string().min(1, 'Branch ID is required'),
  quantityDiff: z.number().int().refine((val) => val !== 0, 'Adjustment cannot be zero'),
  reason: z.string().min(2, 'Reason for adjustment is required'),
  serialNumbers: z.array(z.string()).optional(),
});

export const stockTransferSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  fromBranchId: z.string().min(1, 'Source branch is required'),
  toBranchId: z.string().min(1, 'Destination branch is required'),
  quantity: z.number().int().positive('Quantity must be greater than 0'),
  serialNumbers: z.array(z.string()).optional(),
});

// 5. Customer Schema
export const customerSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(6, 'Valid phone number is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  nid: z.string().optional(),
  guarantor: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
    address: z.string().optional(),
    nid: z.string().optional(),
  }).optional(),
  creditLimit: z.number().nonnegative().optional().default(0),
  notes: z.string().optional(),
});

// 6. Expense Schema
export const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Expense amount must be positive'),
  date: z.string().optional(),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  branchId: z.string().min(1, 'Branch is required'),
  description: z.string().min(2, 'Description is required'),
  attachmentName: z.string().optional(),
  accountId: z.string().optional(),
});

// 7. Service Job Schema
export const serviceJobSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerAddress: z.string().optional(),
  serviceType: z.string().min(1, 'Service type is required'),
  deviceOrSite: z.string().min(1, 'Device/Site description is required'),
  serialNumber: z.string().optional(),
  reportedIssue: z.string().min(2, 'Reported issue is required'),
  assignedTechnicianId: z.string().optional(),
  assignedTechnicianName: z.string().optional(),
  laborCost: z.number().nonnegative().optional().default(0),
  totalBill: z.number().nonnegative().optional().default(0),
  notes: z.string().optional(),
});
