// NEED ELECTRO ERP — AI-Powered Image Matching & Safety Verification Engine
import { CandidateImage, CandidateStatus } from './types';

export interface VerificationEvaluation {
  status: CandidateStatus;
  confidenceScore: number;
  matchReasons: string[];
  rejectionReasons: string[];
  isDigitalService: boolean;
}

const REJECT_KEYWORDS = [
  'clipart',
  'vector',
  'wallpaper',
  'advertisement',
  'promotional-banner',
  'empty-box',
  'box-only',
  'disassembled',
  'broken-parts',
  'lightning-icon',
  'placeholder',
  'logo-vector',
  'cartoon',
];

const DIGITAL_SERVICE_PATTERNS = [
  'follower',
  'hosting',
  'domain',
  'website development',
  'custom website',
  'software license',
  'seo service',
];

/**
 * Check if a product record represents a non-physical digital service.
 */
export function isDigitalServiceProduct(name: string, category: string): boolean {
  const text = `${name} ${category}`.toLowerCase();
  return DIGITAL_SERVICE_PATTERNS.some((pat) => text.includes(pat));
}

/**
 * Extract generation token (e.g. 'g3', 'g5', 'g6', 'g7', 'g8', 'g9') if present.
 */
function extractGeneration(str: string): string | null {
  const match = str.toLowerCase().match(/\b(g[1-9]|gen\s*[1-9]|generation\s*[1-9])\b/);
  return match ? match[1].replace(/\s+/g, '') : null;
}

/**
 * Extract 3-to-4 digit model numbers (e.g. 5420, 5320, 5400, 840, 845, 640).
 */
function extractModelNumbers(str: string): string[] {
  const matches = str.match(/\b\d{3,4}[a-zA-Z]?\b/g);
  return matches ? matches.map((m) => m.toLowerCase()) : [];
}

/**
 * Rigorously verify candidate product image against product metadata.
 */
