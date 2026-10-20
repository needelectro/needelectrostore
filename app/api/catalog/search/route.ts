// NEED ELECTRO Customer Search API — Fast Public Catalog Search
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim();
    const category = searchParams.get('category')?.trim();
    const brand = searchParams.get('brand')?.trim();
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10), 1), 50);

    const where: any = {
      isPublished: true,
      status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
    };

    if (category && category !== 'ALL') {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (brand && brand !== 'ALL') {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
        { model: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        brand: true,
        model: true,
        description: true,
        imageUrl: true,
        retailPrice: true,
        emiPrice: true,
        currentStock: true,
        warrantyPeriodMonths: true,
        specs: true,
        status: true,
      },
      take: limit,
      orderBy: [
        { currentStock: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    const formatted = products.map(p => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      slug: `${slugify(p.name)}-${p.sku.toLowerCase()}`,
      category: p.category,
      brand: p.brand,
      model: p.model,
      description: p.description,
      imageUrl: p.imageUrl,
      retailPrice: Number(p.retailPrice),
      emiPrice: Number(p.emiPrice),
      currentStock: p.currentStock,
      warrantyPeriodMonths: p.warrantyPeriodMonths,
      specs: p.specs,
      status: p.status,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (error: any) {
    console.error('Customer catalog search error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search catalog' },
      { status: 500 }
    );
  }
}
