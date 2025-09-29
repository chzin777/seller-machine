const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Criando usuário de teste...');
    
    // Hash da senha
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // Criar usuário de teste
    const user = await prisma.users.create({
      data: {
        email: 'teste@agromaq.com',
        password: hashedPassword,
        name: 'Usuário Teste',
        role: 'VENDEDOR',
        active: true,
        updatedAt: new Date()
      }
    });
    
    console.log('Usuário criado com sucesso:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Usuário já existe, tentando fazer login...');
    } else {
      console.error('Erro ao criar usuário:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();