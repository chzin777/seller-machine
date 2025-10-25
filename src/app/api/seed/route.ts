import { NextRequest, NextResponse } from 'next/server';
import { requirePermission } from '../../../../lib/permissions';
import { recomputeStats, recomputeAssociations, generateRecommendations, runRecompraAlerts } from '../../../../lib/rules';
import { prisma } from '../../../../lib/prisma';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const categories = ['Descartáveis', 'Limpeza', 'Copa'];
const basket = ['Garfo', 'Prato', 'Faca', 'Copo', 'Máquina de Lavar', 'Serviço de Limpeza', 'Equipamento Industrial', 'Manutenção'];

export async function POST(request: NextRequest) {
  // 🚨 OPERAÇÃO PERIGOSA - Apenas GESTOR_MASTER pode executar seed
  const authCheck = requirePermission('EXECUTE_SEED_OPERATIONS')(request);
  if (!authCheck.allowed) {
    return NextResponse.json(
      { 
        error: 'Acesso negado', 
        message: 'Apenas GESTOR_MASTER pode executar operações de seed',
        code: 'SEED_OPERATION_DENIED'
      }, 
      { status: 403 }
    );
  }
  try {
    // Verifica se já tem dados
    const existingCustomers = await prisma.cliente.findMany({
      take: 1
    });
    
    if (existingCustomers.length > 0) {
      return NextResponse.json({ seeded: false, message: 'Dados já existem' });
    }

    // Clientes
    const clientes = Array.from({ length: 80 }).map((_, i) => ({
      nome: `Cliente ${i+1}`,
      cpfCnpj: `${String(i+1).padStart(11, '0')}`,
      cidade: 'São Paulo',
      estado: 'SP'
    }));
    
    await prisma.cliente.createMany({
      data: clientes
    });

    // Produtos
    const produtos = Array.from({ length: 120 }).map((_, i) => ({
      descricao: basket[i%basket.length] + (i < 20 ? '' : ` ${i}`),
      tipo: categories[i%categories.length],
      preco: randomInt(5, 20)
    }));
    
    await prisma.produto.createMany({
      data: produtos
    });

    await recomputeStats();
    await recomputeAssociations();
    await generateRecommendations({});
    await runRecompraAlerts();
    
    return NextResponse.json({ seeded: true });
  } catch (error) {
    console.error('Erro no seed:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
