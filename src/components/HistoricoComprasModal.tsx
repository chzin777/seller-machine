"use client";

import { useState, useEffect } from 'react';
import { X, ShoppingBag, Calendar, DollarSign, TrendingUp, Package } from 'lucide-react';

type Pedido = {
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
  cliente: Cliente | null;
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

export default function HistoricoComprasModal({ cliente, isOpen, onClose }: HistoricoComprasModalProps) {
  const [historico, setHistorico] = useState<HistoricoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (isOpen && cliente) {
      buscarHistorico();
    }
  }, [isOpen, cliente]);

  const buscarHistorico = async () => {
    if (!cliente) return;
    
    setLoading(true);
    setErro('');
    
    try {
      const res = await fetch(`/api/clientes/${cliente.id}/historico`);
      
      if (!res.ok) {
        throw new Error('Erro ao buscar histórico');
      }
      
      const data = await res.json();
      setHistorico(data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      setErro('Erro ao carregar histórico de compras');
    } finally {
      setLoading(false);
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
              {cliente && (
                <p className="text-sm text-gray-600">
                  {cliente.nome} • {cliente.cpfCnpj ? formatarCpfCnpj(cliente.cpfCnpj) : 'N/A'}
                </p>
              )}
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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Carregando histórico...</span>
            </div>
          )}

          {erro && (
            <div className="text-center py-12">
              <div className="text-red-600 mb-2">{erro}</div>
              <button
                onClick={buscarHistorico}
                className="text-gray-600 hover:text-gray-800 font-medium"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {historico && !loading && !erro && (
            <div className="space-y-6">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-800">Total de Pedidos</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {historico.resumo.totalPedidos}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Valor Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {formatarMoedaCompacta(historico.resumo.valorTotal)}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">Ticket Médio</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatarMoedaCompacta(historico.resumo.ticketMedio)}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-800">Última Compra</span>
                  </div>
                  <div className="text-lg font-bold text-orange-900">
                    {historico.resumo.ultimaCompra 
                      ? formatarData(historico.resumo.ultimaCompra)
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>

              {/* Lista de Pedidos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Histórico de Pedidos ({historico.pedidos.length})
                </h3>
                
                {historico.pedidos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Nenhum pedido encontrado para este cliente.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {historico.pedidos.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                            <div>
                              <div className="font-medium text-gray-900">
                                Pedido #{pedido.numeroNota}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatarData(pedido.dataEmissao)}
                                {pedido.filial && (
                                  <span className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                    {pedido.filial.nome}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {formatarMoeda(parseFloat(pedido.valorTotal))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
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