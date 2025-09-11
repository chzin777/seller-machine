"use client";

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useData } from './DataProvider';

// Função para formatar valores compactos
function formatCompact(value: number) {
  if (value === null || value === undefined) return '';
  const abs = Math.abs(value);
  if (abs >= 1e9) {
    let v = (value / 1e9).toFixed(2).replace('.', ',');
    v = v.replace(/,00$/, '');
    v = v.replace(/,0$/, '');
    return v + 'B';
  }
  if (abs >= 1e6) {
    let v = (value / 1e6).toFixed(2).replace('.', ',');
    v = v.replace(/,00$/, '');
    v = v.replace(/,0$/, '');
    return v + 'M';
  }
  if (abs >= 1e3) {
    let v = (value / 1e3).toFixed(1).replace('.', ',');
    v = v.replace(/,0$/, '');
    return v + 'K';
  }
  let v = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  v = v.replace(/,00$/, '');
  v = v.replace(/,0$/, '');
  return v;
}

// Função para abreviar nomes de meses
function abreviarMes(mes: string) {
  const mapa: Record<string, string> = {
    'Janeiro': 'Jan',
    'Fevereiro': 'Fev',
    'Março': 'Mar',
    'Abril': 'Abr',
    'Maio': 'Mai',
    'Junho': 'Jun',
    'Julho': 'Jul',
    'Agosto': 'Ago',
    'Setembro': 'Set',
    'Outubro': 'Out',
    'Novembro': 'Nov',
    'Dezembro': 'Dez',
  };
  return mapa[mes] || mes;
}

// Função para obter o nome completo do mês
function nomeCompletoMes(mes: string) {
  const mapa: Record<string, string> = {
    'Jan': 'Janeiro', 'Fev': 'Fevereiro', 'Mar': 'Março', 'Abr': 'Abril',
    'Mai': 'Maio', 'Jun': 'Junho', 'Jul': 'Julho', 'Ago': 'Agosto',
    'Set': 'Setembro', 'Out': 'Outubro', 'Nov': 'Novembro', 'Dez': 'Dezembro'
  };
  return mapa[mes] || mes;
}

// Função para filtrar meses baseado no ano atual e disponibilidade de dados
function filtrarMesesInteligente(receitaMensal: any) {
  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear(); // 2025
  const mesAtualNumero = dataAtual.getMonth(); // 0-11 (Janeiro = 0, Setembro = 8)
  
  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  let dadosDisponiveis: [string, number][] = [];

  // Verificar se temos dados do ano atual (2025)
  if (receitaMensal?.ano === anoAtual && receitaMensal?.receitaPorMes) {
    dadosDisponiveis = Object.entries(receitaMensal.receitaPorMes)
      .map(([nomeDoMes, valor]) => [nomeDoMes, Number(valor) || 0] as [string, number])
      .filter(([nomeDoMes, valor]) => {
        const numeroDoMes = mesesNomes.indexOf(nomeDoMes);
        // Só incluir meses que já passaram E que têm valor > 0
        return numeroDoMes !== -1 && numeroDoMes <= mesAtualNumero && valor > 0;
      })
      .sort(([a], [b]) => mesesNomes.indexOf(a) - mesesNomes.indexOf(b));
  }

  // Se não temos dados suficientes de 2025 ou os dados estão zerados, usar dados de qualquer ano disponível
  if (dadosDisponiveis.length < 2 && receitaMensal?.receitaPorMes) {
    dadosDisponiveis = Object.entries(receitaMensal.receitaPorMes)
      .map(([nomeDoMes, valor]) => [nomeDoMes, Number(valor) || 0] as [string, number])
      .filter(([, valor]) => valor > 0) // Só pegar meses com dados reais
      .sort(([a], [b]) => mesesNomes.indexOf(a) - mesesNomes.indexOf(b));
  }

  if (dadosDisponiveis.length >= 2) {
    const anoEstimado = receitaMensal.ano || anoAtual;
    return { dados: dadosDisponiveis, ano: anoEstimado };
  }

  return null;
}

