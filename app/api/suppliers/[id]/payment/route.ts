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
    const targetAccountId = accountId || 'acc-cash-1';
    await tx.financialAccount.updateMany({
      where: { id: targetAccountId },
      data: {
        balance: { decrement: new Prisma.Decimal(amount) },
      },
    });

    // Record Operating Expense under 'Purchase Expenses'
    const expVoucher = 'EXP-SUP-' + Date.now().toString().slice(-6);
    await tx.expense.create({
      data: {
        id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        voucherNumber: expVoucher,
        category: 'Purchase Expenses',
        amount: new Prisma.Decimal(amount),
        date: new Date(),
        paymentMethod: paymentMethod || 'CASH',
        branchId: user.branchId || 'branch-main-1',
        description: `Supplier Payment for Purchases: ${supplier.name} (${supplier.company || ''}) — Ref: ${voucherNumber}`,
        createdBy: user.name,
      },
    });

    // Create Accounting Ledger Entry
    await tx.ledgerEntry.create({
      data: {
        id: 'led-' + Date.now(),
        date: new Date(),
        partyType: 'SUPPLIER',
        partyId: supplier.id,
        referenceType: 'SUPPLIER_PAYMENT',
        referenceNumber: voucherNumber,
        description: `Payment to ${supplier.name} (${supplier.company})`,
        debit: new Prisma.Decimal(amount),
        credit: new Prisma.Decimal(0),
        runningBalance: new Prisma.Decimal(Number(supplier.currentPayable) - Number(amount)),
      },
    });

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
