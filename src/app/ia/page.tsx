'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Settings,
  Bell,
  Sparkles,
  HelpCircle,
  Star
} from 'lucide-react';

import AIDashboard from '@/components/AIDashboard';
import AIOverviewDashboard from '@/components/AIOverviewDashboard';
import AIRecommendations from '@/components/AIRecommendations';
import AIChurnPrediction from '@/components/AIChurnPrediction';
import AICustomerInsights from '@/components/AICustomerInsights';
import AIClustering from '@/components/AIClustering';
import AISalesPrediction from '@/components/AISalesPrediction';
import AIModelTraining from '@/components/AIModelTraining';
import AINotifications from '@/components/AINotifications';
import AITourGuide from '@/components/AITourGuide';

export default function IAPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTour, setShowTour] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem('ai-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, []);

  // Função para toggle favoritos
  const toggleFavorite = (tab: string) => {
    const newFavorites = favorites.includes(tab)
      ? favorites.filter(f => f !== tab)
      : [...favorites, tab];
    
    setFavorites(newFavorites);
    localStorage.setItem('ai-favorites', JSON.stringify(newFavorites));
  };

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!user) {
          router.push("/login");
          return;
        }
        setIsAuthenticated(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de Navegação */}
      <div id="sidebar" className="w-64 bg-white shadow-lg flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">IA Sistema</h1>
              <p className="text-xs text-gray-500">Machine Learning</p>
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex-1 p-4 space-y-2">
          {/* Favoritos */}
          {favorites.length > 0 && (
            <div className="pb-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Favoritos</p>
              {favorites.map((fav) => {
                const favoriteItems = {
                  'churn': { icon: AlertTriangle, label: 'Predição de Churn', color: 'bg-red-50 text-red-700 border-l-4 border-red-500' },
                  'recommendations': { icon: Target, label: 'Recomendações', color: 'bg-green-50 text-green-700 border-l-4 border-green-500' },
                  'insights': { icon: Users, label: 'Insights', color: 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' },
                  'clustering': { icon: Users, label: 'Segmentação', color: 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' },
                  'sales': { icon: TrendingUp, label: 'Predição Vendas', color: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' },
                  'training': { icon: Settings, label: 'Treinamento', color: 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' }
                };
                
                const item = favoriteItems[fav as keyof typeof favoriteItems];
                if (!item) return null;
                
                const ItemIcon = item.icon;
                return (
                  <button
                    key={fav}
                    onClick={() => setActiveTab(fav)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === fav ? item.color : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <ItemIcon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    <Star className="h-3 w-3 text-yellow-500 ml-auto" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              activeTab === 'dashboard' 
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </button>

          {/* Análise de Clientes */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Análise de Clientes</p>
            <div className="relative group">
              <button
                id="churn-nav"
                onClick={() => setActiveTab('churn')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'churn' 
                    ? 'bg-red-50 text-red-700 border-l-4 border-red-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">Predição de Churn</span>
              </button>
              <button
                onClick={() => toggleFavorite('churn')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <Star className={`h-3 w-3 ${favorites.includes('churn') ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>
            
            <div className="relative group">
              <button
                id="insights-nav"
                onClick={() => setActiveTab('insights')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'insights' 
                    ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Insights do Cliente</span>
              </button>
              <button
                onClick={() => toggleFavorite('insights')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <Star className={`h-3 w-3 ${favorites.includes('insights') ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>
            
            <div className="relative group">
              <button
                id="clustering-nav"
                onClick={() => setActiveTab('clustering')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'clustering' 
                    ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-medium">Segmentação</span>
              </button>
              <button
                onClick={() => toggleFavorite('clustering')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <Star className={`h-3 w-3 ${favorites.includes('clustering') ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>

          {/* Recomendações e Vendas */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vendas & Marketing</p>
            <div className="relative group">
              <button
                id="recommendations-nav"
                onClick={() => setActiveTab('recommendations')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'recommendations' 
                    ? 'bg-green-50 text-green-700 border-l-4 border-green-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Target className="h-5 w-5" />
                <span className="font-medium">Recomendações</span>
              </button>
              <button
                onClick={() => toggleFavorite('recommendations')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <Star className={`h-3 w-3 ${favorites.includes('recommendations') ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>
            
            <div className="relative group">
              <button
                id="sales-nav"
                onClick={() => setActiveTab('sales')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'sales' 
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="font-medium">Predição de Vendas</span>
              </button>
              <button
                onClick={() => toggleFavorite('sales')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <Star className={`h-3 w-3 ${favorites.includes('sales') ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>
          </div>

          {/* Configurações */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configurações</p>
            <div className="relative group">
              <button
                id="training-nav"
                onClick={() => setActiveTab('training')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'training' 
                    ? 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="h-5 w-5" />
                <span className="font-medium">Treinamento IA</span>
              </button>
              <button
                onClick={() => toggleFavorite('training')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
              >
                <Star className={`h-3 w-3 ${favorites.includes('training') ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
              </button>
            </div>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                activeTab === 'notifications' 
                  ? 'bg-gray-50 text-gray-700 border-l-4 border-gray-500' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Bell className="h-5 w-5" />
              <span className="font-medium">Notificações</span>
            </button>
          </div>
        </div>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-center">
            <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              TensorFlow.js
            </Badge>
          </div>
        </div>
      </div>

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Principal */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'dashboard' && 'Dashboard de IA'}
                {activeTab === 'churn' && 'Predição de Churn'}
                {activeTab === 'insights' && 'Insights do Cliente'}
                {activeTab === 'clustering' && 'Segmentação de Clientes'}
                {activeTab === 'recommendations' && 'Recomendações IA'}
                {activeTab === 'sales' && 'Predição de Vendas'}
                {activeTab === 'training' && 'Treinamento de Modelos'}
                {activeTab === 'notifications' && 'Central de Notificações'}
              </h1>
              <p className="text-gray-600 mt-1">
                {activeTab === 'dashboard' && 'Visão geral de todas as funcionalidades de IA'}
                {activeTab === 'churn' && 'Identifique clientes em risco de cancelamento'}
                {activeTab === 'insights' && 'Análise detalhada do comportamento dos clientes'}
                {activeTab === 'clustering' && 'Segmentação automática com machine learning'}
                {activeTab === 'recommendations' && 'Sistema inteligente de recomendação de produtos'}
                {activeTab === 'sales' && 'Previsões de vendas baseadas em IA'}
                {activeTab === 'training' && 'Gerencie e treine os modelos de machine learning'}
                {activeTab === 'notifications' && 'Alertas e notificações inteligentes'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTour(true)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Tour Guiado
            </Button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6">
            {activeTab === 'dashboard' && <AIOverviewDashboard onNavigate={setActiveTab} />}
            {activeTab === 'recommendations' && <AIRecommendations />}
            {activeTab === 'churn' && <AIChurnPrediction />}
            {activeTab === 'insights' && <AICustomerInsights />}
            {activeTab === 'clustering' && <AIClustering />}
            {activeTab === 'sales' && <AISalesPrediction />}
            {activeTab === 'training' && <AIModelTraining />}
            {activeTab === 'notifications' && <AINotifications />}
          </div>
        </div>
      </div>

      {/* Tour Guide */}
      <AITourGuide 
        isOpen={showTour} 
        onClose={() => setShowTour(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}