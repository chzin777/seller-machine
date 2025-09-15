import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de teste que simula a lógica avançada de clientes inativos
 * que deve ser implementada na API externa
 * 
 * GET /api/test/clientes-inativos-avancado
 * 
 * Query Parameters:
 * - dias: número de dias (default: 90)
 * - valorMinimo: valor mínimo da compra (default: 0)
 * - considerarTipo: se deve filtrar por tipo (default: false)
 * - excluirTipos: tipos para excluir, separados por vírgula (ex: "PF,VIP")
 * - empresaId: ID da empresa (default: 1)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    
    // Extrair parâmetros
    const dias = Number(searchParams.get('dias')) || 90;
    const valorMinimo = Number(searchParams.get('valorMinimo')) || 0;
    const considerarTipo = searchParams.get('considerarTipo') === 'true';
    const excluirTipos = searchParams.get('excluirTipos')?.split(',').filter(Boolean) || [];
    const empresaId = Number(searchParams.get('empresaId')) || 1;

    console.log('🔍 Parâmetros recebidos:', {
      dias, valorMinimo, considerarTipo, excluirTipos, empresaId
    });

    // 1. Buscar configuração da empresa se parâmetros não fornecidos explicitamente
    let config = {
      diasSemCompra: dias,
      valorMinimoCompra: valorMinimo,
      considerarTipoCliente: considerarTipo,
      tiposClienteExcluidos: excluirTipos,
    };

    // Se não há parâmetros específicos, buscar da configuração
    if (!searchParams.has('valorMinimo') && !searchParams.has('considerarTipo')) {
      try {
        const configResponse = await fetch(`${req.nextUrl.origin}/api/proxy?url=/api/configuracao-inatividade/empresa/${empresaId}`);
        
        if (configResponse.ok) {
          const configData = await configResponse.json();
          config = {
            diasSemCompra: configData.diasSemCompra || 90,
            valorMinimoCompra: configData.valorMinimoCompra || 0,
            considerarTipoCliente: configData.considerarTipoCliente || false,
            tiposClienteExcluidos: configData.tiposClienteExcluidos || [],
          };
          console.log('✅ Configuração carregada da empresa:', config);
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar configuração, usando parâmetros padrão:', error);
      }
    }

    // 2. Buscar todas as notas fiscais via proxy
    const notasResponse = await fetch(`${req.nextUrl.origin}/api/proxy?url=/api/notas-fiscais`);
    if (!notasResponse.ok) {
      throw new Error(`Erro ao buscar notas fiscais: ${notasResponse.status}`);
    }

    const notasData = await notasResponse.json();
    const todasNotas = Array.isArray(notasData) ? notasData : (notasData.data || []);
    
    console.log(`📋 Total de notas fiscais: ${todasNotas.length}`);

    // 3. Buscar todos os clientes via proxy
    const clientesResponse = await fetch(`${req.nextUrl.origin}/api/proxy?url=/api/clientes`);
    if (!clientesResponse.ok) {
      throw new Error(`Erro ao buscar clientes: ${clientesResponse.status}`);
    }

    const clientesData = await clientesResponse.json();
    const todosClientes = Array.isArray(clientesData) ? clientesData : (clientesData.data || []);
    
    console.log(`👥 Total de clientes: ${todosClientes.length}`);

    // 4. Aplicar filtros

    // Filtro por tipo de cliente (simular campo tipo_cliente)
    let clientesPermitidos = todosClientes;
    if (config.considerarTipoCliente && config.tiposClienteExcluidos.length > 0) {
      // Simular tipos de cliente baseado em padrões do nome/ID
      clientesPermitidos = todosClientes.filter(cliente => {
        // Simulação: clientes com ID par = PF, ímpar = PJ, múltiplos de 5 = VIP, etc.
        let tipoSimulado = 'PF';
        if (cliente.id % 5 === 0) tipoSimulado = 'VIP';
        else if (cliente.id % 3 === 0) tipoSimulado = 'ESPECIAL';
        else if (cliente.id % 2 === 0) tipoSimulado = 'PF';
        else tipoSimulado = 'PJ';
        
        return !config.tiposClienteExcluidos.includes(tipoSimulado);
      });
      
      console.log(`🎯 Clientes após filtro por tipo: ${clientesPermitidos.length} (excluindo: ${config.tiposClienteExcluidos.join(', ')})`);
    }

    const clientesPermitidosIds = new Set(clientesPermitidos.map(c => c.id));

    // 5. Calcular última compra válida por cliente
    const ultimasComprasValidas = new Map();
    
    todasNotas.forEach(nota => {
      const clienteId = nota.clienteId || nota.cliente_id;
      const valorTotal = parseFloat(nota.valorTotal || nota.valor_total || 0);
      const dataEmissao = nota.dataEmissao || nota.data_emissao;
      
      // Aplicar filtros
      if (!clientesPermitidosIds.has(clienteId)) return; // Filtro por tipo
      if (valorTotal < config.valorMinimoCompra) return; // Filtro por valor mínimo
      
      const dataCompra = new Date(dataEmissao);
      const compraAtual = ultimasComprasValidas.get(clienteId);
      
      if (!compraAtual || dataCompra > compraAtual.data) {
        ultimasComprasValidas.set(clienteId, {
          data: dataCompra,
          valor: valorTotal,
          notaId: nota.id
        });
      }
    });

    console.log(`💰 Clientes com compras válidas (valor >= R$ ${config.valorMinimoCompra}): ${ultimasComprasValidas.size}`);

    // 6. Identificar clientes inativos
    const dataAtual = new Date();
    const clientesInativos = [];
    const clientesAtivos = [];
    
    clientesPermitidos.forEach(cliente => {
      const ultimaCompra = ultimasComprasValidas.get(cliente.id);
      
      if (!ultimaCompra) {
        // Cliente nunca fez compra válida
        clientesInativos.push({
          id: cliente.id,
          nome: cliente.nome,
          ultimaCompraValida: null,
          diasSemCompraValida: 999,
          motivo: 'Nunca fez compra válida'
        });
      } else {
        const diasSemCompra = Math.floor((dataAtual.getTime() - ultimaCompra.data.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasSemCompra >= config.diasSemCompra) {
          clientesInativos.push({
            id: cliente.id,
            nome: cliente.nome,
            ultimaCompraValida: ultimaCompra.data.toISOString().split('T')[0],
            valorUltimaCompra: ultimaCompra.valor,
            diasSemCompraValida: diasSemCompra,
            motivo: `${diasSemCompra} dias sem compra válida`
          });
        } else {
          clientesAtivos.push({
            id: cliente.id,
            nome: cliente.nome,
            ultimaCompraValida: ultimaCompra.data.toISOString().split('T')[0],
            valorUltimaCompra: ultimaCompra.valor,
            diasSemCompraValida: diasSemCompra
          });
        }
      }
    });

    // 7. Preparar resposta detalhada
    const response = {
      // Compatibilidade com endpoint original
      total_clientes_inativos: clientesInativos.length,
      
      // Dados detalhados para debugging
      configuracao_aplicada: config,
      
      estatisticas: {
        total_clientes: todosClientes.length,
        clientes_apos_filtro_tipo: clientesPermitidos.length,
        clientes_com_compras_validas: ultimasComprasValidas.size,
        clientes_inativos: clientesInativos.length,
        clientes_ativos: clientesAtivos.length,
      },
      
      filtros_aplicados: {
        filtro_valor: config.valorMinimoCompra > 0 ? `Apenas compras >= R$ ${config.valorMinimoCompra.toFixed(2)}` : 'Sem filtro de valor',
        filtro_tipo: config.considerarTipoCliente ? `Excluindo tipos: ${config.tiposClienteExcluidos.join(', ')}` : 'Sem filtro de tipo',
        filtro_dias: `Inativos há mais de ${config.diasSemCompra} dias`
      },
      
      // Samples para debugging (primeiros 5 de cada)
      samples: {
        clientes_inativos: clientesInativos.slice(0, 5),
        clientes_ativos: clientesAtivos.slice(0, 5)
      },

      // Debug info
      debug: {
        notas_processadas: todasNotas.length,
        clientes_processados: todosClientes.length,
        timestamp: new Date().toISOString()
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro no endpoint de teste:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      debug: {
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}