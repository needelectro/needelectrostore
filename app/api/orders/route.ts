// NEED ELECTRO ERP & Customer Website — Direct Checkout & Orders API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticateRequest, requireAuth, hasPermission } from '@/lib/auth';
import { authenticateCustomer } from '@/lib/customerAuth';
import { createWebsiteOrderSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();
    const phone = searchParams.get('phone')?.trim();

    // If searching for a specific order by orderNumber & optional phone, allow customer lookup
    if (orderNumber) {
      const order = await prisma.websiteOrder.findUnique({
        where: { orderNumber },
      });

      if (!order) {
        return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      }

      // If phone is provided, verify it matches for privacy
      if (phone && order.customerPhone.replace(/\D/g, '') !== phone.replace(/\D/g, '')) {
        return NextResponse.json({ success: false, error: 'Customer phone does not match order record' }, { status: 403 });
      }

      return NextResponse.json({ success: true, data: order });
    }

    // Otherwise, listing orders requires administrative authentication
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required to view all orders' }, { status: 401 });
    }

    const status = searchParams.get('status');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 100);

    const where: any = {};
    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }

    const [orders, count] = await Promise.all([
      prisma.websiteOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.websiteOrder.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      count,
      data: orders,
    });
  } catch (err: any) {
    console.error('Website orders fetch error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createWebsiteOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      district,
      deliveryArea,
      deliveryNotes,
      paymentMethod,
      couponCode,
      items,
    } = parsed.data;

    // 1. Authoritative Server-Side Product & Stock Validation
    const productIds = items.map(i => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });

    if (dbProducts.length !== productIds.length) {
      const foundIds = new Set(dbProducts.map(p => p.id));
      const missing = productIds.filter(id => !foundIds.has(id));
      return NextResponse.json({
        success: false,
        error: `One or more products in your cart are no longer available (ID: ${missing.join(', ')}).`,
      }, { status: 400 });
    }

    // Build authoritative line items
    let subtotalNum = 0;
    const orderItems: Array<{
      productId: string;
      name: string;
      sku: string;
      category: string;
      price: number;
      quantity: number;
      total: number;
      imageUrl?: string;
      isSerialized: boolean;
      warrantyMonths: number;
    }> = [];

    for (const item of items) {
      const prod = dbProducts.find(p => p.id === item.productId)!;
      const unitPrice = Number(prod.retailPrice);
      const lineTotal = unitPrice * item.quantity;
      subtotalNum += lineTotal;

      orderItems.push({
        productId: prod.id,
        name: prod.name,
        sku: prod.sku,
        category: prod.category,
        price: unitPrice,
        quantity: item.quantity,
        total: lineTotal,
        imageUrl: prod.imageUrl || undefined,
        isSerialized: prod.isSerialized,
        warrantyMonths: prod.warrantyPeriodMonths || 0,
      });
    }

    // 2. Authoritative Delivery Charge Calculation
    // Standard nationwide rates for Bangladesh
    const cleanDistrict = district.trim().toLowerCase();
    const isLocalSylhetOrMoulvibazar =
      cleanDistrict.includes('moulvibazar') ||
      cleanDistrict.includes('moulvi') ||
      cleanDistrict.includes('sylhet');

    let deliveryChargeNum = isLocalSylhetOrMoulvibazar ? 60 : 120;
    // Free delivery for major orders over ৳50,000
    if (subtotalNum >= 50000) {
      deliveryChargeNum = 0;
    }

    // 2.1 Authoritative Coupon Validation & Discount
    let discountNum = 0;
    let validatedCouponId: string | null = null;
    if (couponCode && typeof couponCode === 'string' && couponCode.trim()) {
      const cleanCoupon = couponCode.trim().toUpperCase();
      const coupon = await prisma.coupon.findUnique({
        where: { code: cleanCoupon },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isStarted = !coupon.startDate || now >= coupon.startDate;
        const isNotExpired = !coupon.endDate || now <= coupon.endDate;
        const withinLimit = !coupon.usageLimit || coupon.usageCount < coupon.usageLimit;
        const meetsMin = subtotalNum >= Number(coupon.minOrderAmount);

        if (isStarted && isNotExpired && withinLimit && meetsMin) {
          validatedCouponId = coupon.id;
          const val = Number(coupon.discountValue);
          if (coupon.discountType === 'PERCENTAGE') {
            discountNum = Math.round((subtotalNum * val) / 100);
            if (coupon.maxDiscountAmount) {
              discountNum = Math.min(discountNum, Number(coupon.maxDiscountAmount));
            }
          } else {
            discountNum = Math.min(val, subtotalNum);
          }
        }
      }
    }

    const totalNum = Math.max(0, subtotalNum - discountNum + deliveryChargeNum);

    // 2.2 Idempotency / Duplicate Submission Prevention
    // If an identical order from this phone was submitted within the last 30 seconds, return the existing order
    const cleanPhone = customerPhone.trim();
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    const existingRecentOrder = await prisma.websiteOrder.findFirst({
      where: {
        customerPhone: cleanPhone,
        total: new Prisma.Decimal(totalNum),
        createdAt: { gte: thirtySecondsAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existingRecentOrder) {
      return NextResponse.json({
        success: true,
        message: 'Your order has been recorded successfully.',
        orderNumber: existingRecentOrder.orderNumber,
        order: existingRecentOrder,
        isDuplicate: true,
        summary: {
          subtotal: Number(existingRecentOrder.subtotal),
          deliveryCharge: Number(existingRecentOrder.deliveryCharge),
          total: Number(existingRecentOrder.total),
          paymentMethod: existingRecentOrder.paymentMethod,
          district: existingRecentOrder.district,
        },
      });
    }

    // 3. Generate Unique Order Number
    const orderNumber = `NEC-ORD-${Date.now().toString().slice(-6)}`;
    const websiteOrderId = `word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Check for authenticated customer session
    const authCustomer = await authenticateCustomer(req);

    // 4. Execute Atomic Transaction (Placing order does NOT deduct stock or create finalized Sale invoice)
    const transactionResult = await prisma.$transaction(async (tx) => {
      // Find or create customer
      let customer = authCustomer 
        ? await tx.customer.findUnique({ where: { id: authCustomer.id } })
        : await tx.customer.findFirst({ where: { phone: cleanPhone } });

      if (!customer) {
        const customerCode = `CUST-${Date.now().toString().slice(-6)}`;
        customer = await tx.customer.create({
          data: {
            id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            customerId: customerCode,
            name: customerName.trim(),
            phone: cleanPhone,
            email: customerEmail || null,
            address: `${deliveryAddress.trim()}, ${district.trim()}`,
            currentBalance: new Prisma.Decimal(0),
            creditLimit: new Prisma.Decimal(0),
            notes: 'Registered via direct website order checkout',
          },
        });
      }

      // Create WebsiteOrder record in PENDING state
      const websiteOrder = await tx.websiteOrder.create({
        data: {
          id: websiteOrderId,
          orderNumber,
          customerId: customer.id,
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          customerEmail: customerEmail || null,
          deliveryAddress: deliveryAddress.trim(),
          district: district.trim(),
          deliveryArea: deliveryArea || null,
          deliveryNotes: deliveryNotes || null,
          paymentMethod,
          subtotal: new Prisma.Decimal(subtotalNum),
          deliveryCharge: new Prisma.Decimal(deliveryChargeNum),
          discount: new Prisma.Decimal(discountNum),
          total: new Prisma.Decimal(totalNum),
          orderStatus: 'PENDING',
          paymentStatus: 'UNPAID', // Cash on Delivery: payment collected upon delivery
          fulfillmentStatus: 'UNFULFILLED',
          items: orderItems,
          saleInvoiceId: null, // Initialized as null; invoice is generated upon confirmation / billing in ERP
        },
      });

      // Log Audit Entry
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: 'system-storefront',
          userName: 'Online Customer Storefront',
          action: 'WEBSITE_ORDER_PLACED',
          module: 'SALES',
          recordId: websiteOrder.id,
          details: `Direct COD order ${orderNumber} created for ${customerName} (${cleanPhone}). Total: ৳${totalNum.toLocaleString()} BDT. Status: PENDING.`,
        },
      });

      return { websiteOrder };
    });

    return NextResponse.json({
      success: true,
      message: 'Your order has been placed successfully! Our representative will call you shortly to confirm delivery.',
      orderNumber,
      order: transactionResult.websiteOrder,
      summary: {
        subtotal: subtotalNum,
        deliveryCharge: deliveryChargeNum,
        total: totalNum,
        paymentMethod,
        district,
      },
    });
  } catch (err: any) {
    console.error('Order placement transaction error:', err);
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to process order. Please try again or contact support at 01733-983752.',
    }, { status: 500 });
  }
}
