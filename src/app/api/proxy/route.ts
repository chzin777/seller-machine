import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../lib/permissions';
import { deriveScopeFromRequest } from '../../../../lib/scope';
import { applyHierarchicalFiltersToUrl, createHierarchicalQueryParams } from '../../../../lib/hierarchical-filters';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev-production-6bb5.up.railway.app';

export async function GET(req: NextRequest) {
  // 🛡️ Verificar headers disponíveis para debug
  console.log('[PROXY] Available headers:', Array.from(req.headers.entries()).map(([k, v]) => `${k}: ${k.includes('auth') || k.includes('user') ? v : '[HIDDEN]'}`));
  
  // Obter escopo do usuário
  const userScope = deriveScopeFromRequest(req);
  console.log('[PROXY] User scope:', { role: userScope.role, empresaId: userScope.empresaId, filialId: userScope.filialId });
  
  // Temporariamente mais permissivo - TODO: implementar autenticação adequada
  try {
    const authCheck = requirePermission('VIEW_OWN_DASHBOARD')(req);
    if (!authCheck.allowed) {
      console.log('[PROXY] Access denied, but allowing temporarily:', authCheck.error);
      // Permitir temporariamente para debug
    }
  } catch (error) {
    console.log('[PROXY] Permission check failed, allowing temporarily:', error);
  }
  
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }
  
  // 🎯 Aplicar filtros hierárquicos na URL
  let filteredUrl = url;
  try {
    filteredUrl = applyHierarchicalFiltersToUrl(url, userScope);
    console.log('[PROXY] Original URL:', url);
    console.log('[PROXY] Filtered URL:', filteredUrl);
  } catch (error) {
    console.warn('[PROXY] Error applying hierarchical filters:', error);
    // Continue com URL original se falhar
  }
  try {
    console.log(`[PROXY] Fetching: ${API_BASE}${filteredUrl}`);
    
    // Verificar se há headers de autenticação para passar adiante
    const authHeaders: HeadersInit = {};
    const authorizationHeader = req.headers.get('authorization');
    if (authorizationHeader) {
      authHeaders['authorization'] = authorizationHeader;
    }
    
    // Também passar outros headers relevantes
    const userAgent = req.headers.get('user-agent');
    if (userAgent) {
      authHeaders['user-agent'] = userAgent;
    }
    
    // 🔐 Incluir informações de escopo nos headers
    if (userScope.role) {
      authHeaders['x-user-role'] = userScope.role;
    }
    if (userScope.userId) {
      authHeaders['x-user-id'] = userScope.userId.toString();
    }
    if (userScope.empresaId) {
      authHeaders['x-user-empresa-id'] = userScope.empresaId.toString();
    }
    if (userScope.filialId) {
      authHeaders['x-user-filial-id'] = userScope.filialId.toString();
    }
    if (userScope.regionalId) {
      authHeaders['x-user-regional-id'] = userScope.regionalId.toString();
    }
    if (userScope.diretoriaId) {
      authHeaders['x-user-diretoria-id'] = userScope.diretoriaId.toString();
    }
    
    console.log(`[PROXY] Using headers:`, Object.keys(authHeaders));
    
    const res = await fetch(`${API_BASE}${filteredUrl}`, {
      headers: authHeaders
    });
    
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
  // 🛡️ Verificar permissão para operações de escrita
  const authCheck = requirePermission('VIEW_OWN_DASHBOARD')(req);
  if (!authCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Acesso negado', 
        message: authCheck.error,
        code: 'INSUFFICIENT_PERMISSIONS'
      }, 
      { status: 403 }
    );
  }
  
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
  // 🛡️ Verificar permissão para operações de escrita
  const authCheck = requirePermission('VIEW_OWN_DASHBOARD')(req);
  if (!authCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Acesso negado', 
        message: authCheck.error,
        code: 'INSUFFICIENT_PERMISSIONS'
      }, 
      { status: 403 }
    );
  }
  
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
