// NEED ELECTRO ERP — Customer Credit Due Collection Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'customers', 'edit') &&
    !hasPermission(user, 'sales', 'create') &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'ADMIN' &&
    user.role !== 'ACCOUNTANT' &&
    user.role !== 'SALES'
  ) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const { amount, paymentMethod, accountId, reference, notes } = await req.json();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid payment amount is required.' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found.' }, { status: 404 });
    }

    const receiptNumber = 'REC-DUE-' + Date.now().toString().slice(-6);
    const targetAccountId = accountId || 'acc-1';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create CustomerPayment record
      const db = tx as any;
      const payment = await db.customerPayment.create({
        data: {
          id: 'cpay-' + Date.now(),
          receiptNumber,
          customerId: customer.id,
          customerName: customer.name,
          amount: new Prisma.Decimal(numericAmount),
          paymentDate: new Date(),
          paymentMethod: paymentMethod || 'Cash',
          accountId: targetAccountId,
          reference,
          notes,
          collectedBy: user.name,
        },
      });

      // 2. Reduce Customer currentBalance
      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          currentBalance: { decrement: new Prisma.Decimal(numericAmount) },
        },
      });

      // 3. Record Customer Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now() + '-cust',
          date: new Date(),
          partyType: 'CUSTOMER',
          partyId: customer.id,
          referenceType: 'DUE_PAYMENT',
          referenceNumber: receiptNumber,
          description: `Credit due collection receipt ${receiptNumber}${notes ? ` - ${notes}` : ''}`,
          debit: new Prisma.Decimal(0),
          credit: new Prisma.Decimal(numericAmount),
          runningBalance: updatedCustomer.currentBalance,
          status: 'COMPLETED',
          performedBy: user.name,
          relatedTransactionId: payment.id,
        },
      });

      // 4. Increase Financial Account balance & record Central Ledger Entry
      await recordAccountMovement(tx, {
        accountId: targetAccountId,
        paymentMethod: paymentMethod || 'Cash',
        referenceType: 'DUE_PAYMENT',
        referenceNumber: receiptNumber,
        amount: numericAmount,
        direction: 'INFLOW',
        description: `Customer Due collected from ${customer.name} (${customer.phone})`,
        performedBy: user.name,
        relatedTransactionId: payment.id,
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'CUSTOMER_DUE_COLLECTED',
          module: 'CUSTOMERS',
          recordId: payment.id,
          details: `Collected ৳${numericAmount} credit due from ${customer.name}. Remaining Balance: ৳${Number(updatedCustomer.currentBalance)}. Method: ${paymentMethod || 'Cash'}. Receipt: ${receiptNumber}`,
        },
      });

      return { payment, receiptNumber, remainingBalance: Number(updatedCustomer.currentBalance) };
    });

    // 7. Send notification if customer has phone number
    if (customer.phone) {
      sendNotification({
        recipientPhone: customer.phone,
        recipientName: customer.name,
        channel: 'BOTH',
        customMessage: `NEED ELECTRO: Received ৳${numericAmount.toLocaleString('en-IN')} payment against due (Receipt: ${result.receiptNumber}). Remaining due balance: ৳${result.remainingBalance.toLocaleString('en-IN')}. Thank you! Need Electro (01733-983752).`,
        metadata: {
          referenceType: 'DUE_PAYMENT',
          referenceId: result.receiptNumber,
        },
      }).catch((err) => console.warn('Customer due collection notification notice:', err));
    }

    return NextResponse.json({
      success: true,
      message: `Due payment of ৳${numericAmount.toLocaleString('en-IN')} collected successfully.`,
      data: result,
    });
  } catch (err: any) {
    console.error('Customer Due Collection Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
