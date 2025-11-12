-- ============================================================
-- CORREÇÃO: ATUALIZAR FOREIGN KEY DE RESPONSIBLE_USER_ID
-- ============================================================
-- Data: 12 de novembro de 2025
-- Versão: 1.0
-- Descrição: Remove constraint antiga e cria nova para referenciar members
-- ============================================================

-- PARTE 1: REMOVER CONSTRAINT ANTIGA
-- ============================================================

-- Remover a constraint antiga que referenceia users ou outra tabela
ALTER TABLE ministries
DROP CONSTRAINT IF EXISTS ministries_responsible_user_id_fkey;

-- PARTE 2: ADICIONAR NOVA CONSTRAINT
-- ============================================================

-- Adicionar constraint que referencia a tabela members
ALTER TABLE ministries
ADD CONSTRAINT ministries_responsible_member_id_fkey
FOREIGN KEY (responsible_user_id) 
REFERENCES members(id) 
ON DELETE SET NULL;

-- PARTE 3: VALIDAR CONFIGURAÇÃO
-- ============================================================

-- Verificar a constraint foi criada (sintaxe PostgreSQL)
SELECT 
  constraint_name,
  table_name,
  column_name
FROM information_schema.key_column_usage
WHERE table_name = 'ministries' 
  AND column_name = 'responsible_user_id';

-- Ver detalhes da constraint de FK
SELECT 
  rc.constraint_name,
  kcu.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu 
  ON rc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON rc.unique_constraint_name = ccu.constraint_name
WHERE kcu.table_name = 'ministries'
  AND kcu.column_name = 'responsible_user_id';

-- Listar todas as ministries com seus responsáveis
SELECT 
  m.id,
  m.name as ministry_name,
  m.responsible_user_id,
  mb.full_name as responsible_member_name,
  m.status
FROM ministries m
LEFT JOIN members mb ON m.responsible_user_id = mb.id
ORDER BY m.name;

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
-- Se não houver erros acima, a constraint foi corrigida com sucesso!
-- Agora você pode salvar membros como responsáveis de ministérios
-- ============================================================
