import { supabase } from "../supabase";

export interface TarefaRecorrenciaDB {
  id: string;
  titulo: string;
  descricao: string | null;
  departamento_id: string;
  prioridade: string;
  tipo: string | null;
  visibilidade: string;
  responsavel_id: string | null;
  tags: string[];
  frequencia: "diaria" | "semanal" | "mensal";
  dia_semana: number | null;
  dia_mes: number | null;
  data_inicio: string;
  data_fim: string | null;
  antecedencia_dias: number;
  proxima_geracao: string;
  ativo: boolean;
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  // joins
  responsavel?: { id: string; nome: string; avatar_url: string | null } | null;
}

export interface NovaTarefaRecorrenciaInput {
  titulo: string;
  descricao?: string;
  departamento_id: string;
  prioridade?: string;
  tipo?: string;
  visibilidade?: string;
  responsavel_id?: string;
  tags?: string[];
  frequencia: "diaria" | "semanal" | "mensal";
  dia_semana?: number;
  dia_mes?: number;
  data_inicio?: string;
  data_fim?: string;
  antecedencia_dias?: number;
  criado_por: string;
}

export async function getRecorrencias(filtros?: {
  departamento_id?: string;
  ativo?: boolean;
}): Promise<TarefaRecorrenciaDB[]> {
  let query = supabase
    .from("tarefa_recorrencias")
    .select(`*, responsavel:profiles!tarefa_recorrencias_responsavel_id_fkey(id, nome, avatar_url)`)
    .order("proxima_geracao", { ascending: true });

  if (filtros?.departamento_id) query = query.eq("departamento_id", filtros.departamento_id);
  if (filtros?.ativo !== undefined) query = query.eq("ativo", filtros.ativo);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function criarRecorrencia(
  input: NovaTarefaRecorrenciaInput
): Promise<TarefaRecorrenciaDB> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("tarefa_recorrencias") as any)
    .insert(input)
    .select()
    .single();
  if (error) throw error;

  // Materializa a 1ª ocorrência na hora se já devida hoje — feedback imediato,
  // sem esperar o cron do dia seguinte. Exceção esperada quando a 1ª ocorrência
  // ainda está no futuro (a RPC recusa nesse caso), por isso o catch silencioso.
  try {
    await gerarRecorrenciaAgora(data.id);
  } catch {
    // ainda não devida hoje — normal
  }

  return data;
}

export async function pausarRecorrencia(id: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("tarefa_recorrencias") as any)
    .update({ ativo: false })
    .eq("id", id);
  if (error) throw error;
}

export async function retomarRecorrencia(id: string): Promise<TarefaRecorrenciaDB> {
  const { data, error } = await supabase.rpc("retomar_tarefa_recorrencia", {
    p_recorrencia_id: id,
  });
  if (error) throw error;
  return data;
}

export async function excluirRecorrencia(id: string): Promise<void> {
  const { error } = await supabase.from("tarefa_recorrencias").delete().eq("id", id);
  if (error) throw error;
}

export async function gerarRecorrenciaAgora(id: string) {
  const { data, error } = await supabase.rpc("gerar_tarefa_recorrencia_agora", {
    p_recorrencia_id: id,
  });
  if (error) throw error;
  return data;
}

const DIAS_SEMANA = [
  "domingo", "segunda-feira", "terça-feira", "quarta-feira",
  "quinta-feira", "sexta-feira", "sábado",
];

export function formatarFrequencia(r: TarefaRecorrenciaDB): string {
  if (r.frequencia === "diaria") return "Diariamente";
  if (r.frequencia === "semanal") return `Toda ${DIAS_SEMANA[r.dia_semana ?? 0]}`;
  return `Todo dia ${r.dia_mes} do mês`;
}