export function verifyCandidateImage(
  candidate: CandidateImage,
  product: {
    name: string;
    brand: string;
    model: string | null;
    category: string;
    specs?: any;
  }
): VerificationEvaluation {
  const matchReasons: string[] = [...(candidate.matchReasons || [])];
  const rejectionReasons: string[] = [];

  const productName = product.name.toLowerCase();
  const productBrand = product.brand.toLowerCase();
  const productModel = (product.model || '').toLowerCase();
  const productCategory = product.category.toLowerCase();
  const candidateTitle = (candidate.title || '').toLowerCase();
  const candidateUrl = candidate.url.toLowerCase();

  // 1. Digital Service Detection
  if (isDigitalServiceProduct(product.name, product.category)) {
    return {
      status: 'REVIEW_REQUIRED',
      confidenceScore: 60,
      matchReasons: ['Product identified as non-physical digital service. Requires manual confirmation.'],
      rejectionReasons: [],
      isDigitalService: true,
    };
  }

  // 2. Reject Disallowed Keywords (logos, cartoons, clipart, empty boxes)
  for (const badWord of REJECT_KEYWORDS) {
    if (candidateTitle.includes(badWord) || candidateUrl.includes(badWord)) {
      rejectionReasons.push(`Title or URL contains rejected keyword '${badWord}'`);
      return {
        status: 'REJECTED',
        confidenceScore: 10,
        matchReasons,
        rejectionReasons,
        isDigitalService: false,
      };
    }
  }

  // 3. Image Dimensions & Aspect Ratio Check
  if (candidate.width && candidate.height) {
    if (candidate.width < 180 || candidate.height < 180) {
      rejectionReasons.push(`Resolution is too low (${candidate.width}x${candidate.height}px, min 180x180 required)`);
      return {
        status: 'REJECTED',
        confidenceScore: 20,
        matchReasons,
        rejectionReasons,
        isDigitalService: false,
      };
    }

    const ratio = candidate.width / candidate.height;
    if (ratio > 3.0 || ratio < 0.33) {
      rejectionReasons.push(`Unusual aspect ratio (${ratio.toFixed(2)}:1) indicates a banner, strip, or wallpaper`);
      return {
        status: 'REJECTED',
        confidenceScore: 25,
        matchReasons,
        rejectionReasons,
        isDigitalService: false,
      };
    }
    matchReasons.push(`Optimal resolution and aspect ratio (${candidate.width}x${candidate.height}px, ${ratio.toFixed(2)}:1)`);
  }

  let score = 50; // Baseline

  // 4. Source Trust Evaluation
  if (candidate.sourceType === 'OEM_CDN') {
    score += 30;
    matchReasons.push('Verified direct OEM official hardware CDN source');
  } else if (candidate.sourceType === 'WIKIMEDIA') {
    score += 15;
    matchReasons.push('Wikimedia Commons verified community open hardware media');
  } else if (candidate.sourceDomain.includes('dell.com') || candidate.sourceDomain.includes('hp.com') || candidate.sourceDomain.includes('logitech.com')) {
    score += 25;
    matchReasons.push(`Official brand manufacturer domain: ${candidate.sourceDomain}`);
  }

  // 5. Laptop Generation Consistency
  const expectedGen = extractGeneration(`${productName} ${productModel}`);
  const candidateGen = extractGeneration(candidateTitle);
  if (expectedGen && candidateGen) {
    if (expectedGen === candidateGen) {
      score += 20;
      matchReasons.push(`Laptop generation matched: ${expectedGen.toUpperCase()}`);
    } else {
      rejectionReasons.push(`Generation mismatch: expected ${expectedGen.toUpperCase()} but candidate is ${candidateGen.toUpperCase()}`);
      return {
        status: 'REJECTED',
        confidenceScore: 15,
        matchReasons,
        rejectionReasons,
        isDigitalService: false,
      };
    }
  }

  // 6. Exact Model Number Consistency
  const expectedModels = extractModelNumbers(`${productName} ${productModel}`);
  const candidateModels = extractModelNumbers(candidateTitle);
  if (expectedModels.length > 0) {
    const hasModelMatch = expectedModels.some((em) => candidateModels.includes(em) || candidateTitle.includes(em));
    if (hasModelMatch) {
      score += 25;
      matchReasons.push(`Exact model number verified: ${expectedModels.join(', ')}`);
    } else if (candidate.sourceType !== 'OEM_CDN') {
      score -= 20;
      rejectionReasons.push(`Could not confirm exact model number match for: ${expectedModels.join(', ')}`);
    }
  }

  // 7. Brand Consistency
  if (productBrand !== 'generic' && productBrand.length > 1) {
    if (candidateTitle.includes(productBrand) || candidateUrl.includes(productBrand)) {
      score += 10;
      matchReasons.push(`Brand matched: ${product.brand}`);
    } else if (candidate.sourceType !== 'OEM_CDN') {
      score -= 15;
      rejectionReasons.push(`Candidate image lacks brand identifier '${product.brand}'`);
    }
  }

  // 8. Category Compatibility
  if (productCategory.includes('laptop') && (candidateTitle.includes('laptop') || candidateTitle.includes('notebook') || candidateTitle.includes('ultrabook'))) {
    score += 10;
    matchReasons.push('Category confirmed as laptop computer');
  } else if (productCategory.includes('cctv') && (candidateTitle.includes('camera') || candidateTitle.includes('cctv') || candidateTitle.includes('ip camera'))) {
    score += 10;
    matchReasons.push('Category confirmed as security/CCTV camera');
  } else if (productCategory.includes('accessories') || productCategory.includes('mouse') || productCategory.includes('keyboard')) {
    score += 5;
    matchReasons.push('Category matched as computer peripheral/accessory');
  }

  // Clamp Score
  const finalScore = Math.max(0, Math.min(100, score));

  // Determine Final Status
  let status: CandidateStatus = 'REJECTED';
  if (finalScore >= 80) {
    status = 'APPROVED';
  } else if (finalScore >= 50) {
    status = 'REVIEW_REQUIRED';
  }

  return {
    status,
    confidenceScore: finalScore,
    matchReasons,
    rejectionReasons,
    isDigitalService: false,
  };
}
