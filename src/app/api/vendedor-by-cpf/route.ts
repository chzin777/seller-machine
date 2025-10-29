import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/**
 * 🔍 Endpoint para buscar ID_Vendedor e informações do vendedor pelo CPF
 * Utilizado para vincular usuários da tabela users com vendedores da tabela Vendedores
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cpf = searchParams.get('cpf');

    if (!cpf) {
      return NextResponse.json(
        { error: 'CPF é obrigatório' },
        { status: 400 }
      );
    }

    // Limpar CPF (remover pontos, traços, etc.)
    const cpfLimpo = cpf.replace(/[^\d]/g, '');
    console.log('🔍 Buscando vendedor por CPF:', cpfLimpo);

    // Buscar vendedor pelo CPF diretamente no banco via Prisma
    const vendedor = await prisma.vendedor.findUnique({
      where: { cpf: cpfLimpo },
      include: {
        filial: {
          include: {
            regionais: {
              include: {
                diretorias: true
              }
            }
          }
        }
      }
    });

    if (!vendedor) {
      console.log('⚠️ Vendedor não encontrado com CPF:', cpfLimpo);
      return NextResponse.json(
        { error: 'Vendedor não encontrado', found: false },
        { status: 404 }
      );
    }

    console.log('✅ Vendedor encontrado:', {
      id: vendedor.id,
      nome: vendedor.nome,
      cpf: vendedor.cpf
    });

    // Retornar dados estruturados
    return NextResponse.json({
      found: true,
      vendedorId: vendedor.id,
      vendedorNome: vendedor.nome,
      vendedorCpf: vendedor.cpf,
      filialId: vendedor.filialId,
      filialNome: vendedor.filial?.nome,
      regionalId: vendedor.filial?.regionalId,
      regionalNome: vendedor.filial?.regionais?.nome,
      diretoriaId: vendedor.filial?.regionais?.diretoriaId,
      diretoriaNome: vendedor.filial?.regionais?.diretorias?.nome,
      empresaId: vendedor.filial?.regionais?.diretorias?.empresaId
    });
  } catch (error) {
    console.error('Erro ao buscar vendedor por CPF:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', found: false },
      { status: 500 }
    );
  }
}
