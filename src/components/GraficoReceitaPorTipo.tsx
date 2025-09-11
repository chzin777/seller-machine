"use client";

import React from 'react';
import { Card, CardContent } from './ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useData } from "./DataProvider";

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

export default function GraficoReceitaPorTipo() {
  const data = useData();

  // Dados mock para teste se não houver dados reais
  const dadosMock = [
    { tipo: 'Produtos A', receita: 285000 },
    { tipo: 'Produtos B', receita: 234000 },
    { tipo: 'Produtos C', receita: 198000 },
    { tipo: 'Produtos D', receita: 156000 },
    { tipo: 'Produtos E', receita: 123000 }
  ];

  // Usar dados reais ou mock
  const receitaPorTipo = data.receitaPorTipo && data.receitaPorTipo.length > 0 ? data.receitaPorTipo : dadosMock;

  return (
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
                {receitaPorTipo.length} {receitaPorTipo.length === 1 ? 'Categoria' : 'Categorias'}
              </span>
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="h-72 sm:h-96 flex items-center justify-center chart-container">
          {receitaPorTipo.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={receitaPorTipo}
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
  );
}
