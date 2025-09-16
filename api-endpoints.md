# 📋 Documentação de Endpoints da API

## 🌐 Configuração Base

**URL Base de Produção:** `https://api-seller-machine-production.up.railway.app`  
**URL Base de Desenvolvimento:** `http://localhost:3001`  
**Porta da API:** `3001`

---

## 📑 Índice

1. [🏢 Entidades Principais](#-entidades-principais)
   - [Filiais](#filiais)
   - [Clientes](#clientes)
   - [Produtos](#produtos)
   - [Vendedores](#vendedores)
2. [📄 Transações](#-transações)
3. [📦 Estoque](#-estoque)
4. [📊 Indicadores e Analytics](#-indicadores-e-analytics)
5. [🎯 CRM e Análise de Clientes](#-crm-e-análise-de-clientes)
6. [📈 RFV (Recência, Frequência, Valor)](#-rfv-recência-frequência-valor)
7. [🤖 Inteligência Artificial](#-inteligência-artificial)
8. [🚀 GraphQL](#-graphql-endpoints)
9. [🔧 Configurações e Outros](#-configurações-e-outros)

---

## 🏢 Entidades Principais

### Filiais

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/filiais` | Lista todas as filiais |
| `GET` | `/api/filiais/stats` | Estatísticas das filiais |
| `GET` | `/api/filiais/:id` | Busca filial por ID |
| `POST` | `/api/filiais` | Cria nova filial |
| `PUT` | `/api/filiais/:id` | Atualiza filial |
| `DELETE` | `/api/filiais/:id` | Remove filial |

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/clientes` | Lista todos os clientes |
| `GET` | `/api/clientes/stats` | Estatísticas dos clientes |
| `GET` | `/api/clientes/documento/:documento` | Busca por CPF/CNPJ |
| `GET` | `/api/clientes/cidade/:cidade` | Clientes por cidade |
| `GET` | `/api/clientes/estado/:estado` | Clientes por estado |
| `GET` | `/api/clientes/:id` | Busca cliente por ID |
| `POST` | `/api/clientes` | Cria novo cliente |
| `PUT` | `/api/clientes/:id` | Atualiza cliente |
| `DELETE` | `/api/clientes/:id` | Remove cliente |

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/produtos` | Lista todos os produtos |
| `GET` | `/api/produtos/stats` | Estatísticas dos produtos |
| `GET` | `/api/produtos/resumo` | Resumo dos produtos |
| `GET` | `/api/produtos/tipo/:tipo` | Produtos por tipo |
| `GET` | `/api/produtos/preco/:min/:max` | Produtos por faixa de preço |
| `GET` | `/api/produtos/buscar/:termo` | Busca produtos por termo |
| `GET` | `/api/produtos/:id` | Busca produto por ID |
| `POST` | `/api/produtos` | Cria novo produto |
| `PUT` | `/api/produtos/:id` | Atualiza produto |
| `DELETE` | `/api/produtos/:id` | Remove produto |

### Vendedores

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/vendedores` | Lista todos os vendedores |
| `GET` | `/api/vendedores/stats` | Estatísticas dos vendedores |
| `GET` | `/api/vendedores/resumo` | Resumo dos vendedores |
| `GET` | `/api/vendedores/sem-filial` | Vendedores sem filial |
| `GET` | `/api/vendedores/cpf/:cpf` | Busca por CPF |
| `GET` | `/api/vendedores/filial/:filialId` | Vendedores por filial |
| `GET` | `/api/vendedores/:id` | Busca vendedor por ID |
| `POST` | `/api/vendedores` | Cria novo vendedor |
| `PUT` | `/api/vendedores/:id` | Atualiza vendedor |
| `DELETE` | `/api/vendedores/:id` | Remove vendedor |
---

## 📄 Transações

### Notas Fiscais

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/notas-fiscais` | Lista todas as notas fiscais |
| `GET` | `/api/notas-fiscais/resumo` | Resumo das notas fiscais |
| `GET` | `/api/notas-fiscais/periodo` | Notas por período |
| `GET` | `/api/notas-fiscais/filial/:filialId` | Notas por filial |
| `GET` | `/api/notas-fiscais/cliente/:clienteId` | Notas por cliente |
| `GET` | `/api/notas-fiscais/vendedor/:vendedorId` | Notas por vendedor |
| `GET` | `/api/notas-fiscais/:id` | Busca nota por ID |
| `POST` | `/api/notas-fiscais` | Cria nova nota fiscal |
| `PUT` | `/api/notas-fiscais/:id` | Atualiza nota fiscal |
| `DELETE` | `/api/notas-fiscais/:id` | Remove nota fiscal |

### Itens de Nota Fiscal

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/notas-fiscais-itens` | Lista todos os itens |
| `POST` | `/api/notas-fiscais-itens` | Cria novo item |
| `PUT` | `/api/notas-fiscais-itens/:id` | Atualiza item |
| `DELETE` | `/api/notas-fiscais-itens/:id` | Remove item |

---

## 📦 Estoque

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/estoque` | Lista todo o estoque |
| `GET` | `/api/estoque/stats` | Estatísticas do estoque |
| `GET` | `/api/estoque/status/:status` | Estoque por status |
| `GET` | `/api/estoque/produto/:produtoId` | Estoque por produto |
| `GET` | `/api/estoque/:chassi` | Busca por chassi |
| `POST` | `/api/estoque` | Adiciona item ao estoque |
| `PUT` | `/api/estoque/:chassi` | Atualiza item do estoque |
| `DELETE` | `/api/estoque/:chassi` | Remove item do estoque |
---

## 📊 Indicadores e Analytics

### Indicadores Gerais

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/indicadores/receita-total` | Receita total |
| `GET` | `/api/indicadores/receita-por-vendedor` | Receita por vendedor |
| `GET` | `/api/indicadores/clientes-inativos` | Clientes inativos |
| `GET` | `/api/indicadores/receita-por-tipo-produto` | Receita por tipo de produto |
| `GET` | `/api/indicadores/receita-mensal` | Receita mensal |
| `GET` | `/api/indicadores/produtos-mais-vendidos` | Top produtos |
| `GET` | `/api/indicadores/vendas-por-filial` | Vendas por filial |

### Parâmetros de Vendas

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/ticket-medio` | Ticket médio geral |
| `GET` | `/api/ticket-medio-vendedor` | Ticket médio por vendedor |
| `GET` | `/api/itens-por-nf` | Itens por nota fiscal |
| `GET` | `/api/sazonalidade` | Análise de sazonalidade |
| `GET` | `/api/receita-localizacao` | Receita por localização |
| `GET` | `/api/receita-vendedor` | Receita detalhada por vendedor |
| `GET` | `/api/receita-vendedor-detalhada` | Receita vendedor detalhada |
| `GET` | `/api/estatisticas-notas-fiscais` | Estatísticas das notas |

### Análises Específicas de Vendedores

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/mix-vendedor` | Mix de produtos por vendedor |
| `GET` | `/api/cobertura-carteira` | Cobertura de carteira |
| `GET` | `/api/ranking-vendedores` | Ranking de vendedores |

### Análises de Filiais

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/receita-filial` | Receita por filial |
| `GET` | `/api/mix-filial` | Mix de produtos por filial |
| `GET` | `/api/participacao-receita-filial` | Participação na receita |
| `GET` | `/api/receita-filial-regiao` | Receita por região |
---

## 🎯 CRM e Análise de Clientes

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/crm/inatividade` | Análise de inatividade de clientes |
| `GET` | `/api/crm/novos-recorrentes` | Novos vs recorrentes por mês |
| `GET` | `/api/crm/intervalo-tempo-vida` | Intervalo entre compras |
| `GET` | `/api/crm/metricas-12m` | Métricas dos últimos 12 meses |
| `GET` | `/api/crm/concentracao-receita` | Concentração de receita |
| `GET` | `/api/crm/cohort-analysis` | Análise de coorte |
| `GET` | `/api/crm/pos-venda-percentual` | Pós-venda percentual |
| `GET` | `/api/crm/pos-venda-valor` | Pós-venda valor |

---

## 📈 RFV (Recência, Frequência, Valor)

### Parâmetros RFV

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/rfv/parameters` | Parâmetros RFV |
| `POST` | `/api/rfv/parameters` | Cria parâmetros RFV |
| `DELETE` | `/api/rfv/parameters/:id` | Remove parâmetros RFV |

### Análise e Segmentos RFV

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/rfv/analysis` | Executa análise RFV |
| `GET` | `/api/rfv/segments` | Segmentos RFV |
| `POST` | `/api/rfv/segments` | Cria segmento RFV |
| `PUT` | `/api/rfv/segments/:id` | Atualiza segmento RFV |
| `DELETE` | `/api/rfv/segments/:id` | Remove segmento RFV |
| `GET` | `/api/rfv-segments` | Gerenciamento de segmentos |
| `GET` | `/api/empresas` | Empresas para análise RFV |
---

## 🤖 Inteligência Artificial

### IA Geral

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/ai/recommendations/:clienteId` | Recomendações inteligentes |
| `GET` | `/api/ai/churn-prediction` | Predição de churn |
| `GET` | `/api/ai/sales-prediction` | Predição de vendas |
| `GET` | `/api/ai/rfv-optimization` | Otimização RFV |
| `GET` | `/api/ai/customer-insights` | Insights de clientes |
| `GET` | `/api/ai/dashboard-summary` | Resumo do dashboard |

### Machine Learning (TensorFlow.js)

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `POST` | `/api/ai/ml/train-churn` | Treina modelo de churn |
| `POST` | `/api/ai/ml/predict-churn` | Predição ML de churn |
| `POST` | `/api/ai/ml/batch-predict-churn` | Predição em lote |
| `POST` | `/api/ai/ml/train-recommendations` | Treina modelo de recomendações |
| `GET` | `/api/ai/ml/recommendations/:clienteId` | Recomendações ML |
| `GET` | `/api/ai/ml/similar-products/:produtoId` | Produtos similares |
| `POST` | `/api/ai/ml/train-clustering` | Treina clustering |
| `GET` | `/api/ai/ml/customer-clusters` | Clusters de clientes |
| `GET` | `/api/ai/ml/data-analysis` | Análise de dados ML |

---

## 🔧 Configurações e Outros

### Associações de Produtos

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/associacoes` | Lista associações de produtos |
| `POST` | `/api/associacoes` | Cria associação |
| `PUT` | `/api/associacoes/:id` | Atualiza associação |
| `DELETE` | `/api/associacoes/:id` | Remove associação |

### Mix de Portfolio

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/mix-portfolio` | Análise de mix de portfolio |

### Configurações

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/configuracao-inatividade` | Configurações de inatividade |
| `GET` | `/api/rfv-tipo-negocio` | Tipos de negócio RFV |

### Proxy

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/api/proxy` | Proxy para APIs externas |

### Endpoint Principal

| Método | Endpoint | Descrição |
|--------|----------|----------|
| `GET` | `/` | Informações da API e links para documentação |
---

## 🚀 GraphQL Endpoints

**URL Base GraphQL:**
- **Produção:** `/graphql`
- **Desenvolvimento:** `http://localhost:4000/graphql`

### Queries Disponíveis

| Query | Input | Descrição |
|-------|-------|----------|
| `clientes` | `ClientesInput` | Lista clientes com filtros |
| `pedidos` | `PedidosInput` | Lista pedidos/notas fiscais |
| `crmInatividade` | `CrmAnaliseInput!` | Análise de inatividade |
| `crmNovosRecorrentes` | `CrmAnaliseInput!` | Novos vs recorrentes |
| `mixPorTipo` | `filialId: Float!, periodo: String!` | Mix por tipo |
| `bundleRate` | `MixPortfolioInput!` | Taxa de bundle |
| `crossSell` | `MixPortfolioInput!` | Análise de cross-sell |
| `precoRealizadoVsReferencia` | `PrecoRealizadoInput!` | Preço realizado vs referência |
| `produtosSemGiro` | `ProdutosSemGiroInput!` | Produtos sem giro |

---

## 📚 Informações Adicionais

### URLs de Acesso

- **REST API:** `http://localhost:3001/api`
- **GraphQL:** `http://localhost:4000/graphql` (desenvolvimento) ou `/graphql` (produção)

### Padrões da API

- ✅ **RESTful:** Todos os endpoints REST seguem padrões RESTful
- 🔍 **Filtros:** Suporte a filtros via query parameters
- 📄 **Paginação:** Implementada onde necessário
- 🔐 **Autenticação:** Requerida em endpoints sensíveis
- ⚡ **GraphQL:** Consultas otimizadas com controle fino sobre os dados retornados

### Estrutura de Response Padrão

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string | null
}
```

### Headers Comuns

```http
Content-Type: application/json
Authorization: Bearer <token>
```

### Status Codes

| Código | Descrição |
|--------|----------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## 📝 Notas de Manutenção

- [ ] Marque os endpoints implementados
- [ ] Adicione novos endpoints conforme necessário
- [ ] Documente parâmetros, headers e responses
- [ ] Mantenha este arquivo atualizado com mudanças na API
- [ ] Teste regularmente os endpoints em desenvolvimento

---

*Última atualização: $(date)*