"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Users, 
  TrendingUp,
  ChevronDown,
  Building2,
  UserCheck
} from 'lucide-react';
import { useCarteiraVendedor, useFiliais, useCarteiraVendedorClientes } from '../../hooks/useCarteiraVendedor';
import CarteiraVendedorCard from '../../components/CarteiraVendedorCard';
import MetricasCarteira, { ResumoExecutivoCarteira } from '../../components/MetricasCarteira';
import LoadingSpinner from '../../components/LoadingSpinner';
import ClientesCarteira from '../../components/ClientesCarteira';
import ResumoCarteira from '../../components/ResumoCarteira';
import ScopeIndicator from '../../components/ScopeIndicator';

interface FilterState {
  search: string;
  filialId: number | undefined;
  status: 'todos' | 'ativos' | 'inativos';
  ordenacao: 'nome' | 'receita' | 'cobertura' | 'ranking';
}

type ViewMode = 'vendedores' | 'clientes';

export default function CarteiraVendedorPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    filialId: undefined,
    status: 'todos',
    ordenacao: 'nome'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showMetricas, setShowMetricas] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('vendedores');
  const [selectedVendedor, setSelectedVendedor] = useState<number | undefined>();
  const [periodoMeses, setPeriodoMeses] = useState(6);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  const { data, loading, error, refetch } = useCarteiraVendedor();
  const { filiais, loading: loadingFiliais } = useFiliais();
  const { 
    data: carteiraData, 
    loading: carteiraLoading, 
    error: carteiraError,
    refetch: refetchCarteira 
  } = useCarteiraVendedorClientes(selectedVendedor, periodoMeses);
  
  // Extrair e enriquecer vendedores com dados relacionados
  const vendedores = useMemo(() => {
    if (!data.vendedores) return [];
    
    return data.vendedores.map(vendedor => ({
       ...vendedor,
       cobertura: data.cobertura?.filter(c => c.vendedorId === vendedor.id) || [],
       ranking: data.ranking?.filter(r => r.vendedorId === vendedor.id) || [],
       mix: data.mix?.filter(m => m.vendedorId === vendedor.id) || [],
       receitaVendedor: data.receitaVendedor?.filter(r => r.vendedorId === vendedor.id) || []
     }));
  }, [data]);
  
  // Filtros e ordenação
  const vendedoresFiltrados = useMemo(() => {
    if (!vendedores || vendedores.length === 0) return [];
    let resultado = [...vendedores];
    
    // Filtro por busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      resultado = resultado.filter(vendedor => 
        vendedor.nome.toLowerCase().includes(searchLower) ||
        vendedor.email?.toLowerCase().includes(searchLower) ||
        vendedor.codigo?.toString().includes(searchLower)
      );
    }
    
    // Filtro por filial
    if (filters.filialId) {
      resultado = resultado.filter(vendedor => 
        vendedor.filialId === filters.filialId || vendedor.filial?.id === filters.filialId
      );
    }
    
    // Filtro por status com fallback quando 'ativo' não está disponível
    if (filters.status !== 'todos') {
      resultado = resultado.filter(vendedor => {
        const hasReceita = Array.isArray(vendedor.receitaVendedor) && vendedor.receitaVendedor.some(r => (r.valorTotal || 0) > 0 || (r.quantidadeNotas || 0) > 0);
        const flagAtivo = vendedor.ativo;
        const isAtivo = typeof flagAtivo === 'boolean' ? flagAtivo : hasReceita;
        return filters.status === 'ativos' ? isAtivo : !isAtivo;
      });
    }
    
    // Ordenação
    resultado.sort((a, b) => {
      switch (filters.ordenacao) {
        case 'nome':
          return a.nome.localeCompare(b.nome);
        case 'receita':
          const receitaA = a.receitaVendedor?.reduce((sum, r) => sum + (r.valorTotal || 0), 0) || 0;
          const receitaB = b.receitaVendedor?.reduce((sum, r) => sum + (r.valorTotal || 0), 0) || 0;
          return receitaB - receitaA;
        case 'cobertura':
          const coberturaA = a.cobertura?.reduce((sum, c) => sum + (c.percentualCobertura || 0), 0) / (a.cobertura?.length || 1) || 0;
          const coberturaB = b.cobertura?.reduce((sum, c) => sum + (c.percentualCobertura || 0), 0) / (b.cobertura?.length || 1) || 0;
          return coberturaB - coberturaA;
        case 'ranking':
          const rankingA = typeof a.ranking?.[0]?.posicaoRanking === 'number' ? a.ranking[0].posicaoRanking : 999;
          const rankingB = typeof b.ranking?.[0]?.posicaoRanking === 'number' ? b.ranking[0].posicaoRanking : 999;
          return rankingA - rankingB;
        default:
          return 0;
      }
    });
    
    return resultado;
  }, [vendedores, filters]);

  // Adaptar clientes da API para o formato esperado pelo componente ClientesCarteira
  const clientesAdaptados = useMemo(() => {
    const origem = carteiraData?.clientes || [];
    return origem.map((c: any) => {
      const parseToISOString = (d: any) => {
        const date = new Date(d);
        return isFinite(date.getTime()) ? date.toISOString() : null;
      };
      const ultimaVendaStr = c?.resumo?.ultimaVenda ? parseToISOString(c.resumo.ultimaVenda) : null;
      const primeiraVendaStr = c?.resumo?.primeiraVenda ? parseToISOString(c.resumo.primeiraVenda) : null;
      const dias = ultimaVendaStr ? Math.floor((Date.now() - new Date(ultimaVendaStr).getTime()) / (1000 * 60 * 60 * 24)) : null;
      return {
        id: c?.cliente?.id ?? 0,
        nome: c?.cliente?.nome ?? 'Cliente',
        cpfCnpj: c?.cliente?.cpfCnpj ?? '',
        cidade: c?.cliente?.cidade ?? null,
        estado: c?.cliente?.estado ?? null,
        telefone: c?.cliente?.telefone ?? null,
        vendas: Array.isArray(c?.vendas) ? c.vendas.map((v: any, idx: number) => ({
          id: v?.id != null && !Number.isNaN(Number(v.id)) ? Number(v.id) : idx + 1,
          numeroNota: v?.numeroNota != null && !Number.isNaN(Number(v.numeroNota)) ? Number(v.numeroNota) : idx + 1,
          dataEmissao: parseToISOString(v?.dataEmissao) || new Date().toISOString(),
          valorTotal: Number(v?.valorTotal) || 0
        })) : [],
        estatisticas: {
          totalVendas: Number(c?.resumo?.totalVendas) || 0,
          receitaTotal: Number(c?.resumo?.receitaTotal) || 0,
          ticketMedio: Number(c?.resumo?.ticketMedio) || 0,
          ultimaVenda: ultimaVendaStr,
          primeiraVenda: primeiraVendaStr,
          diasSemCompra: dias
        }
      };
    });
  }, [carteiraData]);

  // Resumo derivado para evitar NaN e garantir contagens reais
  const resumoDerivado = useMemo(() => {
    const clientes = clientesAdaptados || [];
    const totalClientes = (carteiraData?.resumo?.totalClientes ?? clientes.length) || 0;
    const receitaTotal = (carteiraData?.resumo?.receitaTotal ?? clientes.reduce((sum, c) => sum + (c.estatisticas?.receitaTotal || 0), 0)) || 0;
    const totalVendas = clientes.reduce((sum, c) => sum + (c.estatisticas?.totalVendas || 0), 0);
    const ticketMedioGeral = totalVendas > 0 ? receitaTotal / totalVendas : 0;
    const clientesAtivos = clientes.filter(c => c.estatisticas?.diasSemCompra !== null && (c.estatisticas?.diasSemCompra as number) <= 30).length;
    const clientesInativos = clientes.filter(c => c.estatisticas?.diasSemCompra !== null && (c.estatisticas?.diasSemCompra as number) > 90).length; // críticos
    return {
      totalClientes,
      receitaTotal,
      ticketMedioGeral,
      clientesAtivos,
      clientesInativos
    };
  }, [carteiraData, clientesAdaptados]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportando dados da carteira...');
  };
  
  const handleViewClientes = (vendedorId: number) => {
    setSelectedVendedor(vendedorId);
    setViewMode('clientes');
  };
  
  const handleBackToVendedores = () => {
    setViewMode('vendedores');
    setSelectedVendedor(undefined);
  };
  
  const handleClienteDetails = (clienteId: number) => {
    // Implementar navegação para detalhes do cliente
    console.log('Ver detalhes do cliente:', clienteId);
  };
  
  const filialSelecionada = filiais.find(f => f.id === filters.filialId);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* Indicador de escopo hierárquico */}
      <ScopeIndicator />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: '#003153' }}>
              {viewMode === 'vendedores' ? (
                <Users className="w-8 h-8" style={{ color: '#003153' }} />
              ) : (
                <UserCheck className="w-8 h-8" style={{ color: '#003153' }} />
              )}
              {viewMode === 'vendedores' ? 'Carteira de Vendedores' : 'Clientes da Carteira'}
            </h1>
            <p className="text-gray-600 mt-2">
              {viewMode === 'vendedores' 
                ? 'Gerencie e monitore a performance da sua equipe de vendas'
                : 'Visualize os clientes e histórico de vendas'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {viewMode === 'clientes' && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Período:</label>
                <select
                    value={periodoMeses}
                    onChange={(e) => setPeriodoMeses(parseInt(e.target.value))}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2"
                    style={{ 
                      '--tw-ring-color': '#003153',
                      '--tw-ring-opacity': '0.5'
                    } as any}
                  >
                    <option value={3}>3 meses</option>
                    <option value={6}>6 meses</option>
                    <option value={12}>12 meses</option>
                    <option value={24}>24 meses</option>
                  </select>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowMetricas(!showMetricas)}
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {showMetricas ? 'Ocultar' : 'Mostrar'} Métricas
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExport}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            
            <Button
              onClick={viewMode === 'vendedores' ? refetch : refetchCarteira}
              disabled={viewMode === 'vendedores' ? loading : carteiraLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${(viewMode === 'vendedores' ? loading : carteiraLoading) ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
        
        {/* Métricas */}
        {showMetricas && (
          <div className="mb-6">
            <ResumoExecutivoCarteira 
              filialId={filters.filialId}
            />
            <MetricasCarteira 
              filialId={filters.filialId}
            />
          </div>
        )}
        
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar vendedor
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, email ou código..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 h-10"
                  />
                </div>
              </div>
              
              {/* Filtro por Filial */}
              <div className="w-full lg:w-64">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filiais
                </label>
                <select
                  value={filters.filialId || ''}
                  onChange={(e) => handleFilterChange('filialId', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#003153',
                    '--tw-ring-opacity': '0.5'
                  } as any}
                  disabled={loadingFiliais}
                >
                  <option value="">Todas as filiais</option>
                  {filiais.map((filial) => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por Status */}
              <div className="w-full lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value as FilterState['status'])}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#003153',
                    '--tw-ring-opacity': '0.5'
                  } as any}
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
              </div>
              
              {/* Ordenação */}
              <div className="w-full lg:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={filters.ordenacao}
                  onChange={(e) => handleFilterChange('ordenacao', e.target.value as FilterState['ordenacao'])}
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  style={{ 
                    '--tw-ring-color': '#003153',
                    '--tw-ring-opacity': '0.5'
                  } as any}
                >
                  <option value="nome">Nome</option>
                  <option value="receita">Receita</option>
                  <option value="cobertura">Cobertura</option>
                  <option value="ranking">Ranking</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Content baseado no modo de visualização */}
      {viewMode === 'vendedores' ? (
        <>
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-red-600 mb-2">Erro ao carregar dados</div>
                  <div className="text-red-500 text-sm mb-4">{error}</div>
                  <Button onClick={refetch} variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Content - Lista de Vendedores */}
          {!loading && !error && (
            <div>
              {/* Resultados */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-600">
                  {vendedoresFiltrados.length} vendedor(es) encontrado(s)
                  {filialSelecionada && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs" style={{ backgroundColor: 'rgba(0, 49, 83, 0.1)', color: '#003153' }}>
                      <Building2 className="w-3 h-3 inline mr-1" />
                      {filialSelecionada.nome}
                    </span>
                  )}
                </div>
                
                {filters.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFilterChange('search', '')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Limpar busca
                  </Button>
                )}
              </div>
              
              {/* Grid de Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {vendedoresFiltrados.map((vendedor) => (
                  <CarteiraVendedorCard
                    key={vendedor.id}
                    vendedor={vendedor}
                    onClick={() => handleViewClientes(vendedor.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* View de Clientes */}
          {carteiraLoading && (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          )}
          
          {carteiraError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-red-600 mb-2">Erro ao carregar clientes</div>
                  <div className="text-red-500 text-sm mb-4">{carteiraError}</div>
                  <Button onClick={refetchCarteira} variant="outline" className="border-red-300 text-red-600 hover:bg-red-100">
                    Tentar novamente
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {!carteiraLoading && !carteiraError && carteiraData && carteiraData.resumo && (
            <div className="space-y-6">

              
              {/* Resumo da Carteira */}
              <ResumoCarteira
                vendedor={carteiraData.vendedor}
                resumo={resumoDerivado}
                metadata={carteiraData.metadata}
              />
              
              {/* Lista de Clientes */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#003153' }}>
                    <UserCheck className="w-6 h-6" style={{ color: '#003153' }} />
                    Clientes da Carteira
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {carteiraData.clientes?.length || 0} cliente(s) total
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {itemsPerPage} por página
                    </div>
                  </div>
                </div>
                
                <ClientesCarteira
                  clientes={clientesAdaptados}
                  loading={carteiraLoading}
                  onViewDetails={handleClienteDetails}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Botão Flutuante para Voltar */}
      {viewMode === 'clientes' && (
        <div className="fixed bottom-6 right-6 z-50 group">
          {/* Efeito de pulso de fundo */}
          <div className="absolute inset-0 rounded-full opacity-30 animate-ping" style={{ backgroundColor: '#003153' }}></div>
          
          <Button
            onClick={handleBackToVendedores}
            className="relative text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-sm"
            style={{ 
              backgroundColor: '#003153',
              borderColor: '#003153',
              ':hover': { backgroundColor: '#004a6b' }
            } as any}
            size="lg"
          >
            <Users className="w-5 h-5 transition-transform duration-200 group-hover:-rotate-12" />
            <span className="hidden sm:inline font-medium">Voltar para Vendedores</span>
            <span className="sm:hidden font-medium">Voltar</span>
          </Button>
          
          {/* Tooltip para mobile */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:hidden">
            Voltar para lista de vendedores
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}