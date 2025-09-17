'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'ai-insight';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionFn?: () => void;
  autoClose?: boolean;
  duration?: number; // em ms
  category?: 'churn' | 'sales' | 'recommendations' | 'system' | 'training' | 'daily' | 'welcome';
  priority?: 'low' | 'medium' | 'high';
}

interface GlobalNotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  isFirstVisitToday: boolean;
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | undefined>(undefined);

export function GlobalNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFirstVisitToday, setIsFirstVisitToday] = useState(false);

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      autoClose: notificationData.autoClose ?? true,
      duration: notificationData.duration ?? (notificationData.priority === 'high' ? 8000 : 5000),
      priority: notificationData.priority ?? 'medium'
    };

    setNotifications(prev => [notification, ...prev]);

    // Auto-remove se especificado
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Verificar se é primeira visita do dia
  useEffect(() => {
    const checkFirstVisitToday = () => {
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem('lastVisitDate');
      
      if (lastVisit !== today) {
        setIsFirstVisitToday(true);
        localStorage.setItem('lastVisitDate', today);
        
        // Notificação de boas-vindas diária
        setTimeout(() => {
          addNotification({
            type: 'info',
            title: '👋 Bom dia!',
            message: 'Bem-vindo de volta ao sistema. Confira os novos insights disponíveis.',
            category: 'daily',
            priority: 'medium',
            duration: 6000,
            actionLabel: 'Ver Dashboard IA',
            actionFn: () => window.location.href = '/ia'
          });
        }, 2000);

        // Verificar se há alertas importantes do dia anterior
        setTimeout(() => {
          addNotification({
            type: 'ai-insight',
            title: '📊 Resumo Diário',
            message: '5 novos insights de churn detectados ontem',
            category: 'daily',
            priority: 'high',
            actionLabel: 'Ver Análise',
            actionFn: () => window.location.href = '/ia'
          });
        }, 5000);
      }
    };

    checkFirstVisitToday();
  }, [addNotification]);

  // Sistema de notificações periódicas
  useEffect(() => {
    const generatePeriodicNotifications = () => {
      const notifications = [
        {
          type: 'ai-insight' as NotificationType,
          title: '🧠 Novo Insight Detectado',
          message: 'Cliente "Maria Silva" com 90% probabilidade de churn detectada',
          category: 'churn' as const,
          priority: 'high' as const,
          actionLabel: 'Revisar Cliente',
          actionFn: () => console.log('Navigate to customer analysis')
        },
        {
          type: 'warning' as NotificationType,
          title: '📉 Alerta de Performance',
          message: 'Vendas da filial Sul caíram 18% esta semana',
          category: 'sales' as const,
          priority: 'high' as const,
          actionLabel: 'Analisar Vendas',
          actionFn: () => console.log('Navigate to sales analysis')
        },
        {
          type: 'success' as NotificationType,
          title: '✅ Modelo Atualizado',
          message: 'Sistema de recomendações retreinado com 95% de precisão',
          category: 'training' as const,
          priority: 'medium' as const,
          actionLabel: 'Ver Métricas',
          actionFn: () => console.log('Navigate to model metrics')
        },
        {
          type: 'info' as NotificationType,
          title: '📈 Oportunidade Identificada',
          message: '12 clientes prontos para upgrade de plano detectados',
          category: 'recommendations' as const,
          priority: 'medium' as const,
          actionLabel: 'Ver Lista',
          actionFn: () => console.log('Navigate to opportunities')
        },
        {
          type: 'warning' as NotificationType,
          title: '⏰ Ação Requerida',
          message: '8 clientes sem contato há mais de 30 dias',
          category: 'system' as const,
          priority: 'medium' as const,
          actionLabel: 'Revisar',
          actionFn: () => console.log('Navigate to inactive customers')
        }
      ];

      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      addNotification(randomNotification);
    };

    // Primeira notificação após 10 segundos
    const initialTimer = setTimeout(generatePeriodicNotifications, 10000);
    
    // Notificações periódicas a cada 2 minutos
    const interval = setInterval(generatePeriodicNotifications, 120000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [addNotification]);

  // Limpar notificações antigas (mais de 24h)
  useEffect(() => {
    const cleanupOldNotifications = () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      setNotifications(prev => 
        prev.filter(n => n.timestamp > oneDayAgo)
      );
    };

    // Limpar a cada hora
    const cleanupInterval = setInterval(cleanupOldNotifications, 60 * 60 * 1000);
    
    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <GlobalNotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
      isFirstVisitToday
    }}>
      {children}
    </GlobalNotificationContext.Provider>
  );
}

export function useGlobalNotifications() {
  const context = useContext(GlobalNotificationContext);
  if (context === undefined) {
    throw new Error('useGlobalNotifications must be used within a GlobalNotificationProvider');
  }
  return context;
}