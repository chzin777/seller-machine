'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/toast';
import { Plus, Trash2, Save, RotateCcw, Settings, Users, TrendingUp, Filter, Search, Calendar, Building, Copy, Download, BarChart3 } from 'lucide-react';

// Interfaces
interface RFVBin {
  score: number;
  max_dias?: number;
  min_compras?: number;
  min_valor?: number;
}

interface RFVParameterFromAPI {
  id: number;
  filialId: number | null;
  name: string;
  strategy: string;
  windowDays: number;
  weights: {
    F: number;
    R: number;
    V: number;
  };
  ruleRecency: {
    bins: RFVBin[];
  };
  ruleFrequency: {
    bins: RFVBin[];
  };
  ruleValue: {
    bins: RFVBin[];
  };
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  calculationStrategy: 'manual' | 'automatic';
  classRanges: any;
  conditionalRules: any;
  filial: {
    id: number;
    nome: string;
  } | null;
  segments: Array<{
    id: number;
    name: string;
    priority: number;
  }>;
}

interface RFVFilters {
  search: string;
  active: boolean | null; // null = todos, true = só ativos, false = só inativos
  filialId: number | null; // null = todas
  calculationStrategy: string | null; // null = todos, 'automatic', 'manual'
}
interface RFVRange {
  min?: number;
  max?: number;
  score: number;
  label: string;
}

interface RFVRules {
  recency: RFVRange[];
  frequency: RFVRange[];
  value: RFVRange[];
}

interface Segment {
  segment_name: string;
  rules: {
    R?: string;
    F?: string;
    V?: string;
  };
  priority: number;
}

interface FilialOption {
  id: number;
  empresaId: number;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
}

interface RFVConfiguration {
  id?: number;
  name: string;
  filialId?: number | null;
  rfvRules: RFVRules;
  segmentationMethod: 'automatic' | 'manual';
  automaticRanges?: {
    bronze: { min: number; max: number };
    prata: { min: number; max: number };
    ouro: { min: number; max: number };
  };
  segments?: Segment[];
  effectiveFrom: string;
}

