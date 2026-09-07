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
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true, branch: true },
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
    }

    const settings = await prisma.systemSettings.findUnique({ where: { id: 'main' } });

    const invoiceData = {
      invoiceNumber: sale.invoiceNumber,
      date: sale.date.toISOString(),
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      branchName: sale.branch.name,
      branchPhone: sale.branch.phone || '',
      branchAddress: sale.branch.address || '',
      items: sale.items.map((i) => ({
        name: i.productName,
        sku: i.sku,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
        serialNumbers: Array.isArray(i.serialNumbers) ? (i.serialNumbers as string[]) : [],
      })),
      subtotal: Number(sale.subtotal),
      discount: Number(sale.overallDiscount),
      vatAmount: Number(sale.vatAmount),
      grandTotal: Number(sale.grandTotal),
      paidAmount: Number(sale.paidAmount),
      dueAmount: Number(sale.dueAmount),
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
