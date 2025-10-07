import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET /api/hierarchy/filiais - Lista todas as filiais
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionalId = searchParams.get('regionalId');

    const whereClause = regionalId ? { regionalId: parseInt(regionalId) } : {};

    const filiais = await prisma.filial.findMany({
      where: whereClause,
      select: {
        id: true,
        nome: true,
        cnpj: true,
        cidade: true,
        estado: true,
        regionalId: true,
        regionais: {
          select: {
            id: true,
            nome: true,
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
        },
        _count: {
          select: {
            users: true
          }
        }
      },
      orderBy: {
        nome: 'asc'
      }
    });

    return NextResponse.json(filiais);
  } catch (error) {
    console.error('Erro ao buscar filiais:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}