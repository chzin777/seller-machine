import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Buscar dados de clientes para calcular métricas de IA
    const clientesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!clientesResponse.ok) {
      throw new Error('Erro ao buscar dados de clientes');
    }

    const clientes = await clientesResponse.json();

    // Simular análise de churn (clientes em risco)
    const clientesEmRisco = Math.floor(clientes.length * 0.12); // 12% dos clientes
    
    // Simular status dos modelos de IA
    const modelos = {
      churn: Math.random() > 0.2, // 80% chance de estar ativo
      sales: Math.random() > 0.15, // 85% chance de estar ativo
      rfv: Math.random() > 0.1 // 90% chance de estar ativo
    };

    // Gerar alertas baseados no status dos modelos
    const alertas = [];
    
    if (!modelos.churn) {
      alertas.push({
        tipo: 'error' as const,
        mensagem: 'Modelo de predição de churn precisa ser retreinado'
      });
    } else if (clientesEmRisco > clientes.length * 0.15) {
      alertas.push({
        tipo: 'warning' as const,
        mensagem: `${clientesEmRisco} clientes com alta probabilidade de churn`
      });
    }

    if (!modelos.sales) {
      alertas.push({
        tipo: 'error' as const,
        mensagem: 'Modelo de predição de vendas está inativo'
      });
    } else {
      alertas.push({
        tipo: 'info' as const,
        mensagem: 'Novo algoritmo de predição de vendas disponível'
      });
    }

    if (!modelos.rfv) {
      alertas.push({
        tipo: 'warning' as const,
        mensagem: 'Sistema de segmentação RFV precisa de atualização'
      });
    } else {
      alertas.push({
        tipo: 'info' as const,
        mensagem: 'Novo segmento de clientes identificado'
      });
    }

    // Calcular número de segmentos RFV
    const segmentosRFV = Math.floor(Math.random() * 3) + 3; // Entre 3 e 5 segmentos

    const systemStatus = {
      alertas,
      recomendacoes: {
        status: modelos.churn && modelos.sales ? 
          `Sistema ativo - ${Math.floor(Math.random() * 8) + 3} recomendações disponíveis` :
          'Sistema com limitações - Alguns modelos inativos'
      },
      churnPrediction: {
        status: modelos.churn ? 
          `Modelo atualizado - ${clientesEmRisco} clientes em risco` :
          'Modelo inativo - Retreinamento necessário'
      },
      salesPrediction: {
        status: modelos.sales ? 
          `Previsão otimista - Crescimento de ${Math.floor(Math.random() * 10) + 5}%` :
          'Modelo inativo - Predições indisponíveis'
      },
      rfvOptimization: {
        status: modelos.rfv ? 
          `Segmentação ativa - ${segmentosRFV} grupos identificados` :
          'Sistema inativo - Segmentação manual necessária'
      }
    };

    return NextResponse.json(systemStatus);
  } catch (error) {
    console.error('Erro ao buscar status do sistema de IA:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}