import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase/server';

// GET /api/rfv/segments - Listar segmentos RFV
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const parameterSetId = searchParams.get('parameterSetId');

  try {
    let query = supabase
      .from('segments')
      .select(`
        *,
        rfv_parameters_sets (
          id,
          name,
          filialId
        )
      `)
      .order('priority', { ascending: true });

    if (parameterSetId) {
      query = query.eq('parameterSetId', parseInt(parameterSetId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar segmentos RFV:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/rfv/segments - Criar novo segmento RFV
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  
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
    const { data: parameterSet, error: paramError } = await supabase
      .from('rfv_parameters_sets')
      .select('id')
      .eq('id', parameterSetId)
      .single();

    if (paramError || !parameterSet) {
      return NextResponse.json({ 
        error: 'Parameter set não encontrado' 
      }, { status: 404 });
    }

    // Criar o segmento
    const { data: segment, error: segmentError } = await supabase
      .from('segments')
      .insert({
        parameterSetId,
        segment_name,
        rules,
        priority: priority || 0
      })
      .select()
      .single();

    if (segmentError) {
      console.error('Erro ao criar segmento:', segmentError);
      return NextResponse.json({ error: segmentError.message }, { status: 500 });
    }

    return NextResponse.json(segment);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/rfv/segments - Atualizar segmento RFV existente
export async function PUT(req: NextRequest) {
  const supabase = createServerClient();
  
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
    const { data: existingSegment, error: existsError } = await supabase
      .from('segments')
      .select('id')
      .eq('id', id)
      .single();

    if (existsError || !existingSegment) {
      return NextResponse.json({ 
        error: 'Segmento não encontrado' 
      }, { status: 404 });
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (parameterSetId !== undefined) updateData.parameterSetId = parameterSetId;
    if (segment_name !== undefined) updateData.segment_name = segment_name;
    if (rules !== undefined) updateData.rules = rules;
    if (priority !== undefined) updateData.priority = priority;

    // Atualizar o segmento
    const { data: updatedSegment, error: updateError } = await supabase
      .from('segments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Erro ao atualizar segmento:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updatedSegment);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/rfv/segments - Deletar segmento RFV
export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const segmentId = searchParams.get('id');

  try {
    if (!segmentId) {
      return NextResponse.json({ 
        error: 'ID do segmento é obrigatório' 
      }, { status: 400 });
    }

    // Verificar se o segmento existe
    const { data: existingSegment, error: existsError } = await supabase
      .from('segments')
      .select('id, segment_name')
      .eq('id', parseInt(segmentId))
      .single();

    if (existsError || !existingSegment) {
      return NextResponse.json({ 
        error: 'Segmento não encontrado' 
      }, { status: 404 });
    }

    // Deletar o segmento
    const { error: deleteError } = await supabase
      .from('segments')
      .delete()
      .eq('id', parseInt(segmentId));

    if (deleteError) {
      console.error('Erro ao deletar segmento:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Segmento "${existingSegment.segment_name}" deletado com sucesso`,
      deletedSegmentId: parseInt(segmentId)
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
