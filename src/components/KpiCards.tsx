"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import GenericTiltedCard from "../blocks/Components/GenericTiltedCard";
import { useData } from "./DataProvider";

// Skeleton simples
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />;
}

// Função para formatar números de forma compacta
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

export default function KpiCards() {
  const data = useData();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCardClick = (cardType: string) => {
    setExpandedCard(expandedCard === cardType ? null : cardType);
  };

  return (
    <>
      {/* KPI Cards Grid */}
    <div className="kpi-grid-container grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 lg:gap-4 w-full min-w-0" style={{margin: 0, padding: 0, border: 'none', outline: 'none'}}>
      {/* Receita Total */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-green-500 to-green-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-green-400 hover:to-green-500 transition-all duration-200"
            onClick={() => handleCardClick('receita-total')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Receita Total</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.loading ? (
                  <Skeleton className="h-6 w-20 bg-white/20" />
                ) : data.receitaTotal !== null ? (
                  `R$ ${formatCompact(data.receitaTotal)}`
                ) : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Ticket Médio por NF */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-orange-400 hover:to-orange-500 transition-all duration-200"
            onClick={() => handleCardClick('ticket-medio')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Ticket Médio</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.ticketMedio !== null ? `R$ ${formatCompact(data.ticketMedio)}` : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Itens Vendidos */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-indigo-400 hover:to-indigo-500 transition-all duration-200"
            onClick={() => handleCardClick('itens-vendidos')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Itens Vendidos</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.itensVendidos !== null ? formatCompact(data.itensVendidos) : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Número de Notas Fiscais */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-purple-400 hover:to-purple-500 transition-all duration-200"
            onClick={() => handleCardClick('notas-fiscais')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Notas Fiscais</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.numeroNotas !== null ? formatCompact(data.numeroNotas) : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Itens P95 por Nota */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-teal-400 hover:to-teal-500 transition-all duration-200"
            onClick={() => handleCardClick('itens-por-nf')}
            title="Percentil 95 de itens por nota fiscal - 95% das notas têm até este número de itens"
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Itens por NF</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.itensP95PorNota !== null ? formatCompact(data.itensP95PorNota) : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Filiais Ativas */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-red-500 to-red-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-red-400 hover:to-red-500 transition-all duration-200"
            onClick={() => handleCardClick('filiais-ativas')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Filiais Ativas</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.vendasPorFilial.length > 0 ? data.vendasPorFilial.length : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Clientes Ativos */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-blue-400 hover:to-blue-500 transition-all duration-200"
            onClick={() => handleCardClick('clientes-ativos')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Clientes Ativos</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.clientesAtivos !== null ? formatCompact(data.clientesAtivos) : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>

      {/* Clientes Inativos */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <div 
            className="shadow-lg bg-gradient-to-br from-red-500 to-red-600 h-full kpi-uniform rounded-xl border-0 cursor-pointer hover:from-red-400 hover:to-red-500 transition-all duration-200"
            onClick={() => handleCardClick('clientes-inativos')}
          >
            <div className="kpi-header">
              <h3 className="text-sm font-bold text-white text-center leading-tight">Clientes Inativos</h3>
            </div>
            <div className="kpi-content">
              <div className="text-xl font-extrabold text-white text-center">
                {data.clientesInativos !== null ? formatCompact(data.clientesInativos) : '--'}
              </div>
            </div>
          </div>
        </GenericTiltedCard>
      </div>
    </div>

      {/* Seções de Detalhes Expandidas */}
      {expandedCard === 'receita-total' && (
        <ReceitaDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'ticket-medio' && (
        <TicketMedioDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'itens-vendidos' && (
        <ItensVendidosDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'notas-fiscais' && (
        <NotasFiscaisDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'itens-por-nf' && (
        <ItensPorNFDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'filiais-ativas' && (
        <FiliaisAtivasDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'clientes-ativos' && (
        <ClientesAtivosDetails onClose={() => setExpandedCard(null)} />
      )}
      {expandedCard === 'clientes-inativos' && (
        <ClientesInativosDetails onClose={() => setExpandedCard(null)} />
      )}
    </>
  );
}

// Componente de detalhes da receita
function ReceitaDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-green-800">Análise Detalhada de Receita</h2>
              <p className="text-green-600">Informações completas sobre a receita da empresa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            aria-label="Fechar detalhes"
          >
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Grid de informações detalhadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Receita Total Destacada */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Receita Total</h3>
            </div>
            <p className="text-2xl font-bold text-green-600">
              R$ {data.receitaTotal ? formatCompact(data.receitaTotal) : '--'}
            </p>
          </div>

          {/* Ticket Médio */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Ticket Médio</h3>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              R$ {data.ticketMedio ? formatCompact(data.ticketMedio) : '--'}
            </p>
          </div>

          {/* Total de Notas */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Total de Notas</h3>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {data.numeroNotas ? formatCompact(data.numeroNotas) : '--'}
            </p>
          </div>

          {/* Receita por Filial */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-700">Filiais Ativas</h3>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {data.vendasPorFilial ? data.vendasPorFilial.length : '--'}
            </p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receita Mensal */}
          <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
            <ReceitaMensalChart />
          </div>

          {/* Receita por Tipo + Crescimento */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <ReceitaPorTipoChart />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
              <CrescimentoChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mini componente do gráfico de receita mensal
function ReceitaMensalChart() {
  const data = useData();

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Receita Mensal
      </h4>
      
      {data.receitaMensal && data.receitaMensal.receitaPorMes ? (
        <div className="space-y-2">
          {Object.entries(data.receitaMensal.receitaPorMes)
            .filter(([, valor]) => Number(valor) > 0)
            .slice(-6) // Últimos 6 meses
            .map(([mes, valor]) => (
              <div key={mes} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm font-medium text-gray-700">{mes}</span>
                <span className="text-sm font-bold text-green-600">
                  R$ {formatCompact(Number(valor))}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Dados de receita mensal não disponíveis</p>
      )}
    </div>
  );
}

// Mini componente do gráfico de receita por tipo
function ReceitaPorTipoChart() {
  const data = useData();

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        Receita por Tipo
      </h4>
      
      {data.receitaPorTipo && data.receitaPorTipo.length > 0 ? (
        <div className="space-y-2">
          {data.receitaPorTipo
            .slice(0, 5) // Top 5
            .map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">{item.tipo}</span>
                <span className="text-sm font-bold text-violet-600">
                  R$ {formatCompact(item.receita)}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Dados de receita por tipo não disponíveis</p>
      )}
    </div>
  );
}

// Mini componente do gráfico de crescimento
function CrescimentoChart() {
  const data = useData();

  // Calcular crescimento simples dos últimos dois meses
  const calcularCrescimento = () => {
    if (!data.receitaMensal?.receitaPorMes) return null;

    const meses = Object.entries(data.receitaMensal.receitaPorMes)
      .filter(([, valor]) => Number(valor) > 0)
      .slice(-2);

    if (meses.length < 2) return null;

    const [mesAnterior, valorAnterior] = meses[0];
    const [mesAtual, valorAtual] = meses[1];
    
    const crescimento = ((Number(valorAtual) - Number(valorAnterior)) / Number(valorAnterior)) * 100;

    return {
      mesAnterior,
      mesAtual,
      crescimento,
      valorAnterior: Number(valorAnterior),
      valorAtual: Number(valorAtual)
    };
  };

  const crescimento = calcularCrescimento();

  return (
    <div className="p-4">
      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Crescimento Recente
      </h4>
      
      {crescimento ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{crescimento.mesAnterior}</span>
            <span className="text-sm font-semibold">R$ {formatCompact(crescimento.valorAnterior)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{crescimento.mesAtual}</span>
            <span className="text-sm font-semibold">R$ {formatCompact(crescimento.valorAtual)}</span>
          </div>
          <div className={`flex items-center justify-between p-2 rounded-lg ${
            crescimento.crescimento >= 0 ? 'bg-green-50' : 'bg-red-50'
          }`}>
            <span className="text-sm font-medium">Crescimento</span>
            <span className={`text-sm font-bold flex items-center gap-1 ${
              crescimento.crescimento >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {crescimento.crescimento >= 0 ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              )}
              {crescimento.crescimento >= 0 ? '+' : ''}{crescimento.crescimento.toFixed(1)}%
            </span>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm">Dados insuficientes para calcular crescimento</p>
      )}
    </div>
  );
}

// Componente de detalhes do Ticket Médio
function TicketMedioDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-orange-800">Análise do Ticket Médio</h2>
              <p className="text-orange-600">Valor médio por nota fiscal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-orange-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Ticket Médio Atual</h3>
            <p className="text-2xl font-bold text-orange-600">
              R$ {data.ticketMedio ? formatCompact(data.ticketMedio) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Receita Total</h3>
            <p className="text-2xl font-bold text-green-600">
              R$ {data.receitaTotal ? formatCompact(data.receitaTotal) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total de Notas</h3>
            <p className="text-2xl font-bold text-purple-600">
              {data.numeroNotas ? formatCompact(data.numeroNotas) : '--'}
            </p>
          </div>
        </div>

        {data.receitaTotal && data.numeroNotas && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-orange-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Cálculo Detalhado</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-gray-700">Receita Total ÷ Número de Notas</span>
                <span className="font-mono">R$ {formatCompact(data.receitaTotal)} ÷ {formatCompact(data.numeroNotas)}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded border border-orange-200">
                <span className="text-orange-700 font-semibold">Ticket Médio</span>
                <span className="font-mono font-bold text-orange-600">= R$ {data.ticketMedio ? formatCompact(data.ticketMedio) : '--'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de detalhes dos Itens Vendidos
function ItensVendidosDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-indigo-800">Análise de Itens Vendidos</h2>
              <p className="text-indigo-600">Quantidade total de produtos comercializados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total de Itens</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {data.itensVendidos ? formatCompact(data.itensVendidos) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notas Fiscais</h3>
            <p className="text-2xl font-bold text-purple-600">
              {data.numeroNotas ? formatCompact(data.numeroNotas) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Média por Nota</h3>
            <p className="text-2xl font-bold text-teal-600">
              {data.itensVendidos && data.numeroNotas ? formatCompact(Math.round(data.itensVendidos / data.numeroNotas)) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">P95 por Nota</h3>
            <p className="text-2xl font-bold text-orange-600">
              {data.itensP95PorNota ? formatCompact(data.itensP95PorNota) : '--'}
            </p>
          </div>
        </div>

        {data.receitaPorTipo && data.receitaPorTipo.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Top Produtos por Receita</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.receitaPorTipo.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">{item.tipo}</span>
                  <span className="text-sm font-bold text-indigo-600">
                    R$ {formatCompact(item.receita)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de detalhes das Notas Fiscais
function NotasFiscaisDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-purple-800">Análise de Notas Fiscais</h2>
              <p className="text-purple-600">Documentos fiscais emitidos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total de Notas</h3>
            <p className="text-2xl font-bold text-purple-600">
              {data.numeroNotas ? formatCompact(data.numeroNotas) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Receita Total</h3>
            <p className="text-2xl font-bold text-green-600">
              R$ {data.receitaTotal ? formatCompact(data.receitaTotal) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Ticket Médio</h3>
            <p className="text-2xl font-bold text-orange-600">
              R$ {data.ticketMedio ? formatCompact(data.ticketMedio) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Itens Vendidos</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {data.itensVendidos ? formatCompact(data.itensVendidos) : '--'}
            </p>
          </div>
        </div>

        {data.vendasPorFilial && data.vendasPorFilial.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-purple-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Notas por Filial</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.vendasPorFilial.map((filial, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">{filial.filial.nome}</span>
                  <span className="text-sm font-bold text-purple-600">
                    {formatCompact(filial.quantidadeNotas)} notas
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de detalhes dos Itens por NF (P95)
function ItensPorNFDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-teal-800">Análise de Itens por Nota Fiscal</h2>
              <p className="text-teal-600">Percentil 95 de itens por documento</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-teal-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">P95 Itens por NF</h3>
            <p className="text-2xl font-bold text-teal-600">
              {data.itensP95PorNota ? formatCompact(data.itensP95PorNota) : '--'}
            </p>
            <p className="text-xs text-gray-500 mt-1">95% das notas têm até este número de itens</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Média por Nota</h3>
            <p className="text-2xl font-bold text-indigo-600">
              {data.itensVendidos && data.numeroNotas ? formatCompact(Math.round(data.itensVendidos / data.numeroNotas)) : '--'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Média aritmética simples</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total de Itens</h3>
            <p className="text-2xl font-bold text-purple-600">
              {data.itensVendidos ? formatCompact(data.itensVendidos) : '--'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Soma de todos os itens</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-teal-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">O que significa P95?</h4>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-teal-50 rounded-lg">
              <p className="text-teal-800"><strong>Percentil 95 (P95):</strong> Indica que 95% das notas fiscais possuem até {data.itensP95PorNota || 'X'} itens.</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700"><strong>Utilidade:</strong> Ajuda a identificar padrões de compra e detectar notas com volumes anômalos (5% restante).</p>
            </div>
            {data.itensVendidos && data.numeroNotas && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800"><strong>Comparação:</strong> Média é {Math.round(data.itensVendidos / data.numeroNotas)} itens, P95 é {data.itensP95PorNota} itens.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de detalhes das Filiais Ativas  
function FiliaisAtivasDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-red-800">Análise de Filiais Ativas</h2>
              <p className="text-red-600">Unidades com vendas no período</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Total de Filiais</h3>
            <p className="text-2xl font-bold text-red-600">
              {data.vendasPorFilial ? data.vendasPorFilial.length : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Receita Total</h3>
            <p className="text-2xl font-bold text-green-600">
              R$ {data.receitaTotal ? formatCompact(data.receitaTotal) : '--'}
            </p>
          </div>
        </div>

        {data.vendasPorFilial && data.vendasPorFilial.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Performance por Filial</h4>
            <div className="space-y-3">
              {data.vendasPorFilial
                .sort((a, b) => b.receitaTotal - a.receitaTotal)
                .map((filial, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                        <span className="text-sm font-medium text-gray-700">{filial.filial.nome}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatCompact(filial.quantidadeNotas)} notas fiscais
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">
                        R$ {formatCompact(filial.receitaTotal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {data.receitaTotal ? ((filial.receitaTotal / data.receitaTotal) * 100).toFixed(1) : '0'}% do total
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente de detalhes dos Clientes Ativos
function ClientesAtivosDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-800">Análise de Clientes Ativos</h2>
              <p className="text-blue-600">Clientes com compras recentes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Clientes Ativos</h3>
            <p className="text-2xl font-bold text-blue-600">
              {data.clientesAtivos !== null ? formatCompact(data.clientesAtivos) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Clientes Inativos</h3>
            <p className="text-2xl font-bold text-red-600">
              {data.clientesInativos !== null ? formatCompact(data.clientesInativos) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Taxa de Atividade</h3>
            <p className="text-2xl font-bold text-green-600">
              {data.clientesAtivos !== null && data.clientesInativos !== null ? 
                `${(data.clientesAtivos / (data.clientesAtivos + data.clientesInativos) * 100).toFixed(1)}%` : '--'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Métricas de Receita</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Receita Total</span>
                <span className="font-semibold text-green-600">R$ {data.receitaTotal ? formatCompact(data.receitaTotal) : '--'}</span>
              </div>
              {data.clientesAtivos && data.receitaTotal && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Receita por Cliente Ativo</span>
                  <span className="font-semibold text-blue-600">R$ {formatCompact(data.receitaTotal / data.clientesAtivos)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ticket Médio</span>
                <span className="font-semibold text-orange-600">R$ {data.ticketMedio ? formatCompact(data.ticketMedio) : '--'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Definição de Cliente Ativo</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Cliente que realizou pelo menos uma compra nos últimos 90 dias</p>
              <p>• Base de cálculo: Data da última compra</p>
              <p>• Atualizado automaticamente conforme configuração</p>
              <p>• Exclui clientes com status inativo no sistema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de detalhes dos Clientes Inativos
function ClientesInativosDetails({ onClose }: { onClose: () => void }) {
  const data = useData();

  return (
    <div className="w-full mt-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Análise de Clientes Inativos</h2>
              <p className="text-gray-600">Clientes sem compras recentes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Clientes Inativos</h3>
            <p className="text-2xl font-bold text-red-600">
              {data.clientesInativos !== null ? formatCompact(data.clientesInativos) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Clientes Ativos</h3>
            <p className="text-2xl font-bold text-blue-600">
              {data.clientesAtivos !== null ? formatCompact(data.clientesAtivos) : '--'}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Taxa de Inatividade</h3>
            <p className="text-2xl font-bold text-orange-600">
              {data.clientesAtivos !== null && data.clientesInativos !== null ? 
                `${(data.clientesInativos / (data.clientesAtivos + data.clientesInativos) * 100).toFixed(1)}%` : '--'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Oportunidades de Reativação</h4>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800"><strong>Potencial de Receita:</strong> Clientes inativos representam oportunidade de reativação</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800"><strong>Campanhas de Marketing:</strong> Segmente ofertas para este grupo</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800"><strong>Análise de Churn:</strong> Identifique padrões de inatividade</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Definição de Cliente Inativo</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Cliente sem compras nos últimos 90 dias</p>
              <p>• Base de cálculo: Data da última compra</p>
              <p>• Configuração ajustável por empresa</p>
              <p>• Oportunidade de campanhas de reativação</p>
              <p>• Monitoramento automático de churn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
