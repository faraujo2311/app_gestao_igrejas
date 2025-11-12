import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import { AdminLayout } from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Ministerios from "./pages/admin/Ministerios";
import Members from "./pages/admin/Members";
import Cells from "./pages/admin/Cells";
import Events from "./pages/admin/Events";
import Perfis from "./pages/admin/Perfis";
import PerfilDetalhes from "./pages/admin/PerfilDetalhes";
import Usuarios from "./pages/admin/Usuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="ministerios" element={<Ministerios />} />
              <Route path="membros" element={<Members />} />
              <Route path="celulas" element={<Cells />} />
              <Route path="eventos" element={<Events />} />
              <Route path="usuarios" element={<Usuarios />} />
              <Route path="perfis" element={<Perfis />} />
              <Route path="perfis/:id" element={<PerfilDetalhes />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
