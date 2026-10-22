// NEED ELECTRO ERP — Canonical System Permissions List
export interface SystemPermissionDef {
  id: string;
  module: string;
  action: string;
  label: string;
  description: string;
  isSensitive: boolean;
}

export const SYSTEM_PERMISSIONS: SystemPermissionDef[] = [
  // Dashboard & Analytics
  { id: 'perm_dash_view', module: 'dashboard', action: 'view', label: 'View Dashboard', description: 'Access operational overview', isSensitive: false },
  { id: 'perm_dash_profit', module: 'dashboard', action: 'view_profit', label: 'View Gross & Net Profit', description: 'Sensitive financial performance metrics', isSensitive: true },
  
  // Sales & POS
  { id: 'perm_sales_view', module: 'sales', action: 'view', label: 'View Sales & Invoices', description: 'View past transactions and bills', isSensitive: false },
  { id: 'perm_sales_create', module: 'sales', action: 'create', label: 'Create Sales (POS)', description: 'Issue invoices and complete sales', isSensitive: false },
  { id: 'perm_sales_discount', module: 'sales', action: 'apply_discount', label: 'Apply Custom Discounts', description: 'Discounts exceeding standard limits', isSensitive: true },
  { id: 'perm_sales_void', module: 'sales', action: 'void', label: 'Void/Cancel Sale', description: 'Revoke or cancel existing sales invoices', isSensitive: true },
  { id: 'perm_sales_return', module: 'sales', action: 'return', label: 'Process Sales Returns', description: 'Accept returned merchandise & refund', isSensitive: true },
  
  // Quotations & Price Proposals
  { id: 'perm_quot_view', module: 'quotations', action: 'view', label: 'View Quotations', description: 'Access quotation records and history', isSensitive: false },
  { id: 'perm_quot_create', module: 'quotations', action: 'create', label: 'Create Quotations', description: 'Prepare price proposals for customers', isSensitive: false },
  { id: 'perm_quot_edit', module: 'quotations', action: 'edit_draft', label: 'Edit Draft Quotations', description: 'Modify draft line items and quoted prices', isSensitive: false },
  { id: 'perm_quot_issue', module: 'quotations', action: 'issue', label: 'Issue & Send Quotations', description: 'Officially issue quotations to clients', isSensitive: false },
  { id: 'perm_quot_share', module: 'quotations', action: 'share', label: 'Share Quotations', description: 'Share quotations via WhatsApp, PDF and email', isSensitive: false },
  { id: 'perm_quot_convert', module: 'quotations', action: 'convert_to_order', label: 'Convert to Sales Order', description: 'Transform accepted quotations into real sales invoices', isSensitive: false },
  { id: 'perm_quot_cancel', module: 'quotations', action: 'cancel', label: 'Cancel/Reject Quotations', description: 'Reject or archive non-accepted quotations', isSensitive: false },
  { id: 'perm_quot_reports', module: 'quotations', action: 'view_reports', label: 'Quotation Analytics & Reports', description: 'View quotation volume and conversion metrics', isSensitive: false },
  
  // EMI Financing
  { id: 'perm_emi_view', module: 'emi', action: 'view', label: 'View EMI Accounts', description: 'Access customer installment ledgers', isSensitive: false },
  { id: 'perm_emi_create', module: 'emi', action: 'create', label: 'Approve EMI Sale', description: 'Authorize laptop financing agreements', isSensitive: true },
  { id: 'perm_emi_collect', module: 'emi', action: 'collect', label: 'Collect EMI Payments', description: 'Collect installments and issue vouchers', isSensitive: false },
  { id: 'perm_emi_settings', module: 'emi', action: 'manage_plans', label: 'Manage EMI Plans', description: 'Configure interest rates, durations & fees', isSensitive: true },
  
  // Inventory & Stock
  { id: 'perm_inv_view', module: 'inventory', action: 'view', label: 'View Stock Levels', description: 'View real-time item counts & serials', isSensitive: false },
  { id: 'perm_inv_adjust', module: 'inventory', action: 'adjust', label: 'Stock Adjustment', description: 'Correction of physical inventory counts', isSensitive: true },
  { id: 'perm_inv_transfer', module: 'inventory', action: 'transfer', label: 'Stock Transfer', description: 'Inter-branch stock transfers', isSensitive: false },
  { id: 'perm_inv_serials', module: 'inventory', action: 'manage_serials', label: 'Manage Serial Numbers', description: 'Track and audit serialized assets', isSensitive: false },
  
  // Purchases & Inflow
  { id: 'perm_purch_view', module: 'purchases', action: 'view', label: 'View Purchase Orders', description: 'Access supplier bills', isSensitive: false },
  { id: 'perm_purch_create', module: 'purchases', action: 'create', label: 'Record Purchase', description: 'Register vendor intake and payables', isSensitive: false },
  
  // Products Catalog
  { id: 'perm_prod_view', module: 'products', action: 'view', label: 'View Products', description: 'Search product specs and prices', isSensitive: false },
  { id: 'perm_prod_create', module: 'products', action: 'create', label: 'Add Products', description: 'Create new items in global catalog', isSensitive: false },
  { id: 'perm_prod_edit', module: 'products', action: 'edit', label: 'Edit Product Details', description: 'Update descriptions and specs', isSensitive: false },
  { id: 'perm_prod_pricing', module: 'products', action: 'edit_pricing', label: 'Change Prices (Retail/EMI)', description: 'Modify retail or EMI price lists', isSensitive: true },
  
  // Customers & CRM
  { id: 'perm_cust_view', module: 'customers', action: 'view', label: 'View Customers', description: 'Search customer histories', isSensitive: false },
  { id: 'perm_cust_create', module: 'customers', action: 'create', label: 'Create Customer', description: 'Register new retail or EMI clients', isSensitive: false },
  { id: 'perm_cust_merge', module: 'customers', action: 'merge', label: 'Merge Duplicate Accounts', description: 'Consolidate multiple customer profiles', isSensitive: true },
  
  // Suppliers
  { id: 'perm_supp_view', module: 'suppliers', action: 'view', label: 'View Suppliers', description: 'Browse supplier profiles', isSensitive: false },
  { id: 'perm_supp_manage', module: 'suppliers', action: 'manage', label: 'Manage Suppliers & Pay', description: 'Add suppliers and disburse vendor payments', isSensitive: true },
  
  // Services & Repairs
  { id: 'perm_serv_view', module: 'service', action: 'view', label: 'View Service Jobs', description: 'Track repair and installation tickets', isSensitive: false },
  { id: 'perm_serv_manage', module: 'service', action: 'manage', label: 'Manage Service & Bill', description: 'Assign technicians and bill parts', isSensitive: false },
  
  // Warranty
  { id: 'perm_warr_view', module: 'warranty', action: 'view', label: 'View Warranty Records', description: 'Check serial warranty claims', isSensitive: false },
  { id: 'perm_warr_claims', module: 'warranty', action: 'process_claims', label: 'Process Warranty Claims', description: 'Approve RMA or free repairs', isSensitive: false },
  
  // Central Accounting
  { id: 'perm_acct_view', module: 'accounting', action: 'view', label: 'View Accounting Ledgers', description: 'Access general ledger and P&L', isSensitive: true },
  { id: 'perm_acct_transfer', module: 'accounting', action: 'transfer_funds', label: 'Internal Fund Transfers', description: 'Move cash between accounts', isSensitive: true },
  { id: 'perm_acct_invest', module: 'accounting', action: 'manage_investments', label: 'Record Capital & Equity', description: 'Manage equity and investments', isSensitive: true },
  
  // Expenses
  { id: 'perm_exp_view', module: 'expenses', action: 'view', label: 'View Expenses', description: 'Browse operating expenditures', isSensitive: false },
  { id: 'perm_exp_create', module: 'expenses', action: 'create', label: 'Record Expense', description: 'Create expense vouchers', isSensitive: false },
  
  // Reports
  { id: 'perm_rep_view', module: 'reports', action: 'view', label: 'View Reports', description: 'Generate business & sales reports', isSensitive: false },
  { id: 'perm_rep_export', module: 'reports', action: 'export', label: 'Export Data (PDF/Excel)', description: 'Download corporate spreadsheets', isSensitive: true },
  
  // Staff & Employees
  { id: 'perm_emp_view', module: 'employees', action: 'view', label: 'View Employees', description: 'Browse staff roster', isSensitive: false },
  { id: 'perm_emp_manage', module: 'employees', action: 'manage', label: 'Manage Staff & Payroll', description: 'Add staff and record attendance', isSensitive: true },
  
  // Roles & Security
  { id: 'perm_roles_manage', module: 'roles', action: 'manage', label: 'Manage Roles & RBAC', description: 'Configure security permissions', isSensitive: true },
  { id: 'perm_users_manage', module: 'users', action: 'manage', label: 'Manage User Accounts', description: 'Create staff accounts', isSensitive: true },
  { id: 'perm_audit_view', module: 'audit', action: 'view', label: 'View Audit Trails', description: 'Inspect security and financial logs', isSensitive: true },
  
  // Settings & System
  { id: 'perm_settings_manage', module: 'settings', action: 'manage', label: 'Modify System Settings', description: 'Master company parameters', isSensitive: true },
  { id: 'perm_backup_manage', module: 'backup', action: 'manage', label: 'Database Backup & Restore', description: 'Manage database snapshots and restore', isSensitive: true },
  
  // Cash & Liquidity Vault
  { id: 'perm_cash_view', module: 'cash', action: 'view', label: 'View Cash & Liquidity', description: 'Access cash management module, running balances and drawers', isSensitive: false },
  { id: 'perm_cash_create', module: 'cash', action: 'create', label: 'Create Cash Accounts', description: 'Configure new branch or counter cash accounts', isSensitive: true },
  { id: 'perm_cash_collect', module: 'cash', action: 'collect', label: 'Collect Cash & Dues', description: 'Receive customer dues, EMI and counter payments', isSensitive: false },
  { id: 'perm_cash_payment', module: 'cash', action: 'payment', label: 'Disburse Cash Payments', description: 'Process cash purchases, petty cash and supplier vouchers', isSensitive: true },
  { id: 'perm_cash_transfer', module: 'cash', action: 'transfer', label: 'Inter-Branch & Account Transfers', description: 'Transfer cash between branches or bank accounts', isSensitive: true },
  { id: 'perm_cash_adjust', module: 'cash', action: 'adjust', label: 'Cash Adjustments', description: 'Post audited shortage, excess, or correction entries', isSensitive: true },
  { id: 'perm_cash_count', module: 'cash', action: 'count', label: 'Physical Cash Count & Reconciliation', description: 'Perform shift end drawer counting and variance checks', isSensitive: false },
  { id: 'perm_cash_report', module: 'cash', action: 'report', label: 'Cash Flow Reports', description: 'Access daily, monthly, and ledger cash statements', isSensitive: false },
  { id: 'perm_cash_export', module: 'cash', action: 'export', label: 'Export Cash Ledgers', description: 'Download CSV and Excel financial ledger logs', isSensitive: true },

  // Enterprise Multi-Branch & Control
  { id: 'perm_branches_manage', module: 'branches', action: 'manage', label: 'Manage Showroom Branches', description: 'Create and configure physical showroom branches and warehouses', isSensitive: true },
  { id: 'perm_control_center', module: 'control_center', action: 'manage', label: 'System Control Center', description: 'Access advanced enterprise control center and taxonomy engine', isSensitive: true },
  { id: 'perm_seo_manage', module: 'seo', action: 'manage', label: 'Manage Website SEO', description: 'Configure public website SEO metadata, sitemaps, and OpenGraph', isSensitive: false }
];
