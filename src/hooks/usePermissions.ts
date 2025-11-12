import { useEffect, useState, useMemo } from "react";
import {
  canRead,
  canCreate,
  canUpdate,
  canDelete,
  canReport,
  isSuperAdmin,
} from "@/lib/permissions";

interface PermissionsState {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  report: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
}

// Cache global de permissões para evitar queries repetidas
const permissionsCache = new Map<string, PermissionsState>();
let globalPermissionsPromise: Promise<{
  isSuperAdmin: boolean;
}> | null = null;

export function usePermissions(moduleName: string): PermissionsState {
  const [permissions, setPermissions] = useState<PermissionsState>(() => {
    // Inicializa com cache se disponível
    return (
      permissionsCache.get(moduleName) || {
        read: false,
        create: false,
        update: false,
        delete: false,
        report: false,
        isSuperAdmin: false,
        loading: true,
      }
    );
  });

  useEffect(() => {
    // Se já temos no cache e não está loading, não fazer nada
    if (
      permissionsCache.has(moduleName) &&
      !permissionsCache.get(moduleName)?.loading
    ) {
      setPermissions(permissionsCache.get(moduleName)!);
      return;
    }

    const loadPermissions = async () => {
      try {
        // Usar cache global para isSuperAdmin (compartilhado entre todos os módulos)
        if (!globalPermissionsPromise) {
          globalPermissionsPromise = (async () => {
            const isAdmin = await isSuperAdmin();
            return { isSuperAdmin: isAdmin };
          })();
        }

        const globalPerms = await globalPermissionsPromise;

        // Carregar permissões específicas do módulo em paralelo
        const [readPerm, createPerm, updatePerm, deletePerm, reportPerm] =
          await Promise.all([
            canRead(moduleName),
            canCreate(moduleName),
            canUpdate(moduleName),
            canDelete(moduleName),
            canReport(moduleName),
          ]);

        const newPermissions: PermissionsState = {
          read: readPerm,
          create: createPerm,
          update: updatePerm,
          delete: deletePerm,
          report: reportPerm,
          isSuperAdmin: globalPerms.isSuperAdmin,
          loading: false,
        };

        // Armazenar no cache
        permissionsCache.set(moduleName, newPermissions);
        setPermissions(newPermissions);
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        setPermissions((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    };

    loadPermissions();
  }, [moduleName]);

  return permissions;
}
