'use client';

import { Star, Brain, BarChart3, AlertTriangle, Users, Target, TrendingUp, Settings, Bell, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './ui/badge';

interface AISidebarProps {
  activeTab: string;
  favorites: string[];
  collapsed: boolean;
  onTabChange: (tab: string) => void;
  onToggleFavorite: (tab: string) => void;
  onToggleCollapse: () => void;
}

export default function AISidebar({ activeTab, favorites, collapsed, onTabChange, onToggleFavorite, onToggleCollapse }: AISidebarProps) {
  const favoriteItems = {
    'churn': { icon: AlertTriangle, label: 'Predição de Churn', color: 'bg-red-50 text-red-700 border-l-4 border-red-500' },
    'recommendations': { icon: Target, label: 'Recomendações', color: 'bg-green-50 text-green-700 border-l-4 border-green-500' },
    'insights': { icon: Users, label: 'Insights', color: 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' },
    'clustering': { icon: Users, label: 'Segmentação', color: 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500' },
    'sales': { icon: TrendingUp, label: 'Predição Vendas', color: 'bg-blue-50 text-blue-700 border-l-4 border-blue-500' },
    'training': { icon: Settings, label: 'Treinamento', color: 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500' }
  };

  const NavigationItem = ({ 
    id, 
    icon: Icon, 
    label, 
    tabName, 
    color, 
    showFavorite = false 
  }: {
    id?: string;
    icon: any;
    label: string;
    tabName: string;
    color: string;
    showFavorite?: boolean;
  }) => (
    <div className="relative group">
      <button
        id={id}
        onClick={() => onTabChange(tabName)}
        className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 hover:cursor-pointer ${
          collapsed ? 'justify-center' : 'space-x-3'
        } ${
          activeTab === tabName ? color : 'text-gray-700 hover:bg-gray-50'
        }`}
        title={collapsed ? label : ''}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="font-medium">{label}</span>
            {favorites.includes(tabName) && !showFavorite && (
              <Star className="h-3 w-3 text-yellow-500 ml-auto" />
            )}
          </>
        )}
      </button>
      {showFavorite && !collapsed && (
        <button
          onClick={() => onToggleFavorite(tabName)}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 hover:cursor-pointer rounded"
        >
          <Star className={`h-3 w-3 ${favorites.includes(tabName) ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
        </button>
      )}
      {/* Tooltip para modo colapsado */}
      {collapsed && (
        <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
          {label}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`
      bg-white shadow-lg flex flex-col transition-all duration-300 relative z-50
      ${collapsed 
        ? 'w-16' 
        : 'w-64'
      }
      h-full
    `}>
      {/* Borda lateral sutil para modo colapsado */}
      {collapsed && (
        <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-blue-500 opacity-30"></div>
      )}
      
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'}`}>
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">IA Sistema</h1>
              <p className="text-xs text-gray-500">Machine Learning</p>
            </div>
          )}
        </div>
        
        {/* Botão de colapsar - Design elegante */}
        <div className={`mt-4 relative ${collapsed ? 'flex justify-center' : ''}`}>
          <button
            onClick={onToggleCollapse}
            className={`
              group relative bg-blue-600 hover:bg-blue-700 text-white 
              rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
              hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 
              focus:ring-blue-500 focus:ring-offset-2 hover:cursor-pointer
              ${collapsed ? 'p-2' : 'w-full p-3'}
            `}
            title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="relative">
                {collapsed ? (
                  <>
                    <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    {/* Indicator dots para modo colapsado */}
                    <div className="absolute -right-1 -top-1 flex space-x-0.5">
                      <div className="w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"></div>
                      <div className="w-1 h-1 bg-white rounded-full opacity-40 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-1 h-1 bg-white rounded-full opacity-20 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </>
                ) : (
                  <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                )}
              </div>
              {!collapsed && (
                <span className="text-sm font-medium">
                  Colapsar Menu
                </span>
              )}
            </div>
            
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
          
          {/* Tooltip aprimorado para modo colapsado */}
          {collapsed && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-xl">
              Expandir Menu
              <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div className="flex-1 p-4 space-y-2">
        {/* Favoritos */}
        {favorites.length > 0 && !collapsed && (
          <div className="pb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Favoritos</p>
            {favorites.map((fav) => {
              const item = favoriteItems[fav as keyof typeof favoriteItems];
              if (!item) return null;
              
              const ItemIcon = item.icon;
              return (
                <button
                  key={fav}
                  onClick={() => onTabChange(fav)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 hover:cursor-pointer ${
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
        <NavigationItem
          icon={BarChart3}
          label="Dashboard"
          tabName="dashboard"
          color="bg-blue-50 text-blue-700 border-l-4 border-blue-500"
        />

        {/* Análise de Clientes */}
        <div className="pt-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Análise de Clientes</p>
          )}
          <NavigationItem
            id="churn-nav"
            icon={AlertTriangle}
            label="Predição de Churn"
            tabName="churn"
            color="bg-red-50 text-red-700 border-l-4 border-red-500"
            showFavorite={true}
          />
          <NavigationItem
            id="insights-nav"
            icon={Users}
            label="Insights do Cliente"
            tabName="insights"
            color="bg-purple-50 text-purple-700 border-l-4 border-purple-500"
            showFavorite={true}
          />
          <NavigationItem
            id="clustering-nav"
            icon={Users}
            label="Segmentação"
            tabName="clustering"
            color="bg-indigo-50 text-indigo-700 border-l-4 border-indigo-500"
            showFavorite={true}
          />
        </div>

        {/* Recomendações e Vendas */}
        <div className="pt-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Vendas & Marketing</p>
          )}
          <NavigationItem
            id="recommendations-nav"
            icon={Target}
            label="Recomendações"
            tabName="recommendations"
            color="bg-green-50 text-green-700 border-l-4 border-green-500"
            showFavorite={true}
          />
          <NavigationItem
            id="sales-nav"
            icon={TrendingUp}
            label="Predição de Vendas"
            tabName="sales"
            color="bg-blue-50 text-blue-700 border-l-4 border-blue-500"
            showFavorite={true}
          />
        </div>

        {/* Configurações */}
        <div className="pt-4">
          {!collapsed && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Configurações</p>
          )}
          <NavigationItem
            id="training-nav"
            icon={Settings}
            label="Treinamento IA"
            tabName="training"
            color="bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500"
            showFavorite={true}
          />
          <NavigationItem
            icon={Bell}
            label="Notificações"
            tabName="notifications"
            color="bg-gray-50 text-gray-700 border-l-4 border-gray-500"
          />
        </div>
      </div>

      {/* Footer da Sidebar */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-center">
          {collapsed ? (
            <div className="p-2 bg-blue-600 rounded-lg" title="TensorFlow.js">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          ) : (
            <Badge variant="secondary" className="bg-blue-600 text-white">
              <Sparkles className="h-3 w-3 mr-1" />
              TensorFlow.js
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}