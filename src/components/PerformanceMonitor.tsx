'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  apiCalls: number;
  cacheHits: number;
  memoryUsage?: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    apiCalls: 0,
    cacheHits: 0
  });

  useEffect(() => {
    // Monitora métricas de performance
    const startTime = performance.now();
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
            renderTime: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart
          }));
        }
        
        if (entry.entryType === 'measure' && entry.name.startsWith('api-call')) {
          setMetrics(prev => ({
            ...prev,
            apiCalls: prev.apiCalls + 1
          }));
        }
        
        if (entry.entryType === 'measure' && entry.name.startsWith('cache-hit')) {
          setMetrics(prev => ({
            ...prev,
            cacheHits: prev.cacheHits + 1
          }));
        }
      });
    });
    
    observer.observe({ entryTypes: ['navigation', 'measure'] });
    
    // Monitora uso de memória se disponível
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMetrics(prev => ({
        ...prev,
        memoryUsage: memory.usedJSHeapSize
      }));
    }
    
    return () => observer.disconnect();
  }, []);

  // Só mostra em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs z-50 font-mono">
      <div className="space-y-1">
        <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
        <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
        <div>API: {metrics.apiCalls}</div>
        <div>Cache: {metrics.cacheHits}</div>
        {metrics.memoryUsage && (
          <div>Mem: {(metrics.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
        )}
      </div>
    </div>
  );
}

// Hook para marcar métricas personalizadas
export function usePerformanceMark() {
  const mark = (name: string, type: 'start' | 'end' = 'start') => {
    const markName = `${name}-${type}`;
    performance.mark(markName);
    
    if (type === 'end') {
      try {
        performance.measure(name, `${name}-start`, markName);
      } catch (e) {
        console.warn(`Could not measure ${name}`, e);
      }
    }
  };
  
  return { mark };
}
