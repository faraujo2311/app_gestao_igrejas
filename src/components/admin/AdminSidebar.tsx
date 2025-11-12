import {
  LayoutDashboard,
  Users,
  Heart,
  MapPin,
  Calendar,
  UserCheck,
  DollarSign,
  Megaphone,
  Shield,
  UserCog,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Ministérios", url: "/admin/ministerios", icon: Heart },
  { title: "Membros", url: "/admin/membros", icon: Users },
  { title: "Células", url: "/admin/celulas", icon: MapPin },
  { title: "Eventos", url: "/admin/eventos", icon: Calendar },
  { title: "Voluntários", url: "/admin/voluntarios", icon: UserCheck },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign },
  { title: "Avisos", url: "/admin/avisos", icon: Megaphone },
  { title: "Perfis", url: "/admin/perfis", icon: Shield },
  { title: "Usuários", url: "/admin/usuarios", icon: UserCog },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
  { title: "Relatórios", url: "/admin/relatorios", icon: BarChart3 },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso");
      navigate("/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground">
            {!isCollapsed && "Menu Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-2 py-3 border-t border-sidebar-border">
                  {!isCollapsed && (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Olá, {user?.user_metadata?.full_name?.split(" ")[0] || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user?.email}
                      </p>
                    </div>
                  )}
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors cursor-pointer flex w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Sair</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
