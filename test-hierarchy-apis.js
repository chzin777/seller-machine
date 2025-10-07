const http = require('http');

// Função para fazer requisições HTTP
function makeRequest(path, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function testHierarchyAPIs() {
  console.log('=== Testando APIs de Hierarquia Organizacional ===\n');

  try {
    // Primeiro, fazer login para obter o token
    console.log('1. Fazendo login...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const loginData = JSON.stringify({
      email: 'admin@agromaq.com',
      password: 'admin123'
    });

    const loginResponse = await new Promise((resolve, reject) => {
      const req = http.request(loginOptions, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(loginData);
      req.end();
    });

    console.log(`Login Status: ${loginResponse.status}`);
    
    if (loginResponse.status !== 200) {
      console.log('Erro no login:', loginResponse.data);
      return;
    }

    // Extrair o cookie de autenticação
    const setCookieHeader = loginResponse.headers['set-cookie'];
    let authCookie = '';
    if (setCookieHeader) {
      const authCookieMatch = setCookieHeader.find(cookie => cookie.startsWith('auth-token='));
      if (authCookieMatch) {
        authCookie = authCookieMatch.split(';')[0];
      }
    }

    console.log('Cookie de autenticação obtido:', authCookie ? 'Sim' : 'Não');
    console.log('');

    // Testar API de empresas
    console.log('2. Testando /api/hierarchy/empresas...');
    const empresasResponse = await makeRequest('/api/hierarchy/empresas', authCookie);
    console.log(`Status: ${empresasResponse.status}`);
    
    if (empresasResponse.status === 200) {
      const empresas = JSON.parse(empresasResponse.data);
      console.log(`Empresas encontradas: ${empresas.length}`);
      if (empresas.length > 0) {
        console.log('Primeira empresa:', empresas[0]);
        
        // Testar API de diretorias com empresaId
        const empresaId = empresas[0].id;
        console.log(`\n3. Testando /api/hierarchy/diretorias?empresaId=${empresaId}...`);
        const diretoriasResponse = await makeRequest(`/api/hierarchy/diretorias?empresaId=${empresaId}`, authCookie);
        console.log(`Status: ${diretoriasResponse.status}`);
        
        if (diretoriasResponse.status === 200) {
          const diretorias = JSON.parse(diretoriasResponse.data);
          console.log(`Diretorias encontradas: ${diretorias.length}`);
          if (diretorias.length > 0) {
            console.log('Primeira diretoria:', diretorias[0]);
            
            // Testar API de regionais com diretoriaId
            const diretoriaId = diretorias[0].id;
            console.log(`\n4. Testando /api/hierarchy/regionais?diretoriaId=${diretoriaId}...`);
            const regionaisResponse = await makeRequest(`/api/hierarchy/regionais?diretoriaId=${diretoriaId}`, authCookie);
            console.log(`Status: ${regionaisResponse.status}`);
            
            if (regionaisResponse.status === 200) {
              const regionais = JSON.parse(regionaisResponse.data);
              console.log(`Regionais encontradas: ${regionais.length}`);
              if (regionais.length > 0) {
                console.log('Primeira regional:', regionais[0]);
                
                // Testar API de filiais com regionalId
                const regionalId = regionais[0].id;
                console.log(`\n5. Testando /api/hierarchy/filiais?regionalId=${regionalId}...`);
                const filiaisResponse = await makeRequest(`/api/hierarchy/filiais?regionalId=${regionalId}`, authCookie);
                console.log(`Status: ${filiaisResponse.status}`);
                
                if (filiaisResponse.status === 200) {
                  const filiais = JSON.parse(filiaisResponse.data);
                  console.log(`Filiais encontradas: ${filiais.length}`);
                  if (filiais.length > 0) {
                    console.log('Primeira filial:', filiais[0]);
                  }
                } else {
                  console.log('Erro na API de filiais:', filiaisResponse.data);
                }
              }
            } else {
              console.log('Erro na API de regionais:', regionaisResponse.data);
            }
          }
        } else {
          console.log('Erro na API de diretorias:', diretoriasResponse.data);
        }
      }
    } else {
      console.log('Erro na API de empresas:', empresasResponse.data);
    }

  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testHierarchyAPIs();