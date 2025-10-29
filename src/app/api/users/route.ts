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
    
    if (!name || !email || !password || !role || !empresaId || !diretoriaId) {
      return NextResponse.json({ 
        error: 'Nome, email, senha, perfil, empresa e diretoria são obrigatórios.' 
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

    // Validação de hierarquia - verifica se empresa existe
    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaId }
    });

    if (!empresa) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 400 });
    }

    // Validação de hierarquia - verifica se diretoria existe e pertence à empresa
    const diretoria = await prisma.diretorias.findFirst({
      where: { 
        id: diretoriaId,
        empresaId: empresaId
      }
    });

    if (!diretoria) {
      return NextResponse.json({ error: 'Diretoria não encontrada ou não pertence à empresa selecionada.' }, { status: 400 });
    }

    // Se regional foi informada, valida se existe e pertence à diretoria
    if (regionalId) {
      const regional = await prisma.regionais.findFirst({
        where: { 
          id: regionalId,
          diretoriaId: diretoriaId
        }
      });

      if (!regional) {
        return NextResponse.json({ error: 'Regional não encontrada ou não pertence à diretoria selecionada.' }, { status: 400 });
      }
    }

    // Se filial foi informada, valida se existe e pertence à regional
    if (filialId) {
      if (!regionalId) {
        return NextResponse.json({ error: 'Regional é obrigatória quando filial é informada.' }, { status: 400 });
      }

      const filial = await prisma.filial.findFirst({
        where: { 
          id: filialId,
          regionalId: regionalId
        }
      });

      if (!filial) {
        return NextResponse.json({ error: 'Filial não encontrada ou não pertence à regional selecionada.' }, { status: 400 });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determina o perfil final baseado na hierarquia e solicitação
    const finalRole = determineUserRole(empresaId, diretoriaId, regionalId, filialId, role);

    // Cria usuário
    const user = await prisma.users.create({
      data: {
        name,
        email,
        telefone: telefone || null,
        cpf: cpf || null,
        password: hashedPassword,
        role: finalRole,
        empresaId,
        diretoriaId,
        regionalId: regionalId || null,
        filialId: filialId || null,
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