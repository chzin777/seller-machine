import { NextRequest, NextResponse } from 'next/server';

const GRAPHQL_ENDPOINT = 'https://api-dev-production-6bb5.up.railway.app/api/graphql';

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    
    if (!text || text.trim() === '') {
      console.log('🚨 Body vazio recebido no proxy GraphQL');
      return NextResponse.json(
        { error: 'Body da requisição está vazio' },
        { status: 400 }
      );
    }
    
    const body = JSON.parse(text);
    console.log('✅ GraphQL query recebida:', body.query?.substring(0, 50) + '...');
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Adicione outros headers necessários aqui se precisar
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL Proxy Error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor GraphQL' },
      { status: 500 }
    );
  }
}

// Permitir OPTIONS para CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}