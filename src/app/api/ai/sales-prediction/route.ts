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
    const meses = parseInt(searchParams.get('meses') || '6');

    // Buscar dados históricos de vendas escopados
    let vendas: any[] = [];

    const prisma = new PrismaClient();
    const scope = deriveScopeFromRequest(request);
    try {
      let whereClause: any = {};
      whereClause = applyBasicScopeToWhere(whereClause, scope, { filialKey: 'filialId' });
      if (filialId) {
        whereClause.filialId = parseInt(filialId);
      }

      const notas = await prisma.notasFiscalCabecalho.findMany({
        where: whereClause,
        select: { valorTotal: true, dataEmissao: true },
        take: 5000
      });
      vendas = notas.map((n: any) => ({
        dataEmissao: n.dataEmissao,
        valorTotal: (parseFloat(n.valorTotal?.toString() || '0') || 0) / 100
      }));
    } catch (error) {
      console.warn('Erro ao buscar vendas via Prisma:', error);
    } finally {
      await prisma.$disconnect();
    }

    // Fallback
    if (!Array.isArray(vendas) || vendas.length === 0) {
      try {
        const notasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notas-fiscais`);
        if (notasResponse.ok) {
          vendas = await notasResponse.json();
        }
      } catch (error) {
        console.warn('Erro ao buscar notas fiscais:', error);
      }
    }

    // Gerar previsões baseadas nos dados históricos
    const previsoes = [];
    const dataAtual = new Date();
    
    for (let i = 1; i <= meses; i++) {
      const dataPrevisao = new Date(dataAtual);
      dataPrevisao.setMonth(dataPrevisao.getMonth() + i);
      
      // Calcular média histórica para o mesmo mês
      const mesPrevisao = dataPrevisao.getMonth();
      const vendasMesHistorico = vendas.filter((venda: any) => {
        const dataVenda = new Date(venda.dataEmissao || venda.data);
        return dataVenda.getMonth() === mesPrevisao;
      });
      
      const mediaHistorica = vendasMesHistorico.length > 0 
        ? vendasMesHistorico.reduce((total: number, venda: any) => total + (parseFloat(venda.valorTotal) || 0), 0) / vendasMesHistorico.length
        : 50000; // Valor padrão
      
      // Aplicar variação sazonal simulada
      const variacaoSazonal = 1 + (Math.sin((mesPrevisao / 12) * Math.PI * 2) * 0.1);
      const previsao = mediaHistorica * variacaoSazonal;
      
      // Calcular intervalo de confiança (simulado)
      const confianca = Math.max(0.6, Math.min(0.95, 0.8 + (Math.random() - 0.5) * 0.2));
      const intervaloInferior = previsao * (1 - (1 - confianca) * 0.5);
      const intervaloSuperior = previsao * (1 + (1 - confianca) * 0.5);
      
      previsoes.push({
        mes: dataPrevisao.toLocaleString('pt-BR', { month: 'long' }),
        valorPrevisto: Math.round(previsao),
        confianca: Math.round(confianca * 100) / 100,
        intervalo: {
          inferior: Math.round(intervaloInferior),
          superior: Math.round(intervaloSuperior)
        }
      });
    }

    return NextResponse.json({ previsoes });
  } catch (error) {
    console.error('Erro na previsão de vendas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}