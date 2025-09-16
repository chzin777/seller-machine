"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart, 
  Calendar, 
  DollarSign, 
  Target, 
  Activity, 
  Filter, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  Eye,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Award,
  Clock
} from 'lucide-react';
import { useSalesPrediction } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Componente para card de métrica
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <ArrowDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-6 w-6 ${iconColors[color]}`} />
          {trend && (
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              {trendValue && <span className="text-xs font-medium">{trendValue}</span>}
            </div>
          )}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium">{title}</p>
          {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para gráfico de tendência (simulado)
function TrendChart({ 
  predictions, 
  title 
}: { 
  predictions: any[];
  title: string;
}) {
  const maxValue = Math.max(...predictions.map(p => p.valorPredito || 0));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma predição disponível</p>
          ) : (
            <div className="space-y-3">
              {predictions.map((prediction, index) => {
                const percentage = maxValue > 0 ? (prediction.valorPredito / maxValue) * 100 : 0;
                const confidence = prediction.intervaloConfianca || {};
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {prediction.periodo || `Período ${index + 1}`}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-bold">
                          R$ {(prediction.valorPredito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                        {prediction.crescimento && (
                          <div className="flex items-center gap-1 text-xs">
                            {prediction.crescimento > 0 ? (
                              <ArrowUp className="h-3 w-3 text-green-600" />
                            ) : prediction.crescimento < 0 ? (
                              <ArrowDown className="h-3 w-3 text-red-600" />
                            ) : (
                              <Minus className="h-3 w-3 text-gray-600" />
                            )}
                            <span className={prediction.crescimento > 0 ? 'text-green-600' : prediction.crescimento < 0 ? 'text-red-600' : 'text-gray-600'}>
                              {Math.abs(prediction.crescimento).toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      
                      {confidence.min && confidence.max && (
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Min: R$ {confidence.min.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <span>Max: R$ {confidence.max.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para análise sazonal
function SeasonalAnalysis({ 
  sazonalidade 
}: { 
  sazonalidade: any;
}) {
  if (!sazonalidade) return null;

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Análise Sazonal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {meses.map((mes, index) => {
            const valor = sazonalidade[index + 1] || sazonalidade[mes.toLowerCase()] || 0;
            const isHigh = valor > 1.2;
            const isLow = valor < 0.8;
            
            return (
              <div key={mes} className={`p-3 rounded-lg border text-center ${
                isHigh ? 'bg-green-50 border-green-200' : 
                isLow ? 'bg-red-50 border-red-200' : 
                'bg-gray-50 border-gray-200'
              }`}>
                <p className="text-xs font-medium text-gray-600">{mes}</p>
                <p className={`text-lg font-bold ${
                  isHigh ? 'text-green-700' : 
                  isLow ? 'text-red-700' : 
                  'text-gray-700'
                }`}>
                  {(valor * 100).toFixed(0)}%
                </p>
                <div className="flex justify-center mt-1">
                  {isHigh ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : isLow ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Interpretação:</strong> Valores acima de 120% indicam alta sazonalidade (picos de venda), 
            valores abaixo de 80% indicam baixa sazonalidade (períodos mais fracos).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para recomendações estratégicas
function StrategicRecommendations({ 
  recomendacoes 
}: { 
  recomendacoes: string[];
}) {
  const getRecommendationIcon = (rec: string) => {
    if (rec.toLowerCase().includes('estoque') || rec.toLowerCase().includes('inventário')) {
      return <Target className="h-4 w-4 text-blue-600" />;
    }
    if (rec.toLowerCase().includes('marketing') || rec.toLowerCase().includes('promoção')) {
      return <Zap className="h-4 w-4 text-yellow-600" />;
    }
    if (rec.toLowerCase().includes('vendas') || rec.toLowerCase().includes('equipe')) {
      return <Award className="h-4 w-4 text-green-600" />;
    }
    return <Activity className="h-4 w-4 text-purple-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Recomendações Estratégicas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recomendacoes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma recomendação disponível</p>
        ) : (
          <div className="space-y-3">
            {recomendacoes.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                {getRecommendationIcon(rec)}
                <p className="text-sm text-gray-800 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente principal
export default function AISalesPrediction() {
  const [filialId, setFilialId] = useState<number | undefined>(undefined);
  const [mesesPredicao, setMesesPredicao] = useState(3);
  
  const { data, loading, error, refetch } = useSalesPrediction(filialId, mesesPredicao);

  // Processar dados para exibição
  const processedData = useMemo(() => {
    if (!data) return null;

    return {
      predicoes: data.predicoes || [],
      resumo: data.resumo || {},
      sazonalidade: data.sazonalidade || {},
      recomendacoes: data.recomendacoes || [],
      metricas: data.metricas || {}
    };
  }, [data]);

  const handleExport = () => {
    console.log('Exportar predições de vendas');
  };

  // Calcular métricas resumidas
  const summaryMetrics = useMemo(() => {
    if (!processedData?.predicoes.length) return null;

    const totalPredito = processedData.predicoes.reduce((acc: any, p: { valorPredito: any; }) => acc + (p.valorPredito || 0), 0);
    const crescimentoMedio = processedData.predicoes.reduce((acc: any, p: { crescimento: any; }) => acc + (p.crescimento || 0), 0) / processedData.predicoes.length;
    const maiorPredicao = Math.max(...processedData.predicoes.map((p: { valorPredito: any; }) => p.valorPredito || 0));
    const menorPredicao = Math.min(...processedData.predicoes.map((p: { valorPredito: any; }) => p.valorPredito || 0));

    return {
      totalPredito,
      crescimentoMedio,
      maiorPredicao,
      menorPredicao
    };
  }, [processedData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-900">Predição de Vendas</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Configurações da Predição
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filial (Opcional)
              </label>
              <Input
                type="number"
                placeholder="ID da filial..."
                value={filialId || ''}
                onChange={(e) => setFilialId(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meses para Predição
              </label>
              <Select 
                value={mesesPredicao.toString()} 
                onValueChange={(value) => setMesesPredicao(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 mês</SelectItem>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={refetch} disabled={loading} className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Gerar Predição
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar predições</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : !processedData ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Configure a predição</h3>
            <p className="text-gray-600">Ajuste os parâmetros acima e clique em "Gerar Predição" para ver os resultados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Métricas Resumidas */}
          {summaryMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Predito"
                value={`R$ ${summaryMetrics.totalPredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle={`Próximos ${mesesPredicao} meses`}
                icon={DollarSign}
                color="green"
              />
              <MetricCard
                title="Crescimento Médio"
                value={`${summaryMetrics.crescimentoMedio.toFixed(1)}%`}
                subtitle="Por período"
                icon={TrendingUp}
                trend={summaryMetrics.crescimentoMedio > 0 ? 'up' : summaryMetrics.crescimentoMedio < 0 ? 'down' : 'neutral'}
                color={summaryMetrics.crescimentoMedio > 0 ? 'green' : summaryMetrics.crescimentoMedio < 0 ? 'red' : 'yellow'}
              />
              <MetricCard
                title="Maior Predição"
                value={`R$ ${summaryMetrics.maiorPredicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Pico esperado"
                icon={Target}
                color="blue"
              />
              <MetricCard
                title="Menor Predição"
                value={`R$ ${summaryMetrics.menorPredicao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                subtitle="Vale esperado"
                icon={Clock}
                color="purple"
              />
            </div>
          )}

          {/* Gráfico de Tendência */}
          <TrendChart 
            predictions={processedData.predicoes} 
            title={`Predição de Vendas - Próximos ${mesesPredicao} Meses`}
          />

          {/* Análise Sazonal e Recomendações */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SeasonalAnalysis sazonalidade={processedData.sazonalidade} />
            <StrategicRecommendations recomendacoes={processedData.recomendacoes} />
          </div>

          {/* Informações Adicionais */}
          {processedData.resumo && Object.keys(processedData.resumo).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Resumo da Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(processedData.resumo).map(([key, value]) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {typeof value === 'number' 
                          ? value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                          : String(value)
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}