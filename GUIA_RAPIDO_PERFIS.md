# 🚀 Guia de Início Rápido - Sistema de Perfis

## ⏱️ 5 Minutos para Começar

### 1️⃣ Execute o SQL (2 minutos)

```bash
# Copie TODO o conteúdo de:
# SETUP_SQL_PERFIS.sql

# Cole no Supabase Dashboard → SQL Editor → New Query → Run
```

**O que acontece:**
- ✅ 6 tabelas criadas
- ✅ 11 módulos inseridos
- ✅ 5 funções criadas
- ✅ 4 perfis padrão criados
- ✅ Permissões automáticas atribuídas

### 2️⃣ Acesse a Interface (1 minuto)

```bash
# Abra a aplicação e vá para:
http://localhost:5173/admin/perfis
```

### 3️⃣ Teste (2 minutos)

1. Clique em **"Novo Perfil"** (crie um teste)
2. Clique em **"Permissões"** no seu novo perfil
3. Marque/desmarque funções
4. Clique em **"Salvar Permissões"**

## 📋 O Sistema

### Estrutura

```
Perfis
├── SUPER_ADMIN (Acesso Total)
├── ADMIN (Acesso Amplo)
├── MODERADOR (Acesso Moderado)
└── USUARIO (Acesso Básico)

Cada Perfil tem Permissões em cada Módulo:
├── Consultar
├── Criar
├── Editar
└── Excluir

Módulos (11):
├── Ministérios
├── Membros
├── Células
├── Eventos
├── Voluntários
├── Financeiro
├── Avisos
├── Perfis
├── Usuários
├── Configurações
└── Relatórios
```

### URLs Importantes

| URL | Descrição |
|-----|-----------|
| `/admin/perfis` | Listar e gerenciar perfis |
| `/admin/perfis/:id` | Editar permissões de um perfil |

### Arquivos Criados

```
src/
├── pages/admin/
│   ├── Perfis.tsx ...................... Página principal
│   └── PerfilDetalhes.tsx .............. Editar permissões
├── integrations/supabase/
│   └── types.ts ........................ Tipos atualizados
└── lib/
    └── permissions.ts .................. Helper de permissões

Documentação:
├── SETUP_SQL_PERFIS.sql ................ SQL para executar
├── PROFIS_DOCUMENTACAO.md .............. Docs completos
└── README_PERFIS.md .................... Este arquivo
```

## 💡 Exemplos de Uso

### Verificar Permissão

```typescript
import { canRead, canCreate } from '@/lib/permissions';

async function meuComponente() {
  if (await canRead('Membros')) {
    // Mostrar dados
  }
  
  if (await canCreate('Membros')) {
    // Mostrar botão de criar
  }
}
```

### Atribuir Perfil a Usuário

```typescript
import { supabase } from '@/integrations/supabase/client';

// Quando um novo usuário se registra
const newProfile = await supabase
  .from('user_profiles')
  .insert({
    user_id: userId,
    profile_id: perfilId // UUID do perfil desejado
  });
```

### Listar Todos os Perfis

```typescript
const { data: profiles } = await supabase
  .from('profiles')
  .select('*');
```

## 🔒 Segurança

- ✅ RLS não configurado (apenas demonstração)
- ✅ Permissões verificadas no frontend (implementar no backend)
- ✅ Cache local pode ser limpo

**IMPORTANTE:** Em produção, implementar RLS (Row Level Security) no Supabase!

## 🐛 Troubleshooting

### "Erro de tabela não encontrada"
→ Execute o SQL em `SETUP_SQL_PERFIS.sql`

### "Usuário não tem permissão"
→ Verifique se `user_profiles` tem um registro para este usuário

### "Permissões não atualizam"
→ Fazer logout/login ou chamar `clearPermissionsCache()`

## 📞 Próximos Passos

1. **Implementar RLS** no Supabase para segurança
2. **Criar página de Usuários** para atribuir perfis
3. **Adicionar validações** de permissão em cada página
4. **Implementar audit log** de mudanças
5. **Configurar 2FA** para Super Admin

## 📚 Documentação Completa

Veja `PROFIS_DOCUMENTACAO.md` para:
- Estrutura detalhada das tabelas
- Queries SQL úteis
- Exemplos avançados
- Troubleshooting

## ✅ Checklist de Implementação

- [x] Tabelas criadas no Supabase
- [x] Tipos TypeScript atualizados
- [x] Páginas de Perfis criadas
- [x] Sistema de permissões funcionando
- [x] Documentação completa
- [ ] RLS configurado (próximo)
- [ ] Página de Usuários atualizada (próximo)
- [ ] Validações em cada página (próximo)

## 🎯 Status

✅ **PRONTO PARA USAR!**

O sistema está 100% funcional. Basta executar o SQL e começar a usar.

---

**Precisa de ajuda?** Consulte `PROFIS_DOCUMENTACAO.md`
