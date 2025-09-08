# Configuração e Uso do GraphQL

Este documento explica como usar o GraphQL implementado no projeto Seller Machine.

## 📁 Estrutura dos Arquivos

```
src/
├── utils/
│   ├── graphql.ts              # Cliente GraphQL base
│   └── graphql-queries.ts      # Queries e tipos GraphQL
├── hooks/
│   ├── useGraphql.ts           # Hook genérico para GraphQL
│   └── useDashboardData.ts     # Hooks específicos do dashboard
├── components/
│   └── GraphQLDataProvider.tsx # Provider de dados GraphQL
├── config/
│   └── graphql.ts              # Configurações do GraphQL
└── app/
    └── dashboard-graphql/
        └── page.tsx            # Exemplo de dashboard com GraphQL
```

## 🚀 Como Usar

### 1. Configuração Básica

Crie um arquivo `.env.local` na raiz do projeto:

```env
# GraphQL Configuration
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_ENABLE_GRAPHQL=true
NEXT_PUBLIC_MOCK_GRAPHQL=false
```

### 2. Usando o Hook Genérico

```typescript
import { useGraphQL } from '../hooks/useGraphql'

function MyComponent() {
  const { data, loading, error, refetch } = useGraphQL<{ users: User[] }>(
    `query GetUsers($limit: Int) {
      users(limit: $limit) {
        id
        name
        email
      }
    }`,
    { limit: 10 },
    [10] // dependencies
  )

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {data?.users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### 3. Usando Hooks Específicos do Dashboard

```typescript
import { useDashboardStats, useClientes } from '../hooks/useDashboardData'

function Dashboard() {
  const { data: stats, loading, error } = useDashboardStats()
  const { data: clientes } = useClientes(50, 0, '')

  return (
    <div>
      <h1>Receita Total: R$ {stats?.dashboardStats.total_vendas}</h1>
      <h2>Clientes: {clientes?.clientes.length}</h2>
    </div>
  )
}
```

### 4. Usando o Provider de Dados

```typescript
import { GraphQLDataProvider, useGraphQLData } from '../components/GraphQLDataProvider'

function App() {
  return (
    <GraphQLDataProvider>
      <Dashboard />
    </GraphQLDataProvider>
  )
}

function Dashboard() {
  const { receitaTotal, loading, error, refetch } = useGraphQLData()
  
  return (
    <div>
      <h1>Receita: R$ {receitaTotal}</h1>
      <button onClick={refetch}>Atualizar</button>
    </div>
  )
}
```

## 🔧 Configurações Avançadas

### Autenticação

O cliente GraphQL automaticamente inclui tokens de autenticação:

```typescript
// O token é automaticamente incluído nos headers
const token = localStorage.getItem('token')
// Headers: { 'Authorization': `Bearer ${token}` }
```

### Cache e Performance

```typescript
// Configuração de cache no config/graphql.ts
export const GRAPHQL_CONFIG = {
  cache: {
    enabled: true,
    ttl: 5 * 60 * 1000, // 5 minutos
  },
  retry: {
    attempts: 3,
    delay: 1000
  }
}
```

### Tratamento de Erros

```typescript
const { data, loading, error } = useGraphQL(
  query,
  variables,
  dependencies,
  {
    onError: (error) => {
      console.error('GraphQL Error:', error)
      // Enviar para serviço de monitoramento
    },
    onCompleted: (data) => {
      console.log('Data loaded:', data)
    }
  }
)
```

## 📊 Queries Disponíveis

### Dashboard Stats
```graphql
query GetDashboardStats {
  dashboardStats {
    total_vendas
    total_clientes
    total_produtos
    vendas_mes
    crescimento_vendas
  }
}
```

### Clientes
```graphql
query GetClientes($limit: Int, $offset: Int, $search: String) {
  clientes(limit: $limit, offset: $offset, search: $search) {
    id
    nome
    email
    telefone
    cidade
    estado
    total_pedidos
    valor_total
  }
}
```

### Histórico do Cliente
```graphql
query GetClienteHistorico($clienteId: Int!) {
  cliente(id: $clienteId) {
    id
    nome
    email
    pedidos {
      id
      data_pedido
      valor_total
      status
      items {
        id
        quantidade
        preco_unitario
        produto {
          id
          nome
          categoria
        }
      }
    }
  }
}
```

## 🔄 Migração Gradual

Você pode usar GraphQL e REST API simultaneamente:

```typescript
import { useAdaptiveData } from '../components/GraphQLDataProvider'

function MyComponent() {
  // Use GraphQL se disponível, senão use REST API
  const useGraphQL = process.env.NEXT_PUBLIC_ENABLE_GRAPHQL === 'true'
  const data = useAdaptiveData(useGraphQL)
  
  return <div>{/* Seu componente */}</div>
}
```

## 🧪 Testando

### Verificar Conectividade
```typescript
import { checkGraphQLHealth } from '../config/graphql'

const isHealthy = await checkGraphQLHealth()
if (isHealthy) {
  console.log('GraphQL server is running')
}
```

### Exemplo de Página
Visite `/dashboard-graphql` para ver um exemplo completo funcionando.

## 🚨 Troubleshooting

### Erro de CORS
- Verifique se o servidor GraphQL permite requisições do frontend
- Configure os headers CORS no servidor

### Erro de Conexão
- Verifique se `NEXT_PUBLIC_GRAPHQL_URL` está correto
- Teste a URL diretamente no navegador

### Dados não carregam
- Verifique se `NEXT_PUBLIC_ENABLE_GRAPHQL=true`
- Verifique os logs do console para erros
- Use `checkGraphQLHealth()` para testar conectividade

## 📝 Próximos Passos

1. **Implementar servidor GraphQL** - Configure Apollo Server ou similar
2. **Adicionar subscriptions** - Para dados em tempo real
3. **Implementar cache avançado** - Apollo Client ou similar
4. **Adicionar testes** - Para queries e mutations
5. **Monitoramento** - Logs e métricas de performance

## 🤝 Contribuindo

Para adicionar novas queries:
1. Adicione a query em `utils/graphql-queries.ts`
2. Crie tipos TypeScript correspondentes
3. Adicione hook específico em `hooks/useDashboardData.ts`
4. Documente a query neste README

---

**Nota**: Este setup mantém compatibilidade total com o sistema REST existente, permitindo migração gradual.