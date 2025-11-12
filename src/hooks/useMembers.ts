import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

interface Ministry {
  id: string;
  name: string;
}

interface UseMembersReturn {
  members: Member[];
  ministries: Ministry[];
  loading: boolean;
  loadMembers: () => Promise<void>;
  loadMinistries: () => Promise<void>;
  isInitialized: boolean;
}

/**
 * Hook para gerenciar dados de membros e ministérios com caching e otimização
 * Evita múltiplas queries ao abrir/fechar diálogos
 */
export const useMembers = (): UseMembersReturn => {
  const [members, setMembers] = useState<Member[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar dados apenas uma vez
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        setLoading(true);
        try {
          // Executar ambas as queries em paralelo
          await Promise.all([loadMembers(), loadMinistries()]);
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

  const loadMembers = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("members")
        .select("*")
        .order("full_name");

      if (error) throw error;

      // Buscar nomes dos ministérios separadamente para evitar ambigüidade
      const membersWithMinistry = await Promise.all(
        (data || []).map(async (member: Member) => {
          if (member.ministry_id) {
            const { data: ministry } = await supabaseAny
              .from("ministries")
              .select("name")
              .eq("id", member.ministry_id)
              .single();

            return {
              ...member,
              ministry: ministry || { name: "—" },
            };
          }
          return {
            ...member,
            ministry: { name: "—" },
          };
        })
      );

      setMembers(membersWithMinistry);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar membros");
    }
  }, []);

  const loadMinistries = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("ministries")
        .select("id, name")
        .eq("status", true)
        .order("name");

      if (error) throw error;
      setMinistries(data || []);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar ministérios");
    }
  }, []);

  return {
    members,
    ministries,
    loading,
    loadMembers,
    loadMinistries,
    isInitialized,
  };
};
