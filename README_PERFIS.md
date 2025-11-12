# ⚙️ Sistema de Gestão de Perfis e Permissões

## 🎯 O que foi implementado

Um sistema completo de gerenciamento de perfis de usuário com controle granular de permissões por módulo e função.

## 📦 O que foi criado

### 1. **Tabelas no Banco de Dados** (Supabase)
- `modules` - Módulos do sistema (Ministérios, Membros, etc.)
- `functions` - Funções/permissões (Consultar, Criar, Editar, Excluir)
- `module_functions` - Relacionamento entre módulos e funções
- `profiles` - Perfis de usuário (Super Admin, Admin, Moderador, Usuário)
- `profile_module_permissions` - Permissões de cada perfil
- `user_profiles` - Relacionamento entre usuários e perfis

### 2. **Tipos TypeScript** 
- Arquivo `src/integrations/supabase/types.ts` atualizado com os novos tipos

### 3. **Páginas React**
- **`/admin/perfis`** - Lista, cria, edita e deleta perfis
- **`/admin/perfis/:id`** - Gerencia permissões de um perfil por módulo

### 4. **Helper de Permissões**
- `src/lib/permissions.ts` - Funções para verificar permissões do usuário

### 5. **Arquivos SQL**
- `SETUP_SQL_PERFIS.sql` - SQL completo para criar todas as tabelas e dados iniciais
- `PROFIS_DOCUMENTACAO.md` - Documentação detalhada

### 6. **Rotas Atualizadas**
- `src/App.tsx` com as novas rotas de Perfis

## 🚀 Como Usar

### Passo 1: Executar as Migrações

1. Abra https://supabase.com e entre em seu projeto
2. Vá para **SQL Editor**
3. Crie uma **New Query**
4. Copie todo o conteúdo de `SETUP_SQL_PERFIS.sql`
5. Execute (Ctrl+Enter)

### Passo 2: Acessar a Interface

1. Abra a aplicação
2. Navegue para o menu Admin (sidebar)
3. Clique em **Perfis**

### Passo 3: Gerenciar Permissões

1. Na lista de perfis, clique em **Permissões**
2. Marque/desmarque as funções que cada perfil pode fazer
3. Clique em **Salvar Permissões**

## 📊 Módulos Padrão (11)

1. Ministérios
2. Membros
3. Células
4. Eventos
5. Voluntários
6. Financeiro
7. Avisos
8. Perfis
9. Usuários
10. Configurações
11. Relatórios

## 🔑 Funções Padrão (4)

1. **Consultar** - Ver dados
2. **Criar** - Criar novos registros
3. **Editar** - Modificar registros
4. **Excluir** - Remover registros
5. **Relatar** - Gerar relatórios (apenas para Relatórios)

## 👥 Perfis Padrão (4)

| Perfil | Acesso | Permissões |
|--------|--------|------------|
| **SUPER_ADMIN** | Todos os módulos | CRUD + Relatórios |
| **ADMIN** | Maioria (exceto Perfis/Usuários) | CRUD |
| **MODERADOR** | Básicos (sem Financeiro) | Consultar + Editar |
| **USUARIO** | Básicos (sem Financeiro/Relatórios) | Consultar |

## 💻 Como Usar na Aplicação

### Verificar Permissões

```typescript
import { canRead, canCreate, isSuperAdmin } from '@/lib/permissions';

// No seu componente
const [canReadMembers, setCanRead] = useState(false);

useEffect(() => {
  (async () => {
    const can = await canRead('Membros');
    setCanRead(can);
  })();
}, []);

if (!canReadMembers) {
  return <p>Sem permissão</p>;
}

return <MembersList />;
```

### Atribuir Perfil a Usuário

```typescript
// Ao criar novo usuário
const { error } = await supabase
  .from('user_profiles')
  .insert([
    {
      user_id: newUserId,
      profile_id: userProfileId,
    }
  ]);
```

## 📝 Próximos Passos Sugeridos

1. ✅ Criar página de Usuários que permita atribuir perfis
2. ✅ Implementar verificação de permissões em cada página
3. ✅ Adicionar audit log de mudanças de permissões
4. ✅ Criar relatórios de permissões e acessos
5. ✅ Implementar 2FA para Super Admin

## 🔗 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `SETUP_SQL_PERFIS.sql` | SQL para criar tabelas e dados iniciais |
| `PROFIS_DOCUMENTACAO.md` | Documentação completa |
| `src/pages/admin/Perfis.tsx` | Página de gerenciamento de perfis |
| `src/pages/admin/PerfilDetalhes.tsx` | Página de gerenciamento de permissões |
| `src/lib/permissions.ts` | Helper para verificar permissões |
| `src/integrations/supabase/types.ts` | Tipos TypeScript atualizados |
| `src/App.tsx` | Rotas atualizadas |

## ✨ Funcionalidades

- ✅ Criar novos perfis
- ✅ Editar perfis existentes
- ✅ Deletar perfis
- ✅ Gerenciar permissões por módulo
- ✅ Verificar permissões do usuário
- ✅ Cache de permissões
- ✅ Relacionamento entre usuários e perfis

## 🛡️ Segurança

- Permissões são verificadas no servidor
- Cache local pode ser limpo com `clearPermissionsCache()`
- Perfis críticos não podem ser deletados com usuários associados

## 📞 Suporte

Consulte `PROFIS_DOCUMENTACAO.md` para mais detalhes.
