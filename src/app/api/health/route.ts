import { NextResponse } from 'next/server';
import { env } from '../../../config/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'flirtcheck-deeptrace',
      version: '2.4.0',
      nim_engine: env.NVIDIA_VISION_MODEL,
      nim_configured: Boolean(env.NVIDIA_NIM_API_KEY && env.NVIDIA_NIM_API_KEY.length > 0)
    },
    { status: 200 }
  );
}
