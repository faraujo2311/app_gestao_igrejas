-- ============================================================
-- CONFIGURAR PERMISSÕES PARA MÓDULO MEMBROS
-- ============================================================

-- O módulo "Membros" já foi criado no migration 01_create_profiles_system.sql
-- Este SQL apenas garante que as permissões estão configuradas corretamente

-- Conceder permissões ao perfil SUPER_ADMIN para Membros (todas as funções)
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  (SELECT id FROM profiles WHERE code = 'SUPER_ADMIN'),
  (SELECT id FROM modules WHERE name = 'Membros'),
  id
FROM functions
WHERE slug IN ('read', 'create', 'update', 'delete')
ON CONFLICT DO NOTHING;

-- Conceder permissões ao perfil ADMIN para Membros (todas as funções)
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  (SELECT id FROM profiles WHERE code = 'ADMIN'),
  (SELECT id FROM modules WHERE name = 'Membros'),
  id
FROM functions
WHERE slug IN ('read', 'create', 'update', 'delete')
ON CONFLICT DO NOTHING;

-- Conceder permissões ao perfil REDACAO para Membros (apenas leitura e criação)
INSERT INTO profile_module_permissions (profile_id, module_id, function_id)
SELECT 
  (SELECT id FROM profiles WHERE code = 'REDACAO'),
  (SELECT id FROM modules WHERE name = 'Membros'),
  id
FROM functions
WHERE slug IN ('read', 'create')
ON CONFLICT DO NOTHING;

