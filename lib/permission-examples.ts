/**
 * 🛡️ GUIA DE USO DO SISTEMA DE PERMISSÕES
 * 
 * Este arquivo demonstra como usar o sistema de permissões
 * em diferentes contextos da aplicação.
 */

import { NextRequest } from 'next/server';
import { 
  requirePermission, 
  hasPermission, 
  validateDataAccess,
  type Permission
} from './permissions';
import { 
  hasUserPermission,
  canViewOtherSellers,
  canManageSellers,
  isSystemAdmin,
  getUserMaxScope
} from './permission-helpers';

// ==========================================
// 1. USO EM APIS (Backend)
// ==========================================

/**
 * Exemplo: API que requer permissão específica
 */
export async function exemploApiComPermissao(request: NextRequest) {
  // Verificar se usuário tem permissão para ver vendedores da filial
  const authResult = requirePermission('VIEW_FILIAL_SELLERS')(request);
  
  if (!authResult.allowed) {
    return new Response(JSON.stringify({
      error: authResult.error
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Continuar com a lógica da API...
  const { scope } = authResult;
  console.log(`Usuário ${scope.role} acessando dados da filial ${scope.filialId}`);
  
  return new Response(JSON.stringify({ 
    message: 'Acesso autorizado',
    scope 
  }));
}

/**
 * Exemplo: API que verifica múltiplas permissões
 */
export async function exemploApiMultiplasPermissoes(request: NextRequest) {
  const scope = deriveScopeFromRequest(request);
  
  // Verificar se tem pelo menos uma dessas permissões
  const canView = hasPermission(scope.role, 'VIEW_FILIAL_CLIENTS') ||
                  hasPermission(scope.role, 'VIEW_REGIONAL_CLIENTS') ||
                  hasPermission(scope.role, 'VIEW_ALL_CLIENTS');
  
  if (!canView) {
    return new Response(JSON.stringify({
      error: 'Sem permissão para visualizar clientes'
    }), { status: 403 });
  }
  
  // Lógica da API...
  return new Response(JSON.stringify({ success: true }));
}

/**
 * Exemplo: Validação de acesso a dados específicos
 */
export async function exemploValidacaoDados(request: NextRequest) {
  const scope = deriveScopeFromRequest(request);
  
  // Dados que o usuário está tentando acessar
  const targetData = {
    empresaId: 1,
    diretoriaId: 5,
    regionalId: 10,
    filialId: 25,
    userId: 100
  };
  
  // Validar se pode acessar esses dados
  const accessValidation = validateDataAccess(scope, targetData);
  
  if (!accessValidation.allowed) {
    return new Response(JSON.stringify({
      error: 'Acesso negado aos dados solicitados',
      reason: accessValidation.reason
    }), { status: 403 });
  }
  
  // Prosseguir com acesso aos dados...
  return new Response(JSON.stringify({ data: targetData }));
}

// ==========================================
// 2. USO EM COMPONENTES REACT (Frontend)
// ==========================================

/**
 * Exemplo: Como usar permissões em componentes React
 * 
 * // No seu componente:
 * function DashboardComponent({ user }) {
 *   // Verificar se pode ver outros vendedores
 *   const canSeeOthers = canViewOtherSellers(user);
 *   
 *   // Verificar se pode gerenciar
 *   const canManage = canManageSellers(user);
 *   
 *   // Verificar se é admin
 *   const isAdmin = isSystemAdmin(user);
 *   
 *   return (
 *     // JSX com condicionais baseadas nas permissões
 *   );
 * }
 */

/**
 * Exemplo: Hook personalizado para permissões
 * 
 * function usePermissions(user: any) {
 *   const canViewClients = hasUserPermission(user, 'VIEW_FILIAL_CLIENTS');
 *   const canEditClients = hasUserPermission(user, 'EDIT_FILIAL_CLIENTS');
 *   const canConfigureRFV = hasUserPermission(user, 'CONFIGURE_RFV');
 *   const isAdmin = isSystemAdmin(user);
 *   
 *   return {
 *     canViewClients,
 *     canEditClients, 
 *     canConfigureRFV,
 *     isAdmin,
 *     maxScope: getUserMaxScope(user)
 *   };
 * }
 */

// ==========================================
// 3. USO EM MIDDLEWARE
// ==========================================

/**
 * Exemplo: Middleware que verifica permissões por rota
 */
export function exemploMiddlewarePermissoes(request: NextRequest) {
  const { pathname } = new URL(request.url);
  const userRole = request.headers.get('x-user-role') || '';
  
  // Definir permissões necessárias por rota
  const routePermissions: Record<string, Permission[]> = {
    '/vendedores': ['VIEW_FILIAL_SELLERS', 'VIEW_REGIONAL_SELLERS', 'VIEW_ALL_SELLERS'],
    '/clientes': ['VIEW_REGIONAL_CLIENTS', 'VIEW_ALL_CLIENTS'],
    '/configurar-rfv': ['CONFIGURE_RFV'],
    '/usuarios': ['VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS']
  };
  
  // Verificar se a rota requer permissões específicas
  const requiredPermissions = routePermissions[pathname];
  if (!requiredPermissions) {
    // Rota não mapeada, permitir acesso
    return;
  }
  
  // Verificar se usuário tem pelo menos uma das permissões necessárias
  const hasRequiredPermission = requiredPermissions.some(permission =>
    hasPermission(userRole, permission)
  );
  
  if (!hasRequiredPermission) {
    return new Response(JSON.stringify({
      error: 'Acesso negado à rota',
      requiredPermissions,
      userRole
    }), { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ==========================================
// 4. UTILITÁRIOS DE DESENVOLVIMENTO
// ==========================================

/**
 * Utilitário para debug: listar todas as permissões de um usuário
 */
export function debugUserPermissions(userRole: string) {
  const permissions = getRolePermissions(userRole);
  
  console.group(`🛡️ Permissões do ${userRole}`);
  permissions.forEach(permission => {
    console.log(`✅ ${permission}`);
  });
  console.groupEnd();
  
  return permissions;
}

/**
 * Utilitário para testar permissões em desenvolvimento
 */
export function testPermission(userRole: string, permission: Permission) {
  const hasAccess = hasPermission(userRole, permission);
  
  console.log(
    `🧪 Teste: ${userRole} ${hasAccess ? '✅ PODE' : '❌ NÃO PODE'} ${permission}`
  );
  
  return hasAccess;
}

/**
 * Exemplo de uso dos utilitários
 */
export function exemploTestes() {
  // Debug das permissões
  debugUserPermissions('GESTOR_I');
  debugUserPermissions('GESTOR_MASTER');
  
  // Testar permissões específicas
  testPermission('VENDEDOR', 'VIEW_FILIAL_CLIENTS'); // ❌ NÃO PODE
  testPermission('GESTOR_I', 'VIEW_FILIAL_CLIENTS'); // ✅ PODE
  testPermission('GESTOR_II', 'VIEW_ALL_CLIENTS'); // ❌ NÃO PODE
  testPermission('GESTOR_MASTER', 'VIEW_ALL_CLIENTS'); // ✅ PODE
}

// Importações necessárias (fictícias para exemplo)
function deriveScopeFromRequest(request: NextRequest) {
  // Implementação real está em lib/scope.ts
  return {
    role: 'GESTOR_I',
    userId: 1,
    filialId: 1
  };
}

function getRolePermissions(role: string) {
  // Implementação real está em lib/permissions.ts
  return [];
}