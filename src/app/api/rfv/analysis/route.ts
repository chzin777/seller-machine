import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase/server';

// GET /api/rfv/analysis - Executar análise RFV dos clientes
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const { searchParams } = new URL(req.url);
  const filialId = searchParams.get('filialId');
  const parameterSetId = searchParams.get('parameterSetId');

  try {
    // Buscar parâmetros RFV ativos
    let paramQuery = supabase
      .from('rfv_parameters_sets')
      .select(`
        *,
        rfv_segments (*)
      `)
      .is('effectiveTo', null)
      .order('createdAt', { ascending: false });

    if (parameterSetId) {
      paramQuery = paramQuery.eq('id', parseInt(parameterSetId));
    } else if (filialId) {
      paramQuery = paramQuery.eq('filialId', parseInt(filialId));
    }

    const { data: parameters, error: paramError } = await paramQuery.limit(1).single();

    if (paramError || !parameters) {
      return NextResponse.json({ 
        error: 'Nenhum parâmetro RFV ativo encontrado' 
      }, { status: 404 });
    }

    // Buscar dados dos clientes para análise
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select(`
        id,
        customer_code,
        name,
        created_at,
        customer_stats (
          last_order_at,
          last_order_value,
          lifetime_value,
          orders_count
        )
      `);

    if (customersError) {
      console.error('Erro ao buscar clientes:', customersError);
      return NextResponse.json({ error: customersError.message }, { status: 500 });
    }

    // Calcular scores RFV para cada cliente
    const rfvAnalysis = customers.map(customer => {
      const stats = customer.customer_stats?.[0];
      if (!stats) {
        return {
          customer_id: customer.id,
          customer_code: customer.customer_code,
          customer_name: customer.name,
          recency_score: 1,
          frequency_score: 1,
          value_score: 1,
          total_score: 3,
          segment: 'Sem dados'
        };
      }

      // Calcular Recência (dias desde última compra)
      const lastOrderDate = stats.last_order_at ? new Date(stats.last_order_at) : null;
      const daysSinceLastOrder = lastOrderDate ? 
        Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

      // Calcular score de Recência
      let recencyScore = 1;
      for (const range of parameters.ruleRecency) {
        if (range.min !== undefined && range.max !== undefined) {
          if (daysSinceLastOrder >= range.min && daysSinceLastOrder < range.max) {
            recencyScore = range.score;
            break;
          }
        } else if (range.max !== undefined) {
          if (daysSinceLastOrder < range.max) {
            recencyScore = range.score;
            break;
          }
        } else if (range.min !== undefined) {
          if (daysSinceLastOrder >= range.min) {
            recencyScore = range.score;
            break;
          }
        }
      }

      // Calcular score de Frequência
      const ordersCount = stats.orders_count || 0;
      let frequencyScore = 1;
      for (const range of parameters.ruleFrequency) {
        if (range.min !== undefined && range.max !== undefined) {
          if (ordersCount >= range.min && ordersCount <= range.max) {
            frequencyScore = range.score;
            break;
          }
        } else if (range.max !== undefined) {
          if (ordersCount <= range.max) {
            frequencyScore = range.score;
            break;
          }
        } else if (range.min !== undefined) {
          if (ordersCount >= range.min) {
            frequencyScore = range.score;
            break;
          }
        }
      }

      // Calcular score de Valor
      const lifetimeValue = parseFloat(stats.lifetime_value || '0');
      let valueScore = 1;
      for (const range of parameters.ruleValue) {
        if (range.min !== undefined && range.max !== undefined) {
          if (lifetimeValue >= range.min && lifetimeValue <= range.max) {
            valueScore = range.score;
            break;
          }
        } else if (range.max !== undefined) {
          if (lifetimeValue <= range.max) {
            valueScore = range.score;
            break;
          }
        } else if (range.min !== undefined) {
          if (lifetimeValue >= range.min) {
            valueScore = range.score;
            break;
          }
        }
      }

      const totalScore = recencyScore + frequencyScore + valueScore;

      // Determinar segmento
      let segment = 'Não classificado';
      
      if (parameters.calculation_strategy === 'automatic' && parameters.class_ranges) {
        if (totalScore >= parameters.class_ranges.ouro.min && totalScore <= parameters.class_ranges.ouro.max) {
          segment = 'Ouro';
        } else if (totalScore >= parameters.class_ranges.prata.min && totalScore <= parameters.class_ranges.prata.max) {
          segment = 'Prata';
        } else if (totalScore >= parameters.class_ranges.bronze.min && totalScore <= parameters.class_ranges.bronze.max) {
          segment = 'Bronze';
        }
      } else if (parameters.calculation_strategy === 'manual' && parameters.rfv_segments) {
        // Avaliar segmentos em ordem de prioridade
        const sortedSegments = [...parameters.rfv_segments].sort((a, b) => (a.priority || 0) - (b.priority || 0));
        
        for (const seg of sortedSegments) {
          if (seg.rules) {
            let matches = true;
            
            if (seg.rules.R && !evaluateRule(seg.rules.R, recencyScore)) matches = false;
            if (seg.rules.F && !evaluateRule(seg.rules.F, frequencyScore)) matches = false;
            if (seg.rules.V && !evaluateRule(seg.rules.V, valueScore)) matches = false;
            
            if (matches) {
              segment = seg.segment_name;
              break;
            }
          }
        }
      }

      return {
        customer_id: customer.id,
        customer_code: customer.customer_code,
        customer_name: customer.name,
        recency_score: recencyScore,
        frequency_score: frequencyScore,
        value_score: valueScore,
        total_score: totalScore,
        segment,
        days_since_last_order: daysSinceLastOrder,
        orders_count: ordersCount,
        lifetime_value: lifetimeValue
      };
    });

    return NextResponse.json({
      parameters_used: parameters,
      analysis_date: new Date().toISOString(),
      total_customers: rfvAnalysis.length,
      results: rfvAnalysis
    });

  } catch (error) {
    console.error('Erro interno na análise RFV:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// Função auxiliar para avaliar regras de segmentação manual
function evaluateRule(rule: string, score: number): boolean {
  if (rule.startsWith('>=')) {
    return score >= parseInt(rule.substring(2));
  } else if (rule.startsWith('<=')) {
    return score <= parseInt(rule.substring(2));
  } else if (rule.startsWith('>')) {
    return score > parseInt(rule.substring(1));
  } else if (rule.startsWith('<')) {
    return score < parseInt(rule.substring(1));
  } else if (rule.startsWith('=')) {
    return score === parseInt(rule.substring(1));
  }
  return false;
}
