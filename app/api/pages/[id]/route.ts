// NEED ELECTRO ERP — Single Page Management API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const page = await prisma.websitePage.findUnique({
      where: { id: params.id },
    });
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, titleBn, content, contentBn, seoTitle, metaDescription, isPublished } = body;

    const updated = await prisma.websitePage.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(titleBn !== undefined && { titleBn: titleBn ? titleBn.trim() : null }),
        ...(content !== undefined && { content: content.trim() }),
        ...(contentBn !== undefined && { contentBn: contentBn ? contentBn.trim() : null }),
        ...(seoTitle !== undefined && { seoTitle: seoTitle ? seoTitle.trim() : null }),
        ...(metaDescription !== undefined && { metaDescription: metaDescription ? metaDescription.trim() : null }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.websitePage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Page deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
