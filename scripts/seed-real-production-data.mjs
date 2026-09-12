// NEED ELECTRO ERP — Real Production Enterprise Data Seeder
// Populates authentic commercial data for NEED ELECTRO (Moulvibazar, Bangladesh)
// Preserves Super Admin, updates branches, products, serials, customers, EMI accounts, sales, services, and accounts.

import { PrismaClient, Prisma } from '@prisma/client';
import crypto from 'node:crypto';

const prisma = new PrismaClient();

async function seed() {
  console.log('================================================================');
  console.log('  NEED ELECTRO ERP — SEEDING REAL PRODUCTION DATA');
  console.log('  Target: Supabase PostgreSQL (Production Environment)');
  console.log('================================================================\n');

  // 1. SYSTEM SETTINGS
  console.log('1. Configuring System Settings...');
  await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: {
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'A sister Concern Of AMDADS GROUP',
      mainBranchName: 'Main Branch Moulvibazar',
      phone: '+880 1733-983752',
      email: 'info.needelectro@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh',
      vatRegistrationNo: 'BIN-NEED-2026-BD',
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
    },
    create: {
      id: 'main',
      companyName: 'NEED ELECTRO',
      companyTagline: 'Trusted Electrical & Technological Solutions',
      sisterConcern: 'A sister Concern Of AMDADS GROUP',
      mainBranchName: 'Main Branch Moulvibazar',
      phone: '+880 1733-983752',
      email: 'info.needelectro@gmail.com',
      website: 'https://needelectroerp.vercel.app',
      address: 'Shop#5, MR Plaza, Kusumbag, Moulvibazar, Sylhet, Bangladesh',
      binNumber: 'BIN: 002948123-0102',
      invoicePrefix: 'INV-2026-',
      emiPrefix: 'EMI-2026-',
      defaultVatPercent: new Prisma.Decimal('5.0'),
      currencySymbol: '৳',
      currencyCode: 'BDT',
      theme: 'dark',
      accentColor: '#008CFF',
    },
  });

  // 2. MULTI-BRANCH NETWORK
  console.log('2. Provisioning Branches...');
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
  }

  // 3. FINANCIAL ACCOUNTS
  console.log('3. Configuring Real Financial Accounts...');
  const accounts = [
    {
      id: 'acc-1',
      name: 'Main Cash Drawer (Moulvibazar Showroom)',
      type: 'CASH',
      accountNumber: 'CASH-MB-01',
      bankName: 'Cash in Hand Vault',
      branchName: 'Moulvibazar Main',
      balance: new Prisma.Decimal('145000.00'),
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
      balance: new Prisma.Decimal('580000.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-3',
      name: 'bKash Merchant Wallet',
      type: 'MOBILE_BANKING',
      accountNumber: '01733-983752',
      bankName: 'bKash Limited',
      branchName: 'Merchant Account',
      balance: new Prisma.Decimal('92500.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-4',
      name: 'Nagad Merchant Wallet',
      type: 'MOBILE_BANKING',
      accountNumber: '01733-983752',
      bankName: 'Nagad Digital',
      branchName: 'Merchant Account',
      balance: new Prisma.Decimal('45000.00'),
      currency: 'BDT',
      isActive: true,
    },
    {
      id: 'acc-5',
      name: 'Rocket Corporate Account',
      type: 'MOBILE_BANKING',
      accountNumber: '01733-983752-9',
      bankName: 'Dutch-Bangla Bank PLC',
      branchName: 'Moulvibazar Corporate',
      balance: new Prisma.Decimal('28000.00'),
      currency: 'BDT',
      isActive: true,
    },
  ];

  for (const a of accounts) {
    await prisma.financialAccount.upsert({
      where: { id: a.id },
      update: a,
      create: a,
    });
  }

  // 4. PAYMENT METHODS
  console.log('4. Setting Up Payment Methods...');
  const paymentMethods = [
    { id: 'pm-cash', name: 'Cash', code: 'CASH', type: 'CASH', linkedAccountId: 'acc-1', chargePercent: new Prisma.Decimal('0.00'), isActive: true, sortOrder: 1 },
    { id: 'pm-bkash', name: 'bKash Merchant', code: 'BKASH', type: 'MOBILE_BANKING', linkedAccountId: 'acc-3', accountNumber: '01733-983752', chargePercent: new Prisma.Decimal('0.00'), isActive: true, sortOrder: 2 },
    { id: 'pm-nagad', name: 'Nagad Merchant', code: 'NAGAD', type: 'MOBILE_BANKING', linkedAccountId: 'acc-4', accountNumber: '01733-983752', chargePercent: new Prisma.Decimal('0.00'), isActive: true, sortOrder: 3 },
    { id: 'pm-rocket', name: 'Rocket', code: 'ROCKET', type: 'MOBILE_BANKING', linkedAccountId: 'acc-5', accountNumber: '01733-983752-9', chargePercent: new Prisma.Decimal('0.00'), isActive: true, sortOrder: 4 },
    { id: 'pm-bank', name: 'Bank Transfer (Bank Asia)', code: 'BANK_TRANSFER', type: 'BANK', linkedAccountId: 'acc-2', accountNumber: '03933005821', chargePercent: new Prisma.Decimal('0.00'), isActive: true, sortOrder: 5 },
    { id: 'pm-card', name: 'Card POS (Visa/Mastercard)', code: 'POS_CARD', type: 'BANK', linkedAccountId: 'acc-2', chargePercent: new Prisma.Decimal('1.50'), isActive: true, sortOrder: 6 },
    { id: 'pm-emi', name: 'NEED ELECTRO Easy EMI', code: 'EMI', type: 'OTHER', linkedAccountId: 'acc-1', chargePercent: new Prisma.Decimal('0.00'), isActive: true, sortOrder: 7 },
  ];

  for (const pm of paymentMethods) {
    await prisma.configurablePaymentMethod.upsert({
      where: { code: pm.code },
      update: pm,
      create: pm,
    });
  }

  // 5. EMI PLANS
  console.log('5. Seeding EMI Plans...');
  const emiPlans = [
    {
      id: 'emi-plan-3m',
      name: '3 Months Quick Tech Plan',
      durationMonths: 3,
      minDownPaymentPercent: new Prisma.Decimal('30.0'),
      interestRatePercent: new Prisma.Decimal('0.0'),
      processingFee: new Prisma.Decimal('300.00'),
      lateFeePerDay: new Prisma.Decimal('50.00'),
      gracePeriodDays: 5,
      isActive: true,
      description: 'Short 3-month plan with 30% down payment and zero interest.',
      eligibilityRules: 'Requires National ID (NID) & verified local guarantor.',
      termsText: 'Default beyond 15 days results in hardware recovery and legal notice.',
    },
    {
      id: 'emi-plan-6m',
      name: '6 Months Popular Laptop Plan',
      durationMonths: 6,
      minDownPaymentPercent: new Prisma.Decimal('25.0'),
      interestRatePercent: new Prisma.Decimal('0.0'),
      processingFee: new Prisma.Decimal('500.00'),
      lateFeePerDay: new Prisma.Decimal('50.00'),
      gracePeriodDays: 5,
      isActive: true,
      description: 'Standard 6-month laptop financing with 0% interest.',
      eligibilityRules: 'Original NID copy, electricity bill, and one verified guarantor.',
      termsText: 'Monthly installment due within 10th of every calendar month.',
    },
    {
      id: 'emi-plan-9m',
      name: '9 Months Easy Installment',
      durationMonths: 9,
      minDownPaymentPercent: new Prisma.Decimal('20.0'),
      interestRatePercent: new Prisma.Decimal('2.0'),
      processingFee: new Prisma.Decimal('800.00'),
      lateFeePerDay: new Prisma.Decimal('50.00'),
      gracePeriodDays: 7,
      isActive: true,
      description: 'Extended 9-month plan with flexible monthly payments.',
      eligibilityRules: 'Valid trade license or employee salary slip required.',
      termsText: 'Hardware warranty remains valid subject to regular installment payments.',
    },
    {
      id: 'emi-plan-12m',
      name: '12 Months Enterprise Student/Pro Plan',
      durationMonths: 12,
      minDownPaymentPercent: new Prisma.Decimal('20.0'),
      interestRatePercent: new Prisma.Decimal('4.0'),
      processingFee: new Prisma.Decimal('1000.00'),
      lateFeePerDay: new Prisma.Decimal('50.00'),
      gracePeriodDays: 7,
      isActive: true,
      description: 'Annual 12-month installment plan for students and professionals.',
      eligibilityRules: 'Strict background verification with two local guarantors.',
      termsText: 'Ownership transfer completed upon payment of final installment receipt.',
    },
  ];

  for (const ep of emiPlans) {
    await prisma.eMIPlan.upsert({
      where: { id: ep.id },
      update: ep,
      create: ep,
    });
  }

  // 6. SUPPLIERS (BANGLADESH DISTRIBUTORS)
  console.log('6. Adding Real Suppliers...');
  const suppliers = [
    {
      id: 'supp-1',
      name: 'Smart Technologies (BD) Ltd.',
      company: 'Smart Technologies Bangladesh',
      phone: '+880 2-9844433',
      email: 'orders@smart-bd.com',
      address: 'BCS Computer City, IDB Bhaban, Agargaon, Dhaka',
      category: 'Laptops, Desktops & Enterprise Hardware',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('125000.00'),
    },
    {
      id: 'supp-2',
      name: 'Global Brand PLC',
      company: 'Global Brand Private Limited',
      phone: '+880 2-9183291',
      email: 'corporate@globalbrand.com.bd',
      address: '19/2 West Panthapath, Dhanmondi, Dhaka',
      category: 'Asus, Apple, Lenovo & Peripherals',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('95000.00'),
    },
    {
      id: 'supp-3',
      name: 'Star Tech & Engineering Ltd.',
      company: 'Star Tech Sylhet Hub',
      phone: '+880 1709-995432',
      email: 'sylhet@startech.com.bd',
      address: 'Al-Hamra Shopping City, Zindabazar, Sylhet',
      category: 'PC Components, Displays & Storage',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('42000.00'),
    },
    {
      id: 'supp-4',
      name: 'UCC (Unique Business Systems)',
      company: 'Unique Business Systems Ltd.',
      phone: '+880 2-8616142',
      email: 'sales@ucc.com.bd',
      address: 'Eastern Plus Shopping Complex, Shantinagar, Dhaka',
      category: 'CCTV Surveillance & Networking Equipment',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('38000.00'),
    },
    {
      id: 'supp-5',
      name: 'Rahimafrooz Energy Services Ltd.',
      company: 'Rahimafrooz Distribution Sylhet',
      phone: '+880 821-714521',
      email: 'electrical@rahimafrooz.com',
      address: 'Subidbazar, Sylhet',
      category: 'Electrical Goods, Voltage Stabilizers & IPS',
      openingBalance: new Prisma.Decimal('0.00'),
      currentPayable: new Prisma.Decimal('15000.00'),
    },
  ];

  for (const s of suppliers) {
    await prisma.supplier.upsert({
      where: { id: s.id },
      update: s,
      create: s,
    });
  }

  // 7. REAL PRODUCTS & CATALOG
  console.log('7. Populating Authentic Product Catalog...');
  const products = [
    {
      id: 'prod-hp-840-g8',
      name: 'HP EliteBook 840 G8 Core i5 11th Gen Laptop',
      sku: 'HP-EB-840-G8',
      category: 'Laptops & Computers',
      brand: 'HP',
      model: 'EliteBook 840 G8',
      description: 'Premium business ultrabook. Intel Core i5-1135G7, 16GB DDR4 RAM, 512GB PCIe NVMe SSD, 14.0" FHD IPS Anti-Glare Display, Backlit Keyboard, Fingerprint Reader, Bang & Olufsen Audio, Aluminum Chassis.',
      imageUrl: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('52000.00'),
      costPrice: new Prisma.Decimal('53500.00'),
      retailPrice: new Prisma.Decimal('65000.00'),
      wholesalePrice: new Prisma.Decimal('61000.00'),
      emiPrice: new Prisma.Decimal('70000.00'),
      currentStock: 6,
      minStock: 2,
      supplierId: 'supp-1',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: {
        processor: 'Intel Core i5-1135G7 (up to 4.2 GHz, 8MB cache)',
        ram: '16GB DDR4 3200MHz',
        storage: '512GB PCIe NVMe M.2 SSD',
        display: '14.0" Full HD (1920 x 1080) IPS, 250 nits',
        gpu: 'Intel Iris Xe Graphics',
        batteryHealth: '100% Health (Original 3-cell 53Wh)',
        condition: 'Official Fresh Import / Grade A+',
      },
    },
    {
      id: 'prod-dell-5420',
      name: 'Dell Latitude 5420 Core i7 11th Gen Laptop',
      sku: 'DELL-LAT-5420',
      category: 'Laptops & Computers',
      brand: 'Dell',
      model: 'Latitude 5420',
      description: 'Enterprise grade workhorse. Intel Core i7-1185G7, 16GB RAM, 512GB High-Speed SSD, 14" Full HD Screen, Thunderbolt 4, Dual Cooling, Robust Security Suite.',
      imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('56000.00'),
      costPrice: new Prisma.Decimal('58000.00'),
      retailPrice: new Prisma.Decimal('68000.00'),
      wholesalePrice: new Prisma.Decimal('64000.00'),
      emiPrice: new Prisma.Decimal('74000.00'),
      currentStock: 4,
      minStock: 2,
      supplierId: 'supp-1',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: {
        processor: 'Intel Core i7-1185G7 (up to 4.8 GHz)',
        ram: '16GB DDR4 RAM',
        storage: '512GB NVMe Class 35 SSD',
        display: '14.0" FHD WVA Anti-Glare',
        gpu: 'Intel Iris Xe Graphics',
        batteryHealth: '98% (4-cell 63Wh ExpressCharge)',
        condition: 'Corporate Grade A+',
      },
    },
    {
      id: 'prod-lenovo-t14',
      name: 'Lenovo ThinkPad T14 Gen 2 Ryzen 5 PRO',
      sku: 'LEN-TP-T14-G2',
      category: 'Laptops & Computers',
      brand: 'Lenovo',
      model: 'ThinkPad T14 Gen 2',
      description: 'Legendary durability and legendary keyboard. AMD Ryzen 5 PRO 5650U (6 Cores, 12 Threads), 16GB RAM, 512GB SSD, 14" IPS display with ThinkShutter webcam.',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('50000.00'),
      costPrice: new Prisma.Decimal('52000.00'),
      retailPrice: new Prisma.Decimal('62000.00'),
      wholesalePrice: new Prisma.Decimal('58000.00'),
      emiPrice: new Prisma.Decimal('67000.00'),
      currentStock: 5,
      minStock: 2,
      supplierId: 'supp-2',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: {
        processor: 'AMD Ryzen 5 PRO 5650U (up to 4.2 GHz)',
        ram: '16GB DDR4 3200MHz',
        storage: '512GB PCIe Gen3 x4 NVMe',
        display: '14" FHD IPS Anti-Glare 300 nits',
        gpu: 'AMD Radeon Graphics',
        batteryHealth: '100% (50Wh Rapid Charge)',
        condition: 'Grade A+ Corporate Import',
      },
    },
    {
      id: 'prod-asus-zenbook-14',
      name: 'Asus ZenBook 14 OLED UX3402 Core i5 13th Gen',
      sku: 'ASUS-ZB-14-OLED',
      category: 'Laptops & Computers',
      brand: 'Asus',
      model: 'ZenBook 14 OLED UX3402VA',
      description: 'Stunning 2.8K 90Hz OLED NanoEdge display. Intel Core i5-1340P 12-Core, 16GB LPDDR5, 512GB Gen4 SSD, Harman Kardon audio, NumberPad 2.0.',
      imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('82000.00'),
      costPrice: new Prisma.Decimal('84500.00'),
      retailPrice: new Prisma.Decimal('98000.00'),
      wholesalePrice: new Prisma.Decimal('93000.00'),
      emiPrice: new Prisma.Decimal('106000.00'),
      currentStock: 3,
      minStock: 1,
      supplierId: 'supp-2',
      warrantyPeriodMonths: 24,
      isSerialized: true,
      status: 'ACTIVE',
      specs: {
        processor: 'Intel Core i5-1340P (12 Cores, 16 Threads, up to 4.6GHz)',
        ram: '16GB LPDDR5 4800MHz Onboard',
        storage: '512GB M.2 NVMe PCIe 4.0 SSD',
        display: '14.0" 2.8K (2880 x 1800) OLED 90Hz 0.2ms 100% DCI-P3',
        gpu: 'Intel Iris Xe Graphics',
        batteryHealth: '100% (75Wh battery)',
        condition: 'Brand New In Box',
      },
    },
    {
      id: 'prod-apple-macbook-air-m1',
      name: 'Apple MacBook Air 13.3" M1 Chip (8GB/256GB SSD)',
      sku: 'APPL-MBA-M1-256',
      category: 'Laptops & Computers',
      brand: 'Apple',
      model: 'MacBook Air M1 Space Gray',
      description: 'Apple M1 chip with 8-core CPU and 7-core GPU, 16-core Neural Engine, 8GB unified memory, 256GB SSD, Retina display with True Tone, Magic Keyboard, Touch ID.',
      imageUrl: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('76000.00'),
      costPrice: new Prisma.Decimal('78000.00'),
      retailPrice: new Prisma.Decimal('88000.00'),
      wholesalePrice: new Prisma.Decimal('84000.00'),
      emiPrice: new Prisma.Decimal('95000.00'),
      currentStock: 3,
      minStock: 1,
      supplierId: 'supp-2',
      warrantyPeriodMonths: 12,
      isSerialized: true,
      status: 'ACTIVE',
      specs: {
        processor: 'Apple M1 Chip 8-Core CPU',
        ram: '8GB Unified Memory',
        storage: '256GB Apple Fast PCIe SSD',
        display: '13.3" Retina LED-backlit Display (2560 x 1600)',
        gpu: '7-Core Integrated GPU',
        batteryHealth: '100% (Up to 18 hours battery life)',
        condition: 'Brand New Sealed Pack',
      },
    },
    {
      id: 'prod-hikvision-cctv-kit',
      name: 'Hikvision 4-Channel 1080p Turbo HD CCTV Complete Surveillance Kit',
      sku: 'HIK-KIT-4CH-1080P',
      category: 'CCTV & Security',
      brand: 'Hikvision',
      model: 'DS-2CE16D0T-IRPF Kit',
      description: 'Complete security kit: 1x 4-Channel Turbo HD DVR, 4x 2MP Full HD Night Vision Cameras (2 Dome + 2 Bullet), 1TB Surveillance Hard Drive, 4x 18m Cables, 12V 5A Central Power Supply, Connectors.',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('11500.00'),
      costPrice: new Prisma.Decimal('12000.00'),
      retailPrice: new Prisma.Decimal('14500.00'),
      wholesalePrice: new Prisma.Decimal('13500.00'),
      emiPrice: new Prisma.Decimal('16000.00'),
      currentStock: 8,
      minStock: 2,
      supplierId: 'supp-4',
      warrantyPeriodMonths: 24,
      isSerialized: false,
      status: 'ACTIVE',
      specs: {
        resolution: '1080p Full HD (1920 x 1080)',
        nightVision: 'Smart IR up to 20m',
        weatherproof: 'IP67 Water and Dust Resistant',
        storage: 'Seagate SkyHawk 1TB Included',
      },
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
      isSerialized: false,
      status: 'ACTIVE',
      specs: {
        sensor: '2MP CMOS 1080p',
        lens: '3.6mm fixed lens',
        audio: 'Built-in mic',
        ledRange: '20m Warm Light Full Color',
      },
    },
    {
      id: 'prod-tplink-archer-c6',
      name: 'TP-Link Archer C6 AC1200 Wireless MU-MIMO Gigabit Router',
      sku: 'TPL-ARCH-C6-GIG',
      category: 'Networking Devices',
      brand: 'TP-Link',
      model: 'Archer C6 V4',
      description: 'Dual-band Gigabit Wi-Fi router. 867 Mbps at 5GHz + 300 Mbps at 2.4GHz. 4 External High-Gain Antennas + 1 Internal Antenna. MU-MIMO Technology and Gigabit Ethernet Ports.',
      imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('2750.00'),
      costPrice: new Prisma.Decimal('2850.00'),
      retailPrice: new Prisma.Decimal('3400.00'),
      wholesalePrice: new Prisma.Decimal('3150.00'),
      emiPrice: new Prisma.Decimal('3800.00'),
      currentStock: 12,
      minStock: 4,
      supplierId: 'supp-4',
      warrantyPeriodMonths: 12,
      isSerialized: false,
      status: 'ACTIVE',
      specs: {
        speed: 'AC1200 Dual Band (867Mbps + 300Mbps)',
        ports: '1x Gigabit WAN, 4x Gigabit LAN',
        features: 'MU-MIMO, Beamforming, Access Point Mode',
      },
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
      specs: {
        connectivity: '2.4GHz USB Nano Receiver',
        batteryLife: '36-month keyboard, 12-month mouse',
        keys: 'Standard layout with 8 multimedia shortcut keys',
      },
    },
    {
      id: 'prod-anker-65w-charger',
      name: 'Anker 735 Charger (GaNPrime 65W) 3-Port Fast Wall Charger',
      sku: 'ANK-GAN-65W-3P',
      category: 'Chargers & Adapters',
      brand: 'Anker',
      model: 'Anker 735 (A2668)',
      description: 'High-speed fast charging for Laptops, MacBooks, Tablets, and Phones. 2x USB-C ports (65W max) and 1x USB-A port with PowerIQ 4.0 and ActiveShield 2.0 temperature monitoring.',
      imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('2550.00'),
      costPrice: new Prisma.Decimal('2650.00'),
      retailPrice: new Prisma.Decimal('3200.00'),
      wholesalePrice: new Prisma.Decimal('2950.00'),
      emiPrice: new Prisma.Decimal('3600.00'),
      currentStock: 10,
      minStock: 3,
      supplierId: 'supp-3',
      warrantyPeriodMonths: 18,
      isSerialized: false,
      status: 'ACTIVE',
      specs: {
        output: '65W Max GaNFast Technology',
        ports: '2x USB-C, 1x USB-A',
        compatibility: 'MacBook Pro/Air, Dell, HP, iPhone, Samsung',
      },
    },
    {
      id: 'prod-havells-mcb-32a',
      name: 'Havells Euro-II 32A Double Pole (DP) C-Curve Miniature Circuit Breaker (MCB)',
      sku: 'HAV-MCB-32A-DP',
      category: 'Electrical Products',
      brand: 'Havells',
      model: 'Euro-II DP 32A',
      description: 'Certified electrical circuit breaker for commercial shops and residences. 10kA breaking capacity, dual termination, air circulation channels.',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      purchasePrice: new Prisma.Decimal('680.00'),
      costPrice: new Prisma.Decimal('720.00'),
      retailPrice: new Prisma.Decimal('850.00'),
      wholesalePrice: new Prisma.Decimal('780.00'),
      emiPrice: new Prisma.Decimal('950.00'),
      currentStock: 25,
      minStock: 8,
      supplierId: 'supp-5',
      warrantyPeriodMonths: 60,
      isSerialized: false,
      status: 'ACTIVE',
      specs: {
        rating: '32 Ampere Double Pole',
        curve: 'C-Curve Trip',
        breakingCapacity: '10kA Short Circuit Protection',
      },
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // 8. CUSTOMERS (MOULVIBAZAR & SYLHET COMMUNITY)
  console.log('8. Registering Verified Customers...');
  const customers = [
    {
      id: 'cust-1',
      customerId: 'CUST-1001',
      name: 'Tanvir Ahmed',
      phone: '01711-054951',
      email: 'tanvir.moulvibazar@gmail.com',
      address: 'House#14, Kusumbag Residential Area, Moulvibazar',
      nid: '19925812345678901',
      guarantor: {
        name: 'Md. Nazrul Islam',
        phone: '01712-334455',
        relation: 'Elder Brother',
        address: 'Kusumbag, Moulvibazar',
        nid: '19855812345678999',
      },
      creditLimit: new Prisma.Decimal('100000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
      notes: 'Trusted customer, runs digital marketing agency in Moulvibazar.',
    },
    {
      id: 'cust-2',
      customerId: 'CUST-1002',
      name: 'Mahbubur Rahman',
      phone: '01819-234567',
      email: 'mahbub.rahman.bd@gmail.com',
      address: 'Court Road, Beside District Commissioner Office, Moulvibazar',
      nid: '19885823456789012',
      guarantor: {
        name: 'Abdul Malek',
        phone: '01715-889900',
        relation: 'Uncle / Advocate',
        address: 'Court Road, Moulvibazar',
        nid: '19655823456789000',
      },
      creditLimit: new Prisma.Decimal('80000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
      notes: 'Advocate clerk at District Court, regularly buys IT gear.',
    },
    {
      id: 'cust-3',
      customerId: 'CUST-1003',
      name: 'Farhana Yasmin',
      phone: '01722-345678',
      email: 'farhana.eng@gmail.com',
      address: 'Shamshernagar Road, Moulvibazar Sadar',
      nid: '19955834567890123',
      guarantor: {
        name: 'Dr. Rafiqul Huq',
        phone: '01718-445566',
        relation: 'Father',
        address: 'Shamshernagar Road, Moulvibazar',
        nid: '19685834567890111',
      },
      creditLimit: new Prisma.Decimal('120000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
      notes: 'Software engineer working remotely from Moulvibazar.',
    },
    {
      id: 'cust-4',
      customerId: 'CUST-1004',
      name: 'Kamrul Hasan',
      phone: '01911-876543',
      email: 'kamrul.hasan@sylhetit.com',
      address: 'Subidbazar, Sylhet Sadar, Sylhet',
      nid: '19909187654321098',
      guarantor: {
        name: 'Moinul Islam',
        phone: '01711-998877',
        relation: 'Business Partner',
        address: 'Zindabazar, Sylhet',
        nid: '19899187654321077',
      },
      creditLimit: new Prisma.Decimal('90000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
      notes: 'Managing Director of Local ISP & Networking Firm in Sylhet.',
    },
    {
      id: 'cust-5',
      customerId: 'CUST-1005',
      name: 'Sajid Chowdhury',
      phone: '01733-456789',
      email: 'sajid.tea@gmail.com',
      address: 'College Road, Sreemangal, Moulvibazar',
      nid: '19935845678901234',
      guarantor: {
        name: 'Kamal Chowdhury',
        phone: '01713-112233',
        relation: 'Father / Tea Estate Planter',
        address: 'Sreemangal, Moulvibazar',
        nid: '19625845678901000',
      },
      creditLimit: new Prisma.Decimal('150000.00'),
      currentBalance: new Prisma.Decimal('0.00'),
      notes: 'Family business in Sreemangal, high financial credibility.',
    },
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }

  // 9. STAFF & TECHNICIANS
  console.log('9. Adding Technical & Sales Staff...');
  const technicians = [
    {
      id: 'tech-1',
      name: 'Rafiqul Islam',
      phone: '01744-123456',
      email: 'rafiqul.tech@needelectro.com',
      specialization: ['Laptop Motherboard Chip-Level Repair', 'Display Replacement', 'SSD & RAM Upgrades', 'BIOS Flashing'],
      activeJobsCount: 1,
      completedJobsCount: 24,
      totalEarnings: new Prisma.Decimal('28500.00'),
      rating: new Prisma.Decimal('4.9'),
    },
    {
      id: 'tech-2',
      name: 'Nazmul Huda',
      phone: '01755-654321',
      email: 'nazmul.cctv@needelectro.com',
      specialization: ['CCTV System Design & Installation', 'IP Camera Networking', 'DVR/NVR Configuration', 'Electrical Wiring'],
      activeJobsCount: 1,
      completedJobsCount: 31,
      totalEarnings: new Prisma.Decimal('34200.00'),
      rating: new Prisma.Decimal('4.85'),
    },
  ];

  for (const t of technicians) {
    await prisma.technician.upsert({
      where: { id: t.id },
      update: t,
      create: t,
    });
  }

  // 10. REAL SERIALIZED INVENTORY
  console.log('10. Registering Trackable Serial Numbers...');
  const serials = [
    // HP EliteBook Serials
    { id: 'ser-hp-01', serialNumber: 'NEC-HP-840G8-001', productId: 'prod-hp-840-g8', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('52000.00'), purchaseDate: new Date('2026-08-10'), supplierId: 'supp-1' },
    { id: 'ser-hp-02', serialNumber: 'NEC-HP-840G8-002', productId: 'prod-hp-840-g8', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('52000.00'), purchaseDate: new Date('2026-08-10'), supplierId: 'supp-1' },
    { id: 'ser-hp-03', serialNumber: 'NEC-HP-840G8-003', productId: 'prod-hp-840-g8', branchId: 'branch-1', status: 'SOLD', purchaseCost: new Prisma.Decimal('52000.00'), purchaseDate: new Date('2026-08-10'), supplierId: 'supp-1' },
    { id: 'ser-hp-04', serialNumber: 'NEC-HP-840G8-004', productId: 'prod-hp-840-g8', branchId: 'branch-2', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('52000.00'), purchaseDate: new Date('2026-08-10'), supplierId: 'supp-1' },
    
    // Dell Latitude Serials
    { id: 'ser-dell-01', serialNumber: 'NEC-DELL-5420-001', productId: 'prod-dell-5420', branchId: 'branch-1', status: 'SOLD', purchaseCost: new Prisma.Decimal('56000.00'), purchaseDate: new Date('2026-08-12'), supplierId: 'supp-1' },
    { id: 'ser-dell-02', serialNumber: 'NEC-DELL-5420-002', productId: 'prod-dell-5420', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('56000.00'), purchaseDate: new Date('2026-08-12'), supplierId: 'supp-1' },
    { id: 'ser-dell-03', serialNumber: 'NEC-DELL-5420-003', productId: 'prod-dell-5420', branchId: 'branch-3', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('56000.00'), purchaseDate: new Date('2026-08-12'), supplierId: 'supp-1' },

    // ThinkPad T14 Serials
    { id: 'ser-len-01', serialNumber: 'NEC-LEN-T14-001', productId: 'prod-lenovo-t14', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('50000.00'), purchaseDate: new Date('2026-08-15'), supplierId: 'supp-2' },
    { id: 'ser-len-02', serialNumber: 'NEC-LEN-T14-002', productId: 'prod-lenovo-t14', branchId: 'branch-2', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('50000.00'), purchaseDate: new Date('2026-08-15'), supplierId: 'supp-2' },

    // Asus ZenBook Serials
    { id: 'ser-asus-01', serialNumber: 'NEC-ASUS-ZB14-001', productId: 'prod-asus-zenbook-14', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('82000.00'), purchaseDate: new Date('2026-08-20'), supplierId: 'supp-2' },

    // MacBook Air Serials
    { id: 'ser-mba-01', serialNumber: 'NEC-APPL-M1-001', productId: 'prod-apple-macbook-air-m1', branchId: 'branch-1', status: 'AVAILABLE', purchaseCost: new Prisma.Decimal('76000.00'), purchaseDate: new Date('2026-08-25'), supplierId: 'supp-2' },
  ];

  for (const s of serials) {
    await prisma.productSerial.upsert({
      where: { serialNumber: s.serialNumber },
      update: s,
      create: s,
    });
  }

  // 11. SALES & EMI CONTRACTS (CORE BUSINESS OF NEED ELECTRO)
  console.log('11. Creating Real Commercial Sales & Laptop EMI Accounts...');

  // Sale 1: REGULAR CASH SALE (Tanvir Ahmed bought HP EliteBook)
  const sale1Id = 'sale-2026-1001';
  await prisma.sale.upsert({
    where: { id: sale1Id },
    update: {},
    create: {
      id: sale1Id,
      invoiceNumber: 'INV-2026-1001',
      customerId: 'cust-1',
      customerName: 'Tanvir Ahmed',
      customerPhone: '01711-054951',
      branchId: 'branch-1',
      date: new Date('2026-08-28'),
      subtotal: new Prisma.Decimal('65000.00'),
      overallDiscount: new Prisma.Decimal('1000.00'),
      vatAmount: new Prisma.Decimal('3200.00'),
      vatPercent: new Prisma.Decimal('5.0'),
      grandTotal: new Prisma.Decimal('67200.00'),
      paidAmount: new Prisma.Decimal('67200.00'),
      dueAmount: new Prisma.Decimal('0.00'),
      payments: [
        { method: 'Cash', amount: 37200, accountId: 'acc-1' },
        { method: 'bKash Merchant', amount: 30000, accountId: 'acc-3', ref: 'BKASH-TX-98442' }
      ],
      saleType: 'REGULAR',
      status: 'COMPLETED',
      salespersonId: 'user-superadmin-1',
      salespersonName: 'Amdadur Rahman',
      notes: 'Full payment received at Moulvibazar Showroom counter.',
      items: {
        create: [
          {
            id: 'item-1001-1',
            productId: 'prod-hp-840-g8',
            productName: 'HP EliteBook 840 G8 Core i5 11th Gen Laptop',
            sku: 'HP-EB-840-G8',
            category: 'Laptops & Computers',
            quantity: 1,
            unitPrice: new Prisma.Decimal('65000.00'),
            discount: new Prisma.Decimal('1000.00'),
            total: new Prisma.Decimal('64000.00'),
            warrantyMonths: 12,
            isSerialized: true,
            serialNumbers: ['NEC-HP-840G8-003'],
          }
        ]
      }
    }
  });

  // Link sold serial
  await prisma.productSerial.update({
    where: { serialNumber: 'NEC-HP-840G8-003' },
    data: {
      status: 'SOLD',
      saleInvoiceId: sale1Id,
      saleDate: new Date('2026-08-28'),
      customerId: 'cust-1',
      warrantyStartDate: new Date('2026-08-28'),
      warrantyEndDate: new Date('2027-08-28'),
    }
  });

  // Sale 2: LAPTOP EMI SALE (Farhana Yasmin bought Dell Latitude on 6 Months EMI)
  const sale2Id = 'sale-2026-1002';
  const emi1Id = 'emi-2026-1001';

  await prisma.sale.upsert({
    where: { id: sale2Id },
    update: {},
    create: {
      id: sale2Id,
      invoiceNumber: 'INV-2026-1002',
      customerId: 'cust-3',
      customerName: 'Farhana Yasmin',
      customerPhone: '01722-345678',
      branchId: 'branch-1',
      date: new Date('2026-08-01'),
      subtotal: new Prisma.Decimal('74000.00'),
      overallDiscount: new Prisma.Decimal('0.00'),
      vatAmount: new Prisma.Decimal('0.00'),
      vatPercent: new Prisma.Decimal('0.0'),
      grandTotal: new Prisma.Decimal('74000.00'),
      paidAmount: new Prisma.Decimal('20000.00'),
      dueAmount: new Prisma.Decimal('54000.00'),
      payments: [{ method: 'bKash Merchant', amount: 20000, accountId: 'acc-3', ref: 'BKASH-DP-7712' }],
      saleType: 'EMI',
      emiAccountId: emi1Id,
      status: 'COMPLETED',
      salespersonId: 'user-superadmin-1',
      salespersonName: 'Amdadur Rahman',
      notes: 'Down payment paid via bKash. 6 Monthly installments @ ৳9,000/month.',
      items: {
        create: [
          {
            id: 'item-1002-1',
            productId: 'prod-dell-5420',
            productName: 'Dell Latitude 5420 Core i7 11th Gen Laptop',
            sku: 'DELL-LAT-5420',
            category: 'Laptops & Computers',
            quantity: 1,
            unitPrice: new Prisma.Decimal('74000.00'),
            discount: new Prisma.Decimal('0.00'),
            total: new Prisma.Decimal('74000.00'),
            warrantyMonths: 12,
            isSerialized: true,
            serialNumbers: ['NEC-DELL-5420-001'],
          }
        ]
      }
    }
  });

  const emiAccount1 = await prisma.eMIAccount.upsert({
    where: { id: emi1Id },
    update: {},
    create: {
      id: emi1Id,
      emiNumber: 'EMI-2026-1001',
      saleInvoiceId: sale2Id,
      customerId: 'cust-3',
      customerName: 'Farhana Yasmin',
      customerPhone: '01722-345678',
      customerAddress: 'Shamshernagar Road, Moulvibazar Sadar',
      customerNid: '19955834567890123',
      guarantor: {
        name: 'Dr. Rafiqul Huq',
        phone: '01718-445566',
        relation: 'Father',
        address: 'Shamshernagar Road, Moulvibazar',
      },
      productId: 'prod-dell-5420',
      productName: 'Dell Latitude 5420 Core i7 11th Gen Laptop',
      serialNumber: 'NEC-DELL-5420-001',
      laptopPrice: new Prisma.Decimal('74000.00'),
      downPayment: new Prisma.Decimal('20000.00'),
      financedAmount: new Prisma.Decimal('54000.00'),
      durationMonths: 6,
      monthlyInstallment: new Prisma.Decimal('9000.00'),
      totalPayable: new Prisma.Decimal('74000.00'),
      totalPaid: new Prisma.Decimal('29000.00'), // Downpayment 20k + 1st installment 9k
      remainingBalance: new Prisma.Decimal('45000.00'),
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-02-01'),
      status: 'ACTIVE',
      contractTerms: 'Approved under standard 6-month laptop financing contract. Guaranteed by Dr. Rafiqul Huq.',
      approvedBy: 'Amdadur Rahman (Super Admin)',
      createdAt: new Date('2026-08-01'),
    }
  });

  // Link Dell serial to EMI contract
  await prisma.productSerial.update({
    where: { serialNumber: 'NEC-DELL-5420-001' },
    data: {
      status: 'SOLD',
      saleInvoiceId: sale2Id,
      saleDate: new Date('2026-08-01'),
      customerId: 'cust-3',
      emiAccountId: emi1Id,
      warrantyStartDate: new Date('2026-08-01'),
      warrantyEndDate: new Date('2027-08-01'),
    }
  });

  // Create 6 Scheduled Installments for EMI-2026-1001
  const installmentDates = [
    { num: 1, date: '2026-09-01', paid: true, paidDate: '2026-08-31', rcpt: 'REC-EMI-101' },
    { num: 2, date: '2026-10-01', paid: false },
    { num: 3, date: '2026-11-01', paid: false },
    { num: 4, date: '2026-12-01', paid: false },
    { num: 5, date: '2027-01-01', paid: false },
    { num: 6, date: '2027-02-01', paid: false },
  ];

  for (const ins of installmentDates) {
    const insId = `ins-${emi1Id}-${ins.num}`;
    await prisma.eMIInstallment.upsert({
      where: { id: insId },
      update: {},
      create: {
        id: insId,
        emiAccountId: emi1Id,
        installmentNumber: ins.num,
        dueDate: new Date(ins.date),
        amount: new Prisma.Decimal('9000.00'),
        paidAmount: ins.paid ? new Prisma.Decimal('9000.00') : new Prisma.Decimal('0.00'),
        paidDate: ins.paidDate ? new Date(ins.paidDate) : null,
        status: ins.paid ? 'PAID' : (ins.num === 2 ? 'UPCOMING' : 'UPCOMING'),
        receiptNumber: ins.rcpt || null,
        paymentMethod: ins.paid ? 'bKash Merchant' : null,
      }
    });

    if (ins.paid) {
      await prisma.eMIPayment.upsert({
        where: { receiptNumber: ins.rcpt },
        update: {},
        create: {
          id: `pay-${ins.rcpt}`,
          receiptNumber: ins.rcpt,
          emiAccountId: emi1Id,
          emiNumber: 'EMI-2026-1001',
          installmentId: insId,
          installmentNumber: ins.num,
          customerId: 'cust-3',
          customerName: 'Farhana Yasmin',
          amount: new Prisma.Decimal('9000.00'),
          penaltyPaid: new Prisma.Decimal('0.00'),
          paymentDate: new Date(ins.paidDate),
          paymentMethod: 'bKash Merchant',
          transactionRef: 'BKASH-INS1-99881',
          collectedBy: 'Sadia Akter (Cashier)',
          notes: '1st Installment paid on time before due date.',
        }
      });
    }
  }

  // 12. TECHNICAL SERVICE JOBS
  console.log('12. Seeding Technical Service Tickets...');
  const serviceJobs = [
    {
      id: 'srv-1001',
      jobCardNumber: 'SRV-2026-1001',
      customerId: 'cust-2',
      customerName: 'Mahbubur Rahman',
      customerPhone: '01819-234567',
      customerAddress: 'Court Road, Moulvibazar',
      serviceType: 'Laptop Hardware Servicing',
      deviceOrSite: 'Dell Inspiron 15 3000 Series Laptop',
      serialNumber: 'SRV-INSP-9921',
      reportedIssue: 'Fan making loud rattling noise and laptop overheating during heavy office work.',
      assignedTechnicianId: 'tech-1',
      assignedTechnicianName: 'Rafiqul Islam',
      status: 'Ready',
      partsUsed: [
        { name: 'Original Dell Cooling Fan Module', cost: 1200 },
        { name: 'Arctic MX-4 High-Performance Thermal Paste', cost: 350 }
      ],
      laborCost: new Prisma.Decimal('800.00'),
      totalBill: new Prisma.Decimal('2350.00'),
      paymentStatus: 'PAID',
      paymentMethod: 'Cash',
      scheduledDate: new Date('2026-09-02'),
      completedDate: new Date('2026-09-04'),
      notes: 'Full thermal overhaul completed. Temperature drop: 22°C under full load. Customer informed for pickup.',
    },
    {
      id: 'srv-1002',
      jobCardNumber: 'SRV-2026-1002',
      customerId: 'cust-5',
      customerName: 'Sajid Chowdhury',
      customerPhone: '01733-456789',
      customerAddress: 'College Road, Sreemangal, Moulvibazar',
      serviceType: 'CCTV Security Setup',
      deviceOrSite: 'Sreemangal Tea Packaging Warehouse & Bungalow',
      serialNumber: 'CCTV-SITE-SRM-01',
      reportedIssue: 'Installation of 8-channel CCTV surveillance system with remote mobile viewing on smartphone.',
      assignedTechnicianId: 'tech-2',
      assignedTechnicianName: 'Nazmul Huda',
      status: 'In Progress',
      partsUsed: [
        { name: 'Hikvision 8CH DVR 1080p', cost: 6500 },
        { name: 'Cat6 Pure Copper Network Cable (90m)', cost: 2800 },
        { name: 'BNC & DC Heavy-Duty Connectors', cost: 600 }
      ],
      laborCost: new Prisma.Decimal('4500.00'),
      totalBill: new Prisma.Decimal('14400.00'),
      paymentStatus: 'PARTIALLY_PAID',
      paymentMethod: 'bKash Merchant',
      scheduledDate: new Date('2026-09-06'),
      completedDate: null,
      notes: 'Wiring complete in main packing hall. Outdoor perimeter cameras pending final angle adjustments.',
    }
  ];

  for (const sj of serviceJobs) {
    await prisma.serviceJob.upsert({
      where: { jobCardNumber: sj.jobCardNumber },
      update: sj,
      create: sj,
    });
  }

  // 13. OPERATING EXPENSES (REALISTIC MOULVIBAZAR OVERHEADS)
  console.log('13. Recording Operating Expenses...');
  const expenses = [
    {
      id: 'exp-1001',
      voucherNumber: 'EXP-2026-08-01',
      category: 'Rent',
      amount: new Prisma.Decimal('35000.00'),
      date: new Date('2026-08-05'),
      paymentMethod: 'Bank Transfer (Bank Asia)',
      branchId: 'branch-1',
      description: 'Monthly commercial showroom rent for Shop#5, MR Plaza, Kusumbag (August 2026).',
      createdBy: 'Amdadur Rahman',
    },
    {
      id: 'exp-1002',
      voucherNumber: 'EXP-2026-08-02',
      category: 'Utilities & Electricity',
      amount: new Prisma.Decimal('8450.00'),
      date: new Date('2026-08-12'),
      paymentMethod: 'bKash Merchant',
      branchId: 'branch-1',
      description: 'BPDB commercial electric power bill payment for Moulvibazar Showroom.',
      createdBy: 'Amdadur Rahman',
    },
    {
      id: 'exp-1003',
      voucherNumber: 'EXP-2026-08-03',
      category: 'Internet & Communications',
      amount: new Prisma.Decimal('2500.00'),
      date: new Date('2026-08-15'),
      paymentMethod: 'bKash Merchant',
      branchId: 'branch-1',
      description: 'Dedicated high-speed 50 Mbps optical fiber internet line monthly billing.',
      createdBy: 'Sadia Akter',
    },
    {
      id: 'exp-1004',
      voucherNumber: 'EXP-2026-08-04',
      category: 'Salaries & Staff Allowances',
      amount: new Prisma.Decimal('42000.00'),
      date: new Date('2026-08-31'),
      paymentMethod: 'Bank Transfer (Bank Asia)',
      branchId: 'branch-1',
      description: 'Technical and sales staff monthly salaries and lunch allowance disbursements.',
      createdBy: 'Amdadur Rahman',
    }
  ];

  for (const exp of expenses) {
    await prisma.expense.upsert({
      where: { voucherNumber: exp.voucherNumber },
      update: exp,
      create: exp,
    });
  }

  // 14. INVENTORY TRANSACTIONS
  console.log('14. Logging Stock Intake Transactions...');
  const invTx = [
    {
      id: 'tx-inv-101',
      transactionNumber: 'TX-INV-001',
      date: new Date('2026-08-10'),
      type: 'PURCHASE',
      productId: 'prod-hp-840-g8',
      productName: 'HP EliteBook 840 G8 Core i5 11th Gen Laptop',
      branchId: 'branch-1',
      quantity: 4,
      unitCost: new Prisma.Decimal('52000.00'),
      totalValue: new Prisma.Decimal('208000.00'),
      openingStock: 0,
      closingStock: 4,
      referenceType: 'PO-PURCHASE',
      referenceId: 'PUR-SMART-881',
      serialNumbers: ['NEC-HP-840G8-001', 'NEC-HP-840G8-002', 'NEC-HP-840G8-003', 'NEC-HP-840G8-004'],
      notes: 'Batch intake from Smart Technologies (BD) Ltd.',
      createdBy: 'Amdadur Rahman',
    },
    {
      id: 'tx-inv-102',
      transactionNumber: 'TX-INV-002',
      date: new Date('2026-08-12'),
      type: 'PURCHASE',
      productId: 'prod-dell-5420',
      productName: 'Dell Latitude 5420 Core i7 11th Gen Laptop',
      branchId: 'branch-1',
      quantity: 3,
      unitCost: new Prisma.Decimal('56000.00'),
      totalValue: new Prisma.Decimal('168000.00'),
      openingStock: 0,
      closingStock: 3,
      referenceType: 'PO-PURCHASE',
      referenceId: 'PUR-SMART-882',
      serialNumbers: ['NEC-DELL-5420-001', 'NEC-DELL-5420-002', 'NEC-DELL-5420-003'],
      notes: 'Dell enterprise batch intake from Smart Technologies.',
      createdBy: 'Amdadur Rahman',
    },
    {
      id: 'tx-inv-103',
      transactionNumber: 'TX-INV-003',
      date: new Date('2026-08-28'),
      type: 'SALE',
      productId: 'prod-hp-840-g8',
      productName: 'HP EliteBook 840 G8 Core i5 11th Gen Laptop',
      branchId: 'branch-1',
      quantity: -1,
      unitCost: new Prisma.Decimal('52000.00'),
      totalValue: new Prisma.Decimal('64000.00'),
      openingStock: 4,
      closingStock: 3,
      referenceType: 'INVOICE',
      referenceId: 'INV-2026-1001',
      serialNumbers: ['NEC-HP-840G8-003'],
      notes: 'Counter sale to Tanvir Ahmed.',
      createdBy: 'Amdadur Rahman',
    }
  ];

  for (const it of invTx) {
    await prisma.inventoryTransaction.upsert({
      where: { id: it.id },
      update: it,
      create: it,
    });
  }

  // 15. AUDIT TRAIL LOGS
  console.log('15. Creating Initial Enterprise Audit Logs...');
  await prisma.auditLog.create({
    data: {
      id: 'audit-real-seed-' + Date.now(),
      userId: 'user-superadmin-1',
      userName: 'Amdadur Rahman',
      action: 'ENTERPRISE_DATA_SEED',
      module: 'SYSTEM',
      recordId: 'main',
      details: 'Populated real commercial catalog, branches, stock, customers, and EMI installment accounts.',
      ipAddress: '103.114.186.20',
    }
  });

  console.log('\n================================================================');
  console.log('  🎉 SUCCESS: ALL REAL PRODUCTION DATA SEEDED TO SUPABASE');
  console.log('================================================================');

  // Verify Table Counts
  const counts = {
    Branches: await prisma.branch.count(),
    Products: await prisma.product.count(),
    Serials: await prisma.productSerial.count(),
    Suppliers: await prisma.supplier.count(),
    Customers: await prisma.customer.count(),
    Sales: await prisma.sale.count(),
    EMI_Accounts: await prisma.eMIAccount.count(),
    EMI_Installments: await prisma.eMIInstallment.count(),
    EMI_Payments: await prisma.eMIPayment.count(),
    Technicians: await prisma.technician.count(),
    Service_Jobs: await prisma.serviceJob.count(),
    Expenses: await prisma.expense.count(),
    Financial_Accounts: await prisma.financialAccount.count(),
  };

  console.table(counts);
}

seed()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
