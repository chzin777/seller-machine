-- ===================================
-- CONFIGURAÇÕES PADRÃO ESSENCIAIS
-- ===================================
-- Script simplificado para inserir apenas as configurações básicas necessárias

-- Configuração padrão de inatividade (90 dias)
INSERT INTO configuracoes_parametros (
    user_id, 
    filial_id, 
    tipo_parametro, 
    parametros, 
    ativo
) VALUES (
    'sistema',
    NULL,
    'inatividade',
    '{
        "dias_inatividade": 90,
        "descricao": "Configuração padrão do sistema"
    }',
    true
) ON CONFLICT (user_id, filial_id, tipo_parametro) 
DO UPDATE SET 
    parametros = EXCLUDED.parametros,
    updated_at = NOW();

-- Sugestões por segmento de mercado
INSERT INTO configuracoes_parametros (
    user_id, 
    filial_id, 
    tipo_parametro, 
    parametros, 
    ativo
) VALUES (
    'sistema',
    NULL,
    'inatividade_sugestoes',
    '{
        "sugestoes": [
            {"segmento": "E-commerce", "dias": 30},
            {"segmento": "Varejo geral", "dias": 90},
            {"segmento": "Bens duráveis", "dias": 180},
            {"segmento": "B2B", "dias": 365}
        ]
    }',
    true
) ON CONFLICT (user_id, filial_id, tipo_parametro) 
DO UPDATE SET 
    parametros = EXCLUDED.parametros,
    updated_at = NOW();

-- Verificar se os dados foram inseridos corretamente
SELECT 
    tipo_parametro,
    parametros,
    created_at
FROM configuracoes_parametros 
WHERE user_id = 'sistema'
ORDER BY tipo_parametro;
