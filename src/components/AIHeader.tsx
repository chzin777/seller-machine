'use client';

import { Button } from './ui/button';
import { HelpCircle } from 'lucide-react';

interface AIHeaderProps {
  activeTab: string;
  onShowTour: () => void;
}

export default function AIHeader({ activeTab, onShowTour }: AIHeaderProps) {
  const getTabInfo = (tab: string) => {
    const tabInfoMap = {
      dashboard: {
        title: 'Dashboard de IA',
        description: 'Visão geral de todas as funcionalidades de IA'
      },
      churn: {
        title: 'Predição de Churn',
        description: 'Identifique clientes em risco de cancelamento'
      },
      insights: {
        title: 'Insights do Cliente',
        description: 'Análise detalhada do comportamento dos clientes'
      },
      clustering: {
        title: 'Segmentação de Clientes',
        description: 'Segmentação automática com machine learning'
      },
      recommendations: {
        title: 'Recomendações IA',
        description: 'Sistema inteligente de recomendação de produtos'
      },
      sales: {
        title: 'Predição de Vendas',
        description: 'Previsões de vendas baseadas em IA'
      },
      training: {
        title: 'Treinamento de Modelos',
        description: 'Gerencie e treine os modelos de machine learning'
      },
      notifications: {
        title: 'Central de Notificações',
        description: 'Alertas e notificações inteligentes'
      }
    };

    return tabInfoMap[tab as keyof typeof tabInfoMap] || {
      title: 'IA Sistema',
      description: 'Funcionalidades de inteligência artificial'
    };
  };

  const { title, description } = getTabInfo(activeTab);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-3 sm:p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">{title}</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base hidden sm:block">{description}</p>
          {/* Versão móvel da descrição mais compacta */}
          <p className="text-gray-500 mt-1 text-xs block sm:hidden truncate">{description}</p>
        </div>
      <div className="flex items-center gap-2 sm:gap-3 ml-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onShowTour}
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
        >
          <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Tour Guiado</span>
          <span className="sm:hidden">Tour</span>
        </Button>
      </div>
      </div>
    </div>
  );
}