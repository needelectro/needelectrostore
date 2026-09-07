// NEED ELECTRO ERP — Purchase Procurement Route Handler (ACID Transaction)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

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

    if (!supplierId || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Supplier and items are required' }, { status: 400 });
    }

    const invoiceNumber = 'PUR-INV-' + Date.now().toString().slice(-6);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase Record
      const purchase = await tx.purchase.create({
        data: {
          id: 'pur-' + Date.now(),
          invoiceNumber,
          supplierId,
          supplierName,
          branchId: branchId || user.branchId || 'branch-main-1',
          date: new Date(),
          status: 'Received',
          subtotal: new Prisma.Decimal(subtotal || total),
          discount: new Prisma.Decimal(discount || 0),
          tax: new Prisma.Decimal(tax || 0),
          total: new Prisma.Decimal(total),
          paidAmount: new Prisma.Decimal(paidAmount || 0),
          dueAmount: new Prisma.Decimal(dueAmount || 0),
          paymentMethod,
          notes,
        },
      });

      // 2. Create Purchase Items & Update Inventory
      for (const item of items) {
        await tx.purchaseItem.create({
          data: {
            id: 'pitem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            purchaseId: purchase.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            costPrice: new Prisma.Decimal(item.costPrice),
            subtotal: new Prisma.Decimal(item.costPrice * item.quantity),
            serialNumbers: item.serialNumbers || [],
          },
        });

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          const openingStock = product.currentStock;
          const closingStock = openingStock + item.quantity;

          // Increment Product Stock and update cost price
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: closingStock,
              costPrice: new Prisma.Decimal(item.costPrice),
            },
          });

          // Insert Serials if serialized
          if (product.isSerialized && item.serialNumbers && item.serialNumbers.length > 0) {
            for (const sn of item.serialNumbers) {
              const serialClean = sn.trim();
              if (!serialClean) continue;

              await tx.productSerial.upsert({
                where: { serialNumber: serialClean },
                update: {
                  status: 'AVAILABLE',
                  purchaseId: purchase.id,
                  purchaseDate: new Date(),
                  supplierId,
                  purchaseCost: new Prisma.Decimal(item.costPrice),
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
                  purchaseCost: new Prisma.Decimal(item.costPrice),
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
              productName: product.name,
              branchId: branchId || user.branchId || 'branch-main-1',
              quantity: item.quantity,
              unitCost: new Prisma.Decimal(item.costPrice),
              totalValue: new Prisma.Decimal(item.costPrice * item.quantity),
              openingStock,
              closingStock,
              referenceType: 'PURCHASE',
              referenceId: purchase.id,
              serialNumbers: item.serialNumbers || [],
              notes: `Purchased on invoice ${invoiceNumber}`,
              createdBy: user.name,
            },
          });
        }
      }

      // 3. Update Supplier Payable Balance if there is Due
      if (dueAmount > 0) {
        await tx.supplier.update({
          where: { id: supplierId },
          data: {
            currentPayable: { increment: new Prisma.Decimal(dueAmount) },
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
            credit: new Prisma.Decimal(dueAmount),
            runningBalance: new Prisma.Decimal(dueAmount),
          },
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'PURCHASE_CREATED',
          module: 'PURCHASES',
          recordId: purchase.id,
          details: `Purchase ${invoiceNumber} created from ${supplierName}. Total: ৳${total}`,
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
