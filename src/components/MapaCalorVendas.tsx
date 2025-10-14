"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';
import GenericTiltedCard from '../blocks/Components/GenericTiltedCard';
import { CardLoader } from './LoadingSpinner';

// Importação dinâmica do mapa para evitar problemas de SSR
const MapaComponent = dynamic(() => import('../components/MapaComponente'), {
  ssr: false,
  loading: () => <CardLoader text="Carregando mapa..." />
});

type DadosVendaPorRegiao = {
  cidade: string;
  estado: string;
  totalVendas: number;
  totalClientes: number;
  receitaTotal: number;
  latitude?: number;
  longitude?: number;
};

type VendaPorFilial = {
  filial: { nome: string };
  receitaTotal: number;
  quantidadeNotas: number;
};

interface MapaCalorVendasProps {
  vendasPorFilial?: VendaPorFilial[];
}

// Coordenadas aproximadas de algumas cidades brasileiras para demonstração
const coordenadasCidades: Record<string, { lat: number; lng: number }> = {
  "São Paulo": { lat: -23.5505, lng: -46.6333 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  "Belo Horizonte": { lat: -19.9208, lng: -43.9378 },
  "Brasília": { lat: -15.7942, lng: -47.8822 },
  "Salvador": { lat: -12.9714, lng: -38.5014 },
  "Fortaleza": { lat: -3.7319, lng: -38.5267 },
  "Curitiba": { lat: -25.4284, lng: -49.2733 },
  "Recife": { lat: -8.0476, lng: -34.8770 },
  "Porto Alegre": { lat: -30.0346, lng: -51.2177 },
  "Manaus": { lat: -3.1190, lng: -60.0217 },
  "Goiânia": { lat: -16.6869, lng: -49.2648 },
  "Belém": { lat: -1.4558, lng: -48.5044 },
  "Guarulhos": { lat: -23.4628, lng: -46.5338 },
  "Campinas": { lat: -22.9099, lng: -47.0626 },
  "São Luís": { lat: -2.5307, lng: -44.3068 },
  "São Gonçalo": { lat: -22.8267, lng: -43.0537 },
  "Maceió": { lat: -9.6658, lng: -35.7353 },
  "Duque de Caxias": { lat: -22.7856, lng: -43.3123 },
  "Natal": { lat: -5.7945, lng: -35.2110 }
};

export default function MapaCalorVendas({ vendasPorFilial = [] }: MapaCalorVendasProps) {
  const [dadosVendas, setDadosVendas] = useState<DadosVendaPorRegiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);

  useEffect(() => {
    const buscarDadosVendas = async () => {
      setLoading(true);
      try {
        // Buscar dados de clientes para obter informações de localização
        const resClientes = await fetch('/api/proxy?url=/api/clientes');
        const clientes = await resClientes.json();

        // Processar dados por região
        const vendasPorRegiao: Record<string, DadosVendaPorRegiao> = {};

        // Agrupar clientes por cidade/estado
        if (Array.isArray(clientes)) {
          clientes.forEach((cliente: any) => {
            if (!cliente.cidade || !cliente.estado) return;

            const chaveRegiao = `${cliente.cidade}-${cliente.estado}`;
            if (!vendasPorRegiao[chaveRegiao]) {
              const coordenadas = coordenadasCidades[cliente.cidade] || 
                                 coordenadasCidades[cliente.estado] ||
                                 { lat: -15.7942, lng: -47.8822 }; // Brasília como padrão

              vendasPorRegiao[chaveRegiao] = {
                cidade: cliente.cidade,
                estado: cliente.estado,
                totalVendas: 0,
                totalClientes: 0,
                receitaTotal: 0,
                latitude: coordenadas.lat,
                longitude: coordenadas.lng
              };
            }
            vendasPorRegiao[chaveRegiao].totalClientes += 1;
          });
        }

        // Se temos dados de vendas por filial, vamos tentar correlacionar
        if (vendasPorFilial.length > 0) {
          console.log('Debug - Dados brutos de vendas por filial:', vendasPorFilial);
          
          vendasPorFilial.forEach((venda) => {
            // Tentar extrair cidade do nome da filial (assumindo formato "Filial - Cidade")
            const nomeFilial = venda.filial.nome;
            const match = nomeFilial.match(/^(.*?)\s*-\s*(.+)$/);
            let cidadePossivel = match ? match[2].trim() : nomeFilial;

            console.log(`Debug - Processando filial: ${nomeFilial}, cidade possível: ${cidadePossivel}, receita: ${venda.receitaTotal}`);

            // Procurar por uma região correspondente
            const regiaoEncontrada = Object.keys(vendasPorRegiao).find(chave => {
              const regiao = vendasPorRegiao[chave];
              return regiao.cidade.toLowerCase().includes(cidadePossivel.toLowerCase()) ||
                     cidadePossivel.toLowerCase().includes(regiao.cidade.toLowerCase());
            });

            if (regiaoEncontrada) {
              // Garantir que os valores sejam números válidos e limitados
              const receitaValor = Math.min(Number(venda.receitaTotal) || 0, 999999999999);
              const quantidadeValor = Math.min(Number(venda.quantidadeNotas) || 0, 999999999);
              
              console.log(`Debug - Adicionando à região existente ${regiaoEncontrada}: receita=${receitaValor}, quantidade=${quantidadeValor}`);
              
              vendasPorRegiao[regiaoEncontrada].receitaTotal += receitaValor;
              vendasPorRegiao[regiaoEncontrada].totalVendas += quantidadeValor;
            } else {
              // Se não encontrou, criar uma nova entrada baseada no nome da filial
              const coordenadas = coordenadasCidades[cidadePossivel] || 
                                 { lat: -15.7942, lng: -47.8822 };

              // Garantir que os valores sejam números válidos e limitados
              const receitaValor = Math.min(Number(venda.receitaTotal) || 0, 999999999999);
              const quantidadeValor = Math.min(Number(venda.quantidadeNotas) || 0, 999999999);

              console.log(`Debug - Criando nova região ${cidadePossivel}: receita=${receitaValor}, quantidade=${quantidadeValor}`);

              const novaChave = `${cidadePossivel}-Unknown`;
              vendasPorRegiao[novaChave] = {
                cidade: cidadePossivel,
                estado: 'N/A',
                totalVendas: quantidadeValor,
                totalClientes: 0,
                receitaTotal: receitaValor,
                latitude: coordenadas.lat,
                longitude: coordenadas.lng
              };
            }
          });
        }

        const dadosProcessados = Object.values(vendasPorRegiao)
          .filter(regiao => regiao.totalClientes > 0 || regiao.receitaTotal > 0)
          .sort((a, b) => b.receitaTotal - a.receitaTotal);

        // Debug: Verificar se há valores suspeitos
        console.log('Debug - Dados de vendas processados:', dadosProcessados);
        console.log('Debug - Total receita calculado:', dadosProcessados.reduce((sum, item) => sum + (Number(item.receitaTotal) || 0), 0));

        setDadosVendas(dadosProcessados);
      } catch {
        console.error('Erro ao buscar dados de vendas');
        setDadosVendas([]);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosVendas();
  }, [vendasPorFilial]);

  const totalReceita = dadosVendas.reduce((sum, item) => sum + (Number(item.receitaTotal) || 0), 0);
  const totalClientes = dadosVendas.reduce((sum, item) => sum + (Number(item.totalClientes) || 0), 0);
  const totalVendas = dadosVendas.reduce((sum, item) => sum + (Number(item.totalVendas) || 0), 0);

  // Função para formatar valores monetários de forma segura
  const formatarMoeda = (valor: number): string => {
    if (!valor || isNaN(valor) || !isFinite(valor)) return 'R$ 0,00';
    
    // Limitar a valores razoáveis (máximo 999 bilhões)
    const valorLimitado = Math.min(Math.abs(valor), 999999999999);
    
    try {
      return `R$ ${valorLimitado.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } catch {
      return `R$ ${valorLimitado.toFixed(2).replace('.', ',')}`;
    }
  };

  // Função para formatar números grandes
  const formatarNumero = (valor: number): string => {
    if (!valor || isNaN(valor) || !isFinite(valor)) return '0';
    
    const valorLimitado = Math.min(Math.abs(valor), 999999999999);
    
    try {
      return valorLimitado.toLocaleString('pt-BR');
    } catch {
      return valorLimitado.toString();
    }
  };

  // Lógica de paginação
  const totalPaginas = Math.ceil(dadosVendas.length / porPagina) || 1;
  const dadosPaginados = dadosVendas.slice((pagina - 1) * porPagina, pagina * porPagina);

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Receita Total */}
        <GenericTiltedCard className="col-span-1">
          <Card className="shadow-lg border border-green-200/60 bg-white h-full kpi-container">
            <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-3 flex-shrink-0">
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-green-800 leading-tight w-full">Receita Total</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-2 pb-3">
              <div className="font-extrabold tracking-tight text-green-800 flex items-center gap-1 sm:gap-2 kpi-number-responsive kpi-number">
                <span className="text-[0.8em] flex-shrink-0">R$</span>
                <span className="break-all" title={formatarMoeda(totalReceita)}>
                  {totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>

        {/* Total de Clientes */}
        <GenericTiltedCard className="col-span-1">
          <Card className="shadow-lg border bg-white h-full kpi-container" style={{ borderColor: 'rgba(0, 49, 83, 0.6)' }}>
            <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-3 flex-shrink-0">
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold leading-tight w-full" style={{ color: '#003153' }}>Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-2 pb-3">
              <div className="font-extrabold tracking-tight kpi-number-responsive kpi-number" style={{ color: '#003153' }}>
                {totalClientes.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>

        {/* Total de Vendas */}
        <GenericTiltedCard className="col-span-1">
          <Card className="shadow-lg border border-purple-200/60 bg-white h-full kpi-container">
            <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-3 flex-shrink-0">
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-purple-800 leading-tight w-full">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-2 pb-3">
              <div className="font-extrabold tracking-tight text-purple-800 kpi-number-responsive kpi-number">
                {totalVendas.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Mapa de calor */}
  <Card className="shadow-xl border-0 bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold" style={{ color: '#003153' }}>
            <MapPin className="w-5 h-5" />
            Mapa de Calor - Vendas por Região
          </CardTitle>
          <p className="text-sm text-gray-600">
            Visualize a distribuição geográfica das suas vendas
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <CardLoader text="Carregando dados..." />
          ) : (
            <div className="h-96">
              <MapaComponent dados={dadosVendas} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile: Cards, Desktop: Tabela */}
      {/* Mobile: Cards */}
      <div className="flex flex-col gap-3 sm:gap-4 lg:hidden">
        {loading ? (
          <CardLoader text="Carregando dados..." />
        ) : dadosVendas.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-white  rounded-xl shadow border border-gray-100 ">Nenhum dado de vendas disponível</div>
        ) : (
          dadosPaginados.map((item, i) => (
            <div key={i} className="rounded-xl shadow-lg border border-gray-100  bg-white  p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 text-white rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: '#003153' }}>{item.cidade[0]}</span>
                    <span className="font-bold text-sm truncate" style={{ color: '#003153' }}>{item.cidade}</span>
                  </div>
                  <span className="text-xs ml-8" style={{ color: '#003153' }}>{item.estado}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(0, 49, 83, 0.05)' }}>
                  <span className="font-medium text-xs" style={{ color: '#003153' }}>Clientes</span>
                  <p className="font-bold text-sm" style={{ color: '#003153' }}>{formatarNumero(item.totalClientes)}</p>
                </div>
                <div className="bg-green-50 rounded-lg px-3 py-2">
                  <span className="text-green-600 font-medium text-xs">Vendas</span>
                  <p className="text-green-800 font-bold text-sm">{formatarNumero(item.totalVendas)}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-600">Receita</span>
                <span className="font-bold text-green-700 text-sm">{formatarMoeda(item.receitaTotal)}</span>
              </div>
            </div>
          ))
        )}
        {/* Paginação para Mobile */}
        {dadosVendas.length > porPagina && (
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-center gap-2">
              <label htmlFor="porPaginaMobile" className="text-sm text-gray-700 ">Por página:</label>
              <select
                id="porPaginaMobile"
                className="border rounded px-2 py-1 bg-white text-sm" 
                style={{ color: '#003153' }}
                value={porPagina}
                onChange={e => {
                  setPorPagina(Number(e.target.value));
                  setPagina(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium hover:cursor-pointer"
                onClick={() => setPagina(p => Math.max(1, p - 1))}
                disabled={pagina === 1}
              >
                ← Anterior
              </button>
              <span className="text-sm text-gray-700 px-3 py-2 bg-gray-100  rounded-lg font-medium">
                {pagina} de {totalPaginas}
              </span>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:bg-gray-400 hover:bg-blue-700 transition-colors text-sm font-medium hover:cursor-pointer"
                onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                disabled={pagina === totalPaginas}
              >
                Próxima →
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Desktop: Tabela */}
  <Card className="shadow-lg border-0 bg-white hidden lg:block">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900">
            Vendas por Região
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white text-blue-800 border-b">
                  <th className="p-3 text-left font-semibold">Cidade</th>
                  <th className="p-3 text-left font-semibold">Estado</th>
                  <th className="p-3 text-right font-semibold">Clientes</th>
                  <th className="p-3 text-right font-semibold">Vendas</th>
                  <th className="p-3 text-right font-semibold">Receita</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8">
                      <CardLoader text="Carregando dados da tabela..." />
                    </td>
                  </tr>
                ) : dadosVendas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500">
                      Nenhum dado de vendas disponível
                    </td>
                  </tr>
                ) : (
                  dadosPaginados.map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-100 hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-800">
                        {item.cidade}
                      </td>
                      <td className="p-3 text-gray-600 ">
                        {item.estado}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {formatarNumero(item.totalClientes)}
                      </td>
                      <td className="p-3 text-right text-gray-600">
                        {formatarNumero(item.totalVendas)}
                      </td>
                      <td className="p-3 text-right font-semibold text-green-600 truncate max-w-32" title={formatarMoeda(item.receitaTotal)}>
                        {formatarMoeda(item.receitaTotal)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} className="py-4">
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label htmlFor="porPagina" className="text-sm text-gray-700 ">Exibir por página:</label>
                        <select
                          id="porPagina"
                          className="border border-blue-600 rounded px-2 py-1 bg-white text-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                          value={porPagina}
                          onChange={e => {
                            setPorPagina(Number(e.target.value));
                            setPagina(1);
                          }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={15}>15</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                      {dadosVendas.length > porPagina && (
                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 rounded border bg-white text-blue-700 disabled:opacity-50 hover:cursor-pointer"
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                          >Anterior</button>
                          <span className="text-sm text-gray-700">Página {pagina} de {totalPaginas}</span>
                          <button
                            className="px-3 py-1 rounded border bg-white text-blue-700 disabled:opacity-50 hover:cursor-pointer"
                            onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                            disabled={pagina === totalPaginas}
                          >Próxima</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
