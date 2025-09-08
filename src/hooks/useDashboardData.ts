// hooks/useDashboardData.ts
import { useState, useEffect } from 'react'
import { useGraphQL } from './useGraphql'
import {
  GET_DASHBOARD_STATS,
  GET_CLIENTES,
  GET_CLIENTE_HISTORICO,
  GET_PRODUTOS,
  GET_VENDAS_POR_MES,
  GET_TOP_PRODUTOS,
  GET_ASSOCIACOES,
  DashboardStats,
  Cliente,
  Produto,
  VendaPorMes,
  TopProduto
} from '../utils/graphql-queries'

// Hook para estatísticas do dashboard
export function useDashboardStats() {
  return useGraphQL<{ dashboardStats: DashboardStats }>(
    GET_DASHBOARD_STATS,
    {},
    []
  )
}

// Hook para lista de clientes com fallback para REST API
export function useClientes(limit = 50, offset = 0, search = '') {
  const graphqlResult = useGraphQL<{ clientes: { clientes: Cliente[], total: number } }>(
    GET_CLIENTES,
    { 
      input: {
        limit,
        offset,
        nome: search || undefined
      }
    },
    [limit, offset, search]
  );

  // Se GraphQL falhar, usar REST API como fallback
  const [restData, setRestData] = useState<{ clientes: Cliente[], total: number } | null>(null);
  const [restLoading, setRestLoading] = useState(false);
  const [restError, setRestError] = useState<string | null>(null);

  useEffect(() => {
    if (graphqlResult.error && !graphqlResult.loading) {
      setRestLoading(true);
      setRestError(null);
      
      const fetchRestData = async () => {
        try {
          const params = new URLSearchParams();
          params.append('limit', limit.toString());
          params.append('offset', offset.toString());
          if (search) params.append('search', search);
          
          const response = await fetch(`/api/proxy?url=/api/clientes?${params.toString()}`);
          if (!response.ok) {
            throw new Error(`REST API Error: ${response.status}`);
          }
          
          const data = await response.json();
          const clientes = Array.isArray(data) ? data : (data.data || []);
          setRestData({ clientes, total: clientes.length });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro na REST API';
          setRestError(errorMessage);
        } finally {
          setRestLoading(false);
        }
      };
      
      fetchRestData();
    }
  }, [graphqlResult.error, graphqlResult.loading, limit, offset, search]);

  // Retornar dados do GraphQL se disponível, senão do REST API
  if (graphqlResult.data && !graphqlResult.error) {
    return {
      data: graphqlResult.data.clientes, // Acessar a estrutura aninhada
      loading: graphqlResult.loading,
      error: graphqlResult.error,
      refetch: graphqlResult.refetch
    };
  }
  
  if (graphqlResult.error && restData) {
    return {
      data: restData,
      loading: restLoading,
      error: null,
      refetch: graphqlResult.refetch
    };
  }
  
  return {
    data: restData,
    loading: graphqlResult.loading || restLoading,
    error: graphqlResult.error && restError ? `GraphQL: ${graphqlResult.error}, REST: ${restError}` : (graphqlResult.error || restError),
    refetch: graphqlResult.refetch
  };
}

// Hook para histórico de um cliente específico
export function useClienteHistorico(clienteId: number, skip = false) {
  return useGraphQL<{ cliente: Cliente & { pedidos: any[] } }>(
    GET_CLIENTE_HISTORICO,
    { clienteId },
    [clienteId],
    { skip }
  )
}

// Hook para lista de produtos
export function useProdutos(limit = 50, offset = 0, categoria = '') {
  return useGraphQL<{ produtos: Produto[] }>(
    GET_PRODUTOS,
    { limit, offset, categoria },
    [limit, offset, categoria]
  )
}

// Hook para vendas por mês
export function useVendasPorMes(ano = new Date().getFullYear()) {
  return useGraphQL<{ vendasPorMes: VendaPorMes[] }>(
    GET_VENDAS_POR_MES,
    { ano },
    [ano]
  )
}

// Hook para top produtos
export function useTopProdutos(limit = 10) {
  return useGraphQL<{ topProdutos: TopProduto[] }>(
    GET_TOP_PRODUTOS,
    { limit },
    [limit]
  )
}

// Hook para associações de produtos
export function useAssociacoes() {
  return useGraphQL<{ associacoes: any[] }>(
    GET_ASSOCIACOES,
    {},
    []
  )
}

// Hook combinado para dados do dashboard principal
export function useDashboardData() {
  const stats = useDashboardStats()
  const vendasPorMes = useVendasPorMes()
  const topProdutos = useTopProdutos(5)
  const clientes = useClientes(10)
  
  return {
    stats: {
      data: stats.data?.dashboardStats,
      loading: stats.loading,
      error: stats.error
    },
    vendasPorMes: {
      data: vendasPorMes.data?.vendasPorMes,
      loading: vendasPorMes.loading,
      error: vendasPorMes.error
    },
    topProdutos: {
      data: topProdutos.data?.topProdutos,
      loading: topProdutos.loading,
      error: topProdutos.error
    },
    clientes: {
      data: clientes.data?.clientes,
      loading: clientes.loading,
      error: clientes.error
    },
    // Função para refazer todas as queries
    refetchAll: () => {
      stats.refetch()
      vendasPorMes.refetch()
      topProdutos.refetch()
      clientes.refetch()
    }
  }
}