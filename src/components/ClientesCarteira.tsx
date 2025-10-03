import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import Pagination from './Pagination';
import { usePagination } from '../hooks/usePagination';
import { 
  Users, 
  TrendingUp, 
  Calendar, 
  Phone, 
  MapPin,
  DollarSign,
  Clock,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  cpfCnpj: string;
  cidade: string | null;
  estado: string | null;
  telefone: string | null;
  vendas: Array<{
    id: number;
    numeroNota: number;
    dataEmissao: string;
    valorTotal: number;
  }>;
  estatisticas: {
    totalVendas: number;
    receitaTotal: number;
    ticketMedio: number;
    ultimaVenda: string | null;
    primeiraVenda: string | null;
    diasSemCompra: number | null;
  };
}

interface ClientesCarteiraProps {
  clientes: Cliente[];
  loading?: boolean;
  onViewDetails?: (clienteId: number) => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export default function ClientesCarteira({ 
  clientes, 
  loading, 
  onViewDetails,
  itemsPerPage = 30,
  onItemsPerPageChange
}: ClientesCarteiraProps) {
  const [isChangingPage, setIsChangingPage] = useState(false);

  // Hook de paginação
  const {
    currentPage,
    totalPages,
    totalItems,
    paginatedData: clientesPaginados,
    setCurrentPage,
    setItemsPerPage,
    currentItemsPerPage
  } = usePagination<Cliente>({
    data: clientes || [],
    itemsPerPage,
    resetOnDataChange: true
  });

  // Função para mudança de página com loading
  const handlePageChange = (page: number) => {
    setIsChangingPage(true);
    setCurrentPage(page);
    // Simular um pequeno delay para suavizar a transição
    setTimeout(() => setIsChangingPage(false), 150);
  };

  // Função para mudança de itens por página
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    onItemsPerPageChange?.(newItemsPerPage);
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

  const getStatusCliente = (diasSemCompra: number | null) => {
    if (!diasSemCompra) return { label: 'Novo', color: 'bg-blue-100 text-blue-800' };
    if (diasSemCompra <= 30) return { label: 'Ativo', color: 'bg-green-100 text-green-800' };
    if (diasSemCompra <= 90) return { label: 'Inativo', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Crítico', color: 'bg-red-100 text-red-800' };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3">
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-2 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!clientes || clientes.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum cliente encontrado
          </h3>
          <p className="text-gray-600">
            Este vendedor não possui clientes no período selecionado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">


      {/* Lista de clientes paginada */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 transition-opacity duration-150 ${isChangingPage ? 'opacity-50' : 'opacity-100'}`}>
        {clientesPaginados.map((cliente) => {
        const status = getStatusCliente(cliente.estatisticas.diasSemCompra);
        
        return (
          <Card key={cliente.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-1 pt-2 px-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold text-gray-900 mb-0.5">
                    {cliente.nome}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <span>{cliente.cpfCnpj}</span>
                    {cliente.cidade && cliente.estado && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />
                          <span>{cliente.cidade}, {cliente.estado}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={`${status.color} font-medium`}>
                    {status.label}
                  </Badge>
                  
                  {cliente.estatisticas.diasSemCompra && cliente.estatisticas.diasSemCompra > 90 && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 px-3 pb-2">
              {/* Estatísticas principais */}
              <div className="grid grid-cols-2 gap-1.5 mb-2">
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-0.5 text-green-600">
                    <DollarSign className="w-2.5 h-2.5" />
                  </div>
                  <div className="font-semibold text-xs text-gray-900">
                    {formatCurrency(cliente.estatisticas.receitaTotal)}
                  </div>
                  <div className="text-xs text-gray-500">Receita</div>
                </div>
                
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-0.5 text-blue-600">
                    <TrendingUp className="w-2.5 h-2.5" />
                  </div>
                  <div className="font-semibold text-xs text-gray-900">
                    {formatCurrency(cliente.estatisticas.ticketMedio)}
                  </div>
                  <div className="text-xs text-gray-500">Ticket Médio</div>
                </div>
                
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-0.5 text-purple-600">
                    <Users className="w-2.5 h-2.5" />
                  </div>
                  <div className="font-semibold text-xs text-gray-900">
                    {cliente.estatisticas.totalVendas}
                  </div>
                  <div className="text-xs text-gray-500">Vendas</div>
                </div>
                
                <div className="text-center p-1.5 bg-gray-50 rounded">
                  <div className="flex items-center justify-center gap-0.5 text-orange-600">
                    <Clock className="w-2.5 h-2.5" />
                  </div>
                  <div className="font-semibold text-xs text-gray-900">
                    {cliente.estatisticas.diasSemCompra || 0}d
                  </div>
                  <div className="text-xs text-gray-500">Sem Compra</div>
                </div>
              </div>
              
              {/* Informações adicionais */}
              <div className="flex flex-col gap-0.5 text-xs text-gray-600 mb-1.5">
                {cliente.estatisticas.ultimaVenda && (
                  <div className="flex items-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    <span>Última: {formatDate(cliente.estatisticas.ultimaVenda)}</span>
                  </div>
                )}
                
                {cliente.telefone && (
                  <div className="flex items-center gap-0.5">
                    <Phone className="w-2.5 h-2.5" />
                    <span>{cliente.telefone}</span>
                  </div>
                )}
              </div>
              
              {/* Últimas vendas */}
              {cliente.vendas.length > 0 && (
                <div className="border-t pt-1.5">
                  <h4 className="text-xs font-medium text-gray-700 mb-1">
                    Últimas Vendas ({cliente.vendas.length > 2 ? '2 de ' : ''}{cliente.vendas.length})
                  </h4>
                  <div className="space-y-0.5">
                    {cliente.vendas.slice(0, 2).map((venda) => (
                      <div key={venda.id} className="flex items-center justify-between text-xs bg-gray-50 p-1 rounded">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">#{venda.numeroNota}</span>
                          <span className="text-gray-500">{formatDate(venda.dataEmissao)}</span>
                        </div>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(venda.valorTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Ações */}
              <div className="flex justify-end mt-1.5 pt-1.5 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails?.(cliente.id)}
                  className="flex items-center gap-0.5 text-xs h-6 px-2"
                >
                  <Eye className="w-2.5 h-2.5" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        );
        })}
      </div>

      {/* Controles de Paginação */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={currentItemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        showItemsPerPageSelector={true}
      />
    </div>
  );
}