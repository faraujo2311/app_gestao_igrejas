# Erro: Foreign Key Constraint - Corrigindo responsible_user_id

## 🔴 Problema Identificado

Ao tentar salvar um membro como responsável de um ministério, você recebe o erro:

```
insert or update on table "ministries" violates foreign key constraint
"ministries_responsible_user_id_fkey"
```

### Por quê?

A coluna `responsible_user_id` da tabela `ministries` estava configurada com uma Foreign Key constraint que referenciat:
- A tabela `users` (autenticação)
- Ou outra tabela, mas NÃO a tabela `members`

Quando você tenta salvar um **ID de membro**, o banco de dados rejeita porque esse ID não existe na tabela referenciada.

## ✅ Solução

Você precisa executar o SQL `FIX_MINISTRIES_FK.sql` que:

1. **Remove a constraint antiga** (que referenciava users)
2. **Adiciona uma nova constraint** (que referencia members)
3. **Define ON DELETE SET NULL** (se um membro for deletado, a coluna vira NULL)

## 📋 Passo a Passo

### Opção 1: Executar via Supabase (RECOMENDADO)

1. Abra https://supabase.com → Dashboard → Projeto
2. Vá para **SQL Editor** → **New Query**
3. Copie TODO o conteúdo de `FIX_MINISTRIES_FK.sql`
4. Cole na caixa de SQL
5. Clique em **Run**
6. Verifique a seção "VALIDAR CONFIGURAÇÃO" para confirmar sucesso

### Opção 2: Executar via terminal (se tiver acesso direto)

```bash
psql -h seu_host -U seu_user -d sua_db < FIX_MINISTRIES_FK.sql
```

## 🔍 Verificação

Após executar o SQL, você verá dois resultados:

### Resultado 1: Constraint Information
```
constraint_name           | ministries_responsible_member_id_fkey
table_name               | ministries
column_name              | responsible_user_id
referenced_table_name    | members
```

### Resultado 2: Ministries com Responsáveis
```
id    | ministry_name  | responsible_user_id | responsible_member_name | status
------|----------------|---------------------|--------------------------|--------
uuid  | Louvor        | uuid-do-membro      | Fábio Cirino de Araújo   | true
uuid  | Infantil      | null                | (null)                   | true
uuid  | Jovenso        | uuid-do-membro      | João Silva               | true
```

## ✨ Resultado Final

- ✅ Constraint corrigida
- ✅ Responsáveis são agora membros da congregação
- ✅ Pode salvar/editar ministérios com responsáveis
- ✅ Se um membro for deletado, o responsável do ministério vira NULL (não quebra a FK)

## 📝 Estrutura do Banco Após Correção

```
ministries (tabela)
├── id (UUID PK)
├── name (VARCHAR)
├── description (TEXT)
├── responsible_user_id (UUID FK → members.id) ← CORRIGIDO!
├── observations (TEXT)
├── status (BOOLEAN)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

members (tabela)
├── id (UUID PK)
├── full_name (VARCHAR NOT NULL)
├── ...outros campos...
└── status (BOOLEAN)
```

## 🚀 Próximos Passos

Após executar o SQL:

1. Volte para a aplicação web
2. Abra um ministério para editar
3. Selecione um membro como responsável
4. Clique em "Atualizar Ministério"
5. Deve funcionar sem erros! ✅

---

**Data**: 12 de novembro de 2025
**Status**: 🔴 BLOQUEANTE - Execute este SQL antes de continuar
**Arquivo**: `FIX_MINISTRIES_FK.sql`
