import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useMembers } from "@/hooks/useMembers";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

interface Ministry {
  id: string;
  name: string;
}

interface Member {
  id: string;
  full_name: string;
  birth_date: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  marital_status: string | null;
  baptism_date: string | null;
  ministry_id: string;
  ministry?: { name: string };
  is_tithe_payer: boolean;
  has_children: boolean;
  mother_name: string | null;
  observations: string | null;
  status: boolean;
}

interface FormData {
  full_name: string;
  birth_date: string;
  phone: string;
  email: string;
  address: string;
  marital_status: string;
  baptism_date: string;
  ministry_id: string;
  is_tithe_payer: boolean;
  has_children: boolean;
  mother_name: string;
  observations: string;
  status: boolean;
}

const MARITAL_STATUSES = [
  { value: "single", label: "Solteiro(a)" },
  { value: "married", label: "Casado(a)" },
  { value: "divorced", label: "Divorciado(a)" },
  { value: "widowed", label: "Viúvo(a)" },
];

export const Members = () => {
  const { members, ministries, loading, loadMembers, loadMinistries } =
    useMembers();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    birth_date: "",
    phone: "",
    email: "",
    address: "",
    marital_status: "",
    baptism_date: "",
    ministry_id: "",
    is_tithe_payer: false,
    has_children: false,
    mother_name: "",
    observations: "",
    status: true,
  });

  // Memoizar membros filtrados para evitar recálculo desnecessário
  const filteredMembers = useMemo(
    () =>
      members.filter((member) =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm, members]
  );

  const handleOpenDialog = (member?: Member) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        full_name: member.full_name,
        birth_date: member.birth_date || "",
        phone: member.phone || "",
        email: member.email || "",
        address: member.address || "",
        marital_status: member.marital_status || "",
        baptism_date: member.baptism_date || "",
        ministry_id: member.ministry_id,
        is_tithe_payer: member.is_tithe_payer,
        has_children: member.has_children,
        mother_name: member.mother_name || "",
        observations: member.observations || "",
        status: member.status,
      });
    } else {
      setEditingMember(null);
      setFormData({
        full_name: "",
        birth_date: "",
        phone: "",
        email: "",
        address: "",
        marital_status: "",
        baptism_date: "",
        ministry_id: "",
        is_tithe_payer: false,
        has_children: false,
        mother_name: "",
        observations: "",
        status: true,
      });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.full_name.trim()) {
        toast.error("Nome completo é obrigatório");
        return;
      }

      if (!formData.ministry_id) {
        toast.error("Ministério é obrigatório");
        return;
      }

      const supabaseAny = supabase as any;

      if (editingMember) {
        const { error } = await supabaseAny
          .from("members")
          .update({
            full_name: formData.full_name,
            birth_date: formData.birth_date || null,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            marital_status: formData.marital_status || null,
            baptism_date: formData.baptism_date || null,
            ministry_id: formData.ministry_id,
            is_tithe_payer: formData.is_tithe_payer,
            has_children: formData.has_children,
            mother_name: formData.mother_name || null,
            observations: formData.observations || null,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingMember.id);

        if (error) throw error;
      } else {
        const { error } = await supabaseAny.from("members").insert([
          {
            full_name: formData.full_name,
            birth_date: formData.birth_date || null,
            phone: formData.phone || null,
            email: formData.email || null,
            address: formData.address || null,
            marital_status: formData.marital_status || null,
            baptism_date: formData.baptism_date || null,
            ministry_id: formData.ministry_id,
            is_tithe_payer: formData.is_tithe_payer,
            has_children: formData.has_children,
            mother_name: formData.mother_name || null,
            observations: formData.observations || null,
            status: formData.status,
          },
        ]);

        if (error) throw error;
      }

      toast.success(
        editingMember
          ? "Membro atualizado com sucesso"
          : "Membro adicionado com sucesso"
      );
      setIsOpen(false);
      await loadMembers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar membro");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este membro?")) return;

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from("members").delete().eq("id", id);

      if (error) throw error;

      toast.success("Membro excluído com sucesso");
      await loadMembers();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir membro");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Membros</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os membros da sua igreja
          </p>
        </div>
        <PermissionGuard
          moduleName="Membros"
          action="create"
          fallback={
            <Button disabled className="gap-2 cursor-not-allowed">
              <Lock className="w-4 h-4" />
              Sem permissão
            </Button>
          }
        >
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Membro
          </Button>
        </PermissionGuard>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Membros</CardTitle>
            <Input
              placeholder="Buscar membros..."
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <PermissionGuard moduleName="Membros" action="read">
            {loading ? (
              <div className="text-center py-8">Carregando membros...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum membro encontrado
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ministério</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.full_name}
                      </TableCell>
                      <TableCell>
                        {member.ministry?.name || "—"}
                      </TableCell>
                      <TableCell>{member.email || "—"}</TableCell>
                      <TableCell>{member.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge
                          variant={member.status ? "default" : "secondary"}
                        >
                          {member.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <PermissionGuard
                            moduleName="Membros"
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
                              onClick={() => handleOpenDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard
                            moduleName="Membros"
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
                              onClick={() => handleDelete(member.id)}
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

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMember ? "Editar Membro" : "Adicionar Membro"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Linha 1: Nome e Data de Nascimento */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Nome completo do membro"
                />
              </div>
              <div>
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) =>
                    setFormData({ ...formData, birth_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Linha 2: Telefone e Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            {/* Linha 3: Endereço */}
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Endereço completo"
              />
            </div>

            {/* Linha 4: Estado Civil e Data de Batismo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="marital_status">Estado Civil</Label>
                <Select
                  value={formData.marital_status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, marital_status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARITAL_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="baptism_date">Data de Batismo</Label>
                <Input
                  id="baptism_date"
                  type="date"
                  value={formData.baptism_date}
                  onChange={(e) =>
                    setFormData({ ...formData, baptism_date: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Linha 5: Ministério e Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ministry">Ministério</Label>
                <Select
                  value={formData.ministry_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, ministry_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um ministério" />
                  </SelectTrigger>
                  <SelectContent>
                    {ministries.map((ministry) => (
                      <SelectItem key={ministry.id} value={ministry.id}>
                        {ministry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status ? "ativo" : "inativo"}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value === "ativo",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Linha 6: Checkboxes - Dizimista e Possui filhos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_tithe_payer"
                  checked={formData.is_tithe_payer}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_tithe_payer: checked as boolean })
                  }
                />
                <Label htmlFor="is_tithe_payer" className="cursor-pointer">
                  Dizimista
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has_children"
                  checked={formData.has_children}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      has_children: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="has_children" className="cursor-pointer">
                  Possui filhos
                </Label>
              </div>
            </div>

            {/* Linha 7: Nome da mãe */}
            <div>
              <Label htmlFor="mother_name">Nome da mãe</Label>
              <Input
                id="mother_name"
                value={formData.mother_name}
                onChange={(e) =>
                  setFormData({ ...formData, mother_name: e.target.value })
                }
                placeholder="Nome da mãe"
              />
            </div>

            {/* Linha 8: Observações */}
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingMember ? "Atualizar" : "Adicionar"} Membro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Members;
