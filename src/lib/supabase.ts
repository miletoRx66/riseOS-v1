import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas. Verifique o arquivo .env"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: "riseos-auth",
    // sessionStorage é isolado por aba: cada usuário tem sua própria sessão
    // sem conflito com outros usuários logados em outras abas no mesmo browser.
    storage: window.sessionStorage,
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
