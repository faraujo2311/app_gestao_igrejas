# 🚀 PASSO A PASSO: Executar SQL e Testar

## ⚠️ Problema Resolvido

Corrigimos 2 problemas:

1. ✅ **CSP (Content Security Policy)** - Adicionado `unsafe-eval` ao `index.html`
2. ⏳ **Database error** - Será resolvido após executar o SQL

---

## 📋 PASSO 1: Executar o SQL no Supabase (CRÍTICO)

### 1.1 Abrir Supabase

```
Acesse: https://supabase.com
Clique em: "Sign In"
Faça login com suas credenciais (Google/GitHub/Email)
```

### 1.2 Selecionar o Projeto

```
Na dashboard, procure por: "app_gestao_igrejas"
Clique no projeto
```

### 1.3 Abrir SQL Editor

```
Na sidebar esquerda (Menu lateral)
Procure por: "SQL Editor"
Clique em "SQL Editor"
```

### 1.4 Criar Nova Query

```
No topo da página, clique em: "New Query"
```

### 1.5 Copiar o SQL Completo

```
1. Abra este arquivo: SETUP_SQL_PERFIS.sql
2. Selecione TUDO o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
```

### 1.6 Colar e Executar

```
1. Na página do SQL Editor, clique na área de texto
2. Cole o SQL (Ctrl+V)
3. Clique em botão: "Run" (ou pressione Ctrl+Enter)
```

### 1.7 Verificar Resultado

Você deve ver no final:

```
entity         total
─────────────────────
Módulos        11
Funções        5
Perfis         4
Permissões     60
```

✅ Se viu esses números = **SQL executado com sucesso!**

---

## 🧪 PASSO 2: Testar a Aplicação (Localmente)

### 2.1 Voltar para VS Code

```powershell
# Abra o terminal do VS Code (Ctrl + `)
# Ou abra PowerShell e navegue até:
cd c:\Users\Fábio\Desktop\meu-projeto-firebase\app_gestao_igrejas
```

### 2.2 Reiniciar a Aplicação

```powershell
# Se está rodando, pressione Ctrl+C para parar
# Depois execute:
npm run dev
```

Deve ver:
```
  VITE v5.4.19  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### 2.3 Abrir no Navegador

```
Acesse: http://localhost:5173
Você verá a página inicial (Landing Page)
```

### 2.4 Clicar em "Entrar"

```
No topo direito, clique no botão: "Entrar"
Será redirecionado para página de login
```

### 2.5 Criar Nova Conta

```
1. Clique em: "Criar conta"
2. Aparecerá formulário de signup com campos:
   - Email
   - Nome Completo
   - Senha
   - Perfil (dropdown)
```

### 2.6 Preencher Formulário

```
Email:    seu_email_teste@gmail.com
Nome:     Seu Nome de Teste
Senha:    123456
Perfil:   SUPER_ADMIN (selecionar no dropdown)
```

### 2.7 Clique em "Criar Conta"

```
Esperado: "✅ Usuário criado com sucesso! Email de confirmação enviado."

Se vir isso = ✅ FUNCIONANDO!
```

---

## 📧 PASSO 3: Confirmar Email (Opcional - para fazer login depois)

Você receberá email de confirmação no seu email.

```
Procure por: "Confirm your email for [seu_email]"
Clique no link: "Confirm email"
```

Agora você pode fazer login com essa conta!

---

## 🔍 PASSO 4: Verificar Permissões (Teste Completo)

### 4.1 Fazer Login

```
1. Volte para: http://localhost:5173/login
2. Clique em: "Entrar" (se não estiver lá)
3. Preencha:
   - Email: seu_email_teste@gmail.com
   - Senha: 123456
4. Clique em "Entrar"
```

### 4.2 Será Redirecionado para /admin

```
Se vir dashboard com:
  - Sidebar esquerda
  - Seu email no topo
  - Botão de logout

= ✅ LOGIN FUNCIONANDO!
```

### 4.3 Testar Página de Usuários

```
Na sidebar, procure por: "Usuários"
Clique em "Usuários"
Deve abrir: /admin/usuarios

Se abrir = ✅ PÁGINA FUNCIONANDO!
```

### 4.4 Criar Outro Usuário

```
1. Clique em botão: "Novo Usuário"
2. Preencha:
   - Email: outro_teste@gmail.com
   - Nome: Outro Usuario
   - Senha: 123456
   - Perfil: ADMIN (ou outro)
3. Clique em "Criar"
```

Esperado:
```
"✅ Usuário criado com sucesso! Email de confirmação enviado."
Usuário aparece na tabela abaixo
```

---

## ❌ PASSO 5: Se Continuar com Erro

### Se vir: "Database error saving new user"

**Verificar 1: SQL foi executado?**

1. Vá para Supabase Dashboard
2. Clique em: "Table Editor"
3. Procure por: `user_profiles`, `profiles`, `modules`
4. Se não aparecerem = Re-execute o SQL

**Verificar 2: RLS está bloqueando?**

1. Vá para Supabase: Authentication → Policies
2. Procure por: `user_profiles`
3. Se tiver CSP ou RLS bloqueando, veja a solução abaixo

**Verificar 3: Abrir Console (F12)**

```
1. Pressione F12
2. Vá para aba "Console"
3. Procure por linhas com "[DEBUG]"
4. Copie a mensagem de erro completa
```

---

## 🛠️ Solução Rápida: RLS Bloqueando

Se Supabase está com Row Level Security bloqueando:

1. **Supabase Dashboard**
2. **Authentication** → **Policies**
3. Procure por tabela: `user_profiles`
4. Se tiver RLS ativa, clique em: **"Disable RLS"** (temporariamente para teste)
5. Teste de novo

---

## ✅ Checklist Final

- [ ] Executei o SQL no Supabase?
- [ ] Vi 11 módulos, 5 funções, 4 perfis, 60 permissões?
- [ ] Reiniciei o `npm run dev`?
- [ ] Consegui criar conta com sucesso?
- [ ] Consegui fazer login?
- [ ] Acessei /admin/usuarios?
- [ ] Consegui criar outro usuário?

Se todos os ✅ = **TUDO FUNCIONANDO!** 🎉

---

## 📞 Próximos Passos

Após tudo funcionar:

1. Explore as páginas: /admin/perfis, /admin/membros, etc
2. Teste permissões de cada perfil (SUPER_ADMIN, ADMIN, MODERADOR, USUARIO)
3. Consulte documentação: README_NOVO.md, FASE3_AUTENTICACAO.md

---

**⏱️ Tempo estimado: 10 minutos**

Pronto? Comece pelo PASSO 1! 🚀
