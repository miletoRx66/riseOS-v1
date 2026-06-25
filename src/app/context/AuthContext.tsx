import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
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
  isAdmin: boolean;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

// Tenta executar a promise até `tentativas` vezes antes de lançar.
// Timeout reduzido para 4s: Supabase REST responde em <500ms normalmente;
// esperar 10s bloqueava o login por até 20 segundos no pior caso.
async function withRetry<T>(fn: () => Promise<T>, tentativas = 2, timeoutMs = 4000): Promise<T> {
  let ultimo: unknown;
  for (let i = 0; i < tentativas; i++) {
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeoutMs)
        ),
      ]);
    } catch (err) {
      ultimo = err;
      if (i < tentativas - 1) await new Promise((r) => setTimeout(r, 400));
    }
  }
  throw ultimo;
}

async function buildUsuario(user: User, { usarFallback = true } = {}): Promise<Usuario | null> {
  const fallback: Usuario = {
    id: user.id,
    nome: user.user_metadata?.nome ?? user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "",
    cargo: "",
    departamento: "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`,
    permissoes: ["visualizar-todos"],
    isAdmin: false,
  };

  try {
    const [profileRes, permsRes] = await withRetry(() =>
      Promise.all([
        db("profiles").select("id, nome, cargo, departamento_id, avatar_url").eq("id", user.id).single(),
        db("permissoes").select("tipo, departamento_id").eq("usuario_id", user.id),
      ])
    );

    const profile = profileRes.data;
    if (!profile) return usarFallback ? fallback : null;

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
      isAdmin,
    };
  } catch {
    // Após todas as tentativas: fallback no login inicial, null no refresh (não rebaixa permissões)
    return usarFallback ? fallback : null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ref ao User do Supabase para poder chamar buildUsuario no listener de Realtime
  const supabaseUserRef = useRef<User | null>(null);

  const refreshUsuario = useCallback(async () => {
    const user = supabaseUserRef.current;
    if (!user) return;
    try {
      // usarFallback: false → se o banco não responder, retorna null em vez de
      // rebaixar o usuário para isAdmin:false (evita "Acesso Restrito" por timeout)
      const u = await buildUsuario(user, { usarFallback: false });
      if (u) setUsuario(u);
    } catch {
      // silencioso
    }
  }, []);

  // Polling a cada 5 minutos para recarregar permissões.
  // Substituímos a subscrição Realtime para evitar ciclos de WebSocket que
  // interferiam com o refresh de token JWT e causavam SIGNED_OUT espúrios.
  useEffect(() => {
    if (!usuario?.id) return;
    const id = setInterval(() => { refreshUsuario(); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [usuario?.id, refreshUsuario]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Com sessionStorage como storage do cliente Supabase, cada aba tem sua
      // própria sessão isolada. SIGNED_OUT agora significa apenas que o usuário
      // saiu explicitamente ou o refresh token expirou — não há mais conflito
      // de multi-aba nem necessidade de recovery.

      if (event === "TOKEN_REFRESHED") {
        if (session?.user) supabaseUserRef.current = session.user;
        return;
      }

      if (event === "SIGNED_OUT" || event === "PASSWORD_RECOVERY") {
        supabaseUserRef.current = null;
        setUsuario(null);
        setIsLoading(false);
        return;
      }

      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "USER_UPDATED"
      ) {
        if (session?.user) {
          supabaseUserRef.current = session.user;
          try {
            const u = await buildUsuario(session.user, { usarFallback: true });
            setUsuario(u ?? null);
          } catch {}
        } else {
          supabaseUserRef.current = null;
          setUsuario(null);
        }
        setIsLoading(false);
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

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

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
      options: { data: { nome: nome.trim() } },
    });

    if (error) {
      if (error.message.includes("User already registered")) {
        return { success: false, requiresConfirmation: false, message: "Este email já possui uma conta. Faça login." };
      }
      if (error.message.includes("Password should be")) {
        return { success: false, requiresConfirmation: false, message: "A senha deve ter pelo menos 8 caracteres" };
      }
      return { success: false, requiresConfirmation: false, message: "Erro ao criar conta. Tente novamente." };
    }

    const requiresConfirmation = !data.session;
    return {
      success: true,
      requiresConfirmation,
      message: requiresConfirmation
        ? "Conta criada! Verifique seu email para confirmar o cadastro."
        : "Conta criada com sucesso!",
    };
  };

  const logout = async () => {
    // scope:"local" invalida SOMENTE a sessão desta aba/dispositivo.
    // scope:"global" (padrão) apagaria TODOS os refresh tokens do usuário no
    // servidor, causando "refresh_token_not_found" em outros dispositivos/abas
    // e disparando SIGNED_OUT cascata — que era a causa raiz do "desloga ao salvar AUM".
    supabaseUserRef.current = null;
    setUsuario(null);
    await supabase.auth.signOut({ scope: "local" });
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
