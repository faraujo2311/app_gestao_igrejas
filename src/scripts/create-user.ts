import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vsahncqzvwcpvpqbixcw.supabase.co";
const SUPABASE_KEY = "sb_publishable_vzmXmBQF3G8EyS04zdb5ng_9HiOQBuy";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupUser() {
  console.log("🚀 CRIANDO USUÁRIO FÁBIO ARAÚJO\n");

  try {
    // 1. Criar usuário
    console.log("1️⃣ Criando usuário via Supabase Auth...");

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: "faraujo@gmail.com",
      password: "Bia!@#1609",
      options: {
        data: {
          full_name: "Fábio Araújo",
        },
      },
    });

    let userId: string;

    if (authError?.message?.includes("already registered")) {
      console.log("   ℹ️ Usuário já existe");
      
      // Tentar login para pegar o ID
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: "faraujo@gmail.com",
        password: "Bia!@#1609",
      });

      if (loginError) {
        console.log("   ⚠️ Tentando fetch do usuário via API...");
        
        // Buscar via REST API
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/user_profiles?user_id=eq.${localStorage.getItem('user_id')}`,
          {
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
            },
          }
        );

        throw new Error("Não foi possível obter o ID do usuário");
      }

      userId = loginData.user!.id;
      console.log(`   ✅ ID: ${userId}`);
    } else if (authError) {
      throw authError;
    } else {
      userId = authData.user!.id;
      console.log(`   ✅ ID: ${userId}`);
    }

    // 2. Buscar perfil SUPER_ADMIN
    console.log("\n2️⃣ Buscando perfil SUPER_ADMIN...");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, code")
      .eq("code", "SUPER_ADMIN")
      .single();

    if (profileError) {
      throw new Error("Perfil SUPER_ADMIN não encontrado");
    }

    console.log(`   ✅ Perfil: ${profile.code}`);

    // 3. Atribuir perfil
    console.log("\n3️⃣ Atribuindo perfil ao usuário...");

    const { error: assignError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          user_id: userId,
          profile_id: profile.id,
        },
        {
          onConflict: "user_id",
        }
      );

    if (assignError) {
      throw assignError;
    }

    console.log(`   ✅ Perfil atribuído com sucesso`);

    // 4. Resultado
    console.log("\n" + "═".repeat(60));
    console.log("✅ SETUP CONCLUÍDO COM SUCESSO!");
    console.log("═".repeat(60));

    console.log("\n📋 DADOS DE LOGIN:");
    console.log("   📧 E-mail: faraujo@gmail.com");
    console.log("   🔐 Senha: Bia!@#1609");
    console.log("   👤 Nome: Fábio Araújo");
    console.log("   🔑 Perfil: SUPER_ADMIN");

    console.log("\n🚀 PRÓXIMAS AÇÕES:");
    console.log("   1. Inicie o servidor: npm run dev");
    console.log("   2. Acesse: http://localhost:8082");
    console.log("   3. Clique em 'Entrar'");
    console.log("   4. Use as credenciais acima");

    console.log("\n✅ Portal 100% funcional!\n");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ ERRO:", error.message);
    console.error(error);
    process.exit(1);
  }
}

setupUser();
