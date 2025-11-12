# 🏘️ Gestão de Igrejas - Sistema Completo

**Um sistema web completo para gerenciar igrejas, com autenticação, perfis, permissões granulares e gestão de usuários.**

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen?style=flat-square)
![Version](https://img.shields.io/badge/version-2.0-blue?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ Funcionalidades

### 🔐 Autenticação
- ✅ Sign Up com email/senha
- ✅ Sign In com validações
- ✅ Session management automático
- ✅ Logout com limpeza de cache
- ✅ Integração com Supabase Auth

### 👥 Gerenciamento de Usuários
- ✅ CRUD completo
- ✅ Criação com atribuição de perfil automática
- ✅ Atribuir/trocar perfis
- ✅ Busca em tempo real
- ✅ Status visual

### 🛡️ Sistema de Perfis e Permissões
- ✅ 4 perfis pré-configurados (SUPER_ADMIN, ADMIN, MODERADOR, USUARIO)
- ✅ 11 módulos (Membros, Ministérios, Usuários, Perfis, etc.)
- ✅ 5 funções por módulo (read, create, update, delete, report)
- ✅ Permissões granulares via matriz
- ✅ Cache de permissões para performance

### 🔒 Proteção de Rotas
- ✅ ProtectedRoute para rotas administrativas
- ✅ PermissionGuard para conteúdo específico
- ✅ Super admin bypass automático
- ✅ Redirecionamento inteligente

### 📱 Interface
- ✅ Design responsivo
- ✅ Tema personalizado
- ✅ Componentes Shadcn/ui
- ✅ Sidebar colapsável
- ✅ Loading states

## 🚀 Quick Start

### Pré-requisitos
- Node.js 16+
- NPM ou Yarn
- Conta Supabase
- Git

### Instalação

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd app_gestao_igrejas

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
# Crie .env com:
VITE_SUPABASE_URL=https://seu-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# 4. Execute SQL no Supabase
# Abra Supabase Dashboard → SQL Editor
# Cole conteúdo de SETUP_SQL_PERFIS.sql
# Clique em Run

# 5. Inicie o app
npm run dev

# 6. Acesse
# http://localhost:5173
```

### Testes Rápidos

```bash
# Build
npm run build

# Dev Server
npm run dev

# Testar Conexão Supabase
npm exec vite-node -- src/test-supabase-connection.ts
```

## 📋 Estrutura do Projeto

```
app_gestao_igrejas/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx ................. Gerenciamento de autenticação
│   ├── pages/
│   │   ├── Login.tsx ....................... Página de autenticação
│   │   └── admin/
│   │       ├── Dashboard.tsx
│   │       ├── Usuarios.tsx ................ Gestão de usuários
│   │       ├── Perfis.tsx ................. Gestão de perfis
│   │       ├── PerfilDetalhes.tsx ......... Permissões por perfil
│   │       ├── Membros.tsx
│   │       └── Ministerios.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx ............. Proteção de rotas
│   │   ├── PermissionGuard.tsx ............ Proteção de conteúdo
│   │   └── admin/
│   │       ├── AdminLayout.tsx
│   │       └── AdminSidebar.tsx
│   ├── hooks/
│   │   └── usePermissions.ts .............. Hook de permissões
│   ├── lib/
│   │   ├── permissions.ts ................. Helpers de permissão
│   │   └── utils.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   └── App.tsx ............................ Definição de rotas
├── SETUP_SQL_PERFIS.sql ................... Schema do banco
├── FASE3_AUTENTICACAO.md .................. Docs técnicas
├── FASE3_RESUMO_EXECUTIVO.md ............. Visão geral
├── COMECE_AQUI.md ......................... Guia rápido
└── package.json
```

## 🔐 Fluxo de Autenticação

```
Landing Page
    ↓ (Entrar)
Login Page
    ├─ Sign Up
    │   ├─ Email + Nome + Senha
    │   ├─ Cria auth.user
    │   └─ Cria user_profile
    │
    └─ Sign In
        ├─ Valida credenciais
        ├─ Carrega permissões
        └─ Redireciona /admin

Admin Dashboard
    ├─ Acesso completo
    ├─ Gerenciar tudo
    └─ Logout
```

## 🛡️ Fluxo de Permissões

```
Login (user)
    ↓
Carrega user_profiles[user_id]
    ↓
Obtém profile_id
    ↓
Carrega profile_module_permissions[profile_id]
    ↓
Cache em memory
    ↓
PermissionGuard verifica
    ├─ Super Admin? → ✅
    ├─ Tem função? → ✅
    └─ Negado → ❌
```

## 💻 Uso

### Login

```
1. Acesse http://localhost:5173
2. Clique em "Entrar"
3. Preencha credenciais ou crie nova conta
4. Clique em "Entrar"
```

### Gerenciar Usuários

```
1. Acesse /admin/usuarios
2. Clique em "Novo Usuário"
3. Preencha: Email, Nome, Senha, Perfil
4. Clique em "Criar Usuário"
```

### Atribuir Permissões

```
1. Acesse /admin/perfis
2. Selecione um perfil
3. Clique em "Permissões"
4. Marque/desmarque funções
5. Clique em "Salvar"
```

### Logout

```
Clique em "Sair" na sidebar
```

## 📝 Exemplos de Código

### Usar AuthContext

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MeuComponente() {
  const { user, signOut, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      Olá, {user?.email}!
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### Usar PermissionGuard

```typescript
import { PermissionGuard } from '@/components/PermissionGuard';

function CriarBtn() {
  return (
    <PermissionGuard
      moduleName="Usuários"
      action="create"
      fallback={<span>Sem permissão</span>}
    >
      <button onClick={criar}>Criar</button>
    </PermissionGuard>
  );
}
```

### Usar Hook de Permissões

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MeuComponente() {
  const perms = usePermissions('Usuários');

  return (
    <div>
      {perms.read && <p>Pode ler</p>}
      {perms.create && <button>Criar</button>}
      {perms.loading && <p>Verificando...</p>}
    </div>
  );
}
```

## 🧪 Testes

```bash
# Build production
npm run build

# Servir build localmente
npm run preview

# Verificar erros
npm run lint
```

## 🔑 Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=https://seu-url.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# Opcional
VITE_API_URL=http://localhost:3000
```

## 📊 Dados Iniciais

### Perfis (4)
- SUPER_ADMIN - Acesso total
- ADMIN - Acesso administrativo
- MODERADOR - Acesso moderado
- USUARIO - Acesso limitado

### Módulos (11)
- Membros
- Ministérios
- Usuários
- Perfis
- Células
- Eventos
- Voluntários
- Financeiro
- Avisos
- Configurações
- Relatórios

### Funções (5)
- read - Leitura
- create - Criação
- update - Atualização
- delete - Exclusão
- report - Relatório

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Build falha | `npm install && npm run build` |
| Permissões não funcionam | Execute SQL em SETUP_SQL_PERFIS.sql |
| Não consigo fazer login | Verifique credenciais no Supabase |
| Botões desaparecem | Verifique permissões do perfil |
| Erro de conexão | Valide variáveis de ambiente |

## 📚 Documentação Completa

- **COMECE_AQUI.md** - Guia rápido (5 minutos)
- **FASE3_AUTENTICACAO.md** - Autenticação detalhada
- **PROFIS_DOCUMENTACAO.md** - Sistema de perfis
- **README_PERFIS.md** - Visão geral de perfis
- **ARQUITETURA.md** - Arquitetura do sistema
- **CHECKLIST_IMPLEMENTACAO.md** - Checklist completo
- **PROXIMOS_PASSOS.md** - Roadmap

## 🛠️ Stack Técnico

- **Frontend**: React 18 + TypeScript
- **Build**: Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Roteamento**: React Router v6
- **Estado**: React Context
- **HTTP**: Supabase Client

## 📞 Suporte

Para dúvidas ou problemas:

1. Consulte a documentação
2. Verifique o COMECE_AQUI.md
3. Confira FASE3_AUTENTICACAO.md
4. Veja exemplos em componentes

## 📄 Licença

MIT License - Veja LICENSE para detalhes

## 🙏 Créditos

Desenvolvido com ❤️ para igrejas

---

**Status**: ✅ Pronto para Produção
**Versão**: 2.0
**Data**: 11 de Novembro de 2025

Para começar: `npm install && npm run dev`
