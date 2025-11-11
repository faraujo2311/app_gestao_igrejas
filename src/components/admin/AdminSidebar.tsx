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
  const isCollapsed = state === "collapsed";

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
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    {!isCollapsed && <span>Sair</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
