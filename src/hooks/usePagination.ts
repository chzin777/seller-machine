import { useState, useEffect, useMemo } from 'react';

interface UsePaginationOptions {
  data: any[];
  itemsPerPage: number;
  resetOnDataChange?: boolean;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  paginatedData: T[];
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (itemsPerPage: number) => void;
  goToFirstPage: () => void;
  goToPreviousPage: () => void;
  goToNextPage: () => void;
  goToLastPage: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
  hasMultiplePages: boolean;
  currentItemsPerPage: number;
}

export function usePagination<T = any>({
  data,
  itemsPerPage: initialItemsPerPage,
  resetOnDataChange = true
}: UsePaginationOptions): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  // Cálculos derivados
  const totalItems = data?.length || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;
  const hasMultiplePages = totalPages > 1;

  // Dados paginados
  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Funções de navegação
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToLastPage = () => setCurrentPage(totalPages);

  const setItemsPerPage = (newItemsPerPage: number) => {
    setItemsPerPageState(newItemsPerPage);
    setCurrentPage(1); // Reset para primeira página
  };

  // Reset para primeira página quando dados mudam
  useEffect(() => {
    if (resetOnDataChange) {
      setCurrentPage(1);
    }
  }, [data, resetOnDataChange]);

  // Ajustar página atual se estiver fora do range válido
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    totalItems,
    paginatedData,
    setCurrentPage,
    setItemsPerPage,
    goToFirstPage,
    goToPreviousPage,
    goToNextPage,
    goToLastPage,
    isFirstPage,
    isLastPage,
    hasMultiplePages,
    currentItemsPerPage: itemsPerPage
  };
}