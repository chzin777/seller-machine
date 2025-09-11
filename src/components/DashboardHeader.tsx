"use client";

import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <div className="flex items-center gap-3 mb-6 sm:mb-8 px-6 sm:px-8 lg:px-12 xl:px-16">
      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow flex-shrink-0">
        <LayoutDashboard className="w-5 h-5 sm:w-7 sm:h-7" />
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate pt-12">Painel Comercial</h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">
          Indicadores, gráficos e clientes da plataforma.
        </p>
      </div>
    </div>
  );
}
