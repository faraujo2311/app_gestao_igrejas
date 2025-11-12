#!/bin/bash
# Script de setup rápido - Executa SQL e cria usuário

echo "🚀 SETUP PORTAL - INICIANDO"
echo ""

# Variáveis
SUPABASE_URL="https://vsahncqzvwcpvpqbixcw.supabase.co"
SUPABASE_KEY="sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy"

echo "⚠️ ATENÇÃO: O setup SQL requer acesso à Supabase API."
echo ""
echo "Para continuar, você precisa fazer MANUALMENTE:"
echo ""
echo "1. Abra: https://supabase.com"
echo "2. Seu projeto → SQL Editor → New Query"
echo "3. Cole o arquivo: SETUP_SQL_PERFIS.sql"
echo "4. Clique em 'Run'"
echo "5. Volte aqui"
echo ""
read -p "Você executou o SQL? (s/n): " response

if [[ $response != "s" ]]; then
    echo "❌ Setup cancelado"
    exit 1
fi

echo ""
echo "📝 Agora vou criar o usuário Fábio Araújo..."
echo ""

# Executar script de criação de usuário
npx tsx scripts/create-user.ts
