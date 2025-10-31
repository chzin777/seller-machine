import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deriveScopeFromRequest, applyHierarchicalFilialScope } from '../../../../../lib/scope';
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

    // Buscar dados via Prisma com escopo hierárquico; fallback para APIs externas
    let totalClientes = 0;
    let clientesAtivos = 0;
    let clientesInativos = 0;
    let vendas30Dias = 0;
    let ticketMedio = 0;
    let topProdutos: Array<{ nome: string; vendas: number }> = [];

    const prisma = new PrismaClient();
    const scope = deriveScopeFromRequest(request);
    try {
      let whereClause: any = {};
      whereClause = applyHierarchicalFilialScope(whereClause, scope, { filialKey: 'filialId' });
      if (filialId) {
        whereClause.filialId = parseInt(filialId);
      }
      // Vendedor só vê seus próprios dados
      if (scope.role === 'VENDEDOR' && scope.userId) {
        whereClause.vendedorId = scope.userId;
      }

      const notas = await prisma.notasFiscalCabecalho.findMany({
        where: whereClause,
        select: {
          clienteId: true,
          valorTotal: true,
          dataEmissao: true,
          itens: { select: { Quantidade: true, produto: { select: { descricao: true } } } }
        },
        take: 2000
      });

      if (Array.isArray(notas) && notas.length > 0) {
        // Calcular clientes
        const uniqueClienteIds = Array.from(new Set(notas.map((n: any) => n.clienteId).filter((id: number | null) => id)));
        totalClientes = uniqueClienteIds.length;
        const dataLimite90 = new Date();
        dataLimite90.setDate(dataLimite90.getDate() - 90);
        const clientesRecentesSet = new Set(
          notas
            .filter((nota: any) => new Date(nota.dataEmissao) >= dataLimite90)
            .map((n: any) => n.clienteId)
            .filter((id: number | null) => id)
        );
        clientesAtivos = clientesRecentesSet.size;
        clientesInativos = Math.max(0, totalClientes - clientesAtivos);

        // Vendas últimos 30 dias
        const dataLimite30 = new Date();
        dataLimite30.setDate(dataLimite30.getDate() - 30);
        const notasRecentes = notas.filter((nota: any) => new Date(nota.dataEmissao) >= dataLimite30);
        vendas30Dias = notasRecentes.reduce((acc: number, nota: any) => acc + (parseFloat(nota.valorTotal?.toString() || '0') || 0) / 100, 0);
        ticketMedio = totalClientes > 0 ? vendas30Dias / totalClientes : 0;

        // Top produtos
        const produtoVendas = new Map<string, number>();
        notas.forEach((nota: any) => {
          (nota.itens || []).forEach((item: any) => {
            const nome = item.produto?.descricao || 'Produto sem nome';
            const quantidade = parseFloat(item.Quantidade?.toString() || '0');
            produtoVendas.set(nome, (produtoVendas.get(nome) || 0) + quantidade);
          });
        });
        topProdutos = Array.from(produtoVendas.entries())
          .map(([nome, vendas]) => ({ nome, vendas }))
          .sort((a, b) => (b.vendas as number) - (a.vendas as number))
          .slice(0, 5);
      }
    } catch (error) {
      console.warn('Erro ao buscar dados via Prisma para dashboard-summary:', error);
    } finally {
      await prisma.$disconnect();
    }

    // Fallback externo se Prisma não retornou dados
    if (totalClientes === 0) {
      try {
        const clientesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes`);
        if (clientesResponse.ok) {
          const clientes = await clientesResponse.json();
          totalClientes = clientes.length;
          clientesAtivos = clientes.filter((c: any) => c.ativo !== false).length;
          clientesInativos = totalClientes - clientesAtivos;
        }
      } catch (error) {
        console.warn('Erro ao buscar clientes:', error);
      }
    }

    if (vendas30Dias === 0) {
      try {
        const notasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notas-fiscais`);
        if (notasResponse.ok) {
          const notas = await notasResponse.json();

          // Calcular vendas dos últimos 30 dias
          const dataLimite = new Date();
          dataLimite.setDate(dataLimite.getDate() - 30);

          const notasRecentes = notas.filter((nota: any) => {
            const dataNota = new Date(nota.dataEmissao || nota.data);
            return dataNota >= dataLimite;
          });

          vendas30Dias = notasRecentes.reduce((acc: number, nota: any) => acc + (parseFloat(nota.valorTotal) || 0) / 100, 0);
          ticketMedio = totalClientes > 0 ? vendas30Dias / totalClientes : 0;

          const produtoVendas = new Map<string, number>();
          notas.forEach((nota: any) => {
            const itens = nota.itens || [];
            itens.forEach((item: any) => {
              const nome = item.produto?.nome || item.descricao || 'Produto';
              const quantidade = item.quantidade || 1;
              produtoVendas.set(nome, (produtoVendas.get(nome) || 0) + quantidade);
            });
          });
          topProdutos = Array.from(produtoVendas.entries())
            .map(([nome, vendas]) => ({ nome, vendas }))
            .sort((a, b) => (b.vendas as number) - (a.vendas as number))
            .slice(0, 5);
        }
      } catch (error) {
        console.warn('Erro ao buscar notas fiscais:', error);
      }
    }

    const dashboardSummary = {
      totalClientes,
      clientesAtivos,
      clientesInativos,
      vendas30Dias,
      ticketMedio: Math.round(ticketMedio * 100) / 100,
      topProdutos,
      modelosIA: {
        churnPrediction: {
          status: 'Ativo',
          descricao: 'Análise de risco de churn em tempo real'
        },
        salesPrediction: {
          status: 'Ativo',
          descricao: 'Previsões de vendas baseadas em histórico'
        },
        rfvOptimization: {
          status: 'Ativo',
          descricao: 'Otimização RFV para segmentação de clientes'
        }
      },
      proximasFeatures: [
        'Análise de sentimento de clientes',
        'Previsão de demanda por produto',
        'Otimização de preços dinâmica'
      ]
    };

    return NextResponse.json(dashboardSummary);
  } catch (error) {
    console.error('Erro no dashboard summary:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}