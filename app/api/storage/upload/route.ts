// NEED ELECTRO ERP — Supabase File Storage Upload Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadToStorage } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Maximum 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Image size exceeds maximum 5MB limit' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (file.type && !allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file type: ${file.type}. Allowed formats: JPEG, PNG, WebP, GIF, SVG.`,
      }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(rawExt) ? rawExt : 'jpg';
    const cleanFileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${safeExt}`;

    const result = await uploadToStorage(cleanFileName, buffer, file.type || 'image/jpeg');

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      publicUrl: result.publicUrl,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
