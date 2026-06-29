import { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback } from "react";
import { supabase, TAB_AUTH_KEY, userSessionKey, clearSessionCache } from "../../lib/supabase";
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
    return usarFallback ? fallback : null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabaseUserRef = useRef<User | null>(null);

  const refreshUsuario = useCallback(async () => {
    const user = supabaseUserRef.current;
    if (!user) return;
    try {
      const u = await buildUsuario(user, { usarFallback: false });
      if (u) setUsuario(u);
    } catch {}
  }, []);

  // Polling a cada 5 minutos para recarregar permissões do banco
  useEffect(() => {
    if (!usuario?.id) return;
    const id = setInterval(() => { refreshUsuario(); }, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [usuario?.id, refreshUsuario]);

  // Sincronização cross-tab de token para o mesmo usuário.
  //
  // PROBLEMA: com chaves únicas por tab, quando Tab A renova o token (R1 → R2),
  // o Tab B ainda tem R1. Após 1h, Tab B tenta renovar com R1 (já rotacionado
  // pelo Tab A) e recebe SIGNED_OUT. Sessão dura apenas 1 hora por tab.
  //
  // SOLUÇÃO: no setItem do adapter, gravamos riseos-auth-user-{uid}. Aqui
  // escutamos o storage event dessa chave. Quando a chave muda (outro tab do
  // mesmo usuário renovou), sincronizamos os tokens novos para o TAB_AUTH_KEY
  // deste tab e chamamos setSession() para atualizar o estado in-memory do
  // Supabase — sem disparar buildUsuario desnecessário.
  useEffect(() => {
    if (!usuario?.id) return;

    const myUserKey = userSessionKey(usuario.id);

    const handleCrossTabSync = (e: StorageEvent) => {
      if (e.key !== myUserKey || !e.newValue) return;

      const current = localStorage.getItem(TAB_AUTH_KEY);
      if (current === e.newValue) return; // Já atualizado (este tab foi o que escreveu)

      try {
        const newSession = JSON.parse(e.newValue);
        if (newSession?.user?.id !== usuario.id) return; // Segurança: confirmar mesmo usuário

        // Sincroniza os novos tokens para o storage deste tab
        localStorage.setItem(TAB_AUTH_KEY, e.newValue);
        // Atualiza o estado in-memory do Supabase (dispara SIGNED_IN para mesmo usuário,
        // tratado como shortcut no onAuthStateChange abaixo — sem buildUsuario)
        supabase.auth.setSession({
          access_token: newSession.access_token,
          refresh_token: newSession.refresh_token,
        });
      } catch {}
    };

    window.addEventListener("storage", handleCrossTabSync);
    return () => window.removeEventListener("storage", handleCrossTabSync);
  }, [usuario?.id]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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
          // Shortcut: SIGNED_IN do mesmo usuário (vindo de setSession() na sincronização
          // cross-tab). Apenas atualiza o ref — permissões não mudaram, não precisa
          // rebuildar o usuario nem exibir spinner de loading.
          if (
            event === "SIGNED_IN" &&
            supabaseUserRef.current &&
            session.user.id === supabaseUserRef.current.id
          ) {
            supabaseUserRef.current = session.user;
            setIsLoading(false);
            return;
          }

          // Guard: SIGNED_IN/USER_UPDATED de outro usuário (não ocorre com chaves por
          // tab, mas mantido como rede de segurança para edge cases)
          if (
            (event === "SIGNED_IN" || event === "USER_UPDATED") &&
            supabaseUserRef.current &&
            session.user.id !== supabaseUserRef.current.id
          ) {
            setIsLoading(false);
            return;
          }

          // Novo login ou atualização de perfil: sinaliza transição de auth para que
          // guards de permissão (ex: DepartamentoDetail) não mostrem "Acesso Restrito"
          // enquanto buildUsuario está em andamento
          setIsLoading(true);
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
    const uid = supabaseUserRef.current?.id;
    supabaseUserRef.current = null;
    setUsuario(null);
    // Limpa seed e chave por usuário para que outros tabs não herdem esta sessão
    clearSessionCache(uid);
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
