"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type DadosVendaPorRegiao = {
  cidade: string;
  estado: string;
  totalVendas: number;
  totalClientes: number;
  receitaTotal: number;
  latitude?: number;
  longitude?: number;
};

interface MapaComponenteProps {
  dados: DadosVendaPorRegiao[];
}

export default function MapaComponente({ dados }: MapaComponenteProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);

  // Funções de formatação seguras
  const formatarMoeda = (valor: number): string => {
    if (!valor || isNaN(valor) || !isFinite(valor)) return 'R$ 0,00';
    const valorLimitado = Math.min(Math.abs(valor), 999999999999);
    try {
      return `R$ ${valorLimitado.toLocaleString('pt-BR', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    } catch (error) {
      return `R$ ${valorLimitado.toFixed(2).replace('.', ',')}`;
    }
  };

  const formatarNumero = (valor: number): string => {
    if (!valor || isNaN(valor) || !isFinite(valor)) return '0';
    const valorLimitado = Math.min(Math.abs(valor), 999999999999);
    try {
      return valorLimitado.toLocaleString('pt-BR');
    } catch (error) {
      return valorLimitado.toString();
    }
  };

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Inicializar o mapa centralizado no Brasil
    const map = L.map(mapRef.current, {
      center: [-14.235, -51.9253], // Centro do Brasil
      zoom: 4,
      zoomControl: true,
    });

    // Adicionar tile layer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || dados.length === 0) return;

    const map = leafletMapRef.current;

    // Limpar marcadores existentes
    map.eachLayer((layer) => {
      if (layer instanceof L.CircleMarker || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Calcular valores máximos para normalização
    const maxReceita = Math.max(...dados.map(d => d.receitaTotal));
    const maxClientes = Math.max(...dados.map(d => d.totalClientes));

    // Adicionar círculos proporcionais aos dados de vendas
    dados.forEach((item) => {
      if (!item.latitude || !item.longitude) return;

      // Calcular tamanho do círculo baseado na receita (5-50px)
      const tamanho = Math.max(5, Math.min(50, (item.receitaTotal / maxReceita) * 45 + 5));
      
      // Calcular cor baseada na intensidade de clientes
      const intensidade = item.totalClientes / maxClientes;
      const cor = intensidade > 0.7 ? '#dc2626' : // vermelho para alta intensidade
                  intensidade > 0.4 ? '#ea580c' : // laranja para média intensidade
                  intensidade > 0.2 ? '#d97706' : // amarelo para baixa intensidade
                  '#16a34a'; // verde para muito baixa intensidade

      const circle = L.circleMarker([item.latitude, item.longitude], {
        radius: tamanho,
        fillColor: cor,
        color: '#ffffff',
        weight: 2,
        opacity: 0.8,
        fillOpacity: 0.6
      }).addTo(map);

      // Adicionar popup com informações
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h3 class="font-bold text-lg text-gray-800 mb-2">${item.cidade}, ${item.estado}</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Clientes:</span>
              <span class="font-semibold text-blue-600">${formatarNumero(item.totalClientes)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Vendas:</span>
              <span class="font-semibold text-purple-600">${formatarNumero(item.totalVendas)}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Receita:</span>
              <span class="font-semibold text-green-600">${formatarMoeda(item.receitaTotal)}</span>
            </div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent, {
        maxWidth: 250,
        className: 'custom-popup'
      });

      // Adicionar tooltip que aparece ao passar o mouse
      circle.bindTooltip(`${item.cidade}, ${item.estado}`, {
        permanent: false,
        direction: 'top',
        offset: [0, -10],
        className: 'custom-tooltip'
      });
    });

    // Ajustar zoom para mostrar todos os pontos
    if (dados.length > 0) {
      const group = new L.FeatureGroup(
        dados
          .filter(item => item.latitude && item.longitude)
          .map(item => L.marker([item.latitude!, item.longitude!]))
      );
      
      if (group.getBounds().isValid()) {
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [dados]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg overflow-hidden" />
      
      {/* Legenda */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 max-w-xs z-[1000]">
        <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-2">Legenda</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Alta concentração de clientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Média concentração</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Baixa concentração</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Muito baixa concentração</span>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-gray-500 dark:text-gray-400">Tamanho do círculo = Receita</p>
          </div>
        </div>
      </div>

      {/* Indicador de carregamento caso não tenha dados */}
      {dados.length === 0 && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600 dark:text-gray-400">Nenhum dado disponível</p>
          </div>
        </div>
      )}
    </div>
  );
}
