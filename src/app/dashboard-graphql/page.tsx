"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutDashboard, Database, Wifi, WifiOff } from 'lucide-react';
import GenericTiltedCard from "../../blocks/Components/GenericTiltedCard";
import { GraphQLDataProvider, useGraphQLData } from "../../components/GraphQLDataProvider";

// Skeleton simples
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />;
}

// Componente de status de conexão GraphQL
function GraphQLStatus() {
  const { loading, error } = useGraphQLData();
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
      <Database className="w-4 h-4" />
      <span className="text-sm font-medium">GraphQL</span>
      {loading ? (
        <div className="flex items-center gap-1 text-yellow-600">
          <Wifi className="w-4 h-4 animate-pulse" />
          <span className="text-xs">Carregando...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-1 text-red-600">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs">Erro</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-green-600">
          <Wifi className="w-4 h-4" />
          <span className="text-xs">Conectado</span>
        </div>
      )}
    </div>
  );
}

// Componente principal do dashboard
function DashboardContent() {
  const router = useRouter();
  const data = useGraphQLData();

  // Verificar autenticação
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!user) {
        router.replace("/login");
      }
    }
  }, [router]);

  // Função para formatar números de forma compacta
  function formatCompact(value: number) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString('pt-BR');
  }

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-96 text-xl">Carregando dados via GraphQL...</div>
    );
  }
  
  if (data.error) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-xl text-red-600 gap-4">
        <div>Erro ao carregar dados via GraphQL:</div>
        <div className="text-sm text-gray-600">{data.error}</div>
        <button 
          onClick={data.refetch}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Header com status GraphQL */}
      <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8 px-3 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow flex-shrink-0">
            <LayoutDashboard className="w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate pt-12">Dashboard GraphQL</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">Dados em tempo real via GraphQL</p>
          </div>
        </div>
        <GraphQLStatus />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 px-3 sm:px-6 overflow-x-hidden">
        {/* Cards de KPIs */}
  <div className="kpi-grid grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3 sm:gap-5 w-full min-w-0 auto-rows-fr">
          {/* Receita Total */}
          <GenericTiltedCard className="col-span-1 kpi-card-wrapper">
            <Card className="shadow-lg border border-green-200/60 bg-white h-full kpi-container kpi-uniform">
              <CardHeader className="kpi-header flex flex-row items-center pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-green-800 leading-tight w-full text-center">Receita Total</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-green-800 flex items-center gap-1 sm:gap-2 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                  {data.loading ? (
                    <Skeleton className="h-8 sm:h-10 w-24 sm:w-32" />
                  ) : data.receitaTotal !== null ? (
                    <><span className="text-[0.8em] flex-shrink-0">R$</span><span className="break-all">{formatCompact(data.receitaTotal)}</span></>
                  ) : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>

          {/* Ticket Médio */}
          <GenericTiltedCard className="col-span-1 kpi-card-wrapper">
            <Card className="shadow-lg border border-yellow-200/60 bg-white h-full kpi-container kpi-uniform">
              <CardHeader className="kpi-header flex flex-row items-center pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-yellow-700 leading-tight w-full text-center">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-yellow-700 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                  {data.ticketMedio !== null ? `R$ ${formatCompact(data.ticketMedio)}` : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>

          {/* Produtos Cadastrados */}
          <GenericTiltedCard className="col-span-1 kpi-card-wrapper">
            <Card className="shadow-lg border border-indigo-200/60 bg-white h-full kpi-container kpi-uniform">
              <CardHeader className="kpi-header flex flex-row items-center pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-indigo-800 leading-tight w-full text-center">Produtos</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-indigo-800 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                  {data.itensVendidos !== null ? formatCompact(data.itensVendidos) : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>

          {/* Clientes Ativos */}
          <GenericTiltedCard className="col-span-1 kpi-card-wrapper">
            <Card className="shadow-lg border border-blue-200/60 bg-white h-full kpi-container kpi-uniform">
              <CardHeader className="kpi-header flex flex-row items-center pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-blue-800 leading-tight w-full text-center">Clientes Ativos</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-blue-800 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                  {data.clientesAtivos !== null ? formatCompact(data.clientesAtivos) : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>

          {/* Clientes Inativos */}
          <GenericTiltedCard className="col-span-1 kpi-card-wrapper">
            <Card className="shadow-lg border border-red-200/60 bg-white h-full kpi-container kpi-uniform">
              <CardHeader className="kpi-header flex flex-row items-center pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-red-800 leading-tight w-full text-center">Clientes Inativos</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-red-800 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center flex items-center justify-center w-full">
                  {data.clientesInativos !== null ? formatCompact(data.clientesInativos) : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>
        </div>

        {/* Gráfico de Receita Mensal */}
        {data.receitaMensal && (
          <div className="w-full min-w-0">
            <Card className="shadow-xl border border-emerald-200/30 bg-white rounded-2xl overflow-hidden h-full">
              <div className="p-4 sm:p-6 border-b border-emerald-200/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-emerald-800 truncate">
                        Receita Mensal ({data.receitaMensal.ano}) - GraphQL
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">Dados em tempo real via GraphQL</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(data.receitaMensal.receitaPorMes).map(([mes, valor]) => ({ mes, valor }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" stroke="#666" fontSize={12} />
                      <YAxis stroke="#666" fontSize={12} tickFormatter={(value) => `R$ ${formatCompact(value)}`} />
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita']}
                        labelStyle={{ color: '#333' }}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '8px' }}
                      />
                      <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Botão para refetch */}
        <div className="flex justify-center">
          <button 
            onClick={data.refetch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Atualizar Dados GraphQL
          </button>
        </div>
      </div>
    </div>
  );
}

// Página principal com provider
export default function GraphQLDashboard() {
  return (
    <GraphQLDataProvider>
      <DashboardContent />
    </GraphQLDataProvider>
  );
}