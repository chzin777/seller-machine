import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

// GET /api/users - Lista todos os usuários
export async function GET() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        area: true,
        active: true,
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
  try {
    const { email, password, role, empresaId, diretoriaId, regionalId, filialId, area } = await req.json();
    
    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Email, senha e perfil são obrigatórios.' }, { status: 400 });
    }

    // Verifica se já existe usuário com o mesmo email
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 409 });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria usuário
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        role,
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
