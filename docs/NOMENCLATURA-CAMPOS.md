# 📋 Guia de Nomenclatura de Campos - Prisma vs SQL vs API Externa

## ⚠️ IMPORTANTE: Inconsistências de Nomenclatura

Este documento mapeia os diferentes nomes de campos usados em diferentes contextos do sistema para evitar erros de filtragem e busca de dados.

---

## 🎯 VENDEDORES

### Tabela: `Vendedores`
### Model Prisma: `Vendedor`

| Contexto | Campo ID | Campo Nome | Campo CPF | Campo Filial |
|----------|----------|------------|-----------|--------------|
| **Prisma (TypeScript)** | `id` | `nome` | `cpf` | `filialId` |
| **SQL Direto** | `ID_Vendedor` | `Nome_Vendedor` | `CPF_Vendedor` | `ID_Filial` |
| **API Externa** | `ID_Vendedor` | `Nome_Vendedor` | `CPF_Vendedor` | `ID_Filial` |
| **JSON Response** | `id` ou `ID_Vendedor` | `nome` ou `Nome_Vendedor` | `cpf` ou `CPF_Vendedor` | `filialId` ou `ID_Filial` |

#### 📌 Schema Prisma:
```prisma
model Vendedor {
  id         Int    @id @default(autoincrement()) @map("ID_Vendedor")
  nome       String @map("Nome_Vendedor")
  cpf        String @unique @map("CPF_Vendedor")
  filialId   Int?   @map("ID_Filial")
  // ...
  @@map("Vendedores")
}
```

#### ✅ Uso Correto:
```typescript
// Prisma Query
const vendedor = await prisma.vendedor.findUnique({
  where: { id: 117 }  // ✅ Use 'id' com Prisma
});

// SQL Direto
const result = await prisma.$queryRaw`
  SELECT ID_Vendedor, Nome_Vendedor  -- ✅ Use 'ID_Vendedor' em SQL
  FROM Vendedores
  WHERE ID_Vendedor = 117
`;

// Filtrar dados da API externa
const vendedores = apiData.filter(v => 
  v.ID_Vendedor === 117 // ✅ API externa usa 'ID_Vendedor'
);

// Filtrar dados do Prisma
const vendedores = prismaData.filter(v => 
  v.id === 117 // ✅ Prisma usa 'id'
);
```

---

## 📝 NOTAS FISCAIS

### Tabela: `Notas_Fiscais_Cabecalho`
### Model Prisma: `NotasFiscalCabecalho`

| Contexto | Campo ID NF | Campo Vendedor | Campo Cliente | Campo Filial |
|----------|-------------|----------------|---------------|--------------|
| **Prisma (TypeScript)** | `id` | `vendedorId` | `clienteId` | `filialId` |
| **SQL Direto** | `ID_Nota_Fiscal` | `ID_Vendedor` | `ID_Cliente` | `ID_Filial` |
| **API Externa** | `ID_Nota_Fiscal` | `ID_Vendedor` | `ID_Cliente` | `ID_Filial` |
| **JSON Response** | `id` ou `ID_Nota_Fiscal` | `vendedorId` ou `ID_Vendedor` | `clienteId` ou `ID_Cliente` | `filialId` ou `ID_Filial` |

#### 📌 Schema Prisma:
```prisma
model NotasFiscalCabecalho {
  id          Int      @id @default(autoincrement()) @map("ID_Nota_Fiscal")
  vendedorId  Int?     @map("ID_Vendedor")
  clienteId   Int?     @map("ID_Cliente")
  filialId    Int?     @map("ID_Filial")
  // ...
  @@map("Notas_Fiscais_Cabecalho")
}
```

#### ✅ Uso Correto:
```typescript
// Prisma Query
const notas = await prisma.notasFiscalCabecalho.findMany({
  where: { vendedorId: 117 }  // ✅ Use 'vendedorId' com Prisma
});

// SQL Direto
const result = await prisma.$queryRaw`
  SELECT ID_Nota_Fiscal, ID_Vendedor  -- ✅ Use 'ID_Vendedor' em SQL
  FROM Notas_Fiscais_Cabecalho
  WHERE ID_Vendedor = 117
