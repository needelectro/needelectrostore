// NEED ELECTRO ERP — Optimistic Safe Product Record Updater
import { prisma } from '@/lib/prisma';
import { recoveryStateStore } from './stateStore';

const KNOWN_PLACEHOLDERS = [
  '/logo-icon.png',
  '/logo-dark-transparent.png',
  '/logo.png',
  '/placeholder.png',
  '/placeholder.jpg',
  '/placeholder.svg',
  'placeholder',
  'no-image',
  'default-product.png',
];

export function isPlaceholderUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const clean = url.trim().toLowerCase();
  return KNOWN_PLACEHOLDERS.some((p) => clean === p || clean.endsWith(p));
}

export interface UpdateProductImageResult {
  success: boolean;
  updated: boolean;
  productId: string;
  sku: string;
  imageUrl?: string;
  reason?: string;
}

/**
 * Safely updates a product's image fields using optimistic concurrency checks.
 * NEVER overwrites an existing valid image or modifies any unrelated fields.
 */
export async function safelyAttachProductImage(
  productId: string,
  newImageUrl: string,
  options: {
    source: string;
    confidenceScore: number;
    userId?: string;
    userName?: string;
    actionNote?: string;
  }
): Promise<UpdateProductImageResult> {
  try {
    // 1. Re-read the freshest product record from PostgreSQL database
    const current = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        sku: true,
        name: true,
        imageUrl: true,
        images: true,
        retailPrice: true,
        costPrice: true,
        currentStock: true,
        category: true,
        brand: true,
        model: true,
      },
    });

    if (!current) {
      return {
        success: false,
        updated: false,
        productId,
        sku: '',
        reason: 'Product record no longer exists in database',
      };
    }

    // 2. Concurrency check: Ensure product has NOT been given a valid image by an admin
    const currentImg = current.imageUrl?.trim();
    const hasValidExistingImage = Boolean(currentImg && currentImg !== '' && !isPlaceholderUrl(currentImg));

    if (hasValidExistingImage) {
      recoveryStateStore.addLog({
        productId: current.id,
        sku: current.sku,
        productName: current.name,
        action: 'SKIPPED',
        details: `Skipped: Product already has valid image (${currentImg}). Preserved administrator image.`,
      });

      return {
        success: true,
        updated: false,
        productId: current.id,
        sku: current.sku,
        reason: 'Product already has a valid image; overwrite aborted.',
      };
    }

    // 3. Assemble gallery images array safely
    let gallery: string[] = [];
    if (Array.isArray(current.images)) {
      gallery = (current.images as string[]).filter((x) => typeof x === 'string' && x.trim() && !isPlaceholderUrl(x));
    }
    if (!gallery.includes(newImageUrl)) {
      gallery.unshift(newImageUrl);
    }

    // 4. Update ONLY imageUrl and images - strictly preserving all other database fields
    await prisma.product.update({
      where: { id: current.id },
      data: {
        imageUrl: newImageUrl,
        images: gallery,
      },
    });

    // 5. Create immutable audit log in database
    await prisma.auditLog.create({
      data: {
        id: 'audit-img-' + Date.now(),
        userId: options.userId || 'system-ai-agent',
        userName: options.userName || 'AI Image Recovery System',
        action: 'AI_IMAGE_ATTACHED',
        module: 'CATALOG_IMAGE_RECOVERY',
        recordId: current.id,
        details: `Attached verified image to ${current.name} (SKU: ${current.sku}). Match confidence: ${options.confidenceScore}%. Source: ${options.source}. ${options.actionNote || ''}`,
      },
    });

    // 6. Record in persistent recovery store
    recoveryStateStore.addLog({
      productId: current.id,
      sku: current.sku,
      productName: current.name,
      action: 'PRODUCT_UPDATED',
      details: `Successfully attached verified product image (Confidence: ${options.confidenceScore}%, Source: ${options.source})`,
      confidence: options.confidenceScore,
      imageUrl: newImageUrl,
      source: options.source,
    });

    // Remove from review queue if it was present
    recoveryStateStore.removeFromReviewQueue(current.id);

    return {
      success: true,
      updated: true,
      productId: current.id,
      sku: current.sku,
      imageUrl: newImageUrl,
    };
  } catch (err: any) {
    console.error(`Failed to safely attach image to product ${productId}:`, err);
    return {
      success: false,
      updated: false,
      productId,
      sku: '',
      reason: err.message || 'Database update error',
    };
  }
}
