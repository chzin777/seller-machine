// Utilitário para gerenciar configurações de filtros de usuário

export interface FiltrosConfig {
  diasInatividade: number;
  dataUltimaAtualizacao: string;
  // Futuras configurações podem ser adicionadas aqui:
  // diasRecencia?: number;
  // limiteTicketMedio?: number;
  // etc.
}

export const FILTROS_PADRAO: FiltrosConfig = {
  diasInatividade: 90,
  dataUltimaAtualizacao: new Date().toISOString()
};

/**
 * Carrega as configurações de filtros do usuário
 */
export function carregarFiltrosUsuario(userId: string): FiltrosConfig {
  try {
    if (typeof window === 'undefined') {
      return FILTROS_PADRAO;
    }

    const configSalva = localStorage.getItem(`filtros_${userId}`);
    if (configSalva) {
      const config = JSON.parse(configSalva);
      return { ...FILTROS_PADRAO, ...config };
    }
  } catch (error) {
    console.warn('Erro ao carregar configurações de filtros:', error);
  }
  
  return FILTROS_PADRAO;
}

/**
 * Salva as configurações de filtros do usuário
 */
export function salvarFiltrosUsuario(userId: string, filtros: Partial<FiltrosConfig>): boolean {
  try {
    if (typeof window === 'undefined') {
      return false;
    }

    const configAtual = carregarFiltrosUsuario(userId);
    const novaConfig = {
      ...configAtual,
      ...filtros,
      dataUltimaAtualizacao: new Date().toISOString()
    };

    localStorage.setItem(`filtros_${userId}`, JSON.stringify(novaConfig));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações de filtros:', error);
    return false;
  }
}

/**
 * Obtém o número de dias para considerar um cliente inativo
 * Busca primeiro na configuração do usuário, depois usa o padrão
 */
export function obterDiasInatividade(userId?: string): number {
  if (!userId) {
    return FILTROS_PADRAO.diasInatividade;
  }

  const filtros = carregarFiltrosUsuario(userId);
  return filtros.diasInatividade;
}

/**
 * Valida se as configurações estão dentro dos limites aceitáveis
 */
export function validarFiltros(filtros: Partial<FiltrosConfig>): string | null {
  if (filtros.diasInatividade !== undefined) {
    if (filtros.diasInatividade < 1 || filtros.diasInatividade > 365) {
      return "O número de dias para inatividade deve estar entre 1 e 365.";
    }
  }
  
  return null; // Válido
}
