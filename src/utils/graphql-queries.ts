// utils/graphql-queries.ts

// Tipos para as respostas das queries
export interface Cliente {
  id: number
  nome: string
  cpfCnpj?: string
  cidade?: string
  estado?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cep?: string
  telefone?: string
}

export interface ClientesInput {
  clienteId?: number
  limit?: number
  offset?: number
  nome?: string
  cidade?: string
  estado?: string
  filialId?: number
}

export interface Produto {
  id: number
  nome: string
  categoria: string
  preco: number
  estoque?: number
}

export interface Pedido {
  id: number
  cliente_id: number
  data_pedido: string
  valor_total: number
  status: string
  items?: PedidoItem[]
}

export interface PedidoItem {
  id: number
  produto_id: number
  quantidade: number
  preco_unitario: number
  produto?: Produto
}

export interface DashboardStats {
  total_vendas: number
  total_clientes: number
  total_produtos: number
  vendas_mes: number
  crescimento_vendas: number
}

export interface VendaPorMes {
  mes: string
  vendas: number
}

export interface TopProduto {
  produto: Produto
  quantidade_vendida: number
  receita_total: number
}

// Queries GraphQL
export const GET_DASHBOARD_STATS = `
  query GetDashboardStats {
    clientes(input: { limit: 1, offset: 0 }) {
      total
    }
  }
`

export const GET_CLIENTES = `
  query GetClientes($input: ClientesInput!) {
    clientes(input: $input) {
      clientes {
        id
        nome
        cpfCnpj
        cidade
        estado
        logradouro
        numero
        bairro
        cep
        telefone
      }
      total
      limit
      offset
    }
  }
`

export const GET_CLIENTE_HISTORICO = `
  query GetClienteHistorico($limit: Int, $offset: Int) {
    clientes(input: { limit: $limit, offset: $offset }) {
      clientes {
        id
        nome
        cpfCnpj
        cidade
        estado
        logradouro
        numero
        bairro
        cep
        telefone
      }
      total
      limit
      offset
    }
  }
`

export const GET_PRODUTOS = `
  query GetProdutos($limit: Int, $offset: Int) {
    clientes(input: { limit: $limit, offset: $offset }) {
      clientes {
        id
        nome
      }
      total
    }
  }
`

export const GET_VENDAS_POR_MES = `
  query GetVendasPorMes($input: CrmAnaliseInput!) {
    crmNovosRecorrentes(input: $input) {
      meses {
        mes
        novos {
          quantidade
        }
        recorrentes {
          quantidade
        }
      }
    }
  }
`

export const GET_TOP_PRODUTOS = `
  query GetTopProdutos($filialId: Float!, $periodo: String!) {
    mixPorTipo(filialId: $filialId, periodo: $periodo) {
      tipos {
        tipo
        quantidade
      }
    }
  }
`

export const GET_ASSOCIACOES = `
  query GetAssociacoes($input: MixPortfolioInput!) {
    crossSell(input: $input) {
      __typename
    }
  }
`

// Mutations
export const CREATE_CLIENTE = `
  mutation CreateCliente($input: ClienteInput!) {
    createCliente(input: $input) {
      id
      nome
      email
      telefone
      cidade
      estado
    }
  }
`

export const UPDATE_CLIENTE = `
  mutation UpdateCliente($id: Int!, $input: ClienteInput!) {
    updateCliente(id: $id, input: $input) {
      id
      nome
      email
      telefone
      cidade
      estado
    }
  }
`

export const CREATE_PRODUTO = `
  mutation CreateProduto($input: ProdutoInput!) {
    createProduto(input: $input) {
      id
      nome
      categoria
      preco
      estoque
    }
  }
`