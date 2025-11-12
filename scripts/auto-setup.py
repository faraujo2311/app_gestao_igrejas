#!/usr/bin/env python3
"""
Script para executar SQL no Supabase e criar usuário automaticamente.
Requer: SERVICE_KEY do Supabase
"""

import os
import requests
import json
from typing import Optional

SUPABASE_URL = "https://vsahncqzvwcpvpqbixcw.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy"
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWhuY3F6dndjcHZwcWJpeGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgyNDcyMSwiZXhwIjoyMDc4NDAwNzIxfQ.0eqUpncYpWzrkrGJ9tcZb4HT9IuktUmRoLlBjdNMerM").strip()

def execute_sql(sql: str, service_key: str) -> dict:
    """Executa SQL no Supabase usando Admin API"""
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    
    # Usar endpoint de SQL direto (se disponível) ou via função RPC customizada
    # Para agora, vamos usar uma abordagem diferente: criar via dados diretos
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/pg_queries",
        headers=headers,
        json={"query": sql},
        timeout=30
    )
    
    if response.status_code >= 400:
        # Tentar com formato alternativo
        response = requests.post(
            f"{SUPABASE_URL}/functions/v1/execute-sql",
            headers=headers,
            json={"sql": sql},
            timeout=30
        )
    
    return {
        "status": response.status_code,
        "data": response.text,
        "ok": response.status_code < 400
    }

def fix_user_profiles_table(service_key: str) -> bool:
    """Recria tabela user_profiles com políticas corretas"""
    
    sql_commands = [
        # 1. Desabilitar RLS
        "ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;",
        
        # 2. Remover tabela
        "DROP TABLE IF EXISTS user_profiles CASCADE;",
        
        # 3. Recriar tabela com constraints corretos
        """
        CREATE TABLE user_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL UNIQUE,
          profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """,
        
        # 4. Índices
        "CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_profiles_profile ON user_profiles(profile_id);",
        
        # 5. Políticas sem restrições
        "ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;",
        """
        CREATE POLICY "Allow all operations" ON user_profiles
          USING (TRUE)
          WITH CHECK (TRUE);
        """
    ]
    
    print("🔧 Corrigindo tabela user_profiles...\n")
    
    for i, sql in enumerate(sql_commands, 1):
        if sql.strip():
            print(f"  {i}. Executando: {sql[:60]}...")
            result = execute_sql(sql, service_key)
            
            if result["status"] not in [200, 201, 204]:
                print(f"     ❌ Erro: {result['data']}")
                return False
            else:
                print(f"     ✅ OK")
    
    return True

def create_user_programmatically(service_key: str) -> bool:
    """Criar usuário usando Admin API"""
    
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    
    user_data = {
        "email": "faraujo@gmail.com",
        "password": "Bia!@#1609",
        "email_confirm": True,
        "user_metadata": {
            "full_name": "Fábio Araújo"
        }
    }
    
    print("\n👤 Criando usuário...\n")
    
    # Criar usuário
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers=headers,
        json=user_data
    )
    
    if response.status_code not in [200, 201]:
        print(f"❌ Erro ao criar usuário: {response.text}")
        return False
    
    user = response.json()
    user_id = user.get("id")
    print(f"✅ Usuário criado: {user_id}")
    
    # Buscar profile SUPER_ADMIN
    print("\n🔍 Buscando perfil SUPER_ADMIN...\n")
    
    headers_anon = {
        "apikey": SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
    }
    
    response = requests.get(
        f"{SUPABASE_URL}/rest/v1/profiles?code=eq.SUPER_ADMIN&select=id",
        headers=headers_anon
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar perfil: {response.text}")
        return False
    
    profiles = response.json()
    if not profiles:
        print("❌ Perfil SUPER_ADMIN não encontrado")
        return False
    
    profile_id = profiles[0]["id"]
    print(f"✅ Perfil encontrado: {profile_id}")
    
    # Atribuir perfil
    print("\n📌 Atribuindo perfil ao usuário...\n")
    
    profile_data = {
        "user_id": user_id,
        "profile_id": profile_id
    }
    
    # Usar chave de serviço para inserir
    headers_admin = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/rest/v1/user_profiles",
        headers=headers_admin,
        json=profile_data
    )
    
    if response.status_code not in [200, 201]:
        print(f"❌ Erro ao atribuir perfil: {response.text}")
        return False
    
    print(f"✅ Perfil atribuído com sucesso!")
    
    return True

def main():
    if not SERVICE_KEY:
        print("❌ Variável de ambiente SUPABASE_SERVICE_KEY não configurada!")
        print("\n📋 Adicione ao seu .env.local:")
        print("SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzYWhuY3F6dndjcHZwcWJpeGN3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjgyNDcyMSwiZXhwIjoyMDc4NDAwNzIxfQ.0eqUpncYpWzrkrGJ9tcZb4HT9IuktUmRoLlBjdNMerM")
        print("\n🔗 Obtenha em: https://supabase.com → Project → Settings → API → Service Role Key")
        return
    
    print("\n" + "="*60)
    print("🚀 SETUP AUTOMÁTICO DO PORTAL")
    print("="*60 + "\n")
    
    # 1. Corrigir tabela
    if not fix_user_profiles_table(SERVICE_KEY):
        print("\n❌ Falha ao corrigir tabela!")
        return
    
    # 2. Criar usuário
    if not create_user_programmatically(SERVICE_KEY):
        print("\n❌ Falha ao criar usuário!")
        return
    
    print("\n" + "="*60)
    print("✅ SETUP CONCLUÍDO COM SUCESSO!")
    print("="*60)
    print("\n📧 Credenciais:")
    print("  Email: faraujo@gmail.com")
    print("  Senha: Bia!@#1609")
    print("\n🔗 Acesse: http://localhost:8082/login")

if __name__ == "__main__":
    main()
