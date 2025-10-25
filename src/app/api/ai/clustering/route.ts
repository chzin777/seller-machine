import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';
import { requirePermission } from '../../../../../lib/permissions';

export async function GET(request: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('ACCESS_AI_INSIGHTS')(request);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filialId = searchParams.get('filialId');

    // Buscar dados de clientes e pedidos via Prisma com escopo
    const prisma = new PrismaClient();
    const scope = deriveScopeFromRequest(request);

    let clientes: any[] = [];
    let pedidos: any[] = [];

    try {
      let whereClause: any = {};
      whereClause = applyBasicScopeToWhere(whereClause, scope, { filialKey: 'filialId' });
      if (filialId) {
        whereClause.filialId = parseInt(filialId);
      }

      const notas = await prisma.notasFiscalCabecalho.findMany({
        where: whereClause,
        select: {
          clienteId: true,
          valorTotal: true,
          dataEmissao: true,
          itens: { select: { Quantidade: true, produto: { select: { descricao: true } } } }
        },
        take: 5000
      });

      if (Array.isArray(notas) && notas.length > 0) {
        const uniqueClienteIds = Array.from(new Set(notas.map((n: any) => n.clienteId).filter((id: number | null) => id)));
        clientes = uniqueClienteIds.map((id: number) => ({ id }));
        pedidos = notas.map((nota: any) => ({
          clienteId: nota.clienteId,
          data: nota.dataEmissao,
          valor: (parseFloat(nota.valorTotal?.toString() || '0') || 0) / 100,
          itens: (nota.itens || []).map((item: any) => ({
            produto: { descricao: item.produto?.descricao || 'Produto' },
            quantidade: parseFloat(item.Quantidade?.toString() || '1')
          }))
        }));
      }
    } catch (error) {
      console.warn('Erro ao buscar dados via Prisma para clustering:', error);
    } finally {
      await prisma.$disconnect();
    }

    // Fallback para APIs externas
    if (clientes.length === 0 || pedidos.length === 0) {
      const [clientesResponse, pedidosResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pedidos`)
      ]);

      if (!clientesResponse.ok || !pedidosResponse.ok) {
        throw new Error('Erro ao buscar dados das APIs externas');
      }

      clientes = await clientesResponse.json();
      pedidos = await pedidosResponse.json();
    }

    // Filtrar por filial se especificado (já aplicado no whereClause para Prisma)
    let clientesFiltrados = clientes;
    if (filialId && clientes[0]?.filialId !== undefined) {
      clientesFiltrados = clientes.filter((c: any) => c.filialId === parseInt(filialId));
    }

    // Calcular métricas RFV para cada cliente
    const clientesComRFV = clientesFiltrados.map((cliente: any) => {
      const pedidosCliente = pedidos.filter((p: any) => p.clienteId === cliente.id);
      
      // Recência (dias desde última compra)
      const ultimoPedido = pedidosCliente.reduce((ultimo: any, atual: any) => {
        return new Date(atual.data) > new Date(ultimo?.data || 0) ? atual : ultimo;
      }, pedidosCliente[0]);
      
      const recencia = ultimoPedido ? 
        Math.floor((Date.now() - new Date(ultimoPedido.data).getTime()) / (1000 * 60 * 60 * 24)) : 
        999;
      
      // Frequência (número de pedidos)
      const frequencia = pedidosCliente.length;
      
      // Valor (valor total gasto)
      const valor = pedidosCliente.reduce((acc: number, p: any) => acc + (p.valor || 0), 0);
      
      // Classificar em clusters (simples): Premium, Regular, Ocasionais
      let cluster = 'Regular';
      if (valor > 100000 && frequencia > 12) cluster = 'Premium';
      else if (valor < 20000 || recencia > 180) cluster = 'Occasional';

      return {
        id: cliente.id,
        recencia,
        frequencia,
        valor,
        cluster
      };
    });

    // Estatísticas gerais do clustering
    const totalClientes = clientesComRFV.length;
    const premium = clientesComRFV.filter((c: any) => c.cluster === 'Premium').length;
    const regular = clientesComRFV.filter((c: any) => c.cluster === 'Regular').length;
    const occasional = clientesComRFV.filter((c: any) => c.cluster === 'Occasional').length;

    const inertia = clientesComRFV.reduce((acc: number, c: any) => acc + (c.recencia + c.frequencia + c.valor / 1000), 0) / Math.max(1, totalClientes);

    const clusteringData = {
      clientes: clientesComRFV,
      clusters: {
        Premium: premium,
        Regular: regular,
        Occasional: occasional
      },
      metrics: {
        totalClientes,
        inertia: Math.round(inertia * 100) / 100
      }
    };

    return NextResponse.json(clusteringData);
  } catch (error) {
    console.error('Erro ao processar clustering:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}