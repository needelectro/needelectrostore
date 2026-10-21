// NEED ELECTRO ERP — Banners & Promotional Content API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { bannerSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const placement = searchParams.get('placement');

    const now = new Date();
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
      where.AND = [
        {
          OR: [
            { startDate: null },
            { startDate: { lte: now } },
          ],
        },
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } },
          ],
        },
      ];
    }
    if (placement) {
      where.placement = placement;
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const enriched = banners.map((b) => {
      let status: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED' = 'ACTIVE';
      if (!b.isActive) {
        status = 'DISABLED';
      } else if (b.startDate && new Date(b.startDate) > now) {
        status = 'SCHEDULED';
      } else if (b.endDate && new Date(b.endDate) < now) {
        status = 'EXPIRED';
      }
      return {
        ...b,
        campaignStatus: status,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (err: any) {
    console.error('Fetch banners error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'settings', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = parsed.data;
    const bannerId = 'ban-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    const banner = await prisma.banner.create({
      data: {
        id: bannerId,
        title: data.title,
        subtitle: data.subtitle || null,
        badge: data.badge || null,
        imageUrl: data.imageUrl,
        mobileImageUrl: data.mobileImageUrl || null,
        targetUrl: data.targetUrl || null,
        buttonText: data.buttonText || 'Shop Now',
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        placement: data.placement || 'HERO',
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'CREATE_BANNER',
        module: 'SETTINGS',
        recordId: banner.id,
        details: `Created banner '${banner.title}'`,
      },
    }).catch(err => console.warn('Audit log write error:', err.message));

    return NextResponse.json({
      success: true,
      message: 'Banner created successfully',
      banner,
    });
  } catch (err: any) {
    console.error('Create banner error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
