"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Activity, 
  Award,
  BarChart3,
  Percent
} from 'lucide-react';
import { useMetricasCarteira } from '../hooks/useCarteiraVendedor';
import LoadingSpinner from './LoadingSpinner';

interface MetricasCarteiraProps {
  filialId?: number;
  className?: string;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  subtitle, 
  trend 
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {getTrendIcon()}
              </div>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MetricasCarteira({ filialId, className = '' }: MetricasCarteiraProps) {
  const { metricas, loading, error, refetch } = useMetricasCarteira(filialId);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className={`border-red-200 ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">Erro ao carregar métricas</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
            <button 
              onClick={refetch}
              className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentualAtivos = metricas.totalVendedores > 0 
    ? (metricas.vendedoresAtivos / metricas.totalVendedores) * 100 
    : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 ${className}`}>
      {/* Total de Vendedores */}
      <MetricCard
        title="Total Vendedores"
        value={metricas.totalVendedores.toString()}
        icon={Users}
        color="bg-gradient-to-br from-blue-500 to-blue-600"
        subtitle={filialId ? 'nesta filial' : 'em todas as filiais'}
      />
      
      {/* Vendedores Ativos */}
      <MetricCard
        title="Vendedores Ativos"
        value={metricas.vendedoresAtivos.toString()}
        icon={Activity}
        color="bg-gradient-to-br from-green-500 to-green-600"
        subtitle={`${formatPercentage(percentualAtivos)} do total`}
        trend={percentualAtivos >= 80 ? 'up' : percentualAtivos >= 60 ? 'neutral' : 'down'}
      />
      
      {/* Cobertura Média */}
      <MetricCard
        title="Cobertura Média"
        value={formatPercentage(metricas.coberturaMedia)}
        icon={Target}
        color="bg-gradient-to-br from-purple-500 to-purple-600"
        subtitle="da carteira ativa"
        trend={metricas.coberturaMedia >= 80 ? 'up' : metricas.coberturaMedia >= 60 ? 'neutral' : 'down'}
      />
      
      {/* Receita Total */}
      <MetricCard
        title="Receita Total"
        value={formatCurrency(metricas.receitaTotal)}
        icon={DollarSign}
        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
        subtitle="período atual"
      />
      
      {/* Ticket Médio */}
      <MetricCard
        title="Ticket Médio"
        value={formatCurrency(metricas.ticketMedio)}
        icon={BarChart3}
        color="bg-gradient-to-br from-orange-500 to-orange-600"
        subtitle="por vendedor"
      />
    </div>
  );
}

// Componente adicional para resumo executivo
export function ResumoExecutivoCarteira({ filialId }: { filialId?: number }) {
  const { metricas, loading, error } = useMetricasCarteira(filialId);

  if (loading || error) return null;

  const percentualAtivos = metricas.totalVendedores > 0 
    ? (metricas.vendedoresAtivos / metricas.totalVendedores) * 100 
    : 0;

  const getStatusColor = (value: number, thresholds: [number, number]) => {
    if (value >= thresholds[1]) return 'text-green-600 bg-green-50';
    if (value >= thresholds[0]) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" />
          Resumo Executivo da Carteira
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg border">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(percentualAtivos, [70, 85])}`}>
              <Activity className="w-4 h-4 mr-1" />
              {percentualAtivos >= 85 ? 'Excelente' : percentualAtivos >= 70 ? 'Bom' : 'Atenção'}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatPercentage(percentualAtivos)}</p>
            <p className="text-sm text-gray-600">Vendedores Ativos</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(metricas.coberturaMedia, [60, 80])}`}>
              <Target className="w-4 h-4 mr-1" />
              {metricas.coberturaMedia >= 80 ? 'Excelente' : metricas.coberturaMedia >= 60 ? 'Bom' : 'Atenção'}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatPercentage(metricas.coberturaMedia)}</p>
            <p className="text-sm text-gray-600">Cobertura Média</p>
          </div>
          
          <div className="text-center p-4 rounded-lg border">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-blue-600 bg-blue-50">
              <DollarSign className="w-4 h-4 mr-1" />
              Performance
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(metricas.ticketMedio)}</p>
            <p className="text-sm text-gray-600">Ticket Médio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}