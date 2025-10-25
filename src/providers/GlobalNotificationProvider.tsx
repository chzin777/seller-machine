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
  dismissed?: boolean; // Para controlar se foi fechada do toast mas ainda está no histórico
}

interface GlobalNotificationContextType {
  notifications: Notification[]; // Todas as notificações (histórico completo)
  toastNotifications: Notification[]; // Apenas notificações visíveis como toast
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  dismissToast: (id: string) => void; // Fecha o toast mas mantém no histórico
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  isFirstVisitToday: boolean;
}

const GlobalNotificationContext = createContext<GlobalNotificationContextType | undefined>(undefined);

export function GlobalNotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isFirstVisitToday, setIsFirstVisitToday] = useState(false);

  // Carregar notificações persistentes do localStorage
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem('notification-history');
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // Converter timestamps de string para Date
        const notificationsWithDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notificationsWithDates);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações do localStorage:', error);
    }
  }, []);

  // Salvar notificações no localStorage sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('notification-history', JSON.stringify(notifications));
    } catch (error) {
      console.error('Erro ao salvar notificações no localStorage:', error);
    }
  }, [notifications]);

  // Filtrar toasts (notificações não dismissadas, independente de serem lidas)
  const toastNotifications = notifications.filter(n => 
    !n.dismissed && 
    (Date.now() - n.timestamp.getTime()) < 30000 // Mostrar por até 30 segundos
  ).slice(0, 4); // Limitar a 4 toasts simultâneos

  const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...notificationData,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
      dismissed: false,
      autoClose: notificationData.autoClose ?? true,
      duration: notificationData.duration ?? (notificationData.priority === 'high' ? 8000 : 5000),
      priority: notificationData.priority ?? 'medium'
    };

    setNotifications(prev => {
      // Verificar se já existe uma notificação similar (mesmo título)
      const existingIndex = prev.findIndex(n => n.title === notification.title);
      if (existingIndex !== -1) {
        // Atualizar notificação existente
        const updated = [...prev];
        updated[existingIndex] = { ...notification, id: prev[existingIndex].id };
        return updated;
      }
      // Adicionar nova notificação
      return [notification, ...prev];
    });

    // Auto-dismiss toast se especificado (mas mantém no histórico)
    if (notification.autoClose) {
      setTimeout(() => {
        dismissToast(notification.id);
      }, notification.duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, dismissed: true } : n)
    );
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
    // Também limpar do localStorage
    try {
      localStorage.removeItem('notification-history');
    } catch (error) {
      console.error('Erro ao limpar histórico de notificações:', error);
    }
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

  // Sistema de notificações baseado em dados reais
  useEffect(() => {
    const fetchRealNotifications = async () => {
      try {
        const response = await fetch('/api/notifications');
        if (!response.ok) {
          console.error('Erro ao buscar notificações:', response.status);
          return;
        }

        const data = await response.json();
        
        // Adicionar notificações reais do sistema
        if (data.notifications && Array.isArray(data.notifications)) {
          // Limitar a 3 notificações por vez para não sobrecarregar
          const newNotifications = data.notifications.slice(0, 3);
          
          newNotifications.forEach((notification: any, index: number) => {
            // Adicionar com delay escalonado para melhor UX
            setTimeout(() => {
              addNotification({
                type: notification.type,
                title: notification.title,
                message: notification.message,
                category: notification.category,
                priority: notification.priority,
                actionLabel: notification.actionLabel,
                actionFn: notification.actionUrl ? () => {
                  window.location.href = notification.actionUrl;
                } : undefined,
                duration: notification.priority === 'high' ? 10000 : 8000
              });
            }, index * 2000); // 2 segundos entre cada notificação
          });
        }
      } catch (error) {
        console.error('Erro ao buscar notificações reais:', error);
        
        // Fallback: uma notificação de erro
        addNotification({
          type: 'warning',
          title: '⚠️ Sistema de Notificações',
          message: 'Não foi possível carregar notificações em tempo real',
          category: 'system',
          priority: 'low',
          duration: 5000
        });
      }
    };

    // Primeira verificação após 5 segundos
    const initialTimer = setTimeout(fetchRealNotifications, 5000);
    
    // Verificar notificações reais a cada 5 minutos
    const interval = setInterval(fetchRealNotifications, 300000);

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
      toastNotifications,
      unreadCount,
      addNotification,
      removeNotification,
      dismissToast,
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