import { supabase } from "../supabase";

export interface TarefaDB {
  id: string;
  titulo: string;
  descricao: string | null;
  departamento_id: string;
  status: string;
  prioridade: string;
  responsavel_id: string | null;
  criado_por: string;
  prazo: string | null;
  tags: string[];
  progresso: number;
  tipo: string | null;
  visibilidade: string;
  deletado: boolean;
  criado_em: string;
  atualizado_em: string;
  // joins
  responsavel?: { id: string; nome: string; avatar_url: string | null } | null;
  criador?: { id: string; nome: string } | null;
}

export interface NovaTarefaInput {
  titulo: string;
  descricao?: string;
  departamento_id: string;
  status: string;
  prioridade: string;
  responsavel_id?: string;
  prazo?: string;
  tags?: string[];
  tipo?: string;
  visibilidade?: string;
  criado_por: string;
}

export async function getTarefas(filtros?: {
  departamento_id?: string;
  status?: string;
  prioridade?: string;
  visibilidade?: string;
}): Promise<TarefaDB[]> {
  let query = supabase
    .from("tarefas")
    .select(`
      *,
      responsavel:profiles!tarefas_responsavel_id_fkey(id, nome, avatar_url),
      criador:profiles!tarefas_criado_por_fkey(id, nome)
    `)
    .eq("deletado", false)
    .order("criado_em", { ascending: false });

  if (filtros?.departamento_id) query = query.eq("departamento_id", filtros.departamento_id);
  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.prioridade) query = query.eq("prioridade", filtros.prioridade);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTarefaById(id: string): Promise<TarefaDB | null> {
  const { data, error } = await supabase
    .from("tarefas")
    .select(`
      *,
      responsavel:profiles!tarefas_responsavel_id_fkey(id, nome, avatar_url),
      criador:profiles!tarefas_criado_por_fkey(id, nome),
      subtarefas(*),
      comentarios(*, autor:profiles(id, nome, avatar_url)),
      tarefa_links(*)
    `)
    .eq("id", id)
    .eq("deletado", false)
    .single();

  if (error) return null;
  return data;
}

export async function criarTarefa(input: NovaTarefaInput): Promise<TarefaDB> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("tarefas") as any)
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarTarefa(
  id: string,
  updates: Partial<NovaTarefaInput>
): Promise<TarefaDB> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("tarefas") as any)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletarTarefa(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("tarefas") as any)
    .update({ deletado: true })
    .eq("id", id);

  if (error) throw error;
}

export async function criarTarefaLinks(
  tarefa_id: string,
  links: Array<{ titulo: string; url: string; tipo: string }>
): Promise<void> {
  if (links.length === 0) return;
  const rows = links.map((l) => ({ tarefa_id, titulo: l.titulo, url: l.url, tipo: l.tipo }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("tarefa_links") as any).insert(rows);
  if (error) throw error;
}

export async function toggleSubtarefa(id: string, concluida: boolean): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("subtarefas") as any)
    .update({ concluida })
    .eq("id", id);
  if (error) throw error;
}

export async function getStatusConfig(departamento_id?: string): Promise<
  { id: string; label: string; cor: string; ordem: number; eh_final: boolean }[]
> {
  const { data, error } = await supabase
    .from("status_config")
    .select("id, label, cor, ordem, eh_final")
    .or(
      departamento_id
        ? `departamento_id.eq.${departamento_id},departamento_id.is.null`
        : "departamento_id.is.null"
    )
    .order("ordem");

  if (error) throw error;
  return data ?? [];
}
