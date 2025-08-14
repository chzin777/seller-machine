import { NextResponse } from 'next/server';
import { recomputeStats } from '../../../../../lib/rules';

export async function POST() {
  await recomputeStats();
  return NextResponse.json({ updated: true });
}
