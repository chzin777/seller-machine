"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  AlertTriangle, 
  Users, 
  Filter, 
  Download, 
  RefreshCw, 
  TrendingDown, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Search,
  Eye,
  Mail,
  Phone
} from 'lucide-react';
import { useChurnPrediction } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Componente para card de cliente em risco
function ChurnClientCard({ 
  client,
  onViewDetails 
}: { 
  client: {
    clienteId: number;
    nome: string;
    churnProbability: number;
    riskLevel: 'Alto' | 'Médio' | 'Baixo';
    recommendation: string;
    ultimaCompra: string;
    valorTotal: number;
    frequenciaCompras: number;
  };
  onViewDetails: (clienteId: number) => void;
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'border-red-500 bg-red-50';
      case 'Médio': return 'border-yellow-500 bg-yellow-50';
      case 'Baixo': return 'border-green-500 bg-green-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getRiskTextColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'text-red-700';
      case 'Médio': return 'text-yellow-700';
      case 'Baixo': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Alto': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'Médio': return <TrendingDown className="h-5 w-5 text-yellow-600" />;
      case 'Baixo': return <Users className="h-5 w-5 text-green-600" />;
      default: return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const daysSinceLastPurchase = useMemo(() => {
    try {
      const lastPurchase = new Date(client.ultimaCompra);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastPurchase.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  }, [client.ultimaCompra]);

  return (
    <Card className={`border-2 ${getRiskColor(client.riskLevel)} hover:shadow-lg transition-all duration-200`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getRiskIcon(client.riskLevel)}
              <h3 className="font-semibold text-lg text-gray-900">{client.nome}</h3>
              <span className="text-sm text-gray-500">#{client.clienteId}</span>
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskTextColor(client.riskLevel)} bg-current bg-opacity-10`}>
              Risco {client.riskLevel}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {(client.churnProbability * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500">Probabilidade</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Última compra</p>
              <p className="font-medium">{formatDate(client.ultimaCompra)}</p>
              <p className="text-xs text-gray-500">{daysSinceLastPurchase} dias atrás</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Valor total</p>
              <p className="font-medium">R$ {client.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm col-span-2">
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-gray-600">Frequência de compras</p>
              <p className="font-medium">{client.frequenciaCompras} compras</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-blue-800">
            <strong>Recomendação:</strong> {client.recommendation}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(client.clienteId)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            title="Enviar email"
          >
            <Mail className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-3"
            title="Ligar"
          >
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal de predição de churn
export default function AIChurnPrediction() {
  const [filialId, setFilialId] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  
  const { data, loading, error, refetch } = useChurnPrediction(filialId, limit);

  // Filtrar dados baseado na busca e filtro de risco
  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(client => 
        client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.clienteId.toString().includes(searchTerm)
      );
    }

    if (riskFilter !== 'all') {
      filtered = filtered.filter(client => client.riskLevel === riskFilter);
    }

    return filtered;
  }, [data, searchTerm, riskFilter]);

  // Estatísticas dos dados
  const stats = useMemo(() => {
    if (!Array.isArray(data)) {
      return { total: 0, alto: 0, medio: 0, baixo: 0, avgProbability: 0 };
    }
    
    const total = data.length;
    const alto = data.filter(c => c.riskLevel === 'Alto').length;
    const medio = data.filter(c => c.riskLevel === 'Médio').length;
    const baixo = data.filter(c => c.riskLevel === 'Baixo').length;
    const avgProbability = data.length > 0 
      ? data.reduce((acc, c) => acc + c.churnProbability, 0) / data.length 
      : 0;

    return { total, alto, medio, baixo, avgProbability };
  }, [data]);

  const handleViewDetails = (clienteId: number) => {
    // Implementar navegação para detalhes do cliente
    console.log('Ver detalhes do cliente:', clienteId);
  };

  const handleExport = () => {
    // Implementar exportação dos dados
    console.log('Exportar dados de churn');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Predição de Churn</h1>
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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            <p className="text-sm text-blue-700">Total de Clientes</p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-900">{stats.alto}</p>
            <p className="text-sm text-red-700">Risco Alto</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-yellow-900">{stats.medio}</p>
            <p className="text-sm text-yellow-700">Risco Médio</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-900">{stats.baixo}</p>
            <p className="text-sm text-green-700">Risco Baixo</p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-900">{(stats.avgProbability * 100).toFixed(1)}%</p>
            <p className="text-sm text-purple-700">Prob. Média</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome ou ID do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Risco
              </label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="Alto">Risco Alto</SelectItem>
                  <SelectItem value="Médio">Risco Médio</SelectItem>
                  <SelectItem value="Baixo">Risco Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filial
              </label>
              <Input
                type="number"
                placeholder="ID da filial (opcional)"
                value={filialId || ''}
                onChange={(e) => setFilialId(e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite
              </label>
              <Input
                type="number"
                min="10"
                max="200"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 50)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Clientes em Risco ({filteredData.length})</span>
            {filteredData.length !== data.length && (
              <span className="text-sm font-normal text-gray-500">
                Mostrando {filteredData.length} de {data.length} clientes
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar novamente
              </Button>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {data.length === 0 ? 'Nenhum cliente encontrado' : 'Nenhum cliente corresponde aos filtros'}
              </h3>
              <p className="text-gray-600">
                {data.length === 0 
                  ? 'Não há dados de predição de churn disponíveis.' 
                  : 'Tente ajustar os filtros para ver mais resultados.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map((client) => (
                <ChurnClientCard 
                  key={client.clienteId} 
                  client={client} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}