// NEED ELECTRO ERP — Products & Inventory Catalog Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { createProductSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const brand = searchParams.get('brand');
  const query = searchParams.get('query');

  const where: any = {};
  if (category && category !== 'ALL') where.category = category;
  if (brand && brand !== 'ALL') where.brand = brand;
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { sku: { contains: query, mode: 'insensitive' } },
      { model: { contains: query, mode: 'insensitive' } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      serials: {
        where: { status: 'AVAILABLE' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'products', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = createProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { productData, initialSerials } = parsed.data;

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({ where: { sku: productData.sku } });
    if (existing) {
      return NextResponse.json({ success: false, error: `SKU '${productData.sku}' already exists.` }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const productId = 'prod-' + Date.now();
      const initialStock = initialSerials && initialSerials.length > 0 ? initialSerials.length : (productData.currentStock || 0);

      const product = await tx.product.create({
        data: {
          id: productId,
          name: productData.name,
          sku: productData.sku,
          category: productData.category,
          brand: productData.brand,
          model: productData.model,
          description: productData.description,
          imageUrl: productData.imageUrl,
          purchasePrice: new Prisma.Decimal(productData.purchasePrice || 0),
          costPrice: new Prisma.Decimal(productData.costPrice || 0),
          retailPrice: new Prisma.Decimal(productData.retailPrice || 0),
          wholesalePrice: new Prisma.Decimal(productData.wholesalePrice || 0),
          emiPrice: new Prisma.Decimal(productData.emiPrice || 0),
          currentStock: initialStock,
          minStock: productData.minStock || 5,
          supplierId: productData.supplierId,
          warrantyPeriodMonths: productData.warrantyPeriodMonths || 0,
          isSerialized: Boolean(productData.isSerialized),
          status: productData.status || 'ACTIVE',
          specs: productData.specs || {},
        },
      });

      // If serialized and serials provided, insert serial numbers
      if (productData.isSerialized && initialSerials && initialSerials.length > 0) {
        for (const sn of initialSerials) {
          const serialClean = sn.trim();
          if (!serialClean) continue;

          await tx.productSerial.create({
            data: {
              id: 'sn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              serialNumber: serialClean,
              productId: product.id,
              branchId: user.branchId || 'branch-main-1',
              status: 'AVAILABLE',
              purchaseCost: new Prisma.Decimal(productData.costPrice || 0),
            },
          });
        }
      }

      // Record Initial Inventory Transaction
      if (initialStock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            id: 'itx-' + Date.now(),
            transactionNumber: 'ITX-' + Date.now().toString().slice(-6),
            date: new Date(),
            type: 'PURCHASE_IN',
            productId: product.id,
            productName: product.name,
            branchId: user.branchId || 'branch-main-1',
            quantity: initialStock,
            unitCost: new Prisma.Decimal(productData.costPrice || 0),
            totalValue: new Prisma.Decimal((productData.costPrice || 0) * initialStock),
            openingStock: 0,
            closingStock: initialStock,
            referenceType: 'INITIAL_STOCK',
            referenceId: product.id,
            serialNumbers: initialSerials || [],
            notes: 'Initial inventory registration',
            createdBy: user.name,
          },
        });
      }

      // Automatically record initial procurement as an Operating Expense
      const unitCost = Number(productData.costPrice || productData.purchasePrice || 0);
      const effectiveStock = initialStock > 0 ? initialStock : (unitCost > 0 ? 1 : 0);
      const totalExpenseAmount = unitCost * effectiveStock;

      let recordedExpense = null;
      if (totalExpenseAmount > 0) {
        const voucherNumber = 'EXP-PRD-' + Date.now().toString().slice(-6);
        recordedExpense = await tx.expense.create({
          data: {
            id: 'exp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            voucherNumber,
            category: 'Purchase Expenses',
            amount: new Prisma.Decimal(totalExpenseAmount),
            date: new Date(),
            paymentMethod: 'Cash',
            branchId: user.branchId || 'branch-main-1',
            description: `Product Catalog Inflow: ${product.name} (SKU: ${product.sku}) — ${effectiveStock} unit(s) @ ৳${unitCost.toLocaleString()}`,
            createdBy: user.name,
          },
        });

        // Deduct financial account balance if active account exists
        const account = await tx.financialAccount.findFirst({
          where: { isActive: true },
          orderBy: { name: 'asc' },
        });

        if (account) {
          await tx.financialAccount.update({
            where: { id: account.id },
            data: {
              balance: { decrement: new Prisma.Decimal(totalExpenseAmount) },
            },
          });
        }

        // Record Accounting Ledger Entry
        await tx.ledgerEntry.create({
          data: {
            id: 'led-' + Date.now(),
            date: new Date(),
            partyType: 'ACCOUNT',
            partyId: account?.id || 'main',
            referenceType: 'EXPENSE',
            referenceNumber: voucherNumber,
            description: `Catalog Stock Procurement: ${product.name} (${product.sku}) - ${effectiveStock} unit(s)`,
            debit: new Prisma.Decimal(0),
            credit: new Prisma.Decimal(totalExpenseAmount),
            runningBalance: new Prisma.Decimal(account ? Number(account.balance) - totalExpenseAmount : 0),
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'PRODUCT_CREATED',
          module: 'INVENTORY',
          recordId: product.id,
          details: `Created product ${product.name} (SKU: ${product.sku}). Initial stock: ${initialStock}${totalExpenseAmount > 0 ? ` (Recorded expense: ৳${totalExpenseAmount})` : ''}`,
        },
      });

      return { product, expense: recordedExpense };
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully.',
      product: result.product,
      expense: result.expense,
    });
  } catch (err: any) {
    console.error('Create product error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
