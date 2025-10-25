import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../lib/scope';
import { requirePermission } from '../../../../lib/permissions';

export async function GET(request: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_BRANCHES')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
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

    let filiais;
    
    // Buscar filiais com escopo aplicado
    filiais = await prisma.filial.findMany({
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
            nome: true
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
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_BRANCHES')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { nome, cnpj, cidade, estado, regionalId, empresaId } = body;

    // Validações
    if (!nome || !cnpj || !empresaId) {
      return NextResponse.json(
        { error: 'Nome, CNPJ e Empresa são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se a regional existe
    const regional = await prisma.regionais.findUnique({
      where: { id: regionalId }
    });

    if (!regional) {
      return NextResponse.json(
        { error: 'Regional não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se já existe uma filial com o mesmo CNPJ
    const filialExistente = await prisma.filial.findFirst({
      where: { cnpj }
    });

    if (filialExistente) {
      return NextResponse.json(
        { error: 'Já existe uma filial com este CNPJ' },
        { status: 409 }
      );
    }

    // Criar nova filial
    const novaFilial = await prisma.filial.create({
      data: {
        nome,
        cnpj,
        cidade,
        estado,
        regionalId,
        empresaId
      },
      include: {
        regionais: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return NextResponse.json(novaFilial, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar filial:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}