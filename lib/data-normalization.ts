/**
 * 🔄 Funções de normalização de dados
 * Converte dados da API externa (formato SQL) para formato Prisma
 * 
 * IMPORTANTE: A API externa retorna campos no formato SQL (ID_Vendedor, ID_Cliente, etc)
 * mas nosso código TypeScript usa formato Prisma (vendedorId, clienteId, etc)
 */

/**
 * Normaliza uma nota fiscal para o formato Prisma
 */
export function normalizarNotaFiscal(nota: any) {
  if (!nota) return null;
  
  return {
    id: nota.id ?? nota.ID_Nota_Fiscal,
    numeroNota: nota.numeroNota ?? nota.Numero_Nota,
    dataEmissao: nota.dataEmissao ?? nota.Data_Emissao,
    valorTotal: nota.valorTotal ?? nota.Valor_Total_Nota,
    filialId: nota.filialId ?? nota.ID_Filial,
    clienteId: nota.clienteId ?? nota.ID_Cliente,
    vendedorId: nota.vendedorId ?? nota.ID_Vendedor,
    
    // Dados de relacionamento (se existirem)
    filial: nota.filial,
    cliente: nota.cliente,
    vendedor: nota.vendedor,
    itens: nota.itens,
    
    // Campos calculados (mantém se existirem)
    regionalId: nota.regionalId ?? nota.ID_Regional,
    diretoriaId: nota.diretoriaId ?? nota.ID_Diretoria,
    empresaId: nota.empresaId ?? nota.ID_Empresa,
  };
}

/**
 * Normaliza um vendedor para o formato Prisma
 */
export function normalizarVendedor(vendedor: any) {
  if (!vendedor) return null;
  
  return {
    id: vendedor.id ?? vendedor.ID_Vendedor,
    nome: vendedor.nome ?? vendedor.Nome_Vendedor,
    cpf: vendedor.cpf ?? vendedor.CPF_Vendedor,
    filialId: vendedor.filialId ?? vendedor.ID_Filial,
    
    // Dados de relacionamento
    filial: vendedor.filial,
    
    // Dados calculados (se existirem)
    receita: vendedor.receita,
    volume: vendedor.volume,
    ticketMedio: vendedor.ticketMedio,
    meta: vendedor.meta,
    percentualMeta: vendedor.percentualMeta,
    crescimento: vendedor.crescimento,
    tendencia: vendedor.tendencia,
    ultimaVenda: vendedor.ultimaVenda,
    posicao: vendedor.posicao,
    
    // Hierarquia
    regionalId: vendedor.regionalId ?? vendedor.ID_Regional,
    diretoriaId: vendedor.diretoriaId ?? vendedor.ID_Diretoria,
    empresaId: vendedor.empresaId ?? vendedor.ID_Empresa,
  };
}

/**
 * Normaliza um cliente para o formato Prisma
 */
export function normalizarCliente(cliente: any) {
  if (!cliente) return null;
  
  return {
    id: cliente.id ?? cliente.ID_Cliente,
    nome: cliente.nome ?? cliente.Nome_Cliente,
    cpf: cliente.cpf ?? cliente.CPF_Cliente ?? cliente.CNPJ_Cliente,
    filialId: cliente.filialId ?? cliente.ID_Filial,
    vendedorId: cliente.vendedorId ?? cliente.ID_Vendedor,
    
    // Dados adicionais
    email: cliente.email ?? cliente.Email,
    telefone: cliente.telefone ?? cliente.Telefone,
    cidade: cliente.cidade ?? cliente.Cidade,
    estado: cliente.estado ?? cliente.Estado,
    
    // Dados RFV
    recencia: cliente.recencia,
    frequencia: cliente.frequencia,
    valorMonetario: cliente.valorMonetario ?? cliente.valor_monetario,
    scoreRFV: cliente.scoreRFV ?? cliente.score_rfv,
    
    // Hierarquia
    regionalId: cliente.regionalId ?? cliente.ID_Regional,
    diretoriaId: cliente.diretoriaId ?? cliente.ID_Diretoria,
    empresaId: cliente.empresaId ?? cliente.ID_Empresa,
  };
}

/**
 * Normaliza uma filial para o formato Prisma
 */
export function normalizarFilial(filial: any) {
  if (!filial) return null;
  
  return {
    id: filial.id ?? filial.ID_Filial,
    nome: filial.nome ?? filial.Nome_Filial,
    regionalId: filial.regionalId ?? filial.ID_Regional,
    cidade: filial.cidade ?? filial.Cidade,
    estado: filial.estado ?? filial.Estado,
  };
}

/**
 * Normaliza uma regional para o formato Prisma
 */
export function normalizarRegional(regional: any) {
  if (!regional) return null;
  
  return {
    id: regional.id ?? regional.ID_Regional,
    nome: regional.nome ?? regional.Nome_Regional,
    diretoriaId: regional.diretoriaId ?? regional.ID_Diretoria,
  };
}

/**
 * Normaliza uma diretoria para o formato Prisma
 */
export function normalizarDiretoria(diretoria: any) {
  if (!diretoria) return null;
  
  return {
    id: diretoria.id ?? diretoria.ID_Diretoria,
    nome: diretoria.nome ?? diretoria.Nome_Diretoria,
    empresaId: diretoria.empresaId ?? diretoria.ID_Empresa,
  };
}

/**
 * Normaliza um array de notas fiscais
 */
export function normalizarNotasFiscais(notas: any[]) {
  if (!Array.isArray(notas)) return [];
  return notas.map(normalizarNotaFiscal).filter(Boolean);
}

/**
 * Normaliza um array de vendedores
 */
export function normalizarVendedores(vendedores: any[]) {
  if (!Array.isArray(vendedores)) return [];
  return vendedores.map(normalizarVendedor).filter(Boolean);
}

/**
 * Normaliza um array de clientes
 */
export function normalizarClientes(clientes: any[]) {
  if (!Array.isArray(clientes)) return [];
  return clientes.map(normalizarCliente).filter(Boolean);
}

/**
 * Detecta o formato dos dados (Prisma ou SQL)
 */
export function detectarFormato(obj: any): 'prisma' | 'sql' | 'unknown' {
  if (!obj) return 'unknown';
  
  // Verifica campos característicos de SQL
  if ('ID_Vendedor' in obj || 'ID_Cliente' in obj || 'ID_Nota_Fiscal' in obj) {
    return 'sql';
  }
  
  // Verifica campos característicos de Prisma
  if ('vendedorId' in obj || 'clienteId' in obj) {
    return 'prisma';
  }
  
  return 'unknown';
}

/**
 * Verifica se um ID de vendedor corresponde em ambos formatos
 */
export function vendedorIdMatch(obj: any, targetId: number | undefined): boolean {
  if (!obj || !targetId) return false;
  
  const objVendedorId = obj.vendedorId ?? obj.ID_Vendedor;
  return objVendedorId === targetId;
}

/**
 * Verifica se um ID de cliente corresponde em ambos formatos
 */
export function clienteIdMatch(obj: any, targetId: number | undefined): boolean {
  if (!obj || !targetId) return false;
  
  const objClienteId = obj.clienteId ?? obj.ID_Cliente;
  return objClienteId === targetId;
}

/**
 * Verifica se um ID de filial corresponde em ambos formatos
 */
export function filialIdMatch(obj: any, targetId: number | undefined): boolean {
  if (!obj || !targetId) return false;
  
  const objFilialId = obj.filialId ?? obj.ID_Filial;
  return objFilialId === targetId;
}
