import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../../../lib/permissions';

interface RouteParams {
  params: Promise<{
    cpf: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('VIEW_FILIAL_SELLERS')(request);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: authResult.status || 401 }
    );
  }

  try {
    const { cpf } = await params;
    
    // Validate CPF format (basic validation)
    if (!cpf || cpf.length < 11) {
      return NextResponse.json(
        { error: 'CPF inválido. Deve conter 11 dígitos.' },
        { status: 400 }
      );
    }
    
    // Clean CPF (remove dots and dashes)
    const cpfLimpo = cpf.replace(/[^0-9]/g, '');
    
    if (cpfLimpo.length !== 11) {
      return NextResponse.json(
        { error: 'CPF deve conter exatamente 11 dígitos.' },
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

    // Since mock data doesn't have CPF, we'll simulate CPF generation based on vendedor ID
    const vendedorEncontrado = vendedores.find((vendedor, index) => {
      // Generate a mock CPF based on vendedor ID for simulation
      const mockCpf = `${String(vendedor.id).padStart(3, '0')}${String(index + 1).padStart(3, '0')}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}${String(Math.floor(Math.random() * 10))}`;
      return mockCpf === cpfLimpo;
    });
    
    // If not found by generated CPF, try to match with a predefined CPF for demo
    let vendedorDemo = null;
    if (!vendedorEncontrado && vendedores.length > 0) {
      // For demo purposes, let's say the first vendedor has CPF 12345678901
      if (cpfLimpo === '12345678901') {
        vendedorDemo = {
          ...vendedores[0],
          cpf: '123.456.789-01',
          cpfLimpo: '12345678901'
        };
      }
      // Second vendedor has CPF 98765432100
      else if (cpfLimpo === '98765432100') {
        vendedorDemo = {
          ...vendedores[1] || vendedores[0],
          cpf: '987.654.321-00',
          cpfLimpo: '98765432100'
        };
      }
    }
    
    const vendedorFinal = vendedorEncontrado || vendedorDemo;
    
    if (!vendedorFinal) {
      return NextResponse.json(
        { 
          error: 'Vendedor não encontrado',
          cpfConsultado: cpf,
          sugestao: 'Verifique se o CPF está correto ou se o vendedor está cadastrado no sistema'
        },
        { status: 404 }
      );
    }
    
    // Add CPF to the response if it wasn't already there
    const resultado = {
      ...vendedorFinal,
      cpf: vendedorFinal.cpf || `${cpfLimpo.substring(0,3)}.${cpfLimpo.substring(3,6)}.${cpfLimpo.substring(6,9)}-${cpfLimpo.substring(9,11)}`,
      cpfLimpo: cpfLimpo,
      consultaRealizada: {
        data: new Date().toISOString(),
        cpfConsultado: cpf,
        metodoConsulta: 'CPF'
      },
      informacoesAdicionais: {
        statusCadastro: 'Ativo',
        ultimaAtualizacao: new Date().toISOString(),
        observacoes: 'Dados obtidos via consulta por CPF'
      }
    };

    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar vendedor por CPF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}