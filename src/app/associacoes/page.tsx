
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
import { useEffect, useState, useMemo } from 'react';
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
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    buscarDados();
  }, []);

  const filtrados = useMemo(() => (
    data.filter(row =>
      (row.a_name?.toLowerCase().includes(busca.toLowerCase()) ||
       row.b_name?.toLowerCase().includes(busca.toLowerCase()))
    )
  ), [data, busca]);

  const totalPaginas = Math.ceil(filtrados.length / porPagina) || 1;
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Sempre que a busca mudar, volta para página 1
  useEffect(() => { setPagina(1); }, [busca]);

  return (
    <main className="max-w-6xl mx-auto py-6 px-3 sm:px-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow flex-shrink-0">
          <Link2 className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate">Produtos Comprados Juntos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">Veja exemplos de produtos que costumam ser comprados juntos.</p>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          className="pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base transition"
          placeholder="Buscar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      {/* Mobile: Cards, Desktop: Tabela */}
      <div className="mt-4">
        {/* Mobile: Cards */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Nenhuma associação encontrada.</div>
          ) : (
            paginados.map((row, i) => (
              <div key={i} className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-4 flex flex-col gap-3">
                {/* Produtos associados */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">A</span>
                      <span className="font-bold text-blue-800 dark:text-blue-100 text-sm truncate">{row.a_name}</span>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-300 ml-8">{row.a_tipo}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold flex items-center justify-center">B</span>
                      <span className="font-bold text-green-800 dark:text-green-100 text-sm truncate">{row.b_name}</span>
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-300 ml-8">{row.b_tipo}</span>
                  </div>
                </div>
                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2">
                    <span className="text-blue-600 dark:text-blue-300 font-medium text-xs">Freq. Conjunta</span>
                    <p className="text-blue-900 dark:text-blue-200 font-bold text-sm">{row.support_count}x</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-2">
                    <span className="text-green-600 dark:text-green-300 font-medium text-xs">Probabilidade</span>
                    <p className="text-green-900 dark:text-green-200 font-bold text-sm">{(row.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2 text-center">
                  Quem compra <b>{row.a_name}</b> também compra <b>{row.b_name}</b>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop: Tabela */}
        <div className="hidden lg:block overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">Carregando...</td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400">Nenhuma associação encontrada.</td>
                </tr>
              ) : (
                paginados.map((row, i) => (
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
            <tfoot>
              <tr>
                <td colSpan={6} className="py-4">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="porPagina" className="text-sm text-gray-700 dark:text-gray-300">Exibir por página:</label>
                      <select
                        id="porPagina"
                        className="border rounded px-2 py-1 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200"
                        value={porPagina}
                        onChange={e => {
                          setPorPagina(Number(e.target.value));
                          setPagina(1);
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>
                    {filtrados.length > porPagina && (
                      <div className="flex items-center gap-2">
                        <button
                          className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 disabled:opacity-50 hover:cursor-pointer"
                          onClick={() => setPagina(p => Math.max(1, p - 1))}
                          disabled={pagina === 1}
                        >Anterior</button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Página {pagina} de {totalPaginas}</span>
                        <button
                          className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 disabled:opacity-50 hover:cursor-pointer"
                          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                          disabled={pagina === totalPaginas}
                        >Próxima</button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        {/* Paginação para Mobile */}
        {filtrados.length > porPagina && (
          <div className="lg:hidden mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <label htmlFor="porPaginaMobile" className="text-sm text-gray-700 dark:text-gray-300">Por página:</label>
              <select
                id="porPaginaMobile"
                className="border rounded px-2 py-1 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 text-sm"
                value={porPagina}
                onChange={e => {
                  setPorPagina(Number(e.target.value));
                  setPagina(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">
                {pagina} de {totalPaginas}
              </span>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
