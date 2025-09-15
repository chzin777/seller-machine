// Exemplo de como usar as configurações de filtros em outros componentes
// Este arquivo demonstra como integrar os filtros personalizados

import { useFiltrosUsuario, useDiasInatividade } from '../hooks/useFiltrosUsuario';

// Exemplo 1: Usando o hook completo de filtros
export function ExemploComponenteCompleto() {
  const { filtros, loading } = useFiltrosUsuario();

  if (loading) {
    return <div>Carregando configurações...</div>;
  }

  return (
    <div>
      <p>Cliente é considerado inativo após: {filtros.diasInatividade} dias</p>
      <p>Última atualização: {new Date(filtros.dataUltimaAtualizacao).toLocaleDateString()}</p>
    </div>
  );
}

// Exemplo 2: Usando apenas os dias de inatividade
export function ExemploComponenteSimples() {
  const diasInatividade = useDiasInatividade();

  const verificarClienteInativo = (ultimaCompra: string) => {
    const hoje = new Date();
    const dataUltimaCompra = new Date(ultimaCompra);
    const diferencaDias = Math.floor((hoje.getTime() - dataUltimaCompra.getTime()) / (1000 * 60 * 60 * 24));
    
    return diferencaDias > diasInatividade;
  };

  return (
    <div>
      <p>Verificação de inatividade usando {diasInatividade} dias</p>
    </div>
  );
}

// Exemplo 3: Como integrar em uma lista de clientes
export function ListaClientesComFiltros({ clientes }: { clientes: any[] }) {
  const diasInatividade = useDiasInatividade();

  const clientesComStatus = clientes.map(cliente => {
    const ultimaCompra = cliente.ultima_compra || cliente.last_order_at;
    const diasSemComprar = ultimaCompra 
      ? Math.floor((new Date().getTime() - new Date(ultimaCompra).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      ...cliente,
      inativo: diasSemComprar > diasInatividade,
      diasSemComprar
    };
  });

  return (
    <div>
      {clientesComStatus.map(cliente => (
        <div key={cliente.id} className={cliente.inativo ? 'text-red-500' : 'text-green-500'}>
          {cliente.nome} - {cliente.inativo ? 'Inativo' : 'Ativo'} 
          ({cliente.diasSemComprar} dias sem comprar)
        </div>
      ))}
    </div>
  );
}
