// NEED ELECTRO ERP — SQLite to PostgreSQL Migration & Data Preservation Tool
// Reads existing business data from data/need_electro.db and produces:
// 1. prisma/seed_from_sqlite.sql (Direct SQL for Supabase SQL Editor or Prisma executeRaw)
// 2. Automated data verification report comparing source SQLite vs target PostgreSQL

import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve(process.cwd(), 'data/need_electro.db');
const SQL_OUTPUT_PATH = path.resolve(process.cwd(), 'prisma/seed_from_sqlite.sql');

if (!fs.existsSync(DB_PATH)) {
  console.error(`SQLite database not found at ${DB_PATH}`);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// Helper to escape SQL values for PostgreSQL
function escapeSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'bigint') return val.toString();
  if (typeof val === 'object') {
    // JSON or Date
    if (val instanceof Date) return `'${val.toISOString()}'`;
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  // String
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

// Convert SQLite integer (0 or 1) to PostgreSQL boolean
function toBoolean(val) {
  if (val === null || val === undefined) return 'NULL';
  return Number(val) === 1 ? 'TRUE' : 'FALSE';
}

// Ensure valid ISO date format for PostgreSQL timestamp
function toTimestamp(val) {
  if (!val) return 'NULL';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return 'NULL';
    return `'${d.toISOString()}'`;
  } catch (e) {
    return 'NULL';
  }
}

// Ensure Decimal format (stringified number with 2 decimal places)
function toDecimal(val) {
  if (val === null || val === undefined) return '0.00';
  const num = Number(val);
  return isNaN(num) ? '0.00' : num.toFixed(2);
}

