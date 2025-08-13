import { NextRequest, NextResponse } from 'next/server';
import { runRecompraAlerts } from '../../../../../lib/rules';

export async function POST() {
  await runRecompraAlerts();
  return NextResponse.json({ updated: true });
}
