// NEED ELECTRO ERP — AI Product Image Recovery Engine Orchestrator
import { prisma } from '@/lib/prisma';
import { recoveryStateStore } from './stateStore';
import { searchProductImages } from './searchProvider';
import { verifyCandidateImage } from './verifier';
import { downloadAndPersistProductImage } from './downloader';
import { safelyAttachProductImage, isPlaceholderUrl } from './updater';
import { CandidateImage, ReviewQueueItem } from './types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const recoveryEngine = {
  /**
   * Scan entire database catalog and categorize products without modifying records.
   */
  async scanCatalog(): Promise<{
    totalScanned: number;
    needingImages: number;
    validImages: number;
    placeholders: number;
    productsNeedingImages: Array<{ id: string; name: string; sku: string; brand: string; model: string | null; category: string }>;
  }> {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        sku: true,
        brand: true,
        model: true,
        category: true,
        imageUrl: true,
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let validCount = 0;
    let emptyCount = 0;
    let placeholderCount = 0;
    const needingImagesList: Array<{ id: string; name: string; sku: string; brand: string; model: string | null; category: string }> = [];

    for (const p of products) {
      const raw = p.imageUrl?.trim();
      const hasRaw = Boolean(raw && raw !== '' && raw !== 'null');
      const placeholder = isPlaceholderUrl(raw);

      if (!hasRaw) {
        emptyCount++;
        needingImagesList.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          brand: p.brand,
          model: p.model,
          category: p.category,
        });
      } else if (placeholder) {
        placeholderCount++;
        needingImagesList.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          brand: p.brand,
          model: p.model,
          category: p.category,
        });
      } else {
        validCount++;
      }
    }

    const totalNeeding = emptyCount + placeholderCount;

    recoveryStateStore.updateJob({
      totalProductsScanned: products.length,
      totalNeedingImages: totalNeeding,
      totalSkippedValid: validCount,
    });

    return {
      totalScanned: products.length,
      needingImages: totalNeeding,
      validImages: validCount,
      placeholders: placeholderCount,
      productsNeedingImages: needingImagesList,
    };
  },

  /**
   * Process a single product through search, AI verification, download, and optimistic update.
   */
  async processSingleProduct(
    product: {
      id: string;
      name: string;
      sku: string;
      brand: string;
      model: string | null;
      category: string;
      specs?: any;
    },
    options?: {
      userId?: string;
      userName?: string;
      forceAutoApprove?: boolean;
    }
  ): Promise<{ status: 'RECOVERED' | 'REVIEW_QUEUED' | 'SKIPPED' | 'FAILED'; details: string; imageUrl?: string }> {
    const settings = recoveryStateStore.getSettings();

    // 1. Search for candidate images from multi-tier verified sources
    const candidates = await searchProductImages({
      name: product.name,
      brand: product.brand,
      model: product.model,
      category: product.category,
      sku: product.sku,
      specs: product.specs,
    });

    if (!candidates || candidates.length === 0) {
      recoveryStateStore.addLog({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        action: 'ERROR',
        details: `No suitable images found across search providers for query "${product.name} ${product.model || ''}"`,
      });

      return {
        status: 'FAILED',
        details: 'No candidate images found',
      };
    }

    // 2. Evaluate all candidates with AI verifier and find the top match
    let bestCandidate: CandidateImage | null = null;
    let bestEvaluation: any = null;

    for (const cand of candidates) {
      const evaluation = verifyCandidateImage(cand, product);
      if (!bestEvaluation || evaluation.confidenceScore > bestEvaluation.confidenceScore) {
        bestEvaluation = evaluation;
        bestCandidate = {
          ...cand,
          confidenceScore: evaluation.confidenceScore,
          matchReasons: evaluation.matchReasons,
          rejectionReasons: evaluation.rejectionReasons,
        };
      }
    }

    if (!bestCandidate || !bestEvaluation) {
      return { status: 'FAILED', details: 'All candidate images were rejected during verification' };
    }

    // 3. If Candidate requires manual review or falls below auto-approval threshold
    const minConfidence = options?.forceAutoApprove ? 50 : settings.minConfidenceAutoApprove;
    const shouldAutoApprove = bestEvaluation.status === 'APPROVED' && bestEvaluation.confidenceScore >= minConfidence;

    if (!shouldAutoApprove) {
      // Add to review queue for administrator inspection
      const queueItem: ReviewQueueItem = {
        id: 'q-' + product.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        brand: product.brand,
        model: product.model,
        category: product.category,
        candidateImage: bestCandidate,
        status: 'REVIEW_REQUIRED',
        detectedAt: new Date().toISOString(),
        notes: bestEvaluation.isDigitalService
          ? 'Digital Service: Requires manual review'
          : `Confidence score ${bestEvaluation.confidenceScore}% (requires >= ${minConfidence}% for auto-approval)`,
      };

      recoveryStateStore.addToReviewQueue(queueItem);
      recoveryStateStore.addLog({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        action: 'MANUAL_REVIEW_QUEUED',
        details: `Queued for admin review (Confidence: ${bestEvaluation.confidenceScore}%, Source: ${bestCandidate.sourceDomain})`,
        confidence: bestEvaluation.confidenceScore,
        imageUrl: bestCandidate.url,
        source: bestCandidate.sourceDomain,
      });

      return {
        status: 'REVIEW_QUEUED',
        details: `Queued for manual review with match score of ${bestEvaluation.confidenceScore}%`,
        imageUrl: bestCandidate.url,
      };
    }

    // 4. Download and persist verified image
    const downloadResult = await downloadAndPersistProductImage(bestCandidate.url, product.id, product.sku);

    if (!downloadResult.success || !downloadResult.publicUrl) {
      recoveryStateStore.addLog({
        productId: product.id,
        sku: product.sku,
        productName: product.name,
        action: 'ERROR',
        details: `Download failed for candidate URL: ${downloadResult.error}`,
        source: bestCandidate.sourceDomain,
      });

      // Queue into review so admin can see the failure
      recoveryStateStore.addToReviewQueue({
        id: 'q-' + product.id,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        brand: product.brand,
        model: product.model,
        category: product.category,
        candidateImage: bestCandidate,
        status: 'DOWNLOAD_FAILED',
        detectedAt: new Date().toISOString(),
        notes: `Download error: ${downloadResult.error}`,
      });

      return {
        status: 'FAILED',
        details: `Image download failed: ${downloadResult.error}`,
      };
    }

    // 5. Safely update product record with optimistic concurrency protection
    const updateResult = await safelyAttachProductImage(product.id, downloadResult.publicUrl, {
      source: bestCandidate.sourceDomain,
      confidenceScore: bestEvaluation.confidenceScore,
      userId: options?.userId,
      userName: options?.userName,
    });

    if (!updateResult.updated) {
      return {
        status: 'SKIPPED',
        details: updateResult.reason || 'Skipped update',
      };
    }

    return {
      status: 'RECOVERED',
      details: `Successfully attached verified product image (${bestEvaluation.confidenceScore}% match)`,
      imageUrl: downloadResult.publicUrl,
    };
  },

  /**
   * Run background batch recovery across missing products.
   */
  async runBatch(options?: {
    limit?: number;
    userId?: string;
    userName?: string;
    forceAutoApprove?: boolean;
  }): Promise<{
    processed: number;
    recovered: number;
    queuedForReview: number;
    failed: number;
    skipped: number;
  }> {
    const settings = recoveryStateStore.getSettings();
    const batchLimit = options?.limit || settings.batchSize || 10;

    // Scan for candidates
    const scan = await this.scanCatalog();
    const targetProducts = scan.productsNeedingImages.slice(0, batchLimit);

    recoveryStateStore.updateJob({
      status: 'RUNNING',
      startedAt: new Date().toISOString(),
      totalNeedingImages: scan.needingImages,
      currentIndex: 0,
    });

    let recovered = 0;
    let queued = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < targetProducts.length; i++) {
      // Check if paused
      const currentState = recoveryStateStore.getJob();
      if (currentState.status === 'PAUSED') {
        break;
      }

      const p = targetProducts[i];
      recoveryStateStore.updateJob({
        currentIndex: i + 1,
        currentProduct: { id: p.id, name: p.name, sku: p.sku },
      });

      try {
        const result = await this.processSingleProduct(p, {
          userId: options?.userId,
          userName: options?.userName,
          forceAutoApprove: options?.forceAutoApprove,
        });

        if (result.status === 'RECOVERED') recovered++;
        else if (result.status === 'REVIEW_QUEUED') queued++;
        else if (result.status === 'SKIPPED') skipped++;
        else failed++;
      } catch (err: any) {
        failed++;
        recoveryStateStore.addLog({
          productId: p.id,
          sku: p.sku,
          productName: p.name,
          action: 'ERROR',
          details: `Unexpected error processing product ${p.name}: ${err.message}`,
        });
      }

      // Rate limiting delay
      if (i < targetProducts.length - 1) {
        await delay(settings.requestDelayMs || 1000);
      }
    }

    const finalState = recoveryStateStore.getJob();
    recoveryStateStore.updateJob({
      status: finalState.status === 'PAUSED' ? 'PAUSED' : 'COMPLETED',
      finishedAt: new Date().toISOString(),
      totalRecovered: (finalState.totalRecovered || 0) + recovered,
      totalAwaitingReview: (finalState.totalAwaitingReview || 0) + queued,
      totalFailed: (finalState.totalFailed || 0) + failed,
      currentProduct: undefined,
    });

    return {
      processed: targetProducts.length,
      recovered,
      queuedForReview: queued,
      failed,
      skipped,
    };
  },

  /**
   * One-click approval of a candidate in review queue by administrator.
   */
  async approveReviewItem(
    productId: string,
    options?: { customImageUrl?: string; userId?: string; userName?: string }
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    const queue = recoveryStateStore.getReviewQueue();
    const item = queue.find((q) => q.productId === productId);

    const imageUrlToDownload = options?.customImageUrl || item?.candidateImage.url;
    if (!imageUrlToDownload) {
      return { success: false, error: 'No image URL available to approve' };
    }

    const sku = item ? item.sku : 'PROD';

    // Download and persist
    const download = await downloadAndPersistProductImage(imageUrlToDownload, productId, sku);
    if (!download.success || !download.publicUrl) {
      return { success: false, error: download.error || 'Failed to download and store image' };
    }

    const update = await safelyAttachProductImage(productId, download.publicUrl, {
      source: item?.candidateImage.sourceDomain || 'admin_approved',
      confidenceScore: item?.candidateImage.confidenceScore || 100,
      userId: options?.userId,
      userName: options?.userName,
      actionNote: 'Manually approved by administrator from review queue',
    });

    if (!update.updated) {
      return { success: false, error: update.reason || 'Could not update product image' };
    }

    return { success: true, imageUrl: download.publicUrl };
  },

  /**
   * Reject a review queue item.
   */
  rejectReviewItem(productId: string, reason?: string): void {
    const queue = recoveryStateStore.getReviewQueue();
    const item = queue.find((q) => q.productId === productId);
    if (item) {
      recoveryStateStore.addLog({
        productId: item.productId,
        sku: item.sku,
        productName: item.productName,
        action: 'REJECTED',
        details: `Administrator rejected candidate image: ${reason || 'Manual rejection'}`,
        imageUrl: item.candidateImage.url,
      });
    }
    recoveryStateStore.removeFromReviewQueue(productId);
  },
};
