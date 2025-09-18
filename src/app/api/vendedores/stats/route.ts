import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch vendedores data from the main endpoint
    const vendedoresResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vendedores`);
    
    if (!vendedoresResponse.ok) {
      throw new Error('Erro ao buscar dados de vendedores');
    }
    
    const vendedores = await vendedoresResponse.json();
    
    if (!Array.isArray(vendedores)) {
      throw new Error('Dados de vendedores inválidos');
    }

    // Calculate statistics
    const totalVendedores = vendedores.length;
    const totalReceita = vendedores.reduce((acc, v) => acc + (v.receita || 0), 0);
    const totalVolume = vendedores.reduce((acc, v) => acc + (v.volume || 0), 0);
    const receitaMedia = totalVendedores > 0 ? totalReceita / totalVendedores : 0;
    const ticketMedioGeral = totalVolume > 0 ? totalReceita / totalVolume : 0;
    
    // Top performers
    const topVendedores = vendedores
      .sort((a, b) => (b.receita || 0) - (a.receita || 0))
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        nome: v.nome,
        receita: v.receita,
        percentualMeta: v.percentualMeta
      }));
    
    // Performance distribution
    const acimaMeta = vendedores.filter(v => (v.percentualMeta || 0) >= 100).length;
    const proximoMeta = vendedores.filter(v => (v.percentualMeta || 0) >= 80 && (v.percentualMeta || 0) < 100).length;
    const abaixoMeta = vendedores.filter(v => (v.percentualMeta || 0) < 80).length;
    
    // Growth trends
    const crescimentoPositivo = vendedores.filter(v => (v.crescimento || 0) > 0).length;
    const crescimentoNegativo = vendedores.filter(v => (v.crescimento || 0) < 0).length;
    const crescimentoEstavel = vendedores.filter(v => (v.crescimento || 0) === 0).length;
    
    const stats = {
      resumo: {
        totalVendedores,
        totalReceita,
        totalVolume,
        receitaMedia,
        ticketMedioGeral
      },
      topPerformers: topVendedores,
      distribuicaoPerformance: {
        acimaMeta,
        proximoMeta,
        abaixoMeta,
        percentualAcimaMeta: totalVendedores > 0 ? (acimaMeta / totalVendedores) * 100 : 0
      },
      tendenciasCrescimento: {
        crescimentoPositivo,
        crescimentoNegativo,
        crescimentoEstavel,
        percentualCrescimento: totalVendedores > 0 ? (crescimentoPositivo / totalVendedores) * 100 : 0
      },
      ultimaAtualizacao: new Date().toISOString()
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro ao calcular estatísticas de vendedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}