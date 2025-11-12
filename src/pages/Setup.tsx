import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export default function Setup() {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setupPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("🚀 Iniciando setup...");

      // 1. Criar usuário
      console.log("1️⃣ Criando usuário...");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: "faraujo@gmail.com",
        password: "Bia!@#1609",
        options: {
          data: {
            full_name: "Fábio Araújo",
          },
        },
      });

      let userId = authData?.user?.id;

      if (authError?.message?.includes("already registered")) {
        console.log("ℹ️ Usuário já existe");

        // Buscar usuário existente via email
        const { data: existingUser, error: searchError } = await supabase
          .from("user_profiles")
          .select("user_id")
          .limit(1);

        if (!searchError && existingUser && existingUser.length > 0) {
          userId = existingUser[0].user_id;
          console.log(`✅ Usuário encontrado: ${userId}`);
        }
      } else if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      } else {
        console.log(`✅ Usuário criado: ${userId}`);
      }

      if (!userId) {
        throw new Error(
          "Não foi possível obter ID do usuário. Tente novamente."
        );
      }

      // 2. Buscar perfil SUPER_ADMIN
      console.log("2️⃣ Buscando perfil...");

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, code")
        .eq("code", "SUPER_ADMIN");

      if (profilesError) {
        throw new Error(
          `Erro ao buscar perfis: ${profilesError.message}. Verifique se o SQL foi executado.`
        );
      }

      if (!profiles || profiles.length === 0) {
        throw new Error(
          "Perfil SUPER_ADMIN não encontrado. Execute o SQL primeiro!"
        );
      }

      const profile = profiles[0];
      console.log(`✅ Perfil encontrado: ${profile.code}`);

      // 3. Verificar se usuário já tem perfil
      console.log("3️⃣ Verificando perfil do usuário...");

      const { data: existingProfile } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("user_id", userId);

      if (existingProfile && existingProfile.length > 0) {
        console.log("ℹ️ Usuário já tem perfil atribuído");
        setCompleted(true);
        toast.success("✅ Usuário já estava configurado!");
        return;
      }

      // 4. Atribuir perfil
      console.log("4️⃣ Atribuindo perfil...");

      const { data: insertData, error: assignError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: userId,
          profile_id: profile.id,
        })
        .select();

      if (assignError) {
        console.error("Erro detalhado:", assignError);
        throw new Error(
          `Erro ao atribuir perfil: ${assignError.message}. Detalhes: ${assignError.details || assignError.hint || "Nenhum detalhe disponível"}`
        );
      }

      console.log(`✅ Perfil atribuído com sucesso`);

      toast.success("✅ Setup concluído com sucesso!");
      setCompleted(true);
    } catch (error: any) {
      const errorMsg = error.message || "Erro desconhecido";
      console.error("❌ Erro completo:", error);
      setError(errorMsg);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🚀 Setup do Portal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!completed ? (
            <>
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  Clique no botão abaixo para criar o usuário:
                </p>
                <div className="bg-slate-100 p-3 rounded space-y-1 text-xs font-mono">
                  <p>📧 E-mail: faraujo@gmail.com</p>
                  <p>🔐 Senha: Bia!@#1609</p>
                  <p>👤 Nome: Fábio Araújo</p>
                  <p>🔑 Perfil: SUPER_ADMIN</p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={setupPortal}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "⏳ Criando..." : "✅ Criar Usuário"}
              </Button>

              {error && error.includes("RLS") && (
                <p className="text-xs text-muted-foreground">
                  💡 Se o erro for sobre RLS (Row Level Security), execute o
                  arquivo DISABLE_RLS.sql no Supabase SQL Editor.
                </p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-900 font-semibold mb-2">
                  ✅ Setup concluído!
                </p>
                <p className="text-sm text-green-800">
                  O usuário foi criado com sucesso. Você já pode fazer login!
                </p>
              </div>

              <Button onClick={() => (window.location.href = "/login")} className="w-full">
                ↩️ Ir para Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
