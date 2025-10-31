import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { requirePermission } from '../../../../lib/permissions';

// Função para determinar o perfil automaticamente baseado na hierarquia
function determineUserRole(empresaId: number, diretoriaId: number, regionalId: number | null, filialId: number | null, requestedRole: string): 'VENDEDOR' | 'GESTOR_I' | 'GESTOR_II' | 'GESTOR_III' | 'GESTOR_MASTER' {
  // Se o usuário solicitou um perfil específico, validamos se é compatível com sua posição hierárquica
  
  // GESTOR_MASTER: Pode ser atribuído em qualquer nível (decisão administrativa)
  if (requestedRole === 'GESTOR_MASTER') {
    return 'GESTOR_MASTER';
  }
  
  // GESTOR_III: Nível de diretoria (sem regional/filial específica ou com múltiplas regionais)
  if (requestedRole === 'GESTOR_III') {
    return 'GESTOR_III';
  }
  
  // GESTOR_II: Nível de regional (tem regional mas pode ou não ter filial específica)
  if (requestedRole === 'GESTOR_II' && regionalId) {
    return 'GESTOR_II';
  }
  
  // GESTOR_I: Nível de filial (tem filial específica)
  if (requestedRole === 'GESTOR_I' && filialId) {
    return 'GESTOR_I';
  }
  
  // VENDEDOR: Padrão para usuários operacionais
  // Pode estar em qualquer nível da hierarquia
  if (requestedRole === 'VENDEDOR') {
    return 'VENDEDOR';
  }
  
  // Se chegou até aqui, aplica lógica automática baseada na hierarquia
  if (filialId) {
    // Usuário vinculado a uma filial específica - padrão é VENDEDOR, mas pode ser GESTOR_I
    return requestedRole === 'GESTOR_I' ? 'GESTOR_I' : 'VENDEDOR';
  } else if (regionalId) {
    // Usuário vinculado a uma regional (sem filial específica) - pode ser GESTOR_II ou VENDEDOR
    return requestedRole === 'GESTOR_II' ? 'GESTOR_II' : 'VENDEDOR';
  } else {
    // Usuário vinculado apenas à diretoria - pode ser GESTOR_III ou VENDEDOR
    return requestedRole === 'GESTOR_III' ? 'GESTOR_III' : 'VENDEDOR';
  }
}

