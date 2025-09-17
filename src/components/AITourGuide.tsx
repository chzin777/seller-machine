"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, ArrowLeft, ArrowRight, Play, BookOpen, Lightbulb, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlight?: boolean;
}

interface AITourGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface Position {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  transform?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Sistema de IA',
    content: 'Este tour vai te guiar pelas principais funcionalidades de inteligência artificial disponíveis no sistema.',
    target: 'dashboard',
    position: 'bottom'
  },
  {
    id: 'navigation',
    title: 'Navegação por Tabs',
    content: 'Use as abas horizontais no topo para navegar entre as diferentes funcionalidades de IA. Cada tab representa uma categoria específica.',
    target: 'churn-nav',
    position: 'bottom'
  },
  {
    id: 'churn',
    title: 'Predição de Churn',
    content: 'Identifica automaticamente clientes com risco de cancelamento. Use isso para ações preventivas de retenção.',
    target: 'churn-nav',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'recommendations',
    title: 'Sistema de Recomendações',
    content: 'IA que sugere produtos personalizados para cada cliente baseado no histórico de compras e comportamento.',
    target: 'recommendations-nav',
    position: 'bottom',
    highlight: true
  },
  {
    id: 'insights',
    title: 'Insights do Cliente',
    content: 'Análise detalhada do comportamento de cada cliente com segmentação automática e previsões.',
    target: 'insights-nav',
    position: 'bottom'
  },
  {
    id: 'clustering',
    title: 'Segmentação Automática',
    content: 'Machine learning agrupa seus clientes automaticamente em segmentos com características similares.',
    target: 'clustering-nav',
    position: 'bottom'
  },
  {
    id: 'sales',
    title: 'Predição de Vendas',
    content: 'Previsões precisas de vendas futuras com intervalos de confiança para planejamento estratégico.',
    target: 'sales-nav',
    position: 'bottom'
  },
  {
    id: 'training',
    title: 'Treinamento de Modelos',
    content: 'Mantenha os modelos de IA atualizados treinando-os regularmente com novos dados.',
    target: 'training-nav',
    position: 'bottom'
  }
];

