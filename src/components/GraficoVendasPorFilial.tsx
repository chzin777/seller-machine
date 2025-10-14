"use client";

import React from 'react';
import { Card, CardContent } from './ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useData } from "./DataProvider";

// Função para extrair o segundo nome (cidade) da filial
function extrairSegundoNome(nome: string) {
  const partes = nome.trim().split(' ');
  return partes.length > 1 ? partes[1] : nome;
}

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

export default function GraficoVendasPorFilial() {
  const data = useData();

  return (
    <Card className="shadow-xl border bg-white rounded-2xl overflow-hidden h-full" style={{ borderColor: 'rgba(0, 49, 83, 0.3)' }}>
      <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'rgba(0, 49, 83, 0.3)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: 'linear-gradient(to bottom right, #003153, #663399)' }}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold truncate" style={{ color: '#003153' }}>
                Vendas x Receita
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Performance por filial</p>
            </div>
          </div>
          {/* Total de filiais */}
          {data.vendasPorFilial.length > 0 && (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border self-start" style={{ backgroundColor: 'rgba(0, 49, 83, 0.05)', borderColor: 'rgba(0, 49, 83, 0.2)' }}>
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#003153' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-xs font-semibold" style={{ color: '#003153' }}>
                {data.vendasPorFilial.length} {data.vendasPorFilial.length === 1 ? 'Filial' : 'Filiais'}
              </span>
            </div>
          )}
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="h-72 sm:h-96 w-full chart-container">
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
                  tick={{ fontSize: 12, fill: '#003153', fontWeight: '500' }}
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
  );
}
