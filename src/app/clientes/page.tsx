"use client";
import { useState } from 'react';
import { Users, Search } from 'lucide-react';

type Cliente = { id: number; name: string; email: string; ltv?: number };

// Dados demonstrativos simulados
const clientesDemo: Cliente[] = [
  { id: 1, name: 'Carla Ferreira', email: 'carla@empresa.com', ltv: 23795 },
  { id: 2, name: 'Julio Lima', email: 'julio@empresa.com', ltv: 17708 },
  { id: 3, name: 'Gustavo Gomes', email: 'gustavo@empresa.com', ltv: 12584 },
  { id: 4, name: 'Felipe Goncalves', email: 'felipe@empresa.com', ltv: 9963 },
  { id: 5, name: 'Ana Souza', email: 'ana@empresa.com', ltv: 8750 },
  { id: 6, name: 'Marina Silva', email: 'marina@empresa.com', ltv: 6500 },
  { id: 7, name: 'Pedro Santos', email: 'pedro@empresa.com', ltv: 4300 },
  { id: 8, name: 'Lucas Almeida', email: 'lucas@empresa.com', ltv: 3900 },
  { id: 9, name: 'Fernanda Costa', email: 'fernanda@empresa.com', ltv: 3200 },
  { id: 10, name: 'Rafael Souza', email: 'rafael@empresa.com', ltv: 2100 },
];

export default function ClientesPage() {
  const [busca, setBusca] = useState('');
  const filtrados = clientesDemo.filter(c =>
    c.name.toLowerCase().includes(busca.toLowerCase()) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );
  return (
    <main className="max-w-4xl mx-auto py-10 px-2 sm:px-0">
      <div className="flex items-center gap-3 mb-8 mt-16 sm:mt-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow">
          <Users className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Veja a lista de clientes cadastrados e seus dados principais.</p>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition"
          placeholder="Buscar cliente..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      {/* Mobile: Cards, Desktop: Tabela */}
      <div className="mt-4">
        {/* Mobile: Cards */}
        <div className="flex flex-col gap-4 sm:hidden">
          {filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Nenhum cliente encontrado.</div>
          ) : (
            filtrados.map((c, i) => (
              <div key={i} className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-800 dark:text-blue-100">{c.name}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-1">
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded px-2 py-1">E-mail: <b>{c.email}</b></span>
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded px-2 py-1">LTV: <b>{c.ltv ? `R$ ${Number(c.ltv).toLocaleString()}` : '-'}</b></span>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop: Tabela */}
        <div className="hidden sm:block overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                <th className="p-3 font-semibold text-left">Nome</th>
                <th className="p-3 font-semibold text-left">E-mail</th>
                <th className="p-3 font-semibold text-left">LTV</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-400">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                filtrados.map((c, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-900 hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition">
                    <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{c.name}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{c.email}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300">{c.ltv ? `R$ ${Number(c.ltv).toLocaleString()}` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
