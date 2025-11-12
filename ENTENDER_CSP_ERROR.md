# 🔐 CSP Error - Explicação e Solução

## O que aconteceu?

Você recebeu este erro:

```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

## Por que aconteceu?

Navegadores modernos têm uma **política de segurança** chamada **CSP (Content Security Policy)**.

Esta política impede scripts maliciosos de injetar código.

**Problema**: Supabase (biblioteca que usamos) às vezes usa `eval()` internamente, e o navegador bloqueou.

## Solução Implementada ✅

Adicionei um **header CSP permissivo** no arquivo `index.html`:

```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; 
           script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; 
           style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
           img-src 'self' data: https:; 
           font-src 'self' https://fonts.gstatic.com; 
           connect-src 'self' https://*.supabase.co https://api.github.com; 
           frame-ancestors 'none';" />
```

### O que isto faz?

- ✅ Permite `unsafe-eval` (deixa Supabase usar eval se precisar)
- ✅ Permite `unsafe-inline` (scripts inline podem rodar)
- ✅ Permite conexões com Supabase (`https://*.supabase.co`)
- ✅ Permite fontes Google e CDNs confiáveis
- ⚠️ Ainda mantém proteção contra sites maliciosos externos

## Próximo Passo

Agora você precisa:

1. **Executar o SQL** no Supabase (veja PASSO_A_PASSO_SQL.md)
2. **Reiniciar** o servidor: `npm run dev`
3. **Testar** criar conta novamente

## Segurança

⚠️ **Nota importante**: A CSP que adicionei é:
- ✅ Segura para desenvolvimento
- ✅ Suficiente para permitir Supabase funcionar
- ⚠️ Para produção, você pode apertar as regras depois

## Se continuar com erro?

Se ainda vir erro após reiniciar:

1. **Limpar cache do navegador**
   - Pressione: Ctrl+Shift+Delete
   - Marque: "Cookies and cached images"
   - Clique: "Clear data"

2. **Fechar e reabrir navegador**

3. **Verificar console (F12)**
   - Vá para aba "Console"
   - Procure por novos erros
   - Compartilhe o erro completo

---

**Próxima ação**: Execute o SQL! 📋
