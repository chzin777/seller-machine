import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target,
  AlertTriangle
} from 'lucide-react';

interface ResumoCarteiraProps {
  vendedor?: {
    id: number;
    nome: string;
    cpf: string;
    filial?: {
      id: number;
      nome: string;
      cidade: string;
      estado: string;
    };
  };
  resumo?: {
    totalClientes: number;
    receitaTotal: number;
    ticketMedioGeral: number;
    clientesAtivos: number;
    clientesInativos: number;
  };
  metadata?: {
    periodoMeses: number;
    dataLimite: string;
    dataConsulta: string;
  };
}

export default function ResumoCarteira({ vendedor, resumo, metadata }: ResumoCarteiraProps) {
  // Valores seguros para evitar NaN quando alguns campos do resumo estiverem ausentes
  const resumoSafe = {
    totalClientes: resumo?.totalClientes ?? 0,
    receitaTotal: resumo?.receitaTotal ?? 0,
    ticketMedioGeral: resumo?.ticketMedioGeral ?? 0,
    clientesAtivos: resumo?.clientesAtivos ?? 0,
    clientesInativos: resumo?.clientesInativos ?? 0
  };

  // Se não há dados válidos, mostrar estado de carregamento
  if (!resumo && !vendedor) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const percentualAtivos = resumoSafe.totalClientes > 0 
    ? Math.round(((resumoSafe.clientesAtivos || 0) / resumoSafe.totalClientes) * 100)
    : 0;

  const percentualInativos = resumoSafe.totalClientes > 0 
    ? Math.round(((resumoSafe.clientesInativos || 0) / resumoSafe.totalClientes) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Informações do Vendedor */}
      {vendedor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Informações do Vendedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {vendedor.nome}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  CPF: {vendedor.cpf}
                </p>
                {vendedor.filial && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {vendedor.filial.nome}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {vendedor.filial.cidade}, {vendedor.filial.estado}
                    </span>
                  </div>
                )}
              </div>
              
              {metadata && (
                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Período: Últimos {metadata.periodoMeses} meses</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Atualizado em: {formatDate(metadata.dataConsulta)}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas da Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total de Clientes */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {resumoSafe.totalClientes}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumoSafe.receitaTotal || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Médio */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resumoSafe.ticketMedioGeral || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Taxa de Atividade */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Atividade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {percentualAtivos}%
                </p>
                <p className="text-xs text-gray-500">
                  {resumoSafe.clientesAtivos} ativos
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Status da Carteira
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Clientes Ativos */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-green-800 mb-1">
                {resumoSafe.clientesAtivos}
              </div>
              <div className="text-sm text-green-600 mb-1">Clientes Ativos</div>
              <div className="text-xs text-green-500">
                {percentualAtivos}% do total
              </div>
            </div>

            {/* Clientes Inativos */}
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-red-800 mb-1">
                {resumoSafe.clientesInativos}
              </div>
              <div className="text-sm text-red-600 mb-1">Clientes Críticos</div>
              <div className="text-xs text-red-500">
                {percentualInativos}% do total
              </div>
            </div>

            {/* Clientes Regulares */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-800 mb-1">
                {resumoSafe.totalClientes - (resumoSafe.clientesAtivos || 0) - (resumoSafe.clientesInativos || 0)}
              </div>
              <div className="text-sm text-blue-600 mb-1">Clientes Regulares</div>
              <div className="text-xs text-blue-500">
                {100 - percentualAtivos - percentualInativos}% do total
              </div>
            </div>
          </div>

          {/* Barra de Progresso Visual */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Distribuição da Carteira</span>
              <span>{resumoSafe.totalClientes} clientes total</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 flex overflow-hidden">
              <div 
                className="bg-green-500 h-full transition-all duration-300"
                style={{ width: `${percentualAtivos}%` }}
              />
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${100 - percentualAtivos - percentualInativos}%` }}
              />
              <div 
                className="bg-red-500 h-full transition-all duration-300"
                style={{ width: `${percentualInativos}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <span>Ativos ({percentualAtivos}%)</span>
              <span>Regulares ({100 - percentualAtivos - percentualInativos}%)</span>
              <span>Críticos ({percentualInativos}%)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}