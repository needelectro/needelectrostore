// NEED ELECTRO ERP — Notification Dispatch API Route
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { sendNotification, NotificationPayload } from '@/lib/notifications';
import { z } from 'zod';

const notificationRequestSchema = z.object({
  recipientPhone: z.string().min(8, 'Valid phone number is required'),
  recipientName: z.string().optional(),
  channel: z.enum(['SMS', 'WHATSAPP', 'BOTH']).default('BOTH'),
  templateCode: z.string().optional(),
  customMessage: z.string().optional(),
  variables: z.record(z.union([z.string(), z.number()])).optional(),
  metadata: z.object({
    referenceType: z.enum(['SALE', 'EMI_PAYMENT', 'EMI_OVERDUE', 'SERVICE']).optional(),
    referenceId: z.string().optional(),
  }).optional(),
});

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const parsed = notificationRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const result = await sendNotification(parsed.data as NotificationPayload);

    return NextResponse.json({
      success: result.success,
      data: result,
    });
  } catch (error: any) {
    console.error('Notification API Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Notification failed' },
      { status: 500 }
    );
  }
}
