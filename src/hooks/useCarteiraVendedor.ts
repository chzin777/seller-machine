import { useState, useEffect, useCallback } from 'react';

interface Vendedor {
  id: number;
  nome: string;
  cpf: string;
  email?: string;
  codigo?: string;
  ativo?: boolean;
  filialId?: number;
  filial?: {
    id: number;
    nome: string;
  };
}

interface CoberturaCarteira {
  id: number;
  vendedorId: number;
  vendedor: Vendedor;
  data: string;
  tipoPeriodo: string;
  clientesUnicosAtendidos: number;
  clientesAtivos: number;
  percentualCobertura: number;
  receita?: number;
  createdAt: string;
  updatedAt: string;
}

interface RankingVendedor {
  id: number;
  vendedorId: number;
  vendedor: Vendedor;
  data: string;
  tipoPeriodo: string;
  tipoRanking: string;
  posicaoRanking: number;
  posicao?: number;
  valorMetrica: number;
  totalVendedores: number;
  percentilRanking: number;
}

interface MixVendedor {
  id: number;
  vendedorId: number;
  vendedor: Vendedor;
  data: string;
  tipoPeriodo: string;
  receitaMaquinas: number;
  receitaPecas: number;
  receitaServicos: number;
  percentualMaquinas: number;
  percentualPecas: number;
  percentualServicos: number;
}

interface NotaFiscal {
  id: number;
  numeroNota: number;
  dataEmissao: string;
  valorTotal: number;
  vendedorId: number;
  clienteId: number;
  cliente?: {
    id: number;
    nome: string;
    cpfCnpj: string;
  };
}

interface ReceitaVendedor {
  id: number;
  filialId: number;
  vendedorId: number;
  data: string;
  tipoPeriodo: string;
  valorTotal: number;
  quantidadeNotas: number;
  quantidadeItens: number;
  createdAt: string;
  updatedAt: string;
  filial: {
    id: number;
    nome: string;
  };
  vendedor: {
    id: number;
    nome: string;
  };
}

interface CarteiraVendedorData {
  vendedores: Vendedor[];
  cobertura: CoberturaCarteira[];
  ranking: RankingVendedor[];
  mix: MixVendedor[];
  notasFiscais: NotaFiscal[];
  receitaVendedor: ReceitaVendedor[];
}

