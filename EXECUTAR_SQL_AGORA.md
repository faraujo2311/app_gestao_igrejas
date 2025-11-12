# ⚠️ EXECUTAR SQL PRIMEIRO - CRÍTICO

## 🔴 IMPORTANTE: O erro "Database error saving new user" ocorre porque as tabelas não existem!

### Solução: Executar o SQL em 3 passos

#### PASSO 1: Abrir Supabase Dashboard
```
Acesse: https://supabase.com
Faça login com suas credenciais
Clique no seu projeto: app_gestao_igrejas
```

#### PASSO 2: Ir para SQL Editor
```
Na sidebar esquerda, clique em: SQL Editor
Clique em: New Query
```

#### PASSO 3: Copiar e executar o SQL
```
1. Abra o arquivo: SETUP_SQL_PERFIS.sql
2. Selecione TODO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no SQL Editor do Supabase (Ctrl+V)
5. Clique em botão: Run (ou Ctrl+Enter)
```

---

## ✅ Verificação após executar

Você deve ver na seção de resultado:
```
Módulos      | 11
Funções      | 5
Perfis       | 4
Permissões   | 60
```

Se viu esses números, tudo funcionou! ✅

---

## 🧪 Testando após SQL

Agora execute:
```powershell
npm run dev
```

Acesse: http://localhost:5173

1. Clique em "Entrar"
2. Clique em "Criar conta"
3. Preencha:
   - Email: seu_email@example.com
   - Nome: Seu Nome
   - Senha: 123456
   - Perfil: SUPER_ADMIN
4. Clique em "Criar Conta"

Se funcionar, verá: "✅ Usuário criado com sucesso!"

---

## ❌ Se continuar dando erro

Se após executar o SQL ainda receber "Database error saving new user":

1. **Verificar se as tabelas foram criadas**
   - Supabase Dashboard → Table Editor
   - Procure por: `modules`, `functions`, `profiles`, `user_profiles`, `profile_module_permissions`
   - Todas devem aparecer

2. **Verificar RLS (Row Level Security)**
   - Supabase Dashboard → Authentication → Policies
   - A tabela `user_profiles` pode ter RLS bloqueando
   - Se tiver, desative ou crie política de acesso

3. **Verificar tipos de dados**
   - A coluna `profile_id` em `user_profiles` deve ser UUID
   - A coluna `user_id` em `user_profiles` deve ser UUID

---

## 📞 Debug

Abra o console do navegador (F12) e tente criar uma conta novamente.

Procure por mensagens com "[DEBUG]" que mostram exatamente onde falhou.

Se vir algo como:
```
[DEBUG] Erro ao atribuir perfil: FOREIGN KEY constraint
```

Significa que a tabela `profiles` não foi criada corretamente.

---

**⏱️ Próxima ação: Executar o SQL AGORA mesmo!**
