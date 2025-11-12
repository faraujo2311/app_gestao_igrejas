#!/usr/bin/env node
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

const SUPABASE_URL = "https://vsahncqzvwcpvpqbixcw.supabase.co";
const SUPABASE_KEY = "sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy";

// Note: Para produção, você precisa de ADMIN_KEY para executar SQL
// Por agora vamos fazer o signup normal e depois atribuir o perfil

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log("🚀 SETUP PORTAL - Fábio Araújo\n");

  try {
    // 1. Criar usuário via Supabase Auth
    console.log("📝 Etapa 1: Criando usuário no Supabase Auth...");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "faraujo@gmail.com",
      password: "Bia!@#1609",
      options: {
        data: {
          full_name: "Fábio Araújo",
        },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("⚠️ Usuário já existe, tentando fazer login...");
        
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: "faraujo@gmail.com",
          password: "Bia!@#1609",
        });

        if (loginError) throw loginError;
        
        if (loginData.user) {
          (authData as any).user = loginData.user;
        }
      } else {
        throw authError;
      }
    }

    const userId = authData?.user?.id;
    console.log(`✅ Usuário: ${userId}\n`);

    // 2. Verificar se tabelas existem
    console.log("🔍 Etapa 2: Verificando tabelas do banco...");

    const { count: profilesCount, error: checkError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (checkError) {
      console.log("❌ Tabelas não existem!");
      console.log("⚠️ AÇÃO MANUAL NECESSÁRIA:");
      console.log("   1. Abra: https://supabase.com");
      console.log("   2. Seu projeto → SQL Editor → New Query");
      console.log("   3. Cole TODO o arquivo: SETUP_SQL_PERFIS.sql");
      console.log("   4. Clique em 'Run'");
      console.log("   5. Volte aqui e execute novamente!\n");
      return;
    }

    console.log(`✅ Tabelas verificadas (${profilesCount} perfis encontrados)\n`);

    // 3. Buscar perfil SUPER_ADMIN
    console.log("🔑 Etapa 3: Buscando perfil SUPER_ADMIN...");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("code", "SUPER_ADMIN")
      .single();

    if (profileError) {
      throw new Error("Perfil SUPER_ADMIN não encontrado");
    }

    console.log(`✅ Perfil encontrado\n`);

    // 4. Atribuir perfil ao usuário
    console.log("⚙️ Etapa 4: Atribuindo perfil SUPER_ADMIN...");

    const { error: assignError } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        profile_id: profile.id,
      }, {
        onConflict: "user_id",
      });

    if (assignError) {
      throw assignError;
    }

    console.log(`✅ Perfil atribuído\n`);

    // 5. Resumo
    console.log("═══════════════════════════════════════════════════");
    console.log("✅ SETUP CONCLUÍDO COM SUCESSO!");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("📋 CREDENCIAIS:");
    console.log("   Nome: Fábio Araújo");
    console.log("   E-mail: faraujo@gmail.com");
    console.log("   Senha: Bia!@#1609");
    console.log("   Perfil: SUPER_ADMIN\n");

    console.log("🚀 PRÓXIMA AÇÃO:");
    console.log("   npm run dev");
    console.log("   http://localhost:8082");
    console.log("   Clique em 'Entrar' e faça login\n");

  } catch (error: any) {
    console.error("❌ ERRO:", error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
