// utils/graphql.ts

// Tipos para GraphQL
export interface GraphQLError {
  message: string
  locations?: Array<{
    line: number
    column: number
  }>
  path?: string[]
}

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: GraphQLError[]
}

export interface GraphQLVariables {
  [key: string]: any
}

import { GRAPHQL_CONFIG, getHeaders } from '../config/graphql'

// Configuração do cliente GraphQL
const GRAPHQL_ENDPOINT = GRAPHQL_CONFIG.endpoint

export async function graphqlQuery<T = any>(
  query: string, 
  variables: GraphQLVariables = {}
): Promise<T> {
  console.log('🔍 Verificando se GraphQL está habilitado:', GRAPHQL_CONFIG.enabled);
  console.log('🔍 Valor da env var:', process.env.NEXT_PUBLIC_ENABLE_GRAPHQL);
  
  if (!GRAPHQL_CONFIG.enabled) {
    console.log('❌ GraphQL desabilitado - lançando erro');
    throw new Error('GraphQL está desabilitado. Configure NEXT_PUBLIC_ENABLE_GRAPHQL=true')
  }
  
  console.log('✅ GraphQL habilitado - prosseguindo com a query');

  try {
    console.log('🔍 Tentando GraphQL query:', query.substring(0, 50) + '...');
    console.log('🔍 GraphQL endpoint:', GRAPHQL_CONFIG.endpoint);
    console.log('🔍 GraphQL enabled:', GRAPHQL_CONFIG.enabled);
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), GRAPHQL_CONFIG.timeout)

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ 
        query, 
        variables 
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }
    
    const rawResult = await response.json()
    console.log('📦 GraphQL Raw Response recebida:', rawResult);
    
    // Verificar se a resposta está no formato encapsulado
    let result: GraphQLResponse<T>
    if (rawResult.body && rawResult.body.singleResult) {
      // Formato encapsulado: {"body":{"singleResult":{"data":{...}}}}
      result = rawResult.body.singleResult
      console.log('🔄 Resposta desencapsulada:', result);
    } else {
      // Formato padrão GraphQL: {"data":{...}}
      result = rawResult
    }
    
    if (result.errors) {
      console.error('GraphQL Errors:', result.errors)
      throw new Error(result.errors[0].message)
    }
    
    console.log('✅ GraphQL Data extraída:', result.data);
    return result.data as T
  } catch (error) {
    // Log detalhado em desenvolvimento
    if (GRAPHQL_CONFIG.dev.enableLogs) {
      console.group('🔴 GraphQL Request Failed')
      console.error('Query:', query)
      console.error('Variables:', variables)
      console.error('Error:', error)
      console.groupEnd()
    }
    
    // Tratamento específico para diferentes tipos de erro
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Timeout: A requisição GraphQL demorou muito para responder')
      }
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('Erro de conexão: Verifique se o servidor GraphQL está rodando')
      }
    }
    
    throw error
  }
}

// Função auxiliar para fazer queries com retry
export async function graphqlQueryWithRetry<T = any>(
  query: string,
  variables: GraphQLVariables = {},
  retryAttempts = GRAPHQL_CONFIG.retry.attempts
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= retryAttempts; attempt++) {
    try {
      return await graphqlQuery<T>(query, variables)
    } catch (error) {
      lastError = error as Error
      
      if (GRAPHQL_CONFIG.dev.enableLogs) {
        console.warn(`GraphQL attempt ${attempt}/${retryAttempts} failed:`, error)
      }
      
      // Não fazer retry em erros de validação
      if (error instanceof Error && error.message.includes('validation')) {
        throw error
      }
      
      // Aguardar antes do próximo retry
      if (attempt < retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, GRAPHQL_CONFIG.retry.delay * attempt))
      }
    }
  }
  
  throw lastError!
}