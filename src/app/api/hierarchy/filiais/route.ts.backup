import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionalId = searchParams.get('regionalId');

    const scope = deriveScopeFromRequest(req);

    let whereClause: any = {};
    if (regionalId) {
      whereClause.regionalId = parseInt(regionalId);
    }

    // Aplicar restrições de escopo
    whereClause = applyBasicScopeToWhere(whereClause, scope, {
      filialKey: 'id',
      regionalKey: 'regionalId',
    });

    // Para GESTOR_III, restringir por diretoria através da relação com regionais
    if (scope.role === 'GESTOR_III' && scope.diretoriaId) {
      whereClause = {
        ...whereClause,
        regionais: { is: { diretoriaId: scope.diretoriaId } },
      };
    }

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