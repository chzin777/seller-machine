import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://api-dev-production-6bb5.up.railway.app';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_BASE}${url.startsWith('/') ? url : '/' + url}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar dados da API' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, method = 'POST', data } = body;
    
    if (!url) {
      return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(data);
    }

    const res = await fetch(`${API_BASE}${url.startsWith('/') ? url : '/' + url}`, fetchOptions);
    
    if (res.ok) {
      // Para DELETE, pode não ter resposta JSON
      if (method === 'DELETE' && res.status === 204) {
        return NextResponse.json({ success: true });
      }
      const responseData = await res.json();
      return NextResponse.json(responseData);
    } else {
      const errorData = await res.text();
      return NextResponse.json({ error: errorData || 'Erro na API externa' }, { status: res.status });
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição' }, { status: 500 });
  }
}
