import type { NextRequest } from 'next/server';

export type UserScope = {
  role: string;
  empresaId?: number;
  diretoriaId?: number;
  regionalId?: number;
  filialId?: number;
  userId?: number;
  vendedorId?: number; // ID_Vendedor da tabela Vendedores (vinculado via CPF do usuário)
};

function parseNum(value: string | null): number | undefined {
  if (!value) return undefined;
  const v = value.trim();
  if (v === '' || v === 'undefined' || v === 'null') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function deriveScopeFromHeaders(headers: Headers): UserScope {
  const role = headers.get('x-user-role') || 'VENDEDOR';
  return {
    role,
    empresaId: parseNum(headers.get('x-user-empresa-id')),
    diretoriaId: parseNum(headers.get('x-user-diretoria-id')),
    regionalId: parseNum(headers.get('x-user-regional-id')),
    filialId: parseNum(headers.get('x-user-filial-id')),
    userId: parseNum(headers.get('x-user-id')),
  };
}

export function deriveScopeFromRequest(req: NextRequest): UserScope {
  return deriveScopeFromHeaders(req.headers);
}

export function applyBasicScopeToWhere(where: any, scope: UserScope, keys?: {
  filialKey?: string;
  regionalKey?: string;
  diretoriaKey?: string;
  userKey?: string;
}) {
  const result = { ...(where || {}) };
  switch (scope.role) {
    case 'VENDEDOR': {
      if (scope.userId && keys?.userKey) {
        (result as any)[keys.userKey] = scope.userId;
      } else if (scope.filialId && keys?.filialKey) {
        (result as any)[keys.filialKey] = scope.filialId;
      }
      break;
    }
    case 'GESTOR_I': {
      if (scope.filialId && keys?.filialKey) {
        (result as any)[keys.filialKey] = scope.filialId;
      }
      break;
    }
    case 'GESTOR_II': {
      if (scope.regionalId && keys?.regionalKey) {
        (result as any)[keys.regionalKey] = scope.regionalId;
      }
      break;
    }
    case 'GESTOR_III': {
      if (scope.diretoriaId && keys?.diretoriaKey) {
        (result as any)[keys.diretoriaKey] = scope.diretoriaId;
      }
      break;
    }
    case 'GESTOR_MASTER':
    default:
      // Sem restrição adicional
      break;
  }
  return result;
}