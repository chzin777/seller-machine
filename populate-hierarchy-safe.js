const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateHierarchy() {
  try {
    console.log('🚀 Populando dados de hierarquia...\n');

    // 1. Criar empresas (se não existirem)
    console.log('📊 Criando empresas...');
    const empresas = [];
    
    // Verificar se Agromaq já existe
    let agromaq = await prisma.empresa.findFirst({
      where: { cnpjMatriz: '12.345.678/0001-90' }
    });
    
    if (!agromaq) {
      agromaq = await prisma.empresa.create({
        data: {
          razaoSocial: 'Agromaq Máquinas Agrícolas Ltda',
          cnpjMatriz: '12.345.678/0001-90'
        }
      });
      console.log('✅ Agromaq criada');
    } else {
      console.log('ℹ️ Agromaq já existe');
    }
    empresas.push(agromaq);

    // Verificar se AgroTech já existe
    let agrotech = await prisma.empresa.findFirst({
      where: { cnpjMatriz: '98.765.432/0001-10' }
    });
    
    if (!agrotech) {
      agrotech = await prisma.empresa.create({
        data: {
          razaoSocial: 'AgroTech Equipamentos S.A.',
          cnpjMatriz: '98.765.432/0001-10'
        }
      });
      console.log('✅ AgroTech criada');
    } else {
      console.log('ℹ️ AgroTech já existe');
    }
    empresas.push(agrotech);

    // 2. Criar diretorias
    console.log('\n📊 Criando diretorias...');
    const diretorias = [];
    
    const diretoriasData = [
      { nome: 'Diretoria Comercial', empresaId: empresas[0].id },
      { nome: 'Diretoria de Operações', empresaId: empresas[0].id },
      { nome: 'Diretoria de Vendas', empresaId: empresas[1].id }
    ];

    for (const dirData of diretoriasData) {
      let diretoria = await prisma.diretorias.findFirst({
        where: { nome: dirData.nome, empresaId: dirData.empresaId }
      });
      
      if (!diretoria) {
        diretoria = await prisma.diretorias.create({ 
          data: {
            ...dirData,
            updatedAt: new Date()
          }
        });
        console.log(`✅ ${dirData.nome} criada`);
      } else {
        console.log(`ℹ️ ${dirData.nome} já existe`);
      }
      diretorias.push(diretoria);
    }

    // 3. Criar regionais
    console.log('\n📊 Criando regionais...');
    const regionais = [];
    
    const regionaisData = [
      { nome: 'Regional Sudeste', diretoriaId: diretorias[0].id },
      { nome: 'Regional Sul', diretoriaId: diretorias[0].id },
      { nome: 'Regional Centro-Oeste', diretoriaId: diretorias[0].id },
      { nome: 'Regional Nordeste', diretoriaId: diretorias[1].id },
      { nome: 'Regional São Paulo', diretoriaId: diretorias[2].id }
    ];

    for (const regData of regionaisData) {
      let regional = await prisma.regionais.findFirst({
        where: { nome: regData.nome, diretoriaId: regData.diretoriaId }
      });
      
      if (!regional) {
        regional = await prisma.regionais.create({ 
          data: {
            ...regData,
            updatedAt: new Date()
          }
        });
        console.log(`✅ ${regData.nome} criada`);
      } else {
        console.log(`ℹ️ ${regData.nome} já existe`);
      }
      regionais.push(regional);
    }

    // 4. Criar filiais
    console.log('\n📊 Criando filiais...');
    const filiais = [];
    
    const filiaisData = [
      { nome: 'Filial São Paulo Centro', cnpj: '12.345.678/0002-01', cidade: 'São Paulo', estado: 'SP', regionalId: regionais[0].id, empresaId: empresas[0].id },
      { nome: 'Filial Campinas', cnpj: '12.345.678/0003-02', cidade: 'Campinas', estado: 'SP', regionalId: regionais[0].id, empresaId: empresas[0].id },
      { nome: 'Filial Rio de Janeiro', cnpj: '12.345.678/0004-03', cidade: 'Rio de Janeiro', estado: 'RJ', regionalId: regionais[0].id, empresaId: empresas[0].id },
      { nome: 'Filial Porto Alegre', cnpj: '12.345.678/0005-04', cidade: 'Porto Alegre', estado: 'RS', regionalId: regionais[1].id, empresaId: empresas[0].id },
      { nome: 'Filial Curitiba', cnpj: '12.345.678/0006-05', cidade: 'Curitiba', estado: 'PR', regionalId: regionais[1].id, empresaId: empresas[0].id },
      { nome: 'Filial Campo Grande', cnpj: '12.345.678/0007-06', cidade: 'Campo Grande', estado: 'MS', regionalId: regionais[2].id, empresaId: empresas[0].id },
      { nome: 'Filial Cuiabá', cnpj: '12.345.678/0008-07', cidade: 'Cuiabá', estado: 'MT', regionalId: regionais[2].id, empresaId: empresas[0].id },
      { nome: 'Filial Salvador', cnpj: '12.345.678/0009-08', cidade: 'Salvador', estado: 'BA', regionalId: regionais[3].id, empresaId: empresas[0].id },
      { nome: 'AgroTech São Paulo', cnpj: '98.765.432/0002-11', cidade: 'São Paulo', estado: 'SP', regionalId: regionais[4].id, empresaId: empresas[1].id },
      { nome: 'AgroTech Santos', cnpj: '98.765.432/0003-12', cidade: 'Santos', estado: 'SP', regionalId: regionais[4].id, empresaId: empresas[1].id }
    ];

    for (const filData of filiaisData) {
      let filial = await prisma.filial.findFirst({
        where: { cnpj: filData.cnpj }
      });
      
      if (!filial) {
        filial = await prisma.filial.create({ data: filData });
        console.log(`✅ ${filData.nome} criada`);
      } else {
        console.log(`ℹ️ ${filData.nome} já existe`);
      }
      filiais.push(filial);
    }

    console.log('\n🎉 Hierarquia populada com sucesso!');
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