'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook global para gerenciar configuração de inatividade
 * Sincroniza entre API externa, localStorage e todas as páginas
 */
export function useInactivityConfig() {
  const [diasInatividade, setDiasInatividade] = useState<number>(90);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Função para carregar configuração da API externa ou localStorage
  const loadConfiguration = useCallback(async (): Promise<number> => {
    setLoading(true);
    try {
      let empresaId = null;
      let userId = null;
      
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          empresaId = userData.empresaId || userData.empresa_id || 1;
          userId = userData.id || userData.user_id || 'default';
        }
      }

      // Tentar carregar da API externa primeiro
      if (empresaId) {
        try {
          const response = await fetch(`/api/proxy?url=/api/configuracao-inatividade/empresa/${empresaId}`);
          
          if (response.ok) {
            const config = await response.json();
            const apiDias = config.diasSemCompra || 90;
            const apiUpdatedAt = config.updatedAt ? new Date(config.updatedAt).getTime() : Date.now();

            // Ver se existe config local e comparar timestamps
            if (userId) {
              const configKey = `filtros_config_${userId}`;
              const localConfigRaw = localStorage.getItem(configKey);
              if (localConfigRaw) {
                try {
                  const localConfig = JSON.parse(localConfigRaw);
                  const localDias = localConfig.diasInatividade;
                  const localUpdated = localConfig.dataUltimaAtualizacao ? new Date(localConfig.dataUltimaAtualizacao).getTime() : 0;

                  // Sempre prioriza o valor do banco após salvar ou reload
                  if (typeof apiDias === 'number') {
                    setDiasInatividade(apiDias);
                    setLastUpdated(config.updatedAt || new Date().toISOString());
                    return apiDias;
                  }
                } catch (e) {
                  console.warn('Falha ao parsear config local para comparar com API:', e);
                }
              }
              // Atualizar/alinhar storage com valor da API
              localStorage.setItem(configKey, JSON.stringify({
                diasInatividade: apiDias,
                dataUltimaAtualizacao: new Date().toISOString()
              }));
            }

            setDiasInatividade(apiDias);
            setLastUpdated(config.updatedAt || new Date().toISOString());
            return apiDias;
          }
        } catch (error) {
          console.warn('Erro ao carregar da API externa via proxy, usando localStorage:', error);
        }
      }

      // Fallback para localStorage
      if (userId && typeof window !== "undefined") {
        const configKey = `filtros_config_${userId}`;
        const localConfig = localStorage.getItem(configKey);
        
        if (localConfig) {
          const config = JSON.parse(localConfig);
      const dias = config.diasInatividade || 90;
      console.log('📦 Carregando configuração de inatividade do localStorage (fallback). Dias:', dias);
      setDiasInatividade(dias);
      setLastUpdated(config.dataUltimaAtualizacao);
      return dias;
        }
      }

      // Padrão
      setDiasInatividade(90);
      return 90;
      
    } catch (error) {
      console.error('Erro ao carregar configuração de inatividade:', error);
      setDiasInatividade(90);
      return 90;
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para atualizar configuração e notificar outras páginas
  const loadConfigurationRef = useRef(loadConfiguration);
  useEffect(() => { loadConfigurationRef.current = loadConfiguration }, [loadConfiguration]);

  const updateConfiguration = useCallback((newDias: number) => {
    setDiasInatividade(newDias);
    setLastUpdated(new Date().toISOString());
    // Disparar evento personalizado para notificar outras páginas
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('inactivityConfigChanged', { 
        detail: { diasInatividade: newDias, timestamp: Date.now() }
      }));
    }
    // Forçar recarregamento do valor atualizado do banco
    setTimeout(() => {
      if (typeof window !== "undefined" && loadConfigurationRef.current) {
        console.log('🔄 Forçando reload da configuração após salvar...');
        loadConfigurationRef.current();
      }
    }, 500);
  }, []);

  // Listener para mudanças vindas de outras páginas/abas
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleConfigChange = (event: CustomEvent) => {
      const { diasInatividade: newDias } = event.detail;
      setDiasInatividade(newDias);
      setLastUpdated(new Date().toISOString());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key?.includes('filtros_config_')) {
        if (event.newValue) {
          try {
            const config = JSON.parse(event.newValue);
            setDiasInatividade(config.diasInatividade || 90);
            setLastUpdated(config.dataUltimaAtualizacao);
          } catch (error) {
            console.warn('Erro ao parsear configuração do storage:', error);
          }
        }
      }
    };

    window.addEventListener('inactivityConfigChanged', handleConfigChange as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('inactivityConfigChanged', handleConfigChange as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Carregar configuração na inicialização
  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  return {
    diasInatividade,
    loading,
    lastUpdated,
    loadConfiguration,
    updateConfiguration
  };
}