import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clienteId = searchParams.get('clienteId');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!clienteId) {
      return NextResponse.json(
        { error: 'Cliente ID é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar histórico de compras do cliente para gerar recomendações
    let clienteHistorico = [];
    try {
      const historicoResponse = await fetch(`https://api-dev-production-6bb5.up.railway.app/api/pedidos?clienteId=${clienteId}`);
      if (historicoResponse.ok) {
        clienteHistorico = await historicoResponse.json();
      }
    } catch (error) {
      console.warn('Erro ao buscar histórico do cliente:', error);
    }

    // Buscar produtos disponíveis
    let produtos = [];
    try {
      const produtosResponse = await fetch('https://api-dev-production-6bb5.up.railway.app/api/produtos');
      if (produtosResponse.ok) {
        produtos = await produtosResponse.json();
      }
    } catch (error) {
      console.warn('Erro ao buscar produtos:', error);
    }

    // Gerar recomendações baseadas no histórico e produtos disponíveis
    const recomendacoes = [];
    
    if (produtos.length > 0) {
      // Analisar categorias compradas pelo cliente
      const categoriasCompradas = new Set();
      clienteHistorico.forEach((pedido: any) => {
        if (pedido.itens) {
          pedido.itens.forEach((item: any) => {
            if (item.categoria) {
              categoriasCompradas.add(item.categoria);
            }
          });
        }
      });

      // Calcular score para cada produto
      produtos.forEach((produto: any) => {
        let score = Math.random() * 40 + 30; // Score base entre 30-70
        let motivo = 'Produto recomendado com base no perfil do cliente';

        // Aumentar score se o produto é da mesma categoria que o cliente já comprou
        if (categoriasCompradas.has(produto.categoria)) {
          score += 20;
          motivo = `Baseado no histórico de compras em ${produto.categoria}`;
        }

        // Aumentar score para produtos populares (simulado)
        if (produto.id % 3 === 0) {
          score += 10;
          motivo += ' - Produto em alta demanda';
        }

        // Aumentar score para produtos com preço similar ao ticket médio do cliente
        const ticketMedio = clienteHistorico.reduce((acc: number, pedido: any) => acc + (pedido.valor || 0), 0) / Math.max(clienteHistorico.length, 1);
        if (produto.preco && Math.abs(produto.preco - ticketMedio) < ticketMedio * 0.3) {
          score += 15;
          motivo += ' - Preço compatível com seu perfil';
        }

        recomendacoes.push({
          produtoId: produto.id,
          nome: produto.descricao || produto.nome || `Produto ${produto.id}`,
          categoria: produto.categoria || 'Geral',
          score: Math.min(Math.round(score), 100), // Limitar score a 100
          motivo,
          precoMedio: produto.preco || produto.valor || 0
        });
      });
    }

    // Se não há produtos ou recomendações, usar algumas recomendações padrão
    if (recomendacoes.length === 0) {
      recomendacoes.push(
        {
          produtoId: 1,
          nome: 'Produto Recomendado A',
          categoria: 'Geral',
          score: 75,
          motivo: 'Produto popular entre clientes similares',
          precoMedio: 299.99
        },
        {
          produtoId: 2,
          nome: 'Produto Recomendado B',
          categoria: 'Geral',
          score: 68,
          motivo: 'Baseado em tendências de mercado',
          precoMedio: 199.99
        }
      );
    }

    // Ordenar por score e limitar resultados
    const recomendacoesFiltradas = recomendacoes
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json(recomendacoesFiltradas);

  } catch (error) {
    console.error('Erro ao gerar recomendações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}