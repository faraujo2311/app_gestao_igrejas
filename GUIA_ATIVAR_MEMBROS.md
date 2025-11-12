# 🎯 GUIA DE ATIVAÇÃO - MÓDULO DE MEMBROS

## 🚀 Como Ativar o Módulo em 3 Passos

### ✅ PASSO 1: Abrir Supabase SQL Editor

1. Acesse: https://supabase.com
2. Selecione seu projeto: `app_gestao_igrejas`
3. Clique em **SQL Editor** (lado esquerdo)
4. Clique em **New Query**

### ✅ PASSO 2: Copiar e Executar o SQL

1. Abra o arquivo: `SQL_ATIVAR_MODULO_MEMBROS_COMPLETO.sql`
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no Supabase SQL Editor (Ctrl+V)
4. Clique em **Run** (botão azul)

```
⚠️ IMPORTANTE:
- Execute como um bloco único
- Aguarde até ver ✅ nas queries
- Verifique a seção VALIDAR CONFIGURAÇÃO
```

### ✅ PASSO 3: Testar no Frontend

1. Abra seu navegador
2. Vá para: `http://localhost:8082/admin/membros`
3. Clique em **"Adicionar Membro"**
4. Preencha o formulário (veja modelo abaixo)
5. Clique em **"Adicionar Membro"**

## 📋 Modelo de Teste - Membro Exemplo

**Dados para teste:**

```
Nome Completo: João da Silva
Data de Nascimento: 15/03/1985
Telefone: (11) 99999-9999
Email: joao@exemplo.com
Endereço: Rua das Flores, 123, São Paulo - SP
Estado Civil: Casado(a)
Data de Batismo: 20/05/2010
Ministério: [Selecionar qualquer ministério]
Status: Ativo
Diácono: [marcar ou não]
Possui filhos: [marcar ou não]
Nome da mãe: Maria da Silva
Observações: Membro teste para validação
```

## 🔍 Verificar Se Funcionou

Após executar o SQL, você verá na seção **VALIDAR CONFIGURAÇÃO**:

```sql
┌─────────────────────────────────────────┐
│ Tabela members criada                   │
│ total_members: 0                        │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Módulo Membros                          │
│ total: 1                                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Permissões Configuradas:                │
│                                         │
│ SUPER_ADMIN | Membros | read   | 1     │
│ SUPER_ADMIN | Membros | create | 1     │
│ SUPER_ADMIN | Membros | update | 1     │
│ SUPER_ADMIN | Membros | delete | 1     │
│                                         │
│ ADMIN | Membros | read   | 1           │
│ ADMIN | Membros | create | 1           │
│ ADMIN | Membros | update | 1           │
│ ADMIN | Membros | delete | 1           │
│                                         │
│ REDACAO | Membros | read   | 1         │
│ REDACAO | Membros | create | 1         │
└─────────────────────────────────────────┘
```

Se ver isso ✅, tudo está funcionando!

## ⚠️ Erros Comuns e Soluções

### Erro 1: "relation members already exists"
**Solução:** Já foi executado antes. Pode executar novamente (usa ON CONFLICT).

### Erro 2: "relation ministries does not exist"
**Solução:** Você ainda não executou o módulo de Ministérios. Volte e faça primeiro.

### Erro 3: "No such schema or object"
**Solução:** Verifique se está no banco correto (app_gestao_igrejas).

### Erro 4: Página fica em branco ao abrir `/admin/membros`
**Solução:** 
- Verifique se RLS está habilitado
- Recarregue a página (F5)
- Verifique console do navegador (F12) para erros

## 🔐 Permissões por Perfil

Após ativar, estes são os acessos:

### 👑 SUPER_ADMIN
- ✅ Ver membros (Read)
- ✅ Criar membros (Create)
- ✅ Editar membros (Update)
- ✅ Deletar membros (Delete)

### 🔑 ADMIN
- ✅ Ver membros (Read)
- ✅ Criar membros (Create)
- ✅ Editar membros (Update)
- ✅ Deletar membros (Delete)

### ✍️ REDACAO
- ✅ Ver membros (Read)
- ✅ Criar membros (Create)
- ❌ Editar membros (Update) - Button disabled
- ❌ Deletar membros (Delete) - Button disabled

## 📊 Campos do Membro

| Campo | Tipo | Obrigatório | Exemplo |
|-------|------|-------------|---------|
| Nome Completo | Texto | ✅ SIM | João da Silva |
| Data de Nascimento | Data | ❌ | 15/03/1985 |
| Telefone | Texto | ❌ | (11) 99999-9999 |
| Email | Email | ❌ | joao@example.com |
| Endereço | Texto | ❌ | Rua das Flores, 123 |
| Estado Civil | Select | ❌ | Casado(a) |
| Data de Batismo | Data | ❌ | 20/05/2010 |
| **Ministério** | Select | ✅ **SIM** | Louvor |
| Status | Select | ❌ | Ativo |
| Diácono | Checkbox | ❌ | (vazio) |
| Possui filhos | Checkbox | ❌ | (vazio) |
| Nome da mãe | Texto | ❌ | Maria da Silva |
| Observações | Textarea | ❌ | Membro ativo |

## 🔗 Após Ativar - Próximos Passos

### Agora você pode:
1. ✅ Adicionar membros à seus ministérios
2. ✅ Editar informações dos membros
3. ✅ Deletar membros (SUPER_ADMIN/ADMIN)
4. ✅ Buscar membros por nome

### Próximas Implementações:
- ⏳ Validar que responsável do ministério é membro
- ⏳ Gerar relatório de membros por ministério
- ⏳ Integração com células
- ⏳ Integração com eventos

## 📞 Suporte Rápido

**P: Como acesso a página de Membros?**
R: http://localhost:8082/admin/membros (após login)

**P: Posso deletar um membro?**
R: Sim, se você for SUPER_ADMIN ou ADMIN

**P: Posso editar um membro?**
R: Sim (todos os perfis), mas botão fica desabilitado para REDACAO

**P: O que acontece se deletar um ministério com membros?**
R: Não deixa (constraint ON DELETE RESTRICT)

**P: Membros são obrigatórios em um ministério?**
R: Sim! Todo membro DEVE estar em um ministério

---

**Status**: ✅ Pronto para Ativar
**Data**: 12 de novembro de 2025
**Versão**: 1.0.0
