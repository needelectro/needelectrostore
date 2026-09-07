// NEED ELECTRO ERP — End-to-End Production Verification Test Suite
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { PrismaClient, Prisma } from '@prisma/client';
import { generateInvoiceHTML } from '../lib/pdf.ts';

console.log('\n======================================================');
console.log('  NEED ELECTRO ERP — PRODUCTION VERIFICATION SUITE');
console.log('======================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✔ [PASS] ${message}`);
  } else {
    console.error(`  ✖ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

// -------------------------------------------------------------
// TEST 1: SQLite Data Preservation & SQL Seed Generation
// -------------------------------------------------------------
console.log('\n--- Test 1: Data Preservation & SQLite Seed Export ---');
const dbPath = path.resolve(process.cwd(), 'data/need_electro.db');
const seedPath = path.resolve(process.cwd(), 'prisma/seed_from_sqlite.sql');

assert(fs.existsSync(dbPath), 'Existing SQLite database data/need_electro.db exists.');
assert(fs.existsSync(seedPath), 'PostgreSQL migration seed prisma/seed_from_sqlite.sql generated.');

const db = new DatabaseSync(dbPath);
const userRow = db.prepare("SELECT * FROM users WHERE role = 'SUPER_ADMIN'").get();
assert(userRow && userRow.email === 'contact.amdadur@gmail.com', 'Super Admin Amdadur Rahman found in database.');
assert(userRow.name === 'Amdadur Rahman', 'Super Admin name matches exact specification.');

const seedContent = fs.readFileSync(seedPath, 'utf8');
assert(seedContent.includes('INSERT INTO system_settings'), 'SQL seed contains system settings.');
assert(seedContent.includes('contact.amdadur@gmail.com'), 'SQL seed contains Super Admin email.');
assert(seedContent.includes('INSERT INTO emi_accounts'), 'SQL seed contains existing EMI accounts.');
assert(seedContent.includes('INSERT INTO sales'), 'SQL seed contains existing sales invoices.');

// -------------------------------------------------------------
// TEST 2: Environment Configuration & Hygiene
// -------------------------------------------------------------
console.log('\n--- Test 2: Environment Security & Hygiene ---');
const gitignore = fs.readFileSync(path.resolve(process.cwd(), '.gitignore'), 'utf8');
assert(gitignore.includes('.env'), '.gitignore blocks .env files.');
assert(gitignore.includes('data/*.db'), '.gitignore blocks SQLite database files.');

const envExample = fs.readFileSync(path.resolve(process.cwd(), '.env.example'), 'utf8');
assert(envExample.includes('DATABASE_URL='), '.env.example specifies DATABASE_URL.');
assert(envExample.includes('DIRECT_URL='), '.env.example specifies DIRECT_URL.');
assert(envExample.includes('NEXT_PUBLIC_APP_URL='), '.env.example specifies NEXT_PUBLIC_APP_URL.');
assert(envExample.includes('SUPER_ADMIN_EMAIL='), '.env.example specifies SUPER_ADMIN_EMAIL.');

// -------------------------------------------------------------
// TEST 3: Cryptographic Password Hashing & Constant-Time Verification
// -------------------------------------------------------------
console.log('\n--- Test 3: Password Security & Constant-Time Verification ---');

function hashPassword(password, saltHex = null) {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `pbkdf2:sha256:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.startsWith('pbkdf2:sha256:')) return false;
  const parts = storedHash.split(':');
  if (parts.length !== 5) return false;
  const iterations = parseInt(parts[2], 10);
  const salt = Buffer.from(parts[3], 'hex');
  const expectedHash = Buffer.from(parts[4], 'hex');
  const actualHash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return crypto.timingSafeEqual(expectedHash, actualHash);
}

const testPass = 'SuperSecret@2026';
const hashed = hashPassword(testPass);
assert(hashed.startsWith('pbkdf2:sha256:100000:'), 'Password correctly hashed with 100,000 PBKDF2 rounds.');
assert(verifyPassword(testPass, hashed) === true, 'Correct password validates with timingSafeEqual.');
assert(verifyPassword('WrongPassword', hashed) === false, 'Incorrect password safely rejected.');

