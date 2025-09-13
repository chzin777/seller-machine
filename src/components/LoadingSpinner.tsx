"use client";

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large' | 'full';
  text?: string;
  showText?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  text = 'Carregando dados...', 
  showText = true 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-64',
    large: 'h-96',
    full: 'h-screen'
  };

  const hourglassSizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    full: 'w-20 h-20'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} w-full`}>
      {/* Ampulheta animada */}
      <div className="relative">
        <div className={`${hourglassSizes[size]} animate-spin`} style={{ animationDuration: '2s' }}>
          {/* SVG da ampulheta */}
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            {/* Gradiente azul do site */}
            <defs>
              <linearGradient id="hourglassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#1D4ED8" />
              </linearGradient>
            </defs>
            
            {/* Contorno da ampulheta */}
            <path
              d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"
              stroke="url(#hourglassGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Areia superior */}
            <path
              d="M6 2h12v6l-6 4V2z"
              fill="url(#hourglassGradient)"
              opacity="0.4"
            />
            
            {/* Areia inferior */}
            <path
              d="M6 22h12v-6l-6-4v10z"
              fill="url(#hourglassGradient)"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>

      {/* Texto de loading */}
      {showText && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-blue-800 dark:text-blue-300 animate-pulse">
            {text}
          </p>
          <div className="flex justify-center mt-2">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente específico para loading de página inteira
export function FullPageLoader({ text = 'Carregando dashboard...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm mx-4">
        <LoadingSpinner size="large" text={text} />
      </div>
    </div>
  );
}

// Componente para loading de cards/componentes menores
export function CardLoader({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <LoadingSpinner size="small" text={text} showText={false} />
    </div>
  );
}

// Componente para skeleton loading de dados
export function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-24"></div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  );
}