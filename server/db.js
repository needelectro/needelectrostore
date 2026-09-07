// NEED ELECTRO ERP — Centralized Production Relational Database Engine
// Powered by Node.js built-in node:sqlite (DatabaseSync) with WAL mode & ACID Transactions
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'need_electro.db');

export const db = new DatabaseSync(DB_PATH);

// Optimize database for concurrent high performance & integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA synchronous = NORMAL;
  PRAGMA temp_store = MEMORY;
`);

/**
 * Execute a function within a strict database transaction
 */
export function transaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  db.exec('PRAGMA defer_foreign_keys = ON;');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/**
 * Cryptographically hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations
 */
export function hashPassword(password, saltHex = null) {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `pbkdf2:sha256:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against PBKDF2 hash using timingSafeEqual
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== 'string') return false;
  if (!storedHash.startsWith('pbkdf2:sha256:')) return false;

  const parts = storedHash.split(':');
  if (parts.length !== 5) return false;

  const iterations = parseInt(parts[2], 10);
  const salt = Buffer.from(parts[3], 'hex');
  const expectedHash = Buffer.from(parts[4], 'hex');

  const actualHash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return crypto.timingSafeEqual(expectedHash, actualHash);
}

/**
 * Generate cryptographically secure random token (64-char hex)
 */
