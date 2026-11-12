// NEED ELECTRO — Customer & Guest Review Image Upload Route
import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customerAuth';
import { uploadToStorage } from '@/lib/supabase';
import { extractClientIp, detectImageMimeFromMagicBytes } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

const GUEST_UPLOAD_WINDOW_MS = 15 * 60 * 1000;
const GUEST_UPLOAD_MAX_PER_WINDOW = 10;

function isGuestUploadRateLimited(ip: string): boolean {
  if (!ip || ip === 'unknown') return false;
  const g = globalThis as typeof globalThis & { __guestReviewUploadMap?: Map<string, number[]> };
  if (!g.__guestReviewUploadMap) {
    g.__guestReviewUploadMap = new Map<string, number[]>();
  }
  const now = Date.now();
  const recent = (g.__guestReviewUploadMap.get(ip) || []).filter(
    (ts) => now - ts < GUEST_UPLOAD_WINDOW_MS
  );
  if (recent.length >= GUEST_UPLOAD_MAX_PER_WINDOW) {
    g.__guestReviewUploadMap.set(ip, recent);
    return true;
  }
  recent.push(now);
  g.__guestReviewUploadMap.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      const clientIp = extractClientIp(req);
      if (isGuestUploadRateLimited(clientIp)) {
        return NextResponse.json(
          { success: false, error: 'Too many photo uploads. Please wait a few minutes before uploading again.' },
          { status: 429 }
        );
      }
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
    const detectedMime = detectImageMimeFromMagicBytes(buffer);
    if (!detectedMime) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid image file data. Please upload a real JPG, PNG, or WebP photo.',
        },
        { status: 400 }
      );
    }

    const safeExt =
      detectedMime === 'image/png' ? 'png' : detectedMime === 'image/webp' ? 'webp' : 'jpg';
    const cleanFileName = `reviews/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${safeExt}`;

    const result = await uploadToStorage(cleanFileName, buffer, detectedMime);

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