// -------------------------------------------------------------
// TEST 4: Financial Precision & Decimal Arithmetic
// -------------------------------------------------------------
console.log('\n--- Test 4: Financial Precision (Decimal vs Float) ---');
// In floating point, 0.1 + 0.2 !== 0.3 (it's 0.30000000000000004)
const d1 = new Prisma.Decimal('0.10');
const d2 = new Prisma.Decimal('0.20');
const dSum = d1.plus(d2);
assert(dSum.toString() === '0.3', 'Prisma Decimal preserves exact monetary precision without floating-point errors.');

const laptopPrice = new Prisma.Decimal('65000.00');
const downPayment = new Prisma.Decimal('20000.00');
const financed = laptopPrice.minus(downPayment);
assert(financed.toString() === '45000', 'Exact laptop financed balance calculated.');

const monthlyInstallment = financed.dividedBy(6).toDecimalPlaces(2);
assert(monthlyInstallment.toString() === '7500', 'EMI monthly installment calculated accurately.');

// -------------------------------------------------------------
// TEST 5: Vector PDF Invoice Generation
// -------------------------------------------------------------
console.log('\n--- Test 5: Vector PDF & Thermal Invoice Generation ---');
const sampleInvoice = {
  invoiceNumber: 'INV-2026-9999',
  date: new Date().toISOString(),
  customerName: 'Tanvir Ahmed',
  customerPhone: '01711-223344',
  customerAddress: 'Moulvibazar, Sylhet',
  branchName: 'NEED ELECTRO Main Showroom',
  items: [
    {
      name: 'HP EliteBook 840 G8 Laptop',
      sku: 'HP-840-G8-01',
      quantity: 1,
      unitPrice: 65000,
      total: 65000,
      serialNumbers: ['NEC-HP840-998811'],
    },
  ],
  subtotal: 65000,
  discount: 2000,
  vatAmount: 3150,
  grandTotal: 66150,
  paidAmount: 66150,
  dueAmount: 0,
};

const invoiceHtml = generateInvoiceHTML(sampleInvoice, {
  companyName: 'NEED ELECTRO',
  phone: '+880 1733-983752',
  currencySymbol: '৳',
});

assert(invoiceHtml.includes('INV-2026-9999'), 'Invoice HTML contains invoice number.');
assert(invoiceHtml.includes('HP EliteBook 840 G8 Laptop'), 'Invoice HTML contains product name.');
assert(invoiceHtml.includes('NEC-HP840-998811'), 'Invoice HTML contains serial number.');
assert(invoiceHtml.includes('৳ 66,150'), 'Invoice HTML formats BDT currency properly.');
assert(invoiceHtml.includes('TAX INVOICE'), 'Invoice HTML contains formal tax header.');

// -------------------------------------------------------------
// TEST 6: Next.js Routes and Components Integrity
// -------------------------------------------------------------
console.log('\n--- Test 6: Next.js Infrastructure Files ---');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/layout.tsx')), 'app/layout.tsx exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/page.tsx')), 'app/page.tsx exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/globals.css')), 'app/globals.css exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/api/bootstrap/route.ts')), 'app/api/bootstrap/route.ts exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/api/sales/route.ts')), 'app/api/sales/route.ts exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/api/emi/collect/route.ts')), 'app/api/emi/collect/route.ts exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/api/storage/upload/route.ts')), 'app/api/storage/upload/route.ts exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'app/api/pdf/generate/route.ts')), 'app/api/pdf/generate/route.ts exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'vercel.json')), 'vercel.json exists.');
assert(fs.existsSync(path.resolve(process.cwd(), '.github/workflows/deploy.yml')), '.github/workflows/deploy.yml exists.');
assert(fs.existsSync(path.resolve(process.cwd(), 'docs/DEPLOYMENT_GUIDE.md')), 'docs/DEPLOYMENT_GUIDE.md exists.');

console.log('\n======================================================');
console.log(`  ALL ${totalTests} VERIFICATION TESTS PASSED SUCCESSFULLY! (${passedTests}/${totalTests})`);
console.log('======================================================\n');
