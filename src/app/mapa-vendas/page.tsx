"use client";

import { useData } from '../../components/DataProvider';
import MapaCalorVendas from '../../components/MapaCalorVendas';
import { Map } from 'lucide-react';

export default function MapaCalorPage() {
  const data = useData();

  return (
    <main className="max-w-7xl mx-auto py-6 px-3 sm:px-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow flex-shrink-0">
          <Map className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate text-blue-900 dark:text-blue-200">
            Mapa de Calor de Vendas
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">
            Visualize a distribuição geográfica das suas vendas em tempo real
          </p>
        </div>
      </div>

      {/* Componente do mapa de calor */}
      {data.loading ? (
        <div className="space-y-6">
          {/* Skeleton para cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
                  <div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skeleton para o mapa */}
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl p-6">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          </div>

          {/* Skeleton para a tabela */}
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-lg p-6">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <MapaCalorVendas vendasPorFilial={data.vendasPorFilial} />
      )}
    </main>
  );
}
