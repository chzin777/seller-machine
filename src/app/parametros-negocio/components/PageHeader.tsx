'use client';

import { Settings } from 'lucide-react';

interface PageHeaderProps {
  apiStatus: 'checking' | 'online' | 'offline';
}

export default function PageHeader({ apiStatus }: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parâmetros de Negócio</h1>
          <p className="text-gray-600">Configure filtros de inatividade e parâmetros RFV</p>
        </div>
      </div>
      
      {/* Status da API */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium">
        {apiStatus === 'checking' && (
          <>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span className="text-yellow-700">Verificando API...</span>
          </>
        )}
        {apiStatus === 'online' && (
          <>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700">API Externa Online</span>
          </>
        )}
        {apiStatus === 'offline' && (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-red-700">API Externa Offline (usando cache local)</span>
          </>
        )}
      </div>
    </div>
  );
}
