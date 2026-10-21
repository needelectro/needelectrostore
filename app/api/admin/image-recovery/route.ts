// NEED ELECTRO ERP — Admin AI Image Recovery API Controller
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { recoveryEngine } from '@/lib/imageRecovery/recoveryEngine';
import { recoveryStateStore } from '@/lib/imageRecovery/stateStore';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const job = recoveryStateStore.getJob();
    const settings = recoveryStateStore.getSettings();
    const reviewQueue = recoveryStateStore.getReviewQueue();
    const logs = recoveryStateStore.getLogs();

    // If never scanned or idle, trigger catalog scan counts
    let scanStats = null;
    if (job.totalProductsScanned === 0) {
      scanStats = await recoveryEngine.scanCatalog();
    }

    const currentJob = recoveryStateStore.getJob();

    return NextResponse.json({
      success: true,
      data: {
        job: currentJob,
        settings,
        reviewQueue,
        logs: logs.slice(0, 50),
        scanStats,
      },
    });
  } catch (err: any) {
    console.error('Image recovery GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Administrator privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    switch (action) {
      case 'scan': {
        const result = await recoveryEngine.scanCatalog();
        return NextResponse.json({
          success: true,
          message: 'Catalog scan completed successfully',
          data: result,
        });
      }

      case 'start_batch': {
        const limit = body.limit ? Number(body.limit) : undefined;
        const forceAutoApprove = Boolean(body.forceAutoApprove);

        // Run batch processing
        const summary = await recoveryEngine.runBatch({
          limit,
          userId: user.id,
          userName: user.name,
          forceAutoApprove,
        });

        return NextResponse.json({
          success: true,
          message: `Batch completed: ${summary.recovered} recovered, ${summary.queuedForReview} queued for review, ${summary.failed} failed.`,
          data: summary,
        });
      }

      case 'pause': {
        recoveryStateStore.updateJob({ status: 'PAUSED' });
        return NextResponse.json({ success: true, message: 'Recovery job paused' });
      }

      case 'resume': {
        recoveryStateStore.updateJob({ status: 'RUNNING' });
        // Resume processing
        const summary = await recoveryEngine.runBatch({
          userId: user.id,
          userName: user.name,
        });
        return NextResponse.json({ success: true, message: 'Recovery resumed and batch completed', data: summary });
      }

      case 'approve_review': {
        const { productId, customImageUrl } = body;
        if (!productId) {
          return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        const result = await recoveryEngine.approveReviewItem(productId, {
          customImageUrl,
          userId: user.id,
          userName: user.name,
        });

        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          message: 'Image successfully approved and attached to product',
          imageUrl: result.imageUrl,
        });
      }

      case 'reject_review': {
        const { productId, reason } = body;
        if (!productId) {
          return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        recoveryEngine.rejectReviewItem(productId, reason);
        return NextResponse.json({ success: true, message: 'Candidate rejected and removed from review queue' });
      }

      case 'update_settings': {
        const { settings } = body;
        if (!settings || typeof settings !== 'object') {
          return NextResponse.json({ success: false, error: 'Invalid settings payload' }, { status: 400 });
        }

        const updated = recoveryStateStore.updateSettings(settings);
        return NextResponse.json({
          success: true,
          message: 'Recovery settings updated successfully',
          data: updated,
        });
      }

      default:
        return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    console.error('Image recovery POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
