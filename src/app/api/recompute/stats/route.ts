import { NextRequest, NextResponse } from 'next/server';
import { recomputeStats } from '../../../../../lib/rules';

export async function POST(req: NextRequest) {
  await recomputeStats();
  return NextResponse.json({ updated: true });
}
