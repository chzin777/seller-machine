const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backupRFVData() {
  try {
    console.log('Fazendo backup dos dados RFV...');
    
    // Backup dos parâmetros RFV
    const rfvParameters = await prisma.$queryRaw`SELECT * FROM rfv_parameters_sets`;
    console.log(`Encontrados ${rfvParameters.length} registros em rfv_parameters_sets`);
    
    // Backup dos segmentos
    const segments = await prisma.$queryRaw`SELECT * FROM segments`;
    console.log(`Encontrados ${segments.length} registros em segments`);
    
    // Converter BigInt para string para serialização JSON
    const convertBigInt = (obj) => {
      return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
    };
    
    // Salvar backup em arquivo JSON
    const backupData = {
      rfv_parameters_sets: convertBigInt(rfvParameters),
      segments: convertBigInt(segments),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('rfv-backup.json', JSON.stringify(backupData, null, 2));
    console.log('Backup salvo em rfv-backup.json');
    
    return backupData;
  } catch (error) {
    console.error('Erro ao fazer backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

backupRFVData();