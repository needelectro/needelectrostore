// NEED ELECTRO ERP — PDF Document Generation Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { generateInvoiceHTML } from '@/lib/pdf';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { type, id } = await req.json();

  if (type === 'invoice') {
    const sale = await prisma.sale.findFirst({
      where: {
        OR: [
          { id },
          { invoiceNumber: id }
        ]
      },
      include: {
        items: true,
        branch: true,
        customer: true,
        emiAccount: {
          include: {
            installments: true,
            payments: true
          }
        }
      },
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    const settings = await prisma.systemSettings.findUnique({ where: { id: 'main' } });

    const invoiceData = {
      invoiceNumber: sale.invoiceNumber,
      date: sale.date.toISOString(),
      invoiceTime: sale.createdAt ? new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      customerEmail: (sale as any).customerEmail || sale.customer?.email || '',
      customerAddress: (sale as any).billingAddress || sale.customer?.address || '',
      customerType: (sale as any).customerType || 'RETAIL',
      customerCode: sale.customer?.customerId || '',
      billingAddress: (sale as any).billingAddress || sale.customer?.address || '',
      shippingAddress: (sale as any).shippingAddress || (sale as any).billingAddress || sale.customer?.address || '',
      branchName: sale.branch.name,
      branchPhone: sale.branch.phone || '',
      branchAddress: sale.branch.address || '',
      salespersonName: sale.salespersonName || 'Showroom Sales',
      items: sale.items.map((i) => ({
        name: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        discount: Number(i.discount || 0),
        taxAmount: Number((i as any).taxAmount || 0),
        total: Number(i.total),
        warrantyMonths: i.warrantyMonths,
        serialNumbers: Array.isArray(i.serialNumbers) ? (i.serialNumbers as string[]) : [],
        description: (i as any).description || '',
      })),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.overallDiscount),
      vatAmount: Number(sale.vatAmount),
      vatPercent: Number(sale.vatPercent),
      deliveryCharge: Number((sale as any).deliveryCharge || 0),
      serviceCharge: Number((sale as any).serviceCharge || 0),
      otherCharges: Number((sale as any).otherCharges || 0),
      grandTotal: Number(sale.grandTotal),
      paidAmount: Number(sale.paidAmount),
      dueAmount: Number(sale.dueAmount),
      previousDue: Number((sale as any).previousDue || sale.customer?.currentBalance || 0),
      totalDue: Number((sale as any).totalDue || (Number((sale as any).previousDue || 0) + Number(sale.dueAmount))),
      changeAmount: Number((sale as any).changeAmount || 0),
      payments: (sale.payments as any) || [],
      saleType: sale.saleType,
      emiDetails: sale.emiAccount ? {
        emiNumber: sale.emiAccount.emiNumber,
        laptopPrice: Number(sale.emiAccount.laptopPrice),
        downPayment: Number(sale.emiAccount.downPayment),
        financedAmount: Number(sale.emiAccount.financedAmount),
        durationMonths: sale.emiAccount.durationMonths,
        monthlyInstallment: Number(sale.emiAccount.monthlyInstallment),
        totalPayable: Number(sale.emiAccount.totalPayable),
        totalPaid: Number(sale.emiAccount.totalPaid),
        remainingBalance: Number(sale.emiAccount.remainingBalance),
        nextPaymentDate: sale.emiAccount.installments?.find(ins => ins.status === 'UPCOMING' || ins.status === 'DUE_TODAY')?.dueDate?.toISOString(),
        status: sale.emiAccount.status,
      } : undefined,
      notes: sale.notes || '',
    };

    const html = generateInvoiceHTML(invoiceData, settings);

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${sale.invoiceNumber}.html"`,
      },
    });
  }

  return NextResponse.json({ success: false, error: 'Unsupported PDF document type' }, { status: 400 });
}
