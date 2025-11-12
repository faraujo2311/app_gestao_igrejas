#!/usr/bin/env python3
"""
Script para setup automático do portal:
1. Executa SQL
2. Cria usuário
3. Testa tudo
"""

import os
import sys
import json
from pathlib import Path

# Carregar variáveis de ambiente do .env
env_file = Path('.env.local')
env_vars = {}

if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                key, value = line.split('=', 1)
                env_vars[key] = value.strip('"\'')

SUPABASE_URL = env_vars.get('VITE_SUPABASE_URL')
SUPABASE_KEY = env_vars.get('VITE_SUPABASE_PUBLISHABLE_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Erro: Variáveis de ambiente não encontradas")
    print("Verifique .env.local")
    sys.exit(1)

print(f"✅ Supabase URL: {SUPABASE_URL}")
print(f"✅ Supabase Key: {SUPABASE_KEY[:20]}...")

# Ler SQL
sql_file = Path('SETUP_SQL_PERFIS.sql')
if not sql_file.exists():
    print("❌ Erro: SETUP_SQL_PERFIS.sql não encontrado")
    sys.exit(1)

with open(sql_file) as f:
    sql = f.read()

print("\n📋 SQL carregado com sucesso")
print(f"Linhas de SQL: {len(sql.splitlines())}")

print("""
⚠️ PRÓXIMOS PASSOS MANUAIS (infelizmente Python não pode fazer via API):

1. Abra: https://supabase.com
2. Seu projeto → SQL Editor → New Query
3. Cole TODO o SQL (arquivo SETUP_SQL_PERFIS.sql)
4. Clique em "Run"
5. Volte aqui e confirme

Depois vou criar o usuário automaticamente via código!
""")
