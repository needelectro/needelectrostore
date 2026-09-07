-- =========================================================================
-- NEED ELECTRO ERP: PostgreSQL Data Migration Seed
-- Source: data/need_electro.db (SQLite)
-- Generated: 2026-09-07T10:50:25.764Z
-- Target: Supabase PostgreSQL (47 Normalized Relational Tables)
-- =========================================================================

BEGIN;


INSERT INTO system_settings (
  id, company_name, company_tagline, sister_concern, main_branch_name, phone, email, website, address,
  vat_registration_no, bin_number, invoice_prefix, emi_prefix, default_vat_percent, currency_symbol,
  currency_code, enable_sms_notifications, enable_whatsapp_notifications, notification_template_due_soon_en,
  notification_template_due_soon_bn, notification_template_overdue_en, notification_template_overdue_bn,
  theme, logo_url, favicon_url, facebook_url, youtube_url, linkedin_url, whatsapp_number, support_email,
  footer_text, accent_color, updated_at
) VALUES (
  'main', 'NEED ELECTRO', 'Trusted Electrical & Technological Solutions', 'A sister Concern Of AMDADS GROUP',
  'Main Branch Moulvibazar', '+880 1733-983752', 'contact.amdadur@gmail.com', 'www.needelectro.com',
  'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh', 'BIN: 002948123-0102', 'BIN-NEED-2026-BD',
  'INV-2026-', 'EMI-2026-', 5.00, '৳',
  'BDT', TRUE, TRUE,
  'Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI installment of ৳{AMOUNT} for {PRODUCT_NAME} (Serial: {SERIAL}) is due on {DUE_DATE}. Pay via bKash/Nagad or visit our showroom at Shop#5, MR Plaza, Kusumbag, Moulvibazar. Hotline: 01733-983752.', 'সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME} (সিরিয়াল: {SERIAL})-এর মাসিক কিস্তি ৳{AMOUNT} আগামী {DUE_DATE} তারিখে পরিশোধযোগ্য। বিকাশ/নগদ বা আমাদের শোরুম (শপ#৫, এমআর প্লাজা, কুসুমবাগ, মৌলভীবাজার)-এ জমা দিন। হেল্পলাইন: 01733-983752।',
  'URGENT: Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI payment of ৳{AMOUNT} is OVERDUE by {DAYS_OVERDUE} days. Please pay immediately. NEED ELECTRO (A sister Concern Of AMDADS GROUP), Kusumbag, Moulvibazar. Hotline: 01733-983752.', 'জরুরি নোটিশ: সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME}-এর কিস্তি ৳{AMOUNT} বিগত {DAYS_OVERDUE} দিন যাবত বকেয়া রয়েছে। জরিমানা এড়াতে অবিলম্বে পরিশোধ করুন। নিড ইলেক্ট্রো, কুসুমবাগ, মৌলভীবাজার। ফোন: 01733-983752।',
  'dark', '', '', 'https://facebook.com/needelectro',
  'https://youtube.com/@needelectro', 'https://linkedin.com/company/needelectro', '+8801733983752', 'contact.amdadur@gmail.com',
  'NEED ELECTRO — Trusted Electrical & Technological Solutions. Moulvibazar, Bangladesh.', '#008CFF', '2026-09-07T00:34:48.000Z'
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name, phone = EXCLUDED.phone, email = EXCLUDED.email;


INSERT INTO pos_settings (
  id, invoice_prefix, next_invoice_number, return_window_days, enable_pos_discounts,
  max_discount_percent, enable_credit_sales, require_customer_phone, default_invoice_notes,
  receipt_footer_text, tax_percent, print_logo_on_receipt, print_warranty_on_receipt
) VALUES (
  'main', 'INV-2026-', 1003, 7,
  TRUE, 15.00, TRUE, TRUE,
  'Goods sold with authentic warranty. Software and liquid damage not covered by warranty.', 'Thank you for choosing NEED ELECTRO! Visit us at Shop#5, MR Plaza, Kusumbag, Moulvibazar.', 5.00,
  TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO inventory_rules (
  id, low_stock_threshold_default, enable_out_of_stock_warnings, allow_negative_stock,
  require_serial_on_purchase, require_serial_on_sale, auto_generate_serials, default_serial_prefix
) VALUES (
  'main', 3, TRUE,
  FALSE, NULL, NULL,
  NULL, 'NEC-SN-'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO setup_status (
  id, initial_setup_completed, setup_date, initialized_by
) VALUES (
  'main', TRUE, NULL, NULL
) ON CONFLICT (id) DO UPDATE SET initial_setup_completed = EXCLUDED.initial_setup_completed;


INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active, created_at)
VALUES (
  'branch-1', 'Main Branch Moulvibazar', 'MB-MAIN', 'Shop#5, MR Plaza, Kusumbag, Moulvibazar',
  '01733-983752', 'needelectro23@gmail.com', FALSE, TRUE,
  '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active, created_at)
VALUES (
  'branch-2', 'Kusumbag Tech & CCTV Hub', 'MB-TECH', 'MR Plaza Level 1, Kusumbag, Moulvibazar',
  '01733-983752', 'sales@needelectro.com', FALSE, TRUE,
  '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active, created_at)
VALUES (
  'branch-3', 'Central Warehouse & Service Hub', 'CENTRAL-WH', 'Sreemangal Road Industrial Area, Moulvibazar',
  '01733-983752', 'service@needelectro.com', TRUE, TRUE,
  '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-superadmin', 'Super Admin', 'SUPER_ADMIN', 'Absolute unrestricted system control and configuration.',
  TRUE, '["dashboard.view","dashboard.profit","sales.view","sales.create","sales.discount","sales.void","sales.return","emi.view","emi.create","emi.collect","emi.reschedule","emi.settings","inventory.view","inventory.adjust","inventory.transfer","inventory.serials","purchases.view","purchases.create","products.view","products.create","products.edit","products.pricing","customers.view","customers.create","customers.credit","customers.merge","suppliers.view","suppliers.manage","services.view","services.manage","warranty.view","warranty.claims","accounting.view","accounting.transfer","accounting.invest","expenses.view","expenses.create","reports.view","reports.export","employees.view","employees.manage","roles.manage","users.manage","audit.view","settings.manage","backup.manage"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-admin', 'Administrator', 'ADMIN', 'Full branch management, inventory, sales, customer, and reporting authority.',
  TRUE, '["dashboard.view","dashboard.profit","sales.view","sales.create","sales.discount","sales.void","sales.return","emi.view","emi.create","emi.collect","emi.reschedule","emi.settings","inventory.view","inventory.adjust","inventory.transfer","inventory.serials","purchases.view","purchases.create","products.view","products.create","products.edit","products.pricing","customers.view","customers.create","customers.credit","customers.merge","suppliers.view","suppliers.manage","services.view","services.manage","warranty.view","warranty.claims","accounting.view","accounting.transfer","accounting.invest","expenses.view","expenses.create","reports.view","reports.export","employees.view","employees.manage","roles.manage","users.manage","audit.view","settings.manage"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-manager', 'Branch Manager', 'MANAGER', 'Supervises branch sales, customer credit, EMI approvals, and stock transfers.',
  TRUE, '["dashboard.view","sales.view","sales.create","sales.discount","sales.return","emi.view","emi.create","emi.collect","inventory.view","inventory.adjust","inventory.transfer","inventory.serials","purchases.view","purchases.create","products.view","products.create","products.edit","customers.view","customers.create","customers.credit","suppliers.view","suppliers.manage","services.view","services.manage","warranty.view","warranty.claims","expenses.view","expenses.create","reports.view","reports.export","employees.view"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-sales', 'Sales Executive', 'SALES', 'Handles POS retail billing, EMI customer inquiries, and installment payments.',
  TRUE, '["dashboard.view","sales.view","sales.create","emi.view","emi.collect","inventory.view","products.view","customers.view","customers.create","services.view","warranty.view"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-accountant', 'Senior Accountant', 'ACCOUNTANT', 'Oversees general ledgers, accounts receivable/payable, expenses, and financial reports.',
  TRUE, '["dashboard.view","dashboard.profit","sales.view","emi.view","emi.collect","purchases.view","suppliers.view","suppliers.manage","accounting.view","accounting.transfer","accounting.invest","expenses.view","expenses.create","reports.view","reports.export"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-inventory', 'Inventory Specialist', 'INVENTORY', 'Controls warehouse intake, serial scanning, stock adjustments, and goods dispatch.',
  TRUE, '["dashboard.view","inventory.view","inventory.adjust","inventory.transfer","inventory.serials","purchases.view","purchases.create","products.view","products.create","products.edit"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-technician', 'Senior Technician', 'TECHNICIAN', 'Field technician for electrical installations, CCTV setup, and laptop repair jobs.',
  TRUE, '["services.view","services.manage","warranty.view","warranty.claims","inventory.view"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-electrician', 'Electrician', 'ELECTRICIAN', 'On-site electrical service, wiring, DB board fitting, and customer maintenance.',
  TRUE, '["services.view","services.manage","warranty.view","warranty.claims","inventory.view"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  'role-employee', 'General Staff', 'EMPLOYEE', 'Standard staff member with basic dashboard and attendance features.',
  TRUE, '["dashboard.view"]'::jsonb, TRUE, '2026-09-07T00:11:45.000Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'dashboard.view', 'dashboard', 'view', 'View Dashboard',
  'Access operational KPI overview and statistics', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'dashboard.profit', 'dashboard', 'view_profit', 'View Gross & Net Profit',
  'Sensitive financial performance metrics', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'sales.view', 'sales', 'view', 'View Sales & Invoices',
  'View past transactions and bills', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'sales.create', 'sales', 'create', 'Create Sales (POS)',
  'Issue invoices and complete cash/card/digital sales', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'sales.discount', 'sales', 'apply_discount', 'Apply Custom Discounts',
  'Discounts exceeding standard limits', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'sales.void', 'sales', 'void', 'Void/Cancel Sale',
  'Revoke or cancel existing sales invoices', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'sales.return', 'sales', 'return', 'Process Sales Returns',
  'Accept returned merchandise & refund balances', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'emi.view', 'emi', 'view', 'View EMI Accounts',
  'Access customer installment ledgers and contracts', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'emi.create', 'emi', 'create', 'Approve EMI Sale',
  'Authorize high-value laptop financing agreements', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'emi.collect', 'emi', 'collect', 'Collect EMI Payments',
  'Collect installments and issue payment vouchers', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'emi.reschedule', 'emi', 'reschedule', 'Reschedule/Waive Penalty',
  'Modify payment dates or waive late penalties', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'emi.settings', 'emi', 'manage_plans', 'Manage EMI Plans',
  'Configure interest rates, durations & down payments', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'inventory.view', 'inventory', 'view', 'View Stock Levels',
  'View real-time item counts and serial statuses', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'inventory.adjust', 'inventory', 'adjust', 'Stock Adjustment',
  'Manual correction of physical inventory counts', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'inventory.transfer', 'inventory', 'transfer', 'Stock Transfer',
  'Inter-branch stock shipments and transfers', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'inventory.serials', 'inventory', 'manage_serials', 'Manage Serial Numbers',
  'Track, reassign or audit serialized assets', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'purchases.view', 'purchases', 'view', 'View Purchase Orders',
  'Access supplier bills and received goods logs', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'purchases.create', 'purchases', 'create', 'Record Purchase',
  'Register vendor goods receipt and payables', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'products.view', 'products', 'view', 'View Products',
  'Search and review product specs and prices', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'products.create', 'products', 'create', 'Add Products',
  'Create new items in the global catalog', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'products.edit', 'products', 'edit', 'Edit Product Details',
  'Update descriptions, specs and stock rules', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'products.pricing', 'products', 'edit_pricing', 'Change Prices (Retail/EMI)',
  'Modify retail, EMI, or wholesale price lists', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'customers.view', 'customers', 'view', 'View Customers',
  'Search customer phone numbers and histories', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'customers.create', 'customers', 'create', 'Create Customer',
  'Register new retail or EMI clients', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'customers.credit', 'customers', 'set_credit_limit', 'Set Customer Credit Limits',
  'Authorize due sales ceiling', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'customers.merge', 'customers', 'merge', 'Merge Duplicate Accounts',
  'Consolidate multiple customer profiles', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'suppliers.view', 'suppliers', 'view', 'View Suppliers',
  'Browse supplier profiles and ledger debts', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'suppliers.manage', 'suppliers', 'manage', 'Manage Suppliers & Pay',
  'Add suppliers and disburse vendor payments', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'services.view', 'services', 'view', 'View Service Jobs',
  'Track repair and field installation job tickets', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'services.manage', 'services', 'manage', 'Manage Service & Bill',
  'Assign technicians, record parts used, and bill', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'warranty.view', 'warranty', 'view', 'View Warranty Records',
  'Check serial warranty eligibility and claims', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'warranty.claims', 'warranty', 'process_claims', 'Process Warranty Claims',
  'Approve RMA, replacements or free repairs', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'accounting.view', 'accounting', 'view', 'View Accounting Ledgers',
  'Access general ledger and balance sheets', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'accounting.transfer', 'accounting', 'transfer_funds', 'Internal Fund Transfers',
  'Move cash between drawers and bank accounts', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'accounting.invest', 'accounting', 'manage_investments', 'Record Capital & Equity',
  'Manage shareholder equity and investments', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'expenses.view', 'expenses', 'view', 'View Expenses',
  'Browse petty cash and operating expenditures', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'expenses.create', 'expenses', 'create', 'Record Expense',
  'Create expense vouchers and payout cash', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'reports.view', 'reports', 'view', 'View Reports',
  'Generate business, sales and inventory reports', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'reports.export', 'reports', 'export', 'Export Data (PDF/Excel)',
  'Download sensitive corporate reporting spreadsheets', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'employees.view', 'employees', 'view', 'View Employees',
  'Browse staff roster and technician records', FALSE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'employees.manage', 'employees', 'manage', 'Manage Staff & Payroll',
  'Add staff, record attendance and pay salaries', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'roles.manage', 'roles', 'manage', 'Manage Roles & RBAC',
  'Configure security clearances and permissions', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'users.manage', 'users', 'manage', 'Manage User Accounts',
  'Create staff accounts and reset passwords', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'audit.view', 'audit', 'view', 'View Audit Trails',
  'Inspect security and financial modification logs', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'settings.manage', 'settings', 'manage', 'Modify System Settings',
  'Master company parameters and hardware options', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  'backup.manage', 'backup', 'manage', 'Database Backup & Restore',
  'Manage database archives, backups and restoration', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO users (
  id, name, email, username, role, role_id, branch_id, primary_branch_id, allowed_branch_ids,
  phone, password_hash, employee_id, avatar, active, status, must_change_password,
  last_login_at, failed_login_attempts, locked_until, created_at
) VALUES (
  'user-superadmin-1', 'Amdadur Rahman', 'contact.amdadur@gmail.com', 'amdadur',
  'SUPER_ADMIN', 'role-superadmin', 'branch-1', 'branch-1',
  '["branch-1", "branch-2", "branch-3"]'::jsonb, '01733-983752', 'pbkdf2:sha256:100000:ed6f5d69f430e675ceedbe8fe5db733b:1e37cde554ace2df5e0d92e2f4c2ffd9bfdc5744692bfc965b851991ae06bbb6',
  NULL, NULL, TRUE,
  'ACTIVE', FALSE, '2026-09-07T04:50:17.000Z',
  0, NULL, '2026-09-07T00:34:48.000Z'
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = EXCLUDED.status;


INSERT INTO categories_config (
  id, name, code, description, icon, subcategories, attributes, is_serialized_default,
  default_warranty_months, is_active, sort_order
) VALUES (
  'cat-laptop', 'Laptops & Ultrabooks', 'LAPTOPS', 'Refurbished and brand new laptops, notebooks & workstations',
  'Laptop', '["Business Laptops","Gaming Laptops","Ultrabooks","Student Laptops","Mobile Workstations"]'::jsonb, '[{"id":"attr-proc","name":"Processor","code":"processor","type":"TEXT","required":true},{"id":"attr-gen","name":"Generation","code":"generation","type":"TEXT","required":true},{"id":"attr-ram","name":"RAM Capacity","code":"ram","type":"SELECT","options":["8GB","16GB","32GB","64GB"],"required":true},{"id":"attr-storage","name":"Storage","code":"storage","type":"SELECT","options":["256GB NVMe","512GB NVMe","1TB NVMe","2TB NVMe"],"required":true},{"id":"attr-display","name":"Display Size & Panel","code":"display","type":"TEXT","required":true},{"id":"attr-gpu","name":"Graphics (GPU)","code":"gpu","type":"TEXT","required":false},{"id":"attr-battery","name":"Battery Health %","code":"batteryCondition","type":"TEXT","required":false},{"id":"attr-condition","name":"Physical Condition","code":"physicalCondition","type":"SELECT","options":["Brand New","Grade A+ Pristine","Grade A Light Use","Open Box"],"required":true}]'::jsonb, TRUE,
  12, TRUE, 1
) ON CONFLICT (id) DO NOTHING;


INSERT INTO categories_config (
  id, name, code, description, icon, subcategories, attributes, is_serialized_default,
  default_warranty_months, is_active, sort_order
) VALUES (
  'cat-desktop', 'Computers & Desktops', 'DESKTOPS', 'Custom desktop PCs, All-in-One systems, and mini PCs',
  'Monitor', '["All-in-One PCs","Custom Gaming Rigs","Office Desktop PCs","Mini PCs"]'::jsonb, '[{"id":"attr-cpu","name":"CPU","code":"processor","type":"TEXT","required":true},{"id":"attr-mobo","name":"Motherboard","code":"motherboard","type":"TEXT","required":true},{"id":"attr-ram","name":"RAM","code":"ram","type":"TEXT","required":true},{"id":"attr-casing","name":"Casing & PSU","code":"casing","type":"TEXT","required":false}]'::jsonb, TRUE,
  24, TRUE, 2
) ON CONFLICT (id) DO NOTHING;


INSERT INTO categories_config (
  id, name, code, description, icon, subcategories, attributes, is_serialized_default,
  default_warranty_months, is_active, sort_order
) VALUES (
  'cat-cctv', 'CCTV & Surveillance', 'CCTV', 'Security cameras, NVR/DVR recorders, IP cameras, power supplies',
  'Shield', '["IP Cameras","HD Analog Cameras","PTZ Cameras","NVR/DVR Recorders","Hard Disks"]'::jsonb, '[{"id":"attr-res","name":"Resolution","code":"resolution","type":"SELECT","options":["2MP 1080p","4MP 2K","5MP","8MP 4K"],"required":true},{"id":"attr-night","name":"Night Vision Mode","code":"nightVision","type":"SELECT","options":["Infrared IR","ColorVu / Full Color","Smart Dual Light"],"required":true},{"id":"attr-chan","name":"Channels","code":"channels","type":"TEXT","required":false}]'::jsonb, TRUE,
  24, TRUE, 3
) ON CONFLICT (id) DO NOTHING;


INSERT INTO categories_config (
  id, name, code, description, icon, subcategories, attributes, is_serialized_default,
  default_warranty_months, is_active, sort_order
) VALUES (
  'cat-electrical', 'Electrical Products', 'ELECTRICAL', 'Breakers, DB boards, industrial cables, smart switches, LED lighting',
  'Zap', '["Circuit Breakers","Distribution Boards","Smart Home Switches","Industrial Cables","LED Commercial Lighting","Solar Solutions"]'::jsonb, '[{"id":"attr-volt","name":"Voltage Rating","code":"voltageRating","type":"TEXT","required":true},{"id":"attr-watt","name":"Power Wattage","code":"powerWattage","type":"TEXT","required":false},{"id":"attr-gauge","name":"Cable Gauge (RM/Gauge)","code":"cableGauge","type":"TEXT","required":false},{"id":"attr-cert","name":"Safety Certification","code":"certification","type":"TEXT","required":false}]'::jsonb, FALSE,
  36, TRUE, 4
) ON CONFLICT (id) DO NOTHING;


INSERT INTO categories_config (
  id, name, code, description, icon, subcategories, attributes, is_serialized_default,
  default_warranty_months, is_active, sort_order
) VALUES (
  'cat-accessories', 'Gadgets & Accessories', 'ACCESSORIES', 'Chargers, docks, adapters, keyboards, mice, Wi-Fi routers',
  'Package', '["Original Laptop Adapters","Keyboards & Mice","Wi-Fi Routers","Power Banks","Headphones & Speakers"]'::jsonb, '[{"id":"attr-compat","name":"Compatibility","code":"compatibility","type":"TEXT","required":false}]'::jsonb, FALSE,
  6, TRUE, 5
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-dell', 'Dell', 'DELL', '["cat-laptop","cat-desktop"]'::jsonb,
  '', 'https://dell.com', 'Latitude, Precision, XPS, and Inspiron series', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-hp', 'HP', 'HP', '["cat-laptop","cat-desktop"]'::jsonb,
  '', 'https://hp.com', 'EliteBook, ProBook, Pavilion, and ZBook series', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-lenovo', 'Lenovo', 'LENOVO', '["cat-laptop","cat-desktop"]'::jsonb,
  '', 'https://lenovo.com', 'ThinkPad, Yoga, IdeaPad, and Legion series', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-apple', 'Apple', 'APPLE', '["cat-laptop","cat-desktop","cat-accessories"]'::jsonb,
  '', 'https://apple.com', 'MacBook Air, MacBook Pro, and iPad series', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-hikvision', 'Hikvision', 'HIKVISION', '["cat-cctv"]'::jsonb,
  '', 'https://hikvision.com', 'Leading global surveillance and access control', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-dahua', 'Dahua', 'DAHUA', '["cat-cctv"]'::jsonb,
  '', 'https://dahuasecurity.com', 'Professional IP security cameras and storage', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-schneider', 'Schneider Electric', 'SCHNEIDER', '["cat-electrical"]'::jsonb,
  '', 'https://se.com', 'Premium circuit protection and switchgear', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  'brand-havells', 'Havells', 'HAVELLS', '["cat-electrical"]'::jsonb,
  '', 'https://havells.com', 'Industrial cables, switchgear, and fans', TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO financial_accounts (
  id, name, type, account_number, bank_name, branch_name, balance, currency, is_active
) VALUES (
  'acc-1', 'Main Cash Drawer', 'CASH', 'CASH-MB-01',
  'Physical Vault', 'Moulvibazar Showroom', 93333.00, 'BDT',
  TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO financial_accounts (
  id, name, type, account_number, bank_name, branch_name, balance, currency, is_active
) VALUES (
  'acc-2', 'Bank Asia Current Account', 'BANK', '03933005821',
  'Bank Asia PLC', 'Moulvibazar Branch', 0.00, 'BDT',
  TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO financial_accounts (
  id, name, type, account_number, bank_name, branch_name, balance, currency, is_active
) VALUES (
  'acc-3', 'bKash Merchant Wallet', 'MOBILE_BANKING', '01733-983752',
  'bKash Limited', 'Merchant Account', 0.00, 'BDT',
  TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO financial_accounts (
  id, name, type, account_number, bank_name, branch_name, balance, currency, is_active
) VALUES (
  'acc-4', 'Nagad Merchant Wallet', 'MOBILE_BANKING', '01733-983752',
  'Nagad Digital', 'Merchant Account', 0.00, 'BDT',
  TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO financial_accounts (
  id, name, type, account_number, bank_name, branch_name, balance, currency, is_active
) VALUES (
  'acc-5', 'Rocket Corporate Account', 'MOBILE_BANKING', '01733-983752-9',
  'Dutch-Bangla Bank', 'MFS Corporate', 0.00, 'BDT',
  TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-1', 'Cash', 'CASH', 'CASH',
  'acc-1', '', 0.00,
  'Accepted at counter. Verify currency security strips.', TRUE, 1
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-2', 'bKash Merchant', 'BKASH', 'MFS',
  'acc-3', '01733-983752', 1.50,
  'Scan QR code or use Merchant Pay. Enter Counter 1.', TRUE, 2
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-3', 'Nagad Merchant', 'NAGAD', 'MFS',
  'acc-4', '01733-983752', 1.20,
  'Pay using Nagad Merchant payment option.', TRUE, 3
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-4', 'Rocket Pay', 'ROCKET', 'MFS',
  'acc-5', '01733-983752-9', 1.20,
  'Use DBBL Rocket Merchant payment.', TRUE, 4
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-5', 'Bank Asia Transfer', 'BANK_ASIA', 'BANK',
  'acc-2', '03933005821', 0.00,
  'BEFTN / NPSB / RTGS deposit to Need Electro.', TRUE, 5
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-6', 'Credit / Debit Card (POS)', 'CARD_POS', 'CARD',
  'acc-2', '', 2.00,
  'Visa, MasterCard, Amex via counter POS swipe terminal.', TRUE, 6
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-7', 'Credit / Customer Due', 'CREDIT_SALE', 'OTHER',
  'acc-1', '', 0.00,
  'Allowed only for pre-approved credit accounts.', TRUE, 7
) ON CONFLICT (id) DO NOTHING;


INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  'pm-8', 'Laptop EMI Facility', 'EMI_SALE', 'OTHER',
  'acc-1', '', 0.00,
  'Financed via Need Electro EMI installment system.', TRUE, 8
) ON CONFLICT (id) DO NOTHING;


INSERT INTO customers (
  id, customer_id, name, phone, email, address, nid, guarantor, customer_photo,
  credit_limit, current_balance, notes, created_at
) VALUES (
  'cust-1788778217437', 'CUST-01001', 'Amdadur Rahman', '01733983752',
  NULL, 'Moulvibazar', '', '[]'::jsonb,
  NULL, 50000.00, 0.00,
  '', '2026-09-07T10:50:17.437Z'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO emi_plans (
  id, name, duration_months, min_down_payment_percent, interest_rate_percent,
  processing_fee, late_fee_per_day, grace_period_days, is_active, version,
  description, eligibility_rules, terms_text
) VALUES (
  'emi-plan-3m', '3 Months Quick Tech Plan', 3,
  30.00, 0.00,
  300.00, 50.00, 5,
  TRUE, 1, 'Short 3-month plan with 30% down payment.',
  'Requires National ID & local guarantor.', 'Default beyond 15 days results in hardware lock.'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO emi_plans (
  id, name, duration_months, min_down_payment_percent, interest_rate_percent,
  processing_fee, late_fee_per_day, grace_period_days, is_active, version,
  description, eligibility_rules, terms_text
) VALUES (
  'emi-plan-6m', '6 Months Standard Laptop Plan', 6,
  25.00, 0.00,
  500.00, 50.00, 5,
  TRUE, 1, 'Standard 6-month laptop financing with 0% interest.',
  'Original NID copy, electricity bill, and one verified guarantor.', 'Monthly installment due within 10th of every calendar month.'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO emi_plans (
  id, name, duration_months, min_down_payment_percent, interest_rate_percent,
  processing_fee, late_fee_per_day, grace_period_days, is_active, version,
  description, eligibility_rules, terms_text
) VALUES (
  'emi-plan-9m', '9 Months Easy Installment', 9,
  20.00, 2.00,
  800.00, 50.00, 7,
  TRUE, 1, 'Extended 9-month plan with flexible monthly payments.',
  'Valid trade license or employee salary slip required.', 'Hardware warranty remains valid subject to regular installment payments.'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO emi_plans (
  id, name, duration_months, min_down_payment_percent, interest_rate_percent,
  processing_fee, late_fee_per_day, grace_period_days, is_active, version,
  description, eligibility_rules, terms_text
) VALUES (
  'emi-plan-12m', '12 Months Enterprise Student/Pro Plan', 12,
  20.00, 4.00,
  1000.00, 50.00, 7,
  TRUE, 1, 'Annual 12-month installment plan for students and professionals.',
  'Strict background verification with two local guarantors.', 'Ownership transfer completed upon payment of the final installment receipt.'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO inventory_transactions (
  id, transaction_number, date, type, product_id, product_name, branch_id,
  from_branch_id, to_branch_id, quantity, unit_cost, total_value, opening_stock,
  closing_stock, reference_type, reference_id, serial_numbers, notes, created_by
) VALUES (
  'itx-1788763054958-0', 'TX-SALE-INV-2026-1001-1', '2026-09-07T00:00:00.000Z',
  'SALE', 'prod-1788763054950', 'HP EliteBook 840 G8 Laptop',
  'branch-1', NULL, NULL,
  -1, 55000.00, 55000.00,
  2, 1, 'INVOICE',
  'INV-2026-1001', '["SN-HP-1788763054947-1"]'::jsonb, NULL,
  'Amdadur Rahman'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO inventory_transactions (
  id, transaction_number, date, type, product_id, product_name, branch_id,
  from_branch_id, to_branch_id, quantity, unit_cost, total_value, opening_stock,
  closing_stock, reference_type, reference_id, serial_numbers, notes, created_by
) VALUES (
  'itx-1788763054962-0', 'TX-SALE-INV-2026-1002-1', '2026-09-07T00:00:00.000Z',
  'SALE', 'prod-1788763054950', 'HP EliteBook 840 G8 Laptop',
  'branch-1', NULL, NULL,
  -1, 55000.00, 55000.00,
  1, 0, 'INVOICE',
  'INV-2026-1002', '["SN-HP-1788763054947-2"]'::jsonb, NULL,
  'Amdadur Rahman'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762888956', '2026-09-07T00:34:48.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'INITIAL_SETUP_COMPLETED', 'SETTINGS',
  'user-superadmin-1', 'First-time ERP setup completed. Super Admin account provisioned for contact.amdadur@gmail.com.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762888975', '2026-09-07T00:34:48.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762888986', '2026-09-07T00:34:48.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'PRODUCT_CREATED', 'INVENTORY',
  'prod-1788762888986', 'Registered new product ''HP EliteBook 840 G8 Laptop'' (TEST-LAPTOP-8984) in Laptops & Computers with 2 initial stock.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762888988', '2026-09-07T00:34:48.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'CUSTOMER_CREATED', 'CUSTOMER',
  'cust-1788762888988', 'Created customer record ''Tanvir Ahmed'' (CUST-1001, Phone: 01711888987).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762917696', '2026-09-07T00:35:17.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762917707', '2026-09-07T00:35:17.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'PRODUCT_CREATED', 'INVENTORY',
  'prod-1788762917707', 'Registered new product ''HP EliteBook 840 G8 Laptop'' (TEST-LAPTOP-7705) in Laptops & Computers with 2 initial stock.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788762917709', '2026-09-07T00:35:17.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'CUSTOMER_CREATED', 'CUSTOMER',
  'cust-1788762917709', 'Created customer record ''Tanvir Ahmed'' (CUST-1002, Phone: 01711917708).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054933', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054950', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'PRODUCT_CREATED', 'INVENTORY',
  'prod-1788763054950', 'Registered new product ''HP EliteBook 840 G8 Laptop'' (TEST-LAPTOP-4947) in Laptops & Computers with 2 initial stock.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054953', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'CUSTOMER_CREATED', 'CUSTOMER',
  'cust-1788763054953', 'Created customer record ''Tanvir Ahmed'' (CUST-1003, Phone: 01711054951).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054959', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'SALE_CREATED', 'POS',
  'INV-2026-1001', 'Created retail sale INV-2026-1001 for ৳65000 (Paid: ৳65000, Due: ৳0).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054963', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'EMI_SALE_CREATED', 'POS',
  'INV-2026-1002', 'Created EMI sale INV-2026-1002 for ৳70000 (Paid: ৳20000, Due: ৳0).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054968', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'EMI_PAYMENT_COLLECTED', 'EMI',
  'RCP-2026-0101', 'Collected EMI Installment #1 (৳8333) from Tanvir Ahmed on account EMI-2026-101. Receipt: RCP-2026-0101.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763054979', '2026-09-07T00:37:34.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'DATABASE_BACKUP_CREATED', 'SETTINGS',
  'bak-1788763054978', 'Super Admin generated manual database backup snapshot: need_electro_backup_2026-09-07T06-37-34-976Z.db (584.0 KB).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788763229833', '2026-09-07T00:40:29.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788766825588', '2026-09-07T01:40:25.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788767413184', '2026-09-07T01:50:13.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788767429240', '2026-09-07T01:50:29.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788767461394', '2026-09-07T01:51:01.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788767490860', '2026-09-07T01:51:30.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788767516381', '2026-09-07T01:51:56.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788768238123', '2026-09-07T02:03:58.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788778217423', '2026-09-07T04:50:17.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'LOGIN_SUCCESS', 'SETTINGS',
  'user-superadmin-1', 'User Amdadur Rahman (contact.amdadur@gmail.com) logged in successfully as SUPER_ADMIN.', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  'audit-1788778217439', '2026-09-07T04:50:17.000Z', 'user-superadmin-1',
  'Amdadur Rahman', 'CUSTOMER_CREATED', 'CUSTOMER',
  'cust-1788778217437', 'Created customer record ''Amdadur Rahman'' (CUST-01001, Phone: 01733983752).', '::1'
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-rent', 'Office Rent', 'OFFICE_RENT',
  'Showroom and warehouse premises rental', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-elec', 'Electricity & Utility', 'ELECTRICITY',
  'BPDB electricity bills and water utilities', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-net', 'Internet & Communications', 'INTERNET',
  'High-speed fiber line and corporate telephony', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-sal', 'Staff Salaries & Commission', 'SALARY',
  'Monthly staff compensation and sales commissions', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-trans', 'Transport & Courier', 'TRANSPORT',
  'Goods logistics, courier parcel, and fuel charges', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-mkt', 'Marketing & Advertising', 'MARKETING',
  'Facebook ads, local sponsorship, and brochures', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-maint', 'Maintenance & Repairs', 'MAINTENANCE',
  'Showroom fixtures, equipment repair, tools', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-snack', 'Office Supplies & Hospitality', 'OFFICE_SUPPLIES',
  'Tea, snacks, stationary, customer hospitality', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  'exp-other', 'Other Operating Expenses', 'OTHER',
  'Miscellaneous operating costs', TRUE, TRUE
) ON CONFLICT (id) DO NOTHING;


COMMIT;
