"use client";

import { useEffect, useState } from "react";
import { getUserScopeFromStorage, getScopeDescription } from "../../lib/hierarchical-filters";
import type { UserScope } from "../../lib/scope";
import { Info, Building2, MapPin, Users, User } from "lucide-react";

export default function ScopeIndicator() {
  const [scope, setScope] = useState<UserScope | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const userScope = getUserScopeFromStorage();
    console.log('🔍 Debug ScopeIndicator - userScope:', userScope);
    
    // Debug adicional - ver dados brutos do storage
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      console.log('🔍 Debug ScopeIndicator - raw user data:', userStr);
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('🔍 Debug ScopeIndicator - parsed user:', user);
        } catch (e) {
          console.log('🔍 Debug ScopeIndicator - parse error:', e);
        }
      }
    }
    
    setScope(userScope);
  }, []);

  if (!scope) {
    return null;
  }

  const roleNames: Record<string, string> = {
    'VENDEDOR': 'Vendedor',
    'GESTOR_I': 'Gestor de Filial',
    'GESTOR_II': 'Gestor Regional',
    'GESTOR_III': 'Gestor de Diretoria',
    'GESTOR_MASTER': 'Gestor Master'
  };

  const roleColors: Record<string, string> = {
    'VENDEDOR': 'bg-blue-500',
    'GESTOR_I': 'bg-green-500',
    'GESTOR_II': 'bg-yellow-500',
    'GESTOR_III': 'bg-orange-500',
    'GESTOR_MASTER': 'bg-red-500'
  };

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Indicador compacto */}
      <div 
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 cursor-pointer hover:shadow-xl transition-all duration-200"
        onClick={() => setIsVisible(!isVisible)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${roleColors[scope.role] || 'bg-gray-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {roleNames[scope.role] || scope.role}
          </span>
          <Info className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Painel expandido */}
      {isVisible && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${roleColors[scope.role] || 'bg-gray-500'}`}></div>
            <h3 className="font-semibold text-gray-800">Seu Nível de Acesso</h3>
          </div>

          {/* Descrição do escopo */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              {getScopeDescription(scope)}
            </p>
          </div>

          {/* Informações hierárquicas */}
          <div className="space-y-3">
            {scope.empresaId && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Empresa ID:</span>
                <span className="font-medium text-gray-800">{scope.empresaId}</span>
              </div>
            )}
            
            {scope.diretoriaId && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Diretoria ID:</span>
                <span className="font-medium text-gray-800">{scope.diretoriaId}</span>
              </div>
            )}
            
            {scope.regionalId && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Regional ID:</span>
                <span className="font-medium text-gray-800">{scope.regionalId}</span>
              </div>
            )}
            
            {scope.filialId && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Filial ID:</span>
                <span className="font-medium text-gray-800">{scope.filialId}</span>
              </div>
            )}
            
            {scope.userId && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Usuário ID:</span>
                <span className="font-medium text-gray-800">{scope.userId}</span>
              </div>
            )}
          </div>

          {/* Footer com informação adicional */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Os dados exibidos são filtrados automaticamente baseado no seu nível de acesso.
            </p>
          </div>

          {/* Botão para fechar */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}