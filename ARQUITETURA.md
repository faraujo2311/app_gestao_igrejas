# 🏗️ Arquitetura do Sistema de Perfis

## Diagrama Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                     APLICAÇÃO REACT                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────────────┐  ┌──────────────────────┐             │
│   │   /admin/perfis      │  │ /admin/perfis/:id   │             │
│   ├──────────────────────┤  ├──────────────────────┤             │
│   │ • Listar perfis      │  │ • Editar perfis     │             │
│   │ • Criar perfil       │  │ • Permissões/módulo │             │
│   │ • Editar perfil      │  │ • Salvar             │             │
│   │ • Deletar perfil     │  │                      │             │
│   │ • Ir para perms      │──→ Gereniar Permissões │             │
│   └──────────────────────┘  └──────────────────────┘             │
│          ▲                            ▲                          │
│          │                            │                          │
│          └────────────────────────────┘                          │
│                     useNavigate()                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
           │
           │ import supabase
           ▼
┌─────────────────────────────────────────────────────────────────┐
│              SUPABASE CLIENT (@supabase/supabase-js)             │
├─────────────────────────────────────────────────────────────────┤
│ • API REST                                                       │
│ • Autenticação                                                   │
│ • Real-time                                                      │
└─────────────────────────────────────────────────────────────────┘
           │
           │ HTTP Requests
           ▼
