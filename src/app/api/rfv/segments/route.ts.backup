import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

// GET /api/rfv/segments - Listar segmentos RFV
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parameterSetId = searchParams.get('parameterSetId');

  try {
    const whereClause = parameterSetId ? { parameterSetId: parseInt(parameterSetId) } : {};

    const segments = await prisma.rfvSegment.findMany({
      where: whereClause,
      include: {
        parameterSet: {
          select: {
            id: true,
            name: true,
            filialId: true
          }
        }
      },
      orderBy: {
        priority: 'asc'
      }
    });

    return NextResponse.json(segments);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/rfv/segments - Criar novo segmento RFV
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      parameterSetId,
      segment_name,
      rules,
      priority
    } = body;

    // Validações básicas
    if (!parameterSetId || !segment_name || !rules) {
      return NextResponse.json({ 
        error: 'Dados obrigatórios faltando: parameterSetId, segment_name, rules' 
      }, { status: 400 });
    }

    // Verificar se o parameter set existe
    const parameterSet = await prisma.rfvParameterSet.findUnique({
      where: { id: parameterSetId },
      select: { id: true }
    });

    if (!parameterSet) {
      return NextResponse.json({ 
        error: 'Parameter set não encontrado' 
      }, { status: 404 });
    }

    // Criar o segmento
    const segment = await prisma.rfvSegment.create({
      data: {
        parameterSetId,
        name: segment_name,
        rules,
        priority: priority || 0
      },
      include: {
        parameterSet: {
          select: {
            id: true,
            name: true,
            filialId: true
          }
        }
      }
    });

    return NextResponse.json(segment);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/rfv/segments - Atualizar segmento RFV existente
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      parameterSetId,
      segment_name,
      rules,
      priority
    } = body;

    // Validações básicas
    if (!id) {
      return NextResponse.json({ 
        error: 'ID do segmento é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se o segmento existe
    const existingSegment = await prisma.rfvSegment.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingSegment) {
      return NextResponse.json({ 
        error: 'Segmento não encontrado' 
      }, { status: 404 });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (parameterSetId !== undefined) updateData.parameterSetId = parameterSetId;
    if (segment_name !== undefined) updateData.name = segment_name;
    if (rules !== undefined) updateData.rules = rules;
    if (priority !== undefined) updateData.priority = priority;

    // Atualizar o segmento
    const updatedSegment = await prisma.rfvSegment.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        parameterSet: true
      }
    });

    return NextResponse.json(updatedSegment);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/rfv/segments - Deletar segmento RFV
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const segmentId = searchParams.get('id');

  try {
    if (!segmentId) {
      return NextResponse.json({ 
        error: 'ID do segmento é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se o segmento existe
    const existingSegment = await prisma.rfvSegment.findUnique({
      where: { id: parseInt(segmentId) },
      select: { id: true, name: true }
    });

    if (!existingSegment) {
      return NextResponse.json({ 
        error: 'Segmento não encontrado' 
      }, { status: 404 });
    }

    // Deletar o segmento
    await prisma.rfvSegment.delete({
      where: { id: parseInt(segmentId) }
    });

    return NextResponse.json({ 
      message: `Segmento "${existingSegment.name}" deletado com sucesso`,
      deletedSegmentId: parseInt(segmentId)
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
