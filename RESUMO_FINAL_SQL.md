# 🚀 GUIA FINAL - Executar todos os SQLs para completo funcionamento

## 📋 RESUMO DO QUE FALTA

Existem 3 SQLs que precisam ser executados no Supabase para tudo funcionar 100%:

1. **Corrigir RLS em `profiles`** - Permitir criar perfis
2. **Corrigir RLS em `profile_module_permissions`** - Permitir salvar permissões
3. **Criar função RPC** - Listar usuários com email real

---

## 🔧 SQL 1: Corrigir RLS em PROFILES

Execute no Supabase SQL Editor:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow insert profiles" ON profiles;
DROP POLICY IF EXISTS "Allow update profiles" ON profiles;
DROP POLICY IF EXISTS "Allow delete profiles" ON profiles;

CREATE POLICY "Allow public read on profiles" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert profiles" ON profiles FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update profiles" ON profiles FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete profiles" ON profiles FOR DELETE USING (TRUE);
```

---

## 🔧 SQL 2: Corrigir RLS em PROFILE_MODULE_PERMISSIONS

Execute no Supabase SQL Editor:

```sql
ALTER TABLE profile_module_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read on profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow insert profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow update profile_module_permissions" ON profile_module_permissions;
DROP POLICY IF EXISTS "Allow delete profile_module_permissions" ON profile_module_permissions;

CREATE POLICY "Allow public read on profile_module_permissions" ON profile_module_permissions FOR SELECT USING (TRUE);
CREATE POLICY "Allow insert profile_module_permissions" ON profile_module_permissions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow update profile_module_permissions" ON profile_module_permissions FOR UPDATE USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Allow delete profile_module_permissions" ON profile_module_permissions FOR DELETE USING (TRUE);
```

---

## 🔧 SQL 3: Criar Função RPC para Usuários

Execute no Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.get_users_with_profiles()
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  full_name VARCHAR,
  profile_id UUID,
  profile_code VARCHAR,
  profile_description TEXT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    (au.raw_user_meta_data->>'full_name')::varchar as full_name,
    up.profile_id,
    p.code as profile_code,
    p.description as profile_description,
    up.created_at
  FROM auth.users au
  LEFT JOIN public.user_profiles up ON au.id = up.user_id
  LEFT JOIN public.profiles p ON up.profile_id = p.id
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_users_with_profiles() TO anon, authenticated, service_role;
```

---

## ✅ RESULTADO ESPERADO

Após executar todos os 3 SQLs, você terá:

✅ Criar perfis funcionando  
✅ Salvar permissões funcionando  
✅ Usuários aparecem com email e nome real  
✅ Sem mais erros de segurança do Supabase

---

## 🎯 PRÓXIMOS PASSOS

1. Execute os 3 SQLs acima (um por um ou todos juntos)
2. Recarregue http://localhost:8082/admin
3. Teste:
   - ✅ Criar novo perfil
   - ✅ Marcar permissões
   - ✅ Salvar
   - ✅ Ver usuário com email na tabela

Pronto! Tudo deve estar funcionando! 🚀
