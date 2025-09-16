import { useState, useEffect, useCallback } from 'react';

// Tipos para as respostas da API de IA
export interface DashboardSummary {
  timestamp: string;
  filialId: number | null;
  resumo: {
    recomendacoes: {
      status: string;
      descricao: string;
    };
    churnPrediction: {
      status: string;
      descricao: string;
    };
    salesPrediction: {
      status: string;
      descricao: string;
    };
    rfvOptimization: {
      status: string;
      descricao: string;
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

export interface ProductRecommendation {
  produtoId: number;
  nome: string;
  score: number;
  motivo: string;
  categoria: string;
  precoMedio: number;
}

export interface CustomerInsight {
  clienteId: number;
  nome: string;
  segmento: string;
  valorVida: number;
  frequenciaCompras: number;
  ticketMedio: number;
  tendencia: 'Crescente' | 'Estável' | 'Decrescente';
  proximaCompra: string;
  produtosFavoritos: string[];
}

export interface SalesPrediction {
  periodo: string;
  valorPrevisto: number;
  confiancaInferior: number;
  confiancaSuperior: number;
  tendencia: 'Alta' | 'Baixa' | 'Estável';
}

export interface ClusteringResult {
  clusterId: number;
  nome: string;
  descricao: string;
  totalClientes: number;
  caracteristicas: {
    valorMedio: number;
    frequenciaMedia: number;
    recenciaDias: number;
    ticketMedio: number;
  };
  clientes: any[];
}

export interface ClusteringResponse {
  clusters: ClusteringResult[];
  summary?: any;
}

// Hook combinado para dashboard com dados de IA e tradicionais
export function useCombinedDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [clientesStats, setClientesStats] = useState<{ total: number; emRisco: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCombinedData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar dados de IA
      const aiData = await fetch('/api/proxy?url=' + encodeURIComponent('/api/ai/dashboard-summary'));
      const aiResponse = await aiData.json();
      setDashboardData(aiResponse);

      // Buscar lista de clientes para contar total
      const clientesResponse = await fetch('/api/proxy?url=' + encodeURIComponent('/api/clientes'));
      const clientesData = await clientesResponse.json();
      const totalClientes = Array.isArray(clientesData) ? clientesData.length : 0;
      
      // Buscar clientes em risco via API de churn
      const churnResponse = await fetch('/api/proxy?url=' + encodeURIComponent('/api/ai/churn-prediction?limit=1000'));
      const churnData = await churnResponse.json();
      const clientesEmRisco = Array.isArray(churnData) ? churnData.filter(c => c.riskLevel === 'Alto').length : 0;
      
      setClientesStats({
        total: totalClientes,
        emRisco: clientesEmRisco
      });
      
    } catch (err) {
      console.error('Erro ao buscar dados combinados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombinedData();
  }, [fetchCombinedData]);

  return {
    dashboardData,
    clientesStats,
    loading,
    error,
    refetch: fetchCombinedData
  };
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
    
    return apiCall<ChurnPrediction[]>(endpoint);
  }, [apiCall]);

  // Product Recommendations
  const getRecommendations = useCallback(async (clienteId: number, limit?: number): Promise<ProductRecommendation[]> => {
    let endpoint = `/api/ai/recommendations/${clienteId}`;
    
    if (limit) {
      endpoint += `?limit=${limit}`;
    }
    
    return apiCall<ProductRecommendation[]>(endpoint);
  }, [apiCall]);

  // Customer Insights
  const getCustomerInsights = useCallback(async (clienteId: number): Promise<CustomerInsight> => {
    return apiCall<CustomerInsight>(`/api/ai/customer-insights/${clienteId}`);
  }, [apiCall]);

  // Sales Prediction
  const getSalesPrediction = useCallback(async (filialId?: number, mesesPredicao?: number): Promise<SalesPrediction[]> => {
    let endpoint = '/api/ai/sales-prediction';
    const params = new URLSearchParams();
    
    if (filialId) params.append('filialId', filialId.toString());
    if (mesesPredicao) params.append('mesesPredicao', mesesPredicao.toString());
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return apiCall<SalesPrediction[]>(endpoint);
  }, [apiCall]);

