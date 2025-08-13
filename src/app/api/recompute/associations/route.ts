import { NextRequest, NextResponse } from 'next/server';
import { recomputeAssociations } from '../../../../../lib/rules';

export async function POST(req: NextRequest) {
  await recomputeAssociations(0);
  return NextResponse.json({ updated: true });
}
