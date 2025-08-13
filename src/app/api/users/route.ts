import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase/server';
import bcrypt from 'bcryptjs';

// POST /api/users - Cria um novo usuário
export async function POST(req: NextRequest) {
  const { nome, sobrenome, email, senha } = await req.json();
  if (!nome || !sobrenome || !email || !senha) {
    return NextResponse.json({ error: 'Dados obrigatórios faltando.' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verifica se já existe usuário com o mesmo email
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (existing) {
    return NextResponse.json({ error: 'Email já cadastrado.' }, { status: 409 });
  }

  // Hash da senha
  const senhaHash = await bcrypt.hash(senha, 10);

  // Cria usuário
  const { data, error } = await supabase
    .from('users')
    .insert([{ nome, sobrenome, email, senha: senhaHash }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, nome: data.nome, sobrenome: data.sobrenome, email: data.email });
}
