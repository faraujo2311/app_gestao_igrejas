import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEvents } from "@/hooks/useEvents";
import { PermissionGuard } from "@/components/PermissionGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  Users,
  Share2,
  Mail,
  Copy,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { format, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  event_type: string | null;
  status: string;
  responsible_id: string | null;
  is_public: boolean;
  responsible?: { full_name: string };
  attendance_count?: number;
}

interface FormData {
  name: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  event_type: string;
  status: string;
  responsible_id: string;
  is_public: boolean;
}

const EVENT_TYPES = [
  { value: "Culto", label: "Culto" },
  { value: "Reunião", label: "Reunião" },
  { value: "Treinamento", label: "Treinamento" },
  { value: "Especial", label: "Especial" },
  { value: "Social", label: "Social" },
  { value: "Outro", label: "Outro" },
];

const STATUS_OPTIONS = [
  { value: "Planejado", label: "Planejado" },
  { value: "Realizado", label: "Realizado" },
  { value: "Cancelado", label: "Cancelado" },
];

export const Events = () => {
  const { events, members, loading, loadEvents, getEventAttendance } =
    useEvents();
  const [isOpen, setIsOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAttendance, setShowAttendance] = useState(false);
  const [attendanceEvent, setAttendanceEvent] = useState<Event | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    event_date: "",
    event_time: "",
    location: "",
    event_type: "Culto",
    status: "Planejado",
    responsible_id: "null",
    is_public: false,
  });

  // Separar eventos futuros e passados
  const today = new Date().toISOString().split("T")[0];

  const upcomingEvents = useMemo(
    () =>
      events
        .filter((e) => {
          const eventDate = new Date(e.event_date);
          const todayDate = new Date(today);
          return isBefore(todayDate, eventDate);
        })
        .filter((e) =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [events, searchTerm]
  );

  const pastEvents = useMemo(
    () =>
      events
        .filter((e) => {
          const eventDate = new Date(e.event_date);
          const todayDate = new Date(today);
          return !isBefore(todayDate, eventDate);
        })
        .filter((e) =>
          e.name.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    [events, searchTerm]
  );

  const handleOpenDialog = async (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        name: event.name,
        description: event.description || "",
        event_date: event.event_date,
        event_time: event.event_time || "",
        location: event.location || "",
        event_type: event.event_type || "Culto",
        status: event.status,
        responsible_id: event.responsible_id ? event.responsible_id : "null",
        is_public: event.is_public,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        name: "",
        description: "",
        event_date: "",
        event_time: "",
        location: "",
        event_type: "Culto",
        status: "Planejado",
        responsible_id: "null",
        is_public: false,
      });
    }
    setIsOpen(true);
  };

  const handleOpenAttendance = async (event: Event) => {
    setAttendanceEvent(event);
    const attendees = await getEventAttendance(event.id);
    setSelectedAttendees(attendees);
    setShowAttendance(true);
  };

  const handleSaveAttendance = async () => {
    if (!attendanceEvent) return;

    try {
      const supabaseAny = supabase as any;

      // Deletar todas as presenças antigas
      await supabaseAny
        .from("event_attendance")
        .delete()
        .eq("event_id", attendanceEvent.id);

      // Inserir novas presenças
      if (selectedAttendees.length > 0) {
        const attendanceData = selectedAttendees.map((memberId) => ({
          event_id: attendanceEvent.id,
          member_id: memberId,
          attended: true,
          checked_in_at: new Date().toISOString(),
        }));

        const { error } = await supabaseAny
          .from("event_attendance")
          .insert(attendanceData);

        if (error) throw error;
      }

      toast.success("Lista de presença atualizada com sucesso");
      setShowAttendance(false);
      await loadEvents();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar presença");
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Nome do evento é obrigatório");
        return;
      }

      if (!formData.event_date) {
        toast.error("Data do evento é obrigatória");
        return;
      }

      const supabaseAny = supabase as any;
      const responsible_id =
        formData.responsible_id === "null" ? null : formData.responsible_id;

      if (editingEvent) {
        const { error } = await supabaseAny
          .from("events")
          .update({
            name: formData.name,
            description: formData.description || null,
            event_date: formData.event_date,
            event_time: formData.event_time || null,
            location: formData.location || null,
            event_type: formData.event_type,
            status: formData.status,
            responsible_id,
            is_public: formData.is_public,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast.success("Evento atualizado com sucesso");
      } else {
        const { error } = await supabaseAny.from("events").insert([
          {
            name: formData.name,
            description: formData.description || null,
            event_date: formData.event_date,
            event_time: formData.event_time || null,
            location: formData.location || null,
            event_type: formData.event_type,
            status: formData.status,
            responsible_id,
            is_public: formData.is_public,
          },
        ]);

        if (error) throw error;
        toast.success("Evento criado com sucesso");
      }

      setIsOpen(false);
      await loadEvents();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar evento");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) return;

    try {
      const supabaseAny = supabase as any;
      const { error } = await supabaseAny.from("events").delete().eq("id", id);

      if (error) throw error;
      toast.success("Evento deletado com sucesso");
      await loadEvents();
    } catch (error: any) {
      toast.error(error.message || "Erro ao deletar evento");
    }
  };

  const handleCopyEventInfo = (event: Event) => {
    const eventInfo = `
${event.name}
${format(parseISO(event.event_date), "dd 'de' MMMM 'de' yyyy", {
  locale: ptBR,
})} às ${event.event_time || "--:--"}
Local: ${event.location || "A definir"}
Tipo: ${event.event_type || "Sem tipo"}
    `.trim();

    navigator.clipboard.writeText(eventInfo);
    toast.success("Informações do evento copiadas!");
  };

  const handleAddToCalendar = (event: Event) => {
    const startDate = `${event.event_date.replace(/-/g, "")}T${(event.event_time || "00:00").replace(/:/g, "")}00`;
    const endDate = `${event.event_date.replace(/-/g, "")}T${((event.event_time?.split(":")[0] || "00") + "0000").padEnd(8, "0")}00`;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      event.name
    )}&dates=${startDate}/${endDate}&location=${encodeURIComponent(
      event.location || ""
    )}&details=${encodeURIComponent(event.description || "")}`;

    window.open(googleCalendarUrl, "_blank");
    toast.success("Abrindo Google Calendar...");
  };

  const handleShareEvent = (event: Event) => {
    const shareText = `${event.name} - ${format(
      parseISO(event.event_date),
      "dd/MM/yyyy HH:mm"
    )}`;

    if (navigator.share) {
      navigator.share({
        title: "Evento",
        text: shareText,
        url: window.location.href,
      });
    } else {
      handleCopyEventInfo(event);
    }
  };

  const handleSendEmail = (event: Event) => {
    const subject = encodeURIComponent(`Convite: ${event.name}`);
    const body = encodeURIComponent(`
Olá,

Você está convidado para:

${event.name}
Data: ${format(parseISO(event.event_date), "dd 'de' MMMM 'de' yyyy", {
      locale: ptBR,
    })}
Hora: ${event.event_time || "Horário a confirmar"}
Local: ${event.location || "Local a confirmar"}

${event.description || ""}
    `.trim());

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const EventCard = ({ event }: { event: Event }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="space-y-3">
          {/* Cabeçalho */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-foreground">
                {event.name}
              </h3>
              <Badge
                variant={
                  event.status === "Realizado"
                    ? "secondary"
                    : event.status === "Cancelado"
                      ? "destructive"
                      : "default"
                }
                className="mt-1"
              >
                {event.status}
              </Badge>
            </div>
          </div>

          {/* Informações */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              {format(parseISO(event.event_date), "dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
              {event.event_time && ` às ${event.event_time}`}
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            )}

            {event.event_type && (
              <p className="text-muted-foreground">
                Tipo: <span className="text-foreground font-medium">{event.event_type}</span>
              </p>
            )}

            {event.responsible?.full_name && (
              <p className="text-muted-foreground">
                Responsável:{" "}
                <span className="text-foreground font-medium">
                  {event.responsible.full_name}
                </span>
              </p>
            )}

            {event.description && (
              <p className="text-muted-foreground italic mt-2">
                {event.description}
              </p>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <PermissionGuard
              moduleName="Eventos"
              action="update"
              fallback={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  title="Sem permissão"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              }
            >
              <Button
                variant="ghost"
                size="sm"
                title="Editar evento"
                onClick={() => handleOpenDialog(event)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </PermissionGuard>

            <PermissionGuard
              moduleName="Eventos"
              action="delete"
              fallback={
                <Button
                  variant="ghost"
                  size="sm"
                  disabled
                  title="Sem permissão"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
            >
              <Button
                variant="ghost"
                size="sm"
                title="Deletar evento"
                onClick={() => handleDelete(event.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </PermissionGuard>

            <Button
              variant="ghost"
              size="sm"
              title="Lista de presença"
              onClick={() => handleOpenAttendance(event)}
            >
              <Users className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Compartilhar"
              onClick={() => handleShareEvent(event)}
            >
              <Share2 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Enviar email"
              onClick={() => handleSendEmail(event)}
            >
              <Mail className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Copiar informações"
              onClick={() => handleCopyEventInfo(event)}
            >
              <Copy className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              title="Adicionar à agenda"
              onClick={() => handleAddToCalendar(event)}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>

          {/* Contagem de presença */}
          {event.attendance_count !== undefined && event.attendance_count > 0 && (
            <div className="text-xs text-muted-foreground pt-1 border-t">
              {event.attendance_count} presença(s) registrada(s)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Eventos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os eventos e atividades da sua igreja
          </p>
        </div>
        <PermissionGuard
          moduleName="Eventos"
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
            Adicionar Evento
          </Button>
        </PermissionGuard>
      </div>

      {/* Busca */}
      <Input
        placeholder="Buscar eventos por nome..."
        className="w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Próximos Eventos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Próximos Eventos
        </h2>
        <PermissionGuard moduleName="Eventos" action="read">
          {loading ? (
            <div className="text-center py-12">Carregando eventos...</div>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum evento futuro agendado.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </PermissionGuard>
      </div>

      {/* Eventos Passados */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">
          Eventos Passados
        </h2>
        <PermissionGuard moduleName="Eventos" action="read">
          {loading ? (
            <div className="text-center py-12">Carregando eventos...</div>
          ) : pastEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum evento passado.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </PermissionGuard>
      </div>

      {/* Dialog de Formulário */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Editar Evento" : "Adicionar Evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome do Evento</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ex: Culto de Celebração"
              />
            </div>

            {/* Data e Hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) =>
                    setFormData({ ...formData, event_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Hora</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.event_time}
                  onChange={(e) =>
                    setFormData({ ...formData, event_time: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Local */}
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="ex: Salão de Eventos"
              />
            </div>

            {/* Tipo e Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo de Evento</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, event_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Responsável */}
            <div>
              <Label htmlFor="responsible">Responsável</Label>
              <Select
                value={formData.responsible_id}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    responsible_id: value === "null" ? "" : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um responsável" />
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

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detalhes sobre o evento"
                rows={3}
              />
            </div>

            {/* Público */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="public"
                checked={formData.is_public}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_public: checked as boolean })
                }
              />
              <Label htmlFor="public" className="cursor-pointer">
                Evento Público (aparece no site)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingEvent ? "Atualizar" : "Criar"} Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Presença */}
      <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Lista de Presença - {attendanceEvent?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhum membro disponível
              </p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={selectedAttendees.includes(member.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAttendees([...selectedAttendees, member.id]);
                      } else {
                        setSelectedAttendees(
                          selectedAttendees.filter((id) => id !== member.id)
                        );
                      }
                    }}
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

          <p className="text-xs text-muted-foreground">
            {selectedAttendees.length} membro(s) selecionado(s)
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendance(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAttendance}>Salvar Presença</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
