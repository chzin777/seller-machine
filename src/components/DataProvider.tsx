"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useInactivityConfig } from "../hooks/useInactivityConfig";

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
  numeroNotas: number | null;
  itensP95PorNota: number | null;
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
  private baseCacheKey = 'dashboard-data-cache';
  private cacheExpiry = 5 * 60 * 1000; // 5 minutos
  private currentDiasInatividade: number | null = null;

  static getInstance() {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private getCacheKey(diasInatividade: number): string {
    return `${this.baseCacheKey}-${diasInatividade}`;
  }

  private loadFromCache(diasInatividade: number): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const cacheKey = this.getCacheKey(diasInatividade);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return false;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > this.cacheExpiry;
      
      if (!isExpired && data) {
        console.log(`📦 Carregando dados do localStorage para ${diasInatividade} dias`);
        this.data = data;
        this.hasLoaded = true;
        this.currentDiasInatividade = diasInatividade;
        return true;
      }
    } catch (e) {
      console.warn('Erro ao carregar cache:', e);
    }
    
    return false;
  }

  private saveToCache(data: Omit<DataContextType, 'refetch'>, diasInatividade: number) {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheKey = this.getCacheKey(diasInatividade);
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Erro ao salvar cache:', e);
    }
  }

  subscribe(callback: (data: Omit<DataContextType, 'refetch'>) => void) {
    this.subscribers.add(callback);
    
    // Se já tem dados, enviar para o callback
    if (this.data) {
      callback(this.data);
    } else if (!this.loading) {
      // Se não tem dados e não está carregando, iniciar carregamento
      this.loadData();
    }
    
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(data: Omit<DataContextType, 'refetch'>, diasInatividade: number) {
    this.data = data;
    this.currentDiasInatividade = diasInatividade;
    this.subscribers.forEach(callback => callback(data));
    
    if (!data.loading && !data.error) {
      this.saveToCache(data, diasInatividade);
    }
  }

  async loadData(diasInatividade?: number) {
    if (this.loading) {
      console.log('⏳ Carregamento já em progresso');
      return;
    }

    // Se diasInatividade não for fornecido, tentar carregar da configuração
    if (!diasInatividade) {
      diasInatividade = 90; // fallback padrão
      try {
        let empresaId = null;
        let userId = null;
        
        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            empresaId = userData.empresaId || userData.empresa_id || 1;
            userId = userData.id || userData.user_id || 'default';
          }
        }

        // Tentar API externa primeiro
        if (empresaId) {
          const configResponse = await fetch(`/api/proxy?url=/api/configuracao-inatividade/empresa/${empresaId}`);
          if (configResponse.ok) {
            const config = await configResponse.json();
            diasInatividade = config.diasSemCompra || 90;
          }
        }
        
        // Fallback para localStorage se necessário
        if (diasInatividade === 90 && userId && typeof window !== "undefined") {
          const configKey = `filtros_config_${userId}`;
          const localConfig = localStorage.getItem(configKey);
          if (localConfig) {
            const config = JSON.parse(localConfig);
            diasInatividade = config.diasInatividade || 90;
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar configuração, usando padrão:', error);
      }
    }

    // Verificar se já temos dados válidos em cache para esta configuração
    if (this.hasLoaded && this.data && !this.data.loading && this.currentDiasInatividade === diasInatividade) {
      console.log(`📦 Dados já carregados para ${diasInatividade} dias`);
      return;
    }

    // Se a configuração mudou, verificar se temos cache para a nova configuração
    if (diasInatividade && this.currentDiasInatividade !== diasInatividade && this.loadFromCache(diasInatividade)) {
      console.log(`📦 Cache encontrado para nova configuração: ${diasInatividade} dias`);
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
      numeroNotas: null,
      itensP95PorNota: null,
      receitaMensal: null,
      receitaPorTipo: [],
      vendasPorFilial: [],
      clientesAtivos: null,
      clientesInativos: null,
      loading: true,
      error: null,
    };
    this.notifySubscribers(loadingState, diasInatividade!);

    try {
      // Obter configurações do usuário para filtros personalizados
      let userId = null;
      let empresaId = null;
      try {
        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            userId = userData.id;
            empresaId = userData.empresaId || userData.empresa_id || 1;
          }
        }
      } catch (e) {
        console.warn('Erro ao obter dados do usuário:', e);
      }

      // Buscar configuração de inatividade já foi feita acima
      console.log(`📊 Usando configuração: ${diasInatividade} dias`);

      // Fazer todas as requisições em paralelo
      console.log('📡 Fazendo requisições paralelas...');
      const responses = await Promise.allSettled([
        fetch("/api/proxy?url=/api/indicadores/receita-total"),
        fetch("/api/proxy?url=/api/notas-fiscais"),
        fetch("/api/proxy?url=/api/indicadores/receita-mensal"),
        fetch("/api/proxy?url=/api/indicadores/receita-por-tipo-produto"),
        fetch("/api/proxy?url=/api/indicadores/vendas-por-filial"),
        fetch(`/api/proxy?url=/api/indicadores/clientes-inativos?dias=${diasInatividade}`),
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
      let numeroNotas = null;
      let itensP95PorNota = null;
      
      if (Array.isArray(notasData) && notasData.length > 0) {
        const soma = notasData.reduce((acc, nf) => acc + (parseFloat(nf.valorTotal) || 0), 0);
        ticketMedio = soma / notasData.length;
        itensVendidos = notasData.reduce((acc, nf) => acc + (nf._count?.itens || 0), 0);
        numeroNotas = notasData.length;
        
        // Calcular P95 de itens por nota fiscal
        const itensArray = notasData.map(nf => nf._count?.itens || 0).filter(itens => itens > 0);
        if (itensArray.length > 0) {
          itensArray.sort((a, b) => a - b);
          const index = Math.ceil(itensArray.length * 0.95) - 1;
          itensP95PorNota = itensArray[Math.min(index, itensArray.length - 1)];
        }
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
        numeroNotas,
        itensP95PorNota,
        receitaMensal: receitaMensalData,
        receitaPorTipo,
        vendasPorFilial,
        clientesAtivos,
        clientesInativos,
        loading: false,
        error: null,
      };

      console.log('✅ Dados carregados com sucesso');
      this.notifySubscribers(finalData, diasInatividade!);

    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      const errorData: Omit<DataContextType, 'refetch'> = {
        receitaTotal: null,
        ticketMedio: null,
        itensVendidos: null,
        numeroNotas: null,
        itensP95PorNota: null,
        receitaMensal: null,
        receitaPorTipo: [],
        vendasPorFilial: [],
        clientesAtivos: null,
        clientesInativos: null,
        loading: false,
        error: "Erro ao carregar dados da API.",
      };
      this.notifySubscribers(errorData, diasInatividade!);
    } finally {
      this.loading = false;
    }
  }

  clearCache() {
    this.data = null;
    this.loading = false;
    this.hasLoaded = false;
    this.currentDiasInatividade = null;
    if (typeof window !== 'undefined') {
      // Limpar todos os caches relacionados
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.baseCacheKey)) {
          localStorage.removeItem(key);
        }
      });
    }
    console.log('🧹 Cache limpo');
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { diasInatividade } = useInactivityConfig(); // Usar hook global
  
  const [data, setData] = useState<Omit<DataContextType, 'refetch'>>({
    receitaTotal: null,
    ticketMedio: null,
    itensVendidos: null,
    numeroNotas: null,
    itensP95PorNota: null,
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
    manager.loadData(diasInatividade);
  }, [diasInatividade]);

  useEffect(() => {
    const manager = DataManager.getInstance();
    
    const unsubscribe = manager.subscribe((newData) => {
      setData(newData);
    });

    // Carregar dados quando componente monta ou diasInatividade muda
    if (diasInatividade) {
      // Se a configuração mudou, limpar cache e recarregar
      manager.clearCache();
      manager.loadData(diasInatividade);
    }

    return () => {
      unsubscribe();
    };
  }, [diasInatividade]); // Re-executar quando diasInatividade mudar

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
