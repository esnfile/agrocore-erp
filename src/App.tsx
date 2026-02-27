import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import EmpresasPage from "@/pages/admin/EmpresasPage";
import EmpresaFormPage from "@/pages/admin/EmpresaFormPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OrganizationProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              {/* Administrativo */}
              <Route path="/admin/grupos" element={<PlaceholderPage />} />
              <Route path="/admin/empresas" element={<EmpresasPage />} />
              <Route path="/admin/empresas/:id" element={<EmpresaFormPage />} />
              <Route path="/admin/filiais" element={<PlaceholderPage />} />
              <Route path="/admin/usuarios" element={<PlaceholderPage />} />
              <Route path="/admin/permissoes" element={<PlaceholderPage />} />
              {/* Cadastros */}
              <Route path="/cadastros/pessoas" element={<PlaceholderPage />} />
              <Route path="/cadastros/produtos" element={<PlaceholderPage />} />
              <Route path="/cadastros/categorias" element={<PlaceholderPage />} />
              <Route path="/cadastros/locais-estoque" element={<PlaceholderPage />} />
              {/* Armazém */}
              <Route path="/armazem/contratos" element={<PlaceholderPage />} />
              <Route path="/armazem/entregas" element={<PlaceholderPage />} />
              <Route path="/armazem/estoque" element={<PlaceholderPage />} />
              {/* Financeiro */}
              <Route path="/financeiro/contas-receber" element={<PlaceholderPage />} />
              <Route path="/financeiro/contas-pagar" element={<PlaceholderPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </OrganizationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
