"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar se o usuário está logado
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (!user) {
          router.push('/login');
          return;
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="logo-loading">
          <img 
            src="/images/logo.png" 
            alt="Carregando" 
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#003153' }}>Dashboard</h1>
        <p style={{ color: 'rgba(0, 49, 83, 0.7)' }}>Visão geral dos seus indicadores de vendas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card de Receita Total */}
        <div className="bg-white rounded-lg shadow-md p-6" style={{ borderLeft: '4px solid #003153' }}>
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'rgba(0, 49, 83, 0.7)' }}>Receita Total</p>
              <p className="text-2xl font-bold" style={{ color: '#003153' }}>R$ 0,00</p>
            </div>
            <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(0, 49, 83, 0.1)' }}>
              <svg className="w-6 h-6" style={{ color: '#003153' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card de Vendas */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'rgba(0, 49, 83, 0.7)' }}>Total de Vendas</p>
              <p className="text-2xl font-bold" style={{ color: '#003153' }}>0</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card de Clientes */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'rgba(0, 49, 83, 0.7)' }}>Clientes Ativos</p>
              <p className="text-2xl font-bold" style={{ color: '#003153' }}>0</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card de Meta */}
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'rgba(0, 49, 83, 0.7)' }}>Meta do Mês</p>
              <p className="text-2xl font-bold" style={{ color: '#003153' }}>0%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#003153' }}>Vendas por Mês</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Gráfico de vendas será carregado aqui</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#003153' }}>Top Produtos</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <p>Lista de produtos mais vendidos será carregada aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
}