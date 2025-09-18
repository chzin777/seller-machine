'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import PageHeader from './components/PageHeader';
import TabNavigation from './components/TabNavigation';
import InactivityTab from './components/InactivityTab';
import RFVTab from './components/RFVTab';
import ExistingTab from './components/ExistingTab';
import type { RFVRule, RFVParameterSet, FilialOption } from './types';
import type { ConfiguracaoInatividade } from './hooks/useInactivity';

export default function ParametrosNegocio() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'inatividade' | 'rfv' | 'existentes'>('inatividade');
  const [diasInatividade, setDiasInatividade] = useState(90);
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [dirtyInatividade, setDirtyInatividade] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  const baseRec = [
    { score: 5, label: 'Muito Recente', min: 0, max: 30 },
    { score: 4, label: 'Recente', min: 31, max: 90 },
    { score: 3, label: 'Moderado', min: 91, max: 180 },
    { score: 2, label: 'Antigo', min: 181, max: 365 },
    { score: 1, label: 'Muito Antigo', min: 366 }
  ];

  const baseFreq = [
    { score: 5, label: 'Muito Frequente', min: 20 },
    { score: 4, label: 'Frequente', min: 10, max: 19 },
    { score: 3, label: 'Moderado', min: 5, max: 9 },
    { score: 2, label: 'Pouco Frequente', min: 2, max: 4 },
    { score: 1, label: 'Raro', min: 1, max: 1 }
  ];

  const baseVal = [
    { score: 5, label: 'Muito Alto', min: 10000 },
    { score: 4, label: 'Alto', min: 5000, max: 9999 },
    { score: 3, label: 'Moderado', min: 2000, max: 4999 },
    { score: 2, label: 'Baixo', min: 500, max: 1999 },
    { score: 1, label: 'Muito Baixo', max: 499 }
  ];

  const [config, setConfig] = useState<RFVParameterSet>({
    name: '',
    calculation_strategy: 'automatic',
    effectiveFrom: new Date().toISOString().split('T')[0],
    ruleRecency: [...baseRec],
    ruleFrequency: [...baseFreq],
    ruleValue: [...baseVal]
  });

  const [editing, setEditing] = useState<RFVParameterSet | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [parametros, setParametros] = useState<RFVParameterSet[]>([]);
  const [loadingLista, setLoadingLista] = useState(false);
  const [search, setSearch] = useState('');
  const [filialFiltro, setFilialFiltro] = useState<number | null>(null);
  const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [mostrar, setMostrar] = useState<{ [k: number]: boolean }>({});
  const [filiais, setFiliais] = useState<FilialOption[]>([]);

  // Estado da configuração de inatividade
  const [configuracaoInatividade, setConfiguracaoInatividade] = useState<ConfiguracaoInatividade>({
    diasSemCompra: 90,
    valorMinimoCompra: 0,
    considerarTipoCliente: false,
    tiposClienteExcluidos: [],
    ativo: true
  });

  // Função para atualizar campos da configuração de inatividade
  const updateInactivityField = <K extends keyof ConfiguracaoInatividade>(
    field: K, 
    value: ConfiguracaoInatividade[K]
  ) => {
    setConfiguracaoInatividade(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'diasSemCompra') {
      setDiasInatividade(value as number);
    }
  };

  useEffect(() => {
    carregarFiliais();
    carregarParametros();
    carregarConfiguracaoInatividade();
    verificarStatusAPI();
  }, []);

  useEffect(() => {
    setDirtyInatividade(diasInatividade !== 90);
  }, [diasInatividade]);

  const verificarStatusAPI = async () => {
    try {
      console.log('🔍 Verificando status da API externa...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade`, {
        method: 'HEAD',
      });
      
      if (response.status < 500) {
        setApiStatus('online');
        console.log('✅ API externa está online');
      } else {
        setApiStatus('offline');
        console.log('❌ API externa está offline (erro 500+)');
      }
    } catch (error) {
      setApiStatus('offline');
      console.log('❌ API externa está offline (erro de conexão):', error);
    }
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade/empresa/${empresaId}`);
        console.log('📥 Status do carregamento:', response.status);
        
        if (response.ok) {
          const config = await response.json();
          console.log('✅ Configuração carregada da API:', config);
          setDiasInatividade(config.diasSemCompra || 90);
          setConfiguracaoInatividade({
            diasSemCompra: config.diasSemCompra || 90,
            valorMinimoCompra: config.valorMinimoCompra || 0,
            considerarTipoCliente: config.considerarTipoCliente || false,
            tiposClienteExcluidos: config.tiposClienteExcluidos || [],
            ativo: config.ativo !== false
          });
          setApiStatus('online');
          return;
        } else if (response.status === 404) {
          console.log('⚠️ Configuração não encontrada na API, usando localStorage como fallback');
          setApiStatus('online');
        } else {
          console.warn(`⚠️ Erro ${response.status} ao carregar da API, usando localStorage como fallback`);
          setApiStatus('offline');
        }
      }

      if (typeof window !== "undefined" && userId) {
        const configKey = `filtros_config_${userId}`;
        const localConfig = localStorage.getItem(configKey);
        if (localConfig) {
          const config = JSON.parse(localConfig);
          console.log('📱 Configuração carregada do localStorage:', config);
          setDiasInatividade(config.diasInatividade || 90);
        } else {
          console.log('📝 Nenhuma configuração encontrada, usando padrão (90 dias)');
          setDiasInatividade(90);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar configuração de inatividade:', error);
      setApiStatus('offline');
      setDiasInatividade(90);
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

  const carregarParametros = async () => {
    setLoadingLista(true);
    try {
      const response = await fetch('/api/rfv-parameters');
      if (response.ok) {
        const data = await response.json();
        setParametros(data);
      }
    } catch (error) {
      console.error('Erro ao carregar parâmetros:', error);
    } finally {
      setLoadingLista(false);
    }
  };

  const salvarInatividade = async () => {
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

      console.log('💾 Salvando configuração de inatividade:', { empresaId, diasInatividade });

      const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade/empresa/${empresaId}`);
      console.log('🔍 Status da verificação:', checkResponse.status);
      
      if (checkResponse.ok) {
        const existingConfig = await checkResponse.json();
        console.log('📝 Atualizando configuração existente:', existingConfig.id);
        
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade/${existingConfig.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diasSemCompra: diasInatividade,
            ativo: true
          })
        });
        
        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('❌ Erro ao atualizar:', errorText);
          throw new Error(`Erro ao atualizar configuração: ${updateResponse.status}`);
        }
        console.log('✅ Configuração atualizada com sucesso');
      } else if (checkResponse.status === 404) {
        console.log('➕ Criando nova configuração');
        
        const createPayload = {
          empresaId,
          diasSemCompra: diasInatividade,
          valorMinimoCompra: 0,
          considerarTipoCliente: false,
          tiposClienteExcluidos: [],
          ativo: true
        };
        console.log('📦 Payload da criação:', createPayload);
        
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });
        
        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('❌ Erro ao criar:', errorText);
          throw new Error(`Erro ao criar configuração: ${createResponse.status} - ${errorText}`);
        }
        console.log('✅ Configuração criada com sucesso');
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
          
          localStorage.setItem(configKey, JSON.stringify({
            diasInatividade,
            dataUltimaAtualizacao: new Date().toISOString()
          }));
        }
      }

      showToast('Configuração de inatividade salva com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro principal:', error);
      
      try {
        console.log('🔄 Tentando fallback para API local...');
        
        let empresaId = null;
        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            empresaId = userData.empresaId || userData.empresa_id || 1;
          }
        }

        if (typeof window !== "undefined") {
          const user = localStorage.getItem("user") || sessionStorage.getItem("user");
          if (user) {
            const userData = JSON.parse(user);
            const userId = userData.id || userData.user_id || 'default';
            const configKey = `filtros_config_${userId}`;
            
            localStorage.setItem(configKey, JSON.stringify({
              diasInatividade,
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

      const checkResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade/empresa/${empresaId}`);
      console.log('🔍 Status da verificação para reset:', checkResponse.status);
      
      if (checkResponse.ok) {
        const existingConfig = await checkResponse.json();
        console.log('🔄 Resetando configuração existente:', existingConfig.id);
        
        const updateResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/configuracao-inatividade/${existingConfig.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            diasSemCompra: 90,
            ativo: true
          })
        });
        
        if (updateResponse.ok) {
          showToast('Configuração resetada para 90 dias', 'success');
        }
      }

      setDiasInatividade(90);
      setDirtyInatividade(false);

      if (typeof window !== "undefined" && userId) {
        const configKey = `filtros_config_${userId}`;
        localStorage.removeItem(configKey);
      }
    } catch (error) {
      console.error('Erro ao resetar configuração:', error);
      setDiasInatividade(90);
      setDirtyInatividade(false);
      showToast('Configuração resetada localmente', 'warning');
    }
  };

  const salvarRFV = async () => {
    if (!config.name.trim()) {
      showToast('Por favor, informe um nome para a configuração', 'warning');
      return;
    }

    setSavingConfig(true);
    try {
      const body = editing ? { ...config, id: editing.id } : config;
      const url = editing ? `/api/rfv-parameters/${editing.id}` : '/api/rfv-parameters';
      
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) throw new Error('Erro ao salvar');
      
      showToast(`Configuração ${editing ? 'atualizada' : 'salva'} com sucesso!`, 'success');
      resetConfig();
      carregarParametros();
    } catch (error) {
      showToast('Erro ao salvar configuração', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const resetConfig = () => {
    setConfig({
      name: '',
      calculation_strategy: 'automatic',
      effectiveFrom: new Date().toISOString().split('T')[0],
      ruleRecency: [...baseRec],
      ruleFrequency: [...baseFreq],
      ruleValue: [...baseVal]
    });
    setEditing(null);
  };

  const updateRange = (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue', index: number, field: keyof RFVRule, value: any) => {
    setConfig(prev => ({
      ...prev,
      [type]: prev[type].map((rule, i) => 
        i === index ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const addRange = (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue') => {
    const newRule = { score: 1, label: '', min: 0, max: 100 };
    setConfig(prev => ({
      ...prev,
      [type]: [...prev[type], newRule]
    }));
  };

  const removeRange = (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue', index: number) => {
    setConfig(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const excluir = async (id: number) => {
    try {
      const response = await fetch(`/api/rfv-parameters/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (response.ok) {
        carregarParametros();
        showToast('Configuração excluída com sucesso!', 'success');
      } else {
        throw new Error('Erro no servidor');
      }
    } catch (error) {
      showToast('Erro ao excluir configuração', 'error');
    }
  };

  const duplicar = (parametro: RFVParameterSet) => {
    setConfig({
      ...parametro,
      name: `${parametro.name} (Cópia)`,
      effectiveFrom: new Date().toISOString().split('T')[0]
    });
    setActiveTab('rfv');
    setEditing(null);
  };

  const editar = (parametro: RFVParameterSet) => {
    setConfig(parametro);
    setEditing(parametro);
    setActiveTab('rfv');
  };

  const toggle = (id: number) => {
    setMostrar(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const ativo = (parametro: RFVParameterSet) => {
    const hoje = new Date();
    const inicio = new Date(parametro.effectiveFrom);
    const fim = parametro.effectiveTo ? new Date(parametro.effectiveTo) : null;
    
    return hoje >= inicio && (!fim || hoje <= fim);
  };

  const resumo = (rules: RFVRule[], tipo: 'recency' | 'frequency' | 'value') => {
    if (!rules.length) return 'Nenhuma regra definida';
    const maxScore = Math.max(...rules.map(r => r.score));
    const minScore = Math.min(...rules.map(r => r.score));
    return `${rules.length} faixas (Score ${minScore}-${maxScore})`;
  };

  const filtrados = parametros.filter(parametro => {
    const searchMatch = parametro.name.toLowerCase().includes(search.toLowerCase());
    const filialMatch = filialFiltro === null || parametro.filialId === filialFiltro;
    const statusMatch = status === 'all' || 
      (status === 'active' && ativo(parametro)) || 
      (status === 'inactive' && !ativo(parametro));
    return searchMatch && filialMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader apiStatus={apiStatus} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'inatividade' && (
          <InactivityTab
            configuracao={configuracaoInatividade}
            updateField={updateInactivityField}
            diasInatividade={diasInatividade}
            setDiasInatividade={setDiasInatividade}
            loadingFiltros={loadingFiltros}
            dirtyInatividade={dirtyInatividade}
            salvarInatividade={salvarInatividade}
            resetInatividade={resetInatividade}
          />
        )}

        {activeTab === 'rfv' && (
          <RFVTab
            config={config}
            setConfig={setConfig}
            editing={editing}
            savingConfig={savingConfig}
            filiais={filiais}
            salvarRFV={salvarRFV}
            resetConfig={resetConfig}
            updateRange={updateRange}
            addRange={addRange}
            removeRange={removeRange}
          />
        )}

        {activeTab === 'existentes' && (
          <ExistingTab
            parametros={parametros}
            filtrados={filtrados}
            loadingLista={loadingLista}
            search={search}
            setSearch={setSearch}
            filialFiltro={filialFiltro}
            setFilialFiltro={setFilialFiltro}
            status={status}
            setStatus={setStatus}
            mostrar={mostrar}
            toggle={toggle}
            filiais={filiais}
            ativo={ativo}
            resumo={resumo}
            duplicar={duplicar}
            editar={editar}
            excluir={excluir}
          />
        )}
      </div>
    </div>
  );
}
