import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../lib/permissions';
import { prisma } from '../../../../lib/prisma';

interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'ai-insight';
  title: string;
  message: string;
  category: 'churn' | 'sales' | 'recommendations' | 'system' | 'training' | 'daily' | 'welcome';
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionUrl?: string;
  data?: any;
  timestamp: Date;
}

export async function GET(request: NextRequest) {
  // 🔔 Verificar se usuário pode acessar notificações
  const authCheck = requirePermission('ACCESS_AI_INSIGHTS')(request);
  if (!authCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Acesso negado', 
        message: authCheck.error,
        notifications: [], 
        total: 0 
      }, 
      { status: 403 }
    );
  }

  try {
    const notifications: NotificationData[] = [];
    
    // 1. Verificar alertas de churn
    try {
      const churnResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/churn-prediction`, {
        headers: request.headers
      });
      
      if (churnResponse.ok) {
        const churnData = await churnResponse.json();
        
        // Filtrar clientes com alto risco (>80%)
        const clientesAltoRisco = churnData.predictions?.filter((p: any) => p.churnProbability > 0.8) || [];
        
        if (clientesAltoRisco.length > 0) {
          notifications.push({
            id: `churn-high-risk-${Date.now()}`,
            type: 'warning',
            title: '🚨 Clientes em Alto Risco de Churn',
            message: `${clientesAltoRisco.length} clientes com probabilidade >80% de abandono detectados`,
            category: 'churn',
            priority: 'high',
            actionLabel: 'Revisar Clientes',
            actionUrl: '/ia/churn-prediction',
            data: { count: clientesAltoRisco.length, clientes: clientesAltoRisco.slice(0, 3) },
            timestamp: new Date()
          });
        }
        
        // Clientes com risco médio
        const clientesRiscoMedio = churnData.predictions?.filter((p: any) => 
          p.churnProbability > 0.5 && p.churnProbability <= 0.8
        ) || [];
        
        if (clientesRiscoMedio.length > 5) {
          notifications.push({
            id: `churn-medium-risk-${Date.now()}`,
            type: 'info',
            title: '⚠️ Monitorar Clientes em Risco',
            message: `${clientesRiscoMedio.length} clientes com risco médio de churn identificados`,
            category: 'churn',
            priority: 'medium',
            actionLabel: 'Ver Lista',
            actionUrl: '/ia/churn-prediction',
            data: { count: clientesRiscoMedio.length },
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados de churn:', error);
    }

    // 2. Verificar alertas de vendas
    try {
      const vendedoresResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vendedores`, {
        headers: request.headers
      });
      
      if (vendedoresResponse.ok) {
        const vendedores = await vendedoresResponse.json();
        
        // Verificar vendedores abaixo da meta (<70%)
        const vendedoresAbaixoMeta = vendedores.filter((v: any) => v.percentualMeta < 70);
        
        if (vendedoresAbaixoMeta.length > 0) {
          notifications.push({
            id: `sales-below-target-${Date.now()}`,
            type: 'warning',
            title: '📉 Vendedores Abaixo da Meta',
            message: `${vendedoresAbaixoMeta.length} vendedores com performance <70% da meta`,
            category: 'sales',
            priority: 'high',
            actionLabel: 'Revisar Performance',
            actionUrl: '/vendedores',
            data: { count: vendedoresAbaixoMeta.length, vendedores: vendedoresAbaixoMeta.slice(0, 3) },
            timestamp: new Date()
          });
        }
        
        // Verificar vendedores sem filial
        const vendedoresSemFilial = vendedores.filter((v: any) => !v.filialId);
        
        if (vendedoresSemFilial.length > 0) {
          notifications.push({
            id: `sellers-no-branch-${Date.now()}`,
            type: 'info',
            title: '🏢 Vendedores Sem Filial',
            message: `${vendedoresSemFilial.length} vendedores aguardando designação de filial`,
            category: 'system',
            priority: 'medium',
            actionLabel: 'Designar Filiais',
            actionUrl: '/vendedores',
            data: { count: vendedoresSemFilial.length },
            timestamp: new Date()
          });
        }
        
        // Vendedores com alta performance (>120%)
        const vendedoresDestaque = vendedores.filter((v: any) => v.percentualMeta > 120);
        
        if (vendedoresDestaque.length > 0) {
          notifications.push({
            id: `sales-high-performance-${Date.now()}`,
            type: 'success',
            title: '🌟 Vendedores de Destaque',
            message: `${vendedoresDestaque.length} vendedores superaram a meta em 20%+`,
            category: 'sales',
            priority: 'medium',
            actionLabel: 'Ver Ranking',
            actionUrl: '/vendedores',
            data: { count: vendedoresDestaque.length, vendedores: vendedoresDestaque.slice(0, 3) },
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados de vendedores:', error);
    }

    // 3. Verificar recomendações e insights
    try {
      const recommendationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/recommendations`, {
        headers: request.headers
      });
      
      if (recommendationsResponse.ok) {
        const recommendations = await recommendationsResponse.json();
        
        if (recommendations.insights?.length > 0) {
          const newInsights = recommendations.insights.filter((insight: any) => 
            insight.confidence > 0.8
          );
          
          if (newInsights.length > 0) {
            notifications.push({
              id: `new-insights-${Date.now()}`,
              type: 'ai-insight',
              title: '🧠 Novos Insights Disponíveis',
              message: `${newInsights.length} novos insights com alta confiança identificados`,
              category: 'recommendations',
              priority: 'medium',
              actionLabel: 'Ver Insights',
              actionUrl: '/ia/recommendations',
              data: { count: newInsights.length, insights: newInsights.slice(0, 2) },
              timestamp: new Date()
            });
          }
        }
        
        if (recommendations.topRecommendations?.length > 0) {
          const highValueRecommendations = recommendations.topRecommendations.filter((rec: any) => 
            rec.potentialValue > 1000
          );
          
          if (highValueRecommendations.length > 0) {
            notifications.push({
              id: `high-value-recommendations-${Date.now()}`,
              type: 'success',
              title: '💰 Oportunidades de Alto Valor',
              message: `${highValueRecommendations.length} recomendações com potencial >R$ 1.000`,
              category: 'recommendations',
              priority: 'high',
              actionLabel: 'Ver Oportunidades',
              actionUrl: '/ia/recommendations',
              data: { count: highValueRecommendations.length },
              timestamp: new Date()
            });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar recomendações:', error);
    }

    // 4. Verificar status do sistema de IA
    try {
      const systemStatusResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/system-status`, {
        headers: request.headers
      });
      
      if (systemStatusResponse.ok) {
        const systemStatus = await systemStatusResponse.json();
        
        // Converter alertas do sistema em notificações
        if (systemStatus.alertas?.length > 0) {
          systemStatus.alertas.forEach((alerta: any, index: number) => {
            const notificationType = alerta.tipo === 'error' ? 'error' : 
                                   alerta.tipo === 'warning' ? 'warning' : 'info';
            
            notifications.push({
              id: `system-alert-${Date.now()}-${index}`,
              type: notificationType,
              title: '🔧 Alerta do Sistema',
              message: alerta.mensagem,
              category: 'system',
              priority: alerta.tipo === 'error' ? 'high' : 'medium',
              actionLabel: 'Ver Status',
              actionUrl: '/ia',
              timestamp: new Date()
            });
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar status do sistema:', error);
    }

    // 5. Verificar clientes inativos (usando dados reais do banco)
    try {
      const clientesInativos = await prisma.cliente.findMany({
        include: {
          notasFiscais: {
            select: {
              dataEmissao: true
            },
            orderBy: {
              dataEmissao: 'desc'
            },
            take: 1
          }
        }
      });

      const clientesSemComprasRecentes = clientesInativos.filter(cliente => {
        if (!cliente.notasFiscais || cliente.notasFiscais.length === 0) return true;
        
        const ultimaCompra = new Date(cliente.notasFiscais[0].dataEmissao);
        const diasSemComprar = (Date.now() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24);
        
        return diasSemComprar > 90; // Mais de 90 dias sem comprar
      });

      if (clientesSemComprasRecentes.length > 0) {
        notifications.push({
          id: `inactive-customers-${Date.now()}`,
          type: 'warning',
          title: '😴 Clientes Inativos Detectados',
          message: `${clientesSemComprasRecentes.length} clientes sem compras há mais de 90 dias`,
          category: 'churn',
          priority: 'medium',
          actionLabel: 'Reativar Clientes',
          actionUrl: '/clientes',
          data: { count: clientesSemComprasRecentes.length },
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Erro ao verificar clientes inativos:', error);
    }

    // 6. Verificar alertas de recompra do banco de dados
    try {
      const alertsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/alerts`, {
        headers: request.headers
      });
      
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        
        if (alertsData.alerts?.length > 0) {
          // Adicionar alertas de recompra às notificações
          alertsData.alerts.forEach((alert: any) => {
            notifications.push({
              id: alert.id,
              type: alert.type,
              title: alert.title,
              message: alert.message,
              category: alert.category,
              priority: alert.priority,
              actionLabel: alert.actionLabel,
              actionUrl: alert.actionUrl,
              data: alert.data,
              timestamp: new Date(alert.timestamp)
            });
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar alertas de recompra:', error);
    }

    // Ordenar por prioridade e timestamp
    const sortedNotifications = notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return NextResponse.json({
      notifications: sortedNotifications,
      total: sortedNotifications.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', notifications: [], total: 0 },
      { status: 500 }
    );
  }
}