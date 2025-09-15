-- ===================================
-- TABELA DE CONFIGURAÇÕES DE PARÂMETROS
-- ===================================

-- Criação da tabela principal de configurações
CREATE TABLE IF NOT EXISTS configuracoes_parametros (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL, -- ID do usuário (pode ser string dependendo do sistema de auth)
    filial_id INTEGER NULL, -- NULL = configuração global, valor = específica da filial
    tipo_parametro VARCHAR(50) NOT NULL, -- 'inatividade', 'rfv_geral', 'dashboards', etc.
    parametros JSONB NOT NULL, -- Dados flexíveis da configuração
    ativo BOOLEAN DEFAULT true, -- Permite desativar sem deletar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT uk_config_user_filial_tipo UNIQUE (user_id, filial_id, tipo_parametro)
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_config_user_id ON configuracoes_parametros(user_id);
CREATE INDEX IF NOT EXISTS idx_config_filial_id ON configuracoes_parametros(filial_id);
CREATE INDEX IF NOT EXISTS idx_config_tipo ON configuracoes_parametros(tipo_parametro);
CREATE INDEX IF NOT EXISTS idx_config_ativo ON configuracoes_parametros(ativo);
CREATE INDEX IF NOT EXISTS idx_config_updated ON configuracoes_parametros(updated_at);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_configuracoes_parametros_updated_at 
    BEFORE UPDATE ON configuracoes_parametros 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- CONFIGURAÇÕES PADRÃO DO SISTEMA
-- ===================================

-- 1. Configuração padrão de inatividade (global)
INSERT INTO configuracoes_parametros (
    user_id, 
    filial_id, 
    tipo_parametro, 
    parametros, 
    ativo
) VALUES (
    'sistema', -- Usuário especial para configurações padrão
    NULL, -- Global (todas as filiais)
    'inatividade',
    '{
        "dias_inatividade": 90,
        "descricao": "Número de dias sem compra para considerar cliente inativo",
        "valor_minimo": 1,
        "valor_maximo": 365,
        "unidade": "dias"
    }',
    true
) ON CONFLICT (user_id, filial_id, tipo_parametro) 
DO UPDATE SET 
    parametros = EXCLUDED.parametros,
    updated_at = NOW();

-- 2. Configurações padrão por segmento de mercado
INSERT INTO configuracoes_parametros (
    user_id, 
    filial_id, 
    tipo_parametro, 
    parametros, 
    ativo
) VALUES 
(
    'sistema',
    NULL,
    'inatividade_sugestoes',
    '{
        "sugestoes": [
            {
                "segmento": "E-commerce / Fast-moving",
                "dias": 30,
                "descricao": "Produtos de alta rotatividade e consumo frequente"
            },
            {
                "segmento": "Varejo geral",
                "dias": 90,
                "descricao": "Configuração recomendada para a maioria dos negócios"
            },
            {
                "segmento": "Bens duráveis",
                "dias": 180,
                "descricao": "Produtos com ciclo de recompra mais longo"
            },
            {
                "segmento": "B2B / Corporativo",
                "dias": 365,
                "descricao": "Clientes corporativos com ciclos de compra anuais"
            }
        ]
    }',
    true
),
(
    'sistema',
    NULL,
    'configuracoes_gerais',
    '{
        "versao_sistema": "1.0.0",
        "ultima_atualizacao": "2024-12-12",
        "manutencao": {
            "auto_limpeza_cache": true,
            "dias_retencao_logs": 30,
            "backup_automatico": true
        },
        "notificacoes": {
            "email_alteracoes": true,
            "log_auditoria": true
        }
    }',
    true
) ON CONFLICT (user_id, filial_id, tipo_parametro) 
DO UPDATE SET 
    parametros = EXCLUDED.parametros,
    updated_at = NOW();

-- ===================================
-- TABELA DE AUDITORIA (OPCIONAL)
-- ===================================

