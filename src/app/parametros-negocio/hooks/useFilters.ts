'use client';

import { useState } from 'react';
import type { RFVParameterSet } from '../types';

export function useFilters(parametros: RFVParameterSet[], ativo: (p: RFVParameterSet) => boolean) {
  const [search, setSearch] = useState('');
  const [filialFiltro, setFilialFiltro] = useState<number | null>(null);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [mostrar, setMostrar] = useState<{ [k: number]: boolean }>({});

  const toggle = (id: number) => {
    setMostrar(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtrados = parametros.filter(parametro => {
    const searchMatch = parametro.name.toLowerCase().includes(search.toLowerCase());
    const filialMatch = filialFiltro === null || parametro.filialId === filialFiltro;
    const statusMatch = status === 'all' || 
      (status === 'active' && ativo(parametro)) || 
      (status === 'inactive' && !ativo(parametro));
    return searchMatch && filialMatch && statusMatch;
  });

  return {
    search,
    setSearch,
    filialFiltro,
    setFilialFiltro,
    status,
    setStatus,
    mostrar,
    toggle,
    filtrados
  };
}
