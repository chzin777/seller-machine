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
  Building2
} from 'lucide-react';
import { useCarteiraVendedor, useFiliais } from '../../hooks/useCarteiraVendedor';
import CarteiraVendedorCard from '../../components/CarteiraVendedorCard';
import MetricasCarteira, { ResumoExecutivoCarteira } from '../../components/MetricasCarteira';
import LoadingSpinner from '../../components/LoadingSpinner';

interface FilterState {
  search: string;
  filialId: number | undefined;
  status: 'todos' | 'ativos' | 'inativos';
  ordenacao: 'nome' | 'receita' | 'cobertura' | 'ranking';
}

export default function CarteiraVendedorPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    filialId: undefined,
    status: 'todos',
    ordenacao: 'nome'
  });

  const [showFilters, setShowFilters] = useState(false);
  const [showMetricas, setShowMetricas] = useState(true);

  const { data, loading, error, refetch } = useCarteiraVendedor();
  const { filiais, loading: loadingFiliais } = useFiliais();
  
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
    
    // Filtro por status
    if (filters.status === 'ativos') {
      resultado = resultado.filter(vendedor => vendedor.ativo);
    } else if (filters.status === 'inativos') {
      resultado = resultado.filter(vendedor => !vendedor.ativo);
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
          const rankingA = a.ranking?.[0]?.posicao || 999;
          const rankingB = b.ranking?.[0]?.posicao || 999;
          return rankingA - rankingB;
        default:
          return 0;
      }
    });
    
    return resultado;
  }, [vendedores, filters]);
  
  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportando dados da carteira...');
  };
  
  const filialSelecionada = filiais.find(f => f.id === filters.filialId);
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              Carteira de Vendedores
            </h1>
            <p className="text-gray-600 mt-2">
              Gerencie e monitore a performance da sua equipe de vendas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
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
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por nome, email ou código..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Filtro por Filial */}
              <div className="w-full lg:w-64">
                <select
                  value={filters.filialId || ''}
                  onChange={(e) => handleFilterChange('filialId', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value as FilterState['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos</option>
                  <option value="ativos">Ativos</option>
                  <option value="inativos">Inativos</option>
                </select>
              </div>
              
              {/* Ordenação */}
              <div className="w-full lg:w-48">
                <select
                  value={filters.ordenacao}
                  onChange={(e) => handleFilterChange('ordenacao', e.target.value as FilterState['ordenacao'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
      
      {/* Content */}
      {!loading && !error && (
        <div>
          {/* Resultados */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-gray-600">
              {vendedoresFiltrados.length} vendedor(es) encontrado(s)
              {filialSelecionada && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
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
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}