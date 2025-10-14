"use client";

import { useState, useEffect, useCallback } from 'react';
import { X, ShoppingBag, Calendar, DollarSign, TrendingUp, Package } from 'lucide-react';
import { useClienteHistorico, usePedidos } from '../hooks/useDashboardData';
import { GRAPHQL_CONFIG } from '../config/graphql';

// Tipos para REST API
type PedidoRest = {
  id: number;
  numeroNota: number;
  dataEmissao: string;
  valorTotal: string;
  filialId: number;
  clienteId: number;
  vendedorId: number;
  filial?: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
  };
  cliente?: {
    id: number;
    nome: string;
    cpfCnpj: string;
    cidade: string;
    estado: string;
  };
  vendedor?: {
    id: number;
    nome: string;
    cpf: string;
  };
  _count?: {
    itens: number;
  };
};

// Tipos para GraphQL (dados originais da query)
type PedidoGraphQLOriginal = {
  id: number;
  numeroNota?: number;
  dataEmissao: string;
  valorTotal: string | number;
  status?: string;
  filial?: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
  };
  cliente?: {
    id: number;
    nome: string;
  };
  itens?: {
    id: number;
    quantidade: number;
    valorTotalItem: number;
    produto: {
      id: number;
      descricao: string;
    };
  }[];
};

// Tipos para GraphQL (após processamento)
type PedidoGraphQL = {
  id: number;
  numeroNota?: number;
  dataEmissao?: string;
  valorTotal?: string | number;
  data_pedido: string;
  valor_total: number;
  status?: string;
  cliente_id?: number;
  filial?: {
    id: number;
    nome: string;
    cidade: string;
    estado: string;
  };
  cliente?: {
    id: number;
    nome: string;
  };
  itens?: {
    id: number;
    quantidade: number;
    valorTotalItem: number;
    produto: {
      id: number;
      descricao: string;
    };
  }[];
};

// Tipo união para compatibilidade
type Pedido = PedidoRest | PedidoGraphQL;

type ResumoHistorico = {
  totalPedidos: number;
  valorTotal: number;
  ticketMedio: number;
  ultimaCompra: string | null;
};

type HistoricoData = {
  pedidos: Pedido[];
  resumo: ResumoHistorico;
};

type Cliente = {
  id: number;
  nome: string;
  cpfCnpj?: string;
  cidade?: string;
  estado?: string;
};

