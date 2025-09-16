"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Target, Search, Package, DollarSign, TrendingUp, Star, AlertCircle, RefreshCw } from 'lucide-react';
import { useRecommendations } from '../hooks/useAI';
import LoadingSpinner from './LoadingSpinner';

// Componente para card de recomendação individual
function RecommendationCard({ 
  recommendation 
}: { 
  recommendation: {
    produtoId: number;
    nome: string;
    score: number;
    motivo: string;
    categoria: string;
    precoMedio: number;
  }
}) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreStars = (score: number) => {
    const stars = Math.round(score / 20); // Converte score 0-100 para 0-5 estrelas
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${
          i < stars ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`} 
      />
    ));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 mb-1">
              {recommendation.nome}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{recommendation.categoria}</p>
            <div className="flex items-center gap-1 mb-2">
              {getScoreStars(recommendation.score)}
              <span className="text-sm text-gray-500 ml-2">
                ({recommendation.score.toFixed(1)}%)
              </span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(recommendation.score)}`}>
            {recommendation.score.toFixed(0)}%
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <DollarSign className="h-4 w-4" />
            <span>Preço médio: R$ {recommendation.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Motivo:</strong> {recommendation.motivo}
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button className="w-full" variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Ver Detalhes do Produto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente principal de recomendações
export default function AIRecommendations() {
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [limit, setLimit] = useState(5);
  const { data, loading, error, refetch } = useRecommendations(clienteId, limit);

  const handleSearch = () => {
    const id = parseInt(inputValue);
    if (!isNaN(id) && id > 0) {
      setClienteId(id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Target className="h-8 w-8 text-green-600" />
        <h1 className="text-3xl font-bold text-gray-900">Sistema de Recomendações IA</h1>
      </div>

      {/* Busca por cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Recomendações para Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID do Cliente
              </label>
              <Input
                type="number"
                placeholder="Digite o ID do cliente..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Limite
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value) || 5)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={!inputValue || loading}
              className="px-6"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {clienteId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recomendações para Cliente #{clienteId}
              </div>
              {data.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refetch}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar recomendações</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <Button onClick={refetch} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                </div>
              </div>
            ) : !Array.isArray(data) || data.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma recomendação encontrada</h3>
                <p className="text-gray-600">Não foram encontradas recomendações para este cliente.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Estatísticas das recomendações */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{data.length}</p>
                    <p className="text-sm text-gray-600">Produtos Recomendados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Array.isArray(data) && data.length > 0 ? (data.reduce((acc, item) => acc + (item.score || 0), 0) / data.length).toFixed(1) : '0'}%
                    </p>
                    <p className="text-sm text-gray-600">Score Médio</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      R$ {Array.isArray(data) && data.length > 0 ? (data.reduce((acc, item) => acc + (item.precoMedio || 0), 0) / data.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                    </p>
                    <p className="text-sm text-gray-600">Preço Médio</p>
                  </div>
                </div>

                {/* Lista de recomendações */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {data.map((recommendation) => (
                    <RecommendationCard 
                      key={recommendation.produtoId} 
                      recommendation={recommendation} 
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruções de uso */}
      {!clienteId && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Target className="h-6 w-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Como usar o Sistema de Recomendações</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Digite o ID do cliente no campo acima</li>
                  <li>• Ajuste o limite de recomendações (1-20 produtos)</li>
                  <li>• Clique em "Buscar" para ver as recomendações personalizadas</li>
                  <li>• As recomendações são baseadas em IA e análise de padrões de compra</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}