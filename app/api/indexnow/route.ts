import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { submitToIndexNow, INDEXNOW_KEY, INDEXNOW_HOST } from '@/lib/indexNow';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'IndexNow for NEED ELECTRO',
    host: INDEXNOW_HOST,
    supportedEngines: ['Bing', 'Microsoft Copilot', 'Yandex', 'Seznam', 'IndexNow API'],
  });
}

export async function POST(req: NextRequest) {
  const user = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { urls } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'urls array must be provided and not empty' },
        { status: 400 }
      );
    }

    const result = await submitToIndexNow(urls);
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to parse JSON body' },
      { status: 500 }
    );
  }
}
