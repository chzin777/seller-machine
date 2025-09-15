'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import type { RFVRule, RFVParameterSet, FilialOption } from '../types';

export function useRFV() {
  const { showToast } = useToast();

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
    setEditing(null);
  };

  const editar = (parametro: RFVParameterSet) => {
    setConfig(parametro);
    setEditing(parametro);
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

  return {
    config,
    setConfig,
    editing,
    savingConfig,
    parametros,
    loadingLista,
    carregarParametros,
    salvarRFV,
    resetConfig,
    updateRange,
    addRange,
    removeRange,
    excluir,
    duplicar,
    editar,
    ativo,
    resumo
  };
}
