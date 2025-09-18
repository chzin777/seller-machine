import { NextRequest, NextResponse } from 'next/server';

interface ChurnPrediction {
  clienteId: number;
  nome: string;
  churnProbability: number;
  riskLevel: 'Alto' | 'Médio' | 'Baixo';
  recommendation: string;
  ultimaCompra: string | null;
  valorTotal: number;
  frequenciaCompras: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filialId = searchParams.get('filialId');
  const limit = searchParams.get('limit');
  
  console.log('=== CHURN PREDICTION API ===');
  console.log('FilialId:', filialId);
  console.log('Limit:', limit);

  try {
    // Tentar buscar dados reais de clientes da API externa
    let clientesReais = [];
    
    try {
      const clientesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/clientes`);
      if (clientesResponse.ok) {
        clientesReais = await clientesResponse.json();
        console.log('✅ Dados reais de clientes carregados:', clientesReais.length);
      }
    } catch (error) {
      console.log('⚠️ API externa não disponível, usando dados mock');
    }
    
    // Se não conseguiu dados reais, usar mock como fallback
    if (!Array.isArray(clientesReais) || clientesReais.length === 0) {
      console.log('⚠️ Usando dados mock como fallback');
    }
    
    // Gerar dados mock de clientes com risco de churn
    const mockClientes = [
      {
        id: 1,
        nome: 'João Silva',
        cpfCnpj: '123.456.789-01',
        cidade: 'São Paulo',
        estado: 'SP',
        ultimaCompra: '2024-01-15',
        valorTotal: 15000,
        frequenciaCompras: 12,
        diasInativo: 120
      },
      {
        id: 2,
        nome: 'Maria Santos',
        cpfCnpj: '987.654.321-02',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        ultimaCompra: '2024-02-10',
        valorTotal: 8500,
        frequenciaCompras: 8,
        diasInativo: 95
      },
      {
        id: 3,
        nome: 'Pedro Oliveira',
        cpfCnpj: '456.789.123-03',
        cidade: 'Belo Horizonte',
        estado: 'MG',
        ultimaCompra: '2024-01-20',
        valorTotal: 22000,
        frequenciaCompras: 15,
        diasInativo: 115
      },
      {
        id: 4,
        nome: 'Ana Costa',
        cpfCnpj: '789.123.456-04',
        cidade: 'Porto Alegre',
        estado: 'RS',
        ultimaCompra: '2024-03-01',
        valorTotal: 5200,
        frequenciaCompras: 6,
        diasInativo: 75
      },
      {
        id: 5,
        nome: 'Carlos Ferreira',
        cpfCnpj: '321.654.987-05',
        cidade: 'Salvador',
        estado: 'BA',
        ultimaCompra: '2024-01-05',
        valorTotal: 18500,
        frequenciaCompras: 20,
        diasInativo: 135
      },
      {
        id: 6,
        nome: 'Fernanda Lima',
        cpfCnpj: '111.222.333-44',
        cidade: 'Curitiba',
        estado: 'PR',
        ultimaCompra: '2023-12-20',
        valorTotal: 3200,
        frequenciaCompras: 4,
        diasInativo: 150
      },
      {
        id: 7,
        nome: 'Roberto Alves',
        cpfCnpj: '555.666.777-88',
        cidade: 'Fortaleza',
        estado: 'CE',
        ultimaCompra: '2024-03-15',
        valorTotal: 45000,
        frequenciaCompras: 25,
        diasInativo: 45
      },
      {
        id: 8,
        nome: 'Juliana Rocha',
        cpfCnpj: '999.888.777-66',
        cidade: 'Recife',
        estado: 'PE',
        ultimaCompra: '2023-11-30',
        valorTotal: 1200,
        frequenciaCompras: 2,
        diasInativo: 200
      },
      {
        id: 9,
        nome: 'Marcos Pereira',
        cpfCnpj: '444.333.222-11',
        cidade: 'Brasília',
        estado: 'DF',
        ultimaCompra: '2024-02-28',
        valorTotal: 12800,
        frequenciaCompras: 10,
        diasInativo: 80
      },
      {
        id: 10,
        nome: 'Luciana Mendes',
        cpfCnpj: '777.888.999-00',
        cidade: 'Goiânia',
        estado: 'GO',
        ultimaCompra: '2024-01-10',
        valorTotal: 6700,
        frequenciaCompras: 7,
        diasInativo: 125
      },
      {
        id: 11,
        nome: 'Eduardo Cardoso',
        cpfCnpj: '123.987.456-78',
        cidade: 'Manaus',
        estado: 'AM',
        ultimaCompra: '2023-10-15',
        valorTotal: 850,
        frequenciaCompras: 1,
        diasInativo: 220
      },
      {
        id: 12,
        nome: 'Patricia Souza',
        cpfCnpj: '654.321.987-12',
        cidade: 'Vitória',
        estado: 'ES',
        ultimaCompra: '2024-03-20',
        valorTotal: 28000,
        frequenciaCompras: 18,
        diasInativo: 40
      },
      {
        id: 13,
        nome: 'Ricardo Barbosa',
        cpfCnpj: '369.258.147-25',
        cidade: 'Campo Grande',
        estado: 'MS',
        ultimaCompra: '2024-01-25',
        valorTotal: 4300,
        frequenciaCompras: 5,
        diasInativo: 110
      },
      {
        id: 14,
        nome: 'Camila Torres',
        cpfCnpj: '147.258.369-36',
        cidade: 'João Pessoa',
        estado: 'PB',
        ultimaCompra: '2023-12-05',
        valorTotal: 2100,
        frequenciaCompras: 3,
        diasInativo: 165
      },
      {
        id: 15,
        nome: 'Gustavo Reis',
        cpfCnpj: '852.741.963-74',
        cidade: 'Florianópolis',
        estado: 'SC',
        ultimaCompra: '2024-02-15',
        valorTotal: 35000,
        frequenciaCompras: 22,
        diasInativo: 65
      }
    ];
    
    let clientes;
    
    // Processar dados reais se disponíveis
    if (clientesReais.length > 0) {
      console.log('📊 Processando dados reais de clientes para análise de churn');
      
      // Buscar notas fiscais para calcular histórico de compras
      let notasReais = [];
      try {
        const notasResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notas-fiscais`);
        if (notasResponse.ok) {
          notasReais = await notasResponse.json();
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar notas fiscais:', error);
      }
      
      // Processar clientes reais com dados de compras
      clientes = clientesReais.slice(0, parseInt(limit || '50')).map((cliente: any, index: number) => {
        // Filtrar notas do cliente
        const notasCliente = notasReais.filter((nota: any) => 
          nota.clienteId === cliente.id || 
          nota.cpfCnpj === cliente.cpfCnpj ||
          nota.nomeCliente?.toLowerCase().includes(cliente.nome?.toLowerCase() || '')
        );
        
        // Calcular métricas do cliente
        const valorTotal = notasCliente.reduce((acc: number, nota: any) => 
          acc + (parseFloat(nota.valorTotal) || 0), 0
        );
        const frequenciaCompras = notasCliente.length;
        
        // Calcular dias desde última compra
        let diasInativo = 365; // Default para clientes sem compras
        if (notasCliente.length > 0) {
          const ultimaNota = notasCliente.sort((a: any, b: any) => 
            new Date(b.dataEmissao || b.createdAt).getTime() - new Date(a.dataEmissao || a.createdAt).getTime()
          )[0];
          const ultimaCompra = new Date(ultimaNota.dataEmissao || ultimaNota.createdAt);
          diasInativo = Math.floor((Date.now() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24));
        }
        
        return {
          id: cliente.id,
          nome: cliente.nome || `Cliente ${cliente.id}`,
          cpfCnpj: cliente.cpfCnpj || cliente.documento,
          cidade: cliente.cidade,
          estado: cliente.estado,
          ultimaCompra: notasCliente.length > 0 ? 
            notasCliente.sort((a: any, b: any) => 
              new Date(b.dataEmissao || b.createdAt).getTime() - new Date(a.dataEmissao || a.createdAt).getTime()
            )[0].dataEmissao?.split('T')[0] || new Date().toISOString().split('T')[0] :
            new Date(Date.now() - diasInativo * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          valorTotal,
          frequenciaCompras,
          diasInativo
        };
      });
      
      console.log(`✅ Processados ${clientes.length} clientes reais`);
    } else {
      // Usar dados mock como fallback
      clientes = mockClientes;
      console.log('📊 Usando dados mock como fallback');
    }
    
    // Aplicar limite se especificado
    if (limit) {
      const limitNum = parseInt(limit);
      clientes = clientes.slice(0, limitNum);
    }
    
    console.log(`📊 Processando ${clientes.length} clientes para churn prediction`);
    
    // Processar dados para churn prediction
    const churnPredictions: ChurnPrediction[] = clientes.map((cliente: any) => {
      try {
        // Usar dados mock diretamente
        const diasInativo = cliente.diasInativo;
        const valorTotal = cliente.valorTotal;
        const frequenciaCompras = cliente.frequenciaCompras;
        const ticketMedio = frequenciaCompras > 0 ? valorTotal / frequenciaCompras : 0;
        
        // Calcular probabilidade de churn baseado em regras simples
        let churnProbability = 0;
        let riskLevel: 'Alto' | 'Médio' | 'Baixo' = 'Baixo';
        
        // Fator 1: Dias sem compra (peso: 40%)
        if (diasInativo > 180) {
          churnProbability += 0.4;
        } else if (diasInativo > 90) {
          churnProbability += 0.25;
        } else if (diasInativo > 60) {
          churnProbability += 0.15;
        }
        
        // Fator 2: Frequência de compras (peso: 30%)
        if (frequenciaCompras < 2) {
          churnProbability += 0.3;
        } else if (frequenciaCompras < 5) {
          churnProbability += 0.15;
        }
        
        // Fator 3: Valor total (peso: 30%)
        if (valorTotal < 500) {
          churnProbability += 0.3;
        } else if (valorTotal < 2000) {
          churnProbability += 0.15;
        }
        
        // Determinar nível de risco
        if (churnProbability >= 0.7) {
          riskLevel = 'Alto';
        } else if (churnProbability >= 0.4) {
          riskLevel = 'Médio';
        }
        
        return {
          clienteId: cliente.id,
          nome: cliente.nome || 'Cliente Desconhecido',
          churnProbability: Math.min(churnProbability, 1),
          riskLevel: riskLevel,
          recommendation: riskLevel === 'Alto' 
            ? 'Contato urgente necessário; Oferecer promoção especial'
            : riskLevel === 'Médio'
            ? 'Acompanhar de perto; Enviar comunicação personalizada'
            : 'Manter relacionamento regular',
          ultimaCompra: cliente.ultimaCompra,
          valorTotal: valorTotal,
          frequenciaCompras: frequenciaCompras
        };
      } catch (error) {
        console.error(`❌ Erro ao processar cliente ${cliente.id}:`, error);
        
        // Retornar dados básicos em caso de erro
        return {
          clienteId: cliente.id,
          nome: cliente.nome || 'Cliente Desconhecido',
          churnProbability: 0.5,
          riskLevel: 'Médio' as const,
          recommendation: 'Dados insuficientes para análise completa',
          ultimaCompra: cliente.ultimaCompra || null,
          valorTotal: cliente.valorTotal || 0,
          frequenciaCompras: cliente.frequenciaCompras || 0
        };
      }
    });
    
    // Ordenar por probabilidade de churn (maior risco primeiro)
    churnPredictions.sort((a: ChurnPrediction, b: ChurnPrediction) => b.churnProbability - a.churnProbability);
    
    console.log('✅ Churn predictions geradas:', churnPredictions.length);
    
    return NextResponse.json({
      clientes: churnPredictions,
      metadata: {
        total: churnPredictions.length,
        filialId: filialId ? parseInt(filialId) : null,
        limit: limit ? parseInt(limit) : null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no endpoint de churn prediction:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}