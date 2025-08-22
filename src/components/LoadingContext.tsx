"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
  progress: number;
  setProgress: (progress: number) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Carregando...');
  const [progress, setProgressState] = useState(0);

  const setLoading = useCallback((loading: boolean, message: string = 'Carregando...') => {
    setIsLoading(loading);
    setLoadingMessage(message);
    if (loading) {
      setProgressState(0);
    }
  }, []);

  const setProgress = useCallback((progress: number) => {
    setProgressState(progress);
  }, []);

  return (
    <LoadingContext.Provider 
      value={{ 
        isLoading, 
        loadingMessage, 
        setLoading, 
        progress, 
        setProgress 
      }}
    >
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
