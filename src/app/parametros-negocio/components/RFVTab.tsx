'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Save, RotateCcw } from 'lucide-react';
import RangeEditor from './RangeEditor';
import type { RFVRule, RFVParameterSet, FilialOption } from '../types';

interface RFVTabProps {
  config: RFVParameterSet;
  setConfig: (config: RFVParameterSet) => void;
  editing: RFVParameterSet | null;
  savingConfig: boolean;
  filiais: FilialOption[];
  salvarRFV: () => void;
  resetConfig: () => void;
  updateRange: (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue', index: number, field: keyof RFVRule, value: any) => void;
  addRange: (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue') => void;
  removeRange: (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue', index: number) => void;
}

export default function RFVTab({ 
  config, 
  setConfig, 
  editing, 
  savingConfig, 
  filiais, 
  salvarRFV, 
  resetConfig,
  updateRange,
  addRange,
  removeRange
}: RFVTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {editing ? 'Editar' : 'Nova'} Configuração RFV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Configuração</label>
              <Input
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                placeholder="Ex: RFV Padrão 2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Filial</label>
              <Select
                value={config.filialId === null ? 'all' : (config.filialId?.toString() || '')}
                onValueChange={(value) => setConfig({
                  ...config,
                  filialId: value === 'all' ? null : (value ? parseInt(value) : undefined)
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a filial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🌐 Todas as Filiais</SelectItem>
                  {filiais.map((filial) => (
                    <SelectItem key={filial.id} value={filial.id.toString()}>
                      {filial.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Data de Vigência</label>
              <Input
                type="date"
                value={config.effectiveFrom}
                onChange={(e) => setConfig({ ...config, effectiveFrom: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <RangeEditor 
        type="ruleRecency" 
        config={config} 
        updateRange={updateRange} 
        addRange={addRange} 
        removeRange={removeRange} 
      />
      
      <RangeEditor 
        type="ruleFrequency" 
        config={config} 
        updateRange={updateRange} 
        addRange={addRange} 
        removeRange={removeRange} 
      />
      
      <RangeEditor 
        type="ruleValue" 
        config={config} 
        updateRange={updateRange} 
        addRange={addRange} 
        removeRange={removeRange} 
      />

      <div className="flex gap-4">
        <Button
          onClick={salvarRFV}
          disabled={savingConfig || !config.name.trim()}
          className="flex-1"
        >
          <Save className="w-4 h-4 mr-2" />
          {savingConfig ? 'Salvando...' : editing ? 'Atualizar' : 'Salvar'} Configuração
        </Button>
        <Button
          onClick={resetConfig}
          variant="outline"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {editing ? 'Cancelar' : 'Limpar'}
        </Button>
      </div>
    </div>
  );
}
