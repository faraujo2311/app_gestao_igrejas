import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCells } from "@/hooks/useCells";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

interface Cell {
  id: string;
  name: string;
  host: string | null;
  leader_id: string | null;
  vice_leader_id: string | null;
  day_of_week: string | null;
  time: string | null;
  address: string | null;
  status: boolean;
  leader?: { full_name: string };
  vice_leader?: { full_name: string };
  memberCount?: number;
}

interface FormData {
  name: string;
  host: string;
  leader_id: string;
  vice_leader_id: string;
  day_of_week: string;
  time: string;
  address: string;
  status: boolean;
  members: string[];
}

const DAYS_OF_WEEK = [
  { value: "segunda-feira", label: "Segunda-feira" },
  { value: "terca-feira", label: "Terça-feira" },
  { value: "quarta-feira", label: "Quarta-feira" },
  { value: "quinta-feira", label: "Quinta-feira" },
  { value: "sexta-feira", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

export const Cells = () => {
  const { cells, members, loading, loadCells, getCellMembers } = useCells();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    host: "",
    leader_id: "null",
    vice_leader_id: "null",
    day_of_week: "",
    time: "",
    address: "",
    status: true,
    members: [],
  });

  // Memoizar células filtradas
  const filteredCells = useMemo(
    () =>
      cells.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [cells, searchTerm]
  );

  const handleOpenDialog = async (cell?: Cell) => {
    if (cell) {
      setEditingCell(cell);
      const cellMembers = await getCellMembers(cell.id);
      setFormData({
        name: cell.name,
        host: cell.host || "",
        leader_id: cell.leader_id ? cell.leader_id : "null",
        vice_leader_id: cell.vice_leader_id ? cell.vice_leader_id : "null",
        day_of_week: cell.day_of_week || "",
        time: cell.time || "",
        address: cell.address || "",
        status: cell.status,
        members: cellMembers,
      });
    } else {
      setEditingCell(null);
      setFormData({
        name: "",
        host: "",
        leader_id: "null",
        vice_leader_id: "null",
        day_of_week: "",
        time: "",
        address: "",
        status: true,
        members: [],
      });
    }
    setIsOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Nome da célula é obrigatório");
        return;
      }

      const supabaseAny = supabase as any;
      const leader_id =
        formData.leader_id === "null" ? null : formData.leader_id;
      const vice_leader_id =
        formData.vice_leader_id === "null" ? null : formData.vice_leader_id;

      if (editingCell) {
        // Atualizar célula
        const { error } = await supabaseAny
          .from("cells")
          .update({
            name: formData.name,
            host: formData.host || null,
            leader_id,
            vice_leader_id,
            day_of_week: formData.day_of_week || null,
            time: formData.time || null,
            address: formData.address || null,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCell.id);

        if (error) throw error;

        // Atualizar membros
        // Deletar associações antigas
        await supabaseAny
          .from("cell_members")
          .delete()
          .eq("cell_id", editingCell.id);

        // Inserir novas associações
        if (formData.members.length > 0) {
          const cellMembersData = formData.members.map((memberId) => ({
            cell_id: editingCell.id,
            member_id: memberId,
          }));

          const { error: memberError } = await supabaseAny
            .from("cell_members")
            .insert(cellMembersData);

          if (memberError) throw memberError;
        }
      } else {
        // Criar nova célula
        const { data: newCell, error } = await supabaseAny
          .from("cells")
          .insert([
            {
              name: formData.name,
              host: formData.host || null,
              leader_id,
              vice_leader_id,
              day_of_week: formData.day_of_week || null,
              time: formData.time || null,
              address: formData.address || null,
              status: formData.status,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // Inserir membros
        if (formData.members.length > 0 && newCell) {
          const cellMembersData = formData.members.map((memberId) => ({
            cell_id: newCell.id,
            member_id: memberId,
          }));

          const { error: memberError } = await supabaseAny
            .from("cell_members")
            .insert(cellMembersData);

          if (memberError) throw memberError;
        }
      }

      toast.success(
        editingCell
          ? "Célula atualizada com sucesso"
          : "Célula criada com sucesso"
      );
      setIsOpen(false);
      await loadCells();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar célula");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar esta célula?")) return;

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from("cells").delete().eq("id", id);

      if (error) throw error;
      toast.success("Célula deletada com sucesso");
      await loadCells();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar célula");
    }
  };

  const toggleMember = (memberId: string) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.includes(memberId)
        ? prev.members.filter((id) => id !== memberId)
        : [...prev.members, memberId],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Células</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as células (pequenos grupos) da sua igreja
          </p>
        </div>
        <PermissionGuard
          moduleName="Células"
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
            Adicionar Célula
          </Button>
        </PermissionGuard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">Lista de Células</h2>
          <Input
            placeholder="Buscar células..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <PermissionGuard moduleName="Células" action="read">
          {loading ? (
            <div className="text-center py-12">Carregando células...</div>
          ) : filteredCells.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhuma célula encontrada
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCells.map((cell) => (
                <Card key={cell.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Cabeçalho do card */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground">
                            {cell.name}
                          </h3>
                          {cell.leader && (
                            <p className="text-sm text-muted-foreground">
                              Líder: <span className="text-foreground font-medium">{cell.leader.full_name}</span>
                            </p>
                          )}
                        </div>
                        <Badge variant={cell.status ? "default" : "secondary"}>
                          {cell.status ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>

                      {/* Informações */}
                      <div className="space-y-1 text-sm">
                        {cell.day_of_week && (
                          <p className="text-muted-foreground">
                            Dia: <span className="text-foreground font-medium capitalize">{cell.day_of_week}</span>
                            {cell.time && `, ${cell.time}`}
                          </p>
                        )}
                        {cell.address && (
                          <p className="text-muted-foreground">
                            Local: <span className="text-foreground font-medium">{cell.address}</span>
                          </p>
                        )}
                        {cell.memberCount !== undefined && (
                          <p className="text-muted-foreground">
                            Membros: <span className="text-foreground font-medium">{cell.memberCount}</span>
                          </p>
                        )}
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 pt-2 border-t">
                        <PermissionGuard
                          moduleName="Células"
                          action="update"
                          fallback={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="flex-1"
                              title="Sem permissão"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleOpenDialog(cell)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </PermissionGuard>
                        <PermissionGuard
                          moduleName="Células"
                          action="delete"
                          fallback={
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled
                              className="flex-1"
                              title="Sem permissão"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar
                            </Button>
                          }
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(cell.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </Button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </PermissionGuard>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCell ? "Editar Célula" : "Adicionar Célula"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Primeira linha: Nome e Anfitrião */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome da Célula</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="ex: Célula dos Jovens"
                />
              </div>
              <div>
                <Label htmlFor="host">Anfitrião</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) =>
                    setFormData({ ...formData, host: e.target.value })
                  }
                  placeholder="Local onde ocorre a célula"
                />
              </div>
            </div>

            {/* Segunda linha: Líder e Vice-líder */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leader">Líder</Label>
                <Select
                  value={formData.leader_id}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      leader_id: value === "null" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um líder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sem líder</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vice-leader">Vice-líder</Label>
                <Select
                  value={formData.vice_leader_id}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      vice_leader_id: value === "null" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um vice-líder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Sem vice-líder</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Terceira linha: Dia da Semana e Horário */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="day">Dia da Semana</Label>
                <Select
                  value={formData.day_of_week}
                  onValueChange={(value) =>
                    setFormData({ ...formData, day_of_week: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Endereço */}
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Endereço onde a célula se reúne"
                rows={2}
              />
            </div>

            {/* Membros - Multi-select */}
            <div>
              <Label>Membros</Label>
              <div className="border rounded-md p-4 max-h-48 overflow-y-auto space-y-2">
                {members.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    Nenhum membro disponível
                  </p>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`member-${member.id}`}
                        checked={formData.members.includes(member.id)}
                        onCheckedChange={() => toggleMember(member.id)}
                      />
                      <label
                        htmlFor={`member-${member.id}`}
                        className="text-sm cursor-pointer"
                      >
                        {member.full_name}
                      </label>
                    </div>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {formData.members.length} membro(s) selecionado(s)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingCell ? "Atualizar" : "Criar"} Célula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cells;
