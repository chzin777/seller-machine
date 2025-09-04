import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase/server';

// GET /api/rfv/parameters - Buscar parâmetros RFV
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const active = searchParams.get('active');
  const filialId = searchParams.get('filialId');

  try {
    let query = supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        segments (*)
      `);

    // Filtrar por ativo se especificado
    if (active === 'true') {
      query = query.is('effectiveTo', null);
    }

    // Filtrar por filial se especificado
    if (filialId) {
      if (filialId === 'all') {
        query = query.is('filialId', null);
      } else {
        query = query.eq('filialId', parseInt(filialId));
      }
    }

    query = query.order('createdAt', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar parâmetros RFV:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST /api/rfv/parameters - Criar novos parâmetros RFV
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  
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
      const { data: existingGlobal } = await supabase
        .from('rfv_parameters_sets')
        .select('id')
        .is('filialId', null)
        .is('effectiveTo', null);

      if (existingGlobal && existingGlobal.length > 0) {
        return NextResponse.json({ 
          error: 'Já existe uma configuração global ativa. Desative-a antes de criar uma nova.' 
        }, { status: 400 });
      }
    } else {
      // Verificar se já existe configuração para esta filial
      const { data: existingFilial } = await supabase
        .from('rfv_parameters_sets')
        .select('id')
        .eq('filialId', finalFilialId)
        .is('effectiveTo', null);

      if (existingFilial && existingFilial.length > 0) {
        return NextResponse.json({ 
          error: `Já existe uma configuração ativa para a filial ${finalFilialId}. Desative-a antes de criar uma nova.` 
        }, { status: 400 });
      }

      // Verificar se existe configuração global que conflitaria
      const { data: existingGlobal } = await supabase
        .from('rfv_parameters_sets')
        .select('id')
        .is('filialId', null)
        .is('effectiveTo', null);

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

    // Criar o parameter set
    const { data: parameterSet, error: parameterError } = await supabase
      .from('rfv_parameters_sets')
      .insert({
        filialId: finalFilialId,
        name,
        strategy: 'threshold',
        windowDays: 365,
        weights: { R: 1, F: 1, V: 1 },
        ruleRecency,
        ruleFrequency,
        ruleValue,
        effectiveFrom,
        effectiveTo: null,
        calculation_strategy: segmentationMethod,
        class_ranges: automaticRanges || null,
        conditional_rules: null
      })
      .select()
      .single();

    if (parameterError) {
      console.error('Erro ao criar parameter set:', parameterError);
      return NextResponse.json({ error: parameterError.message }, { status: 500 });
    }

    // Criar os segmentos se existirem
    if (segments.length > 0) {
      const segmentsData = segments.map((segment: any, index: number) => ({
        parameterSetId: parameterSet.id,
        segment_name: segment.segment_name,
        rules: segment.rules,
        priority: segment.priority || index
      }));

      const { error: segmentsError } = await supabase
        .from('segments')
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

    // Buscar o resultado completo
    const { data: result, error: fetchError } = await supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        segments (*)
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

// PUT /api/rfv/parameters - Atualizar parâmetros RFV existentes
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
        .from('segments')
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
          .from('segments')
          .insert(segmentsData);

        if (segmentsError) {
          console.error('Erro ao criar segmentos:', segmentsError);
          return NextResponse.json({ error: 'Erro ao atualizar segmentos: ' + segmentsError.message }, { status: 500 });
        }
      }
    }

    // Buscar o resultado completo
    const { data: result, error: fetchError } = await supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        segments (*)
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

// DELETE /api/rfv/parameters - Remover parâmetros RFV
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
      .from('segments')
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

    return NextResponse.json({ message: 'Parâmetros RFV removidos com sucesso' });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
