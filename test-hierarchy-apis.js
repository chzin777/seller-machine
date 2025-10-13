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

    console.log('\n6. Testando /api/ai/dashboard-summary...');
    const summaryResponse = await makeRequest('/api/ai/dashboard-summary', authCookie);
    console.log(`Status: ${summaryResponse.status}`);
    if (summaryResponse.status === 200) {
      try {
        const summary = JSON.parse(summaryResponse.data);
        console.log(`Resumo recebido com ${Array.isArray(summary.cards) ? summary.cards.length : 0} cards.`);
      } catch (e) {
        console.log('Resposta (raw) summary:', summaryResponse.data);
      }
    } else {
      console.log('Erro na API dashboard-summary:', summaryResponse.data);
    }

    console.log('\n7. Testando /api/ai/dashboard-stats...');
    const statsResponse = await makeRequest('/api/ai/dashboard-stats', authCookie);
    console.log(`Status: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      try {
        const stats = JSON.parse(statsResponse.data);
        console.log('Stats recebidos (chaves):', Object.keys(stats || {}));
      } catch (e) {
        console.log('Resposta (raw) stats:', statsResponse.data);
      }
    } else {
      console.log('Erro na API dashboard-stats:', statsResponse.data);
    }

    console.log('\n8. Testando /api/users (rota protegida)...');
    const usersResponse = await makeRequest('/api/users', authCookie);
    console.log(`Status: ${usersResponse.status}`);
    if (usersResponse.status === 200) {
      try {
        const users = JSON.parse(usersResponse.data);
        console.log(`Usuários recebidos: ${users.length}`);
      } catch (e) {
        console.log('Resposta (raw) users:', usersResponse.data);
      }
    } else {
      console.log('Erro na API de users:', usersResponse.data);
    }

    console.log('\n9. Testando /api/ai/customer-insights?clienteId=1...');
    const ciResponse = await makeRequest('/api/ai/customer-insights?clienteId=1', authCookie);
    console.log(`Status: ${ciResponse.status}`);
    if (ciResponse.status === 200) {
      try {
        const ci = JSON.parse(ciResponse.data);
        console.log('Customer insights (keys):', Object.keys(ci || {}));
      } catch (e) {
        console.log('Resposta (raw) customer-insights:', ciResponse.data);
      }
    } else {
      console.log('Erro na API customer-insights:', ciResponse.data);
    }

    console.log('\n10. Testando /api/ai/clustering...');
    const clusterResponse = await makeRequest('/api/ai/clustering', authCookie);
    console.log(`Status: ${clusterResponse.status}`);
    if (clusterResponse.status === 200) {
      try {
        const cluster = JSON.parse(clusterResponse.data);
        console.log('Clustering recebido (keys):', Object.keys(cluster || {}));
      } catch (e) {
        console.log('Resposta (raw) clustering:', clusterResponse.data);
      }
    } else {
      console.log('Erro na API clustering:', clusterResponse.data);
    }

    console.log('\n11. Testando /api/ai/recommendations?clienteId=1...');
    const recResponse = await makeRequest('/api/ai/recommendations?clienteId=1', authCookie);
    console.log(`Status: ${recResponse.status}`);
    if (recResponse.status === 200) {
      try {
        const rec = JSON.parse(recResponse.data);
        console.log('Recomendações:', Array.isArray(rec) ? rec.length : 0);
      } catch (e) {
        console.log('Resposta (raw) recommendations:', recResponse.data);
      }
    } else {
      console.log('Erro na API recommendations:', recResponse.data);
    }

    console.log('\n12. Testando /api/ai/sales-prediction...');
    const spResponse = await makeRequest('/api/ai/sales-prediction', authCookie);
    console.log(`Status: ${spResponse.status}`);
    if (spResponse.status === 200) {
      try {
        const sp = JSON.parse(spResponse.data);
        console.log('Sales prediction (keys):', Object.keys(sp || {}));
      } catch (e) {
        console.log('Resposta (raw) sales-prediction:', spResponse.data);
      }
    } else {
      console.log('Erro na API sales-prediction:', spResponse.data);
    }

    console.log('\n13. Testando /api/ai/churn-prediction...');
    const churnResponse = await makeRequest('/api/ai/churn-prediction', authCookie);
    console.log(`Status: ${churnResponse.status}`);
    if (churnResponse.status === 200) {
      try {
        const churn = JSON.parse(churnResponse.data);
        console.log('Churn prediction (keys):', Object.keys(churn || {}));
      } catch (e) {
        console.log('Resposta (raw) churn-prediction:', churnResponse.data);
      }
    } else {
      console.log('Erro na API churn-prediction:', churnResponse.data);
    }

    console.log('\n14b. Testando /api/carteira-vendedor (sem filial)...');
    const carteiraSemFilialResponse = await makeRequest('/api/carteira-vendedor', authCookie);
    console.log(`Status: ${carteiraSemFilialResponse.status}`);
    if (carteiraSemFilialResponse.status === 200) {
      try {
        const carteiraSemFilial = JSON.parse(carteiraSemFilialResponse.data);
        console.log('Carteira (sem filial) (keys):', Object.keys(carteiraSemFilial || {}));
      } catch (e) {
        console.log('Resposta (raw) carteira-vendedor (sem filial):', carteiraSemFilialResponse.data);
      }
    } else {
      console.log('Erro na API carteira-vendedor (sem filial):', carteiraSemFilialResponse.data);
    }

    console.log('\n21. Testando /api/filiais...');
    const filiaisResponse = await makeRequest('/api/filiais', authCookie);
    console.log(`Status: ${filiaisResponse.status}`);
    if (filiaisResponse.status === 200) {
      try {
        const filiais = JSON.parse(filiaisResponse.data);
        const total = Array.isArray(filiais) ? filiais.length : (filiais?.length ?? 0);
        console.log('Total de filiais:', total);
      } catch (e) {
        console.log('Resposta (raw) filiais:', filiaisResponse.data);
      }
    } else {
      console.log('Erro na API filiais:', filiaisResponse.data);
    }

    console.log('\n15. Testando /api/vendedores...');
    const vendedoresResponse = await makeRequest('/api/vendedores', authCookie);
    console.log(`Status: ${vendedoresResponse.status}`);
    if (vendedoresResponse.status === 200) {
      try {
        const vendedores = JSON.parse(vendedoresResponse.data);
        console.log('Total de vendedores:', Array.isArray(vendedores) ? vendedores.length : 0);
      } catch (e) {
        console.log('Resposta (raw) vendedores:', vendedoresResponse.data);
      }
    } else {
      console.log('Erro na API vendedores:', vendedoresResponse.data);
    }

    console.log('\n16. Testando /api/rfv/parameters...');
    const rfvParamsResponse = await makeRequest('/api/rfv/parameters', authCookie);
    console.log(`Status: ${rfvParamsResponse.status}`);
    if (rfvParamsResponse.status === 200) {
      try {
        const rfvParams = JSON.parse(rfvParamsResponse.data);
        console.log('RFV Parameters (keys):', Object.keys(rfvParams || {}));
      } catch (e) {
        console.log('Resposta (raw) rfv/parameters:', rfvParamsResponse.data);
      }
    } else {
      console.log('Erro na API rfv/parameters:', rfvParamsResponse.data);
    }

    console.log('\n17. Testando /api/rfv/segments...');
    const rfvSegmentsResponse = await makeRequest('/api/rfv/segments', authCookie);
    console.log(`Status: ${rfvSegmentsResponse.status}`);
    if (rfvSegmentsResponse.status === 200) {
      try {
        const rfvSegments = JSON.parse(rfvSegmentsResponse.data);
        console.log('RFV Segments (keys):', Object.keys(rfvSegments || {}));
      } catch (e) {
        console.log('Resposta (raw) rfv/segments:', rfvSegmentsResponse.data);
      }
    } else {
      console.log('Erro na API rfv/segments:', rfvSegmentsResponse.data);
    }

    console.log('\n18. Testando /api/associacoes...');
    const associacoesResponse = await makeRequest('/api/associacoes', authCookie);
    console.log(`Status: ${associacoesResponse.status}`);
    if (associacoesResponse.status === 200) {
      try {
        const associacoes = JSON.parse(associacoesResponse.data);
        const total = Array.isArray(associacoes) ? associacoes.length : (associacoes?.length ?? 0);
        console.log('Total de associações:', total);
      } catch (e) {
        console.log('Resposta (raw) associacoes:', associacoesResponse.data);
      }
    } else {
      console.log('Erro na API associacoes:', associacoesResponse.data);
    }
    console.log('\n19. Testando /api/proxy?url=/api/clientes...');
    const clientesProxyResponse = await makeRequest('/api/proxy?url=/api/clientes', authCookie);
    console.log(`Status: ${clientesProxyResponse.status}`);
    if (clientesProxyResponse.status === 200) {
      try {
        const clientes = JSON.parse(clientesProxyResponse.data);
        const total = Array.isArray(clientes) ? clientes.length : (clientes?.length ?? 0);
        console.log('Total de clientes (via proxy):', total);
      } catch (e) {
        console.log('Resposta (raw) clientes (via proxy):', clientesProxyResponse.data);
      }
    } else {
      console.log('Erro na API clientes (via proxy):', clientesProxyResponse.data);
    }

    console.log('\n20. Testando /api/ai/system-status...');
    const sysStatusResponse = await makeRequest('/api/ai/system-status', authCookie);
    console.log(`Status: ${sysStatusResponse.status}`);
    if (sysStatusResponse.status === 200) {
      try {
        const status = JSON.parse(sysStatusResponse.data);
        console.log('System status (keys):', Object.keys(status || {}));
      } catch (e) {
        console.log('Resposta (raw) system-status:', sysStatusResponse.data);
      }
    } else {
      console.log('Erro na API system-status:', sysStatusResponse.data);
    }
  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testHierarchyAPIs();