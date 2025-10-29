import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

/**
 * 🔧 Endpoint de DEBUG para vincular usuário vendedor com tabela Vendedores
 * Use este endpoint apenas em desenvolvimento
 */
export async function POST(req: NextRequest) {
  try {
    const { email, vendedorId } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar usuário
    const user = await prisma.users.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, cpf: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Se vendedorId foi fornecido, buscar o vendedor específico
    let vendedor = null;
    if (vendedorId) {
      vendedor = await prisma.vendedor.findUnique({
        where: { id: vendedorId },
        select: { id: true, nome: true, cpf: true, filialId: true }
      });
    } else if (user.cpf) {
      // Se não foi fornecido vendedorId, tentar buscar por CPF
      vendedor = await prisma.vendedor.findUnique({
        where: { cpf: user.cpf },
        select: { id: true, nome: true, cpf: true, filialId: true }
      });
    }

    // Se ainda não encontrou vendedor, pegar o primeiro disponível
    if (!vendedor) {
      vendedor = await prisma.vendedor.findFirst({
        orderBy: { id: 'asc' },
        select: { id: true, nome: true, cpf: true, filialId: true }
      });
    }

    if (!vendedor) {
      return NextResponse.json(
        { error: 'Nenhum vendedor encontrado na tabela Vendedores' },
        { status: 404 }
      );
    }

    // Atualizar CPF do usuário com o CPF do vendedor
    const updatedUser = await prisma.users.update({
      where: { email },
      data: {
        cpf: vendedor.cpf,
        filialId: vendedor.filialId
      }
    });

    return NextResponse.json({
      message: 'Usuário vinculado com sucesso ao vendedor!',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        cpf: updatedUser.cpf,
        filialId: updatedUser.filialId
      },
      vendedor: {
        id: vendedor.id,
        nome: vendedor.nome,
        cpf: vendedor.cpf,
        filialId: vendedor.filialId
      },
      instrucoes: 'Agora faça logout e login novamente para que o vendedorId seja incluído no token JWT'
    });
  } catch (error) {
    console.error('Erro ao vincular usuário com vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * 📋 Listar vendedores disponíveis para vinculação
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const vendedores = await prisma.vendedor.findMany({
      take: limit,
      select: {
        id: true,
        nome: true,
        cpf: true,
        filialId: true
      },
      orderBy: { id: 'asc' }
    });

    return NextResponse.json({
      vendedores,
      total: vendedores.length,
      instrucoes: 'Use POST /api/debug/vincular-vendedor com { "email": "vendas@teste.com", "vendedorId": ID } para vincular'
    });
  } catch (error) {
    console.error('Erro ao listar vendedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
