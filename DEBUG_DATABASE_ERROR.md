# 🔍 Guia de Debugging: "Database error saving new user"

## O que causa este erro?

Este erro específico ocorre quando:
1. ❌ As tabelas do banco de dados **não existem**
2. ❌ As tabelas existem mas falta **Row Level Security (RLS) configurada**
3. ❌ A constraint `profile_id` está violada (perfil não existe)
4. ❌ Permissões insuficientes para inserir em `user_profiles`

---

## Checklist Rápido

### ✅ 1. Tabelas Existem?

No Supabase Dashboard:
- Vá para: **Table Editor** (esquerda)
- Procure por estas tabelas:
  - [ ] `modules`
  - [ ] `functions`
  - [ ] `module_functions`
  - [ ] `profiles`
  - [ ] `profile_module_permissions`
  - [ ] `user_profiles`

Se **alguma estiver faltando**: Execute `SETUP_SQL_PERFIS.sql`

---

### ✅ 2. Row Level Security (RLS)

No Supabase Dashboard:
- Vá para: **Authentication → Policies**
- Procure pela tabela `user_profiles`

Se estiver com RLS ativado:
```
⚠️ VERIFICAR se há políticas que bloqueiam INSERT
```

**Solução rápida**:
- Clique em `user_profiles`
- Procure por "Enable RLS"
- Se estiver ativa, revise as policies

---

### ✅ 3. Estrutura de user_profiles

No Supabase Dashboard:
- **Table Editor** → `user_profiles`
- Verifique as colunas:

```
✅ id              → UUID, Primary Key
✅ user_id         → UUID (NOT NULL, UNIQUE)
✅ profile_id      → UUID (NOT NULL, Foreign Key → profiles.id)
✅ created_at      → Timestamp
✅ updated_at      → Timestamp
```

---

### ✅ 4. Dados em profiles

No Supabase Dashboard:
- **Table Editor** → `profiles`
- Verifique se tem dados:

```sql
SELECT * FROM profiles;
```

Deve retornar:
```
id    | code          | description                    | status
------|---------------|--------------------------------|--------
uuid1 | SUPER_ADMIN   | Super Administrador...        | true
uuid2 | ADMIN         | Administrador...              | true
uuid3 | MODERADOR     | Moderador...                  | true
uuid4 | USUARIO       | Usuário...                    | true
```

Se estiver **vazio**: Execute `SETUP_SQL_PERFIS.sql`

---

## Teste Passo a Passo

### 1️⃣ Verificar Conexão Supabase

Abra o navegador (F12 → Console) e execute:

```javascript
// Verificar conexão
const test = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log(test);
```

Deve retornar dados, não erro.

---

### 2️⃣ Testar Inserção Direta

No console:

```javascript
// Tentar inserir um perfil fictício
const { data, error } = await supabase
  .from('user_profiles')
  .insert({
    user_id: '550e8400-e29b-41d4-a716-446655440000', // UUID válido
    profile_id: 'cole-aqui-um-uuid-de-profile'
  });

if (error) {
  console.error("ERRO:", error);
  console.error("DETALHES:", error.details);
} else {
  console.log("SUCESSO:", data);
}
```

---

### 3️⃣ Ver Logs Detalhados

Na página de criar usuário, pressione F12 e procure por:

```
[DEBUG] Iniciando criação...
[DEBUG] Usuário criado na auth: xxxx
[DEBUG] Tentando atribuir perfil: {...}
[DEBUG] Perfil atribuído com sucesso: {...}
```

Ou:

```
[DEBUG] Erro ao atribuir perfil: {...}
```

O último mostra a falha exata.

---

## Soluções Rápidas por Erro

### Se vir: "FOREIGN KEY constraint failed"

**Significado**: O `profile_id` não existe em `profiles`

**Solução**:
1. Verifique se o SQL foi executado
2. Verifique se `profiles` tem dados
3. Re-execute o SQL

---

### Se vir: "violates row level security policy"

**Significado**: RLS está bloqueando a inserção

**Solução**:
1. Vá para Supabase → Authentication → Policies
2. Clique em `user_profiles`
3. Revise as policies
4. Ou desative RLS temporariamente para testes

---

### Se vir: "relation "user_profiles" does not exist"

**Significado**: A tabela não foi criada

**Solução**:
- Execute `SETUP_SQL_PERFIS.sql` no SQL Editor

---

## 📋 Antes de Testar de Novo

- [ ] Executou o SQL? (Viu 11 módulos, 5 funções, 4 perfis?)
- [ ] Abriu o console (F12)?
- [ ] Verificou se as tabelas existem em Table Editor?
- [ ] Fez refresh da página (F5)?
- [ ] Pegou um UUID de profile válido?

---

## 🎯 Próximo Passo

Após confirmar tudo acima, tente criar usuário de novo.

Se ainda não funcionar, compartilhe o log com "[DEBUG]" aqui!

