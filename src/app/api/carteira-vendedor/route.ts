import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { deriveScopeFromRequest, applyBasicScopeToWhere } from '../../../../lib/scope';
import { requirePermission } from '../../../../lib/permissions';

const prisma = new PrismaClient();

interface ClienteCarteira {
  cliente: {
    id: number;
    nome: string;
    cpfCnpj: string;
    cidade: string | null;
    estado: string | null;
    telefone: string | null;
  };
  vendas: {
    id: number;
    numeroNota: number;
    dataEmissao: Date;
    valorTotal: number;
  }[];
  resumo: {
    totalVendas: number;
    receitaTotal: number;
    ultimaVenda: Date | null;
    primeiraVenda: Date | null;
    ticketMedio: number;
  };
}

interface VendedorCarteira {
  vendedor: {
    id: number;
    nome: string;
    cpf: string;
    filialId: number | null;
  } | null;
  clientes: ClienteCarteira[];
  resumo: {
    totalClientes: number;
    receitaTotal: number;
    ultimaVenda: Date | null;
    primeiraVenda: Date | null;
  };
}

export async function GET(request: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('VIEW_OWN_PORTFOLIO')(request);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const vendedorId = searchParams.get('vendedorId');
    const filialId = searchParams.get('filialId');
    const periodoMeses = parseInt(searchParams.get('periodoMeses') || '6'); // Padrão: últimos 6 meses

    const scope = deriveScopeFromRequest(request);
    
    // Calcular data limite baseada no período
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - periodoMeses);
    
    // Query para buscar carteira de vendedores
    let whereClause: any = {
      dataEmissao: {
        gte: dataLimite
      }
    };
    
    if (vendedorId) {
      whereClause.vendedorId = parseInt(vendedorId);
    }
    
    if (filialId) {
      whereClause.filialId = parseInt(filialId);
    }

    // Aplicar escopo hierárquico
    whereClause = applyBasicScopeToWhere(whereClause, scope, {
      userKey: 'vendedorId',
      filialKey: 'filialId',
    });
    
    // Buscar notas fiscais com vendedores e clientes
    const notasFiscais = await prisma.notasFiscalCabecalho.findMany({
      where: whereClause,
      select: {
        id: true,
        numeroNota: true,
        clienteId: true,
        vendedorId: true,
        dataEmissao: true,
        valorTotal: true,
        cliente: {
          select: {
            id: true,
            nome: true,
            cpfCnpj: true,
            cidade: true,
            estado: true,
            telefone: true
          }
        },
        vendedor: {
          select: {
            id: true,
            nome: true,
            cpf: true,
            filialId: true
          }
        }
      },
      orderBy: {
        dataEmissao: 'desc'
      }
    });
    
    // Agrupar dados por vendedor e cliente para determinar carteira
    const carteiraMap = new Map<number, {
      vendedor: any;
      clientes: Map<number, ClienteCarteira>;
      resumo: {
        totalClientes: number;
        receitaTotal: number;
        ultimaVenda: Date | null;
        primeiraVenda: Date | null;
      };
    }>();
    
    notasFiscais.forEach(nota => {
      if (!nota.vendedorId || !nota.clienteId) return;
      
      const vendedorKey = nota.vendedorId;
      const clienteKey = nota.clienteId;
      
      if (!carteiraMap.has(vendedorKey)) {
        carteiraMap.set(vendedorKey, {
          vendedor: nota.vendedor,
          clientes: new Map<number, ClienteCarteira>(),
          resumo: {
            totalClientes: 0,
            receitaTotal: 0,
            ultimaVenda: null,
            primeiraVenda: null
          }
        });
      }
      
      const vendedorData = carteiraMap.get(vendedorKey)!;
      
      if (!vendedorData.clientes.has(clienteKey)) {
        vendedorData.clientes.set(clienteKey, {
          cliente: nota.cliente!,
          vendas: [],
          resumo: {
            totalVendas: 0,
            receitaTotal: 0,
            ultimaVenda: null,
            primeiraVenda: null,
            ticketMedio: 0
          }
        });
      }
      
      const clienteData = vendedorData.clientes.get(clienteKey)!;
      const valorNota = parseFloat(nota.valorTotal.toString());
      
      // Adicionar venda ao cliente
      clienteData.vendas.push({
        id: nota.id,
        numeroNota: nota.numeroNota,
        dataEmissao: nota.dataEmissao,
        valorTotal: valorNota
      });
      
      // Atualizar resumos do cliente
      clienteData.resumo.totalVendas += 1;
      clienteData.resumo.receitaTotal += valorNota;
      
      if (!clienteData.resumo.ultimaVenda || nota.dataEmissao > clienteData.resumo.ultimaVenda) {
        clienteData.resumo.ultimaVenda = nota.dataEmissao;
      }
      
      if (!clienteData.resumo.primeiraVenda || nota.dataEmissao < clienteData.resumo.primeiraVenda) {
        clienteData.resumo.primeiraVenda = nota.dataEmissao;
      }
      
      clienteData.resumo.ticketMedio = clienteData.resumo.receitaTotal / clienteData.resumo.totalVendas;
    });
    
    // Converter Map para array e finalizar cálculos
    const carteira: VendedorCarteira[] = Array.from(carteiraMap.values()).map(vendedorData => {
      const clientesArray: ClienteCarteira[] = Array.from(vendedorData.clientes.values());
      
      // Atualizar resumo do vendedor
      vendedorData.resumo.totalClientes = clientesArray.length;
      vendedorData.resumo.receitaTotal = clientesArray.reduce((sum, cliente) => 
        sum + cliente.resumo.receitaTotal, 0
      );
      
      if (clientesArray.length > 0) {
        const datasVendas = clientesArray.flatMap((c: ClienteCarteira) => 
          c.vendas.map((v: { dataEmissao: Date; valorTotal: number }) => v.dataEmissao)
        );
        vendedorData.resumo.ultimaVenda = new Date(Math.max(...datasVendas.map(d => d.getTime())));
        vendedorData.resumo.primeiraVenda = new Date(Math.min(...datasVendas.map(d => d.getTime())));
      }
      
      return {
        ...vendedorData,
        clientes: clientesArray
      };
    });
    
    // Se for solicitado um vendedor específico, retornar apenas seus dados
    if (vendedorId) {
      const vendedorEspecifico = carteira.find(v => v.vendedor?.id === parseInt(vendedorId));
      return NextResponse.json(vendedorEspecifico || { 
        vendedor: null, 
        clientes: [], 
        resumo: { totalClientes: 0, receitaTotal: 0, ultimaVenda: null, primeiraVenda: null } 
      });
    }
    
    // Ordenar por receita total (maior para menor)
    carteira.sort((a, b) => b.resumo.receitaTotal - a.resumo.receitaTotal);
    
    return NextResponse.json({
      carteira,
      metadata: {
        periodoMeses,
        dataLimite,
        totalVendedores: carteira.length,
        totalClientes: carteira.reduce((sum, v) => sum + v.resumo.totalClientes, 0)
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar carteira de vendedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}