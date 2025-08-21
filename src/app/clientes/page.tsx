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
          {loading ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Carregando...</div>
          ) : erro ? (
            <div className="text-center py-8 text-red-500 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">{erro}</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-gray-950 rounded-xl shadow border border-gray-100 dark:border-gray-900">Nenhum cliente encontrado.</div>
          ) : (
             paginados.map((c, i) => (
              <div key={i} className="rounded-xl shadow-lg border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-950 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-800 dark:text-blue-100">{c.nome}</span>
                </div>
                <div className="flex flex-wrap gap-2 text-xs mb-1">
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded px-2 py-1">CPF/CNPJ: <b>{formatarCpfCnpj(c.cpfCnpj)}</b></span>
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded px-2 py-1">Cidade: <b>{c.cidade} - {c.estado}</b></span>
                  <span className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 rounded px-2 py-1">Telefone: <b>{formatarTelefone(c.telefone)}</b></span>
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
                          className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 disabled:opacity-50"
                          onClick={() => setPagina(p => Math.max(1, p - 1))}
                          disabled={pagina === 1}
                        >Anterior</button>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Página {pagina} de {totalPaginas}</span>
                        <button
                          className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 disabled:opacity-50"
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
      </div>
    </main>
  );
}
