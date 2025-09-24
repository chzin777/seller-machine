"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
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
  Phone,
  Target,
  BarChart3,
  Activity,
  Clock,
  Award
} from 'lucide-react';
import { useChurnPrediction, useClientePorDocumento, FilialOption } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Interface para métricas de churn
interface ChurnMetrics {
  total: number;
  alto: number;
  medio: number;
  baixo: number;
  avgProbability: number;
  totalValor: number;
  avgValor: number;
  totalFrequencia: number;
  avgFrequencia: number;
}

// Interface para cliente em risco
interface ChurnClient {
  clienteId: number;
  nome: string;
  churnProbability: number;
  riskLevel: 'Alto' | 'Médio' | 'Baixo';
  recommendation: string;
  ultimaCompra: string;
  valorTotal: number;
  frequenciaCompras: number;
  cpfCnpj?: string;
  cidade?: string;
  estado?: string;
}

// Componente para card de cliente em risco otimizado
function OptimizedChurnClientCard({ 
  client,
  onViewDetails,
  onContactClient 
}: { 
  client: ChurnClient;
  onViewDetails: (clienteId: number) => void;
  onContactClient: (client: ChurnClient) => void;
}) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Alto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Médio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixo': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'Alto': return <AlertTriangle className="h-4 w-4" />;
      case 'Médio': return <Clock className="h-4 w-4" />;
      case 'Baixo': return <Award className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const daysSinceLastPurchase = useMemo(() => {
    const lastPurchase = new Date(client.ultimaCompra);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPurchase.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [client.ultimaCompra]);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-red-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {client.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${getRiskColor(client.riskLevel)} flex items-center gap-1`}>
                {getRiskIcon(client.riskLevel)}
                Risco {client.riskLevel}
              </Badge>
              <span className="text-sm text-gray-500">
                {(client.churnProbability * 100).toFixed(1)}% probabilidade
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Valor Total:</span>
              <span className="font-semibold">{formatCurrency(client.valorTotal)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Frequência:</span>
              <span className="font-semibold">{client.frequenciaCompras} compras</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-gray-600">Última compra:</span>
              <span className="font-semibold">{formatDate(client.ultimaCompra)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-gray-600">Há {daysSinceLastPurchase} dias</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">Recomendação:</p>
          <p className="text-sm text-gray-600">{client.recommendation}</p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewDetails(client.clienteId)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Ver Detalhes
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onContactClient(client)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Phone className="h-4 w-4 mr-1" />
            Contatar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para métricas resumidas
function ChurnMetricsOverview({ metrics }: { metrics: ChurnMetrics }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Alto Risco</p>
              <p className="text-2xl font-bold text-red-700">{metrics.alto}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Médio Risco</p>
              <p className="text-2xl font-bold text-yellow-700">{metrics.medio}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Valor em Risco</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(metrics.totalValor)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Prob. Média</p>
              <p className="text-2xl font-bold text-purple-700">
                {(metrics.avgProbability * 100).toFixed(1)}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal otimizado
export default function AIChurnAnalysis() {
  const [filialId, setFilialId] = useState<number | undefined>(undefined);
  const [limit, setLimit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [filiais, setFiliais] = useState<FilialOption[]>([]);
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);
  
  const { data, loading, error, refetch } = useChurnPrediction(filialId, limit);

  // Carregar filiais disponíveis
  useEffect(() => {
    const fetchFiliais = async () => {
      try {
        const response = await fetch('/api/proxy?url=/api/filiais');
        if (response.ok) {
          const filiaisData = await response.json();
          setFiliais(filiaisData.map((f: any) => ({
            id: f.id,
            nome: f.nome
          })));
        }
      } catch (error) {
        console.error('Erro ao carregar filiais:', error);
      }
    };

    fetchFiliais();
  }, []);

  // Filtrar dados
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    return data.filter(client => {
      const matchesSearch = client.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'all' || client.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [data, searchTerm, riskFilter]);

  // Calcular métricas
  const metrics = useMemo((): ChurnMetrics => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        alto: 0,
        medio: 0,
        baixo: 0,
        avgProbability: 0,
        totalValor: 0,
        avgValor: 0,
        totalFrequencia: 0,
        avgFrequencia: 0
      };
    }

    const total = data.length;
    const alto = data.filter(c => c.riskLevel === 'Alto').length;
    const medio = data.filter(c => c.riskLevel === 'Médio').length;
    const baixo = data.filter(c => c.riskLevel === 'Baixo').length;
    
    const totalProbability = data.reduce((acc, c) => {
      const prob = c.churnProbability;
      return acc + (isNaN(prob) || prob === null || prob === undefined ? 0 : prob);
    }, 0);
    const avgProbability = total > 0 ? totalProbability / total : 0;
    
    const totalValor = data.reduce((acc, c) => acc + (c.valorTotal || 0), 0);
    const avgValor = total > 0 ? totalValor / total : 0;
    
    const totalFrequencia = data.reduce((acc, c) => acc + (c.frequenciaCompras || 0), 0);
    const avgFrequencia = total > 0 ? totalFrequencia / total : 0;

    return { 
      total, 
      alto, 
      medio, 
      baixo, 
      avgProbability,
      totalValor,
      avgValor,
      totalFrequencia,
      avgFrequencia
    };
  }, [data]);

  const handleViewDetails = (clienteId: number) => {
    setSelectedClienteId(clienteId);
    // Implementar modal de detalhes
    console.log('Ver detalhes do cliente:', clienteId);
  };

  const handleContactClient = (client: ChurnClient) => {
    // Implementar ação de contato
    console.log('Contatar cliente:', client.nome);
  };

  const handleExport = () => {
    // Implementar exportação
    console.log('Exportar dados de churn');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Erro ao Carregar Dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Análise de Churn</h1>
          <p className="text-gray-600 mt-1">
            Identifique clientes em risco e tome ações preventivas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <ChurnMetricsOverview metrics={metrics} />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Filial
              </label>
              <Select value={filialId?.toString() || ''} onValueChange={(value) => setFilialId(value ? parseInt(value) : undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as filiais" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as filiais</SelectItem>
                  {filiais.map((filial) => (
                    <SelectItem key={filial.id} value={filial.id.toString()}>
                      {filial.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nível de Risco
              </label>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  <SelectItem value="Alto">Alto Risco</SelectItem>
                  <SelectItem value="Médio">Médio Risco</SelectItem>
                  <SelectItem value="Baixo">Baixo Risco</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Limite de Resultados
              </label>
              <Select value={limit.toString()} onValueChange={(value) => setLimit(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25 clientes</SelectItem>
                  <SelectItem value="50">50 clientes</SelectItem>
                  <SelectItem value="100">100 clientes</SelectItem>
                  <SelectItem value="200">200 clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Buscar Cliente
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Nome do cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes em Risco ({filteredData.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-600">
                {data?.length === 0 
                  ? 'Não há dados de predição de churn disponíveis.' 
                  : 'Tente ajustar os filtros para ver mais resultados.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map((client) => (
                <OptimizedChurnClientCard 
                  key={client.clienteId}
                  client={client}
                  onViewDetails={handleViewDetails}
                  onContactClient={handleContactClient}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}