"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface RequestStatus {
  url: string;
  status: 'pending' | 'success' | 'error' | 'timeout';
  responseTime?: number;
  error?: string;
  timestamp: number;
}

const DiagnosticPanel: React.FC = () => {
  const [requests, setRequests] = useState<RequestStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testEndpoints = [
    '/api/proxy?url=/api/indicadores/receita-total',
    '/api/proxy?url=/api/notas-fiscais',
    '/api/proxy?url=/api/indicadores/receita-mensal',
    '/api/proxy?url=/api/indicadores/receita-por-tipo-produto',
    '/api/proxy?url=/api/indicadores/vendas-por-filial',
    '/api/proxy?url=/api/indicadores/clientes-inativos?dias=90',
    '/api/proxy?url=/api/clientes'
  ];

  const testRequest = async (url: string): Promise<RequestStatus> => {
    const startTime = Date.now();
    const timestamp = Date.now();
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (!response.ok) {
        return {
          url,
          status: 'error',
          responseTime,
          error: `HTTP ${response.status}: ${response.statusText}`,
          timestamp
        };
      }
      
      // Tentar fazer parse do JSON
      await response.json();
      
      return {
        url,
        status: 'success',
        responseTime,
        timestamp
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          url,
          status: 'timeout',
          responseTime,
          error: 'Timeout (30s)',
          timestamp
        };
      }
      
      return {
        url,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp
      };
    }
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setRequests([]);
    
    console.log('🔍 Iniciando diagnóstico de endpoints...');
    
    // Inicializar todos como pending
    const initialRequests = testEndpoints.map(url => ({
      url,
      status: 'pending' as const,
      timestamp: Date.now()
    }));
    setRequests(initialRequests);
    
    // Testar todos em paralelo
    const results = await Promise.allSettled(
      testEndpoints.map(testRequest)
    );
    
    const finalResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: testEndpoints[index],
          status: 'error' as const,
          error: result.reason?.message || 'Erro desconhecido',
          timestamp: Date.now()
        };
      }
    });
    
    setRequests(finalResults);
    setIsRunning(false);
    
    console.log('🔍 Diagnóstico concluído:', finalResults);
  };

  const getStatusIcon = (status: RequestStatus['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'timeout':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: RequestStatus['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      timeout: 'secondary',
      pending: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status]}>
        {status === 'pending' ? 'Testando...' : status}
      </Badge>
    );
  };

  const successCount = requests.filter(r => r.status === 'success').length;
  const errorCount = requests.filter(r => r.status === 'error' || r.status === 'timeout').length;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Diagnóstico de APIs</span>
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Testando...' : 'Testar Endpoints'}
          </Button>
        </CardTitle>
        {requests.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-green-600">✅ Sucesso: {successCount}</span>
            <span className="text-red-600">❌ Erro: {errorCount}</span>
            <span className="text-gray-600">📊 Total: {requests.length}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {requests.map((request, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(request.status)}
                <div>
                  <div className="font-mono text-sm">
                    {request.url.replace('/api/proxy?url=', '')}
                  </div>
                  {request.error && (
                    <div className="text-xs text-red-600 mt-1">
                      {request.error}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {request.responseTime && (
                  <span className="text-xs text-gray-500">
                    {request.responseTime}ms
                  </span>
                )}
                {getStatusBadge(request.status)}
              </div>
            </div>
          ))}
        </div>
        
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Clique em "Testar Endpoints" para verificar o status das APIs
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiagnosticPanel;