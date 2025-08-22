"use client";

import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({ 
  className = "", 
  variant = "rectangular", 
  width = "100%", 
  height = "1rem",
  lines = 1 
}: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantClasses = {
    text: "rounded-sm",
    rectangular: "rounded-md",
    circular: "rounded-full"
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} h-4`}
            style={{
              width: i === lines - 1 ? '75%' : '100%'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

// Skeleton para cards KPI
export function KpiCardSkeleton() {
  return (
    <div className="shadow-lg border bg-white dark:bg-gray-900 rounded-lg p-4 h-full">
      <div className="mb-2">
        <Skeleton variant="text" height="14px" width="70%" />
      </div>
      <div>
        <Skeleton variant="text" height="32px" width="80%" />
      </div>
    </div>
  );
}

// Skeleton para gráficos
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="w-full p-6 bg-white dark:bg-gray-900 rounded-lg shadow">
      <div className="mb-4">
        <Skeleton variant="text" height="20px" width="40%" />
        <Skeleton variant="text" height="14px" width="60%" className="mt-2" />
      </div>
      <Skeleton 
        variant="rectangular" 
        height={`${height}px`} 
        className="rounded-lg" 
      />
    </div>
  );
}

// Skeleton para tabelas
export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} variant="text" height="16px" width="80%" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={colIndex} 
                  variant="text" 
                  height="14px" 
                  width={colIndex === 0 ? "60%" : "40%"} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para mapas
export function MapSkeleton() {
  return (
    <div className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
      <Skeleton className="absolute inset-0" />
      <div className="absolute inset-4 space-y-3">
        {/* Simulate map markers */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${30 + (i * 10)}%`
            }}
          >
            <Skeleton variant="circular" width="12px" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}