// GET /api/users - Lista todos os usuários
export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        cpf: true,
        role: true,
        area: true,
        active: true,
        empresaId: true,
        diretoriaId: true,
        regionalId: true,
        filialId: true,
        Empresas: {
          select: {
            id: true,
            razaoSocial: true
          }
        },
        diretorias: {
          select: {
            id: true,
            nome: true
          }
        },
        regionais: {
          select: {
            id: true,
            nome: true
          }
        },
        Filiais: {
          select: {
            id: true,
            nome: true
          }
        },
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        email: 'asc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/users - Cria um novo usuário
export async function POST(req: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('CREATE_USERS')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { name, email, telefone, cpf, password, role, empresaId, diretoriaId, regionalId, filialId, area } = await req.json();
    
    if (!name || !email || !password || !role) {
      return NextResponse.json({ 
        error: 'Nome, email, senha e perfil são obrigatórios.' 
      }, { status: 400 });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    // Validação de senha
    if (password.length < 6) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Verifica se já existe usuário com o mesmo email
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 409 });
    }

    // Derivar hierarquia automaticamente via CPF (se informado) e preencher campos faltantes
    let dEmpresaId: number | null | undefined = empresaId ?? null;
    let dDiretoriaId: number | null | undefined = diretoriaId ?? null;
    let dRegionalId: number | null | undefined = regionalId ?? null;
    let dFilialId: number | null | undefined = filialId ?? null;

    if (cpf) {
      const vendedor = await prisma.vendedor.findUnique({
        where: { cpf },
        select: { filialId: true }
      });
      if (vendedor?.filialId) {
        const filial = await prisma.filial.findUnique({
          where: { id: vendedor.filialId },
          select: { id: true, regionalId: true, empresaId: true }
        });
        if (filial) {
          dFilialId = dFilialId ?? filial.id;
          dEmpresaId = dEmpresaId ?? filial.empresaId ?? null;
          if (filial.regionalId) {
            dRegionalId = dRegionalId ?? filial.regionalId;
            const regional = await prisma.regionais.findUnique({
              where: { id: filial.regionalId },
              select: { diretoriaId: true }
            });
            if (regional?.diretoriaId) {
              dDiretoriaId = dDiretoriaId ?? regional.diretoriaId;
            }
          }
        }
      }
    }

    // Se ainda faltar diretoria ou empresa, exigir preenchimento explícito
    if (!dEmpresaId || !dDiretoriaId) {
      return NextResponse.json({ 
        error: 'Empresa e diretoria são obrigatórias (podem ser derivadas via CPF de vendedor ou informadas manualmente).' 
      }, { status: 400 });
    }

    // Validar consistência quando houver valores informados manualmente
    if (empresaId && dEmpresaId && empresaId !== dEmpresaId) {
      return NextResponse.json({ error: 'Empresa informada não corresponde à empresa derivada pelo CPF.' }, { status: 400 });
    }
    if (diretoriaId && dDiretoriaId && diretoriaId !== dDiretoriaId) {
      return NextResponse.json({ error: 'Diretoria informada não corresponde à diretoria derivada pelo CPF.' }, { status: 400 });
    }
    if (regionalId && dRegionalId && regionalId !== dRegionalId) {
      return NextResponse.json({ error: 'Regional informada não corresponde à regional derivada pelo CPF.' }, { status: 400 });
    }
    if (filialId && dFilialId && filialId !== dFilialId) {
      return NextResponse.json({ error: 'Filial informada não corresponde à filial derivada pelo CPF.' }, { status: 400 });
    }

    // Validações finais de existência/pertinência com base nos valores derivados
    const empresa = await prisma.empresa.findUnique({ where: { id: dEmpresaId } });
    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 400 });
    }

    const diretoria = await prisma.diretorias.findFirst({
      where: { id: dDiretoriaId!, empresaId: dEmpresaId! }
    });
    if (!diretoria) {
      return NextResponse.json({ error: 'Diretoria não encontrada ou não pertence à empresa selecionada.' }, { status: 400 });
    }

    if (dRegionalId) {
      const regional = await prisma.regionais.findFirst({
        where: { id: dRegionalId, diretoriaId: dDiretoriaId! }
      });
      if (!regional) {
        return NextResponse.json({ error: 'Regional não encontrada ou não pertence à diretoria selecionada.' }, { status: 400 });
      }
    }

    if (dFilialId) {
      if (!dRegionalId) {
        return NextResponse.json({ error: 'Regional é obrigatória quando filial é informada.' }, { status: 400 });
      }
      const filial = await prisma.filial.findFirst({
        where: { id: dFilialId, regionalId: dRegionalId }
      });
      if (!filial) {
        return NextResponse.json({ error: 'Filial não encontrada ou não pertence à regional selecionada.' }, { status: 400 });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determina o perfil final baseado na hierarquia e solicitação
    const finalRole = determineUserRole(dEmpresaId!, dDiretoriaId!, dRegionalId || null, dFilialId || null, role);

    // Cria usuário
    const user = await prisma.users.create({
      data: {
        name,
        email,
        telefone: telefone || null,
        cpf: cpf || null,
        password: hashedPassword,
        role: finalRole,
        empresaId: dEmpresaId!,
        diretoriaId: dDiretoriaId!,
        regionalId: dRegionalId || null,
        filialId: dFilialId || null,
        area: area || null,
        active: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        role: true,
        active: true,
        area: true,
        Empresas: {
          select: {
            id: true,
            razaoSocial: true
          }
        },
        diretorias: {
          select: {
            id: true,
            nome: true
          }
        },
        regionais: {
          select: {
            id: true,
            nome: true
          }
        },
        Filiais: {
          select: {
            id: true,
            nome: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Atualiza um usuário existente
export async function PATCH(req: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('EDIT_USERS')(req);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { id, name, email, telefone, cpf, role, active, empresaId, diretoriaId, regionalId, filialId, area } = await req.json();
    
    if (!id || !name || !email || !role) {
      return NextResponse.json({ 
        error: 'ID, nome, email e perfil são obrigatórios.' 
      }, { status: 400 });
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido.' }, { status: 400 });
    }

    // Verifica se o usuário existe
    const existingUser = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    // Verifica se já existe outro usuário com o mesmo email (exceto o atual)
    const emailConflict = await prisma.users.findFirst({
      where: { 
        email,
        id: { not: parseInt(id) }
      }
    });

    if (emailConflict) {
      return NextResponse.json({ error: 'Email já está sendo usado por outro usuário.' }, { status: 409 });
    }

    // Preparar dados para atualização
    const updateData: any = {
      name,
      email,
      telefone: telefone || null,
      cpf: cpf || null,
      role,
      active: active !== undefined ? active : true,
      area: area || null,
      updatedAt: new Date()
    };

    // Derivar hierarquia automaticamente via CPF (se informado) e preencher campos faltantes
    let dEmpresaId: number | null | undefined = empresaId ?? existingUser.empresaId ?? null;
    let dDiretoriaId: number | null | undefined = diretoriaId ?? existingUser.diretoriaId ?? null;
    let dRegionalId: number | null | undefined = regionalId ?? existingUser.regionalId ?? null;
    let dFilialId: number | null | undefined = filialId ?? existingUser.filialId ?? null;

    if (cpf) {
      const vendedor = await prisma.vendedor.findUnique({
        where: { cpf },
        select: { filialId: true }
      });
      if (vendedor?.filialId) {
        const filial = await prisma.filial.findUnique({
          where: { id: vendedor.filialId },
          select: { id: true, regionalId: true, empresaId: true }
        });
        if (filial) {
          dFilialId = dFilialId ?? filial.id;
          dEmpresaId = dEmpresaId ?? filial.empresaId ?? null;
          if (filial.regionalId) {
            dRegionalId = dRegionalId ?? filial.regionalId;
            const regional = await prisma.regionais.findUnique({
              where: { id: filial.regionalId },
              select: { diretoriaId: true }
            });
            if (regional?.diretoriaId) {
              dDiretoriaId = dDiretoriaId ?? regional.diretoriaId;
            }
          }
        }
      }
    }

    // Se informações hierárquicas foram fornecidas, validar e incluir
    if (empresaId !== undefined) {
      if (empresaId) {
        // Validação de hierarquia - verifica se empresa existe
        const empresa = await prisma.empresa.findUnique({
          where: { id: empresaId }
        });

        if (!empresa) {
          return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 400 });
        }
        
        updateData.empresaId = empresaId;
      } else {
        updateData.empresaId = null;
      }
    }

    if (diretoriaId !== undefined) {
      if (diretoriaId && (updateData.empresaId || existingUser.empresaId)) {
        // Validação de hierarquia - verifica se diretoria existe e pertence à empresa
        const diretoria = await prisma.diretorias.findFirst({
          where: { 
            id: diretoriaId,
            empresaId: updateData.empresaId || existingUser.empresaId
          }
        });

        if (!diretoria) {
          return NextResponse.json({ error: 'Diretoria não encontrada ou não pertence à empresa selecionada.' }, { status: 400 });
        }
        
        updateData.diretoriaId = diretoriaId;
      } else {
        updateData.diretoriaId = null;
      }
    }

    if (regionalId !== undefined) {
      if (regionalId && (updateData.diretoriaId || existingUser.diretoriaId)) {
        // Se regional foi informada, valida se existe e pertence à diretoria
        const regional = await prisma.regionais.findFirst({
          where: { 
            id: regionalId,
            diretoriaId: updateData.diretoriaId || existingUser.diretoriaId
          }
        });

        if (!regional) {
          return NextResponse.json({ error: 'Regional não encontrada ou não pertence à diretoria selecionada.' }, { status: 400 });
        }
        
        updateData.regionalId = regionalId;
      } else {
        updateData.regionalId = null;
      }
    }

    if (filialId !== undefined) {
      if (filialId && (updateData.regionalId || existingUser.regionalId)) {
        // Se filial foi informada, valida se existe e pertence à regional
        const filial = await prisma.filial.findFirst({
          where: { 
            id: filialId,
            regionalId: updateData.regionalId || existingUser.regionalId
          }
        });

        if (!filial) {
          return NextResponse.json({ error: 'Filial não encontrada ou não pertence à regional selecionada.' }, { status: 400 });
        }
        
        updateData.filialId = filialId;
      } else {
        updateData.filialId = null;
      }
    }

    // Aplicar valores derivados quando faltantes
    if (updateData.empresaId === undefined) {
      updateData.empresaId = dEmpresaId ?? null;
    }
    if (updateData.diretoriaId === undefined) {
      updateData.diretoriaId = dDiretoriaId ?? null;
    }
    if (updateData.regionalId === undefined) {
      updateData.regionalId = dRegionalId ?? null;
    }
    if (updateData.filialId === undefined) {
      updateData.filialId = dFilialId ?? null;
    }

    // Atualiza usuário
    const updatedUser = await prisma.users.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        telefone: true,
        role: true,
        active: true,
        area: true,
        empresaId: true,
        diretoriaId: true,
        regionalId: true,
        filialId: true,
        Empresas: {
          select: {
            id: true,
            razaoSocial: true
          }
        },
        diretorias: {
          select: {
            id: true,
            nome: true
          }
        },
        regionais: {
          select: {
            id: true,
            nome: true
          }
        },
        Filiais: {
          select: {
            id: true,
            nome: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}