`;

// Filtrar dados da API externa (vêm com nomenclatura SQL)
const notasVendedor = apiData.filter(nota => 
  nota.ID_Vendedor === 117 // ✅ API externa usa 'ID_Vendedor'
);

// Se os dados foram mapeados para Prisma format
const notasVendedor = prismaData.filter(nota => 
  nota.vendedorId === 117 // ✅ Dados Prisma usam 'vendedorId'
);
```

---

## 🔍 PROBLEMA COMUM: Filtros Incorretos

### ❌ ERRO - Usar campo errado:
```typescript
// API externa retorna 'ID_Vendedor', mas código usa 'vendedorId'
const notasVendedor = apiData.filter(nota => 
  nota.vendedorId === 117  // ❌ undefined! API usa 'ID_Vendedor'
);
```

### ✅ CORRETO - Verificar ambos os campos:
```typescript
// Compatível com ambos formatos
const notasVendedor = apiData.filter(nota => 
  (nota.vendedorId === 117 || nota.ID_Vendedor === 117)
);

// Ou normalizar os dados primeiro
const normalized = apiData.map(nota => ({
  ...nota,
  vendedorId: nota.vendedorId || nota.ID_Vendedor,
  clienteId: nota.clienteId || nota.ID_Cliente,
  filialId: nota.filialId || nota.ID_Filial
}));
```

---

## 🛠️ HELPER FUNCTIONS

```typescript
/**
 * Normaliza dados da API externa para formato Prisma
 */
export function normalizarNotaFiscal(nota: any) {
  return {
    id: nota.id || nota.ID_Nota_Fiscal,
    vendedorId: nota.vendedorId || nota.ID_Vendedor,
    clienteId: nota.clienteId || nota.ID_Cliente,
    filialId: nota.filialId || nota.ID_Filial,
    valorTotal: nota.valorTotal || nota.Valor_Total_Nota,
    dataEmissao: nota.dataEmissao || nota.Data_Emissao,
    numeroNota: nota.numeroNota || nota.Numero_Nota
  };
}

/**
 * Normaliza dados de vendedor
 */
export function normalizarVendedor(vendedor: any) {
  return {
    id: vendedor.id || vendedor.ID_Vendedor,
    nome: vendedor.nome || vendedor.Nome_Vendedor,
    cpf: vendedor.cpf || vendedor.CPF_Vendedor,
    filialId: vendedor.filialId || vendedor.ID_Filial
  };
}
```

---

## 📊 OUTRAS TABELAS IMPORTANTES

### Clientes
- Prisma: `id`, `nome`, `cpf`, `filialId`
- SQL: `ID_Cliente`, `Nome_Cliente`, `CPF_Cliente`, `ID_Filial`

### Filiais
- Prisma: `id`, `nome`, `regionalId`
- SQL: `ID_Filial`, `Nome_Filial`, `ID_Regional`

### Regionais
- Prisma: `id`, `nome`, `diretoriaId`
- SQL: `ID_Regional`, `Nome_Regional`, `ID_Diretoria`

### Diretorias
- Prisma: `id`, `nome`, `empresaId`
- SQL: `ID_Diretoria`, `Nome_Diretoria`, `ID_Empresa`

---

## ⚡ QUICK REFERENCE

| Quando usar | Campo vendedor | Campo cliente | Campo filial |
|-------------|----------------|---------------|--------------|
| **Prisma queries** | `vendedorId` | `clienteId` | `filialId` |
| **SQL direto** | `ID_Vendedor` | `ID_Cliente` | `ID_Filial` |
| **API externa** | `ID_Vendedor` | `ID_Cliente` | `ID_Filial` |
| **UserScope** | `vendedorId` | - | `filialId` |
| **Filtros frontend** | Verificar ambos! | Verificar ambos! | Verificar ambos! |

---

## 🚨 CHECKLIST ANTES DE FAZER FILTROS

- [ ] Verifiquei se os dados vêm do Prisma ou API externa?
- [ ] Estou usando o nome de campo correto para a fonte de dados?
- [ ] Adicionei verificação para ambos os formatos (compatibility)?
- [ ] Testei com dados reais da API?
- [ ] Adicionei logs para debug do formato dos dados?

---

**Última atualização:** 2025-10-29
**Mantido por:** Sistema de IA
