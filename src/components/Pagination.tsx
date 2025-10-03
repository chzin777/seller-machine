import React from 'react';
import { Button } from './ui/button';
import { 
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showItemsPerPageSelector?: boolean;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPageSelector = false
}: PaginationProps) {
  const goToFirstPage = () => onPageChange(1);
  const goToPreviousPage = () => onPageChange(Math.max(currentPage - 1, 1));
  const goToNextPage = () => onPageChange(Math.min(currentPage + 1, totalPages));
  const goToLastPage = () => onPageChange(totalPages);

  const getPageNumbers = (): (number | string)[] => {
    const delta = 2; // Número de páginas a mostrar antes e depois da atual
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    // Sempre mostrar a primeira página
    if (totalPages > 1) {
      range.push(1);
    }

    // Páginas ao redor da página atual
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Sempre mostrar a última página (se não for a primeira)
    if (totalPages > 1) {
      range.push(totalPages);
    }

    // Adicionar "..." onde necessário
    let prev = 0;
    range.forEach((page) => {
      if (page - prev === 2) {
        rangeWithDots.push(prev + 1);
      } else if (page - prev !== 1) {
        rangeWithDots.push('...');
      }
      rangeWithDots.push(page);
      prev = page;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4 mt-6">
      {/* Informações da paginação */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600">
        <span>
          Mostrando {startItem} até {endItem} de {totalItems} itens
        </span>
        
        {showItemsPerPageSelector && onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>

      {/* Controles de navegação */}
      <div className="flex items-center gap-1">
        {/* Navegação rápida */}
        <Button
          variant="outline"
          size="sm"
          onClick={goToFirstPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronsLeft className="w-3 h-3" />
          <span className="hidden sm:inline">Primeira</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1 mx-2">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={index} className="px-2 py-1 text-gray-400">
                  ...
                </span>
              );
            }
            
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page as number)}
                className="w-8 h-8 p-0 text-xs"
              >
                {page}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="w-3 h-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToLastPage}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          <span className="hidden sm:inline">Última</span>
          <ChevronsRight className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}