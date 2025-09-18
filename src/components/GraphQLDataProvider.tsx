"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';
import { useInactivityConfig } from '../hooks/useInactivityConfig';

// Tipos compatíveis com o DataProvider atual
type ReceitaMensal = {
  ano: number;
  receitaPorMes: Record<string, number>;
};

type ReceitaPorTipo = { tipo: string; receita: number }[];
type VendaPorFilial = { filial: { nome: string }; receitaTotal: number; quantidadeNotas: number }[];

interface GraphQLDataContextType {
  receitaTotal: number | null;
  ticketMedio: number | null;
  itensVendidos: number | null;
  receitaMensal: ReceitaMensal | null;
  receitaPorTipo: ReceitaPorTipo;
  vendasPorFilial: VendaPorFilial;
  clientesAtivos: number | null;
  clientesInativos: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const GraphQLDataContext = createContext<GraphQLDataContextType | undefined>(undefined);

// Função para transformar dados GraphQL no formato esperado pelo dashboard

// Novo: Hook para buscar clientes inativos do endpoint REST usando dias do banco
function useClientesInativosREST() {
  const { diasInatividade, loading: loadingDias, loadConfiguration } = useInactivityConfig();
  const [clientesInativos, setClientesInativos] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    // Primeiro busca o valor atualizado da configuração
    loadConfiguration().then((dias) => {
      if (isMounted && dias && dias > 0) {
        console.log('🔎 Buscando clientes inativos com dias =', dias);
        fetch(`/api/indicadores/clientes-inativos?dias=${dias}`)
          .then(async (res) => {
            if (!res.ok) throw new Error('Erro ao buscar clientes inativos');
            const data = await res.json();
            let total = data?.total_clientes_inativos ?? data?.clientes_inativos ?? data?.length ?? 0;
            setClientesInativos(typeof total === 'number' ? total : 0);
          })
          .catch((err) => {
            setError(err.message);
            setClientesInativos(null);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [diasInatividade]);

  return { clientesInativos, loading: loading || loadingDias, error };
}

function transformGraphQLData(dashboardData: any, clientesInativosREST: { clientesInativos: number | null, loading: boolean, error: string | null }): GraphQLDataContextType {
  const { stats, vendasPorMes, topProdutos, clientes } = dashboardData;
  // ...existing code...
  const receitaMensal: ReceitaMensal | null = vendasPorMes.data ? {
    ano: new Date().getFullYear(),
    receitaPorMes: vendasPorMes.data.reduce((acc: Record<string, number>, item: any) => {
      acc[item.mes] = item.vendas;
      return acc;
    }, {})
  } : null;
  const receitaPorTipo: ReceitaPorTipo = topProdutos.data ? 
    topProdutos.data.map((item: any) => ({
      tipo: item.produto.categoria,
      receita: item.receita_total
    })) : [];
  const vendasPorFilial: VendaPorFilial = [
    { filial: { nome: 'Filial Principal' }, receitaTotal: stats.data?.total_vendas || 0, quantidadeNotas: 100 }
  ];
  return {
    receitaTotal: stats.data?.total_vendas || null,
    ticketMedio: stats.data?.total_vendas && stats.data?.total_clientes ? 
      stats.data.total_vendas / stats.data.total_clientes : null,
    itensVendidos: stats.data?.total_produtos || null,
    receitaMensal,
    receitaPorTipo,
    vendasPorFilial,
    clientesAtivos: stats.data?.total_clientes || null,
    clientesInativos: clientesInativosREST.clientesInativos,
    loading: stats.loading || vendasPorMes.loading || topProdutos.loading || clientes.loading || clientesInativosREST.loading,
    error: stats.error || vendasPorMes.error || topProdutos.error || clientes.error || clientesInativosREST.error,
    refetch: dashboardData.refetchAll
  };
}

export function GraphQLDataProvider({ children }: { children: ReactNode }) {
  const dashboardData = useDashboardData();
  const clientesInativosREST = useClientesInativosREST();
  const transformedData = transformGraphQLData(dashboardData, clientesInativosREST);
  return (
    <GraphQLDataContext.Provider value={transformedData}>
      {children}
    </GraphQLDataContext.Provider>
  );
}

export function useGraphQLData() {
  const context = useContext(GraphQLDataContext);
  if (context === undefined) {
    throw new Error('useGraphQLData must be used within a GraphQLDataProvider');
  }
  return context;
}

// Hook que permite alternar entre GraphQL e API REST
export function useAdaptiveData(useGraphQL = false) {
  // Importação dinâmica para evitar problemas de dependência circular
  const { useData } = require('./DataProvider');
  
  if (useGraphQL) {
    return useGraphQLData();
  } else {
    return useData();
  }
}