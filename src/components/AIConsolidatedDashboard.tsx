"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  AlertTriangle, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity, 
  RefreshCw, 
  Download, 
  Eye, 
  Zap,
  Award,
  ShoppingCart,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Filter,
  Search,
  Settings
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Interfaces para métricas consolidadas
interface AIMetrics {
  churnPrediction: {
    totalClients: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    accuracy: number;
    trend: 'up' | 'down' | 'stable';
  };
  customerInsights: {
    totalSegments: number;
    champions: number;
    atRisk: number;
    newCustomers: number;
    avgRFVScore: number;
    segmentationAccuracy: number;
  };
  salesPrediction: {
    nextMonthRevenue: number;
    confidence: number;
    trend: 'up' | 'down' | 'stable';
    topProducts: string[];
    seasonalityFactor: number;
  };
  recommendations: {
    totalActive: number;
    implemented: number;
    pending: number;
    avgImpact: number;
    categories: string[];
  };
}

interface AIAlert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  category: 'churn' | 'insights' | 'sales' | 'system';
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  enabled: boolean;
}

// Componente para métricas rápidas
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color = 'blue',
  onClick 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
  onClick?: () => void;
}) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    purple: 'border-purple-200 bg-purple-50'
  };

  return (
    <Card 
      className={`${colorClasses[color as keyof typeof colorClasses]} hover:shadow-md transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white`}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className="flex items-center">
              {getTrendIcon()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para alertas de IA
function AIAlertsPanel({ alerts }: { alerts: AIAlert[] }) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50';
      case 'success': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Alertas de IA ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Nenhum alerta ativo</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`border-l-4 p-3 rounded-r-lg ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.category}
                        </Badge>
                        <Badge 
                          variant={alert.priority === 'high' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatTime(alert.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para ações rápidas
function QuickActionsPanel({ actions }: { actions: QuickAction[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              className={`h-auto p-3 flex flex-col items-start gap-2 ${!action.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={action.enabled ? action.action : undefined}
              disabled={!action.enabled}
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                {action.icon}
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal
export default function AIConsolidatedDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<AIMetrics | null>(null);
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Dados mockados para demonstração
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simular dados de métricas
        const mockMetrics: AIMetrics = {
          churnPrediction: {
            totalClients: 1247,
            highRisk: 89,
            mediumRisk: 156,
            lowRisk: 1002,
            accuracy: 0.87,
            trend: 'down'
          },
          customerInsights: {
            totalSegments: 11,
            champions: 145,
            atRisk: 89,
            newCustomers: 234,
            avgRFVScore: 3.2,
            segmentationAccuracy: 0.92
          },
          salesPrediction: {
            nextMonthRevenue: 2850000,
            confidence: 0.84,
            trend: 'up',
            topProducts: ['Escavadeiras', 'Tratores', 'Peças'],
            seasonalityFactor: 1.15
          },
          recommendations: {
            totalActive: 47,
            implemented: 23,
            pending: 24,
            avgImpact: 0.78,
            categories: ['Retenção', 'Cross-sell', 'Pricing']
          }
        };

        // Simular alertas
        const mockAlerts: AIAlert[] = [
          {
            id: '1',
            type: 'warning',
            title: 'Alto Risco de Churn Detectado',
            message: '15 clientes Champions foram identificados com risco elevado de churn',
            timestamp: new Date().toISOString(),
            priority: 'high',
            actionRequired: true,
            category: 'churn'
          },
          {
            id: '2',
            type: 'info',
            title: 'Novo Segmento Identificado',
            message: 'Algoritmo identificou padrão emergente em clientes B2B',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            priority: 'medium',
            actionRequired: false,
            category: 'insights'
          },
          {
            id: '3',
            type: 'success',
            title: 'Modelo Atualizado',
            message: 'Modelo de predição de vendas retreinado com sucesso',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            priority: 'low',
            actionRequired: false,
            category: 'system'
          }
        ];

        setMetrics(mockMetrics);
        setAlerts(mockAlerts);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ações rápidas
  const quickActions: QuickAction[] = [
    {
      id: 'retrain-churn',
      title: 'Retreinar Churn',
      description: 'Atualizar modelo de predição',
      icon: <Brain className="h-4 w-4" />,
      color: 'bg-blue-100',
      action: () => console.log('Retreinar modelo de churn'),
      enabled: true
    },
    {
      id: 'export-insights',
      title: 'Exportar Insights',
      description: 'Relatório completo',
      icon: <Download className="h-4 w-4" />,
      color: 'bg-green-100',
      action: () => console.log('Exportar insights'),
      enabled: true
    },
    {
      id: 'configure-alerts',
      title: 'Configurar Alertas',
      description: 'Personalizar notificações',
      icon: <Settings className="h-4 w-4" />,
      color: 'bg-purple-100',
      action: () => console.log('Configurar alertas'),
      enabled: true
    },
    {
      id: 'view-recommendations',
      title: 'Ver Recomendações',
      description: 'Ações sugeridas pela IA',
      icon: <Target className="h-4 w-4" />,
      color: 'bg-yellow-100',
      action: () => console.log('Ver recomendações'),
      enabled: true
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Erro ao Carregar Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de IA</h1>
          <p className="text-gray-600 mt-1">
            Visão consolidada de todas as análises de inteligência artificial
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="default">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Clientes Analisados"
          value={metrics.churnPrediction.totalClients.toLocaleString('pt-BR')}
          subtitle={`${metrics.churnPrediction.highRisk} em alto risco`}
          icon={<Users className="h-5 w-5 text-blue-600" />}
          trend={metrics.churnPrediction.trend}
          color="blue"
        />
        
        <MetricCard
          title="Precisão do Modelo"
          value={formatPercentage(metrics.churnPrediction.accuracy)}
          subtitle="Predição de churn"
          icon={<Target className="h-5 w-5 text-green-600" />}
          trend="up"
          color="green"
        />
        
        <MetricCard
          title="Receita Prevista"
          value={formatCurrency(metrics.salesPrediction.nextMonthRevenue)}
          subtitle={`Confiança: ${formatPercentage(metrics.salesPrediction.confidence)}`}
          icon={<DollarSign className="h-5 w-5 text-purple-600" />}
          trend={metrics.salesPrediction.trend}
          color="purple"
        />
        
        <MetricCard
          title="Recomendações Ativas"
          value={metrics.recommendations.totalActive}
          subtitle={`${metrics.recommendations.implemented} implementadas`}
          icon={<Award className="h-5 w-5 text-yellow-600" />}
          trend="stable"
          color="yellow"
        />
      </div>

      {/* Tabs para diferentes visões */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="churn">Análise de Churn</TabsTrigger>
          <TabsTrigger value="insights">Insights de Clientes</TabsTrigger>
          <TabsTrigger value="predictions">Predições</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Alertas */}
            <div className="lg:col-span-2">
              <AIAlertsPanel alerts={alerts} />
            </div>
            
            {/* Ações Rápidas */}
            <div>
              <QuickActionsPanel actions={quickActions} />
            </div>
          </div>

          {/* Resumo por Categoria */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Análise de Churn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Alto Risco:</span>
                    <span className="font-semibold text-red-600">
                      {metrics.churnPrediction.highRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Médio Risco:</span>
                    <span className="font-semibold text-yellow-600">
                      {metrics.churnPrediction.mediumRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Baixo Risco:</span>
                    <span className="font-semibold text-green-600">
                      {metrics.churnPrediction.lowRisk}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Precisão:</span>
                      <span className="font-bold">
                        {formatPercentage(metrics.churnPrediction.accuracy)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Segmentação RFV
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Champions:</span>
                    <span className="font-semibold text-green-600">
                      {metrics.customerInsights.champions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Em Risco:</span>
                    <span className="font-semibold text-red-600">
                      {metrics.customerInsights.atRisk}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Novos:</span>
                    <span className="font-semibold text-blue-600">
                      {metrics.customerInsights.newCustomers}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Score Médio:</span>
                      <span className="font-bold">
                        {metrics.customerInsights.avgRFVScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Predições de Vendas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-600">Próximo Mês:</span>
                    <p className="font-semibold text-lg">
                      {formatCurrency(metrics.salesPrediction.nextMonthRevenue)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confiança:</span>
                    <span className="font-semibold">
                      {formatPercentage(metrics.salesPrediction.confidence)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sazonalidade:</span>
                    <span className="font-semibold">
                      {metrics.salesPrediction.seasonalityFactor.toFixed(2)}x
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-sm text-gray-600">Top Produtos:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {metrics.salesPrediction.topProducts.slice(0, 2).map((product, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {product}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada de Churn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Análise de Churn Detalhada
                </h3>
                <p className="text-gray-600">
                  Visualizações e análises detalhadas de churn em desenvolvimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Detalhados de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Insights de Clientes
                </h3>
                <p className="text-gray-600">
                  Análises comportamentais e segmentação detalhada em desenvolvimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Predições e Forecasting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Predições Avançadas
                </h3>
                <p className="text-gray-600">
                  Modelos preditivos e análises de forecasting em desenvolvimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}