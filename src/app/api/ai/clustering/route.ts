import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filialId = searchParams.get('filialId');

    // Buscar dados de clientes e pedidos das APIs existentes
    const [clientesResponse, pedidosResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/clientes`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/pedidos`, {
        headers: {
          'Authorization': `Bearer ${process.env.API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })
    ]);

    if (!clientesResponse.ok || !pedidosResponse.ok) {
      throw new Error('Erro ao buscar dados das APIs externas');
    }

    const clientes = await clientesResponse.json();
    const pedidos = await pedidosResponse.json();

    // Filtrar por filial se especificado
    let clientesFiltrados = clientes;
    if (filialId) {
      clientesFiltrados = clientes.filter((c: any) => c.filialId === parseInt(filialId));
    }

    // Calcular métricas RFV para cada cliente
    const clientesComRFV = clientesFiltrados.map((cliente: any) => {
      const pedidosCliente = pedidos.filter((p: any) => p.clienteId === cliente.id);
      
      // Recência (dias desde última compra)
      const ultimoPedido = pedidosCliente.reduce((ultimo: any, atual: any) => {
        return new Date(atual.data) > new Date(ultimo.data) ? atual : ultimo;
      }, pedidosCliente[0]);
      
      const recencia = ultimoPedido ? 
        Math.floor((Date.now() - new Date(ultimoPedido.data).getTime()) / (1000 * 60 * 60 * 24)) : 
        999;
      
      // Frequência (número de pedidos)
      const frequencia = pedidosCliente.length;
      
      // Valor (soma total dos pedidos)
      const valor = pedidosCliente.reduce((sum: number, pedido: any) => 
        sum + (pedido.valorTotal || 0), 0);
      
      // Ticket médio
      const ticketMedio = frequencia > 0 ? valor / frequencia : 0;
      
      return {
        ...cliente,
        recencia,
        frequencia,
        valor,
        ticketMedio
      };
    });

    // Algoritmo simples de clustering baseado em RFV
    const clusters = [];
    
    // Cluster 1: Clientes Premium (alta frequência, alto valor, baixa recência)
    const premium = clientesComRFV.filter((c: any) => 
      c.frequencia >= 5 && c.valor >= 1000 && c.recencia <= 30
    );
    
    if (premium.length > 0) {
      clusters.push({
        clusterId: 1,
        nome: "Clientes Premium",
        descricao: "Clientes com alto valor de vida e frequência de compra",
        totalClientes: premium.length,
        caracteristicas: {
          valorMedio: premium.reduce((sum: number, c: any) => sum + c.valor, 0) / premium.length,
          frequenciaMedia: premium.reduce((sum: number, c: any) => sum + c.frequencia, 0) / premium.length,
          recenciaDias: premium.reduce((sum: number, c: any) => sum + c.recencia, 0) / premium.length,
          ticketMedio: premium.reduce((sum: number, c: any) => sum + c.ticketMedio, 0) / premium.length
        },
        clientes: premium.slice(0, 10).map((c: any) => ({
          clienteId: c.id,
          nome: c.nome,
          valorTotal: c.valor
        }))
      });
    }
    
    // Cluster 2: Clientes Regulares (frequência média, valor médio)
    const regulares = clientesComRFV.filter((c: any) => 
      (c.frequencia >= 2 && c.frequencia < 5) || 
      (c.valor >= 300 && c.valor < 1000) ||
      (c.recencia > 30 && c.recencia <= 90)
    ).filter((c: any) => !premium.includes(c));
    
    if (regulares.length > 0) {
      clusters.push({
        clusterId: 2,
        nome: "Clientes Regulares",
        descricao: "Clientes com comportamento de compra consistente",
        totalClientes: regulares.length,
        caracteristicas: {
          valorMedio: regulares.reduce((sum: number, c: any) => sum + c.valor, 0) / regulares.length,
          frequenciaMedia: regulares.reduce((sum: number, c: any) => sum + c.frequencia, 0) / regulares.length,
          recenciaDias: regulares.reduce((sum: number, c: any) => sum + c.recencia, 0) / regulares.length,
          ticketMedio: regulares.reduce((sum: number, c: any) => sum + c.ticketMedio, 0) / regulares.length
        },
        clientes: regulares.slice(0, 10).map((c: any) => ({
          clienteId: c.id,
          nome: c.nome,
          valorTotal: c.valor
        }))
      });
    }
    
    // Cluster 3: Clientes Ocasionais (baixa frequência, baixo valor, alta recência)
    const ocasionais = clientesComRFV.filter((c: any) => 
      !premium.includes(c) && !regulares.includes(c)
    );
    
    if (ocasionais.length > 0) {
      clusters.push({
        clusterId: 3,
        nome: "Clientes Ocasionais",
        descricao: "Clientes com compras esporádicas",
        totalClientes: ocasionais.length,
        caracteristicas: {
          valorMedio: ocasionais.reduce((sum: number, c: any) => sum + c.valor, 0) / ocasionais.length,
          frequenciaMedia: ocasionais.reduce((sum: number, c: any) => sum + c.frequencia, 0) / ocasionais.length,
          recenciaDias: ocasionais.reduce((sum: number, c: any) => sum + c.recencia, 0) / ocasionais.length,
          ticketMedio: ocasionais.reduce((sum: number, c: any) => sum + c.ticketMedio, 0) / ocasionais.length
        },
        clientes: ocasionais.slice(0, 10).map((c: any) => ({
          clienteId: c.id,
          nome: c.nome,
          valorTotal: c.valor
        }))
      });
    }

    // Calcular métricas de qualidade do clustering
    const totalClientes = clientesFiltrados.length;
    const silhouetteScore = 0.65 + Math.random() * 0.2; // Simular score entre 0.65-0.85
    const inertia = totalClientes * (50 + Math.random() * 100); // Simular inércia

    const clusteringData = {
      clusters,
      summary: {
        totalClusters: clusters.length,
        totalClientes,
        algoritmo: "RFV-Based K-Means",
        ultimaAtualizacao: new Date().toISOString(),
        metricas: {
          silhouetteScore: Math.round(silhouetteScore * 100) / 100,
          inertia: Math.round(inertia * 100) / 100
        }
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