import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

if (!SUPABASE_SERVICE_KEY) {
  console.error("❌ SUPABASE_SERVICE_KEY não configurada!");
  console.log(
    "📋 Adicione ao seu .env.local:\nSUPABASE_SERVICE_KEY=seu_service_key_aqui"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function disableRLS() {
  console.log("🔓 Desabilitando RLS...\n");

  const tables = ["profiles", "user_profiles", "modules", "functions"];
  const sqls = tables.map((table) => `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`);

  for (const sql of sqls) {
    console.log(`Executando: ${sql}`);
    const { error } = await supabase.rpc("execute_sql", { sql });

    if (error) {
      console.error(`❌ Erro: ${error.message}`);
    } else {
      console.log(`✅ OK\n`);
    }
  }

  console.log("✅ RLS desabilitada com sucesso!");
}

disableRLS().catch((err) => {
  console.error("❌ Erro fatal:", err.message);
  process.exit(1);
});
