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

export interface PedidosInput {
  clienteId?: number
  filialId?: number
  vendedorId?: number
  limit?: number
  offset?: number
  dataInicio?: string
  dataFim?: string
  status?: string
  incluirItens?: boolean
}

export interface Produto {
  id: number
  descricao: string
  categoria?: string
  preco: number
  estoque?: number
}

export interface Pedido {
  id: number
  numeroNota?: number
  dataEmissao: string
  valorTotal: number
  status: string
  cliente_id?: number
  data_pedido?: string
  valor_total?: number
  filial?: {
    nome: string
    cidade: string
  }
  cliente?: {
    nome: string
    cpfCnpj: string
  }
  itens?: PedidoItem[]
  items?: PedidoItem[]
}

export interface PedidoItem {
  id?: number
  produto_id?: number
  quantidade: number
  preco_unitario?: number
  valorTotalItem?: number
  produto?: {
    id?: number
    nome?: string
    categoria?: string
    descricao?: string
  }
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
  query GetClienteHistorico($clienteId: Int!) {
    pedidos(input: { clienteId: $clienteId, incluirItens: true }) {
      pedidos {
        id
        numeroNota
        dataEmissao
        valorTotal
        status
        filial {
          nome
          cidade
        }
        cliente {
          nome
          cpfCnpj
        }
        itens {
          quantidade
          valorTotalItem
          produto {
            descricao
          }
        }
      }
      total
    }
  }
`

export const GET_PEDIDOS = `
  query GetPedidos($input: PedidosInput!) {
    pedidos(input: $input) {
      pedidos {
        id
        numeroNota
        dataEmissao
        valorTotal
        status
        clienteId
        filialId
        vendedorId
        filial {
          id
          nome
          cidade
          estado
        }
        cliente {
          id
          nome
          cpfCnpj
          cidade
          estado
        }
        vendedor {
          id
          nome
          cpf
        }
        itens {
          id
          quantidade
          valorUnitario
          valorTotalItem
          produto {
            id
            descricao
          }
        }

      }
      total
      limit
      offset
    }
  }
`

export const GET_PRODUTOS = `
  query GetProdutos($limit: Int, $offset: Int) {
    produtos(input: { limit: $limit, offset: $offset }) {
      produtos {
        id
        descricao
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
      descricao
      preco
      estoque
    }
  }
`