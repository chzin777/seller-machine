"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Users, 
  PieChart, 
  BarChart3, 
  TrendingUp, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  Target, 
  Layers, 
  Activity, 
  DollarSign, 
  ShoppingCart, 
  Calendar, 
  Star,
  AlertTriangle,
  Zap,
  Award
} from 'lucide-react';
import { useClustering } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Componente para estatísticas do cluster
function ClusterStatsCard({ 
  cluster, 
  totalClients 
}: { 
  cluster: {
    clusterId: number;
    nome: string;
    descricao: string;
    totalClientes: number;
    caracteristicas: {
      valorMedio: number;
      frequenciaMedia: number;
      recenciaDias: number;
      ticketMedio: number;
    };
    clientes: any[];
  };
  totalClients: number;
}) {
  const percentage = ((cluster.totalClientes / totalClients) * 100).toFixed(1);
  
  const getClusterColor = (clusterId: number) => {
    const colors = [
      'border-blue-500 bg-blue-50 text-blue-900',
      'border-green-500 bg-green-50 text-green-900',
      'border-purple-500 bg-purple-50 text-purple-900',
      'border-orange-500 bg-orange-50 text-orange-900',
      'border-red-500 bg-red-50 text-red-900'
    ];
    return colors[clusterId % colors.length];
  };

  const getClusterIcon = (clusterId: number) => {
    const icons = [Users, Star, Award, Target, Zap];
    const IconComponent = icons[clusterId % icons.length];
    return <IconComponent className="h-6 w-6" />;
  };

  return (
    <Card className={`border-2 ${getClusterColor(cluster.clusterId)} hover:shadow-lg transition-all duration-200`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getClusterIcon(cluster.clusterId)}
            <span>{cluster.nome}</span>
          </div>
          <Badge variant="outline">
            {cluster.totalClientes} clientes ({percentage}%)
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{cluster.descricao}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              R$ {cluster.caracteristicas.valorMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-600">Valor Médio</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <ShoppingCart className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              {cluster.caracteristicas.frequenciaMedia.toFixed(1)}
            </p>
            <p className="text-xs text-gray-600">Freq. Média</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <Calendar className="h-5 w-5 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              {cluster.caracteristicas.recenciaDias}
            </p>
            <p className="text-xs text-gray-600">Dias Recência</p>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <BarChart3 className="h-5 w-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-900">
              R$ {cluster.caracteristicas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-600">Ticket Médio</p>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className="bg-current h-2 rounded-full transition-all duration-300" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-center text-gray-600">
          {percentage}% do total de clientes
        </p>
      </CardContent>
    </Card>
  );
}

// Componente para lista de clientes do cluster
function ClusterClientsCard({ 
  cluster, 
  onViewClient 
}: { 
  cluster: {
    clusterId: number;
    nome: string;
    clientes: any[];
  };
  onViewClient: (clienteId: number) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayClients = showAll ? cluster.clientes : cluster.clientes.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Clientes - {cluster.nome}</span>
          <Badge variant="outline">{cluster.clientes.length} clientes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {cluster.clientes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum cliente neste cluster</p>
        ) : (
          <>
            <div className="space-y-2 mb-4">
              {displayClients.map((cliente, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {cliente.nome || `Cliente #${cliente.clienteId}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {cliente.clienteId} • Valor: R$ {(cliente.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewClient(cliente.clienteId)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              ))}
            </div>
            
            {cluster.clientes.length > 5 && (
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Mostrar menos' : `Ver todos (${cluster.clientes.length})`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para gráfico de distribuição (simulado)
function DistributionChart({ clusters }: { clusters: any[] }) {
  const total = clusters.reduce((acc, cluster) => acc + cluster.totalClientes, 0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChart className="h-5 w-5" />
          Distribuição de Clientes por Cluster
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {clusters.map((cluster, index) => {
            const percentage = total > 0 ? ((cluster.totalClientes / total) * 100).toFixed(1) : '0';
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'];
            
            return (
              <div key={cluster.clusterId} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded ${colors[index % colors.length]}`}></div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{cluster.nome}</span>
                    <span className="text-sm text-gray-600">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 min-w-[60px] text-right">
                  {cluster.totalClientes} clientes
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal
export default function AIClustering() {
  const [filialId, setFilialId] = useState<number | undefined>(undefined);
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  
  const { data, loading, error, refetch } = useClustering(filialId);

  // Debug: Log data whenever it changes
  React.useEffect(() => {
    console.log('🔍 AIClustering - Data received:', data);
    console.log('🔍 AIClustering - Data type:', typeof data);
    console.log('🔍 AIClustering - Loading:', loading);
    console.log('🔍 AIClustering - Error:', error);
  }, [data, loading, error]);

  // Processar dados para exibição
  const processedData = useMemo(() => {
    if (!data) return { clusters: [], totalClients: 0, summary: null };

    const clusters = data.clusters || [];
    const totalClients = clusters.reduce((acc: number, cluster: any) => acc + (cluster.totalClientes || 0), 0);
    const summary = data.summary || {};

    return { clusters, totalClients, summary };
  }, [data]);

  const handleViewClient = (clienteId: number) => {
    // Implementar navegação para detalhes do cliente
    console.log('Ver cliente:', clienteId);
  };

  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportar dados de clustering');
  };

  const selectedClusterData = selectedCluster !== null 
    ? processedData.clusters.find((c: any) => c.clusterId === selectedCluster)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Clustering de Clientes</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={refetch} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filial (Opcional)
              </label>
              <Input
                type="number"
                placeholder="ID da filial..."
                value={filialId || ''}
                onChange={(e) => setFilialId(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visualizar Cluster
              </label>
              <Select 
                value={selectedCluster?.toString() || 'all'} 
                onValueChange={(value) => setSelectedCluster(value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os clusters</SelectItem>
                  {processedData.clusters.map((cluster: any) => (
                    cluster.clusterId !== undefined && (
                      <SelectItem key={cluster.clusterId} value={cluster.clusterId.toString()}>
                        {cluster.nome}
                      </SelectItem>
                    )
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={refetch} disabled={loading} className="w-full">
                <Activity className="h-4 w-4 mr-2" />
                Analisar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar clustering</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : processedData.clusters.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum cluster encontrado</h3>
            <p className="text-gray-600">Não há dados de clustering disponíveis para os filtros selecionados.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{processedData.totalClients}</p>
                <p className="text-sm text-blue-700">Total de Clientes</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4 text-center">
                <Layers className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{processedData.clusters.length}</p>
                <p className="text-sm text-purple-700">Clusters Identificados</p>
              </CardContent>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">
                  {processedData.summary.silhouetteScore ? (processedData.summary.silhouetteScore * 100).toFixed(1) + '%' : 'N/A'}
                </p>
                <p className="text-sm text-green-700">Qualidade do Clustering</p>
              </CardContent>
            </Card>
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-900">
                  R$ {(processedData.summary.valorMedioGeral || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-orange-700">Valor Médio Geral</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Distribuição */}
          <DistributionChart clusters={processedData.clusters} />

          {/* Clusters ou Cluster Específico */}
          {selectedClusterData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCluster(null)}
                >
                  ← Voltar para todos os clusters
                </Button>
                <h2 className="text-xl font-semibold">Detalhes: {selectedClusterData.nome}</h2>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClusterStatsCard 
                  cluster={selectedClusterData} 
                  totalClients={processedData.totalClients} 
                />
                <ClusterClientsCard 
                  cluster={selectedClusterData} 
                  onViewClient={handleViewClient} 
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedData.clusters.map((cluster: any) => (
                cluster.clusterId !== undefined && (
                  <div key={cluster.clusterId} onClick={() => setSelectedCluster(cluster.clusterId)} className="cursor-pointer">
                    <ClusterStatsCard 
                      cluster={cluster} 
                      totalClients={processedData.totalClients} 
                    />
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}