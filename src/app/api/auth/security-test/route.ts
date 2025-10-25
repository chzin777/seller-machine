import { NextRequest, NextResponse } from 'next/server';
import { requirePermission, getRolePermissions, isValidRole } from '../../../../../lib/permissions';

/**
 * 🔒 API de Teste e Documentação do Sistema de Autorização
 * 
 * Esta API serve para testar e documentar o novo sistema de segurança.
 * Apenas usuários autenticados podem acessá-la.
 */

export async function GET(request: NextRequest) {
  // Esta API é protegida pelo middleware - se chegou aqui, usuário está autenticado
  
  const userRole = request.headers.get('x-user-role') || 'UNKNOWN';
  const userId = request.headers.get('x-user-id') || 'UNKNOWN';
  const empresaId = request.headers.get('x-user-empresa-id') || 'N/A';
  const filialId = request.headers.get('x-user-filial-id') || 'N/A';
  
  return NextResponse.json({
    message: '🔒 Sistema de Autorização - Funcionando!',
    timestamp: new Date().toISOString(),
    authentication: {
      status: 'AUTHENTICATED',
      userId,
      userRole,
      empresaId,
      filialId,
      isValidRole: isValidRole(userRole)
    },
    permissions: {
      userPermissions: getRolePermissions(userRole),
      totalPermissions: getRolePermissions(userRole).length
    },
    securityInfo: {
      middleware: 'ACTIVE - Todas as rotas protegidas por padrão',
      publicRoutes: [
        '/login',
        '/api/auth/login', 
        '/api/auth/password-reset',
        '/api/nova-senha',
        '/_next',
        '/favicon.ico'
      ],
      protectionLevel: 'MAXIMUM - Authentication + Role-based permissions',
      tokenSource: request.cookies.get('auth-token') ? 'HTTP_COOKIE' : 'AUTHORIZATION_HEADER'
    },
    testing: {
      endpoint: '/api/auth/security-test',
      description: 'Use esta API para testar se a autenticação está funcionando',
      examples: {
        success: 'Status 200 - Usuário autenticado',
        failure: 'Status 401/403 - Usuário não autenticado ou sem permissão'
      }
    }
  });
}

/**
 * API para testar permissões específicas
 */
export async function POST(request: NextRequest) {
  try {
    const { permission } = await request.json();
    
    if (!permission) {
      return NextResponse.json(
        { error: 'Parâmetro "permission" é obrigatório' },
        { status: 400 }
      );
    }
    
    // Testar se usuário tem a permissão solicitada
    const authCheck = requirePermission(permission)(request);
    
    return NextResponse.json({
      permission,
      hasPermission: authCheck.allowed,
      userRole: authCheck.scope.role,
      error: authCheck.error || null,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao processar teste de permissão' },
      { status: 500 }
    );
  }
}