import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev-production-6bb5.up.railway.app';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  try {
    console.log(`[PROXY] Fetching: ${API_BASE}${url}`);
    const res = await fetch(`${API_BASE}${url}`);
    
    if (!res.ok) {
      console.error(`[PROXY] API Error: ${res.status} - ${res.statusText}`);
      const errorText = await res.text();
      console.error(`[PROXY] Error body: ${errorText}`);
      return NextResponse.json({ error: `API Error: ${res.status} - ${errorText}` }, { status: res.status });
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await res.text();
      console.error(`[PROXY] Non-JSON response: ${textResponse.substring(0, 200)}...`);
      return NextResponse.json({ error: 'API returned non-JSON response', response: textResponse.substring(0, 500) }, { status: 502 });
    }
    
    const data = await res.json();
    console.log(`[PROXY] Success: ${Object.keys(data).length} keys in response`);
    return NextResponse.json(data);
  } catch (error) {
    console.error(`[PROXY] Exception:`, error);
    return NextResponse.json({ error: `Erro ao buscar dados da API: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
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

export async function PUT(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  
  try {
    const body = await req.json();
    
    const res = await fetch(`${API_BASE}${url.startsWith('/') ? url : '/' + url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    if (res.ok) {
      const responseData = await res.json();
      return NextResponse.json(responseData);
    } else {
      const errorData = await res.text();
      return NextResponse.json({ error: errorData || 'Erro na API externa' }, { status: res.status });
    }
  } catch {
    return NextResponse.json({ error: 'Erro ao processar requisição PUT' }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse(null, { status: 400 });
  }
  
  try {
    const res = await fetch(`${API_BASE}${url.startsWith('/') ? url : '/' + url}`, {
      method: 'HEAD'
    });
    
    return new NextResponse(null, { status: res.status });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
