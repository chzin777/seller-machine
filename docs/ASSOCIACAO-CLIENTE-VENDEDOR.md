# 🔗 Associação Cliente-Vendedor através de Notas Fiscais

## 📋 Problema Identificado

A tabela `Clientes` **NÃO possui** uma coluna direta para `ID_Vendedor`, impossibilitando a identificação direta de qual vendedor é responsável por cada cliente.

## ✅ Solução Implementada

### **Derivação de Relacionamento via Notas Fiscais**

Como as **Notas Fiscais** contêm tanto `ID_Cliente` quanto `ID_Vendedor`, utilizamos o histórico de compras (NFs) para associar clientes aos vendedores.

### 🔄 Algoritmo de Enriquecimento

```typescript
// 1. Criar mapa Cliente -> Vendedores
const clienteVendedorMap = new Map<number, Set<number>>();

// 2. Percorrer TODAS as notas fiscais filtradas por hierarquia
notasDataFiltradas.forEach(nota => {
  const clienteId = nota.clienteId ?? nota.ID_Cliente;
  const vendedorId = nota.vendedorId ?? nota.ID_Vendedor;
  
  if (clienteId && vendedorId) {
    // Adicionar vendedor à lista do cliente
    clienteVendedorMap.get(clienteId).add(vendedorId);
  }
});

// 3. Enriquecer cada cliente com lista de vendedores
clientesData = clientesData.map(cliente => ({
  ...cliente,
  vendedoresIds: Array.from(vendedores),      // Todos os vendedores que venderam para este cliente
  vendedorPrincipalId: vendedores[0]           // Vendedor principal (primeiro da lista)
}));
```

### 🎯 Benefícios da Solução

1. **Não requer alteração no schema do banco** ✅
2. **Reflete o histórico real de vendas** ✅
3. **Suporta múltiplos vendedores por cliente** ✅
4. **Compatível com filtros hierárquicos** ✅
5. **Atualiza automaticamente com novos dados** ✅

### 📊 Aplicação nos Filtros

#### **Clientes Ativos**
```typescript
clientesDataFiltrados = clientesData.filter(cliente => {
  // Verificar se o vendedor está na lista de vendedores do cliente
  const temVendedor = cliente.vendedoresIds?.includes(vendedorIdToFilter);
  const matchFilial = filialIdMatch(cliente, userScope.filialId);
  return temVendedor || matchFilial;
});
```

#### **Clientes Inativos**
```typescript
inativosDataFiltrados = inativosData.filter(cliente => {
  // Mesmo critério dos ativos
  const temVendedor = cliente.vendedoresIds?.includes(vendedorIdToFilter);
  const matchFilial = filialIdMatch(cliente, userScope.filialId);
  return temVendedor || matchFilial;
});
```

## 🔍 Estrutura dos Dados Enriquecidos

### Antes (Cliente original)
```typescript
{
  id: 123,
  nome: "Cliente XYZ",
  cpf: "123.456.789-00",
  filialId: 3
  // SEM informação de vendedor
}
```

### Depois (Cliente enriquecido)
```typescript
{
  id: 123,
  nome: "Cliente XYZ",
  cpf: "123.456.789-00",
  filialId: 3,
  vendedoresIds: [117, 45, 89],        // ✅ Lista de vendedores que venderam
  vendedorPrincipalId: 117              // ✅ Vendedor principal
}
```

## 🎨 Casos de Uso

### 1️⃣ **Vendedor com ID 117**
- Verá apenas clientes onde `117 ∈ vendedoresIds`
- Representa clientes que **já compraram** deste vendedor

### 2️⃣ **Gestor I (Filial)**
- Verá todos os clientes da filial
- Independente do vendedor

### 3️⃣ **Gestor Master**
- Verá todos os clientes
- Sem restrições

## ⚠️ Considerações Importantes

### **Cliente sem histórico de compras**
Se um cliente **nunca comprou** (não tem NFs), ele:
- Terá `vendedoresIds = []` (array vazio)
- Terá `vendedorPrincipalId = null`
- **Não aparecerá** no filtro de vendedor (correto!)
- Aparecerá para gestores (apenas por filial/regional)

### **Cliente com múltiplos vendedores**
Se um cliente comprou de vários vendedores:
- Aparecerá no dashboard de **TODOS** esses vendedores
- Reflete a realidade: cliente pode ter relacionamento com múltiplos vendedores

### **Performance**
- Enriquecimento executado **apenas uma vez** ao carregar dados
- Usa `Map` e `Set` para performance O(1) nas buscas
- Não impacta performance de filtros subsequentes

## 🚀 Próximas Melhorias (Opcional)

### **Vendedor Principal Inteligente**
Ao invés de usar o primeiro vendedor, poderia usar:
- Vendedor com maior volume de vendas
- Vendedor com venda mais recente
- Vendedor com mais vendas para aquele cliente

```typescript
// Exemplo: vendedor com mais vendas
const vendedorFrequencia = {};
notasDoCliente.forEach(nota => {
  vendedorFrequencia[nota.vendedorId] = (vendedorFrequencia[nota.vendedorId] || 0) + 1;
});
vendedorPrincipalId = Object.keys(vendedorFrequencia)
  .sort((a, b) => vendedorFrequencia[b] - vendedorFrequencia[a])[0];
```

---

**Última atualização:** 2025-10-29  
**Implementado em:** `src/components/DataProvider.tsx`  
**Mantido por:** Sistema de IA
