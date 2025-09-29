import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

// POST /api/nova-senha - Alterar senha do usuário logado
export async function POST(req: NextRequest) {
  try {
    const { id, senha } = await req.json();
    
    if (!id || !senha) {
      return NextResponse.json({ error: 'ID do usuário e nova senha são obrigatórios.' }, { status: 400 });
    }

    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Buscar usuário
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        active: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Usuário inativo.' }, { status: 401 });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Atualizar senha
    await prisma.users.update({
      where: { id: parseInt(id) },
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso.' });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}
