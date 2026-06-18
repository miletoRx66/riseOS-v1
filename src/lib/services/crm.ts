import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export interface CRMCliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  empresa: string | null;
  tipo: "pj" | "pf";
  status: "lead" | "prospecto" | "qualificado" | "ativo" | "inativo";
  responsavel_id: string | null;
  originador_id: string | null;
  valor_potencial: number;
  prioridade: "baixa" | "media" | "alta";
  prazo: string | null;
  notas: string | null;
  persona: string[] | null;
  criado_em: string;
  atualizado_em: string;
  responsavel?: { id: string; nome: string; avatar_url: string | null } | null;
  originador?: { id: string; nome: string; avatar_url: string | null } | null;
  operacoes?: CRMOperacao[];
}

export interface CRMOperacao {
  id: string;
  cliente_id: string | null;
  titulo: string;
  tipo: string | null;
  status: "aberta" | "negociacao" | "proposta" | "fechada" | "perdida";
  responsavel_id: string | null;
  originador_id: string | null;
  valor: number;
  prioridade: "baixa" | "media" | "alta";
  prazo: string | null;
  descricao: string | null;
  criado_em: string;
  atualizado_em: string;
  responsavel?: { id: string; nome: string; avatar_url: string | null } | null;
  originador?: { id: string; nome: string; avatar_url: string | null } | null;
  cliente?: { id: string; nome: string } | null;
}

export interface CRMComentario {
  id: string;
  operacao_id: string;
  usuario_id: string;
  conteudo: string;
  criado_em: string;
  usuario?: { id: string; nome: string; avatar_url: string | null } | null;
}

export async function getClientes(filtros?: {
  status?: string;
  tipo?: string;
}): Promise<CRMCliente[]> {
  let q = db("crm_clientes")
    .select("*, responsavel:profiles!responsavel_id(id,nome,avatar_url), originador:profiles!originador_id(id,nome,avatar_url)")
    .order("criado_em", { ascending: false });

  if (filtros?.status && filtros.status !== "todos") q = q.eq("status", filtros.status);
  if (filtros?.tipo && filtros.tipo !== "todos") q = q.eq("tipo", filtros.tipo);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function criarCliente(
  c: Omit<CRMCliente, "id" | "criado_em" | "atualizado_em" | "responsavel" | "originador" | "operacoes">
): Promise<CRMCliente> {
  const { data, error } = await db("crm_clientes").insert(c).select("*").single();
  if (error) throw error;
  return data;
}

export async function atualizarCliente(id: string, updates: Partial<CRMCliente>): Promise<void> {
  const { error } = await db("crm_clientes")
    .update({ ...updates, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getOperacoes(filtros?: {
  status?: string;
  cliente_id?: string;
}): Promise<CRMOperacao[]> {
  let q = db("crm_operacoes")
    .select("*, responsavel:profiles!responsavel_id(id,nome,avatar_url), originador:profiles!originador_id(id,nome,avatar_url), cliente:crm_clientes(id,nome,tipo)")
    .order("criado_em", { ascending: false });

  if (filtros?.status && filtros.status !== "todos") q = q.eq("status", filtros.status);
  if (filtros?.cliente_id) q = q.eq("cliente_id", filtros.cliente_id);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function criarOperacao(
  o: Omit<CRMOperacao, "id" | "criado_em" | "atualizado_em" | "responsavel" | "originador" | "cliente">
): Promise<CRMOperacao> {
  const { data, error } = await db("crm_operacoes").insert(o).select("*").single();
  if (error) throw error;
  return data;
}

export async function atualizarOperacao(id: string, updates: Partial<CRMOperacao>): Promise<void> {
  const { error } = await db("crm_operacoes")
    .update({ ...updates, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function getComentarios(operacaoId: string): Promise<CRMComentario[]> {
  const { data, error } = await db("crm_operacao_comentarios")
    .select("*, usuario:profiles!usuario_id(id,nome,avatar_url)")
    .eq("operacao_id", operacaoId)
    .order("criado_em", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function criarComentario(
  operacaoId: string,
  usuarioId: string,
  conteudo: string,
): Promise<CRMComentario> {
  const { data, error } = await db("crm_operacao_comentarios")
    .insert({ operacao_id: operacaoId, usuario_id: usuarioId, conteudo })
    .select("*, usuario:profiles!usuario_id(id,nome,avatar_url)")
    .single();
  if (error) throw error;
  return data;
}

export function fmtValor(v: number): string {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
}