export default function GraficoCrescimentoMensal() {
  const data = useData();

  // Dados mock para teste se não houver dados reais
  const dadosMock = {
    ano: 2025,
    receitaPorMes: {
      'Janeiro': 120000,
      'Fevereiro': 135000,
      'Março': 148000,
      'Abril': 142000,
      'Maio': 156000,
      'Junho': 163000,
      'Julho': 158000,
      'Agosto': 171000,
      'Setembro': 145000
    }
  };

  // Usar dados reais ou mock
  const receitaMensal = data.receitaMensal || dadosMock;

  // Calcular crescimento mensal com busca inteligente de dados
  const calcularCrescimento = () => {
    if (!receitaMensal) {
      return null;
    }

    // Buscar dados de forma inteligente
    const resultado = filtrarMesesInteligente(receitaMensal);
    
    if (!resultado || resultado.dados.length < 2) {
      return null;
    }

    // Pegar os dois últimos meses disponíveis
    const [mesAnteriorNome, mesAnteriorValor] = resultado.dados[resultado.dados.length - 2];
    const [mesAtualNome, mesAtualValor] = resultado.dados[resultado.dados.length - 1];

    const valorAnterior = Number(mesAnteriorValor) || 0;
    const valorAtual = Number(mesAtualValor) || 0;

    // Calcular crescimento percentual
    const crescimentoPercentual = valorAnterior > 0 
      ? ((valorAtual - valorAnterior) / valorAnterior * 100)
      : valorAtual > 0 ? 100 : 0;

    const crescimentoAbsoluto = valorAtual - valorAnterior;

    return {
      mesAnterior: {
        nome: abreviarMes(mesAnteriorNome),
        nomeCompleto: mesAnteriorNome,
        valor: valorAnterior
      },
      mesAtual: {
        nome: abreviarMes(mesAtualNome),
        nomeCompleto: mesAtualNome,
        valor: valorAtual
      },
      crescimentoPercentual,
      crescimentoAbsoluto,
      tendencia: crescimentoPercentual > 0 ? 'alta' : crescimentoPercentual < 0 ? 'baixa' : 'neutra',
      ano: resultado.ano
    };
  };

  const crescimento = calcularCrescimento();

  if (data.loading) {
    return (
      <Card className="shadow-xl border border-indigo-200/30 bg-white rounded-2xl overflow-hidden h-full">
        <CardHeader className="p-4 sm:p-6 border-b border-indigo-200/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg animate-pulse">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-sm">Carregando...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!crescimento) {
    return (
      <Card className="shadow-xl border border-indigo-200/30 bg-white rounded-2xl overflow-hidden h-full">
        <CardHeader className="p-4 sm:p-6 border-b border-indigo-200/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-indigo-800">Crescimento Mensal</h3>
              <p className="text-xs sm:text-sm text-gray-600">Comparação mês atual vs anterior</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-48 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium text-sm">Dados insuficientes</p>
              <p className="text-gray-400 text-xs mt-1">
                Precisa de pelo menos 2 meses com receita {'>'} 0
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Dados disponíveis: {data.receitaMensal?.receitaPorMes ? 
                  Object.entries(data.receitaMensal.receitaPorMes)
                    .filter(([, valor]) => Number(valor) > 0).length : 0} meses
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dados para o gráfico
  const dadosGrafico = [
    {
      periodo: crescimento.mesAnterior.nome,
      valor: crescimento.mesAnterior.valor,
      tipo: 'anterior'
    },
    {
      periodo: crescimento.mesAtual.nome,
      valor: crescimento.mesAtual.valor,
      tipo: 'atual'
    }
  ];

  // Cores baseadas na tendência
  const cores = {
    alta: ['#dc2626', '#16a34a'], // vermelho para anterior, verde para atual
    baixa: ['#16a34a', '#dc2626'], // verde para anterior, vermelho para atual
    neutra: ['#6366f1', '#6366f1'] // azul para ambos
  };

  const TendenciaIcon = crescimento.tendencia === 'alta' 
    ? TrendingUp 
    : crescimento.tendencia === 'baixa' 
    ? TrendingDown 
    : Minus;

  const tendenciaColor = crescimento.tendencia === 'alta' 
    ? 'text-green-600' 
    : crescimento.tendencia === 'baixa' 
    ? 'text-red-600' 
    : 'text-gray-600';

  const tendenciaBg = crescimento.tendencia === 'alta' 
    ? 'bg-green-50 border-green-200' 
    : crescimento.tendencia === 'baixa' 
    ? 'bg-red-50 border-red-200' 
    : 'bg-gray-50 border-gray-200';

  return (
    <Card className="shadow-xl border border-indigo-200/30 bg-white rounded-2xl overflow-hidden h-full">
      <CardHeader className="p-4 sm:p-6 border-b border-indigo-200/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-indigo-800 truncate">
                Crescimento Mensal {crescimento.ano && `(${crescimento.ano})`}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                {crescimento.mesAnterior.nomeCompleto} vs {crescimento.mesAtual.nomeCompleto}
              </p>
            </div>
          </div>
          {/* Indicador de crescimento */}
          <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${tendenciaBg} self-start`}>
            <TendenciaIcon className={`w-3 h-3 sm:w-4 sm:h-4 ${tendenciaColor}`} />
            <span className={`text-xs font-semibold ${tendenciaColor}`}>
              {crescimento.crescimentoPercentual > 0 ? '+' : ''}{crescimento.crescimentoPercentual.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {/* Cards de comparação - mais compactos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-gray-600 mb-1">
              {crescimento.mesAnterior.nomeCompleto}
            </p>
            <p className="text-sm sm:text-lg font-bold text-gray-800">
              R$ {formatCompact(crescimento.mesAnterior.valor)}
            </p>
          </div>
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <p className="text-xs font-medium text-indigo-600 mb-1">
              {crescimento.mesAtual.nomeCompleto}
            </p>
            <p className="text-sm sm:text-lg font-bold text-indigo-800">
              R$ {formatCompact(crescimento.mesAtual.valor)}
            </p>
          </div>
        </div>

        {/* Indicador do ano dos dados */}
        {crescimento.ano !== new Date().getFullYear() && (
          <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <p className="text-xs text-amber-700">
              📊 Dados de {crescimento.ano}
            </p>
          </div>
        )}

        {/* Indicadores de variação - mais compactos */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Variação Absoluta</p>
            <p className={`text-xs font-semibold ${tendenciaColor}`}>
              {crescimento.crescimentoAbsoluto > 0 ? '+' : ''}R$ {formatCompact(Math.abs(crescimento.crescimentoAbsoluto))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Variação %</p>
            <p className={`text-xs font-semibold ${tendenciaColor}`}>
              {crescimento.crescimentoPercentual > 0 ? '+' : ''}{crescimento.crescimentoPercentual.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Gráfico de barras - altura reduzida */}
        <div className="h-32 sm:h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dadosGrafico}
              margin={{ top: 20, right: 15, left: 10, bottom: 40 }}
            >
              <defs>
                <linearGradient id="bar-anterior" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6b7280" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#9ca3af" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="bar-atual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="bar-alta" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#16a34a" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="bar-baixa" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc2626" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                stroke="#e5e7eb" 
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis 
                dataKey="periodo" 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(v) => `R$ ${formatCompact(v)}`} 
                tick={{ fontSize: 12, fill: '#6b7280', fontWeight: '500' }}
                tickLine={false}
                axisLine={false}
                dx={-5}
                width={60}
              />
              <Tooltip 
                formatter={(v: number) => [`R$ ${formatCompact(v)}`, 'Receita']}
                labelFormatter={(label) => nomeCompletoMes(label)}
                labelStyle={{ 
                  color: '#1f2937', 
                  fontWeight: '600',
                  fontSize: '14px'
                }}
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  color: '#374151',
                  fontSize: '13px'
                }}
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
              />
              <Bar 
                dataKey="valor" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.tipo === 'anterior' ? 'url(#bar-anterior)' : 
                      crescimento.tendencia === 'alta' ? 'url(#bar-alta)' :
                      crescimento.tendencia === 'baixa' ? 'url(#bar-baixa)' :
                      'url(#bar-atual)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
