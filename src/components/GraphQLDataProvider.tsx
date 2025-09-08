"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

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
function transformGraphQLData(dashboardData: any): GraphQLDataContextType {
  const { stats, vendasPorMes, topProdutos, clientes } = dashboardData;
  
  // Transformar vendas por mês no formato esperado
  const receitaMensal: ReceitaMensal | null = vendasPorMes.data ? {
    ano: new Date().getFullYear(),
    receitaPorMes: vendasPorMes.data.reduce((acc: Record<string, number>, item: any) => {
      acc[item.mes] = item.vendas;
      return acc;
    }, {})
  } : null;

  // Transformar top produtos em receita por tipo
  const receitaPorTipo: ReceitaPorTipo = topProdutos.data ? 
    topProdutos.data.map((item: any) => ({
      tipo: item.produto.categoria,
      receita: item.receita_total
    })) : [];

  // Mock para vendas por filial (pode ser implementado depois)
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
    clientesInativos: 0, // Pode ser calculado depois
    loading: stats.loading || vendasPorMes.loading || topProdutos.loading || clientes.loading,
    error: stats.error || vendasPorMes.error || topProdutos.error || clientes.error,
    refetch: dashboardData.refetchAll
  };
}

export function GraphQLDataProvider({ children }: { children: ReactNode }) {
  const dashboardData = useDashboardData();
  const transformedData = transformGraphQLData(dashboardData);

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