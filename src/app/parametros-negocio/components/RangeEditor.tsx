'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, TrendingUp, DollarSign, Settings, Plus, Trash2 } from 'lucide-react';
import type { RFVRule, RFVParameterSet } from '../types';

interface RangeEditorProps {
  type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue';
  config: RFVParameterSet;
  updateRange: (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue', index: number, field: keyof RFVRule, value: any) => void;
  addRange: (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue') => void;
  removeRange: (type: 'ruleRecency' | 'ruleFrequency' | 'ruleValue', index: number) => void;
}

export default function RangeEditor({ 
  type, 
  config, 
  updateRange, 
  addRange, 
  removeRange 
}: RangeEditorProps) {
  const getConfig = () => {
    switch (type) {
      case 'ruleRecency':
        return { 
          title: 'Recência (dias)', 
          icon: Clock, 
          gradient: 'from-blue-600 to-cyan-600',
          bgGradient: 'from-blue-50 to-cyan-50' 
        };
      case 'ruleFrequency':
        return { 
          title: 'Frequência (compras)', 
          icon: TrendingUp, 
          gradient: 'from-green-600 to-emerald-600',
          bgGradient: 'from-green-50 to-emerald-50' 
        };
      case 'ruleValue':
        return { 
          title: 'Valor (R$)', 
          icon: DollarSign, 
          gradient: 'from-purple-600 to-pink-600',
          bgGradient: 'from-purple-50 to-pink-50' 
        };
      default:
        return { title: '', icon: Settings, gradient: '', bgGradient: '' };
    }
  };

  const typeConfig = getConfig();
  const Icon = typeConfig.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {typeConfig.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {config[type].map((rule, index) => (
          <div key={index} className={`p-4 rounded-lg bg-gradient-to-r ${typeConfig.bgGradient} border`}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
              <div>
                <label className="block text-xs font-medium mb-1">Score</label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={rule.score}
                  onChange={(e) => updateRange(type, index, 'score', parseInt(e.target.value))}
                  className="text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Label</label>
                <Input
                  value={rule.label}
                  onChange={(e) => updateRange(type, index, 'label', e.target.value)}
                  placeholder="Ex: Alto"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Min</label>
                <Input
                  type="number"
                  value={rule.min ?? ''}
                  onChange={(e) => updateRange(type, index, 'min', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  placeholder="N/A"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Max</label>
                <Input
                  type="number"
                  value={rule.max ?? ''}
                  onChange={(e) => updateRange(type, index, 'max', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  placeholder="N/A"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => removeRange(type, index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        <Button
          onClick={() => addRange(type)}
          variant="outline"
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Faixa
        </Button>
      </CardContent>
    </Card>
  );
}
