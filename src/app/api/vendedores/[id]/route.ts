import { NextRequest, NextResponse } from 'next/server'
import { deriveScopeFromRequest } from '../../../../../lib/scope'

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID do vendedor é obrigatório' },
        { status: 400 }
      )
    }
    
    const vendedorId = parseInt(id)
    if (isNaN(vendedorId)) {
      return NextResponse.json(
        { error: 'ID do vendedor deve ser um número válido' },
        { status: 400 }
      )
    }

    const scope = deriveScopeFromRequest(request)

    // Restrição: vendedor só pode acessar seus próprios dados
    if (scope.role === 'VENDEDOR' && scope.userId && scope.userId !== vendedorId) {
      return NextResponse.json({ error: 'Acesso negado: vendedor só pode acessar seus próprios dados.' }, { status: 403 })
    }
    
    // Fetch vendedores data from the main endpoint
    const vendedoresResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/vendedores`, {
      headers: request.headers
    })
    
    if (!vendedoresResponse.ok) {
      throw new Error('Erro ao buscar dados de vendedores')
    }
    
    const vendedores = await vendedoresResponse.json()
    
    if (!Array.isArray(vendedores)) {
      throw new Error('Dados de vendedores inválidos')
    }

    // Find vendedor by ID
    const vendedor = vendedores.find(v => v.id === vendedorId)
    
    if (!vendedor) {
      // Simular filial atribuída para verificação de escopo
      const assignedFilialId = ((vendedorId % 5) + 1)
      const assignedRegionalId = assignedFilialId <= 2 ? 1 : (assignedFilialId === 3 ? 2 : 3)
      const assignedDiretoriaId = assignedFilialId <= 3 ? 1 : 2

      // Para gestores, validar escopo mesmo se não encontrado no mock
      if (scope.role === 'GESTOR_I' && scope.filialId && scope.filialId !== assignedFilialId) {
        return NextResponse.json({ error: 'Acesso negado: gestor de filial só pode acessar dados da própria filial.' }, { status: 403 })
      }
      if (scope.role === 'GESTOR_II' && scope.regionalId && scope.regionalId !== assignedRegionalId) {
        return NextResponse.json({ error: 'Acesso negado: gestor regional só pode acessar dados de sua regional.' }, { status: 403 })
      }
      if (scope.role === 'GESTOR_III' && scope.diretoriaId && scope.diretoriaId !== assignedDiretoriaId) {
        return NextResponse.json({ error: 'Acesso negado: gestor de diretoria só pode acessar dados de sua diretoria.' }, { status: 403 })
      }

      return NextResponse.json(
        { 
          error: 'Vendedor não encontrado',
          id: vendedorId,
          sugestao: 'Verifique se o ID está correto'
        },
        { status: 404 }
      )
    }
    
    // Simular filial/regional/diretoria para validação
    const assignedFilialId = ((vendedor.id % 5) + 1)
    const assignedRegionalId = assignedFilialId <= 2 ? 1 : (assignedFilialId === 3 ? 2 : 3)
    const assignedDiretoriaId = assignedFilialId <= 3 ? 1 : 2

    // Restringir gestores por escopo
    if (scope.role === 'GESTOR_I' && scope.filialId && scope.filialId !== assignedFilialId) {
      return NextResponse.json({ error: 'Acesso negado: gestor de filial só pode acessar dados da própria filial.' }, { status: 403 })
    }
    if (scope.role === 'GESTOR_II' && scope.regionalId && scope.regionalId !== assignedRegionalId) {
      return NextResponse.json({ error: 'Acesso negado: gestor regional só pode acessar dados de sua regional.' }, { status: 403 })
    }
    if (scope.role === 'GESTOR_III' && scope.diretoriaId && scope.diretoriaId !== assignedDiretoriaId) {
      return NextResponse.json({ error: 'Acesso negado: gestor de diretoria só pode acessar dados de sua diretoria.' }, { status: 403 })
    }
    
    // Enhance vendedor data with additional information
    const vendedorDetalhado = {
      ...vendedor,
      // Add filial information (simulated)
      filialId: assignedFilialId,
      filialNome: ['Filial Centro', 'Filial Norte', 'Filial Sul', 'Filial Oeste', 'Filial Leste'][assignedFilialId - 1],
      
      // Add contact information (simulated)
      contato: {
        email: `${vendedor.nome.toLowerCase().replace(/\s+/g, '.')}@empresa.com`,
        telefone: `(11) 9${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        whatsapp: `(11) 9${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      },
      
      // Add performance history (simulated)
      historicoPerformance: {
        ultimosTresMeses: [
          {
            mes: 'Janeiro',
            receita: (vendedor.receita || 0) * (0.8 + Math.random() * 0.4),
            volume: Math.floor((vendedor.volume || 0) * (0.8 + Math.random() * 0.4)),
            percentualMeta: (vendedor.percentualMeta || 0) * (0.8 + Math.random() * 0.4)
          },
          {
            mes: 'Fevereiro',
            receita: (vendedor.receita || 0) * (0.9 + Math.random() * 0.3),
            volume: Math.floor((vendedor.volume || 0) * (0.9 + Math.random() * 0.3)),
            percentualMeta: (vendedor.percentualMeta || 0) * (0.9 + Math.random() * 0.3)
          },
          {
            mes: 'Março',
            receita: vendedor.receita || 0,
            volume: vendedor.volume || 0,
            percentualMeta: vendedor.percentualMeta || 0
          }
        ]
      },
      
      // Add client information (simulated)
      clientes: {
        total: Math.floor(Math.random() * 50) + 10,
        novos: Math.floor(Math.random() * 10) + 1,
        ativos: Math.floor(Math.random() * 40) + 5,
        inativos: Math.floor(Math.random() * 15) + 2
      },
      
      // Add goals and achievements
      metas: {
        mensal: vendedor.meta || 0,
        trimestral: (vendedor.meta || 0) * 3,
        anual: (vendedor.meta || 0) * 12,
        atingimentoMensal: vendedor.percentualMeta || 0
      },
      
      // Add ranking information
      ranking: {
        posicaoGeral: vendedor.posicao || 0,
        posicaoFilial: Math.floor(Math.random() * 5) + 1,
        melhorPosicao: Math.max(1, (vendedor.posicao || 1) - Math.floor(Math.random() * 3)),
        piorPosicao: (vendedor.posicao || 1) + Math.floor(Math.random() * 5)
      },
      
      // Add additional metrics
      metricas: {
        diasSemVenda: Math.floor(Math.random() * 10),
        produtosMaisVendidos: [
          { produto: 'Produto A', quantidade: Math.floor(Math.random() * 20) + 5 },
          { produto: 'Produto B', quantidade: Math.floor(Math.random() * 15) + 3 },
          { produto: 'Produto C', quantidade: Math.floor(Math.random() * 10) + 2 }
        ],
        horariosVenda: {
          manha: Math.floor(Math.random() * 40) + 10,
          tarde: Math.floor(Math.random() * 50) + 20,
          noite: Math.floor(Math.random() * 30) + 5
        }
      },
      
      // Add status and observations
      status: {
        ativo: true,
        dataAdmissao: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3).toISOString().split('T')[0],
        observacoes: 'Vendedor em atividade normal',
        proximaAvaliacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      
      ultimaAtualizacao: new Date().toISOString()
    }

    return NextResponse.json(vendedorDetalhado)
  } catch (error) {
    console.error('Erro ao buscar vendedor por ID:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const scope = deriveScopeFromRequest(request)
    if (scope.role === 'VENDEDOR') {
      return NextResponse.json({ error: 'Acesso negado: vendedores não podem atualizar registros de vendedores.' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID do vendedor é obrigatório' },
        { status: 400 }
      )
    }
    
    const vendedorId = parseInt(id)
    if (isNaN(vendedorId)) {
      return NextResponse.json(
        { error: 'ID do vendedor deve ser um número válido' },
        { status: 400 }
      )
    }
    
    // In a real implementation, this would update the database
    // For now, we'll return a success response with the updated data
    const vendedorAtualizado = {
      id: vendedorId,
      ...body,
      ultimaAtualizacao: new Date().toISOString(),
      atualizadoPor: 'Sistema' // In real app, this would be the user ID
    }
    
    return NextResponse.json({
      message: 'Vendedor atualizado com sucesso',
      vendedor: vendedorAtualizado
    })
  } catch (error) {
    console.error('Erro ao atualizar vendedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const scope = deriveScopeFromRequest(request)
    if (scope.role === 'VENDEDOR') {
      return NextResponse.json({ error: 'Acesso negado: vendedores não podem remover registros de vendedores.' }, { status: 403 })
    }

    const { id } = await params
    
    // Validate ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID do vendedor é obrigatório' },
        { status: 400 }
      )
    }
    
    const vendedorId = parseInt(id)
    if (isNaN(vendedorId)) {
      return NextResponse.json(
        { error: 'ID do vendedor deve ser um número válido' },
        { status: 400 }
      )
    }
    
    // In a real implementation, this would delete from the database
    // For now, we'll return a success response
    return NextResponse.json({
      message: 'Vendedor removido com sucesso',
      id: vendedorId,
      dataRemocao: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao remover vendedor:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}