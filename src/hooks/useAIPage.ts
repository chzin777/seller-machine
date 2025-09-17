'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAIPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const user = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (!user) {
          router.push("/login");
          return;
        }
        setIsAuthenticated(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  return {
    isAuthenticated,
    loading,
    activeTab,
    setActiveTab,
    showTour,
    setShowTour,
    favorites,
    toggleFavorite
  };
}