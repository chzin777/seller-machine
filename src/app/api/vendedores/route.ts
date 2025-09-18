import { NextRequest, NextResponse } from 'next/server';

// Simular dados de vendedores com vendas
export async function GET() {
  try {
    // Simular dados de notas fiscais para desenvolvimento local
    const notas = [
      { id: 1, valor: 15000, vendedorId: 1, data: '2024-01-15' },
      { id: 2, valor: 8500, vendedorId: 2, data: '2024-01-16' },
      { id: 3, valor: 12000, vendedorId: 1, data: '2024-01-17' },
      { id: 4, valor: 6500, vendedorId: 3, data: '2024-01-18' },
      { id: 5, valor: 9200, vendedorId: 2, data: '2024-01-19' }
    ];

    // Simular vendedores baseado nos dados reais
    const vendedores = [
      { id: 1, nome: 'Ana Silva', avatar: 'AS', meta: 150000, cor: '#3B82F6' },
      { id: 2, nome: 'Carlos Oliveira', avatar: 'CO', meta: 120000, cor: '#10B981' },
      { id: 3, nome: 'Marina Costa', avatar: 'MC', meta: 100000, cor: '#8B5CF6' },
      { id: 4, nome: 'Roberto Santos', avatar: 'RS', meta: 90000, cor: '#F59E0B' },
      { id: 5, nome: 'Juliana Ferreira', avatar: 'JF', meta: 80000, cor: '#EF4444' },
      { id: 6, nome: 'Paulo Rocha', avatar: 'PR', meta: 75000, cor: '#06B6D4' },
      { id: 7, nome: 'Fernanda Lima', avatar: 'FL', meta: 70000, cor: '#84CC16' },
      { id: 8, nome: 'Eduardo Alves', avatar: 'EA', meta: 65000, cor: '#F97316' },
      { id: 9, nome: 'Mariana Torres', avatar: 'MT', meta: 60000, cor: '#EC4899' },
      { id: 10, nome: 'Lucas Mendes', avatar: 'LM', meta: 58000, cor: '#6366F1' },
      { id: 11, nome: 'Camila Reis', avatar: 'CR', meta: 55000, cor: '#14B8A6' },
      { id: 12, nome: 'Rafael Gomes', avatar: 'RG', meta: 52000, cor: '#F59E0B' },
      { id: 13, nome: 'Beatriz Cardoso', avatar: 'BC', meta: 50000, cor: '#EF4444' },
      { id: 14, nome: 'Thiago Barbosa', avatar: 'TB', meta: 48000, cor: '#8B5CF6' },
      { id: 15, nome: 'Larissa Monteiro', avatar: 'LM', meta: 45000, cor: '#10B981' }
    ];

    // Distribuir as notas fiscais entre os vendedores de forma realista
    const vendedoresComVendas = vendedores.map((vendedor, index) => {
      // Determinar quantas notas cada vendedor tem (distribuição mais realista)
      const fatores = [
        0.18, 0.15, 0.12, 0.10, 0.08, 0.07, 0.06, 0.05, 
        0.04, 0.035, 0.03, 0.025, 0.02, 0.015, 0.01
      ]; // Ana tem mais, Larissa tem menos
      const fator = fatores[index] || 0.005;
      const qtdNotas = Math.floor(notas.length * fator);
      
      // Selecionar notas para este vendedor
      const startIndex = vendedores.slice(0, index).reduce((acc, _, i) => {
        return acc + Math.floor(notas.length * (fatores[i] || 0.005));
      }, 0);
      const notasVendedor = notas.slice(startIndex, startIndex + qtdNotas);
      
      // Calcular métricas (converter de centavos para reais)
      const receita = notasVendedor.reduce((acc: number, nota: any) => acc + ((parseFloat(nota.valorTotal) || 0) / 100), 0);
      const volume = notasVendedor.length;
      const ticketMedio = volume > 0 ? receita / volume : 0;
      const percentualMeta = vendedor.meta > 0 ? (receita / vendedor.meta) * 100 : 0;
      
      // Simular crescimento mensal (variação de -10% a +25%)
      const crescimento = -10 + Math.random() * 35;
      
      // Simular tendência das últimas vendas
      const tendencia = Math.random() > 0.5 ? 'up' : 'down';
      
      return {
        ...vendedor,
        receita,
        volume,
        ticketMedio,
        percentualMeta,
        crescimento,
        tendencia,
        ultimaVenda: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        posicao: 0 // Será definido após ordenação
      };
    });

    // Ordenar por receita (ranking)
    vendedoresComVendas.sort((a, b) => b.receita - a.receita);
    
    // Adicionar posição no ranking
    vendedoresComVendas.forEach((vendedor, index) => {
      vendedor.posicao = index + 1;
    });

    return NextResponse.json(vendedoresComVendas);
  } catch (error) {
    console.error('Erro ao buscar dados de vendedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.nome) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    if (!body.meta || body.meta <= 0) {
      return NextResponse.json(
        { error: 'Meta deve ser um valor positivo' },
        { status: 400 }
      );
    }
    
    // Generate new vendedor ID (in real app, this would be handled by database)
    const novoId = Math.floor(Math.random() * 10000) + 1000;
    
    // Create new vendedor
    const novoVendedor = {
      id: novoId,
      nome: body.nome,
      avatar: body.nome.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2),
      meta: body.meta,
      cor: body.cor || '#3B82F6',
      receita: 0,
      volume: 0,
      ticketMedio: 0,
      percentualMeta: 0,
      crescimento: 0,
      tendencia: 'up',
      ultimaVenda: new Date().toISOString().split('T')[0],
      posicao: 0,
      filialId: body.filialId || null,
      contato: {
        email: body.email || `${body.nome.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        telefone: body.telefone || '',
        whatsapp: body.whatsapp || ''
      },
      status: {
        ativo: true,
        dataAdmissao: new Date().toISOString().split('T')[0],
        observacoes: body.observacoes || 'Vendedor recém-cadastrado'
      },
      dataCriacao: new Date().toISOString(),
      ultimaAtualizacao: new Date().toISOString()
    };
    
    return NextResponse.json({
      message: 'Vendedor criado com sucesso',
      vendedor: novoVendedor
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
