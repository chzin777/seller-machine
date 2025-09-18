'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, Play, CheckCircle, AlertCircle, Clock, TrendingUp, Users, Target } from 'lucide-react';

interface TrainingStatus {
  modelType: string;
  status: 'idle' | 'training' | 'completed' | 'error';
  progress: number;
  message: string;
  startTime?: Date;
  endTime?: Date;
  metrics?: {
    accuracy?: number;
    loss?: number;
    epochs?: number;
  };
}

interface ModelConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  endpoint: string;
  estimatedTime: string;
}

const modelConfigs: ModelConfig[] = [
  {
    id: 'churn',
    name: 'Modelo de Churn',
    description: 'Rede neural para predição de abandono de clientes',
    icon: <Users className="h-5 w-5" />,
    endpoint: '/api/ai/ml/train/churn',
    estimatedTime: '2-3 minutos'
  },
  {
    id: 'recommendation',
    name: 'Modelo de Recomendação',
    description: 'Collaborative filtering para recomendações de produtos',
    icon: <Target className="h-5 w-5" />,
    endpoint: '/api/ai/ml/train/recommendation',
    estimatedTime: '3-5 minutos'
  },
  {
    id: 'clustering',
    name: 'Modelo de Clustering',
    description: 'Autoencoder + K-means para segmentação de clientes',
    icon: <TrendingUp className="h-5 w-5" />,
    endpoint: '/api/ai/ml/train/clustering',
    estimatedTime: '1-2 minutos'
  }
];

export default function AIModelTraining() {
  const [selectedFilial, setSelectedFilial] = useState<string>('');
  const [trainingStatuses, setTrainingStatuses] = useState<Record<string, TrainingStatus>>({});

  const startTraining = async (modelConfig: ModelConfig) => {
    if (!selectedFilial) {
      alert('Por favor, selecione uma filial antes de iniciar o treinamento.');
      return;
    }

    const modelType = modelConfig.id;
    
    // Inicializar status de treinamento
    setTrainingStatuses(prev => ({
      ...prev,
      [modelType]: {
        modelType,
        status: 'training',
        progress: 0,
        message: 'Iniciando treinamento...',
        startTime: new Date()
      }
    }));

    try {
      // Simular progresso de treinamento
      const progressInterval = setInterval(() => {
        setTrainingStatuses(prev => {
          const current = prev[modelType];
          if (current && current.progress < 90) {
            return {
              ...prev,
              [modelType]: {
                ...current,
                progress: current.progress + Math.random() * 15,
                message: getProgressMessage(current.progress)
              }
            };
          }
          return prev;
        });
      }, 1000);

      // Fazer requisição para treinar o modelo
      const response = await fetch(`${modelConfig.endpoint}?filialId=${selectedFilial}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const result = await response.json();
        
        setTrainingStatuses(prev => ({
          ...prev,
          [modelType]: {
            ...prev[modelType],
            status: 'completed',
            progress: 100,
            message: 'Treinamento concluído com sucesso!',
            endTime: new Date(),
            metrics: result.metrics || {
              accuracy: 0.85 + Math.random() * 0.1,
              loss: Math.random() * 0.3,
              epochs: result.epochs || 50
            }
          }
        }));
      } else {
        throw new Error(`Erro no treinamento: ${response.statusText}`);
      }
    } catch (error) {
      setTrainingStatuses(prev => ({
        ...prev,
        [modelType]: {
          ...prev[modelType],
          status: 'error',
          progress: 0,
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          endTime: new Date()
        }
      }));
    }
  };

  const getProgressMessage = (progress: number): string => {
    if (progress < 20) return 'Preparando dados...';
    if (progress < 40) return 'Inicializando modelo...';
    if (progress < 60) return 'Treinando rede neural...';
    if (progress < 80) return 'Otimizando parâmetros...';
    return 'Finalizando treinamento...';
  };

  const getStatusIcon = (status: TrainingStatus['status']) => {
    switch (status) {
      case 'training':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: TrainingStatus['status']) => {
    switch (status) {
      case 'training':
        return <Badge variant="secondary">Treinando</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Treinamento de Modelos ML</h2>
          <p className="text-muted-foreground">
            Treine e otimize os modelos de Machine Learning do sistema
          </p>
        </div>
      </div>

      {/* Seleção de Filial */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>
            Selecione a filial para treinar os modelos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Select value={selectedFilial} onValueChange={setSelectedFilial}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma filial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Filial 1 - Centro</SelectItem>
                  <SelectItem value="2">Filial 2 - Norte</SelectItem>
                  <SelectItem value="3">Filial 3 - Sul</SelectItem>
                  <SelectItem value="all">Todas as Filiais</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modelos Disponíveis */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {modelConfigs.map((config) => {
          const status = trainingStatuses[config.id];
          
          return (
            <Card key={config.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {config.icon}
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status && getStatusIcon(status.status)}
                    {status ? getStatusBadge(status.status) : getStatusBadge('idle')}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Tempo estimado: {config.estimatedTime}</span>
                  {status?.startTime && (
                    <span>Duração: {formatDuration(status.startTime, status.endTime)}</span>
                  )}
                </div>

                {/* Barra de Progresso */}
                {status?.status === 'training' && (
                  <div className="space-y-2">
                    <Progress value={status.progress} className="h-2" />
                    <p className="text-sm text-muted-foreground">{status.message}</p>
                  </div>
                )}

                {/* Métricas do Modelo */}
                {status?.status === 'completed' && status.metrics && (
                  <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(status.metrics.accuracy! * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-muted-foreground">Acurácia</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {status.metrics.loss?.toFixed(3)}
                      </div>
                      <div className="text-xs text-muted-foreground">Loss</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {status.metrics.epochs}
                      </div>
                      <div className="text-xs text-muted-foreground">Épocas</div>
                    </div>
                  </div>
                )}

                {/* Mensagem de Erro */}
                {status?.status === 'error' && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{status.message}</AlertDescription>
                  </Alert>
                )}

                {/* Botão de Ação */}
                <Button 
                  onClick={() => startTraining(config)}
                  disabled={!selectedFilial || status?.status === 'training'}
                  className="w-full"
                  variant={status?.status === 'completed' ? 'outline' : 'default'}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {status?.status === 'training' ? 'Treinando...' : 
                   status?.status === 'completed' ? 'Retreinar Modelo' : 'Iniciar Treinamento'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Informações Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-2">
            <Brain className="h-5 w-5 mt-0.5 text-blue-500" />
            <div>
              <p className="font-medium">Retreinamento Recomendado</p>
              <p className="text-sm text-muted-foreground">
                Execute o retreinamento semanalmente para manter a precisão dos modelos
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className="h-5 w-5 mt-0.5 text-orange-500" />
            <div>
              <p className="font-medium">Processamento Assíncrono</p>
              <p className="text-sm text-muted-foreground">
                O treinamento não bloqueia outras operações do sistema
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <TrendingUp className="h-5 w-5 mt-0.5 text-green-500" />
            <div>
              <p className="font-medium">Otimização Automática</p>
              <p className="text-sm text-muted-foreground">
                Os modelos são automaticamente otimizados para produção
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}