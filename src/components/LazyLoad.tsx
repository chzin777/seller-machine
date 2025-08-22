"use client";

import React, { Suspense, ComponentType, ReactElement, cloneElement } from 'react';
import { useIntersectionObserver } from '../hooks/usePerformance';
import { Skeleton } from './ui/skeleton';

interface LazyLoadProps {
  children: ReactElement;
  fallback?: ReactElement;
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  placeholder?: ComponentType;
}

export function LazyLoad({
  children,
  fallback,
  threshold = 0.1,
  rootMargin = '50px',
  triggerOnce = true,
  placeholder: Placeholder,
}: LazyLoadProps) {
  const targetRef = React.useRef<HTMLDivElement | null>(null);
  const { isIntersecting, hasIntersected } = useIntersectionObserver(
    targetRef as React.RefObject<Element>, 
    {
      threshold,
      rootMargin,
    }
  );

  const shouldLoad = triggerOnce ? hasIntersected : isIntersecting;

  return (
    <div ref={targetRef} className="w-full">
      {shouldLoad ? (
        children
      ) : (
        fallback || 
        (Placeholder ? <Placeholder /> : <Skeleton className="w-full h-64" />)
      )}
    </div>
  );
}

// HOC para lazy loading de componentes
export function withLazyLoad<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: Omit<LazyLoadProps, 'children'> = {}
) {
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyLoad {...options}>
        <WrappedComponent {...props} />
      </LazyLoad>
    );
  };
}

// Componente para lazy loading de imagens
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function LazyImage({
  src,
  alt,
  placeholder,
  className = "",
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const { hasIntersected } = useIntersectionObserver(
    imgRef as React.RefObject<Element>
  );

  React.useEffect(() => {
    if (hasIntersected && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
      img.src = src;
    }
  }, [hasIntersected, src, isLoaded]);

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Erro ao carregar imagem</span>
      </div>
    );
  }

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {isLoaded ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-opacity duration-300"
          {...props}
        />
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse">
          {placeholder && (
            <img
              src={placeholder}
              alt={alt}
              className="w-full h-full object-cover blur-sm"
            />
          )}
        </div>
      )}
    </div>
  );
}

// Wrapper para Suspense com fallback personalizado
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export function SuspenseWrapper({
  children,
  fallback = <Skeleton className="w-full h-64" />,
  errorFallback: ErrorFallback,
}: SuspenseWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {ErrorFallback ? (
        <ErrorBoundary fallback={ErrorFallback}>
          {children}
        </ErrorBoundary>
      ) : (
        children
      )}
    </Suspense>
  );
}

// Error Boundary simples
class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback: React.ComponentType<{ error: Error; retry: () => void }>;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const Fallback = this.props.fallback;
      return <Fallback error={this.state.error} retry={this.retry} />;
    }

    return this.props.children;
  }
}
