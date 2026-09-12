// NEED ELECTRO ERP — Universal Enterprise Production Data Seeder
// Synchronizes authentic commercial data across BOTH:
// 1. Supabase PostgreSQL (Cloud Database via Prisma)
// 2. SQLite (Local / Offline Database at data/need_electro.db via DatabaseSync)

import { PrismaClient, Prisma } from '@prisma/client';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const prisma = new PrismaClient();
const dbPath = path.resolve('data/need_electro.db');
const sqlite = new DatabaseSync(dbPath);

console.log('================================================================');
console.log('  NEED ELECTRO ERP — COMPREHENSIVE PRODUCTION DATA SYNCHRONIZATION');
console.log('  Dual Targets: Supabase PostgreSQL (Cloud) & SQLite (Local WAL)');
console.log('================================================================\n');

async function syncAll() {
  // -------------------------------------------------------------
  // 1. SYSTEM SETTINGS
  // -------------------------------------------------------------
  console.log('[1/16] Synchronizing System Settings...');
  const settingsData = {
    id: 'main',
    companyName: 'NEED ELECTRO',
    companyTagline: 'Trusted Electrical & Technological Solutions',
    sisterConcern: 'A sister Concern Of AMDADS GROUP',
    mainBranchName: 'Main Branch Moulvibazar',
    phone: '+880 1733-983752',
    email: 'info.needelectro@gmail.com',
    website: 'https://needelectroerp.vercel.app',
    address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh',
    vatRegistrationNo: 'BIN: 002948123-0102',
    binNumber: 'BIN: 002948123-0102',
    invoicePrefix: 'INV-2026-',
    emiPrefix: 'EMI-2026-',
    defaultVatPercent: new Prisma.Decimal('5.0'),
    currencySymbol: '৳',
    currencyCode: 'BDT',
    enableSmsNotifications: true,
    enableWhatsappNotifications: true,
    notificationTemplateDueSoonEn: 'Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI installment of ৳{AMOUNT} for {PRODUCT_NAME} (Serial: {SERIAL}) is due on {DUE_DATE}. Pay via bKash/Nagad or visit our showroom at Shop#5, MR Plaza, Kusumbag, Moulvibazar. Hotline: 01733-983752.',
    notificationTemplateDueSoonBn: 'সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME} (সিরিয়াল: {SERIAL})-এর মাসিক কিস্তি ৳{AMOUNT} আগামী {DUE_DATE} তারিখে পরিশোধযোগ্য। বিকাশ/নগদ বা আমাদের শোরুম (শপ#৫, এমআর প্লাজা, কুসুমবাগ, মৌলভীবাজার)-এ জমা দিন। হেল্পলাইন: 01733-983752।',
    notificationTemplateOverdueEn: 'URGENT: Dear {CUSTOMER_NAME}, your NEED ELECTRO EMI payment of ৳{AMOUNT} is OVERDUE by {DAYS_OVERDUE} days. Please pay immediately. NEED ELECTRO (A sister Concern Of AMDADS GROUP), Kusumbag, Moulvibazar. Hotline: 01733-983752.',
    notificationTemplateOverdueBn: 'জরুরি নোটিশ: সম্মানিত {CUSTOMER_NAME}, আপনার {PRODUCT_NAME}-এর কিস্তি ৳{AMOUNT} বিগত {DAYS_OVERDUE} দিন যাবত বকেয়া রয়েছে। বিলম্ব ফি এড়াতে দ্রুত পরিশোধের জন্য অনুরোধ করা যাচ্ছে। নীড ইলেক্ট্রো, মৌলভীবাজার। ফোন: 01733-983752।',
    theme: 'dark',
    whatsappNumber: '01733-983752',
    supportEmail: 'info.needelectro@gmail.com',
    footerText: 'NEED ELECTRO — Trusted Electrical & Technological Solutions. Moulvibazar, Bangladesh.',
    accentColor: '#008CFF',
  };

  await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: settingsData,
    create: settingsData,
  });

  sqlite.exec(`
    INSERT INTO system_settings (
      id, company_name, company_tagline, sister_concern, main_branch_name, phone, email,
      website, address, vat_registration_no, invoice_prefix, emi_prefix, default_vat_percent,
      currency_symbol, currency_code, enable_sms_notifications, enable_whatsapp_notifications,
      theme, whatsapp_number, support_email, footer_text, accent_color
    ) VALUES (
      'main', 'NEED ELECTRO', 'Trusted Electrical & Technological Solutions', 'A sister Concern Of AMDADS GROUP',
      'Main Branch Moulvibazar', '+880 1733-983752', 'info.needelectro@gmail.com', 'https://needelectroerp.vercel.app',
      'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh', 'BIN: 002948123-0102', 'INV-2026-', 'EMI-2026-',
      5.0, '৳', 'BDT', 1, 1, 'dark', '01733-983752', 'info.needelectro@gmail.com',
      'NEED ELECTRO — Trusted Electrical & Technological Solutions. Moulvibazar, Bangladesh.', '#008CFF'
    ) ON CONFLICT(id) DO UPDATE SET
      company_name = excluded.company_name,
      company_tagline = excluded.company_tagline,
      sister_concern = excluded.sister_concern,
      main_branch_name = excluded.main_branch_name,
      phone = excluded.phone,
      email = excluded.email,
      website = excluded.website,
      address = excluded.address,
      vat_registration_no = excluded.vat_registration_no,
      invoice_prefix = excluded.invoice_prefix,
      emi_prefix = excluded.emi_prefix,
      default_vat_percent = excluded.default_vat_percent,
      currency_symbol = excluded.currency_symbol,
      currency_code = excluded.currency_code,
      enable_sms_notifications = excluded.enable_sms_notifications,
      enable_whatsapp_notifications = excluded.enable_whatsapp_notifications,
      theme = excluded.theme,
      whatsapp_number = excluded.whatsapp_number,
      support_email = excluded.support_email,
      footer_text = excluded.footer_text,
      accent_color = excluded.accent_color;
  `);

  await prisma.setupStatus.upsert({
    where: { id: 'main' },
    update: { initialSetupCompleted: true, initializedBy: 'contact.amdadur@gmail.com' },
    create: { id: 'main', initialSetupCompleted: true, initializedBy: 'contact.amdadur@gmail.com' },
  });

  sqlite.exec(`
    INSERT INTO setup_status (id, initial_setup_completed, is_super_admin_configured)
    VALUES ('main', 1, 1)
    ON CONFLICT(id) DO UPDATE SET initial_setup_completed = 1, is_super_admin_configured = 1;
  `);

  // -------------------------------------------------------------
  // 2. BRANCHES
  // -------------------------------------------------------------
  console.log('[2/16] Synchronizing Branches...');
  const branches = [
    {
      id: 'branch-1',
      name: 'Main Branch Moulvibazar',
      code: 'MB-MAIN',
      address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar',
      phone: '01733-983752',
      email: 'info.needelectro@gmail.com',
      isWarehouse: false,
      active: true,
    },
    {
      id: 'branch-2',
      name: 'Kusumbag Tech & CCTV Hub',
      code: 'MB-TECH',
      address: 'MR Plaza Level 1, Kusumbag, Moulvibazar',
      phone: '01733-983752',
      email: 'sales@needelectro.com',
      isWarehouse: false,
      active: true,
    },
    {
      id: 'branch-3',
      name: 'Central Warehouse & Service Hub',
      code: 'CENTRAL-WH',
      address: 'Sreemangal Road Industrial Area, Moulvibazar',
      phone: '01733-983752',
      email: 'service@needelectro.com',
      isWarehouse: true,
      active: true,
    },
    {
      id: 'branch-4',
      name: 'Sylhet Regional Outlet',
      code: 'SYL-ZIN',
      address: 'City Center Level 2, Zindabazar, Sylhet',
      phone: '01733-983752',
      email: 'sylhet@needelectro.com',
      isWarehouse: false,
      active: true,
    },
  ];

  for (const b of branches) {
    await prisma.branch.upsert({
      where: { code: b.code },
      update: b,
      create: b,
    });
    sqlite.prepare(`
      INSERT INTO branches (id, name, code, address, phone, email, is_warehouse, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, address=excluded.address, phone=excluded.phone;
    `).run(b.id, b.name, b.code, b.address, b.phone, b.email, b.isWarehouse ? 1 : 0, b.active ? 1 : 0);
  }

  // -------------------------------------------------------------
  // 3. CATEGORIES & BRANDS
  // -------------------------------------------------------------
  console.log('[3/16] Synchronizing Product Categories & Brands...');
  const categories = [
    { id: 'cat-laptop', name: 'Laptops & Computers', code: 'LAPTOPS', description: 'Business, gaming, and ultrabook laptops with serial tracking' },
    { id: 'cat-desktop', name: 'Desktops & All-in-Ones', code: 'DESKTOPS', description: 'Brand PC, custom desktop rigs, and all-in-one workstations' },
    { id: 'cat-monitor', name: 'Monitors & Displays', code: 'MONITORS', description: 'IPS, gaming, and 4K professional color-accurate displays' },
    { id: 'cat-smartphones', name: 'Smartphones & Tablets', code: 'MOBILES', description: 'Android smartphones, iPhones, and iPads' },
    { id: 'cat-cctv', name: 'CCTV & Security', code: 'CCTV', description: 'HD cameras, IP cameras, DVRs, NVRs, and security power supplies' },
    { id: 'cat-network', name: 'Networking Devices', code: 'NETWORKING', description: 'Gigabit routers, optical fiber ONU, switches, and patch cords' },
    { id: 'cat-accessories', name: 'Computer Accessories', code: 'ACCESSORIES', description: 'Keyboards, mice, webcams, SSDs, RAM, and USB hubs' },
    { id: 'cat-electrical', name: 'Electrical & Power', code: 'ELECTRICAL', description: 'Voltage stabilizers, offline/online UPS, circuit breakers, and fans' },
    { id: 'cat-chargers', name: 'Chargers & Adapters', code: 'CHARGERS', description: 'Laptop power adapters, fast GaN chargers, and surge protectors' },
  ];

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await prisma.categoryConfig.upsert({
      where: { id: c.id },
      update: { name: c.name, code: c.code, description: c.description, isActive: true, sortOrder: i + 1 },
      create: { id: c.id, name: c.name, code: c.code, description: c.description, isActive: true, sortOrder: i + 1 },
    });
    sqlite.prepare(`
      INSERT INTO categories_config (id, name, code, description, is_active, sort_order)
      VALUES (?, ?, ?, ?, 1, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, description=excluded.description;
    `).run(c.id, c.name, c.code, c.description, i + 1);
  }

  const brands = [
    { id: 'brand-hp', name: 'HP', code: 'HP' },
    { id: 'brand-apple', name: 'Apple', code: 'APPLE' },
    { id: 'brand-asus', name: 'Asus', code: 'ASUS' },
    { id: 'brand-dell', name: 'Dell', code: 'DELL' },
    { id: 'brand-lenovo', name: 'Lenovo', code: 'LENOVO' },
    { id: 'brand-samsung', name: 'Samsung', code: 'SAMSUNG' },
    { id: 'brand-xiaomi', name: 'Xiaomi', code: 'XIAOMI' },
    { id: 'brand-hikvision', name: 'Hikvision', code: 'HIKVISION' },
    { id: 'brand-dahua', name: 'Dahua', code: 'DAHUA' },
    { id: 'brand-tplink', name: 'TP-Link', code: 'TPLINK' },
    { id: 'brand-mikrotik', name: 'MikroTik', code: 'MIKROTIK' },
    { id: 'brand-logitech', name: 'Logitech', code: 'LOGITECH' },
    { id: 'brand-anker', name: 'Anker', code: 'ANKER' },
    { id: 'brand-walton', name: 'Walton', code: 'WALTON' },
    { id: 'brand-superstar', name: 'Super Star', code: 'SUPERSTAR' },
  ];

  for (const b of brands) {
    await prisma.brandConfig.upsert({
      where: { id: b.id },
      update: { name: b.name, code: b.code, isActive: true },
      create: { id: b.id, name: b.name, code: b.code, isActive: true },
    });
    sqlite.prepare(`
      INSERT INTO brands_config (id, name, code, is_active)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name;
    `).run(b.id, b.name, b.code);
  }

  // -------------------------------------------------------------
  // 4. FINANCIAL ACCOUNTS
  // -------------------------------------------------------------
  console.log('[4/16] Synchronizing Financial Accounts...');
  const accounts = [
    {
      id: 'acc-1',
      name: 'Main Cash Drawer (Moulvibazar Showroom)',
      type: 'CASH',
      accountNumber: 'CASH-MB-01',
      bankName: 'Cash in Hand Vault',
      branchName: 'Moulvibazar Main',
      balance: new Prisma.Decimal('185000.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-2',
      name: 'Bank Asia Current Account',
      type: 'BANK',
      accountNumber: '03933005821',
      bankName: 'Bank Asia PLC',
      branchName: 'Moulvibazar Branch',
      balance: new Prisma.Decimal('650000.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-3',
      name: 'bKash Merchant Wallet',
      type: 'MOBILE_BANKING',
      accountNumber: '01733983752',
      bankName: 'bKash Limited',
      branchName: 'Digital Merchant',
      balance: new Prisma.Decimal('94500.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-4',
      name: 'Nagad Business Gateway',
      type: 'MOBILE_BANKING',
      accountNumber: '01733983752',
      bankName: 'Nagad Bangladesh Post Office',
      branchName: 'Digital Merchant',
      balance: new Prisma.Decimal('42000.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-5',
      name: 'Islami Bank Bangladesh PLC',
      type: 'BANK',
      accountNumber: '20501450200892',
      bankName: 'Islami Bank Bangladesh PLC',
      branchName: 'Moulvibazar Corporate',
      balance: new Prisma.Decimal('420000.00'),
      currency: 'BDT',
      isActive: true,
    },
  ];

  for (const acc of accounts) {
    await prisma.financialAccount.upsert({
      where: { id: acc.id },
      update: acc,
      create: acc,
    });
    sqlite.prepare(`
      INSERT INTO financial_accounts (id, name, type, account_number, bank_name, branch_name, balance, currency, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET balance=excluded.balance, name=excluded.name;
    `).run(acc.id, acc.name, acc.type, acc.accountNumber, acc.bankName, acc.branchName, Number(acc.balance), acc.currency);
  }

  // -------------------------------------------------------------
  // 5. SUPPLIERS
  // -------------------------------------------------------------
  console.log('[5/16] Synchronizing Authorized BD Suppliers...');
  const suppliers = [
    {
      id: 'supp-1',
      name: 'Smart Technologies (BD) Ltd',
      company: 'Smart Technologies (BD) Ltd',
      phone: '01713-004455',
      email: 'sylhet.corporate@smart-bd.com',
      address: 'Smart Tower, Sonargaon Road, Dhaka / Sylhet Regional Branch',
      category: 'Laptops & Computers',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('120000.00'),
    },
    {
      id: 'supp-2',
      name: 'Global Brand PLC',
      company: 'Global Brand PLC',
      phone: '01713-259300',
      email: 'orders@globalbrand.com.bd',
      address: '19/2 West Panthapath, Dhaka',
      category: 'Networking & Monitors',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('85000.00'),
    },
    {
      id: 'supp-3',
      name: 'Computer Source Ltd',
      company: 'Computer Source Ltd',
      phone: '01711-592233',
      email: 'sales@computersourcebd.com',
      address: 'IDB Bhaban 3rd Floor, Agargaon, Dhaka',
      category: 'Computer Accessories',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('0.00'),
    },
    {
      id: 'supp-4',
      name: 'Excel Technologies Ltd',
      company: 'Excel Technologies Ltd',
      phone: '01713-019922',
      email: 'cctv.division@excelbd.com',
      address: 'BCS Computer City, Agargaon, Dhaka',
      category: 'CCTV & Security',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('45000.00'),
    },
    {
      id: 'supp-5',
      name: 'Star Tech & Engineering Ltd Wholesale',
      company: 'Star Tech & Engineering Ltd',
      phone: '01709-995522',
      email: 'wholesale@startech.com.bd',
      address: 'Zindabazar Branch, Sylhet',
      category: 'Laptops & Smartphones',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('32000.00'),
    },
  ];

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
    sqlite.prepare(`
      INSERT INTO suppliers (id, name, company, phone, email, address, category, opening_balance, current_payable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, phone=excluded.phone, current_payable=excluded.current_payable;
    `).run(s.id, s.name, s.company, s.phone, s.email, s.address, s.category, Number(s.openingBalance), Number(s.currentPayable));
  }

  // -------------------------------------------------------------
  // 6. PRODUCTS & INVENTORY
  // -------------------------------------------------------------
  console.log('[6/16] Synchronizing Master Product Catalog (12+ Items)...');
  const products = [
    {
      id: 'prod-hp-430-g8',
      name: 'HP ProBook 430 G8 Core i5 11th Gen (8GB RAM / 256GB NVMe SSD)',
      sku: 'HP-PB-430-G8-256',
      category: 'Laptops & Computers',
      brand: 'HP',
      model: 'ProBook 430 G8',
      description: 'Compact 13.3" business laptop with Intel Core i5-1135G7, 8GB DDR4 RAM, 256GB PCIe NVMe SSD, backlit keyboard, fingerprint reader, and aluminum chassis.',
      imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('33500.00'),
      costPrice: new Prisma.Decimal('34500.00'),
      retailPrice: new Prisma.Decimal('38500.00'),
      wholesalePrice: new Prisma.Decimal('36000.00'),
      emiPrice: new Prisma.Decimal('41500.00'),
      currentStock: 6,
      minStock: 2,
      supplierId: 'supp-1',
      warrantyPeriodMonths: 24,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { processor: 'Intel Core i5-1135G7 (Up to 4.2 GHz)', ram: '8GB DDR4 3200MHz', storage: '256GB PCIe NVMe SSD', display: '13.3" FHD (1920 x 1080) IPS Anti-glare', battery: '3-cell 45Wh Li-ion', condition: 'Official Brand New' },
    },
    {
      id: 'prod-apple-macbook-air-m1',
      name: 'Apple MacBook Air 13.3" M1 Chip (8GB Unified RAM / 256GB SSD) Space Gray',
      sku: 'APPL-MBA-M1-256',
      category: 'Laptops & Computers',
      brand: 'Apple',
      model: 'MacBook Air M1 (MGN63)',
      description: 'Apple Silicon M1 8-core CPU, 7-core GPU, 16-core Neural Engine, 13.3-inch Retina display with True Tone, Touch ID, silent fanless design, up to 18 hours battery life.',
      imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('79000.00'),
      costPrice: new Prisma.Decimal('81000.00'),
      retailPrice: new Prisma.Decimal('88500.00'),
      wholesalePrice: new Prisma.Decimal('84500.00'),
      emiPrice: new Prisma.Decimal('94000.00'),
      currentStock: 4,
      minStock: 1,
      supplierId: 'supp-5',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { processor: 'Apple M1 Chip (8-core CPU)', ram: '8GB Unified Memory', storage: '256GB Apple Fast NVMe SSD', display: '13.3" Retina Display (2560 x 1600)', battery: '49.9Wh (Up to 18 hours)', condition: 'Brand New Sealed' },
    },
    {
      id: 'prod-asus-zenbook-14',
      name: 'Asus ZenBook 14 OLED UX3402 Core i5 13th Gen (16GB / 512GB SSD)',
      sku: 'ASUS-ZB-14-OLED',
      category: 'Laptops & Computers',
      brand: 'Asus',
      model: 'ZenBook 14 UX3402VA',
      description: '14.0" 2.8K (2880 x 1800) 90Hz OLED 16:10 Display, Intel Core i5-1340P, 16GB LPDDR5, 512GB PCIe 4.0 SSD, NumberPad 2.0, Harman Kardon audio.',
      imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('87000.00'),
      costPrice: new Prisma.Decimal('89500.00'),
      retailPrice: new Prisma.Decimal('98000.00'),
      wholesalePrice: new Prisma.Decimal('93000.00'),
      emiPrice: new Prisma.Decimal('105000.00'),
      currentStock: 3,
      minStock: 1,
      supplierId: 'supp-2',
      warrantyPeriodMonths: 24,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { processor: 'Intel Core i5-1340P', ram: '16GB LPDDR5', storage: '512GB M.2 NVMe PCIe 4.0', display: '14" 2.8K 90Hz OLED 400 nits', battery: '75Wh 4-cell', condition: 'Brand New' },
    },
    {
      id: 'prod-dell-latitude-5420',
      name: 'Dell Latitude 5420 Core i5 11th Gen Business Laptop (16GB / 512GB)',
      sku: 'DELL-LAT-5420-512',
      category: 'Laptops & Computers',
      brand: 'Dell',
      model: 'Latitude 5420',
      description: 'Durable commercial enterprise workstation laptop. Intel Core i5-1145G7 vPro, 16GB DDR4, 512GB SSD, FHD Anti-Glare display, ExpressCharge.',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('42000.00'),
      costPrice: new Prisma.Decimal('43500.00'),
      retailPrice: new Prisma.Decimal('49000.00'),
      wholesalePrice: new Prisma.Decimal('46000.00'),
      emiPrice: new Prisma.Decimal('52500.00'),
      currentStock: 5,
      minStock: 2,
      supplierId: 'supp-1',
      warrantyPeriodMonths: 24,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { processor: 'Intel Core i5-1145G7 vPro', ram: '16GB DDR4', storage: '512GB NVMe SSD', display: '14.0" FHD (1920x1080) WVA', condition: 'Brand New Grade-A' },
    },
    {
      id: 'prod-hikvision-cctv-kit',
      name: 'Hikvision 4-Channel 1080p Turbo HD CCTV Complete Surveillance Kit',
      sku: 'HIK-KIT-4CH-1080P',
      category: 'CCTV & Security',
      brand: 'Hikvision',
      model: 'DS-2CE16D0T-IRPF Kit',
      description: 'Complete security kit: 1x 4-Channel Turbo HD DVR, 4x 2MP Full HD Night Vision Cameras, 1TB Surveillance Hard Drive, 4x 18m Cables, 12V 5A Central Power Supply.',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('11500.00'),
      costPrice: new Prisma.Decimal('12000.00'),
      retailPrice: new Prisma.Decimal('14500.00'),
      wholesalePrice: new Prisma.Decimal('13200.00'),
      emiPrice: new Prisma.Decimal('15800.00'),
      currentStock: 8,
      minStock: 2,
      supplierId: 'supp-4',
      warrantyPeriodMonths: 24,
      isSerialized: false,
      status: 'ACTIVE',
      specs: { resolution: '1080p Full HD (1920 x 1080)', nightVision: 'Smart IR up to 20m', storage: 'Seagate SkyHawk 1TB Included' },
    },
    {
      id: 'prod-dahua-2mp-camera',
      name: 'Dahua 2MP Full-Color Audio Bullet Camera',
      sku: 'DAH-2MP-FC-AUDIO',
      category: 'CCTV & Security',
      brand: 'Dahua',
      model: 'DH-HAC-HFW1209TLMP-A-LED',
      description: '2MP Full-Color HDCVI bullet camera with built-in microphone for high-quality audio recording. Warm LED light for 24/7 full-color night surveillance.',
      imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('2150.00'),
      costPrice: new Prisma.Decimal('2250.00'),
      retailPrice: new Prisma.Decimal('2800.00'),
      wholesalePrice: new Prisma.Decimal('2500.00'),
      emiPrice: new Prisma.Decimal('3100.00'),
      currentStock: 15,
      minStock: 5,
      supplierId: 'supp-4',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { sensor: '2MP CMOS 1080p', lens: '3.6mm fixed lens', audio: 'Built-in mic', ledRange: '20m Warm Light Full Color' },
    },
    {
      id: 'prod-tplink-archer-c6',
      name: 'TP-Link Archer C6 AC1200 Wireless MU-MIMO Gigabit Router',
      sku: 'TPL-ARCH-C6-GIG',
      category: 'Networking Devices',
      brand: 'TP-Link',
      model: 'Archer C6 V4',
      description: 'Dual-band Gigabit Wi-Fi router. 867 Mbps at 5GHz + 300 Mbps at 2.4GHz. 4 External High-Gain Antennas. MU-MIMO Technology and Gigabit Ethernet Ports.',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('2750.00'),
      costPrice: new Prisma.Decimal('2850.00'),
      retailPrice: new Prisma.Decimal('3400.00'),
      wholesalePrice: new Prisma.Decimal('3150.00'),
      emiPrice: new Prisma.Decimal('3800.00'),
      currentStock: 12,
      minStock: 4,
      supplierId: 'supp-2',
      warrantyPeriodMonths: 12,
      isSerialized: false,
      status: 'ACTIVE',
      specs: { speed: 'AC1200 Dual Band', ports: '1x Gigabit WAN, 4x Gigabit LAN', features: 'MU-MIMO, Beamforming' },
    },
    {
      id: 'prod-samsung-galaxy-a55',
      name: 'Samsung Galaxy A55 5G (8GB RAM / 128GB ROM) Awesome Iceblue',
      sku: 'SAM-A55-5G-128',
      category: 'Smartphones & Tablets',
      brand: 'Samsung',
      model: 'Galaxy A55 5G',
      description: '6.6" 120Hz Super AMOLED Display, Exynos 1480 4nm processor, 50MP OIS Triple Camera, 5000mAh Battery with 25W Fast Charging, IP67 Water Resistance.',
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('39500.00'),
      costPrice: new Prisma.Decimal('41000.00'),
      retailPrice: new Prisma.Decimal('45500.00'),
      wholesalePrice: new Prisma.Decimal('43000.00'),
      emiPrice: new Prisma.Decimal('48500.00'),
      currentStock: 7,
      minStock: 2,
      supplierId: 'supp-5',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { ram: '8GB', rom: '128GB', display: '6.6" 120Hz FHD+ Super AMOLED', camera: '50MP + 12MP + 5MP', battery: '5000 mAh' },
    },
    {
      id: 'prod-viewsonic-24-monitor',
      name: 'ViewSonic VA2432-H 24" 100Hz IPS Borderless Monitor',
      sku: 'VS-24-IPS-100HZ',
      category: 'Monitors & Displays',
      brand: 'Asus',
      model: 'VA2432-H',
      description: '24-inch Full HD IPS monitor with 100Hz refresh rate, 1ms MPRT, SuperClear IPS technology, HDMI and VGA ports, Flicker-Free and Blue Light Filter eye care.',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('11200.00'),
      costPrice: new Prisma.Decimal('11800.00'),
      retailPrice: new Prisma.Decimal('13800.00'),
      wholesalePrice: new Prisma.Decimal('12800.00'),
      emiPrice: new Prisma.Decimal('15000.00'),
      currentStock: 9,
      minStock: 2,
      supplierId: 'supp-2',
      warrantyPeriodMonths: 36,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { size: '24 inch IPS', resolution: '1920 x 1080 FHD', refreshRate: '100Hz', ports: 'HDMI, VGA' },
    },
    {
      id: 'prod-anker-65w-charger',
      name: 'Anker 735 Charger (GaNPrime 65W) 3-Port Fast Wall Charger',
      sku: 'ANK-GAN-65W-3P',
      category: 'Chargers & Adapters',
      brand: 'Anker',
      model: '735 GaNPrime 65W',
      description: 'Power 3 devices at once with 2 USB-C ports and 1 USB-A port. Fast charge laptops, phones, and tablets simultaneously with dynamic PowerIQ 4.0 technology.',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('2450.00'),
      costPrice: new Prisma.Decimal('2600.00'),
      retailPrice: new Prisma.Decimal('3200.00'),
      wholesalePrice: new Prisma.Decimal('2850.00'),
      emiPrice: new Prisma.Decimal('3500.00'),
      currentStock: 20,
      minStock: 5,
      supplierId: 'supp-3',
      warrantyPeriodMonths: 18,
      isSerialized: false,
      status: 'ACTIVE',
      specs: { totalOutput: '65W Max', ports: '2x USB-C, 1x USB-A', compatibility: 'MacBook, Dell, HP, iPhone, Samsung' },
    },
    {
      id: 'prod-logitech-mk270',
      name: 'Logitech MK270 Wireless Keyboard and Mouse Combo',
      sku: 'LOGI-MK270-COMBO',
      category: 'Computer Accessories',
      brand: 'Logitech',
      model: 'MK270 Wireless',
      description: 'Reliable 2.4GHz wireless connection up to 10 meters. Spill-resistant keyboard with 8 hotkeys and comfortable compact wireless optical mouse.',
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('1850.00'),
      costPrice: new Prisma.Decimal('1950.00'),
      retailPrice: new Prisma.Decimal('2350.00'),
      wholesalePrice: new Prisma.Decimal('2150.00'),
      emiPrice: new Prisma.Decimal('2600.00'),
      currentStock: 18,
      minStock: 5,
      supplierId: 'supp-3',
      warrantyPeriodMonths: 36,
      isSerialized: false,
      status: 'ACTIVE',
      specs: { wireless: '2.4GHz USB Nano Receiver', batteryLife: '36-month keyboard, 12-month mouse' },
    },
    {
      id: 'prod-walton-avr-1000va',
      name: 'Walton 1000VA Digital Automatic Voltage Stabilizer (AVR)',
      sku: 'WALT-AVR-1000VA',
      category: 'Electrical & Power',
      brand: 'Walton',
      model: 'WAVR-1000',
      description: 'Precision digital servo AVR designed for domestic low/high voltage fluctuation. Safeguards refrigerators, deep freezers, large televisions, and desktop setups.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('2850.00'),
      costPrice: new Prisma.Decimal('3050.00'),
      retailPrice: new Prisma.Decimal('3750.00'),
      wholesalePrice: new Prisma.Decimal('3400.00'),
      emiPrice: new Prisma.Decimal('4200.00'),
      currentStock: 10,
      minStock: 3,
      supplierId: 'supp-1',
      warrantyPeriodMonths: 24,
      isSerialized: true,
      status: 'ACTIVE',
      specs: { capacity: '1000VA / 800W', inputVoltage: '100V - 260V AC', outputVoltage: '220V +/- 3%', display: 'Dual Digital Voltmeter' },
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
    sqlite.prepare(`
      INSERT INTO products (
        id, name, sku, category, brand, model, description, image_url,
        purchase_price, cost_price, retail_price, wholesale_price, emi_price,
        current_stock, min_stock, supplier_id, warranty_period_months, is_serialized, status, specs
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      ) ON CONFLICT(id) DO UPDATE SET
        name=excluded.name, retail_price=excluded.retail_price, current_stock=excluded.current_stock;
    `).run(
      p.id, p.name, p.sku, p.category, p.brand, p.model, p.description, p.imageUrl,
      Number(p.purchasePrice), Number(p.costPrice), Number(p.retailPrice), Number(p.wholesalePrice), Number(p.emiPrice),
      p.currentStock, p.minStock, p.supplierId, p.warrantyPeriodMonths, p.isSerialized ? 1 : 0, p.status, JSON.stringify(p.specs)
    );
  }

  // -------------------------------------------------------------
  // 7. PRODUCT SERIALS
  // -------------------------------------------------------------
  console.log('[7/16] Synchronizing Hardware Serial Numbers...');
  const serials = [
    { id: 'sn-1', serialNumber: 'HP430G8-BD-9021', productId: 'prod-hp-430-g8', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('33500.00') },
    { id: 'sn-2', serialNumber: 'HP430G8-BD-9022', productId: 'prod-hp-430-g8', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('33500.00') },
    { id: 'sn-3', serialNumber: 'HP430G8-BD-9023', productId: 'prod-hp-430-g8', branchId: 'branch-2', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('33500.00') },
    { id: 'sn-4', serialNumber: 'HP430G8-BD-SOLD1', productId: 'prod-hp-430-g8', branchId: 'branch-1', status: 'SOLD', purchaseCost: new Prisma.Decimal('33500.00') },
    { id: 'sn-5', serialNumber: 'MBA-M1-SPG-1001', productId: 'prod-apple-macbook-air-m1', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('79000.00') },
    { id: 'sn-6', serialNumber: 'MBA-M1-SPG-1002', productId: 'prod-apple-macbook-air-m1', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('79000.00') },
    { id: 'sn-7', serialNumber: 'MBA-M1-SOLD-881', productId: 'prod-apple-macbook-air-m1', branchId: 'branch-1', status: 'SOLD', purchaseCost: new Prisma.Decimal('79000.00') },
    { id: 'sn-8', serialNumber: 'ASUS-UX3402-9901', productId: 'prod-asus-zenbook-14', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('87000.00') },
    { id: 'sn-9', serialNumber: 'DELL-5420-SN-4411', productId: 'prod-dell-latitude-5420', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('42000.00') },
    { id: 'sn-10', serialNumber: 'SAM-A55-IMEI-8801', productId: 'prod-samsung-galaxy-a55', branchId: 'branch-1', status: 'SOLD', purchaseCost: new Prisma.Decimal('39500.00') },
    { id: 'sn-11', serialNumber: 'SAM-A55-IMEI-8802', productId: 'prod-samsung-galaxy-a55', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('39500.00') },
    { id: 'sn-12', serialNumber: 'WALT-AVR-SN-3001', productId: 'prod-walton-avr-1000va', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('2850.00') },
  ];

  for (const s of serials) {
    await prisma.productSerial.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
    sqlite.prepare(`
      INSERT INTO product_serials (id, serial_number, product_id, branch_id, status, purchase_cost)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status;
    `).run(s.id, s.serialNumber, s.productId, s.branchId, s.status, Number(s.purchaseCost));
  }

  // -------------------------------------------------------------
  // 8. CUSTOMERS
  // -------------------------------------------------------------
  console.log('[8/16] Synchronizing Moulvibazar Regional Customers...');
  const customers = [
    {
      id: 'cust-1',
      customerId: 'CUST-1001',
      name: 'Hasan Mahmud',
      phone: '01712-345678',
      email: 'hasan.m@gmail.com',
      address: 'Court Road, Ward 4, Moulvibazar Sadar',
      creditLimit: new Prisma.Decimal('50000.00'),
      currentBalance: new Prisma.Decimal('20000.00'),
    },
    {
      id: 'cust-2',
      customerId: 'CUST-1002',
      name: 'Dr. Tariqul Islam',
      phone: '01819-876543',
      email: 'dr.tariqul@gmail.com',
      address: 'Doctors Colony, Sreemangal Road, Moulvibazar',
      creditLimit: new Prisma.Decimal('100000.00'),
      currentBalance: new Prisma.Decimal('64000.00'),
    },
    {
      id: 'cust-3',
      customerId: 'CUST-1003',
      name: 'Rehana Akter',
      phone: '01911-223344',
      email: 'rehana.akter@yahoo.com',
      address: 'Kusumbag R/A, Moulvibazar',
      creditLimit: new Prisma.Decimal('60000.00'),
      currentBalance: new Prisma.Decimal('32500.00'),
    },
    {
      id: 'cust-4',
      customerId: 'CUST-1004',
      name: 'Farhan Ahmed',
      phone: '01715-998877',
      email: 'farhan.tech@gmail.com',
      address: 'Shamshernagar Road, Moulvibazar',
      creditLimit: new Prisma.Decimal('30000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
    },
    {
      id: 'cust-5',
      customerId: 'CUST-1005',
      name: 'Grand Sultan Tea Resort IT Dept',
      phone: '01730-001122',
      email: 'it@grandsultanresort.com',
      address: 'Sreemangal, Moulvibazar',
      creditLimit: new Prisma.Decimal('200000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
    },
    {
      id: 'cust-6',
      customerId: 'CUST-1006',
      name: 'Moulvibazar English Medium School',
      phone: '01711-443322',
      email: 'admin@memsbd.edu',
      address: 'College Road, Moulvibazar',
      creditLimit: new Prisma.Decimal('150000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
    },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
    sqlite.prepare(`
      INSERT INTO customers (id, customer_id, name, phone, email, address, current_balance, credit_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, phone=excluded.phone, current_balance=excluded.current_balance;
    `).run(c.id, c.customerId, c.name, c.phone, c.email, c.address, Number(c.currentBalance), Number(c.creditLimit));
  }

  // -------------------------------------------------------------
  // 9. PURCHASES & PURCHASE ITEMS
  // -------------------------------------------------------------
  console.log('[9/16] Synchronizing Stock Inward Purchases...');
  const purchases = [
    {
      id: 'pur-1001',
      invoiceNumber: 'PINV-2026-001',
      supplierId: 'supp-1',
      supplierName: 'Smart Technologies (BD) Ltd',
      branchId: 'branch-1',
      date: new Date('2026-08-15'),
      status: 'Received',
      subtotal: new Prisma.Decimal('245000.00'),
      discount: new Prisma.Decimal('5000.00'),
      tax: new Prisma.Decimal('0.00'),
      total: new Prisma.Decimal('240000.00'),
      paidAmount: new Prisma.Decimal('200000.00'),
      dueAmount: new Prisma.Decimal('40000.00'),
      paymentMethod: 'Bank Asia Transfer',
      notes: 'Initial Q3 batch of HP ProBook 430 G8 and Dell Latitude 5420 laptops.',
      items: [
        { id: 'pi-1', purchaseId: 'pur-1001', productId: 'prod-hp-430-g8', productName: 'HP ProBook 430 G8', quantity: 5, costPrice: new Prisma.Decimal('33500.00'), subtotal: new Prisma.Decimal('167500.00') },
        { id: 'pi-2', purchaseId: 'pur-1001', productId: 'prod-dell-latitude-5420', productName: 'Dell Latitude 5420', quantity: 2, costPrice: new Prisma.Decimal('42000.00'), subtotal: new Prisma.Decimal('84000.00') },
      ]
    },
    {
      id: 'pur-1002',
      invoiceNumber: 'PINV-2026-002',
      supplierId: 'supp-4',
      supplierName: 'Excel Technologies Ltd',
      branchId: 'branch-1',
      date: new Date('2026-08-20'),
      status: 'Received',
      subtotal: new Prisma.Decimal('85000.00'),
      discount: new Prisma.Decimal('2000.00'),
      tax: new Prisma.Decimal('0.00'),
      total: new Prisma.Decimal('83000.00'),
      paidAmount: new Prisma.Decimal('83000.00'),
      dueAmount: new Prisma.Decimal('0.00'),
      paymentMethod: 'Cash',
      notes: 'Hikvision 4CH CCTV Surveillance Kits & Dahua Audio cameras.',
      items: [
        { id: 'pi-3', purchaseId: 'pur-1002', productId: 'prod-hikvision-cctv-kit', productName: 'Hikvision 4-Channel Kit', quantity: 5, costPrice: new Prisma.Decimal('11500.00'), subtotal: new Prisma.Decimal('57500.00') },
        { id: 'pi-4', purchaseId: 'pur-1002', productId: 'prod-dahua-2mp-camera', productName: 'Dahua 2MP Full-Color Bullet', quantity: 12, costPrice: new Prisma.Decimal('2150.00'), subtotal: new Prisma.Decimal('25800.00') },
      ]
    },
  ];

  for (const p of purchases) {
    const { items, ...purHead } = p;
    await prisma.purchase.upsert({
      where: { id: purHead.id },
      update: purHead,
      create: purHead,
    });
    sqlite.prepare(`
      INSERT INTO purchases (id, invoice_number, supplier_id, supplier_name, branch_id, date, status, subtotal, discount, tax, total, paid_amount, due_amount, payment_method, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET total=excluded.total, paid_amount=excluded.paid_amount;
    `).run(purHead.id, purHead.invoiceNumber, purHead.supplierId, purHead.supplierName, purHead.branchId, purHead.date.toISOString(), purHead.status, Number(purHead.subtotal), Number(purHead.discount), Number(purHead.tax), Number(purHead.total), Number(purHead.paidAmount), Number(purHead.dueAmount), purHead.paymentMethod, purHead.notes);

    for (const item of items) {
      await prisma.purchaseItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
      sqlite.prepare(`
        INSERT INTO purchase_items (id, purchase_id, product_id, product_name, quantity, cost_price, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET quantity=excluded.quantity;
      `).run(item.id, item.purchaseId, item.productId, item.productName, item.quantity, Number(item.costPrice), Number(item.subtotal));
    }
  }

  // -------------------------------------------------------------
  // 10. POS SALES & INVOICES
  // -------------------------------------------------------------
  console.log('[10/16] Synchronizing POS Sales Transactions...');

  // Replicate any existing Postgres sales into SQLite
  const existingPgSales = await prisma.sale.findMany({ include: { items: true } });
  for (const es of existingPgSales) {
    sqlite.prepare(`
      INSERT INTO sales (id, invoice_number, customer_id, customer_name, customer_phone, branch_id, date, subtotal, overall_discount, vat_amount, vat_percent, grand_total, paid_amount, due_amount, sale_type, status, salesperson_name, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET grand_total=excluded.grand_total, paid_amount=excluded.paid_amount;
    `).run(es.id, es.invoiceNumber, es.customerId, es.customerName, es.customerPhone, es.branchId, es.date.toISOString(), Number(es.subtotal), Number(es.overallDiscount), Number(es.vatAmount), Number(es.vatPercent), Number(es.grandTotal), Number(es.paidAmount), Number(es.dueAmount), es.saleType, es.status, es.salespersonName, es.notes);

    for (const item of es.items) {
      sqlite.prepare(`
        INSERT INTO sale_items (id, sale_id, product_id, product_name, sku, category, quantity, unit_price, discount, total, warranty_months, is_serialized, serial_numbers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET total=excluded.total;
      `).run(item.id, item.saleId, item.productId, item.productName, item.sku, item.category, item.quantity, Number(item.unitPrice), Number(item.discount), Number(item.total), item.warrantyMonths, item.isSerialized ? 1 : 0, JSON.stringify(item.serialNumbers || []));
    }
  }

  const sales = [
    {
      id: 'sale-1004',
      invoiceNumber: 'INV-2026-1004',
      customerId: 'cust-1',
      customerName: 'Hasan Mahmud',
      customerPhone: '01712-345678',
      branchId: 'branch-1',
      date: new Date('2026-07-01'),
      subtotal: new Prisma.Decimal('38500.00'),
      overallDiscount: new Prisma.Decimal('0.00'),
      vatPercent: new Prisma.Decimal('5.00'),
      vatAmount: new Prisma.Decimal('1925.00'),
      grandTotal: new Prisma.Decimal('40425.00'),
      paidAmount: new Prisma.Decimal('11500.00'),
      dueAmount: new Prisma.Decimal('28925.00'),
      saleType: 'EMI',
      emiAccountId: 'emi-acc-1002',
      status: 'COMPLETED',
      salespersonName: 'Sumon Das',
      notes: 'EMI Sale: HP ProBook 430 G8 with 6-month installment agreement.',
      items: [
        { id: 'si-4', saleId: 'sale-1004', productId: 'prod-hp-430-g8', productName: 'HP ProBook 430 G8', sku: 'HP-PB-430-G8-256', category: 'Laptops & Computers', quantity: 1, unitPrice: new Prisma.Decimal('38500.00'), discount: new Prisma.Decimal('0.00'), total: new Prisma.Decimal('38500.00'), warrantyMonths: 24, isSerialized: true, serialNumbers: ['HP430G8-BD-SOLD1'] }
      ]
    },
    {
      id: 'sale-1005',
      invoiceNumber: 'INV-2026-1005',
      customerId: 'cust-4',
      customerName: 'Farhan Ahmed',
      customerPhone: '01715-998877',
      branchId: 'branch-1',
      date: new Date('2026-08-10'),
      subtotal: new Prisma.Decimal('14500.00'),
      overallDiscount: new Prisma.Decimal('500.00'),
      vatPercent: new Prisma.Decimal('5.00'),
      vatAmount: new Prisma.Decimal('700.00'),
      grandTotal: new Prisma.Decimal('14700.00'),
      paidAmount: new Prisma.Decimal('14700.00'),
      dueAmount: new Prisma.Decimal('0.00'),
      saleType: 'REGULAR',
      status: 'COMPLETED',
      salespersonName: 'Sumon Das',
      notes: 'CCTV Kit with installation assistance scheduled.',
      items: [
        { id: 'si-5', saleId: 'sale-1005', productId: 'prod-hikvision-cctv-kit', productName: 'Hikvision 4CH CCTV Surveillance Kit', sku: 'HIK-KIT-4CH-1080P', category: 'CCTV & Security', quantity: 1, unitPrice: new Prisma.Decimal('14500.00'), discount: new Prisma.Decimal('500.00'), total: new Prisma.Decimal('14000.00'), warrantyMonths: 24, isSerialized: false, serialNumbers: [] }
      ]
    },
    {
      id: 'sale-1006',
      invoiceNumber: 'INV-2026-1006',
      customerId: 'cust-2',
      customerName: 'Dr. Tariqul Islam',
      customerPhone: '01819-876543',
      branchId: 'branch-1',
      date: new Date('2026-08-25'),
      subtotal: new Prisma.Decimal('88500.00'),
      overallDiscount: new Prisma.Decimal('1000.00'),
      vatPercent: new Prisma.Decimal('5.00'),
      vatAmount: new Prisma.Decimal('4375.00'),
      grandTotal: new Prisma.Decimal('91875.00'),
      paidAmount: new Prisma.Decimal('30000.00'),
      dueAmount: new Prisma.Decimal('61875.00'),
      saleType: 'REGULAR',
      status: 'COMPLETED',
      salespersonName: 'Amdadur Rahman',
      notes: 'MacBook Air M1 Space Gray with Anker 65W fast wall charger.',
      items: [
        { id: 'si-6', saleId: 'sale-1006', productId: 'prod-apple-macbook-air-m1', productName: 'Apple MacBook Air M1 Space Gray', sku: 'APPL-MBA-M1-256', category: 'Laptops & Computers', quantity: 1, unitPrice: new Prisma.Decimal('88500.00'), discount: new Prisma.Decimal('1000.00'), total: new Prisma.Decimal('87500.00'), warrantyMonths: 12, isSerialized: true, serialNumbers: ['MBA-M1-SOLD-881'] }
      ]
    }
  ];

  for (const s of sales) {
    const { items, ...saleHead } = s;
    await prisma.sale.upsert({
      where: { id: saleHead.id },
      update: saleHead,
      create: saleHead,
    });
    sqlite.prepare(`
      INSERT INTO sales (id, invoice_number, customer_id, customer_name, customer_phone, branch_id, date, subtotal, overall_discount, vat_amount, vat_percent, grand_total, paid_amount, due_amount, sale_type, status, salesperson_name, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET grand_total=excluded.grand_total, paid_amount=excluded.paid_amount;
    `).run(saleHead.id, saleHead.invoiceNumber, saleHead.customerId, saleHead.customerName, saleHead.customerPhone, saleHead.branchId, saleHead.date.toISOString(), Number(saleHead.subtotal), Number(saleHead.overallDiscount), Number(saleHead.vatAmount), Number(saleHead.vatPercent), Number(saleHead.grandTotal), Number(saleHead.paidAmount), Number(saleHead.dueAmount), saleHead.saleType, saleHead.status, saleHead.salespersonName, saleHead.notes);

    for (const item of items) {
      await prisma.saleItem.upsert({
        where: { id: item.id },
        update: item,
        create: item,
      });
      sqlite.prepare(`
        INSERT INTO sale_items (id, sale_id, product_id, product_name, sku, category, quantity, unit_price, discount, total, warranty_months, is_serialized, serial_numbers)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
        ON CONFLICT(id) DO UPDATE SET total=excluded.total;
      `).run(item.id, item.saleId, item.productId, item.productName, item.sku, item.category, item.quantity, Number(item.unitPrice), Number(item.discount), Number(item.total), item.warrantyMonths, JSON.stringify(item.serialNumbers));
    }
  }

  // -------------------------------------------------------------
  // 11. EMI PLANS & EMI ACCOUNTS
  // -------------------------------------------------------------
  console.log('[11/16] Synchronizing EMI Plans & Customer Accounts...');
  const emiPlans = [
    { id: 'plan-3m', name: '3-Month Easy Installment', durationMonths: 3, interestRatePercent: new Prisma.Decimal('0.00'), minDownPaymentPercent: new Prisma.Decimal('30.00'), processingFee: new Prisma.Decimal('500.00'), lateFeePerDay: new Prisma.Decimal('50.00'), gracePeriodDays: 5, isActive: true },
    { id: 'plan-6m', name: '6-Month Smart Tech Plan', durationMonths: 6, interestRatePercent: new Prisma.Decimal('5.00'), minDownPaymentPercent: new Prisma.Decimal('25.00'), processingFee: new Prisma.Decimal('750.00'), lateFeePerDay: new Prisma.Decimal('50.00'), gracePeriodDays: 5, isActive: true },
    { id: 'plan-9m', name: '9-Month Professional Plan', durationMonths: 9, interestRatePercent: new Prisma.Decimal('8.00'), minDownPaymentPercent: new Prisma.Decimal('20.00'), processingFee: new Prisma.Decimal('1000.00'), lateFeePerDay: new Prisma.Decimal('75.00'), gracePeriodDays: 7, isActive: true },
    { id: 'plan-12m', name: '12-Month Executive Plan', durationMonths: 12, interestRatePercent: new Prisma.Decimal('10.00'), minDownPaymentPercent: new Prisma.Decimal('20.00'), processingFee: new Prisma.Decimal('1200.00'), lateFeePerDay: new Prisma.Decimal('100.00'), gracePeriodDays: 7, isActive: true },
  ];

  for (const ep of emiPlans) {
    await prisma.eMIPlan.upsert({
      where: { id: ep.id },
      update: ep,
      create: ep,
    });
    sqlite.prepare(`
      INSERT INTO emi_plans (id, name, duration_months, min_down_payment_percent, interest_rate_percent, processing_fee, late_fee_per_day, grace_period_days, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, duration_months=excluded.duration_months;
    `).run(ep.id, ep.name, ep.durationMonths, Number(ep.minDownPaymentPercent), Number(ep.interestRatePercent), Number(ep.processingFee), Number(ep.lateFeePerDay), ep.gracePeriodDays);
  }

  // Replicate any existing Postgres EMI accounts to SQLite
  const existingPgEmi = await prisma.eMIAccount.findMany({ include: { installments: true } });
  for (const ea of existingPgEmi) {
    sqlite.prepare(`
      INSERT INTO emi_accounts (
        id, emi_number, sale_invoice_id, customer_id, customer_name, customer_phone,
        product_id, product_name, serial_number, laptop_price, down_payment,
        financed_amount, duration_months, monthly_installment, total_payable,
        total_paid, remaining_balance, start_date, end_date, status
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      ) ON CONFLICT(id) DO UPDATE SET total_paid=excluded.total_paid, remaining_balance=excluded.remaining_balance;
    `).run(
      ea.id, ea.emiNumber, ea.saleInvoiceId, ea.customerId, ea.customerName, ea.customerPhone,
      ea.productId, ea.productName, ea.serialNumber, Number(ea.laptopPrice), Number(ea.downPayment),
      Number(ea.financedAmount), ea.durationMonths, Number(ea.monthlyInstallment), Number(ea.totalPayable),
      Number(ea.totalPaid), Number(ea.remainingBalance), ea.startDate.toISOString(), ea.endDate.toISOString(),
      ea.status
    );
    for (const inst of ea.installments) {
      sqlite.prepare(`
        INSERT INTO emi_installments (id, emi_account_id, installment_number, due_date, amount, penalty_amount, paid_amount, paid_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET status=excluded.status, paid_amount=excluded.paid_amount;
      `).run(inst.id, inst.emiAccountId, inst.installmentNumber, inst.dueDate.toISOString(), Number(inst.amount), Number(inst.penaltyAmount), Number(inst.paidAmount), inst.paidDate ? inst.paidDate.toISOString() : null, inst.status);
    }
  }

  // Real EMI Account: Hasan Mahmud
  const emiAcc1 = {
    id: 'emi-acc-1002',
    emiNumber: 'EMI-2026-1002',
    saleInvoiceId: 'sale-1004',
    customerId: 'cust-1',
    customerName: 'Hasan Mahmud',
    customerPhone: '01712-345678',
    customerAddress: 'Court Road, Ward 4, Moulvibazar Sadar',
    customerNid: '1987581290334',
    productId: 'prod-hp-430-g8',
    productName: 'HP ProBook 430 G8 Core i5 11th Gen',
    serialNumber: 'HP430G8-BD-SOLD1',
    laptopPrice: new Prisma.Decimal('41500.00'),
    downPayment: new Prisma.Decimal('11500.00'),
    financedAmount: new Prisma.Decimal('30000.00'),
    durationMonths: 6,
    monthlyInstallment: new Prisma.Decimal('5333.33'),
    totalPayable: new Prisma.Decimal('32000.00'),
    totalPaid: new Prisma.Decimal('10666.66'),
    remainingBalance: new Prisma.Decimal('21333.34'),
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-12-01'),
    status: 'ACTIVE',
  };

  await prisma.eMIAccount.upsert({
    where: { id: emiAcc1.id },
    update: emiAcc1,
    create: emiAcc1,
  });

  sqlite.prepare(`
    INSERT INTO emi_accounts (
      id, emi_number, sale_invoice_id, customer_id, customer_name, customer_phone,
      product_id, product_name, serial_number, laptop_price, down_payment,
      financed_amount, duration_months, monthly_installment, total_payable,
      total_paid, remaining_balance, start_date, end_date, status
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON CONFLICT(id) DO UPDATE SET total_paid=excluded.total_paid, remaining_balance=excluded.remaining_balance;
  `).run(
    emiAcc1.id, emiAcc1.emiNumber, emiAcc1.saleInvoiceId, emiAcc1.customerId, emiAcc1.customerName, emiAcc1.customerPhone,
    emiAcc1.productId, emiAcc1.productName, emiAcc1.serialNumber, Number(emiAcc1.laptopPrice), Number(emiAcc1.downPayment),
    Number(emiAcc1.financedAmount), emiAcc1.durationMonths, Number(emiAcc1.monthlyInstallment), Number(emiAcc1.totalPayable),
    Number(emiAcc1.totalPaid), Number(emiAcc1.remainingBalance), emiAcc1.startDate.toISOString(), emiAcc1.endDate.toISOString(),
    emiAcc1.status
  );

  // EMI Installments for Hasan Mahmud
  for (let i = 1; i <= 6; i++) {
    const instId = `inst-1002-${i}`;
    const dueDate = new Date('2026-07-01');
    dueDate.setMonth(dueDate.getMonth() + i);
    const isPaid = i <= 2;
    const instData = {
      id: instId,
      emiAccountId: emiAcc1.id,
      installmentNumber: i,
      dueDate: dueDate,
      amount: new Prisma.Decimal('5333.33'),
      penaltyAmount: new Prisma.Decimal('0.00'),
      paidAmount: isPaid ? new Prisma.Decimal('5333.33') : new Prisma.Decimal('0.00'),
      paidDate: isPaid ? dueDate : null,
      paymentMethod: isPaid ? 'bKash' : null,
      status: isPaid ? 'PAID' : (i === 3 ? 'DUE_SOON' : 'PENDING'),
    };

    await prisma.eMIInstallment.upsert({
      where: { id: instId },
      update: instData,
      create: instData,
    });
    sqlite.prepare(`
      INSERT INTO emi_installments (id, emi_account_id, installment_number, due_date, amount, penalty_amount, paid_amount, paid_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status, paid_amount=excluded.paid_amount;
    `).run(instData.id, instData.emiAccountId, instData.installmentNumber, instData.dueDate.toISOString(), Number(instData.amount), Number(instData.penaltyAmount), Number(instData.paidAmount), instData.paidDate ? instData.paidDate.toISOString() : null, instData.status);
  }

  // -------------------------------------------------------------
  // 12. EMPLOYEES & ATTENDANCE
  // -------------------------------------------------------------
  console.log('[12/16] Synchronizing Staff & Attendance Records...');
  const employees = [
    {
      id: 'emp-1',
      name: 'Amdadur Rahman',
      email: 'contact.amdadur@gmail.com',
      phone: '01733-983752',
      role: 'SUPER_ADMIN',
      designation: 'Managing Director & Enterprise Architect',
      branchId: 'branch-1',
      monthlySalary: new Prisma.Decimal('75000.00'),
      salesCommissionRate: new Prisma.Decimal('0.00'),
      joinedDate: new Date('2024-01-01'),
      status: 'ACTIVE',
    },
    {
      id: 'emp-2',
      name: 'Jony Ahmed',
      email: 'jony@needelectro.com',
      phone: '01720-112233',
      role: 'MANAGER',
      designation: 'Showroom Operations & Inventory Manager',
      branchId: 'branch-1',
      monthlySalary: new Prisma.Decimal('35000.00'),
      salesCommissionRate: new Prisma.Decimal('1.50'),
      joinedDate: new Date('2024-06-01'),
      status: 'ACTIVE',
    },
    {
      id: 'emp-3',
      name: 'Tanvir Hasan',
      email: 'tanvir.tech@needelectro.com',
      phone: '01735-887766',
      role: 'TECHNICIAN',
      designation: 'Senior Hardware & CCTV Solutions Engineer',
      branchId: 'branch-1',
      monthlySalary: new Prisma.Decimal('28000.00'),
      salesCommissionRate: new Prisma.Decimal('2.00'),
      joinedDate: new Date('2024-08-15'),
      status: 'ACTIVE',
    },
    {
      id: 'emp-4',
      name: 'Sumon Das',
      email: 'sumon@needelectro.com',
      phone: '01719-334455',
      role: 'SALES_EXECUTIVE',
      designation: 'Lead POS & EMI Sales Coordinator',
      branchId: 'branch-1',
      monthlySalary: new Prisma.Decimal('22000.00'),
      salesCommissionRate: new Prisma.Decimal('3.00'),
      joinedDate: new Date('2025-01-10'),
      status: 'ACTIVE',
    },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: emp,
      create: emp,
    });
    sqlite.prepare(`
      INSERT INTO employees (id, name, email, phone, role, designation, branch_id, monthly_salary, sales_commission_rate, joined_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, monthly_salary=excluded.monthly_salary;
    `).run(emp.id, emp.name, emp.email, emp.phone, emp.role, emp.designation, emp.branchId, Number(emp.monthlySalary), Number(emp.salesCommissionRate), emp.joinedDate.toISOString(), emp.status);
  }

  // Attendance
  const attendances = [
    { id: 'att-101', employeeId: 'emp-1', employeeName: 'Amdadur Rahman', date: new Date('2026-09-08'), status: 'PRESENT', checkInTime: '09:15 AM', checkOutTime: '07:30 PM', notes: 'Executive oversight & inventory audit' },
    { id: 'att-102', employeeId: 'emp-2', employeeName: 'Jony Ahmed', date: new Date('2026-09-08'), status: 'PRESENT', checkInTime: '09:30 AM', checkOutTime: null, notes: 'Showroom open on time' },
    { id: 'att-103', employeeId: 'emp-3', employeeName: 'Tanvir Hasan', date: new Date('2026-09-08'), status: 'PRESENT', checkInTime: '10:00 AM', checkOutTime: null, notes: 'CCTV outdoor site visit scheduled' },
    { id: 'att-104', employeeId: 'emp-4', employeeName: 'Sumon Das', date: new Date('2026-09-08'), status: 'PRESENT', checkInTime: '09:45 AM', checkOutTime: null, notes: 'POS active' },
  ];

  for (const att of attendances) {
    await prisma.attendance.upsert({
      where: { id: att.id },
      update: att,
      create: att,
    });
    sqlite.prepare(`
      INSERT INTO attendance (id, employee_id, employee_name, date, status, check_in_time, check_out_time, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status;
    `).run(att.id, att.employeeId, att.employeeName, att.date.toISOString(), att.status, att.checkInTime, att.checkOutTime, att.notes);
  }

  // -------------------------------------------------------------
  // 13. SERVICE JOBS & TECHNICIANS
  // -------------------------------------------------------------
  console.log('[13/16] Synchronizing Service Jobs & Technicians...');
  const technicians = [
    { id: 'tech-1', name: 'Tanvir Hasan', phone: '01735-887766', email: 'tanvir@needelectro.com', specialization: ['Laptop Repair', 'Chip Level'], activeJobsCount: 2, completedJobsCount: 48, totalEarnings: new Prisma.Decimal('18500.00'), rating: new Prisma.Decimal('4.9') },
    { id: 'tech-2', name: 'Belal Hossain', phone: '01712-448899', email: 'belal@needelectro.com', specialization: ['CCTV', 'Networking'], activeJobsCount: 1, completedJobsCount: 35, totalEarnings: new Prisma.Decimal('14200.00'), rating: new Prisma.Decimal('4.8') },
  ];

  for (const tech of technicians) {
    await prisma.technician.upsert({
      where: { id: tech.id },
      update: tech,
      create: tech,
    });
    sqlite.prepare(`
      INSERT INTO technicians (id, name, phone, email, specialization, active_jobs_count, completed_jobs_count, total_earnings, rating)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, rating=excluded.rating;
    `).run(tech.id, tech.name, tech.phone, tech.email, JSON.stringify(tech.specialization), tech.activeJobsCount, tech.completedJobsCount, Number(tech.totalEarnings), Number(tech.rating));
  }

  const serviceJobs = [
    {
      id: 'srv-101',
      jobCardNumber: 'SRV-2026-001',
      customerId: 'cust-1',
      customerName: 'Hasan Mahmud',
      customerPhone: '01712-345678',
      customerAddress: 'Court Road, Moulvibazar',
      serviceType: 'Hardware Repair',
      deviceOrSite: 'Laptop HP 15s',
      serialNumber: '5CD1234XYZ',
      reportedIssue: 'Severe overheating, fan noise, and random shutdown during heavy tasks.',
      assignedTechnicianId: 'tech-1',
      assignedTechnicianName: 'Tanvir Hasan',
      status: 'Ready for Delivery',
      laborCost: new Prisma.Decimal('1200.00'),
      totalBill: new Prisma.Decimal('1200.00'),
      paymentStatus: 'PAID',
    },
    {
      id: 'srv-102',
      jobCardNumber: 'SRV-2026-002',
      customerId: 'cust-5',
      customerName: 'Grand Sultan Tea Resort IT Dept',
      customerPhone: '01730-001122',
      customerAddress: 'Sreemangal, Moulvibazar',
      serviceType: 'CCTV Installation & Repair',
      deviceOrSite: 'CCTV Security System (Hikvision DVR)',
      serialNumber: 'HIK-DVR-99018',
      reportedIssue: 'Channel 3 and Channel 4 video loss on the central security console.',
      assignedTechnicianId: 'tech-2',
      assignedTechnicianName: 'Belal Hossain',
      status: 'In Progress',
      laborCost: new Prisma.Decimal('2000.00'),
      totalBill: new Prisma.Decimal('3500.00'),
      paymentStatus: 'PARTIAL',
    },
  ];

  // Replicate any existing Postgres service jobs into SQLite
  const existingPgSrv = await prisma.serviceJob.findMany();
  for (const esrv of existingPgSrv) {
    sqlite.prepare(`
      INSERT INTO service_jobs (id, job_card_number, customer_id, customer_name, customer_phone, customer_address, service_type, device_or_site, serial_number, reported_issue, assigned_technician_id, assigned_technician_name, status, labor_cost, total_bill, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status;
    `).run(esrv.id, esrv.jobCardNumber, esrv.customerId, esrv.customerName, esrv.customerPhone, esrv.customerAddress, esrv.serviceType, esrv.deviceOrSite, esrv.serialNumber, esrv.reportedIssue, esrv.assignedTechnicianId, esrv.assignedTechnicianName, esrv.status, Number(esrv.laborCost), Number(esrv.totalBill), esrv.paymentStatus);
  }

  for (const srv of serviceJobs) {
    await prisma.serviceJob.upsert({
      where: { id: srv.id },
      update: srv,
      create: srv,
    });
    sqlite.prepare(`
      INSERT INTO service_jobs (id, job_card_number, customer_id, customer_name, customer_phone, customer_address, service_type, device_or_site, serial_number, reported_issue, assigned_technician_id, assigned_technician_name, status, labor_cost, total_bill, payment_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status;
    `).run(srv.id, srv.jobCardNumber, srv.customerId, srv.customerName, srv.customerPhone, srv.customerAddress, srv.serviceType, srv.deviceOrSite, srv.serialNumber, srv.reportedIssue, srv.assignedTechnicianId, srv.assignedTechnicianName, srv.status, Number(srv.laborCost), Number(srv.totalBill), srv.paymentStatus);
  }

  // -------------------------------------------------------------
  // 14. WARRANTY CLAIMS
  // -------------------------------------------------------------
  console.log('[14/16] Synchronizing Warranty Claims...');
  const warrantyClaims = [
    {
      id: 'wc-101',
      claimNumber: 'WAR-2026-001',
      serialNumber: 'HP430G8-BD-SOLD1',
      productName: 'HP ProBook 430 G8 Core i5',
      customerId: 'cust-1',
      customerName: 'Hasan Mahmud',
      customerPhone: '01712-345678',
      invoiceNumber: 'INV-2026-1004',
      issueDescription: 'Battery health drops quickly after 60% charge.',
      claimDate: new Date('2026-08-15'),
      status: 'UNDER_INSPECTION',
      resolutionNotes: 'Submitted battery diagnostics to Smart Technologies HP Service Desk.',
    }
  ];

  for (const wc of warrantyClaims) {
    await prisma.warrantyClaim.upsert({
      where: { id: wc.id },
      update: wc,
      create: wc,
    });
    sqlite.prepare(`
      INSERT INTO warranty_claims (id, claim_number, serial_number, product_name, customer_id, customer_name, customer_phone, invoice_number, issue_description, claim_date, status, resolution_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status;
    `).run(wc.id, wc.claimNumber, wc.serialNumber, wc.productName, wc.customerId, wc.customerName, wc.customerPhone, wc.invoiceNumber, wc.issueDescription, wc.claimDate.toISOString(), wc.status, wc.resolutionNotes);
  }

  // -------------------------------------------------------------
  // 15. OPERATIONAL EXPENSES
  // -------------------------------------------------------------
  console.log('[15/16] Synchronizing Business Expenses...');

  // Replicate any existing Postgres expenses into SQLite
  const existingPgExp = await prisma.expense.findMany();
  for (const eexp of existingPgExp) {
    sqlite.prepare(`
      INSERT INTO expenses (id, voucher_number, category, amount, date, payment_method, branch_id, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET amount=excluded.amount;
    `).run(eexp.id, eexp.voucherNumber, eexp.category, Number(eexp.amount), eexp.date.toISOString(), eexp.paymentMethod, eexp.branchId, eexp.description, eexp.createdBy || 'user-superadmin-1');
  }

  const expenses = [
    { id: 'exp-101', voucherNumber: 'EXP-2026-0801', category: 'Rent', amount: new Prisma.Decimal('35000.00'), date: new Date('2026-08-01'), paymentMethod: 'Bank Asia Transfer', branchId: 'branch-1', description: 'Monthly Showroom Commercial Rent (MR Plaza)', createdBy: 'user-superadmin-1' },
    { id: 'exp-102', voucherNumber: 'EXP-2026-0802', category: 'Utilities', amount: new Prisma.Decimal('8450.00'), date: new Date('2026-08-10'), paymentMethod: 'bKash', branchId: 'branch-1', description: 'BPDB Commercial Electricity Bill (August)', createdBy: 'user-superadmin-1' },
    { id: 'exp-103', voucherNumber: 'EXP-2026-0803', category: 'Utilities', amount: new Prisma.Decimal('2500.00'), date: new Date('2026-08-05'), paymentMethod: 'bKash', branchId: 'branch-1', description: 'Dedicated Optical Fiber Internet (50 Mbps)', createdBy: 'user-superadmin-1' },
    { id: 'exp-104', voucherNumber: 'EXP-2026-0804', category: 'Office Supplies', amount: new Prisma.Decimal('3200.00'), date: new Date('2026-08-20'), paymentMethod: 'Cash', branchId: 'branch-1', description: 'Staff Tea, Snacks & Customer Hospitality', createdBy: 'user-superadmin-1' },
    { id: 'exp-105', voucherNumber: 'EXP-2026-0805', category: 'Printing & Stationery', amount: new Prisma.Decimal('1850.00'), date: new Date('2026-08-22'), paymentMethod: 'Cash', branchId: 'branch-1', description: 'Thermal Paper Rolls & Barcode Sticker Supplies', createdBy: 'user-superadmin-1' },
  ];

  for (const exp of expenses) {
    await prisma.expense.upsert({
      where: { id: exp.id },
      update: exp,
      create: exp,
    });
    sqlite.prepare(`
      INSERT INTO expenses (id, voucher_number, category, amount, date, payment_method, branch_id, description, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET amount=excluded.amount;
    `).run(exp.id, exp.voucherNumber, exp.category, Number(exp.amount), exp.date.toISOString(), exp.paymentMethod, exp.branchId, exp.description, exp.createdBy || 'user-superadmin-1');
  }

  // -------------------------------------------------------------
  // 16. INVESTMENTS & AUDIT LOGS
  // -------------------------------------------------------------
  console.log('[16/16] Synchronizing Partner Investments & Enterprise Audit Trail...');
  const investments = [
    {
      id: 'inv-101',
      referenceNumber: 'CAP-2026-001',
      investorName: 'Amdadur Rahman',
      amount: new Prisma.Decimal('500000.00'),
      date: new Date('2026-01-01'),
      investmentType: 'FOUNDER_CAPITAL',
      depositAccountId: 'acc-2',
      paymentMethod: 'Bank Transfer',
      reference: 'Founding Equity Injection',
      status: 'ACTIVE',
      notes: 'Initial business seed capital for inventory and showroom decoration.',
      createdBy: 'user-superadmin-1',
    },
    {
      id: 'inv-102',
      referenceNumber: 'CAP-2026-002',
      investorName: 'AMDADS GROUP Sister Concern Allocation',
      amount: new Prisma.Decimal('300000.00'),
      date: new Date('2026-06-01'),
      investmentType: 'WORKING_CAPITAL',
      depositAccountId: 'acc-2',
      paymentMethod: 'Bank Transfer',
      reference: 'Working Capital Expansion',
      status: 'ACTIVE',
      notes: 'Financing for bulk laptop purchases and EMI capital pool.',
      createdBy: 'user-superadmin-1',
    },
  ];

  for (const inv of investments) {
    await prisma.investment.upsert({
      where: { id: inv.id },
      update: inv,
      create: inv,
    });
    sqlite.prepare(`
      INSERT INTO investments (id, reference_number, investor_name, amount, date, investment_type, deposit_account_id, payment_method, reference, status, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET amount=excluded.amount;
    `).run(inv.id, inv.referenceNumber, inv.investorName, Number(inv.amount), inv.date.toISOString(), inv.investmentType, inv.depositAccountId, inv.paymentMethod, inv.reference, inv.status, inv.notes, inv.createdBy);
  }

  // Audit log
  const auditId = 'audit-sync-' + Date.now();
  await prisma.auditLog.create({
    data: {
      id: auditId,
      userId: 'user-superadmin-1',
      userName: 'Amdadur Rahman',
      action: 'ENTERPRISE_DUAL_SYNC',
      module: 'DATABASE',
      recordId: 'main',
      details: 'Universal synchronization of authentic commercial catalog, stock, sales, EMI, staff, and accounting data across Supabase & SQLite.',
      ipAddress: '103.114.186.20',
    }
  });

  sqlite.prepare(`
    INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, module, record_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    auditId,
    new Date().toISOString(),
    'user-superadmin-1',
    'Amdadur Rahman',
    'ENTERPRISE_DUAL_SYNC',
    'DATABASE',
    'main',
    'Universal synchronization of authentic commercial catalog, stock, sales, EMI, staff, and accounting data across Supabase & SQLite.',
    '103.114.186.20'
  );

  console.log('\n================================================================');
  console.log('  🎉 SUCCESS: ALL REAL PRODUCTION DATA SYNCHRONIZED ACROSS BOTH');
  console.log('  1. Supabase PostgreSQL (Cloud Database)');
  console.log('  2. SQLite (Local / Offline Database: data/need_electro.db)');
  console.log('================================================================\n');

  // Verify Counts
  console.log('--- Database Verification Counts ---');
  const verifyCounts = {
    Branches: { postgres: await prisma.branch.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM branches').get().c },
    Categories: { postgres: await prisma.categoryConfig.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM categories_config').get().c },
    Brands: { postgres: await prisma.brandConfig.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM brands_config').get().c },
    Products: { postgres: await prisma.product.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM products').get().c },
    Serials: { postgres: await prisma.productSerial.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM product_serials').get().c },
    Customers: { postgres: await prisma.customer.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM customers').get().c },
    Suppliers: { postgres: await prisma.supplier.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM suppliers').get().c },
    Sales: { postgres: await prisma.sale.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM sales').get().c },
    Purchases: { postgres: await prisma.purchase.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM purchases').get().c },
    EMI_Accounts: { postgres: await prisma.eMIAccount.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM emi_accounts').get().c },
    Employees: { postgres: await prisma.employee.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM employees').get().c },
    Attendance: { postgres: await prisma.attendance.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM attendance').get().c },
    Technicians: { postgres: await prisma.technician.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM technicians').get().c },
    Service_Jobs: { postgres: await prisma.serviceJob.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM service_jobs').get().c },
    Warranty_Claims: { postgres: await prisma.warrantyClaim.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM warranty_claims').get().c },
    Expenses: { postgres: await prisma.expense.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM expenses').get().c },
    Investments: { postgres: await prisma.investment.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM investments').get().c },
    Financial_Accounts: { postgres: await prisma.financialAccount.count(), sqlite: sqlite.prepare('SELECT COUNT(*) as c FROM financial_accounts').get().c },
  };

  console.table(verifyCounts);
}

syncAll()
  .catch((e) => {
    console.error('Data synchronization error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
