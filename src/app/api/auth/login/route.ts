import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const user = await prisma.users.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        area: true,
        active: true,
        cpf: true, // ✅ Incluir CPF para buscar vendedor
        empresaId: true,
        diretoriaId: true,
        regionalId: true,
        filialId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // Verificar se o usuário está ativo
    if (!user.active) {
      return NextResponse.json(
        { error: 'Usuário inativo. Entre em contato com o administrador.' },
        { status: 401 }
      );
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // 🔍 Se o usuário for VENDEDOR, buscar o ID_Vendedor pela tabela Vendedores usando o CPF
    let vendedorId: number | null = null;
    let vendedorNome: string | null = null;
    
    if (user.role === 'VENDEDOR' && user.cpf) {
      try {
        const vendedor = await prisma.vendedor.findUnique({
          where: { cpf: user.cpf },
          select: {
            id: true,
            nome: true
          }
        });
        
        if (vendedor) {
          vendedorId = vendedor.id;
          vendedorNome = vendedor.nome;
          console.log(`✅ Vendedor encontrado - CPF: ${user.cpf}, ID_Vendedor: ${vendedorId}, Nome: ${vendedorNome}`);
        } else {
          console.warn(`⚠️ AVISO: Usuário VENDEDOR (CPF: ${user.cpf}) não encontrado na tabela Vendedores!`);
        }
      } catch (error) {
        console.error('Erro ao buscar vendedor por CPF:', error);
      }
    }

    // Gerar JWT token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      cpf: user.cpf, // ✅ Incluir CPF no token
      vendedorId, // ✅ Incluir ID_Vendedor no token
      vendedorNome, // ✅ Incluir nome do vendedor no token
      empresaId: user.empresaId,
      diretoriaId: user.diretoriaId,
      regionalId: user.regionalId,
      filialId: user.filialId
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    // Retornar dados do usuário (sem senha) e token
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      area: user.area,
      cpf: user.cpf, // ✅ Incluir CPF na resposta
      vendedorId, // ✅ Incluir ID_Vendedor na resposta
      vendedorNome, // ✅ Incluir nome do vendedor na resposta
      empresaId: user.empresaId,
      diretoriaId: user.diretoriaId,
      regionalId: user.regionalId,
      filialId: user.filialId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    // Configurar cookie com o token
    const response = NextResponse.json({ user: userData, token });
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 horas
    });

    return response;

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
