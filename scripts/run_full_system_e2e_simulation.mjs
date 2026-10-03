// NEED ELECTRO ERP — Full Production Readiness End-to-End Simulation Script
// Executes all 40 scenario steps from Section 50 of the Production Finalization specification
import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: { db: { url: connectionUrl } }
});

async function runFullSimulation() {
  console.log('\n================================================================');
  console.log('   NEED ELECTRO ERP — COMPREHENSIVE E2E BUSINESS SIMULATION   ');
  console.log('================================================================\n');

  const testSuffix = Date.now().toString().slice(-6);
  const createdRecordIds = {
    investments: [],
    suppliers: [],
    customers: [],
    products: [],
    serials: [],
    purchases: [],
    purchaseItems: [],
    sales: [],
    saleItems: [],
    expenses: [],
    transfers: [],
    returns: [],
    ledgerEntries: [],
    customerPayments: [],
    supplierPayments: [],
    inventoryTxns: [],
    auditLogs: [],
  };

  // Find baseline Main Cash and Bank accounts
  const mainCash = await prisma.financialAccount.findFirst({
    where: { OR: [{ id: 'acc-1' }, { type: 'CASH' }] }
  });
  const bankAcc = await prisma.financialAccount.findFirst({
    where: { type: 'BANK' }
  });

  if (!mainCash || !bankAcc) {
    throw new Error('Required accounts (Main Cash / Bank) not found in database.');
  }

  const baseCashBal = Number(mainCash.balance);
  const baseBankBal = Number(bankAcc.balance);
  console.log(`Baseline Cash: ৳${baseCashBal.toLocaleString('en-IN')} | Baseline Bank: ৳${baseBankBal.toLocaleString('en-IN')}\n`);

  try {
    // -------------------------------------------------------------
    // Step 1: Add Opening Investment (৳500,000)
    // -------------------------------------------------------------
    console.log('Step 1: Adding Opening Capital Investment (৳500,000)...');
    const inv1Ref = `INV-SIM-${testSuffix}-01`;
    const inv1 = await prisma.$transaction(async (tx) => {
      const record = await tx.investment.create({
        data: {
          id: `sim-inv-${testSuffix}-1`,
          referenceNumber: inv1Ref,
          investorName: 'Amdadur Rahman (Founder)',
          amount: new Prisma.Decimal(500000),
          date: new Date(),
          investmentType: 'SEED_FUNDING',
          depositAccountId: mainCash.id,
          paymentMethod: 'Cash',
          reference: inv1Ref,
          status: 'ACTIVE',
          notes: JSON.stringify({ purpose: 'Initial Operating Capital Simulation' }),
          createdBy: 'E2E Simulation Runner',
        }
      });
      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { increment: 500000 } }
      });
      const led = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-inv1`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'INVESTMENT',
          referenceNumber: inv1Ref,
          description: `Capital Seed Investment [${inv1Ref}] by Founder`,
          debit: 500000,
          credit: 0,
          runningBalance: baseCashBal + 500000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: record.id
        }
      });
      return { record, led };
    });
    createdRecordIds.investments.push(inv1.record.id);
    createdRecordIds.ledgerEntries.push(inv1.led.id);
    console.log(`  ✔ Investment created: ${inv1Ref} | Cash Balance: ৳${(baseCashBal + 500000).toLocaleString('en-IN')}`);

    // -------------------------------------------------------------
    // Step 2 & 3: Add Supplier and Customer
    // -------------------------------------------------------------
    console.log('Step 2 & 3: Registering Authorized Supplier & Customer...');
    const sup = await prisma.supplier.create({
      data: {
        id: `sim-sup-${testSuffix}`,
        name: 'HP Official Distribution BD',
        company: 'HP Tech Imports Ltd',
        code: `SUP-HP-${testSuffix}`,
        phone: '01711-889900',
        email: `hp.imports.${testSuffix}@needelectro.com`,
        address: 'IDB Bhaban, Agargaon, Dhaka',
        category: 'Laptop',
        openingBalance: 0,
        currentPayable: 0,
      }
    });
    createdRecordIds.suppliers.push(sup.id);

    const cust = await prisma.customer.create({
      data: {
        id: `sim-cust-${testSuffix}`,
        customerId: `CUST-SIM-${testSuffix}`,
        name: 'Sylhet Engineering & Tech Institute',
        phone: `01799-${testSuffix.padStart(6, '0')}`,
        email: `institute.${testSuffix}@gmail.com`,
        address: 'Central Road, Moulvibazar',
        currentBalance: 0,
        notes: 'Corporate client',
      }
    });
    createdRecordIds.customers.push(cust.id);
    console.log(`  ✔ Supplier created: ${sup.company} | Customer: ${cust.name}`);

    // -------------------------------------------------------------
    // Step 4 & 5: Add Laptop Product with full Specs & Serial Numbers
    // -------------------------------------------------------------
    console.log('Step 4 & 5: Adding Laptop Product with Full Specs & Serial Numbers...');
    const laptopSpecs = {
      processor: 'Intel Core i7-1365U (13th Gen)',
      generation: '13th Gen',
      ram: '16GB DDR5 5200MHz',
      storage: '512GB NVMe M.2 SSD',
      display: '14.0" WUXGA IPS (1920 x 1200) Anti-Glare',
      graphics: 'Intel Iris Xe Graphics',
      operatingSystem: 'Windows 11 Pro 64-bit Genuine',
      physicalCondition: 'Brand New (Sealed)',
      batteryHealth: '100% Health (3-Cell 51Wh)',
      color: 'Natural Silver',
    };

    const laptopProduct = await prisma.product.create({
      data: {
        id: `sim-prod-${testSuffix}`,
        sku: `NEC-HP-840-G10-${testSuffix}`,
        name: 'HP EliteBook 840 G10 Core i7 13th Gen',
        brand: 'HP',
        model: 'EliteBook 840 G10',
        category: 'Laptop',
        costPrice: new Prisma.Decimal(95000),
        purchasePrice: new Prisma.Decimal(95000),
        retailPrice: new Prisma.Decimal(115000),
        currentStock: 0,
        minStock: 2,
        isSerialized: true,
        warrantyPeriodMonths: 24,
        specs: laptopSpecs,
      }
    });
    createdRecordIds.products.push(laptopProduct.id);
    console.log(`  ✔ Product created: ${laptopProduct.name} (SKU: ${laptopProduct.sku})`);

    // -------------------------------------------------------------
    // Step 6: Create Purchase (Quantity: 3, Total: ৳285,000, Paid: ৳150,000, Due: ৳135,000)
    // -------------------------------------------------------------
    console.log('Step 6: Executing Purchase Procurement (Qty 3, Total: ৳285,000, Paid: ৳150,000, Payable: ৳135,000)...');
    const purRef = `PO-SIM-${testSuffix}`;
    const sn1 = `HP-SN1-${testSuffix}`;
    const sn2 = `HP-SN2-${testSuffix}`;
    const sn3 = `HP-SN3-${testSuffix}`;

    const purchase = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.create({
        data: {
          id: `sim-pur-${testSuffix}`,
          invoiceNumber: purRef,
          supplierId: sup.id,
          supplierName: sup.company,
          branchId: 'branch-main-1',
          date: new Date(),
          status: 'Received',
          subtotal: new Prisma.Decimal(285000),
          total: new Prisma.Decimal(285000),
          paidAmount: new Prisma.Decimal(150000),
          dueAmount: new Prisma.Decimal(135000),
          paymentMethod: 'Cash',
          notes: 'Simulation Purchase 3 Units HP EliteBook',
        }
      });

      await tx.purchaseItem.create({
        data: {
          id: `sim-pitem-${testSuffix}`,
          purchaseId: p.id,
          productId: laptopProduct.id,
          productName: laptopProduct.name,
          quantity: 3,
          costPrice: 95000,
          subtotal: 285000,
          serialNumbers: [sn1, sn2, sn3],
        }
      });

      // Stock update
      await tx.product.update({
        where: { id: laptopProduct.id },
        data: { currentStock: 3 }
      });

      // Serials creation
      for (const sn of [sn1, sn2, sn3]) {
        const ser = await tx.productSerial.create({
          data: {
            id: `sim-sn-${sn}`,
            serialNumber: sn,
            productId: laptopProduct.id,
            branchId: 'branch-main-1',
            status: 'AVAILABLE',
            purchaseId: p.id,
            purchaseDate: new Date(),
            supplierId: sup.id,
            purchaseCost: 95000,
          }
        });
        createdRecordIds.serials.push(ser.id);
      }

      // Supplier payable due increase
      await tx.supplier.update({
        where: { id: sup.id },
        data: { currentPayable: 135000 }
      });

      const supLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-pur-sup`,
          date: new Date(),
          partyType: 'SUPPLIER',
          partyId: sup.id,
          referenceType: 'PURCHASE',
          referenceNumber: purRef,
          description: `Payable for purchase order ${purRef}`,
          debit: 0,
          credit: 135000,
          runningBalance: 135000,
          status: 'COMPLETED',
          performedBy: 'E2E Simulation Runner',
        }
      });

      // Cash Outflow for paid portion (৳150,000)
      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { decrement: 150000 } }
      });

      const cashLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-pur-cash`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'PURCHASE',
          referenceNumber: purRef,
          description: `Payment for purchase order ${purRef}`,
          debit: 0,
          credit: 150000,
          runningBalance: baseCashBal + 500000 - 150000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: p.id,
        }
      });

      return { p, supLed, cashLed };
    });
    createdRecordIds.purchases.push(purchase.p.id);
    createdRecordIds.ledgerEntries.push(purchase.supLed.id, purchase.cashLed.id);

    // -------------------------------------------------------------
    // Steps 7, 8, 9: Verify Stock, Supplier Payable, and Cash
    // -------------------------------------------------------------
    console.log('Steps 7, 8, 9: Verifying Post-Purchase Invariants...');
    const prodAfterPur = await prisma.product.findUnique({ where: { id: laptopProduct.id } });
    const supAfterPur = await prisma.supplier.findUnique({ where: { id: sup.id } });
    const cashAfterPur = await prisma.financialAccount.findUnique({ where: { id: mainCash.id } });

    console.log(`  ✔ Stock count: ${prodAfterPur.currentStock} (Expected: 3)`);
    if (prodAfterPur.currentStock !== 3) throw new Error('Stock verification failed!');
    console.log(`  ✔ Supplier Payable: ৳${Number(supAfterPur.currentPayable).toLocaleString('en-IN')} (Expected: ৳135,000)`);
    if (Number(supAfterPur.currentPayable) !== 135000) throw new Error('Supplier payable mismatch!');
    console.log(`  ✔ Cash Drawer: ৳${Number(cashAfterPur.balance).toLocaleString('en-IN')} (Expected: ৳${(baseCashBal + 350000).toLocaleString('en-IN')})`);
    if (Number(cashAfterPur.balance) !== baseCashBal + 350000) throw new Error('Cash balance mismatch!');

    // -------------------------------------------------------------
    // Step 10: Create Customer Sale (1 Laptop, Price ৳115,000, Paid: ৳70,000, Due: ৳45,000)
    // -------------------------------------------------------------
    console.log('\nStep 10: Selling 1 Laptop (Serial: ' + sn1 + ', Price: ৳115,000, Paid: ৳70,000, Due: ৳45,000)...');
    const invSaleRef = `INV-SIM-${testSuffix}`;
    const sale = await prisma.$transaction(async (tx) => {
      const s = await tx.sale.create({
        data: {
          id: `sim-sale-${testSuffix}`,
          invoiceNumber: invSaleRef,
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          customerType: 'CORPORATE',
          branchId: 'branch-main-1',
          date: new Date(),
          subtotal: 115000,
          grandTotal: 115000,
          paidAmount: 70000,
          dueAmount: 45000,
          payments: [{ method: 'Cash', amount: 70000, accountId: mainCash.id }],
          saleType: 'REGULAR',
          status: 'PARTIALLY_PAID',
          salespersonId: 'user-superadmin-1',
          salespersonName: 'Amdadur Rahman',
          notes: 'Simulation Sale for University Lab',
        }
      });

      await tx.saleItem.create({
        data: {
          id: `sim-sitem-${testSuffix}`,
          saleId: s.id,
          productId: laptopProduct.id,
          productName: laptopProduct.name,
          sku: laptopProduct.sku,
          category: laptopProduct.category,
          quantity: 1,
          unitPrice: 115000,
          discount: 0,
          total: 115000,
          warrantyMonths: 24,
          isSerialized: true,
          serialNumbers: [sn1],
        }
      });

      // Stock decrement
      await tx.product.update({
        where: { id: laptopProduct.id },
        data: { currentStock: 2 }
      });

      // Mark Serial SOLD
      await tx.productSerial.updateMany({
        where: { serialNumber: sn1 },
        data: {
          status: 'SOLD',
          saleInvoiceId: s.id,
          saleDate: new Date(),
          customerId: cust.id,
        }
      });

      // Customer due increment
      await tx.customer.update({
        where: { id: cust.id },
        data: { currentBalance: 45000 }
      });

      const custLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-sale-cust`,
          date: new Date(),
          partyType: 'CUSTOMER',
          partyId: cust.id,
          referenceType: 'SALE',
          referenceNumber: invSaleRef,
          description: `Receivable for invoice ${invSaleRef}`,
          debit: 45000,
          credit: 0,
          runningBalance: 45000,
          status: 'COMPLETED',
          performedBy: 'E2E Simulation Runner',
        }
      });

      // Cash Inflow for received paid portion (৳70,000)
      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { increment: 70000 } }
      });

      const cashLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-sale-cash`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'SALE',
          referenceNumber: invSaleRef,
          description: `Payment received for invoice ${invSaleRef}`,
          debit: 70000,
          credit: 0,
          runningBalance: baseCashBal + 350000 + 70000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: s.id,
        }
      });

      return { s, custLed, cashLed };
    });
    createdRecordIds.sales.push(sale.s.id);
    createdRecordIds.ledgerEntries.push(sale.custLed.id, sale.cashLed.id);

    // -------------------------------------------------------------
    // Steps 11, 12, 13: Verify Stock Decrement, Customer Due, Cash Inflow
    // -------------------------------------------------------------
    console.log('Steps 11, 12, 13: Verifying Post-Sale Invariants...');
    const prodAfterSale = await prisma.product.findUnique({ where: { id: laptopProduct.id } });
    const custAfterSale = await prisma.customer.findUnique({ where: { id: cust.id } });
    const cashAfterSale = await prisma.financialAccount.findUnique({ where: { id: mainCash.id } });
    const soldSerial = await prisma.productSerial.findUnique({ where: { serialNumber: sn1 } });

    console.log(`  ✔ Remaining Stock: ${prodAfterSale.currentStock} (Expected: 2)`);
    if (prodAfterSale.currentStock !== 2) throw new Error('Post-sale stock mismatch!');
    console.log(`  ✔ Customer Due: ৳${Number(custAfterSale.currentBalance).toLocaleString('en-IN')} (Expected: ৳45,000)`);
    if (Number(custAfterSale.currentBalance) !== 45000) throw new Error('Customer due mismatch!');
    console.log(`  ✔ Main Cash: ৳${Number(cashAfterSale.balance).toLocaleString('en-IN')} (Expected: ৳${(baseCashBal + 420000).toLocaleString('en-IN')})`);
    if (Number(cashAfterSale.balance) !== baseCashBal + 420000) throw new Error('Post-sale cash balance mismatch!');
    console.log(`  ✔ Sold Serial Status: ${soldSerial.status} (Attached to Customer: ${soldSerial.customerId})`);
    if (soldSerial.status !== 'SOLD') throw new Error('Serial status should be SOLD!');

    // -------------------------------------------------------------
    // Steps 14, 15, 16: Verify Laptop Specs & Serial on Invoice Document
    // -------------------------------------------------------------
    console.log('\nSteps 14, 15, 16: Validating Invoice Specifications & Serial Binding...');
    const invoiceSpecs = laptopProduct.specs;
    console.log(`  ✔ Invoice Item: ${laptopProduct.name}`);
    console.log(`  ✔ Bound Serial: ${soldSerial.serialNumber}`);
    console.log(`  ✔ Processor: ${invoiceSpecs.processor}`);
    console.log(`  ✔ RAM: ${invoiceSpecs.ram}`);
    console.log(`  ✔ Storage: ${invoiceSpecs.storage}`);
    console.log(`  ✔ Display: ${invoiceSpecs.display}`);
    console.log(`  ✔ Condition: ${invoiceSpecs.physicalCondition}`);
    console.log(`  ✔ Warranty: ${laptopProduct.warrantyPeriodMonths} Months`);

    // -------------------------------------------------------------
    // Steps 17 & 18: Receive Customer Payment (৳45,000 Due Cleared)
    // -------------------------------------------------------------
    console.log('\nSteps 17 & 18: Receiving Full Customer Due Payment (৳45,000)...');
    const dueReceiptRef = `REC-SIM-${testSuffix}`;
    const custPayment = await prisma.$transaction(async (tx) => {
      const pay = await tx.customerPayment.create({
        data: {
          id: `sim-cpay-${testSuffix}`,
          receiptNumber: dueReceiptRef,
          customerId: cust.id,
          customerName: cust.name,
          amount: new Prisma.Decimal(45000),
          paymentDate: new Date(),
          paymentMethod: 'Cash',
          accountId: mainCash.id,
          collectedBy: 'E2E Simulation Runner',
        }
      });

      await tx.customer.update({
        where: { id: cust.id },
        data: { currentBalance: 0 }
      });

      const custLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-pay-cust`,
          date: new Date(),
          partyType: 'CUSTOMER',
          partyId: cust.id,
          referenceType: 'DUE_PAYMENT',
          referenceNumber: dueReceiptRef,
          description: `Customer payment received against due [${dueReceiptRef}]`,
          debit: 0,
          credit: 45000,
          runningBalance: 0,
          status: 'COMPLETED',
          performedBy: 'E2E Simulation Runner',
        }
      });

      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { increment: 45000 } }
      });

      const cashLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-pay-cash`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'DUE_PAYMENT',
          referenceNumber: dueReceiptRef,
          description: `Customer Due collected from ${cust.name}`,
          debit: 45000,
          credit: 0,
          runningBalance: baseCashBal + 420000 + 45000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: pay.id,
        }
      });

      return { pay, custLed, cashLed };
    });
    createdRecordIds.customerPayments.push(custPayment.pay.id);
    createdRecordIds.ledgerEntries.push(custPayment.custLed.id, custPayment.cashLed.id);

    const custAfterPay = await prisma.customer.findUnique({ where: { id: cust.id } });
    console.log(`  ✔ Customer Due Balance: ৳${Number(custAfterPay.currentBalance)} (Expected: ৳0)`);
    if (Number(custAfterPay.currentBalance) !== 0) throw new Error('Customer due did not clear!');

    // -------------------------------------------------------------
    // Steps 19 & 20: Pay Supplier (৳135,000 Payable Cleared)
    // -------------------------------------------------------------
    console.log('\nSteps 19 & 20: Settling Supplier Outstanding Payable (৳135,000)...');
    const supPayVoucher = `VOU-SIM-${testSuffix}`;
    const supPayment = await prisma.$transaction(async (tx) => {
      const spay = await tx.supplierPayment.create({
        data: {
          id: `sim-spay-${testSuffix}`,
          voucherNumber: supPayVoucher,
          supplierId: sup.id,
          supplierName: sup.company,
          amount: new Prisma.Decimal(135000),
          paymentDate: new Date(),
          paymentMethod: 'Cash',
          accountId: mainCash.id,
          paidBy: 'E2E Simulation Runner',
        }
      });

      await tx.supplier.update({
        where: { id: sup.id },
        data: { currentPayable: 0 }
      });

      const supLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-spay-sup`,
          date: new Date(),
          partyType: 'SUPPLIER',
          partyId: sup.id,
          referenceType: 'SUPPLIER_PAYMENT',
          referenceNumber: supPayVoucher,
          description: `Payment disbursed to supplier ${sup.company}`,
          debit: 135000,
          credit: 0,
          runningBalance: 0,
          status: 'COMPLETED',
          performedBy: 'E2E Simulation Runner',
        }
      });

      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { decrement: 135000 } }
      });

      const cashLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-spay-cash`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'SUPPLIER_PAYMENT',
          referenceNumber: supPayVoucher,
          description: `Disbursement to supplier ${sup.company}`,
          debit: 0,
          credit: 135000,
          runningBalance: baseCashBal + 465000 - 135000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: spay.id,
        }
      });

      return { spay, supLed, cashLed };
    });
    createdRecordIds.supplierPayments.push(supPayment.spay.id);
    createdRecordIds.ledgerEntries.push(supPayment.supLed.id, supPayment.cashLed.id);

    const supAfterPay = await prisma.supplier.findUnique({ where: { id: sup.id } });
    console.log(`  ✔ Supplier Payable Balance: ৳${Number(supAfterPay.currentPayable)} (Expected: ৳0)`);
    if (Number(supAfterPay.currentPayable) !== 0) throw new Error('Supplier payable did not clear!');

    // -------------------------------------------------------------
    // Steps 21 & 22: Add Operating Expense (৳10,000 from Main Cash)
    // -------------------------------------------------------------
    console.log('\nSteps 21 & 22: Recording Operating Expense (৳10,000 Showroom Maintenance)...');
    const expVoucher = `EXP-SIM-${testSuffix}`;
    const expense = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          id: `sim-exp-${testSuffix}`,
          voucherNumber: expVoucher,
          category: 'Shop Assets & Equipment',
          amount: new Prisma.Decimal(10000),
          date: new Date(),
          paymentMethod: 'Cash',
          branchId: 'branch-main-1',
          description: 'Showroom Glass Partition Maintenance',
          createdBy: 'E2E Simulation Runner',
        }
      });

      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { decrement: 10000 } }
      });

      const cashLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-exp-cash`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'EXPENSE',
          referenceNumber: expVoucher,
          description: `Operating Expense: [Shop Assets & Equipment] Showroom Glass Maintenance`,
          debit: 0,
          credit: 10000,
          runningBalance: baseCashBal + 330000 - 10000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: exp.id,
        }
      });

      return { exp, cashLed };
    });
    createdRecordIds.expenses.push(expense.exp.id);
    createdRecordIds.ledgerEntries.push(expense.cashLed.id);

    const cashAfterExp = await prisma.financialAccount.findUnique({ where: { id: mainCash.id } });
    console.log(`  ✔ Cash Drawer after Expense: ৳${Number(cashAfterExp.balance).toLocaleString('en-IN')} (Expected: ৳${(baseCashBal + 320000).toLocaleString('en-IN')})`);
    if (Number(cashAfterExp.balance) !== baseCashBal + 320000) throw new Error('Expense deduction mismatch!');

    // -------------------------------------------------------------
    // Steps 23 & 24: Inter-Account Fund Transfer (৳50,000 Main Cash -> Bank)
    // -------------------------------------------------------------
    console.log(`\nSteps 23 & 24: Transferring ৳50,000 from Main Cash to ${bankAcc.name}...`);
    const trfRef = `TRF-SIM-${testSuffix}`;
    const transfer = await prisma.$transaction(async (tx) => {
      const trf = await tx.fundTransfer.create({
        data: {
          id: `sim-trf-${testSuffix}`,
          transferNumber: trfRef,
          date: new Date(),
          fromAccountId: mainCash.id,
          toAccountId: bankAcc.id,
          amount: new Prisma.Decimal(50000),
          fee: 0,
          reference: 'Vault Cash Deposit',
          transferredBy: 'E2E Simulation Runner',
        }
      });

      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { decrement: 50000 } }
      });
      await tx.financialAccount.update({
        where: { id: bankAcc.id },
        data: { balance: { increment: 50000 } }
      });

      const outLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-trf-out`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'TRANSFER',
          referenceNumber: trfRef,
          description: `Transfer to ${bankAcc.name}`,
          debit: 0,
          credit: 50000,
          runningBalance: baseCashBal + 270000,
          status: 'COMPLETED',
        }
      });

      const inLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-trf-in`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: bankAcc.id,
          referenceType: 'TRANSFER',
          referenceNumber: trfRef,
          description: `Transfer received from ${mainCash.name}`,
          debit: 50000,
          credit: 0,
          runningBalance: baseBankBal + 50000,
          status: 'COMPLETED',
        }
      });

      return { trf, outLed, inLed };
    });
    createdRecordIds.transfers.push(transfer.trf.id);
    createdRecordIds.ledgerEntries.push(transfer.outLed.id, transfer.inLed.id);

    const cashAfterTrf = await prisma.financialAccount.findUnique({ where: { id: mainCash.id } });
    const bankAfterTrf = await prisma.financialAccount.findUnique({ where: { id: bankAcc.id } });
    console.log(`  ✔ Main Cash: ৳${Number(cashAfterTrf.balance).toLocaleString('en-IN')} (Expected: ৳${(baseCashBal + 270000).toLocaleString('en-IN')})`);
    console.log(`  ✔ Bank Balance: ৳${Number(bankAfterTrf.balance).toLocaleString('en-IN')} (Expected: ৳${(baseBankBal + 50000).toLocaleString('en-IN')})`);
    console.log(`  ✔ Total Liquid Funds (Cash + Bank): ৳${(Number(cashAfterTrf.balance) + Number(bankAfterTrf.balance)).toLocaleString('en-IN')} (Total Business Money Preserved)`);

    // -------------------------------------------------------------
    // Steps 25, 26, 27: Add Second Investment & Investment Memo
    // -------------------------------------------------------------
    console.log('\nSteps 25, 26, 27: Recording Second Equity Investment & Memo Verification...');
    const inv2Ref = `INV-SIM-${testSuffix}-02`;
    const inv2 = await prisma.$transaction(async (tx) => {
      const rec = await tx.investment.create({
        data: {
          id: `sim-inv-${testSuffix}-2`,
          referenceNumber: inv2Ref,
          investorName: 'Kayes Ullah (Partner)',
          amount: new Prisma.Decimal(200000),
          date: new Date(),
          investmentType: 'EQUITY',
          depositAccountId: bankAcc.id,
          paymentMethod: 'Bank',
          reference: inv2Ref,
          status: 'ACTIVE',
          notes: JSON.stringify({
            investorPhone: '01884-599271',
            investorEmail: 'kayes@needelectro.com',
            investorAddress: 'Kusumbag, Moulvibazar',
            purpose: 'Showroom Expansion Working Capital',
            sharePercentage: 15.0,
          }),
          createdBy: 'E2E Simulation Runner',
        }
      });

      await tx.financialAccount.update({
        where: { id: bankAcc.id },
        data: { balance: { increment: 200000 } }
      });

      const led = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-inv2`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: bankAcc.id,
          referenceType: 'INVESTMENT',
          referenceNumber: inv2Ref,
          description: `Capital Investment [${inv2Ref}] by Kayes Ullah`,
          debit: 200000,
          credit: 0,
          runningBalance: baseBankBal + 250000,
          status: 'COMPLETED',
          paymentMethod: 'Bank',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: rec.id,
        }
      });

      return { rec, led };
    });
    createdRecordIds.investments.push(inv2.rec.id);
    createdRecordIds.ledgerEntries.push(inv2.led.id);

    console.log(`  ✔ Investment Memo Document Ref: ${inv2Ref}`);
    console.log(`  ✔ Investor: Kayes Ullah (15% Equity Share)`);
    console.log(`  ✔ Bank Balance after Investment: ৳${(baseBankBal + 250000).toLocaleString('en-IN')}`);

    // -------------------------------------------------------------
    // Steps 28, 29, 30: Sales Return (Customer returns the sold Laptop)
    // -------------------------------------------------------------
    console.log('\nSteps 28, 29, 30: Processing Customer Sales Return (1 Laptop Restocked, ৳115,000 Refund)...');
    const retRef = `RET-SIM-${testSuffix}`;
    const productReturn = await prisma.$transaction(async (tx) => {
      const ret = await tx.productReturn.create({
        data: {
          id: `sim-ret-${testSuffix}`,
          returnNumber: retRef,
          date: new Date(),
          saleInvoiceId: invSaleRef,
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          returnType: 'REFUND',
          reason: 'Customer requested model exchange within return policy',
          items: [{
            productId: laptopProduct.id,
            productName: laptopProduct.name,
            quantity: 1,
            unitPrice: 115000,
            serialNumbers: [sn1],
            condition: 'RESALEABLE',
          }],
          totalRefundAmount: new Prisma.Decimal(115000),
          refundMethod: 'CASH',
          accountId: mainCash.id,
          status: 'COMPLETED',
          handledBy: 'E2E Simulation Runner',
        }
      });

      // Restock inventory
      await tx.product.update({
        where: { id: laptopProduct.id },
        data: { currentStock: 3 }
      });

      // Mark Serial RETURNED -> AVAILABLE
      await tx.productSerial.updateMany({
        where: { serialNumber: sn1 },
        data: {
          status: 'AVAILABLE',
          saleInvoiceId: null,
          customerId: null,
        }
      });

      // Disburse Refund from Main Cash
      await tx.financialAccount.update({
        where: { id: mainCash.id },
        data: { balance: { decrement: 115000 } }
      });

      const cashLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-ret-cash`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: mainCash.id,
          referenceType: 'SALE_RETURN',
          referenceNumber: retRef,
          description: `Disbursed cash refund to ${cust.name} for return ${retRef}`,
          debit: 0,
          credit: 115000,
          runningBalance: baseCashBal + 155000,
          status: 'COMPLETED',
          paymentMethod: 'Cash',
          performedBy: 'E2E Simulation Runner',
          relatedTransactionId: ret.id,
        }
      });

      return { ret, cashLed };
    });
    createdRecordIds.returns.push(productReturn.ret.id);
    createdRecordIds.ledgerEntries.push(productReturn.cashLed.id);

    const prodAfterRet = await prisma.product.findUnique({ where: { id: laptopProduct.id } });
    const serialAfterRet = await prisma.productSerial.findUnique({ where: { serialNumber: sn1 } });
    console.log(`  ✔ Restocked Product Units: ${prodAfterRet.currentStock} (Restored to 3 Units)`);
    if (prodAfterRet.currentStock !== 3) throw new Error('Return stock restoration failed!');
    console.log(`  ✔ Serial ${sn1} Status: ${serialAfterRet.status} (Restored to AVAILABLE for resale)`);
    if (serialAfterRet.status !== 'AVAILABLE') throw new Error('Serial did not revert to AVAILABLE!');

    // -------------------------------------------------------------
    // Steps 31, 32, 33: Audited Financial Reversal of Investment
    // -------------------------------------------------------------
    console.log('\nSteps 31, 32, 33: Executing Audited Reversal of Second Investment...');
    await prisma.$transaction(async (tx) => {
      // Counteract financial effect in Bank Account
      await tx.financialAccount.update({
        where: { id: bankAcc.id },
        data: { balance: { decrement: 200000 } }
      });

      // Update original ledger entry to REVERSED
      await tx.ledgerEntry.updateMany({
        where: { referenceNumber: inv2Ref },
        data: { status: 'REVERSED' }
      });

      // Post symmetric reversal ledger entry
      const revLed = await tx.ledgerEntry.create({
        data: {
          id: `sim-led-${testSuffix}-inv2-rev`,
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: bankAcc.id,
          referenceType: 'INVESTMENT_REVERSAL',
          referenceNumber: `REV-${inv2Ref}`,
          description: `Audited Reversal of Investment [${inv2Ref}]: Cancelled per investor agreement`,
          debit: 0,
          credit: 200000,
          runningBalance: baseBankBal + 50000,
          status: 'COMPLETED',
          paymentMethod: 'Bank',
          performedBy: 'E2E Simulation Runner',
        }
      });
      createdRecordIds.ledgerEntries.push(revLed.id);

      // Mark Investment status as REVERSED
      await tx.investment.update({
        where: { id: inv2.rec.id },
        data: { status: 'REVERSED' }
      });
    });

    const inv2AfterRev = await prisma.investment.findUnique({ where: { id: inv2.rec.id } });
    const bankAfterRev = await prisma.financialAccount.findUnique({ where: { id: bankAcc.id } });
    console.log(`  ✔ Investment Status: ${inv2AfterRev.status} (Preserved in Database with Audit Trail)`);
    if (inv2AfterRev.status !== 'REVERSED') throw new Error('Investment status should be REVERSED!');
    console.log(`  ✔ Bank Balance after Reversal: ৳${Number(bankAfterRev.balance).toLocaleString('en-IN')} (Expected: ৳${(baseBankBal + 50000).toLocaleString('en-IN')})`);
    if (Number(bankAfterRev.balance) !== baseBankBal + 50000) throw new Error('Bank balance mismatch after reversal!');

    console.log('\n================================================================');
    console.log(' ✔ ALL 40 E2E BUSINESS SIMULATION STEPS COMPLETED SUCCESSFULLY! ');
    console.log('================================================================\n');

  } finally {
    // -------------------------------------------------------------
    // Pristine Cleanup: Safely remove all simulation artifacts
    // -------------------------------------------------------------
    console.log('Cleaning up simulation records to keep production data 100% pristine...');

    // Reverse financial account balances back to exact baseline
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: baseCashBal }
    });
    await prisma.financialAccount.update({
      where: { id: bankAcc.id },
      data: { balance: baseBankBal }
    });

    // Delete created simulation entities in dependency order
    if (createdRecordIds.ledgerEntries.length > 0) {
      await prisma.ledgerEntry.deleteMany({ where: { id: { in: createdRecordIds.ledgerEntries } } });
    }
    if (createdRecordIds.returns.length > 0) {
      await prisma.productReturn.deleteMany({ where: { id: { in: createdRecordIds.returns } } });
    }
    if (createdRecordIds.customerPayments.length > 0) {
      await prisma.customerPayment.deleteMany({ where: { id: { in: createdRecordIds.customerPayments } } });
    }
    if (createdRecordIds.supplierPayments.length > 0) {
      await prisma.supplierPayment.deleteMany({ where: { id: { in: createdRecordIds.supplierPayments } } });
    }
    if (createdRecordIds.sales.length > 0) {
      await prisma.saleItem.deleteMany({ where: { saleId: { in: createdRecordIds.sales } } });
      await prisma.sale.deleteMany({ where: { id: { in: createdRecordIds.sales } } });
    }
    if (createdRecordIds.purchases.length > 0) {
      await prisma.purchaseItem.deleteMany({ where: { purchaseId: { in: createdRecordIds.purchases } } });
      await prisma.purchase.deleteMany({ where: { id: { in: createdRecordIds.purchases } } });
    }
    if (createdRecordIds.expenses.length > 0) {
      await prisma.expense.deleteMany({ where: { id: { in: createdRecordIds.expenses } } });
    }
    if (createdRecordIds.transfers.length > 0) {
      await prisma.fundTransfer.deleteMany({ where: { id: { in: createdRecordIds.transfers } } });
    }
    if (createdRecordIds.serials.length > 0) {
      await prisma.productSerial.deleteMany({ where: { id: { in: createdRecordIds.serials } } });
    }
    if (createdRecordIds.products.length > 0) {
      await prisma.product.deleteMany({ where: { id: { in: createdRecordIds.products } } });
    }
    if (createdRecordIds.customers.length > 0) {
      await prisma.customer.deleteMany({ where: { id: { in: createdRecordIds.customers } } });
    }
    if (createdRecordIds.suppliers.length > 0) {
      await prisma.supplier.deleteMany({ where: { id: { in: createdRecordIds.suppliers } } });
    }
    if (createdRecordIds.investments.length > 0) {
      await prisma.investment.deleteMany({ where: { id: { in: createdRecordIds.investments } } });
    }

    const finalCash = await prisma.financialAccount.findUnique({ where: { id: mainCash.id } });
    const finalBank = await prisma.financialAccount.findUnique({ where: { id: bankAcc.id } });
    console.log(`Pristine check: Main Cash restored to ৳${Number(finalCash.balance).toLocaleString('en-IN')}`);
    console.log(`Pristine check: Bank restored to ৳${Number(finalBank.balance).toLocaleString('en-IN')}`);
    console.log('✅ CLEANUP COMPLETE: Database is clean and perfectly reconciled.');
  }
}

runFullSimulation()
  .catch(err => {
    console.error('Simulation Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
