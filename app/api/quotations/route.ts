// NEED ELECTRO ERP — Quotation Management Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission, authenticateRequest } from '@/lib/auth';
import { createQuotationSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  let user: any = await authenticateRequest(req);
  if (!user && process.env.NODE_ENV !== 'production') {
    user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  }

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const salespersonId = searchParams.get('salespersonId');
  const branchId = searchParams.get('branchId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const query = searchParams.get('query');
  const limit = Math.min(Number(searchParams.get('limit')) || 500, 1000);
  const offset = Number(searchParams.get('offset')) || 0;

  const where: any = {};

  if (branchId && branchId !== 'ALL') where.branchId = branchId;
  if (salespersonId && salespersonId !== 'ALL') where.salespersonId = salespersonId;

  // Status Filter
  if (status && status !== 'ALL') {
    where.status = status;
  }

  // Date Range Filter
  if (startDate || endDate) {
    where.quotationDate = {};
    if (startDate) {
      where.quotationDate.gte = new Date(startDate + 'T00:00:00.000Z');
    }
    if (endDate) {
      where.quotationDate.lte = new Date(endDate + 'T23:59:59.999Z');
    }
  }

  // Multi-field search
  if (query && query.trim()) {
    const q = query.trim();
    where.OR = [
      { quotationNumber: { contains: q, mode: 'insensitive' } },
      { customerName: { contains: q, mode: 'insensitive' } },
      { customerPhone: { contains: q } },
      { companyName: { contains: q, mode: 'insensitive' } },
      { referenceNumber: { contains: q, mode: 'insensitive' } },
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

  const [quotationsRaw, totalCount] = await Promise.all([
    prisma.quotation.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
        customer: true,
      },
      orderBy: { quotationDate: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.quotation.count({ where }),
  ]);

  // Check and update expired status dynamically without heavy background cron
  const now = new Date();
  const quotations = quotationsRaw.map((q) => {
    let currentStatus = q.status;
    const validUntilDate = new Date(q.validUntil);
    if (
      (currentStatus === 'DRAFT' || currentStatus === 'SENT') &&
      validUntilDate.getTime() < now.getTime()
    ) {
      currentStatus = 'EXPIRED';
    }

    return {
      id: q.id,
      quotationNumber: q.quotationNumber,
      referenceNumber: q.referenceNumber,
      customerId: q.customerId,
      customerName: q.customerName,
      companyName: q.companyName,
      customerPhone: q.customerPhone,
      customerEmail: q.customerEmail || q.customer?.email || '',
      billingAddress: q.billingAddress || q.customer?.address || '',
      deliveryAddress: q.deliveryAddress || '',
      customerSnapshot: q.customerSnapshot,
      branchId: q.branchId,
      quotationDate: q.quotationDate ? q.quotationDate.toISOString().split('T')[0] : '',
      validUntil: q.validUntil ? q.validUntil.toISOString().split('T')[0] : '',
      status: currentStatus,
      subtotal: Number(q.subtotal),
      discountTotal: Number(q.discountTotal),
      vatPercent: Number(q.vatPercent),
      vatAmount: Number(q.vatAmount),
      deliveryCharge: Number(q.deliveryCharge),
      serviceCharge: Number(q.serviceCharge),
      otherCharges: Number(q.otherCharges),
      grandTotal: Number(q.grandTotal),
      currency: q.currency,
      currencySymbol: q.currencySymbol,
      paymentTerms: q.paymentTerms,
      deliveryTerms: q.deliveryTerms,
      warrantyTerms: q.warrantyTerms,
      customerNotes: q.customerNotes,
      internalNotes: q.internalNotes,
      preparedById: q.preparedById,
      preparedByName: q.preparedByName,
      salespersonId: q.salespersonId,
      salespersonName: q.salespersonName,
      sentAt: q.sentAt ? q.sentAt.toISOString() : null,
      acceptedAt: q.acceptedAt ? q.acceptedAt.toISOString() : null,
      rejectedAt: q.rejectedAt ? q.rejectedAt.toISOString() : null,
      convertedAt: q.convertedAt ? q.convertedAt.toISOString() : null,
      convertedSalesOrderId: q.convertedSalesOrderId,
      convertedInvoiceNumber: q.convertedInvoiceNumber,
      statusHistory: q.statusHistory || [],
      metadata: q.metadata,
      createdAt: q.createdAt ? q.createdAt.toISOString() : '',
      updatedAt: q.updatedAt ? q.updatedAt.toISOString() : '',
      items: q.items.map((it) => ({
        id: it.id,
        quotationId: it.quotationId,
        productId: it.productId,
        productName: it.productName,
        sku: it.sku,
        category: it.category,
        brand: it.brand,
        model: it.model,
        description: it.description,
        unitOfMeasure: it.unitOfMeasure,
        catalogPriceSnapshot: Number(it.catalogPriceSnapshot),
        unitPrice: Number(it.unitPrice),
        quantity: it.quantity,
        discount: Number(it.discount),
        taxPercent: Number(it.taxPercent),
        taxAmount: Number(it.taxAmount),
        lineTotal: Number(it.lineTotal),
        warrantyMonths: it.warrantyMonths,
        specsSnapshot: it.specsSnapshot,
        productSnapshot: it.productSnapshot,
        sortOrder: it.sortOrder,
        product: it.product ? {
          id: it.product.id,
          name: it.product.name,
          sku: it.product.sku,
          currentStock: it.product.currentStock,
          retailPrice: Number(it.product.retailPrice),
        } : undefined,
      })),
    };
  });

  // Calculate metrics and analytics for quotations
  const totalCountAll = quotations.length;
  const draftQuotations = quotations.filter((q) => q.status === 'DRAFT');
  const sentQuotations = quotations.filter((q) => q.status === 'SENT');
  const acceptedQuotations = quotations.filter((q) => q.status === 'ACCEPTED');
  const convertedQuotations = quotations.filter((q) => q.status === 'CONVERTED');
  const rejectedQuotations = quotations.filter((q) => q.status === 'REJECTED');
  const expiredQuotations = quotations.filter((q) => q.status === 'EXPIRED');

  const totalQuotedValue = quotations.reduce((acc, q) => acc + q.grandTotal, 0);
  const issuedValue = [...sentQuotations, ...acceptedQuotations, ...convertedQuotations].reduce(
    (acc, q) => acc + q.grandTotal,
    0
  );
  const convertedValue = convertedQuotations.reduce((acc, q) => acc + q.grandTotal, 0);

  // Conversion rate: converted / eligible issued quotations
  const eligibleIssuedCount = sentQuotations.length + acceptedQuotations.length + convertedQuotations.length + rejectedQuotations.length + expiredQuotations.length;
  const conversionRate = eligibleIssuedCount > 0 ? (convertedQuotations.length / eligibleIssuedCount) * 100 : 0;

  const stats = {
    totalCount: totalCountAll,
    totalQuotedValue,
    issuedCount: sentQuotations.length + acceptedQuotations.length + convertedQuotations.length,
    issuedValue,
    draftCount: draftQuotations.length,
    sentCount: sentQuotations.length,
    acceptedCount: acceptedQuotations.length,
    convertedCount: convertedQuotations.length,
    convertedValue,
    rejectedCount: rejectedQuotations.length,
    expiredCount: expiredQuotations.length,
    conversionRate: Math.round(conversionRate * 10) / 10,
  };

  return NextResponse.json({
    success: true,
    data: quotations,
    total: totalCount,
    stats,
  });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const parsed = createQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Invalid quotation data' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Fetch product details from database for snapshots and verification
    const productIds = data.items
      .map((i) => i.productId)
      .filter((id): id is string => Boolean(id));

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Authoritative Server-side Calculations
    let calculatedSubtotal = 0;
    const validatedItems = data.items.map((item, idx) => {
      const dbProd = item.productId ? productMap.get(item.productId) : null;

      const unitPrice = Number(item.unitPrice);
      const quantity = Math.max(1, Number(item.quantity));
      const discount = Math.max(0, Number(item.discount || 0));
      const lineTotal = Math.max(0, unitPrice * quantity - discount);
      calculatedSubtotal += lineTotal;

      const catalogPrice = dbProd ? Number(dbProd.retailPrice) : unitPrice;

      return {
        id: 'qti-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7) + '-' + idx,
        productId: item.productId || null,
        productName: item.productName || dbProd?.name || 'Item',
        sku: item.sku || dbProd?.sku || 'SKU',
        category: item.category || dbProd?.category || null,
        brand: item.brand || dbProd?.brand || null,
        model: item.model || dbProd?.model || null,
        description: item.description || dbProd?.description || null,
        unitOfMeasure: item.unitOfMeasure || 'Unit',
        catalogPriceSnapshot: new Prisma.Decimal(catalogPrice),
        unitPrice: new Prisma.Decimal(unitPrice),
        quantity,
        discount: new Prisma.Decimal(discount),
        taxPercent: new Prisma.Decimal(item.taxPercent || 0),
        taxAmount: new Prisma.Decimal(item.taxAmount || 0),
        lineTotal: new Prisma.Decimal(lineTotal),
        warrantyMonths: item.warrantyMonths || dbProd?.warrantyPeriodMonths || 0,
        specsSnapshot: item.specsSnapshot || (dbProd?.specs ? dbProd.specs : null),
        productSnapshot: {
          name: dbProd?.name || item.productName,
          sku: dbProd?.sku || item.sku,
          category: dbProd?.category || item.category,
          brand: dbProd?.brand || item.brand,
          model: dbProd?.model || item.model,
          imageUrl: dbProd?.imageUrl || null,
          currentStockAtQuotation: dbProd?.currentStock ?? null,
        },
        sortOrder: idx,
      };
    });

    const discountTotal = Number(data.discountTotal || 0);
    const deliveryCharge = Number(data.deliveryCharge || 0);
    const serviceCharge = Number(data.serviceCharge || 0);
    const otherCharges = Number(data.otherCharges || 0);
    const vatPercent = Number(data.vatPercent || 0);

    const taxableAmount = Math.max(0, calculatedSubtotal - discountTotal);
    const calculatedVat = vatPercent > 0
      ? Math.round((taxableAmount * vatPercent) / 100)
      : Number(data.vatAmount || 0);

    const calculatedGrandTotal = Math.max(
      0,
      taxableAmount + calculatedVat + deliveryCharge + serviceCharge + otherCharges
    );

    // Fetch customer profile snapshot if customerId provided
    let customerSnapshot: any = null;
    if (data.customerId) {
      const dbCust = await prisma.customer.findUnique({ where: { id: data.customerId } });
      if (dbCust) {
        customerSnapshot = {
          id: dbCust.id,
          customerId: dbCust.customerId,
          name: dbCust.name,
          phone: dbCust.phone,
          email: dbCust.email,
          address: dbCust.address,
        };
      }
    }

    const quotationId = 'quot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date();
    const quotationDate = data.quotationDate ? new Date(data.quotationDate) : now;
    const validUntilDate = new Date(data.validUntil);

    // Run within ACID transaction for collision-free sequential quotation number
    const quotation = await prisma.$transaction(async (tx) => {
      let qtnNumber = data.quotationNumber;
      const currentYear = quotationDate.getFullYear();
      const prefix = `NE-QTN-${currentYear}-`;

      if (!qtnNumber || (await tx.quotation.findUnique({ where: { quotationNumber: qtnNumber } }))) {
        // Find highest existing quotation number for current year
        const recentQuotations = await tx.quotation.findMany({
          where: { quotationNumber: { startsWith: prefix } },
          select: { quotationNumber: true },
          take: 500,
          orderBy: { quotationNumber: 'desc' },
        });

        let highestNum = 0;
        for (const q of recentQuotations) {
          const numPart = q.quotationNumber.replace(prefix, '');
          const parsedNum = parseInt(numPart, 10);
          if (!isNaN(parsedNum) && parsedNum > highestNum) {
            highestNum = parsedNum;
          }
        }

        let nextNum = highestNum + 1;
        let candidate = `${prefix}${String(nextNum).padStart(6, '0')}`;
        while (await tx.quotation.findUnique({ where: { quotationNumber: candidate } })) {
          nextNum++;
          candidate = `${prefix}${String(nextNum).padStart(6, '0')}`;
        }
        qtnNumber = candidate;
      }

      const initialStatus = data.status || 'DRAFT';
      const initialHistory = [
        {
          status: initialStatus,
          timestamp: now.toISOString(),
          updatedBy: user.name || 'Sales Staff',
          notes: 'Quotation created',
        },
      ];

      // ABSOLUTE INVENTORY PROTECTION:
      // Quotation creation creates ONLY Quotation and QuotationItem records.
      // It does NOT decrement stock, does NOT create InventoryTransaction,
      // does NOT create Sale, does NOT create LedgerEntry, does NOT record payments.
      const created = await tx.quotation.create({
        data: {
          id: quotationId,
          quotationNumber: qtnNumber,
          referenceNumber: data.referenceNumber || null,
          customerId: data.customerId || null,
          customerName: data.customerName,
          companyName: data.companyName || null,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          billingAddress: data.billingAddress || null,
          deliveryAddress: data.deliveryAddress || null,
          customerSnapshot: customerSnapshot || null,
          branchId: data.branchId || null,
          quotationDate,
          validUntil: validUntilDate,
          status: initialStatus,
          subtotal: new Prisma.Decimal(calculatedSubtotal),
          discountTotal: new Prisma.Decimal(discountTotal),
          vatPercent: new Prisma.Decimal(vatPercent),
          vatAmount: new Prisma.Decimal(calculatedVat),
          deliveryCharge: new Prisma.Decimal(deliveryCharge),
          serviceCharge: new Prisma.Decimal(serviceCharge),
          otherCharges: new Prisma.Decimal(otherCharges),
          grandTotal: new Prisma.Decimal(calculatedGrandTotal),
          currency: 'BDT',
          currencySymbol: '৳',
          paymentTerms: data.paymentTerms || 'Full payment upon confirmed order placement.',
          deliveryTerms: data.deliveryTerms || 'Showroom collection or scheduled courier delivery.',
          warrantyTerms: data.warrantyTerms || 'Official NEED ELECTRO product warranty terms apply.',
          customerNotes: data.customerNotes || null,
          internalNotes: data.internalNotes || null,
          preparedById: user.id,
          preparedByName: user.name,
          salespersonId: data.salespersonId || user.id,
          salespersonName: data.salespersonName || user.name,
          sentAt: initialStatus === 'SENT' ? now : null,
          statusHistory: initialHistory,
          items: {
            create: validatedItems,
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          timestamp: now,
          userId: user.id,
          userName: user.name || 'Sales Staff',
          action: 'CREATE',
          module: 'quotations',
          recordId: created.id,
          details: `Created sales quotation ${qtnNumber} for customer ${data.customerName} with total ৳${calculatedGrandTotal.toLocaleString()}`,
        },
      });

      return created;
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} successfully generated.`,
      data: quotation,
    });
  } catch (err: any) {
    console.error('Error creating quotation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create quotation' },
      { status: 500 }
    );
  }
}
