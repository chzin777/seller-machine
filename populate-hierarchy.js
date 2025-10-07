const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateHierarchy() {
  try {
    console.log('🚀 Populando dados de hierarquia...\n');

    // Verificar se já existem dados
    const empresasExistentes = await prisma.empresa.count();
    if (empresasExistentes > 0) {
      console.log('⚠️ Dados já existem. Limpando dados antigos...');
      
      // Limpar dados existentes na ordem correta (devido às foreign keys)
      await prisma.users.deleteMany({});
      await prisma.filial.deleteMany({});
      await prisma.regionais.deleteMany({});
      await prisma.diretorias.deleteMany({});
      await prisma.empresa.deleteMany({});
      
      console.log('✅ Dados antigos removidos.\n');
    }

    // 1. Criar empresas
    console.log('📊 Criando empresas...');
    const empresas = await Promise.all([
      prisma.empresa.create({
        data: {
          razaoSocial: 'Agromaq Máquinas Agrícolas Ltda',
          nomeFantasia: 'Agromaq',
          cnpj: '12.345.678/0001-90',
          inscricaoEstadual: '123456789',
          telefone: '(11) 3456-7890',
          email: 'contato@agromaq.com.br',
          endereco: 'Av. das Máquinas, 1000',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        }
      }),
      prisma.empresa.create({
        data: {
          razaoSocial: 'AgroTech Equipamentos S.A.',
          nomeFantasia: 'AgroTech',
          cnpj: '98.765.432/0001-10',
          inscricaoEstadual: '987654321',
          telefone: '(11) 2345-6789',
          email: 'contato@agrotech.com.br',
          endereco: 'Rua da Tecnologia, 500',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-890'
        }
      })
    ]);
    console.log(`✅ ${empresas.length} empresas criadas.\n`);

    // 2. Criar diretorias
    console.log('📊 Criando diretorias...');
    const diretorias = await Promise.all([
      // Diretorias da Agromaq
      prisma.diretorias.create({
        data: {
          nome: 'Diretoria Comercial',
          empresaId: empresas[0].id
        }
      }),
      prisma.diretorias.create({
        data: {
          nome: 'Diretoria de Operações',
          empresaId: empresas[0].id
        }
      }),
      // Diretorias da AgroTech
      prisma.diretorias.create({
        data: {
          nome: 'Diretoria de Vendas',
          empresaId: empresas[1].id
        }
      })
    ]);
    console.log(`✅ ${diretorias.length} diretorias criadas.\n`);

    // 3. Criar regionais
    console.log('📊 Criando regionais...');
    const regionais = await Promise.all([
      // Regionais da Diretoria Comercial (Agromaq)
      prisma.regionais.create({
        data: {
          nome: 'Regional Sudeste',
          diretoriaId: diretorias[0].id
        }
      }),
      prisma.regionais.create({
        data: {
          nome: 'Regional Sul',
          diretoriaId: diretorias[0].id
        }
      }),
      prisma.regionais.create({
        data: {
          nome: 'Regional Centro-Oeste',
          diretoriaId: diretorias[0].id
        }
      }),
      // Regionais da Diretoria de Operações (Agromaq)
      prisma.regionais.create({
        data: {
          nome: 'Regional Nordeste',
          diretoriaId: diretorias[1].id
        }
      }),
      // Regionais da AgroTech
      prisma.regionais.create({
        data: {
          nome: 'Regional São Paulo',
          diretoriaId: diretorias[2].id
        }
      })
    ]);
    console.log(`✅ ${regionais.length} regionais criadas.\n`);

    // 4. Criar filiais
    console.log('📊 Criando filiais...');
    const filiais = await Promise.all([
      // Filiais da Regional Sudeste
      prisma.filial.create({
        data: {
          nome: 'Filial São Paulo Centro',
          cnpj: '12.345.678/0002-01',
          cidade: 'São Paulo',
          estado: 'SP',
          regionalId: regionais[0].id,
          empresaId: empresas[0].id
        }
      }),
      prisma.filial.create({
        data: {
          nome: 'Filial Campinas',
          cnpj: '12.345.678/0003-02',
          cidade: 'Campinas',
          estado: 'SP',
          regionalId: regionais[0].id,
          empresaId: empresas[0].id
        }
      }),
      prisma.filial.create({
        data: {
          nome: 'Filial Rio de Janeiro',
          cnpj: '12.345.678/0004-03',
          cidade: 'Rio de Janeiro',
          estado: 'RJ',
          regionalId: regionais[0].id,
          empresaId: empresas[0].id
        }
      }),
      // Filiais da Regional Sul
      prisma.filial.create({
        data: {
          nome: 'Filial Porto Alegre',
          cnpj: '12.345.678/0005-04',
          cidade: 'Porto Alegre',
          estado: 'RS',
          regionalId: regionais[1].id,
          empresaId: empresas[0].id
        }
      }),
      prisma.filial.create({
        data: {
          nome: 'Filial Curitiba',
          cnpj: '12.345.678/0006-05',
          cidade: 'Curitiba',
          estado: 'PR',
          regionalId: regionais[1].id,
          empresaId: empresas[0].id
        }
      }),
      // Filiais da Regional Centro-Oeste
      prisma.filial.create({
        data: {
          nome: 'Filial Campo Grande',
          cnpj: '12.345.678/0007-06',
          cidade: 'Campo Grande',
          estado: 'MS',
          regionalId: regionais[2].id,
          empresaId: empresas[0].id
        }
      }),
      prisma.filial.create({
        data: {
          nome: 'Filial Cuiabá',
          cnpj: '12.345.678/0008-07',
          cidade: 'Cuiabá',
          estado: 'MT',
          regionalId: regionais[2].id,
          empresaId: empresas[0].id
        }
      }),
      // Filiais da Regional Nordeste
      prisma.filial.create({
        data: {
          nome: 'Filial Salvador',
          cnpj: '12.345.678/0009-08',
          cidade: 'Salvador',
          estado: 'BA',
          regionalId: regionais[3].id,
          empresaId: empresas[0].id
        }
      }),
      // Filiais da AgroTech
      prisma.filial.create({
        data: {
          nome: 'AgroTech São Paulo',
          cnpj: '98.765.432/0002-11',
          cidade: 'São Paulo',
          estado: 'SP',
          regionalId: regionais[4].id,
          empresaId: empresas[1].id
        }
      }),
      prisma.filial.create({
        data: {
          nome: 'AgroTech Santos',
          cnpj: '98.765.432/0003-12',
          cidade: 'Santos',
          estado: 'SP',
          regionalId: regionais[4].id,
          empresaId: empresas[1].id
        }
      })
    ]);
    console.log(`✅ ${filiais.length} filiais criadas.\n`);

    console.log('🎉 Hierarquia populada com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   • ${empresas.length} empresas`);
    console.log(`   • ${diretorias.length} diretorias`);
    console.log(`   • ${regionais.length} regionais`);
    console.log(`   • ${filiais.length} filiais`);

  } catch (error) {
    console.error('❌ Erro ao popular hierarquia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateHierarchy();