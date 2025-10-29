import type { NextRequest } from 'next/server';
import { deriveScopeFromRequest, type UserScope } from './scope';

// Tipos para sistema de permissões estruturado por contexto
export type Permission = 
  // ====== GESTÃO DE USUÁRIOS ======
  | 'VIEW_USERS'           // Ver usuários
  | 'CREATE_USERS'         // Criar usuários
  | 'EDIT_USERS'           // Editar usuários
  | 'DELETE_USERS'         // Deletar usuários
  | 'MANAGE_HIERARCHY'     // Gerenciar hierarquia organizacional
  
  // ====== CARTEIRA & VENDAS ======
  | 'VIEW_OWN_PORTFOLIO'     // Ver própria carteira (vendedor)
  | 'VIEW_FILIAL_PORTFOLIO'  // Ver carteira da filial
  | 'VIEW_REGIONAL_PORTFOLIO'// Ver carteira da regional
  | 'VIEW_ALL_PORTFOLIO'     // Ver todas as carteiras
  | 'EDIT_OWN_PORTFOLIO'     // Editar própria carteira
  | 'EDIT_FILIAL_PORTFOLIO'  // Editar carteiras da filial
  | 'EDIT_REGIONAL_PORTFOLIO'// Editar carteiras da regional
  | 'EDIT_ALL_PORTFOLIO'     // Editar todas as carteiras
  
  // ====== CLIENTES ======
  | 'VIEW_OWN_CLIENTS'       // Ver próprios clientes
  | 'VIEW_FILIAL_CLIENTS'    // Ver clientes da filial
  | 'VIEW_REGIONAL_CLIENTS'  // Ver clientes da regional
  | 'VIEW_ALL_CLIENTS'       // Ver todos os clientes
  | 'EDIT_OWN_CLIENTS'       // Editar próprios clientes
  | 'EDIT_FILIAL_CLIENTS'    // Editar clientes da filial
  | 'EDIT_REGIONAL_CLIENTS'  // Editar clientes da regional
  | 'EDIT_ALL_CLIENTS'       // Editar todos os clientes
  
  // ====== VENDEDORES ======
  | 'VIEW_OWN_PROFILE'       // Ver próprio perfil
  | 'VIEW_FILIAL_SELLERS'    // Ver vendedores da filial
  | 'VIEW_REGIONAL_SELLERS'  // Ver vendedores da regional
  | 'VIEW_ALL_SELLERS'       // Ver todos os vendedores
  | 'VIEW_SELLER_RANKING'    // Ver ranking de vendedores
  | 'MANAGE_FILIAL_SELLERS'  // Gerenciar vendedores da filial
  | 'MANAGE_REGIONAL_SELLERS'// Gerenciar vendedores da regional
  | 'MANAGE_ALL_SELLERS'     // Gerenciar todos os vendedores
  
  // ====== DASHBOARDS & ANALYTICS ======
  | 'VIEW_OWN_DASHBOARD'     // Dashboard pessoal
  | 'VIEW_FILIAL_DASHBOARD'  // Dashboard da filial
  | 'VIEW_REGIONAL_DASHBOARD'// Dashboard da regional
  | 'VIEW_GLOBAL_DASHBOARD'  // Dashboard global
  | 'VIEW_OWN_ANALYTICS'     // Analytics pessoais
  | 'VIEW_FILIAL_ANALYTICS'  // Analytics da filial
  | 'VIEW_REGIONAL_ANALYTICS'// Analytics da regional
  | 'VIEW_GLOBAL_ANALYTICS'  // Analytics globais
  
  // ====== RFV & SEGMENTAÇÃO ======
  | 'VIEW_RFV_ANALYSIS'      // Ver análises RFV
  | 'CONFIGURE_RFV'          // Configurar parâmetros RFV
  | 'MANAGE_RFV_PARAMETERS'  // Gerenciar parâmetros RFV
  
  // ====== INTELIGÊNCIA ARTIFICIAL ======
  | 'ACCESS_AI_INSIGHTS'     // Acessar insights de IA
  | 'CONFIGURE_AI_MODELS'    // Configurar modelos de IA
  | 'MANAGE_AI_TRAINING'     // Gerenciar treinamento de IA
  
  // ====== SISTEMA & ADMIN ======
  | 'VIEW_SYSTEM_LOGS'       // Ver logs do sistema
  | 'MANAGE_NOTIFICATIONS'   // Gerenciar notificações
  | 'EXECUTE_SEED_OPERATIONS'// Executar operações de seed
  | 'MANAGE_SYSTEM_CONFIG'   // Gerenciar configurações do sistema
  | 'VIEW_API_USAGE'         // Ver uso da API
  
  // ====== RELATÓRIOS ======
  | 'GENERATE_OWN_REPORTS'   // Gerar relatórios pessoais
  | 'GENERATE_FILIAL_REPORTS'// Gerar relatórios da filial
  | 'GENERATE_REGIONAL_REPORTS'// Gerar relatórios da regional
  | 'GENERATE_GLOBAL_REPORTS'// Gerar relatórios globais
  | 'EXPORT_DATA'            // Exportar dados
  
  // ====== AGENDA & FUNIL ======
  | 'VIEW_OWN_AGENDA'        // Ver própria agenda
  | 'VIEW_FILIAL_AGENDA'     // Ver agenda da filial
  | 'VIEW_REGIONAL_AGENDA'   // Ver agenda da regional
  | 'VIEW_ALL_AGENDA'        // Ver todas as agendas
  | 'MANAGE_OWN_FUNNEL'      // Gerenciar próprio funil
  | 'VIEW_FILIAL_FUNNEL'     // Ver funil da filial
  | 'VIEW_REGIONAL_FUNNEL'   // Ver funil da regional
  | 'VIEW_ALL_FUNNEL'        // Ver todos os funis;

