// NEED ELECTRO Store — Product Sharing Utilities & Canonical Link Engine
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';

export type ShareMethod =
  | 'copy_link'
  | 'whatsapp'
  | 'facebook'
  | 'messenger'
  | 'telegram'
  | 'email'
  | 'native';

export interface ShareProductPayload {
  id: string;
  name: string;
  sku: string;
  retailPrice: number;
  imageUrl?: string | null;
  category?: string | null;
  description?: string | null;
  referralCode?: string | null;
}

/**
 * Builds the canonical, SEO-friendly product URL without spurious tracking parameters.
 * Supports optional referral code (?ref=...) when explicitly configured.
 */
export function getProductCanonicalUrl(product: {
  name: string;
  sku: string;
  referralCode?: string | null;
}): string {
  const slug = `${slugify(product.name)}-${product.sku.toLowerCase()}`;
  const base = BUSINESS_INFO.domain.replace(/\/+$/, '');
  const url = `${base}/product/${slug}`;

  if (product.referralCode && product.referralCode.trim()) {
    const cleanRef = encodeURIComponent(product.referralCode.trim());
    return `${url}?ref=${cleanRef}`;
  }

  return url;
}

/**
 * Generates the standardized NEED ELECTRO dynamic sharing message.
 */
export function buildProductShareText(product: {
  name: string;
  retailPrice: number;
  url: string;
}): string {
  const priceFormatted = Number(product.retailPrice).toLocaleString('en-US');
  return (
    `Check out this product from ${BUSINESS_INFO.name}!\n\n` +
    `${product.name}\n` +
    `Price: ${BUSINESS_INFO.currencySymbol}${priceFormatted}\n\n` +
    `Explore product details and order online:\n` +
    `${product.url}\n\n` +
    `${BUSINESS_INFO.name} — ${BUSINESS_INFO.tagline}`
  );
}

/**
 * Generates official share destination URLs with graceful fallbacks.
 */
export function getShareDestinationUrl(
  method: ShareMethod,
  product: {
    name: string;
    retailPrice: number;
    url: string;
  }
): string | null {
  const shareText = buildProductShareText(product);
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(product.url);

  switch (method) {
    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedText}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case 'messenger':
      // Direct Facebook Messenger Web / App Dialog
      return `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`;

    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;

    case 'email': {
      const subject = encodeURIComponent(`Check out ${product.name} on ${BUSINESS_INFO.name}`);
      return `mailto:?subject=${subject}&body=${encodedText}`;
    }

    case 'copy_link':
    case 'native':
    default:
      return null;
  }
}

/**
 * Robust clipboard copy with modern Clipboard API and legacy document.execCommand fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Modern Async Clipboard API
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for older browsers, iOS webviews, or restricted iframe permissions
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
    return false;
  }
}

/**
 * Feature detection for the Web Share API.
 */
export function isWebShareSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Execute native device share via Web Share API.
 */
export async function triggerNativeShare(product: {
  name: string;
  retailPrice: number;
  url: string;
}): Promise<boolean> {
  if (!isWebShareSupported()) return false;

  try {
    const shareText = buildProductShareText(product);
    await navigator.share({
      title: `${product.name} | ${BUSINESS_INFO.name}`,
      text: shareText,
      url: product.url,
    });
    return true;
  } catch (error: any) {
    // User cancelled share or abort error is normal; log only genuine errors
    if (error?.name !== 'AbortError') {
      console.warn('Native share failed:', error);
    }
    return false;
  }
}

/**
 * Fire-and-forget share activity logging.
 * Never throws or blocks customer interaction.
 */
export function trackProductShare(data: {
  productId: string;
  productSku?: string;
  method: ShareMethod | string;
  referrer?: string;
}): void {
  if (typeof window === 'undefined') return;

  try {
    const payload = JSON.stringify({
      productId: data.productId,
      productSku: data.productSku,
      method: data.method,
      referrer: data.referrer,
      timestamp: new Date().toISOString(),
    });

    if (navigator?.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon('/api/analytics/share', blob);
      if (sent) return;
    }

    fetch('/api/analytics/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Fire-and-forget: do not interrupt user experience if analytics fails
    });
  } catch {
    // Gracefully ignore analytics failures
  }
}
