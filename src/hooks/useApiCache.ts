"use client";

import { useState, useEffect, useCallback } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
  loading: boolean;
  error: string | null;
}

class ApiCache {
  private static instance: ApiCache;
  private cache = new Map<string, CacheEntry>();
  private subscribers = new Map<string, Set<(entry: CacheEntry) => void>>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private readonly MAX_CACHE_SIZE = 100;

  static getInstance() {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache();
    }
    return ApiCache.instance;
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.CACHE_DURATION;
  }

  private evictOldEntries() {
    if (this.cache.size <= this.MAX_CACHE_SIZE) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
      this.subscribers.delete(key);
    });
  }

  subscribe(key: string, callback: (entry: CacheEntry) => void): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    return () => {
      const subs = this.subscribers.get(key);
      if (subs) {
        subs.delete(callback);
        if (subs.size === 0) {
          this.subscribers.delete(key);
        }
      }
    };
  }

  private notify(key: string, entry: CacheEntry) {
    const subs = this.subscribers.get(key);
    if (subs) {
      subs.forEach(callback => callback(entry));
    }
  }

  async fetch(url: string, options?: RequestInit): Promise<CacheEntry> {
    const key = this.getCacheKey(url, options);
    const cached = this.cache.get(key);

    // Se tem cache válido e não está loading, retornar
    if (cached && !this.isExpired(cached) && !cached.loading) {
      return cached;
    }

    // Se já está fazendo fetch, retornar o que tem ou loading state
    if (cached?.loading) {
      return cached;
    }

    // Criar loading state
    const loadingEntry: CacheEntry = {
      data: cached?.data || null,
      timestamp: Date.now(),
      loading: true,
      error: null,
    };

    this.cache.set(key, loadingEntry);
    this.notify(key, loadingEntry);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Cache-Control': 'max-age=300',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const successEntry: CacheEntry = {
        data,
        timestamp: Date.now(),
        loading: false,
        error: null,
      };

      this.cache.set(key, successEntry);
      this.evictOldEntries();
      this.notify(key, successEntry);

      return successEntry;
    } catch (error) {
      const errorEntry: CacheEntry = {
        data: cached?.data || null,
        timestamp: Date.now(),
        loading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };

      this.cache.set(key, errorEntry);
      this.notify(key, errorEntry);

      return errorEntry;
    }
  }

  invalidate(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const [key] of this.cache) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export function useApiCache<T = any>(url: string | null, options?: RequestInit) {
  const [state, setState] = useState<CacheEntry>({
    data: null,
    timestamp: 0,
    loading: true,
    error: null,
  });

  const cache = ApiCache.getInstance();

  const refetch = useCallback(() => {
    if (!url) return;
    cache.fetch(url, options);
  }, [url, options, cache]);

  useEffect(() => {
    if (!url) {
      setState({
        data: null,
        timestamp: Date.now(),
        loading: false,
        error: null,
      });
      return;
    }

    const key = cache['getCacheKey'](url, options);
    
    const unsubscribe = cache.subscribe(key, (entry) => {
      setState(entry);
    });

    // Fazer fetch inicial
    cache.fetch(url, options);

    return unsubscribe;
  }, [url, cache, options]);

  return {
    data: state.data as T,
    loading: state.loading,
    error: state.error,
    refetch,
  };
}

// Hook para invalidar cache
export function useInvalidateCache() {
  const cache = ApiCache.getInstance();
  
  return {
    invalidate: cache.invalidate.bind(cache),
    invalidateAll: () => cache.invalidate(),
    getStats: cache.getStats.bind(cache),
  };
}
