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
  Pedido,
  VendaPorMes,
  TopProduto
} from '../utils/graphql-queries'
import { GET_PEDIDOS, PedidosInput } from '../utils/graphql-queries'

// Hook para estatísticas do dashboard
export function useDashboardStats() {
  return useGraphQL<{ clientes: { total: number } }>(
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
  return useGraphQL<{ pedidos: { pedidos: Pedido[], total: number } }>(
    GET_CLIENTE_HISTORICO,
    { clienteId },
    [clienteId],
    { skip }
  )
}

// Hook para lista de produtos (usando clientes como fallback)
export function useProdutos(limit = 50, offset = 0, categoria = '') {
  return useGraphQL<{ clientes: { clientes: any[], total: number } }>(
    GET_PRODUTOS,
    { limit, offset },
    [limit, offset]
  )
}

// Hook para vendas por mês (usando CRM novos/recorrentes)
export function useVendasPorMes() {
  const currentYear = new Date().getFullYear()
  return useGraphQL<{ crmNovosRecorrentes: { meses: any[] } }>(
    GET_VENDAS_POR_MES,
    { 
      input: { 
        dataInicio: `${currentYear}-01-01`, 
        dataFim: `${currentYear}-12-31`, 
        filialId: 1 
      } 
    },
    []
  )
}

// Hook para top produtos (usando mix por tipo)
export function useTopProdutos(limit = 10) {
  return useGraphQL<{ mixPorTipo: { tipos: any[] } }>(
    GET_TOP_PRODUTOS,
    { periodo: "mes", filialId: 1 },
    []
  )
}

// Hook para associações de produtos (usando cross sell)
export function useAssociacoes() {
  const currentYear = new Date().getFullYear()
  return useGraphQL<{ crossSell: any }>(
    GET_ASSOCIACOES,
    { input: { dataInicio: `${currentYear}-01-01`, dataFim: `${currentYear}-12-31`, filialId: 1 } },
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
      data: stats.data?.clientes ? {
        total_clientes: stats.data.clientes.total,
        total_vendas: 0,
        total_produtos: 0,
        vendas_mes: 0,
        crescimento_vendas: 0
      } : null,
      loading: stats.loading,
      error: stats.error
    },
    vendasPorMes: {
      data: vendasPorMes.data?.crmNovosRecorrentes?.meses || null,
      loading: vendasPorMes.loading,
      error: vendasPorMes.error
    },
    topProdutos: {
      data: topProdutos.data?.mixPorTipo?.tipos || null,
      loading: topProdutos.loading,
      error: topProdutos.error
    },
    clientes: {
      data: clientes.data?.clientes || null,
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

// Hook para buscar pedidos com filtros
export function usePedidos(input: PedidosInput, skip = false) {
  return useGraphQL<{ pedidos: { pedidos: Pedido[], total: number, limit: number, offset: number } }>(
    GET_PEDIDOS,
    { input },
    [input.clienteId, input.filialId, input.vendedorId, input.limit, input.offset, input.dataInicio, input.dataFim, input.status],
    { skip }
  )
}