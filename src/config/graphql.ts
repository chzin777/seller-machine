// config/graphql.ts

// Debug das variáveis de ambiente
console.log('🔧 Debug GraphQL Config:');
console.log('  NEXT_PUBLIC_ENABLE_GRAPHQL:', process.env.NEXT_PUBLIC_ENABLE_GRAPHQL);
console.log('  NEXT_PUBLIC_GRAPHQL_URL:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

// Configurações do GraphQL
export const GRAPHQL_CONFIG = {
  // URL do servidor GraphQL - usando proxy local para evitar CORS
  endpoint: '/api/graphql',
  
  // Configurações de cache
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos
    key: 'graphql-cache'
  },
  
  // Configurações de retry
  retry: {
    attempts: 3,
    delay: 1000 // 1 segundo
  },
  
  // Headers padrão
  defaultHeaders: {
    'Content-Type': 'application/json',
    // Adicione outros headers se necessário
  },
  
  // Configurações de timeout
  timeout: 30000, // 30 segundos
  
  // Flag para habilitar/desabilitar GraphQL globalmente
  enabled: process.env.NEXT_PUBLIC_ENABLE_GRAPHQL === 'true',
  
  // Configurações de desenvolvimento
  dev: {
    enableLogs: process.env.NODE_ENV === 'development',
    mockData: process.env.NEXT_PUBLIC_MOCK_GRAPHQL === 'true' || false
  }
};

// Função para verificar se GraphQL está disponível
export async function checkGraphQLHealth(): Promise<boolean> {
  if (!GRAPHQL_CONFIG.enabled) return false;
  
  try {
    const response = await fetch(GRAPHQL_CONFIG.endpoint, {
      method: 'POST',
      headers: GRAPHQL_CONFIG.defaultHeaders,
      body: JSON.stringify({
        query: '{ __typename }' // Query simples para testar conectividade
      })
    });
    
    return response.ok;
  } catch (error) {
    console.warn('GraphQL health check failed:', error);
    return false;
  }
}

// Função para obter token de autenticação
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

// Função para obter headers com autenticação
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...GRAPHQL_CONFIG.defaultHeaders };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Tipos para configuração
export interface GraphQLConfig {
  endpoint: string;
  cache: {
    enabled: boolean;
    ttl: number;
    key: string;
  };
  retry: {
    attempts: number;
    delay: number;
  };
  defaultHeaders: Record<string, string>;
  timeout: number;
  enabled: boolean;
  dev: {
    enableLogs: boolean;
    mockData: boolean;
  };
}

// Função para criar configuração customizada
export function createGraphQLConfig(overrides: Partial<GraphQLConfig>): GraphQLConfig {
  return {
    ...GRAPHQL_CONFIG,
    ...overrides
  };
}