// utils/graphql-queries.ts

// Tipos para as respostas das queries
export interface Cliente {
  id: number
  nome: string
  cpfCnpj?: string
  cidade?: string
  estado?: string
  telefone?: string
}

export interface ClientesInput {
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
    dashboardStats {
      total_vendas
      total_clientes
      total_produtos
      vendas_mes
      crescimento_vendas
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
        telefone
      }
      total
      limit
      offset
    }
  }
`

export const GET_CLIENTE_HISTORICO = `
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
`

export const GET_PRODUTOS = `
  query GetProdutos($limit: Int, $offset: Int, $categoria: String) {
    produtos(limit: $limit, offset: $offset, categoria: $categoria) {
      id
      nome
      categoria
      preco
      estoque
    }
  }
`

export const GET_VENDAS_POR_MES = `
  query GetVendasPorMes($ano: Int) {
    vendasPorMes(ano: $ano) {
      mes
      vendas
    }
  }
`

export const GET_TOP_PRODUTOS = `
  query GetTopProdutos($limit: Int = 10) {
    topProdutos(limit: $limit) {
      produto {
        id
        nome
        categoria
        preco
      }
      quantidade_vendida
      receita_total
    }
  }
`

export const GET_ASSOCIACOES = `
  query GetAssociacoes {
    associacoes {
      produto_a {
        id
        nome
        categoria
      }
      produto_b {
        id
        nome
        categoria
      }
      suporte
      confianca
      lift
      leverage
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