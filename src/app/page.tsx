

'use client';



import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Package, Users, Eye } from 'lucide-react';
// ...existing code...



// ...existing code...

// Removido bloco duplicado e corrigido uso do Card para KPIs dinâmicos

// ...existing code...

// KPIs e cards dinâmicos (exemplo de uso correto do Card do shadcn/ui)

// ...existing code...

// Remover bloco duplicado de export default Home


export default function Home() {
  // KPIs simulados
  const kpis = {
    revenue: 2379583,
    products: 128,
    members: 512,
    visitors: 9000,
  };

  // Clientes simulados
  const customers = [
    { name: 'Carla Ferreira', email: 'carla@empresa.com', avatar: 'CF' },
    { name: 'Julio Lima', email: 'julio@empresa.com', avatar: 'JL' },
    { name: 'Gustavo Gomes', email: 'gustavo@empresa.com', avatar: 'GG' },
    { name: 'Felipe Goncalves', email: 'felipe@empresa.com', avatar: 'FG' },
    { name: 'Ana Souza', email: 'ana@empresa.com', avatar: 'AS' },
  ];

  // Gráfico de vendas simulado
  const salesData = [
    { week: '01/07', total: 12000 },
    { week: '08/07', total: 18500 },
    { week: '15/07', total: 14200 },
    { week: '22/07', total: 21000 },
    { week: '29/07', total: 19500 },
    { week: '05/08', total: 23000 },
    { week: '12/08', total: 25000 },
  ];

  // Gráfico de pizza simulado
  const pieData = [
    { category: 'Eletrônicos', total: 40000 },
    { category: 'Papelaria', total: 25000 },
    { category: 'Móveis', total: 15000 },
    { category: 'Limpeza', total: 10000 },
    { category: 'Outros', total: 5000 },
  ];

  // Transações recentes simuladas
  const transactions = [
    { id: 'TX12345', cliente: 'Carla Ferreira', valor: 'R$ 2.500,00', data: '12/08/2025', status: 'Concluída' },
    { id: 'TX12346', cliente: 'Julio Lima', valor: 'R$ 1.200,00', data: '11/08/2025', status: 'Concluída' },
    { id: 'TX12347', cliente: 'Gustavo Gomes', valor: 'R$ 3.100,00', data: '10/08/2025', status: 'Pendente' },
    { id: 'TX12348', cliente: 'Ana Souza', valor: 'R$ 800,00', data: '09/08/2025', status: 'Concluída' },
    { id: 'TX12349', cliente: 'Felipe Goncalves', valor: 'R$ 1.750,00', data: '08/08/2025', status: 'Cancelada' },
  ];

  const pieColors = ['#6366f1', '#f59e42', '#10b981', '#f43f5e', '#fbbf24'];

  return (
    <>
  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-10 px-2 sm:px-6 max-w-[1500px] mx-auto ml-16 sm:ml-20">Painel de Vendas</h1>
      <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row gap-8 px-2 sm:px-6">
      {/* Main dashboard */}
      <div className="flex-1 flex flex-col gap-8">
        {/* KPIs cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border border-blue-200/60 bg-gradient-to-br from-green-50 to-white dark:from-green-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-green-900 dark:text-green-200">Faturamento Total</CardTitle>
              <DollarSign className="w-7 h-7 text-green-600 dark:text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-green-900 dark:text-green-100">R$ {kpis.revenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-blue-200/60 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-blue-900 dark:text-blue-200">Produtos Ativos</CardTitle>
              <Package className="w-7 h-7 text-blue-900 dark:text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-blue-900 dark:text-blue-100">{kpis.products.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-cyan-300/60 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-cyan-900 dark:text-cyan-200">Clientes Ativos</CardTitle>
              <Users className="w-7 h-7 text-cyan-600 dark:text-cyan-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-cyan-900 dark:text-cyan-100">{kpis.members.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card className="shadow-lg border border-blue-200/60 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/30 dark:to-gray-950">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold text-yellow-900 dark:text-yellow-200">Visitantes (simulado)</CardTitle>
              <Eye className="w-7 h-7 text-yellow-600 dark:text-yellow-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold tracking-tight text-yellow-900 dark:text-yellow-100">{kpis.visitors.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics chart real */}
  <Card className="shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-bold">Evolução de Vendas</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Semanal</span>
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              <span className="text-xs text-gray-500">Faturamento</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Transações Recentes Simuladas */}
        <Card className="shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left">
                <thead>
                  <tr className="text-gray-500 border-b">
                    <th className="py-2 pr-4">ID</th>
                    <th className="py-2 pr-4">Cliente</th>
                    <th className="py-2 pr-4">Valor</th>
                    <th className="py-2 pr-4">Data</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-mono">{t.id}</td>
                      <td className="py-2 pr-4">{t.cliente}</td>
                      <td className="py-2 pr-4">{t.valor}</td>
                      <td className="py-2 pr-4">{t.data}</td>
                      <td className={`py-2 pr-4 font-semibold ${t.status === 'Concluída' ? 'text-green-600' : t.status === 'Pendente' ? 'text-yellow-600' : 'text-red-600'}`}>{t.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right sidebar: Customers List & Analytics Overview */}
      <div className="w-full lg:w-[340px] flex flex-col gap-8">
  <Card className="shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {customers.map((c) => (
                <li key={c.email} className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 shadow border border-gray-200 dark:border-gray-800">
                    <AvatarFallback>{c.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-base text-gray-900 dark:text-gray-100">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.email}</div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
  <Card className="shadow-lg border border-blue-200/30 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Resumo Analítico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-72">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={90}>
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}
