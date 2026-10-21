// NEED ELECTRO ERP — Secure Image Downloader & Storage Pipeline
import crypto from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import { validateExternalImageUrl } from './ssrfGuard';
import { uploadToStorage } from '@/lib/supabase';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB max
const MIN_BYTES = 2 * 1024; // 2 KB minimum (filters 1x1 tracking pixels)
const TIMEOUT_MS = 10000; // 10s timeout
const MAX_REDIRECTS = 3;

interface MagicByteCheck {
  mime: string;
  ext: string;
}

/**
 * Inspect magic bytes of binary buffer to verify authentic image payload.
 */
function detectImageFormat(buffer: Buffer): MagicByteCheck | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4E &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0D &&
    buffer[5] === 0x0A &&
    buffer[6] === 0x1A &&
    buffer[7] === 0x0A
  ) {
    return { mime: 'image/png', ext: 'png' };
  }

  // WebP: 'RIFF' .... 'WEBP'
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return { mime: 'image/webp', ext: 'webp' };
  }

  // AVIF: bytes 4-8 'ftyp', bytes 8-12 'avif' / 'avis' / 'mif1'
  if (buffer.toString('ascii', 4, 8) === 'ftyp') {
    const brand = buffer.toString('ascii', 8, 12);
    if (brand === 'avif' || brand === 'avis' || brand === 'mif1') {
      return { mime: 'image/avif', ext: 'avif' };
    }
  }

  return null;
}

/**
 * Stream binary data from safe URL with strict size, timeout, and redirect enforcement.
 */
function downloadBuffer(targetUrl: string, redirectCount = 0): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise(async (resolve, reject) => {
    if (redirectCount > MAX_REDIRECTS) {
      return reject(new Error('Too many redirects while downloading candidate image'));
    }

    // SSRF verification on every hop
    const ssrfCheck = await validateExternalImageUrl(targetUrl);
    if (!ssrfCheck.valid) {
      return reject(new Error(`SSRF violation: ${ssrfCheck.error}`));
    }

    const parsed = new URL(targetUrl);
    const client = parsed.protocol === 'https:' ? https : http;

    const req = client.get(
      targetUrl,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      },
      (res) => {
        // Handle Redirects
        if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode)) {
          const loc = res.headers.location;
          if (!loc) return reject(new Error('Redirect missing location header'));
          const nextUrl = new URL(loc, targetUrl).toString();
          return resolve(downloadBuffer(nextUrl, redirectCount + 1));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Server returned status HTTP ${res.statusCode}`));
        }

        const rawContentType = res.headers['content-type'] || 'image/jpeg';
        const chunks: Buffer[] = [];
        let totalReceived = 0;

        res.on('data', (chunk: Buffer) => {
          totalReceived += chunk.length;
          if (totalReceived > MAX_BYTES) {
            req.destroy();
            return reject(new Error(`Image exceeds maximum allowed size of 5MB (${totalReceived} bytes)`));
          }
          chunks.push(chunk);
        });

        res.on('end', () => {
          const fullBuffer = Buffer.concat(chunks);
          if (fullBuffer.length < MIN_BYTES) {
            return reject(new Error(`Image too small (${fullBuffer.length} bytes), possible tracking pixel or invalid file`));
          }
          resolve({ buffer: fullBuffer, contentType: rawContentType });
        });

        res.on('error', (err) => reject(err));
      }
    );

    req.setTimeout(TIMEOUT_MS, () => {
      req.destroy();
      reject(new Error(`Download timed out after ${TIMEOUT_MS}ms`));
    });

    req.on('error', (err) => reject(err));
  });
}

export interface StoredImageResult {
  success: boolean;
  publicUrl?: string;
  mimeType?: string;
  byteSize?: number;
  fileName?: string;
  error?: string;
}

/**
 * Downloads candidate image from verified external source and persists it into storage.
 */
export async function downloadAndPersistProductImage(
  sourceUrl: string,
  productId: string,
  sku: string
): Promise<StoredImageResult> {
  try {
    const { buffer } = await downloadBuffer(sourceUrl);

    // Verify magic bytes
    const format = detectImageFormat(buffer);
    if (!format) {
      return {
        success: false,
        error: 'Binary payload failed magic byte image format verification (must be valid JPEG, PNG, or WebP)',
      };
    }

    // Generate safe, unique storage path
    const sanitizedSku = sku.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
    const hash = crypto.randomBytes(6).toString('hex');
    const fileName = `${sanitizedSku}_${Date.now()}_${hash}.${format.ext}`;
    const storagePath = `products/recovered/${fileName}`;

    // Upload to existing storage system
    const uploadResult = await uploadToStorage(storagePath, buffer, format.mime);
    if (!uploadResult.success || !uploadResult.publicUrl) {
      return {
        success: false,
        error: uploadResult.error || 'Failed to upload image into application storage',
      };
    }

    return {
      success: true,
      publicUrl: uploadResult.publicUrl,
      mimeType: format.mime,
      byteSize: buffer.length,
      fileName,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Image download and storage failed',
    };
  }
}