// Traduções amigáveis para permissões
const PERMISSION_TRANSLATIONS: Record<Permission, string> = {
  // Gestão de Usuários
  'VIEW_USERS': 'visualizar usuários',
  'CREATE_USERS': 'criar novos usuários',
  'EDIT_USERS': 'editar usuários',
  'DELETE_USERS': 'excluir usuários',
  'MANAGE_HIERARCHY': 'gerenciar hierarquia organizacional',
  
  // Carteira & Vendas
  'VIEW_OWN_PORTFOLIO': 'visualizar sua carteira',
  'VIEW_FILIAL_PORTFOLIO': 'visualizar carteiras da filial',
  'VIEW_REGIONAL_PORTFOLIO': 'visualizar carteiras da regional',
  'VIEW_ALL_PORTFOLIO': 'visualizar todas as carteiras',
  'EDIT_OWN_PORTFOLIO': 'editar sua carteira',
  'EDIT_FILIAL_PORTFOLIO': 'editar carteiras da filial',
  'EDIT_REGIONAL_PORTFOLIO': 'editar carteiras da regional',
  'EDIT_ALL_PORTFOLIO': 'editar todas as carteiras',
  
  // Clientes
  'VIEW_OWN_CLIENTS': 'visualizar seus clientes',
  'VIEW_FILIAL_CLIENTS': 'visualizar clientes da filial',
  'VIEW_REGIONAL_CLIENTS': 'visualizar clientes da regional',
  'VIEW_ALL_CLIENTS': 'visualizar todos os clientes',
  'EDIT_OWN_CLIENTS': 'editar seus clientes',
  'EDIT_FILIAL_CLIENTS': 'editar clientes da filial',
  'EDIT_REGIONAL_CLIENTS': 'editar clientes da regional',
  'EDIT_ALL_CLIENTS': 'editar todos os clientes',
  
  // Vendedores
  'VIEW_OWN_PROFILE': 'visualizar seu perfil',
  'VIEW_FILIAL_SELLERS': 'visualizar vendedores da filial',
  'VIEW_REGIONAL_SELLERS': 'visualizar vendedores da regional',
  'VIEW_ALL_SELLERS': 'visualizar todos os vendedores',
  'VIEW_SELLER_RANKING': 'visualizar ranking de vendedores',
  'MANAGE_FILIAL_SELLERS': 'gerenciar vendedores da filial',
  'MANAGE_REGIONAL_SELLERS': 'gerenciar vendedores da regional',
  'MANAGE_ALL_SELLERS': 'gerenciar todos os vendedores',
  
  // Dashboards & Analytics
  'VIEW_OWN_DASHBOARD': 'acessar seu dashboard',
  'VIEW_FILIAL_DASHBOARD': 'acessar dashboard da filial',
  'VIEW_REGIONAL_DASHBOARD': 'acessar dashboard da regional',
  'VIEW_GLOBAL_DASHBOARD': 'acessar dashboard global',
  'VIEW_OWN_ANALYTICS': 'visualizar suas análises',
  'VIEW_FILIAL_ANALYTICS': 'visualizar análises da filial',
  'VIEW_REGIONAL_ANALYTICS': 'visualizar análises da regional',
  'VIEW_GLOBAL_ANALYTICS': 'visualizar análises globais',
  
  // RFV & Segmentação
  'VIEW_RFV_ANALYSIS': 'visualizar análises RFV',
  'CONFIGURE_RFV': 'configurar parâmetros RFV',
  'MANAGE_RFV_PARAMETERS': 'gerenciar parâmetros RFV',
  
  // Inteligência Artificial
  'ACCESS_AI_INSIGHTS': 'acessar insights de IA',
  'CONFIGURE_AI_MODELS': 'configurar modelos de IA',
  'MANAGE_AI_TRAINING': 'gerenciar treinamento de IA',
  
  // Sistema & Admin
  'VIEW_SYSTEM_LOGS': 'visualizar logs do sistema',
  'MANAGE_NOTIFICATIONS': 'gerenciar notificações',
  'EXECUTE_SEED_OPERATIONS': 'executar operações de seed',
  'MANAGE_SYSTEM_CONFIG': 'gerenciar configurações do sistema',
  'VIEW_API_USAGE': 'visualizar uso da API',
  
  // Relatórios
  'GENERATE_OWN_REPORTS': 'gerar seus relatórios',
  'GENERATE_FILIAL_REPORTS': 'gerar relatórios da filial',
  'GENERATE_REGIONAL_REPORTS': 'gerar relatórios da regional',
  'GENERATE_GLOBAL_REPORTS': 'gerar relatórios globais',
  'EXPORT_DATA': 'exportar dados',
  
  // Agenda & Funil
  'VIEW_OWN_AGENDA': 'visualizar sua agenda',
  'VIEW_FILIAL_AGENDA': 'visualizar agenda da filial',
  'VIEW_REGIONAL_AGENDA': 'visualizar agenda da regional',
  'VIEW_ALL_AGENDA': 'visualizar todas as agendas',
  'MANAGE_OWN_FUNNEL': 'gerenciar seu funil de vendas',
  'VIEW_FILIAL_FUNNEL': 'visualizar funil da filial',
  'VIEW_REGIONAL_FUNNEL': 'visualizar funil da regional',
  'VIEW_ALL_FUNNEL': 'visualizar todos os funis'
};