interface UseCarteiraVendedorReturn {
  data: CarteiraVendedorData;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getVendedoresByFilial: (filialId: number) => Promise<Vendedor[]>;
  getCoberturaByVendedor: (vendedorId: number) => Promise<CoberturaCarteira[]>;
  getRankingByVendedor: (vendedorId: number) => Promise<RankingVendedor[]>;
  getMixByVendedor: (vendedorId: number) => Promise<MixVendedor[]>;
  getNotasByVendedor: (vendedorId: number) => Promise<NotaFiscal[]>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api-dev-production-6bb5.up.railway.app';

export function useCarteiraVendedor(): UseCarteiraVendedorReturn {
  const [data, setData] = useState<CarteiraVendedorData>({
    vendedores: [],
    cobertura: [],
    ranking: [],
    mix: [],
    notasFiscais: [],
    receitaVendedor: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(endpoint)}`);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }, []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [vendedores, cobertura, ranking, mix, receitaVendedor] = await Promise.all([
        apiCall<Vendedor[]>('/api/vendedores'),
        apiCall<CoberturaCarteira[]>('/api/cobertura-carteira'),
        apiCall<RankingVendedor[]>('/api/ranking-vendedores'),
        apiCall<MixVendedor[]>('/api/mix-vendedor'),
        apiCall<ReceitaVendedor[]>('/api/receita-vendedor')
      ]);

      // Converter percentualCobertura de string para number se necessário
      const coberturaProcessada = cobertura.map(item => ({
        ...item,
        percentualCobertura: typeof item.percentualCobertura === 'string' 
          ? parseFloat(item.percentualCobertura) 
          : item.percentualCobertura
      }));

      setData({
        vendedores,
        cobertura: coberturaProcessada,
        ranking,
        mix,
        notasFiscais: [],
        receitaVendedor
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const getVendedoresByFilial = useCallback(async (filialId: number): Promise<Vendedor[]> => {
    return apiCall<Vendedor[]>(`/api/vendedores/filial/${filialId}`);
  }, [apiCall]);

  const getCoberturaByVendedor = useCallback(async (vendedorId: number): Promise<CoberturaCarteira[]> => {
    const allCobertura = await apiCall<CoberturaCarteira[]>('/api/cobertura-carteira');
    
    // Converter percentualCobertura de string para number se necessário
    const coberturaProcessada = allCobertura.map(item => ({
      ...item,
      percentualCobertura: typeof item.percentualCobertura === 'string' 
        ? parseFloat(item.percentualCobertura) 
        : item.percentualCobertura
    }));
    
    return coberturaProcessada.filter(c => c.vendedorId === vendedorId);
  }, [apiCall]);

  const getRankingByVendedor = useCallback(async (vendedorId: number): Promise<RankingVendedor[]> => {
    const allRanking = await apiCall<RankingVendedor[]>('/api/ranking-vendedores');
    return allRanking.filter(r => r.vendedorId === vendedorId);
  }, [apiCall]);

  const getMixByVendedor = useCallback(async (vendedorId: number): Promise<MixVendedor[]> => {
    const allMix = await apiCall<MixVendedor[]>('/api/mix-vendedor');
    return allMix.filter(m => m.vendedorId === vendedorId);
  }, [apiCall]);

  const getNotasByVendedor = useCallback(async (vendedorId: number): Promise<NotaFiscal[]> => {
    return apiCall<NotaFiscal[]>(`/api/notas-fiscais/vendedor/${vendedorId}`);
  }, [apiCall]);

  const refetch = useCallback(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  return {
    data,
    loading,
    error,
    refetch,
    getVendedoresByFilial,
    getCoberturaByVendedor,
    getRankingByVendedor,
    getMixByVendedor,
    getNotasByVendedor
  };
}

// Hook para buscar filiais
export function useFiliais() {
  const [filiais, setFiliais] = useState<{ id: number; nome: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiliais = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/filiais`);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      setFiliais(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiliais();
  }, [fetchFiliais]);

  return {
    filiais,
    loading,
    error,
    refetch: fetchFiliais
  };
}

// Tipos para o hook de carteira
interface CarteiraVendedorResponse {
  vendedor: {
    id: number;
    nome: string;
    cpf: string;
    filial?: {
      id: number;
      nome: string;
      cidade: string;
      estado: string;
    };
  };
  clientes: Array<any>;
  resumo: {
    totalClientes: number;
    receitaTotal: number;
    ticketMedioGeral: number;
    clientesAtivos: number;
    clientesInativos: number;
  };
  metadata: {
    periodoMeses: number;
    dataLimite: string;
    dataConsulta: string;
  };
}

