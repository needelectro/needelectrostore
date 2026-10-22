// NEED ELECTRO ERP — Quotation Individual Record Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, authenticateRequest } from '@/lib/auth';
import { createQuotationSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let user: any = await authenticateRequest(req);
  if (!user && process.env.NODE_ENV !== 'production') {
    user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  }

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const { id } = params;

  const quotation = await prisma.quotation.findFirst({
    where: {
      OR: [
        { id },
        { quotationNumber: id },
      ],
    },
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      customer: true,
    },
  });

  if (!quotation) {
    return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }

  // If quotation is converted, look up the linked Sale
  let linkedSale: any = null;
  if (quotation.convertedSalesOrderId) {
    linkedSale = await prisma.sale.findUnique({
      where: { id: quotation.convertedSalesOrderId },
      select: {
        id: true,
        invoiceNumber: true,
        date: true,
        grandTotal: true,
        status: true,
        paidAmount: true,
        dueAmount: true,
      },
    });
  }

  // Dynamic expiry check
  const now = new Date();
  let currentStatus = quotation.status;
  if (
    (currentStatus === 'DRAFT' || currentStatus === 'SENT') &&
    new Date(quotation.validUntil).getTime() < now.getTime()
  ) {
    currentStatus = 'EXPIRED';
  }

  return NextResponse.json({
    success: true,
    data: {
      ...quotation,
      status: currentStatus,
      subtotal: Number(quotation.subtotal),
      discountTotal: Number(quotation.discountTotal),
      vatPercent: Number(quotation.vatPercent),
      vatAmount: Number(quotation.vatAmount),
      deliveryCharge: Number(quotation.deliveryCharge),
      serviceCharge: Number(quotation.serviceCharge),
      otherCharges: Number(quotation.otherCharges),
      grandTotal: Number(quotation.grandTotal),
      items: quotation.items.map((it) => ({
        ...it,
        catalogPriceSnapshot: Number(it.catalogPriceSnapshot),
        unitPrice: Number(it.unitPrice),
        discount: Number(it.discount),
        taxPercent: Number(it.taxPercent),
        taxAmount: Number(it.taxAmount),
        lineTotal: Number(it.lineTotal),
        product: it.product ? {
          id: it.product.id,
          name: it.product.name,
          sku: it.product.sku,
          currentStock: it.product.currentStock,
          retailPrice: Number(it.product.retailPrice),
        } : undefined,
      })),
      linkedSale,
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = params;

  const existing = await prisma.quotation.findFirst({
    where: {
      OR: [{ id }, { quotationNumber: id }],
    },
    include: { items: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }

  if (existing.status === 'CONVERTED' || existing.convertedSalesOrderId) {
    return NextResponse.json(
      { success: false, error: 'Converted quotations cannot be modified because a sales order has already been created from this quotation.' },
      { status: 400 }
    );
  }

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

    // Fetch product details for snapshots
    const productIds = data.items
      .map((i) => i.productId)
      .filter((pid): pid is string => Boolean(pid));

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
        quotationId: existing.id,
        productId: item.productId || null,
        productName: item.productName || dbProd?.name || 'Item',
        sku: item.sku || dbProd?.sku || 'SKU',
        category: item.category || dbProd?.category || null,
        brand: item.brand || dbProd?.brand || null,
        model: item.model || dbProd?.model || null,
        description: item.description || null,
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

    const now = new Date();
    const validUntilDate = new Date(data.validUntil);

    const newStatus = data.status || existing.status;
    const updatedHistory = Array.isArray(existing.statusHistory)
      ? [...(existing.statusHistory as any[])]
      : [];
    updatedHistory.push({
      status: newStatus,
      timestamp: now.toISOString(),
      updatedBy: user.name || 'Sales Staff',
      notes: `Quotation modified (Status: ${newStatus}, Total: ৳${calculatedGrandTotal.toLocaleString()})`,
    });

    const updated = await prisma.$transaction(async (tx) => {
      // Delete old items and recreate new
      await tx.quotationItem.deleteMany({
        where: { quotationId: existing.id },
      });

      await tx.quotationItem.createMany({
        data: validatedItems,
      });

      const res = await tx.quotation.update({
        where: { id: existing.id },
        data: {
          referenceNumber: data.referenceNumber || null,
          customerId: data.customerId || null,
          customerName: data.customerName,
          companyName: data.companyName || null,
          customerPhone: data.customerPhone,
          customerEmail: data.customerEmail || null,
          billingAddress: data.billingAddress || null,
          deliveryAddress: data.deliveryAddress || null,
          branchId: data.branchId || existing.branchId,
          quotationDate: data.quotationDate ? new Date(data.quotationDate) : existing.quotationDate,
          validUntil: validUntilDate,
          status: newStatus,
          subtotal: new Prisma.Decimal(calculatedSubtotal),
          discountTotal: new Prisma.Decimal(discountTotal),
          vatPercent: new Prisma.Decimal(vatPercent),
          vatAmount: new Prisma.Decimal(calculatedVat),
          deliveryCharge: new Prisma.Decimal(deliveryCharge),
          serviceCharge: new Prisma.Decimal(serviceCharge),
          otherCharges: new Prisma.Decimal(otherCharges),
          grandTotal: new Prisma.Decimal(calculatedGrandTotal),
          paymentTerms: data.paymentTerms || existing.paymentTerms,
          deliveryTerms: data.deliveryTerms || existing.deliveryTerms,
          warrantyTerms: data.warrantyTerms || existing.warrantyTerms,
          customerNotes: data.customerNotes || null,
          internalNotes: data.internalNotes || null,
          salespersonId: data.salespersonId || existing.salespersonId,
          salespersonName: data.salespersonName || existing.salespersonName,
          statusHistory: updatedHistory,
        },
        include: {
          items: true,
          customer: true,
        },
      });

      await tx.auditLog.create({
        data: {
          id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          timestamp: now,
          userId: user.id,
          userName: user.name || 'Sales Staff',
          action: 'UPDATE',
          module: 'quotations',
          recordId: existing.id,
          details: `Updated sales quotation ${existing.quotationNumber}. New total: ৳${calculatedGrandTotal.toLocaleString()}`,
        },
      });

      return res;
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${existing.quotationNumber} updated successfully.`,
      data: updated,
    });
  } catch (err: any) {
    console.error('Error updating quotation:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update quotation' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = params;

  const quotation = await prisma.quotation.findFirst({
    where: {
      OR: [{ id }, { quotationNumber: id }],
    },
  });

  if (!quotation) {
    return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }

  try {
    const { status, notes } = await req.json();

    const validStatuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status transition: ${status}. To convert to order, use the conversion endpoint.` },
        { status: 400 }
      );
    }

    if (quotation.status === 'CONVERTED') {
      return NextResponse.json(
        { success: false, error: 'Cannot alter status of a converted quotation.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const updatedHistory = Array.isArray(quotation.statusHistory)
      ? [...(quotation.statusHistory as any[])]
      : [];
    updatedHistory.push({
      status,
      timestamp: now.toISOString(),
      updatedBy: user.name || 'Sales Staff',
      notes: notes || `Status changed to ${status}`,
    });

    const updateData: any = {
      status,
      statusHistory: updatedHistory,
    };

    if (status === 'SENT' && !quotation.sentAt) {
      updateData.sentAt = now;
    } else if (status === 'ACCEPTED' && !quotation.acceptedAt) {
      updateData.acceptedAt = now;
    } else if (status === 'REJECTED' && !quotation.rejectedAt) {
      updateData.rejectedAt = now;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.quotation.update({
        where: { id: quotation.id },
        data: updateData,
        include: { items: true, customer: true },
      });

      await tx.auditLog.create({
        data: {
          id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          timestamp: now,
          userId: user.id,
          userName: user.name || 'Sales Staff',
          action: 'STATUS_CHANGE',
          module: 'quotations',
          recordId: quotation.id,
          details: `Changed status of quotation ${quotation.quotationNumber} from ${quotation.status} to ${status}. Notes: ${notes || 'None'}`,
        },
      });

      return res;
    });

    return NextResponse.json({
      success: true,
      message: `Quotation status updated to ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update quotation status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = params;

  const quotation = await prisma.quotation.findFirst({
    where: {
      OR: [{ id }, { quotationNumber: id }],
    },
  });

  if (!quotation) {
    return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }

  if (quotation.status === 'CONVERTED') {
    return NextResponse.json(
      { success: false, error: 'Cannot delete or cancel a converted quotation.' },
      { status: 400 }
    );
  }

  const now = new Date();

  // If quotation was never issued (DRAFT) and user is SUPER_ADMIN, allow removal or mark REJECTED/CANCELLED
  if (quotation.status === 'DRAFT' && user.role === 'SUPER_ADMIN') {
    await prisma.quotation.delete({ where: { id: quotation.id } });
    await prisma.auditLog.create({
      data: {
        id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        timestamp: now,
        userId: user.id,
        userName: user.name || 'Sales Staff',
        action: 'DELETE',
        module: 'quotations',
        recordId: quotation.id,
        details: `Deleted draft quotation ${quotation.quotationNumber}`,
      },
    });
    return NextResponse.json({ success: true, message: 'Draft quotation deleted.' });
  }

  // Otherwise, mark as REJECTED to preserve audit trail
  const updatedHistory = Array.isArray(quotation.statusHistory)
    ? [...(quotation.statusHistory as any[])]
    : [];
  updatedHistory.push({
    status: 'REJECTED',
    timestamp: now.toISOString(),
    updatedBy: user.name || 'Sales Staff',
    notes: 'Quotation cancelled/archived',
  });

  await prisma.quotation.update({
    where: { id: quotation.id },
    data: {
      status: 'REJECTED',
      rejectedAt: now,
      statusHistory: updatedHistory,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: now,
      userId: user.id,
      userName: user.name || 'Sales Staff',
      action: 'CANCEL',
      module: 'quotations',
      recordId: quotation.id,
      details: `Cancelled quotation ${quotation.quotationNumber}`,
    },
  });

  return NextResponse.json({ success: true, message: 'Quotation archived as cancelled.' });
}