// Traduções amigáveis para roles
const ROLE_TRANSLATIONS: Record<string, string> = {
  'VENDEDOR': 'Vendedor',
  'GESTOR_I': 'Gestor de Filial',
  'GESTOR_II': 'Gestor Regional',
  'GESTOR_III': 'Gestor de Diretoria',
  'GESTOR_MASTER': 'Gestor Master'
};

// Função para gerar mensagem de erro amigável
function getFriendlyPermissionError(permission: Permission, role: string): string {
  const permissionName = PERMISSION_TRANSLATIONS[permission] || permission.toLowerCase().replace(/_/g, ' ');
  const roleName = ROLE_TRANSLATIONS[role] || role;
  
  return `Você não tem permissão para ${permissionName}. Seu nível de acesso atual é: ${roleName}`;
}

// Função para gerar mensagem de erro amigável para múltiplas permissões
function getFriendlyMultiplePermissionsError(permissions: Permission[], role: string): string {
  const permissionNames = permissions.map(p => PERMISSION_TRANSLATIONS[p] || p.toLowerCase().replace(/_/g, ' '));
  const roleName = ROLE_TRANSLATIONS[role] || role;
  
  if (permissionNames.length === 1) {
    return `Você não tem permissão para ${permissionNames[0]}. Seu nível de acesso atual é: ${roleName}`;
  }
  
  const lastPermission = permissionNames.pop();
  const permissionList = permissionNames.join(', ') + ` ou ${lastPermission}`;
  
  return `Você precisa de permissão para ${permissionList}. Seu nível de acesso atual é: ${roleName}`;
}

