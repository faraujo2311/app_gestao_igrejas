#!/usr/bin/env python3
"""
Script para criar usuário no Supabase automaticamente.
Requer: SERVICE_KEY do Supabase
"""

import os
import json

try:
    from supabase import create_client, Client
except ImportError:
    print("❌ Supabase Python client não instalado!")
    print("Execute: pip install supabase")
    exit(1)

SUPABASE_URL = "https://vsahncqzvwcpvpqbixcw.supabase.co"
SUPABASE_ANON_KEY = "sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy"
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "").strip()

def create_user_with_profile(service_key: str) -> bool:
    """Criar usuário e atribuir perfil"""
    
    # Cliente com service key (acesso admin)
    supabase_admin: Client = create_client(SUPABASE_URL, service_key)
    
    # Cliente com anon key (acesso público)
    supabase_public: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    print("\n" + "="*60)
    print("🚀 SETUP AUTOMÁTICO DO PORTAL")
    print("="*60 + "\n")
    
    # 1. Verificar se usuário já existe
    print("1️⃣ Verificando se usuário já existe...\n")
    
    try:
        users = supabase_admin.auth.admin.list_users()
        existing = [u for u in users.users if u.email == "faraujo@gmail.com"]
        
        if existing:
            user_id = existing[0].id
            print(f"ℹ️ Usuário já existe: {user_id}\n")
        else:
            # Criar novo usuário
            print("👤 Criando novo usuário...\n")
            
            user = supabase_admin.auth.admin.create_user(
                email="faraujo@gmail.com",
                password="Bia!@#1609",
                email_confirm=True,
                user_metadata={
                    "full_name": "Fábio Araújo"
                }
            )
            user_id = user.user.id
            print(f"✅ Usuário criado: {user_id}\n")
    
    except Exception as e:
        print(f"❌ Erro ao gerenciar usuário: {str(e)}\n")
        return False
    
    # 2. Buscar perfil SUPER_ADMIN
    print("2️⃣ Buscando perfil SUPER_ADMIN...\n")
    
    try:
        profiles = supabase_public.table("profiles").select("*").eq("code", "SUPER_ADMIN").execute()
        
        if not profiles.data:
            print("❌ Perfil SUPER_ADMIN não encontrado!\n")
            return False
        
        profile_id = profiles.data[0]["id"]
        print(f"✅ Perfil encontrado: {profile_id}\n")
    
    except Exception as e:
        print(f"❌ Erro ao buscar perfil: {str(e)}\n")
        return False
    
    # 3. Verificar se já tem perfil
    print("3️⃣ Verificando perfil do usuário...\n")
    
    try:
        existing_profile = supabase_admin.table("user_profiles").select("*").eq("user_id", user_id).execute()
        
        if existing_profile.data:
            print(f"ℹ️ Usuário já tem perfil atribuído\n")
            return True
    
    except Exception as e:
        pass  # Tabela pode estar vazia
    
    # 4. Atribuir perfil
    print("4️⃣ Atribuindo perfil SUPER_ADMIN...\n")
    
    try:
        result = supabase_admin.table("user_profiles").insert({
            "user_id": user_id,
            "profile_id": profile_id
        }).execute()
        
        print(f"✅ Perfil atribuído com sucesso!\n")
    
    except Exception as e:
        print(f"❌ Erro ao atribuir perfil: {str(e)}\n")
        return False
    
    # 5. Sucesso!
    print("="*60)
    print("✅ SETUP CONCLUÍDO COM SUCESSO!")
    print("="*60)
    print("\n📧 Credenciais:")
    print("  Email: faraujo@gmail.com")
    print("  Senha: Bia!@#1609")
    print("  Perfil: SUPER_ADMIN")
    print("\n🔗 Acesse: http://localhost:8082/login\n")
    
    return True

def main():
    if not SERVICE_KEY:
        print("❌ Variável de ambiente SUPABASE_SERVICE_KEY não configurada!")
        print("\n📋 Adicione ao seu .env.local:")
        print("SUPABASE_SERVICE_KEY=seu_service_key_aqui")
        print("\n🔗 Obtenha em: https://supabase.com → Project → Settings → API → Service Role Key")
        return
    
    if not create_user_with_profile(SERVICE_KEY):
        print("❌ Falha no setup!")
        return

if __name__ == "__main__":
    main()
