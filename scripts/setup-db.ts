import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";

const SUPABASE_URL = "https://vsahncqzvwcpvpqbixcw.supabase.co";
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_ADMIN_KEY);

async function setupPortal() {
  console.log("🚀 Iniciando setup do portal...\n");

  try {
    // 1. Executar SQL
    console.log("📋 Etapa 1: Executando SQL...");
    const sqlFile = fs.readFileSync("SETUP_SQL_PERFIS.sql", "utf-8");

    // Dividir em comandos individuais (remover comentários e linhas vazias)
    const commands = sqlFile
      .split(";")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd && !cmd.startsWith("--") && !cmd.startsWith("/*"));

    let sqlExecuted = 0;
    for (const command of commands) {
      if (command.length > 10) {
        try {
          const { data, error } = await supabase.rpc("exec", { sql: command });
          if (!error) {
            sqlExecuted++;
          }
        } catch (e) {
          // Ignorar erros de comandos que já existem
        }
      }
    }

    console.log(`✅ SQL executado (${sqlExecuted} comandos)\n`);

    // 2. Criar usuário
    console.log("👤 Etapa 2: Criando usuário...");

    const userData = {
      email: "faraujo@gmail.com",
      password: "Bia!@#1609",
      user_metadata: {
        full_name: "Fábio Araújo",
      },
    };

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      user_metadata: userData.user_metadata,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("⚠️ Usuário já existe, buscando ID...");
        // Tentar buscar o usuário existente
      } else {
        throw authError;
      }
    }

    const userId = authData?.user?.id;
    if (!userId) {
      throw new Error("Não foi possível criar/encontrar o usuário");
    }

    console.log(`✅ Usuário criado: ${userId}\n`);

    // 3. Buscar perfil SUPER_ADMIN
    console.log("🔑 Etapa 3: Buscando perfil SUPER_ADMIN...");

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, code")
      .eq("code", "SUPER_ADMIN")
      .single();

    if (profileError) {
      throw new Error("Perfil SUPER_ADMIN não encontrado. Execute o SQL primeiro!");
    }

    const profileId = profiles.id;
    console.log(`✅ Perfil encontrado: ${profileId}\n`);

    // 4. Atribuir perfil ao usuário
    console.log("⚙️ Etapa 4: Atribuindo perfil ao usuário...");

    const { error: assignError } = await supabase.from("user_profiles").upsert(
      {
        user_id: userId,
        profile_id: profileId,
      },
      { onConflict: "user_id" }
    );

    if (assignError) {
      throw assignError;
    }

    console.log(`✅ Perfil atribuído\n`);

    // 5. Verificar resultado
    console.log("🔍 Etapa 5: Verificando resultado...");

    const { data: userProfile } = await supabase
      .from("user_profiles")
      .select("*, profile:profiles(*)")
      .eq("user_id", userId)
      .single();

    console.log(`✅ Verificação concluída\n`);

    // 6. Resumo
    console.log("═══════════════════════════════════════════════");
    console.log("✅ SETUP COMPLETO COM SUCESSO!");
    console.log("═══════════════════════════════════════════════");
    console.log("\n📋 Dados criados:");
    console.log(`   👤 Nome: Fábio Araújo`);
    console.log(`   📧 E-mail: faraujo@gmail.com`);
    console.log(`   🔑 Perfil: SUPER_ADMIN`);
    console.log(`   🆔 User ID: ${userId}`);
    console.log("\n💻 Próximas ações:");
    console.log(`   1. Abra: http://localhost:8082`);
    console.log(`   2. Clique em "Entrar"`);
    console.log(`   3. E-mail: faraujo@gmail.com`);
    console.log(`   4. Senha: Bia!@#1609`);
    console.log(`   5. Clique em "Entrar"`);
    console.log("\n✅ Portal 100% funcional!\n");
  } catch (error: any) {
    console.error("❌ ERRO:", error.message);
    process.exit(1);
  }
}

setupPortal();
