// NEED ELECTRO ERP — Supplier Payment Route Handler
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

  if (!hasPermission(user, 'suppliers', 'payment') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { amount, paymentMethod, accountId, reference, notes } = await req.json();

  if (!amount || Number(amount) <= 0) {
    return NextResponse.json({ success: false, error: 'Valid payment amount is required' }, { status: 400 });
  }

  const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
  if (!supplier) {
    return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
  }

  const voucherNumber = 'VOU-SUP-' + Date.now().toString().slice(-6);

  await prisma.$transaction(async (tx) => {
    // Create SupplierPayment record
    await tx.supplierPayment.create({
      data: {
        id: 'spay-' + Date.now(),
        voucherNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        amount: new Prisma.Decimal(amount),
        paymentDate: new Date(),
        paymentMethod: paymentMethod || 'CASH',
        accountId,
        reference,
        notes,
        paidBy: user.name,
      },
    });

    // Reduce supplier payable
    await tx.supplier.update({
      where: { id: supplier.id },
      data: {
        currentPayable: { decrement: new Prisma.Decimal(amount) },
      },
    });

    // Deduct financial account balance
    const targetAccountId = accountId || 'acc-1';
    let account = await tx.financialAccount.findFirst({
      where: { id: targetAccountId },
    });

    if (!account) {
      account = await tx.financialAccount.findFirst({
        where: { type: 'CASH' }
      });
    }

    if (account) {
      await tx.financialAccount.update({
        where: { id: account.id },
        data: {
          balance: { decrement: new Prisma.Decimal(amount) },
        },
      });
    }

    // Create Accounting Ledger Entry for Supplier (Debit Supplier Payable)
    await tx.ledgerEntry.create({
      data: {
        id: 'led-' + Date.now() + '-sup',
        date: new Date(),
        partyType: 'SUPPLIER',
        partyId: supplier.id,
        referenceType: 'SUPPLIER_PAYMENT',
        referenceNumber: voucherNumber,
        description: `Payment disbursed to supplier ${supplier.name} (${supplier.company || ''})`,
        debit: new Prisma.Decimal(amount),
        credit: new Prisma.Decimal(0),
        runningBalance: new Prisma.Decimal(Number(supplier.currentPayable) - Number(amount)),
      },
    });

    // Create Accounting Ledger Entry for Financial Account (Credit Cash / Bank)
    if (account) {
      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now() + '-acc',
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: account.id,
          referenceType: 'SUPPLIER_PAYMENT',
          referenceNumber: voucherNumber,
          description: `Disbursement to supplier ${supplier.name} for purchase settlement`,
          debit: new Prisma.Decimal(0),
          credit: new Prisma.Decimal(amount),
          runningBalance: new Prisma.Decimal(Number(account.balance) - Number(amount)),
        },
      });
    }

    // Audit Log
    await tx.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'SUPPLIER_PAYMENT',
        module: 'PURCHASES',
        recordId: supplier.id,
        details: `Paid ৳${amount} to ${supplier.name} via ${paymentMethod || 'CASH'}`,
      },
    });
  });

  return NextResponse.json({
    success: true,
    message: 'Supplier payment recorded successfully',
    data: { voucherNumber },
  });
}
