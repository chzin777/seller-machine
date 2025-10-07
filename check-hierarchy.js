const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkHierarchy() {
  try {
    console.log('🔍 Verificando dados de hierarquia no banco...\n');

    // Verificar empresas
    const empresas = await prisma.empresa.findMany();
    console.log(`📊 Empresas encontradas: ${empresas.length}`);
    empresas.forEach(empresa => {
      console.log(`  - ${empresa.nome} (ID: ${empresa.id})`);
    });

    // Verificar diretorias
    const diretorias = await prisma.diretoria.findMany({
      include: {
        empresa: true
      }
    });
    console.log(`\n📊 Diretorias encontradas: ${diretorias.length}`);
    diretorias.forEach(diretoria => {
      console.log(`  - ${diretoria.nome} (ID: ${diretoria.id}) - Empresa: ${diretoria.empresa.nome}`);
    });

    // Verificar regionais
    const regionais = await prisma.regional.findMany({
      include: {
        diretoria: {
          include: {
            empresa: true
          }
        }
      }
    });
    console.log(`\n📊 Regionais encontradas: ${regionais.length}`);
    regionais.forEach(regional => {
      console.log(`  - ${regional.nome} (ID: ${regional.id}) - Diretoria: ${regional.diretoria.nome} - Empresa: ${regional.diretoria.empresa.nome}`);
    });

    // Verificar filiais
    const filiais = await prisma.filial.findMany({
      include: {
        regional: {
          include: {
            diretoria: {
              include: {
                empresa: true
              }
            }
          }
        }
      }
    });
    console.log(`\n📊 Filiais encontradas: ${filiais.length}`);
    filiais.forEach(filial => {
      console.log(`  - ${filial.nome} (ID: ${filial.id}) - Regional: ${filial.regional.nome} - Diretoria: ${filial.regional.diretoria.nome} - Empresa: ${filial.regional.diretoria.empresa.nome}`);
    });

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao verificar hierarquia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHierarchy();