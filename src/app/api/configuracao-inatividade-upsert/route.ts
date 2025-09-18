import { NextRequest, NextResponse } from 'next/server';

// Helper para timeout + retry básico nas chamadas externas
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000, retries = 1): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err: any) {
      clearTimeout(id);
      const isTimeout = err?.name === 'AbortError';
      if (attempt < retries) {
        console.warn(`⚠️ Tentativa ${attempt + 1} falhou (${isTimeout ? 'timeout' : err?.message}). Retentando...`);
        continue;
      }
      throw isTimeout ? new Error('TIMEOUT_EXTERNAL_API') : err;
    }
  }
  throw new Error('Falha inesperada em fetchWithTimeout');
}

// Interface para os dados de configuração de inatividade
interface ConfiguracaoInatividade {
  empresaId: number;
  diasSemCompra: number;
  valorMinimoCompra: number;
  considerarTipoCliente: boolean;
  tiposClienteExcluidos: string[] | null;
  ativo: boolean;
}

export async function POST(req: NextRequest) {
  try {
    const data: ConfiguracaoInatividade = await req.json();
    
    // Validar dados obrigatórios
    if (!data.empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório' },
        { status: 400 }
      );
    }

    // Validar tipos e valores
    // Removido limite superior: aceitar qualquer positivo
    if (typeof data.diasSemCompra !== 'number' || data.diasSemCompra < 1) {
      return NextResponse.json(
        { success: false, error: 'diasSemCompra deve ser um número >= 1' },
        { status: 400 }
      );
    }

    if (typeof data.valorMinimoCompra !== 'number' || data.valorMinimoCompra < 0) {
      return NextResponse.json(
        { success: false, error: 'valorMinimoCompra deve ser um número maior ou igual a 0' },
        { status: 400 }
      );
    }

    console.log('🔄 Executando upsert de configuração de inatividade:', data);

    // Primeiro, verificar se já existe uma configuração para a empresa
    const checkResponse = await fetchWithTimeout(
      `https://api-dev-production-6bb5.up.railway.app/api/configuracao-inatividade/empresa/${data.empresaId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      10000,
      1
    );

    let result;

    if (checkResponse.ok) {
      // Configuração existe - fazer UPDATE
      const existingConfig = await checkResponse.json();
      console.log('📝 Atualizando configuração existente:', existingConfig.id);

      const updatePayload = {
        diasSemCompra: data.diasSemCompra,
        valorMinimoCompra: data.valorMinimoCompra,
        considerarTipoCliente: data.considerarTipoCliente,
        tiposClienteExcluidos: data.tiposClienteExcluidos,
        ativo: data.ativo
      };

      const updateResponse = await fetchWithTimeout(
        `https://api-dev-production-6bb5.up.railway.app/api/configuracao-inatividade/${existingConfig.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        },
        10000,
        1
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('❌ Erro ao atualizar configuração:', errorText);
        throw new Error(`Erro ao atualizar configuração: ${updateResponse.status} - ${errorText}`);
      }

      result = await updateResponse.json();
      console.log('✅ Configuração atualizada com sucesso');

    } else if (checkResponse.status === 404) {
      // Configuração não existe - fazer INSERT
      console.log('➕ Criando nova configuração');

      const createPayload = {
        empresaId: data.empresaId,
        diasSemCompra: data.diasSemCompra,
        valorMinimoCompra: data.valorMinimoCompra,
        considerarTipoCliente: data.considerarTipoCliente,
        tiposClienteExcluidos: data.tiposClienteExcluidos,
        ativo: data.ativo
      };

      const createResponse = await fetchWithTimeout(
        `https://api-dev-production-6bb5.up.railway.app/api/configuracao-inatividade`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        },
        10000,
        1
      );

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('❌ Erro ao criar configuração:', errorText);
        throw new Error(`Erro ao criar configuração: ${createResponse.status} - ${errorText}`);
      }

      result = await createResponse.json();
      console.log('✅ Nova configuração criada com sucesso');

    } else {
      // Erro inesperado na verificação
      const errorText = await checkResponse.text();
      console.error('❌ Erro na verificação de configuração existente:', errorText);
      throw new Error(`Erro ao verificar configuração existente: ${checkResponse.status} - ${errorText}`);
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Configuração de inatividade salva com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro no upsert de configuração de inatividade:', error);
    if (error instanceof Error && error.message === 'TIMEOUT_EXTERNAL_API') {
      return NextResponse.json(
        {
          success: false,
          error: 'Timeout na API externa ao salvar configuração',
          code: 'UPSTREAM_TIMEOUT'
        },
        { status: 504 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        details: 'Falha ao salvar configuração de inatividade'
      },
      { status: 500 }
    );
  }
}

// Método GET para verificar o status da configuração de uma empresa
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const empresaId = searchParams.get('empresaId');

    if (!empresaId) {
      return NextResponse.json(
        { success: false, error: 'empresaId é obrigatório' },
        { status: 400 }
      );
    }

    const checkResponse = await fetchWithTimeout(
      `https://api-dev-production-6bb5.up.railway.app/api/configuracao-inatividade/empresa/${empresaId}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      },
      10000,
      1
    );

    if (checkResponse.ok) {
      const config = await checkResponse.json();
      return NextResponse.json({
        success: true,
        exists: true,
        data: config
      });
    } else if (checkResponse.status === 404) {
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Nenhuma configuração encontrada para esta empresa'
      });
    } else {
      throw new Error(`Erro ao verificar configuração: ${checkResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Erro ao verificar configuração:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor'
      },
      { status: 500 }
    );
  }
}