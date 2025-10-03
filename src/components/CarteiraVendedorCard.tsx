"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Users, 
  DollarSign, 
  Calendar,
  Award,
  BarChart3,
  Activity,
  Clock
} from 'lucide-react';

interface Vendedor {
  id: number;
  nome: string;
  cpf: string;
  filialId?: number;
  filial?: {
    id: number;
    nome: string;
  };
}

interface CoberturaCarteira {
  id: number;
  vendedorId: number;
  data: string;
  tipoPeriodo: string;
  clientesUnicosAtendidos: number;
  clientesAtivos: number;
  percentualCobertura: number;
}

interface RankingVendedor {
  id: number;
  vendedorId: number;
  data: string;
  tipoPeriodo: string;
  tipoRanking: string;
  posicaoRanking: number;
  valorMetrica: number;
  totalVendedores: number;
  percentilRanking: number;
}

interface MixVendedor {
  id: number;
  vendedorId: number;
  data: string;
  tipoPeriodo: string;
  receitaMaquinas: number;
  receitaPecas: number;
  receitaServicos: number;
  percentualMaquinas: number;
  percentualPecas: number;
  percentualServicos: number;
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
}

interface CarteiraVendedorCardProps {
  vendedor: Vendedor & {
    cobertura?: CoberturaCarteira[];
    ranking?: RankingVendedor[];
    mix?: MixVendedor[];
    receitaVendedor?: ReceitaVendedor[];
  };
  onClick?: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatPercentage(value: number | undefined | null): string {
  if (value === null || value === undefined || typeof value !== 'number') {
    return '0.0%';
  }
  return `${value.toFixed(1)}%`;
}

function getRankingColor(posicao: number, total: number): string {
  const percentil = (posicao / total) * 100;
  if (percentil <= 20) return 'text-green-600 bg-green-50';
  if (percentil <= 50) return 'text-blue-600 bg-blue-50';
  if (percentil <= 80) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
}

function getCoberturaColor(percentual: number): string {
  if (percentual >= 80) return 'text-green-600';
  if (percentual >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

export default function CarteiraVendedorCard({ 
  vendedor, 
  onClick 
}: CarteiraVendedorCardProps) {
  // Dados mais recentes de cada tipo
  const coberturaAtual = vendedor.cobertura?.[0];
  const rankingAtual = vendedor.ranking?.[0];
  const mixAtual = vendedor.mix?.[0];
  const receitaAtual = vendedor.receitaVendedor?.[0];
  
  // Calcular receita total do vendedor
  const receitaTotalVendedor = vendedor.receitaVendedor?.reduce((sum, r) => sum + r.valorTotal, 0) || 0;
  const receitaMix = mixAtual ? mixAtual.receitaMaquinas + mixAtual.receitaPecas + mixAtual.receitaServicos : 0;
  const receitaFinal = receitaTotalVendedor > 0 ? receitaTotalVendedor : receitaMix;
  
  const produtoMaisVendido = mixAtual ? (
    mixAtual.percentualMaquinas >= mixAtual.percentualPecas && mixAtual.percentualMaquinas >= mixAtual.percentualServicos ? 'Máquinas' :
    mixAtual.percentualPecas >= mixAtual.percentualServicos ? 'Peças' : 'Serviços'
  ) : 'N/A';
  
  // Data da última atualização (mais recente entre todos os dados)
  const datasAtualizacao = [
    coberturaAtual?.data,
    rankingAtual?.data,
    mixAtual?.data,
    receitaAtual?.updatedAt
  ].filter(Boolean).sort().reverse();
  const ultimaAtualizacao = datasAtualizacao[0] || new Date().toISOString();

  return (
    <Card 
      className="hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-l-4 border-l-blue-500 relative group"
      onClick={onClick}
    >
      {/* Indicador visual de clicável */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
          <Users className="w-3 h-3 text-white" />
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {vendedor.nome}
              </CardTitle>
              <p className="text-sm text-gray-500">
                CPF: {vendedor.cpf} • {vendedor.filial?.nome || 'Sem filial'}
              </p>
            </div>
          </div>
          
          {rankingAtual && (
            <div className="text-right">
              <Badge className={`${getRankingColor(rankingAtual.posicaoRanking, rankingAtual.totalVendedores)} border-0`}>
                <Award className="w-3 h-3 mr-1" />
                #{rankingAtual.posicaoRanking}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                de {rankingAtual.totalVendedores}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Métricas principais */}
        <div className="grid grid-cols-2 gap-4">
          {/* Receita */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-gray-600">Receita</span>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(rankingAtual?.valorMetrica || receitaFinal)}
            </p>
          </div>
          
          {/* Cobertura */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-gray-600">Cobertura</span>
            </div>
            <p className={`text-lg font-bold ${getCoberturaColor(coberturaAtual?.percentualCobertura || 0)}`}>
              {formatPercentage(coberturaAtual?.percentualCobertura || 0)}
            </p>
          </div>
        </div>
        
        {/* Clientes atendidos */}
        {coberturaAtual && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Clientes</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">
                  {coberturaAtual.clientesUnicosAtendidos} / {coberturaAtual.clientesAtivos}
                </p>
                <p className="text-xs text-gray-500">atendidos / ativos</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Mix de produtos */}
        {mixAtual && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Mix de Produtos</span>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Máquinas</span>
                <span className="font-medium">{formatPercentage(mixAtual?.percentualMaquinas)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full" 
                  style={{ width: `${mixAtual?.percentualMaquinas || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Peças</span>
                <span className="font-medium">{formatPercentage(mixAtual?.percentualPecas)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-green-500 h-1.5 rounded-full" 
                  style={{ width: `${mixAtual?.percentualPecas || 0}%` }}
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Serviços</span>
                <span className="font-medium">{formatPercentage(mixAtual?.percentualServicos)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-purple-500 h-1.5 rounded-full" 
                  style={{ width: `${mixAtual?.percentualServicos || 0}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-600">Foco principal:</span>
              <Badge variant="outline" className="text-xs">
                {produtoMaisVendido}
              </Badge>
            </div>
          </div>
        )}
        
        {/* Data da última atualização */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Última atualização: {new Date(ultimaAtualizacao).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            </span>
          </div>
          
          {/* Indicador de ação */}
          <div className="text-xs text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <Users className="w-3 h-3" />
            Ver Clientes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}