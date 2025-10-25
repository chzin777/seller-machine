import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';
import { requirePermission } from '../../../../../lib/permissions';

// GET /api/hierarchy/diretorias - Lista todas as diretorias
export async function GET(req: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_HIERARCHY')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get('empresaId');

    const scope = deriveScopeFromRequest(req);

    let whereClause: any = {};
    if (empresaId) {
      whereClause.empresaId = parseInt(empresaId);
    }

    // Aplicar restrições de escopo (gestores com diretoria vinculada)
    whereClause = applyBasicScopeToWhere(whereClause, scope, {
      diretoriaKey: 'id',
    });

    const diretorias = await prisma.diretorias.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        empresaId: true,
        Empresas: {
          select: {
            id: true,
            razaoSocial: true
          }
        },
        _count: {
          select: {
            regionais: true,
            users: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json(diretorias);
  } catch (error) {
    console.error('Erro ao buscar diretorias:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/hierarchy/diretorias - Cria uma nova diretoria
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
    const { nome, empresaId } = await req.json();
    
    if (!nome || !empresaId) {
      return NextResponse.json({ error: 'Nome e empresa são obrigatórios.' }, { status: 400 });
    }

    // Verificar se a empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(empresaId) }
    });

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
    }

    const diretoria = await prisma.diretorias.create({
      data: {
        nome,
        empresaId: parseInt(empresaId),
        updatedAt: new Date()
      },
      select: {
        id: true,
        nome: true,
        empresaId: true,
        Empresas: {
          select: {
            id: true,
            razaoSocial: true
          }
        }
      }
    });

    return NextResponse.json(diretoria);
  } catch (error) {
    console.error('Erro ao criar diretoria:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}