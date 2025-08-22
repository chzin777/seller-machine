"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MapPin } from 'lucide-react';
import GenericTiltedCard from '../blocks/Components/GenericTiltedCard/GenericTiltedCard';

// Importação dinâmica do mapa para evitar problemas de SSR
const MapaComponent = dynamic(() => import('../components/MapaComponente'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-600 dark:text-gray-400">Carregando mapa...</p>
      </div>
    </div>
  )
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
  const [clientesPorRegiao, setClientesPorRegiao] = useState<DadosVendaPorRegiao[]>([]);
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
        setClientesPorRegiao(dadosProcessados);
      } catch (error) {
        console.error('Erro ao buscar dados de vendas:', error);
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
    } catch (error) {
      return `R$ ${valorLimitado.toFixed(2).replace('.', ',')}`;
    }
  };

  // Função para formatar números grandes
  const formatarNumero = (valor: number): string => {
    if (!valor || isNaN(valor) || !isFinite(valor)) return '0';
    
    const valorLimitado = Math.min(Math.abs(valor), 999999999999);
    
    try {
      return valorLimitado.toLocaleString('pt-BR');
    } catch (error) {
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
          <Card className="shadow-lg border border-green-200/60 bg-gradient-to-br from-green-50/80 to-white/80 dark:from-green-900/20 dark:to-gray-950/80 backdrop-blur-sm h-full kpi-container">
            <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-3 flex-shrink-0">
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-green-900 dark:text-green-200 leading-tight w-full">Receita Total</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-2 pb-3">
              <div className="font-extrabold tracking-tight text-green-900 dark:text-green-100 flex items-center gap-1 sm:gap-2 kpi-number-responsive kpi-number">
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
          <Card className="shadow-lg border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-white/80 dark:from-blue-900/20 dark:to-gray-950/80 backdrop-blur-sm h-full kpi-container">
            <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-3 flex-shrink-0">
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-blue-900 dark:text-blue-200 leading-tight w-full">Total de Clientes</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-2 pb-3">
              <div className="font-extrabold tracking-tight text-blue-900 dark:text-blue-100 kpi-number-responsive kpi-number">
                {totalClientes.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>

        {/* Total de Vendas */}
        <GenericTiltedCard className="col-span-1">
          <Card className="shadow-lg border border-purple-200/60 bg-gradient-to-br from-purple-50/80 to-white/80 dark:from-purple-900/20 dark:to-gray-950/80 backdrop-blur-sm h-full kpi-container">
            <CardHeader className="flex flex-row items-start justify-between pb-1 pt-3 px-3 flex-shrink-0">
              <CardTitle className="text-xs sm:text-sm md:text-base font-bold text-purple-900 dark:text-purple-200 leading-tight w-full">Total de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="kpi-content px-3 pt-2 pb-3">
              <div className="font-extrabold tracking-tight text-purple-900 dark:text-purple-100 kpi-number-responsive kpi-number">
                {totalVendas.toLocaleString('pt-BR')}
              </div>
            </CardContent>
          </Card>
        </GenericTiltedCard>
      </div>

      {/* Mapa de calor */}
      <Card className="shadow-xl border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-blue-900 dark:text-blue-200">
            <MapPin className="w-5 h-5" />
            Mapa de Calor - Vendas por Região
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Visualize a distribuição geográfica das suas vendas
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="h-96 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600 dark:text-gray-400">Carregando dados...</p>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <MapaComponent dados={dadosVendas} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de dados por região */}
      <Card className="shadow-lg border-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-200">
            Vendas por Região
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-200 border-b">
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
                    <td colSpan={5} className="text-center py-8 text-gray-400">Carregando...</td>
                  </tr>
                ) : dadosVendas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-500 dark:text-gray-400">
                      Nenhum dado de vendas disponível
                    </td>
                  </tr>
                ) : (
                  dadosPaginados.map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <td className="p-3 font-medium text-gray-800 dark:text-gray-100">
                        {item.cidade}
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-300">
                        {item.estado}
                      </td>
                      <td className="p-3 text-right text-gray-600 dark:text-gray-300">
                        {formatarNumero(item.totalClientes)}
                      </td>
                      <td className="p-3 text-right text-gray-600 dark:text-gray-300">
                        {formatarNumero(item.totalVendas)}
                      </td>
                      <td className="p-3 text-right font-semibold text-green-600 dark:text-green-400 truncate max-w-32" title={formatarMoeda(item.receitaTotal)}>
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
                        <label htmlFor="porPagina" className="text-sm text-gray-700 dark:text-gray-300">Exibir por página:</label>
                        <select
                          id="porPagina"
                          className="border rounded px-2 py-1 bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200"
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
                            className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 disabled:opacity-50 hover:cursor-pointer"
                            onClick={() => setPagina(p => Math.max(1, p - 1))}
                            disabled={pagina === 1}
                          >Anterior</button>
                          <span className="text-sm text-gray-700 dark:text-gray-300">Página {pagina} de {totalPaginas}</span>
                          <button
                            className="px-3 py-1 rounded border bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-200 disabled:opacity-50 hover:cursor-pointer"
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
