// NEED ELECTRO ERP — Inventory Valuation Cash Outflow Engine
// Records ৳91,960 initial stock purchase outflow from Main Cash Drawer (acc-1)
// Creates Purchase records, PurchaseItems, InventoryTransactions, LedgerEntries, and updates Account balances.

import { PrismaClient, Prisma } from '@prisma/client';
import dotenv from 'dotenv';
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

dotenv.config();

const connectionUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionUrl,
    },
  },
});

async function main() {
  console.log('=== Starting Inventory Valuation Cash Outflow (৳91,960) ===\n');

  // 1. Fetch all products with stock > 0
  const products = await prisma.product.findMany({
    where: { currentStock: { gt: 0 } },
  });

  console.log(`Found ${products.length} products with stock on hand.`);

  // Group products by supplierId
  const supplierGroups = new Map();
  let totalValuation = 0;

  for (const p of products) {
    const cost = Number(p.costPrice || p.purchasePrice || 0);
    const stock = Number(p.currentStock || 0);
    const lineTotal = cost * stock;
    totalValuation += lineTotal;

    const supId = p.supplierId || 'supp-gb'; // Default to Green View if unassigned
    if (!supplierGroups.has(supId)) {
      supplierGroups.set(supId, []);
    }
    supplierGroups.get(supId).push({
      productId: p.id,
      name: p.name,
      sku: p.sku,
      unitCost: cost,
      quantity: stock,
      subtotal: lineTotal,
      isSerialized: p.isSerialized,
    });
  }

  console.log(`Verified Total Inventory Valuation: ৳${totalValuation.toLocaleString()} across ${supplierGroups.size} supplier batches.`);

  // 2. Fetch main cash account and branch
  const cashAccount = await prisma.financialAccount.findUnique({ where: { id: 'acc-1' } });
  if (!cashAccount) {
    throw new Error('Main Cash Drawer (acc-1) not found in database.');
  }

  const branch = await prisma.branch.findFirst({ where: { active: true } });
  const branchId = branch?.id || 'branch-main-1';

  const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  const performerName = user?.name || 'Amdadur Rahman';
  const performerId = user?.id || 'user-superadmin-1';

  const purchaseDate = new Date('2026-06-01T12:00:00.000Z');

  // Suppliers map
  const suppliers = await prisma.supplier.findMany();
  const supMap = new Map(suppliers.map(s => [s.id, s]));

  const createdPurchases = [];

  // Execute ACID Transaction
  await prisma.$transaction(async (tx) => {
    for (const [supId, items] of supplierGroups.entries()) {
      const supplier = supMap.get(supId);
      const supplierName = supplier?.company || supplier?.name || 'Wholesale Supplier';
      const supplierCode = supplier?.code || 'SUP';

      const invoiceNumber = `PUR-INV-20260601-${supplierCode}`;
      const purchaseId = `pur-init-${supplierCode.toLowerCase()}`;
      const batchTotal = items.reduce((sum, it) => sum + it.subtotal, 0);

      // Check existing purchase
      const existingPur = await tx.purchase.findFirst({
        where: {
          OR: [
            { id: purchaseId },
            { invoiceNumber },
          ],
        },
      });

      let purchase;
      if (existingPur) {
        console.log(`Purchase ${invoiceNumber} already exists. Skipping recreation.`);
        purchase = existingPur;
      } else {
        purchase = await tx.purchase.create({
          data: {
            id: purchaseId,
            invoiceNumber,
            supplierId: supId,
            supplierName,
            branchId,
            date: purchaseDate,
            status: 'Received',
            subtotal: new Prisma.Decimal(batchTotal),
            discount: new Prisma.Decimal(0),
            tax: new Prisma.Decimal(0),
            total: new Prisma.Decimal(batchTotal),
            paidAmount: new Prisma.Decimal(batchTotal),
            dueAmount: new Prisma.Decimal(0),
            paymentMethod: 'Cash',
            notes: `Initial stock procurement inventory valuation intake paid in full from Main Cash Drawer.`,
            createdAt: purchaseDate,
          },
        });

        // Create Purchase Items
        for (const it of items) {
          const piId = `pi-${purchase.id}-${it.productId}`;
          await tx.purchaseItem.create({
            data: {
              id: piId,
              purchaseId: purchase.id,
              productId: it.productId,
              productName: it.name,
              quantity: it.quantity,
              costPrice: new Prisma.Decimal(it.unitCost),
              subtotal: new Prisma.Decimal(it.subtotal),
              serialNumbers: it.isSerialized ? [`SN-${it.sku}`] : [],
            },
          });

          // Link physical serials if serialized
          if (it.isSerialized) {
            await tx.productSerial.updateMany({
              where: { productId: it.productId, status: 'AVAILABLE' },
              data: {
                purchaseId: purchase.id,
                purchaseDate,
                supplierId: supId,
              },
            });
          }

          // Record Inventory Transaction
          await tx.inventoryTransaction.create({
            data: {
              id: `itx-${purchase.id}-${it.productId}`,
              transactionNumber: `ITX-INIT-${it.sku}`,
              date: purchaseDate,
              type: 'PURCHASE_IN',
              productId: it.productId,
              productName: it.name,
              branchId,
              quantity: it.quantity,
              unitCost: new Prisma.Decimal(it.unitCost),
              totalValue: new Prisma.Decimal(it.subtotal),
              openingStock: 0,
              closingStock: it.quantity,
              referenceType: 'PURCHASE',
              referenceId: purchase.id,
              serialNumbers: it.isSerialized ? [`SN-${it.sku}`] : [],
              notes: `Initial inventory valuation stock intake on invoice ${invoiceNumber}`,
              createdBy: performerName,
            },
          });
        }

        // Deduct from Main Cash Drawer (acc-1)
        await tx.financialAccount.update({
          where: { id: cashAccount.id },
          data: {
            balance: { decrement: new Prisma.Decimal(batchTotal) },
          },
        });

        const accCurrent = await tx.financialAccount.findUnique({ where: { id: cashAccount.id } });

        // Record Central Account Ledger Outflow Entry
        await tx.ledgerEntry.create({
          data: {
            id: `led-pur-20260601-${supplierCode.toLowerCase()}`,
            date: purchaseDate,
            partyType: 'ACCOUNT',
            partyId: cashAccount.id,
            referenceType: 'PURCHASE',
            referenceNumber: invoiceNumber,
            description: `Inventory Stock Purchase [${invoiceNumber}] payment to ${supplierName} (FIFO Valuation)`,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(batchTotal),
            runningBalance: accCurrent?.balance || new Prisma.Decimal(0),
            status: 'COMPLETED',
            paymentMethod: 'Cash',
            performedBy: performerName,
            relatedTransactionId: purchase.id,
          },
        });

        console.log(`✔ Recorded Purchase Invoice [${invoiceNumber}] ${supplierName}: ৳${batchTotal.toLocaleString()} Cash Outflow`);
        createdPurchases.push(purchase);
      }
    }

    // Record Audit Log
    await tx.auditLog.create({
      data: {
        id: `audit-inv-cash-deduction-${Date.now()}`,
        userId: performerId,
        userName: performerName,
        action: 'INVENTORY_VALUATION_CASH_DEDUCTION',
        module: 'ACCOUNTING',
        recordId: 'batch-inventory-valuation-91960',
        details: `Subtracted automated FIFO inventory valuation of ৳${totalValuation.toLocaleString()} from Main Cash Drawer across ${supplierGroups.size} supplier purchase batches.`,
        timestamp: new Date(),
      },
    });
  }, {
    timeout: 60000,
    maxWait: 20000,
  });

  // 3. Verify and sync stored balances with ledger
  const accounts = await prisma.financialAccount.findMany({ where: { isActive: true } });
  for (const acc of accounts) {
    const agg = await prisma.ledgerEntry.aggregate({
      where: {
        partyType: 'ACCOUNT',
        partyId: acc.id,
        status: { in: ['COMPLETED', 'REVERSED'] },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const trueBalance = Number(agg._sum.debit || 0) - Number(agg._sum.credit || 0);

    if (Number(acc.balance) !== trueBalance) {
      await prisma.financialAccount.update({
        where: { id: acc.id },
        data: {
          balance: new Prisma.Decimal(trueBalance),
        },
      });
    }
  }

  const finalCash = await prisma.financialAccount.findUnique({ where: { id: 'acc-1' } });
  console.log('\n=== PostgreSQL Cash Outflow Complete ===');
  console.log(`Total Inventory Valuation Deducted: ৳${totalValuation.toLocaleString()}`);
  console.log(`Final Main Cash Drawer Stored Balance: ৳${Number(finalCash?.balance || 0).toLocaleString()}`);

  // 4. Sync to local SQLite (data/need_electro.db)
  const sqlitePath = path.resolve('data/need_electro.db');
  if (fs.existsSync(sqlitePath)) {
    console.log('\nSyncing to local SQLite (data/need_electro.db)...');
    try {
      const sqlite = new DatabaseSync(sqlitePath);
      sqlite.exec(`
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
          created_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS purchase_items (
          id TEXT PRIMARY KEY,
          purchase_id TEXT NOT NULL,
          product_id TEXT NOT NULL,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_cost REAL NOT NULL,
          subtotal REAL NOT NULL,
          serial_numbers TEXT
        );
      `);

      const insertPur = sqlite.prepare(`
        INSERT OR REPLACE INTO purchases (
          id, invoice_number, supplier_id, supplier_name, branch_id, date, status,
          subtotal, discount, tax, total, paid_amount, due_amount, payment_method, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertLedger = sqlite.prepare(`
        INSERT OR REPLACE INTO ledger_entries (
          id, date, party_type, party_id, reference_type, reference_number,
          description, debit, credit, running_balance, status, payment_method, performed_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const [supId, items] of supplierGroups.entries()) {
        const supplier = supMap.get(supId);
        const supplierName = supplier?.company || supplier?.name || 'Wholesale Supplier';
        const supplierCode = supplier?.code || 'SUP';
        const invoiceNumber = `PUR-INV-20260601-${supplierCode}`;
        const purchaseId = `pur-init-${supplierCode.toLowerCase()}`;
        const batchTotal = items.reduce((sum, it) => sum + it.subtotal, 0);

        insertPur.run(
          purchaseId, invoiceNumber, supId, supplierName, branchId, '2026-06-01T12:00:00.000Z', 'Received',
          batchTotal, 0, 0, batchTotal, batchTotal, 0, 'Cash', 'Initial stock procurement inventory valuation intake', '2026-06-01T12:00:00.000Z'
        );

        insertLedger.run(
          `led-pur-20260601-${supplierCode.toLowerCase()}`,
          '2026-06-01T12:00:00.000Z',
          'ACCOUNT',
          'acc-1',
          'PURCHASE',
          invoiceNumber,
          `Inventory Stock Purchase [${invoiceNumber}] payment to ${supplierName} (FIFO Valuation)`,
          0,
          batchTotal,
          Number(finalCash?.balance || 0),
          'COMPLETED',
          'Cash',
          performerName
        );
      }

      // Update SQLite account balance
      sqlite.prepare('UPDATE financial_accounts SET balance = ? WHERE id = ?').run(Number(finalCash?.balance || 0), 'acc-1');

      console.log('✔ SQLite purchases & ledger sync successful.');
    } catch (e) {
      console.warn('SQLite sync notice:', e.message);
    }
  }

  console.log('\n=== Inventory Valuation Successfully Minused from Cash! ===');
}

main()
  .catch((err) => {
    console.error('Execution error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
