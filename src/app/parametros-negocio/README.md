# Parâmetros de Negócio - Estrutura Componentizada

Esta página foi completamente refatorada em componentes modulares para melhor manutenibilidade e evitar problemas em futuras alterações.

## 📁 Estrutura de Arquivos

```
src/app/parametros-negocio/
├── page.tsx                    # Componente principal
├── types.ts                    # Tipos TypeScript compartilhados
└── components/
    ├── PageHeader.tsx          # Cabeçalho com status da API
    ├── TabNavigation.tsx       # Navegação entre abas
    ├── InactivityTab.tsx       # Aba de filtros de inatividade
    ├── RangeEditor.tsx         # Editor de faixas RFV
    ├── RFVTab.tsx             # Aba de configuração RFV
    └── ExistingTab.tsx        # Aba de configurações existentes
```

## 🧩 Componentes

### 1. **PageHeader**
- Exibe título da página
- Indicador de status da API externa
- Estados: `checking`, `online`, `offline`

### 2. **TabNavigation**
- Navegação elegante entre as 3 abas
- Ícones e labels responsivos
- Transições suaves

### 3. **InactivityTab**
- Configuração de dias para inatividade
- Sugestões por segmento de negócio
- Integração com API externa e fallback local

### 4. **RangeEditor**
- Editor modular para faixas de RFV
- Suporta Recência, Frequência e Valor
- Interface visual diferenciada por tipo

### 5. **RFVTab**
- Formulário completo de configuração RFV
- Usa múltiplos RangeEditor
- Validações e salvamento

### 6. **ExistingTab**
- Lista todas as configurações salvas
- Filtros por busca, filial e status
- Ações: visualizar, duplicar, editar, excluir

## 🔧 Tipos Compartilhados

### `RFVRule`
```typescript
interface RFVRule {
  score: number;
  label: string;
  min?: number;
  max?: number;
}
```

### `RFVParameterSet`
```typescript
interface RFVParameterSet {
  id?: number;
  name: string;
  filialId?: number | null;
  calculation_strategy: 'automatic' | 'manual';
  effectiveFrom: string;
  effectiveTo?: string;
  ruleRecency: RFVRule[];
  ruleFrequency: RFVRule[];
  ruleValue: RFVRule[];
  createdAt?: string;
  updatedAt?: string;
}
```

### `FilialOption`
```typescript
interface FilialOption {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
}
```

## 🎯 Benefícios da Componentização

### ✅ **Manutenibilidade**
- Cada componente tem responsabilidade única
- Fácil localização de código específico
- Alterações isoladas sem impacto em outros componentes

### ✅ **Reutilização**
- Componentes podem ser reutilizados em outras páginas
- RangeEditor pode ser usado para outros tipos de faixas
- PageHeader pode ser padrão para outras configurações

### ✅ **Testabilidade**
- Cada componente pode ser testado isoladamente
- Props bem definidas facilitam testes unitários
- Lógica separada da apresentação

### ✅ **Legibilidade**
- Código mais limpo e organizado
- Nomes descritivos de componentes
- Estrutura clara e hierárquica

### ✅ **Flexibilidade**
- Fácil adição de novas funcionalidades
- Modificações localizadas
- Tipos TypeScript garantem contratos bem definidos

## 🔄 Migração

A página original foi mantida como backup em `page_old.tsx`. A nova estrutura:

1. **Mantém todas as funcionalidades originais**
2. **Adiciona melhorias de UX** (toasts, status da API)
3. **Melhora a arquitetura** (componentização)
4. **Preserva a integração** com APIs existentes

## 📝 Como Adicionar Novas Features

1. **Nova aba**: Criar componente em `components/` e adicionar ao `TabNavigation`
2. **Nova funcionalidade**: Modificar apenas o componente específico
3. **Novo tipo**: Adicionar em `types.ts` e usar em todos os componentes
4. **Nova API**: Integrar no componente principal e passar via props

Esta estrutura garante que futuras alterações sejam mais seguras, organizadas e maintíveis! 🚀
