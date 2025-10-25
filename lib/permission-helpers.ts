import { Permission, getRolePermissions } from './permissions';

/**
 * Hook personalizado para verificar permissões no frontend
 * Deve ser usado em componentes React para controlar exibição de elementos
 */

export interface UserInfo {
  role: string;
  userId?: number;
  empresaId?: number;
  diretoriaId?: number;
  regionalId?: number;
  filialId?: number;
}

/**
 * Verifica se o usuário atual tem uma permissão específica
 */
export function hasUserPermission(user: UserInfo, permission: Permission): boolean {
  if (!user.role) return false;
  
  const userPermissions = getRolePermissions(user.role);
  return userPermissions.includes(permission);
}

/**
 * Verifica se o usuário tem pelo menos uma das permissões listadas
 */
export function hasAnyUserPermission(user: UserInfo, permissions: Permission[]): boolean {
  return permissions.some(permission => hasUserPermission(user, permission));
}

/**
 * Verifica se o usuário tem todas as permissões listadas
 */
export function hasAllUserPermissions(user: UserInfo, permissions: Permission[]): boolean {
  return permissions.every(permission => hasUserPermission(user, permission));
}

/**
 * Helper para verificar se pode ver dados de outros vendedores
 */
export function canViewOtherSellers(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'VIEW_FILIAL_SELLERS',
    'VIEW_REGIONAL_SELLERS', 
    'VIEW_ALL_SELLERS'
  ]);
}

/**
 * Helper para verificar se pode gerenciar vendedores
 */
export function canManageSellers(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'MANAGE_FILIAL_SELLERS',
    'MANAGE_REGIONAL_SELLERS',
    'MANAGE_ALL_SELLERS'
  ]);
}

/**
 * Helper para verificar se pode ver clientes além dos próprios
 */
export function canViewOtherClients(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'VIEW_FILIAL_CLIENTS',
    'VIEW_REGIONAL_CLIENTS',
    'VIEW_ALL_CLIENTS'
  ]);
}

/**
 * Helper para verificar se pode acessar dashboards consolidados
 */
export function canViewConsolidatedDashboards(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'VIEW_FILIAL_DASHBOARD',
    'VIEW_REGIONAL_DASHBOARD',
    'VIEW_GLOBAL_DASHBOARD'
  ]);
}

/**
 * Helper para verificar se pode configurar RFV
 */
export function canConfigureRFV(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'CONFIGURE_RFV',
    'MANAGE_RFV_PARAMETERS'
  ]);
}

/**
 * Helper para verificar se é administrador do sistema
 */
export function isSystemAdmin(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'VIEW_USERS',
    'MANAGE_HIERARCHY',
    'MANAGE_SYSTEM_CONFIG'
  ]);
}

/**
 * Helper para verificar se pode gerar relatórios avançados
 */
export function canGenerateAdvancedReports(user: UserInfo): boolean {
  return hasAnyUserPermission(user, [
    'GENERATE_REGIONAL_REPORTS',
    'GENERATE_GLOBAL_REPORTS',
    'EXPORT_DATA'
  ]);
}

/**
 * Obtém o escopo máximo de dados que o usuário pode acessar
 */
export function getUserMaxScope(user: UserInfo): 'own' | 'filial' | 'regional' | 'global' {
  if (hasUserPermission(user, 'VIEW_ALL_CLIENTS') || 
      hasUserPermission(user, 'VIEW_GLOBAL_DASHBOARD')) {
    return 'global';
  }
  
  if (hasUserPermission(user, 'VIEW_REGIONAL_CLIENTS') || 
      hasUserPermission(user, 'VIEW_REGIONAL_DASHBOARD')) {
    return 'regional';
  }
  
  if (hasUserPermission(user, 'VIEW_FILIAL_CLIENTS') || 
      hasUserPermission(user, 'VIEW_FILIAL_DASHBOARD')) {
    return 'filial';
  }
  
  return 'own';
}

/**
 * Obtém uma descrição legível do nível de acesso do usuário
 */
export function getUserAccessLevel(user: UserInfo): string {
  switch (user.role) {
    case 'VENDEDOR':
      return 'Acesso a dados pessoais';
    case 'GESTOR_I':
      return 'Acesso a dados da filial';
    case 'GESTOR_II':
      return 'Acesso a dados da regional';
    case 'GESTOR_III':
      return 'Acesso a dados da diretoria';
    case 'GESTOR_MASTER':
      return 'Acesso total ao sistema';
    default:
      return 'Nível de acesso não definido';
  }
}

/**
 * Verifica se o usuário pode acessar dados de uma entidade específica
 */
export function canAccessEntity(
  user: UserInfo, 
  entity: {
    userId?: number;
    filialId?: number;
    regionalId?: number;
    diretoriaId?: number;
    empresaId?: number;
  }
): boolean {
  // Master acessa tudo
  if (user.role === 'GESTOR_MASTER') return true;
  
  // Verificar empresa
  if (user.empresaId && entity.empresaId && user.empresaId !== entity.empresaId) {
    return false;
  }
  
  // Verificar por role
  switch (user.role) {
    case 'VENDEDOR':
      return entity.userId === user.userId;
      
    case 'GESTOR_I':
      return !entity.filialId || entity.filialId === user.filialId;
      
    case 'GESTOR_II':
      return !entity.regionalId || entity.regionalId === user.regionalId;
      
    case 'GESTOR_III':
      return !entity.diretoriaId || entity.diretoriaId === user.diretoriaId;
      
    default:
      return false;
  }
}