const jwt = require('jsonwebtoken');

// Gerar um token JWT válido para o usuário admin
const payload = {
  userId: 2,
  email: 'admin@agromaq.com',
  name: 'Administrador',
  role: 'GESTOR_MASTER',
  empresaId: null,
  diretoriaId: null,
  regionalId: null,
  filialId: null
};

const secret = process.env.JWT_SECRET || 'fallback-secret';
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('🔑 Token JWT gerado para teste:');
console.log(token);
console.log('\n📋 Payload do token:');
console.log(JSON.stringify(payload, null, 2));

// Verificar se o token é válido
try {
  const decoded = jwt.verify(token, secret);
  console.log('\n✅ Token válido! Dados decodificados:');
  console.log(JSON.stringify(decoded, null, 2));
} catch (error) {
  console.log('\n❌ Erro ao verificar token:', error.message);
}