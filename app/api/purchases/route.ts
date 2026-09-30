// NEED ELECTRO ERP — Purchase Procurement Route Handler (ACID Transaction)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const purchases = await prisma.purchase.findMany({
    include: { items: true },
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: purchases });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'purchases', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to purchase creation' }, { status: 403 });
  }

  try {
    const payload = await req.json();
    const {
      supplierId,
      supplierName,
      branchId,
      items,
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      dueAmount,
      paymentMethod,
      notes,
    } = payload;

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier and at least one item are required' }, { status: 400 });
    }

    // Safe calculations with fallbacks to avoid DecimalError: Invalid argument: undefined
    const calculatedSubtotal = items.reduce(
      (sum: number, it: any) => sum + (Number(it.costPrice || 0) * Number(it.quantity || 1)),
      0
    );
    const calculatedDiscount = Number(discount || 0);
    const calculatedTax = Number(tax || 0);
    const finalTotal =
      total !== undefined && total !== null
        ? Number(total)
        : Math.max(0, calculatedSubtotal - calculatedDiscount + calculatedTax);
    const finalPaid = Number(paidAmount || 0);
    const finalDue =
      dueAmount !== undefined && dueAmount !== null
        ? Number(dueAmount)
        : Math.max(0, finalTotal - finalPaid);

    let finalSupplierName = supplierName;
    if (!finalSupplierName && supplierId) {
      const sup = await prisma.supplier.findUnique({ where: { id: supplierId } });
      finalSupplierName = sup?.name || 'Unknown Supplier';
    }

    const invoiceNumber = 'PUR-INV-' + Date.now().toString().slice(-6);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase Record
      const purchase = await tx.purchase.create({
        data: {
          id: 'pur-' + Date.now(),
          invoiceNumber,
          supplierId,
          supplierName: finalSupplierName,
          branchId: branchId || user.branchId || 'branch-main-1',
          date: new Date(),
          status: 'Received',
          subtotal: new Prisma.Decimal(calculatedSubtotal),
          discount: new Prisma.Decimal(calculatedDiscount),
          tax: new Prisma.Decimal(calculatedTax),
          total: new Prisma.Decimal(finalTotal),
          paidAmount: new Prisma.Decimal(finalPaid),
          dueAmount: new Prisma.Decimal(finalDue),
          paymentMethod: paymentMethod || 'Cash',
          notes: notes || null,
        },
      });

      // 2. Create Purchase Items & Update Inventory
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        const prodName = item.productName || product?.name || 'Product';
        const itemQuantity = Number(item.quantity || 1);
        const itemCost = Number(item.costPrice || 0);
        const itemSubtotal = itemCost * itemQuantity;
        const itemSerials = Array.isArray(item.serialNumbers)
          ? item.serialNumbers
          : Array.isArray(item.serials)
          ? item.serials
          : [];

        await tx.purchaseItem.create({
          data: {
            id: 'pitem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            purchaseId: purchase.id,
            productId: item.productId,
            productName: prodName,
            quantity: itemQuantity,
            costPrice: new Prisma.Decimal(itemCost),
            subtotal: new Prisma.Decimal(itemSubtotal),
            serialNumbers: itemSerials,
          },
        });

        if (product) {
          const openingStock = product.currentStock;
          const closingStock = openingStock + itemQuantity;

          // Increment Product Stock and update cost price
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: closingStock,
              costPrice: new Prisma.Decimal(itemCost),
            },
          });

          // Insert Serials if serialized
          if (product.isSerialized && itemSerials.length > 0) {
            for (const sn of itemSerials) {
              const serialClean = typeof sn === 'string' ? sn.trim() : '';
              if (!serialClean) continue;

              await tx.productSerial.upsert({
                where: { serialNumber: serialClean },
                update: {
                  status: 'AVAILABLE',
                  purchaseId: purchase.id,
                  purchaseDate: new Date(),
                  supplierId,
                  purchaseCost: new Prisma.Decimal(itemCost),
                  branchId: branchId || user.branchId || 'branch-main-1',
                },
                create: {
                  id: 'sn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                  serialNumber: serialClean,
                  productId: product.id,
                  branchId: branchId || user.branchId || 'branch-main-1',
                  status: 'AVAILABLE',
                  purchaseId: purchase.id,
                  purchaseDate: new Date(),
                  supplierId,
                  purchaseCost: new Prisma.Decimal(itemCost),
                },
              });
            }
          }

          // Record Inventory Transaction
          await tx.inventoryTransaction.create({
            data: {
              id: 'itx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
              transactionNumber: 'ITX-PUR-' + Date.now().toString().slice(-6),
              date: new Date(),
              type: 'PURCHASE_IN',
              productId: product.id,
              productName: prodName,
              branchId: branchId || user.branchId || 'branch-main-1',
              quantity: itemQuantity,
              unitCost: new Prisma.Decimal(itemCost),
              totalValue: new Prisma.Decimal(itemSubtotal),
              openingStock,
              closingStock,
              referenceType: 'PURCHASE',
              referenceId: purchase.id,
              serialNumbers: itemSerials,
              notes: `Purchased on invoice ${invoiceNumber}`,
              createdBy: user.name,
            },
          });
        }
      }

      // 3. Update Supplier Payable Balance if there is Due
      if (finalDue > 0) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: {
            currentPayable: { increment: new Prisma.Decimal(finalDue) },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-' + Date.now() + '-pur',
            date: new Date(),
            partyType: 'SUPPLIER',
            partyId: supplierId,
            referenceType: 'PURCHASE',
            referenceNumber: invoiceNumber,
            description: `Payable for purchase invoice ${invoiceNumber}`,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(finalDue),
            runningBalance: new Prisma.Decimal(finalDue),
          },
        });
      }

      // 4. Record Outflow & Deduct Financial Account if paid amount was provided upfront
      if (finalPaid > 0) {
        const targetAccountId = (payload as any).accountId || (payload as any).depositAccountId;
        await recordAccountMovement(tx, {
          accountId: targetAccountId,
          paymentMethod: paymentMethod || 'Cash',
          referenceType: 'PURCHASE',
          referenceNumber: invoiceNumber,
          amount: finalPaid,
          direction: 'OUTFLOW',
          description: `Product Purchase [${invoiceNumber}] payment to ${finalSupplierName}`,
          performedBy: user.name,
          relatedTransactionId: purchase.id,
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'PURCHASE_CREATED',
          module: 'PURCHASES',
          recordId: purchase.id,
          details: `Purchase ${invoiceNumber} created from ${finalSupplierName}. Total: ৳${finalTotal}, Paid: ৳${finalPaid}`,
        },
      });

      return purchase;
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase created successfully.',
      purchase: result,
    });
  } catch (err: any) {
    console.error('Purchase creation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
