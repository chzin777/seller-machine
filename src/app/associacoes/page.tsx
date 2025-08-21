
"use client";

// Função para corrigir acentuação e "ç" nos tipos de produto
function corrigirAcentuacao(tipo: string): string {
  return tipo
    .replace(/Peca/gi, 'Peça')
    .replace(/Servico/gi, 'Serviço')
    .replace(/Combinacao/gi, 'Combinação')
    .replace(/Promocao/gi, 'Promoção')
    .replace(/Refeicao/gi, 'Refeição')
    .replace(/Almoco/gi, 'Almoço')
    .replace(/Lanche/gi, 'Lanche')
    .replace(/Bebida/gi, 'Bebida')
    .replace(/Sobremesa/gi, 'Sobremesa')
    .replace(/Cafe/gi, 'Café')
    .replace(/Acai/gi, 'Açaí')
    .replace(/Doce/gi, 'Doce')
    .replace(/Salgado/gi, 'Salgado')
    .replace(/Outros/gi, 'Outros');
}
import { useEffect, useState } from 'react';
import { Link2, TrendingUp, Search } from 'lucide-react';
type Produto = {
  id: number;
  descricao: string;
  tipo?: string;
  Tipo_Produto?: string;
  preco: string;
};

type Assoc = {
  product_a_id: number;
  product_b_id: number;
  support_count: number;
  confidence: number;
  lift: number;
  a_name: string;
  b_name: string;
  a_tipo: string;
  b_tipo: string;
};

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
      try {
        const res = await fetch('/api/proxy?url=/api/produtos');
        if (!res.ok) throw new Error('Erro ao buscar produtos');
        const produtos: Produto[] = await res.json();
        console.log('Produtos recebidos:', produtos);
        // Simula associações: para cada produto, associa com outros 2 produtos seguintes (circular)
        const associacoes: Assoc[] = [];
        for (let i = 0; i < produtos.length; i++) {
          const a = produtos[i];
          for (let j = 1; j <= 2; j++) {
            const b = produtos[(i + j) % produtos.length];
            if (a.id !== b.id) {
              associacoes.push({
                product_a_id: a.id,
                product_b_id: b.id,
                support_count: Math.floor(Math.random() * 50) + 1, // valor fictício
                confidence: Math.random() * 0.5 + 0.5, // entre 0.5 e 1
                lift: Math.random() * 2 + 1, // entre 1 e 3
                a_name: a.descricao || '',
                b_name: b.descricao || '',
                a_tipo: corrigirAcentuacao(String(a.tipo ?? a.Tipo_Produto ?? '')),
                b_tipo: corrigirAcentuacao(String(b.tipo ?? b.Tipo_Produto ?? '')),

              });
            }
          }
        }
        setData(associacoes);
      } catch (e) {
        setData([]);
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
      <div className="flex items-center gap-3 mb-8 mt-16 sm:mt-0">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow">
          <Link2 className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight">Produtos Comprados Juntos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Veja exemplos de produtos que costumam ser comprados juntos.</p>
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
      {/* Mobile: Cards, Desktop: Tabela */}
      <div className="mt-4">
        {/* Mobile: Cards */}
        <div className="flex flex-col gap-4 sm:hidden">
          {filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Nenhuma associação encontrada.</div>
          ) : (
            filtrados.map((row, i) => (
              <div key={i} className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-800 dark:text-blue-100">{row.a_name}</span>
                  <span className="text-xs text-gray-400">({row.a_tipo})</span>
                  <span className="text-xs text-gray-400">+</span>
                  <span className="font-bold text-blue-700 dark:text-blue-200">{row.b_name}</span>
                  <span className="text-xs text-gray-400">({row.b_tipo})</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-1">
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded px-2 py-1">Comprados juntos <b>{row.support_count}</b> vezes</span>
                  <span className="bg-green-50 dark:bg-green-900 text-green-900 dark:text-green-200 rounded px-2 py-1">Probabilidade de compra: <b>{(row.confidence * 100).toFixed(0)}%</b></span>
                </div>
                <div className="text-gray-600 dark:text-gray-300 text-xs">
                  Clientes que compraram <span className="font-semibold text-blue-800 dark:text-blue-100">{row.a_name}</span> também compraram <span className="font-semibold text-blue-700 dark:text-blue-200">{row.b_name}</span>.
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop: Tabela */}
        <div className="hidden sm:flex justify-center w-full">
          <div className="overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900" style={{ minWidth: '1500px', maxWidth: '1800px' }}>
            <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                <th className="p-3 font-semibold text-left">Produto A</th>
                <th className="p-3 font-semibold text-left w-40 min-w-[8rem]">Tipo A</th>
                <th className="p-3 font-semibold text-left">Produto B</th>
                <th className="p-3 font-semibold text-left w-40 min-w-[8rem]">Tipo B</th>
                <th className="p-3 font-semibold text-left">Comprados juntos</th>
                <th className="p-3 font-semibold text-left">Probabilidade de compra</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">Nenhuma associação encontrada.</td>
                </tr>
              ) : (
                filtrados.map((row, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-gray-900 hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition">
                    <td className="p-3 font-bold text-blue-800 dark:text-blue-100">{row.a_name}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 text-left w-40 min-w-[8rem]">{row.a_tipo}</td>
                    <td className="p-3 font-bold text-blue-700 dark:text-blue-200">{row.b_name}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 text-left w-40 min-w-[8rem]">{row.b_tipo}</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 text-center">{row.support_count} vezes</td>
                    <td className="p-3 text-gray-700 dark:text-gray-300 text-center">{(row.confidence * 100).toFixed(0)}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </main>
  );
}
