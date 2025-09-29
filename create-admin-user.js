const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('Criando usuário admin...');

    // Hash da senha
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Criar usuário admin
    const adminUser = await prisma.users.create({
      data: {
        email: 'admin@agromaq.com',
        password: hashedPassword,
        name: 'Administrador',
        role: 'GESTOR_MASTER',
        active: true,
        updatedAt: new Date()
      }
    });

    console.log('Usuário admin criado com sucesso:', {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role
    });

    console.log('\n=== CREDENCIAIS DE LOGIN ===');
    console.log('Email: admin@agromaq.com');
    console.log('Senha: admin123');
    console.log('Role: GESTOR_MASTER (acesso completo)');
    console.log('============================\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('Usuário admin já existe. Tentando atualizar...');
      
      try {
        const updatedUser = await prisma.users.update({
          where: { email: 'admin@agromaq.com' },
          data: {
            role: 'GESTOR_MASTER',
            active: true,
            updatedAt: new Date()
          }
        });
        
        console.log('Usuário admin atualizado:', {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role
        });

        console.log('\n=== CREDENCIAIS DE LOGIN ===');
        console.log('Email: admin@agromaq.com');
        console.log('Senha: admin123');
        console.log('Role: GESTOR_MASTER (acesso completo)');
        console.log('============================\n');
        
      } catch (updateError) {
        console.error('Erro ao atualizar usuário:', updateError.message);
      }
    } else {
      console.error('Erro ao criar usuário admin:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();