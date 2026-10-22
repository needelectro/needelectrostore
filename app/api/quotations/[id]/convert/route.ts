// NEED ELECTRO ERP — Quotation to Sales Order Conversion Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { id } = params;

  // Retrieve quotation with its itemized lines
  const quotation = await prisma.quotation.findFirst({
    where: {
      OR: [{ id }, { quotationNumber: id }],
    },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!quotation) {
    return NextResponse.json({ success: false, error: 'Quotation not found' }, { status: 404 });
  }

  // 1. Validate status & prevent duplicate conversions
  if (quotation.status === 'CONVERTED' || quotation.convertedSalesOrderId) {
    return NextResponse.json(
      {
        success: false,
        error: `Quotation ${quotation.quotationNumber} has already been converted into invoice ${quotation.convertedInvoiceNumber || quotation.convertedSalesOrderId}. Duplicate conversions are prevented.`,
      },
      { status: 400 }
    );
  }

  if (quotation.status === 'REJECTED') {
    return NextResponse.json(
      {
        success: false,
        error: `Quotation ${quotation.quotationNumber} is marked as REJECTED. Re-open or adjust before converting.`,
      },
      { status: 400 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { branchIdOverride, paymentMethod, paidAmountInput, paymentAccountId, notes } = body;

    const branchId = branchIdOverride || quotation.branchId || 'DHK-MAIN';

    // Verify branch exists, fallback to first available branch if not
    const branch = await prisma.branch.findFirst({
      where: {
        OR: [{ id: branchId }, { active: true }],
      },
    });
    const finalBranchId = branch?.id || branchId;

    // 2. Resolve Customer record (reuse existing or create new customer if needed)
    let customerId = quotation.customerId;
    if (!customerId) {
      let existingCustomer = await prisma.customer.findFirst({
        where: { phone: quotation.customerPhone },
      });

      if (!existingCustomer) {
        const custCount = await prisma.customer.count();
        existingCustomer = await prisma.customer.create({
          data: {
            id: 'cust-' + Date.now(),
            customerId: `CUST-${1000 + custCount + 1}`,
            name: quotation.customerName,
            phone: quotation.customerPhone,
            email: quotation.customerEmail || null,
            address: quotation.billingAddress || null,
            nid: 'N/A',
            creditLimit: new Prisma.Decimal(0),
            currentBalance: new Prisma.Decimal(0),
          },
        });
      }
      customerId = existingCustomer.id;
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer record could not be resolved.' }, { status: 400 });
    }

    // 3. Check stock availability for all quotation items that link to a real product
    const productIds = quotation.items
      .map((i) => i.productId)
      .filter((pid): pid is string => Boolean(pid));

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check if any product is out of stock or insufficient
    const stockShortages: string[] = [];
    for (const item of quotation.items) {
      if (item.productId) {
        const product = productMap.get(item.productId);
        if (!product) {
          stockShortages.push(`Product ${item.productName} (SKU: ${item.sku}) no longer exists in master catalog.`);
        } else if (product.currentStock < item.quantity) {
          stockShortages.push(
            `Insufficient stock for ${item.productName}. Required: ${item.quantity}, Current stock: ${product.currentStock}`
          );
        }
      }
    }

    // If body didn't explicitly confirm zero-stock override, and there are shortages, warn user
    if (stockShortages.length > 0 && !body.allowStockOverride) {
      return NextResponse.json(
        {
          success: false,
          error: `Stock availability check failed:\n${stockShortages.join('\n')}`,
          requiresConfirmation: true,
          shortages: stockShortages,
        },
        { status: 400 }
      );
    }

    const now = new Date();

    // 4. Atomic PostgreSQL Transaction: Convert Quotation -> Create Sale & Deduct Stock
    const conversionResult = await prisma.$transaction(async (tx) => {
      // Concurrency check inside transaction to guarantee duplicate prevention
      const freshQuotation = await tx.quotation.findUnique({
        where: { id: quotation.id },
      });
      if (freshQuotation?.status === 'CONVERTED' || freshQuotation?.convertedSalesOrderId) {
        throw new Error('This quotation was already converted by another user in a concurrent session.');
      }

      // Generate invoice number
      const pos = await tx.posSettings.findUnique({ where: { id: 'main' } });
      const prefix = pos?.invoicePrefix || 'INV-2026-';
      let nextNum = pos?.nextInvoiceNumber || 1001;

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
      let candidateInvoice = `${prefix}${nextNum}`;
      while (await tx.sale.findUnique({ where: { invoiceNumber: candidateInvoice } })) {
        nextNum++;
        candidateInvoice = `${prefix}${nextNum}`;
      }

      const invoiceNumber = candidateInvoice;

      await tx.posSettings.update({
        where: { id: 'main' },
        data: { nextInvoiceNumber: nextNum + 1 },
      });

      const grandTotal = Number(quotation.grandTotal);
      const paidAmount = paidAmountInput !== undefined ? Math.max(0, Number(paidAmountInput)) : 0;
      const dueAmount = Math.max(0, grandTotal - paidAmount);
      const previousDue = Number(customer.currentBalance || 0);
      const totalDue = previousDue + dueAmount;

      let saleStatus = 'PAID';
      if (dueAmount > 0 && paidAmount > 0) {
        saleStatus = 'PARTIALLY_PAID';
      } else if (dueAmount > 0) {
        saleStatus = 'DUE';
      }

      const saleId = 'sale-' + Date.now();

      // Create Sale record
      const sale = await tx.sale.create({
        data: {
          id: saleId,
          invoiceNumber,
          customerId: customer.id,
          customerName: quotation.customerName,
          customerPhone: quotation.customerPhone,
          customerEmail: quotation.customerEmail || customer.email || null,
          customerType: quotation.companyName ? 'CORPORATE' : 'RETAIL',
          billingAddress: quotation.billingAddress || customer.address || null,
          shippingAddress: quotation.deliveryAddress || quotation.billingAddress || customer.address || null,
          branchId: finalBranchId,
          date: now,
          subtotal: quotation.subtotal,
          overallDiscount: quotation.discountTotal,
          vatAmount: quotation.vatAmount,
          vatPercent: quotation.vatPercent,
          deliveryCharge: quotation.deliveryCharge,
          serviceCharge: quotation.serviceCharge,
          otherCharges: quotation.otherCharges,
          grandTotal: quotation.grandTotal,
          paidAmount: new Prisma.Decimal(paidAmount),
          dueAmount: new Prisma.Decimal(dueAmount),
          previousDue: new Prisma.Decimal(previousDue),
          totalDue: new Prisma.Decimal(totalDue),
          changeAmount: new Prisma.Decimal(0),
          payments: paidAmount > 0 ? [{ method: paymentMethod || 'Cash', amount: paidAmount, accountId: paymentAccountId }] : [],
          saleType: 'REGULAR',
          status: saleStatus,
          salespersonId: user.id,
          salespersonName: user.name,
          notes: notes || `Converted from sales quotation ${quotation.quotationNumber}. ${quotation.customerNotes || ''}`.trim(),
          metadata: {
            sourceQuotationId: quotation.id,
            sourceQuotationNumber: quotation.quotationNumber,
            convertedAt: now.toISOString(),
          },
          quotationId: quotation.id,
        },
      });

      // Create SaleItems & Process stock deduction for actual sale fulfillment
      for (const item of quotation.items) {
        const saleItemId = 'si-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        await tx.saleItem.create({
          data: {
            id: saleItemId,
            saleId: sale.id,
            productId: item.productId,
            productName: item.productName,
            sku: item.sku,
            category: item.category || 'General',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            total: item.lineTotal,
            warrantyMonths: item.warrantyMonths || 0,
            description: item.description,
            taxPercent: item.taxPercent,
            taxAmount: item.taxAmount,
          },
        });

        // Stock deduction on confirmed Sale
        if (item.productId) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (product) {
            const openingStock = product.currentStock;
            const closingStock = Math.max(0, openingStock - item.quantity);

            await tx.product.update({
              where: { id: item.productId },
              data: {
                currentStock: { decrement: item.quantity },
              },
            });

            // Inventory transaction record for the newly converted sale order
            await tx.inventoryTransaction.create({
              data: {
                id: 'itx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                transactionNumber: 'ITX-' + Date.now().toString().slice(-6),
                date: now,
                type: 'SALE_OUT',
                productId: item.productId,
                productName: item.productName,
                branchId: finalBranchId,
                quantity: item.quantity,
                unitCost: product.costPrice,
                totalValue: new Prisma.Decimal(Number(product.costPrice) * item.quantity),
                openingStock,
                closingStock,
                referenceType: 'SALE',
                referenceId: sale.id,
                notes: `Sold via conversion from quotation ${quotation.quotationNumber} on invoice ${invoiceNumber}`,
                createdBy: user.name || 'Sales Staff',
              },
            });
          }
        }
      }

      // Update customer balance if due amount remains
      if (dueAmount > 0) {
        await tx.customer.update({
          where: { id: customer.id },
          data: {
            currentBalance: { increment: dueAmount },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            date: now,
            partyType: 'CUSTOMER',
            partyId: customer.id,
            referenceType: 'SALE',
            referenceNumber: invoiceNumber,
            description: `Converted from quotation ${quotation.quotationNumber} (Invoice ${invoiceNumber})`,
            debit: new Prisma.Decimal(grandTotal),
            credit: new Prisma.Decimal(paidAmount),
            runningBalance: new Prisma.Decimal(totalDue),
            status: 'COMPLETED',
            performedBy: user.name,
          },
        });
      }

      // Append conversion to quotation status history
      const updatedHistory = Array.isArray(quotation.statusHistory)
        ? [...(quotation.statusHistory as any[])]
        : [];
      updatedHistory.push({
        status: 'CONVERTED',
        timestamp: now.toISOString(),
        updatedBy: user.name || 'Sales Staff',
        notes: `Converted to Sales Invoice #${invoiceNumber}`,
      });

      // Update Quotation status to CONVERTED and link to resulting Sale
      const updatedQuotation = await tx.quotation.update({
        where: { id: quotation.id },
        data: {
          status: 'CONVERTED',
          convertedAt: now,
          convertedSalesOrderId: sale.id,
          convertedInvoiceNumber: invoiceNumber,
          statusHistory: updatedHistory,
        },
      });

      // Audit Log for conversion
      await tx.auditLog.create({
        data: {
          id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
          timestamp: now,
          userId: user.id,
          userName: user.name || 'Sales Staff',
          action: 'CONVERT',
          module: 'quotations',
          recordId: quotation.id,
          details: `Converted sales quotation ${quotation.quotationNumber} to sales invoice ${invoiceNumber} for ৳${grandTotal.toLocaleString()}`,
        },
      });

      return {
        sale,
        quotation: updatedQuotation,
      };
    });

    return NextResponse.json({
      success: true,
      message: `Quotation ${quotation.quotationNumber} successfully converted to Sales Invoice ${conversionResult.sale.invoiceNumber}!`,
      sale: conversionResult.sale,
      quotation: conversionResult.quotation,
    });
  } catch (err: any) {
    console.error('Conversion error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to convert quotation into sales order.' },
      { status: 500 }
    );
  }
}
