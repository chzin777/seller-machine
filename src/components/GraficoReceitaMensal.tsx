"use client";

import React from 'react';
import { Card, CardContent } from './ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useData } from "./DataProvider";

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

// Função para filtrar apenas os meses que já passaram
function filtrarMesesValidos(receitaMensal: any) {
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear(); // 2025
  const mesAtualNumero = dataAtual.getMonth(); // 0-11 (Janeiro = 0, Setembro = 8)
  
  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  let dadosDisponiveis: [string, number][] = [];

  // Verificar se temos dados do ano atual (2025)
  if (receitaMensal?.ano === anoAtual && receitaMensal?.receitaPorMes) {
    dadosDisponiveis = Object.entries(receitaMensal.receitaPorMes)
      .map(([nomeDoMes, valor]) => [nomeDoMes, Number(valor) || 0] as [string, number])
      .filter(([nomeDoMes, valor]) => {
        const numeroDoMes = mesesNomes.indexOf(nomeDoMes);
        // Só incluir meses que já passaram E que têm valor > 0
        return numeroDoMes !== -1 && numeroDoMes <= mesAtualNumero && valor > 0;
      })
      .sort(([a], [b]) => mesesNomes.indexOf(a) - mesesNomes.indexOf(b));
  }

  // Se não temos dados suficientes de 2025, usar todos os dados disponíveis com valores > 0
  if (dadosDisponiveis.length === 0 && receitaMensal?.receitaPorMes) {
    dadosDisponiveis = Object.entries(receitaMensal.receitaPorMes)
      .map(([nomeDoMes, valor]) => [nomeDoMes, Number(valor) || 0] as [string, number])
      .filter(([, valor]) => valor > 0) // Só pegar meses com dados reais
      .sort(([a], [b]) => mesesNomes.indexOf(a) - mesesNomes.indexOf(b));
  }

  return dadosDisponiveis;
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

export default function GraficoReceitaMensal() {
  const data = useData();

  // Dados mock para teste se não houver dados reais
  const dadosMock = {
    ano: 2025,
    receitaPorMes: {
      'Janeiro': 120000,
      'Fevereiro': 135000,
      'Março': 148000,
      'Abril': 142000,
      'Maio': 156000,
      'Junho': 163000,
      'Julho': 158000,
      'Agosto': 171000,
      'Setembro': 145000
    }
  };

  // Usar dados reais ou mock
  const receitaMensal = data.receitaMensal || dadosMock;

  return (
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
                Receita Mensal {receitaMensal?.ano ? `(${receitaMensal.ano})` : ''}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">Evolução da receita ao longo do ano</p>
            </div>
          </div>
          {/* Indicador de tendência */}
          {receitaMensal && (() => {
            const mesesValidos = filtrarMesesValidos(receitaMensal);
            return mesesValidos.length > 1;
          })() && (
            <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 self-start">
              {(() => {
                const mesesValidos = filtrarMesesValidos(receitaMensal);
                const valores = mesesValidos.map(([, valor]) => Number(valor));
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
          {receitaMensal && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={filtrarMesesValidos(receitaMensal).map(([mes, valor]) => ({ mes: abreviarMes(mes), valor }))}
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
          {!data.receitaMensal && (
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
  );
}
