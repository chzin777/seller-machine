const http = require('http');

// Token obtido do teste anterior
const authToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoiYWRtaW5AYWdyb21hcS5jb20iLCJyb2xlIjoiR0VTVE9SX01BU1RFUiIsImVtcHJlc2FJZCI6bnVsbCwiZGlyZXRvcmlhSWQiOm51bGwsInJlZ2lvbmFsSWQiOm51bGwsImZpbGlhbElkIjpudWxsLCJpYXQiOjE3NTk4NDY2NjIsImV4cCI6MTc1OTkzMzA2Mn0.IK824ONZ8VYDS-uLFk8abSpqKWVqrgYIM54VdFanAyM';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/users',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `auth-token=${authToken}`
  }
};

console.log('🔐 Testando requisição autenticada para /api/users...');
console.log('🍪 Usando cookie de autenticação');

const req = http.request(options, (res) => {
  console.log(`\n📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n✅ Resposta da API:');
      console.log(JSON.stringify(jsonData, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n🎉 SUCESSO! A autenticação está funcionando!');
        if (jsonData.users && jsonData.users.length > 0) {
          console.log(`📊 Encontrados ${jsonData.users.length} usuário(s)`);
        }
      } else {
        console.log('\n❌ ERRO! Problema na autenticação');
      }
      
    } catch (e) {
      console.log('\n❌ Erro ao parsear resposta:', e.message);
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro na requisição: ${e.message}`);
});

req.end();