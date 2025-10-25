import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';
import { requirePermission } from '../../../../../lib/permissions';

export async function GET(request: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('VIEW_AI_DASHBOARD')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');

    if (!clienteId) {
      return NextResponse.json(
        { error: 'Cliente ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar dados do cliente e histórico com escopo hierárquico via Prisma
    let cliente: any = null;
    let pedidos: any[] = [];

    const prisma = new PrismaClient();
    const scope = deriveScopeFromRequest(req);
    try {
      let whereClause: any = {};
      whereClause = applyBasicScopeToWhere(whereClause, scope, { filialKey: 'filialId' });
      whereClause.clienteId = parseInt(clienteId);

      const notas = await prisma.notasFiscalCabecalho.findMany({
        where: whereClause,
        select: {
          clienteId: true,
          dataEmissao: true,
          valorTotal: true,
          itens: { select: { Quantidade: true, produto: { select: { id: true, descricao: true, tipo: true, preco: true } } } }
        },
        take: 3000
      });

      if (Array.isArray(notas) && notas.length > 0) {
        // Montar pedidos a partir das notas fiscais
        pedidos = notas.map((nota: any) => ({
          data: nota.dataEmissao,
          valor: (parseFloat(nota.valorTotal?.toString() || '0') || 0) / 100,
          itens: (nota.itens || []).map((item: any) => ({
            id: item.produto?.id,
            nome: item.produto?.descricao,
            categoria: item.produto?.tipo || 'Geral',
            quantidade: parseFloat(item.Quantidade?.toString() || '1')
          }))
        }));

        // Buscar informações básicas do cliente
        cliente = await prisma.cliente.findUnique({
          where: { id: parseInt(clienteId) },
          select: { nome: true }
        });
      }
    } catch (error) {
      console.warn('Erro ao buscar dados via Prisma para customer-insights:', error);
    } finally {
      await prisma.$disconnect();
    }

    // Fallback: Buscar dados do cliente se não encontrado via Prisma
    if (!cliente) {
      try {
        const clienteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes/${clienteId}`);
        if (clienteResponse.ok) {
          cliente = await clienteResponse.json();
        }
      } catch (error) {
        console.warn('Erro ao buscar dados do cliente:', error);
      }
    }

    // Fallback: Buscar histórico de pedidos do cliente se não encontrado via Prisma
    if (pedidos.length === 0) {
      try {
        const pedidosResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pedidos?clienteId=${clienteId}`);
        if (pedidosResponse.ok) {
          pedidos = await pedidosResponse.json();
        }
      } catch (error) {
        console.warn('Erro ao buscar pedidos do cliente:', error);
      }
    }

    // Calcular métricas do cliente
    const totalPedidos = pedidos.length;
    const valorTotal = pedidos.reduce((acc: number, pedido: any) => acc + (pedido.valor || 0), 0);
    const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0;
    
    // Calcular frequência de compras (pedidos por mês)
    const hoje = new Date();
    const pedidosUltimos12Meses = pedidos.filter((pedido: any) => {
      if (!pedido.data) return false;
      const dataPedido = new Date(pedido.data);
      const mesesAtras = (hoje.getTime() - dataPedido.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return mesesAtras <= 12;
    });
    const frequenciaCompras = pedidosUltimos12Meses.length;

    // Determinar segmento baseado no valor total e frequência
    let segmento = 'Ocasional';
    if (valorTotal > 10000 && frequenciaCompras > 6) {
      segmento = 'Premium';
    } else if (valorTotal > 3000 || frequenciaCompras > 3) {
      segmento = 'Regular';
    }

    // Calcular tendência baseada nos últimos pedidos
    let tendencia = 'Estável';
    if (pedidos.length >= 3) {
      const ultimosPedidos = pedidos.slice(-3);
      const valoresUltimosPedidos = ultimosPedidos.map((p: any) => p.valor || 0);
      const primeiroValor = valoresUltimosPedidos[0];
      const ultimoValor = valoresUltimosPedidos[valoresUltimosPedidos.length - 1];
      
      if (ultimoValor > primeiroValor * 1.2) {
        tendencia = 'Crescente';
      } else if (ultimoValor < primeiroValor * 0.8) {
        tendencia = 'Decrescente';
      }
    }

    // Estimar próxima compra baseada na frequência
    let proximaCompra = 'Não determinado';
    if (pedidos.length > 1) {
      // Calcular intervalo médio entre compras
      const intervalos = [];
      for (let i = 1; i < pedidos.length; i++) {
        const dataAnterior = new Date(pedidos[i-1].data || Date.now());
        const dataAtual = new Date(pedidos[i].data || Date.now());
        const intervalo = Math.abs(dataAtual.getTime() - dataAnterior.getTime()) / (1000 * 60 * 60 * 24);
        intervalos.push(intervalo);
      }
      
      const intervaloMedio = intervalos.reduce((acc, int) => acc + int, 0) / intervalos.length;
      const ultimoPedido = new Date(pedidos[pedidos.length - 1].data || Date.now());
      const proximaData = new Date(ultimoPedido.getTime() + (intervaloMedio * 24 * 60 * 60 * 1000));
      proximaCompra = proximaData.toLocaleDateString('pt-BR');
    }

    // Identificar produtos favoritos baseado no histórico
    const produtoCount = new Map();
    pedidos.forEach((pedido: any) => {
      if (pedido.itens) {
        pedido.itens.forEach((item: any) => {
          const nome = item.nome || item.descricao || `Produto ${item.id}`;
          produtoCount.set(nome, (produtoCount.get(nome) || 0) + (item.quantidade || 1));
        });
      }
    });

    const produtosFavoritos = Array.from(produtoCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([nome]) => nome);

    // Calcular valor de vida do cliente (LTV)
    const mesesComoCliente = pedidos.length > 0 ? 
      Math.max(1, (hoje.getTime() - new Date(pedidos[0].data || Date.now()).getTime()) / (1000 * 60 * 60 * 24 * 30)) : 1;
    const valorVida = valorTotal + (ticketMedio * frequenciaCompras * (mesesComoCliente / 12));

    const insight = {
      clienteId: parseInt(clienteId),
      nome: cliente?.nome || `Cliente ${clienteId}`,
      segmento,
      valorVida: Math.round(valorVida * 100) / 100,
      frequenciaCompras,
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      tendencia,
      proximaCompra,
      produtosFavoritos: produtosFavoritos.length > 0 ? produtosFavoritos : ['Nenhum produto identificado']
    };

    return NextResponse.json(insight);

  } catch (error) {
    console.error('Erro ao gerar insights do cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}