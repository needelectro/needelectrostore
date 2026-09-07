// NEED ELECTRO ERP — Bulk Data Import Validation Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { entityType, rows } = await req.json();

  if (!rows || !Array.isArray(rows)) {
    return NextResponse.json({ success: false, error: 'Rows array required' }, { status: 400 });
  }

  const errors: string[] = [];
  const validRows: any[] = [];

  rows.forEach((row, idx) => {
    if (entityType === 'products') {
      if (!row.name || !row.sku) {
        errors.push(`Row ${idx + 1}: Name and SKU are required`);
      } else {
        validRows.push(row);
      }
    } else if (entityType === 'customers') {
      if (!row.name || !row.phone) {
        errors.push(`Row ${idx + 1}: Name and Phone are required`);
      } else {
        validRows.push(row);
      }
    } else {
      validRows.push(row);
    }
  });

  return NextResponse.json({
    success: true,
    summary: {
      total: rows.length,
      valid: validRows.length,
      invalid: errors.length,
    },
    errors,
    duplicates: [],
    preview: validRows.slice(0, 5),
  });
}
