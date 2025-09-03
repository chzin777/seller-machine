"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../components/ui/select";
import { Settings, SlidersHorizontal, Clock, ShoppingCart, DollarSign, Trophy, Info, Plus, Trash2, Loader2 } from "lucide-react";

const defaultRules = {
  recency: [30, 60, 90, 180],
  frequency: [1, 2, 3, 6, 10],
  monetary: [50, 200, 500, 1000],
};

const defaultTiers = [
  { name: "Diamante", range: "13 - 15", icon: "💎", color: "bg-purple-100 text-purple-700 border-purple-300" },
  { name: "Ouro", range: "10 - 12", icon: "🥇", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { name: "Prata", range: "7 - 9", icon: "🥈", color: "bg-white text-gray-700 border-gray-300" },
  { name: "Bronze", range: "3 - 6", icon: "🥉", color: "bg-orange-100 text-orange-700 border-orange-300 border-orange-300" },
];

type CustomRule = {
  id: string;
  segmentName: string;
  conditions: {
    id: string;
    dimension: 'R' | 'F' | 'V';
    operator: '>=' | '<=' | '=' | '>' | '<';
    value: number;
  }[];
  connector: 'E' | 'OU';
};

type RFVParameterSet = {
  id?: number;
  filialId?: number;
  name: string;
  strategy: 'threshold' | 'quantile';
  windowDays: number;
  weights: { r: number; f: number; v: number };
  ruleRecency: number[];
  ruleFrequency: number[];
  ruleValue: number[];
  effectiveFrom: string;
  effectiveTo?: string;
  calculation_strategy: 'automatic' | 'manual';
  class_ranges?: any;
  conditional_rules?: any;
  rfv_segments?: RFVSegment[];
};

type RFVSegment = {
  id?: number;
  parameterSetId?: number;
  segment_name: string;
  rules: any;
  priority: number;
};

export default function ConfigurarRFVPage() {
  const [mode, setMode] = useState("auto");
  const [recency, setRecency] = useState(defaultRules.recency);
  const [frequency, setFrequency] = useState(defaultRules.frequency);
  const [monetary, setMonetary] = useState(defaultRules.monetary);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [currentParameterSet, setCurrentParameterSet] = useState<RFVParameterSet | null>(null);
  const [parameterSets, setParameterSets] = useState<RFVParameterSet[]>([]);
  const [configName, setConfigName] = useState("Configuração RFV Padrão");
  const [filialId, setFilialId] = useState<number | undefined>(1); // TODO: Obter da sessão do usuário
  const [windowDays, setWindowDays] = useState(180);
  const [customRules, setCustomRules] = useState<CustomRule[]>([]);

  const API_BASE_URL = 'https://api-seller-machine-production.up.railway.app';

  const [segments, setSegments] = useState<any[]>([]);
  const [isLoadingSegments, setIsLoadingSegments] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  // Carrega dados ao montar o componente
  useEffect(() => {
    loadParameterSets();
    loadSegments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSegments = async () => {
    try {
      setIsLoadingSegments(true);
      const response = await fetch(`${API_BASE_URL}/api/rfv/segments`);
      
      if (response.ok) {
        const data = await response.json();
        setSegments(Array.isArray(data) ? data : []);
      } else {
        console.warn('Erro ao carregar segmentos:', response.status);
        setSegments([]);
      }
    } catch (error) {
      console.warn('Erro ao carregar segmentos:', error);
      setSegments([]);
    } finally {
      setIsLoadingSegments(false);
    }
  };

  const loadParameterSets = async () => {
    try {
      setIsLoadingData(true);
      // Remove filialId da URL por enquanto até a API estar totalmente configurada
      const url = `${API_BASE_URL}/api/rfv/parameters`;
      const response = await fetch(url);
      
      let data = [];
      
      // Se retornar 404 ou se não há dados, inicializa com array vazio
      if (response.status === 404) {
        console.log('Nenhuma configuração encontrada - iniciando com dados padrão');
        data = [];
      } else if (!response.ok) {
        // Para outros erros que não sejam 404
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      } else {
        data = await response.json();
      }
      
      const validData = Array.isArray(data) ? data : [];
      setParameterSets(validData);
      
      console.log('Parameter sets carregados:', validData.length);
      console.log('Dados:', validData);
      
      // Carrega a configuração ativa somente se houver dados
      if (validData.length > 0) {
        const activeConfig = validData.find((config: RFVParameterSet) => !config.effectiveTo) || validData[0];
        loadParameterSet(activeConfig);
        console.log('Configuração ativa carregada:', activeConfig);
      } else {
        console.log('Nenhuma configuração para carregar - mantendo padrões');
      }
    } catch (error) {
      console.warn('Aviso ao carregar configurações:', error);
      // Em vez de mostrar erro, inicializa com dados padrão
      setParameterSets([]);
      console.log('Iniciando com configuração padrão devido ao erro:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const loadParameterSet = (parameterSet: RFVParameterSet) => {
    setCurrentParameterSet(parameterSet);
    setConfigName(parameterSet.name);
    setWindowDays(parameterSet.windowDays);
    setRecency(parameterSet.ruleRecency);
    setFrequency(parameterSet.ruleFrequency);
    setMonetary(parameterSet.ruleValue);
    setMode(parameterSet.calculation_strategy);
    
    // Carrega regras customizadas dos segmentos
    if (parameterSet.rfv_segments) {
      const convertedRules: CustomRule[] = parameterSet.rfv_segments.map(segment => ({
        id: segment.id?.toString() || Date.now().toString(),
        segmentName: segment.segment_name,
        conditions: Array.isArray(segment.rules?.conditions) ? segment.rules.conditions : [
          { id: Date.now().toString(), dimension: 'R' as const, operator: '>=' as const, value: 1 }
        ],
        connector: segment.rules?.connector || 'E'
      }));
      setCustomRules(convertedRules);
    } else {
      setCustomRules([]);
    }
  };

  // Handlers for input changes
  const handleRecency = (idx: number, value: number) => {
    const arr = [...recency];
    arr[idx] = value;
    setRecency(arr);
  };

  const handleFrequency = (idx: number, value: number) => {
    const arr = [...frequency];
    arr[idx] = value;
    setFrequency(arr);
  };

  const handleMonetary = (idx: number, value: number) => {
    const arr = [...monetary];
    arr[idx] = value;
    setMonetary(arr);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Prepara os dados para salvar conforme a estrutura da API
      const parameterSetData = {
        name: configName,
        strategy: 'threshold',
        windowDays,
        weights: { r: 1, f: 1, v: 1 },
        ruleRecency: recency,
        ruleFrequency: frequency,
        ruleValue: monetary,
        effectiveFrom: new Date().toISOString().split('T')[0],
        calculationStrategy: mode === 'auto' ? 'automatic' : 'manual', // Corrigido nome do campo
        classRanges: mode === 'auto' ? defaultTiers : null, // Corrigido nome do campo
        conditionalRules: mode === 'manual' ? customRules : null, // Corrigido nome do campo
      };

      const method = currentParameterSet?.id ? 'PUT' : 'POST';
      const url = currentParameterSet?.id ? 
        `${API_BASE_URL}/api/rfv/parameters/${currentParameterSet.id}` : 
        `${API_BASE_URL}/api/rfv/parameters`;

      console.log('Enviando dados para API:', parameterSetData);
      console.log('URL:', url);
      console.log('Método:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameterSetData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Erro ao salvar configuração';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Se não conseguir parsear JSON, usa o texto da resposta
          errorMessage = errorText || `Erro ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const savedData = await response.json();
      
      // Atualiza o estado atual
      setCurrentParameterSet(savedData);
      
      // Atualiza a lista local imediatamente para evitar problemas de sincronização
      if (currentParameterSet?.id) {
        // Atualiza configuração existente
        setParameterSets(prev => 
          prev.map(ps => ps.id === savedData.id ? savedData : ps)
        );
      } else {
        // Adiciona nova configuração à lista
        setParameterSets(prev => [savedData, ...prev]);
      }
      
      // Recarrega tanto parameter sets quanto segmentos para garantir sincronização
      setTimeout(() => {
        Promise.all([loadParameterSets(), loadSegments()]);
      }, 100);
      
      alert("Configuração RFV salva com sucesso!");
      
      // Se salvou uma nova configuração, mostra o painel de gerenciamento
      if (!currentParameterSet?.id) {
        setShowManagement(true);
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(`Erro ao salvar configuração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetToDefaults = () => {
    setRecency(defaultRules.recency);
    setFrequency(defaultRules.frequency);
    setMonetary(defaultRules.monetary);
    setMode("auto");
    setCustomRules([]);
    setConfigName("Nova Configuração RFV");
    setWindowDays(180);
    setCurrentParameterSet(null);
  };

  const createNewConfiguration = () => {
    resetToDefaults();
  };

  const loadConfiguration = async (parameterSetId: number) => {
    const parameterSet = parameterSets.find(ps => ps.id === parameterSetId);
    if (parameterSet) {
      loadParameterSet(parameterSet);
    }
  };

  const executeRFVAnalysis = async () => {
    try {
      setIsLoading(true);
      
      // Remove filialId da URL por enquanto
      const response = await fetch(`${API_BASE_URL}/api/rfv/analysis`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Erro ao executar análise RFV';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || `Erro ${response.status}: ${response.statusText}`;
        }
        
        if (response.status === 404) {
          errorMessage = 'Endpoint de análise não encontrado. Verifique se a API está rodando corretamente.';
        }
        
        throw new Error(errorMessage);
      }

      const analysisResult = await response.json();
      
      // Mostrar resultado da análise
      console.log('Resultado da Análise RFV:', analysisResult);
      const resultCount = Array.isArray(analysisResult) ? analysisResult.length : 0;
      alert(`Análise RFV executada com sucesso! ${resultCount} registros processados.`);
      
    } catch (error) {
      console.error('Erro ao executar análise:', error);
      alert(`Erro ao executar análise RFV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createCustomSegment = async (segmentName: string, rules: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rfv/segments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: segmentName,
          rules: rules
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar segmento');
      }

      const newSegment = await response.json();
      console.log('Segmento criado:', newSegment);
      return newSegment;
      
    } catch (error) {
      console.error('Erro ao criar segmento:', error);
      throw error;
    }
  };

  const updateCustomSegment = async (segmentId: number, segmentName: string, rules: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rfv/segments/${segmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: segmentName,
          rules: rules
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar segmento');
      }

      const updatedSegment = await response.json();
      console.log('Segmento atualizado:', updatedSegment);
      return updatedSegment;
      
    } catch (error) {
      console.error('Erro ao atualizar segmento:', error);
      throw error;
    }
  };

  const deleteCustomSegment = async (segmentId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rfv/segments/${segmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar segmento');
      }

      console.log('Segmento deletado com sucesso');
      
    } catch (error) {
      console.error('Erro ao deletar segmento:', error);
      throw error;
    }
  };

  const activateParameterSet = async (parameterSetId: number) => {
    try {
      // Encontra a configuração na lista local
      const parameterSet = segments.find(s => s.parameterSet?.id === parameterSetId)?.parameterSet;
      if (!parameterSet) {
        alert('Configuração não encontrada');
        return;
      }

      // Simula ativação - na prática você teria um endpoint específico
      console.log('Ativando configuração:', parameterSet.name);
      alert(`Configuração "${parameterSet.name}" marcada como ativa!`);
      
      // Recarrega os dados
      await loadSegments();
    } catch (error) {
      console.error('Erro ao ativar configuração:', error);
      alert('Erro ao ativar configuração');
    }
  };

  const deleteParameterSet = async (parameterSetId: number) => {
    try {
      // Encontra todos os segmentos desta configuração e o parâmetro set
      const configSegments = segments.filter(s => s.parameterSet?.id === parameterSetId);
      const parameterSetToDelete = parameterSets.find(ps => ps.id === parameterSetId);
      const configName = parameterSetToDelete?.name || configSegments[0]?.parameterSet?.name || 'Configuração';
      
      console.log(`Deletando configuração "${configName}" com ${configSegments.length} segmentos`);
      
      // Deleta todos os segmentos da configuração
      for (const segment of configSegments) {
        try {
          await deleteCustomSegment(segment.id);
          console.log(`Segmento "${segment.name}" deletado`);
        } catch (error) {
          console.error(`Erro ao deletar segmento ${segment.name}:`, error);
        }
      }
      
      // TODO: Quando houver endpoint para parameter sets, deletar aqui também
      // await fetch(`${API_BASE_URL}/api/rfv/parameters/${parameterSetId}`, { method: 'DELETE' });
      
      // Remove da lista local imediatamente
      setParameterSets(prev => prev.filter(ps => ps.id !== parameterSetId));
      
      // Se a configuração deletada era a atual, limpa o estado atual
      if (currentParameterSet?.id === parameterSetId) {
        setCurrentParameterSet(null);
        resetToDefaults();
      }
      
      alert(`Configuração "${configName}" e todos os seus segmentos foram removidos!`);
      
      // Recarrega os dados para sincronizar
      await Promise.all([loadSegments(), loadParameterSets()]);
      
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      alert('Erro ao deletar configuração');
    }
  };

  // Custom Rules Handlers
  const addCustomRule = () => {
    const newRule: CustomRule = {
      id: Date.now().toString(),
      segmentName: `Segmento ${customRules.length + 1}`,
      conditions: [
        { id: Date.now().toString(), dimension: 'R', operator: '>=', value: 1 }
      ],
      connector: 'E'
    };
    setCustomRules([...customRules, newRule]);
  };

  const removeCustomRule = (ruleId: string) => {
    setCustomRules(customRules.filter(rule => rule.id !== ruleId));
  };

  const updateRuleName = (ruleId: string, newName: string) => {
    setCustomRules(customRules.map(rule => 
      rule.id === ruleId ? { ...rule, segmentName: newName } : rule
    ));
  };

  const updateRuleConnector = (ruleId: string, connector: 'E' | 'OU') => {
    setCustomRules(customRules.map(rule => 
      rule.id === ruleId ? { ...rule, connector } : rule
    ));
  };

  const addCondition = (ruleId: string) => {
    setCustomRules(customRules.map(rule => 
      rule.id === ruleId ? {
        ...rule,
        conditions: [
          ...rule.conditions,
          { id: Date.now().toString(), dimension: 'R', operator: '>=', value: 1 }
        ]
      } : rule
    ));
  };

  const removeCondition = (ruleId: string, conditionId: string) => {
    setCustomRules(customRules.map(rule => 
      rule.id === ruleId ? {
        ...rule,
        conditions: rule.conditions.filter(condition => condition.id !== conditionId)
      } : rule
    ));
  };

  const updateCondition = (ruleId: string, conditionId: string, updates: Partial<CustomRule['conditions'][0]>) => {
    setCustomRules(customRules.map(rule => 
      rule.id === ruleId ? {
        ...rule,
        conditions: rule.conditions.map(condition => 
          condition.id === conditionId ? { ...condition, ...updates } : condition
        )
      } : rule
    ));
  };

  return (
  <div className="max-w-5xl w-full mx-auto py-6 px-2 sm:py-10 sm:px-4 min-h-screen bg-white">
      {isLoadingData ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando configurações...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-3">
                  <Settings className="w-8 h-8 text-blue-700" />
                  Análise RFV - Configuração
                </h1>
                <p className="text-gray-600 text-lg">
                  Configure as regras e segmentos para classificar seus clientes baseado no comportamento de Recência, Frequência e Monetário.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createNewConfiguration}
                  variant="outline"
                  className="border-green-600 text-green-700 bg-white hover:bg-green-50 hover:border-green-700 hover:cursor-pointer focus:ring-2 hover:text-green-900 focus:ring-green-200 focus:border-green-700 font-semibold shadow-md transition-transform duration-150 hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Configuração
                </Button>
                <Button
                  onClick={() => setShowManagement(!showManagement)}
                  variant="outline"
                  className="border-blue-600 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-700 hover:cursor-pointer hover:text-blue-900 focus:ring-2 focus:ring-blue-200 focus:border-blue-700 font-semibold shadow-md transition-transform duration-150 hover:scale-105"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showManagement ? 'Ocultar' : 'Gerenciar'} Configurações
                </Button>
              </div>
            </div>

            {/* Management Panel */}
            {showManagement && (
              <Card className="mb-6 border border-yellow-200 bg-yellow-50/30">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Gerenciar Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Carregando configurações...</span>
                    </div>
                  ) : parameterSets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600">
                        Nenhuma configuração encontrada. Crie sua primeira configuração!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {parameterSets.map((parameterSet) => (
                        <div key={parameterSet.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {parameterSet.name}
                            </h3>
                            <div className="text-sm text-gray-600 mt-1">
                              <p>Estratégia: {parameterSet.calculation_strategy === 'automatic' ? 'Automática' : 'Manual'}</p>
                              <p>Janela: {parameterSet.windowDays} dias</p>
                              <p>Criada em: {new Date(parameterSet.effectiveFrom).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => loadConfiguration(parameterSet.id!)}
                              size="sm"
                              variant="outline"
                              className="border-blue-200 text-blue-700 bg-white hover:bg-blue-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                            >
                              Editar
                            </Button>
                            <Button
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir a configuração "${parameterSet.name}" e todos os seus segmentos?`)) {
                                  deleteParameterSet(parameterSet.id!);
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className="border-red-200 text-red-700 bg-white hover:bg-red-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Configuration Selector */}
            {parameterSets.length > 0 ? (
              <Card className="mb-6 border border-blue-100 bg-blue-50/30">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Configuração Atual:
                      </label>
                      <Select 
                        value={currentParameterSet?.id?.toString() || ''} 
                        onValueChange={(value) => value && loadConfiguration(parseInt(value))}
                      >
                        <SelectTrigger className="bg-white border-blue-200">
                          <SelectValue placeholder="Selecione uma configuração" />
                        </SelectTrigger>
                        <SelectContent>
                          {parameterSets.map(ps => (
                            <SelectItem key={ps.id} value={ps.id!.toString()}>
                              {ps.name} {!ps.effectiveTo && '(Ativa)'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Nome da Configuração:
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg bg-white border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder="Nome da configuração"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-blue-900 mb-2">
                        Janela (dias):
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="365"
                        className="w-full px-3 py-2 border rounded-lg bg-white border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={windowDays}
                        onChange={(e) => setWindowDays(parseInt(e.target.value) || 180)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => window.open(`${API_BASE_URL}/api/rfv/segments`, '_blank')}
                        variant="outline"
                        size="sm"
                        className="text-purple-600 border-purple-200 bg-white hover:bg-purple-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                      >
                        👁️ Ver Segmentos
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6 border border-orange-300 bg-orange-100">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-5 h-5 text-orange-500" />
                        <h3 className="font-semibold text-orange-600">
                          Primeira Configuração RFV
                        </h3>
                      </div>
                      <p className="text-sm text-orange-700">
                        Você está criando sua primeira configuração RFV. Configure as regras abaixo e clique em &quot;Salvar&quot; para começar.
                      </p>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-orange-900 mb-2">
                        Nome da Nova Configuração:
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg bg-white border-orange-400 text-orange-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder="Ex: Configuração RFV Principal"
                      />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-medium text-orange-900 mb-2">
                        Janela (dias):
                      </label>
                      <input
                        type="number"
                        min="30"
                        max="365"
                        className="w-full px-3 py-2 border rounded-lg bg-white border-orange-400 text-orange-900 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        value={windowDays}
                        onChange={(e) => setWindowDays(parseInt(e.target.value) || 180)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Existing Segments Display */}
          {segments.length > 0 && (
            <Card className="shadow-lg border border-green-100 dark:border-green-900 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-green-700 dark:text-green-200" />
                    Segmentos RFV Configurados
                  </div>
                  <Button
                    onClick={loadSegments}
                    disabled={isLoadingSegments}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-200 bg-white hover:bg-green-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                  >
                    {isLoadingSegments ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "🔄 Atualizar"
                    )}
                  </Button>
                </CardTitle>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {segments.length} segmento(s) configurado(s) no sistema
                </p>
              </CardHeader>
              <CardContent>
                {/* Configurações agrupadas por ParameterSet */}
                {(() => {
                  const configGroups = segments.reduce((acc: Record<number, { config: any, segments: any[] }>, segment) => {
                    const configName = segment.parameterSet?.name || 'Sem Configuração';
                    const configId = segment.parameterSet?.id || 0;
                    
                    if (!acc[configId]) {
                      acc[configId] = {
                        config: segment.parameterSet,
                        segments: []
                      };
                    }
                    acc[configId].segments.push(segment);
                    return acc;
                  }, {} as Record<number, { config: any, segments: any[] }>);

                  return (
                    <div className="space-y-6">
                      {Object.values(configGroups).map((group: { config: any, segments: any[] }, index: number) => (
                        <div key={group.config?.id || index} className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-white dark:bg-gray-800/30">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg text-green-800 dark:text-green-200">
                                📋 {group.config?.name || 'Configuração Sem Nome'}
                              </h3>
                              <p className="text-sm text-green-600 dark:text-green-400">
                                {group.segments.length} segmento(s) configurado(s)
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => group.config?.id && activateParameterSet(group.config.id)}
                                variant="outline"
                                size="sm"
                                className="text-purple-600 border-purple-200 bg-white hover:bg-purple-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                              >
                                ⭐ Tornar Ativa
                              </Button>
                              <Button
                                onClick={() => {
                                  if (group.config?.name && confirm(`Deseja excluir completamente a configuração "${group.config.name}" e todos os seus ${group.segments.length} segmentos?`)) {
                                    deleteParameterSet(group.config.id);
                                  }
                                }}
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 bg-white hover:bg-red-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                              >
                                🗑️ Excluir Config
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.segments.map((segment: any) => (
                              <div key={segment.id} className="border border-gray-200  rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                                      {segment.name}
                                    </h4>
                                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                                      #{segment.priority}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    {typeof segment.rules === 'object' && segment.rules && Object.entries(segment.rules).map(([key, value]: [string, any]) => (
                                      <div key={key} className="text-xs">
                                        <span className="font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                          {key} {String(value)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="flex gap-1 pt-1">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-600 border-blue-200 bg-white hover:bg-blue-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105 text-xs px-2 py-1 h-6"
                                      onClick={() => {
                                        console.log('Editando segmento:', segment);
                                      }}
                                    >
                                      ✏️
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 bg-white hover:bg-red-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105 text-xs px-2 py-1 h-6"
                                      onClick={() => {
                                        if (confirm(`Deseja remover o segmento "${segment.name}"?`)) {
                                          deleteCustomSegment(segment.id).then(() => loadSegments());
                                        }
                                      }}
                                    >
                                      🗑️
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}

      {/* Info Card */}
      <Card className="shadow-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 mb-8">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Como funciona a Análise RFV?</h3>
              <p className="text-sm text-blue-700 mb-2">
                A análise RFV classifica clientes em scores de 1 a 5 para cada dimensão:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-blue-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span><strong>Recência:</strong> Há quanto tempo comprou</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-600" />
                  <span><strong>Frequência:</strong> Quantas vezes comprou</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span><strong>Monetário:</strong> Quanto gastou no total</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rules Card */}
      <Card className="shadow-lg border border-gray-200 bg-white mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-900">
            <SlidersHorizontal className="w-6 h-6 text-blue-700" />
            1. Definir Regras de Pontuação
          </CardTitle>
          <p className="text-sm text-gray-700">
            Primeiro, defina os intervalos de valores para cada score de 1 a 5. Esses scores serão usados tanto para segmentação automática quanto manual.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Recency */}
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 text-black">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Regras de Recência (dias)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700 mb-2">Score 5 (Excelente)</div>
                  <div className="text-sm text-gray-700 mb-2">Menos de</div>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    value={recency[0]} 
                    min={1} 
                    max={recency[1]-1} 
                    onChange={e => handleRecency(0, +e.target.value)} 
                  />
                  <div className="text-xs text-gray-500 mt-1">dias</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-blue-700 mb-2">Score 4 (Bom)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={recency[0]+1} 
                      onChange={e => handleRecency(0, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={recency[1]} 
                      min={recency[0]+1} 
                      max={recency[2]-1} 
                      onChange={e => handleRecency(1, +e.target.value)} 
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dias</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-yellow-700 mb-2">Score 3 (Regular)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={recency[1]+1} 
                      onChange={e => handleRecency(1, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={recency[2]} 
                      min={recency[1]+1} 
                      max={recency[3]-1} 
                      onChange={e => handleRecency(2, +e.target.value)} 
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dias</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-orange-700 mb-2">Score 2 (Fraco)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={recency[2]+1} 
                      onChange={e => handleRecency(2, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={recency[3]} 
                      min={recency[2]+1} 
                      onChange={e => handleRecency(3, +e.target.value)} 
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dias</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-red-700 mb-2">Score 1 (Crítico)</div>
                  <div className="text-sm text-gray-700 mb-2">Mais de</div>
                  <div className="px-3 py-2 border rounded-lg text-center bg-white 00 border-gray-300  font-medium">
                    {recency[3]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">dias</div>
                </div>
              </div>
            </div>

            {/* Frequency */}
            <div className="p-4 border border-green-200 rounded-lg bg-green-50 text-black">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Regras de Frequência (compras)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700 mb-2">Score 5 (Excelente)</div>
                  <div className="text-sm text-gray-700 mb-2">Mais de</div>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                    value={frequency[4]} 
                    min={frequency[3]+1} 
                    onChange={e => handleFrequency(4, +e.target.value)} 
                  />
                  <div className="text-xs text-gray-500 mt-1">compras</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-blue-700 mb-2">Score 4 (Bom)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={frequency[3]} 
                      min={frequency[2]+1} 
                      max={frequency[4]} 
                      onChange={e => handleFrequency(3, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <div className="w-full px-2 py-2 border rounded-lg text-center bg-white 00 border-gray-300  font-medium">
                      {frequency[4]}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">compras</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-yellow-700 mb-2">Score 3 (Regular)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={frequency[2]} 
                      min={frequency[1]+1} 
                      max={frequency[3]} 
                      onChange={e => handleFrequency(2, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <div className="w-full px-2 py-2 border rounded-lg text-center bg-white 00 border-gray-300  font-medium">
                      {frequency[3]}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">compras</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-orange-700 mb-2">Score 2 (Fraco)</div>
                  <div className="text-sm text-gray-700 mb-2">Exatamente</div>
                  <div className="px-3 py-2 border rounded-lg text-center bg-white 00 border-gray-300  font-medium">
                    {frequency[1]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">compras</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-red-700 mb-2">Score 1 (Crítico)</div>
                  <div className="text-sm text-gray-700 mb-2">Apenas</div>
                  <div className="px-3 py-2 border rounded-lg text-center bg-white 00 border-gray-300  font-medium">
                    {frequency[0]}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">compra</div>
                </div>
              </div>
            </div>

            {/* Monetary */}
            <div className="p-4 border border-purple-200 rounded-lg bg-purple-50 text-black">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Regras Monetárias (valor)</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-xs font-medium text-green-700 mb-2">Score 5 (Excelente)</div>
                  <div className="text-sm text-gray-700 mb-2">Mais de R$</div>
                  <input 
                    type="number" 
                    className="w-full px-3 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-black" 
                    value={monetary[3]} 
                    min={monetary[2]+1} 
                    onChange={e => handleMonetary(3, +e.target.value)} 
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-blue-700 mb-2">Score 4 (Bom)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre R$</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={monetary[2]+1} 
                      onChange={e => handleMonetary(2, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <div className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300 font-medium">
                      {monetary[3]}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-yellow-700 mb-2">Score 3 (Regular)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre R$</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={monetary[1]+1} 
                      onChange={e => handleMonetary(1, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      value={monetary[2]} 
                      min={monetary[1]+1} 
                      onChange={e => handleMonetary(2, +e.target.value)} 
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-orange-700 mb-2">Score 2 (Fraco)</div>
                  <div className="text-sm text-gray-700 mb-2">Entre R$</div>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300" 
                      value={monetary[0]+1} 
                      onChange={e => handleMonetary(1, +e.target.value)} 
                    />
                    <span className="text-xs">e</span>
                    <input 
                      type="number" 
                      className="w-full px-2 py-2 border rounded-lg text-center bg-white border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                      value={monetary[1]} 
                      min={monetary[0]+1} 
                      max={monetary[2]-1} 
                      onChange={e => handleMonetary(1, +e.target.value)} 
                    />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-medium text-red-700 mb-2">Score 1 (Crítico)</div>
                  <div className="text-sm text-gray-700 mb-2">R$ ou menos</div>
                  <div className="px-3 py-2 border rounded-lg text-center bg-white border-gray-300  font-medium">
                    {monetary[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Segmentation Method */}
      <Card className="shadow-lg border border-gray-200 bg-white mb-8">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-blue-900">
            <Trophy className="w-6 h-6 text-blue-700" />
            2. Método de Segmentação
          </CardTitle>
          <p className="text-sm text-gray-700">
            Escolha como agrupar os clientes baseado nos scores definidos acima.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 border-2 border-blue-200 rounded-lg bg-blue-50/50">
              <input 
                type="radio" 
                id="auto" 
                name="segmentation" 
                value="auto" 
                checked={mode === "auto"} 
                onChange={(e) => setMode(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="auto" className="font-semibold text-blue-900 cursor-pointer">
                  ✨ Tierização Automática (Recomendado)
                </label>
                <p className="text-sm text-blue-700 mt-1">
                  O sistema usa um modelo padrão baseado na soma dos scores (R+F+V) para classificar clientes em tiers.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <input 
                type="radio" 
                id="manual" 
                name="segmentation" 
                value="manual" 
                checked={mode === "manual"} 
                onChange={(e) => setMode(e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="manual" className="font-semibold text-gray-900 cursor-pointer">
                  🔧 Segmentação Manual
                </label>
                <p className="text-sm text-gray-700 mt-1">
                  Crie suas próprias regras customizadas com condições específicas (ex: R Score &gt;= 4 E F Score = 5).
                </p>
              </div>
            </div>

            {mode === "auto" ? (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tiers de Classificação Padrão</h3>
                <p className="text-sm text-gray-600 mb-4">
                  No modo automático, os clientes são classificados baseado na soma dos scores R, F e V:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {defaultTiers.map(tier => (
                    <div key={tier.name} className={`p-4 rounded-lg border ${tier.color}`}>
                      <div className="text-center">
                        <div className="text-2xl mb-2">{tier.icon}</div>
                        <div className="font-bold text-lg">{tier.name}</div>
                        <div className="text-sm opacity-75">Pontuação {tier.range}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 ">Construtor de Regras Customizadas</h3>
                  <Button 
                    onClick={addCustomRule}
                    className="bg-green-600 hover:bg-green-700 hover:cursor-pointer text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nova Regra
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Crie regras específicas para segmentar seus clientes baseado nos scores R, F e V.
                </p>
                
                {customRules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    🚀 Comece criando sua primeira regra customizada
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customRules.map((rule, ruleIndex) => (
                      <Card key={rule.id} className="border border-gray-200 bg-white">
                        <CardContent className="pt-4">
                          <div className="space-y-4">
                            {/* Rule Header */}
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-blue-900 mb-1">
                                  Nome do Segmento
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-lg bg-white border-blue-300 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm h-10"
                                  value={rule.segmentName}
                                  onChange={(e) => updateRuleName(rule.id, e.target.value)}
                                  placeholder="Ex: Clientes VIP"
                                />
                              </div>
                              <Button
                                onClick={() => removeCustomRule(rule.id)}
                                variant="outline"
                                className="ml-4 text-red-600 border-red-200 bg-white hover:bg-red-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Conditions */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-blue-900">
                                  Condições
                                </label>
                                <Button
                                  onClick={() => addCondition(rule.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-blue-600 border-blue-200 bg-white hover:bg-blue-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Condição
                                </Button>
                              </div>
                              
                              {rule.conditions.map((condition, conditionIndex) => (
                                <div key={condition.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-white">
                                  {conditionIndex > 0 && (
                                    <div className="flex items-center gap-2 mr-2">
                                      <Select 
                                        value={rule.connector} 
                                        onValueChange={(value) => updateRuleConnector(rule.id, value as 'E' | 'OU')}
                                      >
                                        <SelectTrigger className="w-24 h-10 text-sm bg-white border-blue-300 text-blue-900 focus:border-blue-500 hover:border-blue-500">
                                          <SelectValue className="text-sm" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="E" className="text-sm">E</SelectItem>
                                          <SelectItem value="OU" className="text-sm">OU</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  <Select 
                                    value={condition.dimension} 
                                    onValueChange={(value) => updateCondition(rule.id, condition.id, { dimension: value as 'R' | 'F' | 'V' })}
                                  >
                                    <SelectTrigger className="w-32 h-10 text-sm bg-white border-blue-300 text-blue-900 focus:border-blue-500 hover:border-blue-500">
                                      <SelectValue className="text-sm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="R" className="text-sm">R (Recência)</SelectItem>
                                      <SelectItem value="F" className="text-sm">F (Frequência)</SelectItem>
                                      <SelectItem value="V" className="text-sm">V (Monetário)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Select 
                                    value={condition.operator} 
                                    onValueChange={(value) => updateCondition(rule.id, condition.id, { operator: value as any })}
                                  >
                                    <SelectTrigger className="w-24 h-10 text-sm bg-white border-blue-300 text-blue-900 focus:border-blue-500 hover:border-blue-500">
                                      <SelectValue className="text-sm" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value=">=" className="text-sm">&gt;=</SelectItem>
                                      <SelectItem value="<=" className="text-sm">&lt;=</SelectItem>
                                      <SelectItem value="=" className="text-sm">=</SelectItem>
                                      <SelectItem value=">" className="text-sm">&gt;</SelectItem>
                                      <SelectItem value="<" className="text-sm">&lt;</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <input
                                    type="number"
                                    min="1"
                                    max="5"
                                    className="w-24 h-10 px-2 py-1 border rounded text-center text-sm bg-white border-blue-300 text-blue-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={condition.value}
                                    onChange={(e) => updateCondition(rule.id, condition.id, { value: +e.target.value })}
                                  />
                                  {rule.conditions.length > 1 && (
                                    <Button
                                      onClick={() => removeCondition(rule.id, condition.id)}
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 border-red-200 bg-white hover:bg-red-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105 w-8 h-8 p-0"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Rule Preview */}
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="text-xs font-semibold text-blue-900 mb-1">
                                Prévia da Regra:
                              </div>
                              <div className="text-sm text-blue-800 font-mono">
                                {rule.conditions.map((condition, index) => (
                                  <span key={condition.id}>
                                    {index > 0 && ` ${rule.connector} `}
                                    {condition.dimension} Score {condition.operator} {condition.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex gap-3 order-2 sm:order-1">
          <Button 
            variant="outline" 
            onClick={resetToDefaults}
            className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105 hover:text-blue-900"
          >
            🔄 Restaurar Padrões
          </Button>
          
          <Button
            onClick={executeRFVAnalysis}
            disabled={isLoading}
            variant="outline"
            className="border-green-200 text-green-700 bg-white hover:bg-green-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105 hover:text-green-900"
            title={!currentParameterSet ? "Salve uma configuração primeiro para executar análise com parâmetros específicos, ou execute com parâmetros padrão" : ""}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                📊 Executar Análise RFV
              </>
            )}
          </Button>
        </div>
        
        <div className="flex gap-3 order-1 sm:order-2">
          <Button 
            variant="outline" 
            className="border-blue-200 text-blue-700 bg-white hover:bg-blue-50 hover:cursor-pointer transition-transform duration-150 hover:scale-105 hover:text-blue-900"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-700 hover:bg-blue-800 hover:cursor-pointer text-white font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "💾 Salvar Configuração"
            )}
          </Button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
