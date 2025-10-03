import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Criar resposta
    const response = NextResponse.json({ 
      message: 'Logout realizado com sucesso' 
    }, { status: 200 });

    // Remover o cookie de autenticação
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expira imediatamente
    });

    return response;

  } catch (error) {
    console.error('Erro no logout:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}