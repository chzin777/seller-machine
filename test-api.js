const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testUsersAPI() {
  try {
    console.log('🔍 Testando a API de usuários diretamente...\n');
    
    // Simular o que a API faz
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        role: true,
        area: true,
        active: true,
        Empresas: {
          select: {
            id: true,
            razaoSocial: true
          }
        },
        diretorias: {
          select: {
            id: true,
            nome: true
          }
        },
        regionais: {
          select: {
            id: true,
            nome: true
          }
        },
        Filiais: {
          select: {
            id: true,
            nome: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    console.log(`✅ API retornaria ${users.length} usuários:\n`);
    
    if (users.length === 0) {
      console.log('❌ Nenhum usuário encontrado pela query da API!');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Ativo: ${user.active ? 'Sim' : 'Não'}`);
        console.log(`   Telefone: ${user.telefone || 'N/A'}`);
        console.log(`   Área: ${user.area || 'N/A'}`);
        console.log(`   Empresa: ${user.Empresas?.razaoSocial || 'N/A'}`);
        console.log(`   Diretoria: ${user.diretorias?.nome || 'N/A'}`);
        console.log(`   Regional: ${user.regionais?.nome || 'N/A'}`);
        console.log(`   Filial: ${user.Filiais?.nome || 'N/A'}`);
        console.log('   ---');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUsersAPI();