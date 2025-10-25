import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requirePermission } from '../../../../../lib/permissions';

// GET /api/rfv-parameters/[id] - Busca um parameter set específico
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_RFV')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const parameterSet = await prisma.rfvParameterSet.findUnique({
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

    if (!parameterSet) {
      return NextResponse.json({ error: 'Parameter set não encontrado' }, { status: 404 });
    }

    return NextResponse.json(parameterSet);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/rfv-parameters/[id] - Atualiza um parameter set específico
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_RFV')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { segments, ...updateData } = body;

    // Usar transação para atualizar parameter set e segmentos
    const result = await prisma.$transaction(async (tx: any) => {
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

// DELETE /api/rfv-parameters/[id] - Remove um parameter set específico
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('MANAGE_RFV')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    // Verificar se o parameter set existe
    const exists = await prisma.rfvParameterSet.findUnique({
      where: { id: parseInt(id) }
    });

    if (!exists) {
      return NextResponse.json({ error: 'Parameter set não encontrado' }, { status: 404 });
    }

    // Usar transação para remover segmentos e parameter set
    await prisma.$transaction(async (tx: any) => {
      // Remove segmentos primeiro (foreign key)
      await tx.rfvSegment.deleteMany({
        where: { parameterSetId: parseInt(id) }
      });

      // Remove o parameter set
      await tx.rfvParameterSet.delete({
        where: { id: parseInt(id) }
      });
    });

    return NextResponse.json({ 
      message: 'Parameter set removido com sucesso',
      id: parseInt(id)
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}