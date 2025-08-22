import { useLoading } from './LoadingContext';
import { useCallback, useRef } from 'react';

type FetchOptions = {
  url: string;
  message?: string;
  progressStart?: number;
  progressEnd?: number;
  cache?: boolean; // Nova opção para cache
};

// Cache simples para evitar requisições desnecessárias
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export function useApiLoader() {
  const { setLoading, setProgress } = useLoading();
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchWithProgress = useCallback(async function<T>(options: FetchOptions): Promise<T> {
    const { url, message = 'Carregando...', progressStart = 0, progressEnd = 100, cache = true } = options;
    
    // Verificar cache primeiro
    if (cache) {
      const cached = requestCache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data as T;
      }
    }

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true, message);
      setProgress(progressStart);
      
      const response = await fetch(url, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Armazenar no cache
      if (cache) {
        requestCache.set(url, { data, timestamp: Date.now() });
      }
      
      setProgress(progressEnd);
      
      return data as T;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Requisição cancelada:', url);
        throw error;
      }
      setLoading(false);
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [setLoading, setProgress]);

  const finishLoading = useCallback(() => {
    setProgress(100);
    setTimeout(() => setLoading(false), 200);
  }, [setLoading, setProgress]);

  const clearCache = useCallback(() => {
    requestCache.clear();
  }, []);

  return {
    fetchWithProgress,
    finishLoading,
    setProgress,
    clearCache
  };
}
