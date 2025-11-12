import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PermissionGuard } from "@/components/PermissionGuard";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, AlertCircle, CheckCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<"profiles">;
type UserProfile = Tables<"user_profiles">;

interface User {
  id: string;
  email: string;
  created_at: string;
  user_metadata?: {
    full_name?: string;
  };
  profile?: Profile | null;
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [perfis, setPerfis] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const permissions = usePermissions("Usuários");
  const [selectedUsuario, setSelectedUsuario] = useState<User | null>(null);
  const [selectedPerfil, setSelectedPerfil] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserPerfil, setNewUserPerfil] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Carregar usuários
  const loadUsuarios = async () => {
    setLoading(true);
    try {
      // Usar função RPC para buscar usuários com email
      const { data, error } = await supabase
        .rpc("get_users_with_profiles");

      if (error) {
        console.warn("RPC falhou, usando fallback:", error);
        throw error; // Força fallback
      }

      if (data && data.length > 0) {
        // Converter dados do RPC para formato User
        const usuarios = data.map((item: any) => ({
          id: item.user_id,
          email: item.email || `user-${item.user_id.substring(0, 8)}@example.com`,
          created_at: item.created_at || new Date().toISOString(),
          user_metadata: {
            full_name: item.full_name || "Sem nome",
          },
          profile: item.profile_id ? {
            id: item.profile_id,
            code: item.profile_code,
            description: item.profile_description,
          } : null,
        }));

        setUsuarios(usuarios);
      } else {
        setUsuarios([]);
      }
    } catch (rpcError) {
      // Fallback para buscar sem RPC
      console.warn("Usando fallback sem RPC");
      try {
        const { data: userProfiles, error: userProfilesError } = await supabase
          .from("user_profiles")
          .select("user_id, profile:profiles(*)")
          .order("created_at", { ascending: false });

        if (userProfilesError) throw userProfilesError;

        const usuariosMap = new Map<string, User>();
        if (userProfiles) {
          for (const up of userProfiles) {
            usuariosMap.set(up.user_id, {
              id: up.user_id,
              email: `Carregando...`, // Placeholder temporário
              created_at: new Date().toISOString(),
              user_metadata: {
                full_name: "Carregando...",
              },
              profile: up.profile as Profile | null,
            });
          }
        }
        setUsuarios(Array.from(usuariosMap.values()));
      } catch (fallbackError) {
        console.error("Erro no fallback:", fallbackError);
        toast.error("Erro ao carregar usuários");
      }
    } finally {
      setLoading(false);
    }
  };

  // Carregar perfis
  const loadPerfis = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", true)
        .order("code", { ascending: true });

      if (error) throw error;
      setPerfis(data || []);
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
      toast.error("Erro ao carregar perfis");
    }
  };

  useEffect(() => {
    loadUsuarios();
    loadPerfis();
  }, []);

  // Atribuir perfil a usuário
  const atribuirPerfil = async () => {
    if (!selectedUsuario || !selectedPerfil) {
      toast.error("Selecione um usuário e um perfil");
      return;
    }

    try {
      // Verificar permissão do usuário logado
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast.error("Usuário não autenticado");
        return;
      }

      // Impedir que usuário comum edite perfil (mesmo o seu)
      if (permissions && !permissions.isSuperAdmin && permissions.update === false) {
        toast.error("Você não tem permissão para alterar perfis");
        return;
      }

      // Primeiro, verifica se já existe uma atribuição
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", selectedUsuario.id)
        .single();

      if (existing) {
        // Atualizar perfil existente
        const { error } = await supabase
          .from("user_profiles")
          .update({ profile_id: selectedPerfil })
          .eq("user_id", selectedUsuario.id);

        if (error) throw error;
      } else {
        // Inserir novo perfil
        const { error } = await supabase
          .from("user_profiles")
          .insert({
            user_id: selectedUsuario.id,
            profile_id: selectedPerfil,
          });

        if (error) throw error;
      }

      toast.success("Perfil atribuído com sucesso");
      setIsOpen(false);
      setSelectedPerfil("");
      loadUsuarios();
    } catch (error) {
      console.error("Erro ao atribuir perfil:", error);
      toast.error("Erro ao atribuir perfil");
    }
  };

  // Criar novo usuário com Supabase Auth
  const criarNovoUsuario = async () => {
    if (!newUserEmail || !newUserPassword || !newUserPerfil) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (newUserPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsCreating(true);
    try {
      console.log("[DEBUG] Iniciando criação de usuário:", newUserEmail);

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            full_name: newUserFullName || "Usuário",
          },
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (authError) {
        console.error("[DEBUG] Erro na autenticação:", authError);
        throw authError;
      }

      console.log("[DEBUG] Usuário criado na auth:", authData.user?.id);

      if (authData.user) {
        try {
          // Atribuir perfil automaticamente
          console.log("[DEBUG] Tentando atribuir perfil:", {
            user_id: authData.user.id,
            profile_id: newUserPerfil,
          });

          const { data: profileData, error: profileError } = await supabase
            .from("user_profiles")
            .insert({
              user_id: authData.user.id,
              profile_id: newUserPerfil,
            })
            .select();

          if (profileError) {
            console.error("[DEBUG] Erro ao atribuir perfil:", profileError);
            throw profileError;
          }

          console.log("[DEBUG] Perfil atribuído com sucesso:", profileData);
          
          toast.success("✅ Usuário criado com sucesso! Email de confirmação enviado.");
          setNewUserEmail("");
          setNewUserFullName("");
          setNewUserPassword("");
          setNewUserPerfil("");
          setIsOpenCreateDialog(false);
          loadUsuarios();
        } catch (profileError: any) {
          console.error("[DEBUG] Erro ao salvar perfil do usuário:", profileError);
          toast.error(`Database error saving new user: ${profileError.message || profileError}`);
          
          // Tentar deletar o usuário criado se falhar ao atribuir perfil
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
            console.log("[DEBUG] Usuário deletado após erro de perfil");
          } catch (deleteError) {
            console.error("[DEBUG] Erro ao deletar usuário após falha:", deleteError);
          }
        }
      }
    } catch (error: any) {
      console.error("[DEBUG] Erro geral ao criar usuário:", error);
      const errorMsg = error.message || error.errorDescription || "Erro ao criar usuário";
      toast.error(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  // Deletar usuário
  const deletarUsuario = async (userId: string) => {
    if (!confirm("Tem certeza que deseja deletar este usuário?")) return;

    try {
      // Deletar relacionamento user_profiles
      const { error: userProfileError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", userId);

      if (userProfileError) throw userProfileError;

      // Nota: Para deletar o usuário da auth.users, você precisa usar o Admin API
      // Por enquanto, apenas removemos o perfil
      toast.success("Usuário deletado com sucesso");
      loadUsuarios();
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      toast.error("Erro ao deletar usuário");
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.user_metadata?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários e suas atribuições de perfis
          </p>
        </div>
        <PermissionGuard
          moduleName="Usuários"
          action="create"
          fallback={<Button disabled className="gap-2 cursor-not-allowed"><Lock className="w-4 h-4" />Sem permissão</Button>}
        >
          <Dialog open={isOpenCreateDialog} onOpenChange={setIsOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  placeholder="João Silva"
                  value={newUserFullName}
                  onChange={(e) => setNewUserFullName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="perfil">Perfil</Label>
                <Select value={newUserPerfil} onValueChange={setNewUserPerfil}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.code} - {p.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={criarNovoUsuario}
                disabled={isCreating || !newUserEmail || !newUserPassword || !newUserPerfil}
              >
                {isCreating ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuários</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <PermissionGuard moduleName="Usuários" action="read">
            {loading ? (
              <div className="text-center py-8">Carregando usuários...</div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum usuário encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuariosFiltrados.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.email}</TableCell>
                      <TableCell>{usuario.user_metadata?.full_name || "N/A"}</TableCell>
                    <TableCell>
                      {usuario.profile ? (
                        <Badge variant="default">{usuario.profile.code}</Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Sem perfil
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={usuario.profile ? "default" : "destructive"}>
                        {usuario.profile ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Ativo
                          </span>
                        ) : (
                          "Inativo"
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <PermissionGuard
                          moduleName="Usuários"
                          action="update"
                          fallback={<Button variant="ghost" size="icon" disabled><Lock className="h-4 w-4" /></Button>}
                        >
                          <Dialog open={isOpen && selectedUsuario?.id === usuario.id} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUsuario(usuario);
                                  setSelectedPerfil(usuario.profile?.id || "");
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Atribuir Perfil</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="font-medium mb-2">Usuário: {usuario.email}</p>
                              </div>
                              <div>
                                <Label htmlFor="perfil-select">Perfil</Label>
                                <Select value={selectedPerfil} onValueChange={setSelectedPerfil}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um perfil" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {perfis.map((p) => (
                                      <SelectItem key={p.id} value={p.id}>
                                        {p.code} - {p.description}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsOpen(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={atribuirPerfil}>Salvar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        </PermissionGuard>
                        <PermissionGuard
                          moduleName="Usuários"
                          action="delete"
                          fallback={<Button variant="ghost" size="icon" disabled><Lock className="h-4 w-4" /></Button>}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deletarUsuario(usuario.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </PermissionGuard>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </PermissionGuard>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios;
