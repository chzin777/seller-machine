'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';

// Interface para toda a configuração de inatividade
export interface ConfiguracaoInatividade {
  diasSemCompra: number;
  valorMinimoCompra: number;
  considerarTipoCliente: boolean;
  tiposClienteExcluidos: string[] | null;
  ativo: boolean;
}

// Tipos de clientes disponíveis (você pode ajustar conforme sua necessidade)
export const TIPOS_CLIENTE = [
  { value: 'PF', label: 'Pessoa Física' },
  { value: 'PJ', label: 'Pessoa Jurídica' },
  { value: 'ESPECIAL', label: 'Cliente Especial' },
  { value: 'VIP', label: 'VIP' },
  { value: 'DISTRIBUIDOR', label: 'Distribuidor' },
  { value: 'ATACADO', label: 'Atacado' },
] as const;

export function useInactivity() {
  const { showToast } = useToast();
  
  // Estado completo da configuração
  const [configuracao, setConfiguracao] = useState<ConfiguracaoInatividade>({
    diasSemCompra: 90,
    valorMinimoCompra: 0,
    considerarTipoCliente: false,
    tiposClienteExcluidos: null,
    ativo: true
  });
  const [diasInatividade, setDiasInatividade] = useState<number>(90);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [dirtyInatividade, setDirtyInatividade] = useState(false);

  // Sincronizar diasInatividade com configuracao.diasSemCompra
  useEffect(() => {
    setDiasInatividade(configuracao.diasSemCompra);
  }, [configuracao.diasSemCompra]);

  // Controlar dirty quando qualquer campo muda
  useEffect(() => {
    const isDefault = (
      configuracao.diasSemCompra === 90 &&
      configuracao.valorMinimoCompra === 0 &&
      configuracao.considerarTipoCliente === false &&
      configuracao.tiposClienteExcluidos === null &&
      configuracao.ativo === true
    );
    setDirtyInatividade(!isDefault);
  }, [configuracao]);

  // Função para atualizar campos individuais com validação
  const updateField = <K extends keyof ConfiguracaoInatividade>(
    field: K, 
    value: ConfiguracaoInatividade[K]
  ) => {
    // Aplicar validações específicas por campo
    let validatedValue = value;
    
    switch (field) {
      case 'diasSemCompra':
        // Permitir digitação livre, validar só no submit
        validatedValue = value;
        break;
        
      case 'valorMinimoCompra':
        // Garantir que valor seja >= 0
        const valor = value as number;
        validatedValue = Math.max(0, valor || 0) as ConfiguracaoInatividade[K];
        break;
        
      case 'tiposClienteExcluidos':
        // Se considerarTipoCliente for false, limpar a lista
        if (!configuracao.considerarTipoCliente) {
          validatedValue = null as ConfiguracaoInatividade[K];
        }
        break;
    }
    
    setConfiguracao(prev => ({
      ...prev,
      [field]: validatedValue
    }));
  };

  const carregarConfiguracaoInatividade = async () => {
    try {
      let empresaId = null;
      let userId = null;
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          empresaId = userData.empresaId || userData.empresa_id || 1;
          userId = userData.id || userData.user_id || 'default';
          console.log('📚 Carregando configuração para empresa:', empresaId);
        }
      }

      if (empresaId) {
        const response = await fetch(`/api/proxy?url=/api/configuracao-inatividade/empresa/${empresaId}`);
        
        if (response.ok) {
          const config = await response.json();
          setConfiguracao({
            diasSemCompra: config.diasSemCompra || 90,
            valorMinimoCompra: Number(config.valorMinimoCompra) || 0,
            considerarTipoCliente: Boolean(config.considerarTipoCliente),
            tiposClienteExcluidos: config.tiposClienteExcluidos || null,
            ativo: config.ativo !== undefined ? Boolean(config.ativo) : true
          });
          return 'online';
        } else if (response.status === 404) {
          return 'online';
        } else {
          console.warn(`⚠️ Erro ${response.status} ao carregar da API`);
          return 'offline';
        }
      }

      if (typeof window !== "undefined" && userId) {
        const configKey = `filtros_config_${userId}`;
        const localConfig = localStorage.getItem(configKey);
        if (localConfig) {
          const config = JSON.parse(localConfig);
          console.log('📱 Configuração carregada do localStorage:', config);
          setConfiguracao(prev => ({
            ...prev,
            diasSemCompra: Number(config.diasInatividade) || 90,
            // Manter outros campos do localStorage se existirem
            valorMinimoCompra: Number(config.valorMinimoCompra) || prev.valorMinimoCompra,
            considerarTipoCliente: Boolean(config.considerarTipoCliente) || prev.considerarTipoCliente,
            tiposClienteExcluidos: config.tiposClienteExcluidos || prev.tiposClienteExcluidos,
            ativo: config.ativo !== undefined ? Boolean(config.ativo) : prev.ativo
          }));
        } else {
          console.log('📝 Nenhuma configuração encontrada, usando padrão');
          // Manter configuração padrão já definida no estado inicial
        }
      }
      return 'offline';
    } catch (error) {
      console.error('❌ Erro ao carregar configuração de inatividade:', error);
      // Em caso de erro, manter configuração padrão
      setConfiguracao({
        diasSemCompra: 90,
        valorMinimoCompra: 0,
        considerarTipoCliente: false,
        tiposClienteExcluidos: null,
        ativo: true
      });
      return 'offline';
    }
  };

  // Função para validar a configuração antes de salvar
  const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validar dias de inatividade
    if (configuracao.diasSemCompra < 1) {
      errors.push('Dias de inatividade deve ser maior que zero');
    }
    
    // Validar valor mínimo
    if (configuracao.valorMinimoCompra < 0) {
      errors.push('Valor mínimo de compra não pode ser negativo');
    }
    
    // Validar tipos de cliente
    if (configuracao.considerarTipoCliente && 
        (!configuracao.tiposClienteExcluidos || configuracao.tiposClienteExcluidos.length === 0)) {
      errors.push('Se "Considerar tipo de cliente" estiver ativo, selecione pelo menos um tipo para excluir');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const salvarInatividade = async () => {
    // Validar antes de salvar
    const validation = validateConfiguration();
    if (!validation.isValid) {
      showToast(`Erro de validação: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    setLoadingFiltros(true);
    try {
      let empresaId = null;
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          empresaId = userData.empresaId || userData.empresa_id || 1;
          console.log('👤 Dados do usuário:', userData);
          console.log('🏢 EmpresaId encontrado:', empresaId);
        }
      }

      if (!empresaId) {
        showToast('Erro: Empresa não identificada. Faça login novamente.', 'error');
        return;
      }

      console.log('💾 Salvando configuração completa de inatividade via upsert:', { empresaId, configuracao });

      // Usar a nova API de upsert que garante que só haverá uma configuração por empresa
      const upsertPayload = {
        empresaId: parseInt(empresaId),
        diasSemCompra: configuracao.diasSemCompra,
        valorMinimoCompra: configuracao.valorMinimoCompra,
        considerarTipoCliente: configuracao.considerarTipoCliente,
        tiposClienteExcluidos: configuracao.tiposClienteExcluidos,
        ativo: configuracao.ativo
      };

      const upsertResponse = await fetch('/api/configuracao-inatividade-upsert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(upsertPayload)
      });

      if (!upsertResponse.ok) {
        const errorData = await upsertResponse.json();
        console.error('❌ Erro no upsert:', errorData);
        throw new Error(errorData.error || `Erro ao salvar configuração: ${upsertResponse.status}`);
      }

      const upsertResult = await upsertResponse.json();
      console.log('✅ Configuração salva via upsert:', upsertResult);

      setDirtyInatividade(false);
      const diasSolicitado = configuracao.diasSemCompra;
      let diasPersistidoAPI: number | null = null;
      try {
        // Revalidar imediatamente o que a API está devolvendo
        const verifyResp = await fetch(`/api/proxy?url=/api/configuracao-inatividade/empresa/${upsertPayload.empresaId}`);
        if (verifyResp.ok) {
          const verCfg = await verifyResp.json();
          diasPersistidoAPI = verCfg.diasSemCompra;
          console.log('🔍 Verificação pós-upsert -> API retornou diasSemCompra =', diasPersistidoAPI, ' (solicitado =', diasSolicitado, ')');
          if (typeof diasPersistidoAPI === 'number' && diasPersistidoAPI !== diasSolicitado) {
            showToast(`Aviso: backend retornou ${diasPersistidoAPI} em vez de ${diasSolicitado}. Mantendo valor local até correção.`, 'warning');
          }
        } else {
          console.warn('⚠️ Não foi possível verificar persistência após upsert:', verifyResp.status);
        }
      } catch (e) {
        console.warn('⚠️ Erro na verificação pós-upsert:', e);
      }
      
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          const userId = userData.id || userData.user_id || 'default';
          const configKey = `filtros_config_${userId}`;
          
          // Salvar configuração completa no localStorage
          localStorage.setItem(configKey, JSON.stringify({
            diasInatividade: diasPersistidoAPI && diasPersistidoAPI !== diasSolicitado ? diasPersistidoAPI : configuracao.diasSemCompra, // se API divergir, ainda guardamos o que ela devolveu para rastrear
            diasSolicitadoOriginal: diasSolicitado,
            divergenciaAPI: diasPersistidoAPI !== null && diasPersistidoAPI !== diasSolicitado ? true : false,
            valorMinimoCompra: configuracao.valorMinimoCompra,
            considerarTipoCliente: configuracao.considerarTipoCliente,
            tiposClienteExcluidos: configuracao.tiposClienteExcluidos,
            ativo: configuracao.ativo,
            dataUltimaAtualizacao: new Date().toISOString()
          }));
        }
        
        // Notificar outras páginas sobre a mudança
        window.dispatchEvent(new CustomEvent('inactivityConfigChanged', { 
          detail: { diasInatividade: diasSolicitado, timestamp: Date.now() }
        }));
      }

      showToast('Configuração de inatividade salva com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro principal:', error);
      
      try {
        console.log('🔄 Tentando fallback para localStorage...');
        
        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            const userId = userData.id || userData.user_id || 'default';
            const configKey = `filtros_config_${userId}`;
            
            // Salvar configuração completa no localStorage como fallback
            localStorage.setItem(configKey, JSON.stringify({
              diasInatividade: configuracao.diasSemCompra,
              valorMinimoCompra: configuracao.valorMinimoCompra,
              considerarTipoCliente: configuracao.considerarTipoCliente,
              tiposClienteExcluidos: configuracao.tiposClienteExcluidos,
              ativo: configuracao.ativo,
              dataUltimaAtualizacao: new Date().toISOString()
            }));
            
            console.log('💾 Configuração salva no localStorage como fallback');
            showToast('Configuração salva localmente (API indisponível)', 'warning');
            setDirtyInatividade(false);
            return;
          }
        }
        
        throw error;
      } catch (fallbackError) {
        console.error('❌ Erro no fallback também:', fallbackError);
        showToast('Erro ao salvar configuração de inatividade', 'error');
      }
    } finally {
      setLoadingFiltros(false);
    }
  };

  const resetInatividade = async () => {
    try {
      let empresaId = null;
      let userId = null;
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          empresaId = userData.empresaId || userData.empresa_id || 1;
          userId = userData.id || userData.user_id || 'default';
          console.log('🔄 Resetando configuração para empresa:', empresaId);
        }
      }

      // Resetar usando a nova API de upsert com valores padrão
      if (empresaId) {
        const defaultConfig = {
          empresaId: parseInt(empresaId),
          diasSemCompra: 90,
          valorMinimoCompra: 0,
          considerarTipoCliente: false,
          tiposClienteExcluidos: null,
          ativo: true
        };

        try {
          const resetResponse = await fetch('/api/configuracao-inatividade-upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultConfig)
          });

          if (resetResponse.ok) {
            showToast('Configuração resetada para valores padrão', 'success');
          } else {
            console.warn('⚠️ Erro ao resetar via API, resetando apenas localmente');
          }
        } catch (error) {
          console.warn('⚠️ Erro ao conectar com API para reset, resetando apenas localmente');
        }
      }

      // Resetar estado local para configuração padrão
      setConfiguracao({
        diasSemCompra: 90,
        valorMinimoCompra: 0,
        considerarTipoCliente: false,
        tiposClienteExcluidos: null,
        ativo: true
      });
      setDirtyInatividade(false);

      if (typeof window !== "undefined" && userId) {
        const configKey = `filtros_config_${userId}`;
        localStorage.removeItem(configKey);
        
        // Notificar outras páginas sobre o reset
        window.dispatchEvent(new CustomEvent('inactivityConfigChanged', { 
          detail: { diasInatividade: 90, timestamp: Date.now() }
        }));
      }
    } catch (error) {
      console.error('Erro ao resetar configuração:', error);
      // Mesmo com erro, resetar localmente
      setConfiguracao({
        diasSemCompra: 90,
        valorMinimoCompra: 0,
        considerarTipoCliente: false,
        tiposClienteExcluidos: null,
        ativo: true
      });
      setDirtyInatividade(false);
      showToast('Configuração resetada localmente', 'warning');
    }
  };

  return {
    // Configuração completa
    configuracao,
    updateField,
    validateConfiguration,
    
    // Compatibilidade com código existente
    diasInatividade: configuracao.diasSemCompra,
    setDiasInatividade: (value: number) => updateField('diasSemCompra', value),
    
    // Estados e funções
    loadingFiltros,
    dirtyInatividade,
    carregarConfiguracaoInatividade,
    salvarInatividade,
    resetInatividade,
    
    // Constantes úteis
    TIPOS_CLIENTE
  };
}
