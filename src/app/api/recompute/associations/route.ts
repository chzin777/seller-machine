import { NextResponse } from 'next/server';
import { recomputeAssociations } from '../../../../../lib/rules';

export async function POST() {
  await recomputeAssociations();
  return NextResponse.json({ updated: true });
}
