'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showTour, setShowTour] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Carregar favoritos do localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem('ai-favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    }
  }, []);

  // Função para toggle favoritos
  const toggleFavorite = (tab: string) => {
    const newFavorites = favorites.includes(tab)
      ? favorites.filter(f => f !== tab)
      : [...favorites, tab];
    
    setFavorites(newFavorites);
    if (typeof window !== "undefined") {
      localStorage.setItem('ai-favorites', JSON.stringify(newFavorites));
    }
  };



  return {
    loading,
    activeTab,
    setActiveTab,
    showTour,
    setShowTour,
    favorites,
    toggleFavorite
  };
}