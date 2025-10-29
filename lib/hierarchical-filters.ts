/**
 * Sistema de filtros hierárquicos para controle de acesso a dados
 * 
 * Este arquivo implementa a lógica para filtrar dados baseado na posição
 * hierárquica do usuário na organização:
 * 
 * VENDEDOR -> vê apenas seus próprios dados
 * GESTOR_I -> vê dados da sua filial
 * GESTOR_II -> vê dados da sua regional 
 * GESTOR_III -> vê dados da sua diretoria
 * GESTOR_MASTER -> vê todos os dados
 */

import type { UserScope } from './scope';

export interface HierarchicalData {
  empresaId?: number;
  diretoriaId?: number;
  regionalId?: number;
  filialId?: number;
  vendedorId?: number;
  userId?: number;
}

/**
 * Aplica filtros hierárquicos a uma URL de API
 */
export function applyHierarchicalFiltersToUrl(baseUrl: string, scope: UserScope): string {
  const url = new URL(baseUrl, 'https://dummy.com');
  
  switch (scope.role) {
    case 'VENDEDOR':
      // Vendedor só vê seus próprios dados
      if (scope.userId) {
        url.searchParams.set('vendedorId', scope.userId.toString());
      }
      if (scope.filialId) {
        url.searchParams.set('filialId', scope.filialId.toString());
      }
      break;
      
    case 'GESTOR_I':
      // Gestor I vê dados da sua filial
      if (scope.filialId) {
        url.searchParams.set('filialId', scope.filialId.toString());
      }
      break;
      
    case 'GESTOR_II':
      // Gestor II vê dados da sua regional
      if (scope.regionalId) {
        url.searchParams.set('regionalId', scope.regionalId.toString());
      }
      break;
      
    case 'GESTOR_III':
      // Gestor III vê dados da sua diretoria
      if (scope.diretoriaId) {
        url.searchParams.set('diretoriaId', scope.diretoriaId.toString());
      }
      break;
      
    case 'GESTOR_MASTER':
      // Gestor Master vê todos os dados - sem filtros adicionais
      break;
  }
  
  // Sempre incluir empresa se disponível
  if (scope.empresaId) {
    url.searchParams.set('empresaId', scope.empresaId.toString());
  }
  
  return url.pathname + url.search;
}

/**
 * Filtra um array de dados baseado na hierarquia do usuário
 */
export function filterDataByHierarchy<T extends HierarchicalData>(
  data: T[], 
  scope: UserScope
): T[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.filter(item => {
    // GESTOR_MASTER vê tudo
    if (scope.role === 'GESTOR_MASTER') {
      return true;
    }
    
    // Verificar empresa se disponível
    if (scope.empresaId && item.empresaId && item.empresaId !== scope.empresaId) {
      return false;
    }
    
    switch (scope.role) {
      case 'VENDEDOR':
        // Vendedor só vê seus próprios dados
        if (item.userId && scope.userId) {
          return item.userId === scope.userId;
        }
        if (item.vendedorId && scope.userId) {
          return item.vendedorId === scope.userId;
        }
        // Se não tem identificação de usuário, verificar por filial
        if (item.filialId && scope.filialId) {
          return item.filialId === scope.filialId;
        }
        return false;
        
      case 'GESTOR_I':
        // Gestor I vê dados da sua filial
        if (item.filialId && scope.filialId) {
          return item.filialId === scope.filialId;
        }
        return true; // Se não tem filialId definida, permitir
        
      case 'GESTOR_II':
        // Gestor II vê dados da sua regional
        if (item.regionalId && scope.regionalId) {
          return item.regionalId === scope.regionalId;
        }
        return true; // Se não tem regionalId definida, permitir
        
      case 'GESTOR_III':
        // Gestor III vê dados da sua diretoria
        if (item.diretoriaId && scope.diretoriaId) {
          return item.diretoriaId === scope.diretoriaId;
        }
        return true; // Se não tem diretoriaId definida, permitir
        
      default:
        return false;
    }
  });
}

/**
 * Cria parâmetros de query para APIs externas baseado na hierarquia
 */
export function createHierarchicalQueryParams(scope: UserScope): Record<string, string> {
  const params: Record<string, string> = {};
  
  // Sempre incluir empresa
  if (scope.empresaId) {
    params.empresaId = scope.empresaId.toString();
  }
  
  switch (scope.role) {
    case 'VENDEDOR':
      if (scope.userId) {
        params.vendedorId = scope.userId.toString();
      }
      if (scope.filialId) {
        params.filialId = scope.filialId.toString();
      }
      break;
      
    case 'GESTOR_I':
      if (scope.filialId) {
        params.filialId = scope.filialId.toString();
      }
      break;
      
    case 'GESTOR_II':
      if (scope.regionalId) {
        params.regionalId = scope.regionalId.toString();
      }
      break;
      
    case 'GESTOR_III':
      if (scope.diretoriaId) {
        params.diretoriaId = scope.diretoriaId.toString();
      }
      break;
      
    case 'GESTOR_MASTER':
      // Sem filtros adicionais para ver todos os dados
      break;
  }
  
  return params;
}

/**
 * Valida se um usuário pode acessar dados específicos
 */