export default function ConfigurarRFVPage() {
  const [configuration, setConfiguration] = useState<RFVConfiguration>({
    name: '',
    filialId: undefined,
    rfvRules: {
      recency: [
        { score: 5, label: 'Excelente', min: undefined, max: 30 },
        { score: 4, label: 'Bom', min: 31, max: 60 },
        { score: 3, label: 'Regular', min: 61, max: 90 },
        { score: 2, label: 'Ruim', min: 91, max: 180 },
        { score: 1, label: 'Péssimo', min: 181, max: undefined }
      ],
      frequency: [
        { score: 5, label: 'Excelente', min: 10, max: undefined },
        { score: 4, label: 'Bom', min: 6, max: 10 },
        { score: 3, label: 'Regular', min: 3, max: 5 },
        { score: 2, label: 'Ruim', min: 2, max: 2 },
        { score: 1, label: 'Péssimo', min: undefined, max: 1 }
      ],
      value: [
        { score: 5, label: 'Excelente', min: 1000, max: undefined },
        { score: 4, label: 'Bom', min: 501, max: 1000 },
        { score: 3, label: 'Regular', min: 201, max: 500 },
        { score: 2, label: 'Ruim', min: 51, max: 200 },
        { score: 1, label: 'Péssimo', min: undefined, max: 50 }
      ]
    },
    segmentationMethod: 'automatic',
    automaticRanges: {
      bronze: { min: 3, max: 7 },
      prata: { min: 8, max: 11 },
      ouro: { min: 12, max: 15 }
    },
    segments: [],
    effectiveFrom: new Date().toISOString().split('T')[0]
  });

  const [filiais, setFiliais] = useState<FilialOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingParameters, setSavingParameters] = useState(false);
  const [savingSegments, setSavingSegments] = useState(false);
  const [existingParameters, setExistingParameters] = useState<RFVParameterFromAPI[]>([]);
  const [filteredParameters, setFilteredParameters] = useState<RFVParameterFromAPI[]>([]);
  const [existingSegments, setExistingSegments] = useState<any[]>([]);
  const [showExisting, setShowExisting] = useState(false);
  const [editingParameter, setEditingParameter] = useState<any>(null);
  const [filters, setFilters] = useState<RFVFilters>({
    search: '',
    active: null,
    filialId: null,
    calculationStrategy: null
  });

  // Estados para modais de confirmação
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'parameter' | 'segment';
    id: number | null;
    name: string;
  }>({
    isOpen: false,
    type: 'parameter',
    id: null,
    name: ''
  });

  const [overwriteDialog, setOverwriteDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    message: '',
    onConfirm: null
  });

  const { showToast } = useToast();

  // Carrega filiais disponíveis
  useEffect(() => {
    const loadFiliais = async () => {
      try {
        const response = await fetch('/api/proxy?url=/api/filiais');
        if (!response.ok) {
          throw new Error('Erro ao carregar filiais');
        }
        const data = await response.json();
        setFiliais(data);
      } catch (error) {
        console.error('Erro ao carregar filiais:', error);
        setFiliais([
          { id: 1, empresaId: 1, nome: 'Matriz', cnpj: '00.000.000/0001-00', cidade: 'Rio Verde', estado: 'GO' },
          { id: 2, empresaId: 1, nome: 'Filial 1', cnpj: '00.000.000/0002-00', cidade: 'Jataí', estado: 'GO' },
          { id: 3, empresaId: 1, nome: 'Filial 2', cnpj: '00.000.000/0003-00', cidade: 'Cristalina', estado: 'GO' }
        ]);
      }
    };

    loadFiliais();
  }, []);

  // Inicializa os parâmetros filtrados quando existingParameters muda
  useEffect(() => {
    if (existingParameters.length > 0) {
      applyFilters(existingParameters, filters);
    }
  }, [existingParameters, filters]);

  // Carrega parâmetros e segmentos existentes
  const loadExistingData = async (filterParams?: Partial<RFVFilters>) => {
    setLoading(true);
    try {
      // Constrói a URL com parâmetros de filtro
      const params = new URLSearchParams();
      
      if (filterParams?.active !== undefined && filterParams.active !== null) {
        params.append('active', filterParams.active.toString());
      }
      
      if (filterParams?.filialId !== undefined && filterParams.filialId !== null) {
        params.append('filialId', filterParams.filialId.toString());
      }

      const apiUrl = `/api/rfv/parameters${params.toString() ? `?${params.toString()}` : ''}`;
      const url = `/api/proxy?url=${encodeURIComponent(apiUrl)}`;
      
      const parametersResponse = await fetch(url);
      if (parametersResponse.ok) {
        const parametersData = await parametersResponse.json();
        setExistingParameters(parametersData);
        applyFilters(parametersData, { ...filters, ...filterParams });
      }

      const segmentsResponse = await fetch('/api/proxy?url=' + encodeURIComponent('/api/rfv/segments'));
      if (segmentsResponse.ok) {
        const segmentsData = await segmentsResponse.json();
        setExistingSegments(segmentsData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados existentes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplica filtros locais aos parâmetros
  const applyFilters = (parameters: RFVParameterFromAPI[], currentFilters: RFVFilters) => {
    let filtered = [...parameters];

    // Filtro de busca por nome
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      filtered = filtered.filter(param => 
        param.name.toLowerCase().includes(searchLower) ||
        (param.filial?.nome && param.filial.nome.toLowerCase().includes(searchLower))
      );
    }

    // Filtro por estratégia de cálculo
    if (currentFilters.calculationStrategy) {
      filtered = filtered.filter(param => 
        param.calculationStrategy === currentFilters.calculationStrategy
      );
    }

    setFilteredParameters(filtered);
  };

  // Atualiza filtros e reaplica
  const updateFilters = (newFilters: Partial<RFVFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Se mudou filtros de API (active ou filialId), recarrega dados
    if (newFilters.active !== undefined || newFilters.filialId !== undefined) {
      loadExistingData(updatedFilters);
    } else {
      // Caso contrário, apenas aplica filtros locais
      applyFilters(existingParameters, updatedFilters);
    }
  };

  // Limpa todos os filtros
  const clearFilters = () => {
    const clearedFilters: RFVFilters = {
      search: '',
      active: null,
      filialId: null,
      calculationStrategy: null
    };
    setFilters(clearedFilters);
    loadExistingData(clearedFilters);
  };

  const deleteParameter = async (id: number) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `/api/rfv/parameters/${id}`,
          method: 'DELETE'
        })
      });

      if (response.ok) {
        setExistingParameters(prev => prev.filter(p => p.id !== id));
        applyFilters(existingParameters.filter(p => p.id !== id), filters);
        showToast('Parâmetro excluído com sucesso!', 'success');
      } else {
        const errorData = await response.json();
        let errorMessage = 'Erro ao excluir parâmetro';
        
        if (errorData.error && errorData.error.includes('Foreign key constraint failed')) {
          errorMessage = 'Este parâmetro não pode ser excluído pois está sendo usado por segmentos ou análises. Exclua primeiro os registros dependentes.';
        } else {
          errorMessage = errorData.error || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao excluir parâmetro:', error);
      showToast(`Erro ao excluir parâmetro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  const deleteSegment = async (id: number) => {
    try {
      const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: `/api/rfv/segments/${id}`,
          method: 'DELETE'
        })
      });

      if (response.ok) {
        setExistingSegments(prev => prev.filter(s => s.id !== id));
        showToast('Segmento excluído com sucesso!', 'success');
      } else {
        const errorData = await response.json();
        let errorMessage = 'Erro ao excluir segmento';
        
        if (errorData.error && errorData.error.includes('Foreign key constraint failed')) {
          errorMessage = 'Este segmento não pode ser excluído pois está sendo usado por análises ou outros registros. Exclua primeiro os registros dependentes.';
        } else {
          errorMessage = errorData.error || errorMessage;
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao excluir segmento:', error);
      showToast(`Erro ao excluir segmento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'error');
    }
  };

  // Funções para abrir modais de confirmação
  const openDeleteParameterDialog = (param: RFVParameterFromAPI) => {
    setDeleteDialog({
      isOpen: true,
      type: 'parameter',
      id: param.id,
      name: param.name
    });
  };

  const openDeleteSegmentDialog = (segment: any) => {
    setDeleteDialog({
      isOpen: true,
      type: 'segment',
      id: segment.id,
      name: segment.segment_name || segment.name
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteDialog.id) {
      if (deleteDialog.type === 'parameter') {
        await deleteParameter(deleteDialog.id);
      } else {
        await deleteSegment(deleteDialog.id);
      }
    }
    setDeleteDialog({ isOpen: false, type: 'parameter', id: null, name: '' });
  };

  const editParameter = (parameter: RFVParameterFromAPI) => {
    // Converter dados da API para formato do formulário
    const convertedRules = {
      recency: parameter.ruleRecency.bins.map((bin, index) => ({
        score: bin.score,
        label: getScoreLabel(bin.score),
        min: bin.score === 1 ? bin.max_dias : (index > 0 ? parameter.ruleRecency.bins[index - 1].max_dias : undefined),
        max: bin.max_dias
      })),
      frequency: parameter.ruleFrequency.bins.map((bin, index) => ({
        score: bin.score,
        label: getScoreLabel(bin.score),
        min: bin.min_compras,
        max: bin.score === 1 ? undefined : (index < parameter.ruleFrequency.bins.length - 1 ? parameter.ruleFrequency.bins[index + 1].min_compras : undefined)
      })),
      value: parameter.ruleValue.bins.map((bin, index) => ({
        score: bin.score,
        label: getScoreLabel(bin.score),
        min: bin.min_valor,
        max: bin.score === 1 ? undefined : (index < parameter.ruleValue.bins.length - 1 ? parameter.ruleValue.bins[index + 1].min_valor : undefined)
      }))
    };

    setConfiguration({
      id: parameter.id,
      name: parameter.name,
      filialId: parameter.filialId,
      rfvRules: convertedRules,
      segmentationMethod: parameter.calculationStrategy,
      automaticRanges: parameter.classRanges || {
        bronze: { min: 3, max: 7 },
        prata: { min: 8, max: 11 },
        ouro: { min: 12, max: 15 }
      },
      segments: parameter.segments?.map(seg => ({
        segment_name: seg.name,
        rules: { R: '', F: '', V: '' }, // As regras específicas precisariam vir da API
        priority: seg.priority
      })) || [],
      effectiveFrom: parameter.effectiveFrom.split('T')[0]
    });
    setEditingParameter(parameter);
    setShowExisting(false);
  };

  // Helper function para obter labels dos scores
  const getScoreLabel = (score: number): string => {
    const labels = {
      5: 'Excelente',
      4: 'Bom', 
      3: 'Regular',
      2: 'Ruim',
      1: 'Péssimo'
    };
    return labels[score as keyof typeof labels] || 'Desconhecido';
  };

  // Helper function para formatar regras RFV para exibição
  const formatRuleDisplay = (bins: RFVBin[], type: 'recency' | 'frequency' | 'value'): string => {
    if (!bins || bins.length === 0) return 'Não configurado';
    
    const rules = bins.map(bin => {
      if (type === 'recency' && bin.max_dias !== undefined) {
        return `${bin.score}⭐: ≤${bin.max_dias} dias`;
      } else if (type === 'frequency' && bin.min_compras !== undefined) {
        return `${bin.score}⭐: ≥${bin.min_compras} compras`;
      } else if (type === 'value' && bin.min_valor !== undefined) {
        return `${bin.score}⭐: ≥R$${bin.min_valor}`;
      }
      return `${bin.score}⭐: Outros`;
    });

    return rules.slice(0, 2).join(', ') + (rules.length > 2 ? '...' : '');
  };

  // Função para determinar se uma configuração está ativa
  const isConfigurationActive = (param: RFVParameterFromAPI): boolean => {
    const now = new Date();
    const effectiveFrom = new Date(param.effectiveFrom);
    const effectiveTo = param.effectiveTo ? new Date(param.effectiveTo) : null;
    
    return effectiveFrom <= now && (!effectiveTo || effectiveTo > now);
  };

  // Função para duplicar uma configuração
  const duplicateParameter = (parameter: RFVParameterFromAPI) => {
    editParameter(parameter);
    setConfiguration(prev => ({
      ...prev,
      id: undefined,
      name: `${parameter.name} (Cópia)`,
      effectiveFrom: new Date().toISOString().split('T')[0]
    }));
    setEditingParameter(null);
  };

  // Estatísticas dos dados
  const getStatistics = () => {
    const total = existingParameters.length;
    const active = existingParameters.filter(param => isConfigurationActive(param)).length;
    const automatic = existingParameters.filter(p => p.calculationStrategy === 'automatic').length;
    const manual = existingParameters.filter(p => p.calculationStrategy === 'manual').length;
    const withFilial = existingParameters.filter(p => p.filialId !== null).length;
    
    return { total, active, automatic, manual, withFilial };
  };

  const updateRFVRange = (type: 'recency' | 'frequency' | 'value', index: number, field: keyof RFVRange, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      rfvRules: {
        ...prev.rfvRules,
        [type]: prev.rfvRules[type].map((range, i) =>
          i === index ? { ...range, [field]: value } : range
        )
      }
    }));
  };

  const addSegment = () => {
    setConfiguration(prev => ({
      ...prev,
      segments: [
        ...(prev.segments || []),
        {
          segment_name: '',
          rules: {},
          priority: (prev.segments?.length || 0) + 1
        }
      ]
    }));
  };

  const updateSegment = (index: number, field: keyof Segment, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      segments: prev.segments?.map((segment, i) =>
        i === index ? { ...segment, [field]: value } : segment
      ) || []
    }));
  };

  const updateSegmentRule = (index: number, rule: 'R' | 'F' | 'V', value: string) => {
    setConfiguration(prev => ({
      ...prev,
      segments: prev.segments?.map((segment, i) =>
        i === index ? {
          ...segment,
          rules: { ...segment.rules, [rule]: value }
        } : segment
      ) || []
    }));
  };

  const removeSegment = (index: number) => {
    setConfiguration(prev => ({
      ...prev,
      segments: prev.segments?.filter((_, i) => i !== index) || []
    }));
  };

  const resetConfiguration = () => {
    setConfiguration({
      name: '',
      filialId: undefined,
      rfvRules: {
        recency: [
          { score: 5, label: 'Excelente', min: undefined, max: 30 },
          { score: 4, label: 'Bom', min: 31, max: 60 },
          { score: 3, label: 'Regular', min: 61, max: 90 },
          { score: 2, label: 'Ruim', min: 91, max: 180 },
          { score: 1, label: 'Péssimo', min: 181, max: undefined }
        ],
        frequency: [
          { score: 5, label: 'Excelente', min: 10, max: undefined },
          { score: 4, label: 'Bom', min: 6, max: 10 },
          { score: 3, label: 'Regular', min: 3, max: 5 },
          { score: 2, label: 'Ruim', min: 2, max: 2 },
          { score: 1, label: 'Péssimo', min: undefined, max: 1 }
        ],
        value: [
          { score: 5, label: 'Excelente', min: 1000, max: undefined },
          { score: 4, label: 'Bom', min: 501, max: 1000 },
          { score: 3, label: 'Regular', min: 201, max: 500 },
          { score: 2, label: 'Ruim', min: 51, max: 200 },
          { score: 1, label: 'Péssimo', min: undefined, max: 50 }
        ]
      },
      segmentationMethod: 'automatic',
      automaticRanges: {
        bronze: { min: 3, max: 7 },
        prata: { min: 8, max: 11 },
        ouro: { min: 12, max: 15 }
      },
      segments: [],
      effectiveFrom: new Date().toISOString().split('T')[0]
    });
    setEditingParameter(null);
  };

  const validateConfiguration = async () => {
    if (!existingParameters.length) {
      await loadExistingData();
    }

    const configFilialId = (configuration.filialId === undefined || configuration.filialId === null) ? configuration.filialId : configuration.filialId;

    const existingForFilial = existingParameters.find(param =>
      param.filialId === configFilialId &&
      param.id !== editingParameter?.id
    );

    if (existingForFilial) {
      const filialName = configFilialId === null
        ? 'todas as filiais'
        : filiais.find(f => f.id === configFilialId)?.nome || 'filial selecionada';

      return {
        valid: false,
        message: `Já existe uma configuração para ${filialName}. Uma filial pode ter apenas uma configuração ativa. Deseja sobrescrever a configuração existente '${existingForFilial.name}'?`
      };
    }

    return { valid: true };
  };

  const saveParameters = async () => {
    if (!configuration.name.trim()) {
      showToast('Nome da configuração é obrigatório', 'error');
      return;
    }
    
    if (!configuration.filialId) {
      showToast('Filial é obrigatória', 'error');
      return;
    }

    setSavingParameters(true);
    try {
      const validation = await validateConfiguration();
      if (!validation.valid) {
        setOverwriteDialog({
          isOpen: true,
          message: validation.message!,
          onConfirm: () => performParametersSave()
        });
        setSavingParameters(false);
        return;
      }

      await performParametersSave();
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error);
      showToast('Erro ao salvar parâmetros', 'error');
      setSavingParameters(false);
    }
  };

  const performParametersSave = async () => {
    try {
      const parametersPayload: any = {
        name: configuration.name,
        filialId: configuration.filialId,
        ruleRecency: configuration.rfvRules.recency,
        ruleFrequency: configuration.rfvRules.frequency,
        ruleValue: configuration.rfvRules.value,
        calculation_strategy: configuration.segmentationMethod,
        class_ranges: configuration.segmentationMethod === 'automatic' ? configuration.automaticRanges : null,
        effectiveFrom: configuration.effectiveFrom
      };

      const isEditing = editingParameter && editingParameter.id;
      const parametersApiUrl = '/api/rfv/parameters';
      const parametersMethod = isEditing ? 'PUT' : 'POST';

      if (isEditing) {
        parametersPayload.id = editingParameter.id;
      }

      console.log('Salvando parâmetros:', parametersPayload);

      const parametersResponse = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: isEditing ? `/api/rfv/parameters/${editingParameter.id}` : parametersApiUrl,
          method: parametersMethod,
          data: parametersPayload
        })
      });

      if (!parametersResponse.ok) {
        let errorMessage = `Erro ao ${isEditing ? 'atualizar' : 'salvar'} parâmetros`;
        try {
          const errorData = await parametersResponse.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Se não conseguir fazer parse do JSON, usa mensagem padrão
        }
        throw new Error(errorMessage);
      }

      showToast(`Parâmetros ${isEditing ? 'atualizados' : 'salvos'} com sucesso!`, 'success');

      if (showExisting) {
        loadExistingData();
      }
    } catch (error) {
      console.error('Erro ao salvar parâmetros:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao salvar parâmetros: ${errorMessage}`, 'error');
    } finally {
      setSavingParameters(false);
    }
  };

  const saveSegments = async () => {
    if (configuration.segmentationMethod !== 'manual') {
      showToast('Salvamento de segmentos só é disponível para segmentação manual', 'error');
      return;
    }

    if (!configuration.segments || configuration.segments.length === 0) {
      showToast('Adicione pelo menos um segmento antes de salvar', 'error');
      return;
    }

    // Verificar se existe parâmetro salvo para associar os segmentos
    if (!editingParameter?.id) {
      showToast('Salve primeiro os parâmetros antes de salvar os segmentos', 'error');
      return;
    }

    setSavingSegments(true);
    try {
      console.log('Salvando segmentos:', configuration.segments);
      
      for (const segment of configuration.segments) {
        const segmentPayload = {
          ...segment,
          parameterSetId: editingParameter.id
        };

        const segmentResponse = await fetch('/api/proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: '/api/rfv/segments',
            method: 'POST',
            data: segmentPayload
          })
        });

        if (!segmentResponse.ok) {
          console.warn('Erro ao salvar segmento:', segment.segment_name);
          const errorData = await segmentResponse.json();
          throw new Error(`Erro ao salvar segmento "${segment.segment_name}": ${errorData.error || 'Erro desconhecido'}`);
        }
      }

      showToast('Segmentos salvos com sucesso!', 'success');

      if (showExisting) {
        loadExistingData();
      }
    } catch (error) {
      console.error('Erro ao salvar segmentos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao salvar segmentos: ${errorMessage}`, 'error');
    } finally {
      setSavingSegments(false);
    }
  };

  const saveConfiguration = async () => {
    setSaving(true);
    try {
      const validation = await validateConfiguration();
      if (!validation.valid) {
        // Abrir modal de confirmação ao invés de alert
        setOverwriteDialog({
          isOpen: true,
          message: validation.message!,
          onConfirm: () => performSave()
        });
        setSaving(false);
        return;
      }

      await performSave();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      showToast(`Erro ao ${editingParameter ? 'atualizar' : 'salvar'} configuração`, 'error');
      setSaving(false);
    }
  };

  const performSave = async () => {
    try {
      // 1. Primeiro salvar os parâmetros RFV
      const parametersPayload: any = {
        name: configuration.name,
        filialId: configuration.filialId,
        ruleRecency: configuration.rfvRules.recency,
        ruleFrequency: configuration.rfvRules.frequency,
        ruleValue: configuration.rfvRules.value,
        calculation_strategy: configuration.segmentationMethod,
        class_ranges: configuration.segmentationMethod === 'automatic' ? configuration.automaticRanges : null,
        effectiveFrom: configuration.effectiveFrom
      };

      const isEditing = editingParameter && editingParameter.id;
      const parametersApiUrl = '/api/rfv/parameters';
      const parametersMethod = isEditing ? 'PUT' : 'POST';

      if (isEditing) {
        parametersPayload.id = editingParameter.id;
      }

      console.log('Salvando parâmetros:', parametersPayload);
      console.log('URL parâmetros:', isEditing ? `/api/rfv/parameters/${editingParameter.id}` : parametersApiUrl);
      console.log('Método parâmetros:', parametersMethod);

      const parametersResponse = await fetch('/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: isEditing ? `/api/rfv/parameters/${editingParameter.id}` : parametersApiUrl,
          method: parametersMethod,
          data: parametersPayload
        })
      });

      if (!parametersResponse.ok) {
        let errorMessage = `Erro ao ${isEditing ? 'atualizar' : 'salvar'} parâmetros`;
        try {
          const errorData = await parametersResponse.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Se não conseguir fazer parse do JSON, usa mensagem padrão
        }
        throw new Error(errorMessage);
      }

      const savedParameters = await parametersResponse.json();
      const parametersId = savedParameters.data?.id || savedParameters.id || editingParameter?.id;

      // 2. Se for segmentação manual, salvar os segmentos separadamente
      if (configuration.segmentationMethod === 'manual' && configuration.segments && configuration.segments.length > 0) {
        console.log('Salvando segmentos:', configuration.segments);
        
        for (const segment of configuration.segments) {
          const segmentPayload = {
            ...segment,
            parameterSetId: parametersId
          };

          const segmentResponse = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: '/api/rfv/segments',
              method: 'POST',
              data: segmentPayload
            })
          });

          if (!segmentResponse.ok) {
            console.warn('Erro ao salvar segmento:', segment.segment_name);
            // Não falha completamente se um segmento não salvar
          }
        }
      }

      showToast(`Configuração ${isEditing ? 'atualizada' : 'salva'} com sucesso!`, 'success');

      resetConfiguration();

      if (showExisting) {
        loadExistingData();
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(`Erro ao ${editingParameter ? 'atualizar' : 'salvar'} configuração: ${errorMessage}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderRFVRulesSection = () => (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Settings className="h-8 w-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Configuração de Análise RFV</h2>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Configure as regras e segmentos para classificar seus clientes baseado em seu comportamento de
          <span className="font-semibold text-blue-600"> Recência</span>,
          <span className="font-semibold text-green-600"> Frequência</span> e
          <span className="font-semibold text-purple-600"> Valor</span>.
        </p>
      </div>

    {/* Configurações Gerais */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Configurações Gerais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Configuração
            </label>
            <Input
              type="text"
              placeholder="Ex: RFV Padrão 2024"
              value={configuration.name}
              onChange={(e) => setConfiguration(prev => ({ ...prev, name: e.target.value }))}
              className="border-gray-300 text-gray-900 placeholder-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filial
            </label>
            <Select
              value={configuration.filialId === null ? 'all' : (configuration.filialId?.toString() || '')}
              onValueChange={(value: string) => setConfiguration(prev => ({
                ...prev,
                filialId: value === 'all' ? null : (value ? parseInt(value) : undefined)
              }))}
            >
              <SelectTrigger className="border-gray-300 text-gray-900">
                <SelectValue placeholder="Selecione a filial" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                <SelectItem value="all" className="text-gray-900 font-semibold">
                  🌐 Aplicar a todas as filiais
                </SelectItem>
                {filiais.map((filial) => (
                  <SelectItem key={filial.id} value={filial.id.toString()} className="text-gray-900">
                    {filial.nome} - {filial.cidade}/{filial.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Vigência
            </label>
            <Input
              type="date"
              value={configuration.effectiveFrom}
              onChange={(e) => setConfiguration(prev => ({ ...prev, effectiveFrom: e.target.value }))}
              className="border-gray-300 text-gray-900"
            />
          </div>
        </div>
      </Card>

      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
            1. Definir Regras de Pontuação
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Primeiro, defina os intervalos de valores para cada pontuação de 1 a 5. Essas pontuações serão usadas tanto nos modos Automático quanto Manual de segmentação.
          </p>
        </div>

        <div className="p-6 space-y-8">
          {/* Recency Rules */}
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-blue-600 rounded-full mr-3"></div>
              <h4 className="text-lg font-semibold text-blue-900">Regras de Recência (Dias)</h4>
            </div>
            <p className="text-sm text-blue-700 mb-4">
              Defina há quantos dias foi a última compra do cliente para cada pontuação.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configuration.rfvRules.recency.map((range, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-blue-900">Pontuação {range.score}</span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {range.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {range.score === 5 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 font-medium">Menos que</span>
                        <Input
                          type="number"
                          placeholder="30"
                          value={range.max || ''}
                          onChange={(e) => updateRFVRange('recency', index, 'max', parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                        <span className="text-sm text-gray-600">dias</span>
                      </div>
                    ) : range.score === 1 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 font-medium">Mais que</span>
                        <Input
                          type="number"
                          placeholder="180"
                          value={range.min || ''}
                          onChange={(e) => updateRFVRange('recency', index, 'min', parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                        <span className="text-sm text-gray-600">dias</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700 font-medium">Entre</span>
                          <Input
                            type="number"
                            placeholder="31"
                            value={range.min || ''}
                            onChange={(e) => updateRFVRange('recency', index, 'min', parseInt(e.target.value))}
                            className="flex-1 h-8 text-sm border-blue-200 focus:border-blue-400"
                          />
                          <span className="text-sm text-gray-600">e</span>
                          <Input
                            type="number"
                            placeholder="60"
                            value={range.max || ''}
                            onChange={(e) => updateRFVRange('recency', index, 'max', parseInt(e.target.value))}
                            className="flex-1 h-8 text-sm border-blue-200 focus:border-blue-400"
                          />
                          <span className="text-sm text-gray-600">dias</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency Rules */}
          <div className="bg-green-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-green-600 rounded-full mr-3"></div>
              <h4 className="text-lg font-semibold text-green-900">Regras de Frequência (Compras)</h4>
            </div>
            <p className="text-sm text-green-700 mb-4">
              Defina quantas compras o cliente fez no período para cada pontuação.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configuration.rfvRules.frequency.map((range, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-green-900">Pontuação {range.score}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                      {range.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {range.score === 5 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 font-medium">Mais que</span>
                        <Input
                          type="number"
                          placeholder="10"
                          value={range.min || ''}
                          onChange={(e) => updateRFVRange('frequency', index, 'min', parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm border-green-200 focus:border-green-400"
                        />
                        <span className="text-sm text-gray-600">compras</span>
                      </div>
                    ) : range.score === 1 ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          placeholder="1"
                          value={range.max || ''}
                          onChange={(e) => updateRFVRange('frequency', index, 'max', parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm border-green-200 focus:border-green-400"
                        />
                        <span className="text-sm text-gray-600">compra</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700 font-medium">Entre</span>
                          <Input
                            type="number"
                            placeholder="2"
                            value={range.min || ''}
                            onChange={(e) => updateRFVRange('frequency', index, 'min', parseInt(e.target.value))}
                            className="flex-1 h-8 text-sm border-green-200 focus:border-green-400"
                          />
                          <span className="text-sm text-gray-600">e</span>
                          <Input
                            type="number"
                            placeholder="5"
                            value={range.max || ''}
                            onChange={(e) => updateRFVRange('frequency', index, 'max', parseInt(e.target.value))}
                            className="flex-1 h-8 text-sm border-green-200 focus:border-green-400"
                          />
                          <span className="text-sm text-gray-600">compras</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Value Rules */}
          <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
            <div className="flex items-center mb-4">
              <div className="w-4 h-4 bg-purple-600 rounded-full mr-3"></div>
              <h4 className="text-lg font-semibold text-purple-900">Regras Monetárias (Valor)</h4>
            </div>
            <p className="text-sm text-purple-700 mb-4">
              Defina o valor total gasto pelo cliente no período para cada pontuação.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configuration.rfvRules.value.map((range, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-purple-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-purple-900">Pontuação {range.score}</span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {range.label}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {range.score === 5 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 font-medium">Mais que R$</span>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={range.min || ''}
                          onChange={(e) => updateRFVRange('value', index, 'min', parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm border-purple-200 focus:border-purple-400"
                        />
                      </div>
                    ) : range.score === 1 ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700 font-medium">R$</span>
                        <Input
                          type="number"
                          placeholder="50"
                          value={range.max || ''}
                          onChange={(e) => updateRFVRange('value', index, 'max', parseInt(e.target.value))}
                          className="flex-1 h-8 text-sm border-purple-200 focus:border-purple-400"
                        />
                        <span className="text-sm text-gray-600">ou menos</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-700 font-medium">Entre R$</span>
                          <Input
                            type="number"
                            placeholder="201"
                            value={range.min || ''}
                            onChange={(e) => updateRFVRange('value', index, 'min', parseInt(e.target.value))}
                            className="flex-1 h-8 text-sm border-purple-200 focus:border-purple-400"
                          />
                          <span className="text-sm text-gray-600">e R$</span>
                          <Input
                            type="number"
                            placeholder="500"
                            value={range.max || ''}
                            onChange={(e) => updateRFVRange('value', index, 'max', parseInt(e.target.value))}
                            className="flex-1 h-8 text-sm border-purple-200 focus:border-purple-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Botão para salvar apenas os parâmetros */}
        <div className="flex justify-end pt-4 mt-6 border-t border-gray-100">
          <Button
            onClick={saveParameters}
            disabled={savingParameters || !configuration.name || !configuration.filialId}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4" />
            {savingParameters ? 'Salvando...' : editingParameter ? 'Atualizar' : 'Salvar'} Parâmetros
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderNewConfigurationContent = () => (
    <>
      

      {/* RFV Rules Section */}
      {renderRFVRulesSection()}

      {/* Segmentation Method */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            2. Escolher Método de Segmentação
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Defina como os clientes serão segmentados baseado nas pontuações RFV.
          </p>
        </div>

        <div className="p-6">
          {renderSegmentationMethod()}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6">
        <Button
          onClick={resetConfiguration}
          variant="outline"
          className="flex items-center gap-2 text-gray-700 border-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Resetar
        </Button>
      </div>
    </>
  );

  const renderExistingConfigurationsContent = () => {
    const stats = getStatistics();
    
    return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {existingParameters.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
              Resumo das Configurações
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                <div className="text-sm text-gray-600">Ativas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.automatic}</div>
                <div className="text-sm text-gray-600">Automáticas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.manual}</div>
                <div className="text-sm text-gray-600">Manuais</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.withFilial}</div>
                <div className="text-sm text-gray-600">Por Filial</div>
              </div>
            </div>
          </div>
        </Card>
      )}
      {/* Filtros */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Filter className="h-5 w-5 text-blue-600 mr-2" />
            Filtros
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Filtre as configurações por diferentes critérios para encontrar o que precisa.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Busca por nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-1" />
                Buscar
              </label>
              <Input
                type="text"
                placeholder="Nome ou filial..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="border-gray-300"
              />
            </div>

            {/* Filtro por status ativo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Status
              </label>
              <Select
                value={filters.active === null ? 'all' : filters.active.toString()}
                onValueChange={(value) => updateFilters({ 
                  active: value === 'all' ? null : value === 'true' 
                })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="true">Apenas Ativos</SelectItem>
                  <SelectItem value="false">Apenas Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por filial */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Filial
              </label>
              <Select
                value={filters.filialId === null ? 'all' : filters.filialId.toString()}
                onValueChange={(value) => updateFilters({ 
                  filialId: value === 'all' ? null : parseInt(value)
                })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Todas as Filiais</SelectItem>
                  {filiais.map((filial) => (
                    <SelectItem key={filial.id} value={filial.id.toString()}>
                      {filial.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por estratégia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Estratégia
              </label>
              <Select
                value={filters.calculationStrategy || 'all'}
                onValueChange={(value) => updateFilters({ 
                  calculationStrategy: value === 'all' ? null : value
                })}
              >
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="automatic">Automática</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Botão para limpar filtros e indicador de filtros ativos */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {(filters.search || filters.active !== null || filters.filialId !== null || filters.calculationStrategy !== null) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 mr-2">
                  <Filter className="w-3 h-3 mr-1" />
                  Filtros ativos
                </span>
              )}
              {filteredParameters.length !== existingParameters.length && (
                <span className="text-gray-500">
                  Mostrando {filteredParameters.length} de {existingParameters.length} configurações
                </span>
              )}
            </div>
            <Button
              onClick={clearFilters}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
              disabled={!filters.search && filters.active === null && filters.filialId === null && filters.calculationStrategy === null}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Lista de Configurações */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 text-purple-600 mr-2" />
                Configurações RFV
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Gerencie suas configurações RFV existentes.
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredParameters.length} de {existingParameters.length} configuração(ões)
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Carregando configurações...</p>
            </div>
          ) : filteredParameters.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma configuração encontrada.</p>
              {existingParameters.length > 0 ? (
                <p className="text-sm mt-1">Tente ajustar os filtros para encontrar o que procura.</p>
              ) : (
                <p className="text-sm mt-1">Crie sua primeira configuração na aba 'Nova Configuração'.</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredParameters.map((param) => (
                <div key={param.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h5 className="font-semibold text-gray-900 text-lg">{param.name}</h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          param.calculationStrategy === 'automatic' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {param.calculationStrategy === 'automatic' ? 'Automático' : 'Manual'}
                        </span>
                        {isConfigurationActive(param) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Ativo
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {param.filial ? param.filial.nome : 'Todas as filiais'}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            Vigência: {new Date(param.effectiveFrom).toLocaleDateString()}
                            {param.effectiveTo && ` - ${new Date(param.effectiveTo).toLocaleDateString()}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            Janela: {param.windowDays} dias
                          </span>
                        </div>
                      </div>

                      {/* Detalhes das regras RFV */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <h6 className="font-medium text-blue-900 text-sm mb-1">Recência</h6>
                          <div className="text-xs text-blue-700">
                            {formatRuleDisplay(param.ruleRecency.bins, 'recency')}
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <h6 className="font-medium text-green-900 text-sm mb-1">Frequência</h6>
                          <div className="text-xs text-green-700">
                            {formatRuleDisplay(param.ruleFrequency.bins, 'frequency')}
                          </div>
                        </div>
                        
                        <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <h6 className="font-medium text-purple-900 text-sm mb-1">Valor</h6>
                          <div className="text-xs text-purple-700">
                            {formatRuleDisplay(param.ruleValue.bins, 'value')}
                          </div>
                        </div>
                      </div>

                      {/* Segmentos associados */}
                      {param.segments && param.segments.length > 0 && (
                        <div className="mt-4">
                          <h6 className="font-medium text-gray-900 text-sm mb-2">Segmentos:</h6>
                          <div className="flex flex-wrap gap-2">
                            {param.segments.map((segment) => (
                              <span 
                                key={segment.id}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {segment.name} (Prioridade: {segment.priority})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metadados */}
                      <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <span>Criado em: {new Date(param.createdAt).toLocaleString()}</span>
                        {param.updatedAt !== param.createdAt && (
                          <span className="mx-2">• Atualizado em: {new Date(param.updatedAt).toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => duplicateParameter(param)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        title="Duplicar configuração"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => editParameter(param)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => openDeleteParameterDialog(param)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Segmentos RFV */}
      {existingSegments.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="h-5 w-5 text-green-600 mr-2" />
              Segmentos RFV
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Segmentos criados através das configurações manuais.
            </p>
          </div>

          <div className="p-6">
            <div className="grid gap-4">
              {existingSegments.map((segment) => (
                <div key={segment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900">{segment.segment_name}</h5>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>Prioridade: {segment.priority}</span>
                        <span className="mx-2">•</span>
                        <span>Regras: {JSON.stringify(segment.rules)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openDeleteSegmentDialog(segment)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
    );
  };

  const renderSegmentationMethod = () => (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Método de Segmentação
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:cursor-pointer ${configuration.segmentationMethod === 'automatic'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            onClick={() => setConfiguration(prev => ({ ...prev, segmentationMethod: 'automatic' }))}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full border-2 mt-1 ${configuration.segmentationMethod === 'automatic'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                }`}>
                {configuration.segmentationMethod === 'automatic' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Automático</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Segmentação baseada na soma das pontuações R+F+V. Simples e rápido.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:cursor-pointer ${configuration.segmentationMethod === 'manual'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            onClick={() => setConfiguration(prev => ({ ...prev, segmentationMethod: 'manual' }))}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-5 h-5 rounded-full border-2 mt-1 ${configuration.segmentationMethod === 'manual'
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
                }`}>
                {configuration.segmentationMethod === 'manual' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Manual</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Regras personalizadas para segmentação. Máximo controle e flexibilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações específicas do método */}
      {configuration.segmentationMethod === 'automatic' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Faixas de Pontuação Automática</h4>
          <p className="text-sm text-gray-600 mb-4">
            Configure as faixas de pontuação para cada segmento. A pontuação é calculada como R + F + V.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-orange-100 p-3 rounded-lg border border-orange-300">
              <h5 className="font-semibold text-orange-700 mb-2">🥉 Bronze</h5>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={configuration.automaticRanges?.bronze.min || ''}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    automaticRanges: {
                      ...prev.automaticRanges!,
                      bronze: { ...prev.automaticRanges!.bronze, min: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={configuration.automaticRanges?.bronze.max || ''}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    automaticRanges: {
                      ...prev.automaticRanges!,
                      bronze: { ...prev.automaticRanges!.bronze, max: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="bg-gray-100 p-3 rounded-lg border border-gray-300">
              <h5 className="font-semibold text-gray-700 mb-2">🥈 Prata</h5>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={configuration.automaticRanges?.prata.min || ''}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    automaticRanges: {
                      ...prev.automaticRanges!,
                      prata: { ...prev.automaticRanges!.prata, min: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={configuration.automaticRanges?.prata.max || ''}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    automaticRanges: {
                      ...prev.automaticRanges!,
                      prata: { ...prev.automaticRanges!.prata, max: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            <div className="bg-yellow-100 p-3 rounded-lg border border-yellow-300">
              <h5 className="font-semibold text-yellow-700 mb-2">🥇 Ouro</h5>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={configuration.automaticRanges?.ouro.min || ''}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    automaticRanges: {
                      ...prev.automaticRanges!,
                      ouro: { ...prev.automaticRanges!.ouro, min: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-8 text-sm"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={configuration.automaticRanges?.ouro.max || ''}
                  onChange={(e) => setConfiguration(prev => ({
                    ...prev,
                    automaticRanges: {
                      ...prev.automaticRanges!,
                      ouro: { ...prev.automaticRanges!.ouro, max: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {configuration.segmentationMethod === 'manual' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Segmentos Personalizados</h4>
          <p className="text-sm text-gray-600 mb-4">
            Crie regras específicas para cada segmento de clientes.
          </p>
          
          <div className="space-y-4">
            {configuration.segments?.map((segment, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <Input
                    placeholder="Nome do Segmento"
                    value={segment.segment_name}
                    onChange={(e) => {
                      const newSegments = [...(configuration.segments || [])];
                      newSegments[index].segment_name = e.target.value;
                      setConfiguration(prev => ({ ...prev, segments: newSegments }));
                    }}
                    className="flex-1 mr-3"
                  />
                  <Button
                    onClick={() => {
                      const newSegments = [...(configuration.segments || [])];
                      newSegments.splice(index, 1);
                      setConfiguration(prev => ({ ...prev, segments: newSegments }));
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Regra R (ex: >=4)"
                    value={segment.rules.R || ''}
                    onChange={(e) => {
                      const newSegments = [...(configuration.segments || [])];
                      newSegments[index].rules.R = e.target.value;
                      setConfiguration(prev => ({ ...prev, segments: newSegments }));
                    }}
                  />
                  <Input
                    placeholder="Regra F (ex: >=3)"
                    value={segment.rules.F || ''}
                    onChange={(e) => {
                      const newSegments = [...(configuration.segments || [])];
                      newSegments[index].rules.F = e.target.value;
                      setConfiguration(prev => ({ ...prev, segments: newSegments }));
                    }}
                  />
                  <Input
                    placeholder="Regra V (ex: >=5)"
                    value={segment.rules.V || ''}
                    onChange={(e) => {
                      const newSegments = [...(configuration.segments || [])];
                      newSegments[index].rules.V = e.target.value;
                      setConfiguration(prev => ({ ...prev, segments: newSegments }));
                    }}
                  />
                </div>
              </div>
            ))}
            
            <Button
              onClick={() => {
                const newSegment: Segment = {
                  segment_name: '',
                  rules: { R: '', F: '', V: '' },
                  priority: (configuration.segments?.length || 0) + 1
                };
                setConfiguration(prev => ({
                  ...prev,
                  segments: [...(prev.segments || []), newSegment]
                }));
              }}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 border-dashed border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Segmento
            </Button>
            
            {/* Botão para salvar apenas os segmentos */}
            <div className="flex justify-end pt-4 mt-4 border-t border-gray-200">
              <Button
                onClick={saveSegments}
                disabled={savingSegments || !configuration.segments?.length || !editingParameter?.id}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4" />
                {savingSegments ? 'Salvando...' : 'Salvar'} Segmentos
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configuração RFV</h1>
              <p className="text-gray-600 mt-2">Configure as regras de Recência, Frequência e Valor para segmentação de clientes</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setShowExisting(false)}
                className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer ${
                  !showExisting
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Nova Configuração
              </button>
              <button
                onClick={() => {
                  setShowExisting(true);
                  loadExistingData();
                }}
                className={`py-2 px-1 border-b-2 font-medium text-sm hover:cursor-pointer ${
                  showExisting
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Gerenciar Existentes
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        {!showExisting ? (
          <div className="space-y-6">{renderNewConfigurationContent()}</div>
        ) : (
          <div className="space-y-6">{renderExistingConfigurationsContent()}</div>
        )}

        {/* Modais de Confirmação */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, type: 'parameter', id: null, name: '' })}
          onConfirm={handleConfirmDelete}
          title={`Excluir ${deleteDialog.type === 'parameter' ? 'Parâmetro' : 'Segmento'}`}
          message={`Tem certeza que deseja excluir ${deleteDialog.type === 'parameter' ? 'o parâmetro' : 'o segmento'} "${deleteDialog.name}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />

        <ConfirmDialog
          isOpen={overwriteDialog.isOpen}
          onClose={() => setOverwriteDialog({ isOpen: false, message: '', onConfirm: null })}
          onConfirm={() => {
            if (overwriteDialog.onConfirm) {
              overwriteDialog.onConfirm();
            }
            setOverwriteDialog({ isOpen: false, message: '', onConfirm: null });
          }}
          title="Sobrescrever Configuração"
          message={overwriteDialog.message}
          confirmText="Sobrescrever"
          cancelText="Cancelar"
          type="warning"
        />
      </div>
    </div>
  );
}
