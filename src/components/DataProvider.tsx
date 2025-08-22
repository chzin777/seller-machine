"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

type ReceitaMensal = {
  ano: number;
  receitaPorMes: Record<string, number>;
};
type ReceitaPorTipo = { tipo: string; receita: number }[];
type VendaPorFilial = { filial: { nome: string }; receitaTotal: number; quantidadeNotas: number }[];

interface DataContextType {
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

const DataContext = createContext<DataContextType | undefined>(undefined);

// Singleton mais robusto para gerenciar estado global
class DataManager {
  private static instance: DataManager;
  private data: Omit<DataContextType, 'refetch'> | null = null;
  private loading = false;
  private subscribers = new Set<(data: Omit<DataContextType, 'refetch'>) => void>();
  private hasLoaded = false;
  private cacheKey = 'dashboard-data-cache';
  private cacheExpiry = 5 * 60 * 1000; // 5 minutos

  static getInstance() {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private loadFromCache(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return false;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.cacheExpiry;
      
      if (!isExpired && data) {
        console.log('📦 Carregando dados do localStorage');
        this.data = data;
        this.hasLoaded = true;
        return true;
      }
    } catch (e) {
      console.warn('Erro ao carregar cache:', e);
    }
    
    return false;
  }

  private saveToCache(data: Omit<DataContextType, 'refetch'>) {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Erro ao salvar cache:', e);
    }
  }

  subscribe(callback: (data: Omit<DataContextType, 'refetch'>) => void) {
    this.subscribers.add(callback);
    
    // Tentar carregar do cache primeiro
    if (!this.hasLoaded && this.loadFromCache()) {
      callback(this.data!);
    } else if (this.data) {
      callback(this.data);
    } else if (!this.loading) {
      // Se não tem dados e não está carregando, iniciar carregamento
      this.loadData();
    }
    
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(data: Omit<DataContextType, 'refetch'>) {
    this.data = data;
    this.subscribers.forEach(callback => callback(data));
    
    if (!data.loading && !data.error) {
      this.saveToCache(data);
    }
  }

  async loadData() {
    if (this.loading) {
      console.log('⏳ Carregamento já em progresso');
      return;
    }

    if (this.hasLoaded && this.data && !this.data.loading) {
      console.log('📦 Dados já carregados');
      return;
    }

    this.loading = true;
    this.hasLoaded = true;
    console.log('🚀 Iniciando carregamento único de dados');

    // Notificar que está carregando
    const loadingState: Omit<DataContextType, 'refetch'> = {
      receitaTotal: null,
      ticketMedio: null,
      itensVendidos: null,
      receitaMensal: null,
      receitaPorTipo: [],
      vendasPorFilial: [],
      clientesAtivos: null,
      clientesInativos: null,
      loading: true,
      error: null,
    };
    this.notifySubscribers(loadingState);

    try {
      // Fazer todas as requisições em paralelo
      console.log('📡 Fazendo requisições paralelas...');
      const responses = await Promise.allSettled([
        fetch("/api/proxy?url=/api/indicadores/receita-total"),
        fetch("/api/proxy?url=/api/notas-fiscais"),
        fetch("/api/proxy?url=/api/indicadores/receita-mensal"),
        fetch("/api/proxy?url=/api/indicadores/receita-por-tipo-produto"),
        fetch("/api/proxy?url=/api/indicadores/vendas-por-filial"),
        fetch("/api/proxy?url=/api/indicadores/clientes-inativos?dias=90"),
        fetch("/api/proxy?url=/api/clientes")
      ]);

      // Verificar se todas as requisições foram bem-sucedidas
      const failedRequests = responses.filter(r => r.status === 'rejected');
      if (failedRequests.length > 0) {
        console.error('Requisições falharam:', failedRequests);
        throw new Error(`${failedRequests.length} requisições falharam`);
      }

      // Converter todas as respostas para JSON
      const successResponses = responses.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
      const jsonPromises = successResponses.map(r => r.value.json());
      const jsonData = await Promise.all(jsonPromises);

      const [
        receitaTotalData,
        notasData,
        receitaMensalData,
        receitaTipoData,
        vendasFilialData,
        inativosData,
        clientesData
      ] = jsonData;

      console.log('📊 Processando dados...');

      // Processar dados
      const receitaTotal = Number(receitaTotalData?.receitaTotal || receitaTotalData?.total || receitaTotalData?.value || 0);
      
      let ticketMedio = null;
      let itensVendidos = null;
      if (Array.isArray(notasData) && notasData.length > 0) {
        const soma = notasData.reduce((acc, nf) => acc + (parseFloat(nf.valorTotal) || 0), 0);
        ticketMedio = soma / notasData.length;
        itensVendidos = notasData.reduce((acc, nf) => acc + (nf._count?.itens || 0), 0);
      }

      let receitaPorTipo: ReceitaPorTipo = [];
      if (Array.isArray(receitaTipoData)) {
        receitaPorTipo = receitaTipoData;
      } else if (receitaTipoData && typeof receitaTipoData === 'object') {
        receitaPorTipo = Object.entries(receitaTipoData).map(([tipo, receita]) => ({ tipo, receita: Number(receita) }));
      }

      const vendasPorFilial = Array.isArray(vendasFilialData) ? vendasFilialData : [];
      const clientesInativos = Array.isArray(inativosData) ? inativosData.length : null;
      const totalClientes = Array.isArray(clientesData) ? clientesData.length : null;
      const clientesAtivos = (typeof totalClientes === 'number' && typeof clientesInativos === 'number') 
        ? totalClientes - clientesInativos : null;

      const finalData: Omit<DataContextType, 'refetch'> = {
        receitaTotal,
        ticketMedio,
        itensVendidos,
        receitaMensal: receitaMensalData,
        receitaPorTipo,
        vendasPorFilial,
        clientesAtivos,
        clientesInativos,
        loading: false,
        error: null,
      };

      console.log('✅ Dados carregados com sucesso');
      this.notifySubscribers(finalData);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      const errorData: Omit<DataContextType, 'refetch'> = {
        receitaTotal: null,
        ticketMedio: null,
        itensVendidos: null,
        receitaMensal: null,
        receitaPorTipo: [],
        vendasPorFilial: [],
        clientesAtivos: null,
        clientesInativos: null,
        loading: false,
        error: "Erro ao carregar dados da API.",
      };
      this.notifySubscribers(errorData);
    } finally {
      this.loading = false;
    }
  }

  clearCache() {
    this.data = null;
    this.loading = false;
    this.hasLoaded = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.cacheKey);
    }
    console.log('🧹 Cache limpo');
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Omit<DataContextType, 'refetch'>>({
    receitaTotal: null,
    ticketMedio: null,
    itensVendidos: null,
    receitaMensal: null,
    receitaPorTipo: [],
    vendasPorFilial: [],
    clientesAtivos: null,
    clientesInativos: null,
    loading: true,
    error: null,
  });

  const refetch = useCallback(() => {
    const manager = DataManager.getInstance();
    manager.clearCache();
    manager.loadData();
  }, []);

  useEffect(() => {
    const manager = DataManager.getInstance();
    
    const unsubscribe = manager.subscribe((newData) => {
      setData(newData);
    });

    // Iniciar carregamento se necessário
    manager.loadData();

    return () => {
      unsubscribe();
    };
  }, []);

  const contextValue: DataContextType = {
    ...data,
    refetch
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
