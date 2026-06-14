import { supabase } from "../supabase";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (table: string) => supabase.from(table) as any;

// ── Types ────────────────────────────────────────────────────────────────────

export interface FinProduto {
  id: string;
  nome: string;
  descricao: string | null;
  status: "ativo" | "beta" | "inativo";
  cor: string;
  criado_em: string;
}

export interface FinSnapshot {
  id: string;
  produto_id: string;
  classe: string;
  competencia: string;
  aum_total: number;
  total_aportes: number;
  total_resgates: number;
  notas: string | null;
  fonte: "manual" | "api" | "csv";
  criado_por: string | null;
  criado_em: string;
  atualizado_em: string;
}

export interface FinTransacao {
  id: string;
  tipo: "receita" | "despesa";
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  competencia: string;
  status: "confirmado" | "pendente" | "pago";
  fonte: "manual" | "api" | "csv";
  criado_por: string | null;
  criado_em: string;
}

// ── Computed metrics (client-side — fórmulas Rise) ───────────────────────────

export interface MetricasSnapshot {
  total_investido: number;   // aportes - resgates
  fees_gerados: number;      // AUM - total_investido
  volume_transacionado: number; // aportes + resgates
}

export function computarMetricas(s: Pick<FinSnapshot, "aum_total" | "total_aportes" | "total_resgates">): MetricasSnapshot {
  const total_investido = s.total_aportes - s.total_resgates;
  return {
    total_investido,
    fees_gerados: s.aum_total - total_investido,
    volume_transacionado: s.total_aportes + s.total_resgates,
  };
}

// ── Categories (static — não precisam de tabela) ─────────────────────────────

export const CATEGORIAS_RECEITA = [
  { id: "rec-assinaturas", nome: "Assinaturas Recorrentes", cor: "#28d939" },
  { id: "rec-onboarding",  nome: "Taxas de Onboarding",    cor: "#14E9BC" },
  { id: "rec-consultoria", nome: "Serviços de Consultoria", cor: "#6B8AFF" },
  { id: "rec-parcerias",   nome: "Receita de Parcerias",   cor: "#E879F9" },
  { id: "rec-outros",      nome: "Outras Receitas",        cor: "#f59e0b" },
];

export const CATEGORIAS_DESPESA = [
  { id: "desp-pessoal",        nome: "Pessoal e Encargos",           cor: "#ec5d5e" },
  { id: "desp-tecnologia",     nome: "Tecnologia e Infraestrutura",  cor: "#f59e0b" },
  { id: "desp-marketing",      nome: "Marketing e Vendas",           cor: "#6B8AFF" },
  { id: "desp-operacional",    nome: "Despesas Operacionais",        cor: "#bdbdbd" },
  { id: "desp-administrativo", nome: "Administrativo",               cor: "#888"    },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function competenciaAtual(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function ultimasSeisCom(): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return result;
}

export function formatarCompetencia(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${meses[parseInt(m) - 1]}/${y.slice(2)}`;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function getProdutos(): Promise<FinProduto[]> {
  const { data, error } = await db("fin_produtos").select("*").order("nome");
  if (error) throw error;
  return data ?? [];
}

export async function getSnapshots(competencia?: string): Promise<FinSnapshot[]> {
  let q = db("fin_snapshots").select("*").order("produto_id").order("classe");
  if (competencia) q = q.eq("competencia", competencia);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function upsertSnapshot(
  snapshot: Omit<FinSnapshot, "id" | "criado_em" | "atualizado_em">
): Promise<void> {
  const { error } = await db("fin_snapshots")
    .upsert(
      { ...snapshot, atualizado_em: new Date().toISOString() },
      { onConflict: "produto_id,classe,competencia" }
    );
  if (error) throw error;
}

export async function getSnapshotByKey(
  produtoId: string,
  classe: string,
  competencia: string
): Promise<FinSnapshot | null> {
  const { data } = await db("fin_snapshots")
    .select("*")
    .eq("produto_id", produtoId)
    .eq("classe", classe)
    .eq("competencia", competencia)
    .maybeSingle();
  return data ?? null;
}

export async function getTransacoes(opts?: {
  competencia?: string;
  tipo?: string;
  ultimas?: number;
}): Promise<FinTransacao[]> {
  let q = db("fin_transacoes").select("*").order("data", { ascending: false });
  if (opts?.competencia) q = q.eq("competencia", opts.competencia);
  if (opts?.tipo && opts.tipo !== "todos") q = q.eq("tipo", opts.tipo);
  if (opts?.ultimas) q = q.limit(opts.ultimas);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function createTransacao(
  t: Omit<FinTransacao, "id" | "criado_em">
): Promise<FinTransacao> {
  const { data, error } = await db("fin_transacoes").insert(t).select("*").single();
  if (error) throw error;
  return data;
}

export async function bulkCreateTransacoes(
  items: Omit<FinTransacao, "id" | "criado_em">[]
): Promise<void> {
  const { error } = await db("fin_transacoes").insert(items);
  if (error) throw error;
}

export async function getAUMEvolution(): Promise<
  { competencia: string; label: string; aum_total: number; total_aportes: number; total_resgates: number }[]
> {
  const { data, error } = await db("fin_snapshots")
    .select("competencia, aum_total, total_aportes, total_resgates")
    .order("competencia");
  if (error) throw error;

  const grouped: Record<string, { aum_total: number; total_aportes: number; total_resgates: number }> = {};
  for (const row of (data ?? [])) {
    if (!grouped[row.competencia]) grouped[row.competencia] = { aum_total: 0, total_aportes: 0, total_resgates: 0 };
    grouped[row.competencia].aum_total += Number(row.aum_total);
    grouped[row.competencia].total_aportes += Number(row.total_aportes);
    grouped[row.competencia].total_resgates += Number(row.total_resgates);
  }

  return Object.entries(grouped).map(([competencia, v]) => ({
    competencia,
    label: formatarCompetencia(competencia),
    ...v,
  }));
}

export async function getFluxoCaixaMensal(meses: string[]): Promise<
  { competencia: string; mesNome: string; receitas: number; despesas: number; lucro: number }[]
> {
  const { data, error } = await db("fin_transacoes")
    .select("tipo,valor,competencia")
    .in("competencia", meses);
  if (error) throw error;

  return meses.map((comp) => {
    const rows = (data ?? []).filter((r: any) => r.competencia === comp);
    const receitas = rows.filter((r: any) => r.tipo === "receita").reduce((s: number, r: any) => s + Number(r.valor), 0);
    const despesas = rows.filter((r: any) => r.tipo === "despesa").reduce((s: number, r: any) => s + Number(r.valor), 0);
    return { competencia: comp, mesNome: formatarCompetencia(comp), receitas, despesas, lucro: receitas - despesas };
  });
}
