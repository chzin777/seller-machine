'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, Timer, Save, RotateCcw, Sparkles, Target, DollarSign, Users, Settings } from 'lucide-react';
import { ConfiguracaoInatividade, TIPOS_CLIENTE } from '../hooks/useInactivity';

// Componente Label simples
const Label = ({ htmlFor, children, className = "" }: { 
  htmlFor?: string; 
  children: React.ReactNode; 
  className?: string;
}) => (
  <label htmlFor={htmlFor} className={`text-sm font-medium ${className}`}>
    {children}
  </label>
);

// Componente Checkbox simples
const Checkbox = ({ id, checked, onChange }: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
  />
);

interface InactivityTabProps {
  configuracao: ConfiguracaoInatividade;
  updateField: <K extends keyof ConfiguracaoInatividade>(field: K, value: ConfiguracaoInatividade[K]) => void;
  loadingFiltros: boolean;
  dirtyInatividade: boolean;
  salvarInatividade: () => void;
  resetInatividade: () => void;
  
  // Mantém compatibilidade com código antigo
  diasInatividade: number;
  setDiasInatividade: (dias: number) => void;
}

export default function InactivityTab({ 
  configuracao,
  updateField,
  loadingFiltros, 
  dirtyInatividade, 
  salvarInatividade, 
  resetInatividade 
}: InactivityTabProps) {
  
  const handleTipoClienteChange = (tipoValue: string, checked: boolean) => {
    const currentExcluidos = configuracao.tiposClienteExcluidos || [];
    
    if (checked) {
      // Adicionar tipo à lista de excluídos
      const newExcluidos = [...currentExcluidos, tipoValue];
      updateField('tiposClienteExcluidos', newExcluidos);
    } else {
      // Remover tipo da lista de excluídos
      const newExcluidos = currentExcluidos.filter(tipo => tipo !== tipoValue);
      updateField('tiposClienteExcluidos', newExcluidos.length > 0 ? newExcluidos : null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração Completa de Inatividade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Seção Principal - Dias de Inatividade */}
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="border-blue-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Período de Inatividade
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Timer className="w-4 h-4" />
                    Dias sem compra para considerar inativo
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={Number(configuracao.diasSemCompra) || 0}
                      disabled={loadingFiltros}
                      onChange={(e) => updateField('diasSemCompra', parseInt(e.target.value) || 90)}
                      className="text-center text-lg font-semibold pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      dias
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Clientes sem compra há mais de <strong>{Number(configuracao.diasSemCompra) || 0}</strong> dias serão considerados inativos.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Sugestões */}
            <Card className="border-green-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  Sugestões por Segmento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {[
                    { dias: '30', tipo: 'E-commerce / Fast-moving' },
                    { dias: '90', tipo: 'Varejo geral' },
                    { dias: '180', tipo: 'Bens duráveis' },
                    { dias: '365', tipo: 'B2B / Corporativo' }
                  ].map((sugestao, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded border">
                      <span className="font-medium text-green-700">{sugestao.dias} dias</span>
                      <span className="text-xs text-green-600">{sugestao.tipo}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-100 rounded text-xs flex items-start gap-2">
                  <Target className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Encontre o equilíbrio: muito baixo pode gerar falsos inativos, muito alto pode identificar perda tardiamente.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Seção Valor Mínimo */}
          <Card className="border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                Valor Mínimo de Compra
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4" />
                    Valor mínimo para considerar na análise
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      R$
                    </span>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={Number(configuracao.valorMinimoCompra) || 0}
                      disabled={loadingFiltros}
                      onChange={(e) => updateField('valorMinimoCompra', parseFloat(e.target.value) || 0)}
                      className="pl-8 text-lg font-semibold"
                      placeholder="0,00"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Apenas compras acima de R$ {(configuracao.valorMinimoCompra || 0).toFixed(2)} serão consideradas para calcular inatividade.
                  </p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-orange-800">💡 Como usar este filtro?</h4>
                  <ul className="text-xs space-y-1 text-orange-700">
                    <li>• <strong>R$ 0:</strong> Todas as compras contam</li>
                    <li>• <strong>R$ 50:</strong> Ignora compras pequenas/teste</li>
                    <li>• <strong>R$ 200:</strong> Foca em compras significativas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seção Tipos de Cliente */}
          <Card className="border-purple-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Filtro por Tipo de Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="considerarTipoCliente"
                  checked={configuracao.considerarTipoCliente}
                  onChange={(checked) => updateField('considerarTipoCliente', checked)}
                />
                <Label htmlFor="considerarTipoCliente" className="text-sm font-medium">
                  Aplicar filtro por tipo de cliente
                </Label>
              </div>

              {configuracao.considerarTipoCliente && (
                <div className="pl-6 border-l-2 border-purple-200 space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">
                      Tipos de cliente a EXCLUIR da análise de inatividade:
                    </Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {TIPOS_CLIENTE.map((tipo) => (
                        <div key={tipo.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`tipo-${tipo.value}`}
                            checked={configuracao.tiposClienteExcluidos?.includes(tipo.value) || false}
                            onChange={(checked) => handleTipoClienteChange(tipo.value, checked)}
                          />
                          <Label htmlFor={`tipo-${tipo.value}`} className="text-sm">
                            {tipo.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded text-sm">
                    <p className="font-medium text-purple-800 mb-1">Tipos excluídos:</p>
                    <p className="text-purple-700">
                      {configuracao.tiposClienteExcluidos && configuracao.tiposClienteExcluidos.length > 0
                        ? configuracao.tiposClienteExcluidos.map(tipo => 
                            TIPOS_CLIENTE.find(t => t.value === tipo)?.label
                          ).join(', ')
                        : 'Nenhum tipo excluído'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seção Status da Configuração */}
          <Card className="border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ativo"
                    checked={configuracao.ativo}
                    onChange={(checked) => updateField('ativo', checked)}
                  />
                  <Label htmlFor="ativo" className="text-sm font-medium">
                    Configuração ativa
                  </Label>
                  <span className="text-xs text-gray-500">
                    (Desabilitar temporariamente sem perder configurações)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={salvarInatividade}
              disabled={loadingFiltros || !dirtyInatividade}
              className="flex-1 text-lg py-3"
              size="lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {loadingFiltros ? 'Salvando configuração completa...' : 'Salvar Configuração'}
            </Button>
            <Button
              onClick={resetInatividade}
              variant="outline"
              size="lg"
              className="px-8"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Restaurar Padrão
            </Button>
          </div>

          {/* Status de Alterações */}
          {dirtyInatividade && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Alterações não salvas:</strong> Lembre-se de salvar suas configurações para aplicá-las aos indicadores do dashboard.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
