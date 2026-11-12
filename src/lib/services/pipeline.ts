import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

export type PipelineStatus =
  | "conversa"
  | "em_avanco"
  | "em_listagem"
  | "em_producao"
  | "on_hold"
  | "lancado"
  | "distribuicao_consolidada"
  | "perdido";

export type Classificacao = "originador" | "distribuidor" | "infra_outros";
export type Impacto = "alto" | "medio" | "baixo";
export type Trilha = "infraestrutura" | "assessores" | "fidc_like";
export type ModuloInfra = "administracao" | "gestao" | "pagamento" | "distribuicao";
export type TipoInteracao = "nota" | "reuniao" | "ligacao" | "whatsapp" | "email";

export interface PipelineParceiro {
  id: string;
  parceiro: string;
  produto: string;
  classificacao: Classificacao;
  responsavel_nome: string | null;
  originador: string | null;
  nda_assinado: boolean;
  aum: number;
  valor_distribuido: number | null;
  status: PipelineStatus;
  data_inicial: string | null;
  estimativa_lancamento: string | null;
  proximos_passos: string | null;
  gargalo: string | null;
  impacto: Impacto;
  forecast_anual: number;
  fee_parceiro: number;
  despesas: number;
  forecast_ytd: number;
  observacoes: string | null;
  ordem: number;
  trilha: Trilha;
  /** Módulos contratados na frente de Infraestrutura. Vazio = não classificado. */
  modulos_infra: ModuloInfra[];
  administradora_apex: boolean;
  usa_software_rise: boolean;
  contrato_assinado: boolean;
  api_em_uso: boolean;
  /** Coluna gerada no banco: api_em_uso && !contrato_assinado. Somente leitura. */
  bloqueio_contratual: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface PipelineContato {
  id: string;
  parceiro_id: string;
  nome: string;
  papel: string | null;
  decisor: boolean;
  telefone: string | null;
  email: string | null;
  criado_em: string;
}

export interface PipelineHistoricoDistribuicao {
  id: string;
  parceiro_id: string;
  valor_anterior: number | null;
  valor_novo: number;
  observacao: string | null;
  criado_em: string;
  usuario?: { id: string; nome: string } | null;
}

export interface PipelineComentario {
  id: string;
  parceiro_id: string;
  usuario_id: string;
  tipo: TipoInteracao;
  conteudo: string;
  criado_em: string;
  usuario?: { id: string; nome: string; avatar_url: string | null } | null;
}

export const PIPELINE_STATUS: Record<PipelineStatus, { label: string; color: string; bg: string }> = {
  on_hold:                  { label: "On Hold",                  color: "#888",    bg: "rgba(136,136,136,0.12)" },
  conversa:                 { label: "Em Conversa",              color: "#6B8AFF", bg: "rgba(107,138,255,0.12)" },
  em_avanco:                { label: "Em Avanço",                color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  em_listagem:              { label: "Em Listagem",              color: "#E879F9", bg: "rgba(232,121,249,0.12)" },
  em_producao:              { label: "Em Produção",              color: "#14E9BC", bg: "rgba(20,233,188,0.12)" },
  lancado:                  { label: "Lançado",                  color: "#28d939", bg: "rgba(40,217,57,0.12)" },
  distribuicao_consolidada: { label: "Distribuição Consolidada", color: "#04d95f", bg: "rgba(4,217,95,0.12)"  },
  perdido:                  { label: "Perdido",                  color: "#ec5d5e", bg: "rgba(236,93,94,0.12)" },
};

export const CLASSIFICACAO_LABEL: Record<Classificacao, string> = {
  originador:    "Originador",
  distribuidor:  "Distribuidor",
  infra_outros:  "Infra / Outros",
};

export const TRILHA_CONFIG: Record<Trilha, { label: string; color: string }> = {
  infraestrutura: { label: "Infraestrutura",         color: "#6B8AFF" },
  assessores:     { label: "Comercial & Assessores", color: "#14E9BC" },
  fidc_like:      { label: "FIDC Like",              color: "#f59e0b" },
};

export const MODULO_INFRA: Record<ModuloInfra, { label: string; color: string }> = {
  administracao: { label: "Módulo de Administração",          color: "#6B8AFF" },
  gestao:        { label: "Módulo de Gestão",                 color: "#14E9BC" },
  pagamento:     { label: "Módulo de Pagamento (Pix & Swap)", color: "#E879F9" },
  distribuicao:  { label: "Módulo de Distribuição",           color: "#f59e0b" },
};

export const TIPO_INTERACAO: Record<TipoInteracao, { label: string; color: string }> = {
  nota:     { label: "Nota",     color: "#888"    },
  reuniao:  { label: "Reunião",  color: "#6B8AFF" },
  ligacao:  { label: "Ligação",  color: "#14E9BC" },
  whatsapp: { label: "WhatsApp", color: "#28d939" },
  email:    { label: "E-mail",   color: "#f59e0b" },
};

export const IMPACTO_COLOR: Record<Impacto, string> = {
  alto:  "#ec5d5e",
  medio: "#f59e0b",
  baixo: "#6B8AFF",
};

export async function getParceiros(filtros?: {
  trilha?: Trilha;
  status?: string;
  impacto?: string;
  responsavel?: string;
}): Promise<PipelineParceiro[]> {
  let q = db("pipeline_parceiros").select("*").order("ordem", { ascending: true });
  if (filtros?.trilha) q = q.eq("trilha", filtros.trilha);
  if (filtros?.status && filtros.status !== "todos") q = q.eq("status", filtros.status);
  if (filtros?.impacto && filtros.impacto !== "todos") q = q.eq("impacto", filtros.impacto);
  if (filtros?.responsavel && filtros.responsavel !== "todos") q = q.ilike("responsavel_nome", `%${filtros.responsavel}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function criarParceiro(
  p: Omit<PipelineParceiro, "id" | "criado_em" | "atualizado_em" | "bloqueio_contratual">
): Promise<PipelineParceiro> {
  const { data, error } = await db("pipeline_parceiros").insert(p).select("*").single();
  if (error) throw error;
  return data;
}

export async function atualizarParceiro(id: string, updates: Partial<PipelineParceiro>): Promise<void> {
  // bloqueio_contratual é coluna gerada: o banco rejeita escrita nela
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { bloqueio_contratual, ...campos } = updates;
  const { error } = await db("pipeline_parceiros")
    .update({ ...campos, atualizado_em: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deletarParceiro(id: string): Promise<void> {
  const { error } = await db("pipeline_parceiros").delete().eq("id", id);
  if (error) throw error;
}

export async function getComentariosParceiro(parceiroId: string): Promise<PipelineComentario[]> {
  const { data, error } = await db("pipeline_comentarios")
    .select("*, usuario:profiles!usuario_id(id,nome,avatar_url)")
    .eq("parceiro_id", parceiroId)
    .order("criado_em", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function criarComentarioParceiro(
  parceiroId: string,
  usuarioId: string,
  conteudo: string,
  tipo: TipoInteracao = "nota",
): Promise<PipelineComentario> {
  const { data, error } = await db("pipeline_comentarios")
    .insert({ parceiro_id: parceiroId, usuario_id: usuarioId, conteudo, tipo })
    .select("*, usuario:profiles!usuario_id(id,nome,avatar_url)")
    .single();
  if (error) throw error;
  return data;
}

export async function getContatos(parceiroId: string): Promise<PipelineContato[]> {
  const { data, error } = await db("pipeline_contatos")
    .select("*")
    .eq("parceiro_id", parceiroId)
    .order("decisor", { ascending: false })
    .order("criado_em", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function criarContato(
  c: Omit<PipelineContato, "id" | "criado_em">
): Promise<PipelineContato> {
  const { data, error } = await db("pipeline_contatos").insert(c).select("*").single();
  if (error) throw error;
  return data;
}

export async function deletarContato(id: string): Promise<void> {
  const { error } = await db("pipeline_contatos").delete().eq("id", id);
  if (error) throw error;
}

export async function getHistoricoDistribuicao(parceiroId: string): Promise<PipelineHistoricoDistribuicao[]> {
  const { data, error } = await db("pipeline_historico_distribuicao")
    .select("*, usuario:profiles!usuario_id(id,nome)")
    .eq("parceiro_id", parceiroId)
    .order("criado_em", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function atualizarDistribuicao(
  parceiroId: string,
  valorNovo: number,
  observacao?: string,
): Promise<void> {
  const { error } = await db("pipeline_parceiros")
    .update({ valor_distribuido: valorNovo, atualizado_em: new Date().toISOString() })
    .eq("id", parceiroId);
  if (error) throw error;
  if (observacao) {
    await db("pipeline_historico_distribuicao")
      .insert({ parceiro_id: parceiroId, valor_novo: valorNovo, observacao });
  }
}

export function fmtAum(v: number): string {
  if (!v) return "—";
  if (v >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}

export function fmtForecast(v: number): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(0)}K`;
  return `R$ ${v.toLocaleString("pt-BR")}`;
}
