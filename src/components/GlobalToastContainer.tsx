'use client';

import { useGlobalNotifications, Notification, NotificationType } from '@/providers/GlobalNotificationProvider';
import { X, Bell, CheckCircle, AlertTriangle, Info, XCircle, Brain } from 'lucide-react';
import { useEffect, useState } from 'react';

const typeIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  'ai-insight': Brain
};

const typeColors = {
  success: 'border-green-500 bg-green-50 text-green-800',
  error: 'border-red-500 bg-red-50 text-red-800',
  warning: 'border-yellow-500 bg-yellow-50 text-yellow-800',
  info: 'border-blue-500 bg-blue-50 text-blue-800',
  'ai-insight': 'border-purple-500 bg-purple-50 text-purple-800'
};

const iconColors = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
  'ai-insight': 'text-purple-500'
};

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  onMarkAsRead: () => void;
}

function Toast({ notification, onClose, onMarkAsRead }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const IconComponent = typeIcons[notification.type];

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!notification.autoClose) return;

    const startTime = Date.now();
    const duration = notification.duration || 5000;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const progressPercent = (remaining / duration) * 100;
      
      setProgress(progressPercent);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }, [notification.autoClose, notification.duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleAction = () => {
    if (notification.actionFn) {
      notification.actionFn();
    }
    if (!notification.read) {
      onMarkAsRead();
    }
    handleClose();
  };

  return (
    <div className={`
      transform transition-all duration-200 ease-out pointer-events-auto
      ${isVisible 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
      }
    `}>
      <div className={`
        relative w-96 max-w-[calc(100vw-2rem)] sm:w-96 rounded-xl border-l-4 shadow-lg backdrop-blur-sm
        ${typeColors[notification.type]}
        mb-3 overflow-hidden
      `}>
        {/* Barra de progresso */}
        {notification.autoClose && (
          <div className="absolute top-0 left-0 h-1 bg-black/10 w-full">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex items-start p-3 sm:p-4 pt-4 sm:pt-5">
          <div className="flex-shrink-0 mr-2 sm:mr-3 mt-0.5">
            <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColors[notification.type]}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs sm:text-sm font-semibold truncate">
                {notification.title}
              </h4>
              <div className="flex items-center space-x-1 sm:space-x-2 ml-2">
                {notification.priority === 'high' && (
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-gray-600 mb-2 sm:mb-3">
              {notification.message}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(notification.timestamp).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>

              {notification.actionLabel && (
                <button
                  onClick={handleAction}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors px-2 py-1 rounded"
                >
                  {notification.actionLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GlobalToastContainer() {
  const { notifications, removeNotification, markAsRead } = useGlobalNotifications();
  const [visibleNotifications, setVisibleNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Mostrar apenas as 4 notificações mais recentes como toast
    const recentNotifications = notifications
      .filter(n => !n.read)
      .slice(0, 4);
    
    setVisibleNotifications(recentNotifications);
  }, [notifications]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-2 sm:right-4 z-50 space-y-2 pointer-events-none max-w-[calc(100vw-1rem)] sm:max-w-none">
      {visibleNotifications.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
          onMarkAsRead={() => markAsRead(notification.id)}
        />
      ))}
    </div>
  );
}