import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';

// GET /api/hierarchy/regionais - Lista todas as regionais
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const diretoriaId = searchParams.get('diretoriaId');

    const scope = deriveScopeFromRequest(req);

    let whereClause: any = {};
    if (diretoriaId) {
      whereClause.diretoriaId = parseInt(diretoriaId);
    }

    // Aplicar restrições de escopo
    whereClause = applyBasicScopeToWhere(whereClause, scope, {
      regionalKey: 'id',
      diretoriaKey: 'diretoriaId',
    });

    const regionais = await prisma.regionais.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        diretoriaId: true,
        diretorias: {
          select: {
            id: true,
            nome: true,
            Empresas: {
              select: {
                id: true,
                razaoSocial: true
              }
            }
          }
        },
        _count: {
          select: {
            Filiais: true,
            users: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json(regionais);
  } catch (error) {
    console.error('Erro ao buscar regionais:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/hierarchy/regionais - Cria uma nova regional
export async function POST(req: NextRequest) {
  try {
    const { nome, diretoriaId } = await req.json();
    
    if (!nome || !diretoriaId) {
      return NextResponse.json({ error: 'Nome e diretoria são obrigatórios.' }, { status: 400 });
    }

    // Verificar se a diretoria existe
    const diretoria = await prisma.diretorias.findUnique({
      where: { id: parseInt(diretoriaId) }
    });

    if (!diretoria) {
      return NextResponse.json({ error: 'Diretoria não encontrada.' }, { status: 404 });
    }

    const regional = await prisma.regionais.create({
      data: {
        nome,
        diretoriaId: parseInt(diretoriaId),
        updatedAt: new Date()
      },
      select: {
        id: true,
        nome: true,
        diretoriaId: true,
        diretorias: {
          select: {
            id: true,
            nome: true,
            Empresas: {
              select: {
                id: true,
                razaoSocial: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(regional);
  } catch (error) {
    console.error('Erro ao criar regional:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}