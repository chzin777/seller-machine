"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Brain, Users, TrendingUp, Target, AlertTriangle, CheckCircle, Clock, BarChart3 } from 'lucide-react';
import { useAIDashboard, useCombinedDashboard } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Componente para métricas principais
function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500 text-white shadow-lg',
    green: 'bg-green-500 text-white shadow-lg',
    red: 'bg-red-500 text-white shadow-lg',
    yellow: 'bg-yellow-500 text-white shadow-lg',
    purple: 'bg-purple-500 text-white shadow-lg'
  };

  return (
    <Card className={`${colorClasses[color]} border-0`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white/80">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            {trend && (
              <p className="text-xs text-white/70 mt-1">{trend}</p>
            )}
          </div>
          <Icon className="h-8 w-8 text-white/80" />
        </div>
      </CardContent>
    </Card>
  );
}



// Componente principal do Dashboard de IA
export default function AIDashboard() {
  const { dashboardData: data, clientesStats, loading, error, refetch } = useCombinedDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inteligência Artificial</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inteligência Artificial</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Erro ao carregar dados</h3>
                <p className="text-sm">{error}</p>
                <button 
                  onClick={refetch}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inteligência Artificial</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">Nenhum dado disponível</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Inteligência Artificial</h1>
        </div>
        <button 
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <BarChart3 className="h-4 w-4" />
          Atualizar
        </button>
      </div>

      {/* Métricas Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Métricas Principais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total de Clientes"
              value={clientesStats?.total?.toLocaleString('pt-BR') || '0'}
              icon={Users}
              trend="stable"
              color="blue"
            />
            <MetricCard
              title="Clientes em Risco"
              value={clientesStats?.emRisco?.toLocaleString('pt-BR') || '0'}
              icon={AlertTriangle}
              trend="down"
              color="red"
            />
            <MetricCard
              title="Recomendações Ativas"
              value={data.resumo.recomendacoes.status}
              icon={Target}
              trend="stable"
              color="green"
            />
            <MetricCard
              title="Modelos Ativos"
              value="4"
              icon={BarChart3}
              trend="stable"
              color="purple"
            />
          </div>
        </CardContent>
      </Card>

      {/* Status dos Modelos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Predição de Churn"
          value={data.resumo.churnPrediction.status}
          icon={AlertTriangle}
          trend={data.resumo.churnPrediction.descricao}
          color="red"
        />
        <MetricCard
          title="Predição de Vendas"
          value={data.resumo.salesPrediction.status}
          icon={BarChart3}
          trend={data.resumo.salesPrediction.descricao}
          color="blue"
        />
        <MetricCard
          title="Otimização RFV"
          value={data.resumo.rfvOptimization.status}
          icon={CheckCircle}
          trend={data.resumo.rfvOptimization.descricao}
          color="purple"
        />
      </div>

      {/* Próximas Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Próximas Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.proximasFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold text-gray-900">Última Atualização</h4>
              <p className="text-sm text-gray-600">Dashboard atualizado em:</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{formatDate(data.timestamp)}</p>
              <p className="text-sm text-gray-500">Sistema operacional</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-left shadow-lg hover:cursor-pointer">
              <Users className="h-6 w-6 text-white mb-2" />
              <h4 className="font-semibold text-white">Ver Clientes em Risco</h4>
              <p className="text-sm text-blue-100">Análise detalhada de churn</p>
            </button>
            <button className="p-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-left shadow-lg hover:cursor-pointer">
              <Target className="h-6 w-6 text-white mb-2" />
              <h4 className="font-semibold text-white">Gerar Recomendações</h4>
              <p className="text-sm text-green-100">Produtos para clientes</p>
            </button>
            <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-left shadow-lg hover:cursor-pointer">
              <TrendingUp className="h-6 w-6 text-white mb-2" />
              <h4 className="font-semibold text-white">Predição de Vendas</h4>
              <p className="text-sm text-purple-100">Projeções futuras</p>
            </button>
            <button className="p-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-left shadow-lg hover:cursor-pointer">
              <BarChart3 className="h-6 w-6 text-white mb-2" />
              <h4 className="font-semibold text-white">Treinar Modelos</h4>
              <p className="text-sm text-yellow-100">Atualizar IA</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}