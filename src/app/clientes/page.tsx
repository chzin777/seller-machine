"use client";
import { useState, useEffect, useMemo } from 'react';
import { Users, Search, Database, Wifi, WifiOff } from 'lucide-react';
import HistoricoComprasModal from '../../components/HistoricoComprasModal';
import { useClientes } from '../../hooks/useDashboardData';
import { GRAPHQL_CONFIG } from '../../config/graphql';

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

// Tipo para dados REST API
type ClienteRest = {
  id: number;
  nome: string;
  cpfCnpj?: string;
  cidade?: string;
  estado?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cep?: string;
  telefone?: string;
  email?: string;
};

// Tipo para dados GraphQL
type ClienteGraphQL = {
  id: number;
  nome: string;
  cpfCnpj?: string;
  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;
  total_pedidos?: number;
  valor_total?: number;
};

// Tipo união para compatibilidade
type Cliente = ClienteRest & ClienteGraphQL;


export default function ClientesPage() {
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  
  // Estados para REST API (fallback)
  const [clientesRest, setClientesRest] = useState<Cliente[]>([]);
  const [loadingRest, setLoadingRest] = useState(false);
  const [erroRest, setErroRest] = useState('');

  // GraphQL hook (quando habilitado)
  const { 
    data: clientesDataGraphQL, 
    loading: loadingGraphQL, 
    error: erroGraphQL,
    refetch: refetchGraphQL
  } = useClientes(porPagina, (pagina - 1) * porPagina, busca);





  // Buscar via REST API quando GraphQL está desabilitado OU quando GraphQL falha
  useEffect(() => {
    // Se GraphQL está desabilitado, usar REST imediatamente
    if (!GRAPHQL_CONFIG.enabled) {
      buscarClientesRest();
      return;
    }
    
    // Se GraphQL está habilitado mas com erro, fazer fallback para REST
    if (GRAPHQL_CONFIG.enabled && erroGraphQL) {
      buscarClientesRest();
      return;
    }
  }, [erroGraphQL]);
  
  const buscarClientesRest = async () => {
    setLoadingRest(true);
    setErroRest('');
    try {
      const res = await fetch('/api/proxy?url=/api/clientes');
      if (!res.ok) throw new Error('Erro ao buscar clientes');
      const data = await res.json();
      setClientesRest(Array.isArray(data) ? data : (data.data || []));
    } catch {
      setErroRest('Erro ao buscar clientes via REST API.');
      setClientesRest([]);
    } finally {
      setLoadingRest(false);
    }
  };



  // Determinar qual fonte de dados usar
  // Usar GraphQL se estiver habilitado e não houver erro (mesmo se ainda estiver carregando)
  const usingGraphQL = GRAPHQL_CONFIG.enabled && !erroGraphQL;
  const clientes = usingGraphQL 
    ? (clientesDataGraphQL?.clientes || [])
    : clientesRest;
  const totalRegistros = usingGraphQL 
    ? (clientesDataGraphQL?.total || 0)
    : clientesRest.length;
  const loading = usingGraphQL ? loadingGraphQL : loadingRest;
  const erro = usingGraphQL ? erroGraphQL : erroRest;
  const refetch = usingGraphQL ? refetchGraphQL : () => window.location.reload();

  // A API já retorna dados filtrados, não precisa filtrar no frontend
  const filtrados = Array.isArray(clientes) ? clientes : [];

  // Componente de status da API
  const ApiStatus = () => (
    <div className="flex items-center gap-2 text-xs">
      {usingGraphQL ? (
        <>
          <Wifi className="w-4 h-4 text-green-600" />
          <span className="text-green-600 font-medium">GraphQL</span>
          {loading && <span className="text-blue-600">Carregando...</span>}
          {erro && (
            <div className="flex items-center gap-2">
              <span className="text-red-600 text-xs">Erro</span>
              <button 
                onClick={refetch}
                className="text-red-600 hover:text-red-700 underline text-xs"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <Database className="w-4 h-4 text-blue-600" />
          <span className="text-blue-600 font-medium">REST API</span>
          {loading && <span className="text-blue-600">Carregando...</span>}
          {erro && (
            <button 
              onClick={refetch}
              className="text-red-600 hover:text-red-700 underline"
            >
              Erro - Recarregar
            </button>
          )}
        </>
      )}
    </div>
  );

  const totalPaginas = Math.ceil(totalRegistros / porPagina) || 1;
  const paginados = filtrados; // GraphQL já retorna os dados paginados

  // Sempre que a busca mudar, volta para página 1
  useEffect(() => { setPagina(1); }, [busca]);

  const abrirHistorico = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setClienteSelecionado(null);
  };
  return (
    <main className="max-w-6xl mx-auto py-6 px-3 sm:px-6">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-100 text-blue-700 shadow flex-shrink-0">
          <Users className="w-5 h-5 sm:w-7 sm:h-7" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight truncate text-[#1e3a8a]">Clientes</h1>
            <ApiStatus />
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2 sm:line-clamp-none">Veja a lista de clientes cadastrados e seus dados principais.</p>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
        <input
          id="busca-cliente"
          className="pl-9 sm:pl-10 pr-4 py-2 sm:py-3 rounded-lg border border-gray-200 bg-white shadow-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base transition"
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
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow border border-gray-100">Carregando...</div>
          ) : erro ? (
            <div className="text-center py-8 text-red-500 bg-white rounded-xl shadow border border-gray-100">{erro}</div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow border border-gray-100">Nenhum cliente encontrado.</div>
          ) : (
             paginados.map((c, i) => (
              <div 
                key={i} 
                className="rounded-xl shadow-lg border border-gray-100 bg-white p-4 flex flex-col gap-3 hover:shadow-xl hover:bg-blue-50 transition cursor-pointer"
                onClick={() => abrirHistorico(c)}
              >
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {c.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-blue-800 text-base leading-tight truncate">{c.nome}</h3>
                    <p className="text-xs text-gray-500 mt-1">{c.cpfCnpj ? formatarCpfCnpj(c.cpfCnpj) : 'CPF/CNPJ não informado'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 rounded-lg px-3 py-2">
                    <span className="text-blue-600 font-medium">Localização</span>
                    <p className="text-blue-900 font-semibold mt-1">
                      {c.cidade && c.estado ? `${c.cidade} - ${c.estado}` : c.cidade || c.estado || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg px-3 py-2">
                    <span className="text-green-600 font-medium">Contato</span>
                    <p className="text-green-900 font-semibold mt-1">
                      {formatarTelefone(c.telefone) || 'N/A'}
                    </p>
                  </div>
                </div>

                {!usingGraphQL && (c as ClienteRest).logradouro && (
                  <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium">Endereço: </span>
                    {(c as ClienteRest).logradouro}, {(c as ClienteRest).numero} - {(c as ClienteRest).bairro} - CEP: {(c as ClienteRest).cep}
                  </div>
                )}
                <div className="text-xs text-blue-600 mt-2 font-medium">Clique para ver histórico de compras</div>
              </div>
            ))
          )}
        </div>
        {/* Desktop: Tabela */}
        <div className="hidden lg:block overflow-x-auto rounded-xl shadow-lg bg-white border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                 <th className="p-3 font-semibold text-left">Nome</th>
                 <th className="p-3 font-semibold text-left">CPF/CNPJ</th>
                 <th className="p-3 font-semibold text-left">Localização</th>
                 <th className="p-3 font-semibold text-left">Contato</th>
              </tr>
            </thead>
            <tbody>
               {loading ? (
                 <tr>
                   <td colSpan={4} className="text-center py-8 text-gray-400">Carregando...</td>
                 </tr>
               ) : erro ? (
                 <tr>
                   <td colSpan={4} className="text-center py-8 text-red-500">{erro}</td>
                 </tr>
               ) : filtrados.length === 0 ? (
                 <tr>
                   <td colSpan={4} className="text-center py-8 text-gray-400">Nenhum cliente encontrado.</td>
                 </tr>
               ) : (
                 paginados.map((c, i) => (
                   <tr 
                     key={i} 
                     className="border-t border-gray-100 hover:bg-blue-50/40 transition cursor-pointer"
                     onClick={() => abrirHistorico(c)}
                   >
                     <td className="p-3 font-medium text-gray-800">{c.nome}</td>
                     <td className="p-3 text-gray-700">{c.cpfCnpj ? formatarCpfCnpj(c.cpfCnpj) : 'N/A'}</td>
                     <td className="p-3 text-gray-700">
                       {c.cidade && c.estado ? `${c.cidade} - ${c.estado}` : c.cidade || c.estado || 'N/A'}
                     </td>
                     <td className="p-3 text-gray-700">
                       {formatarTelefone(c.telefone) || 'N/A'}
                     </td>
                   </tr>
                 ))
               )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} className="py-4">
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
                    {totalRegistros > porPagina && (
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
        {totalRegistros > porPagina && (
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
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium hover:cursor-pointer"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-700 px-3 py-2 bg-gray-100 rounded-lg font-medium">
                {pagina} de {totalPaginas}
              </span>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium hover:cursor-pointer"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de Histórico de Compras */}
      {modalAberto && clienteSelecionado && (
        <HistoricoComprasModal
          clienteId={clienteSelecionado.id}
          clienteNome={clienteSelecionado.nome}
          isOpen={modalAberto}
          onClose={fecharModal}
        />
      )}
    </main>
  );
}
