"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { getUserScopeFromStorage, createScopeHeaders } from "../../lib/hierarchical-filters";
import { 
  normalizarNotasFiscais, 
  normalizarClientes, 
  vendedorIdMatch, 
  filialIdMatch,
  detectarFormato 
} from "../../lib/data-normalization";
// import { useInactivityConfig } from "../hooks/useInactivityConfig"; // Removido

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

      // Obter escopo do usuário para incluir nos headers
      const userScope = getUserScopeFromStorage();
      const scopeHeaders = userScope ? createScopeHeaders(userScope) : {};
      
      console.log('🔐 User scope for data requests:', userScope);
      
      // Fazer todas as requisições em paralelo
      console.log('📡 Fazendo requisições paralelas...');
      const requestUrls = [
        "/api/proxy?url=/api/indicadores/receita-total",
        "/api/proxy?url=/api/notas-fiscais",
        "/api/proxy?url=/api/indicadores/receita-mensal",
        "/api/proxy?url=/api/indicadores/receita-por-tipo-produto",
        "/api/proxy?url=/api/indicadores/vendas-por-filial",
        `/api/proxy?url=/api/indicadores/clientes-inativos?dias=${diasInatividade}`,
        "/api/proxy?url=/api/clientes"
      ];
      
      const responses = await Promise.allSettled(
        requestUrls.map((url, index) => {
          console.log(`📡 Iniciando requisição ${index + 1}/7: ${url}`);
          return fetch(url, { 
            signal: AbortSignal.timeout(120000), // 120 segundos timeout
            headers: {
              'Content-Type': 'application/json',
              ...scopeHeaders
            }
          });
        })
      );

      // Verificar se todas as requisições foram bem-sucedidas
      const failedRequests = responses.filter(r => r.status === 'rejected');
      const successResponses = responses.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<Response>[];
      
      // Verificar status HTTP das respostas bem-sucedidas
      const httpErrors = successResponses.filter(r => !r.value.ok);
      
      if (failedRequests.length > 0 || httpErrors.length > 0) {
        const rejectedDetails = failedRequests.map((r, index) => {
          const originalIndex = responses.findIndex(resp => resp === r);
          return {
            index: originalIndex,
            url: requestUrls[originalIndex],
            reason: r.reason
          };
        });
        
        const httpErrorDetails = httpErrors.map(r => {
          const originalIndex = responses.findIndex(resp => resp === r);
          return {
            index: originalIndex,
            url: requestUrls[originalIndex],
            status: r.value.status,
            statusText: r.value.statusText
          };
        });
        
        console.warn('⚠️ Algumas requisições falharam (continuando com dados parciais):', {
          rejected: rejectedDetails,
          httpErrors: httpErrorDetails
        });
        
        // Continue with partial data instead of throwing error
        // Only throw if ALL requests failed
        if (successResponses.filter(r => r.value.ok).length === 0) {
          throw new Error('Todas as requisições falharam');
        }
      }

      // Converter apenas as respostas bem-sucedidas para JSON
      const validResponses = successResponses.filter(r => r.value.ok);
      const jsonPromises = validResponses.map(async (r, index) => {
        try {
          const originalIndex = responses.findIndex(resp => resp === r);
          return {
            data: await r.value.json(),
            originalIndex
          };
        } catch (error) {
          console.error(`Erro ao fazer parse JSON da requisição ${index}:`, error);
          return {
            data: null,
            originalIndex: responses.findIndex(resp => resp === r)
          };
        }
      });
      const jsonResults = await Promise.all(jsonPromises);

      // Mapear dados baseado no índice original das requisições
      const dataMap = new Map();
      jsonResults.forEach(result => {
        if (result.data) {
          dataMap.set(result.originalIndex, result.data);
        }
      });

      const receitaTotalData = dataMap.get(0) || null;
      let notasData = dataMap.get(1) || null;
      const receitaMensalData = dataMap.get(2) || null;
      const receitaTipoData = dataMap.get(3) || null;
      const vendasFilialData = dataMap.get(4) || null;
      let inativosData = dataMap.get(5) || null;
      let clientesData = dataMap.get(6) || null;

      // 🔍 Debug: verificar formato da receita mensal da API
      if (receitaMensalData) {
        console.log('📊 Receita mensal da API (formato original):', {
          estrutura: receitaMensalData,
          chaves: Object.keys(receitaMensalData.receitaPorMes || {}),
          totalChaves: Object.keys(receitaMensalData.receitaPorMes || {}).length
        });
        
        // Se houver muitas chaves (>20), provavelmente são dados diários, precisa agregar por mês
        const chaves = Object.keys(receitaMensalData.receitaPorMes || {});
        if (chaves.length > 20) {
          console.warn('⚠️ API retornou muitos pontos de dados (provavelmente diários). Agregando por mês...');
          
          const mesesNomes = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
          ];
          
          const receitaPorMesAgregada: Record<string, number> = {};
          
          Object.entries(receitaMensalData.receitaPorMes).forEach(([chave, valor]) => {
            try {
              // Tentar extrair mês e ano da chave (vários formatos possíveis)
              let data: Date | null = null;
              
              // Formato: "2025-01-15" ou "2025-01"
              if (chave.match(/^\d{4}-\d{2}/)) {
                data = new Date(chave);
              }
              // Formato: "15/01/2025"
              else if (chave.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                const [dia, mes, ano] = chave.split('/');
                data = new Date(`${ano}-${mes}-${dia}`);
              }
              // Já é nome de mês
              else if (mesesNomes.includes(chave)) {
                receitaPorMesAgregada[chave] = (receitaPorMesAgregada[chave] || 0) + Number(valor);
                return;
              }
              
              if (data && !isNaN(data.getTime())) {
                const mesNumero = data.getMonth(); // 0-11
                const mesNome = mesesNomes[mesNumero];
                receitaPorMesAgregada[mesNome] = (receitaPorMesAgregada[mesNome] || 0) + Number(valor);
              }
            } catch (e) {
              console.warn('Erro ao processar chave da receita mensal:', chave, e);
            }
          });
          
          // Substituir dados originais pelos agregados
          receitaMensalData.receitaPorMes = receitaPorMesAgregada;
          console.log('✅ Dados agregados por mês:', {
            totalMeses: Object.keys(receitaPorMesAgregada).length,
            meses: Object.keys(receitaPorMesAgregada)
          });
        }
      }

      // � NORMALIZAR DADOS DA API EXTERNA (SQL) PARA FORMATO PRISMA
      if (notasData && Array.isArray(notasData)) {
        const formato = detectarFormato(notasData[0]);
        console.log(`📝 Formato detectado das notas fiscais: ${formato}`);
        if (formato === 'sql') {
          console.log('🔄 Normalizando notas fiscais de SQL para Prisma...');
          notasData = normalizarNotasFiscais(notasData);
          console.log('✅ Notas fiscais normalizadas');
        }
      }

      if (clientesData && Array.isArray(clientesData)) {
        const formato = detectarFormato(clientesData[0]);
        console.log(`👥 Formato detectado dos clientes: ${formato}`);
        if (formato === 'sql') {
          console.log('🔄 Normalizando clientes de SQL para Prisma...');
          clientesData = normalizarClientes(clientesData);
          console.log('✅ Clientes normalizados');
        }
        // 🔍 Debug: mostrar estrutura de um cliente de exemplo
        if (clientesData.length > 0) {
          console.log('📋 Exemplo de estrutura de cliente:', {
            keys: Object.keys(clientesData[0]),
            amostra: clientesData[0]
          });
        }
      }

      console.log('📊 Processando dados...');
      
      // 🔍 APLICAR FILTROS HIERÁRQUICOS NOS DADOS
      console.log('🔍 Aplicando filtros hierárquicos - Role:', userScope?.role);
      
      // Filtrar notas fiscais baseado no escopo
      let notasDataFiltradas = notasData;
      if (userScope && Array.isArray(notasData)) {
        if (userScope.role === 'VENDEDOR') {
          // Vendedor só vê suas próprias notas
          // Priorizar vendedorId (ID_Vendedor da tabela) se disponível
          const vendedorIdToFilter = userScope.vendedorId || userScope.userId;
          notasDataFiltradas = notasData.filter(nota => {
            // Usar helper que funciona com ambos formatos
            return vendedorIdMatch(nota, vendedorIdToFilter) || 
                   filialIdMatch(nota, userScope.filialId);
          });
          console.log(`🔍 Vendedor (ID: ${vendedorIdToFilter}) - Notas filtradas: ${notasDataFiltradas.length} de ${notasData.length}`);
        } else if (userScope.role === 'GESTOR_I') {
          // Gestor I vê notas da sua filial
          notasDataFiltradas = notasData.filter(nota => filialIdMatch(nota, userScope.filialId));
          console.log(`🔍 Gestor I - Notas filtradas: ${notasDataFiltradas.length} de ${notasData.length}`);
        } else if (userScope.role === 'GESTOR_II') {
          // Gestor II vê notas da sua regional
          notasDataFiltradas = notasData.filter(nota => nota.regionalId === userScope.regionalId);
          console.log(`🔍 Gestor II - Notas filtradas: ${notasDataFiltradas.length} de ${notasData.length}`);
        } else if (userScope.role === 'GESTOR_III') {
          // Gestor III vê notas da sua diretoria
          notasDataFiltradas = notasData.filter(nota => nota.diretoriaId === userScope.diretoriaId);
          console.log(`🔍 Gestor III - Notas filtradas: ${notasDataFiltradas.length} de ${notasData.length}`);
        }
        // GESTOR_MASTER vê tudo - sem filtro
      }
      
      // 🔗 ENRIQUECER CLIENTES COM VENDEDOR BASEADO NAS NOTAS FISCAIS
      // Como a tabela Clientes não tem campo de vendedor, derivamos através das NFs
      if (Array.isArray(clientesData) && Array.isArray(notasDataFiltradas)) {
        console.log('🔗 Enriquecendo clientes com informações de vendedor baseado nas NFs...');
        
        // Criar mapa de cliente -> vendedores (um cliente pode ter comprado de vários vendedores)
        const clienteVendedorMap = new Map<number, Set<number>>();
        
        notasDataFiltradas.forEach(nota => {
          const clienteId = nota.clienteId ?? nota.ID_Cliente;
          const vendedorId = nota.vendedorId ?? nota.ID_Vendedor;
          
          if (clienteId && vendedorId) {
            if (!clienteVendedorMap.has(clienteId)) {
              clienteVendedorMap.set(clienteId, new Set());
            }
            clienteVendedorMap.get(clienteId)!.add(vendedorId);
          }
        });
        
        // Enriquecer cada cliente com lista de vendedores
        clientesData = clientesData.map(cliente => {
          const clienteId = cliente.id ?? cliente.ID_Cliente;
          const vendedores = clienteVendedorMap.get(clienteId);
          
          return {
            ...cliente,
            vendedoresIds: vendedores ? Array.from(vendedores) : [],
            vendedorPrincipalId: vendedores && vendedores.size > 0 ? Array.from(vendedores)[0] : null
          };
        });
        
        console.log(`✅ ${clientesData.length} clientes enriquecidos com dados de vendedor`);
      }
      
      // Filtrar clientes baseado no escopo
      let clientesDataFiltrados = clientesData;
      if (userScope && Array.isArray(clientesData)) {
        console.log(`🔍 Iniciando filtragem de ${clientesData.length} clientes. Role: ${userScope.role}`);
        
        if (userScope.role === 'VENDEDOR') {
          // Priorizar vendedorId (ID_Vendedor da tabela) se disponível
          const vendedorIdToFilter = userScope.vendedorId || userScope.userId;
          console.log(`🔍 Filtrando clientes para vendedor ID: ${vendedorIdToFilter}`);
          
          // Debug: verificar campos disponíveis no primeiro cliente
          if (clientesData.length > 0) {
            const primeiroCliente = clientesData[0];
            console.log('🔍 Campos disponíveis no cliente:', Object.keys(primeiroCliente));
            console.log('🔍 Cliente exemplo:', {
              id: primeiroCliente.id ?? primeiroCliente.ID_Cliente,
              vendedoresIds: primeiroCliente.vendedoresIds,
              vendedorPrincipalId: primeiroCliente.vendedorPrincipalId
            });
          }
          
          // Filtrar clientes que compraram deste vendedor OU estão na mesma filial
          clientesDataFiltrados = clientesData.filter(cliente => {
            // Verificar se o vendedor está na lista de vendedores do cliente
            const temVendedor = cliente.vendedoresIds?.includes(vendedorIdToFilter);
            const matchFilial = filialIdMatch(cliente, userScope.filialId);
            return temVendedor || matchFilial;
          });
          console.log(`🔍 Vendedor (ID: ${vendedorIdToFilter}) - Clientes filtrados: ${clientesDataFiltrados.length} de ${clientesData.length}`);
        } else if (userScope.role === 'GESTOR_I') {
          clientesDataFiltrados = clientesData.filter(cliente => filialIdMatch(cliente, userScope.filialId));
        } else if (userScope.role === 'GESTOR_II') {
          clientesDataFiltrados = clientesData.filter(cliente => 
            (cliente.regionalId === userScope.regionalId) || (cliente.ID_Regional === userScope.regionalId)
          );
        } else if (userScope.role === 'GESTOR_III') {
          clientesDataFiltrados = clientesData.filter(cliente => 
            (cliente.diretoriaId === userScope.diretoriaId) || (cliente.ID_Diretoria === userScope.diretoriaId)
          );
        }
      }
      
      // 🔗 ENRIQUECER CLIENTES INATIVOS COM VENDEDOR BASEADO NAS NOTAS FISCAIS
      // Mesma lógica dos clientes ativos
      if (Array.isArray(inativosData) && Array.isArray(notasDataFiltradas)) {
        console.log('🔗 Enriquecendo clientes inativos com informações de vendedor baseado nas NFs...');
        
        // Criar mapa de cliente -> vendedores
        const clienteVendedorMap = new Map<number, Set<number>>();
        
        notasDataFiltradas.forEach(nota => {
          const clienteId = nota.clienteId ?? nota.ID_Cliente;
          const vendedorId = nota.vendedorId ?? nota.ID_Vendedor;
          
          if (clienteId && vendedorId) {
            if (!clienteVendedorMap.has(clienteId)) {
              clienteVendedorMap.set(clienteId, new Set());
            }
            clienteVendedorMap.get(clienteId)!.add(vendedorId);
          }
        });
        
        // Enriquecer cada cliente inativo
        inativosData = inativosData.map(cliente => {
          const clienteId = cliente.id ?? cliente.ID_Cliente;
          const vendedores = clienteVendedorMap.get(clienteId);
          
          return {
            ...cliente,
            vendedoresIds: vendedores ? Array.from(vendedores) : [],
            vendedorPrincipalId: vendedores && vendedores.size > 0 ? Array.from(vendedores)[0] : null
          };
        });
        
        console.log(`✅ ${inativosData.length} clientes inativos enriquecidos com dados de vendedor`);
      }
      
      // Filtrar clientes inativos baseado no escopo
      let inativosDataFiltrados = inativosData;
      if (userScope && Array.isArray(inativosData)) {
        console.log(`🔍 Iniciando filtragem de ${inativosData.length} clientes inativos. Role: ${userScope.role}`);
        
        if (userScope.role === 'VENDEDOR') {
          // Priorizar vendedorId (ID_Vendedor da tabela) se disponível
          const vendedorIdToFilter = userScope.vendedorId || userScope.userId;
          console.log(`🔍 Filtrando clientes inativos para vendedor ID: ${vendedorIdToFilter}`);
          
          // Debug: verificar campos disponíveis no primeiro cliente inativo
          if (inativosData.length > 0) {
            const primeiroInativo = inativosData[0];
            console.log('🔍 Campos disponíveis no cliente inativo:', Object.keys(primeiroInativo));
            console.log('🔍 Cliente inativo exemplo:', {
              id: primeiroInativo.id ?? primeiroInativo.ID_Cliente,
              vendedoresIds: primeiroInativo.vendedoresIds,
              vendedorPrincipalId: primeiroInativo.vendedorPrincipalId
            });
          }
          
          // Filtrar clientes inativos que compraram deste vendedor OU estão na mesma filial
          inativosDataFiltrados = inativosData.filter(cliente => {
            // Verificar se o vendedor está na lista de vendedores do cliente
            const temVendedor = cliente.vendedoresIds?.includes(vendedorIdToFilter);
            const matchFilial = filialIdMatch(cliente, userScope.filialId);
            return temVendedor || matchFilial;
          });
          console.log(`🔍 Vendedor (ID: ${vendedorIdToFilter}) - Clientes inativos filtrados: ${inativosDataFiltrados.length} de ${inativosData.length}`);
        } else if (userScope.role === 'GESTOR_I') {
          inativosDataFiltrados = inativosData.filter(cliente => filialIdMatch(cliente, userScope.filialId));
        } else if (userScope.role === 'GESTOR_II') {
          inativosDataFiltrados = inativosData.filter(cliente => 
            (cliente.regionalId === userScope.regionalId) || (cliente.ID_Regional === userScope.regionalId)
          );
        } else if (userScope.role === 'GESTOR_III') {
          inativosDataFiltrados = inativosData.filter(cliente => 
            (cliente.diretoriaId === userScope.diretoriaId) || (cliente.ID_Diretoria === userScope.diretoriaId)
          );
        }
      }

      // Processar dados COM OS DADOS FILTRADOS
      let receitaTotal = 0;
      let ticketMedio = null;
      let itensVendidos = null;
      let numeroNotas = null;
      let itensP95PorNota = null;
      
      if (Array.isArray(notasDataFiltradas) && notasDataFiltradas.length > 0) {
        // Calcular receita total a partir das notas filtradas
        const soma = notasDataFiltradas.reduce((acc, nf) => acc + (parseFloat(nf.valorTotal) || 0), 0);
        receitaTotal = soma;
        ticketMedio = soma / notasDataFiltradas.length;
        itensVendidos = notasDataFiltradas.reduce((acc, nf) => acc + (nf._count?.itens || 0), 0);
        numeroNotas = notasDataFiltradas.length;
        
        console.log(`📊 Métricas calculadas - Receita: R$ ${receitaTotal.toFixed(2)}, Notas: ${numeroNotas}, Ticket: R$ ${ticketMedio?.toFixed(2)}`);
        
        // Calcular P95 de itens por nota fiscal
        const itensArray = notasDataFiltradas.map(nf => nf._count?.itens || 0).filter(itens => itens > 0);
        if (itensArray.length > 0) {
          itensArray.sort((a, b) => a - b);
          const index = Math.ceil(itensArray.length * 0.95) - 1;
          itensP95PorNota = itensArray[Math.min(index, itensArray.length - 1)];
        }
      } else {
        // Se não tiver dados da API receitaTotal, usar 0
        receitaTotal = 0;
      }

      let receitaPorTipo: ReceitaPorTipo = [];
      if (Array.isArray(receitaTipoData)) {
        receitaPorTipo = receitaTipoData;
      } else if (receitaTipoData && typeof receitaTipoData === 'object') {
        receitaPorTipo = Object.entries(receitaTipoData).map(([tipo, receita]) => ({ tipo, receita: Number(receita) }));
      }
      
      // Filtrar receita por tipo baseado no escopo (se necessário)
      // Nota: Se a API não retornar dados hierárquicos, pode ser necessário calcular do zero

      // Filtrar vendas por filial baseado no escopo
      let vendasPorFilialFiltradas = vendasFilialData;
      if (userScope && Array.isArray(vendasFilialData)) {
        if (userScope.role === 'VENDEDOR') {
          // Vendedor vê apenas sua filial
          vendasPorFilialFiltradas = vendasFilialData.filter(venda => 
            venda.filial?.id === userScope.filialId
          );
        } else if (userScope.role === 'GESTOR_I') {
          // Gestor I vê apenas sua filial
          vendasPorFilialFiltradas = vendasFilialData.filter(venda => 
            venda.filial?.id === userScope.filialId
          );
        } else if (userScope.role === 'GESTOR_II') {
          // Gestor II vê filiais da sua regional
          vendasPorFilialFiltradas = vendasFilialData.filter(venda => 
            venda.regionalId === userScope.regionalId
          );
        } else if (userScope.role === 'GESTOR_III') {
          // Gestor III vê filiais da sua diretoria
          vendasPorFilialFiltradas = vendasFilialData.filter(venda => 
            venda.diretoriaId === userScope.diretoriaId
          );
        }
      }

      const vendasPorFilial = Array.isArray(vendasPorFilialFiltradas) ? vendasPorFilialFiltradas : [];
      const clientesInativos = Array.isArray(inativosDataFiltrados) ? inativosDataFiltrados.length : null;
      const totalClientes = Array.isArray(clientesDataFiltrados) ? clientesDataFiltrados.length : null;
      const clientesAtivos = (typeof totalClientes === 'number' && typeof clientesInativos === 'number') 
        ? totalClientes - clientesInativos : null;
      
      // Processar receita mensal das notas filtradas
      let receitaMensalProcessada = receitaMensalData;
      if (userScope && userScope.role !== 'GESTOR_MASTER' && Array.isArray(notasDataFiltradas) && notasDataFiltradas.length > 0) {
        // Recalcular receita mensal baseado nas notas filtradas
        const receitaPorMes: Record<string, number> = {};
        
        // Mapeamento de números de mês para nomes em português
        const mesesNomes = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        notasDataFiltradas.forEach(nota => {
          if (nota.dataEmissao) {
            try {
              const data = new Date(nota.dataEmissao);
              const mesNumero = data.getMonth(); // 0-11
              const mesNome = mesesNomes[mesNumero];
              
              const valor = parseFloat(nota.valorTotal) || 0;
              receitaPorMes[mesNome] = (receitaPorMes[mesNome] || 0) + valor;
            } catch (e) {
              console.warn('Erro ao processar data da nota:', e);
            }
          }
        });
        
        // Converter para formato esperado pelo componente (nomes de meses em português)
        const anoAtual = new Date().getFullYear();
        receitaMensalProcessada = {
          ano: anoAtual,
          receitaPorMes: receitaPorMes
        };
        
        console.log('📊 Receita mensal recalculada (agregada por mês):', {
          totalMeses: Object.keys(receitaPorMes).length,
          meses: Object.keys(receitaPorMes),
          valores: receitaPorMes
        });
      }

      const finalData: Omit<DataContextType, 'refetch'> = {
        receitaTotal,
        ticketMedio,
        itensVendidos,
        numeroNotas,
        itensP95PorNota,
        receitaMensal: receitaMensalProcessada,
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
  const diasInatividade = 90; // Valor padrão fixo após remoção dos parâmetros de negócio
  
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
      manager.clearCache();
      manager.loadData(diasInatividade);
    }

    // Listener para evento global de mudança de configuração de inatividade
    function handleInactivityConfigChanged(event: CustomEvent) {
      const { diasInatividade: newDias } = event.detail || {};
      // Limpar cache e recarregar dados com novo filtro
      manager.clearCache();
      manager.loadData(newDias || diasInatividade);
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('inactivityConfigChanged', handleInactivityConfigChanged as EventListener);
    }

    return () => {
      unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('inactivityConfigChanged', handleInactivityConfigChanged as EventListener);
      }
    };
  }, [diasInatividade]);

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
