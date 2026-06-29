import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas. Verifique o arquivo .env"
  );
}

// ─── Chave única por aba ──────────────────────────────────────────────────────
//
// PROBLEMA RAIZ: Supabase JS v2 usa window.addEventListener('storage') com
// e.key === storageKey. O adapter getItem() NÃO é chamado pelo listener interno.
// Com chave compartilhada ("riseos-auth"), o login do admin em outro tab
// dispara SIGNED_OUT no tab do mileto — não há como interceptar no adapter.
//
// SOLUÇÃO: cada tab gera uma chave única (ex: "riseos-auth-a1b2c3"). Writes
// vão para essa chave, nunca para "riseos-auth". O listener interno do Supabase
// filtra e.key === "riseos-auth" → nunca dispara de ações de outros tabs.
//
// PERSISTÊNCIA: chave do tab salva em sessionStorage (sobrevive a F5, limpa ao
// fechar). Ao abrir novo tab, copia a semente (riseos-auth-seed) se disponível.
//
// ROTAÇÃO DE TOKEN: cada tab tem seu próprio refresh token. Para evitar que a
// rotação de um tab invalide outro, gravamos também em riseos-auth-user-{uid}.
// O AuthContext escuta storage events dessa chave e sincroniza via setSession().

const _buildTabKey = (): string => {
  const SLOT = "_riseos_tabkey";
  try {
    let k = sessionStorage.getItem(SLOT);
    if (!k) {
      k = `riseos-auth-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
      sessionStorage.setItem(SLOT, k);
    }
    return k;
  } catch {
    return "riseos-auth-default";
  }
};

export const TAB_AUTH_KEY = _buildTabKey();
export const SUPABASE_KEY  = "riseos-auth";
export const SEED_KEY      = "riseos-auth-seed";

export const userSessionKey = (uid: string) => `riseos-auth-user-${uid}`;

// Limpa o cache de sessão deste tab e a semente ao fazer logout
export function clearSessionCache(uid?: string): void {
  try { if (uid) localStorage.removeItem(userSessionKey(uid)); } catch {}
  try { localStorage.removeItem(SEED_KEY); } catch {}
}

// Novo tab sem sessão própria: semeia da última sessão conhecida
try {
  if (!localStorage.getItem(TAB_AUTH_KEY)) {
    const seed = localStorage.getItem(SEED_KEY);
    if (seed) localStorage.setItem(TAB_AUTH_KEY, seed);
  }
} catch {}

const tabIsolatedStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key === SUPABASE_KEY ? TAB_AUTH_KEY : key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (key === SUPABASE_KEY) {
        localStorage.setItem(TAB_AUTH_KEY, value);
        // Semente para novos tabs
        localStorage.setItem(SEED_KEY, value);
        // Chave por usuário para sincronização cross-tab de token (mesma conta,
        // abas diferentes). O AuthContext escuta este storage event e chama
        // setSession() para manter todos os tabs do mesmo usuário atualizados,
        // evitando falha de rotação de refresh token após 1 hora.
        try {
          const uid = JSON.parse(value)?.user?.id;
          if (uid) localStorage.setItem(userSessionKey(uid), value);
        } catch {}
      } else {
        localStorage.setItem(key, value);
      }
    } catch {}
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key === SUPABASE_KEY ? TAB_AUTH_KEY : key); } catch {}
    // Não remove SEED_KEY nem userSessionKey — outros tabs podem ainda precisar
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: SUPABASE_KEY,
    storage: tabIsolatedStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