export function generateSecureToken() {
  return 'nec_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Initialize all database tables and constraints
 */
export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      company_tagline TEXT,
      sister_concern TEXT,
      main_branch_name TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      address TEXT,
      vat_registration_no TEXT,
      invoice_prefix TEXT DEFAULT 'INV-2026-',
      emi_prefix TEXT DEFAULT 'EMI-2026-',
      default_vat_percent REAL DEFAULT 5,
      currency_symbol TEXT DEFAULT '৳',
      currency_code TEXT DEFAULT 'BDT',
      enable_sms_notifications INTEGER DEFAULT 1,
      enable_whatsapp_notifications INTEGER DEFAULT 1,
      notification_template_due_soon_en TEXT,
      notification_template_due_soon_bn TEXT,
      notification_template_overdue_en TEXT,
      notification_template_overdue_bn TEXT,
      theme TEXT DEFAULT 'dark',
      logo_url TEXT,
      favicon_url TEXT,
      facebook_url TEXT,
      youtube_url TEXT,
      linkedin_url TEXT,
      whatsapp_number TEXT,
      support_email TEXT,
      footer_text TEXT,
      accent_color TEXT DEFAULT '#008CFF',
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      is_warehouse INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      is_system INTEGER DEFAULT 0,
      permissions TEXT, -- JSON array
      is_active INTEGER DEFAULT 1,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      module TEXT NOT NULL,
      action TEXT NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      is_sensitive INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE,
      role TEXT NOT NULL,
      role_id TEXT,
      branch_id TEXT NOT NULL,
      primary_branch_id TEXT,
      allowed_branch_ids TEXT, -- JSON array
      phone TEXT,
      password_hash TEXT NOT NULL,
      employee_id TEXT,
      avatar TEXT,
      active INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, SUSPENDED, PENDING
      must_change_password INTEGER DEFAULT 0,
      last_login_at TEXT,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      token TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      last_active_at TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      is_revoked INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS login_history (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT NOT NULL,
      status TEXT NOT NULL, -- SUCCESS, FAILED, LOCKED
      ip_address TEXT,
      user_agent TEXT,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories_config (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      subcategories TEXT, -- JSON array
      attributes TEXT, -- JSON array
      is_serialized_default INTEGER DEFAULT 0,
      default_warranty_months INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS brands_config (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      category_ids TEXT, -- JSON array
      logo_url TEXT,
      website TEXT,
      description TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      brand TEXT NOT NULL,
      model TEXT,
      description TEXT,
      image_url TEXT,
      purchase_price REAL DEFAULT 0,
      cost_price REAL DEFAULT 0,
      retail_price REAL DEFAULT 0,
      wholesale_price REAL DEFAULT 0,
      emi_price REAL DEFAULT 0,
      current_stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 5,
      supplier_id TEXT,
      warranty_period_months INTEGER DEFAULT 0,
      is_serialized INTEGER DEFAULT 0,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, DISCONTINUED, OUT_OF_STOCK
      specs TEXT, -- JSON object
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS product_serials (
      id TEXT PRIMARY KEY,
      serial_number TEXT UNIQUE NOT NULL,
      product_id TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      status TEXT DEFAULT 'AVAILABLE', -- AVAILABLE, SOLD, RESERVED, DEFECTIVE, RETURNED
      purchase_id TEXT,
      purchase_date TEXT,
      supplier_id TEXT,
      purchase_cost REAL DEFAULT 0,
      sale_invoice_id TEXT,
      sale_date TEXT,
      customer_id TEXT,
      emi_account_id TEXT,
      warranty_start_date TEXT,
      warranty_end_date TEXT,
      service_history TEXT, -- JSON array
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      customer_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      address TEXT,
      nid TEXT,
      guarantor TEXT, -- JSON object
      customer_photo TEXT,
      credit_limit REAL DEFAULT 0,
      current_balance REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      category TEXT,
      opening_balance REAL DEFAULT 0,
      current_payable REAL DEFAULT 0,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS financial_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL, -- CASH, BANK, MOBILE_BANKING
      account_number TEXT,
      bank_name TEXT,
      branch_name TEXT,
      balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'BDT',
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      date TEXT NOT NULL,
      subtotal REAL NOT NULL,
      overall_discount REAL DEFAULT 0,
      vat_amount REAL DEFAULT 0,
      vat_percent REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      payments TEXT, -- JSON array
      sale_type TEXT DEFAULT 'REGULAR', -- REGULAR, EMI
      emi_account_id TEXT,
      status TEXT DEFAULT 'COMPLETED', -- COMPLETED, RETURNED, VOID
      salesperson_id TEXT,
      salesperson_name TEXT,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id TEXT PRIMARY KEY,
      sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      discount REAL DEFAULT 0,
      total REAL NOT NULL,
      warranty_months INTEGER DEFAULT 0,
      is_serialized INTEGER DEFAULT 0,
      serial_numbers TEXT, -- JSON array
      FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emi_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      duration_months INTEGER NOT NULL,
      min_down_payment_percent REAL DEFAULT 20,
      interest_rate_percent REAL DEFAULT 0,
      processing_fee REAL DEFAULT 0,
      late_fee_per_day REAL DEFAULT 50,
      grace_period_days INTEGER DEFAULT 5,
      is_active INTEGER DEFAULT 1,
      version INTEGER DEFAULT 1,
      description TEXT,
      eligibility_rules TEXT,
      terms_text TEXT
    );

    CREATE TABLE IF NOT EXISTS emi_accounts (
      id TEXT PRIMARY KEY,
      emi_number TEXT UNIQUE NOT NULL,
      sale_invoice_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT,
      customer_nid TEXT,
      guarantor TEXT, -- JSON
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      serial_number TEXT NOT NULL,
      laptop_price REAL NOT NULL,
      down_payment REAL NOT NULL,
      financed_amount REAL NOT NULL,
      duration_months INTEGER NOT NULL,
      monthly_installment REAL NOT NULL,
      total_payable REAL NOT NULL,
      total_paid REAL DEFAULT 0,
      remaining_balance REAL NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      status TEXT DEFAULT 'ACTIVE', -- ACTIVE, COMPLETED, DEFAULTED, SETTLED
      contract_terms TEXT,
      approved_by TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS emi_installments (
      id TEXT PRIMARY KEY,
      emi_account_id TEXT NOT NULL,
      installment_number INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      amount REAL NOT NULL,
      penalty_amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      paid_date TEXT,
      status TEXT DEFAULT 'UPCOMING', -- UPCOMING, DUE_TODAY, PAID, PARTIALLY_PAID, OVERDUE, WAIVED
      receipt_number TEXT,
      payment_method TEXT,
      FOREIGN KEY (emi_account_id) REFERENCES emi_accounts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS emi_payments (
      id TEXT PRIMARY KEY,
      receipt_number TEXT UNIQUE NOT NULL,
      emi_account_id TEXT NOT NULL,
      emi_number TEXT NOT NULL,
      installment_id TEXT NOT NULL,
      installment_number INTEGER NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      amount REAL NOT NULL,
      penalty_paid REAL DEFAULT 0,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_ref TEXT,
      collected_by TEXT NOT NULL,
      notes TEXT,
      FOREIGN KEY (emi_account_id) REFERENCES emi_accounts(id)
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT DEFAULT 'Received',
      subtotal REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      total REAL NOT NULL,
      paid_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      payment_method TEXT,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS purchase_items (
      id TEXT PRIMARY KEY,
      purchase_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      cost_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      serial_numbers TEXT, -- JSON array
      FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS supplier_payments (
      id TEXT PRIMARY KEY,
      voucher_number TEXT UNIQUE NOT NULL,
      supplier_id TEXT NOT NULL,
      supplier_name TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      account_id TEXT,
      reference TEXT,
      notes TEXT,
      paid_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_returns (
      id TEXT PRIMARY KEY,
      return_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      sale_invoice_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      return_type TEXT NOT NULL,
      reason TEXT NOT NULL,
      items TEXT NOT NULL, -- JSON
      total_refund_amount REAL DEFAULT 0,
      refund_method TEXT NOT NULL,
      account_id TEXT,
      status TEXT DEFAULT 'COMPLETED',
      handled_by TEXT NOT NULL,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      voucher_number TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      description TEXT NOT NULL,
      attachment_name TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS service_jobs (
      id TEXT PRIMARY KEY,
      job_card_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT,
      service_type TEXT NOT NULL,
      device_or_site TEXT NOT NULL,
      serial_number TEXT,
      reported_issue TEXT NOT NULL,
      assigned_technician_id TEXT,
      assigned_technician_name TEXT,
      status TEXT DEFAULT 'Pending',
      parts_used TEXT, -- JSON
      labor_cost REAL DEFAULT 0,
      total_bill REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'UNPAID',
      payment_method TEXT,
      scheduled_date TEXT,
      completed_date TEXT,
      notes TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS technicians (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      specialization TEXT, -- JSON
      active_jobs_count INTEGER DEFAULT 0,
      completed_jobs_count INTEGER DEFAULT 0,
      total_earnings REAL DEFAULT 0,
      rating REAL DEFAULT 5.0
    );

    CREATE TABLE IF NOT EXISTS warranty_claims (
      id TEXT PRIMARY KEY,
      claim_number TEXT UNIQUE NOT NULL,
      serial_number TEXT NOT NULL,
      product_name TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      invoice_number TEXT NOT NULL,
      issue_description TEXT NOT NULL,
      claim_date TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      resolution_notes TEXT,
      resolved_date TEXT
    );

    CREATE TABLE IF NOT EXISTS investments (
      id TEXT PRIMARY KEY,
      reference_number TEXT UNIQUE NOT NULL,
      investor_name TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      investment_type TEXT NOT NULL,
      deposit_account_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      reference TEXT,
      status TEXT DEFAULT 'ACTIVE',
      notes TEXT,
      created_by TEXT NOT NULL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS fund_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      from_account_id TEXT NOT NULL,
      to_account_id TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL DEFAULT 0,
      reference TEXT,
      transferred_by TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      designation TEXT,
      branch_id TEXT NOT NULL,
      monthly_salary REAL DEFAULT 0,
      sales_commission_rate REAL DEFAULT 0,
      joined_date TEXT NOT NULL,
      nid TEXT,
      address TEXT,
      emergency_contact TEXT,
      status TEXT DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL,
      check_in_time TEXT,
      check_out_time TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS inventory_transactions (
      id TEXT PRIMARY KEY,
      transaction_number TEXT UNIQUE NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      from_branch_id TEXT,
      to_branch_id TEXT,
      quantity INTEGER NOT NULL,
      unit_cost REAL NOT NULL,
      total_value REAL NOT NULL,
      opening_stock INTEGER NOT NULL,
      closing_stock INTEGER NOT NULL,
      reference_type TEXT,
      reference_id TEXT,
      serial_numbers TEXT, -- JSON
      notes TEXT,
      created_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      party_type TEXT NOT NULL,
      party_id TEXT NOT NULL,
      reference_type TEXT NOT NULL,
      reference_number TEXT NOT NULL,
      description TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      running_balance REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      record_id TEXT NOT NULL,
      details TEXT NOT NULL,
      ip_address TEXT
    );

    CREATE TABLE IF NOT EXISTS price_audits (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      sku TEXT NOT NULL,
      price_type TEXT NOT NULL,
      old_price REAL NOT NULL,
      new_price REAL NOT NULL,
      changed_by TEXT NOT NULL,
      reason TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_merge_audits (
      id TEXT PRIMARY KEY,
      source_customer_id TEXT NOT NULL,
      source_customer_name TEXT NOT NULL,
      target_customer_id TEXT NOT NULL,
      target_customer_name TEXT NOT NULL,
      moved_invoices_count INTEGER NOT NULL,
      moved_emi_accounts_count INTEGER NOT NULL,
      moved_service_jobs_count INTEGER NOT NULL,
      performed_by TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      reason TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS opening_balances (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_name TEXT NOT NULL,
      amount REAL NOT NULL,
      notes TEXT,
      approved_by TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS configurable_payment_methods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      linked_account_id TEXT NOT NULL,
      account_number TEXT,
      charge_percent REAL DEFAULT 0,
      instructions TEXT,
      is_active INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS expense_categories_config (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      is_tax_deductible INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS service_categories_config (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      default_labor_cost REAL DEFAULT 0,
      estimated_duration_hours REAL DEFAULT 2,
      warranty_days INTEGER DEFAULT 30,
      description TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS warranty_rules_config (
      id TEXT PRIMARY KEY,
      category_name TEXT NOT NULL,
      default_months INTEGER DEFAULT 12,
      terms_text TEXT NOT NULL,
      replacement_allowed INTEGER DEFAULT 0,
      repair_allowed INTEGER DEFAULT 1,
      void_conditions TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notification_templates_config (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      channel TEXT NOT NULL,
      trigger_event TEXT NOT NULL,
      subject_template TEXT,
      template_en TEXT NOT NULL,
      template_bn TEXT NOT NULL,
      placeholders TEXT, -- JSON
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pos_settings (
      id TEXT PRIMARY KEY,
      invoice_prefix TEXT DEFAULT 'INV-2026-',
      next_invoice_number INTEGER DEFAULT 1001,
      return_window_days INTEGER DEFAULT 7,
      enable_pos_discounts INTEGER DEFAULT 1,
      max_discount_percent REAL DEFAULT 15,
      enable_credit_sales INTEGER DEFAULT 1,
      require_customer_phone INTEGER DEFAULT 1,
      default_invoice_notes TEXT,
      receipt_footer_text TEXT,
      tax_percent REAL DEFAULT 5,
      print_logo_on_receipt INTEGER DEFAULT 1,
      print_warranty_on_receipt INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS inventory_rules (
      id TEXT PRIMARY KEY,
      low_stock_threshold_default INTEGER DEFAULT 3,
      enable_out_of_stock_warnings INTEGER DEFAULT 1,
      allow_negative_stock INTEGER DEFAULT 0,
      serial_tracking_mandatory_categories TEXT, -- JSON
      auto_generate_barcode INTEGER DEFAULT 1,
      barcode_prefix TEXT DEFAULT 'NE',
      require_approval_for_inter_branch_transfer INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS setup_status (
      id TEXT PRIMARY KEY,
      is_super_admin_configured INTEGER DEFAULT 0,
      is_company_configured INTEGER DEFAULT 1,
      is_main_branch_configured INTEGER DEFAULT 1,
      is_warehouse_configured INTEGER DEFAULT 1,
      is_financial_accounts_configured INTEGER DEFAULT 1,
      is_payment_methods_configured INTEGER DEFAULT 1,
      is_emi_plans_configured INTEGER DEFAULT 1,
      is_invoice_settings_configured INTEGER DEFAULT 1,
      is_notification_configured INTEGER DEFAULT 1,
      is_opening_balances_configured INTEGER DEFAULT 0,
      initial_setup_completed INTEGER DEFAULT 0,
      system_mode TEXT DEFAULT 'PRODUCTION'
    );

    CREATE TABLE IF NOT EXISTS database_backups (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      backup_type TEXT DEFAULT 'MANUAL',
      created_at TEXT NOT NULL,
      status TEXT DEFAULT 'COMPLETED'
    );

    CREATE TABLE IF NOT EXISTS document_sequences (
      document_type TEXT PRIMARY KEY,
      prefix TEXT,
      next_number INTEGER DEFAULT 1001,
      updated_at TEXT
    );

    -- Indexes for high-speed queries
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_serials_number ON product_serials(serial_number);
    CREATE INDEX IF NOT EXISTS idx_serials_product ON product_serials(product_id);
    CREATE INDEX IF NOT EXISTS idx_serials_status ON product_serials(status);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
    CREATE INDEX IF NOT EXISTS idx_emi_accounts_number ON emi_accounts(emi_number);
    CREATE INDEX IF NOT EXISTS idx_emi_installments_due ON emi_installments(due_date);
    CREATE INDEX IF NOT EXISTS idx_inv_tx_product ON inventory_transactions(product_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_party ON ledger_entries(party_type, party_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
  `);
}

/**
 * Seed initial baseline data & provision Super Admin securely
 */
export function seedBaselineData() {
  transaction(() => {
    // 1. System Settings
    const existingSettings = db.prepare('SELECT id FROM system_settings WHERE id = ?').get('main');
    if (!existingSettings) {
      db.prepare(`
        INSERT INTO system_settings (
          id, company_name, company_tagline, sister_concern, main_branch_name,
          phone, email, website, address, vat_registration_no,
          invoice_prefix, emi_prefix, default_vat_percent, currency_symbol,
          currency_code, enable_sms_notifications, enable_whatsapp_notifications,
          notification_template_due_soon_en, notification_template_due_soon_bn,
          notification_template_overdue_en, notification_template_overdue_bn,
          theme, logo_url, favicon_url, facebook_url, youtube_url,
          linkedin_url, whatsapp_number, support_email, footer_text, accent_color, updated_at
        ) VALUES (
          'main', 'NEED ELECTRO', 'Trusted Electrical & Technological Solutions',
          'A sister Concern Of AMDADS GROUP', 'Main Branch Moulvibazar',
          '01733-983752', 'needelectro23@gmail.com', 'www.needelectro.com',
          'Shop#5, MR Plaza, Kusumbag, Moulvibazar', 'BIN: 002948123-0102',
          'INV-2026-', 'EMI-2026-', 5, '৳', 'BDT', 1, 1,
          'Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI installment of ৳{AMOUNT} for {PRODUCT_NAME} (Serial: {SERIAL}) is due on {DUE_DATE}. Pay via bKash/Nagad or visit our showroom at Shop#5, MR Plaza, Kusumbag, Moulvibazar. Hotline: 01733-983752.',
          'সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME} (সিরিয়াল: {SERIAL})-এর মাসিক কিস্তি ৳{AMOUNT} আগামী {DUE_DATE} তারিখে পরিশোধযোগ্য। বিকাশ/নগদ বা আমাদের শোরুম (শপ#৫, এমআর প্লাজা, কুসুমবাগ, মৌলভীবাজার)-এ জমা দিন। হেল্পলাইন: 01733-983752।',
          'URGENT: Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI payment of ৳{AMOUNT} is OVERDUE by {DAYS_OVERDUE} days. Please pay immediately. NEED ELECTRO (A sister Concern Of AMDADS GROUP), Kusumbag, Moulvibazar. Hotline: 01733-983752.',
          'জরুরি নোটিশ: সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME}-এর কিস্তি ৳{AMOUNT} বিগত {DAYS_OVERDUE} দিন যাবত বকেয়া রয়েছে। জরিমানা এড়াতে অবিলম্বে পরিশোধ করুন। নিড ইলেক্ট্রো, কুসুমবাগ, মৌলভীবাজার। ফোন: 01733-983752।',
          'dark', '', '', 'https://facebook.com/needelectro', 'https://youtube.com/@needelectro',
          'https://linkedin.com/company/needelectro', '+8801733983752', 'contact.amdadur@gmail.com',
          'NEED ELECTRO — Trusted Electrical & Technological Solutions. Moulvibazar, Bangladesh.',
          '#008CFF', datetime('now')
        )
      `).run();
    }

    // 2. Default Branches & Warehouses
    const branchCount = db.prepare('SELECT COUNT(*) as count FROM branches').get().count;
    if (branchCount === 0) {
      const insBranch = db.prepare(`
        INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      insBranch.run('branch-1', 'Main Branch Moulvibazar', 'MB-MAIN', 'Shop#5, MR Plaza, Kusumbag, Moulvibazar', '01733-983752', 'needelectro23@gmail.com', 0, 1);
      insBranch.run('branch-2', 'Kusumbag Tech & CCTV Hub', 'MB-TECH', 'MR Plaza Level 1, Kusumbag, Moulvibazar', '01733-983752', 'sales@needelectro.com', 0, 1);
      insBranch.run('branch-3', 'Central Warehouse & Service Hub', 'CENTRAL-WH', 'Sreemangal Road Industrial Area, Moulvibazar', '01733-983752', 'service@needelectro.com', 1, 1);
    }

    // 3. System Permissions List (Standard MODULE.ACTION Granular Format)
    const legacyPerm = db.prepare("SELECT id FROM permissions WHERE id LIKE 'perm_%' LIMIT 1").get();
    const permCount = db.prepare('SELECT COUNT(*) as count FROM permissions').get().count;

    const standardPermissions = [
      // Dashboard
      ['dashboard.view', 'dashboard', 'view', 'View Dashboard', 'Access operational KPI overview and statistics', 0],
      ['dashboard.profit', 'dashboard', 'view_profit', 'View Gross & Net Profit', 'Sensitive financial performance metrics', 1],
      // Sales & POS
      ['sales.view', 'sales', 'view', 'View Sales & Invoices', 'View past transactions and bills', 0],
      ['sales.create', 'sales', 'create', 'Create Sales (POS)', 'Issue invoices and complete cash/card/digital sales', 0],
      ['sales.discount', 'sales', 'apply_discount', 'Apply Custom Discounts', 'Discounts exceeding standard limits', 1],
      ['sales.void', 'sales', 'void', 'Void/Cancel Sale', 'Revoke or cancel existing sales invoices', 1],
      ['sales.return', 'sales', 'return', 'Process Sales Returns', 'Accept returned merchandise & refund balances', 1],
      // Laptop EMI Subsystem
      ['emi.view', 'emi', 'view', 'View EMI Accounts', 'Access customer installment ledgers and contracts', 0],
      ['emi.create', 'emi', 'create', 'Approve EMI Sale', 'Authorize high-value laptop financing agreements', 1],
      ['emi.collect', 'emi', 'collect', 'Collect EMI Payments', 'Collect installments and issue payment vouchers', 0],
      ['emi.reschedule', 'emi', 'reschedule', 'Reschedule/Waive Penalty', 'Modify payment dates or waive late penalties', 1],
      ['emi.settings', 'emi', 'manage_plans', 'Manage EMI Plans', 'Configure interest rates, durations & down payments', 1],
      // Inventory & Serials
      ['inventory.view', 'inventory', 'view', 'View Stock Levels', 'View real-time item counts and serial statuses', 0],
      ['inventory.adjust', 'inventory', 'adjust', 'Stock Adjustment', 'Manual correction of physical inventory counts', 1],
      ['inventory.transfer', 'inventory', 'transfer', 'Stock Transfer', 'Inter-branch stock shipments and transfers', 0],
      ['inventory.serials', 'inventory', 'manage_serials', 'Manage Serial Numbers', 'Track, reassign or audit serialized assets', 0],
      // Purchase
      ['purchases.view', 'purchases', 'view', 'View Purchase Orders', 'Access supplier bills and received goods logs', 0],
      ['purchases.create', 'purchases', 'create', 'Record Purchase', 'Register vendor goods receipt and payables', 0],
      // Catalog
      ['products.view', 'products', 'view', 'View Products', 'Search and review product specs and prices', 0],
      ['products.create', 'products', 'create', 'Add Products', 'Create new items in the global catalog', 0],
      ['products.edit', 'products', 'edit', 'Edit Product Details', 'Update descriptions, specs and stock rules', 0],
      ['products.pricing', 'products', 'edit_pricing', 'Change Prices (Retail/EMI)', 'Modify retail, EMI, or wholesale price lists', 1],
      // Customers & CRM
      ['customers.view', 'customers', 'view', 'View Customers', 'Search customer phone numbers and histories', 0],
      ['customers.create', 'customers', 'create', 'Create Customer', 'Register new retail or EMI clients', 0],
      ['customers.credit', 'customers', 'set_credit_limit', 'Set Customer Credit Limits', 'Authorize due sales ceiling', 1],
      ['customers.merge', 'customers', 'merge', 'Merge Duplicate Accounts', 'Consolidate multiple customer profiles', 1],
      // Suppliers
      ['suppliers.view', 'suppliers', 'view', 'View Suppliers', 'Browse supplier profiles and ledger debts', 0],
      ['suppliers.manage', 'suppliers', 'manage', 'Manage Suppliers & Pay', 'Add suppliers and disburse vendor payments', 1],
      // Services
      ['services.view', 'services', 'view', 'View Service Jobs', 'Track repair and field installation job tickets', 0],
      ['services.manage', 'services', 'manage', 'Manage Service & Bill', 'Assign technicians, record parts used, and bill', 0],
      // Warranty
      ['warranty.view', 'warranty', 'view', 'View Warranty Records', 'Check serial warranty eligibility and claims', 0],
      ['warranty.claims', 'warranty', 'process_claims', 'Process Warranty Claims', 'Approve RMA, replacements or free repairs', 0],
      // Accounting
      ['accounting.view', 'accounting', 'view', 'View Accounting Ledgers', 'Access general ledger and balance sheets', 1],
      ['accounting.transfer', 'accounting', 'transfer_funds', 'Internal Fund Transfers', 'Move cash between drawers and bank accounts', 1],
      ['accounting.invest', 'accounting', 'manage_investments', 'Record Capital & Equity', 'Manage shareholder equity and investments', 1],
      // Expenses
      ['expenses.view', 'expenses', 'view', 'View Expenses', 'Browse petty cash and operating expenditures', 0],
      ['expenses.create', 'expenses', 'create', 'Record Expense', 'Create expense vouchers and payout cash', 0],
      // Reports
      ['reports.view', 'reports', 'view', 'View Reports', 'Generate business, sales and inventory reports', 0],
      ['reports.export', 'reports', 'export', 'Export Data (PDF/Excel)', 'Download sensitive corporate reporting spreadsheets', 1],
      // Employees
      ['employees.view', 'employees', 'view', 'View Employees', 'Browse staff roster and technician records', 0],
      ['employees.manage', 'employees', 'manage', 'Manage Staff & Payroll', 'Add staff, record attendance and pay salaries', 1],
      // Roles & Security
      ['roles.manage', 'roles', 'manage', 'Manage Roles & RBAC', 'Configure security clearances and permissions', 1],
      ['users.manage', 'users', 'manage', 'Manage User Accounts', 'Create staff accounts and reset passwords', 1],
      ['audit.view', 'audit', 'view', 'View Audit Trails', 'Inspect security and financial modification logs', 1],
      ['settings.manage', 'settings', 'manage', 'Modify System Settings', 'Master company parameters and hardware options', 1],
      ['backup.manage', 'backup', 'manage', 'Database Backup & Restore', 'Manage database archives, backups and restoration', 1]
    ];

    if (permCount === 0 || legacyPerm) {
      db.prepare('DELETE FROM permissions').run();
      const insPerm = db.prepare(`
        INSERT INTO permissions (id, module, action, label, description, is_sensitive)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      standardPermissions.forEach(p => insPerm.run(...p));
    }

    // 4. Default Roles with MODULE.ACTION permissions
    const allPermIds = standardPermissions.map(p => p[0]);
    const adminPerms = allPermIds.filter(id => !['backup.manage'].includes(id));
    const managerPerms = [
      'dashboard.view', 'sales.view', 'sales.create', 'sales.discount', 'sales.return',
      'emi.view', 'emi.create', 'emi.collect',
      'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.serials',
      'purchases.view', 'purchases.create',
      'products.view', 'products.create', 'products.edit',
      'customers.view', 'customers.create', 'customers.credit',
      'suppliers.view', 'suppliers.manage',
      'services.view', 'services.manage',
      'warranty.view', 'warranty.claims',
      'expenses.view', 'expenses.create',
      'reports.view', 'reports.export',
      'employees.view'
    ];
    const salesPerms = [
      'dashboard.view', 'sales.view', 'sales.create',
      'emi.view', 'emi.collect',
      'inventory.view', 'products.view',
      'customers.view', 'customers.create',
      'services.view', 'warranty.view'
    ];
    const acctPerms = [
      'dashboard.view', 'dashboard.profit', 'sales.view', 'emi.view', 'emi.collect',
      'purchases.view', 'suppliers.view', 'suppliers.manage',
      'accounting.view', 'accounting.transfer', 'accounting.invest',
      'expenses.view', 'expenses.create', 'reports.view', 'reports.export'
    ];
    const invPerms = [
      'dashboard.view', 'inventory.view', 'inventory.adjust', 'inventory.transfer', 'inventory.serials',
      'purchases.view', 'purchases.create', 'products.view', 'products.create', 'products.edit'
    ];
    const techPerms = [
      'services.view', 'services.manage', 'warranty.view', 'warranty.claims', 'inventory.view'
    ];

    const defaultRoleConfigs = [
      ['role-superadmin', 'Super Admin', 'SUPER_ADMIN', 'Absolute unrestricted system control and configuration.', 1, JSON.stringify(allPermIds), 1],
      ['role-admin', 'Administrator', 'ADMIN', 'Full branch management, inventory, sales, customer, and reporting authority.', 1, JSON.stringify(adminPerms), 1],
      ['role-manager', 'Branch Manager', 'MANAGER', 'Supervises branch sales, customer credit, EMI approvals, and stock transfers.', 1, JSON.stringify(managerPerms), 1],
      ['role-sales', 'Sales Executive', 'SALES', 'Handles POS retail billing, EMI customer inquiries, and installment payments.', 1, JSON.stringify(salesPerms), 1],
      ['role-accountant', 'Senior Accountant', 'ACCOUNTANT', 'Oversees general ledgers, accounts receivable/payable, expenses, and financial reports.', 1, JSON.stringify(acctPerms), 1],
      ['role-inventory', 'Inventory Specialist', 'INVENTORY', 'Controls warehouse intake, serial scanning, stock adjustments, and goods dispatch.', 1, JSON.stringify(invPerms), 1],
      ['role-technician', 'Senior Technician', 'TECHNICIAN', 'Field technician for electrical installations, CCTV setup, and laptop repair jobs.', 1, JSON.stringify(techPerms), 1],
      ['role-electrician', 'Electrician', 'ELECTRICIAN', 'On-site electrical service, wiring, DB board fitting, and customer maintenance.', 1, JSON.stringify(techPerms), 1],
      ['role-employee', 'General Staff', 'EMPLOYEE', 'Standard staff member with basic dashboard and attendance features.', 1, JSON.stringify(['dashboard.view']), 1]
    ];

    const roleCount = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;
    if (roleCount === 0) {
      const insRole = db.prepare(`
        INSERT INTO roles (id, name, code, description, is_system, permissions, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      defaultRoleConfigs.forEach(r => insRole.run(...r));
    } else if (legacyPerm) {
      // Migrate existing roles to standard MODULE.ACTION format
      const updRole = db.prepare('UPDATE roles SET permissions = ? WHERE code = ? AND is_system = 1');
      defaultRoleConfigs.forEach(r => updRole.run(r[5], r[2]));
    }


    // 5. Standard Financial Accounts
    const finCount = db.prepare('SELECT COUNT(*) as count FROM financial_accounts').get().count;
    if (finCount === 0) {
      const insFin = db.prepare(`
        INSERT INTO financial_accounts (id, name, type, account_number, bank_name, branch_name, balance, currency, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insFin.run('acc-1', 'Main Cash Drawer', 'CASH', 'CASH-MB-01', 'Physical Vault', 'Moulvibazar Showroom', 0, 'BDT', 1);
      insFin.run('acc-2', 'Bank Asia Current Account', 'BANK', '03933005821', 'Bank Asia PLC', 'Moulvibazar Branch', 0, 'BDT', 1);
      insFin.run('acc-3', 'bKash Merchant Wallet', 'MOBILE_BANKING', '01733-983752', 'bKash Limited', 'Merchant Account', 0, 'BDT', 1);
      insFin.run('acc-4', 'Nagad Merchant Wallet', 'MOBILE_BANKING', '01733-983752', 'Nagad Digital', 'Merchant Account', 0, 'BDT', 1);
      insFin.run('acc-5', 'Rocket Corporate Account', 'MOBILE_BANKING', '01733-983752-9', 'Dutch-Bangla Bank', 'MFS Corporate', 0, 'BDT', 1);
    }

    // 6. Standard Configurable Payment Methods
    const pmCount = db.prepare('SELECT COUNT(*) as count FROM configurable_payment_methods').get().count;
    if (pmCount === 0) {
      const insPm = db.prepare(`
        INSERT INTO configurable_payment_methods (id, name, code, type, linked_account_id, account_number, charge_percent, instructions, is_active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insPm.run('pm-1', 'Cash', 'CASH', 'CASH', 'acc-1', '', 0, 'Accepted at counter. Verify currency security strips.', 1, 1);
      insPm.run('pm-2', 'bKash Merchant', 'BKASH', 'MFS', 'acc-3', '01733-983752', 1.5, 'Scan QR code or use Merchant Pay. Enter Counter 1.', 1, 2);
      insPm.run('pm-3', 'Nagad Merchant', 'NAGAD', 'MFS', 'acc-4', '01733-983752', 1.2, 'Pay using Nagad Merchant payment option.', 1, 3);
      insPm.run('pm-4', 'Rocket Pay', 'ROCKET', 'MFS', 'acc-5', '01733-983752-9', 1.2, 'Use DBBL Rocket Merchant payment.', 1, 4);
      insPm.run('pm-5', 'Bank Asia Transfer', 'BANK_ASIA', 'BANK', 'acc-2', '03933005821', 0, 'BEFTN / NPSB / RTGS deposit to Need Electro.', 1, 5);
      insPm.run('pm-6', 'Credit / Debit Card (POS)', 'CARD_POS', 'CARD', 'acc-2', '', 2.0, 'Visa, MasterCard, Amex via counter POS swipe terminal.', 1, 6);
      insPm.run('pm-7', 'Credit / Customer Due', 'CREDIT_SALE', 'OTHER', 'acc-1', '', 0, 'Allowed only for pre-approved credit accounts.', 1, 7);
      insPm.run('pm-8', 'Laptop EMI Facility', 'EMI_SALE', 'OTHER', 'acc-1', '', 0, 'Financed via Need Electro EMI installment system.', 1, 8);
    }

    // 7. Standard EMI Plans
    const emiPlanCount = db.prepare('SELECT COUNT(*) as count FROM emi_plans').get().count;
    if (emiPlanCount === 0) {
      const insEmiPlan = db.prepare(`
        INSERT INTO emi_plans (id, name, duration_months, min_down_payment_percent, interest_rate_percent, processing_fee, late_fee_per_day, grace_period_days, is_active, version, description, eligibility_rules, terms_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insEmiPlan.run('emi-plan-3m', '3 Months Quick Tech Plan', 3, 30, 0, 300, 50, 5, 1, 1, 'Short 3-month plan with 30% down payment.', 'Requires National ID & local guarantor.', 'Default beyond 15 days results in hardware lock.');
      insEmiPlan.run('emi-plan-6m', '6 Months Standard Laptop Plan', 6, 25, 0, 500, 50, 5, 1, 1, 'Standard 6-month laptop financing with 0% interest.', 'Original NID copy, electricity bill, and one verified guarantor.', 'Monthly installment due within 10th of every calendar month.');
      insEmiPlan.run('emi-plan-9m', '9 Months Easy Installment', 9, 20, 2, 800, 50, 7, 1, 1, 'Extended 9-month plan with flexible monthly payments.', 'Valid trade license or employee salary slip required.', 'Hardware warranty remains valid subject to regular installment payments.');
      insEmiPlan.run('emi-plan-12m', '12 Months Enterprise Student/Pro Plan', 12, 20, 4, 1000, 50, 7, 1, 1, 'Annual 12-month installment plan for students and professionals.', 'Strict background verification with two local guarantors.', 'Ownership transfer completed upon payment of the final installment receipt.');
    }

    // 8. Standard Categories & Attributes
    const catCount = db.prepare('SELECT COUNT(*) as count FROM categories_config').get().count;
    if (catCount === 0) {
      const insCat = db.prepare(`
        INSERT INTO categories_config (id, name, code, description, icon, subcategories, attributes, is_serialized_default, default_warranty_months, is_active, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insCat.run(
        'cat-laptop', 'Laptops & Ultrabooks', 'LAPTOPS', 'Refurbished and brand new laptops, notebooks & workstations', 'Laptop',
        JSON.stringify(['Business Laptops', 'Gaming Laptops', 'Ultrabooks', 'Student Laptops', 'Mobile Workstations']),
        JSON.stringify([
          { id: 'attr-proc', name: 'Processor', code: 'processor', type: 'TEXT', required: true },
          { id: 'attr-gen', name: 'Generation', code: 'generation', type: 'TEXT', required: true },
          { id: 'attr-ram', name: 'RAM Capacity', code: 'ram', type: 'SELECT', options: ['8GB', '16GB', '32GB', '64GB'], required: true },
          { id: 'attr-storage', name: 'Storage', code: 'storage', type: 'SELECT', options: ['256GB NVMe', '512GB NVMe', '1TB NVMe', '2TB NVMe'], required: true },
          { id: 'attr-display', name: 'Display Size & Panel', code: 'display', type: 'TEXT', required: true },
          { id: 'attr-gpu', name: 'Graphics (GPU)', code: 'gpu', type: 'TEXT', required: false },
          { id: 'attr-battery', name: 'Battery Health %', code: 'batteryCondition', type: 'TEXT', required: false },
          { id: 'attr-condition', name: 'Physical Condition', code: 'physicalCondition', type: 'SELECT', options: ['Brand New', 'Grade A+ Pristine', 'Grade A Light Use', 'Open Box'], required: true }
        ]),
        1, 12, 1, 1
      );
      insCat.run(
        'cat-desktop', 'Computers & Desktops', 'DESKTOPS', 'Custom desktop PCs, All-in-One systems, and mini PCs', 'Monitor',
        JSON.stringify(['All-in-One PCs', 'Custom Gaming Rigs', 'Office Desktop PCs', 'Mini PCs']),
        JSON.stringify([
          { id: 'attr-cpu', name: 'CPU', code: 'processor', type: 'TEXT', required: true },
          { id: 'attr-mobo', name: 'Motherboard', code: 'motherboard', type: 'TEXT', required: true },
          { id: 'attr-ram', name: 'RAM', code: 'ram', type: 'TEXT', required: true },
          { id: 'attr-casing', name: 'Casing & PSU', code: 'casing', type: 'TEXT', required: false }
        ]),
        1, 24, 1, 2
      );
      insCat.run(
        'cat-cctv', 'CCTV & Surveillance', 'CCTV', 'Security cameras, NVR/DVR recorders, IP cameras, power supplies', 'Shield',
        JSON.stringify(['IP Cameras', 'HD Analog Cameras', 'PTZ Cameras', 'NVR/DVR Recorders', 'Hard Disks']),
        JSON.stringify([
          { id: 'attr-res', name: 'Resolution', code: 'resolution', type: 'SELECT', options: ['2MP 1080p', '4MP 2K', '5MP', '8MP 4K'], required: true },
          { id: 'attr-night', name: 'Night Vision Mode', code: 'nightVision', type: 'SELECT', options: ['Infrared IR', 'ColorVu / Full Color', 'Smart Dual Light'], required: true },
          { id: 'attr-chan', name: 'Channels', code: 'channels', type: 'TEXT', required: false }
        ]),
        1, 24, 1, 3
      );
      insCat.run(
        'cat-electrical', 'Electrical Products', 'ELECTRICAL', 'Breakers, DB boards, industrial cables, smart switches, LED lighting', 'Zap',
        JSON.stringify(['Circuit Breakers', 'Distribution Boards', 'Smart Home Switches', 'Industrial Cables', 'LED Commercial Lighting', 'Solar Solutions']),
        JSON.stringify([
          { id: 'attr-volt', name: 'Voltage Rating', code: 'voltageRating', type: 'TEXT', required: true },
          { id: 'attr-watt', name: 'Power Wattage', code: 'powerWattage', type: 'TEXT', required: false },
          { id: 'attr-gauge', name: 'Cable Gauge (RM/Gauge)', code: 'cableGauge', type: 'TEXT', required: false },
          { id: 'attr-cert', name: 'Safety Certification', code: 'certification', type: 'TEXT', required: false }
        ]),
        0, 36, 1, 4
      );
      insCat.run(
        'cat-accessories', 'Gadgets & Accessories', 'ACCESSORIES', 'Chargers, docks, adapters, keyboards, mice, Wi-Fi routers', 'Package',
        JSON.stringify(['Original Laptop Adapters', 'Keyboards & Mice', 'Wi-Fi Routers', 'Power Banks', 'Headphones & Speakers']),
        JSON.stringify([
          { id: 'attr-compat', name: 'Compatibility', code: 'compatibility', type: 'TEXT', required: false }
        ]),
        0, 6, 1, 5
      );
    }

    // 9. Standard Brands
    const brandCount = db.prepare('SELECT COUNT(*) as count FROM brands_config').get().count;
    if (brandCount === 0) {
      const insBrand = db.prepare(`
        INSERT INTO brands_config (id, name, code, category_ids, logo_url, website, description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      insBrand.run('brand-dell', 'Dell', 'DELL', JSON.stringify(['cat-laptop', 'cat-desktop']), '', 'https://dell.com', 'Latitude, Precision, XPS, and Inspiron series', 1);
      insBrand.run('brand-hp', 'HP', 'HP', JSON.stringify(['cat-laptop', 'cat-desktop']), '', 'https://hp.com', 'EliteBook, ProBook, Pavilion, and ZBook series', 1);
      insBrand.run('brand-lenovo', 'Lenovo', 'LENOVO', JSON.stringify(['cat-laptop', 'cat-desktop']), '', 'https://lenovo.com', 'ThinkPad, Yoga, IdeaPad, and Legion series', 1);
      insBrand.run('brand-apple', 'Apple', 'APPLE', JSON.stringify(['cat-laptop', 'cat-desktop', 'cat-accessories']), '', 'https://apple.com', 'MacBook Air, MacBook Pro, and iPad series', 1);
      insBrand.run('brand-hikvision', 'Hikvision', 'HIKVISION', JSON.stringify(['cat-cctv']), '', 'https://hikvision.com', 'Leading global surveillance and access control', 1);
      insBrand.run('brand-dahua', 'Dahua', 'DAHUA', JSON.stringify(['cat-cctv']), '', 'https://dahuasecurity.com', 'Professional IP security cameras and storage', 1);
      insBrand.run('brand-schneider', 'Schneider Electric', 'SCHNEIDER', JSON.stringify(['cat-electrical']), '', 'https://se.com', 'Premium circuit protection and switchgear', 1);
      insBrand.run('brand-havells', 'Havells', 'HAVELLS', JSON.stringify(['cat-electrical']), '', 'https://havells.com', 'Industrial cables, switchgear, and fans', 1);
    }

    // 10. Standard Expense Categories
    const expCatCount = db.prepare('SELECT COUNT(*) as count FROM expense_categories_config').get().count;
    if (expCatCount === 0) {
      const insExpCat = db.prepare(`
        INSERT INTO expense_categories_config (id, name, code, description, is_tax_deductible, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      insExpCat.run('exp-rent', 'Office Rent', 'OFFICE_RENT', 'Showroom and warehouse premises rental', 1, 1);
      insExpCat.run('exp-elec', 'Electricity & Utility', 'ELECTRICITY', 'BPDB electricity bills and water utilities', 1, 1);
      insExpCat.run('exp-net', 'Internet & Communications', 'INTERNET', 'High-speed fiber line and corporate telephony', 1, 1);
      insExpCat.run('exp-sal', 'Staff Salaries & Commission', 'SALARY', 'Monthly staff compensation and sales commissions', 1, 1);
      insExpCat.run('exp-trans', 'Transport & Courier', 'TRANSPORT', 'Goods logistics, courier parcel, and fuel charges', 1, 1);
      insExpCat.run('exp-mkt', 'Marketing & Advertising', 'MARKETING', 'Facebook ads, local sponsorship, and brochures', 1, 1);
      insExpCat.run('exp-maint', 'Maintenance & Repairs', 'MAINTENANCE', 'Showroom fixtures, equipment repair, tools', 1, 1);
      insExpCat.run('exp-snack', 'Office Supplies & Hospitality', 'OFFICE_SUPPLIES', 'Tea, snacks, stationary, customer hospitality', 1, 1);
      insExpCat.run('exp-other', 'Other Operating Expenses', 'OTHER', 'Miscellaneous operating costs', 1, 1);
    }

    // 11. POS Settings
    const posRow = db.prepare('SELECT id FROM pos_settings WHERE id = ?').get('main');
    if (!posRow) {
      db.prepare(`
        INSERT INTO pos_settings (
          id, invoice_prefix, next_invoice_number, return_window_days,
          enable_pos_discounts, max_discount_percent, enable_credit_sales,
          require_customer_phone, default_invoice_notes, receipt_footer_text,
          tax_percent, print_logo_on_receipt, print_warranty_on_receipt
        ) VALUES (
          'main', 'INV-2026-', 1001, 7, 1, 15, 1, 1,
          'Goods sold with authentic warranty. Software and liquid damage not covered by warranty.',
          'Thank you for choosing NEED ELECTRO! Visit us at Shop#5, MR Plaza, Kusumbag, Moulvibazar.',
          5, 1, 1
        )
      `).run();
    }

    // 12. Inventory Rules
    const invRulesRow = db.prepare('SELECT id FROM inventory_rules WHERE id = ?').get('main');
    if (!invRulesRow) {
      db.prepare(`
        INSERT INTO inventory_rules (
          id, low_stock_threshold_default, enable_out_of_stock_warnings,
          allow_negative_stock, serial_tracking_mandatory_categories,
          auto_generate_barcode, barcode_prefix, require_approval_for_inter_branch_transfer
        ) VALUES (
          'main', 3, 1, 0,
          '["Laptops & Ultrabooks", "Computers & Desktops", "CCTV & Surveillance"]',
          1, 'NE', 1
        )
      `).run();
    }

    // 13. Setup Status Tracking
    const setupRow = db.prepare('SELECT id FROM setup_status WHERE id = ?').get('main');
    if (!setupRow) {
      db.prepare(`
        INSERT INTO setup_status (
          id, is_super_admin_configured, is_company_configured,
          is_main_branch_configured, is_warehouse_configured,
          is_financial_accounts_configured, is_payment_methods_configured,
          is_emi_plans_configured, is_invoice_settings_configured,
          is_notification_configured, is_opening_balances_configured,
          initial_setup_completed, system_mode
        ) VALUES (
          'main', 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 'PRODUCTION'
        )
      `).run();
    }

    // 14. Super Admin Provisioning via Deployment Secret
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'contact.amdadur@gmail.com').trim().toLowerCase();
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    const existingSuperAdmin = db.prepare('SELECT id, email FROM users WHERE role = ? OR email = ?').get('SUPER_ADMIN', superAdminEmail);

    if (superAdminPassword && superAdminPassword.trim().length >= 8) {
      const hashedPass = hashPassword(superAdminPassword.trim());
      if (existingSuperAdmin) {
        db.prepare(`
          UPDATE users
          SET name = 'Amdadur Rahman', email = ?, username = 'amdadur',
              password_hash = ?, role = 'SUPER_ADMIN', role_id = 'role-superadmin',
              branch_id = 'branch-1', primary_branch_id = 'branch-1',
              allowed_branch_ids = '["branch-1", "branch-2", "branch-3"]',
              phone = '01733-983752', active = 1, status = 'ACTIVE', failed_login_attempts = 0, locked_until = NULL
          WHERE id = ?
        `).run(superAdminEmail, hashedPass, existingSuperAdmin.id);
      } else {
        db.prepare(`
          INSERT INTO users (
            id, name, email, username, role, role_id, branch_id, primary_branch_id,
            allowed_branch_ids, phone, password_hash, active, status,
            failed_login_attempts, created_at
          ) VALUES (
            'user-superadmin-1', 'Amdadur Rahman', ?, 'amdadur', 'SUPER_ADMIN', 'role-superadmin',
            'branch-1', 'branch-1', '["branch-1", "branch-2", "branch-3"]',
            '01733-983752', ?, 1, 'ACTIVE', 0, datetime('now')
          )
        `).run(superAdminEmail, hashedPass);
      }

      db.prepare(`
        UPDATE setup_status
        SET is_super_admin_configured = 1, initial_setup_completed = 1
        WHERE id = 'main'
      `).run();
    } else if (existingSuperAdmin) {
      // Super Admin already exists from previous setup
      db.prepare(`
        UPDATE setup_status
        SET is_super_admin_configured = 1, initial_setup_completed = 1
        WHERE id = 'main'
      `).run();
    } else {
      // No Super Admin configured yet; mark setup as required
      db.prepare(`
        UPDATE setup_status
        SET is_super_admin_configured = 0, initial_setup_completed = 0
        WHERE id = 'main'
      `).run();
    }

    // 15. Clean up any prior test records to ensure 100% pristine real production data
    const testProducts = db.prepare("SELECT id FROM products WHERE sku LIKE 'TEST-%'").all();
    if (testProducts.length > 0) {
      db.prepare("DELETE FROM product_serials WHERE purchase_id = 'INITIAL-IMPORT' OR product_id LIKE 'prod-178876%'").run();
      db.prepare("DELETE FROM sale_items WHERE sale_id LIKE 'sale-178876%'").run();
      db.prepare("DELETE FROM sales WHERE id LIKE 'sale-178876%'").run();
      db.prepare("DELETE FROM emi_installments WHERE emi_account_id LIKE 'emi-178876%'").run();
      db.prepare("DELETE FROM emi_payments WHERE emi_account_id LIKE 'emi-178876%'").run();
      db.prepare("DELETE FROM emi_accounts WHERE id LIKE 'emi-178876%'").run();
      db.prepare("DELETE FROM inventory_transactions WHERE id LIKE 'trx-178876%' OR transaction_number LIKE 'TX-INIT-TEST%'").run();
      db.prepare("DELETE FROM ledger_entries WHERE party_id LIKE 'cust-178876%'").run();
      db.prepare("DELETE FROM customers WHERE id LIKE 'cust-178876%'").run();
      db.prepare("DELETE FROM products WHERE sku LIKE 'TEST-%'").run();
    }

    // 16. Document Sequences for sequential document tracking
    const defaultSequences = [
      ['CUSTOMER', 'CUST-', 1001],
      ['INVOICE', 'INV-2026-', 1001],
      ['PURCHASE', 'PUR-2026-', 1001],
      ['SERVICE', 'SRV-2026-', 1001],
      ['WARRANTY', 'WAR-2026-', 1001],
      ['RETURN', 'RET-2026-', 1001]
    ];
    const seqStmt = db.prepare(`
      INSERT OR IGNORE INTO document_sequences (document_type, prefix, next_number, updated_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    for (const [docType, prefix, nextNum] of defaultSequences) {
      seqStmt.run(docType, prefix, nextNum);
    }
  });
}


// Auto-run schema & baseline seed on load
initSchema();
seedBaselineData();
