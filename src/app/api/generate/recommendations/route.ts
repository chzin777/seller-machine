import { NextRequest, NextResponse } from 'next/server';
import { generateRecommendations } from '../../../../../lib/rules';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  await generateRecommendations(body || {});
  return NextResponse.json({ updated: true });
}
