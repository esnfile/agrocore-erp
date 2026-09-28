import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { PerfilAcesso } from "@/lib/services";

interface ProtectedRouteProps {
  children: React.ReactNode;
  perfis?: PerfilAcesso[];
}

export function ProtectedRoute({ children, perfis }: ProtectedRouteProps) {
  const { session, perfil, carregando } = useAuth();
  const location = useLocation();

  if (carregando) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }

  if (perfis && perfil && !perfis.includes(perfil)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
