"use client";

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  isLoading: boolean;
  progress?: number;
  className?: string;
}

export default function ProgressBar({ isLoading, progress, className = "" }: ProgressBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    if (isLoading) {
      setDisplayProgress(0);
      // Simula progresso gradual se não foi fornecido um progresso específico
      if (progress === undefined) {
        const interval = setInterval(() => {
          setDisplayProgress(prev => {
            if (prev >= 90) {
              clearInterval(interval);
              return 90; // Para em 90% até terminar realmente
            }
            return prev + Math.random() * 15;
          });
        }, 200);
        
        return () => clearInterval(interval);
      } else {
        setDisplayProgress(progress);
      }
    } else {
      // Completa rapidamente quando termina
      setDisplayProgress(100);
      setTimeout(() => setDisplayProgress(0), 300);
    }
  }, [isLoading, progress]);

  if (!isLoading && displayProgress === 0) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-[9999] ${className}`}>
      <div 
        className="h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-300 ease-out shadow-lg"
        style={{ 
          width: `${displayProgress}%`,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
        }}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
      </div>
    </div>
  );
}
