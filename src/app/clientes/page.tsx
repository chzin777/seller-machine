"use client";
import { useState, useEffect, useMemo } from 'react';
import { Users, Search } from 'lucide-react';

// Função para formatar CPF
function formatarCPF(cpf: string) {
  const num = cpf.replace(/\D/g, '');
  if (num.length !== 11) return cpf;
  return num.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para formatar CNPJ
function formatarCNPJ(cnpj: string) {
  const num = cnpj.replace(/\D/g, '');
  if (num.length !== 14) return cnpj;
  return num.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Função para formatar CPF ou CNPJ
function formatarCpfCnpj(valor: string) {
  const num = valor.replace(/\D/g, '');
  if (num.length === 11) return formatarCPF(num);
  if (num.length === 14) return formatarCNPJ(num);
  return valor;
}

// Função para formatar telefone (99) 9 9999-9999
function formatarTelefone(telefone?: string | null) {
  if (!telefone) return '';
  const num = telefone.replace(/\D/g, '');
  if (num.length === 11) {
    return num.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4');
  } else if (num.length === 10) {
    return num.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return telefone;
}

type Cliente = {
  id: number;
  nome: string;
  cpfCnpj: string;
  cidade: string;
  estado: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cep: string;
  telefone: string;
};


export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  useEffect(() => {
    const buscarClientes = async () => {
      setLoading(true);
      setErro('');
      try {
  const res = await fetch('/api/proxy?url=/api/clientes');
        if (!res.ok) throw new Error('Erro ao buscar clientes');
  const data = await res.json();
  console.log('Resposta clientes:', data);
  setClientes(Array.isArray(data) ? data : (data.data || []));
      } catch (e) {
        setErro('Erro ao buscar clientes.');
        setClientes([]);
      } finally {
        setLoading(false);
      }
    };
    buscarClientes();
  }, []);

  const filtrados = useMemo(() => (
    Array.isArray(clientes)
      ? clientes.filter(c =>
          c.nome.toLowerCase().includes(busca.toLowerCase()) ||
          c.cpfCnpj.toLowerCase().includes(busca.toLowerCase()) ||
          c.cidade.toLowerCase().includes(busca.toLowerCase()) ||
          c.estado.toLowerCase().includes(busca.toLowerCase())
        )
      : []
  ), [clientes, busca]);

  const totalPaginas = Math.ceil(filtrados.length / porPagina) || 1;
  const paginados = filtrados.slice((pagina - 1) * porPagina, pagina * porPagina);

  // Sempre que a busca mudar, volta para página 1
  useEffect(() => { setPagina(1); }, [busca]);
  return (
    <main className="max-w-6xl mx-auto py-6 px-3 sm:px-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 shadow flex-shrink-0">
          <Users className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate">Clientes</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">Veja a lista de clientes cadastrados e seus dados principais.</p>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          className="pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base transition"
          placeholder="Buscar cliente..."
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
          ) : erro ? (
            <div className="text-center py-8 text-red-500 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">{erro}</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Nenhum cliente encontrado.</div>
          ) : (
             paginados.map((c, i) => (
              <div key={i} className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {c.nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-blue-800 dark:text-blue-100 text-base leading-tight truncate">{c.nome}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatarCpfCnpj(c.cpfCnpj)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg px-3 py-2">
                    <span className="text-blue-600 dark:text-blue-300 font-medium">Cidade</span>
                    <p className="text-blue-900 dark:text-blue-200 font-semibold mt-1">{c.cidade} - {c.estado}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-2">
                    <span className="text-green-600 dark:text-green-300 font-medium">Telefone</span>
                    <p className="text-green-900 dark:text-green-200 font-semibold mt-1">{formatarTelefone(c.telefone) || 'N/A'}</p>
                  </div>
                </div>
                {c.logradouro && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2">
                    <span className="font-medium">Endereço: </span>
                    {c.logradouro}, {c.numero} - {c.bairro} - CEP: {c.cep}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        {/* Desktop: Tabela */}
        <div className="hidden lg:block overflow-x-auto rounded-xl shadow-lg bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200">
                 <th className="p-3 font-semibold text-left">Nome</th>
                 <th className="p-3 font-semibold text-left">CPF/CNPJ</th>
                 <th className="p-3 font-semibold text-left">Cidade</th>
                 <th className="p-3 font-semibold text-left">Estado</th>
                 <th className="p-3 font-semibold text-left">Telefone</th>
              </tr>
            </thead>
            <tbody>
               {loading ? (
                 <tr>
                   <td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td>
                 </tr>
               ) : erro ? (
                 <tr>
                   <td colSpan={5} className="text-center py-8 text-red-500">{erro}</td>
                 </tr>
               ) : filtrados.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="text-center py-8 text-gray-400">Nenhum cliente encontrado.</td>
                 </tr>
               ) : (
                 paginados.map((c, i) => (
                   <tr key={i} className="border-t border-gray-100 dark:border-gray-900 hover:bg-blue-50/40 dark:hover:bg-blue-900/40 transition">
                     <td className="p-3 font-medium text-gray-800 dark:text-gray-100">{c.nome}</td>
                     <td className="p-3 text-gray-700 dark:text-gray-300">{formatarCpfCnpj(c.cpfCnpj)}</td>
                     <td className="p-3 text-gray-700 dark:text-gray-300">{c.cidade}</td>
                     <td className="p-3 text-gray-700 dark:text-gray-300">{c.estado}</td>
                     <td className="p-3 text-gray-700 dark:text-gray-300">{formatarTelefone(c.telefone)}</td>
                   </tr>
                 ))
               )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={5} className="py-4">
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
