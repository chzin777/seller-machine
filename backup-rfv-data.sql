-- Backup dos dados das tabelas RFV antes da migração
-- Execute este comando para fazer backup dos dados:

-- Backup da tabela rfv_parameters_sets
CREATE TABLE rfv_parameters_sets_backup AS SELECT * FROM rfv_parameters_sets;

-- Backup da tabela segments
CREATE TABLE segments_backup AS SELECT * FROM segments;

-- Para restaurar os dados após a migração:
-- INSERT INTO RfvParameterSet (id, name, description, calculationStrategy, classRanges, conditionalRules, createdAt, updatedAt)
-- SELECT id, name, description, calculationStrategy, classRanges, conditionalRules, createdAt, updatedAt FROM rfv_parameters_sets_backup;

-- INSERT INTO RfvSegment (id, parameterSetId, segmentName, rules, priority, createdAt, updatedAt)
-- SELECT id, parameterId, segmentName, rules, priority, createdAt, updatedAt FROM segments_backup;