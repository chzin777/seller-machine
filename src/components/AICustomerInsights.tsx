"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ShoppingCart, 
  Star, 
  AlertTriangle, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  RefreshCw,
  Eye,
  Heart,
  Award,
  Zap
} from 'lucide-react';
import { useCustomerInsights } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Componente para métricas principais
function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  color = 'blue' 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    green: 'border-green-200 bg-green-50 text-green-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    yellow: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    purple: 'border-purple-200 bg-purple-50 text-purple-900'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600',
    purple: 'text-purple-600'
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <Card className={`border ${colorClasses[color]}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-6 w-6 ${iconColors[color]}`} />
          {getTrendIcon()}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium">{title}</p>
          {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para histórico de compras
function PurchaseHistoryCard({ purchases }: { purchases: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Histórico de Compras Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {purchases.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma compra recente encontrada</p>
        ) : (
          <div className="space-y-3">
            {purchases.slice(0, 5).map((purchase, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {purchase.produto || `Compra #${purchase.id}`}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(purchase.data).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    R$ {purchase.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Qtd: {purchase.quantidade || 1}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para produtos favoritos
function FavoriteProductsCard({ products }: { products: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Produtos Favoritos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhum produto favorito identificado</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {products.slice(0, 4).map((product, index) => (
              <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <p className="font-medium text-sm">{product.nome}</p>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>Compras: {product.frequencia}x</p>
                  <p>Valor total: R$ {product.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para recomendações de ação
function ActionRecommendationsCard({ recommendations }: { recommendations: string[] }) {
  const getRecommendationIcon = (rec: string) => {
    if (rec.toLowerCase().includes('desconto') || rec.toLowerCase().includes('promoção')) {
      return <Target className="h-4 w-4 text-green-600" />;
    }
    if (rec.toLowerCase().includes('contato') || rec.toLowerCase().includes('ligar')) {
      return <Phone className="h-4 w-4 text-blue-600" />;
    }
    if (rec.toLowerCase().includes('email')) {
      return <Mail className="h-4 w-4 text-purple-600" />;
    }
    return <Zap className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Recomendações de Ação
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Nenhuma recomendação disponível</p>
        ) : (
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                {getRecommendationIcon(rec)}
                <p className="text-sm text-blue-900 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente principal
export default function AICustomerInsights() {
  const [clienteId, setClienteId] = useState<string>('');
  const [searchClienteId, setSearchClienteId] = useState<number | null>(null);
  
  const { data, loading, error, refetch } = useCustomerInsights(searchClienteId);

  const handleSearch = () => {
    const id = parseInt(clienteId);
    if (id && id > 0) {
      setSearchClienteId(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Processar dados para exibição
  const processedData = useMemo(() => {
    if (!data) return null;

    return {
      cliente: {
        nome: data.nome || 'N/A',
        id: data.clienteId || 0,
        cpfCnpj: 'N/A' // Não disponível na interface CustomerInsight
      },
      metricas: {
        valorTotal: data.valorVida || 0,
        totalCompras: data.frequenciaCompras || 0,
        ticketMedio: data.ticketMedio || 0
      },
      segmento: data.segmento || 'Não classificado',
      tendencia: data.tendencia || 'Estável',
      proximaCompra: data.proximaCompra || 'N/A',
      produtosFavoritos: data.produtosFavoritos || []
    };
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Insights do Cliente</h1>
        </div>
        {searchClienteId && (
          <Button onClick={refetch} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        )}
      </div>

      {/* Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Digite o ID do cliente..."
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button onClick={handleSearch} disabled={!clienteId || loading}>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar insights</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      ) : !searchClienteId ? (
        <Card>
          <CardContent className="text-center py-12">
            <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Busque um cliente</h3>
            <p className="text-gray-600">Digite o ID de um cliente para ver seus insights detalhados.</p>
          </CardContent>
        </Card>
      ) : !processedData ? (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cliente não encontrado</h3>
            <p className="text-gray-600">Não foi possível encontrar insights para o cliente #{searchClienteId}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-semibold">{processedData.cliente.nome || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID</p>
                  <p className="font-semibold">#{searchClienteId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Segmento</p>
                  <Badge variant="outline">
                    {processedData.segmento}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">CPF/CNPJ</p>
                  <p className="font-semibold">{processedData.cliente.cpfCnpj || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Valor Total"
              value={`R$ ${processedData.metricas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Lifetime Value"
              icon={DollarSign}
              color="green"
            />
            <MetricCard
              title="Frequência de Compras"
              value={processedData.metricas.totalCompras}
              subtitle="Frequência de compras"
              icon={ShoppingCart}
              color="blue"
            />
            <MetricCard
              title="Ticket Médio"
              value={`R$ ${processedData.metricas.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              subtitle="Por transação"
              icon={BarChart3}
              color="purple"
            />
            <MetricCard
              title="Tendência"
              value={processedData.tendencia}
              subtitle="Comportamento de compras"
              icon={TrendingUp}
              color={processedData.tendencia === 'Crescente' ? 'green' : processedData.tendencia === 'Decrescente' ? 'red' : 'yellow'}
            />
          </div>

          {/* Informações Adicionais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Análise de Tendência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tendência Atual</span>
                    <Badge variant={processedData.tendencia === 'Crescente' ? 'default' : processedData.tendencia === 'Decrescente' ? 'destructive' : 'secondary'}>
                      {processedData.tendencia}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Próxima Compra Prevista</span>
                    <span className="font-semibold">{processedData.proximaCompra}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor de Vida (LTV)</span>
                    <span className="font-semibold">R$ {processedData.metricas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Informações do Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Segmento</span>
                    <Badge variant="outline">{processedData.segmento}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Frequência de Compras</span>
                    <span className="font-semibold">{processedData.metricas.totalCompras}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Valor de Vida</span>
                    <span className="font-semibold">R$ {processedData.metricas.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Produtos Favoritos */}
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Produtos Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {processedData.produtosFavoritos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Nenhum produto favorito identificado</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {processedData.produtosFavoritos.map((product, index) => (
                      <div key={index} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <p className="font-medium text-sm">{product}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}