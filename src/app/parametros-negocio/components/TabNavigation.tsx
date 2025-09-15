'use client';

import { Clock, BarChart3, Settings } from 'lucide-react';

interface TabNavigationProps {
  activeTab: 'inatividade' | 'rfv' | 'existentes';
  setActiveTab: (tab: 'inatividade' | 'rfv' | 'existentes') => void;
}

export default function TabNavigation({ activeTab, setActiveTab }: TabNavigationProps) {
  const tabs = [
    {
      id: 'inatividade' as const,
      label: 'Filtros de Inatividade',
      icon: Clock,
      description: 'Configure parâmetros de inatividade'
    },
    {
      id: 'rfv' as const,
      label: 'Parâmetros RFV',
      icon: BarChart3,
      description: 'Defina regras de Recência, Frequência e Valor'
    },
    {
      id: 'existentes' as const,
      label: 'Configurações Existentes',
      icon: Settings,
      description: 'Visualize e gerencie configurações'
    }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
