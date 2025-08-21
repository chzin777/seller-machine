import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api-maquina-de-vendas-production.up.railway.app';

export async function POST(req: NextRequest) {
  const { url, body } = await req.json();
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_BASE}${url.startsWith('/') ? url : '/' + url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Erro ao buscar dados da API' }, { status: 500 });
  }
}
