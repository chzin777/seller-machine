import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { vendedorId: string } }
) {
  try {
    const vendedorId = parseInt(params.vendedorId);
    const { searchParams } = new URL(request.url);
    const periodoMeses = parseInt(searchParams.get('periodoMeses') || '6');
    
    // Calcular data limite
    const dataLimite = new Date();
    dataLimite.setMonth(dataLimite.getMonth() - periodoMeses);
    
    // Buscar informações do vendedor
    const vendedor = await prisma.vendedor.findUnique({
      where: { id: vendedorId },
      include: {
        filial: {
          select: {
            id: true,
            nome: true,
            cidade: true,
            estado: true
          }
        }
      }
    });
    
    if (!vendedor) {
      return NextResponse.json(
        { error: 'Vendedor não encontrado' },
        { status: 404 }
      );
    }
    
    // Buscar notas fiscais do vendedor no período
    const notasFiscais = await prisma.notasFiscalCabecalho.findMany({
      where: {
        vendedorId: vendedorId,
        dataEmissao: {
          gte: dataLimite
        }
      },
      include: {
        cliente: {
          select: {
            id: true,
            nome: true,
            cpfCnpj: true,
            cidade: true,
            estado: true,
            telefone: true,
            logradouro: true,
            bairro: true,
            cep: true
          }
        }
      },
      orderBy: {
        dataEmissao: 'desc'
      }
    });
    
    // Agrupar por cliente
    const clientesMap = new Map();
    
    notasFiscais.forEach(nota => {
      if (!nota.clienteId || !nota.cliente) return;
      
      const clienteId = nota.clienteId;
      const valorNota = parseFloat(nota.valorTotal.toString());
      
      if (!clientesMap.has(clienteId)) {
        clientesMap.set(clienteId, {
          ...nota.cliente,
          vendas: [],
          estatisticas: {
            totalVendas: 0,
            receitaTotal: 0,
            ticketMedio: 0,
            ultimaVenda: null,
            primeiraVenda: null,
            diasSemCompra: null
          }
        });
      }
      
      const clienteData = clientesMap.get(clienteId);
      
      // Adicionar venda
      clienteData.vendas.push({
        id: nota.id,
        numeroNota: nota.numeroNota,
        dataEmissao: nota.dataEmissao,
        valorTotal: valorNota
      });
      
      // Atualizar estatísticas
      clienteData.estatisticas.totalVendas += 1;
      clienteData.estatisticas.receitaTotal += valorNota;
      
      if (!clienteData.estatisticas.ultimaVenda || nota.dataEmissao > clienteData.estatisticas.ultimaVenda) {
        clienteData.estatisticas.ultimaVenda = nota.dataEmissao;
      }
      
      if (!clienteData.estatisticas.primeiraVenda || nota.dataEmissao < clienteData.estatisticas.primeiraVenda) {
        clienteData.estatisticas.primeiraVenda = nota.dataEmissao;
      }
    });
    
    // Finalizar cálculos e ordenar vendas
    const clientes = Array.from(clientesMap.values()).map(cliente => {
      // Ordenar vendas por data (mais recente primeiro)
      cliente.vendas.sort((a: any, b: any) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime());
      
      // Calcular ticket médio
      cliente.estatisticas.ticketMedio = cliente.estatisticas.receitaTotal / cliente.estatisticas.totalVendas;
      
      // Calcular dias sem compra
      if (cliente.estatisticas.ultimaVenda) {
        const hoje = new Date();
        const ultimaVenda = new Date(cliente.estatisticas.ultimaVenda);
        cliente.estatisticas.diasSemCompra = Math.floor((hoje.getTime() - ultimaVenda.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      return cliente;
    });
    
    // Ordenar clientes por receita total (maior para menor)
    clientes.sort((a, b) => b.estatisticas.receitaTotal - a.estatisticas.receitaTotal);
    
    // Calcular resumo geral
    const resumoGeral = {
      totalClientes: clientes.length,
      receitaTotal: clientes.reduce((sum, cliente) => sum + cliente.estatisticas.receitaTotal, 0),
      ticketMedioGeral: 0,
      clientesAtivos: clientes.filter(c => c.estatisticas.diasSemCompra && c.estatisticas.diasSemCompra <= 30).length,
      clientesInativos: clientes.filter(c => c.estatisticas.diasSemCompra && c.estatisticas.diasSemCompra > 90).length
    };
    
    resumoGeral.ticketMedioGeral = resumoGeral.receitaTotal / (resumoGeral.totalClientes || 1);
    
    return NextResponse.json({
      vendedor: {
        id: vendedor.id,
        nome: vendedor.nome,
        cpf: vendedor.cpf,
        filial: vendedor.filial
      },
      clientes,
      resumo: resumoGeral,
      metadata: {
        periodoMeses,
        dataLimite,
        dataConsulta: new Date()
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar clientes do vendedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}