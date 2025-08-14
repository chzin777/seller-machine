
"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '../../../lib/supabase/browser';
import { Link2, TrendingUp, Search } from 'lucide-react';
type Assoc = { product_a_id: number; product_b_id: number; support_count: number; confidence: number; lift: number; a_name?: string; b_name?: string };

export default function AssociacoesPage() {
  const [data, setData] = useState<Assoc[]>([]);
  const [busca, setBusca] = useState('');
  // Estado para detectar menu lateral aberto/fechado
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detecta o estado do menu lateral via evento customizado
  useEffect(() => {
    setIsClient(true);
    function handleSidebar(event: Event) {
      const customEvent = event as CustomEvent;
      if (typeof customEvent.detail === 'boolean') setSidebarOpen(customEvent.detail);
    }
    window.addEventListener('sidebar-toggle', handleSidebar);
    return () => window.removeEventListener('sidebar-toggle', handleSidebar);
  }, []);

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
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900 mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
              <th className="p-3 font-semibold text-left">Produto de Origem</th>
              <th className="p-3 font-semibold text-left">Produto Associado</th>
              <th className="p-3 font-semibold text-left" title="Quantidade de vezes que os dois produtos foram comprados juntos">Suporte <span className='text-xs text-blue-400'>(Qntd. juntos)</span></th>
              <th className="p-3 font-semibold text-left" title="Probabilidade de quem compra o produto de origem também comprar o associado">Confiança <span className='text-xs text-blue-400'>(% juntos)</span></th>
              <th className="p-3 font-semibold text-left" title="Quanto a associação é mais forte do que o acaso">Força (Lift) <TrendingUp className="inline w-4 h-4 ml-1 text-blue-400 align-text-bottom" /></th>
              <th className="p-3 font-semibold text-left">Explicação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma associação encontrada.</td>
              </tr>
            ) : (
              filtrados.map((row, i) => (
                <tr key={i} className="border-t border-gray-100 dark:border-gray-900 hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition">
                  <td className="p-3 font-bold text-blue-800 dark:text-blue-100">{row.a_name}</td>
                  <td className="p-3 font-bold text-blue-700 dark:text-blue-200">{row.b_name}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300 text-center">{row.support_count}</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300 text-center">{(row.confidence*100).toFixed(1)}%</td>
                  <td className="p-3 text-gray-700 dark:text-gray-300 text-center">{row.lift.toFixed(2)}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300 text-sm">
                    Quem compra <span className="font-semibold text-blue-800 dark:text-blue-100">{row.a_name}</span> também costuma comprar <span className="font-semibold text-blue-700 dark:text-blue-200">{row.b_name}</span>.
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Card de legenda fixo no canto inferior esquerdo, respeitando o menu lateral (só no client) */}
        {isClient && (
          <div
            className="fixed bottom-8 z-40 transition-all duration-300"
            style={{
              left: sidebarOpen ? 'calc(256px + 2rem)' : 'calc(64px + 2rem)',
            }}
          >
            <div className="bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-900 rounded-xl shadow-xl p-4 w-72 text-xs text-gray-700 dark:text-gray-200">
              <div className="font-bold text-blue-800 dark:text-blue-200 mb-2">Legenda das Métricas</div>
              <div className="mb-1"><b>Suporte</b>: Quantidade de vezes que os dois produtos foram comprados juntos.</div>
              <div className="mb-1"><b>Confiança</b>: Probabilidade (%) de quem compra o produto de origem também comprar o associado.</div>
              <div><b>Força (Lift)</b>: Quanto a associação é mais forte do que o acaso (quanto maior, mais relevante).</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
