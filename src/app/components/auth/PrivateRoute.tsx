import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { usuario, isLoading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#14E9BC] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  // Redirecionar para login se não estiver autenticado
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar conteúdo protegido
  return <>{children}</>;
}
