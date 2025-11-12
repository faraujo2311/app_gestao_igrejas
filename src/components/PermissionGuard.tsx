import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PermissionGuardProps {
  moduleName: string;
  action: "read" | "create" | "update" | "delete" | "report";
  children: ReactNode;
  fallback?: ReactNode;
  allowSuperAdmin?: boolean;
}

export function PermissionGuard({
  moduleName,
  action,
  children,
  fallback,
  allowSuperAdmin = true,
}: PermissionGuardProps) {
  const permissions = usePermissions(moduleName);

  if (permissions.loading) {
    return <div className="text-muted-foreground">Verificando permissões...</div>;
  }

  // Super admin tem permissão em tudo
  if (allowSuperAdmin && permissions.isSuperAdmin) {
    return <>{children}</>;
  }

  // Verifica permissão específica
  const hasPermission = permissions[action];

  if (!hasPermission) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para {action === "report" ? "gerar relatórios" : action} neste módulo.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}
