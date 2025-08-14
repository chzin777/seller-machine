// PATCH /api/users - Edita um usuário existente
export async function PATCH(req: NextRequest) {
  const { id, nome, sobrenome, email, conta } = await req.json();
  if (!id || !nome || !sobrenome || !email || !conta) {
    return NextResponse.json({ error: 'Dados obrigatórios faltando.' }, { status: 400 });
  }

  const supabase = createServerClient();
  // Atualiza usuário
  const { data, error } = await supabase
    .from('users')
    .update({ nome, sobrenome, email, conta })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, nome: data.nome, sobrenome: data.sobrenome, email: data.email, conta: data.conta });
}
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '../../../../lib/supabase/server';
import bcrypt from 'bcryptjs';

// GET /api/users - Lista todos os usuários
export async function GET() {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('users')
    .select('*');
  if (error) {
    return NextResponse.json({ error: error?.message || 'Erro desconhecido' }, { status: 500 });
  }
  // Não retornar senha se existir
  const safeData = (data || []).map((user: Record<string, unknown>) => {
    const { senha, ...rest } = user;
    return rest;
  });
  return NextResponse.json(safeData);
}

// POST /api/users - Cria um novo usuário

export async function POST(req: NextRequest) {
  const { nome, sobrenome, email, senha, conta } = await req.json();
  if (!nome || !sobrenome || !email || !senha || !conta) {
    return NextResponse.json({ error: 'Dados obrigatórios faltando.' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Verifica se já existe usuário com o mesmo email
    const { data: existing } = await supabase
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
    .insert([{ nome, sobrenome, email, senha: senhaHash, conta, precisa_trocar_senha: true }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id, nome: data.nome, sobrenome: data.sobrenome, email: data.email });
}
