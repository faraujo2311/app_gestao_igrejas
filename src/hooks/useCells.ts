import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  created_at: string;
  updated_at: string;
  leader?: { full_name: string };
  vice_leader?: { full_name: string };
  memberCount?: number;
}

interface Member {
  id: string;
  full_name: string;
  status: boolean;
}

interface UseCellsReturn {
  cells: Cell[];
  members: Member[];
  loading: boolean;
  loadCells: () => Promise<void>;
  loadMembers: () => Promise<void>;
  getCellMembers: (cellId: string) => Promise<string[]>;
  isInitialized: boolean;
}

/**
 * Hook para gerenciar dados de células com caching e otimização
 */
export const useCells = (): UseCellsReturn => {
  const [cells, setCells] = useState<Cell[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar dados apenas uma vez
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        setLoading(true);
        try {
          // Executar ambas as queries em paralelo
          await Promise.all([loadCells(), loadMembers()]);
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

  const loadCells = useCallback(async () => {
    try {
      const supabaseAny = supabase as any;
      const { data, error } = await supabaseAny
        .from("cells")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      // Buscar nomes de líderes e vice-líderes separadamente
      const cellsWithLeaders = await Promise.all(
        (data || []).map(async (cell: Cell) => {
          let leader = null;
          let vice_leader = null;
          let memberCount = 0;

          if (cell.leader_id) {
            const { data: leaderData } = await supabaseAny
              .from("members")
              .select("full_name")
              .eq("id", cell.leader_id)
              .single();
            leader = leaderData || { full_name: "—" };
          }

          if (cell.vice_leader_id) {
            const { data: viceLeaderData } = await supabaseAny
              .from("members")
              .select("full_name")
              .eq("id", cell.vice_leader_id)
              .single();
            vice_leader = viceLeaderData || { full_name: "—" };
          }

          // Contar membros da célula
          const { count } = await supabaseAny
            .from("cell_members")
            .select("id", { count: "exact", head: true })
            .eq("cell_id", cell.id);

          return {
            ...cell,
            leader: leader,
            vice_leader: vice_leader,
            memberCount: count || 0,
          };
        })
      );

      setCells(cellsWithLeaders);
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar células");
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
    } catch (error: any) {
      toast.error(error.message || "Erro ao carregar membros");
    }
  }, []);

  const getCellMembers = useCallback(
    async (cellId: string): Promise<string[]> => {
      try {
        const supabaseAny = supabase as any;
        const { data, error } = await supabaseAny
          .from("cell_members")
          .select("member_id")
          .eq("cell_id", cellId);

        if (error) throw error;
        return data?.map((cm: any) => cm.member_id) || [];
      } catch (error: any) {
        toast.error("Erro ao carregar membros da célula");
        return [];
      }
    },
    []
  );

  return {
    cells,
    members,
    loading,
    loadCells,
    loadMembers,
    getCellMembers,
    isInitialized,
  };
};
