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

interface SignupResult {
  success: boolean;
  requiresConfirmation: boolean;
  message: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<{ success: boolean; message: string }>;
  signup: (nome: string, email: string, senha: string) => Promise<SignupResult>;
  logout: () => Promise<void>;
  podeEditar: (departamento: string) => boolean;
  podeVisualizar: () => boolean;
  isLoading: boolean;
  trocarUsuarioDemo: (usuarioId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEPARTAMENTOS = ["marketing", "ops", "comercial", "produto", "financeiro", "tecnologia", "governanca", "juridico"];

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

async function buildUsuario(user: User): Promise<Usuario> {
  const fallback: Usuario = {
    id: user.id,
    nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "",
    cargo: "",
    departamento: "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`,
    permissoes: ["visualizar-todos"],
  };

  try {
    // Query separadas e independentes — evita joins complexos que podem travar
    const db = (table: string) => supabase.from(table) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    const [profileRes, permsRes] = await withTimeout(
      Promise.all([
        db("profiles").select("id, nome, cargo, departamento_id, avatar_url").eq("id", user.id).single(),
        db("permissoes").select("tipo, departamento_id").eq("usuario_id", user.id),
      ]),
      5000 // 5s timeout — se travar, retorna fallback
    );

    const profile = profileRes.data;
    if (!profile) return fallback;

    const dbPerms: Array<{ tipo: string; departamento_id: string | null }> =
      permsRes.data ?? [];

    const perms: string[] = [];
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
      nome: profile.nome ?? fallback.nome,
      email: user.email ?? "",
      cargo: profile.cargo ?? "",
      departamento: profile.departamento_id ?? "",
      avatar:
        profile.avatar_url ??
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.nome ?? user.id)}`,
      permissoes: perms,
    };
  } catch {
    // Timeout ou falha de rede — retorna fallback para não travar o login
    return fallback;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChange é a ÚNICA fonte de verdade — substitui getSession() na inicialização.
    // INITIAL_SESSION replica o estado atual no momento do subscribe, cobrindo sessões pré-existentes.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "TOKEN_REFRESHED") return;

      if (event === "SIGNED_OUT") {
        setUsuario(null);
        setIsLoading(false);
        return;
      }

      // PASSWORD_RECOVERY: sessão temporária para redefinição de senha.
      // Não tratar como login — deixa RedefinirSenha gerenciar esse estado.
      if (event === "PASSWORD_RECOVERY") {
        setIsLoading(false);
        return;
      }

      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "USER_UPDATED"
      ) {
        try {
          if (session?.user) {
            const u = await buildUsuario(session.user);
            setUsuario(u);
          } else {
            setUsuario(null);
          }
        } catch {
          // buildUsuario falhou (rede, RLS) — garante que isLoading seja liberado
          setUsuario(null);
        } finally {
          setIsLoading(false);
        }
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
        return {
          success: false,
          message: "Confirme seu email antes de entrar. Verifique sua caixa de entrada.",
        };
      }
      return { success: false, message: "Erro ao fazer login. Tente novamente." };
    }

    // onAuthStateChange (SIGNED_IN) cuida de buildUsuario + setUsuario.
    // Login.tsx detecta usuario via useEffect e navega para /.
    return { success: true, message: "Login realizado com sucesso!" };
  };

  const signup = async (
    nome: string,
    email: string,
    senha: string
  ): Promise<SignupResult> => {
    if (!nome.trim() || !email || !senha) {
      return { success: false, requiresConfirmation: false, message: "Preencha todos os campos" };
    }
    if (senha.length < 8) {
      return {
        success: false,
        requiresConfirmation: false,
        message: "A senha deve ter pelo menos 8 caracteres",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { nome: nome.trim() },
      },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        return {
          success: false,
          requiresConfirmation: false,
          message: "Este email já possui uma conta. Faça login.",
        };
      }
      if (error.message.includes("Password should be")) {
        return {
          success: false,
          requiresConfirmation: false,
          message: "A senha deve ter pelo menos 8 caracteres",
        };
      }
      return {
        success: false,
        requiresConfirmation: false,
        message: "Erro ao criar conta. Tente novamente.",
      };
    }

    // Supabase retorna session=null quando confirmação de email é exigida
    const requiresConfirmation = !data.session;
    // onAuthStateChange (SIGNED_IN) cuida de buildUsuario + setUsuario quando não há confirmação.

    return {
      success: true,
      requiresConfirmation,
      message: requiresConfirmation
        ? "Conta criada! Verifique seu email para confirmar o cadastro."
        : "Conta criada com sucesso!",
    };
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
      value={{ usuario, login, signup, logout, podeEditar, podeVisualizar, isLoading, trocarUsuarioDemo }}
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
