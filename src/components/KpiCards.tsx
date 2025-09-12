"use client";

import React from 'react';
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

  return (
    <div className="kpi-grid-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-1 sm:gap-2 lg:gap-4 w-full min-w-0 px-2">
      {/* Receita Total */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-green-500 to-green-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Receita Total</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white flex items-center gap-1 sm:gap-2 kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.loading ? (
                  <Skeleton className="h-8 sm:h-10 w-24 sm:w-32 bg-white/20" />
                ) : data.receitaTotal !== null ? (
                  <><span className="text-[0.8em] flex-shrink-0">R$</span><span className="break-all">{formatCompact(data.receitaTotal)}</span></>
                ) : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Ticket Médio por NF */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Ticket Médio</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.ticketMedio !== null ? `R$ ${formatCompact(data.ticketMedio)}` : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Itens Vendidos */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-indigo-500 to-indigo-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Itens Vendidos</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.itensVendidos !== null ? formatCompact(data.itensVendidos) : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Número de Notas Fiscais */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Notas Fiscais</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.numeroNotas !== null ? formatCompact(data.numeroNotas) : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Itens P95 por Nota */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-teal-500 to-teal-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center" title="Percentil 95 de itens por nota fiscal - 95% das notas têm até este número de itens">Itens por NF</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.itensP95PorNota !== null ? formatCompact(data.itensP95PorNota) : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Filiais Ativas */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-red-500 to-red-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Filiais Ativas</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.vendasPorFilial.length > 0 ? data.vendasPorFilial.length : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Clientes Ativos */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Clientes Ativos</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center">
                {data.clientesAtivos !== null ? formatCompact(data.clientesAtivos) : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Clientes Inativos */}
      <div className="kpi-card-wrapper col-span-1">
        <GenericTiltedCard>
          <Card className="shadow-lg bg-gradient-to-br from-red-500 to-red-600 h-full kpi-container rounded-xl border-0">
            <CardHeader className="flex flex-row items-start pb-1 pt-4 px-3 flex-shrink-0 justify-center">
              <CardTitle className="text-sm sm:text-base md:text-xl font-bold text-white leading-tight w-full text-center">Clientes Inativos</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-0 pb-4 flex flex-col items-center justify-center">
              <div className="font-extrabold tracking-tight text-white kpi-number-responsive kpi-number text-xl sm:text-2xl md:text-3xl text-center flex items-center justify-center w-full">
                {data.clientesInativos !== null ? formatCompact(data.clientesInativos) : '--'}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>
    </div>
  );
}