// Mapa de permissões por role - Estruturado por hierarquia
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  /**
   * 🔵 VENDEDOR - Acesso apenas aos próprios dados
   * Escopo: Carteira, agenda e funil próprios
   */
  'VENDEDOR': [
    // Próprios dados
    'VIEW_OWN_PROFILE',
    'VIEW_OWN_PORTFOLIO', 
    'EDIT_OWN_PORTFOLIO',
    'VIEW_OWN_CLIENTS',
    'EDIT_OWN_CLIENTS',
    'VIEW_OWN_DASHBOARD',
    'VIEW_OWN_ANALYTICS',
    'VIEW_OWN_AGENDA',
    'MANAGE_OWN_FUNNEL',
    'GENERATE_OWN_REPORTS',
    
    // IA e análises pessoais
    'ACCESS_AI_INSIGHTS',
    'VIEW_RFV_ANALYSIS'
  ],
  
  /**
   * 🟢 GESTOR I - Gestor de Filial
   * Escopo: Todos os vendedores da sua filial
   */
  'GESTOR_I': [
    // Próprios dados
    'VIEW_OWN_PROFILE',
    'VIEW_OWN_PORTFOLIO',
    'EDIT_OWN_PORTFOLIO', 
    'VIEW_OWN_CLIENTS',
    'EDIT_OWN_CLIENTS',
    'VIEW_OWN_DASHBOARD',
    'VIEW_OWN_ANALYTICS',
    'VIEW_OWN_AGENDA',
    'MANAGE_OWN_FUNNEL',
    'GENERATE_OWN_REPORTS',
    
    // Dados da filial
    'VIEW_FILIAL_PORTFOLIO',
    'EDIT_FILIAL_PORTFOLIO',
    'VIEW_FILIAL_CLIENTS',
    'EDIT_FILIAL_CLIENTS',
    'VIEW_FILIAL_SELLERS',
    'VIEW_SELLER_RANKING',
    'MANAGE_FILIAL_SELLERS',
    'VIEW_FILIAL_DASHBOARD',
    'VIEW_FILIAL_ANALYTICS',
    'VIEW_FILIAL_AGENDA',
    'VIEW_FILIAL_FUNNEL',
    'GENERATE_FILIAL_REPORTS',
    
    // IA e análises
    'ACCESS_AI_INSIGHTS',
    'VIEW_RFV_ANALYSIS'
  ],
  
  /**
   * 🟡 GESTOR II - Gestor Regional  
   * Escopo: Todas as filiais da sua regional
   */
  'GESTOR_II': [
    // Próprios dados
    'VIEW_OWN_PROFILE',
    'VIEW_OWN_PORTFOLIO',
    'EDIT_OWN_PORTFOLIO',
    'VIEW_OWN_CLIENTS', 
    'EDIT_OWN_CLIENTS',
    'VIEW_OWN_DASHBOARD',
    'VIEW_OWN_ANALYTICS',
    'VIEW_OWN_AGENDA',
    'MANAGE_OWN_FUNNEL',
    'GENERATE_OWN_REPORTS',
    
    // Dados da filial
    'VIEW_FILIAL_PORTFOLIO',
    'EDIT_FILIAL_PORTFOLIO',
    'VIEW_FILIAL_CLIENTS',
    'EDIT_FILIAL_CLIENTS',
    'VIEW_FILIAL_SELLERS',
    'VIEW_SELLER_RANKING',
    'MANAGE_FILIAL_SELLERS',
    'VIEW_FILIAL_DASHBOARD',
    'VIEW_FILIAL_ANALYTICS',
    'VIEW_FILIAL_AGENDA',
    'VIEW_FILIAL_FUNNEL',
    'GENERATE_FILIAL_REPORTS',
    
    // Dados da regional
    'VIEW_REGIONAL_PORTFOLIO',
    'EDIT_REGIONAL_PORTFOLIO',
    'VIEW_REGIONAL_CLIENTS',
    'EDIT_REGIONAL_CLIENTS',
    'VIEW_REGIONAL_SELLERS',
    'MANAGE_REGIONAL_SELLERS',
    'VIEW_REGIONAL_DASHBOARD',
    'VIEW_REGIONAL_ANALYTICS',
    'VIEW_REGIONAL_AGENDA',
    'VIEW_REGIONAL_FUNNEL',
    'GENERATE_REGIONAL_REPORTS',
    
    // IA e análises
    'ACCESS_AI_INSIGHTS',
    'VIEW_RFV_ANALYSIS'
  ],
  
  /**
   * 🟠 GESTOR III - Gestor de Diretoria
   * Escopo: Todas as regionais da sua diretoria
   */
  'GESTOR_III': [
    // Próprios dados
    'VIEW_OWN_PROFILE',
    'VIEW_OWN_PORTFOLIO',
    'EDIT_OWN_PORTFOLIO',
    'VIEW_OWN_CLIENTS',
    'EDIT_OWN_CLIENTS', 
    'VIEW_OWN_DASHBOARD',
    'VIEW_OWN_ANALYTICS',
    'VIEW_OWN_AGENDA',
    'MANAGE_OWN_FUNNEL',
    'GENERATE_OWN_REPORTS',
    
    // Dados da filial
    'VIEW_FILIAL_PORTFOLIO',
    'EDIT_FILIAL_PORTFOLIO',
    'VIEW_FILIAL_CLIENTS',
    'EDIT_FILIAL_CLIENTS',
    'VIEW_FILIAL_SELLERS',
    'VIEW_SELLER_RANKING',
    'MANAGE_FILIAL_SELLERS',
    'VIEW_FILIAL_DASHBOARD',
    'VIEW_FILIAL_ANALYTICS',
    'VIEW_FILIAL_AGENDA',
    'VIEW_FILIAL_FUNNEL',
    'GENERATE_FILIAL_REPORTS',
    
    // Dados da regional
    'VIEW_REGIONAL_PORTFOLIO',
    'EDIT_REGIONAL_PORTFOLIO',
    'VIEW_REGIONAL_CLIENTS',
    'EDIT_REGIONAL_CLIENTS',
    'VIEW_REGIONAL_SELLERS',
    'MANAGE_REGIONAL_SELLERS',
    'VIEW_REGIONAL_DASHBOARD', 
    'VIEW_REGIONAL_ANALYTICS',
    'VIEW_REGIONAL_AGENDA',
    'VIEW_REGIONAL_FUNNEL',
    'GENERATE_REGIONAL_REPORTS',
    
    // Dados globais (diretoria)
    'VIEW_GLOBAL_DASHBOARD',
    'VIEW_GLOBAL_ANALYTICS',
    'GENERATE_GLOBAL_REPORTS',
    
    // Configurações avançadas
    'CONFIGURE_RFV',
    'MANAGE_RFV_PARAMETERS',
    'ACCESS_AI_INSIGHTS',
    'VIEW_RFV_ANALYSIS'
  ],
  
  /**
   * 🔴 GESTOR MASTER - Acesso Total
   * Escopo: Toda a empresa + permissões de sistema
   */
  'GESTOR_MASTER': [
    // Próprios dados
    'VIEW_OWN_PROFILE',
    'VIEW_OWN_PORTFOLIO',
    'EDIT_OWN_PORTFOLIO',
    'VIEW_OWN_CLIENTS',
    'EDIT_OWN_CLIENTS',
    'VIEW_OWN_DASHBOARD',
    'VIEW_OWN_ANALYTICS', 
    'VIEW_OWN_AGENDA',
    'MANAGE_OWN_FUNNEL',
    'GENERATE_OWN_REPORTS',
    
    // Dados da filial
    'VIEW_FILIAL_PORTFOLIO',
    'EDIT_FILIAL_PORTFOLIO',
    'VIEW_FILIAL_CLIENTS',
    'EDIT_FILIAL_CLIENTS',
    'VIEW_FILIAL_SELLERS',
    'VIEW_SELLER_RANKING',
    'MANAGE_FILIAL_SELLERS',
    'VIEW_FILIAL_DASHBOARD',
    'VIEW_FILIAL_ANALYTICS',
    'VIEW_FILIAL_AGENDA',
    'VIEW_FILIAL_FUNNEL', 
    'GENERATE_FILIAL_REPORTS',
    
    // Dados da regional
    'VIEW_REGIONAL_PORTFOLIO',
    'EDIT_REGIONAL_PORTFOLIO',
    'VIEW_REGIONAL_CLIENTS',
    'EDIT_REGIONAL_CLIENTS',
    'VIEW_REGIONAL_SELLERS',
    'MANAGE_REGIONAL_SELLERS',
    'VIEW_REGIONAL_DASHBOARD',
    'VIEW_REGIONAL_ANALYTICS',
    'VIEW_REGIONAL_AGENDA',
    'VIEW_REGIONAL_FUNNEL',
    'GENERATE_REGIONAL_REPORTS',
    
    // Dados globais
    'VIEW_ALL_PORTFOLIO',
    'EDIT_ALL_PORTFOLIO',
    'VIEW_ALL_CLIENTS',
    'EDIT_ALL_CLIENTS',
    'VIEW_ALL_SELLERS',
    'MANAGE_ALL_SELLERS',
    'VIEW_GLOBAL_DASHBOARD',
    'VIEW_GLOBAL_ANALYTICS',
    'VIEW_ALL_AGENDA',
    'VIEW_ALL_FUNNEL',
    'GENERATE_GLOBAL_REPORTS',
    'EXPORT_DATA',
    
    // Gestão de usuários
    'VIEW_USERS',
    'CREATE_USERS',
    'EDIT_USERS',
    'DELETE_USERS',
    'MANAGE_HIERARCHY',
    
    // Configurações do sistema
    'CONFIGURE_RFV',
    'MANAGE_RFV_PARAMETERS',
    'ACCESS_AI_INSIGHTS',
    'CONFIGURE_AI_MODELS',
    'MANAGE_AI_TRAINING',
    'VIEW_RFV_ANALYSIS',
    
    // Administração do sistema
    'VIEW_SYSTEM_LOGS',
    'MANAGE_NOTIFICATIONS',
    'EXECUTE_SEED_OPERATIONS',
    'MANAGE_SYSTEM_CONFIG',
    'VIEW_API_USAGE'
  ]
};

