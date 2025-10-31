import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// 🔒 SISTEMA DE AUTORIZAÇÃO SEGURO - POR PADRÃO TUDO É PROTEGIDO

// Rotas PÚBLICAS (únicas que não precisam de autenticação)
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/password-reset',
  '/api/nova-senha',
  '/api/vendedor-by-cpf',
  '/_next',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js',
];

// Definir rotas com permissões específicas (além da autenticação básica)
const ROLE_RESTRICTED_ROUTES = {
  // 🔴 APENAS GESTOR_MASTER
  '/api/hierarchy': ['GESTOR_MASTER'],
  '/api/users': ['GESTOR_MASTER'],
  '/usuarios': ['GESTOR_MASTER'],
  '/cadastro-usuario': ['GESTOR_MASTER'],
  '/api/seed': ['GESTOR_MASTER'], // Perigoso - apenas master
  
  // 🟠 GESTOR_III e acima (Diretoria)
  '/dashboard-graphql': ['GESTOR_III', 'GESTOR_MASTER'],
  '/configurar-rfv': ['GESTOR_III', 'GESTOR_MASTER'],
  '/api/rfv-parameters': ['GESTOR_III', 'GESTOR_MASTER'],
  
  // 🟡 GESTOR_II e acima (Regional)  
  '/api/rfv': ['GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/clientes': ['GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/api/clientes': ['GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  
  // 🟢 GESTOR_I e acima (Filial)
  '/carteira-vendedor': ['GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/vendedores': ['GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/api/carteira-vendedor': ['GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  
  // 🔵 Todos os usuários autenticados têm acesso (mas devem estar logados)
  // /api/vendedores - todos podem acessar (filtro hierárquico no código protege os dados)
  // /dashboard - todos podem acessar
  // /mapa-vendas - todos podem acessar
  // Essas rotas não aparecem aqui - são protegidas apenas por autenticação básica
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 🔓 STEP 1: Verificar se é uma rota PÚBLICA (não precisa de autenticação)
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔒 STEP 2: Por padrão, TODAS as outras rotas precisam de autenticação
  
  // Obter token do cookie ou header Authorization
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Se não há token, bloquear acesso
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          error: 'Acesso negado',
          message: 'Token de autenticação obrigatório',
          code: 'AUTHENTICATION_REQUIRED'
        },
        { status: 401 }
      );
    }
    // Para páginas web, redirecionar para login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🔍 STEP 3: Validar e decodificar o token JWT
  let payload: any;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const result = await jwtVerify(token, secret);
    payload = result.payload;
  } catch (error) {
    console.error('Token JWT inválido:', error);
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { 
          error: 'Token inválido',
          message: 'Token JWT expirado ou malformado',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 🎭 STEP 4: Verificar se usuário está ativo (se campo existir)
  // if (payload.active === false) {
  //   return NextResponse.json(
  //     { error: 'Usuário inativo', code: 'USER_INACTIVE' },
  //     { status: 403 }
  //   );
  // }

  const userRole = payload.role as string;

  // 🛡️ STEP 5: Verificar permissões específicas por role (se aplicável)
  const roleRestrictedRoute = Object.keys(ROLE_RESTRICTED_ROUTES).find(route => 
    pathname.startsWith(route)
  );

  
  // Se há rota com restrição de role específica, verificar permissão
  if (roleRestrictedRoute) {
    const allowedRoles = ROLE_RESTRICTED_ROUTES[roleRestrictedRoute as keyof typeof ROLE_RESTRICTED_ROUTES];
    
    if (!allowedRoles.includes(userRole)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { 
            error: 'Acesso negado',
            message: `Role '${userRole}' não tem permissão para acessar esta rota`,
            code: 'INSUFFICIENT_PERMISSIONS',
            requiredRoles: allowedRoles
          },
          { status: 403 }
        );
      }
      // Para páginas web, redirecionar para dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 🎯 STEP 6: SUCESSO - Usuário autenticado e autorizado
  // Injetar informações do usuário nos headers para uso nas APIs
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(payload.userId || ''));
  requestHeaders.set('x-user-role', String(userRole));
  requestHeaders.set('x-user-empresa-id', String(payload.empresaId || ''));
  requestHeaders.set('x-user-diretoria-id', String(payload.diretoriaId || ''));
  requestHeaders.set('x-user-regional-id', String(payload.regionalId || ''));
  requestHeaders.set('x-user-filial-id', String(payload.filialId || ''));
  // Propagar identificadores específicos do vendedor (quando houver)
  if (payload.cpf) {
    requestHeaders.set('x-user-cpf', String(payload.cpf));
  }
  if (payload.vendedorId !== undefined && payload.vendedorId !== null) {
    requestHeaders.set('x-vendedor-id', String(payload.vendedorId));
  }
  if (payload.vendedorNome) {
    requestHeaders.set('x-vendedor-nome', String(payload.vendedorNome));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};