import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/rfv-parameters - Lista todos os parameter sets ou busca por filialId
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filialId = searchParams.get('filialId');

  try {
    let whereClause: any = {};

    if (filialId) {
      whereClause.filialId = parseInt(filialId);
    }

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

// POST /api/rfv-parameters - Cria um novo parameter set
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      filialId,
      name,
      strategy = 'threshold',
      windowDays = 180,
      weights = { r: 1, f: 1, v: 1 },
      ruleRecency,
      ruleFrequency,
      ruleValue,
      effectiveFrom,
      effectiveTo,
      calculation_strategy = 'automatic',
      class_ranges,
      conditional_rules,
      segments = []
    } = body;

    // Validações básicas
    if (!name || !ruleRecency || !ruleFrequency || !ruleValue || !effectiveFrom) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios faltando: name, ruleRecency, ruleFrequency, ruleValue, effectiveFrom' 
      }, { status: 400 });
    }

    // Usar transação para criar parameter set e segmentos
    const result = await prisma.$transaction(async (tx) => {
      // Inativa configurações anteriores da mesma filial se necessário
      if (filialId) {
        await tx.rfvParameterSet.updateMany({
          where: {
            filialId: parseInt(filialId),
            effectiveTo: null
          },
          data: {
            effectiveTo: new Date()
          }
        });
      }

      // Cria o parameter set
      const parameterSet = await tx.rfvParameterSet.create({
        data: {
          filialId: filialId ? parseInt(filialId) : null,
          name,
          strategy,
          windowDays,
          weights,
          ruleRecency,
          ruleFrequency,
          ruleValue,
          effectiveFrom: new Date(effectiveFrom),
          effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
          calculationStrategy: calculation_strategy,
          classRanges: class_ranges,
          conditionalRules: conditional_rules
        }
      });

      // Cria os segmentos se existirem
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

      // Busca o resultado completo
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

// PUT /api/rfv-parameters - Atualiza um parameter set existente
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
        data: {
          ...updateData,
          effectiveFrom: updateData.effectiveFrom ? new Date(updateData.effectiveFrom) : undefined,
          effectiveTo: updateData.effectiveTo ? new Date(updateData.effectiveTo) : undefined,
          calculationStrategy: updateData.calculation_strategy,
          classRanges: updateData.class_ranges,
          conditionalRules: updateData.conditional_rules
        }
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

      // Busca o resultado completo
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

// DELETE /api/rfv-parameters - Remove um parameter set
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

    return NextResponse.json({ message: 'Parameter set removido com sucesso' });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
