import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export interface TicketDB {
  id: string;
  titulo: string;
  descricao: string | null;
  tipo: "incidente" | "bug" | "solicitacao" | "melhoria";
  prioridade: "baixa" | "media" | "alta" | "critica";
  status: "aberto" | "em_analise" | "em_progresso" | "resolvido" | "fechado";
  departamento_id: string | null;
  responsavel_id: string | null;
  reportado_por: string | null;
  prazo: string | null;
  resolvido_em: string | null;
  criado_em: string;
  atualizado_em: string;
  responsavel?: { id: string; nome: string; avatar_url: string | null } | null;
  reportador?: { id: string; nome: string; avatar_url: string | null } | null;
}

export async function getTickets(filtros?: {
  status?: string;
  tipo?: string;
  departamento_id?: string;
}): Promise<TicketDB[]> {
  let q = db("tickets")
    .select("*, responsavel:profiles!responsavel_id(id,nome,avatar_url), reportador:profiles!reportado_por(id,nome,avatar_url)")
    .order("criado_em", { ascending: false });

  if (filtros?.status && filtros.status !== "todos") q = q.eq("status", filtros.status);
  if (filtros?.tipo && filtros.tipo !== "todos") q = q.eq("tipo", filtros.tipo);
  if (filtros?.departamento_id) q = q.eq("departamento_id", filtros.departamento_id);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function criarTicket(
  t: Omit<TicketDB, "id" | "criado_em" | "atualizado_em" | "resolvido_em" | "responsavel" | "reportador">
): Promise<TicketDB> {
  const { data, error } = await db("tickets").insert(t).select("*").single();
  if (error) throw error;
  return data;
}

export async function atualizarTicket(id: string, updates: Partial<TicketDB>): Promise<void> {
  const { error } = await db("tickets")
    .update({ ...updates, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function fecharTicket(id: string): Promise<void> {
  const { error } = await db("tickets")
    .update({ status: "fechado", resolvido_em: new Date().toISOString(), atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
