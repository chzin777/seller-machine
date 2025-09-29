import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// Mapeamento de categorias para tipos
const categoryToType: Record<string, string> = {
  'Descartáveis': 'Peca',
  'Limpeza': 'Servico', 
  'Copa': 'Maquina'
};

export async function GET() {
  try {
    // Buscar associações reais do banco de dados
    let realAssociations: any[] = [];
    try {
      realAssociations = await prisma.associacaoProduto.findMany({
        select: {
          produto_a_id: true,
          produto_b_id: true,
          suporte: true,
          confianca: true,
          lift: true,
          a_nome: true,
          b_nome: true,
          a_tipo: true,
          b_tipo: true,
          vendas_produto_a: true,
          vendas_produto_b: true,
          atualizado_em: true
        }
      });

      // Mapear para o formato esperado
      realAssociations = realAssociations.map((item: any) => ({
        product_a_id: item.produto_a_id,
        product_b_id: item.produto_b_id,
        support_count: item.suporte,
        confidence: item.confianca,
        lift: item.lift,
        leverage: 0, // Campo não existe no schema atual
        window_days: 0, // Campo não existe no schema atual
        updated_at: item.atualizado_em
      }));
    } catch (error) {
      console.error('Erro ao buscar associações reais:', error);
    }

    // Gerar associações baseadas nas notas fiscais se não houver dados reais
    let generatedAssociations: any[] = [];
    
    if (!realAssociations || realAssociations.length === 0) {
      try {
        const notas = await prisma.notasFiscalCabecalho.findMany({
          take: 1000,
          include: {
            itens: {
              include: {
                produto: true
              }
            }
          }
        });
        
        console.log(`Carregadas ${notas?.length || 0} notas fiscais`);
        
        if (Array.isArray(notas) && notas.length > 0) {
          // Processar associações baseadas nos produtos das notas fiscais
          const productPairs = new Map();
          const productCounts = new Map();
          
          notas.forEach((nota: any) => {
            if (nota.itens && nota.itens.length > 1) {
              const produtos = nota.itens.map((item: any) => item.produto?.id).filter(Boolean);
              
              // Contar produtos
              produtos.forEach((produtoId: number) => {
                productCounts.set(produtoId, (productCounts.get(produtoId) || 0) + 1);
              });
              
              // Criar pares de produtos
              for (let i = 0; i < produtos.length; i++) {
                for (let j = i + 1; j < produtos.length; j++) {
                  const a = Math.min(produtos[i], produtos[j]);
                  const b = Math.max(produtos[i], produtos[j]);
                  const key = `${a}-${b}`;
                  productPairs.set(key, (productPairs.get(key) || 0) + 1);
                }
              }
            }
          });
          
          console.log(`Processadas ${Math.min(1000, notas.length)} notas fiscais, encontrados ${productPairs.size} pares de produtos`);
          
          // Gerar associações
          const totalNotas = Math.min(1000, notas.length);
          productPairs.forEach((abCount, key) => {
            const [a, b] = key.split('-').map(Number);
            const aCount = productCounts.get(a) || 0;
            const bCount = productCounts.get(b) || 0;
            
            if (abCount >= 5 && aCount > 0 && bCount > 0) {
              const support = abCount / totalNotas;
              const confidence = abCount / aCount;
              const lift = confidence / (bCount / totalNotas);
              const leverage = support - (aCount / totalNotas) * (bCount / totalNotas);
              
              generatedAssociations.push({
                product_a_id: a,
                product_b_id: b,
                support_count: abCount,
                confidence: Math.round(confidence * 100) / 100,
                lift: Math.round(lift * 100) / 100,
                leverage: Math.round(leverage * 10000) / 10000,
                window_days: 0,
                updated_at: new Date().toISOString()
              });
            }
          });
          
          // Ordenar por confiança e pegar as melhores
          generatedAssociations.sort((a, b) => b.confidence - a.confidence);
          generatedAssociations = generatedAssociations.slice(0, 20);
          
          console.log(`Geradas ${generatedAssociations.length} associações baseadas em ${totalNotas} notas fiscais`);
        } else {
          console.warn('Não foi possível carregar notas fiscais da API externa');
        }
      } catch (error) {
        console.error('Erro ao gerar associações das notas fiscais:', error);
      }
    }

    // Usar dados reais se disponíveis, senão usar gerados
    console.log(`Associações disponíveis - Reais: ${realAssociations?.length || 0}, Geradas: ${generatedAssociations.length}`);
    
    const associations = (realAssociations && realAssociations.length > 0) 
      ? realAssociations 
      : generatedAssociations;
        
    console.log(`Usando ${associations.length} associações do tipo: ${(realAssociations?.length || 0) > 0 ? 'reais' : 'geradas'}`);

    // Buscar produtos da API externa
    let productMap = new Map();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/produtos`);
      if (response.ok) {
        const produtos = await response.json();
        // Mapear produtos da API externa
        produtos.forEach((produto: any) => {
          productMap.set(produto.id, {
            name: produto.nome || produto.name,
            type: categoryToType[produto.categoria] || 'Outros'
          });
        });
      }
    } catch (error) {
      console.error('Erro ao buscar produtos da API externa:', error);
    }
    
    // Buscar itens de notas fiscais para contar vendas
    const salesCount = new Map();
    
    try {
      const itens = await prisma.notaFiscalItem.findMany({
        select: {
          produtoId: true,
          notaFiscalId: true
        }
      });
      
      itens.forEach((item: any) => {
        if (item.produtoId) {
          salesCount.set(item.produtoId, (salesCount.get(item.produtoId) || 0) + 1);
        }
      });
    } catch (error) {
      console.error('Erro ao buscar itens de notas fiscais:', error);
    }

    // Mapear os dados para o formato esperado pelo frontend
    const formattedData = (associations || []).map((item: any) => {
      const productA = productMap.get(item.product_a_id);
      const productB = productMap.get(item.product_b_id);
      const salesA = salesCount.get(item.product_a_id) || 0;
      const salesB = salesCount.get(item.product_b_id) || 0;

      return {
        product_a_id: item.product_a_id,
        product_b_id: item.product_b_id,
        support_count: item.support_count,
        confidence: item.confidence,
        lift: item.lift,
        leverage: item.leverage,
        window_days: item.window_days,
        updated_at: item.updated_at,
        a_nome: productA?.name || `Produto ${item.product_a_id}`,
        b_nome: productB?.name || `Produto ${item.product_b_id}`,
        a_tipo: productA?.type || 'Outros',
        b_tipo: productB?.type || 'Outros',
        vendas_produto_a: salesA,
        vendas_produto_b: salesB
      };
    });

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}