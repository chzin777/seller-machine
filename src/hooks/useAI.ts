"use client";

import { useState, useCallback, useEffect } from 'react';

// Tipos para as funcionalidades de IA
export interface DashboardSummary {
  timestamp: string;
  totalClientes: number;
  clientesAtivos: number;
  clientesInativos: number;
  ticketMedio: number;
  vendas30Dias: number;
  crescimentoMensal: number;
  topProdutos: Array<{
    nome: string;
    vendas: number;
  }>;
  alertas: Array<{
    tipo: 'warning' | 'info' | 'error';
    mensagem: string;
  }>;
  resumo: {
    recomendacoes: {
      status: string;
      descricao?: string;
    };
    churnPrediction: {
      status: string;
      descricao?: string;
    };
    salesPrediction: {
      status: string;
      descricao?: string;
    };
    rfvOptimization: {
      status: string;
      descricao?: string;
    };
  };
  proximasFeatures: string[];
}

export interface ChurnPrediction {
  clienteId: number;
  nome: string;
  churnProbability: number;
  riskLevel: 'Alto' | 'Médio' | 'Baixo';
  recommendation: string;
  ultimaCompra: string;
  valorTotal: number;
  frequenciaCompras: number;
}

export interface SalesPrediction {
  mes: string;
  vendaPrevista: number;
  confianca: number;
  fatoresInfluencia: string[];
}

export interface ProductRecommendation {
  produtoId: number;
  nome: string;
  categoria: string;
  score: number;
  motivo: string;
  precoMedio: number;
}

export interface CustomerInsight {
  clienteId: number;
  nome: string;
  segmento: string;
  valorVida: number;
  frequenciaCompras: number;
  ticketMedio: number;
  tendencia: string;
  proximaCompra: string;
  produtosFavoritos: string[];
}

// Tipos para dados de clientes
export interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  dataCadastro?: string;
  ultimaCompra?: string;
  totalCompras?: number;
  valorTotal?: number;
  status?: 'ativo' | 'inativo';
}

export interface HistoricoCompra {
  id: number;
  data: string;
  valor: number;
  produtos: Array<{
    nome: string;
    quantidade: number;
    valor: number;
  }>;
  status: string;
}

export interface FilialOption {
  id: number;
  nome: string;
  cidade: string;
  estado: string;
}

