import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
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

interface UseMinisteriesReturn {
  ministerios: Ministry[];
  members: Array<{ id: string; full_name: string; status: boolean }>;
  loading: boolean;
  loadMinisterios: () => Promise<void>;
  loadMembers: () => Promise<void>;
  isInitialized: boolean;
}

/**
 * Hook para gerenciar dados de ministérios e membros com caching e otimização
 * Evita múltiplas queries ao abrir/fechar diálogos
 */
export const useMinistries = (): UseMinisteriesReturn => {
  const [ministerios, setMinisterios] = useState<Ministry[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar dados apenas uma vez
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        setLoading(true);
        try {
          // Executar ambas as queries em paralelo
          await Promise.all([loadMinisterios(), loadMembers()]);
          setIsInitialized(true);
        } catch (error) {
          console.error("Erro ao inicializar dados:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    initializeData();
  }, [isInitialized]);

  const loadMinisterios = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("ministries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setMinisterios([]);
        return;
      }

      // Otimização: usar agregação no banco em vez de contar por ministério
      // Se tiver acesso a uma view agregada, use. Senão, conte em paralelo
      const ministeriosWithCount = await Promise.all(
        data.map(async (ministry: any) => {
          const { count } = await supabaseAny
            .from("members")
            .select("id", { count: "exact", head: true })
            .eq("ministry_id", ministry.id)
            .eq("status", true);

          return {
            ...ministry,
            memberCount: count || 0,
          };
        })
      );

      setMinisterios(ministeriosWithCount);
    } catch (error) {
      console.error("Erro ao carregar ministérios:", error);
      toast.error("Erro ao carregar ministérios");
    }
  }, []);

  const loadMembers = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("members")
        .select("id, full_name, status")
        .eq("status", true)
        .order("full_name", { ascending: true });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      toast.error("Erro ao carregar membros");
    }
  }, []);

  return {
    ministerios,
    members,
    loading,
    loadMinisterios,
    loadMembers,
    isInitialized,
  };
};
