// NEED ELECTRO ERP — Sale Master View, Update & Delete/Cancel Handler with Full ACID Ledger Synchronization
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission, authenticateRequest } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { reverseTransaction, recordAccountMovement } from '@/lib/accounting';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let user: any = await authenticateRequest(req);
  if (!user && process.env.NODE_ENV !== 'production') {
    user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
  }

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  const sale = await prisma.sale.findFirst({
    where: {
      OR: [
        { id: params.id },
        { invoiceNumber: params.id }
      ]
    },
    include: {
      items: true,
      customer: true,
      branch: true,
      emiAccount: {
        include: {
          installments: true,
          payments: true
        }
      }
    }
  });

  if (!sale) {
    return NextResponse.json({ success: false, error: 'Invoice not found' }, { status: 404 });
  }

  const formattedSale = {
    id: sale.id,
    invoiceNumber: sale.invoiceNumber,
    customerId: sale.customerId,
    customerName: sale.customerName,
    customerPhone: sale.customerPhone,
    customerEmail: (sale as any).customerEmail || sale.customer?.email || '',
    customerAddress: (sale as any).billingAddress || sale.customer?.address || '',
    customerType: (sale as any).customerType || 'RETAIL',
    customerCode: sale.customer?.customerId || '',
    billingAddress: (sale as any).billingAddress || sale.customer?.address || '',
    shippingAddress: (sale as any).shippingAddress || (sale as any).billingAddress || sale.customer?.address || '',
    branchId: sale.branchId,
    branchName: sale.branch?.name || '',
    date: sale.date ? sale.date.toISOString().split('T')[0] : '',
    createdAt: sale.createdAt ? sale.createdAt.toISOString() : (sale.date ? sale.date.toISOString() : ''),
    subtotal: Number(sale.subtotal),
    overallDiscount: Number(sale.overallDiscount),
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
    emiAccountId: sale.emiAccountId,
    emiAccount: sale.emiAccount || null,
    status: sale.status,
    salespersonId: sale.salespersonId,
    salespersonName: sale.salespersonName,
    notes: sale.notes,
    metadata: (sale as any).metadata || null,
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      total: Number(item.total),
      warrantyMonths: item.warrantyMonths,
      isSerialized: item.isSerialized,
      serialNumbers: Array.isArray(item.serialNumbers) ? (item.serialNumbers as string[]) : [],
      description: (item as any).description || '',
      taxPercent: Number((item as any).taxPercent || 0),
      taxAmount: Number((item as any).taxAmount || 0),
    })),
  };

  return NextResponse.json({ success: true, data: formattedSale });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isAdmin = user.role === 'ADMIN';
  const hasEditPerm = hasPermission(user, 'sales', 'edit');

  if (!isSuperAdmin && !isAdmin && !hasEditPerm) {
    return NextResponse.json({ success: false, error: 'Access denied. Requires Super Admin, Admin, or Sales Edit permission.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Sale record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Check if items are being updated (Inventory reconciliation)
      if (Array.isArray(body.items) && body.items.length > 0) {
        // Restore existing items inventory
        for (const oldItem of existing.items) {
          if (oldItem.productId) {
            await tx.product.update({
              where: { id: oldItem.productId },
              data: { currentStock: { increment: oldItem.quantity } },
            });
          }
          // Release old serials
          if (oldItem.isSerialized && Array.isArray(oldItem.serialNumbers)) {
            await tx.productSerial.updateMany({
              where: {
                productId: oldItem.productId || undefined,
                serialNumber: { in: oldItem.serialNumbers as string[] },
                saleInvoiceId: existing.id,
              },
              data: {
                status: 'AVAILABLE',
                saleInvoiceId: null,
                saleDate: null,
                customerId: null,
              },
            });
          }
        }

        // Delete old items
        await tx.saleItem.deleteMany({ where: { saleId: existing.id } });

        // Insert new items & deduct stock
        for (const newItem of body.items) {
          const saleItemId = 'si-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
          const lineTotal = Number(newItem.unitPrice) * Number(newItem.quantity) - Number(newItem.discount || 0);

          await tx.saleItem.create({
            data: {
              id: saleItemId,
              saleId: existing.id,
              productId: newItem.productId,
              productName: newItem.productName,
              sku: newItem.sku,
              category: newItem.category || 'General',
              quantity: Number(newItem.quantity),
              unitPrice: new Prisma.Decimal(newItem.unitPrice),
              discount: new Prisma.Decimal(newItem.discount || 0),
              total: new Prisma.Decimal(lineTotal),
              warrantyMonths: Number(newItem.warrantyMonths || 0),
              isSerialized: Boolean(newItem.isSerialized),
              serialNumbers: newItem.serialNumbers || [],
              description: newItem.description || null,
            },
          });

          if (newItem.productId) {
            await tx.product.update({
              where: { id: newItem.productId },
              data: { currentStock: { decrement: Number(newItem.quantity) } },
            });
          }

          if (newItem.isSerialized && Array.isArray(newItem.serialNumbers)) {
            for (const sn of newItem.serialNumbers) {
              await tx.productSerial.updateMany({
                where: { serialNumber: sn, productId: newItem.productId },
                data: {
                  status: 'SOLD',
                  saleInvoiceId: existing.id,
                  saleDate: new Date(),
                  customerId: body.customerId || existing.customerId,
                },
              });
            }
          }
        }
      }

      const oldPaid = Number(existing.paidAmount);
      const newPaid = body.paidAmount !== undefined ? Number(body.paidAmount) : oldPaid;
      const oldDue = Number(existing.dueAmount);
      const newDue = body.dueAmount !== undefined ? Number(body.dueAmount) : oldDue;

      // 2. If financial paid amount or payments changed, reverse previous account movement and post corrected
      if (body.paidAmount !== undefined && newPaid !== oldPaid) {
        await reverseTransaction(tx, {
          referenceNumber: existing.invoiceNumber,
          reason: `Sale ${existing.invoiceNumber} payment modification from ৳${oldPaid} to ৳${newPaid}`,
          performedBy: user.name,
        });

        if (newPaid > 0) {
          const splitPayments = Array.isArray(body.payments) && body.payments.length > 0
            ? body.payments
            : [{ method: 'Cash', amount: newPaid }];

          for (const p of splitPayments) {
            const amt = Number(p.amount);
            if (amt > 0) {
              await recordAccountMovement(tx, {
                accountId: p.accountId,
                paymentMethod: p.method || 'Cash',
                referenceType: 'SALE',
                referenceNumber: existing.invoiceNumber,
                amount: amt,
                direction: 'INFLOW',
                description: `Payment received (${p.method || 'Cash'}) for modified sale ${existing.invoiceNumber} from ${body.customerName || existing.customerName}`,
                performedBy: user.name,
                relatedTransactionId: existing.id,
              });
            }
          }
        }
      }

      // 3. If Customer Due changed, adjust Customer balance
      if (body.dueAmount !== undefined && newDue !== oldDue) {
        const diff = newDue - oldDue;
        const targetCustomerId = body.customerId || existing.customerId;

        await tx.customer.update({
          where: { id: targetCustomerId },
          data: {
            currentBalance: {
              [diff > 0 ? 'increment' : 'decrement']: new Prisma.Decimal(Math.abs(diff)),
            },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-adj-' + Date.now(),
            date: new Date(),
            partyType: 'CUSTOMER',
            partyId: targetCustomerId,
            referenceType: 'SALE_ADJUSTMENT',
            referenceNumber: existing.invoiceNumber,
            description: `Receivable adjustment for sale ${existing.invoiceNumber} (Old Due: ৳${oldDue}, New Due: ৳${newDue})`,
            debit: diff > 0 ? new Prisma.Decimal(diff) : new Prisma.Decimal(0),
            credit: diff < 0 ? new Prisma.Decimal(Math.abs(diff)) : new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(newDue),
            status: 'COMPLETED',
            performedBy: user.name,
          },
        });
      }

      // 4. Update Sale Record
      const sale = await tx.sale.update({
        where: { id: params.id },
        data: {
          ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
          ...(body.customerName && { customerName: body.customerName }),
          ...(body.customerPhone && { customerPhone: body.customerPhone }),
          ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
          ...(body.customerType !== undefined && { customerType: body.customerType }),
          ...(body.billingAddress !== undefined && { billingAddress: body.billingAddress }),
          ...(body.shippingAddress !== undefined && { shippingAddress: body.shippingAddress }),
          ...(body.customerId && { customerId: body.customerId }),
          ...(body.branchId && { branchId: body.branchId }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.subtotal !== undefined && { subtotal: new Prisma.Decimal(body.subtotal) }),
          ...(body.overallDiscount !== undefined && { overallDiscount: new Prisma.Decimal(body.overallDiscount) }),
          ...(body.vatAmount !== undefined && { vatAmount: new Prisma.Decimal(body.vatAmount) }),
          ...(body.vatPercent !== undefined && { vatPercent: new Prisma.Decimal(body.vatPercent) }),
          ...(body.deliveryCharge !== undefined && { deliveryCharge: new Prisma.Decimal(body.deliveryCharge) }),
          ...(body.serviceCharge !== undefined && { serviceCharge: new Prisma.Decimal(body.serviceCharge) }),
          ...(body.otherCharges !== undefined && { otherCharges: new Prisma.Decimal(body.otherCharges) }),
          ...(body.grandTotal !== undefined && { grandTotal: new Prisma.Decimal(body.grandTotal) }),
          ...(body.paidAmount !== undefined && { paidAmount: new Prisma.Decimal(body.paidAmount) }),
          ...(body.dueAmount !== undefined && { dueAmount: new Prisma.Decimal(body.dueAmount) }),
          ...(body.status && { status: body.status }),
          ...(body.saleType && { saleType: body.saleType }),
          ...(body.salespersonName !== undefined && { salespersonName: body.salespersonName }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.payments !== undefined && { payments: body.payments }),
          ...(body.metadata !== undefined && { metadata: body.metadata }),
        },
        include: { items: true, customer: true, branch: true },
      });

      // 5. Detailed Audit Log with before and after comparison
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVOICE_EDITED',
          module: 'SALES',
          recordId: sale.id,
          details: `Invoice ${sale.invoiceNumber} modified by ${user.name} (${user.role}). Old GrandTotal: ৳${existing.grandTotal}, New: ৳${sale.grandTotal}. Old Paid: ৳${oldPaid}, New: ৳${newPaid}. Old Due: ৳${oldDue}, New: ৳${newDue}. Status: ${sale.status}`,
        },
      });

      return sale;
    });

    return NextResponse.json({ success: true, data: updated, message: 'Invoice successfully updated.' });
  } catch (err: any) {
    console.error('Sale update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete/cancel sales.' }, { status: 403 });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Sale record not found' }, { status: 404 });
    }

    if (sale.status === 'CANCELLED' || sale.status === 'VOID') {
      return NextResponse.json({ success: false, error: 'Sale has already been cancelled and reversed.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revert sold serial numbers back to AVAILABLE
      await tx.productSerial.updateMany({
        where: { saleInvoiceId: sale.id },
        data: {
          status: 'AVAILABLE',
          saleInvoiceId: null,
          saleDate: null,
          customerId: null,
        },
      });

      // Also match by invoiceNumber if any were saved by invoiceNumber
      await tx.productSerial.updateMany({
        where: { saleInvoiceId: sale.invoiceNumber },
        data: {
          status: 'AVAILABLE',
          saleInvoiceId: null,
          saleDate: null,
          customerId: null,
        },
      });

      // 2. Restore product inventory currentStock
      for (const item of sale.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: item.quantity },
            },
          });

          // Log inventory reversal
          await tx.inventoryTransaction.create({
            data: {
              id: 'inv-tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              transactionNumber: 'RESTORE-' + sale.invoiceNumber + '-' + item.id.slice(-4),
              date: new Date(),
              type: 'RETURN_IN',
              productId: item.productId,
              productName: item.productName,
              branchId: sale.branchId,
              quantity: item.quantity,
              unitCost: item.unitPrice,
              totalValue: new Prisma.Decimal(Number(item.unitPrice) * item.quantity),
              openingStock: 0,
              closingStock: item.quantity,
              referenceType: 'SALE_CANCELLATION',
              referenceId: sale.invoiceNumber,
              notes: `Stock restored upon cancellation of invoice ${sale.invoiceNumber}`,
              createdBy: user.name,
            },
          });
        }
      }

      // 3. Reverse customer receivable balance if due amount was recorded
      const dueAmt = Number(sale.dueAmount);
      if (dueAmt > 0 && sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            currentBalance: { decrement: new Prisma.Decimal(dueAmt) },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-cancel-' + Date.now(),
            date: new Date(),
            partyType: 'CUSTOMER',
            partyId: sale.customerId,
            referenceType: 'SALE_CANCELLATION',
            referenceNumber: sale.invoiceNumber,
            description: `Receivable cancelled for invoice ${sale.invoiceNumber}`,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(dueAmt),
            runningBalance: new Prisma.Decimal(0),
            status: 'COMPLETED',
            performedBy: user.name,
          },
        });
      }

      // 4. Reverse central financial ledger entries and deduct cash from account
      await reverseTransaction(tx, {
        referenceNumber: sale.invoiceNumber,
        reason: `Invoice ${sale.invoiceNumber} cancelled by ${user.name}`,
        performedBy: user.name,
      });

      // 5. Soft cancel: update status to 'CANCELLED' (Strict reversal logic, preserves record history)
      await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: 'CANCELLED',
          notes: `${sale.notes ? sale.notes + ' | ' : ''}CANCELLED & REVERSED by ${user.name} on ${new Date().toISOString()}`,
        },
      });

      // 6. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVOICE_CANCELLED',
          module: 'SALES',
          recordId: sale.id,
          details: `Invoice ${sale.invoiceNumber} cancelled and reversed by ${user.name} (${user.role}). Reversing Cash Inflow: ৳${sale.paidAmount}, Due: ৳${sale.dueAmount}. Restored items to stock.`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Invoice ${sale.invoiceNumber} successfully cancelled and all financial and inventory effects reversed.`,
    });
  } catch (err: any) {
    console.error('Invoice cancellation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
