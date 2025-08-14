import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../../lib/supabase/server';
import bcrypt from 'bcryptjs';

// POST /api/auth/login - Login de usuário
export async function POST(req: NextRequest) {
  const { email, senha } = await req.json();
  if (!email || !senha) {
    return NextResponse.json({ error: 'Email e senha são obrigatórios.' }, { status: 400 });
  }

  const supabase = createServerClient();
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 });
  }

  const senhaOk = await bcrypt.compare(senha, user.senha);
  if (!senhaOk) {
    return NextResponse.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 });
  }

  // Retorne apenas dados não sensíveis, incluindo conta e precisa_trocar_senha
  return NextResponse.json({ id: user.id, nome: user.nome, sobrenome: user.sobrenome, email: user.email, conta: user.conta, precisa_trocar_senha: user.precisa_trocar_senha });
}
