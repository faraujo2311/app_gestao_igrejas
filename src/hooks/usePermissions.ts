import { useEffect, useState } from "react";
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

export function usePermissions(moduleName: string): PermissionsState {
  const [permissions, setPermissions] = useState<PermissionsState>({
    read: false,
    create: false,
    update: false,
    delete: false,
    report: false,
    isSuperAdmin: false,
    loading: true,
  });

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const [readPerm, createPerm, updatePerm, deletePerm, reportPerm, isAdmin] =
          await Promise.all([
            canRead(moduleName),
            canCreate(moduleName),
            canUpdate(moduleName),
            canDelete(moduleName),
            canReport(moduleName),
            isSuperAdmin(),
          ]);

        setPermissions({
          read: readPerm,
          create: createPerm,
          update: updatePerm,
          delete: deletePerm,
          report: reportPerm,
          isSuperAdmin: isAdmin,
          loading: false,
        });
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
