import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface LocationState {
  from?: {
    pathname: string;
  };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [fullName, setFullName] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, error: authError } = useAuth();

  const from = (location.state as LocationState)?.from?.pathname || "/admin";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
      navigate(from);
    } catch (err) {
      toast.error("Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !fullName) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(email, password, fullName);
      toast.success("Conta criada com sucesso! Verifique seu email para confirmar.");
      setEmail("");
      setPassword("");
      setFullName("");
      setIsSigningUp(false);
    } catch (err) {
      toast.error("Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-primary/10 rounded-lg mb-4">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Igrejas</h1>
          <p className="text-muted-foreground mt-2">
            {isSigningUp ? "Crie sua conta" : "Bem-vindo de volta"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isSigningUp ? "Criar Conta" : "Fazer Login"}</CardTitle>
            <CardDescription>
              {isSigningUp
                ? "Preencha os dados para criar uma nova conta"
                : "Acesse seu portal administrativo"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {authError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{authError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={isSigningUp ? handleSignUp : handleSignIn} className="space-y-4">
              {isSigningUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    placeholder="João Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete={isSigningUp ? "new-password" : "current-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {isSigningUp && (
                  <p className="text-sm text-muted-foreground">Mínimo 6 caracteres</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !email || !password || (isSigningUp && !fullName)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSigningUp ? (isLoading ? "Criando..." : "Criar Conta") : isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            <div className="mt-4">
              <p className="text-center text-sm text-muted-foreground">
                {isSigningUp ? "Já tem uma conta? " : "Não tem uma conta? "}
                <button
                  onClick={() => {
                    setIsSigningUp(!isSigningUp);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                  }}
                  className="text-primary hover:underline font-medium"
                >
                  {isSigningUp ? "Faça login" : "Criar conta"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <strong>Demo:</strong> Use qualquer email válido para criar uma conta. A confirmação será enviada por email.
          </p>
        </div>
      </div>
    </div>
  );
}
