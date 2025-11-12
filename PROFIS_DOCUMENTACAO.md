# Sistema de Gestão de Perfis - Documentação

## 📋 Visão Geral

Este documento descreve como configurar e usar o sistema de gestão de perfis e permissões no Supabase.

## 🚀 Configuração Inicial

### Passo 1: Executar as Migrações SQL

1. Abra o [Supabase Dashboard](https://supabase.com)
2. Acesse seu projeto `app_gestao_igrejas`
3. Navegue para **SQL Editor** no menu esquerdo
4. Clique em **New Query**
5. Copie todo o conteúdo do arquivo `SETUP_SQL_PERFIS.sql`
6. Cole no editor
7. Clique em **Run** (ou pressione Ctrl+Enter)

O script irá:
- ✅ Criar todas as tabelas necessárias
- ✅ Criar índices para melhor performance
- ✅ Inserir módulos padrão (11 módulos)
- ✅ Inserir funções padrão (4 funções básicas + relatórios)
- ✅ Criar 4 perfis padrão (Super Admin, Admin, Moderador, Usuário)
- ✅ Atribuir permissões automáticas para cada perfil

### Passo 2: Verificar a Instalação

No SQL Editor, execute:

```sql
SELECT 'Módulos' as entity, COUNT(*) as total FROM modules
UNION ALL
SELECT 'Funções', COUNT(*) FROM functions
UNION ALL
SELECT 'Perfis', COUNT(*) FROM profiles
UNION ALL
SELECT 'Permissões', COUNT(*) FROM profile_module_permissions;
```

Resultado esperado:
- Módulos: 11
- Funções: 5
- Perfis: 4
- Permissões: 60+

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas

#### `modules`
Armazena os módulos do sistema.

```sql
- id (UUID, PK)
- name (VARCHAR 100, UNIQUE) - Ex: "Ministérios", "Membros"
- description (TEXT)
- order_index (INTEGER) - Ordem de exibição
- created_at, updated_at (TIMESTAMP)
```

#### `functions`
Armazena as funções/permissões disponíveis.

```sql
- id (UUID, PK)
- name (VARCHAR 100, UNIQUE) - Ex: "Consultar", "Criar"
- slug (VARCHAR 100, UNIQUE) - Ex: "read", "create"
- description (TEXT)
- created_at (TIMESTAMP)
```

#### `module_functions`
Relaciona quais funções estão disponíveis em cada módulo.

```sql
- id (UUID, PK)
- module_id (UUID, FK) → modules
- function_id (UUID, FK) → functions
- created_at (TIMESTAMP)
- UNIQUE(module_id, function_id)
```

#### `profiles`
Define os perfis de usuário.

```sql
- id (UUID, PK)
- code (VARCHAR 50, UNIQUE) - Ex: "SUPER_ADMIN", "USUARIO"
- description (TEXT)
- status (BOOLEAN) - Ativo/Inativo
- created_at, updated_at (TIMESTAMP)
```

#### `profile_module_permissions`
Define quais funções cada perfil pode executar em cada módulo.

```sql
- id (UUID, PK)
- profile_id (UUID, FK) → profiles
- module_id (UUID, FK) → modules
- function_id (UUID, FK) → functions
- created_at (TIMESTAMP)
- UNIQUE(profile_id, module_id, function_id)
```

#### `user_profiles`
Relaciona usuários a um perfil.

```sql
- id (UUID, PK)
- user_id (UUID, UNIQUE) - Do auth.users
- profile_id (UUID, FK) → profiles
- created_at, updated_at (TIMESTAMP)
```

## 👥 Perfis Padrão

### 1. SUPER_ADMIN
- **Acesso:** Total a todos os módulos
- **Permissões:** Consultar, Criar, Editar, Excluir em todos os módulos

### 2. ADMIN
- **Acesso:** Maioria dos módulos (exceto Perfis, Usuários, Configurações)
- **Permissões:** Consultar, Criar, Editar, Excluir

### 3. MODERADOR
- **Acesso:** Módulos de conteúdo (exceto Perfis, Usuários, Configurações, Financeiro)
- **Permissões:** Consultar e Editar apenas

### 4. USUARIO
- **Acesso:** Módulos básicos (exceto Perfis, Usuários, Configurações, Financeiro, Relatórios)
- **Permissões:** Consultar apenas

## 🎯 Módulos Disponíveis

1. **Ministérios** - Gerenciamento de ministérios da igreja
2. **Membros** - Gerenciamento de membros da congregação
3. **Células** - Gerenciamento de grupos de células
4. **Eventos** - Gerenciamento de eventos da igreja
5. **Voluntários** - Gerenciamento de voluntários
6. **Financeiro** - Gestão financeira da igreja
7. **Avisos** - Gerenciamento de avisos e comunicados
8. **Perfis** - Gerenciamento de perfis de usuário
9. **Usuários** - Gerenciamento de usuários do sistema
10. **Configurações** - Configurações gerais do sistema
11. **Relatórios** - Relatórios e análises

## 🔑 Funções/Permissões

- **Consultar (read)** - Permissão para visualizar dados
- **Criar (create)** - Permissão para criar novos registros
- **Editar (update)** - Permissão para editar registros existentes
- **Excluir (delete)** - Permissão para deletar registros
- **Relatar (report)** - Permissão para gerar relatórios (apenas para Relatórios)

## 🖥️ Interface de Administração

### Página de Perfis (`/admin/perfis`)

Aqui você pode:
- 📝 **Listar** todos os perfis cadastrados
- ✨ **Criar** novos perfis
- ✏️ **Editar** perfis existentes
- 🗑️ **Deletar** perfis

### Página de Detalhes do Perfil (`/admin/perfis/:id`)

Aqui você pode:
- 🔐 **Gerenciar permissões** para cada módulo
- ✅ **Marcar/Desmarcar** funções por módulo
- 💾 **Salvar** as alterações

## 📝 Como Usar a API de Permissões

### Verificar Permissões no Código

```typescript
import { canRead, canCreate, canUpdate, canDelete, isSuperAdmin } from '@/lib/permissions';

// Verificar se pode ler
if (await canRead('Membros')) {
  // Mostrar dados
}

// Verificar se é super admin
if (await isSuperAdmin()) {
  // Mostrar painel de admin
}

// Verificar permissão genérica
import { hasPermission } from '@/lib/permissions';
const canDoSomething = await hasPermission('Ministérios', 'create');
```

## 🔄 Fluxo de Atribuição de Perfil

1. **Usuário faz signup** via `supabase.auth.signUp()`
2. **Admin deve criar um registro** em `user_profiles` linkando `user_id` a um `profile_id`
3. **Usuário logado** terá suas permissões carregadas automaticamente
4. **Sistema verifica permissões** antes de mostrar módulos/funcionalidades

### Exemplo de Código

```typescript
// Ao criar um novo usuário
const { data: userProfile, error } = await supabase
  .from('user_profiles')
  .insert([
    {
      user_id: newUserId,
      profile_id: userProfileId, // ID do perfil USUARIO por padrão
    }
  ]);
```

## 🚨 Importante

1. **Sempre atribua um perfil** a cada novo usuário
2. **Super Admin é crítico** - mantenha com cuidado
3. **Perfis não podem ser deletados** se tiverem usuários associados (CASCADE para permissões, RESTRICT para user_profiles)
4. **As permissões são cacheadas** - chame `clearPermissionsCache()` ao fazer logout

## 📊 Queries Úteis

### Ver todas as permissões de um perfil

```sql
SELECT 
  p.code as profile,
  m.name as module,
  f.name as function
FROM profile_module_permissions pmp
JOIN profiles p ON pmp.profile_id = p.id
JOIN modules m ON pmp.module_id = m.id
JOIN functions f ON pmp.function_id = f.id
ORDER BY p.code, m.order_index, f.name;
```

### Ver usuários com seus perfis

```sql
SELECT 
  u.email,
  p.code as profile,
  p.description
FROM user_profiles up
JOIN auth.users u ON up.user_id = u.id
JOIN profiles p ON up.profile_id = p.id
ORDER BY u.email;
```

### Ver quantos usuários por perfil

```sql
SELECT 
  p.code,
  COUNT(up.id) as total_users
FROM profiles p
LEFT JOIN user_profiles up ON p.id = up.profile_id
GROUP BY p.id, p.code
ORDER BY total_users DESC;
```

## 🆘 Troubleshooting

### Usuário não vê nenhum módulo
- Verifique se existe um registro em `user_profiles` para este usuário
- Verifique se o `profile_id` é válido
- Chame `clearPermissionsCache()` para recarregar

### Não consegue deletar um perfil
- Verifique se não há usuários associados
- Remova os registros de `user_profiles` primeiro

### Permissões não atualizam
- Chame `clearPermissionsCache()` no navegador
- Faça login novamente

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com o administrador do sistema.
