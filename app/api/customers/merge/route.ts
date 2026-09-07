// NEED ELECTRO ERP — Customer Merge & Deduplication Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'customers', 'merge') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to customer merge' }, { status: 403 });
  }

  const { sourceCustomerId, targetCustomerId, reason } = await req.json();

  if (!sourceCustomerId || !targetCustomerId || sourceCustomerId === targetCustomerId) {
    return NextResponse.json({ success: false, error: 'Invalid source and target customer IDs' }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const source = await tx.customer.findUnique({ where: { id: sourceCustomerId } });
      const target = await tx.customer.findUnique({ where: { id: targetCustomerId } });

      if (!source || !target) {
        throw new Error('Source or target customer does not exist');
      }

      // Move sales
      const movedSales = await tx.sale.updateMany({
        where: { customerId: source.id },
        data: { customerId: target.id, customerName: target.name },
      });

      // Move EMI accounts
      const movedEmi = await tx.eMIAccount.updateMany({
        where: { customerId: source.id },
        data: { customerId: target.id, customerName: target.name },
      });

      // Move Service jobs
      const movedServices = await tx.serviceJob.updateMany({
        where: { customerId: source.id },
        data: { customerId: target.id, customerName: target.name },
      });

      // Update target customer balance
      await tx.customer.update({
        where: { id: target.id },
        data: {
          currentBalance: { increment: source.currentBalance },
        },
      });

      // Move ledger entries
      await tx.ledgerEntry.updateMany({
        where: { partyType: 'CUSTOMER', partyId: source.id },
        data: { partyId: target.id },
      });

      // Record CustomerMergeAudit
      await tx.customerMergeAudit.create({
        data: {
          id: 'cma-' + Date.now(),
          sourceCustomerId: source.id,
          sourceCustomerName: source.name,
          targetCustomerId: target.id,
          targetCustomerName: target.name,
          movedInvoicesCount: movedSales.count,
          movedEmiAccountsCount: movedEmi.count,
          movedServiceJobsCount: movedServices.count,
          performedBy: user.name,
          timestamp: new Date(),
          reason: reason || 'Customer account deduplication',
        },
      });

      // Delete source customer
      await tx.customer.delete({ where: { id: source.id } });

      return {
        movedSales: movedSales.count,
        movedEmi: movedEmi.count,
        movedServices: movedServices.count,
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Customers merged successfully.',
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
