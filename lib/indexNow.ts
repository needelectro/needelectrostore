// IndexNow Integration for NEED ELECTRO
// Automatically notifies Bing, Yandex, Seznam, and IndexNow-compatible search engines
// of newly published, updated, or deleted URLs.

import { BUSINESS_INFO } from './seoConfig';

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'c4a5f6e8b91240a3d76251c54b88392e';
export const INDEXNOW_HOST = 'www.needelectro.store';

export interface IndexNowResponse {
  success: boolean;
  status?: number;
  message?: string;
  error?: string;
}

/**
 * Submits an array of canonical URLs to the IndexNow API endpoint.
 * Search engines like Bing and Yandex will immediately queue these URLs for crawling.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResponse> {
  if (!urls || urls.length === 0) {
    return { success: false, message: 'No URLs provided for IndexNow submission' };
  }

  // Filter out private or non-canonical URLs
  const cleanUrls = urls
    .map((u) => {
      if (u.startsWith('http://') || u.startsWith('https://')) {
        return u;
      }
      const path = u.startsWith('/') ? u : `/${u}`;
      return `https://${INDEXNOW_HOST}${path}`;
    })
    .filter((u) => {
      const lower = u.toLowerCase();
      return (
        !lower.includes('/admin') &&
        !lower.includes('/erp') &&
        !lower.includes('/checkout') &&
        !lower.includes('/dashboard') &&
        !lower.includes('/api/')
      );
    });

  if (cleanUrls.length === 0) {
    return { success: false, message: 'No public indexable URLs to submit' };
  }

  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `https://${INDEXNOW_HOST}/${INDEXNOW_KEY}.txt`,
    urlList: cleanUrls.slice(0, 10000), // IndexNow max limit per batch
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 200 || res.status === 202) {
      return {
        success: true,
        status: res.status,
        message: `Successfully submitted ${cleanUrls.length} URLs to IndexNow (Status: ${res.status})`,
      };
    }

    const errText = await res.text().catch(() => '');
    return {
      success: false,
      status: res.status,
      error: `IndexNow returned status ${res.status}: ${errText}`,
    };
  } catch (err: any) {
    console.error('Failed to submit to IndexNow:', err);
    return {
      success: false,
      error: err.message || 'Unknown network error during IndexNow submission',
    };
  }
}
