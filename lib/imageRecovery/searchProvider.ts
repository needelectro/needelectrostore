// NEED ELECTRO ERP — Multi-Tier Legitimate Product Image Search Engine
import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';
import { CandidateImage } from './types';
import { VERIFIED_OEM_TECH_CATALOG } from './oemCatalog';

interface SearchOptions {
  name: string;
  brand: string;
  model: string | null;
  category: string;
  sku: string;
  specs?: any;
}

/**
 * Perform an HTTP GET request and parse JSON.
 */
function fetchJson<T = any>(targetUrl: string, headers: Record<string, string> = {}): Promise<T | null> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(
        targetUrl,
        {
          headers: {
            'User-Agent': 'NeedElectroImageRecovery/1.0 (E-Commerce Catalog; contact.amdadur@gmail.com)',
            ...headers,
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            return resolve(null);
          }
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve(null);
            }
          });
          res.on('error', () => resolve(null));
        }
      );

      req.setTimeout(8000, () => {
        req.destroy();
        resolve(null);
      });
      req.on('error', () => resolve(null));
    } catch {
      resolve(null);
    }
  });
}

/**
 * Query 1: Google Custom Search JSON API (Official)
 */
async function searchGoogleCustomSearch(query: string): Promise<CandidateImage[]> {
  const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX || process.env.GOOGLE_CSE_ID;

  if (!apiKey || !cx) return [];

  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&searchType=image&key=${apiKey}&cx=${cx}&num=5&safe=active&imgType=photo`;
  const data = await fetchJson(url);

  if (!data || !data.items || !Array.isArray(data.items)) return [];

  return data.items.map((item: any) => ({
    url: item.link,
    thumbnailUrl: item.image?.thumbnailLink,
    sourceDomain: new URL(item.image?.contextLink || item.link).hostname,
    sourceType: 'GOOGLE_SEARCH',
    title: item.title,
    width: item.image?.width,
    height: item.image?.height,
    mimeType: item.mime,
    fileSizeBytes: item.image?.byteSize,
    confidenceScore: 0,
    matchReasons: ['Google Custom Search official API result'],
  }));
}

/**
 * Query 2: Bing Image Search API (Official)
 */
async function searchBingImageSearch(query: string): Promise<CandidateImage[]> {
  const apiKey = process.env.BING_SEARCH_API_KEY;
  if (!apiKey) return [];

  const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${encodeURIComponent(query)}&count=5&safeSearch=Moderate&imageType=Photo`;
  const data = await fetchJson(url, { 'Ocp-Apim-Subscription-Key': apiKey });

  if (!data || !data.value || !Array.isArray(data.value)) return [];

  return data.value.map((item: any) => ({
    url: item.contentUrl,
    thumbnailUrl: item.thumbnailUrl,
    sourceDomain: item.hostPageDisplayUrl || new URL(item.contentUrl).hostname,
    sourceType: 'BING_SEARCH',
    title: item.name,
    width: item.width,
    height: item.height,
    mimeType: item.encodingFormat ? `image/${item.encodingFormat.toLowerCase()}` : undefined,
    confidenceScore: 0,
    matchReasons: ['Bing Image Search official API result'],
  }));
}

/**
 * Query 3: Wikimedia Commons Open Tech Directory (Official & Public Domain)
 */
async function searchWikimediaCommons(query: string): Promise<CandidateImage[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata&format=json&origin=*`;
  const data = await fetchJson(url);

  if (!data || !data.query || !data.query.pages) return [];

  const pages = Object.values(data.query.pages) as any[];
  return pages
    .map((p: any) => {
      const info = p.imageinfo?.[0];
      if (!info || !info.url) return null;
      // Skip SVGs and non-photo files
      if (info.mime && !['image/jpeg', 'image/png', 'image/webp'].includes(info.mime)) {
        return null;
      }
      return {
        url: info.url,
        thumbnailUrl: info.thumburl || info.url,
        sourceDomain: 'commons.wikimedia.org',
        sourceType: 'WIKIMEDIA' as const,
        title: p.title,
        width: info.width,
        height: info.height,
        mimeType: info.mime,
        fileSizeBytes: info.size,
        confidenceScore: 0,
        license: info.extmetadata?.LicenseShortName?.value || 'Creative Commons / Public Domain',
        matchReasons: ['Wikimedia Commons open hardware media database'],
      };
    })
    .filter(Boolean) as CandidateImage[];
}

/**
 * Progressively construct refined query variants.
 */
export function buildRefinedQueries(opts: SearchOptions): string[] {
  const brand = (opts.brand && opts.brand.toLowerCase() !== 'generic') ? opts.brand.trim() : '';
  const model = opts.model ? opts.model.trim() : '';
  const name = opts.name ? opts.name.trim() : '';
  const category = opts.category ? opts.category.trim() : '';

  const queries: string[] = [];

  // Query 1: Exact brand + exact model
  if (brand && model) {
    queries.push(`${brand} ${model} official product image`);
  }

  // Query 2: Product Name + Category
  queries.push(`${name} ${category} product image`);

  // Query 3: Cleaned brand + model + specifications
  if (model) {
    queries.push(`${brand} ${model} hardware`);
  }

  return [...new Set(queries.map(q => q.trim()).filter(Boolean))];
}

/**
 * Execute multi-tier search for product images across verified sources.
 */
export async function searchProductImages(opts: SearchOptions): Promise<CandidateImage[]> {
  const candidates: CandidateImage[] = [];

  // 1. Check Verified OEM & Tech Distributor Catalog (Direct Match)
  const oemMatch = VERIFIED_OEM_TECH_CATALOG.find((entry) => {
    return entry.matcher(opts);
  });

  if (oemMatch) {
    candidates.push({
      url: oemMatch.imageUrl,
      thumbnailUrl: oemMatch.thumbnailUrl || oemMatch.imageUrl,
      sourceDomain: oemMatch.sourceDomain,
      sourceType: 'OEM_CDN',
      title: oemMatch.title,
      width: oemMatch.width,
      height: oemMatch.height,
      mimeType: oemMatch.mimeType || 'image/jpeg',
      confidenceScore: 98,
      matchReasons: [
        'Direct verified match from official OEM & authorized distributor hardware asset index',
        `Matched model pattern: ${oemMatch.modelIdentifier}`,
      ],
      license: 'Manufacturer Official Hardware Product Media',
    });
  }

  const queries = buildRefinedQueries(opts);

  // 2. Official Google Custom Search API (if configured)
  for (const q of queries) {
    if (candidates.length >= 4) break;
    const gResults = await searchGoogleCustomSearch(q);
    candidates.push(...gResults);
  }

  // 3. Official Bing Image Search API (if configured)
  for (const q of queries) {
    if (candidates.length >= 4) break;
    const bResults = await searchBingImageSearch(q);
    candidates.push(...bResults);
  }

  // 4. Wikimedia Commons Open Tech Directory
  for (const q of queries) {
    if (candidates.length >= 4) break;
    const wResults = await searchWikimediaCommons(q);
    candidates.push(...wResults);
  }

  return candidates;
}