// Hook principal para funcionalidades de IA
export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(endpoint: string): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 API Call - Endpoint:', endpoint);
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(endpoint)}`);
      console.log('🔍 API Call - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔍 API Call - Response data:', data);
      console.log('🔍 API Call - Data type:', typeof data);
      return data;
    } catch (err) {
      console.error('🔍 API Call - Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Dashboard Summary
  const getDashboardSummary = useCallback(async (): Promise<DashboardSummary> => {
    return apiCall<DashboardSummary>('/api/ai/dashboard-summary');
  }, [apiCall]);

  // Churn Prediction
  const getChurnPrediction = useCallback(async (filialId?: number, limit?: number): Promise<ChurnPrediction[]> => {
    let endpoint = '/api/ai/churn-prediction';
    const params = new URLSearchParams();
    
    if (filialId) params.append('filialId', filialId.toString());
    if (limit) params.append('limit', limit.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    const response = await apiCall<any>(endpoint);
    
    // Mapear dados da API externa para a estrutura esperada
    if (response && response.clientes && Array.isArray(response.clientes)) {
      return response.clientes.map((cliente: any) => ({
        clienteId: cliente.clienteId,
        nome: cliente.nomeCliente,
        churnProbability: cliente.churnScore,
        riskLevel: cliente.risco as 'Alto' | 'Médio' | 'Baixo',
        recommendation: cliente.recomendacoes ? cliente.recomendacoes.join('; ') : '',
        ultimaCompra: cliente.ultimaCompra,
        valorTotal: cliente.ticketMedio * cliente.totalCompras,
        frequenciaCompras: cliente.totalCompras
      }));
    }
    
    return [];
  }, [apiCall]);

  // Sales Prediction
  const getSalesPrediction = useCallback(async (filialId?: number, meses?: number): Promise<SalesPrediction[]> => {
    let endpoint = '/api/ai/sales-prediction';
    const params = new URLSearchParams();
    
    if (filialId) params.append('filialId', filialId.toString());
    if (meses) params.append('meses', meses.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return apiCall<SalesPrediction[]>(endpoint);
  }, [apiCall]);

  // Product Recommendations
  const getProductRecommendations = useCallback(async (clienteId: number): Promise<ProductRecommendation[]> => {
    return apiCall<ProductRecommendation[]>(`/api/ai/product-recommendations?clienteId=${clienteId}`);
  }, [apiCall]);

  // Customer Insights
  const getCustomerInsights = useCallback(async (clienteId: number): Promise<CustomerInsight> => {
    return apiCall<CustomerInsight>(`/api/ai/customer-insights?clienteId=${clienteId}`);
  }, [apiCall]);

  return {
    loading,
    error,
    getDashboardSummary,
    getChurnPrediction,
    getSalesPrediction,
    getProductRecommendations,
    getCustomerInsights
  };
}

// Hook específico para Dashboard Summary
export function useDashboardSummary() {
  const { getDashboardSummary } = useAI();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getDashboardSummary();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar resumo do dashboard');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getDashboardSummary]);

  useEffect(() => {
    fetchDashboardSummary();
  }, [fetchDashboardSummary]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardSummary
  };
}

// Hook específico para Churn Prediction com dados reais
export function useChurnPrediction(filialId?: number, limit: number = 50) {
  const [data, setData] = useState<ChurnPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Usar o novo endpoint de churn prediction
      let endpoint = '/api/ai/churn-prediction';
      const params = new URLSearchParams();
      
      if (filialId) params.append('filialId', filialId.toString());
      if (limit) params.append('limit', limit.toString());
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      console.log('🔍 Fetching churn prediction:', endpoint);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log('🔍 Churn prediction response:', responseData);
      
      // Processar dados do endpoint de churn prediction
      if (responseData && responseData.clientes && Array.isArray(responseData.clientes)) {
        const churnPredictions: ChurnPrediction[] = responseData.clientes.map((cliente: any) => ({
          clienteId: cliente.clienteId,
          nome: cliente.nome,
          churnProbability: cliente.churnProbability || cliente.probabilidade,
          riskLevel: cliente.riskLevel || (cliente.risco === 'alto' ? 'Alto' : cliente.risco === 'medio' ? 'Médio' : 'Baixo'),
          recommendation: cliente.recommendation || 'Manter relacionamento regular',
          ultimaCompra: cliente.ultimaCompra,
          valorTotal: cliente.valorTotal,
          frequenciaCompras: cliente.frequenciaCompras
        }));
        
        setData(churnPredictions);
      } else {
        setData([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erro no churn prediction:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar predições de churn');
    } finally {
      setLoading(false);
    }
  }, [filialId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para buscar clientes reais
export function useClientes(filialId?: number, limit: number = 100) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let url = `/api/proxy?url=/api/clientes?limit=${limit}`;
      if (filialId) {
        url += `&filialId=${filialId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao buscar clientes');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  }, [filialId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para buscar cliente por documento
export function useClientePorDocumento(documento: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!documento || documento.length < 3) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/proxy?url=/api/clientes/buscar?documento=${encodeURIComponent(documento)}`);
      
      if (!response.ok) {
        throw new Error('Cliente não encontrado');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar cliente por documento:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar cliente');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [documento]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook para buscar histórico de compras de um cliente
export function useClienteHistorico(clienteId: number | null) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clienteId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/clientes/${clienteId}/historico`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar histórico');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar histórico do cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook específico para predição de vendas
export function useSalesPrediction(filialId?: number, mesesPredicao: number = 3) {
  const { getSalesPrediction } = useAI();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getSalesPrediction(filialId, mesesPredicao);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar predição de vendas');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filialId, mesesPredicao, getSalesPrediction]);

  useEffect(() => {
    fetchSalesPrediction();
  }, [fetchSalesPrediction]);

  return {
    data,
    loading,
    error,
    refetch: fetchSalesPrediction
  };
}

// Hook específico para recomendações de produtos
export function useRecommendations(clienteId: number | null, limit: number = 5) {
  const [data, setData] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    if (!clienteId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Chamada real à API de recomendações
      const response = await fetch(`/api/ai/recommendations?clienteId=${clienteId}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const recommendations: ProductRecommendation[] = await response.json();
      
      // Ordena por score e limita os resultados
      const sortedRecommendations = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
      
      setData(sortedRecommendations);
    } catch (err) {
      console.error('Erro ao buscar recomendações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar recomendações');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [clienteId, limit]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  return { data, loading, error, refetch: fetchRecommendations };
}

// Hook específico para insights do cliente
export function useCustomerInsights(clienteId: number | null) {
  const [data, setData] = useState<CustomerInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerInsights = useCallback(async () => {
    if (!clienteId) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Chamada real à API de insights do cliente
      const response = await fetch(`/api/ai/customer-insights?clienteId=${clienteId}`);
      
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const insight: CustomerInsight = await response.json();
      setData(insight);
    } catch (err) {
      console.error('Erro ao buscar insights do cliente:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar insights');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  useEffect(() => {
    fetchCustomerInsights();
  }, [fetchCustomerInsights]);

  return { data, loading, error, refetch: fetchCustomerInsights };
}

// Hook específico para dashboard combinado
export function useCombinedDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [clientesStats, setClientesStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCombinedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar dados reais das APIs
      const [statsResponse, resumoResponse] = await Promise.all([
        fetch('/api/vendedores/stats'),
        fetch('/api/vendedores/resumo')
      ]);

      if (!statsResponse.ok || !resumoResponse.ok) {
        throw new Error('Erro ao buscar dados das APIs');
      }

      const stats = await statsResponse.json();
      const resumo = await resumoResponse.json();

      // Montar dados do dashboard combinado
      const dashboardData: DashboardSummary = {
        totalClientes: stats.totalClientes || 0,
        clientesAtivos: stats.clientesAtivos || 0,
        clientesInativos: stats.clientesInativos || 0,
        ticketMedio: stats.ticketMedio || 0,
        vendas30Dias: stats.vendas30Dias || 0,
        crescimentoMensal: stats.crescimentoMensal || 0,
        topProdutos: stats.topProdutos || [],
        alertas: resumo.alertas || [],
        proximasFeatures: resumo.proximasFeatures || [],
        timestamp: new Date().toISOString(),
        resumo: {
          recomendacoes: {
            status: resumo.recomendacoes?.status || 'Sistema inativo'
          },
          churnPrediction: {
            status: resumo.churnPrediction?.status || 'Modelo não disponível'
          },
          salesPrediction: {
            status: resumo.salesPrediction?.status || 'Previsão não disponível'
          },
          rfvOptimization: {
            status: resumo.rfvOptimization?.status || 'Segmentação inativa'
          }
        }
      };

      const clientesStats = {
        total: stats.totalClientes || 0,
        ativos: stats.clientesAtivos || 0,
        inativos: stats.clientesInativos || 0,
        emRisco: resumo.clientesEmRisco || 0,
        novos: stats.clientesNovos || 0
      };
      
      setDashboardData(dashboardData);
      setClientesStats(clientesStats);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
      setDashboardData(null);
      setClientesStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombinedData();
  }, [fetchCombinedData]);

  return { dashboardData, clientesStats, loading, error, refetch: fetchCombinedData };
}

// Hook específico para dashboard de IA
export function useAIDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAIDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar dados reais das APIs de IA
      const [aiStatsResponse, aiStatusResponse] = await Promise.all([
        fetch('/api/ai/dashboard-stats'),
        fetch('/api/ai/system-status')
      ]);

      if (!aiStatsResponse.ok || !aiStatusResponse.ok) {
        throw new Error('Erro ao buscar dados das APIs de IA');
      }

      const aiStats = await aiStatsResponse.json();
      const aiStatus = await aiStatusResponse.json();

      // Montar dados do dashboard de IA
      const dashboardData: DashboardSummary = {
        timestamp: new Date().toISOString(),
        totalClientes: aiStats.totalClientes || 0,
        clientesAtivos: aiStats.clientesAtivos || 0,
        clientesInativos: aiStats.clientesInativos || 0,
        ticketMedio: aiStats.ticketMedio || 0,
        vendas30Dias: aiStats.vendas30Dias || 0,
        crescimentoMensal: aiStats.crescimentoMensal || 0,
        topProdutos: aiStats.topProdutos || [],
        alertas: aiStatus.alertas || [],
        resumo: {
          recomendacoes: {
            status: aiStatus.recomendacoes?.status || 'Sistema inativo',
            descricao: aiStatus.recomendacoes?.descricao || 'Sistema de recomendações em desenvolvimento'
          },
          churnPrediction: {
            status: aiStatus.churnPrediction?.status || 'Modelo não disponível',
            descricao: aiStatus.churnPrediction?.descricao || 'Análise de churn em treinamento'
          },
          salesPrediction: {
            status: aiStatus.salesPrediction?.status || 'Previsão não disponível',
            descricao: aiStatus.salesPrediction?.descricao || 'Modelo de previsão sendo calibrado'
          },
          rfvOptimization: {
            status: aiStatus.rfvOptimization?.status || 'Segmentação inativa',
            descricao: aiStatus.rfvOptimization?.descricao || 'Otimização RFV em implementação'
          }
        },
        proximasFeatures: aiStatus.proximasFeatures || [
          'Análise de Sentimento de Clientes',
          'Previsão de Demanda por Produto',
          'Otimização de Preços Dinâmica',
          'Detecção de Fraudes Automática'
        ]
      };
      
      setData(dashboardData);
    } catch (err) {
      console.error('Erro ao buscar dados do dashboard de IA:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard de IA');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAIDashboard();
  }, [fetchAIDashboard]);

  return { data, loading, error, refetch: fetchAIDashboard };
}

// Hook para clustering de clientes
export function useClustering(filialId?: number) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClustering = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar dados reais da API de clustering
      const url = filialId ? 
        `/api/ai/clustering?filialId=${filialId}` : 
        '/api/ai/clustering';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados de clustering');
      }
      
      const clusteringData = await response.json();
      
      setData(clusteringData);
    } catch (err) {
      console.error('Erro ao buscar dados de clustering:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados de clustering');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filialId]);

  useEffect(() => {
    fetchClustering();
  }, [fetchClustering]);

  return { data, loading, error, refetch: fetchClustering };
}