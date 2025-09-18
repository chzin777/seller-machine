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

    // Calculate summary metrics
    const totalVendedores = vendedores.length;
    const vendedoresAtivos = vendedores.filter(v => {
      // Consider active if had sales in last 30 days
      const ultimaVenda = new Date(v.ultimaVenda);
      const hoje = new Date();
      const diasSemVenda = Math.floor((hoje.getTime() - ultimaVenda.getTime()) / (1000 * 60 * 60 * 24));
      return diasSemVenda <= 30;
    }).length;
    
    const totalReceita = vendedores.reduce((acc, v) => acc + (v.receita || 0), 0);
    const totalMeta = vendedores.reduce((acc, v) => acc + (v.meta || 0), 0);
    const percentualMetaGeral = totalMeta > 0 ? (totalReceita / totalMeta) * 100 : 0;
    
    // Performance categories
    const excelentes = vendedores.filter(v => (v.percentualMeta || 0) >= 120).length;
    const bons = vendedores.filter(v => (v.percentualMeta || 0) >= 100 && (v.percentualMeta || 0) < 120).length;
    const regulares = vendedores.filter(v => (v.percentualMeta || 0) >= 80 && (v.percentualMeta || 0) < 100).length;
    const abaixoEsperado = vendedores.filter(v => (v.percentualMeta || 0) < 80).length;
    
    // Top and bottom performers
    const sortedByPerformance = [...vendedores].sort((a, b) => (b.percentualMeta || 0) - (a.percentualMeta || 0));
    const melhorVendedor = sortedByPerformance[0];
    const vendedorMelhorias = sortedByPerformance[sortedByPerformance.length - 1];
    
    // Growth analysis
    const crescimentoMedio = vendedores.reduce((acc, v) => acc + (v.crescimento || 0), 0) / totalVendedores;
    const vendedoresEmCrescimento = vendedores.filter(v => (v.crescimento || 0) > 0).length;
    
    const resumo = {
      visaoGeral: {
        totalVendedores,
        vendedoresAtivos,
        percentualAtivos: totalVendedores > 0 ? (vendedoresAtivos / totalVendedores) * 100 : 0,
        totalReceita,
        totalMeta,
        percentualMetaGeral
      },
      distribuicaoPerformance: {
        excelentes: { quantidade: excelentes, percentual: totalVendedores > 0 ? (excelentes / totalVendedores) * 100 : 0 },
        bons: { quantidade: bons, percentual: totalVendedores > 0 ? (bons / totalVendedores) * 100 : 0 },
        regulares: { quantidade: regulares, percentual: totalVendedores > 0 ? (regulares / totalVendedores) * 100 : 0 },
        abaixoEsperado: { quantidade: abaixoEsperado, percentual: totalVendedores > 0 ? (abaixoEsperado / totalVendedores) * 100 : 0 }
      },
      destaques: {
        melhorVendedor: melhorVendedor ? {
          id: melhorVendedor.id,
          nome: melhorVendedor.nome,
          receita: melhorVendedor.receita,
          percentualMeta: melhorVendedor.percentualMeta
        } : null,
        vendedorMelhorias: vendedorMelhorias ? {
          id: vendedorMelhorias.id,
          nome: vendedorMelhorias.nome,
          receita: vendedorMelhorias.receita,
          percentualMeta: vendedorMelhorias.percentualMeta
        } : null
      },
      tendencias: {
        crescimentoMedio,
        vendedoresEmCrescimento,
        percentualEmCrescimento: totalVendedores > 0 ? (vendedoresEmCrescimento / totalVendedores) * 100 : 0
      },
      alertas: [
        ...(abaixoEsperado > totalVendedores * 0.3 ? [{
          tipo: 'warning',
          mensagem: `${abaixoEsperado} vendedores (${Math.round((abaixoEsperado / totalVendedores) * 100)}%) estão abaixo de 80% da meta`
        }] : []),
        ...(vendedoresAtivos < totalVendedores * 0.8 ? [{
          tipo: 'info',
          mensagem: `${totalVendedores - vendedoresAtivos} vendedores não tiveram vendas nos últimos 30 dias`
        }] : []),
        ...(crescimentoMedio < 0 ? [{
          tipo: 'error',
          mensagem: `Crescimento médio negativo de ${crescimentoMedio.toFixed(1)}%`
        }] : [])
      ],
      ultimaAtualizacao: new Date().toISOString()
    };

    return NextResponse.json(resumo);
  } catch (error) {
    console.error('Erro ao gerar resumo de vendedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}