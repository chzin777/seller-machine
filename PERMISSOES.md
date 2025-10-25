# 🛡️ Sistema de Permissões e Acessos

## Visão Geral

Este documento define claramente o que cada perfil de usuário pode acessar no sistema, baseado na hierarquia organizacional da empresa.

## 📊 Hierarquia de Perfis

```
🔴 GESTOR_MASTER     - Acesso total ao sistema
🟠 GESTOR_III        - Diretoria (todas regionais da diretoria)
🟡 GESTOR_II         - Regional (todas filiais da regional)
🟢 GESTOR_I          - Filial (todos vendedores da filial)
🔵 VENDEDOR          - Individual (apenas próprios dados)
```

## 🔵 VENDEDOR - Escopo Pessoal

### ✅ O que PODE acessar:
- **Carteira própria**: Ver e editar apenas seus clientes
- **Agenda pessoal**: Gerenciar compromissos próprios
- **Funil de vendas**: Apenas seu pipeline pessoal
- **Dashboard pessoal**: Métricas individuais
- **Relatórios próprios**: Apenas seus dados de desempenho
- **Insights de IA**: Análises baseadas em seus dados
- **Análise RFV**: Dos seus clientes

### ❌ O que NÃO pode acessar:
- Dados de outros vendedores
- Carteira de outros vendedores
- Clientes de outros vendedores
- Dashboards consolidados
- Configurações do sistema
- Gestão de usuários
- Relatórios globais

---

## 🟢 GESTOR I - Escopo da Filial

### ✅ O que PODE acessar:
- **Todos os acessos do VENDEDOR**
- **Carteira da filial**: Ver/editar carteiras de todos vendedores da filial
- **Vendedores da filial**: Gerenciar equipe local
- **Clientes da filial**: Todos os clientes atendidos pela filial
- **Dashboard da filial**: Métricas consolidadas da unidade
- **Analytics da filial**: Relatórios e análises da filial
- **Agenda da filial**: Visualizar agenda de todos vendedores
- **Funil da filial**: Pipeline consolidado da filial

### ❌ O que NÃO pode acessar:
- Dados de outras filiais
- Vendedores de outras filiais
- Dashboards regionais/globais
- Configurações avançadas de RFV
- Gestão de usuários
- Configurações do sistema

---

## 🟡 GESTOR II - Escopo Regional

### ✅ O que PODE acessar:
- **Todos os acessos do GESTOR I**
- **Carteira regional**: Todas filiais da regional
- **Vendedores regionais**: Todos vendedores da regional
- **Clientes regionais**: Todos os clientes da regional
- **Dashboard regional**: Métricas da regional
- **Analytics regionais**: Relatórios consolidados da regional
- **Comparativo entre filiais**: Performance das filiais
- **Gestão de filiais**: Supervisão das unidades

### ❌ O que NÃO pode acessar:
- Dados de outras regionais
- Dashboard global completo
- Configurações de RFV
- Gestão de usuários
- Parâmetros de IA avançados

---

## 🟠 GESTOR III - Escopo de Diretoria

### ✅ O que PODE acessar:
- **Todos os acessos do GESTOR II**
- **Visão global da diretoria**: Todas regionais da diretoria
- **Dashboard executivo**: Métricas estratégicas
- **Configuração RFV**: Parâmetros de segmentação
- **Analytics avançados**: Relatórios executivos
- **Comparativo entre regionais**: Performance regional
- **Configurações avançadas**: Parâmetros de negócio

### ❌ O que NÃO pode acessar:
- Gestão de usuários (criar/deletar)
- Configurações de sistema críticas
- Logs de sistema
- Operações de banco de dados

---

## 🔴 GESTOR MASTER - Acesso Total

### ✅ O que PODE acessar:
- **TUDO o que os outros perfis acessam**
- **Gestão de usuários**: Criar, editar, deletar usuários
- **Hierarquia organizacional**: Gerenciar estrutura da empresa
- **Configurações do sistema**: Parâmetros críticos
- **Logs de sistema**: Auditoria completa
- **Configurações de IA**: Modelos e treinamento
- **Operações de banco**: Seeds e manutenção
- **API usage**: Monitoramento de uso
- **Notificações**: Gerenciar alertas do sistema

---

## 🚦 Matriz de Permissões por Funcionalidade

| Funcionalidade | Vendedor | Gestor I | Gestor II | Gestor III | Master |
|---|---|---|---|---|---|
| **Carteira Própria** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Carteira da Filial** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Carteira Regional** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Carteira Global** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Clientes Próprios** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Clientes da Filial** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Clientes Regionais** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Todos Clientes** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Vendedores da Filial** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Vendedores Regionais** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Todos Vendedores** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Dashboard Pessoal** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Dashboard da Filial** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Dashboard Regional** | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Dashboard Global** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Configurar RFV** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Insights de IA** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Configurar IA** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Gestão de Usuários** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Config. Sistema** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🔐 Implementação Técnica

### Verificação de Escopo
O sistema verifica automaticamente o escopo baseado no perfil:

```typescript
// Exemplo: Vendedor só acessa próprios dados
if (role === 'VENDEDOR') {
  whereClause.vendedorId = userId;
}

// Exemplo: Gestor I acessa dados da filial
if (role === 'GESTOR_I') {
  whereClause.filialId = userFilialId;
}
```

### Proteção de Rotas
Cada rota é protegida com as permissões necessárias:

```typescript
// Rota protegida por escopo
const authResult = requirePermission('VIEW_FILIAL_CLIENTS')(request);
```

### Validação de Dados
Antes de retornar dados, o sistema valida se o usuário tem acesso:

```typescript
const accessValidation = validateDataAccess(scope, targetData);
if (!accessValidation.allowed) {
  return { error: accessValidation.reason };
}
```

---

## 📋 Rotas e Acessos

### Rotas Públicas (sem autenticação)
- `/login`
- `/esqueci-senha`
- `/nova-senha`

### Rotas por Perfil

#### 🔵 VENDEDOR
- `/dashboard` (pessoal)
- `/ia` (insights pessoais)

#### 🟢 GESTOR_I + acima
- `/carteira-vendedor`
- `/vendedores`

#### 🟡 GESTOR_II + acima
- `/clientes`
- `/api/clientes`
- `/api/rfv`

#### 🟠 GESTOR_III + acima
- `/dashboard-graphql`
- `/configurar-rfv`
- `/api/rfv-parameters`

#### 🔴 GESTOR_MASTER apenas
- `/usuarios`
- `/api/users`
- `/api/hierarchy`
- `/api/seed`
- `/configuracoes`

---

## ⚡ Resumo Executivo

**Princípio fundamental**: Cada usuário enxerga apenas os dados do seu escopo hierárquico ou abaixo.

1. **Vendedor**: Apenas seus dados
2. **Gestor I**: Sua filial completa
3. **Gestor II**: Sua regional (múltiplas filiais)
4. **Gestor III**: Sua diretoria (múltiplas regionais)
5. **Master**: Tudo (+ administração do sistema)

Este modelo garante segurança, privacidade e governança adequada dos dados, respeitando a hierarquia organizacional da empresa.