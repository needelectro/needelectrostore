import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testReconciliation() {
  console.log('--- RECONCILIATION PREVIEW ---');

  // Let's calculate the exact balance of each account
  // 1. acc-1 (Main Cash):
  // Opening: +167,789
  // TRF-174678: -20,000
  // ADJ-183474: -39,000
  // INV-2026-1113: +42,999
  // INV-2026-1114: +41,500
  // INV-2026-1115: +30,300
  // INV-2026-1116: +3,850
  // TRF-425016: -160,000
  // INV-2026-1118: +48,000
  // TRF-524734: +20,000
  // INV-2026-1119: +34,200
  // INV-2026-1120: +20,000
  // INV-2026-1121: +29,000
  // REC-DUE-480777: +27,000
  // INV-2026-1122: +1,700
  const acc1Debits = 167789 + 42999 + 41500 + 30300 + 3850 + 48000 + 20000 + 34200 + 20000 + 29000 + 27000 + 1700;
  const acc1Credits = 20000 + 39000 + 160000;
  const acc1Balance = acc1Debits - acc1Credits;
  console.log(`acc-1 (Main Cash) Ledger Balance: ৳${acc1Balance}`);

  // 2. acc-ebl-amdadur:
  // TRF-174678: +20,000
  // TRF-524734: -20,000
  // INV-2026-1121: +7,000
  const eblBalance = 20000 - 20000 + 7000;
  console.log(`acc-ebl-amdadur Ledger Balance: ৳${eblBalance}`);

  // 3. acc-pubali-fulori:
  // REC-DUE-349441: +37,000
  const pubaliFuloriBalance = 37000;
  console.log(`acc-pubali-fulori Ledger Balance: ৳${pubaliFuloriBalance}`);

  // 4. acc-pubali-amdadur: 0
  console.log(`acc-pubali-amdadur Ledger Balance: ৳0`);

  // 5. acc-nagad-primary: 0
  console.log(`acc-nagad-primary Ledger Balance: ৳0`);

  // 6. acc-bkash-primary:
  // If opening balance was calibrated so closing balance is clean:
  // Credits = 309,850. Existing debits (excluding OB) = 163,850.
  // 309,850 - 163,850 = 146,000. If OB was 150,000, balance would be +4,000.
  // Currently stored balance is -21,250 (which was 87,250 - 108,500).
}

testReconciliation().catch(console.error).finally(() => prisma.$disconnect());
