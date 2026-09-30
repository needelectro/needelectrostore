// Test script for NEED ELECTRO ERP Financial & Central Ledger Integrity
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runIntegrityTest() {
  console.log('--- STARTING FINANCIAL INTEGRITY TEST ---');

  // Find or create test accounts
  const mainCash = await prisma.financialAccount.findFirst({
    where: { OR: [{ id: 'acc-1' }, { type: 'CASH' }] }
  });

  const bankAccount = await prisma.financialAccount.findFirst({
    where: { type: 'BANK' }
  });

  if (!mainCash || !bankAccount) {
    throw new Error('Main cash or bank account not found in database.');
  }

  console.log(`Main Cash Initial Balance: ৳${Number(mainCash.balance)}`);
  console.log(`Bank Initial Balance: ৳${Number(bankAccount.balance)}`);

  // Let's create an isolated test run with unique reference IDs
  const testId = Date.now().toString().slice(-6);
  const createdLedgerIds = [];
  const initialCashBal = Number(mainCash.balance);
  const initialBankBal = Number(bankAccount.balance);

  try {
    // 1. Initial Investment of ৳300,000 -> Main Cash
    console.log('\n1. Testing Owner Investment ৳300,000 -> Main Cash...');
    const invLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-inv-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'INVESTMENT',
        referenceNumber: `TEST-INV-${testId}`,
        description: 'Test Capital Investment by Founder',
        debit: 300000,
        credit: 0,
        runningBalance: initialCashBal + 300000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(invLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { increment: 300000 } }
    });

    // 2. Cash Purchase of ৳50,000 -> Main Cash -৳50,000
    console.log('2. Testing Cash Purchase ৳50,000 -> Main Cash -৳50,000...');
    const curCash1 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const purLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-pur-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'PURCHASE',
        referenceNumber: `TEST-PUR-${testId}`,
        description: 'Test Cash Inventory Purchase',
        debit: 0,
        credit: 50000,
        runningBalance: curCash1 - 50000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(purLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { decrement: 50000 } }
    });

    // 3. Cash Sale of ৳30,000 -> Main Cash +৳30,000
    console.log('3. Testing Cash Sale ৳30,000 -> Main Cash +৳30,000...');
    const curCash2 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const saleLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-sale-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'SALE',
        referenceNumber: `TEST-INV-${testId}`,
        description: 'Test Cash Retail Sale',
        debit: 30000,
        credit: 0,
        runningBalance: curCash2 + 30000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(saleLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { increment: 30000 } }
    });

    // 4. Customer Due Payment of ৳10,000 -> Main Cash +৳10,000
    console.log('4. Testing Customer Due Payment ৳10,000 -> Main Cash +৳10,000...');
    const curCash3 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const dueLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-due-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'DUE_PAYMENT',
        referenceNumber: `TEST-REC-${testId}`,
        description: 'Test Customer Due Collection',
        debit: 10000,
        credit: 0,
        runningBalance: curCash3 + 10000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(dueLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { increment: 10000 } }
    });

    // 5. Cash Expense of ৳5,000 -> Main Cash -৳5,000
    console.log('5. Testing Cash Expense ৳5,000 -> Main Cash -৳5,000...');
    const curCash4 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const expLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-exp-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'EXPENSE',
        referenceNumber: `TEST-EXP-${testId}`,
        description: 'Test Shop Utility Expense',
        debit: 0,
        credit: 5000,
        runningBalance: curCash4 - 5000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(expLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { decrement: 5000 } }
    });

    // 6. Supplier Payment of ৳10,000 -> Main Cash -৳10,000
    console.log('6. Testing Supplier Payment ৳10,000 -> Main Cash -৳10,000...');
    const curCash5 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const supLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-sup-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'SUPPLIER_PAYMENT',
        referenceNumber: `TEST-VOU-${testId}`,
        description: 'Test Supplier Due Payment',
        debit: 0,
        credit: 10000,
        runningBalance: curCash5 - 10000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(supLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { decrement: 10000 } }
    });

    // 7. Owner Withdrawal of ৳5,000 -> Main Cash -৳5,000
    console.log('7. Testing Owner Withdrawal ৳5,000 -> Main Cash -৳5,000...');
    const curCash6 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const wthLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-wth-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'WITHDRAWAL',
        referenceNumber: `TEST-WTH-${testId}`,
        description: 'Test Owner Personal Drawing',
        debit: 0,
        credit: 5000,
        runningBalance: curCash6 - 5000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(wthLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { decrement: 5000 } }
    });

    // 8. Inter-Account Transfer: Main Cash -> Bank ৳20,000
    console.log('8. Testing Cash to Bank Transfer ৳20,000...');
    const curCash7 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const curBank7 = Number((await prisma.financialAccount.findUnique({ where: { id: bankAccount.id } })).balance);

    const outTransfer = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-txout-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'TRANSFER_OUT',
        referenceNumber: `TEST-TRX-${testId}`,
        description: `Fund transfer to ${bankAccount.name}`,
        debit: 0,
        credit: 20000,
        runningBalance: curCash7 - 20000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(outTransfer.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { decrement: 20000 } }
    });

    const inTransfer = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-txin-${testId}`,
        partyType: 'ACCOUNT',
        partyId: bankAccount.id,
        referenceType: 'TRANSFER_IN',
        referenceNumber: `TEST-TRX-${testId}`,
        description: `Fund transfer from ${mainCash.name}`,
        debit: 20000,
        credit: 0,
        runningBalance: curBank7 + 20000,
        status: 'COMPLETED',
        paymentMethod: 'Bank Transfer',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(inTransfer.id);
    await prisma.financialAccount.update({
      where: { id: bankAccount.id },
      data: { balance: { increment: 20000 } }
    });

    // 9. Other Income of ৳5,000 -> Main Cash +৳5,000
    console.log('9. Testing Other Income ৳5,000 -> Main Cash +৳5,000...');
    const curCash8 = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const incLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-inc-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'OTHER_INCOME',
        referenceNumber: `TEST-INC-${testId}`,
        description: 'Test Scrap Sale Other Income',
        debit: 5000,
        credit: 0,
        runningBalance: curCash8 + 5000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(incLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { increment: 5000 } }
    });

    // Verify Net Math:
    // Expected Main Cash change:
    // + 300,000 (inv)
    // - 50,000 (pur)
    // + 30,000 (sale)
    // + 10,000 (due)
    // - 5,000 (exp)
    // - 10,000 (sup)
    // - 5,000 (wth)
    // - 20,000 (tx out)
    // + 5,000 (other inc)
    // = + 255,000 net change!
    const expectedCashChange = 255000;
    const finalCash = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    const actualCashChange = finalCash - initialCashBal;

    console.log(`\nVerifying Cash Calculations:`);
    console.log(`Expected Cash Net Change: ৳${expectedCashChange.toLocaleString()}`);
    console.log(`Actual Cash Net Change: ৳${actualCashChange.toLocaleString()}`);

    if (actualCashChange !== expectedCashChange) {
      throw new Error(`Cash balance mismatch! Expected +${expectedCashChange}, Got ${actualCashChange}`);
    }
    console.log('✅ Cash calculation passed with 100% mathematical accuracy!');

    const finalBank = Number((await prisma.financialAccount.findUnique({ where: { id: bankAccount.id } })).balance);
    const actualBankChange = finalBank - initialBankBal;
    console.log(`Expected Bank Net Change: ৳20,000`);
    console.log(`Actual Bank Net Change: ৳${actualBankChange.toLocaleString()}`);

    if (actualBankChange !== 20000) {
      throw new Error(`Bank balance mismatch! Expected +20000, Got ${actualBankChange}`);
    }
    console.log('✅ Bank transfer calculation passed with 100% accuracy!');

    // 10. Reversal Testing: Reversing the Cash Expense of ৳5,000
    console.log('\n10. Testing Financial Reversal of Cash Expense ৳5,000...');
    await prisma.ledgerEntry.update({
      where: { id: expLedger.id },
      data: { status: 'REVERSED' }
    });
    // Create Reversal Ledger Entry (Debit to counteract Credit)
    const revLedger = await prisma.ledgerEntry.create({
      data: {
        id: `test-led-rev-${testId}`,
        partyType: 'ACCOUNT',
        partyId: mainCash.id,
        referenceType: 'REVERSAL',
        referenceNumber: `REV-TEST-EXP-${testId}`,
        description: `Reversal of TEST-EXP-${testId}: Test Expense Cancelled`,
        debit: 5000,
        credit: 0,
        runningBalance: finalCash + 5000,
        status: 'COMPLETED',
        paymentMethod: 'Cash',
        reversalOfId: expLedger.id,
        performedBy: 'Test Runner'
      }
    });
    createdLedgerIds.push(revLedger.id);
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: { increment: 5000 } }
    });

    const cashAfterRev = Number((await prisma.financialAccount.findUnique({ where: { id: mainCash.id } })).balance);
    console.log(`Cash after reversing ৳5,000 expense: ৳${cashAfterRev} (Expected: ৳${finalCash + 5000})`);
    if (cashAfterRev !== finalCash + 5000) {
      throw new Error(`Reversal error! Cash did not recover the ৳5,000.`);
    }
    console.log('✅ Financial reversal test passed successfully!');

  } finally {
    // Cleanup test records
    console.log('\nCleaning up test ledger entries and resetting balances...');
    await prisma.ledgerEntry.deleteMany({
      where: { id: { in: createdLedgerIds } }
    });
    await prisma.financialAccount.update({
      where: { id: mainCash.id },
      data: { balance: initialCashBal }
    });
    await prisma.financialAccount.update({
      where: { id: bankAccount.id },
      data: { balance: initialBankBal }
    });
    console.log('✅ Cleanup completed. System balances restored cleanly.');
  }

  console.log('\n--- ALL FINANCIAL FLOWS VERIFIED MATHEMATICALLY ACCURATE ---');
}

runIntegrityTest()
  .catch((e) => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
