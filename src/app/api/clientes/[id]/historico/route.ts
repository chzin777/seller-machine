import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: clienteId } = await params;
  
  console.log('=== DEBUG HISTÓRICO ===');
  console.log('Cliente ID recebido:', clienteId);
  console.log('Cliente ID como número:', parseInt(clienteId));

  if (!clienteId) {
    return NextResponse.json({ error: 'ID do cliente é obrigatório' }, { status: 400 });
  }

  try {
    // Buscar notas fiscais do cliente usando os endpoints disponíveis na API
    // Endpoints disponíveis: /api/notas-fiscais e /api/notas-fiscais-itens
    const notasEndpoint = `/api/notas-fiscais`;
    
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
    console.log('Resposta da API notas-fiscais:', JSON.stringify(notasData, null, 2));
    
    // Filtrar notas fiscais do cliente específico
    let todasNotas = Array.isArray(notasData) ? notasData : (notasData.data || []);
    const notasCliente = todasNotas.filter((nota: any) => 
      nota.clienteId === parseInt(clienteId) || 
      nota.cliente_id === parseInt(clienteId) || 
      nota.customer_id === parseInt(clienteId) ||
      nota.id_cliente === parseInt(clienteId)
    );
    
    console.log(`Notas fiscais encontradas para cliente ${clienteId}:`, notasCliente.length);
    
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