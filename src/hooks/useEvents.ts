import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Member {
  id: string;
  full_name: string;
}

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

interface UseEventsReturn {
  events: Event[];
  members: Member[];
  loading: boolean;
  loadEvents: () => Promise<void>;
  loadMembers: () => Promise<void>;
  getEventAttendance: (eventId: string) => Promise<string[]>;
  isInitialized: boolean;
}

let eventsCache: Event[] = [];
let membersCache: Member[] = [];
let isEventsInitialized = false;

export const useEvents = (): UseEventsReturn => {
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("events")
        .select(
          `
          *,
          responsible:responsible_id (full_name)
        `
        )
        .order("event_date", { ascending: false });

      if (error) throw error;

      // Carregar contagem de presença para cada evento
      const eventsWithAttendance = await Promise.all(
        (data || []).map(async (event: Event) => {
          const { count, error: countError } = await supabaseAny
            .from("event_attendance")
            .select("*", { count: "exact", head: true })
            .eq("event_id", event.id)
            .eq("attended", true);

          if (countError) throw countError;
          return { ...event, attendance_count: count || 0 };
        })
      );

      eventsCache = eventsWithAttendance;
      setEvents(eventsWithAttendance);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar eventos");
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("members")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name");

      if (error) throw error;
      membersCache = data || [];
      setMembers(data || []);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar membros");
    }
  }, []);

  const getEventAttendance = useCallback(
    async (eventId: string): Promise<string[]> => {
      try {
        const supabaseAny = supabase as any;
        const { data, error } = await supabaseAny
          .from("event_attendance")
          .select("member_id")
          .eq("event_id", eventId);

        if (error) throw error;
        return (data || []).map((item: any) => item.member_id);
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar presença do evento");
        return [];
      }
    },
    []
  );

  useEffect(() => {
    if (!isEventsInitialized) {
      isEventsInitialized = true;
      setLoading(true);

      Promise.all([loadEvents(), loadMembers()]).finally(() => {
        setLoading(false);
      });
    } else {
      setEvents(eventsCache);
      setMembers(membersCache);
      setLoading(false);
    }
  }, [loadEvents, loadMembers]);

  return {
    events,
    members,
    loading,
    loadEvents,
    loadMembers,
    getEventAttendance,
    isInitialized: isEventsInitialized,
  };
};
