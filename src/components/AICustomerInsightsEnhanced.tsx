"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

// Interfaces para dados de insights
interface CustomerInsight {
  clienteId: number;
  nome: string;
  cpfCnpj: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  segmentoRFV: string;
  scoreRFV: number;
  rankingAutomatico?: string;
  valorVida: number;
  frequenciaCompras: number;
  ticketMedio: number;
  ultimaCompra: string;
  diasSemCompra: number;
  tendencia: 'crescente' | 'estavel' | 'decrescente';
  produtosFavoritos: string[];
  categoriaPreferida: string;
  sazonalidade: string;
  probabilidadeChurn: number;
  potencialCrescimento: number;
}

interface RFVSegment {
  segmento: string;
  descricao: string;
  cor: string;
  icone: React.ReactNode;
  clientes: number;
  valorTotal: number;
  estrategia: string;
}

// Componente para card de insight do cliente
function CustomerInsightCard({ 
  customer, 
  onViewDetails 
}: { 
  customer: CustomerInsight;
  onViewDetails: (clienteId: number) => void;
}) {
  const getSegmentColor = (segmento: string) => {
    const colors: { [key: string]: string } = {
      'Champions': 'bg-green-100 text-green-800 border-green-200',
      'Loyal Customers': 'bg-blue-100 text-blue-800 border-blue-200',
      'Potential Loyalists': 'bg-purple-100 text-purple-800 border-purple-200',
      'New Customers': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'Promising': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Need Attention': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'About to Sleep': 'bg-orange-100 text-orange-800 border-orange-200',
      'At Risk': 'bg-red-100 text-red-800 border-red-200',
      'Cannot Lose Them': 'bg-pink-100 text-pink-800 border-pink-200',
      'Hibernating': 'bg-gray-100 text-gray-800 border-gray-200',
      'Lost': 'bg-slate-100 text-slate-800 border-slate-200'
    };
    return colors[segmento] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getRankingColor = (ranking?: string) => {
    const colors: { [key: string]: string } = {
      'Diamante': 'text-blue-600',
      'Ouro': 'text-yellow-600',
      'Prata': 'text-gray-600',
      'Bronze': 'text-orange-600'
    };
    return colors[ranking || ''] || 'text-gray-600';
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'crescente': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'decrescente': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
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

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {customer.nome}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getSegmentColor(customer.segmentoRFV)}>
                {customer.segmentoRFV}
              </Badge>
              {customer.rankingAutomatico && (
                <Badge variant="outline" className={getRankingColor(customer.rankingAutomatico)}>
                  <Star className="h-3 w-3 mr-1" />
                  {customer.rankingAutomatico}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {customer.cidade && customer.estado && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {customer.cidade}, {customer.estado}
                </span>
              )}
              <span className="flex items-center gap-1">
                {getTendenciaIcon(customer.tendencia)}
                {customer.tendencia}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {customer.scoreRFV.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Score RFV</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-gray-600">Valor Vida:</span>
              <span className="font-semibold">{formatCurrency(customer.valorVida)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-gray-600">Ticket Médio:</span>
              <span className="font-semibold">{formatCurrency(customer.ticketMedio)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4 text-purple-600" />
              <span className="text-gray-600">Frequência:</span>
              <span className="font-semibold">{customer.frequenciaCompras} compras</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-gray-600">Última compra:</span>
              <span className="font-semibold">{formatDate(customer.ultimaCompra)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-red-600" />
              <span className="text-gray-600">Há {customer.diasSemCompra} dias</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Target className="h-4 w-4 text-indigo-600" />
              <span className="text-gray-600">Categoria:</span>
              <span className="font-semibold">{customer.categoriaPreferida}</span>
            </div>
          </div>
        </div>

        {/* Indicadores de risco e potencial */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-red-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-red-600 mb-1">
              <AlertCircle className="h-3 w-3" />
              Risco Churn
            </div>
            <div className="text-sm font-semibold text-red-700">
              {(customer.probabilidadeChurn * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-green-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 text-xs text-green-600 mb-1">
              <TrendingUp className="h-3 w-3" />
              Potencial
            </div>
            <div className="text-sm font-semibold text-green-700">
              {(customer.potencialCrescimento * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Produtos favoritos */}
        {customer.produtosFavoritos.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1">Produtos Favoritos:</p>
            <div className="flex flex-wrap gap-1">
              {customer.produtosFavoritos.slice(0, 3).map((produto, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {produto}
                </Badge>
              ))}
              {customer.produtosFavoritos.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{customer.produtosFavoritos.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onViewDetails(customer.clienteId)}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Análise Completa
        </Button>
      </CardContent>
    </Card>
  );
}

// Componente para overview dos segmentos RFV
function RFVSegmentsOverview({ segments }: { segments: RFVSegment[] }) {
  const totalClientes = segments.reduce((acc, seg) => acc + seg.clientes, 0);
  const totalValor = segments.reduce((acc, seg) => acc + seg.valorTotal, 0);

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
      {segments.slice(0, 4).map((segment, index) => {
        const percentualClientes = totalClientes > 0 ? (segment.clientes / totalClientes) * 100 : 0;
        const percentualValor = totalValor > 0 ? (segment.valorTotal / totalValor) * 100 : 0;
        
        return (
          <Card key={index} className={`border-l-4 ${segment.cor.replace('bg-', 'border-').replace('-100', '-500')}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {segment.icone}
                  <span className="font-medium text-sm">{segment.segmento}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clientes:</span>
                  <span className="font-semibold">{segment.clientes} ({percentualClientes.toFixed(1)}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-semibold">{formatCurrency(segment.valorTotal)}</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {segment.estrategia}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Componente principal
export default function AICustomerInsightsEnhanced() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<CustomerInsight[]>([]);
  const [segments, setSegments] = useState<RFVSegment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [rankingFilter, setRankingFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('insights');

  // Dados mockados para demonstração
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simular dados de segmentos RFV
        const mockSegments: RFVSegment[] = [
          {
            segmento: 'Champions',
            descricao: 'Melhores clientes',
            cor: 'bg-green-100',
            icone: <Award className="h-4 w-4 text-green-600" />,
            clientes: 45,
            valorTotal: 2500000,
            estrategia: 'Manter satisfação e fidelidade'
          },
          {
            segmento: 'Loyal Customers',
            descricao: 'Clientes fiéis',
            cor: 'bg-blue-100',
            icone: <Star className="h-4 w-4 text-blue-600" />,
            clientes: 78,
            valorTotal: 1800000,
            estrategia: 'Oferecer produtos premium'
          },
          {
            segmento: 'At Risk',
            descricao: 'Em risco de churn',
            cor: 'bg-red-100',
            icone: <AlertCircle className="h-4 w-4 text-red-600" />,
            clientes: 32,
            valorTotal: 950000,
            estrategia: 'Campanhas de retenção urgentes'
          },
          {
            segmento: 'New Customers',
            descricao: 'Novos clientes',
            cor: 'bg-cyan-100',
            icone: <Users className="h-4 w-4 text-cyan-600" />,
            clientes: 67,
            valorTotal: 450000,
            estrategia: 'Programas de onboarding'
          }
        ];

        // Simular dados de clientes com insights
        const mockCustomers: CustomerInsight[] = [
          {
            clienteId: 1,
            nome: 'Empresa ABC Ltda',
            cpfCnpj: '12.345.678/0001-90',
            cidade: 'São Paulo',
            estado: 'SP',
            segmentoRFV: 'Champions',
            scoreRFV: 4.8,
            rankingAutomatico: 'Diamante',
            valorVida: 850000,
            frequenciaCompras: 24,
            ticketMedio: 35400,
            ultimaCompra: '2024-01-15',
            diasSemCompra: 15,
            tendencia: 'crescente',
            produtosFavoritos: ['Escavadeiras', 'Peças Hidráulicas', 'Serviços'],
            categoriaPreferida: 'Máquinas',
            sazonalidade: 'Trimestre 1',
            probabilidadeChurn: 0.05,
            potencialCrescimento: 0.85
          },
          {
            clienteId: 2,
            nome: 'Construtora XYZ S.A.',
            cpfCnpj: '98.765.432/0001-10',
            cidade: 'Rio de Janeiro',
            estado: 'RJ',
            segmentoRFV: 'At Risk',
            scoreRFV: 2.1,
            rankingAutomatico: 'Bronze',
            valorVida: 320000,
            frequenciaCompras: 8,
            ticketMedio: 40000,
            ultimaCompra: '2023-11-20',
            diasSemCompra: 85,
            tendencia: 'decrescente',
            produtosFavoritos: ['Tratores', 'Peças Motor'],
            categoriaPreferida: 'Máquinas',
            sazonalidade: 'Trimestre 4',
            probabilidadeChurn: 0.75,
            potencialCrescimento: 0.25
          }
        ];

        setSegments(mockSegments);
        setCustomers(mockCustomers);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar insights:', err);
        setError('Erro ao carregar dados de insights');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar clientes
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch = customer.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSegment = segmentFilter === 'all' || customer.segmentoRFV === segmentFilter;
      const matchesRanking = rankingFilter === 'all' || customer.rankingAutomatico === rankingFilter;
      return matchesSearch && matchesSegment && matchesRanking;
    });
  }, [customers, searchTerm, segmentFilter, rankingFilter]);

  const handleViewDetails = (clienteId: number) => {
    console.log('Ver detalhes do cliente:', clienteId);
  };

  const handleExport = () => {
    console.log('Exportar insights de clientes');
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
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Erro ao Carregar Dados</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
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
          <h1 className="text-3xl font-bold text-gray-900">Insights de Clientes</h1>
          <p className="text-gray-600 mt-1">
            Análise comportamental e segmentação inteligente
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport} variant="default">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">Insights Individuais</TabsTrigger>
          <TabsTrigger value="segments">Segmentação RFV</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-6">
          {/* Overview dos Segmentos */}
          <RFVSegmentsOverview segments={segments} />

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

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Segmento RFV
                  </label>
                  <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os segmentos</SelectItem>
                      {segments.map((segment) => (
                        <SelectItem key={segment.segmento} value={segment.segmento}>
                          {segment.segmento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Ranking
                  </label>
                  <Select value={rankingFilter} onValueChange={setRankingFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os rankings</SelectItem>
                      <SelectItem value="Diamante">Diamante</SelectItem>
                      <SelectItem value="Ouro">Ouro</SelectItem>
                      <SelectItem value="Prata">Prata</SelectItem>
                      <SelectItem value="Bronze">Bronze</SelectItem>
                    </SelectContent>
                  </Select>
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
                  Insights de Clientes ({filteredCustomers.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Nenhum cliente encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente ajustar os filtros para ver mais resultados.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCustomers.map((customer) => (
                    <CustomerInsightCard 
                      key={customer.clienteId}
                      customer={customer}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Segmentação RFV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Análise de Segmentação
                </h3>
                <p className="text-gray-600">
                  Visualizações detalhadas dos segmentos RFV em desenvolvimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Avançado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Analytics Avançado
                </h3>
                <p className="text-gray-600">
                  Análises preditivas e correlações em desenvolvimento.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}