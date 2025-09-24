import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch vendedores data from the external API
    const vendedoresResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vendedores/stats`);
    
    if (!vendedoresResponse.ok) {
      throw new Error('Erro ao buscar dados de vendedores');
    }
    
    const vendedores = await vendedoresResponse.json();
    
    // Return the data directly from external API
    return NextResponse.json(vendedores);
  } catch (error) {
    console.error('Erro ao calcular estatísticas de vendedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}