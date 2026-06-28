import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas. Verifique o arquivo .env"
  );
}

// Isolamento total por aba via chave única no localStorage.
//
// PROBLEMA RAIZ: Supabase JS v2 ouve window.addEventListener('storage') e lê
// e.newValue diretamente do DOM StorageEvent — não chama o adapter. Portanto,
// quando admin loga em outro tab e escreve em localStorage["riseos-auth"], o
// Supabase deste tab recebe o evento com e.key === "riseos-auth" e dispara
// SIGNED_OUT para mileto, independente do que o adapter retorna no getItem.
//
// SOLUÇÃO: cada tab usa uma chave única (ex: "riseos-auth-a1b2c3"). O listener
// interno do Supabase filtra por e.key === storageKey ("riseos-auth"). Como
// nunca escrevemos na chave "riseos-auth" no localStorage, o listener nunca
// dispara por ações de outros tabs — isolamento completo sem alterar a lógica
// interna do Supabase.
//
// PERSISTÊNCIA: a chave do tab é salva em sessionStorage (sobrevive a
// recarregamentos, limpa ao fechar o tab). Ao abrir novo tab, copia a semente
// (riseos-auth-seed) se disponível para evitar login manual.

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

const TAB_AUTH_KEY = _buildTabKey();
const SUPABASE_KEY = "riseos-auth";
const SEED_KEY = "riseos-auth-seed";

// Novo tab sem sessão: semeia do último login disponível
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
      localStorage.setItem(key === SUPABASE_KEY ? TAB_AUTH_KEY : key, value);
      // Atualiza semente para que novos tabs possam auto-logar
      if (key === SUPABASE_KEY) localStorage.setItem(SEED_KEY, value);
    } catch {}
  },
  removeItem: (key: string): void => {
    try { localStorage.removeItem(key === SUPABASE_KEY ? TAB_AUTH_KEY : key); } catch {}
    // Não remove SEED_KEY — outros tabs podem precisar para semeadura
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
