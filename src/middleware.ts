import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Definir as rotas protegidas e seus níveis de acesso
const PROTECTED_ROUTES = {
  // Rotas administrativas - apenas GESTOR_MASTER
  '/api/hierarchy': ['GESTOR_MASTER'],
  '/api/users': ['GESTOR_MASTER'],
  '/usuarios': ['GESTOR_MASTER'],
  
  // Rotas de gestão - GESTOR_III e acima
  '/dashboard-graphql': ['GESTOR_III', 'GESTOR_MASTER'],
  '/configurar-rfv': ['GESTOR_III', 'GESTOR_MASTER'],
  
  // Rotas regionais - GESTOR_II e acima
  '/api/rfv': ['GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/clientes': ['GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  
  // Rotas de filial - GESTOR_I e acima
  '/carteira-vendedor': ['GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/vendedores': ['GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  
  // Rotas básicas - todos os usuários autenticados
  '/dashboard': ['VENDEDOR', 'GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
  '/configuracoes': ['VENDEDOR', 'GESTOR_I', 'GESTOR_II', 'GESTOR_III', 'GESTOR_MASTER'],
};

// Rotas públicas que não precisam de autenticação
const PUBLIC_ROUTES = [
  '/login',
  '/api/auth/login',
  '/api/auth/password-reset',
  '/api/nova-senha',
  '/_next',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar se é uma rota pública
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verificar se é uma rota protegida
  const protectedRoute = Object.keys(PROTECTED_ROUTES).find(route => 
    pathname.startsWith(route)
  );

  if (!protectedRoute) {
    // Se não é uma rota protegida específica, permitir acesso
    return NextResponse.next();
  }

  // Obter token do cookie ou header
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirecionar para login se não há token
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verificar e decodificar o token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    
    const userRole = payload.role as string;
    const allowedRoles = PROTECTED_ROUTES[protectedRoute as keyof typeof PROTECTED_ROUTES];

    // Verificar se o usuário tem permissão para acessar a rota
    if (!allowedRoles.includes(userRole)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Acesso negado. Permissões insuficientes.' },
          { status: 403 }
        );
      }
      // Redirecionar para página inicial se não tem permissão
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Adicionar informações do usuário aos headers para uso nas rotas
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', userRole);
    requestHeaders.set('x-user-empresa-id', payload.empresaId as string || '');
    requestHeaders.set('x-user-diretoria-id', payload.diretoriaId as string || '');
    requestHeaders.set('x-user-regional-id', payload.regionalId as string || '');
    requestHeaders.set('x-user-filial-id', payload.filialId as string || '');

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.error('Erro na verificação do token:', error);
    
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
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