interface HistoricoComprasModalProps {
  clienteId: number | null;
  clienteNome: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

function formatarMoedaCompacta(valor: number): string {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`;
  } else if (valor >= 1000) {
    return `R$ ${(valor / 1000).toFixed(1)}K`;
  } else {
    return formatarMoeda(valor);
  }
}

function formatarData(data: string): string {
  return new Date(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function formatarCpfCnpj(cpfCnpj: string): string {
  const num = cpfCnpj.replace(/\D/g, '');
  if (num.length === 11) {
    return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (num.length === 14) {
    return num.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return cpfCnpj;
}

export default function HistoricoComprasModal({ clienteId, clienteNome, isOpen, onClose }: HistoricoComprasModalProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [resumo, setResumo] = useState<ResumoHistorico | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingGraphQL, setUsingGraphQL] = useState(false);
  
  // Hook do GraphQL para buscar pedidos
  const { data: graphqlData, loading: graphqlLoading, error: graphqlError } = usePedidos(
    {
      clienteId: clienteId || 0,
      incluirItens: true,
      limit: 1000
    },
    !clienteId || !GRAPHQL_CONFIG.enabled
  );

  useEffect(() => {
    if (isOpen && clienteId) {
      console.log('🔍 Modal aberto para cliente:', {
        clienteId,
        clienteNome,
        tipo: typeof clienteId
      });
      
      // Limpar cache para garantir dados frescos
      const cacheKey = `historico_${clienteId}`;
      sessionStorage.removeItem(cacheKey);
      console.log('🧹 Cache limpo para cliente:', clienteId);
      
      buscarHistorico();
    }
  }, [isOpen, clienteId]);
  
  // Processar dados do GraphQL quando chegarem
  useEffect(() => {
    if (GRAPHQL_CONFIG.enabled && graphqlData && graphqlData.pedidos && graphqlData.pedidos.pedidos && !graphqlLoading && !graphqlError) {
      console.log('✅ Dados GraphQL recebidos:', {
        total: graphqlData.pedidos.total,
        pedidos: graphqlData.pedidos.pedidos.length
      });
      
      // Processar pedidos do GraphQL
      const pedidosOriginal = graphqlData.pedidos.pedidos;
      const pedidosGraphQL: PedidoGraphQL[] = pedidosOriginal.map((pedido: any) => ({
        ...pedido,
        // Manter compatibilidade com campos antigos
        data_pedido: pedido.dataEmissao,
        valor_total: typeof pedido.valorTotal === 'string' ? parseFloat(pedido.valorTotal) : pedido.valorTotal,
        cliente_id: pedido.clienteId || clienteId || undefined
      }));
      
      setPedidos(pedidosGraphQL);
      
      // Calcular resumo
      const totalPedidos = pedidosGraphQL.length;
      const valorTotal = pedidosGraphQL.reduce((sum, p) => {
        const valor = typeof p.valor_total === 'string' ? parseFloat(p.valor_total) : p.valor_total;
        return sum + valor;
      }, 0);
      const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0;
      const ultimaCompra = pedidosGraphQL.length > 0 
        ? pedidosGraphQL.sort((a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime())[0].data_pedido
        : null;
      
      setResumo({
        totalPedidos,
        valorTotal,
        ticketMedio,
        ultimaCompra
      });
      
      setLoading(false);
      setError(null);
      setUsingGraphQL(true);
    } else if (GRAPHQL_CONFIG.enabled && graphqlError) {
      // Se GraphQL falhou, fazer fallback para REST
      console.log('❌ Erro GraphQL, fazendo fallback para REST API:', graphqlError);
      setUsingGraphQL(false);
      buscarHistoricoRest();
    } else if (!GRAPHQL_CONFIG.enabled) {
      // GraphQL desabilitado, usar REST
      console.log('🔄 GraphQL desabilitado, usando REST API');
      setUsingGraphQL(false);
    }
  }, [usingGraphQL, graphqlData, graphqlLoading, graphqlError, clienteId]);
  
  const buscarHistoricoRest = useCallback(async () => {
    if (!clienteId) return;
    
    console.log(`🔍 Iniciando busca REST para cliente ${clienteId}`);
    setLoading(true);
    setError(null);
    
    try {
      const url = `/api/clientes/${clienteId}/historico`;
      console.log('🌐 Fazendo requisição REST:', {
        clienteId,
        url,
        tipoClienteId: typeof clienteId
      });
      
      const response = await fetch(url);
      console.log(`📡 Resposta REST recebida - Status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const pedidos = data.pedidos || [];
      const resumo = data.resumo || null;
      
      console.log('📦 Dados recebidos da API REST:', {
        clienteId,
        totalPedidos: pedidos.length,
        resumo: resumo
      });
      
      setPedidos(pedidos);
      setResumo(resumo);
      setUsingGraphQL(false);
      
      // Salvar no cache para próximas consultas
      const cacheKey = `historico_${clienteId}`;
      const cacheData = {
        pedidos,
        resumo,
        timestamp: Date.now()
      };
      
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch (e) {
        // Ignorar erros de storage (quota excedida, etc.)
        console.warn('Não foi possível salvar no cache:', e);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      console.error('Erro ao buscar histórico via REST:', err);
    } finally {
      setLoading(false);
    }
  }, [clienteId]);

  // Tratar erros do GraphQL
  useEffect(() => {
    if (usingGraphQL && graphqlError && !graphqlLoading) {
      console.warn('GraphQL falhou, tentando REST API:', graphqlError);
      buscarHistoricoRest();
    }
  }, [usingGraphQL, graphqlError, graphqlLoading, buscarHistoricoRest]);
    
  const buscarHistorico = async () => {
    if (!clienteId) return;
    
    // Cache simples para evitar requisições desnecessárias
    const cacheKey = `historico_${clienteId}`;
    const cached = sessionStorage.getItem(cacheKey);
    
    console.log('🗄️ Verificando cache:', {
      clienteId,
      cacheKey,
      temCache: !!cached
    });
    
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const cacheTime = cachedData.timestamp;
        const now = Date.now();
        
        console.log('📋 Dados do cache:', {
          clienteId,
          pedidosNoCache: cachedData.pedidos?.length || 0,
          idadeCache: Math.round((now - cacheTime) / 1000) + 's'
        });
        
        // Cache válido por 5 minutos
        if (now - cacheTime < 5 * 60 * 1000) {
          setPedidos(cachedData.pedidos || []);
          setResumo(cachedData.resumo || null);
          console.log('✅ Usando dados do cache');
          return;
        }
      } catch (e) {
        // Cache inválido, remover
        sessionStorage.removeItem(cacheKey);
        console.log('❌ Cache inválido removido');
      }
    }
    
    // Tentar GraphQL primeiro se estiver habilitado
    if (GRAPHQL_CONFIG.enabled) {
      console.log(`🚀 Tentando GraphQL para cliente ${clienteId}`);
      setLoading(true);
      setUsingGraphQL(true);
      // Os dados serão processados pelo useEffect quando chegarem
    } else {
      // Usar REST API diretamente
      console.log(`🔍 Buscando histórico do cliente ${clienteId} via REST API`);
      await buscarHistoricoRest();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Histórico de Compras
              </h2>
              <p className="text-sm text-gray-600">
                {clienteNome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {(loading || (usingGraphQL && graphqlLoading)) && (
            <div className="text-center py-12">
              <div className="logo-loading mx-auto mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="Carregando" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="space-y-2">
                <span className="text-gray-600 block">
                  Carregando histórico{usingGraphQL ? ' (GraphQL)' : ' (REST API)'}...
                </span>
                {!usingGraphQL && (
                  <span className="text-xs text-gray-500 block">
                    Verificando cache local...
                  </span>
                )}
              </div>
            </div>
          )}

          {(error || (usingGraphQL && graphqlError)) && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">
                {error || (graphqlError && 'Erro ao carregar dados via GraphQL')}
              </div>
              <button
                onClick={usingGraphQL ? buscarHistoricoRest : buscarHistorico}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                {usingGraphQL ? 'Tentar via REST API' : 'Tentar novamente'}
              </button>
            </div>
          )}

          {resumo && pedidos && !loading && !error && (
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Total de Pedidos</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {resumo?.totalPedidos || 0}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Valor Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatarMoedaCompacta(resumo?.valorTotal || 0)}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Ticket Médio</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatarMoedaCompacta(resumo?.ticketMedio || 0)}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Última Compra</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                    {resumo?.ultimaCompra ? formatarData(resumo.ultimaCompra) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Lista de Pedidos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Histórico de Pedidos ({pedidos.length})
                </h3>
                
                {pedidos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum pedido encontrado para este cliente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pedidos.map((pedido) => {
                      const isGraphQL = 'data_pedido' in pedido;
                      return (
                        <div
                          key={pedido.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              <div>
                                <div className="font-medium text-gray-900">
                                  Pedido #{isGraphQL ? pedido.id : (pedido as PedidoRest).numeroNota}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {formatarData(isGraphQL ? (pedido as PedidoGraphQL).data_pedido : (pedido as PedidoRest).dataEmissao)}
                                  {!isGraphQL && (pedido as PedidoRest).filial && (
                                    <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                      {(pedido as PedidoRest).filial!.nome}
                                    </span>
                                  )}
                                  {isGraphQL && (pedido as PedidoGraphQL).filial && (
                                    <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs text-blue-800">
                                      {(pedido as PedidoGraphQL).filial!.nome}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-600">
                                {formatarMoeda(
                                  isGraphQL 
                                    ? (pedido as PedidoGraphQL).valor_total
                                    : parseFloat((pedido as PedidoRest).valorTotal)
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>


      </div>
    </div>
  );
}