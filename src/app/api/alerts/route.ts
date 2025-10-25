import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../lib/permissions';
import { createServerClient } from '../../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  // 🚨 Verificar permissão para ver alertas do sistema
  const authCheck = requirePermission('ACCESS_AI_INSIGHTS')(request);
  if (!authCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Acesso negado', 
        message: authCheck.error,
        alerts: [], 
        total: 0 
      }, 
      { status: 403 }
    );
  }
  try {
    const supabase = createServerClient();
    
    // Buscar alertas de recompra ativos
    const { data: alertasRecompra, error: alertasError } = await supabase
      .from('sales_alerts')
      .select(`
        *,
        customer:customers(id, name, email),
        product:products(id, name, category)
      `)
      .eq('alert_type', 'recompra')
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(20);

    if (alertasError) {
      console.error('Erro ao buscar alertas de recompra:', alertasError);
      return NextResponse.json({ alerts: [], total: 0 });
    }

    // Transformar em formato de notificação
    const notifications = (alertasRecompra || []).map((alerta: any) => ({
      id: `recompra-alert-${alerta.id}`,
      type: 'info',
      title: '🔄 Oportunidade de Recompra',
      message: `${alerta.customer?.name || 'Cliente'} pode estar no momento ideal para recompra de ${alerta.product?.name || 'produto'}`,
      category: 'recommendations',
      priority: 'medium',
      actionLabel: 'Ver Cliente',
      actionUrl: `/clientes/${alerta.customer_id}`,
      timestamp: new Date(alerta.created_at),
      data: {
        customerId: alerta.customer_id,
        productId: alerta.product_id,
        alertId: alerta.id
      }
    }));

    return NextResponse.json({
      alerts: notifications,
      total: notifications.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar alertas de recompra:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', alerts: [], total: 0 },
      { status: 500 }
    );
  }
}