export function canAccessData(scope: UserScope, data: HierarchicalData): boolean {
  // GESTOR_MASTER pode acessar tudo
  if (scope.role === 'GESTOR_MASTER') {
    return true;
  }
  
  // Verificar empresa
  if (scope.empresaId && data.empresaId && scope.empresaId !== data.empresaId) {
    return false;
  }
  
  switch (scope.role) {
    case 'VENDEDOR':
      // Vendedor só pode acessar seus próprios dados
      if (data.userId && scope.userId) {
        return data.userId === scope.userId;
      }
      if (data.vendedorId && scope.userId) {
        return data.vendedorId === scope.userId;
      }
      if (data.filialId && scope.filialId) {
        return data.filialId === scope.filialId;
      }
      return false;
      
    case 'GESTOR_I':
      // Gestor I pode acessar dados da sua filial
      if (data.filialId && scope.filialId) {
        return data.filialId === scope.filialId;
      }
      return true;
      
    case 'GESTOR_II':
      // Gestor II pode acessar dados da sua regional
      if (data.regionalId && scope.regionalId) {
        return data.regionalId === scope.regionalId;
      }
      return true;
      
    case 'GESTOR_III':
      // Gestor III pode acessar dados da sua diretoria
      if (data.diretoriaId && scope.diretoriaId) {
        return data.diretoriaId === scope.diretoriaId;
      }
      return true;
      
    default:
      return false;
  }
}

/**
 * Obtém uma descrição textual do escopo de acesso do usuário
 */
export function getScopeDescription(scope: UserScope): string {
  switch (scope.role) {
    case 'VENDEDOR':
      return 'Você tem acesso apenas aos seus próprios dados e clientes.';
    case 'GESTOR_I':
      return 'Você tem acesso aos dados de todos os vendedores da sua filial.';
    case 'GESTOR_II':
      return 'Você tem acesso aos dados de todas as filiais da sua regional.';
    case 'GESTOR_III':
      return 'Você tem acesso aos dados de todas as regionais da sua diretoria.';
    case 'GESTOR_MASTER':
      return 'Você tem acesso a todos os dados de todas as empresas.';
    default:
      return 'Escopo de acesso não definido.';
  }
}

/**
 * Cria headers para requisições com informações hierárquicas
 */
export function createScopeHeaders(scope: UserScope): Record<string, string> {
  const headers: Record<string, string> = {
    'x-user-role': scope.role
  };
  
  if (scope.userId) {
    headers['x-user-id'] = scope.userId.toString();
  }
  if (scope.empresaId) {
    headers['x-user-empresa-id'] = scope.empresaId.toString();
  }
  if (scope.diretoriaId) {
    headers['x-user-diretoria-id'] = scope.diretoriaId.toString();
  }
  if (scope.regionalId) {
    headers['x-user-regional-id'] = scope.regionalId.toString();
  }
  if (scope.filialId) {
    headers['x-user-filial-id'] = scope.filialId.toString();
  }
  
  return headers;
}

/**
 * Extrai escopo do usuário do localStorage/sessionStorage
 */
export function getUserScopeFromStorage(): UserScope | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) {
      return null;
    }
    
    const data = JSON.parse(userStr);
    console.log('🔍 Debug getUserScopeFromStorage - parsed data:', data);
    
    // Os dados podem estar em data.user ou diretamente em data
    const user = data.user || data;
    console.log('🔍 Debug getUserScopeFromStorage - extracted user:', user);
    
    // Mapear diferentes possibilidades de role
    let role = user.role || user.perfil || user.tipo || 'VENDEDOR';
    
    // Normalizar role names comuns
    if (role === 'ADMIN' || role === 'admin' || role === 'Admin') {
      role = 'GESTOR_MASTER';
    }
    
    console.log('🔍 Debug getUserScopeFromStorage - final role:', role);
    
    // Para VENDEDOR, usar vendedorId se disponível (vinculado via CPF)
    const userId = role === 'VENDEDOR' && user.vendedorId 
      ? user.vendedorId 
      : (user.id || user.userId || user.user_id);
    
    if (user.vendedorId) {
      console.log('✅ Vendedor vinculado - ID_Vendedor:', user.vendedorId, '| Nome:', user.vendedorNome);
      console.log('📋 UserScope.userId será:', userId);
    } else if (role === 'VENDEDOR') {
      console.log('⚠️ ATENÇÃO: Usuário VENDEDOR mas sem vendedorId! CPF:', user.cpf);
      console.log('📋 Usando fallback userId:', userId);
    }
    
    const scope = {
      role,
      userId,
      vendedorId: user.vendedorId, // ID_Vendedor da tabela Vendedores (vinculado via CPF)
      empresaId: user.empresaId || user.empresa_id,
      diretoriaId: user.diretoriaId || user.diretoria_id,
      regionalId: user.regionalId || user.regional_id,
      filialId: user.filialId || user.filial_id
    };
    
    console.log('🎯 UserScope final:', scope);
    
    return scope;
  } catch (error) {
    console.error('Erro ao extrair escopo do usuário:', error);
    return null;
  }
}

/**
 * Hook personalizado para obter o escopo do usuário
 */
export function useUserScope(): UserScope | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  return getUserScopeFromStorage();
}