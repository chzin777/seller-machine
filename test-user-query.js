const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUserQuery() {
  try {
    console.log('Testando consulta de usuário...');
    
    // Primeiro, vamos ver todos os usuários
    const users = await prisma.users.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        empresaId: true,
        diretoriaId: true,
        regionalId: true,
        filialId: true,
        // Testando relacionamentos
        diretorias: true,
        Empresas: true,
        Filiais: true,
        regionais: true
      }
    });
    
    console.log('Usuário encontrado:', JSON.stringify(users[0], null, 2));
    
  } catch (error) {
    console.error('Erro na consulta:', error.message);
    
    // Tentar consulta mais simples
    try {
      const simpleUser = await prisma.users.findFirst({
        select: {
          id: true,
          email: true,
          name: true
        }
      });
      console.log('Consulta simples funcionou:', simpleUser);
    } catch (simpleError) {
      console.error('Erro na consulta simples:', simpleError.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUserQuery();