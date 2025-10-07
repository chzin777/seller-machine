const http = require('http');

const loginData = JSON.stringify({
  email: 'admin@agromaq.com',
  password: 'admin123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('🔐 Testando login com credenciais do admin...');
console.log('Email:', 'admin@agromaq.com');
console.log('Password:', 'admin123');

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
      
      // Verificar se há cookie de autenticação
      const setCookieHeader = res.headers['set-cookie'];
      if (setCookieHeader) {
        console.log('\n🍪 Cookies definidos:');
        setCookieHeader.forEach(cookie => {
          console.log(cookie);
        });
      } else {
        console.log('\n❌ Nenhum cookie foi definido!');
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

req.write(loginData);
req.end();