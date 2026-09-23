// NEED ELECTRO ERP — EMI Installment Payment Collection (ACID Transaction)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { collectEmiPaymentSchema } from '@/lib/validations';
import { sendNotification } from '@/lib/notifications';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'emi', 'collect') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = collectEmiPaymentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { emiAccountId, installmentId, amount, penaltyAmount, paymentMethod, ref, notes, accountId } = parsed.data;

    const result = await prisma.$transaction(async (tx) => {
      const emiAccount = await tx.eMIAccount.findUnique({
        where: { id: emiAccountId },
        include: { installments: true },
      });

      if (!emiAccount) {
        throw new Error('EMI account not found');
      }

      const installment = emiAccount.installments.find((i) => i.id === installmentId);
      if (!installment) {
        throw new Error('Installment not found on this EMI contract');
      }

      if (installment.status === 'PAID') {
        throw new Error(`Installment #${installment.installmentNumber} on contract ${emiAccount.emiNumber} is already fully paid.`);
      }

      const receiptNumber = 'REC-EMI-' + Date.now().toString().slice(-6);

      // 1. Create Payment Record
      const payment = await tx.eMIPayment.create({
        data: {
          id: 'epay-' + Date.now(),
          receiptNumber,
          emiAccountId,
          emiNumber: emiAccount.emiNumber,
          installmentId,
          installmentNumber: installment.installmentNumber,
          customerId: emiAccount.customerId,
          customerName: emiAccount.customerName,
          amount: new Prisma.Decimal(amount),
          penaltyPaid: new Prisma.Decimal(penaltyAmount || 0),
          paymentDate: new Date(),
          paymentMethod: paymentMethod || 'CASH',
          transactionRef: ref,
          collectedBy: user.name,
          notes,
        },
      });

      // 2. Update Installment Status with Concurrency Guard
      const newPaid = Number(installment.paidAmount) + amount;
      const targetAmount = Number(installment.amount);
      const newStatus = newPaid >= targetAmount ? 'PAID' : 'PARTIALLY_PAID';

      const instUpdate = await tx.eMIInstallment.updateMany({
        where: { id: installmentId, status: { not: 'PAID' } },
        data: {
          paidAmount: new Prisma.Decimal(newPaid),
          paidDate: new Date(),
          status: newStatus,
          receiptNumber,
          paymentMethod,
        },
      });

      if (instUpdate.count === 0) {
        throw new Error(`Concurrency race condition: Installment #${installment.installmentNumber} was already settled.`);
      }

      // 3. Update EMI Account Balances
      const newTotalPaid = Number(emiAccount.totalPaid) + amount;
      const newBalance = Math.max(0, Number(emiAccount.remainingBalance) - amount);
      const isAccountCompleted = newBalance <= 0;

      await tx.eMIAccount.update({
        where: { id: emiAccountId },
        data: {
          totalPaid: new Prisma.Decimal(newTotalPaid),
          remainingBalance: new Prisma.Decimal(newBalance),
          ...(isAccountCompleted && { status: 'COMPLETED' }),
        },
      });

      // 4. Update Financial Account Balance
      const targetAccountId = accountId || 'acc-1';
      let account = await tx.financialAccount.findFirst({
        where: { id: targetAccountId },
      });

      if (!account) {
        account = await tx.financialAccount.findFirst({
          where: { type: 'CASH' },
        });
      }

      if (account) {
        await tx.financialAccount.update({
          where: { id: account.id },
          data: {
            balance: { increment: new Prisma.Decimal(amount) },
          },
        });
      }

      // 5. Create Accounting Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now(),
          date: new Date(),
          partyType: 'CUSTOMER',
          partyId: emiAccount.customerId,
          referenceType: 'EMI_PAYMENT',
          referenceNumber: receiptNumber,
          description: `EMI Installment #${installment.installmentNumber} payment for ${emiAccount.emiNumber}`,
          debit: new Prisma.Decimal(0),
          credit: new Prisma.Decimal(amount),
          runningBalance: new Prisma.Decimal(newBalance),
        },
      });

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'EMI_PAYMENT_COLLECTED',
          module: 'EMI',
          recordId: emiAccountId,
          details: `Collected ৳${amount} for Installment #${installment.installmentNumber} of ${emiAccount.emiNumber}. Receipt: ${receiptNumber}`,
        },
      });

      return { payment, receiptNumber, isAccountCompleted };
    });

    // Asynchronously dispatch EMI payment confirmation SMS / WhatsApp to customer
    prisma.eMIAccount.findUnique({
      where: { id: parsed.data.emiAccountId },
    }).then((acc) => {
      if (acc && acc.customerPhone) {
        sendNotification({
          recipientPhone: acc.customerPhone,
          recipientName: acc.customerName,
          channel: 'BOTH',
          customMessage: `NEED ELECTRO: Received ৳${amount} for EMI ${acc.emiNumber} (Receipt: ${result.receiptNumber}). Remaining balance: ৳${Number(acc.remainingBalance).toLocaleString('en-IN')}. Thank you! Need Electro (01733-983752).`,
          metadata: {
            referenceType: 'EMI_PAYMENT',
            referenceId: result.receiptNumber,
          },
        }).catch((e) => console.warn('Background EMI notification dispatch notice:', e));
      }
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Payment recorded successfully.',
      receiptNumber: result.receiptNumber,
      data: result,
    });
  } catch (err: any) {
    console.error('EMI collection error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
