'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Target,
  Settings,
  Check,
  X,
  Clock,
  Mail,
  Smartphone
} from 'lucide-react';

interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: 'churn' | 'sales' | 'recommendation' | 'clustering';
  condition: string;
  threshold: number;
  enabled: boolean;
  channels: ('email' | 'sms' | 'push')[];
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  icon: React.ReactNode;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'warning' | 'info' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: any;
}

const defaultRules: NotificationRule[] = [
  {
    id: 'high-churn-risk',
    name: 'Alto Risco de Churn',
    description: 'Alerta quando clientes têm probabilidade de churn > 80%',
    type: 'churn',
    condition: 'churn_probability',
    threshold: 0.8,
    enabled: true,
    channels: ['email', 'push'],
    frequency: 'immediate',
    icon: <AlertTriangle className="h-4 w-4 text-red-500" />
  },
  {
    id: 'sales-drop',
    name: 'Queda nas Vendas',
    description: 'Alerta quando vendas caem mais de 20% em relação ao período anterior',
    type: 'sales',
    condition: 'sales_decrease',
    threshold: 0.2,
    enabled: true,
    channels: ['email'],
    frequency: 'daily',
    icon: <TrendingDown className="h-4 w-4 text-orange-500" />
  },
  {
    id: 'sales-spike',
    name: 'Pico de Vendas',
    description: 'Alerta quando vendas aumentam mais de 30%',
    type: 'sales',
    condition: 'sales_increase',
    threshold: 0.3,
    enabled: false,
    channels: ['push'],
    frequency: 'immediate',
    icon: <TrendingUp className="h-4 w-4 text-green-500" />
  },
  {
    id: 'low-recommendation-engagement',
    name: 'Baixo Engajamento em Recomendações',
    description: 'Alerta quando taxa de clique em recomendações < 5%',
    type: 'recommendation',
    condition: 'recommendation_ctr',
    threshold: 0.05,
    enabled: true,
    channels: ['email'],
    frequency: 'weekly',
    icon: <Target className="h-4 w-4 text-blue-500" />
  },
  {
    id: 'cluster-shift',
    name: 'Mudança de Segmento',
    description: 'Alerta quando clientes mudam de cluster significativamente',
    type: 'clustering',
    condition: 'cluster_migration',
    threshold: 0.15,
    enabled: true,
    channels: ['email'],
    frequency: 'daily',
    icon: <Users className="h-4 w-4 text-purple-500" />
  }
];

export default function AINotifications() {
  const [rules, setRules] = useState<NotificationRule[]>(defaultRules);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);

  // Simular notificações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Simular chegada de novas notificações baseadas nas regras ativas
      const activeRules = rules.filter(rule => rule.enabled);
      
      if (activeRules.length > 0 && Math.random() > 0.7) {
        const randomRule = activeRules[Math.floor(Math.random() * activeRules.length)];
        const newNotification = generateNotification(randomRule);
        
        setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Manter apenas 10 notificações
      }
    }, 10000); // Verificar a cada 10 segundos

    return () => clearInterval(interval);
  }, [rules]);

  const generateNotification = (rule: NotificationRule): Notification => {
    const notifications = {
      'high-churn-risk': {
        title: 'Cliente em Alto Risco de Churn',
        message: `Cliente João Silva tem 85% de probabilidade de abandono. Ação recomendada: contato imediato.`,
        type: 'warning' as const
      },
      'sales-drop': {
        title: 'Queda Significativa nas Vendas',
        message: `Vendas da Filial Centro caíram 25% esta semana. Investigação necessária.`,
        type: 'error' as const
      },
      'sales-spike': {
        title: 'Pico de Vendas Detectado',
        message: `Vendas aumentaram 40% hoje! Produto "Smartphone XYZ" em alta demanda.`,
        type: 'success' as const
      },
      'low-recommendation-engagement': {
        title: 'Baixo Engajamento em Recomendações',
        message: `Taxa de clique em recomendações caiu para 3% esta semana.`,
        type: 'warning' as const
      },
      'cluster-shift': {
        title: 'Mudança de Segmentação',
        message: `20% dos clientes VIP migraram para segmento "Em Risco".`,
        type: 'info' as const
      }
    };

    const notificationData = notifications[rule.id as keyof typeof notifications];
    
    return {
      id: `notif-${Date.now()}-${Math.random()}`,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      timestamp: new Date(),
      read: false,
      actionUrl: `/ia/${rule.type}`
    };
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateRuleThreshold = (ruleId: string, threshold: number) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, threshold } : rule
    ));
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'error': return <X className="h-4 w-4 text-red-500" />;
      case 'success': return <Check className="h-4 w-4 text-green-500" />;
      case 'info': return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return timestamp.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Notificações Inteligentes</h2>
          <p className="text-muted-foreground">
            Configure alertas automáticos baseados em IA para monitorar seu negócio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="px-2 py-1">
              {unreadCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração de Regras */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Regras de Notificação</span>
              </CardTitle>
              <CardDescription>
                Configure quando e como receber alertas do sistema de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {rule.icon}
                      <div>
                        <h4 className="font-medium">{rule.name}</h4>
                        <p className="text-sm text-muted-foreground">{rule.description}</p>
                      </div>
                    </div>
                    <Switch 
                      checked={rule.enabled} 
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                  
                  {rule.enabled && (
                    <div className="space-y-3 pt-2 border-t">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Limite</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={rule.threshold}
                            onChange={(e) => updateRuleThreshold(rule.id, parseFloat(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Frequência</Label>
                          <Select value={rule.frequency}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="immediate">Imediato</SelectItem>
                              <SelectItem value="hourly">Por Hora</SelectItem>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">Canais:</span>
                        {rule.channels.includes('email') && <Mail className="h-3 w-3" />}
                        {rule.channels.includes('sms') && <Smartphone className="h-3 w-3" />}
                        {rule.channels.includes('push') && <Bell className="h-3 w-3" />}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Feed de Notificações */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificações Recentes</span>
                </CardTitle>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <CardDescription>
                Alertas em tempo real baseados nas suas regras configuradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma notificação ainda</p>
                  <p className="text-sm">As notificações aparecerão aqui conforme as regras configuradas</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        notification.read ? 'bg-muted/30' : 'bg-background border-primary/20'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium text-sm ${
                              notification.read ? 'text-muted-foreground' : 'text-foreground'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="p-0 h-auto mt-2">
                              Ver detalhes →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{notifications.length}</div>
                  <div className="text-xs text-muted-foreground">Total Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                  <div className="text-xs text-muted-foreground">Não Lidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {rules.filter(r => r.enabled).length}
                  </div>
                  <div className="text-xs text-muted-foreground">Regras Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {notifications.filter(n => n.type === 'success').length}
                  </div>
                  <div className="text-xs text-muted-foreground">Positivas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}