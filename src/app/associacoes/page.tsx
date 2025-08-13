
"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '../../../lib/supabase/browser';
import { Link2, TrendingUp, Search } from 'lucide-react';
type Assoc = { product_a_id: number; product_b_id: number; support_count: number; confidence: number; lift: number; a_name?: string; b_name?: string };

export default function AssociacoesPage() {
  const [data, setData] = useState<Assoc[]>([]);
  const [busca, setBusca] = useState('');
  useEffect(() => {
    const buscarDados = async () => {
      const supabase = createBrowserClient();
      // Busca associações e nomes dos produtos
    const { data } = await supabase
        .from('product_associations')
        .select('product_a_id, product_b_id, support_count, confidence, lift, a:product_a_id(name), b:product_b_id(name)')
        .order('support_count', { ascending: false })
        .limit(50);
      if (data) {
        setData(data.map(row => ({
          ...row,
          a_name: Array.isArray(row.a) && row.a[0]?.name ? row.a[0].name : String(row.product_a_id),
          b_name: Array.isArray(row.b) && row.b[0]?.name ? row.b[0].name : String(row.product_b_id),
        })));
      }
    };
    buscarDados();
  }, []);
  const filtrados = data.filter(row =>
    (row.a_name?.toLowerCase().includes(busca.toLowerCase()) ||
     row.b_name?.toLowerCase().includes(busca.toLowerCase()))
  );
  return (
    <main className="max-w-4xl mx-auto py-10 px-2 sm:px-0">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow">
          <Link2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Associações de Produtos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Veja as principais relações entre produtos vendidos juntos.</p>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-base transition"
          placeholder="Buscar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
              <th className="p-3 font-semibold text-left">Produto A</th>
              <th className="p-3 font-semibold text-left">Produto B</th>
              <th className="p-3 font-semibold text-left">Suporte</th>
              <th className="p-3 font-semibold text-left">Confiança</th>
              <th className="p-3 font-semibold text-left">Lift <TrendingUp className="inline w-4 h-4 ml-1 text-blue-400 align-text-bottom" /></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-gray-400">Nenhuma associação encontrada.</td>
              </tr>
            ) : (
              filtrados.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-900 hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition">
                  <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{row.a_name}</td>
                  <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{row.b_name}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{row.support_count}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{(row.confidence*100).toFixed(1)}%</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300">{row.lift.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
