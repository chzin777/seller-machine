'use client';

import { useState } from 'react';
import { Bell, X, Check, Trash2, Eye } from 'lucide-react';
import { useGlobalNotifications } from '@/providers/GlobalNotificationProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function GlobalNotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useGlobalNotifications();
  
  const [isOpen, setIsOpen] = useState(false);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ai-insight': return '🧠';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📢';
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 transition-colors rounded-lg hover:text-[#003153] hover:bg-[#003153] hover:bg-opacity-5"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-[#003153] hover:bg-[#003153]/90 border-[#003153]"
            style={{ color: '#ffffff' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-80 sm:max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#003153]/10 bg-[#003153]/5">
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-[#003153]">Notificações</h3>
              <p className="text-xs text-[#003153]/60">
                {unreadCount} não lidas de {notifications.length} total
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7 px-2 hidden sm:flex"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Marcar todas
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-7 w-7 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 sm:max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-[#003153]/30 mx-auto mb-3" />
                <p className="text-[#003153]/60 text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentNotifications.map(notification => (
                  <div
                    key={notification.id}
                    className="p-3 sm:p-4 hover:bg-[#003153]/5 transition-colors cursor-pointer"
                    style={!notification.read ? { 
                      backgroundColor: 'rgba(0, 49, 83, 0.05)',
                      borderLeft: '3px solid #003153'
                    } : {
                      borderLeft: '3px solid transparent'
                    }}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification.id);
                      if (notification.actionFn) notification.actionFn();
                    }}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <span className="text-base sm:text-lg flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.read ? 'text-[#003153]' : 'text-[#003153]/70'
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-[#003153]/50">
                              {formatTime(notification.timestamp)}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#003153' }} />
                            )}
                          </div>
                        </div>
                        
                        <p className="text-xs text-[#003153]/70 mb-2 leading-relaxed">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between">
                          {notification.category && (
                            <Badge variant="secondary" className="text-xs bg-[#003153]/10 text-[#003153] border-[#003153]/20">
                              {notification.category}
                            </Badge>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="text-[#003153]/40 hover:text-[#003153] transition-colors p-1"
                            title="Remover notificação"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2 sm:p-3 border-t border-[#003153]/10 bg-[#003153]/5 flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-[#003153]/70 hover:text-[#003153] h-7 w-full sm:w-auto justify-center sm:justify-start hover:bg-[#003153]/10"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Limpar todas
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/ia';
                }}
                className="text-xs h-7 w-full sm:w-auto justify-center sm:justify-start text-[#003153] hover:text-[#003153]/80 hover:bg-[#003153]/10"
              >
                <Eye className="w-3 h-3 mr-1" />
                Ver todas
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}