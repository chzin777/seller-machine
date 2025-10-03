// Hook desabilitado - funcionalidade de parâmetros de negócio removida

import { useState, useEffect } from 'react';

/**
 * Hook que retorna as configurações de filtros do usuário atual
 * NOTA: Funcionalidade removida após remoção dos parâmetros de negócio
 */
export function useFiltrosUsuario() {
  const [loading, setLoading] = useState(false);

  return { 
    filtros: null, 
    loading 
  };
}