/**
 * Verifica se um usuário tem uma permissão específica
 */
export function hasPermission(userRole: string, permission: Permission): boolean {
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  return userPermissions.includes(permission);
}

/**
 * Verifica se um usuário tem pelo menos uma das permissões fornecidas
 */
export function hasAnyPermission(userRole: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Verifica se um usuário tem todas as permissões fornecidas
 */
export function hasAllPermissions(userRole: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Extrai o escopo do usuário e verifica permissões em uma requisição
 */
export function checkPermission(request: NextRequest, permission: Permission): boolean {
  const scope = deriveScopeFromRequest(request);
  return hasPermission(scope.role, permission);
}

/**
 * Middleware helper para APIs que precisam de permissões específicas
 */
export function requirePermission(permission: Permission) {
  return (request: NextRequest): { allowed: boolean; scope: UserScope; error?: string } => {
    const scope = deriveScopeFromRequest(request);
    
    if (!scope.role) {
      return {
        allowed: false,
        scope,
        error: 'Usuário não autenticado ou informações de perfil não encontradas'
      };
    }
    
    if (!hasPermission(scope.role, permission)) {
      return {
        allowed: false,
        scope,
        error: getFriendlyPermissionError(permission, scope.role)
      };
    }
    
    return { allowed: true, scope };
  };
}

/**
 * Middleware helper para APIs que precisam de qualquer uma das permissões
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (request: NextRequest): { allowed: boolean; scope: UserScope; error?: string } => {
    const scope = deriveScopeFromRequest(request);
    
    if (!scope.role) {
      return {
        allowed: false,
        scope,
        error: 'Usuário não autenticado ou informações de perfil não encontradas'
      };
    }
    
    if (!hasAnyPermission(scope.role, permissions)) {
      return {
        allowed: false,
        scope,
        error: getFriendlyMultiplePermissionsError(permissions, scope.role)
      };
    }
    
    return { allowed: true, scope };
  };
}

/**
 * Helper para validar acesso a dados baseado no escopo organizacional
 */
export function validateDataAccess(
  scope: UserScope, 
  targetData: { 
    empresaId?: number; 
    diretoriaId?: number; 
    regionalId?: number; 
    filialId?: number;
    userId?: number;
  }
): { allowed: boolean; reason?: string } {
  
  // GESTOR_MASTER tem acesso a tudo
  if (scope.role === 'GESTOR_MASTER') {
    return { allowed: true };
  }
  
  // Verificar escopo de empresa
  if (scope.empresaId && targetData.empresaId && scope.empresaId !== targetData.empresaId) {
    return { 
      allowed: false, 
      reason: 'Dados pertencem a empresa diferente' 
    };
  }
  
  // Verificar escopo por role
  switch (scope.role) {
    case 'VENDEDOR':
      // Vendedor só acessa próprios dados
      if (targetData.userId && scope.userId !== targetData.userId) {
        return { allowed: false, reason: 'Vendedor só pode acessar próprios dados' };
      }
      break;
      
    case 'GESTOR_I':
      // Gestor I só acessa dados da sua filial
      if (targetData.filialId && scope.filialId !== targetData.filialId) {
        return { allowed: false, reason: 'Gestor I só pode acessar dados da própria filial' };
      }
      break;
      
    case 'GESTOR_II':
      // Gestor II só acessa dados da sua regional
      if (targetData.regionalId && scope.regionalId !== targetData.regionalId) {
        return { allowed: false, reason: 'Gestor II só pode acessar dados da própria regional' };
      }
      break;
      
    case 'GESTOR_III':
      // Gestor III só acessa dados da sua diretoria
      if (targetData.diretoriaId && scope.diretoriaId !== targetData.diretoriaId) {
        return { allowed: false, reason: 'Gestor III só pode acessar dados da própria diretoria' };
      }
      break;
  }
  
  return { allowed: true };
}

/**
 * Lista todas as permissões de um role
 */
export function getRolePermissions(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Verifica se um role existe
 */
export function isValidRole(role: string): boolean {
  return Object.keys(ROLE_PERMISSIONS).includes(role);
}