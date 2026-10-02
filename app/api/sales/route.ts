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
  const saleType = searchParams.get('saleType');
  const salespersonId = searchParams.get('salespersonId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const paymentMethod = searchParams.get('paymentMethod');
  const query = searchParams.get('query');
  const limit = Math.min(Number(searchParams.get('limit')) || 500, 1000);
  const offset = Number(searchParams.get('offset')) || 0;

  const where: any = {};
  if (branchId && branchId !== 'ALL') where.branchId = branchId;
  if (customerId) where.customerId = customerId;
  if (salespersonId && salespersonId !== 'ALL') where.salespersonId = salespersonId;
  if (saleType && saleType !== 'ALL') where.saleType = saleType;

  // Status Filter
  if (status && status !== 'ALL') {
    if (status === 'DUE') {
      where.dueAmount = { gt: 0 };
      where.status = { notIn: ['CANCELLED', 'VOID', 'RETURNED'] };
    } else if (status === 'PAID') {
      where.dueAmount = { lte: 0 };
      where.status = { notIn: ['CANCELLED', 'VOID', 'RETURNED'] };
    } else if (status === 'PARTIALLY_PAID') {
      where.dueAmount = { gt: 0 };
      where.paidAmount = { gt: 0 };
      where.status = { notIn: ['CANCELLED', 'VOID', 'RETURNED'] };
    } else {
      where.status = status;
    }
  }

  // Date Range Filter
  if (startDate || endDate) {
    where.date = {};
    if (startDate) {
      where.date.gte = new Date(startDate + 'T00:00:00.000Z');
    }
    if (endDate) {
      where.date.lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Multi-field search
  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { invoiceNumber: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q } },
      { notes: { contains: q, mode: 'insensitive' } },
      {
        items: {
          some: {
            OR: [
              { productName: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  const [sales, totalCount] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        branch: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.sale.count({ where }),
  ]);

  // Client-side filter for paymentMethod inside payments Json if specified
  let filteredSales = sales;
  if (paymentMethod && paymentMethod !== 'ALL') {
    filteredSales = sales.filter((s) => {
      const pmts = (s.payments as any[]) || [];
      return pmts.some(
        (p) => String(p.method || '').toLowerCase() === paymentMethod.toLowerCase()
      );
    });
  }

  const formattedSales = filteredSales.map((s) => {
    const custBalance = Number(s.customer?.currentBalance || 0);
    const subtotal = Number(s.subtotal);
    const overallDiscount = Number(s.overallDiscount);
    const vatAmount = Number(s.vatAmount);
    const vatPercent = Number(s.vatPercent);
    const deliveryCharge = Number((s as any).deliveryCharge || 0);
    const serviceCharge = Number((s as any).serviceCharge || 0);
    const otherCharges = Number((s as any).otherCharges || 0);
    const grandTotal = Number(s.grandTotal);
    const paidAmount = Number(s.paidAmount);
    const dueAmount = Number(s.dueAmount);
    const previousDue = Number((s as any).previousDue || custBalance);
    const totalDue = Number((s as any).totalDue || previousDue + dueAmount);
    const changeAmount = Number((s as any).changeAmount || 0);

    return {
      id: s.id,
      invoiceNumber: s.invoiceNumber,
      customerId: s.customerId,
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      customerEmail: (s as any).customerEmail || s.customer?.email || '',
      customerAddress: (s as any).billingAddress || s.customer?.address || '',
      customerType: (s as any).customerType || 'RETAIL',
      customerCode: s.customer?.customerId || '',
      billingAddress: (s as any).billingAddress || s.customer?.address || '',
      shippingAddress: (s as any).shippingAddress || (s as any).billingAddress || s.customer?.address || '',
      branchId: s.branchId,
      branchName: s.branch?.name || '',
      date: s.date ? s.date.toISOString().split('T')[0] : '',
      createdAt: s.createdAt ? s.createdAt.toISOString() : (s.date ? s.date.toISOString() : ''),
      subtotal,
      overallDiscount,
      vatAmount,
      vatPercent,
      deliveryCharge,
      serviceCharge,
      otherCharges,
      grandTotal,
      paidAmount,
      dueAmount,
      previousDue,
      totalDue,
      changeAmount,
      payments: (s.payments as any) || [],
      saleType: s.saleType,
      emiAccountId: s.emiAccountId,
      status: s.status,
      salespersonId: s.salespersonId,
      salespersonName: s.salespersonName,
      notes: s.notes,
      metadata: (s as any).metadata || null,
      items: s.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        category: item.category,
        brand: (item as any).product?.brand || '',
        model: (item as any).product?.model || '',
        specs: (item as any).product?.specs || (item as any).specs || null,
        product: (item as any).product || null,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount),
        total: Number(item.total),
        warrantyMonths: item.warrantyMonths,
        isSerialized: item.isSerialized,
        serialNumbers: Array.isArray(item.serialNumbers) ? (item.serialNumbers as string[]) : [],
        description: (item as any).description || '',
        taxPercent: Number((item as any).taxPercent || 0),
        taxAmount: Number((item as any).taxAmount || 0),
      })),
    };
  });

  // Calculate live aggregate stats for dashboard
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    totalInvoices: totalCount,
    totalSalesVolume: formattedSales.reduce((acc, s) => acc + s.grandTotal, 0),
    totalPaidVolume: formattedSales.reduce((acc, s) => acc + s.paidAmount, 0),
    totalDueVolume: formattedSales.reduce((acc, s) => acc + s.dueAmount, 0),
    todayInvoices: formattedSales.filter((s) => new Date(s.createdAt) >= today).length,
    todaySales: formattedSales
      .filter((s) => new Date(s.createdAt) >= today)
      .reduce((acc, s) => acc + s.grandTotal, 0),
    paidCount: formattedSales.filter((s) => s.dueAmount === 0 && s.status !== 'CANCELLED').length,
    dueCount: formattedSales.filter((s) => s.dueAmount > 0 && s.status !== 'CANCELLED').length,
    emiCount: formattedSales.filter((s) => s.saleType === 'EMI').length,
    cancelledCount: formattedSales.filter((s) => s.status === 'CANCELLED' || s.status === 'VOID').length,
    returnedCount: formattedSales.filter((s) => s.status === 'RETURNED').length,
  };

  return NextResponse.json({
    success: true,
    data: formattedSales,
    total: totalCount,
    stats,
  });
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

    // Backend financial validation and calculation:
    let calculatedSubtotal = 0;
    const validatedItems = saleData.items.map((item) => {
      const lineUnit = Number(item.unitPrice);
      const lineQty = Number(item.quantity);
      const lineDisc = Number(item.discount || 0);
      const lineTotal = Math.max(0, lineUnit * lineQty - lineDisc);
      calculatedSubtotal += lineTotal;
      return {
        ...item,
        unitPrice: lineUnit,
        quantity: lineQty,
        discount: lineDisc,
        total: lineTotal,
      };
    });

    const overallDiscount = Number(saleData.overallDiscount || 0);
    const deliveryCharge = Number(saleData.deliveryCharge || 0);
    const serviceCharge = Number(saleData.serviceCharge || 0);
    const otherCharges = Number(saleData.otherCharges || 0);
    const vatPercent = Number(saleData.vatPercent || 0);

    const taxableAmount = Math.max(0, calculatedSubtotal - overallDiscount);
    const calculatedVat = vatPercent > 0
      ? Math.round((taxableAmount * vatPercent) / 100)
      : Number(saleData.vatAmount || 0);

    const calculatedGrandTotal = Math.max(
      0,
      taxableAmount + calculatedVat + deliveryCharge + serviceCharge + otherCharges
    );

    // Payments validation
    const paymentsList = saleData.payments || [];
    const totalPaidCalculated = paymentsList.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const paidAmount = saleData.paidAmount !== undefined ? Number(saleData.paidAmount) : totalPaidCalculated;
    const dueAmount = Math.max(0, calculatedGrandTotal - paidAmount);
    const changeAmount = Math.max(0, paidAmount - calculatedGrandTotal);

    // Determine invoice status
    let initialStatus = 'PAID';
    if (saleData.saleType === 'EMI') {
      initialStatus = 'EMI';
    } else if (dueAmount > 0 && paidAmount > 0) {
      initialStatus = 'PARTIALLY_PAID';
    } else if (dueAmount > 0 && paidAmount === 0) {
      initialStatus = 'DUE';
    } else {
      initialStatus = 'PAID';
    }

    // Execute within an ACID PostgreSQL transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate guaranteed-unique invoice number with collision prevention
      let invoiceNumber = saleData.invoiceNumber;
      const pos = await tx.posSettings.findUnique({ where: { id: 'main' } });
      const prefix = pos?.invoicePrefix || 'INV-2026-';
      let nextNum = pos?.nextInvoiceNumber || 1001;

      if (!invoiceNumber || (await tx.sale.findUnique({ where: { invoiceNumber } }))) {
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

      // Fetch customer for previous due calculation
      const customer = await tx.customer.findUnique({ where: { id: saleData.customerId } });
      const previousDue = Number(customer?.currentBalance || 0);
      const totalCustomerDue = previousDue + dueAmount;

      const saleId = 'sale-' + Date.now();

      // 2. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          id: saleId,
          invoiceNumber,
          customerId: saleData.customerId,
          customerName: saleData.customerName,
          customerPhone: saleData.customerPhone,
          customerEmail: saleData.customerEmail || customer?.email || null,
          customerType: saleData.customerType || 'RETAIL',
          billingAddress: saleData.billingAddress || customer?.address || null,
          shippingAddress: saleData.shippingAddress || saleData.billingAddress || customer?.address || null,
          branchId: saleData.branchId,
          date: new Date(),
          subtotal: new Prisma.Decimal(calculatedSubtotal),
          overallDiscount: new Prisma.Decimal(overallDiscount),
          vatAmount: new Prisma.Decimal(calculatedVat),
          vatPercent: new Prisma.Decimal(vatPercent),
          deliveryCharge: new Prisma.Decimal(deliveryCharge),
          serviceCharge: new Prisma.Decimal(serviceCharge),
          otherCharges: new Prisma.Decimal(otherCharges),
          grandTotal: new Prisma.Decimal(calculatedGrandTotal),
          paidAmount: new Prisma.Decimal(paidAmount),
          dueAmount: new Prisma.Decimal(dueAmount),
          previousDue: new Prisma.Decimal(previousDue),
          totalDue: new Prisma.Decimal(totalCustomerDue),
          changeAmount: new Prisma.Decimal(changeAmount),
          payments: paymentsList,
          saleType: saleData.saleType || 'REGULAR',
          status: initialStatus,
          salespersonId: user.id,
          salespersonName: user.name,
          notes: saleData.notes,
          metadata: saleData.metadata || null,
        },
      });

      // 3. Process Sale Items, Inventory & Serials
      for (const item of validatedItems) {
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
            description: item.description || null,
            taxPercent: new Prisma.Decimal(item.taxPercent || 0),
            taxAmount: new Prisma.Decimal(item.taxAmount || 0),
          },
        });

        // Get product to calculate stock and COGS
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productName} not found.`);
        }

        // Concurrency Guard: Validate stock in database transaction
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
              await tx.productSerial.upsert({
                where: { serialNumber: sn },
                update: {
                  status: 'SOLD',
                  productId: item.productId,
                  saleInvoiceId: sale.id,
                  saleDate: new Date(),
                  customerId: saleData.customerId,
                  warrantyStartDate: warrantyMonths > 0 ? warrantyStart : null,
                  warrantyEndDate: warrantyMonths > 0 ? warrantyEnd : null,
                },
                create: {
                  id: 'sn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                  serialNumber: sn,
                  productId: item.productId,
                  branchId: saleData.branchId,
                  status: 'SOLD',
                  saleInvoiceId: sale.id,
                  saleDate: new Date(),
                  customerId: saleData.customerId,
                  warrantyStartDate: warrantyMonths > 0 ? warrantyStart : null,
                  warrantyEndDate: warrantyMonths > 0 ? warrantyEnd : null,
                  purchaseCost: product.costPrice,
                },
              });
            }
          }
        }
      }

      // 4. Handle Laptop EMI Account if EMI Sale
      if (saleData.saleType === 'EMI' && emiPlanConfig) {
        const emiAccountId = 'emi-' + Date.now();
        const emiNumber = 'EMI-' + Date.now().toString().slice(-6);

        const primaryItem = validatedItems[0];
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
            laptopPrice: new Prisma.Decimal(calculatedGrandTotal),
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
      if (dueAmount > 0) {
        await tx.customer.update({
          where: { id: saleData.customerId },
          data: {
            currentBalance: { increment: new Prisma.Decimal(dueAmount) },
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
            debit: new Prisma.Decimal(dueAmount),
            credit: new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(totalCustomerDue),
          },
        });
      }

      // 6. Update Financial Accounts & Central Ledger (With Full Split / Mixed Payment Multi-Account Allocation)
      if (paidAmount > 0) {
        const splitPayments = Array.isArray(paymentsList) && paymentsList.length > 0
          ? paymentsList
          : [{ method: 'Cash', amount: paidAmount, accountId: paymentAccountId }];

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
          details: `Invoice ${invoiceNumber} created for ${saleData.customerName}. Total: ৳${calculatedGrandTotal}. Paid: ৳${paidAmount}. Due: ৳${dueAmount}. Status: ${initialStatus}`,
        },
      });

      // Fetch complete sale with its newly created items and customer details
      const fullSale = await tx.sale.findUnique({
        where: { id: sale.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          branch: true,
        },
      });

      return fullSale || sale;
    });

    // Asynchronously trigger customer SMS / WhatsApp digital receipt
    if (saleData.customerPhone) {
      sendNotification({
        recipientPhone: saleData.customerPhone,
        recipientName: saleData.customerName,
        channel: 'BOTH',
        customMessage: `NEED ELECTRO: Dear ${saleData.customerName}, your invoice ${result.invoiceNumber} has been generated. Total: ৳${Number(result.grandTotal).toLocaleString('en-IN')}, Paid: ৳${Number(result.paidAmount).toLocaleString('en-IN')}, Due: ৳${Number(result.dueAmount).toLocaleString('en-IN')}. Shop#5, MR Plaza, Kusumbag, Moulvibazar. Hotline: 01733-983752.`,
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
