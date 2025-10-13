import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../../../../lib/prisma';
import sgMail from '@sendgrid/mail'
// SendGrid and URL configs
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'no-reply@seller-machine.local'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'
const SENDGRID_REGION = process.env.SENDGRID_REGION
const SENDGRID_REPLY_TO = process.env.SENDGRID_REPLY_TO
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
  if (SENDGRID_REGION === 'eu') {
    // @ts-expect-error: typings may vary by @sendgrid/mail version
    sgMail.setDataResidency?.('eu')
  }
}

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
      return NextResponse.json({ 
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
      });
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

    // Enviar email com o link de redefinição
    try {
      if (SENDGRID_API_KEY) {
        const resetLink = `${FRONTEND_URL}/redefinir-senha?token=${resetToken}`
        await sgMail.send({
          to: email,
          from: { email: SENDGRID_FROM, name: 'Seller Machine' },
          replyTo: SENDGRID_REPLY_TO || SENDGRID_FROM,
          subject: 'Redefinição de senha',
          text: `Recebemos uma solicitação para redefinir sua senha. Use este link: ${resetLink} (expira em 1 hora). Se você não solicitou, ignore este email.`,
          html: `<p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="${resetLink}" style="color:#1e3a8a">Redefinir senha</a></p><p>Este link expira em 1 hora.</p><p>Se você não solicitou, ignore este email.</p>`,
          trackingSettings: { clickTracking: { enable: false, enableText: false } }
        })
      } else {
        console.log('SENDGRID_API_KEY não configurado; pulando envio de e-mail.')
      }
    } catch (emailErr) {
      console.error('Falha ao enviar e-mail de redefinição:', emailErr)
    }

    return NextResponse.json({ 
      message: 'Se o email existir, você receberá instruções para redefinir sua senha.'
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

    // Opcional: e-mail de confirmação de redefinição
    try {
      if (SENDGRID_API_KEY && user.email) {
        await sgMail.send({
          to: user.email,
          from: { email: SENDGRID_FROM, name: 'Seller Machine' },
          replyTo: SENDGRID_REPLY_TO || SENDGRID_FROM,
          subject: 'Senha redefinida com sucesso',
          text: 'Sua senha foi redefinida com sucesso. Você já pode fazer login novamente.',
          html: `<p>Sua senha foi redefinida com sucesso.</p><p><a href="${FRONTEND_URL}/login" style="color:#1e3a8a">Voltar ao login</a></p>`,
          trackingSettings: { clickTracking: { enable: false, enableText: false } }
        })
      }
    } catch (emailErr) {
      console.error('Falha ao enviar e-mail de confirmação:', emailErr)
    }

    return NextResponse.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 });
  }
}