  // Clustering
  const getClustering = useCallback(async (filialId?: number): Promise<ClusteringResponse> => {
    let endpoint = '/api/ai/ml/clustering';
    
    if (filialId) {
      endpoint += `?filialId=${filialId}`;
    }
    
    return apiCall<ClusteringResponse>(endpoint);
  }, [apiCall]);

  // ML Training
  const trainModel = useCallback(async (modelType: 'churn' | 'recommendation' | 'clustering', filialId?: number): Promise<{ success: boolean; message: string }> => {
    let endpoint = `/api/ai/ml/train/${modelType}`;
    
    if (filialId) {
      endpoint += `?filialId=${filialId}`;
    }
    
    const response = await fetch(`/api/proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: endpoint,
        method: 'POST'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao treinar modelo: ${response.status}`);
    }
    
    return response.json();
  }, []);

  return {
    loading,
    error,
    getDashboardSummary,
    getChurnPrediction,
    getRecommendations,
    getCustomerInsights,
    getSalesPrediction,
    getClustering,
    trainModel
  };
}

// Hook específico para Dashboard Summary
export function useAIDashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getDashboardSummary } = useAI();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 AIDashboard - Fetching dashboard summary...');
      const summary = await getDashboardSummary();
      console.log('🔍 AIDashboard - Data received:', summary);
      console.log('🔍 AIDashboard - Data type:', typeof summary);
      console.log('🔍 AIDashboard - Data keys:', summary ? Object.keys(summary) : 'null');
      setData(summary);
      setError(null);
    } catch (err) {
      console.error('🔍 AIDashboard - Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [getDashboardSummary]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook específico para Churn Prediction
export function useChurnPrediction(filialId?: number, limit: number = 50) {
  const [data, setData] = useState<ChurnPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getChurnPrediction } = useAI();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const predictions = await getChurnPrediction(filialId, limit);
      setData(predictions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar predições de churn');
    } finally {
      setLoading(false);
    }
  }, [getChurnPrediction, filialId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook específico para Recomendações
export function useRecommendations(clienteId: number | null, limit: number = 5) {
  const [data, setData] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getRecommendations } = useAI();

  const fetchData = useCallback(async () => {
    if (!clienteId) return;
    
    try {
      setLoading(true);
      const recommendations = await getRecommendations(clienteId, limit);
      setData(recommendations);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar recomendações');
    } finally {
      setLoading(false);
    }
  }, [getRecommendations, clienteId, limit]);

  useEffect(() => {
    if (clienteId) {
      fetchData();
    }
  }, [fetchData, clienteId]);

  return { data, loading, error, refetch: fetchData };
}

// Hook específico para insights do cliente
export function useCustomerInsights(clienteId: number | null) {
  const { getCustomerInsights } = useAI();
  const [data, setData] = useState<CustomerInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!clienteId) {
      setData(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCustomerInsights(clienteId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar insights do cliente');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [clienteId, getCustomerInsights]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    data,
    loading,
    error,
    refetch: fetchInsights
  };
}

// Hook específico para clustering
export function useClustering(filialId?: number) {
  const { getClustering } = useAI();
  const [data, setData] = useState<ClusteringResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClustering = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getClustering(filialId);
      console.log('🔍 Clustering API Response:', result);
      console.log('🔍 Clustering data type:', typeof result);
      console.log('🔍 Clustering data keys:', result ? Object.keys(result) : 'null');
      setData(result);
    } catch (err) {
      console.error('❌ Clustering API Error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar clustering');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getClustering, filialId]);

  useEffect(() => {
    fetchClustering();
  }, [fetchClustering]);

  return {
    data,
    loading,
    error,
    refetch: fetchClustering
  };
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