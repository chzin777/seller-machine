
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
  vendas_produto_a?: number;
  vendas_produto_b?: number;
};

export default function AssociacoesPage() {
  const [data, setData] = useState<Assoc[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroTipoA, setFiltroTipoA] = useState('');
  const [filtroTipoB, setFiltroTipoB] = useState('');
  // Ordenação removida
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
        // Busca via proxy interno para evitar CORS
        const res = await fetch('/api/proxy?url=/api/associacoes');
        if (!res.ok) throw new Error('Erro ao buscar associações');
        const json = await res.json();
        // Se a resposta vier paginada, use json.data, senão use json direto
        const associacoes = Array.isArray(json) ? json : json.data;
        const dataFormatada: Assoc[] = associacoes.map((item: any) => ({
          product_a_id: item.produto_a_id,
          product_b_id: item.produto_b_id,
          support_count: item.suporte ?? item.support_count ?? 0,
          confidence: item.confianca ?? item.confidence ?? 0,
          lift: item.lift ?? 0,
          a_name: item.a_nome ?? item.a_name ?? '',
          b_name: item.b_nome ?? item.b_name ?? '',
          a_tipo: corrigirAcentuacao(item.a_tipo ?? ''),
          b_tipo: corrigirAcentuacao(item.b_tipo ?? ''),
          vendas_produto_a: item.vendas_produto_a ?? 0,
          vendas_produto_b: item.vendas_produto_b ?? 0,
        }));
        setData(dataFormatada);
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    buscarDados();
  }, []);


  const filtrados = useMemo(() => {
    let filtered = data.filter(row =>
      (row.a_name?.toLowerCase().includes(busca.toLowerCase()) ||
       row.b_name?.toLowerCase().includes(busca.toLowerCase()))
    );
    if (filtroTipoA) filtered = filtered.filter(row => row.a_tipo === filtroTipoA);
    if (filtroTipoB) filtered = filtered.filter(row => row.b_tipo === filtroTipoB);
    return filtered;
  }, [data, busca, filtroTipoA, filtroTipoB]);

  const totalPaginas = Math.ceil(filtrados.length / porPagina) || 1;
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Sempre que a busca mudar, volta para página 1
  useEffect(() => { setPagina(1); }, [busca]);

  // Função para alternar ordenação


  return (
    <main className="max-w-6xl mx-auto py-6 px-3 sm:px-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 shadow flex-shrink-0">
          <Link2 className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate text-[#1e3a8a]">Produtos Comprados Juntos</h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">Veja exemplos de produtos que costumam ser comprados juntos.</p>
        </div>
      </div>
      <div className="relative mb-6 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            className="pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 bg-white shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base transition"
            placeholder="Buscar produto geral..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            className="rounded-lg border border-gray-200 bg-white shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition px-3 py-2"
            value={filtroTipoA}
            onChange={e => setFiltroTipoA(e.target.value)}
          >
            <option value="">Filtrar Tipo A</option>
            {[...new Set(data.map(row => row.a_tipo).filter(Boolean))].map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          <select
            className="rounded-lg border border-gray-200 bg-white shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm transition px-3 py-2"
            value={filtroTipoB}
            onChange={e => setFiltroTipoB(e.target.value)}
          >
            <option value="">Filtrar Tipo B</option>
            {[...new Set(data.map(row => row.b_tipo).filter(Boolean))].map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>
      </div>
      {/* Mobile: Cards, Desktop: Tabela */}
      <div className="mt-4">
        {/* Mobile: Cards */}
        <div className="flex flex-col gap-3 sm:gap-4 lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow border border-gray-100">Carregando...</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow border border-gray-100">Nenhuma associação encontrada.</div>
          ) : (
            paginados.map((row, i) => (
              <div key={i} className="rounded-xl shadow-lg border border-gray-100 bg-white p-4 flex flex-col gap-3">
                {/* Produtos associados */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center justify-center">A</span>
                      <span className="font-bold text-blue-800 text-sm truncate">{row.a_name}</span>
                    </div>
                    <span className="text-xs text-blue-600 ml-8">{row.a_tipo}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 bg-green-600 text-white rounded-full text-xs font-bold flex items-center justify-center">B</span>
                      <span className="font-bold text-green-800 text-sm truncate">{row.b_name}</span>
                    </div>
                    <span className="text-xs text-green-600 ml-8">{row.b_tipo}</span>
                  </div>
                </div>
                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-blue-600 font-medium text-xs">Freq. Conjunta</span>
                    <p className="text-blue-900 font-bold text-sm">{row.support_count}x</p>
                  </div>
                  <div className="bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-green-600 font-medium text-xs">Probabilidade</span>
                    <p className="text-green-900 font-bold text-sm">{(row.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>
                <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 text-center">
                  Quem compra <b>{row.a_name}</b> também compra <b>{row.b_name}</b>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop: Tabela */}
        <div className="hidden lg:block overflow-x-auto rounded-xl shadow-lg bg-white border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-3 font-semibold text-left">Produto A</th>
                <th className="p-3 font-semibold text-left w-40 min-w-[8rem]">Tipo A</th>
                <th className="p-3 font-semibold text-left">Produto B</th>
                <th className="p-3 font-semibold text-left w-40 min-w-[8rem]">Tipo B</th>
                <th className="p-3 font-semibold text-left">Vendas Produto A</th>
                <th className="p-3 font-semibold text-left">Vendas Produto B</th>
                <th className="p-3 font-semibold text-left">Vendido juntos</th>
                <th className="p-3 font-semibold text-left">Probabilidade de Venda</th>
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
                  <tr key={i} className="border-t border-gray-100 hover:bg-blue-50/40 transition">
                    <td className="p-3 font-bold text-blue-800">{row.a_name}</td>
                    <td className="p-3 text-gray-700 text-left w-40 min-w-[8rem]">{row.a_tipo}</td>
                    <td className="p-3 font-bold text-blue-700">{row.b_name}</td>
                    <td className="p-3 text-gray-700 text-left w-40 min-w-[8rem]">{row.b_tipo}</td>
                    <td className="p-3 text-gray-700 text-center">{row.vendas_produto_a}</td>
                    <td className="p-3 text-gray-700 text-center">{row.vendas_produto_b}</td>
                    <td className="p-3 text-gray-700 text-center">{row.support_count} vezes</td>
                    <td className="p-3 text-gray-700 text-center">{(row.confidence * 100).toFixed(0)}%</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} className="py-4">
                  <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="porPagina" className="text-sm text-gray-700">Exibir por página:</label>
                      <select
                        id="porPagina"
                        className="border rounded px-2 py-1 bg-white text-blue-700"
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
                          className="px-3 py-1 rounded border bg-white text-blue-700 disabled:opacity-50 hover:cursor-pointer"
                          onClick={() => setPagina(p => Math.max(1, p - 1))}
                          disabled={pagina === 1}
                        >Anterior</button>
                        <span className="text-sm text-gray-700">Página {pagina} de {totalPaginas}</span>
                        <button
                          className="px-3 py-1 rounded border bg-white text-blue-700 disabled:opacity-50 hover:cursor-pointer"
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
              <label htmlFor="porPaginaMobile" className="text-sm text-gray-700">Por página:</label>
              <select
                id="porPaginaMobile"
                className="border rounded px-2 py-1 bg-white text-blue-700 text-sm"
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
              <span className="text-sm text-gray-700 px-3 py-2 bg-gray-100 rounded-lg font-medium">
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
