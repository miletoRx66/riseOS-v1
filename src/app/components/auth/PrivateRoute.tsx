import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface PrivateRouteProps {
  children: React.ReactNode;
}

// Aguarda até 3s antes de redirecionar quando a sessão some inesperadamente.
// Absorve SIGNED_OUT espúrios de rotação de JWT sem causar redirect falso.
export function PrivateRoute({ children }: PrivateRouteProps) {
  const { usuario, isLoading } = useAuth();
  const [graceExpired, setGraceExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!usuario && !isLoading) {
      timerRef.current = setTimeout(() => setGraceExpired(true), 3000);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setGraceExpired(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [usuario, isLoading]);

  if (isLoading || (!usuario && !graceExpired)) {
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

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
