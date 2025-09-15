'use client';

import { useState } from 'react';
import type { FilialOption } from '../types';

export function useAPI() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [filiais, setFiliais] = useState<FilialOption[]>([]);

  const verificarStatusAPI = async () => {
    try {
      console.log('🔍 Verificando status da API externa via proxy...');
      const response = await fetch('/api/proxy?url=/api/configuracao-inatividade', {
        method: 'HEAD',
      });
      
      if (response.status < 500) {
        setApiStatus('online');
        console.log('✅ API externa está online (via proxy)');
      } else {
        setApiStatus('offline');
        console.log('❌ API externa está offline (erro 500+ via proxy)');
      }
    } catch (error) {
      setApiStatus('offline');
      console.log('❌ API externa está offline (erro de conexão via proxy):', error);
    }
  };

  const carregarFiliais = async () => {
    try {
      const response = await fetch('/api/vendedores');
      if (response.ok) {
        const data = await response.json();
        const filiaisUnicas = Array.from(
          new Map(data.map((v: any) => [v.filial, { id: v.filialId || 1, nome: v.filial }])).values()
        ) as FilialOption[];
        setFiliais(filiaisUnicas);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    }
  };

  return {
    apiStatus,
    filiais,
    verificarStatusAPI,
    carregarFiliais
  };
}
