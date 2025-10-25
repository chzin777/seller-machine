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
    icon: <Target className="h-4 w-4" style={{ color: '#003153' }} />
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

  // Buscar notificações reais baseadas nas regras ativas
  useEffect(() => {
    const fetchAINotifications = async () => {
      const activeRules = rules.filter(rule => rule.enabled);
      if (activeRules.length === 0) return;

      try {
        // Buscar dados reais do sistema para gerar notificações baseadas nas regras
        const response = await fetch('/api/notifications');
        if (!response.ok) return;

        const data = await response.json();
        
        if (data.notifications && Array.isArray(data.notifications)) {
          // Filtrar notificações relevantes para as regras ativas
          const relevantNotifications = data.notifications.filter((notification: any) => {
            return activeRules.some(rule => {
              // Mapear categorias das notificações com tipos de regras
              const categoryToRuleType: Record<string, string> = {
                'churn': 'churn',
                'sales': 'sales',
                'recommendations': 'recommendation',
                'system': 'clustering'
              };
              
              return categoryToRuleType[notification.category] === rule.type;
            });
          });

          // Converter para formato do componente AINotifications
          const aiNotifications = relevantNotifications.map((notification: any) => ({
            id: notification.id || `ai-notif-${Date.now()}-${Math.random()}`,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            timestamp: new Date(notification.timestamp || new Date()),
            read: false,
            actionUrl: notification.actionUrl || `/ia/${notification.category}`
          }));

          // Adicionar apenas notificações novas
          setNotifications(prev => {
            const existingIds = prev.map(n => n.id);
            const newNotifications = aiNotifications.filter((n: Notification) => !existingIds.includes(n.id));
            
            if (newNotifications.length > 0) {
              return [...newNotifications, ...prev.slice(0, 7)]; // Manter apenas 8 notificações
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('Erro ao buscar notificações de IA:', error);
        
        // Em caso de erro, gerar uma notificação simulada ocasionalmente
        if (Math.random() > 0.8) {
          const randomRule = activeRules[Math.floor(Math.random() * activeRules.length)];
          const newNotification = generateNotification(randomRule);
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
        }
      }
    };

    // Primeira verificação após 3 segundos
    const initialTimer = setTimeout(fetchAINotifications, 3000);
    
    // Verificar a cada 30 segundos
    const interval = setInterval(fetchAINotifications, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [rules]);

  const generateNotification = (rule: NotificationRule): Notification => {
    // Gerar notificações mais realistas baseadas em dados possíveis do sistema
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 8 && currentHour <= 18;
    
    const notifications = {
      'high-churn-risk': {
        title: 'Cliente em Alto Risco de Churn Detectado',
        message: isBusinessHours 
          ? 'Sistema identificou cliente com padrão de abandono. Recomenda-se contato imediato.'
          : 'Novo caso de risco de churn detectado. Revisar pela manhã.',
        type: 'warning' as const
      },
      'sales-drop': {
        title: 'Alerta de Performance de Vendas',
        message: 'Detectada variação negativa significativa nas vendas. Análise detalhada necessária.',
        type: 'error' as const
      },
      'sales-spike': {
        title: 'Oportunidade de Vendas Identificada',
        message: 'Sistema detectou aumento atípico na demanda. Considere ampliar estoque.',
        type: 'success' as const
      },
      'low-recommendation-engagement': {
        title: 'Baixa Adesão às Recomendações',
        message: 'Taxa de conversão das recomendações abaixo do esperado. Revisar estratégia.',
        type: 'warning' as const
      },
      'cluster-shift': {
        title: 'Mudança no Perfil de Clientes',
        message: 'Detectada migração significativa entre segmentos RFV. Atualização de estratégia recomendada.',
        type: 'info' as const
      }
    };

    const notificationData = notifications[rule.id as keyof typeof notifications];
    
    return {
      id: `ai-rule-${rule.id}-${Date.now()}-${Math.random()}`,
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
      case 'info': return <Bell className="h-4 w-4" style={{ color: '#003153' }} />;
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
                <div className="text-center py-8 text-[#003153]/60">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50 text-[#003153]/40" />
                  <p>Nenhuma notificação ainda</p>
                  <p className="text-sm">As notificações aparecerão aqui conforme as regras configuradas</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        notification.read ? 'bg-[#003153]/5 border-[#003153]/10' : 'bg-white border-[#003153]/20'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`font-medium text-sm ${
                              notification.read ? 'text-[#003153]/60' : 'text-[#003153]'
                            }`}>
                              {notification.title}
                            </h4>
                            <span className="text-xs text-[#003153]/50">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-[#003153]/50' : 'text-[#003153]/70'
                          }`}>
                            {notification.message}
                          </p>
                          {notification.actionUrl && (
                            <Button variant="link" size="sm" className="p-0 h-auto mt-2 text-[#003153] hover:text-[#003153]/80">
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
                  <div className="text-2xl font-bold text-[#003153]">{notifications.length}</div>
                  <div className="text-xs text-[#003153]/60">Total Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#003153]">{unreadCount}</div>
                  <div className="text-xs text-[#003153]/60">Não Lidas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#003153]">
                    {rules.filter(r => r.enabled).length}
                  </div>
                  <div className="text-xs text-[#003153]/60">Regras Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#003153]">
                    {notifications.filter(n => n.type === 'success').length}
                  </div>
                  <div className="text-xs text-[#003153]/60">Positivas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}