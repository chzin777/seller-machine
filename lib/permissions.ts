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
        error: 'Role do usuário não encontrada nos headers'
      };
    }
    
    if (!hasPermission(scope.role, permission)) {
      return {
        allowed: false,
        scope,
        error: `Permissão '${permission}' necessária. Role atual: '${scope.role}'`
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
        error: 'Role do usuário não encontrada nos headers'
      };
    }
    
    if (!hasAnyPermission(scope.role, permissions)) {
      return {
        allowed: false,
        scope,
        error: `Uma das permissões necessária: [${permissions.join(', ')}]. Role atual: '${scope.role}'`
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