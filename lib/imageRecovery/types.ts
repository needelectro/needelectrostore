// NEED ELECTRO ERP — AI Product Image Recovery Engine Types
export type RecoveryStatus =
  | 'IDLE'
  | 'SCANNING'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED';

export type CandidateStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'REVIEW_REQUIRED'
  | 'DOWNLOAD_FAILED'
  | 'SKIPPED_ALREADY_VALID';

export interface CandidateImage {
  url: string;
  thumbnailUrl?: string;
  sourceDomain: string;
  sourceType: 'OEM_CDN' | 'GOOGLE_SEARCH' | 'BING_SEARCH' | 'WIKIMEDIA' | 'DISTRIBUTOR';
  title?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  fileSizeBytes?: number;
  confidenceScore: number;
  matchReasons: string[];
  rejectionReasons?: string[];
  license?: string;
}

export interface ReviewQueueItem {
  id: string; // queue item id
  productId: string;
  productName: string;
  sku: string;
  brand: string;
  model: string | null;
  category: string;
  candidateImage: CandidateImage;
  status: CandidateStatus;
  detectedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface RecoveryLogEntry {
  id: string;
  timestamp: string;
  productId: string;
  sku: string;
  productName: string;
  action: 'AUDIT_DETECTED' | 'SEARCH_MATCHED' | 'IMAGE_DOWNLOADED' | 'PRODUCT_UPDATED' | 'MANUAL_REVIEW_QUEUED' | 'REJECTED' | 'ERROR' | 'SKIPPED';
  details: string;
  confidence?: number;
  imageUrl?: string;
  source?: string;
}

export interface RecoverySettings {
  autoRecoverFutureProducts: boolean;
  minConfidenceAutoApprove: number; // default 80
  batchSize: number; // default 5
  requestDelayMs: number; // default 1000
  searchEnginePreference: 'AUTO' | 'OEM_THEN_SEARCH' | 'WIKIMEDIA_FIRST';
  googleSearchApiKey?: string;
  googleSearchCx?: string;
  bingSearchApiKey?: string;
}

export interface RecoveryJobState {
  status: RecoveryStatus;
  startedAt?: string;
  finishedAt?: string;
  totalProductsScanned: number;
  totalNeedingImages: number;
  totalRecovered: number;
  totalSkippedValid: number;
  totalAwaitingReview: number;
  totalFailed: number;
  currentIndex: number;
  currentProduct?: {
    id: string;
    name: string;
    sku: string;
  };
  lastError?: string;
}
