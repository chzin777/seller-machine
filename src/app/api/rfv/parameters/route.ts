import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';

// GET /api/rfv/parameters - Buscar parâmetros RFV
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');
  const filialId = searchParams.get('filialId');

  try {
    const scope = deriveScopeFromRequest(req);

    let whereClause: any = {};

    // Filtrar por ativo se especificado
    if (active === 'true') {
      whereClause.effectiveTo = null;
    }

    // Filtrar por filial se especificado
    if (filialId) {
      if (filialId === 'all') {
        whereClause.filialId = null;
      } else {
        whereClause.filialId = parseInt(filialId);
      }
    }

    // Aplicar escopo do usuário
    whereClause = applyBasicScopeToWhere(whereClause, scope, {
      filialKey: 'filialId',
    });

    const data = await prisma.rfvParameterSet.findMany({
      where: whereClause,
      include: {
        segments: true,
        filial: {
          select: {
            id: true,
            nome: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/rfv/parameters - Criar novos parâmetros RFV
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      filialId,
      name,
      rfvRules,
      segmentationMethod,
      automaticRanges,
      segments = [],
      effectiveFrom
    } = body;

    // Validações básicas
    if (!name || !rfvRules || !effectiveFrom) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios faltando: name, rfvRules, effectiveFrom' 
      }, { status: 400 });
    }

    // Converter filialId 'all' para null
    const finalFilialId = filialId === 'all' ? null : filialId;

    // Verificar duplicatas
    if (finalFilialId === null) {
      // Verificar se já existe configuração global ativa
      const existingGlobal = await prisma.rfvParameterSet.findMany({
        where: {
          filialId: null,
          effectiveTo: null
        }
      });

      if (existingGlobal && existingGlobal.length > 0) {
        return NextResponse.json({ 
          error: 'Já existe uma configuração global ativa. Desative-a antes de criar uma nova.' 
        }, { status: 400 });
      }
    } else {
      // Verificar se já existe configuração para esta filial
      const existingFilial = await prisma.rfvParameterSet.findMany({
        where: {
          filialId: finalFilialId,
          effectiveTo: null
        }
      });

      if (existingFilial && existingFilial.length > 0) {
        return NextResponse.json({ 
          error: `Já existe uma configuração ativa para a filial ${finalFilialId}. Desative-a antes de criar uma nova.` 
        }, { status: 400 });
      }

      // Verificar se existe configuração global que conflitaria
      const existingGlobal = await prisma.rfvParameterSet.findMany({
        where: {
          filialId: null,
          effectiveTo: null
        }
      });

      if (existingGlobal && existingGlobal.length > 0) {
        return NextResponse.json({ 
          error: 'Existe uma configuração global ativa. Não é possível criar configuração específica para filial.' 
        }, { status: 400 });
      }
    }

    // Converter regras RFV para o formato do banco
    const ruleRecency = {
      bins: rfvRules.recency.map((rule: any) => ({
        score: rule.score,
        ...(rule.max !== undefined && { max_dias: rule.max })
      }))
    };

    const ruleFrequency = {
      bins: rfvRules.frequency.map((rule: any) => ({
        score: rule.score,
        ...(rule.min !== undefined && { min_compras: rule.min })
      }))
    };

    const ruleValue = {
      bins: rfvRules.value.map((rule: any) => ({
        score: rule.score,
        ...(rule.min !== undefined && { min_valor: rule.min })
      }))
    };

    // Usar transação para criar parameter set e segmentos
    const result = await prisma.$transaction(async (tx) => {
      // Criar o parameter set
      const parameterSet = await tx.rfvParameterSet.create({
        data: {
          filialId: finalFilialId,
          name,
          strategy: 'threshold',
          windowDays: 365,
          weights: { R: 1, F: 1, V: 1 },
          ruleRecency,
          ruleFrequency,
          ruleValue,
          effectiveFrom: new Date(effectiveFrom),
          effectiveTo: null,
          calculationStrategy: segmentationMethod,
          classRanges: automaticRanges || undefined,
          conditionalRules: undefined
        }
      });

      // Criar os segmentos se existirem
      if (segments.length > 0) {
        const segmentsData = segments.map((segment: any, index: number) => ({
          parameterSetId: parameterSet.id,
          name: segment.segment_name,
          rules: segment.rules,
          priority: segment.priority || index
        }));

        await tx.rfvSegment.createMany({
          data: segmentsData
        });
      }

      // Buscar o resultado completo
      return await tx.rfvParameterSet.findUnique({
        where: { id: parameterSet.id },
        include: {
          segments: true,
          filial: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/rfv/parameters - Atualizar parâmetros RFV existentes
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, segments, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório para atualização' }, { status: 400 });
    }

    // Usar transação para atualizar parameter set e segmentos
    const result = await prisma.$transaction(async (tx) => {
      // Atualiza o parameter set
      const parameterSet = await tx.rfvParameterSet.update({
        where: { id: parseInt(id) },
        data: updateData
      });

      // Atualiza segmentos se fornecidos
      if (segments && Array.isArray(segments)) {
        // Remove segmentos existentes
        await tx.rfvSegment.deleteMany({
          where: { parameterSetId: parseInt(id) }
        });

        // Cria novos segmentos
        if (segments.length > 0) {
          const segmentsData = segments.map((segment: any, index: number) => ({
            parameterSetId: parseInt(id),
            name: segment.segment_name,
            rules: segment.rules,
            priority: segment.priority || index
          }));

          await tx.rfvSegment.createMany({
            data: segmentsData
          });
        }
      }

      // Buscar o resultado completo
      return await tx.rfvParameterSet.findUnique({
        where: { id: parseInt(id) },
        include: {
          segments: true,
          filial: {
            select: {
              id: true,
              nome: true
            }
          }
        }
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/rfv/parameters - Remover parâmetros RFV
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    // Usar transação para remover segmentos e parameter set
    await prisma.$transaction(async (tx) => {
      // Remove segmentos primeiro (foreign key)
      await tx.rfvSegment.deleteMany({
        where: { parameterSetId: parseInt(id) }
      });

      // Remove o parameter set
      await tx.rfvParameterSet.delete({
        where: { id: parseInt(id) }
      });
    });

    return NextResponse.json({ message: 'Parâmetros RFV removidos com sucesso' });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
