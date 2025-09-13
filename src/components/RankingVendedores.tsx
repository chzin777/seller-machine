"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { TrendingUp, TrendingDown, Award, Target, Calendar, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { CardLoader } from './LoadingSpinner';

interface Vendedor {
  id: number;
  nome: string;
  avatar: string;
  receita: number;
  volume: number;
  ticketMedio: number;
  meta: number;
  percentualMeta: number;
  crescimento: number;
  tendencia: 'up' | 'down';
  ultimaVenda: string;
  posicao: number;
  cor: string;
}

// Função para formatar números de forma compacta
function formatCompact(value: number) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toLocaleString('pt-BR');
}

// Função para formatar moeda
function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Função para formatar data
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

// Componente de medalhinha para o top 3
function RankingBadge({ posicao }: { posicao: number }) {
  if (posicao > 3) return <span className="text-lg font-bold text-gray-400">#{posicao}</span>;
  
  const cores = {
    1: 'text-yellow-500', // Ouro
    2: 'text-gray-400',   // Prata  
    3: 'text-orange-500'  // Bronze
  };
  
  return (
    <div className="flex items-center gap-1">
      <Award className={`w-5 h-5 ${cores[posicao as keyof typeof cores]}`} />
      <span className={`text-lg font-bold ${cores[posicao as keyof typeof cores]}`}>#{posicao}</span>
    </div>
  );
}

// Componente de barra de progresso para meta
function MetaProgress({ percentual }: { percentual: number }) {
  const width = Math.min(percentual, 100);
  const cor = percentual >= 100 ? 'bg-green-500' : percentual >= 80 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${cor} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

export default function RankingVendedores() {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3); // 3 vendedores por página

  // Calcular dados de paginação
  const totalItems = vendedores.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVendedores = vendedores.slice(startIndex, endIndex);

  // Funções de navegação
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  useEffect(() => {
    async function fetchVendedores() {
      try {
        setLoading(true);
        const response = await fetch('/api/vendedores');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar dados dos vendedores');
        }
        
        const data = await response.json();
        setVendedores(data);
        setCurrentPage(1); // Reset para primeira página quando dados mudam
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchVendedores();
  }, []);

  if (loading) {
    return <CardLoader text="Carregando ranking..." />;
  }

  if (error) {
    return (
      <Card className="shadow-xl border border-red-200/30 bg-white rounded-2xl overflow-hidden h-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">Erro ao carregar ranking</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border border-blue-200/30 bg-white rounded-2xl overflow-hidden h-full">
      <CardHeader className="p-4 sm:p-6 border-b border-blue-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-blue-800 truncate">
                Ranking de Vendedores
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Performance de receita e volume</p>
            </div>
          </div>
          
          {/* Contador de vendedores */}
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 self-start">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            <span className="text-xs font-semibold text-blue-700">
              {totalItems} Vendedores
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Lista de vendedores */}
        <div className="space-y-3 mb-4">
          {currentVendedores.map((vendedor) => (
            <div 
              key={vendedor.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Linha superior: Ranking, Nome, Tendência */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <RankingBadge posicao={vendedor.posicao} />
                  
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs"
                      style={{ backgroundColor: vendedor.cor }}
                    >
                      {vendedor.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{vendedor.nome}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        Última venda: {formatDate(vendedor.ultimaVenda)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {vendedor.tendencia === 'up' ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">+{vendedor.crescimento.toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <TrendingDown className="w-3 h-3" />
                      <span className="text-xs font-medium">{vendedor.crescimento.toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Linha inferior: Métricas */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-2">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Receita</p>
                  <p className="font-bold text-emerald-700 text-sm">{formatCurrency(vendedor.receita)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Volume</p>
                  <p className="font-bold text-blue-700 text-sm">{formatCompact(vendedor.volume)} NFs</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Ticket Médio</p>
                  <p className="font-bold text-purple-700 text-sm">{formatCurrency(vendedor.ticketMedio)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Meta</p>
                  <p className="font-bold text-orange-700 text-sm">{vendedor.percentualMeta.toFixed(0)}%</p>
                </div>
              </div>
              
              {/* Barra de progresso da meta */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Meta: {formatCurrency(vendedor.meta)}</span>
                  <span>{vendedor.percentualMeta.toFixed(1)}%</span>
                </div>
                <MetaProgress percentual={vendedor.percentualMeta} />
              </div>
            </div>
          ))}
        </div>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>
                Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)} de {totalItems} vendedores
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Botão Anterior */}
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              {/* Números das páginas */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Botão Próximo */}
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : 'text-gray-700 hover:bg-gray-100 bg-white border border-gray-300'
                }`}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
