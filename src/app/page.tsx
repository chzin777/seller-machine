"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import DashboardHeader from "../components/DashboardHeader";
import KpiCards from "../components/KpiCards";
import GraficoReceitaMensal from "../components/GraficoReceitaMensal";
import GraficoVendasPorFilial from "../components/GraficoVendasPorFilial";
import GraficoSazonalidade from "../components/GraficoSazonalidade";
import GraficoReceitaPorTipo from "../components/GraficoReceitaPorTipo";
import GraficoCrescimentoMensal from "../components/GraficoCrescimentoMensal";
import RankingVendedores from "../components/RankingVendedores";
import { useData } from "../components/DataProvider";

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
      {/* Cabeçalho */}
      <DashboardHeader />
      
      <div className="flex flex-col gap-6 sm:gap-8 px-6 sm:px-8 lg:px-12 xl:px-16 overflow-x-hidden w-full">
        {/* KPI Cards */}
        <div className="mt-6">
          <KpiCards />
        </div>

        {/* Primeira linha - Receita Mensal e Vendas por Filial (2 colunas) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 w-full min-w-0">
          <div className="w-full min-w-0">
            <GraficoReceitaMensal />
          </div>
          <div className="w-full min-w-0">
            <GraficoVendasPorFilial />
          </div>
        </div>

        {/* Segunda linha - Sazonalidade e Receita por Tipo (2 colunas) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 w-full min-w-0">
          <div className="w-full min-w-0">
            <GraficoSazonalidade />
          </div>
          <div className="w-full min-w-0">
            <GraficoReceitaPorTipo />
          </div>
        </div>

        {/* Terceira linha - Ranking de Vendedores e Crescimento Mensal (2 colunas) */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-10 xl:gap-12 w-full min-w-0">
          <div className="w-full min-w-0">
            <RankingVendedores />
          </div>
          <div className="w-full min-w-0">
            <GraficoCrescimentoMensal />
          </div>
        </div>
      </div>
    </div>
  );
}
