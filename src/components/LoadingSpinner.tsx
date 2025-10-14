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

  const logoSizes = {
    small: { width: 50, height: 50 },
    medium: { width: 80, height: 80 },
    large: { width: 120, height: 120 },
    full: { width: 150, height: 150 }
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} w-full`}>
      {/* Logo girando com pulse de opacidade */}
      <div className="logo-loading">
        <img 
          src="/images/logo.png" 
          alt="Logo Única" 
          width={logoSizes[size].width}
          height={logoSizes[size].height}
          className="object-contain"
        />
      </div>

      {/* Texto de loading */}
      {showText && (
        <div className="mt-6 text-center">
          <p className="text-lg font-medium" style={{ color: '#003153' }}>
            {text}
          </p>
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

// Componente inline para substituir spinners básicos
export function InlineLogoSpinner({ size = 32 }: { size?: number }) {
  return (
    <div className="logo-loading inline-block">
      <img 
        src="/images/logo.png" 
        alt="Carregando" 
        width={size}
        height={size}
        className="object-contain"
      />
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