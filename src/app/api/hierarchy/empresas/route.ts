import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requirePermission } from '../../../../../lib/permissions';

// GET /api/hierarchy/empresas - Lista todas as empresas
export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      select: {
        id: true,
        razaoSocial: true,
        cnpjMatriz: true,
        _count: {
          select: {
            diretorias: true,
            users: true
          }
        }
      },
      orderBy: {
        razaoSocial: 'asc'
      }
    });

    return NextResponse.json(empresas);
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/hierarchy/empresas - Cria uma nova empresa
export async function POST(req: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_HIERARCHY')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { razaoSocial, cnpjMatriz } = await req.json();
    
    if (!razaoSocial) {
      return NextResponse.json({ error: 'Razão social é obrigatória.' }, { status: 400 });
    }

    const empresa = await prisma.empresa.create({
      data: {
        razaoSocial,
        cnpjMatriz: cnpjMatriz || null
      },
      select: {
        id: true,
        razaoSocial: true,
        cnpjMatriz: true
      }
    });

    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Erro ao criar empresa:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}