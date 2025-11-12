# 🔧 Implementação do Módulo de Membros

## Passo 1: Criar Tabela de Membros

Execute o seguinte SQL no Supabase SQL Editor:

```bash
📁 Arquivo: supabase/migrations/06_create_members_table.sql
```

Este SQL irá:
- ✅ Criar a tabela `members` com todos os campos necessários
- ✅ Adicionar índices para performance
- ✅ Habilitar RLS (Row Level Security)
- ✅ Criar políticas de acesso público

## Passo 2: Adicionar Módulo ao Sistema de Permissões

Execute o seguinte SQL no Supabase SQL Editor:

```bash
📁 Arquivo: SQL_SETUP_MEMBROS_MODULO.sql
```

Este SQL irá:
- ✅ Adicionar o módulo "Membros" à tabela `modules`
- ✅ Associar as funções (read, create, update, delete) ao módulo
- ✅ Conceder permissões ao SUPER_ADMIN (todas as funções)
- ✅ Conceder permissões ao ADMIN (todas as funções)
- ✅ Conceder permissões ao REDACAO (read, create apenas)

## Passo 3: Adicionar Link no Menu de Navegação

O componente Members.tsx foi implementado com:
- ✅ Interface de adicionar/editar membros com 12 campos
- ✅ Validação de ministério obrigatório
- ✅ Busca por nome
- ✅ Permission Guards em todas as ações
- ✅ Integração com Supabase
- ✅ Toast notifications

## Campos do Formulário

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Nome Completo | Texto | ✅ Sim | Nome do membro |
| Data de Nascimento | Data | ❌ Não | Data de nascimento |
| Telefone | Texto | ❌ Não | Número de telefone |
| Email | Email | ❌ Não | Endereço de email |
| Endereço | Texto | ❌ Não | Endereço completo |
| Estado Civil | Select | ❌ Não | Solteiro(a), Casado(a), Divorciado(a), Viúvo(a) |
| Data de Batismo | Data | ❌ Não | Data do batismo |
| Ministério | Select | ✅ Sim | Ministério do membro (OBRIGATÓRIO) |
| Status | Select | ❌ Não | Ativo/Inativo |
| Diácono | Checkbox | ❌ Não | Marcar se é diácono |
| Possui filhos | Checkbox | ❌ Não | Marcar se possui filhos |
| Nome da mãe | Texto | ❌ Não | Nome da mãe |
| Observações | Textarea | ❌ Não | Observações adicionais |

## Restrições de Negócio

1. **Todo membro deve estar em um ministério** ✅
   - Campo `ministry_id` é obrigatório
   - Validação no frontend
   - Constraint no banco (NOT NULL)

2. **Responsável do ministério deve ser um membro** 
   - A ser implementado: adicionar validação ao salvar ministério
   - Verificar se o `responsible_user_id` existe como membro do ministério

3. **Ministério não pode ser deletado se tiver membros**
   - Constraint ON DELETE RESTRICT na FK

## Próximos Passos

1. ✅ Executar SQL para criar tabela
2. ✅ Executar SQL para adicionar permissões
3. ✅ Testar página em `/admin/membros`
4. ⏳ Implementar validação: responsável deve ser membro do ministério
5. ⏳ Adicionar relatório de ministérios com seus membros

## URLs de Acesso

- **Dashboard**: http://localhost:8082/admin
- **Ministérios**: http://localhost:8082/admin/ministerios
- **Membros**: http://localhost:8082/admin/membros
- **Usuários**: http://localhost:8082/admin/usuarios
- **Perfis**: http://localhost:8082/admin/perfis

## Troubleshooting

Se encontrar erros ao criar membros:
1. Verifique se a tabela `ministries` existe
2. Verifique se há ministérios cadastrados
3. Verifique o RLS status das tabelas

