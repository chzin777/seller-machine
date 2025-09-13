"use client";

import { useData } from '../../components/DataProvider';
import MapaCalorVendas from '../../components/MapaCalorVendas';
import { Map } from 'lucide-react';
import { SkeletonLoader } from '../../components/LoadingSpinner';

export default function MapaCalorPage() {
  const data = useData();

  return (
    <main className="max-w-7xl mx-auto py-6 px-3 sm:px-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 shadow flex-shrink-0">
          <Map className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate text-[#1e3a8a]">
            Mapa de Calor de Vendas
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">
            Visualize a distribuição geográfica das suas vendas em tempo real
          </p>
        </div>
      </div>

      {/* Componente do mapa de calor */}
      {data.loading ? (
        <SkeletonLoader />
      ) : (
        <MapaCalorVendas vendasPorFilial={data.vendasPorFilial} />
      )}
    </main>
  );
}
