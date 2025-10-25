import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../lib/permissions';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('VIEW_CLIENTS')(request);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: authResult.status || 401 }
    );
  }

  const { id: clienteId } = await params;
  
  console.log('=== DEBUG HISTÓRICO ===');
  console.log('Cliente ID recebido:', clienteId);
  console.log('Cliente ID como número:', parseInt(clienteId));

  if (!clienteId) {
    return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 });
  }

  try {
    // Buscar todas as notas fiscais (a API externa não suporta filtro efetivo)
    const notasEndpoint = `/api/notas-fiscais`;
    
    console.log('🔍 Buscando todas as notas fiscais para filtrar localmente');
    console.log('📡 Endpoint:', notasEndpoint);
    
    const notasResponse = await fetch(`${req.nextUrl.origin}/api/proxy?url=${encodeURIComponent(notasEndpoint)}`);
    
    if (!notasResponse.ok) {
      const errorText = await notasResponse.text();
      return NextResponse.json({
        error: `Erro ao buscar notas fiscais`,
        details: {
          status: notasResponse.status,
          statusText: notasResponse.statusText,
          endpoint: notasEndpoint,
          errorMessage: errorText
        }
      }, { status: notasResponse.status });
    }
    
    const notasData = await notasResponse.json();
    
    // Debug: verificar o que está sendo retornado
    console.log('📊 Resposta da API:', {
      isArray: Array.isArray(notasData),
      totalItems: Array.isArray(notasData) ? notasData.length : (notasData.data ? notasData.data.length : 'N/A'),
      hasData: !!notasData.data,
      firstItemClienteId: Array.isArray(notasData) && notasData.length > 0 ? notasData[0].clienteId : 'N/A'
    });
    
    // Extrair o array de notas da resposta
    let todasNotas = Array.isArray(notasData) ? notasData : (notasData.data || []);
    
    console.log('📋 Total de notas antes do filtro:', todasNotas.length);
    
    // Filtrar notas do cliente específico
    const clienteIdNum = parseInt(clienteId);
    let notasCliente = todasNotas.filter((nota: any) => {
      return nota.clienteId === clienteIdNum || 
             nota.cliente_id === clienteIdNum || 
             nota.customer_id === clienteIdNum || 
             nota.id_cliente === clienteIdNum;
    });
    
    console.log('🎯 Notas encontradas para o cliente', clienteId + ':', notasCliente.length);
    
    console.log('✅ Notas fiscais recebidas já filtradas:', {
      clienteId,
      totalNotas: notasCliente.length,
      primeiraNotaId: notasCliente[0]?.id,
      primeiraNotaClienteId: notasCliente[0]?.clienteId
    });
    
    if (!Array.isArray(notasCliente)) {
      return NextResponse.json({
        error: 'Formato de resposta inválido da API',
        details: {
          endpoint: notasEndpoint,
          responseType: typeof notasData,
          response: notasData
        }
      }, { status: 500 });
    }
    
    // Usar as notas fiscais como "pedidos"
    const pedidos = notasCliente;
    
    // Se não há pedidos, retornar array vazio
    if (!Array.isArray(pedidos) || pedidos.length === 0) {
      return NextResponse.json({
        pedidos: [],
        resumo: {
          totalPedidos: 0,
          valorTotal: 0,
          ticketMedio: 0,
          ultimaCompra: null
        }
      });
    }
    
    // Calcular resumo
    const totalPedidos = pedidos.length;
    const valorTotal = pedidos.reduce((sum, pedido) => sum + parseFloat(pedido.valorTotal || '0'), 0);
    const ticketMedio = valorTotal / totalPedidos;
    const ultimaCompra = pedidos.reduce((latest, pedido) => {
      const dataAtual = new Date(pedido.dataEmissao);
      const dataLatest = latest ? new Date(latest.dataEmissao) : new Date(0);
      return dataAtual > dataLatest ? pedido : latest;
    }, null);
    
    // Ordenar pedidos por data (mais recente primeiro)
    const pedidosOrdenados = pedidos.sort((a, b) => 
      new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime()
    );
    
    return NextResponse.json({
      pedidos: pedidosOrdenados,
      resumo: {
        totalPedidos,
        valorTotal,
        ticketMedio,
        ultimaCompra: ultimaCompra?.dataEmissao || null
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar histórico do cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}