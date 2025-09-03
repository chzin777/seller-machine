
  "use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutDashboard } from 'lucide-react';
import GenericTiltedCard from "../blocks/Components/GenericTiltedCard/GenericTiltedCard";
import { useData } from "../components/DataProvider";

// Skeleton simples
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />;
}

export default function Home() {
  const router = useRouter();
  const data = useData();

  // Verificar autenticação
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!user) {
        router.replace("/login");
      }
    }
  }, [router]);

  if (data.loading) {
    return (
      <div className="flex justify-center items-center h-96 text-xl">Carregando dados...</div>
    );
  }
  
  if (data.error) {
    return (
      <div className="flex justify-center items-center h-96 text-xl text-red-600">{data.error}</div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden">
      {/* Conteúdo principal */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8 px-3 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow flex-shrink-0">
          <LayoutDashboard className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate pt-12">Painel Comercial</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">Indicadores, gráficos e clientes da plataforma.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 px-3 sm:px-6 overflow-x-hidden">
        {/* Linha de cards Receita Total, Ticket Médio, Itens Vendidos, Clientes Ativos e Inativos */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5 w-full min-w-0">
          {/* Receita Total */}
          <GenericTiltedCard className="col-span-1">
            <Card className="shadow-lg border border-green-200/60 bg-white h-full kpi-container">
              <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
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
          {/* Ticket Médio por NF */}
          <GenericTiltedCard className="col-span-1">
            <Card className="shadow-lg border border-yellow-200/60 bg-white h-full kpi-container">
              <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-yellow-700 leading-tight w-full text-center">Ticket Médio por NF</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-yellow-700 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                  {data.ticketMedio !== null ? `R$ ${formatCompact(data.ticketMedio)}` : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>
          {/* Itens Vendidos */}
          <GenericTiltedCard className="col-span-1">
            <Card className="shadow-lg border border-indigo-200/60 bg-white h-full kpi-container">
              <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
                <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-indigo-800 leading-tight w-full text-center">Itens Vendidos</CardTitle>
              </CardHeader>
              <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
                <div className="font-extrabold tracking-tight text-indigo-800 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                  {data.itensVendidos !== null ? formatCompact(data.itensVendidos) : '--'}
                </div>
              </CardContent>
            </Card>
          </GenericTiltedCard>
          {/* Clientes Ativos */}
          <GenericTiltedCard className="col-span-1">
            <Card className="shadow-lg border border-blue-200/60 bg-white h-full kpi-container">
              <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
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
          <GenericTiltedCard className="col-span-1">
            <Card className="shadow-lg border border-red-200/60 bg-white h-full kpi-container">
              <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
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

        {/* Linha de gráficos Receita Mensal e Vendas por Filial */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 w-full min-w-0">
          {/* Gráfico Receita Mensal */}
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
                        Receita Mensal {data.receitaMensal?.ano ? `(${data.receitaMensal.ano})` : ''}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">Evolução da receita ao longo do ano</p>
                    </div>
                  </div>
                  {/* Indicador de tendência */}
                  {data.receitaMensal?.receitaPorMes && Object.values(data.receitaMensal.receitaPorMes).length > 1 && (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 self-start">
                      {(() => {
                        const valores = Object.values(data.receitaMensal.receitaPorMes) as number[];
                        const ultimoMes = valores[valores.length - 1];
                        const penultimoMes = valores[valores.length - 2];
                        const tendencia = ultimoMes > penultimoMes;
                        const percentual = penultimoMes > 0 ? ((ultimoMes - penultimoMes) / penultimoMes * 100) : 0;
                        return (
                          <>
                            {tendencia ? (
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                              </svg>
                            )}
                            <span className={`text-xs font-semibold ${tendencia ? 'text-emerald-700' : 'text-red-600'}`}>
                              {Math.abs(percentual).toFixed(1)}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="h-64 sm:h-80 w-full chart-container">
                  {data.receitaMensal?.receitaPorMes && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={Object.entries(data.receitaMensal.receitaPorMes).map(([mes, valor]) => ({ mes: abreviarMes(mes), valor }))}
                        margin={{ top: 20, right: 15, left: 10, bottom: 40 }}
                      >
                        <defs>
                          <linearGradient id="receita-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0.7} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          stroke="#e5e7eb" 
                          strokeDasharray="3 3"
                          vertical={false}
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="mes" 
                          tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                          interval={0}
                        />
                        <YAxis 
                          tickFormatter={(v) => `R$ ${formatCompact(v)}`} 
                          tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                          tickLine={false}
                          axisLine={false}
                          dx={-5}
                          width={50}
                        />
                        <Tooltip 
                          formatter={(v: number) => [`R$ ${formatCompact(v)}`, 'Receita']}
                          labelStyle={{ 
                            color: '#1f2937', 
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            color: '#374151',
                            fontSize: '13px'
                          }}
                          itemStyle={{
                            color: '#374151'
                          }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Bar 
                          dataKey="valor" 
                          fill="url(#receita-gradient)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={45}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {!data.receitaMensal?.receitaPorMes && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">Nenhum dado disponível</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">Os dados de receita serão exibidos aqui</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Gráfico Vendas x Receita */}
          <div className="w-full min-w-0">
            <Card className="shadow-xl border border-blue-200/30 bg-white rounded-2xl overflow-hidden h-full">
              <div className="p-4 sm:p-6 border-b border-blue-200/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-blue-800 truncate">
                        Vendas x Receita
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Performance por filial</p>
                    </div>
                  </div>
                  {/* Total de filiais */}
                  {data.vendasPorFilial.length > 0 && (
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-blue-50 border border-blue-200 self-start">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-xs font-semibold text-blue-700">
                        {data.vendasPorFilial.length} {data.vendasPorFilial.length === 1 ? 'Filial' : 'Filiais'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="h-64 sm:h-80 w-full chart-container">
                  {data.vendasPorFilial.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={data.vendasPorFilial.map((f) => ({
                          filial: extrairSegundoNome(f.filial?.nome || ''),
                          receita: Number(f.receitaTotal),
                          quantidadeNotas: f.quantidadeNotas
                        }))}
                        margin={{ top: 20, right: 15, left: 10, bottom: 40 }}
                      >
                        <defs>
                          <linearGradient id="receita-filial-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="rgb(5, 150, 105)" stopOpacity={0.7} />
                          </linearGradient>
                          <linearGradient id="notas-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity={0.7} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid 
                          stroke="#e5e7eb" 
                          strokeDasharray="3 3"
                          vertical={false}
                          opacity={0.3}
                        />
                        <XAxis 
                          dataKey="filial" 
                          tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                          tickLine={false}
                          axisLine={false}
                          dy={10}
                          interval={0}
                        />
                        <YAxis
                          yAxisId="left"
                          tick={{ fontSize: 12, fill: '#059669', fontWeight: '500' }}
                          tickFormatter={(v) => `R$ ${formatCompact(v)}`}
                          tickLine={false}
                          axisLine={false}
                          dx={-5}
                          width={50}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          tick={{ fontSize: 12, fill: '#2563eb', fontWeight: '500' }}
                          tickFormatter={(v) => `${formatCompact(v)}`}
                          tickLine={false}
                          axisLine={false}
                          dx={5}
                          width={50}
                        />
                        <Tooltip 
                          formatter={(v: number, name: string) => {
                            if (name === 'Receita') return [`R$ ${formatCompact(v)}`, 'Receita'];
                            if (name === 'Notas Fiscais') return [`${formatCompact(v)} Notas`, 'Notas Fiscais'];
                            return v;
                          }}
                          labelStyle={{ 
                            color: '#1f2937', 
                            fontWeight: '600',
                            fontSize: '14px'
                          }}
                          contentStyle={{ 
                            backgroundColor: '#ffffff', 
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                            color: '#374151',
                            fontSize: '13px'
                          }}
                          itemStyle={{
                            color: '#374151'
                          }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Bar
                          yAxisId="right"
                          dataKey="quantidadeNotas"
                          fill="url(#notas-gradient)"
                          name="Notas Fiscais"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={35}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="receita"
                          fill="url(#receita-filial-gradient)"
                          name="Receita"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={35}
                        />
                        <Legend 
                          wrapperStyle={{ 
                            paddingTop: '15px',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#000000'
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {data.vendasPorFilial.length === 0 && (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">Nenhum dado disponível</p>
                        <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">Os dados de vendas serão exibidos aqui</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Gráfico Receita por Tipo de Produto */}
        <div className="w-full min-w-0">
          <Card className="shadow-xl border border-violet-200/30 bg-white rounded-2xl overflow-hidden h-full">
            <div className="p-4 sm:p-6 border-b border-violet-200/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-violet-800 truncate">
                      Receita por Tipo de Produto
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Distribuição de vendas por categoria</p>
                  </div>
                </div>
                {/* Total de categorias */}
                {data.receitaPorTipo.length > 0 && (
                  <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-700 self-start">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-xs font-semibold text-violet-700">
                      {data.receitaPorTipo.length} {data.receitaPorTipo.length === 1 ? 'Categoria' : 'Categorias'}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80 flex items-center justify-center chart-container">
                {data.receitaPorTipo.length > 0 && (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={data.receitaPorTipo}
                      layout="vertical"
                      margin={{ top: 20, right: 40, left: 80, bottom: 20 }}
                      barCategoryGap={20}
                    >
                      <defs>
                        <linearGradient id="tipo-produto-gradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        stroke="#e5e7eb" 
                        strokeDasharray="3 3"
                        horizontal={false}
                        opacity={0.3}
                      />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `R$ ${formatCompact(v)}`}
                        tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        dataKey="tipo"
                        type="category"
                        tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '600' }}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <Tooltip 
                        formatter={(v: number) => [`R$ ${formatCompact(v)}`, 'Receita']}
                        labelStyle={{ 
                          color: '#1f2937', 
                          fontWeight: '600',
                          fontSize: '14px'
                        }}
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          color: '#374151',
                          fontSize: '13px'
                        }}
                        itemStyle={{
                          color: '#374151'
                        }}
                        cursor={{ fill: 'rgba(139, 92, 246, 0.05)' }}
                      />
                      <Bar 
                        dataKey="receita" 
                        radius={8} 
                        fill="url(#tipo-produto-gradient)" 
                        barSize={32} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {data.receitaPorTipo.length === 0 && (
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">Nenhum dado disponível</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">Os dados por categoria serão exibidos aqui</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}


// Função para abreviar nomes de meses em português
function abreviarMes(mes: string) {
  const mapa: Record<string, string> = {
    'Janeiro': 'Jan',
    'Fevereiro': 'Fev',
    'Março': 'Mar',
    'Abril': 'Abr',
    'Maio': 'Mai',
    'Junho': 'Jun',
    'Julho': 'Jul',
    'Agosto': 'Ago',
    'Setembro': 'Set',
    'Outubro': 'Out',
    'Novembro': 'Nov',
    'Dezembro': 'Dez',
  };
  return mapa[mes] || mes;
}

// Função para extrair o segundo nome (cidade) da filial
function extrairSegundoNome(nome: string) {
  const partes = nome.trim().split(' ');
  return partes.length > 1 ? partes[1] : nome;
}

// Label customizado para PieChart, afasta cada texto de acordo com o índice
//
function formatCompact(value: number) {
  if (value === null || value === undefined) return '';
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    let v = (value / 1e9).toFixed(2).replace('.', ',');
    v = v.replace(/,00$/, '');
    v = v.replace(/,0$/, '');
    return v + 'B';
  }
  if (abs >= 1e6) {
    let v = (value / 1e6).toFixed(2).replace('.', ',');
    v = v.replace(/,00$/, '');
    v = v.replace(/,0$/, '');
    return v + 'M';
  }
  if (abs >= 1e3) {
    let v = (value / 1e3).toFixed(1).replace('.', ',');
    v = v.replace(/,0$/, '');
    return v + 'K';
  }
  // Para valores menores que 1.000, remover zeros desnecessários após a vírgula
  let v = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  v = v.replace(/,00$/, '');
  v = v.replace(/,0$/, '');
  return v;
}