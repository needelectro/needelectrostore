// NEED ELECTRO ERP — Sales & POS Transactional Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission, authenticateRequest } from '@/lib/auth';
import { createSaleSchema } from '@/lib/validations';
import { sendNotification } from '@/lib/notifications';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';

export async function GET(req: NextRequest) {
  let user: any = await authenticateRequest(req);
  if (!user && process.env.NODE_ENV !== 'production') {
    user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  }

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const branchId = searchParams.get('branchId');
  const customerId = searchParams.get('customerId');
  const status = searchParams.get('status');
  const query = searchParams.get('query');

  const where: any = {};
  if (branchId) where.branchId = branchId;
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;
  if (query) {
    where.OR = [
      { invoiceNumber: { contains: query, mode: 'insensitive' } },
      { customerName: { contains: query, mode: 'insensitive' } },
      { customerPhone: { contains: query } },
    ];
  }

  const sales = await prisma.sale.findMany({
    where,
    include: { items: true, customer: true },
    orderBy: { date: 'desc' },
    take: 500,
  });

  const formattedSales = sales.map(s => ({
    id: s.id,
    invoiceNumber: s.invoiceNumber,
    customerId: s.customerId,
    customerName: s.customerName,
    customerPhone: s.customerPhone,
    customerAddress: s.customer?.address || '',
    branchId: s.branchId,
    date: s.date ? s.date.toISOString().split('T')[0] : '',
    createdAt: s.createdAt ? s.createdAt.toISOString() : (s.date ? s.date.toISOString() : ''),
    subtotal: Number(s.subtotal),
    overallDiscount: Number(s.overallDiscount),
    vatAmount: Number(s.vatAmount),
    vatPercent: Number(s.vatPercent),
    grandTotal: Number(s.grandTotal),
    paidAmount: Number(s.paidAmount),
    dueAmount: Number(s.dueAmount),
    payments: (s.payments as any) || [],
    saleType: s.saleType,
    emiAccountId: s.emiAccountId,
    status: s.status,
    salespersonId: s.salespersonId,
    salespersonName: s.salespersonName,
    notes: s.notes,
    items: s.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      total: Number(item.total),
      warrantyMonths: item.warrantyMonths,
      isSerialized: item.isSerialized,
      serialNumbers: Array.isArray(item.serialNumbers) ? (item.serialNumbers as string[]) : [],
    })),
  }));

  return NextResponse.json({ success: true, data: formattedSales });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'sales', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to POS/Sales' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createSaleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { saleData, emiPlanConfig, paymentAccountId } = parsed.data;

    // Execute within an ACID PostgreSQL transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate guaranteed-unique invoice number with collision prevention
      let invoiceNumber = saleData.invoiceNumber;
      const pos = await tx.posSettings.findUnique({ where: { id: 'main' } });
      const prefix = pos?.invoicePrefix || 'INV-2026-';
      let nextNum = pos?.nextInvoiceNumber || 1001;

      if (!invoiceNumber || (await tx.sale.findUnique({ where: { invoiceNumber } }))) {
        // Query recent sales to calculate true highest numeric sequence
        const recentSales = await tx.sale.findMany({
          where: { invoiceNumber: { startsWith: prefix } },
          select: { invoiceNumber: true },
          take: 500,
          orderBy: { date: 'desc' },
        });

        let highestNum = nextNum - 1;
        for (const s of recentSales) {
          const numPart = s.invoiceNumber.replace(prefix, '');
          const parsedNum = parseInt(numPart, 10);
          if (!isNaN(parsedNum) && parsedNum > highestNum) {
            highestNum = parsedNum;
          }
        }

        nextNum = Math.max(nextNum, highestNum + 1);

        let candidate = `${prefix}${nextNum}`;
        while (await tx.sale.findUnique({ where: { invoiceNumber: candidate } })) {
          nextNum++;
          candidate = `${prefix}${nextNum}`;
        }

        invoiceNumber = candidate;

        await tx.posSettings.update({
          where: { id: 'main' },
          data: { nextInvoiceNumber: nextNum + 1 },
        });
      }

      const saleId = 'sale-' + Date.now();

      // 2. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          id: saleId,
          invoiceNumber,
          customerId: saleData.customerId,
          customerName: saleData.customerName,
          customerPhone: saleData.customerPhone,
          branchId: saleData.branchId,
          date: new Date(),
          subtotal: new Prisma.Decimal(saleData.subtotal),
          overallDiscount: new Prisma.Decimal(saleData.overallDiscount || 0),
          vatAmount: new Prisma.Decimal(saleData.vatAmount || 0),
          vatPercent: new Prisma.Decimal(saleData.vatPercent || 0),
          grandTotal: new Prisma.Decimal(saleData.grandTotal),
          paidAmount: new Prisma.Decimal(saleData.paidAmount || 0),
          dueAmount: new Prisma.Decimal(saleData.dueAmount || 0),
          payments: saleData.payments || [],
          saleType: saleData.saleType || 'REGULAR',
          status: 'COMPLETED',
          salespersonId: user.id,
          salespersonName: user.name,
          notes: saleData.notes,
        },
      });

      // 3. Process Sale Items, Inventory & Serials
      for (const item of saleData.items) {
        const saleItemId = 'si-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        await tx.saleItem.create({
          data: {
            id: saleItemId,
            saleId: sale.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            category: item.category,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            discount: new Prisma.Decimal(item.discount || 0),
            total: new Prisma.Decimal(item.total),
            warrantyMonths: item.warrantyMonths || 0,
            isSerialized: Boolean(item.isSerialized),
            serialNumbers: item.serialNumbers || [],
          },
        });

        // Get product to calculate stock and COGS
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productName} not found.`);
        }

        // Concurrency Guard: Validate stock in database transaction to prevent negative stock
        if (product.currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.productName}. Available: ${product.currentStock}, Requested: ${item.quantity}`);
        }

        const openingStock = product.currentStock;
        const closingStock = openingStock - item.quantity;

        // Atomic check-and-decrement
        const stockUpdate = await tx.product.updateMany({
          where: {
            id: item.productId,
            currentStock: { gte: item.quantity },
          },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        if (stockUpdate.count === 0) {
          throw new Error(`Concurrency conflict: Stock for ${item.productName} was updated by another transaction. Please retry.`);
        }

        // Record Inventory Transaction
        await tx.inventoryTransaction.create({
          data: {
            id: 'itx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            transactionNumber: 'ITX-' + Date.now().toString().slice(-6),
            date: new Date(),
            type: 'SALE_OUT',
            productId: item.productId,
            productName: item.productName,
            branchId: saleData.branchId,
            quantity: item.quantity,
            unitCost: product.costPrice,
            totalValue: new Prisma.Decimal(Number(product.costPrice) * item.quantity),
            openingStock,
            closingStock,
            referenceType: 'SALE',
            referenceId: sale.id,
            serialNumbers: item.serialNumbers || [],
            notes: `Sold on invoice ${invoiceNumber}`,
            createdBy: user.name,
          },
        });

        // If serialized, assign serials to SOLD with atomic availability guard
        if (item.isSerialized && item.serialNumbers && item.serialNumbers.length > 0) {
          for (const sn of item.serialNumbers) {
            const warrantyMonths = item.warrantyMonths || 0;
            const warrantyStart = new Date();
            const warrantyEnd = new Date();
            warrantyEnd.setMonth(warrantyEnd.getMonth() + warrantyMonths);

            const serialUpdate = await tx.productSerial.updateMany({
              where: {
                serialNumber: sn,
                productId: item.productId,
                status: 'AVAILABLE',
              },
              data: {
                status: 'SOLD',
                saleInvoiceId: sale.id,
                saleDate: new Date(),
                customerId: saleData.customerId,
                warrantyStartDate: warrantyMonths > 0 ? warrantyStart : null,
                warrantyEndDate: warrantyMonths > 0 ? warrantyEnd : null,
              },
            });

            if (serialUpdate.count === 0) {
              throw new Error(`Serial number "${sn}" for ${item.productName} is unavailable or already sold.`);
            }
          }
        }
      }

      // 4. Handle Laptop EMI Account if EMI Sale
      if (saleData.saleType === 'EMI' && emiPlanConfig) {
        const emiAccountId = 'emi-' + Date.now();
        const emiNumber = 'EMI-' + Date.now().toString().slice(-6);

        const primaryItem = saleData.items[0];
        const primarySerial = (primaryItem.serialNumbers && primaryItem.serialNumbers[0]) || 'N/A';

        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + emiPlanConfig.durationMonths);

        const emiAccount = await tx.eMIAccount.create({
          data: {
            id: emiAccountId,
            emiNumber,
            saleInvoiceId: sale.id,
            customerId: saleData.customerId,
            customerName: saleData.customerName,
            customerPhone: saleData.customerPhone,
            guarantor: emiPlanConfig.guarantor || {},
            productId: primaryItem.productId,
            productName: primaryItem.productName,
            serialNumber: primarySerial,
            laptopPrice: new Prisma.Decimal(saleData.grandTotal),
            downPayment: new Prisma.Decimal(emiPlanConfig.downPayment),
            financedAmount: new Prisma.Decimal(emiPlanConfig.financedAmount),
            durationMonths: emiPlanConfig.durationMonths,
            monthlyInstallment: new Prisma.Decimal(emiPlanConfig.monthlyInstallment),
            totalPayable: new Prisma.Decimal(emiPlanConfig.totalPayable),
            totalPaid: new Prisma.Decimal(emiPlanConfig.downPayment),
            remainingBalance: new Prisma.Decimal(emiPlanConfig.financedAmount),
            startDate,
            endDate,
            status: 'ACTIVE',
            approvedBy: user.name,
          },
        });

        // Link EMI account to Sale
        await tx.sale.update({
          where: { id: sale.id },
          data: { emiAccountId: emiAccount.id },
        });

        // Link serial record to EMI account
        if (primarySerial !== 'N/A') {
          await tx.productSerial.updateMany({
            where: { serialNumber: primarySerial },
            data: { emiAccountId: emiAccount.id },
          });
        }

        // Generate Installment Schedule
        for (let i = 1; i <= emiPlanConfig.durationMonths; i++) {
          const dueDate = new Date();
          dueDate.setMonth(dueDate.getMonth() + i);

          await tx.eMIInstallment.create({
            data: {
              id: 'inst-' + Date.now() + '-' + i,
              emiAccountId: emiAccount.id,
              installmentNumber: i,
              dueDate,
              amount: new Prisma.Decimal(emiPlanConfig.monthlyInstallment),
              penaltyAmount: new Prisma.Decimal(0),
              paidAmount: new Prisma.Decimal(0),
              status: 'UPCOMING',
            },
          });
        }

        // Record Down Payment if received
        if (emiPlanConfig.downPayment > 0) {
          await tx.eMIPayment.create({
            data: {
              id: 'epay-' + Date.now(),
              receiptNumber: 'REC-DP-' + Date.now().toString().slice(-6),
              emiAccountId: emiAccount.id,
              emiNumber,
              installmentId: 'down-payment',
              installmentNumber: 0,
              customerId: saleData.customerId,
              customerName: saleData.customerName,
              amount: new Prisma.Decimal(emiPlanConfig.downPayment),
              penaltyPaid: new Prisma.Decimal(0),
              paymentDate: new Date(),
              paymentMethod: 'CASH',
              collectedBy: user.name,
              notes: `Down payment for ${emiNumber}`,
            },
          });
        }
      }

      // 5. Update Customer Balance if there is Due
      if (saleData.dueAmount > 0) {
        await tx.customer.update({
          where: { id: saleData.customerId },
          data: {
            currentBalance: { increment: new Prisma.Decimal(saleData.dueAmount) },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-' + Date.now() + '-due',
            date: new Date(),
            partyType: 'CUSTOMER',
            partyId: saleData.customerId,
            referenceType: 'SALE',
            referenceNumber: invoiceNumber,
            description: `Receivable for invoice ${invoiceNumber}`,
            debit: new Prisma.Decimal(saleData.dueAmount),
            credit: new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(saleData.dueAmount),
          },
        });
      }

      // 6. Update Financial Accounts & Central Ledger (With Full Split / Mixed Payment Multi-Account Allocation)
      if (saleData.paidAmount > 0) {
        const splitPayments = Array.isArray(saleData.payments) && saleData.payments.length > 0
          ? saleData.payments
          : [{ method: 'Cash', amount: saleData.paidAmount, accountId: paymentAccountId }];

        for (const p of splitPayments) {
          const splitAmount = Number(p.amount);
          if (splitAmount <= 0) continue;
          const methodLabel = p.method || 'Cash';

          await recordAccountMovement(tx, {
            accountId: p.accountId || paymentAccountId,
            paymentMethod: methodLabel,
            referenceType: 'SALE',
            referenceNumber: invoiceNumber,
            amount: splitAmount,
            direction: 'INFLOW',
            description: `Payment received (${methodLabel}) for invoice ${invoiceNumber} from ${saleData.customerName}`,
            performedBy: user.name,
            relatedTransactionId: sale.id,
          });
        }
      }

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SALE_COMPLETED',
          module: 'POS',
          recordId: sale.id,
          details: `Invoice ${invoiceNumber} created for ${saleData.customerName}. Total: ৳${saleData.grandTotal}. Paid: ৳${saleData.paidAmount}`,
        },
      });

      // Fetch complete sale with its newly created items and customer details
      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: { items: true, customer: true },
      });

      if (fullSale) {
        return {
          ...fullSale,
          customerAddress: fullSale.customer?.address || '',
        };
      }

      return sale;
    });

    // Asynchronously trigger customer SMS / WhatsApp digital receipt
    if (saleData.customerPhone) {
      sendNotification({
        recipientPhone: saleData.customerPhone,
        recipientName: saleData.customerName,
        channel: 'BOTH',
        customMessage: `NEED ELECTRO: Dear ${saleData.customerName}, your invoice ${result.invoiceNumber} has been generated. Total: ৳${Number(result.grandTotal).toLocaleString('en-IN')}, Paid: ৳${Number(result.paidAmount).toLocaleString('en-IN')}. Shop#5, MR Plaza, Kusumbag, Moulvibazar. Hotline: 01733-983752.`,
        metadata: {
          referenceType: 'SALE',
          referenceId: result.id,
        },
      }).catch((e) => console.warn('Background sale notification notice:', e));
    }

    return NextResponse.json({
      success: true,
      message: 'Sale successfully completed.',
      sale: result,
    });
  } catch (err: any) {
    console.error('POS Sale Transaction Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Transaction failed' }, { status: 500 });
  }
}
