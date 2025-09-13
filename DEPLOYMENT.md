# Deployment Guide - Seller Machine

## Configuração no Vercel

### Variáveis de Ambiente

Para que o GraphQL funcione corretamente na aplicação hospedada, você precisa configurar as seguintes variáveis de ambiente no painel do Vercel:

1. Acesse o painel do Vercel: https://vercel.com/dashboard
2. Selecione o projeto `seller-machine-eight`
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

```
NEXT_PUBLIC_ENABLE_GRAPHQL=true
NEXT_PUBLIC_GRAPHQL_URL=https://api-dev-production-6bb5.up.railway.app/graphql
```

### Configuração Automática

O arquivo `vercel.json` já está configurado com:
- Variáveis de ambiente padrão
- Proxy para o GraphQL endpoint
- Configurações de timeout para as funções API

### Deploy

Após configurar as variáveis de ambiente:

1. Faça commit das alterações:
```bash
git add .
git commit -m "Add Vercel configuration for GraphQL"
git push
```

2. O Vercel fará o deploy automaticamente

3. Verifique se as variáveis estão carregadas acessando:
   - https://seller-machine-eight.vercel.app/clientes
   - O indicador deve mostrar "GraphQL" em vez de "REST API"

### Troubleshooting

**Problema**: Ainda mostra "REST API" após o deploy
**Solução**: 
1. Verifique se as variáveis de ambiente estão configuradas no painel do Vercel
2. Force um novo deploy indo em **Deployments** > **Redeploy**
3. Verifique os logs de build para erros

**Problema**: Erro de CORS no GraphQL
**Solução**: O proxy configurado no `vercel.json` deve resolver isso automaticamente

### Verificação

Para verificar se tudo está funcionando:
1. Acesse https://seller-machine-eight.vercel.app/clientes
2. Abra o DevTools (F12)
3. Vá na aba Console
4. Deve aparecer:
   ```
   🔧 Debug GraphQL Config:
     NEXT_PUBLIC_ENABLE_GRAPHQL: true
     NEXT_PUBLIC_GRAPHQL_URL: https://api-dev-production-6bb5.up.railway.app/graphql
   ```
5. O indicador na página deve mostrar "GraphQL"