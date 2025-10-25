import { NextResponse } from 'next/server';
import { runRecompraAlerts } from '../../../../../lib/rules';
import { requirePermission } from '../../../../../lib/permissions';

export async function POST() {
  await runRecompraAlerts();
  return NextResponse.json({ updated: true });
}
