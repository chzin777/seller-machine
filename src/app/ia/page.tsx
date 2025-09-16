'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  Settings,
  Bell,
  Sparkles
} from 'lucide-react';

import AIDashboard from '@/components/AIDashboard';
import AIRecommendations from '@/components/AIRecommendations';
import AIChurnPrediction from '@/components/AIChurnPrediction';
import AICustomerInsights from '@/components/AICustomerInsights';
import AIClustering from '@/components/AIClustering';
import AISalesPrediction from '@/components/AISalesPrediction';
import AIModelTraining from '@/components/AIModelTraining';
import AINotifications from '@/components/AINotifications';

export default function IAPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sistema de Inteligência Artificial</h1>
            <p className="text-muted-foreground">
              Plataforma completa de Machine Learning para otimização de vendas e retenção de clientes
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            TensorFlow.js
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Recomendações</span>
          </TabsTrigger>
          <TabsTrigger value="churn" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Churn</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Insights</span>
          </TabsTrigger>
          <TabsTrigger value="clustering" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clustering</span>
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Vendas</span>
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Treinamento</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AIDashboard />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <AIRecommendations />
        </TabsContent>

        <TabsContent value="churn" className="space-y-6">
          <AIChurnPrediction />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AICustomerInsights />
        </TabsContent>

        <TabsContent value="clustering" className="space-y-6">
          <AIClustering />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <AISalesPrediction />
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <AIModelTraining />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <AINotifications />
        </TabsContent>
      </Tabs>

      {/* Informações do Sistema */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Sobre o Sistema de IA</span>
          </CardTitle>
          <CardDescription>
            Funcionalidades avançadas de Machine Learning disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-medium">Recomendações</h4>
                <p className="text-sm text-muted-foreground">Sistema inteligente baseado em associações</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div>
                <h4 className="font-medium">Predição de Churn</h4>
                <p className="text-sm text-muted-foreground">Identifica clientes em risco</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-medium">Predição de Vendas</h4>
                <p className="text-sm text-muted-foreground">Projeções futuras com IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <h4 className="font-medium">Clustering</h4>
                <p className="text-sm text-muted-foreground">Segmentação automática</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}