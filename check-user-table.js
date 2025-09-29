const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserTable() {
  try {
    console.log('Verificando se a tabela User existe...');
    
    // Verificar se a tabela User existe
    const tables = await prisma.$queryRaw`SHOW TABLES LIKE 'User'`;
    console.log('Resultado da consulta SHOW TABLES LIKE "User":', tables);
    
    // Tentar fazer uma consulta simples na tabela User
    try {
      const userCount = await prisma.user.count();
      console.log(`Tabela User existe e contém ${userCount} registros`);
    } catch (error) {
      console.error('Erro ao consultar tabela User:', error.message);
    }
    
    // Listar todas as tabelas
    const allTables = await prisma.$queryRaw`SHOW TABLES`;
    console.log('Todas as tabelas no banco:', allTables);
    
  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserTable();