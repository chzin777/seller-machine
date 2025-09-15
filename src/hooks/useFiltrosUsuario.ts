// Hook para facilitar o uso das configurações de filtros em componentes

import { useState, useEffect } from 'react';
import { FiltrosConfig, carregarFiltrosUsuario, FILTROS_PADRAO } from '../lib/filtros-config';

/**
 * Hook que retorna as configurações de filtros do usuário atual
 * e se atualiza automaticamente quando elas mudam
 */
export function useFiltrosUsuario() {
  const [filtros, setFiltros] = useState<FiltrosConfig>(FILTROS_PADRAO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarFiltros = () => {
      try {
        let userId = null;
        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (user) {
            userId = JSON.parse(user).id;
          }
        }

        const filtrosCarregados = carregarFiltrosUsuario(userId);
        setFiltros(filtrosCarregados);
      } catch (error) {
        console.warn('Erro ao carregar filtros do usuário:', error);
        setFiltros(FILTROS_PADRAO);
      } finally {
        setLoading(false);
      }
    };

    carregarFiltros();

    // Escutar mudanças no localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('filtros_')) {
        carregarFiltros();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { filtros, loading };
}

/**
 * Hook simplificado que retorna apenas os dias de inatividade configurados
 */
export function useDiasInatividade(): number {
  const { filtros } = useFiltrosUsuario();
  return filtros.diasInatividade;
}