// Hook para buscar carteira de vendedores com clientes
export function useCarteiraVendedorClientes(vendedorId?: number, periodoMeses: number = 6) {
  const [data, setData] = useState<CarteiraVendedorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCarteira = useCallback(async () => {
    // Só buscar dados se houver um vendedorId
    if (!vendedorId) {
      setData(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const endpoint = `/api/carteira-vendedor/${vendedorId}?periodoMeses=${periodoMeses}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [vendedorId, periodoMeses]);

  useEffect(() => {
    fetchCarteira();
  }, [fetchCarteira]);

  return {
    data,
    loading,
    error,
    refetch: fetchCarteira
  };
}

// Hook específico para métricas consolidadas
export function useMetricasCarteira(filialId?: number) {
  const [metricas, setMetricas] = useState({
    totalVendedores: 0,
    vendedoresAtivos: 0,
    coberturaMedia: 0,
    receitaTotal: 0,
    ticketMedio: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`/api/proxy?url=${encodeURIComponent(endpoint)}`);
    if (!response.ok) {
      throw new Error(`Erro na API: ${response.status} - ${response.statusText}`);
    }
    return response.json();
  }, []);

  const fetchMetricas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!filialId) {
        // Buscar dados gerais - fazendo requisições em paralelo para todos os endpoints disponíveis
        const timestamp = Date.now();
        const [vendedoresResponse, receitaResponse, ticketMedioResponse, coberturaResponse, receitaFilialResponse] = await Promise.all([
          apiCall<any>(`/api/vendedores/resumo?t=${timestamp}`),
          apiCall<any>(`/api/indicadores/receita-total?t=${timestamp}`),
          apiCall<any>(`/api/ticket-medio?t=${timestamp}`),
          apiCall<any>(`/api/cobertura-carteira?t=${timestamp}`),
          apiCall<any>(`/api/receita-filial?t=${timestamp}`)
        ]);
        
        const totalPorFilial = vendedoresResponse.porFilial?.reduce((acc: number, filial: any) => acc + filial.quantidade, 0) || 0;
        
        // Calculando ticket médio (média dos tickets médios por filial)
        const ticketMedio = ticketMedioResponse.length > 0 
          ? ticketMedioResponse.reduce((acc: number, item: any) => acc + parseFloat(item.ticketMedioNF), 0) / ticketMedioResponse.length
          : 0;
        
        // Calculando cobertura média (média das coberturas por vendedor)
        const coberturaMedia = coberturaResponse && coberturaResponse.length > 0
          ? coberturaResponse.reduce((acc: number, item: any) => {
              const cobertura = parseFloat(item.percentualCobertura || '0');
              return acc + (isNaN(cobertura) ? 0 : cobertura);
            }, 0) / coberturaResponse.length
          : 0;
        
        // Calculando receita total da soma das receitas por filial
        const receitaTotalFilial = receitaFilialResponse && receitaFilialResponse.length > 0
          ? receitaFilialResponse.reduce((acc: number, item: any) => {
              const receita = parseFloat(item.receitaTotal || '0');
              return acc + (isNaN(receita) ? 0 : receita);
            }, 0)
          : 0;
        
        // Usar a receita total das filiais se disponível, senão usar a receita geral
        const receitaGeral = parseFloat(receitaResponse?.receitaTotal || '0');
        const receitaFinal = receitaTotalFilial > 0 ? receitaTotalFilial : (isNaN(receitaGeral) ? 0 : receitaGeral);
        
        setMetricas({
          totalVendedores: vendedoresResponse.totalVendedores || 0,
          vendedoresAtivos: totalPorFilial,
          receitaTotal: receitaFinal,
          coberturaMedia,
          ticketMedio
        });
      } else {
        // Buscar dados por filial
        const vendedoresResponse = await apiCall<any>(`/api/vendedores/filial/${filialId}`);
        
        setMetricas({
          totalVendedores: vendedoresResponse.Count || 0,
          vendedoresAtivos: vendedoresResponse.vendedores?.length || 0,
          receitaTotal: 0, // Não disponível por filial específica
          coberturaMedia: 0, // Calculado apenas para dados gerais
          ticketMedio: 0 // Calculado apenas para dados gerais
        });
      }
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      setError('Erro ao carregar métricas');
      setMetricas({
        totalVendedores: 0,
        vendedoresAtivos: 0,
        receitaTotal: 0,
        coberturaMedia: 0,
        ticketMedio: 0
      });
    } finally {
      setLoading(false);
    }
  }, [apiCall, filialId]);

  useEffect(() => {
    fetchMetricas();
  }, [fetchMetricas]);

  return {
    metricas,
    loading,
    error,
    refetch: fetchMetricas
  };
}