┌─────────────────────────────────────────────────────────────────┐
│                SUPABASE BACKEND (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SISTEMA DE PERMISSÕES                      │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │                                                         │    │
│  │  modules (11)                                          │    │
│  │  ├─ Ministérios                                        │    │
│  │  ├─ Membros                                            │    │
│  │  ├─ Células                                            │    │
│  │  ├─ ...                                                │    │
│  │  └─ Relatórios                                         │    │
│  │                  ▼ (MANY-TO-MANY)                      │    │
│  │  module_functions                                      │    │
│  │      │                                                 │    │
│  │      ▼                                                 │    │
│  │  functions (5)                                         │    │
│  │  ├─ Consultar (read)                                   │    │
│  │  ├─ Criar (create)                                     │    │
│  │  ├─ Editar (update)                                    │    │
│  │  ├─ Excluir (delete)                                   │    │
│  │  └─ Relatar (report)                                   │    │
│  │                                                         │    │
│  │  profiles (4 + custom)                                 │    │
│  │  ├─ SUPER_ADMIN                                        │    │
│  │  ├─ ADMIN                                              │    │
│  │  ├─ MODERADOR                                          │    │
│  │  └─ USUARIO                                            │    │
│  │          ▼ (MANY-TO-MANY)                              │    │
│  │  profile_module_permissions                            │    │
│  │  └─ Cada perfil tem permissões em cada módulo          │    │
│  │                                                         │    │
│  │  user_profiles                                         │    │
│  │  ├─ user_id (FK → auth.users)                          │    │
│  │  └─ profile_id (FK → profiles)                         │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Fluxo de Dados

### 1. Carregar Perfis
```
User → /admin/perfis
   ↓
React Component
   ↓
supabase.from('profiles').select()
   ↓
QUERY: SELECT * FROM profiles ORDER BY created_at DESC
   ↓
Results → setState(profiles)
   ↓
Render Table
```

### 2. Editar Permissões
```
User → Clica "Permissões" em um perfil
   ↓
Navigate a /admin/perfis/:id
   ↓
React Component monta
   ↓
Carrega 4 queries em paralelo:
   ├─ Perfil (perfis)
   ├─ Módulos (modules)
   ├─ Funções (functions)
   ├─ Module-Functions (module_functions)
   └─ Permissões Atuais (profile_module_permissions)
   ↓
Renderiza Grid:
   Para cada módulo:
     ├─ Título do módulo
     └─ Checkbox para cada função
   ↓
User marca/desmarca
   ↓
Estado atualizado
   ↓
Clica "Salvar"
   ↓
DELETE todas as permissões antigas (profileId = X)
   ↓
INSERT novas permissões
   ↓
Sucesso!
```

### 3. Verificar Permissão
```
Component precisa saber se usuário pode fazer algo
   ↓
import { canRead } from '@/lib/permissions'
   ↓
await canRead('Membros')
   ↓
Helper:
   1. Obter usuário autenticado
   2. Buscar user_profiles (user_id)
   3. Buscar profile_id
   4. Buscar permissões do perfil
   5. Cache localmente
   ↓
return boolean
   ↓
Component renderiza com base em resultado
```

## Estrutura de Dados

### Relacionamentos

```
auth.users
    │
    ├─ (FK user_id) ─────→ user_profiles ←────── (FK profile_id)
    │                             │
    │                             │
    │                         profiles
    │                             │
    │                 (PK) ────────┘
    │                   │
    │            (Many-to-Many)
    │                   │
    │      profile_module_permissions
    │      ├─ (FK profile_id)
    │      ├─ (FK module_id)
    │      └─ (FK function_id)
    │           │              │
    │           ▼              ▼
    │       modules        functions
    │           │
    │    (Many-to-Many)
    │           │
    │  module_functions
    │      └─ (FK function_id)
    │              │
    │              ▼
    │          functions
    │
    └─ [Fim do relacionamento]
```

### Exemplo de Query Completa

```sql
-- Obter todas as permissões de um usuário
SELECT 
    p.code as profile,
    m.name as module,
    f.name as function,
    f.slug as function_slug
FROM auth.users u
JOIN user_profiles up ON u.id = up.user_id
JOIN profiles p ON up.profile_id = p.id
JOIN profile_module_permissions pmp ON p.id = pmp.profile_id
JOIN modules m ON pmp.module_id = m.id
JOIN functions f ON pmp.function_id = f.id
WHERE u.id = 'user_uuid'
ORDER BY m.order_index, f.name;
```

## Componentes React

```
AdminLayout
    │
    ├─ AdminSidebar ──────→ Link a /admin/perfis
    │
    └─ Routes
        │
        ├─ /admin/perfis
        │  └─ Perfis Component
        │     ├─ State: profiles, loading, openDialog, editingProfile
        │     ├─ Effects: useEffect(() => loadProfiles())
        │     ├─ Functions:
        │     │  ├─ loadProfiles()
        │     │  ├─ handleOpenDialog()
        │     │  ├─ handleSave()
        │     │  └─ handleDelete()
        │     └─ Render:
        │        ├─ Header com botão "Novo Perfil"
        │        ├─ Card com tabela
        │        │  └─ Table
        │        │     ├─ código
        │        │     ├─ descrição
        │        │     ├─ status
        │        │     └─ ações (editar, deletar, permissões)
        │        └─ Dialog para criar/editar
        │
        └─ /admin/perfis/:id
           └─ PerfilDetalhes Component
              ├─ State: profile, modules, functions, permissions
              ├─ Effects: useEffect(() => loadData())
              ├─ Functions:
              │  ├─ loadData()
              │  ├─ getModuleFunctions()
              │  ├─ togglePermission()
              │  └─ handleSave()
              └─ Render:
                 ├─ Botão voltar + info do perfil
                 ├─ Card com grid de módulos
                 │  └─ Para cada módulo:
                 │     ├─ Título
                 │     ├─ Descrição
                 │     └─ Checkboxes para cada função
                 └─ Botões (Cancelar, Salvar)
```

## Fluxo de Autenticação

```
User (Não autenticado)
    ↓
Faz login em auth.users
    ↓
supabase.auth.signUp() ou signIn()
    ↓
Admin cria registro em user_profiles
    ├─ user_id: ID do novo usuário
    └─ profile_id: ID do perfil (USUARIO, ADMIN, etc)
    ↓
User faz logout/login
    ↓
App chama loadUserPermissions()
    ↓
Cache local é atualizado
    ↓
Componentes verificam permissões
    ├─ canRead('Membros')?
    ├─ canCreate('Membros')?
    └─ etc...
```

## Cache de Permissões

```
┌────────────────────────────┐
│   Permissões Carregadas    │
├────────────────────────────┤
│ cachedPermissions = {       │
│   userId: 'xyz',           │
│   profileCode: 'ADMIN',    │
│   permissions: Map {       │
│     'moduleId1': Set {     │
│       'funcId1',           │
│       'funcId2',           │
│       ...                  │
│     },                     │
│     'moduleId2': Set {     │
│       ...                  │
│     }                      │
│   }                        │
│ }                          │
└────────────────────────────┘
         │
         ├─ Verificações rápidas (não precisa query)
         │
         └─ clearPermissionsCache() → Limpa para reload
```

## Segurança (Proposto)

```
Current:        sem RLS
Proposed:       com RLS + Audit Log

auth.users
    │
    ├─ RLS Policy: SELECT → user_profiles (own only)
    │
    ├─ user_profiles
    │  └─ RLS Policy: SELECT/UPDATE → próprio usuário
    │
    └─ profiles
       └─ RLS Policy: SELECT → all (public read)
          RLS Policy: UPDATE/DELETE → admin only
```

---

**Versão:** 1.0
**Data:** 11 de Novembro de 2025
