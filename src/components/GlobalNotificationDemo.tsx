'use client';

import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useGlobalNotifications } from '@/providers/GlobalNotificationProvider';

export default function GlobalNotificationDemo() {
  const { addNotification } = useGlobalNotifications();

  const demoNotifications = [
    {
      type: 'ai-insight' as const,
      title: '🧠 Insight de Churn Detectado',
      message: 'Cliente "João Silva" tem 85% de probabilidade de churn nos próximos 30 dias',
      category: 'churn' as const,
      priority: 'high' as const,
      actionLabel: 'Analisar Cliente',
      actionFn: () => console.log('Navegando para análise de churn...')
    },
    {
      type: 'success' as const,
      title: '✅ Modelo Atualizado',
      message: 'Sistema de recomendações retreinado com 96% de precisão',
      category: 'training' as const,
      priority: 'medium' as const,
      actionLabel: 'Ver Métricas',
      actionFn: () => console.log('Navegando para métricas do modelo...')
    },
    {
      type: 'warning' as const,
      title: '⚠️ Alerta de Performance',
      message: 'Vendas da região Sul caíram 15% esta semana',
      category: 'sales' as const,
      priority: 'high' as const,
      actionLabel: 'Ver Relatório',
      actionFn: () => console.log('Navegando para relatório de vendas...')
    },
    {
      type: 'info' as const,
      title: '📈 Nova Oportunidade',
      message: '18 clientes identificados como prontos para upgrade',
      category: 'recommendations' as const,
      priority: 'medium' as const,
      actionLabel: 'Ver Lista',
      actionFn: () => console.log('Navegando para oportunidades...')
    }
  ];

  const triggerRandomNotification = () => {
    const randomNotification = demoNotifications[Math.floor(Math.random() * demoNotifications.length)];
    addNotification(randomNotification);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 Sistema de Notificações Globais
        </CardTitle>
        <CardDescription>
          Teste o sistema de notificações que funciona em toda a aplicação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {demoNotifications.map((notification, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => addNotification(notification)}
              className="text-left justify-start h-auto p-3"
            >
              <div className="space-y-1">
                <div className="font-medium text-sm">{notification.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2">
                  {notification.message}
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="border-t pt-4">
          <Button 
            onClick={triggerRandomNotification}
            className="w-full"
            variant="default"
          >
            🎲 Gerar Notificação Aleatória
          </Button>
        </div>

        <div className="text-xs text-[#003153]/70 space-y-1">
          <p>• <strong>Design unificado:</strong> Todas as notificações usam fundo branco com bordas/destaques na cor da sidebar (#003153)</p>
          <p>• <strong>Toasts temporários:</strong> Aparecem no canto superior direito por até 30 segundos</p>
          <p>• <strong>Histórico persistente:</strong> Fechar um toast não remove do histórico - use o sino para ver tudo</p>
          <p>• <strong>Dados reais:</strong> Sistema integrado com APIs de churn, vendas, alertas e clientes inativos</p>
          <p>• <strong>Multiplataforma:</strong> Funciona em todas as páginas com design consistente</p>
        </div>
      </CardContent>
    </Card>
  );
}