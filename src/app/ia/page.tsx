'use client';

import './ai-custom.css';
import AIContent from '@/components/AIContent';
import AITourGuide from '@/components/AITourGuide';
import { useAIPage } from '@/hooks/useAIPage';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  Brain, 
  BarChart3, 
  AlertTriangle, 
  Users, 
  Target, 
  TrendingUp, 
  Settings, 
  Bell,
  Star,
  HelpCircle,
  Sparkles,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function IAPage() {
  const {
    loading,
    activeTab,
    setActiveTab,
    showTour,
    setShowTour,
    favorites,
    toggleFavorite
  } = useAIPage();

  // Configuração dos tabs de navegação
  const navigationTabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      color: 'text-[#003153]',
      description: 'Visão geral'
    },
    { 
      id: 'churn', 
      label: 'Churn', 
      icon: AlertTriangle, 
      color: 'text-red-600',
      description: 'Predição de abandono'
    },
    { 
      id: 'insights', 
      label: 'Insights', 
      icon: Users, 
      color: 'text-purple-600',
      description: 'Análise de clientes'
    },
    { 
      id: 'clustering', 
      label: 'Segmentação', 
      icon: Users, 
      color: 'text-indigo-600',
      description: 'Grupos inteligentes'
    },
    { 
      id: 'recommendations', 
      label: 'Recomendações', 
      icon: Target, 
      color: 'text-green-600',
      description: 'Sugestões IA'
    },
    { 
      id: 'sales', 
      label: 'Vendas', 
      icon: TrendingUp, 
      color: 'text-[#003153]',
      description: 'Predição de vendas'
    },
    { 
      id: 'training', 
      label: 'Treinamento', 
      icon: Settings, 
      color: 'text-yellow-600',
      description: 'Modelos IA'
    },
    { 
      id: 'users', 
      label: 'Usuários', 
      icon: UserPlus, 
      color: 'text-orange-600',
      description: 'Gerenciar usuários'
    },
    { 
      id: 'notifications', 
      label: 'Notificações', 
      icon: Bell, 
      color: 'text-gray-600',
      description: 'Central de alertas'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner text="Carregando IA..." />
          <p className="text-gray-600">Carregando IA Sistema...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Principal com Branding IA */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Header */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg shadow-lg" style={{ background: 'linear-gradient(135deg, #003153 0%, #4c1d95 100%)' }}>
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#003153' }}>IA Sistema</h1>
                <p className="text-sm text-gray-600 hidden sm:block">Inteligência Artificial para Vendas</p>
              </div>
              <Badge className="text-white" style={{ background: 'linear-gradient(135deg, #003153 0%, #7c3aed 100%)' }}>
                <Sparkles className="h-3 w-3 mr-1" />
                TensorFlow.js
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTour(true)}
                className="tour-button flex items-center space-x-2 border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ 
                  '--tw-ring-color': '#003153',
                  ':hover': { 
                    borderColor: '#003153', 
                    color: '#003153'
                  }
                } as any}
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tour Guiado</span>
                <span className="sm:hidden">Tour</span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200 relative">
            <nav className="-mb-px flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide tab-navigation py-2 relative">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isFavorite = favorites.includes(tab.id);
                
                return (
                  <button
                    key={tab.id}
                    id={`${tab.id}-nav`} // Para o tour guide
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      nav-tab-button group relative flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-sm
                      transition-all duration-200 whitespace-nowrap flex-shrink-0 ai-transition tab-hover
                      ${isActive 
                        ? 'shadow-md border-2' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
                      }
                    `}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(0, 49, 83, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)',
                      color: '#003153',
                      borderColor: 'rgba(0, 49, 83, 0.2)'
                    } : {}}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? tab.color : 'text-gray-400 group-hover:text-gray-600'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-xs">{tab.label.slice(0, 4)}</span>
                    
                    {/* Favorite Star */}
                    {isFavorite && (
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    )}
                    
                    {/* Tooltip para mobile */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap sm:hidden z-50">
                      {tab.description}
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-0.5 rounded-full" 
                        style={{ background: 'linear-gradient(135deg, #003153 0%, #7c3aed 100%)' }}
                      ></div>
                    )}
                  </button>
                );
              })}
              
              {/* Fade indicator for scroll */}
              <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white via-white to-transparent pointer-events-none sm:hidden"></div>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AIContent
          activeTab={activeTab}
          onNavigate={setActiveTab}
        />
      </main>

      {/* Tour Guide */}
      <AITourGuide 
        isOpen={showTour} 
        onClose={() => setShowTour(false)}
        onNavigate={setActiveTab}
      />
    </div>
  );
}