// NEED ELECTRO — Customer Review Image Upload Route
import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customerAuth';
import { uploadToStorage } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Sign in to upload review photos' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Maximum 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image file size exceeds maximum 5MB limit' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (file.type && !allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported image format (${file.type}). Allowed formats: JPG, PNG, WebP.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const rawExt = (file.name.split('.').pop() || 'jpg').toLowerCase();
    const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(rawExt) ? rawExt : 'jpg';
    const cleanFileName = `reviews/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;

    const result = await uploadToStorage(cleanFileName, buffer, file.type || 'image/jpeg');

    if (!result.success || !result.publicUrl) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to upload photo' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl: result.publicUrl,
      fileName: file.name,
    });
  } catch (err: any) {
    console.error('Review image upload error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Image upload failed' },
      { status: 500 }
    );
  }
}
