const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('Verificando usuários no banco de dados...');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });
    
    console.log(`\nTotal de usuários encontrados: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado no banco de dados!');
    } else {
      console.log('📋 Lista de usuários:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Nome: ${user.name}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Ativo: ${user.active ? 'Sim' : 'Não'}`);
        console.log(`   Criado em: ${user.createdAt}`);
        console.log('   ---');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();