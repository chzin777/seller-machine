'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Filter, Search, Building, Calendar, Settings, Eye, EyeOff, Copy, Trash2,
  Clock, TrendingUp, DollarSign, Zap
} from 'lucide-react';
import type { RFVRule, RFVParameterSet, FilialOption } from '../types';

interface ExistingTabProps {
  parametros: RFVParameterSet[];
  filtrados: RFVParameterSet[];
  loadingLista: boolean;
  search: string;
  setSearch: (search: string) => void;
  filialFiltro: number | null;
  setFilialFiltro: (filial: number | null) => void;
  status: 'all' | 'active' | 'inactive';
  setStatus: (status: 'all' | 'active' | 'inactive') => void;
  mostrar: { [k: number]: boolean };
  toggle: (id: number) => void;
  filiais: FilialOption[];
  ativo: (p: RFVParameterSet) => boolean;
  resumo: (rules: RFVRule[], tipo: 'recency' | 'frequency' | 'value') => string;
  duplicar: (p: RFVParameterSet) => void;
  editar: (p: RFVParameterSet) => void;
  excluir: (id: number) => void;
}

export default function ExistingTab({ 
  parametros, 
  filtrados, 
  loadingLista, 
  search, 
  setSearch, 
  filialFiltro, 
  setFilialFiltro, 
  status, 
  setStatus, 
  mostrar, 
  toggle, 
  filiais, 
  ativo, 
  resumo, 
  duplicar, 
  editar, 
  excluir 
}: ExistingTabProps) {
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Search className="inline w-4 h-4 mr-1" />
                Buscar
              </label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nome da configuração..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Building className="inline w-4 h-4 mr-1" />
                Filial
              </label>
              <Select
                value={filialFiltro === null ? 'all' : filialFiltro.toString()}
                onValueChange={(value) => setFilialFiltro(value === 'all' ? null : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Filiais</SelectItem>
                  {filiais.map((filial) => (
                    <SelectItem key={filial.id} value={filial.id.toString()}>
                      {filial.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="inline w-4 h-4 mr-1" />
                Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações RFV
          </CardTitle>
          <div className="text-sm text-gray-600">
            Mostrando {filtrados.length} de {parametros.length} configurações
          </div>
        </CardHeader>
        <CardContent>
          {loadingLista ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 mx-auto border-b-2 border-primary rounded-full"></div>
              <p className="mt-2 text-gray-600">Carregando configurações...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma configuração encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtrados.map((parametro) => (
                <div
                  key={parametro.id}
                  className="p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{parametro.name}</h4>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parametro.calculation_strategy === 'automatic'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {parametro.calculation_strategy === 'automatic' ? 'Automático' : 'Manual'}
                        </span>
                        {ativo(parametro) && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Ativo
                          </span>
                        )}
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-400" />
                          {parametro.filialId
                            ? filiais.find(f => f.id === parametro.filialId)?.nome || `Filial ${parametro.filialId}`
                            : 'Todas as filiais'}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Vigência: {new Date(parametro.effectiveFrom).toLocaleDateString()}
                          {parametro.effectiveTo && ` - ${new Date(parametro.effectiveTo).toLocaleDateString()}`}
                        </div>
                      </div>

                      {mostrar[parametro.id!] && (
                        <div className="mt-3 grid md:grid-cols-3 gap-3 text-xs">
                          <div className="bg-blue-50 p-3 rounded border">
                            <div className="font-medium mb-1 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Recência
                            </div>
                            <div className="text-gray-600">
                              {resumo(parametro.ruleRecency, 'recency')}
                            </div>
                          </div>
                          <div className="bg-green-50 p-3 rounded border">
                            <div className="font-medium mb-1 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Frequência
                            </div>
                            <div className="text-gray-600">
                              {resumo(parametro.ruleFrequency, 'frequency')}
                            </div>
                          </div>
                          <div className="bg-purple-50 p-3 rounded border">
                            <div className="font-medium mb-1 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              Valor
                            </div>
                            <div className="text-gray-600">
                              {resumo(parametro.ruleValue, 'value')}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Criado: {new Date(parametro.createdAt || '').toLocaleString()}
                        {parametro.updatedAt && parametro.updatedAt !== parametro.createdAt && (
                          <> • Atualizado: {new Date(parametro.updatedAt).toLocaleString()}</>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => toggle(parametro.id!)}
                        variant="outline"
                        size="sm"
                      >
                        {mostrar[parametro.id!] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => duplicar(parametro)}
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => editar(parametro)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200"
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => excluir(parametro.id!)}
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
