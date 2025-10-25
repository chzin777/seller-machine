import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../../lib/scope';
import { requirePermission } from '../../../../../lib/permissions';

// GET /api/rfv/analysis - Executar análise RFV dos clientes
export async function GET(req: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('VIEW_AI_DASHBOARD')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const filialId = searchParams.get('filialId');
  const parameterSetId = searchParams.get('parameterSetId');

  const scope = deriveScopeFromRequest(req);

  try {
    // Buscar parâmetros RFV ativos
    let whereClause: any = {
      effectiveTo: null
    };

    if (parameterSetId) {
      whereClause.id = parseInt(parameterSetId);
    } else if (filialId) {
      whereClause.filialId = parseInt(filialId);
    }

    // Se não houver filial explicitada, aplicar escopo de filial/regional/diretoria
    if (!whereClause.filialId) {
      if (scope.role === 'VENDEDOR' || scope.role === 'GESTOR_I') {
        if (scope.filialId) whereClause.filialId = scope.filialId;
      } else if (scope.role === 'GESTOR_II') {
        if (scope.regionalId) whereClause.filial = { is: { regionalId: scope.regionalId } } as any;
      } else if (scope.role === 'GESTOR_III') {
        if (scope.diretoriaId) whereClause.filial = { is: { regionais: { is: { diretoriaId: scope.diretoriaId } } } } as any;
      }
    }

    const parameters = await prisma.rfvParameterSet.findFirst({
      where: whereClause,
      include: {
        segments: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!parameters) {
      return NextResponse.json({ 
        error: 'Nenhum parâmetro RFV ativo encontrado' 
      }, { status: 404 });
    }

    // Buscar dados dos clientes para análise com escopo nas notas fiscais
    const customers = await prisma.cliente.findMany({
      select: {
        id: true,
        cpfCnpj: true,
        nome: true,
        notasFiscais: {
          select: {
            dataEmissao: true,
            valorTotal: true
          },
          where: applyBasicScopeToWhere({}, scope, { filialKey: 'filialId', userKey: 'vendedorId' }),
          orderBy: {
            dataEmissao: 'desc'
          }
        }
      }
    });

    // Calcular scores RFV para cada cliente
    const rfvAnalysis = customers.map(customer => {
      const notasFiscais = customer.notasFiscais || [];
      if (notasFiscais.length === 0) {
        return {
          customer_id: customer.id,
          customer_code: customer.cpfCnpj,
          customer_name: customer.nome,
          recency_score: 1,
          frequency_score: 1,
          value_score: 1,
          total_score: 3,
          segment: 'Sem dados'
        };
      }

      // Calcular Recência (dias desde última compra)
      const lastOrderDate = notasFiscais[0]?.dataEmissao ? new Date(notasFiscais[0].dataEmissao) : null;
      const daysSinceLastOrder = lastOrderDate ? 
        Math.floor((new Date().getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;

      // Calcular score de Recência
      let recencyScore = 1;
      for (const range of (parameters.ruleRecency as any).bins || []) {
        if (range.min !== undefined && range.max_dias !== undefined) {
          if (daysSinceLastOrder >= range.min && daysSinceLastOrder < range.max_dias) {
            recencyScore = range.score;
            break;
          }
        } else if (range.max_dias !== undefined) {
          if (daysSinceLastOrder < range.max_dias) {
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
      const ordersCount = notasFiscais.length;
      let frequencyScore = 1;
      for (const range of (parameters.ruleFrequency as any).bins || []) {
        if (range.min_compras !== undefined && range.max !== undefined) {
          if (ordersCount >= range.min_compras && ordersCount <= range.max) {
            frequencyScore = range.score;
            break;
          }
        } else if (range.max !== undefined) {
          if (ordersCount <= range.max) {
            frequencyScore = range.score;
            break;
          }
        } else if (range.min_compras !== undefined) {
          if (ordersCount >= range.min_compras) {
            frequencyScore = range.score;
            break;
          }
        }
      }

      // Calcular score de Valor
      const lifetimeValue = notasFiscais.reduce((total, nf) => total + (parseFloat(nf.valorTotal?.toString() || '0')), 0);
      let valueScore = 1;
      for (const range of (parameters.ruleValue as any).bins || []) {
        if (range.min_valor !== undefined && range.max !== undefined) {
          if (lifetimeValue >= range.min_valor && lifetimeValue <= range.max) {
            valueScore = range.score;
            break;
          }
        } else if (range.max !== undefined) {
          if (lifetimeValue <= range.max) {
            valueScore = range.score;
            break;
          }
        } else if (range.min_valor !== undefined) {
          if (lifetimeValue >= range.min_valor) {
            valueScore = range.score;
            break;
          }
        }
      }

      const totalScore = recencyScore + frequencyScore + valueScore;

      // Determinar segmento
      let segment = 'Não classificado';
      
      if (parameters.calculationStrategy === 'automatic' && parameters.classRanges) {
        const classRanges = parameters.classRanges as any;
        if (totalScore >= classRanges.ouro?.min && totalScore <= classRanges.ouro?.max) {
          segment = 'Ouro';
        } else if (totalScore >= classRanges.prata?.min && totalScore <= classRanges.prata?.max) {
          segment = 'Prata';
        } else if (totalScore >= classRanges.bronze?.min && totalScore <= classRanges.bronze?.max) {
          segment = 'Bronze';
        }
      } else if (parameters.calculationStrategy === 'manual' && parameters.segments) {
        // Avaliar segmentos em ordem de prioridade
        const sortedSegments = [...parameters.segments].sort((a, b) => (a.priority || 0) - (b.priority || 0));
        
        for (const seg of sortedSegments) {
          if (seg.rules) {
            let matches = true;
            const rules = seg.rules as any;
            
            if (rules.R && !evaluateRule(rules.R, recencyScore)) matches = false;
            if (rules.F && !evaluateRule(rules.F, frequencyScore)) matches = false;
            if (rules.V && !evaluateRule(rules.V, valueScore)) matches = false;
            
            if (matches) {
              segment = seg.name;
              break;
            }
          }
        }
      }

      return {
        customer_id: customer.id,
        customer_code: customer.cpfCnpj,
        customer_name: customer.nome,
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
