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
  
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [dirtyInatividade, setDirtyInatividade] = useState(false);

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
        // Garantir que dias seja entre 1 e 365
        const dias = value as number;
        validatedValue = Math.max(1, Math.min(365, dias || 90)) as ConfiguracaoInatividade[K];
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
    if (configuracao.diasSemCompra < 1 || configuracao.diasSemCompra > 365) {
      errors.push('Dias de inatividade deve estar entre 1 e 365');
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

      console.log('💾 Salvando configuração completa de inatividade:', { empresaId, configuracao });

      const checkResponse = await fetch(`/api/proxy?url=/api/configuracao-inatividade/empresa/${empresaId}`);
      
      if (checkResponse.ok) {
        const existingConfig = await checkResponse.json();
        
        const updateResponse = await fetch(`/api/proxy?url=/api/configuracao-inatividade/${existingConfig.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diasSemCompra: configuracao.diasSemCompra,
            valorMinimoCompra: configuracao.valorMinimoCompra,
            considerarTipoCliente: configuracao.considerarTipoCliente,
            tiposClienteExcluidos: configuracao.tiposClienteExcluidos,
            ativo: configuracao.ativo
          })
        });
        
        if (!updateResponse.ok) {
          throw new Error(`Erro ao atualizar configuração: ${updateResponse.status}`);
        }
      } else if (checkResponse.status === 404) {
        console.log('➕ Criando nova configuração');
        
        const createPayload = {
          empresaId: parseInt(empresaId),
          diasSemCompra: configuracao.diasSemCompra,
          valorMinimoCompra: configuracao.valorMinimoCompra,
          considerarTipoCliente: configuracao.considerarTipoCliente,
          tiposClienteExcluidos: configuracao.tiposClienteExcluidos,
          ativo: configuracao.ativo
        };
        
        const createResponse = await fetch('/api/proxy?url=/api/configuracao-inatividade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          throw new Error(`Erro ao criar configuração: ${createResponse.status} - ${errorText}`);
        }
      } else {
        const errorText = await checkResponse.text();
        console.error('❌ Erro na verificação:', errorText);
        throw new Error(`Erro ao verificar configuração existente: ${checkResponse.status}`);
      }

      setDirtyInatividade(false);
      
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (user) {
          const userData = JSON.parse(user);
          const userId = userData.id || userData.user_id || 'default';
          const configKey = `filtros_config_${userId}`;
          
          // Salvar configuração completa no localStorage
          localStorage.setItem(configKey, JSON.stringify({
            diasInatividade: configuracao.diasSemCompra, // manter compatibilidade
            valorMinimoCompra: configuracao.valorMinimoCompra,
            considerarTipoCliente: configuracao.considerarTipoCliente,
            tiposClienteExcluidos: configuracao.tiposClienteExcluidos,
            ativo: configuracao.ativo,
            dataUltimaAtualizacao: new Date().toISOString()
          }));
        }
        
        // Notificar outras páginas sobre a mudança
        window.dispatchEvent(new CustomEvent('inactivityConfigChanged', { 
          detail: { diasInatividade: configuracao.diasSemCompra, timestamp: Date.now() }
        }));
      }

      showToast('Configuração de inatividade salva com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro principal:', error);
      
      try {
        console.log('🔄 Tentando fallback para API local...');
        
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
            showToast('Configuração salva localmente (API externa indisponível)', 'warning');
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

      const checkResponse = await fetch(`/api/proxy?url=/api/configuracao-inatividade/empresa/${empresaId}`);
      console.log('🔍 Status da verificação para reset:', checkResponse.status);
      
      if (checkResponse.ok) {
        const existingConfig = await checkResponse.json();
        console.log('🔄 Resetando configuração existente:', existingConfig.id);
        
        const defaultConfig = {
          diasSemCompra: 90,
          valorMinimoCompra: 0,
          considerarTipoCliente: false,
          tiposClienteExcluidos: null,
          ativo: true
        };
        
        const updateResponse = await fetch(`/api/proxy?url=/api/configuracao-inatividade/${existingConfig.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(defaultConfig)
        });
        
        if (updateResponse.ok) {
          showToast('Configuração resetada para valores padrão', 'success');
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
