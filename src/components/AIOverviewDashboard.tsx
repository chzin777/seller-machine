"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  Brain, 
  Users, 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  Bell,
  Sparkles,
  ArrowRight,
  Activity,
  Clock,
  CheckCircle,
  Zap,
  Eye
} from 'lucide-react';
import { useCombinedDashboard } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  status: 'active' | 'training' | 'inactive';
  metrics?: {
    primary: string;
    secondary?: string;
  };
  onNavigate: () => void;
}

function FeatureCard({ title, description, icon: Icon, color, bgColor, status, metrics, onNavigate }: FeatureCardProps) {
  const statusConfig = {
    active: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    training: { label: 'Treinando', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    inactive: { label: 'Inativo', color: 'bg-gray-100 text-gray-800', icon: Activity }
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group" onClick={onNavigate}>
      <CardHeader className="pb-3 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className={`p-2 sm:p-3 rounded-lg ${bgColor} shadow-lg group-hover:shadow-xl transition-shadow`}>
            <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
          </div>
          <Badge className={`${currentStatus.color} flex items-center gap-1 text-xs`}>
            <StatusIcon className="h-3 w-3" />
            {currentStatus.label}
          </Badge>
        </div>
        <CardTitle className="text-base sm:text-lg font-semibold transition-colors" style={{ color: '#003153' }} onMouseEnter={(e) => e.currentTarget.style.color = '#002d4a'} onMouseLeave={(e) => e.currentTarget.style.color = '#003153'}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">{description}</p>
        
        {metrics && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{metrics.primary}</span>
              {metrics.secondary && (
                <span className="text-xs sm:text-sm text-gray-500">{metrics.secondary}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">Clique para explorar</span>
          <ArrowRight className="h-4 w-4 text-gray-400 transition-colors" style={{ color: 'rgb(156 163 175)' }} />
        </div>
      </CardContent>
    </Card>
  );
}

interface AIOverviewDashboardProps {
  onNavigate: (tab: string) => void;
}

export default function AIOverviewDashboard({ onNavigate }: AIOverviewDashboardProps) {
  const { dashboardData, clientesStats, loading, error, refetch } = useCombinedDashboard();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Carregando dados de IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">Erro ao carregar dados</h3>
                <p className="text-sm">{error}</p>
                <Button 
                  onClick={refetch}
                  className="mt-2 bg-red-600 text-white hover:bg-red-700"
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status Geral do Sistema */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sistema de IA Operacional</h2>
            <p className="text-blue-100">
              Todos os modelos estão funcionando e processando dados em tempo real
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{clientesStats?.total?.toLocaleString('pt-BR') || '0'}</div>
              <div className="text-blue-100 text-sm">Total Clientes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-200">{clientesStats?.emRisco || '0'}</div>
              <div className="text-blue-100 text-sm">Em Risco</div>
            </div>
          </div>
        </div>
      </div>

      {/* Funcionalidades Principais */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Análise de Clientes</h3>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver Todos
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <FeatureCard
            title="Predição de Churn"
            description="Identifica clientes com alta probabilidade de cancelamento e sugere ações preventivas."
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
            status="active"
            metrics={{
              primary: `${clientesStats?.emRisco || 0}`,
              secondary: "clientes em risco"
            }}
            onNavigate={() => onNavigate('churn')}
          />

          <FeatureCard
            title="Insights do Cliente"
            description="Análise comportamental detalhada com padrões de compra e preferências."
            icon={Users}
            color="text-purple-600"
            bgColor="bg-purple-100"
            status="active"
            metrics={{
              primary: "98%",
              secondary: "precisão"
            }}
            onNavigate={() => onNavigate('insights')}
          />

          <FeatureCard
            title="Segmentação IA"
            description="Clustering automático de clientes baseado em comportamento e valor."
            icon={Target}
            color="text-indigo-600"
            bgColor="bg-indigo-100"
            status="active"
            metrics={{
              primary: "8",
              secondary: "segmentos ativos"
            }}
            onNavigate={() => onNavigate('clustering')}
          />
        </div>
      </div>

      {/* Vendas e Marketing */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Vendas e Marketing</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <FeatureCard
            title="Recomendações IA"
            description="Sistema inteligente que sugere produtos personalizados para cada cliente."
            icon={Sparkles}
            color="text-green-600"
            bgColor="bg-green-100"
            status="active"
            metrics={{
              primary: "2.3x",
              secondary: "aumento em vendas"
            }}
            onNavigate={() => onNavigate('recommendations')}
          />

          <FeatureCard
            title="Predição de Vendas"
            description="Previsões precisas de vendas futuras com intervalos de confiança."
            icon={TrendingUp}
            color="#003153"
            bgColor="bg-blue-100"
            status="active"
            metrics={{
              primary: "94%",
              secondary: "acurácia média"
            }}
            onNavigate={() => onNavigate('sales')}
          />
        </div>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 text-left"
              onClick={() => onNavigate('churn')}
            >
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div className="text-left">
                <div className="font-medium">Clientes Críticos</div>
                <div className="text-xs text-gray-500">Ver lista de alto risco</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => onNavigate('recommendations')}
            >
              <Target className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">Gerar Recomendações</div>
                <div className="text-xs text-gray-500">Para cliente específico</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => onNavigate('training')}
            >
              <Settings className="h-5 w-5 text-purple-500" />
              <div className="text-left">
                <div className="font-medium">Treinar Modelos</div>
                <div className="text-xs text-gray-500">Atualizar IA</div>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start gap-2"
              onClick={() => onNavigate('notifications')}
            >
              <Bell className="h-5 w-5" style={{ color: '#003153' }} />
              <div className="text-left">
                <div className="font-medium">Central de Alertas</div>
                <div className="text-xs text-gray-500">Ver notificações</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status dos Modelos */}
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Status dos Modelos de IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <div>
                  <div className="font-medium text-sm sm:text-base text-green-900">Recomendações</div>
                  <div className="text-xs sm:text-sm text-green-700">{dashboardData.resumo.recomendacoes.status}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">Churn</div>
                  <div className="text-sm text-red-700">{dashboardData.resumo.churnPrediction.status}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6" style={{ color: '#003153' }} />
                <div>
                  <div className="font-medium text-blue-900">Vendas</div>
                  <div className="text-sm text-blue-700">{dashboardData.resumo.salesPrediction.status}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
                <div>
                  <div className="font-medium text-purple-900">RFV</div>
                  <div className="text-sm text-purple-700">{dashboardData.resumo.rfvOptimization.status}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}