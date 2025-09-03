import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api-seller-machine-production.up.railway.app';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_BASE}${url.startsWith('/') ? url : '/' + url}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar dados da API' }, { status: 500 });
  }
}
