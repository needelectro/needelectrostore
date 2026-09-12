// NEED ELECTRO ERP — Comprehensive Production Data Import from Google Spreadsheet
// Safely resets previous transactional data while preserving Users, Auth, Roles, and Settings.
import { PrismaClient, Prisma } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function parseCsv(content) {
  const lines = content.split('\r\n').join('\n').split('\n');
  return lines.map(line => {
    const row = [];
    let inQuotes = false;
    let current = '';
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current.trim());
    return row;
  });
}

function cleanNum(val) {
  if (!val) return 0;
  const cleaned = val.replace(/,/g, '').replace(/৳/g, '').replace(/"/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    let d = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10) - 1;
    let y = parseInt(parts[2], 10);
    if (y < 100) y += 2000;
    if (y > 2100) y = 2026; // Fix typo dates like 2943
    // Handle MM/DD vs DD/MM if month > 12
    if (m > 11 && d <= 12) {
      const temp = m;
      m = d - 1;
      d = temp + 1;
    }
    return new Date(Date.UTC(y, m, d, 12, 0, 0));
  }
  return new Date();
}

async function main() {
  const dir = path.resolve('scripts/sheet_data');
  console.log('=== STARTING NEED ELECTRO ERP PRODUCTION SHEET IMPORT ===\n');

  // 1. PURGE PREVIOUS TRANSACTIONAL DATA (PRESERVING USERS, ROLES, SETTINGS)
  console.log('1. Safely purging existing transactional data...');
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.priceAudit.deleteMany(),
    prisma.ledgerEntry.deleteMany(),
    prisma.cashAdjustment.deleteMany(),
    prisma.customerPayment.deleteMany(),
    prisma.productReturn.deleteMany(),
    prisma.eMIInstallment.deleteMany(),
    prisma.eMIAccount.deleteMany(),
    prisma.eMIPlan.deleteMany(),
    prisma.warrantyClaim.deleteMany(),
    prisma.serviceJob.deleteMany(),
    prisma.saleItem.deleteMany(),
    prisma.sale.deleteMany(),
    prisma.purchaseItem.deleteMany(),
    prisma.purchase.deleteMany(),
    prisma.supplierPayment.deleteMany(),
    prisma.expense.deleteMany(),
    prisma.investment.deleteMany(),
    prisma.fundTransfer.deleteMany(),
    prisma.inventoryTransaction.deleteMany(),
    prisma.productSerial.deleteMany(),
    prisma.product.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.supplier.deleteMany(),
  ]);
  console.log('✓ Previous transactional tables purged cleanly.\n');

  // 2. IMPORT SUPPLIERS (Source_Code.csv)
  console.log('2. Importing Wholesale Suppliers...');
  const sourceRows = parseCsv(fs.readFileSync(path.join(dir, 'Source_Code.csv'), 'utf-8'));
  const supplierMap = new Map(); // Code -> Supplier ID

  for (let i = 1; i < sourceRows.length; i++) {
    const r = sourceRows[i];
    if (!r || !r[0]) continue;
    const name = r[0];
    const code = (r[1] || 'SUP').toUpperCase().trim();
    const rep = r[2] || '';
    const phone = r[3] || '+880 1700-000000';
    const address = r[4] || 'Dhaka, Bangladesh';
    const productType = r[5] || 'General';

    const supId = `sup-${code.toLowerCase()}`;
    const supplier = await prisma.supplier.create({
      data: {
        id: supId,
        name: `${name} [${code}]`,
        company: name,
        phone: phone,
        email: `${code.toLowerCase()}@needelectro.com`,
        address: address,
        category: productType,
        openingBalance: new Prisma.Decimal(0),
        currentPayable: new Prisma.Decimal(0),
      },
    });
    supplierMap.set(code, supplier.id);
    supplierMap.set(name.toLowerCase(), supplier.id);
    console.log(`   + Created Supplier [${code}]: ${name} (${rep})`);
  }

  // 3. IMPORT MASTER PRODUCTS & STOCK (Product_info.csv & Final_Calculate.csv)
  console.log('\n3. Importing Master Products & Inventory...');
  const prodInfoRows = parseCsv(fs.readFileSync(path.join(dir, 'Product_info.csv'), 'utf-8'));
  const finalCalcRows = parseCsv(fs.readFileSync(path.join(dir, 'Final_Calculate.csv'), 'utf-8'));

  // Build stock map from Final_Calculate.csv
  const stockMap = new Map(); // Name/Model lowercase -> { stock, buyPrice }
  for (let i = 1; i <= 43; i++) {
    const row = finalCalcRows[i];
    if (row && row[1]) {
      const key = (row[1] + ' ' + (row[2] || '')).toLowerCase().trim();
      const stock = cleanNum(row[6]);
      const buyPrice = cleanNum(row[7]);
      stockMap.set(key, { stock, buyPrice });
      stockMap.set(row[1].toLowerCase().trim(), { stock, buyPrice });
    }
  }

  const productList = [];
  let totalStockValuation = 0;

  for (let i = 1; i < prodInfoRows.length; i++) {
    const r = prodInfoRows[i];
    if (!r || !r[1]) continue;
    const name = r[1].trim();
    const model = (r[2] || '').trim();
    const cpu = (r[3] || '').trim();
    const ram = (r[4] || '').trim();
    const ssd = (r[5] || '').trim();
    const warranty = (r[6] || '1 Year').trim();
    let initialStock = cleanNum(r[7]);
    const retailPrice = cleanNum(r[8]);
    const wholesalePrice = cleanNum(r[9]) || retailPrice;
    const buyPrice = cleanNum(r[10]);

    // Check if Final_Calculate has specific active stock
    const key = (name + ' ' + model).toLowerCase().trim();
    const stockInfo = stockMap.get(key) || stockMap.get(name.toLowerCase().trim());
    if (stockInfo && stockInfo.stock !== undefined) {
      initialStock = stockInfo.stock;
    }

    const isLaptop = /laptop|g8|g7|g6|g3|g9|latitude|surface|fujitso|walton/i.test(name + ' ' + model);
    const category = isLaptop ? 'Laptops' : (/mouse|keyboard|headphone|cable|stand|converter/i.test(name) ? 'Computer Accessories' : 'Networking & Security');
    const sku = `SKU-${isLaptop ? 'LPT' : 'ACC'}-${i.toString().padStart(4, '0')}`;
    const prodId = `prod-${i}`;

    const product = await prisma.product.create({
      data: {
        id: prodId,
        sku,
        name: model ? `${name} - ${model}` : name,
        model: model || undefined,
        category,
        brand: name.split(' ')[0] || 'Generic',
        purchasePrice: new Prisma.Decimal(buyPrice || 0),
        costPrice: new Prisma.Decimal(buyPrice || 0),
        retailPrice: new Prisma.Decimal(retailPrice || buyPrice || 0),
        wholesalePrice: new Prisma.Decimal(wholesalePrice || retailPrice || 0),
        emiPrice: new Prisma.Decimal(retailPrice ? Math.round(retailPrice * 1.1) : 0),
        currentStock: initialStock,
        minStock: 1,
        warrantyPeriodMonths: warranty.includes('1') ? 12 : (warranty.includes('3') ? 3 : 0),
        isSerialized: isLaptop,
        status: initialStock > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
        specs: { cpu, ram, ssd },
      },
    });

    totalStockValuation += initialStock * (buyPrice || 0);
    productList.push(product);
  }
  console.log(`✓ Products imported: ${productList.length} SKUs. Total Physical Stock Valuation: ৳${totalStockValuation.toLocaleString('en-IN')}`);

  // 4. IMPORT CAPITAL INVESTMENTS (Expense_-_Invest.csv)
  console.log('\n4. Importing Capital Investments...');
  const investments = [
    { ref: 'INV-CAP-001', investor: 'Amdadur Rahman (Founder)', amount: 80000, date: new Date('2026-05-07'), type: 'CAPITAL_INVESTMENT', notes: 'Founder Capital Investment (40% equity)' },
    { ref: 'INV-CAP-002', investor: 'Kohes Ahmed (Partner)', amount: 100000, date: new Date('2026-08-01'), type: 'CAPITAL_INVESTMENT', notes: 'Partner Capital Injection (35% equity)' },
    { ref: 'INV-CAP-003', investor: 'Khaled (Partner)', amount: 35000, date: new Date('2026-08-01'), type: 'CAPITAL_INVESTMENT', notes: 'Partner Capital Injection (25% equity)' },
    { ref: 'INV-CAP-004', investor: 'Jisan (Investor)', amount: 38000, date: new Date('2026-06-01'), type: 'CAPITAL_INVESTMENT', notes: 'External Investor Capital (৳20k + ৳18k)' },
    { ref: 'INV-CAP-005', investor: 'Saleh (Investor)', amount: 20000, date: new Date('2026-06-01'), type: 'SEED_FUNDING', notes: 'Strategic Seed Funding & Working Capital' },
  ];

  let totalInvested = 0;
  for (let idx = 0; idx < investments.length; idx++) {
    const inv = investments[idx];
    await prisma.investment.create({
      data: {
        id: `inv-${idx + 1}`,
        referenceNumber: inv.ref,
        investorName: inv.investor,
        amount: new Prisma.Decimal(inv.amount),
        date: inv.date,
        investmentType: inv.type,
        depositAccountId: 'acc-1',
        paymentMethod: 'Cash',
        reference: inv.ref,
        notes: inv.notes,
        status: 'ACTIVE',
        createdBy: 'user-superadmin-1',
      },
    });
    totalInvested += inv.amount;
    console.log(`   + Investment: ${inv.investor} ➔ ৳${inv.amount.toLocaleString('en-IN')} [${inv.type}]`);
  }
  console.log(`✓ Total Capital Investments recorded: ৳${totalInvested.toLocaleString('en-IN')}`);

  // 5. IMPORT EXPENSES (Expense_-_Invest.csv)
  console.log('\n5. Importing Operating & Store Expenses...');
  const expRows = parseCsv(fs.readFileSync(path.join(dir, 'Expense_-_Invest.csv'), 'utf-8'));
  let totalExpenseAmount = 0;
  let expCount = 0;

  for (let i = 2; i < expRows.length; i++) {
    const r = expRows[i];
    if (!r) continue;
    const sector = (r[10] || '').trim();
    const amt = cleanNum(r[11]);
    const dateStr = (r[12] || '').trim();

    if (sector && amt > 0 && !sector.toLowerCase().includes('total') && !sector.toLowerCase().includes('until')) {
      expCount++;
      const date = parseDate(dateStr);
      let category = 'Store Cost';
      if (/rent/i.test(sector)) category = 'Rent';
      else if (/delivery|caring|fare|train/i.test(sector)) category = 'Transport';
      else if (/gadget|laptop|hp|dell|lenovo|surface/i.test(sector)) category = 'Inventory';
      else if (/printer|table|chair|lamenating|machine/i.test(sector)) category = 'Assets';
      else if (/bill|wifi|electricity/i.test(sector)) category = 'Utilities';

      await prisma.expense.create({
        data: {
          id: `exp-${expCount}`,
          voucherNumber: `EXP-2026-${expCount.toString().padStart(4, '0')}`,
          category,
          amount: new Prisma.Decimal(amt),
          date,
          paymentMethod: 'Cash',
          branchId: 'branch-1',
          description: sector,
          createdBy: 'user-superadmin-1',
        },
      });
      totalExpenseAmount += amt;
    }
  }
  console.log(`✓ Imported ${expCount} expense records totaling ৳${totalExpenseAmount.toLocaleString('en-IN')}`);

  // 6. IMPORT CUSTOMERS & SALES (Sales_Report.csv)
  console.log('\n6. Importing Customers, Sales & Dues...');
  const salesRows = parseCsv(fs.readFileSync(path.join(dir, 'Sales_Report.csv'), 'utf-8'));
  const customerMap = new Map(); // Name lowercase -> Customer ID
  let saleCount = 0;
  let totalInvoicedSales = 0;
  let totalActualCashCollected = 0;
  let totalDuesIncurred = 0;

  for (let i = 3; i < salesRows.length; i++) {
    const r = salesRows[i];
    if (!r || !r[0] || /^(total|may|june|july|august|september)$/i.test(r[0].trim())) continue;
    const custName = r[0].trim();
    const phone = (r[1] || '').replace(/[^0-9+-]/g, '').trim();
    const prodName = (r[2] || 'Electronic Item').trim();
    const qty = Math.max(1, Math.round(cleanNum(r[3])));
    const sellPrice = cleanNum(r[4]);
    const buyPrice = cleanNum(r[5]);
    const profit = cleanNum(r[6]);
    const dateStr = (r[7] || '').trim();
    const dueAmount = cleanNum(r[9]);
    const paidAmount = Math.max(0, sellPrice - dueAmount);

    if (sellPrice <= 0 && buyPrice <= 0 && profit === 0) continue;

    saleCount++;
    const saleDate = parseDate(dateStr);

    // Ensure customer exists
    let customerId = customerMap.get(custName.toLowerCase());
    if (!customerId) {
      const custNumber = `CUST-${(customerMap.size + 1).toString().padStart(4, '0')}`;
      customerId = `cust-${customerMap.size + 1}`;
      const custPhone = phone && phone.length > 5 ? phone : `+880 1700-00${(customerMap.size + 1).toString().padStart(4, '0')}`;
      await prisma.customer.create({
        data: {
          id: customerId,
          customerId: custNumber,
          name: custName,
          phone: custPhone,
          creditLimit: new Prisma.Decimal(50000),
          currentBalance: new Prisma.Decimal(0),
        },
      });
      customerMap.set(custName.toLowerCase(), customerId);
    }

    // Update customer due
    if (dueAmount > 0) {
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          currentBalance: { increment: new Prisma.Decimal(dueAmount) },
        },
      });
    }

    const invoiceNumber = `INV-2026-${saleCount.toString().padStart(4, '0')}`;
    const sale = await prisma.sale.create({
      data: {
        id: `sale-${saleCount}`,
        invoiceNumber,
        customerId: customerId,
        customerName: custName,
        customerPhone: phone || '+880 1700-000000',
        branchId: 'branch-1',
        date: saleDate,
        subtotal: new Prisma.Decimal(sellPrice),
        overallDiscount: new Prisma.Decimal(0),
        vatAmount: new Prisma.Decimal(0),
        vatPercent: new Prisma.Decimal(0),
        grandTotal: new Prisma.Decimal(sellPrice),
        paidAmount: new Prisma.Decimal(paidAmount),
        dueAmount: new Prisma.Decimal(dueAmount),
        payments: [{ method: 'Cash', amount: paidAmount }],
        saleType: 'REGULAR',
        status: 'COMPLETED',
        salespersonId: 'user-superadmin-1',
        salespersonName: 'Amdadur Rahman',
        notes: `Imported from Sales Report. Source: ${r[10] || 'Direct'}`,
        createdAt: saleDate,
      },
    });

    // Create SaleItem
    const matchedProduct = productList.find(p => p.name.toLowerCase().includes(prodName.toLowerCase())) || productList[0];
    await prisma.saleItem.create({
      data: {
        id: `sitem-${saleCount}`,
        saleId: sale.id,
        productId: matchedProduct ? matchedProduct.id : null,
        productName: prodName,
        sku: matchedProduct ? matchedProduct.sku : `SKU-ITEM-${saleCount}`,
        category: matchedProduct ? matchedProduct.category : 'General',
        quantity: qty,
        unitPrice: new Prisma.Decimal(sellPrice / qty || 0),
        discount: new Prisma.Decimal(0),
        total: new Prisma.Decimal(sellPrice),
        warrantyMonths: matchedProduct ? matchedProduct.warrantyMonths : 12,
      },
    });

    totalInvoicedSales += sellPrice;
    totalActualCashCollected += paidAmount;
    totalDuesIncurred += dueAmount;
  }
  console.log(`✓ Imported ${saleCount} sales transactions.`);
  console.log(`   - Total Invoiced Sales: ৳${totalInvoicedSales.toLocaleString('en-IN')}`);
  console.log(`   - Actual Cash Collected: ৳${totalActualCashCollected.toLocaleString('en-IN')}`);
  console.log(`   - Outstanding Customer Dues: ৳${totalDuesIncurred.toLocaleString('en-IN')}`);

  // 7. SET CASH LIQUIDITY (Physical Drawer: ৳1,67,789.00)
  console.log('\n7. Setting Financial Account Balances...');
  await prisma.financialAccount.update({
    where: { id: 'acc-1' },
    data: {
      balance: new Prisma.Decimal(167789.00),
    },
  });
  console.log('✓ Main Cash Drawer (Moulvibazar Showroom) initialized to exact sheet balance: ৳1,67,789.00');

  // Record initial audit entry
  await prisma.auditLog.create({
    data: {
      id: `audit-init-${Date.now()}`,
      userId: 'user-superadmin-1',
      userName: 'Amdadur Rahman',
      action: 'SYSTEM_IMPORT',
      module: 'DATABASE_MIGRATION',
      recordId: 'all',
      details: 'Clean import of all Google Spreadsheet records completed. Historical sales, expenses, inventory, and partner investments synced.',
    },
  });

  console.log('\n=== COMPLETE GOOGLE SPREADSHEET IMPORT FINISHED SUCCESSFULLY! ===');
}

main().catch(console.error).finally(() => prisma.$disconnect());
