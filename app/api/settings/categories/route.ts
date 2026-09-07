// NEED ELECTRO ERP — Category Settings Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const cat = await req.json();

  if (cat.id) {
    await prisma.categoryConfig.update({
      where: { id: cat.id },
      data: {
        name: cat.name,
        code: cat.code,
        description: cat.description,
        icon: cat.icon,
        subcategories: cat.subcategories || [],
        attributes: cat.attributes || [],
        isSerializedDefault: Boolean(cat.isSerializedDefault),
        defaultWarrantyMonths: Number(cat.defaultWarrantyMonths || 0),
        isActive: cat.isActive !== undefined ? cat.isActive : true,
      },
    });
    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  }

  const category = await prisma.categoryConfig.create({
    data: {
      id: 'cat-' + Date.now(),
      name: cat.name,
      code: cat.code.toUpperCase().replace(/\s+/g, '_'),
      description: cat.description,
      icon: cat.icon,
      subcategories: cat.subcategories || [],
      attributes: cat.attributes || [],
      isSerializedDefault: Boolean(cat.isSerializedDefault),
      defaultWarrantyMonths: Number(cat.defaultWarrantyMonths || 0),
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, message: 'Category created', data: category });
}