// Função para calcular posição baseada no target
const getPositionForTarget = (target: string): Position => {
  if (typeof window === 'undefined') {
    return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }

  const element = document.getElementById(target);
  
  if (element) {
    const rect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    
    // Para tabs horizontais (elementos com '-nav'), posicionar abaixo
    if (target.includes('-nav')) {
      return {
        top: `${rect.bottom + 30}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)'
      };
    }
    
    // Para elementos dashboard/recommendations, posicionar no centro
    if (target === 'dashboard' || target === 'recommendations') {
      return {
        top: '300px',
        left: '50%',
        transform: 'translateX(-50%)'
      };
    }
    
    // Posicionamento padrão para outros elementos
    return {
      top: `${Math.min(rect.bottom + 20, viewportHeight - 250)}px`,
      left: `${rect.left + rect.width / 2}px`,
      transform: 'translateX(-50%)'
    };
  }

  // Fallback positions melhoradas para tabs horizontais
  const fallbackPositions: Record<string, Position> = {
    dashboard: {
      top: '300px',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    recommendations: {
      top: '300px',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    'insights-nav': {
      top: '200px',
      left: '20%',
      transform: 'translateX(-50%)'
    },
    'churn-nav': {
      top: '200px',
      left: '35%',
      transform: 'translateX(-50%)'
    },
    'clustering-nav': {
      top: '200px',
      left: '50%',
      transform: 'translateX(-50%)'
    },
    'sales-nav': {
      top: '200px',
      left: '65%',
      transform: 'translateX(-50%)'
    },
    'training-nav': {
      top: '200px',
      left: '80%',
      transform: 'translateX(-50%)'
    }
  };

  return fallbackPositions[target] || {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };
};

// Função para obter a seta baseada na posição
const getArrowIcon = (target: string) => {
  // Para tabs horizontais, não mostrar seta (fica melhor visualmente)
  if (target.includes('-nav')) return null;
  
  // Para dashboard e recommendations, mostrar seta para baixo
  if (target === 'dashboard' || target === 'recommendations') return ChevronDown;
  
  return null; // Para outros elementos, sem seta
};

export default function AITourGuide({ isOpen, onClose, onNavigate }: AITourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState<Position>({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });

  const currentTourStep = tourSteps[currentStep];
  const ArrowIcon = getArrowIcon(currentTourStep.target);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setCurrentStep(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVisible) {
      // Aguardar um frame para garantir que o DOM foi atualizado
      requestAnimationFrame(() => {
        const newPosition = getPositionForTarget(currentTourStep.target);
        setCardPosition(newPosition);
      });
    }
  }, [currentStep, isVisible, currentTourStep.target]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      // Navegar para a seção relevante (remover o '-nav' para obter a seção)
      const nextStep = tourSteps[currentStep + 1];
      if (nextStep.target.includes('-nav')) {
        const section = nextStep.target.replace('-nav', '');
        onNavigate(section);
      }
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // Navegar para a seção relevante
      const prevStep = tourSteps[currentStep - 1];
      if (prevStep.target !== 'sidebar' && prevStep.target !== 'dashboard') {
        onNavigate(prevStep.target);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setCurrentStep(0);
    }, 300);
  };

  const handleSkip = () => {
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Quatro divs com blur que contornam o elemento destacado */}
      {(() => {
        if (typeof window === 'undefined' || currentTourStep.target === 'dashboard') {
          return (
            <div className={`fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`} />
          );
        }
        
        // Buscar pelo ID exato do target
        const element = document.getElementById(currentTourStep.target);
        if (!element) {
          return (
            <div className={`fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300 ${
              isVisible ? 'opacity-100' : 'opacity-0'
            }`} />
          );
        }
        
        const rect = element.getBoundingClientRect();
        const margin = 8;
        
        return (
          <>
            {/* Parte superior */}
            <div 
              className={`fixed backdrop-blur-sm z-40 transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: 0,
                left: 0,
                right: 0,
                height: `${Math.max(0, rect.top - margin)}px`
              }}
            />
            
            {/* Parte inferior */}
            <div 
              className={`fixed backdrop-blur-sm z-40 transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: `${rect.bottom + margin}px`,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
            
            {/* Parte esquerda */}
            <div 
              className={`fixed backdrop-blur-sm z-40 transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: `${Math.max(0, rect.top - margin)}px`,
                left: 0,
                width: `${Math.max(0, rect.left - margin)}px`,
                height: `${rect.height + 2 * margin}px`
              }}
            />
            
            {/* Parte direita */}
            <div 
              className={`fixed backdrop-blur-sm z-40 transition-all duration-300 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                top: `${Math.max(0, rect.top - margin)}px`,
                left: `${rect.right + margin}px`,
                right: 0,
                height: `${rect.height + 2 * margin}px`
              }}
            />
          </>
        );
      })()}

      {/* Spotlight effect no elemento target - remove o blur */}
      {currentTourStep.target !== 'dashboard' && (
        <div 
          className={`fixed z-45 transition-all duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={(() => {
            if (typeof window === 'undefined') return {};
            
            const element = document.getElementById(`${currentTourStep.target}-nav`) || document.getElementById(currentTourStep.target);
            if (element) {
              const rect = element.getBoundingClientRect();
              return {
                left: `${rect.left - 8}px`,
                top: `${rect.top - 8}px`,
                width: `${rect.width + 16}px`,
                height: `${rect.height + 16}px`,
                background: 'rgba(59, 130, 246, 0.12)',
                border: '2px solid rgba(59, 130, 246, 0.4)',
                borderRadius: '12px',
                boxShadow: '0 0 25px rgba(59, 130, 246, 0.25)',
                backdropFilter: 'blur(0px)', // Remove o blur neste elemento
                pointerEvents: 'none',
                zIndex: 46 // Acima do overlay com blur
              };
            }
            
            return {
              left: currentTourStep.target === 'sidebar' ? '0' : '16px',
              top: '200px',
              width: currentTourStep.target === 'sidebar' ? '256px' : '240px',
              height: '48px',
              background: 'rgba(59, 130, 246, 0.08)',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '8px',
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.15)',
              backdropFilter: 'blur(0px)',
              pointerEvents: 'none'
            };
          })()}
        />
      )}

      {/* Tour Card com posicionamento dinâmico */}
      <div 
        className={`fixed z-50 transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          ...cardPosition,
          // Em mobile, sempre centralizar horizontalmente e posicionar no topo
          ...(typeof window !== 'undefined' && window.innerWidth < 768 && {
            top: '120px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'calc(100vw - 2rem)',
            margin: '0 1rem'
          })
        }}
      >
        <Card className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] mx-auto shadow-2xl border-2 border-blue-200 bg-white relative">
          {/* Triângulo indicativo - apenas desktop para tabs horizontais */}
          {currentTourStep.target.includes('-nav') && typeof window !== 'undefined' && window.innerWidth >= 768 && (
            <div 
              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
              style={{ 
                width: 0, 
                height: 0, 
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '8px solid white'
              }}
            />
          )}
          
          <CardContent className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {currentTourStep.highlight ? (
                    <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  ) : (
                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">{currentTourStep.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {currentStep + 1} de {tourSteps.length}
                    </Badge>
                    {currentTourStep.highlight && (
                      <Badge className="text-xs bg-yellow-100 text-yellow-800">
                        Destaque
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3 sm:mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              />
            </div>

            {/* Content */}
            <div className="mb-4 sm:mb-6">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {currentTourStep.content}
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex gap-2 order-2 sm:order-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  Pular Tour
                </Button>
              </div>

              <div className="flex gap-2 order-1 sm:order-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="flex items-center gap-1 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="hidden sm:inline">Anterior</span>
                  <span className="sm:hidden">Ant</span>
                </Button>
                
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs sm:text-sm flex-1 sm:flex-initial"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      Finalizar
                      <Play className="h-3 w-3" />
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Próximo</span>
                      <span className="sm:hidden">Próx</span>
                      <ArrowRight className="h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}