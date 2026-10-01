// NEED ELECTRO ERP — Invoice Payment Collection Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';
import { sendNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isAdmin = user.role === 'ADMIN';
  const hasAccess = hasPermission(user, 'sales', 'create') || hasPermission(user, 'customers', 'edit');

  if (!isSuperAdmin && !isAdmin && !hasAccess) {
    return NextResponse.json({ success: false, error: 'Access denied. Insufficient permissions to record payments.' }, { status: 403 });
  }

  try {
    const { amount, paymentMethod, accountId, reference, notes } = await req.json();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid payment amount is required.' }, { status: 400 });
    }

    const sale = await prisma.sale.findFirst({
      where: {
        OR: [
          { id: params.id },
          { invoiceNumber: params.id }
        ]
      },
      include: { customer: true, items: true, branch: true }
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Invoice record not found' }, { status: 404 });
    }

    if (sale.status === 'CANCELLED' || sale.status === 'VOID') {
      return NextResponse.json({ success: false, error: 'Cannot record payment on a cancelled invoice.' }, { status: 400 });
    }

    const currentDue = Number(sale.dueAmount);
    if (currentDue <= 0) {
      return NextResponse.json({ success: false, error: 'This invoice has already been fully paid.' }, { status: 400 });
    }

    const receiptNumber = 'REC-INV-' + Date.now().toString().slice(-6);
    const methodLabel = paymentMethod || 'Cash';
    const targetAccountId = accountId || 'acc-1';

    const result = await prisma.$transaction(async (tx) => {
      const oldPaid = Number(sale.paidAmount);
      const newPaid = oldPaid + numericAmount;
      const newDue = Math.max(0, currentDue - numericAmount);

      let newStatus = sale.status;
      if (sale.saleType === 'EMI') {
        newStatus = 'EMI';
      } else if (newDue <= 0) {
        newStatus = 'PAID';
      } else {
        newStatus = 'PARTIALLY_PAID';
      }

      // 1. Update payments list
      const existingPayments = Array.isArray(sale.payments) ? (sale.payments as any[]) : [];
      const updatedPayments = [
        ...existingPayments,
        {
          method: methodLabel,
          amount: numericAmount,
          accountId: targetAccountId,
          ref: reference || receiptNumber,
          date: new Date().toISOString(),
          collectedBy: user.name,
          notes: notes || undefined,
        },
      ];

      // 2. Update Sale
      const updatedSale = await tx.sale.update({
        where: { id: sale.id },
        data: {
          paidAmount: new Prisma.Decimal(newPaid),
          dueAmount: new Prisma.Decimal(newDue),
          status: newStatus,
          payments: updatedPayments,
        },
        include: { items: true, customer: true, branch: true },
      });

      // 3. Decrement Customer currentBalance
      const updatedCustomer = await tx.customer.update({
        where: { id: sale.customerId },
        data: {
          currentBalance: { decrement: new Prisma.Decimal(numericAmount) },
        },
      });

      // 4. Create CustomerPayment record
      const db = tx as any;
      await db.customerPayment.create({
        data: {
          id: 'cpay-' + Date.now(),
          receiptNumber,
          customerId: sale.customerId,
          customerName: sale.customerName,
          amount: new Prisma.Decimal(numericAmount),
          paymentDate: new Date(),
          paymentMethod: methodLabel,
          accountId: targetAccountId,
          reference: reference || `Payment for Invoice ${sale.invoiceNumber}`,
          notes: notes || `Payment recorded for ${sale.invoiceNumber}`,
          collectedBy: user.name,
        },
      });

      // 5. Customer Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          id: 'led-pay-' + Date.now(),
          date: new Date(),
          partyType: 'CUSTOMER',
          partyId: sale.customerId,
          referenceType: 'SALE_PAYMENT',
          referenceNumber: sale.invoiceNumber,
          description: `Payment received (${methodLabel}) for invoice ${sale.invoiceNumber}. Receipt: ${receiptNumber}`,
          debit: new Prisma.Decimal(0),
          credit: new Prisma.Decimal(numericAmount),
          runningBalance: updatedCustomer.currentBalance,
          status: 'COMPLETED',
          performedBy: user.name,
        },
      });

      // 6. Record Account Movement (Cash/Bank/MFS Inflow)
      await recordAccountMovement(tx, {
        accountId: targetAccountId,
        paymentMethod: methodLabel,
        referenceType: 'SALE',
        referenceNumber: sale.invoiceNumber,
        amount: numericAmount,
        direction: 'INFLOW',
        description: `Invoice payment (${methodLabel}) for ${sale.invoiceNumber} from ${sale.customerName}`,
        performedBy: user.name,
        relatedTransactionId: sale.id,
      });

      // 7. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVOICE_PAYMENT_RECORDED',
          module: 'SALES',
          recordId: sale.id,
          details: `Recorded payment of ৳${numericAmount} for invoice ${sale.invoiceNumber} from ${sale.customerName}. New Due: ৳${newDue}. Method: ${methodLabel}. Receipt: ${receiptNumber}`,
        },
      });

      return {
        sale: updatedSale,
        receiptNumber,
        remainingInvoiceDue: newDue,
        remainingCustomerDue: Number(updatedCustomer.currentBalance),
      };
    });

    // 8. Trigger customer notification
    if (sale.customerPhone) {
      sendNotification({
        recipientPhone: sale.customerPhone,
        recipientName: sale.customerName,
        channel: 'BOTH',
        customMessage: `NEED ELECTRO: Received ৳${numericAmount.toLocaleString('en-IN')} payment for invoice ${sale.invoiceNumber} (Receipt: ${result.receiptNumber}). Remaining invoice due: ৳${result.remainingInvoiceDue.toLocaleString('en-IN')}. Thank you! Need Electro (01733-983752).`,
        metadata: {
          referenceType: 'DUE_PAYMENT',
          referenceId: sale.invoiceNumber,
        },
      }).catch((e) => console.warn('Payment notification error:', e));
    }

    return NextResponse.json({
      success: true,
      message: `Payment of ৳${numericAmount.toLocaleString('en-IN')} recorded successfully.`,
      data: result,
    });
  } catch (err: any) {
    console.error('Record Invoice Payment Error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Payment recording failed.' }, { status: 500 });
  }
}