-- Tabela para histórico de alterações nas configurações
CREATE TABLE IF NOT EXISTS configuracoes_parametros_audit (
    id BIGSERIAL PRIMARY KEY,
    config_id BIGINT NOT NULL,
    user_id TEXT NOT NULL,
    acao VARCHAR(20) NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
    parametros_antigos JSONB,
    parametros_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para auditoria
CREATE INDEX IF NOT EXISTS idx_audit_config_id ON configuracoes_parametros_audit(config_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON configuracoes_parametros_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON configuracoes_parametros_audit(created_at);

-- ===================================
-- FUNÇÕES UTILITÁRIAS
-- ===================================

-- Função para buscar configuração do usuário (com fallback para padrão)
CREATE OR REPLACE FUNCTION obter_configuracao_parametro(
    p_user_id TEXT,
    p_filial_id INTEGER DEFAULT NULL,
    p_tipo_parametro VARCHAR(50)
)
RETURNS JSONB AS $$
DECLARE
    config_result JSONB;
BEGIN
    -- Primeiro tenta buscar configuração específica do usuário
    SELECT parametros INTO config_result
    FROM configuracoes_parametros
    WHERE user_id = p_user_id
      AND (filial_id = p_filial_id OR (filial_id IS NULL AND p_filial_id IS NULL))
      AND tipo_parametro = p_tipo_parametro
      AND ativo = true
    ORDER BY filial_id NULLS LAST -- Prioriza configuração específica da filial
    LIMIT 1;
    
    -- Se não encontrou, busca configuração padrão do sistema
    IF config_result IS NULL THEN
        SELECT parametros INTO config_result
        FROM configuracoes_parametros
        WHERE user_id = 'sistema'
          AND filial_id IS NULL
          AND tipo_parametro = p_tipo_parametro
          AND ativo = true
        LIMIT 1;
    END IF;
    
    -- Se ainda não encontrou, retorna configuração mínima
    IF config_result IS NULL THEN
        CASE p_tipo_parametro
            WHEN 'inatividade' THEN
                config_result := '{"dias_inatividade": 90}';
            ELSE
                config_result := '{}';
        END CASE;
    END IF;
    
    RETURN config_result;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- POLÍTICAS DE SEGURANÇA (RLS)
-- ===================================

-- Habilitar Row Level Security na tabela
ALTER TABLE configuracoes_parametros ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver apenas suas próprias configurações + configurações do sistema
CREATE POLICY "Usuários podem ver suas configurações e do sistema" 
ON configuracoes_parametros FOR SELECT 
USING (user_id = auth.jwt() ->> 'sub' OR user_id = 'sistema');

-- Política: Usuários podem inserir/atualizar apenas suas próprias configurações
CREATE POLICY "Usuários podem modificar apenas suas configurações" 
ON configuracoes_parametros FOR ALL
USING (user_id = auth.jwt() ->> 'sub');

-- ===================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ===================================

COMMENT ON TABLE configuracoes_parametros IS 'Tabela de configurações personalizáveis de parâmetros de negócio por usuário/filial';
COMMENT ON COLUMN configuracoes_parametros.user_id IS 'Identificador do usuário - usar "sistema" para configurações padrão';
COMMENT ON COLUMN configuracoes_parametros.filial_id IS 'ID da filial específica - NULL para configurações globais';
COMMENT ON COLUMN configuracoes_parametros.tipo_parametro IS 'Tipo de configuração: inatividade, rfv_geral, dashboards, etc.';
COMMENT ON COLUMN configuracoes_parametros.parametros IS 'Dados da configuração em formato JSON flexível';
COMMENT ON COLUMN configuracoes_parametros.ativo IS 'Permite desativar configuração sem deletar (soft delete)';

COMMENT ON TABLE configuracoes_parametros_audit IS 'Auditoria de alterações nas configurações de parâmetros';
COMMENT ON FUNCTION obter_configuracao_parametro IS 'Função utilitária para buscar configuração com fallback automático para padrão do sistema';

-- ===================================
-- EXEMPLOS DE USO
-- ===================================

/*
-- Exemplo 1: Buscar configuração de inatividade do usuário
SELECT obter_configuracao_parametro('user_123', NULL, 'inatividade');

-- Exemplo 2: Definir configuração personalizada para um usuário
INSERT INTO configuracoes_parametros (user_id, tipo_parametro, parametros)
VALUES ('user_123', 'inatividade', '{"dias_inatividade": 60}')
ON CONFLICT (user_id, filial_id, tipo_parametro) 
DO UPDATE SET parametros = EXCLUDED.parametros;

-- Exemplo 3: Buscar todas as configurações de um usuário
SELECT * FROM configuracoes_parametros 
WHERE user_id = 'user_123' OR user_id = 'sistema';

-- Exemplo 4: Histórico de alterações
SELECT * FROM configuracoes_parametros_audit 
WHERE user_id = 'user_123' 
ORDER BY created_at DESC;
*/
