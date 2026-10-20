// NEED ELECTRO ERP — Banner Modification & Deletion Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'settings', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const updates = await req.json();

    const banner = await prisma.banner.findUnique({ where: { id: params.id } });
    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    const updated = await prisma.banner.update({
      where: { id: params.id },
      data: {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.subtitle !== undefined && { subtitle: updates.subtitle }),
        ...(updates.badge !== undefined && { badge: updates.badge }),
        ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
        ...(updates.mobileImageUrl !== undefined && { mobileImageUrl: updates.mobileImageUrl }),
        ...(updates.targetUrl !== undefined && { targetUrl: updates.targetUrl }),
        ...(updates.buttonText !== undefined && { buttonText: updates.buttonText }),
        ...(updates.sortOrder !== undefined && { sortOrder: Number(updates.sortOrder) }),
        ...(updates.isActive !== undefined && { isActive: Boolean(updates.isActive) }),
        ...(updates.placement !== undefined && { placement: updates.placement }),
        ...(updates.startDate !== undefined && { startDate: updates.startDate ? new Date(updates.startDate) : null }),
        ...(updates.endDate !== undefined && { endDate: updates.endDate ? new Date(updates.endDate) : null }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Banner updated successfully',
      banner: updated,
    });
  } catch (err: any) {
    console.error('Update banner error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'settings', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const banner = await prisma.banner.findUnique({ where: { id: params.id } });
    if (!banner) {
      return NextResponse.json({ success: false, error: 'Banner not found' }, { status: 404 });
    }

    await prisma.banner.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'DELETE_BANNER',
        module: 'SETTINGS',
        recordId: params.id,
        details: `Deleted banner '${banner.title}'`,
      },
    }).catch(err => console.warn('Audit error:', err.message));

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete banner error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
