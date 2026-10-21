// NEED ELECTRO ERP — Generate Authoritative Sales Invoice & Deduct Physical Inventory for Website Order
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'sales', 'create') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const allowZeroStockOverride = Boolean(body.allowZeroStockOverride);

    // 1. Locate WebsiteOrder
    const order = await prisma.websiteOrder.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Prevent accidental duplicate invoice creation
    if (order.saleInvoiceId) {
      const existingSale = await prisma.sale.findUnique({
        where: { id: order.saleInvoiceId },
      });
      return NextResponse.json({
        success: false,
        error: `Order ${order.orderNumber} already has an official ERP invoice (${existingSale?.invoiceNumber || order.saleInvoiceId}). Duplicate invoice prevented.`,
        alreadyInvoiced: true,
        saleInvoiceId: order.saleInvoiceId,
        invoiceNumber: existingSale?.invoiceNumber,
      }, { status: 409 });
    }

    if (order.orderStatus === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: 'Cannot generate invoice for a cancelled order.',
      }, { status: 400 });
    }

    const items = (order.items as any[]) || [];
    if (items.length === 0) {
      return NextResponse.json({ success: false, error: 'Order contains no products.' }, { status: 400 });
    }

    // 3. Inspect Physical Inventory Availability
    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const missingProducts: Array<{ name: string; sku: string; currentStock: number; requested: number }> = [];
    for (const item of items) {
      const prod = dbProducts.find(p => p.id === item.productId);
      if (!prod) {
        return NextResponse.json({
          success: false,
          error: `Product ${item.name} (${item.sku}) was not found in catalog.`,
        }, { status: 400 });
      }
      if (prod.currentStock < item.quantity) {
        missingProducts.push({
          name: prod.name,
          sku: prod.sku,
          currentStock: prod.currentStock,
          requested: item.quantity,
        });
      }
    }

    if (missingProducts.length > 0 && !allowZeroStockOverride) {
      return NextResponse.json({
        success: false,
        requiresProcurement: true,
        missingProducts,
        error: `Insufficient physical warehouse stock to fulfill this order. Missing products require procurement/receiving before billing: ${missingProducts.map(m => `${m.name} (Stock: ${m.currentStock}, Needed: ${m.requested})`).join(', ')}. Pass allowZeroStockOverride to force dispatch.`,
      }, { status: 422 });
    }

    // 4. Resolve Branch
    const branch = await prisma.branch.findFirst({
      where: { active: true },
      orderBy: { isWarehouse: 'asc' },
    });
    const branchId = user.branchId || branch?.id || 'branch-main-1';

    // 5. Generate Next Invoice Number Atomically
    const posSettings = await prisma.posSettings.findUnique({ where: { id: 'main' } }).catch(() => null);
    const prefix = posSettings?.invoicePrefix || 'INV-2026-';
    const nextNum = posSettings?.nextInvoiceNumber || (Math.floor(1000 + Math.random() * 9000));
    const invoiceNumber = `${prefix}${nextNum}`;

    if (posSettings) {
      await prisma.posSettings.update({
        where: { id: 'main' },
        data: { nextInvoiceNumber: { increment: 1 } },
      }).catch(e => console.warn('Increment nextInvoiceNumber error:', e));
    }

    const saleId = `sale-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 6. Atomic Invoicing & Physical Inventory Deduction
    const result = await prisma.$transaction(async (tx) => {
      // Create Authoritative ERP Sale Invoice
      const sale = await tx.sale.create({
        data: {
          id: saleId,
          invoiceNumber,
          customerId: order.customerId,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
          customerType: 'WEBSITE_ORDER',
          branchId,
          subtotal: order.subtotal,
          deliveryCharge: order.deliveryCharge,
          overallDiscount: order.discount,
          grandTotal: order.total,
          paidAmount: order.paymentStatus === 'PAID' ? order.total : new Prisma.Decimal(0),
          dueAmount: order.paymentStatus === 'PAID' ? new Prisma.Decimal(0) : order.total,
          payments: [
            {
              method: order.paymentMethod,
              amount: order.paymentStatus === 'PAID' ? Number(order.total) : 0,
              ref: `WEBSITE_${order.orderNumber}`,
              account: order.paymentStatus === 'PAID' ? 'CASH' : 'UNCOLLECTED_COD',
            },
          ],
          saleType: 'REGULAR',
          status: order.paymentStatus === 'PAID' ? 'COMPLETED' : 'PENDING',
          billingAddress: `${order.deliveryAddress}, ${order.district}`,
          shippingAddress: `${order.deliveryAddress}, ${order.district}`,
          notes: `Official Invoice generated for Website Order ${order.orderNumber}. Delivery: ${order.district}. ${order.deliveryNotes || ''}`,
          metadata: {
            source: 'WEBSITE',
            websiteOrderId: order.id,
            orderNumber: order.orderNumber,
            district: order.district,
            invoicedBy: user.name,
            invoicedAt: new Date().toISOString(),
          },
        },
      });

      // Create SaleItems and Atomically Deduct Stock
      for (const item of items) {
        const prod = dbProducts.find(p => p.id === item.productId)!;

        await tx.saleItem.create({
          data: {
            id: 'sitem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            saleId: sale.id,
            productId: item.productId,
            productName: item.name,
            sku: item.sku,
            category: item.category || 'General',
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.price),
            discount: new Prisma.Decimal(0),
            total: new Prisma.Decimal(item.total || (item.price * item.quantity)),
            warrantyMonths: item.warrantyMonths || 0,
            isSerialized: Boolean(item.isSerialized),
          },
        });

        const openingStock = prod.currentStock;
        const closingStock = Math.max(0, openingStock - item.quantity);

        // Deduct physical inventory
        await tx.product.update({
          where: { id: item.productId },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        // Record Authoritative Inventory Transaction (SALE_OUT)
        await tx.inventoryTransaction.create({
          data: {
            id: 'itx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            transactionNumber: 'ITX-' + Date.now().toString().slice(-6),
            date: new Date(),
            type: 'SALE_OUT',
            productId: item.productId,
            productName: item.name,
            branchId,
            quantity: item.quantity,
            unitCost: prod.costPrice,
            totalValue: new Prisma.Decimal(Number(prod.costPrice) * item.quantity),
            openingStock,
            closingStock,
            referenceType: 'SALE',
            referenceId: sale.id,
            notes: `Stock deducted on Invoice ${invoiceNumber} for Website Order ${order.orderNumber}`,
            createdBy: user.name,
          },
        });
      }

      // Link Sale to WebsiteOrder and advance status
      const updatedOrder = await tx.websiteOrder.update({
        where: { id: order.id },
        data: {
          saleInvoiceId: sale.id,
          orderStatus: order.orderStatus === 'PENDING' ? 'CONFIRMED' : order.orderStatus,
          fulfillmentStatus: 'PACKED',
          updatedAt: new Date(),
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'ORDER_INVOICE_GENERATED',
          module: 'SALES',
          recordId: order.id,
          details: `Generated ERP Sales Invoice ${invoiceNumber} for Order ${order.orderNumber}. Inventory deducted atomically.`,
        },
      });

      return { sale, updatedOrder };
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoiceNumber} generated successfully and physical inventory updated.`,
      invoiceNumber,
      sale: result.sale,
      order: result.updatedOrder,
    });
  } catch (err: any) {
    console.error('Invoice generation error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to generate invoice.' }, { status: 500 });
  }
}
