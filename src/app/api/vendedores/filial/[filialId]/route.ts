import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    filialId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { filialId } = await params;
    
    // Validate filialId
    if (!filialId) {
      return NextResponse.json(
        { error: 'ID da filial é obrigatório' },
        { status: 400 }
      );
    }
    
    // Fetch vendedores data from the main endpoint
    const vendedoresResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vendedores`);
    
    if (!vendedoresResponse.ok) {
      throw new Error('Erro ao buscar dados de vendedores');
    }
    
    const vendedores = await vendedoresResponse.json();
    
    if (!Array.isArray(vendedores)) {
      throw new Error('Dados de vendedores inválidos');
    }

    // Since mock data doesn't have filialId, we'll simulate filial assignment
    // Distribute vendedores across different filiais
    const filiaisSimuladas = {
      '1': { nome: 'Filial Centro', cidade: 'São Paulo', regiao: 'Centro' },
      '2': { nome: 'Filial Norte', cidade: 'São Paulo', regiao: 'Norte' },
      '3': { nome: 'Filial Sul', cidade: 'São Paulo', regiao: 'Sul' },
      '4': { nome: 'Filial Oeste', cidade: 'São Paulo', regiao: 'Oeste' },
      '5': { nome: 'Filial Leste', cidade: 'São Paulo', regiao: 'Leste' }
    };
    
    const filialInfo = filiaisSimuladas[filialId as keyof typeof filiaisSimuladas];
    
    if (!filialInfo) {
      return NextResponse.json(
        { 
          error: 'Filial não encontrada',
          filialId: filialId,
          filiaisDisponiveis: Object.keys(filiaisSimuladas)
        },
        { status: 404 }
      );
    }
    
    // Assign vendedores to filiais based on their index
    const vendedoresDaFilial = vendedores
      .map((vendedor, index) => {
        const filialAssignedId = String((index % 5) + 1); // Distribute across 5 filiais
        return {
          ...vendedor,
          filialId: filialAssignedId,
          filialNome: filiaisSimuladas[filialAssignedId as keyof typeof filiaisSimuladas]?.nome,
          filialCidade: filiaisSimuladas[filialAssignedId as keyof typeof filiaisSimuladas]?.cidade,
          filialRegiao: filiaisSimuladas[filialAssignedId as keyof typeof filiaisSimuladas]?.regiao
        };
      })
      .filter(vendedor => vendedor.filialId === filialId);
    
    // Calculate filial statistics
    const totalVendedores = vendedoresDaFilial.length;
    const receitaTotal = vendedoresDaFilial.reduce((acc, v) => acc + (v.receita || 0), 0);
    const volumeTotal = vendedoresDaFilial.reduce((acc, v) => acc + (v.volume || 0), 0);
    const metaTotal = vendedoresDaFilial.reduce((acc, v) => acc + (v.meta || 0), 0);
    const percentualMetaFilial = metaTotal > 0 ? (receitaTotal / metaTotal) * 100 : 0;
    
    // Performance analysis
    const vendedoresAcimaMeta = vendedoresDaFilial.filter(v => (v.percentualMeta || 0) >= 100).length;
    const melhorVendedor = vendedoresDaFilial.reduce((melhor, atual) => 
      (atual.receita || 0) > (melhor.receita || 0) ? atual : melhor
    , vendedoresDaFilial[0]);
    
    const resultado = {
      filial: {
        id: filialId,
        ...filialInfo
      },
      vendedores: vendedoresDaFilial,
      estatisticas: {
        totalVendedores,
        receitaTotal,
        volumeTotal,
        metaTotal,
        percentualMetaFilial,
        receitaMedia: totalVendedores > 0 ? receitaTotal / totalVendedores : 0,
        ticketMedio: volumeTotal > 0 ? receitaTotal / volumeTotal : 0
      },
      performance: {
        vendedoresAcimaMeta,
        percentualAcimaMeta: totalVendedores > 0 ? (vendedoresAcimaMeta / totalVendedores) * 100 : 0,
        melhorVendedor: melhorVendedor ? {
          id: melhorVendedor.id,
          nome: melhorVendedor.nome,
          receita: melhorVendedor.receita,
          percentualMeta: melhorVendedor.percentualMeta
        } : null
      },
      ranking: vendedoresDaFilial
        .sort((a, b) => (b.receita || 0) - (a.receita || 0))
        .map((vendedor, index) => ({
          posicao: index + 1,
          id: vendedor.id,
          nome: vendedor.nome,
          receita: vendedor.receita,
          percentualMeta: vendedor.percentualMeta
        })),
      alertas: [
        ...(percentualMetaFilial < 80 ? [{
          tipo: 'warning',
          mensagem: `Filial com ${percentualMetaFilial.toFixed(1)}% da meta atingida`
        }] : []),
        ...(vendedoresAcimaMeta < totalVendedores * 0.5 ? [{
          tipo: 'info',
          mensagem: `Apenas ${vendedoresAcimaMeta} de ${totalVendedores} vendedores atingiram a meta`
        }] : [])
      ],
      ultimaAtualizacao: new Date().toISOString()
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar vendedores por filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}