
  "use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { LayoutDashboard } from 'lucide-react';

type ReceitaMensal = {
  ano: number;
  receitaPorMes: Record<string, number>;
};
type ReceitaPorTipo = { tipo: string; receita: number }[];
type VendaPorFilial = { filial: { nome: string }; receitaTotal: number; quantidadeNotas: number }[];

export default function Home() {
  const router = useRouter();
  const [receitaTotal, setReceitaTotal] = useState<number | null>(null);
  const [receitaMensal, setReceitaMensal] = useState<ReceitaMensal | null>(null);
  const [receitaPorTipo, setReceitaPorTipo] = useState<ReceitaPorTipo>([]);
  const [vendasPorFilial, setVendasPorFilial] = useState<VendaPorFilial>([]);
  const [clientesAtivos, setClientesAtivos] = useState<number | null>(null);
  const [clientesInativos, setClientesInativos] = useState<number | null>(null);
  // const [totalClientes, setTotalClientes] = useState<number | null>(null); // removed unused variable
  const [ticketMedio, setTicketMedio] = useState<number | null>(null);
  const [itensVendidos, setItensVendidos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!user) {
        router.replace("/login");
      }
    }
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {

        // Receita total
        const receitaTotalRes = await fetch("/api/proxy?url=/api/indicadores/receita-total");
        const receitaTotalData = await receitaTotalRes.json();
        setReceitaTotal(Number(receitaTotalData.receitaTotal || receitaTotalData.total || receitaTotalData.value || 0));

        // Ticket médio por nota fiscal e Itens Vendidos
        const notasRes = await fetch("/api/proxy?url=/api/notas-fiscais");
        const notasData = await notasRes.json();
        if (Array.isArray(notasData) && notasData.length > 0) {
          const soma = notasData.reduce((acc, nf) => acc + (parseFloat(nf.valorTotal) || 0), 0);
          setTicketMedio(soma / notasData.length);
          // Soma dos itens vendidos
          const totalItens = notasData.reduce((acc, nf) => acc + (nf._count?.itens || 0), 0);
          setItensVendidos(totalItens);
        } else {
          setTicketMedio(null);
          setItensVendidos(null);
        }

        // Receita mensal
  const receitaMensalRes = await fetch("/api/proxy?url=/api/indicadores/receita-mensal");
  const receitaMensalData = await receitaMensalRes.json();
  setReceitaMensal(receitaMensalData as ReceitaMensal);

        // Receita por tipo de produto
        const receitaTipoRes = await fetch("/api/proxy?url=/api/indicadores/receita-por-tipo-produto");
        const receitaTipoData = await receitaTipoRes.json();
        let receitaTipoArr: ReceitaPorTipo = [];
        if (Array.isArray(receitaTipoData)) {
          receitaTipoArr = receitaTipoData;
        } else if (receitaTipoData && typeof receitaTipoData === 'object') {
          receitaTipoArr = Object.entries(receitaTipoData).map(([tipo, receita]) => ({ tipo, receita: Number(receita) }));
        }
        setReceitaPorTipo(receitaTipoArr);

        // Vendas por filial
  const vendasFilialRes = await fetch("/api/proxy?url=/api/indicadores/vendas-por-filial");
  const vendasFilialData = await vendasFilialRes.json();
  setVendasPorFilial(Array.isArray(vendasFilialData) ? vendasFilialData : []);

        // Clientes inativos (últimos 90 dias)
        const inativosRes = await fetch("/api/proxy?url=/api/indicadores/clientes-inativos?dias=90");
        const inativosData = await inativosRes.json();
        setClientesInativos(Array.isArray(inativosData) ? inativosData.length : null);

        // Buscar todos os clientes em /api/clientes
        const todosClientesRes = await fetch("/api/proxy?url=/api/clientes");
        const todosClientesData = await todosClientesRes.json();
        // Supondo que retorna um array de clientes
        const totalClientesCount = Array.isArray(todosClientesData) ? todosClientesData.length : null;
  // setTotalClientes(totalClientesCount); // removed unused state

        // Clientes ativos = total - inativos
        if (typeof totalClientesCount === 'number' && Array.isArray(inativosData)) {
          setClientesAtivos(totalClientesCount - inativosData.length);
        } else {
          setClientesAtivos(null);
        }
      } catch (err) {
        setError("Erro ao carregar dados da API.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (<div className="flex justify-center items-center h-96 text-xl">Carregando dados...</div>);
  }
  if (error) {
    return (<div className="flex justify-center items-center h-96 text-xl text-red-600">{error}</div>);
  }

  return (
    <>
  <div className="flex items-center gap-3 mb-8 mt-4 px-2 sm:px-6 max-w-[1500px] mx-auto">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow">
          <LayoutDashboard className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Painel Comercial</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Indicadores, gráficos e clientes da plataforma.</p>
        </div>
      </div>
  <div className="max-w-[1500px] mx-auto flex flex-col gap-8 px-2 sm:px-6">

        {/* Linha de cards Receita Total, Ticket Médio, Itens Vendidos, Clientes Ativos e Inativos */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Receita Total */}
          <Card className="flex-1 shadow-lg border border-green-200/60 bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-green-900 dark:text-green-200">Receita Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-green-900 dark:text-green-100 flex items-center gap-2">
                {receitaTotal !== null ? <><span>R$</span><span>{receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></> : '--'}
              </div>
            </CardContent>
          </Card>
          {/* Ticket Médio por NF */}
          <Card className="flex-1 shadow-lg border border-yellow-200/60 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-yellow-900 dark:text-yellow-200">Ticket Médio por NF</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-yellow-900 dark:text-yellow-100">
                {ticketMedio !== null ? `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
              </div>
            </CardContent>
          </Card>
          {/* Itens Vendidos */}
          <Card className="flex-1 shadow-lg border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-indigo-900 dark:text-indigo-200">Itens Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-indigo-900 dark:text-indigo-100">
                {itensVendidos !== null ? itensVendidos.toLocaleString('pt-BR') : '--'}
              </div>
            </CardContent>
          </Card>
          {/* Clientes Ativos */}
          <Card className="flex-1 shadow-lg border border-blue-200/60 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-200">Clientes Ativos (90 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100">
                {clientesAtivos !== null ? clientesAtivos : '--'}
              </div>
            </CardContent>
          </Card>
          {/* Clientes Inativos */}
          <Card className="flex-1 shadow-lg border border-red-200/60 bg-gradient-to-br from-red-50 to-white dark:from-red-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-red-900 dark:text-red-200">Clientes Inativos (90 dias)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-red-900 dark:text-red-100">
                {clientesInativos !== null ? clientesInativos : '--'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Linha de gráficos Receita Mensal e Vendas por Filial */}
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          {/* Gráfico Receita Mensal */}
          <Card className="flex-1 shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900 min-w-[350px]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Receita Mensal {receitaMensal?.ano ? `(${receitaMensal.ano})` : ''}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {receitaMensal?.receitaPorMes && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={Object.entries(receitaMensal.receitaPorMes).map(([mes, valor]) => ({ mes, valor }))}>
                      <CartesianGrid stroke="#e5e7eb" />
                      <XAxis dataKey="mes" tick={{ fontSize: 14, fill: '#64748b' }} />
                      <YAxis tickFormatter={(v) => `R$ ${formatCompact(v)}`} tick={{ fontSize: 14, fill: '#64748b' }} />
                      <Tooltip formatter={(v: number) => `R$ ${formatCompact(v)}`} />
                      <Bar dataKey="valor" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Gráfico Vendas x Receita */}
          <Card className="flex-1 shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900 min-w-[350px]">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Vendas x Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full">
                {vendasPorFilial.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vendasPorFilial.map((f: VendaPorFilial[number]) => ({
                      filial: f.filial?.nome || '',
                      receita: Number(f.receitaTotal),
                      quantidadeNotas: f.quantidadeNotas
                    }))}>
                      <CartesianGrid stroke="#e5e7eb" vertical={true} />
                      <XAxis dataKey="filial" tick={{ fontSize: 14, fill: '#64748b' }} />
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 14, fill: '#10b981' }}
                        tickFormatter={(v) => `R$ ${formatCompact(v)}`}
                        axisLine={false}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fontSize: 14, fill: '#6366f1' }}
                        tickFormatter={(v) => `${formatCompact(v)} Notas`}
                        axisLine={false}
                      />
                      <Tooltip formatter={(v: number, name: string) => {
                        if (name === 'Receita') return [`R$ ${formatCompact(v)}`, 'Receita'];
                        if (name === 'Notas Fiscais') return [`${formatCompact(v)} Notas`, 'Notas Fiscais'];
                        return v;
                      }} />
                      <Bar
                        yAxisId="right"
                        dataKey="quantidadeNotas"
                        fill="#6366f1"
                        name="Notas Fiscais"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar
                        yAxisId="left"
                        dataKey="receita"
                        fill="#10b981"
                        name="Receita"
                        radius={[8, 8, 0, 0]}
                      />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico Receita por Tipo de Produto */}
        {/* Gráfico Receita por Tipo de Produto (Barra horizontal estilo mixed) */}
        <Card className="shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Receita por Tipo de Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 flex items-center justify-center">
              {receitaPorTipo.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={receitaPorTipo}
                    layout="vertical"
                    margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                    barCategoryGap={30}
                  >
                    <CartesianGrid stroke="#222" />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `R$ ${formatCompact(v)}`}
                      tick={{ fontSize: 14, fill: '#64748b' }}
                      axisLine={false}
                    />
                    <YAxis
                      dataKey="tipo"
                      type="category"
                      tick={{ fontSize: 15, fill: '#64748b', fontWeight: 600 }}
                      axisLine={false}
                    />
                    <Tooltip formatter={(v: number) => `R$ ${formatCompact(v)}`} />
                    <Bar dataKey="receita" radius={8} fill="#6366f1" barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
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
    return v + 'BI';
  }
  if (abs >= 1e6) {
    let v = (value / 1e6).toFixed(2).replace('.', ',');
    v = v.replace(/,00$/, '');
    v = v.replace(/,0$/, '');
    return v + 'MI';
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