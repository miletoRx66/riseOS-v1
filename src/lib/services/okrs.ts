import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export interface OkrDB {
  id: string;
  titulo: string;
  departamento_id: string;
  periodo: string;
  responsavel_id: string;
  data_inicio: string | null;
  data_fim: string | null;
  progresso: number;
  visibilidade: string;
  criado_em: string;
  responsavel?: { id: string; nome: string; avatar_url: string | null } | null;
  key_results?: KeyResultDB[];
}

export interface KeyResultDB {
  id: string;
  okr_id: string;
  descricao: string;
  metrica: string | null;
  valor_inicial: number;
  valor_meta: number;
  valor_atual: number;
  progresso: number;
  unidade: string | null;
  status: string;
}

export async function getOkrs(departamento_id?: string): Promise<OkrDB[]> {
  let query = db("okrs")
    .select(`*, responsavel:profiles(id, nome, avatar_url), key_results(*)`)
    .order("criado_em", { ascending: false });

  if (departamento_id) query = query.eq("departamento_id", departamento_id);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function criarOkr(input: {
  titulo: string;
  departamento_id: string;
  periodo: string;
  responsavel_id: string;
  data_inicio?: string;
  data_fim?: string;
  visibilidade?: string;
}): Promise<OkrDB> {
  const { data, error } = await db("okrs").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function criarKeyResult(input: {
  okr_id: string;
  descricao: string;
  metrica?: string;
  valor_inicial?: number;
  valor_meta: number;
  unidade?: string;
}): Promise<KeyResultDB> {
  const { data, error } = await db("key_results")
    .insert({ ...input, valor_atual: input.valor_inicial ?? 0, progresso: 0, status: "on_track" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletarOkr(id: string): Promise<void> {
  const { error } = await db("okrs").delete().eq("id", id);
  if (error) throw error;
}

export async function atualizarProgresso(
  krId: string,
  valor_atual: number,
  progresso: number
): Promise<void> {
  const status =
    progresso >= 70 ? "on_track" : progresso >= 40 ? "at_risk" : "in_danger";

  const { error } = await db("key_results")
    .update({ valor_atual, progresso, status })
    .eq("id", krId);

  if (error) throw error;
}
