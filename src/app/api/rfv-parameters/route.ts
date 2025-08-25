import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase/server';

// GET /api/rfv-parameters - Lista todos os parameter sets ou busca por filialId
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const filialId = searchParams.get('filialId');

  try {
    let query = supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        rfv_segments (*)
      `);

    if (filialId) {
      query = query.eq('filialId', parseInt(filialId));
    }

    query = query.order('createdAt', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar parameters:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/rfv-parameters - Cria um novo parameter set
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  
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

    // Inativa configurações anteriores da mesma filial se necessário
    if (filialId) {
      await supabase
        .from('rfv_parameters_sets')
        .update({ effectiveTo: new Date().toISOString().split('T')[0] })
        .eq('filialId', filialId)
        .is('effectiveTo', null);
    }

    // Cria o parameter set
    const { data: parameterSet, error: parameterError } = await supabase
      .from('rfv_parameters_sets')
      .insert({
        filialId,
        name,
        strategy,
        windowDays,
        weights,
        ruleRecency,
        ruleFrequency,
        ruleValue,
        effectiveFrom,
        effectiveTo,
        calculation_strategy,
        class_ranges,
        conditional_rules
      })
      .select()
      .single();

    if (parameterError) {
      console.error('Erro ao criar parameter set:', parameterError);
      return NextResponse.json({ error: parameterError.message }, { status: 500 });
    }

    // Cria os segmentos se existirem
    if (segments.length > 0) {
      const segmentsData = segments.map((segment: any, index: number) => ({
        parameterSetId: parameterSet.id,
        segment_name: segment.segment_name,
        rules: segment.rules,
        priority: segment.priority || index
      }));

      const { error: segmentsError } = await supabase
        .from('rfv_segments')
        .insert(segmentsData);

      if (segmentsError) {
        console.error('Erro ao criar segmentos:', segmentsError);
        // Rollback: remove o parameter set criado
        await supabase
          .from('rfv_parameters_sets')
          .delete()
          .eq('id', parameterSet.id);
        
        return NextResponse.json({ error: 'Erro ao criar segmentos: ' + segmentsError.message }, { status: 500 });
      }
    }

    // Busca o resultado completo
    const { data: result, error: fetchError } = await supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        rfv_segments (*)
      `)
      .eq('id', parameterSet.id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar resultado:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT /api/rfv-parameters - Atualiza um parameter set existente
export async function PUT(req: NextRequest) {
  const supabase = createServerClient();
  
  try {
    const body = await req.json();
    const { id, segments, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório para atualização' }, { status: 400 });
    }

    // Atualiza o parameter set
    const { data: parameterSet, error: parameterError } = await supabase
      .from('rfv_parameters_sets')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (parameterError) {
      console.error('Erro ao atualizar parameter set:', parameterError);
      return NextResponse.json({ error: parameterError.message }, { status: 500 });
    }

    // Atualiza segmentos se fornecidos
    if (segments && Array.isArray(segments)) {
      // Remove segmentos existentes
      await supabase
        .from('rfv_segments')
        .delete()
        .eq('parameterSetId', id);

      // Cria novos segmentos
      if (segments.length > 0) {
        const segmentsData = segments.map((segment: any, index: number) => ({
          parameterSetId: id,
          segment_name: segment.segment_name,
          rules: segment.rules,
          priority: segment.priority || index
        }));

        const { error: segmentsError } = await supabase
          .from('rfv_segments')
          .insert(segmentsData);

        if (segmentsError) {
          console.error('Erro ao criar segmentos:', segmentsError);
          return NextResponse.json({ error: 'Erro ao atualizar segmentos: ' + segmentsError.message }, { status: 500 });
        }
      }
    }

    // Busca o resultado completo
    const { data: result, error: fetchError } = await supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        rfv_segments (*)
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Erro ao buscar resultado:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE /api/rfv-parameters - Remove um parameter set
export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }

  try {
    // Remove segmentos primeiro (foreign key)
    await supabase
      .from('rfv_segments')
      .delete()
      .eq('parameterSetId', parseInt(id));

    // Remove o parameter set
    const { error } = await supabase
      .from('rfv_parameters_sets')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('Erro ao deletar parameter set:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Parameter set removido com sucesso' });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
