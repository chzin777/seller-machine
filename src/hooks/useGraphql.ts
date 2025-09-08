// hooks/useGraphQL.ts
import { useState, useEffect, useCallback, DependencyList } from 'react'
import { graphqlQuery, GraphQLVariables } from '../utils/graphql'

export interface UseGraphQLResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export interface UseGraphQLOptions {
  skip?: boolean
  onCompleted?: (data: any) => void
  onError?: (error: string) => void
}

export function useGraphQL<T = any>(
  query: string,
  variables: GraphQLVariables = {},
  dependencies: DependencyList = [],
  options: UseGraphQLOptions = {}
): UseGraphQLResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!options.skip)
  const [error, setError] = useState<string | null>(null)
  
  const fetchData = useCallback(async () => {
    if (options.skip) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await graphqlQuery<T>(query, variables);
      setData(result);
      options.onCompleted?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [query, JSON.stringify(variables), options.skip])
  
  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, dependencies)
  
  return { data, loading, error, refetch: fetchData }
}