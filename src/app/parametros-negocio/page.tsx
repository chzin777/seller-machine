'use client';

import { useState, useEffect } from 'react';
import PageHeader from './components/PageHeader';
import TabNavigation from './components/TabNavigation';
import InactivityTab from './components/InactivityTab';
import RFVTab from './components/RFVTab';
import ExistingTab from './components/ExistingTab';
import { useInactivity } from './hooks/useInactivity';
import { useRFV } from './hooks/useRFV';
import { useAPI } from './hooks/useAPI';
import { useFilters } from './hooks/useFilters';

export default function ParametrosNegocio() {
  const [activeTab, setActiveTab] = useState<'inatividade' | 'rfv' | 'existentes'>('inatividade');

  // Hooks customizados
  const { apiStatus, filiais, verificarStatusAPI, carregarFiliais } = useAPI();
  
  const {
    configuracao,
    updateField,
    diasInatividade,
    setDiasInatividade,
    loadingFiltros,
    dirtyInatividade,
    carregarConfiguracaoInatividade,
    salvarInatividade,
    resetInatividade
  } = useInactivity();

  const {
    config,
    setConfig,
    editing,
    savingConfig,
    parametros,
    loadingLista,
    carregarParametros,
    salvarRFV,
    resetConfig,
    updateRange,
    addRange,
    removeRange,
    excluir,
    duplicar,
    editar,
    ativo,
    resumo
  } = useRFV();

  const {
    search,
    setSearch,
    filialFiltro,
    setFilialFiltro,
    status,
    setStatus,
    mostrar,
    toggle,
    filtrados
  } = useFilters(parametros, ativo);

  // Efeitos
  useEffect(() => {
    carregarFiliais();
    carregarParametros();
    carregarConfiguracaoInatividade();
    verificarStatusAPI();
  }, []);

  // Handlers para navegação entre abas
  const handleDuplicar = (parametro: any) => {
    duplicar(parametro);
    setActiveTab('rfv');
  };

  const handleEditar = (parametro: any) => {
    editar(parametro);
    setActiveTab('rfv');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <PageHeader apiStatus={apiStatus} />
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === 'inatividade' && (
          <InactivityTab
            configuracao={configuracao}
            updateField={updateField}
            diasInatividade={diasInatividade}
            setDiasInatividade={setDiasInatividade}
            loadingFiltros={loadingFiltros}
            dirtyInatividade={dirtyInatividade}
            salvarInatividade={salvarInatividade}
            resetInatividade={resetInatividade}
          />
        )}

        {activeTab === 'rfv' && (
          <RFVTab
            config={config}
            setConfig={setConfig}
            editing={editing}
            savingConfig={savingConfig}
            filiais={filiais}
            salvarRFV={salvarRFV}
            resetConfig={resetConfig}
            updateRange={updateRange}
            addRange={addRange}
            removeRange={removeRange}
          />
        )}

        {activeTab === 'existentes' && (
          <ExistingTab
            parametros={parametros}
            filtrados={filtrados}
            loadingLista={loadingLista}
            search={search}
            setSearch={setSearch}
            filialFiltro={filialFiltro}
            setFilialFiltro={setFilialFiltro}
            status={status}
            setStatus={setStatus}
            mostrar={mostrar}
            toggle={toggle}
            filiais={filiais}
            ativo={ativo}
            resumo={resumo}
            duplicar={handleDuplicar}
            editar={handleEditar}
            excluir={excluir}
          />
        )}
      </div>
    </div>
  );
}
