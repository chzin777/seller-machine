import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../../lib/prisma';
import { requirePermission } from '../../../../../lib/permissions';

export async function POST(request: NextRequest) {
  // 🔒 Verificação de Segurança - Adicionado automaticamente
  const authResult = requirePermission('CREATE_USERS')(request);
  if (!authResult.allowed) {
    return NextResponse.json(
      { error: authResult.error || 'Acesso não autorizado' },
      { status: 401 }
    );
  }

  try {
    const { email, password, name, role, empresaId, diretoriaId, regionalId, filialId, area } = await request.json();

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário já existe com este email' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar novo usuário
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || 'USER',
        empresaId: empresaId || null,
        diretoriaId: diretoriaId || null,
        regionalId: regionalId || null,
        filialId: filialId || null,
        area: area || null,
        active: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        area: true,
        active: true,
        empresaId: true,
        diretoriaId: true,
        regionalId: true,
        filialId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return NextResponse.json(
      { 
        message: 'Usuário criado com sucesso', 
        user 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}