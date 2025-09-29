import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../../../../lib/prisma';

// POST /api/auth/password-reset - Solicitar reset de senha
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório.' }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { email }
    });

    if (!user) {
      // Por segurança, sempre retornar sucesso mesmo se o usuário não existir
      return NextResponse.json({ message: 'Se o email existir, você receberá instruções para redefinir sua senha.' });
    }

    if (!user.active) {
      return NextResponse.json({ error: 'Usuário inativo. Entre em contato com o administrador.' }, { status: 401 });
    }

    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await prisma.users.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // TODO: Enviar email com o token (implementar serviço de email)
    console.log(`Token de reset para ${email}: ${resetToken}`);

    return NextResponse.json({ 
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      // Em desenvolvimento, retornar o token para testes
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}

// PUT /api/auth/password-reset - Confirmar reset de senha
export async function PUT(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();
    
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token e nova senha são obrigatórios.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    const user = await prisma.users.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar senha e limpar token
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}