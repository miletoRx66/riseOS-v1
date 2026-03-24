import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  avatar: string;
  permissoes: string[];
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  podeEditar: (departamento: string) => boolean;
  podeVisualizar: () => boolean;
  isLoading: boolean;
  trocarUsuarioDemo: (usuarioId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEPARTAMENTOS = ["marketing", "ops", "comercial", "produto", "financeiro"];

async function buildUsuario(user: User): Promise<Usuario | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, departamentos(*), permissoes(*)")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  // Converte permissoes do banco para o formato legado de strings
  const perms: string[] = [];
  const dbPerms: Array<{ tipo: string; departamento_id: string | null }> = profile.permissoes ?? [];

  const isAdmin = dbPerms.some((p) => p.tipo === "admin" && !p.departamento_id);

  if (isAdmin) {
    perms.push("admin", "visualizar-todos");
    DEPARTAMENTOS.forEach((d) => perms.push(`editar-${d}`));
  } else {
    perms.push("visualizar-todos");
    for (const p of dbPerms) {
      if ((p.tipo === "manager" || p.tipo === "member") && p.departamento_id) {
        perms.push(`editar-${p.departamento_id}`);
      }
    }
  }

  return {
    id: profile.id,
    nome: profile.nome ?? user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "",
    cargo: profile.cargo ?? "",
    departamento: profile.departamento_id ?? "",
    avatar:
      profile.avatar_url ??
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.nome ?? user.id)}`,
    permissoes: perms,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sessão inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = await buildUsuario(session.user);
        setUsuario(u);
      }
      setIsLoading(false);
    });

    // Escuta mudanças de auth (login, logout, refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const u = await buildUsuario(session.user);
        setUsuario(u);
      } else {
        setUsuario(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (
    email: string,
    senha: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!email || !senha) {
      return { success: false, message: "Preencha todos os campos" };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      if (
        error.message.includes("Invalid login credentials") ||
        error.message.includes("invalid_credentials")
      ) {
        return { success: false, message: "Email ou senha incorretos" };
      }
      if (error.message.includes("Email not confirmed")) {
        return { success: false, message: "Confirme seu email antes de entrar" };
      }
      return { success: false, message: "Erro ao fazer login. Tente novamente." };
    }

    return { success: true, message: "Login realizado com sucesso!" };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  const podeEditar = (departamento: string): boolean => {
    if (!usuario) return false;
    if (usuario.permissoes.includes("admin")) return true;
    return usuario.permissoes.includes(`editar-${departamento}`);
  };

  const podeVisualizar = (): boolean => {
    if (!usuario) return false;
    return (
      usuario.permissoes.includes("visualizar-todos") ||
      usuario.permissoes.includes("admin")
    );
  };

  const trocarUsuarioDemo = (_usuarioId: string) => {
    console.warn("trocarUsuarioDemo desabilitado com autenticação real");
  };

  return (
    <AuthContext.Provider
      value={{ usuario, login, logout, podeEditar, podeVisualizar, isLoading, trocarUsuarioDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
