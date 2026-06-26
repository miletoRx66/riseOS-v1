import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas. Verifique o arquivo .env"
  );
}

// Adapter que combina isolamento por aba com persistência entre sessões.
//
// LEITURA: sessionStorage tem prioridade. Quando Supabase processa um evento
// de storage disparado por outro tab (admin logando), ele chama getItem() aqui
// e recebe a sessão do sessionStorage deste tab — não a do outro tab. Assim
// SIGNED_OUT nunca é disparado para mileto por causa do login do admin.
//
// ESCRITA: vai para sessionStorage (isolamento) E localStorage (persistência).
// Isso garante que o usuário não precisa re-logar ao reabrir o browser ou
// abrir um novo tab.
const tabIsolatedStorage = {
  getItem: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key) ?? localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try { sessionStorage.setItem(key, value); } catch {}
    try { localStorage.setItem(key, value); } catch {}
  },
  removeItem: (key: string): void => {
    try { sessionStorage.removeItem(key); } catch {}
    try { localStorage.removeItem(key); } catch {}
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "riseos-auth",
    storage: tabIsolatedStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helper: retorna o usuário autenticado atual ou null
export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Helper: retorna a sessão atual ou null
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
