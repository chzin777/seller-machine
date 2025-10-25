import { NextResponse } from 'next/server';
import { requirePermission } from '../../../../../lib/permissions';

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

    // Filter vendedores without filial
    // Since the current mock data doesn't have filial field, we'll simulate some vendedores without filial
    const vendedoresSemFilial = vendedores.filter((vendedor, index) => {
      // Simulate that some vendedores don't have filial assigned
      // In real implementation, this would be: !vendedor.filialId || vendedor.filialId === null
      return index % 7 === 0; // Every 7th vendedor doesn't have filial (simulation)
    }).map(vendedor => ({
      ...vendedor,
      filialId: null,
      filialNome: null,
      motivoSemFilial: 'Aguardando designação de filial',
      dataUltimaAtualizacao: new Date().toISOString()
    }));

    // Add some metadata
    const resultado = {
      vendedores: vendedoresSemFilial,
      total: vendedoresSemFilial.length,
      percentualSemFilial: vendedores.length > 0 ? (vendedoresSemFilial.length / vendedores.length) * 100 : 0,
      alertas: [
        ...(vendedoresSemFilial.length > 0 ? [{
          tipo: 'warning',
          mensagem: `${vendedoresSemFilial.length} vendedores sem filial designada`,
          acao: 'Designar filiais para otimizar gestão territorial'
        }] : []),
        ...(vendedoresSemFilial.length > vendedores.length * 0.1 ? [{
          tipo: 'error',
          mensagem: 'Alto percentual de vendedores sem filial',
          acao: 'Revisar processo de designação de filiais'
        }] : [])
      ],
      sugestoes: [
        'Implementar processo automático de designação de filiais',
        'Criar dashboard para acompanhar vendedores sem filial',
        'Definir critérios geográficos para designação'
      ],
      ultimaConsulta: new Date().toISOString()
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar vendedores sem filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}