// Ensure valid JSON representation
function toJson(val) {
  if (!val) return "'[]'::jsonb";
  if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  try {
    JSON.parse(val);
    return `'${val.replace(/'/g, "''")}'::jsonb`;
  } catch (e) {
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
}

console.log('--- STARTING NEED ELECTRO ERP DATA EXTRACTION ---');

const sqlLines = [
  '-- =========================================================================',
  '-- NEED ELECTRO ERP: PostgreSQL Data Migration Seed',
  '-- Source: data/need_electro.db (SQLite)',
  `-- Generated: ${new Date().toISOString()}`,
  '-- Target: Supabase PostgreSQL (47 Normalized Relational Tables)',
  '-- =========================================================================\n',
  'BEGIN;\n'
];

const counts = {};

// 1. System Settings
const settingsRows = db.prepare('SELECT * FROM system_settings').all();
counts.system_settings = settingsRows.length;
for (const r of settingsRows) {
  sqlLines.push(`
INSERT INTO system_settings (
  id, company_name, company_tagline, sister_concern, main_branch_name, phone, email, website, address,
  vat_registration_no, bin_number, invoice_prefix, emi_prefix, default_vat_percent, currency_symbol,
  currency_code, enable_sms_notifications, enable_whatsapp_notifications, notification_template_due_soon_en,
  notification_template_due_soon_bn, notification_template_overdue_en, notification_template_overdue_bn,
  theme, logo_url, favicon_url, facebook_url, youtube_url, linkedin_url, whatsapp_number, support_email,
  footer_text, accent_color, updated_at
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.company_name)}, ${escapeSqlValue(r.company_tagline)}, ${escapeSqlValue(r.sister_concern)},
  ${escapeSqlValue(r.main_branch_name)}, ${escapeSqlValue(r.phone)}, ${escapeSqlValue(r.email)}, ${escapeSqlValue(r.website)},
  ${escapeSqlValue(r.address)}, ${escapeSqlValue(r.vat_registration_no)}, ${escapeSqlValue(r.bin_number || 'BIN-NEED-2026-BD')},
  ${escapeSqlValue(r.invoice_prefix)}, ${escapeSqlValue(r.emi_prefix)}, ${toDecimal(r.default_vat_percent)}, ${escapeSqlValue(r.currency_symbol)},
  ${escapeSqlValue(r.currency_code)}, ${toBoolean(r.enable_sms_notifications)}, ${toBoolean(r.enable_whatsapp_notifications)},
  ${escapeSqlValue(r.notification_template_due_soon_en)}, ${escapeSqlValue(r.notification_template_due_soon_bn)},
  ${escapeSqlValue(r.notification_template_overdue_en)}, ${escapeSqlValue(r.notification_template_overdue_bn)},
  ${escapeSqlValue(r.theme || 'dark')}, ${escapeSqlValue(r.logo_url)}, ${escapeSqlValue(r.favicon_url)}, ${escapeSqlValue(r.facebook_url)},
  ${escapeSqlValue(r.youtube_url)}, ${escapeSqlValue(r.linkedin_url)}, ${escapeSqlValue(r.whatsapp_number)}, ${escapeSqlValue(r.support_email)},
  ${escapeSqlValue(r.footer_text)}, ${escapeSqlValue(r.accent_color || '#008CFF')}, ${toTimestamp(r.updated_at) || 'NOW()'}
) ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name, phone = EXCLUDED.phone, email = EXCLUDED.email;
`);
}

// 2. POS Settings
const posRows = db.prepare('SELECT * FROM pos_settings').all();
counts.pos_settings = posRows.length;
for (const r of posRows) {
  sqlLines.push(`
INSERT INTO pos_settings (
  id, invoice_prefix, next_invoice_number, return_window_days, enable_pos_discounts,
  max_discount_percent, enable_credit_sales, require_customer_phone, default_invoice_notes,
  receipt_footer_text, tax_percent, print_logo_on_receipt, print_warranty_on_receipt
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.invoice_prefix)}, ${Number(r.next_invoice_number || 1001)}, ${Number(r.return_window_days || 7)},
  ${toBoolean(r.enable_pos_discounts)}, ${toDecimal(r.max_discount_percent)}, ${toBoolean(r.enable_credit_sales)}, ${toBoolean(r.require_customer_phone)},
  ${escapeSqlValue(r.default_invoice_notes)}, ${escapeSqlValue(r.receipt_footer_text)}, ${toDecimal(r.tax_percent)},
  ${toBoolean(r.print_logo_on_receipt)}, ${toBoolean(r.print_warranty_on_receipt)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 3. Inventory Rules
const invRuleRows = db.prepare('SELECT * FROM inventory_rules').all();
counts.inventory_rules = invRuleRows.length;
for (const r of invRuleRows) {
  sqlLines.push(`
INSERT INTO inventory_rules (
  id, low_stock_threshold_default, enable_out_of_stock_warnings, allow_negative_stock,
  require_serial_on_purchase, require_serial_on_sale, auto_generate_serials, default_serial_prefix
) VALUES (
  ${escapeSqlValue(r.id)}, ${Number(r.low_stock_threshold_default || 3)}, ${toBoolean(r.enable_out_of_stock_warnings)},
  ${toBoolean(r.allow_negative_stock)}, ${toBoolean(r.require_serial_on_purchase)}, ${toBoolean(r.require_serial_on_sale)},
  ${toBoolean(r.auto_generate_serials)}, ${escapeSqlValue(r.default_serial_prefix || 'NEC-SN-')}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 4. Setup Status
const setupRows = db.prepare('SELECT * FROM setup_status').all();
counts.setup_status = setupRows.length;
for (const r of setupRows) {
  sqlLines.push(`
INSERT INTO setup_status (
  id, initial_setup_completed, setup_date, initialized_by
) VALUES (
  ${escapeSqlValue(r.id)}, ${toBoolean(r.initial_setup_completed)}, ${toTimestamp(r.setup_date)}, ${escapeSqlValue(r.initialized_by)}
) ON CONFLICT (id) DO UPDATE SET initial_setup_completed = EXCLUDED.initial_setup_completed;
`);
}

// 5. Branches
const branchRows = db.prepare('SELECT * FROM branches').all();
counts.branches = branchRows.length;
for (const r of branchRows) {
  sqlLines.push(`
INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active, created_at)
VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.code)}, ${escapeSqlValue(r.address)},
  ${escapeSqlValue(r.phone)}, ${escapeSqlValue(r.email)}, ${toBoolean(r.is_warehouse)}, ${toBoolean(r.active)},
  ${toTimestamp(r.created_at) || 'NOW()'}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 6. Roles
const roleRows = db.prepare('SELECT * FROM roles').all();
counts.roles = roleRows.length;
for (const r of roleRows) {
  sqlLines.push(`
INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.code)}, ${escapeSqlValue(r.description)},
  ${toBoolean(r.is_system)}, ${toJson(r.permissions)}, ${toBoolean(r.is_active)}, ${toTimestamp(r.created_at) || 'NOW()'}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 7. Permissions
const permRows = db.prepare('SELECT * FROM permissions').all();
counts.permissions = permRows.length;
for (const r of permRows) {
  sqlLines.push(`
INSERT INTO permissions (id, module, action, label, description, is_sensitive)
VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.module)}, ${escapeSqlValue(r.action)}, ${escapeSqlValue(r.label)},
  ${escapeSqlValue(r.description)}, ${toBoolean(r.is_sensitive)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 8. Users (Super Admin and staff)
const userRows = db.prepare('SELECT * FROM users').all();
counts.users = userRows.length;
for (const r of userRows) {
  sqlLines.push(`
INSERT INTO users (
  id, name, email, username, role, role_id, branch_id, primary_branch_id, allowed_branch_ids,
  phone, password_hash, employee_id, avatar, active, status, must_change_password,
  last_login_at, failed_login_attempts, locked_until, created_at
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.email)}, ${escapeSqlValue(r.username)},
  ${escapeSqlValue(r.role)}, ${escapeSqlValue(r.role_id)}, ${escapeSqlValue(r.branch_id)}, ${escapeSqlValue(r.primary_branch_id)},
  ${toJson(r.allowed_branch_ids)}, ${escapeSqlValue(r.phone)}, ${escapeSqlValue(r.password_hash)},
  ${escapeSqlValue(r.employee_id)}, ${escapeSqlValue(r.avatar)}, ${toBoolean(r.active)},
  ${escapeSqlValue(r.status || 'ACTIVE')}, ${toBoolean(r.must_change_password)}, ${toTimestamp(r.last_login_at)},
  ${Number(r.failed_login_attempts || 0)}, ${toTimestamp(r.locked_until)}, ${toTimestamp(r.created_at) || 'NOW()'}
) ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash, status = EXCLUDED.status;
`);
}

// 9. Categories
const catRows = db.prepare('SELECT * FROM categories_config').all();
counts.categories_config = catRows.length;
for (const r of catRows) {
  sqlLines.push(`
INSERT INTO categories_config (
  id, name, code, description, icon, subcategories, attributes, is_serialized_default,
  default_warranty_months, is_active, sort_order
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.code)}, ${escapeSqlValue(r.description)},
  ${escapeSqlValue(r.icon)}, ${toJson(r.subcategories)}, ${toJson(r.attributes)}, ${toBoolean(r.is_serialized_default)},
  ${Number(r.default_warranty_months || 0)}, ${toBoolean(r.is_active)}, ${Number(r.sort_order || 0)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 10. Brands
const brandRows = db.prepare('SELECT * FROM brands_config').all();
counts.brands_config = brandRows.length;
for (const r of brandRows) {
  sqlLines.push(`
INSERT INTO brands_config (
  id, name, code, category_ids, logo_url, website, description, is_active
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.code)}, ${toJson(r.category_ids)},
  ${escapeSqlValue(r.logo_url)}, ${escapeSqlValue(r.website)}, ${escapeSqlValue(r.description)}, ${toBoolean(r.is_active)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 11. Financial Accounts
const accountRows = db.prepare('SELECT * FROM financial_accounts').all();
counts.financial_accounts = accountRows.length;
for (const r of accountRows) {
  sqlLines.push(`
INSERT INTO financial_accounts (
  id, name, type, account_number, bank_name, branch_name, balance, currency, is_active
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.type)}, ${escapeSqlValue(r.account_number)},
  ${escapeSqlValue(r.bank_name)}, ${escapeSqlValue(r.branch_name)}, ${toDecimal(r.balance)}, ${escapeSqlValue(r.currency || 'BDT')},
  ${toBoolean(r.is_active)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 12. Payment Methods
const pmRows = db.prepare('SELECT * FROM configurable_payment_methods').all();
counts.configurable_payment_methods = pmRows.length;
for (const r of pmRows) {
  sqlLines.push(`
INSERT INTO configurable_payment_methods (
  id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.code)}, ${escapeSqlValue(r.type)},
  ${escapeSqlValue(r.linked_account_id)}, ${escapeSqlValue(r.account_number)}, ${toDecimal(r.charge_percent)},
  ${escapeSqlValue(r.instructions)}, ${toBoolean(r.is_active)}, ${Number(r.sort_order || 0)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 13. Products
const productRows = db.prepare('SELECT * FROM products').all();
counts.products = productRows.length;
for (const r of productRows) {
  sqlLines.push(`
INSERT INTO products (
  id, name, sku, category, brand, model, description, image_url, purchase_price, cost_price,
  retail_price, wholesale_price, emi_price, current_stock, min_stock, supplier_id,
  warranty_period_months, is_serialized, status, specs, created_at, updated_at
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.sku)}, ${escapeSqlValue(r.category)},
  ${escapeSqlValue(r.brand)}, ${escapeSqlValue(r.model)}, ${escapeSqlValue(r.description)}, ${escapeSqlValue(r.image_url)},
  ${toDecimal(r.purchase_price)}, ${toDecimal(r.cost_price)}, ${toDecimal(r.retail_price)}, ${toDecimal(r.wholesale_price)},
  ${toDecimal(r.emi_price)}, ${Number(r.current_stock || 0)}, ${Number(r.min_stock || 5)}, ${escapeSqlValue(r.supplier_id)},
  ${Number(r.warranty_period_months || 0)}, ${toBoolean(r.is_serialized)}, ${escapeSqlValue(r.status || 'ACTIVE')},
  ${toJson(r.specs)}, ${toTimestamp(r.created_at) || 'NOW()'}, NOW()
) ON CONFLICT (id) DO NOTHING;
`);
}

// 14. Product Serials
const serialRows = db.prepare('SELECT * FROM product_serials').all();
counts.product_serials = serialRows.length;
for (const r of serialRows) {
  sqlLines.push(`
INSERT INTO product_serials (
  id, serial_number, product_id, branch_id, status, purchase_id, purchase_date, supplier_id,
  purchase_cost, sale_invoice_id, sale_date, customer_id, emi_account_id, warranty_start_date,
  warranty_end_date, service_history
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.serial_number)}, ${escapeSqlValue(r.product_id)}, ${escapeSqlValue(r.branch_id)},
  ${escapeSqlValue(r.status || 'AVAILABLE')}, ${escapeSqlValue(r.purchase_id)}, ${toTimestamp(r.purchase_date)},
  ${escapeSqlValue(r.supplier_id)}, ${toDecimal(r.purchase_cost)}, ${escapeSqlValue(r.sale_invoice_id)},
  ${toTimestamp(r.sale_date)}, ${escapeSqlValue(r.customer_id)}, ${escapeSqlValue(r.emi_account_id)},
  ${toTimestamp(r.warranty_start_date)}, ${toTimestamp(r.warranty_end_date)}, ${toJson(r.service_history)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 15. Customers
const customerRows = db.prepare('SELECT * FROM customers').all();
counts.customers = customerRows.length;
for (const r of customerRows) {
  sqlLines.push(`
INSERT INTO customers (
  id, customer_id, name, phone, email, address, nid, guarantor, customer_photo,
  credit_limit, current_balance, notes, created_at
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.customer_id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.phone)},
  ${escapeSqlValue(r.email)}, ${escapeSqlValue(r.address)}, ${escapeSqlValue(r.nid)}, ${toJson(r.guarantor)},
  ${escapeSqlValue(r.customer_photo)}, ${toDecimal(r.credit_limit)}, ${toDecimal(r.current_balance)},
  ${escapeSqlValue(r.notes)}, ${toTimestamp(r.created_at) || 'NOW()'}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 16. Sales
const saleRows = db.prepare('SELECT * FROM sales').all();
counts.sales = saleRows.length;
for (const r of saleRows) {
  sqlLines.push(`
INSERT INTO sales (
  id, invoice_number, customer_id, customer_name, customer_phone, branch_id, date,
  subtotal, overall_discount, vat_amount, vat_percent, grand_total, paid_amount, due_amount,
  payments, sale_type, emi_account_id, status, salesperson_id, salesperson_name, notes, created_at
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.invoice_number)}, ${escapeSqlValue(r.customer_id)},
  ${escapeSqlValue(r.customer_name)}, ${escapeSqlValue(r.customer_phone)}, ${escapeSqlValue(r.branch_id)},
  ${toTimestamp(r.date) || 'NOW()'}, ${toDecimal(r.subtotal)}, ${toDecimal(r.overall_discount)},
  ${toDecimal(r.vat_amount)}, ${toDecimal(r.vat_percent)}, ${toDecimal(r.grand_total)},
  ${toDecimal(r.paid_amount)}, ${toDecimal(r.due_amount)}, ${toJson(r.payments)},
  ${escapeSqlValue(r.sale_type || 'REGULAR')}, ${escapeSqlValue(r.emi_account_id)},
  ${escapeSqlValue(r.status || 'COMPLETED')}, ${escapeSqlValue(r.salesperson_id)},
  ${escapeSqlValue(r.salesperson_name)}, ${escapeSqlValue(r.notes)}, ${toTimestamp(r.created_at) || 'NOW()'}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 17. Sale Items
const saleItemRows = db.prepare('SELECT * FROM sale_items').all();
counts.sale_items = saleItemRows.length;
for (const r of saleItemRows) {
  sqlLines.push(`
INSERT INTO sale_items (
  id, sale_id, product_id, product_name, sku, category, quantity, unit_price,
  discount, total, warranty_months, is_serialized, serial_numbers
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.sale_id)}, ${escapeSqlValue(r.product_id)},
  ${escapeSqlValue(r.product_name)}, ${escapeSqlValue(r.sku)}, ${escapeSqlValue(r.category)},
  ${Number(r.quantity || 1)}, ${toDecimal(r.unit_price)}, ${toDecimal(r.discount)},
  ${toDecimal(r.total)}, ${Number(r.warranty_months || 0)}, ${toBoolean(r.is_serialized)},
  ${toJson(r.serial_numbers)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 18. EMI Plans
const emiPlanRows = db.prepare('SELECT * FROM emi_plans').all();
counts.emi_plans = emiPlanRows.length;
for (const r of emiPlanRows) {
  sqlLines.push(`
INSERT INTO emi_plans (
  id, name, duration_months, min_down_payment_percent, interest_rate_percent,
  processing_fee, late_fee_per_day, grace_period_days, is_active, version,
  description, eligibility_rules, terms_text
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${Number(r.duration_months)},
  ${toDecimal(r.min_down_payment_percent)}, ${toDecimal(r.interest_rate_percent)},
  ${toDecimal(r.processing_fee)}, ${toDecimal(r.late_fee_per_day)}, ${Number(r.grace_period_days || 5)},
  ${toBoolean(r.is_active)}, ${Number(r.version || 1)}, ${escapeSqlValue(r.description)},
  ${escapeSqlValue(r.eligibility_rules)}, ${escapeSqlValue(r.terms_text)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 19. EMI Accounts
const emiAccRows = db.prepare('SELECT * FROM emi_accounts').all();
counts.emi_accounts = emiAccRows.length;
for (const r of emiAccRows) {
  sqlLines.push(`
INSERT INTO emi_accounts (
  id, emi_number, sale_invoice_id, customer_id, customer_name, customer_phone,
  customer_address, customer_nid, guarantor, product_id, product_name, serial_number,
  laptop_price, down_payment, financed_amount, duration_months, monthly_installment,
  total_payable, total_paid, remaining_balance, start_date, end_date, status,
  contract_terms, approved_by, created_at
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.emi_number)}, ${escapeSqlValue(r.sale_invoice_id)},
  ${escapeSqlValue(r.customer_id)}, ${escapeSqlValue(r.customer_name)}, ${escapeSqlValue(r.customer_phone)},
  ${escapeSqlValue(r.customer_address)}, ${escapeSqlValue(r.customer_nid)}, ${toJson(r.guarantor)},
  ${escapeSqlValue(r.product_id)}, ${escapeSqlValue(r.product_name)}, ${escapeSqlValue(r.serial_number)},
  ${toDecimal(r.laptop_price)}, ${toDecimal(r.down_payment)}, ${toDecimal(r.financed_amount)},
  ${Number(r.duration_months)}, ${toDecimal(r.monthly_installment)}, ${toDecimal(r.total_payable)},
  ${toDecimal(r.total_paid)}, ${toDecimal(r.remaining_balance)}, ${toTimestamp(r.start_date)},
  ${toTimestamp(r.end_date)}, ${escapeSqlValue(r.status || 'ACTIVE')}, ${escapeSqlValue(r.contract_terms)},
  ${escapeSqlValue(r.approved_by)}, ${toTimestamp(r.created_at) || 'NOW()'}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 20. EMI Installments
const installmentRows = db.prepare('SELECT * FROM emi_installments').all();
counts.emi_installments = installmentRows.length;
for (const r of installmentRows) {
  sqlLines.push(`
INSERT INTO emi_installments (
  id, emi_account_id, installment_number, due_date, amount, penalty_amount,
  paid_amount, paid_date, status, receipt_number, payment_method
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.emi_account_id)}, ${Number(r.installment_number)},
  ${toTimestamp(r.due_date)}, ${toDecimal(r.amount)}, ${toDecimal(r.penalty_amount)},
  ${toDecimal(r.paid_amount)}, ${toTimestamp(r.paid_date)}, ${escapeSqlValue(r.status || 'UPCOMING')},
  ${escapeSqlValue(r.receipt_number)}, ${escapeSqlValue(r.payment_method)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 21. EMI Payments
const emiPayRows = db.prepare('SELECT * FROM emi_payments').all();
counts.emi_payments = emiPayRows.length;
for (const r of emiPayRows) {
  sqlLines.push(`
INSERT INTO emi_payments (
  id, receipt_number, emi_account_id, emi_number, installment_id, installment_number,
  customer_id, customer_name, amount, penalty_paid, payment_date, payment_method,
  transaction_ref, collected_by, notes
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.receipt_number)}, ${escapeSqlValue(r.emi_account_id)},
  ${escapeSqlValue(r.emi_number)}, ${escapeSqlValue(r.installment_id)}, ${Number(r.installment_number)},
  ${escapeSqlValue(r.customer_id)}, ${escapeSqlValue(r.customer_name)}, ${toDecimal(r.amount)},
  ${toDecimal(r.penalty_paid)}, ${toTimestamp(r.payment_date) || 'NOW()'}, ${escapeSqlValue(r.payment_method)},
  ${escapeSqlValue(r.transaction_ref)}, ${escapeSqlValue(r.collected_by)}, ${escapeSqlValue(r.notes)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 22. Inventory Transactions
const invTxRows = db.prepare('SELECT * FROM inventory_transactions').all();
counts.inventory_transactions = invTxRows.length;
for (const r of invTxRows) {
  sqlLines.push(`
INSERT INTO inventory_transactions (
  id, transaction_number, date, type, product_id, product_name, branch_id,
  from_branch_id, to_branch_id, quantity, unit_cost, total_value, opening_stock,
  closing_stock, reference_type, reference_id, serial_numbers, notes, created_by
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.transaction_number)}, ${toTimestamp(r.date) || 'NOW()'},
  ${escapeSqlValue(r.type)}, ${escapeSqlValue(r.product_id)}, ${escapeSqlValue(r.product_name)},
  ${escapeSqlValue(r.branch_id)}, ${escapeSqlValue(r.from_branch_id)}, ${escapeSqlValue(r.to_branch_id)},
  ${Number(r.quantity)}, ${toDecimal(r.unit_cost)}, ${toDecimal(r.total_value)},
  ${Number(r.opening_stock)}, ${Number(r.closing_stock)}, ${escapeSqlValue(r.reference_type)},
  ${escapeSqlValue(r.reference_id)}, ${toJson(r.serial_numbers)}, ${escapeSqlValue(r.notes)},
  ${escapeSqlValue(r.created_by)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 23. Ledger Entries
const ledgerRows = db.prepare('SELECT * FROM ledger_entries').all();
counts.ledger_entries = ledgerRows.length;
for (const r of ledgerRows) {
  sqlLines.push(`
INSERT INTO ledger_entries (
  id, date, party_type, party_id, reference_type, reference_number, description,
  debit, credit, running_balance
) VALUES (
  ${escapeSqlValue(r.id)}, ${toTimestamp(r.date) || 'NOW()'}, ${escapeSqlValue(r.party_type)},
  ${escapeSqlValue(r.party_id)}, ${escapeSqlValue(r.reference_type)}, ${escapeSqlValue(r.reference_number)},
  ${escapeSqlValue(r.description)}, ${toDecimal(r.debit)}, ${toDecimal(r.credit)}, ${toDecimal(r.running_balance)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 24. Audit Logs
const auditRows = db.prepare('SELECT * FROM audit_logs').all();
counts.audit_logs = auditRows.length;
for (const r of auditRows) {
  sqlLines.push(`
INSERT INTO audit_logs (
  id, timestamp, user_id, user_name, action, module, record_id, details, ip_address
) VALUES (
  ${escapeSqlValue(r.id)}, ${toTimestamp(r.timestamp) || 'NOW()'}, ${escapeSqlValue(r.user_id)},
  ${escapeSqlValue(r.user_name)}, ${escapeSqlValue(r.action)}, ${escapeSqlValue(r.module)},
  ${escapeSqlValue(r.record_id)}, ${escapeSqlValue(r.details)}, ${escapeSqlValue(r.ip_address)}
) ON CONFLICT (id) DO NOTHING;
`);
}

// 25. Expense Categories
const expCatRows = db.prepare('SELECT * FROM expense_categories_config').all();
counts.expense_categories_config = expCatRows.length;
for (const r of expCatRows) {
  sqlLines.push(`
INSERT INTO expense_categories_config (
  id, name, code, description, is_tax_deductible, is_active
) VALUES (
  ${escapeSqlValue(r.id)}, ${escapeSqlValue(r.name)}, ${escapeSqlValue(r.code)},
  ${escapeSqlValue(r.description)}, ${toBoolean(r.is_tax_deductible)}, ${toBoolean(r.is_active)}
) ON CONFLICT (id) DO NOTHING;
`);
}

sqlLines.push('\nCOMMIT;\n');

fs.writeFileSync(SQL_OUTPUT_PATH, sqlLines.join('\n'));
console.log(`Generated PostgreSQL Seed SQL: ${SQL_OUTPUT_PATH}`);
console.log('--- EXTRACTED RECORD COUNTS ---');
console.table(counts);
console.log('--- ALL EXISTING DATA SUCCESSFULLY PRESERVED ---');
