import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../../../lib/permissions';
import { PrismaClient } from '@prisma/client';
import { deriveScopeFromRequest, applyHierarchicalFilialScope } from '../../../../../../lib/scope';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('VIEW_ALL_CLIENTS')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 403 }
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
    // Buscar notas fiscais via Prisma aplicando escopo hierárquico e cliente
    const prisma = new PrismaClient();
    const scope = deriveScopeFromRequest(req);

    const clienteIdNum = parseInt(clienteId);
    let whereClause: any = { clienteId: clienteIdNum };
    whereClause = applyHierarchicalFilialScope(whereClause, scope, { filialKey: 'filialId' });

    const notas = await prisma.notasFiscalCabecalho.findMany({
      where: whereClause,
      select: {
        id: true,
        numeroNota: true,
        clienteId: true,
        dataEmissao: true,
        valorTotal: true,
        filialId: true
      },
      orderBy: { dataEmissao: 'desc' }
    });

    const pedidos = notas.map(n => ({
      id: n.id,
      numeroNota: n.numeroNota,
      clienteId: n.clienteId,
      dataEmissao: n.dataEmissao,
      valorTotal: parseFloat(n.valorTotal.toString()),
      filialId: n.filialId
    }));
    
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
    const valorTotal = pedidos.reduce((sum, pedido) => sum + (typeof pedido.valorTotal === 'number' ? pedido.valorTotal : parseFloat(pedido.valorTotal || '0')), 0);
    const ticketMedio = valorTotal / totalPedidos;
    const ultimaCompra = pedidos.reduce((latest, pedido) => {
      const dataAtual = new Date(pedido.dataEmissao);
      const dataLatest = new Date(latest.dataEmissao);
      return dataAtual > dataLatest ? pedido : latest;
    }, pedidos[0]);
    
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