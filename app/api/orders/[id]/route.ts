// NEED ELECTRO ERP — Website Order Management & Status Transition Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.websiteOrder.findFirst({
      where: {
        OR: [
          { id: params.id },
          { orderNumber: params.id },
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err: any) {
    console.error('Fetch order error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'sales', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const updates = await req.json();

    const order = await prisma.websiteOrder.findFirst({
      where: {
        OR: [{ id: params.id }, { orderNumber: params.id }],
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const nextOrderStatus = updates.orderStatus || order.orderStatus;
    const nextPaymentStatus = updates.paymentStatus || order.paymentStatus;
    const nextFulfillmentStatus = updates.fulfillmentStatus || order.fulfillmentStatus;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update WebsiteOrder
      const updatedOrder = await tx.websiteOrder.update({
        where: { id: order.id },
        data: {
          orderStatus: nextOrderStatus,
          paymentStatus: nextPaymentStatus,
          fulfillmentStatus: nextFulfillmentStatus,
          ...(updates.deliveryNotes !== undefined && { deliveryNotes: updates.deliveryNotes }),
          updatedAt: new Date(),
        },
      });

      // 2. Synchronize linked Sale record if exists
      if (order.saleInvoiceId) {
        const saleUpdateData: any = {
          status: nextOrderStatus === 'CANCELLED' ? 'VOID' : nextOrderStatus === 'DELIVERED' ? 'COMPLETED' : 'PENDING',
        };

        // If payment collection is recorded (COD collected upon delivery):
        if (nextPaymentStatus === 'PAID' && order.paymentStatus !== 'PAID') {
          saleUpdateData.paidAmount = order.total;
          saleUpdateData.dueAmount = new Prisma.Decimal(0);
          saleUpdateData.payments = [
            {
              method: order.paymentMethod,
              amount: Number(order.total),
              ref: `COLLECTED_COD_${order.orderNumber}`,
              collectedBy: user.name,
              collectedAt: new Date().toISOString(),
            },
          ];

          // Reconcile financial account balance: find Main Cash drawer or specified account
          const cashAccount = await tx.financialAccount.findFirst({
            where: { type: 'CASH', isActive: true },
          });

          if (cashAccount) {
            await tx.financialAccount.update({
              where: { id: cashAccount.id },
              data: {
                balance: { increment: order.total },
              },
            });

            // Record Central Ledger Entry
            await tx.ledgerEntry.create({
              data: {
                id: 'led-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                date: new Date(),
                partyType: 'ACCOUNT',
                partyId: cashAccount.id,
                referenceType: 'SALE',
                referenceNumber: order.orderNumber,
                description: `COD Payment collected for website order ${order.orderNumber} from customer ${order.customerName}`,
                debit: order.total,
                credit: new Prisma.Decimal(0),
                runningBalance: new Prisma.Decimal(Number(cashAccount.balance) + Number(order.total)),
                paymentMethod: 'CASH',
                performedBy: user.name,
              },
            });
          }
        }

        await tx.sale.update({
          where: { id: order.saleInvoiceId },
          data: saleUpdateData,
        }).catch(err => console.warn('Sync sale update warning:', err.message));
      }

      // 3. Audit log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'UPDATE_WEBSITE_ORDER',
          module: 'SALES',
          recordId: order.id,
          details: `Updated order ${order.orderNumber}: Status=${nextOrderStatus}, Payment=${nextPaymentStatus}, Fulfillment=${nextFulfillmentStatus}`,
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: result,
    });
  } catch (err: any) {
    console.error('Update website order error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
