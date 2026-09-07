// NEED ELECTRO ERP — Automated End-to-End Business Engine & SQLite Verification Test
import { db, hashPassword, verifyPassword } from '../server/db.js';

console.log('\x1b[36m%s\x1b[0m', '==========================================================');
console.log('\x1b[36m%s\x1b[0m', '⚡ NEED ELECTRO ERP — E2E DATABASE & WORKFLOW VERIFICATION ⚡');
console.log('\x1b[36m%s\x1b[0m', '==========================================================\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`\x1b[32m  ✓ [PASS] ${message}\x1b[0m`);
    passedTests++;
  } else {
    console.error(`\x1b[31m  ✗ [FAIL] ${message}\x1b[0m`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  const baseUrl = 'http://localhost:5000';

  // Test 1: Health check
  console.log('\x1b[33m[TEST 1] Server Health & Database Connectivity\x1b[0m');
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.ok && healthData.success === true, 'Health check returned success');
  assert(healthData.status === 'OK', 'System status is OK');
  assert(healthData.company === 'NEED ELECTRO', 'Company is correctly configured as NEED ELECTRO');

  // Test 2: Initial Setup Status
  console.log('\n\x1b[33m[TEST 2] Initial Setup Status\x1b[0m');
  const setupStatusRes = await fetch(`${baseUrl}/api/auth/setup-status`);
  const setupStatus = await setupStatusRes.json();
  assert(setupStatus.success === true, 'Setup status endpoint accessible');
  console.log('    Setup status data:', setupStatus.data);

  // Test 3: Setup or Login Super Admin
  console.log('\n\x1b[33m[TEST 3] Super Admin Provisioning & Authentication\x1b[0m');
  const testPassword = 'TestPassword2026!';
  
  if (!setupStatus.data.isSuperAdminConfigured) {
    const initRes = await fetch(`${baseUrl}/api/auth/initial-setup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Amdadur Rahman',
        email: 'contact.amdadur@gmail.com',
        phone: '01733-983752',
        username: 'amdadur',
        password: testPassword,
        companyData: {
          companyName: 'NEED ELECTRO',
          companyTagline: 'Trusted Electrical & Technological Solutions',
          phone: '+880 1733-983752',
          email: 'contact.amdadur@gmail.com',
          address: 'NEED ELECTRO Building, Central Road, Moulvibazar, Sylhet, Bangladesh'
        }
      })
    });
    const initData = await initRes.json();
    assert(initData.success === true, 'Super Admin initial setup succeeded');
  } else {
    // If Super Admin exists, ensure test password is valid for testing
    const user = db.prepare("SELECT id FROM users WHERE role = 'SUPER_ADMIN'").get();
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(testPassword), user.id);
  }

  // Attempt login with valid credentials
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'contact.amdadur@gmail.com',
      password: testPassword
    })
  });
  const loginData = await loginRes.json();
  assert(loginRes.ok && loginData.success === true, 'Login with Super Admin credentials succeeded');
  assert(typeof loginData.token === 'string' && loginData.token.length > 20, 'Session token generated');
  assert(loginData.user.role === 'SUPER_ADMIN', 'User role is confirmed SUPER_ADMIN');
  const authToken = loginData.token;

  // Test 4: Verify Session Endpoint
  console.log('\n\x1b[33m[TEST 4] Session Verification & RBAC\x1b[0m');
  const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const sessionData = await sessionRes.json();
  assert(sessionRes.ok && sessionData.success === true, 'Session endpoint verified active token');
  assert(sessionData.user.email === 'contact.amdadur@gmail.com', 'Session belongs to contact.amdadur@gmail.com');

  // Test 5: High-Speed Bootstrap Sync
  console.log('\n\x1b[33m[TEST 5] Central Database Bootstrap Hydration\x1b[0m');
  const bootstrapRes = await fetch(`${baseUrl}/api/bootstrap`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const bootstrapData = await bootstrapRes.json();
  assert(bootstrapRes.ok && bootstrapData.success === true, 'Bootstrap route fetched full operational dataset');
  assert(bootstrapData.data.settings.companyName === 'NEED ELECTRO', 'System settings companyName matches');
  assert(Array.isArray(bootstrapData.data.branches) && bootstrapData.data.branches.length >= 1, 'Branches list loaded');
  assert(Array.isArray(bootstrapData.data.categoriesConfig), 'Categories config loaded');

  // Test 6: Create Product & Serial Numbers
  console.log('\n\x1b[33m[TEST 6] Real Product & Serial Number Registration\x1b[0m');
  const testSku = `TEST-LAPTOP-${Date.now().toString().slice(-4)}`;
  const serial1 = `SN-HP-${Date.now()}-1`;
  const serial2 = `SN-HP-${Date.now()}-2`;

  const prodRes = await fetch(`${baseUrl}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      productData: {
        name: 'HP EliteBook 840 G8 Laptop',
        sku: testSku,
        category: 'Laptops & Computers',
        brand: 'HP',
        costPrice: 55000,
        retailPrice: 65000,
        emiPrice: 70000,
        wholesalePrice: 62000,
        currentStock: 2,
        minStockLevel: 1,
        branchId: 'branch-1',
        isSerialized: true,
        warrantyMonths: 24,
        unit: 'Pcs',
        description: 'Commercial 14-inch laptop with Intel Core i5 11th Gen'
      },
      initialSerials: [serial1, serial2]
    })
  });
  const prodData = await prodRes.json();
  assert(prodRes.ok && prodData.success === true, 'Product created in database');
  const createdProductId = prodData.product.id;

  // Verify serials exist in database
  const serialRecord1 = db.prepare('SELECT * FROM product_serials WHERE serial_number = ?').get(serial1);
  assert(serialRecord1 && serialRecord1.status === 'AVAILABLE', 'Serial 1 registered with status AVAILABLE');

  // Test 7: Create Customer
  console.log('\n\x1b[33m[TEST 7] Customer Registration\x1b[0m');
  const custPhone = `01711${Date.now().toString().slice(-6)}`;
  const custRes = await fetch(`${baseUrl}/api/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      name: 'Tanvir Ahmed',
      phone: custPhone,
      email: `tanvir.${Date.now()}@example.com`,
      address: 'Court Road, Moulvibazar',
      nid: '19951234567890',
      branchId: 'branch-1'
    })
  });
  const custData = await custRes.json();
  assert(custRes.ok && custData.success === true, 'Customer created in database');
  const customerId = custData.customer.id;

  // Test 8: POS Regular Sale with Serial Deduction & Stock Tracking
  console.log('\n\x1b[33m[TEST 8] POS Atomic Sale with Serial Verification\x1b[0m');
  const saleRes = await fetch(`${baseUrl}/api/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      saleData: {
        branchId: 'branch-1',
        customerId: customerId,
        customerName: 'Tanvir Ahmed',
        customerPhone: custPhone,
        date: new Date().toISOString().split('T')[0],
        subtotal: 65000,
        overallDiscount: 0,
        vatAmount: 0,
        vatPercent: 0,
        grandTotal: 65000,
        paidAmount: 65000,
        dueAmount: 0,
        paymentMethod: 'Cash',
        payments: [{ method: 'Cash', amount: 65000 }],
        saleType: 'REGULAR',
        status: 'PAID',
        items: [{
          productId: createdProductId,
          productName: 'HP EliteBook 840 G8 Laptop',
          sku: testSku,
          category: 'Laptops & Computers',
          quantity: 1,
          unitPrice: 65000,
          discount: 0,
          total: 65000,
          warrantyMonths: 24,
          isSerialized: true,
          serialNumbers: [serial1]
        }]
      }
    })
  });
  const saleData = await saleRes.json();
  if (!saleData.success) {
    console.error('    Sale API Error:', saleRes.status, saleData);
  }
  assert(saleRes.ok && saleData.success === true, 'Regular POS sale completed atomically');
  assert(saleData.sale.invoiceNumber.startsWith('INV-'), 'Valid invoice number generated');

  // Verify DB state after sale
  const updatedSerial1 = db.prepare('SELECT * FROM product_serials WHERE serial_number = ?').get(serial1);
  assert(updatedSerial1.status === 'SOLD', 'Serial 1 status updated to SOLD in database');
  const updatedProduct = db.prepare('SELECT current_stock FROM products WHERE id = ?').get(createdProductId);
  assert(updatedProduct.current_stock === 1, 'Product stock decremented to 1 in database');

  // Test 9: Laptop EMI Sale (Installment Schedule Generation)
  console.log('\n\x1b[33m[TEST 9] Laptop EMI Hire-Purchase Workflow\x1b[0m');
  const emiSaleRes = await fetch(`${baseUrl}/api/sales`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      saleData: {
        branchId: 'branch-1',
        customerId: customerId,
        customerName: 'Tanvir Ahmed',
        customerPhone: custPhone,
        date: new Date().toISOString().split('T')[0],
        subtotal: 70000,
        overallDiscount: 0,
        vatAmount: 0,
        vatPercent: 0,
        grandTotal: 70000,
        paidAmount: 20000,
        dueAmount: 50000,
        paymentMethod: 'Cash',
        payments: [{ method: 'Cash', amount: 20000 }],
        saleType: 'EMI',
        status: 'PARTIAL',
        items: [{
          productId: createdProductId,
          productName: 'HP EliteBook 840 G8 Laptop',
          sku: testSku,
          category: 'Laptops & Computers',
          quantity: 1,
          unitPrice: 70000,
          discount: 0,
          total: 70000,
          warrantyMonths: 24,
          isSerialized: true,
          serialNumbers: [serial2]
        }]
      },
      emiPlanConfig: {
        planId: 'plan-6m',
        downPayment: 20000,
        durationMonths: 6
      }
    })
  });
  const emiSaleData = await emiSaleRes.json();
  assert(emiSaleRes.ok && emiSaleData.success === true, 'EMI sale completed and contract generated');
  assert(emiSaleData.sale.emiAccountId !== null, 'EMI Account ID linked to sale');

  const emiAccount = db.prepare('SELECT * FROM emi_accounts WHERE id = ?').get(emiSaleData.sale.emiAccountId);
  assert(emiAccount && emiAccount.remaining_balance === 50000, 'EMI Account remaining balance is 50,000');

  const installments = db.prepare('SELECT * FROM emi_installments WHERE emi_account_id = ? ORDER BY installment_number ASC').all(emiAccount.id);
  assert(installments.length === 6, 'Generated exactly 6 monthly installments');

  // Test 10: EMI Payment Collection & Receipt Generation
  console.log('\n\x1b[33m[TEST 10] EMI Installment Payment Collection\x1b[0m');
  const firstInst = installments[0];
  const emiPayRes = await fetch(`${baseUrl}/api/emi/collect`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      emiAccountId: emiAccount.id,
      installmentId: firstInst.id,
      amount: firstInst.amount,
      penaltyAmount: 0,
      paymentMethod: 'Cash',
      notes: 'First monthly installment collected on time'
    })
  });
  const emiPayData = await emiPayRes.json();
  assert(emiPayRes.ok && emiPayData.success === true, 'EMI installment payment collected');
  assert(emiPayData.receiptNumber.startsWith('RCP-'), 'Official payment receipt generated');

  const updatedEmi = db.prepare('SELECT * FROM emi_accounts WHERE id = ?').get(emiAccount.id);
  assert(updatedEmi.remaining_balance === 50000 - firstInst.amount, 'EMI balance accurately reduced in database');

  // Test 11: Database Backup Engine
  console.log('\n\x1b[33m[TEST 11] Database Snapshot & Backup Engine\x1b[0m');
  const backupRes = await fetch(`${baseUrl}/api/backup/create`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const backupData = await backupRes.json();
  assert(backupRes.ok && backupData.success === true, 'Database snapshot created in backups/');
  assert(backupData.backup.sizeBytes > 0, 'Backup file has valid byte size');

  const listRes = await fetch(`${baseUrl}/api/backup/list`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });
  const listData = await listRes.json();
  assert(listRes.ok && listData.success === true, 'Backup listing endpoint works');
  assert(listData.data.some(b => b.filename === backupData.backup.filename), 'Newly created backup appears in backup list');

  console.log('\n\x1b[32m%s\x1b[0m', '==========================================================');
  console.log(`\x1b[32m🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! REAL DATABASE VERIFIED.\x1b[0m`);
  console.log('\x1b[32m%s\x1b[0m', '==========================================================\n');
}

runTests().catch(err => {
  console.error('\n\x1b[31mE2E Verification Failed:\x1b[0m', err);
  process.exit(1);
});
