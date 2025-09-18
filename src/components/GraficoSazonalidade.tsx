"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { useData } from './DataProvider';

// Função para formatar números de forma compacta
function formatCompact(value: number) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + 'B';
  if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M';
  if (value >= 1e3) return (value / 1e3).toFixed(1) + 'K';
  return value.toString();
}

// Função para calcular a sazonalidade baseada nos dados históricos
function calcularSazonalidade(receitaMensal: any) {
  if (!receitaMensal?.receitaPorMes) return [];

  console.log('🔍 Dados receitaMensal:', receitaMensal);

  const mesesOrdem = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const mesesAbrev = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ];

  // Processar dados do ano atual
  const dadosAtuais = receitaMensal.receitaPorMes;
  console.log('📊 Dados por mês:', dadosAtuais);
  
  const sazonalidade = mesesOrdem.map((mes, index) => {
    const valorMes = Number(dadosAtuais[mes]) || 0;
    console.log(`${mes}: ${valorMes}`);
    
    return {
      mes: mesesAbrev[index],
      mesCompleto: mes,
      receita: valorMes,
      pontos: valorMes > 0 ? 1 : 0
    };
  });

  console.log('📈 Sazonalidade calculada:', sazonalidade);
  return sazonalidade;
}

export default function GraficoSazonalidade() {
  const data = useData();
  
  // Usar apenas dados reais
  const receitaMensal = data.receitaMensal;
  const dadosSazonalidade = calcularSazonalidade(receitaMensal);

  // Calcular estatísticas da sazonalidade
  const receitaTotal = dadosSazonalidade.reduce((acc, item) => acc + item.receita, 0);
  const mesesComDados = dadosSazonalidade.filter(item => item.receita > 0);
  const mediaMensal = mesesComDados.length > 0 ? receitaTotal / mesesComDados.length : 0;
  const melhorMes = dadosSazonalidade.reduce((max, item) => 
    item.receita > max.receita ? item : max, dadosSazonalidade[0] || { receita: 0, mes: '', mesCompleto: '' });
  const piorMes = dadosSazonalidade.filter(item => item.receita > 0).reduce((min, item) => 
    item.receita < min.receita ? item : min, melhorMes);

  // Ano atual para exibição
  const anoAtual = receitaMensal?.ano || new Date().getFullYear();

  return (
    <Card className="shadow-xl border border-emerald-200/30 bg-white rounded-2xl overflow-hidden h-full">
      <CardHeader className="p-4 sm:p-6 border-b border-emerald-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-emerald-800 truncate">
                Curva de Sazonalidade ({anoAtual})
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Receita mensal ao longo do ano</p>
            </div>
          </div>
          
          {/* Indicador de tendência */}
          {melhorMes && piorMes && (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 border border-emerald-200 self-start">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-semibold text-emerald-700">
                Pico: {melhorMes.mes}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6">
        {/* Estatísticas resumo */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-emerald-600 mb-1">Pico</p>
            <p className="text-sm font-bold text-emerald-800">{melhorMes?.mes || '--'}</p>
            <p className="text-xs text-emerald-600">R$ {melhorMes?.receita ? formatCompact(melhorMes.receita) : '--'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">Média</p>
            <p className="text-sm font-bold text-gray-800">R$ {formatCompact(mediaMensal)}</p>
            <p className="text-xs text-gray-600">por mês</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-red-600 mb-1">Vale</p>
            <p className="text-sm font-bold text-red-800">{piorMes?.mes || '--'}</p>
            <p className="text-xs text-red-600">R$ {piorMes?.receita ? formatCompact(piorMes.receita) : '--'}</p>
          </div>
        </div>

        {/* Gráfico da curva de sazonalidade */}
        <div className="h-72 sm:h-96 w-full">
          {dadosSazonalidade.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dadosSazonalidade}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <defs>
                  <linearGradient id="sazonalidade-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  stroke="#e5e7eb" 
                  strokeDasharray="3 3"
                  opacity={0.4}
                />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `R$ ${formatCompact(value)}`}
                  tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `R$ ${formatCompact(value)}`,
                    'Receita Média'
                  ]}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? 
                      `${item.mesCompleto} (${item.pontos} ${item.pontos === 1 ? 'registro' : 'registros'})` : 
                      label;
                  }}
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    color: '#374151',
                    fontSize: '13px'
                  }}
                  labelStyle={{ 
                    color: '#1f2937', 
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="receita" 
                  stroke="rgb(16, 185, 129)" 
                  strokeWidth={3}
                  fill="url(#sazonalidade-gradient)"
                  dot={{ 
                    fill: 'rgb(16, 185, 129)', 
                    strokeWidth: 2, 
                    stroke: '#ffffff',
                    r: 5 
                  }}
                  activeDot={{ 
                    r: 7, 
                    stroke: 'rgb(16, 185, 129)', 
                    strokeWidth: 2,
                    fill: '#ffffff'
                  }}
                />
                {/* Linha da média */}
                <Line
                  type="monotone"
                  dataKey={() => mediaMensal}
                  stroke="#6b7280"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">Dados insuficientes</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">A curva de sazonalidade será exibida aqui</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
