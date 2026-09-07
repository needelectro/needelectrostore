// NEED ELECTRO ERP — Dynamic Reporting & Analytics Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'reports', 'view') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to analytics reports' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const reportType = searchParams.get('reportType') || 'sales';
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  const branchId = searchParams.get('branchId');

  const startDate = startDateStr ? new Date(startDateStr) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  try {
    let reportData: any[] = [];

    if (reportType === 'sales') {
      const sales = await prisma.sale.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          ...(branchId && branchId !== 'ALL' && { branchId }),
          status: 'COMPLETED',
        },
        orderBy: { date: 'asc' },
      });

      reportData = sales.map((s) => ({
        id: s.id,
        invoiceNumber: s.invoiceNumber,
        date: s.date.toISOString().split('T')[0],
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        grandTotal: Number(s.grandTotal),
        paidAmount: Number(s.paidAmount),
        dueAmount: Number(s.dueAmount),
        saleType: s.saleType,
      }));
    } else if (reportType === 'emi') {
      const emiPayments = await prisma.eMIPayment.findMany({
        where: {
          paymentDate: { gte: startDate, lte: endDate },
        },
        orderBy: { paymentDate: 'asc' },
      });

      reportData = emiPayments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        date: p.paymentDate.toISOString().split('T')[0],
        emiNumber: p.emiNumber,
        customerName: p.customerName,
        installmentNumber: p.installmentNumber,
        amount: Number(p.amount),
        penaltyPaid: Number(p.penaltyPaid),
        paymentMethod: p.paymentMethod,
        collectedBy: p.collectedBy,
      }));
    } else if (reportType === 'inventory') {
      const products = await prisma.product.findMany({
        orderBy: { currentStock: 'asc' },
      });

      reportData = products.map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        brand: p.brand,
        currentStock: p.currentStock,
        minStock: p.minStock,
        costPrice: Number(p.costPrice),
        retailPrice: Number(p.retailPrice),
        valuationCost: p.currentStock * Number(p.costPrice),
        valuationRetail: p.currentStock * Number(p.retailPrice),
        isLowStock: p.currentStock <= p.minStock,
      }));
    } else if (reportType === 'expenses') {
      const expenses = await prisma.expense.findMany({
        where: {
          date: { gte: startDate, lte: endDate },
          ...(branchId && branchId !== 'ALL' && { branchId }),
        },
        orderBy: { date: 'asc' },
      });

      reportData = expenses.map((e) => ({
        id: e.id,
        voucherNumber: e.voucherNumber,
        date: e.date.toISOString().split('T')[0],
        category: e.category,
        amount: Number(e.amount),
        paymentMethod: e.paymentMethod,
        description: e.description,
        createdBy: e.createdBy,
      }));
    }

    return NextResponse.json({
      success: true,
      reportType,
      period: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      data: reportData,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
