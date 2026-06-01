import { supabase } from "../supabase";

const db = (table: string) => supabase.from(table) as any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface NotificacaoDB {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  corpo: string | null;
  lida: boolean;
  link_interno: string | null;
  entidade_id: string | null;
  entidade_tipo: string | null;
  criada_em: string;
}

export async function getNotificacoes(userId: string, limit = 30): Promise<NotificacaoDB[]> {
  const { data, error } = await db("notificacoes")
    .select("*")
    .eq("usuario_id", userId)
    .order("criada_em", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function marcarLida(notifId: string): Promise<void> {
  await db("notificacoes").update({ lida: true }).eq("id", notifId);
}

export async function marcarTodasLidas(userId: string): Promise<void> {
  await db("notificacoes")
    .update({ lida: true })
    .eq("usuario_id", userId)
    .eq("lida", false);
}
