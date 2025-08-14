import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase/server';
import bcrypt from 'bcryptjs';

// POST /api/nova-senha - Atualiza a senha do usuário e remove o flag de troca obrigatória
export async function POST(req: NextRequest) {
  const { id, senha } = await req.json();
  if (!id || !senha || senha.length < 6) {
    return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
  }
  const supabase = createServerClient();
  const hash = await bcrypt.hash(senha, 10);
  const { error } = await supabase
    .from('users')
    .update({ senha: hash, precisa_trocar_senha: false })
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: 'Erro ao atualizar senha.' }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
