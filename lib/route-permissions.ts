/**
 * 🛡️ MAPEAMENTO DE ROTAS E PERMISSÕES
 * Define quais permissões são necessárias para acessar cada rota
 */

import { Permission } from './permissions';

export interface RoutePermission {
  path: string;
  permissions: Permission[];
  description: string;
}

/**
 * Mapeamento completo de rotas e suas permissões necessárias
 * Organizadas por categoria funcional
 */
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // ====== GESTÃO DE USUÁRIOS ======
  {
    path: '/usuarios',
    permissions: ['VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS'],
    description: 'Gestão completa de usuários - apenas GESTOR_MASTER'
  },
  {
    path: '/api/users',
    permissions: ['VIEW_USERS', 'CREATE_USERS', 'EDIT_USERS', 'DELETE_USERS'],
    description: 'API de gestão de usuários - apenas GESTOR_MASTER'
  },
  {
    path: '/api/hierarchy',
    permissions: ['MANAGE_HIERARCHY'],
    description: 'Gestão da hierarquia organizacional - apenas GESTOR_MASTER'
  },

  // ====== CARTEIRA & VENDEDORES ======
  {
    path: '/carteira-vendedor',
    permissions: ['VIEW_OWN_PORTFOLIO', 'VIEW_FILIAL_PORTFOLIO', 'VIEW_REGIONAL_PORTFOLIO', 'VIEW_ALL_PORTFOLIO'],
    description: 'Visualizar carteiras - escopo baseado no perfil'
  },
  {
    path: '/api/carteira-vendedor',
    permissions: ['VIEW_OWN_PORTFOLIO', 'VIEW_FILIAL_PORTFOLIO', 'VIEW_REGIONAL_PORTFOLIO', 'VIEW_ALL_PORTFOLIO'],
    description: 'API de carteiras - escopo baseado no perfil'
  },
  {
    path: '/vendedores',
    permissions: ['VIEW_OWN_PROFILE', 'VIEW_FILIAL_SELLERS', 'VIEW_REGIONAL_SELLERS', 'VIEW_ALL_SELLERS'],
    description: 'Visualizar vendedores - GESTOR_I e acima'
  },
  {
    path: '/api/vendedores',
    permissions: ['VIEW_OWN_PROFILE', 'VIEW_FILIAL_SELLERS', 'VIEW_REGIONAL_SELLERS', 'VIEW_ALL_SELLERS'],
    description: 'API de vendedores - todos podem acessar (filtrado por hierarquia)'
  },

  // ====== CLIENTES ======
  {
    path: '/clientes',
    permissions: ['VIEW_REGIONAL_CLIENTS', 'VIEW_ALL_CLIENTS'],
    description: 'Visualizar clientes - GESTOR_II e acima'
  },
  {
    path: '/api/clientes',
    permissions: ['VIEW_REGIONAL_CLIENTS', 'VIEW_ALL_CLIENTS'],
    description: 'API de clientes - GESTOR_II e acima'
  },

  // ====== DASHBOARDS ======
  {
    path: '/dashboard',
    permissions: ['VIEW_OWN_DASHBOARD', 'VIEW_FILIAL_DASHBOARD', 'VIEW_REGIONAL_DASHBOARD', 'VIEW_GLOBAL_DASHBOARD'],
    description: 'Dashboard principal - todos os usuários autenticados'
  },
  {
    path: '/dashboard-graphql',
    permissions: ['VIEW_GLOBAL_DASHBOARD'],
    description: 'Dashboard GraphQL avançado - GESTOR_III e acima'
  },

  // ====== RFV & ANÁLISES ======
  {
    path: '/configurar-rfv',
    permissions: ['CONFIGURE_RFV', 'MANAGE_RFV_PARAMETERS'],
    description: 'Configuração RFV - GESTOR_III e acima'
  },
  {
    path: '/api/rfv',
    permissions: ['VIEW_RFV_ANALYSIS'],
    description: 'Análises RFV - GESTOR_II e acima'
  },
  {
    path: '/api/rfv-parameters',
    permissions: ['MANAGE_RFV_PARAMETERS'],
    description: 'Parâmetros RFV - GESTOR_III e acima'
  },

  // ====== INTELIGÊNCIA ARTIFICIAL ======
  {
    path: '/ia',
    permissions: ['ACCESS_AI_INSIGHTS'],
    description: 'Insights de IA - todos os usuários autenticados'
  },
  {
    path: '/api/ai',
    permissions: ['ACCESS_AI_INSIGHTS'],
    description: 'API de IA - todos os usuários autenticados'
  },

  // ====== SISTEMA & ADMIN ======
  {
    path: '/api/seed',
    permissions: ['EXECUTE_SEED_OPERATIONS'],
    description: 'Operações de seed - apenas GESTOR_MASTER'
  },
  {
    path: '/configuracoes',
    permissions: ['MANAGE_SYSTEM_CONFIG'],
    description: 'Configurações do sistema - apenas GESTOR_MASTER'
  },

  // ====== RELATÓRIOS ======
  {
    path: '/mapa-vendas',
    permissions: ['VIEW_FILIAL_ANALYTICS', 'VIEW_REGIONAL_ANALYTICS', 'VIEW_GLOBAL_ANALYTICS'],
    description: 'Mapa de vendas - GESTOR_I e acima'
  }
];

/**
 * Verifica se um usuário tem permissão para acessar uma rota específica
 */
export function checkRoutePermission(path: string, userPermissions: Permission[]): boolean {
  const routePermission = ROUTE_PERMISSIONS.find(route => 
    path.startsWith(route.path)
  );
  
  if (!routePermission) {
    // Se a rota não está mapeada, permitir acesso (para rotas gerais como /dashboard)
    return true;
  }
  
  // Verificar se o usuário possui pelo menos uma das permissões necessárias
  return routePermission.permissions.some(permission => 
    userPermissions.includes(permission)
  );
}

/**
 * Obtém a lista de permissões necessárias para uma rota
 */
export function getRoutePermissions(path: string): Permission[] {
  const routePermission = ROUTE_PERMISSIONS.find(route => 
    path.startsWith(route.path)
  );
  
  return routePermission?.permissions || [];
}

/**
 * Obtém informações completas sobre uma rota
 */
export function getRouteInfo(path: string): RoutePermission | undefined {
  return ROUTE_PERMISSIONS.find(route => 
    path.startsWith(route.path)
  );
}