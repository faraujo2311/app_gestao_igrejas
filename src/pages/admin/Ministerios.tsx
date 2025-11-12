import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMinistries } from "@/hooks/useMinistries";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

interface Ministry {
  id: string;
  name: string;
  description: string | null;
  responsible_user_id: string | null;
  observations: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  memberCount?: number;
}

const Ministerios = () => {
  const { ministerios, members, loading, loadMinisterios } = useMinistries();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    responsible_user_id: "",
    observations: "",
    status: true,
  });
  const [searchTerm, setSearchTerm] = useState("");

  // Memoizar ministérios filtrados para evitar recálculo desnecessário
  const ministerioDsFiltrados = useMemo(
    () =>
      ministerios.filter((m) =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [ministerios, searchTerm]
  );

  const handleOpenDialog = (ministry?: Ministry) => {
    if (ministry) {
      setEditingMinistry(ministry);
      setFormData({
        name: ministry.name,
        description: ministry.description || "",
        responsible_user_id: ministry.responsible_user_id
          ? ministry.responsible_user_id
          : "null",
        observations: ministry.observations || "",
        status: ministry.status,
      });
    } else {
      setEditingMinistry(null);
      setFormData({
        name: "",
        description: "",
        responsible_user_id: "null",
        observations: "",
        status: true,
      });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        toast.error("Preencha o nome do ministério");
        return;
      }

      // Converter "null" string para NULL no banco
      const responsibleId = formData.responsible_user_id === "null" ? null : formData.responsible_user_id;

      if (editingMinistry) {
        const supabaseAny = supabase as any;
        const { error } = await supabaseAny
          .from("ministries")
          .update({
            name: formData.name,
            description: formData.description,
            responsible_user_id: responsibleId,
            observations: formData.observations,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMinistry.id);

        if (error) throw error;
      } else {
        const supabaseAny = supabase as any;
        const { error } = await supabaseAny.from("ministries").insert([
          {
            name: formData.name,
            description: formData.description,
            responsible_user_id: responsibleId,
            observations: formData.observations,
            status: formData.status,
          },
        ]);

        if (error) throw error;
      }

      toast.success(
        editingMinistry
          ? "Ministério atualizado com sucesso"
          : "Ministério criado com sucesso"
      );
      setIsOpen(false);
      loadMinisterios();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar ministério");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este ministério?")) return;

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from("ministries").delete().eq("id", id);

      if (error) throw error;
      toast.success("Ministério deletado com sucesso");
      await loadMinisterios();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar ministério");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ministérios</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os ministérios da igreja
          </p>
        </div>
        <PermissionGuard
          moduleName="Ministérios"
          action="create"
          fallback={
            <Button disabled className="gap-2 cursor-not-allowed">
              <Lock className="w-4 h-4" />
              Sem permissão
            </Button>
          }
        >
          <Button className="bg-primary hover:bg-primary/90" onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Ministério
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Ministérios</CardTitle>
            <Input
              placeholder="Buscar ministérios..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <PermissionGuard moduleName="Ministérios" action="read">
            {loading ? (
              <div className="text-center py-8">Carregando ministérios...</div>
            ) : ministerioDsFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum ministério encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead>Membros</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ministerioDsFiltrados.map((ministerio) => {
                    const responsibleMember = ministerio.responsible_user_id
                      ? members.find((m) => m.id === ministerio.responsible_user_id)
                      : null;
                    return (
                    <TableRow key={ministerio.id}>
                      <TableCell className="font-medium">{ministerio.name}</TableCell>
                      <TableCell>
                        {responsibleMember ? responsibleMember.full_name : "Sem responsável"}
                      </TableCell>
                      <TableCell>{ministerio.memberCount || 0}</TableCell>
                      <TableCell>
                        <Badge variant={ministerio.status ? "default" : "secondary"}>
                          {ministerio.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <PermissionGuard
                            moduleName="Ministérios"
                            action="update"
                            fallback={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                title="Sem permissão"
                              >
                                <Pencil className="h-4 w-4 text-gray-400" />
                              </Button>
                            }
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(ministerio)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard
                            moduleName="Ministérios"
                            action="delete"
                            fallback={
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                title="Sem permissão"
                              >
                                <Trash2 className="h-4 w-4 text-gray-400" />
                              </Button>
                            }
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(ministerio.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                  })}
                </TableBody>
              </Table>
            )}
          </PermissionGuard>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMinistry ? "Editar Ministério" : "Novo Ministério"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Ministério</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Louvor, Infantil, etc"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descrição do ministério"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="responsible">Responsável</Label>
              <Select
                value={formData.responsible_user_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, responsible_user_id: value === "null" ? "" : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um membro responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Sem responsável</SelectItem>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) =>
                  setFormData({ ...formData, observations: e.target.value })
                }
                placeholder="Observações adicionais"
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(status) =>
                  setFormData({ ...formData, status })
                }
              />
              <Label htmlFor="status" className="cursor-pointer">
                Ministério Ativo
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingMinistry ? "Atualizar" : "Criar"} Ministério
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Ministerios;
