import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Outlet } from "react-router-dom";

export const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border bg-card flex items-center px-6 shadow-soft">
            <SidebarTrigger className="mr-4" />
            <h2 className="text-xl font-semibold text-foreground">Portal Administrativo</h2>
          </header>
          <main className="flex-1 p-8 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
