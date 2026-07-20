import { useState, useEffect, useCallback, ChangeEvent, DragEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  DollarSign, TrendingUp, TrendingDown, Upload, Download, X,
  CheckCircle, AlertCircle, FileSpreadsheet, ArrowUpRight, ArrowDownRight,
  Package, Plus, LayoutGrid, Layers, ChevronDown,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import Papa from "papaparse";
import {
  getProdutos, getSnapshots, getTransacoes, getFluxoCaixaMensal,
  createTransacao, bulkCreateTransacoes, upsertSnapshot, getSnapshotByKey,
  computarMetricas, ultimasSeisCom, competenciaAtual, formatarCompetencia,
  CATEGORIAS_RECEITA, CATEGORIAS_DESPESA,
  type FinProduto, type FinSnapshot, type FinTransacao,
} from "../../lib/services/financeiro";

// ─── helpers ─────────────────────────────────────────────────────────────────

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const pct = (v: number) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

function variacao(atual: number, anterior: number): number {
  if (!anterior) return 0;
  return ((atual - anterior) / anterior) * 100;
}

// ─── Modal: Lançar AUM ───────────────────────────────────────────────────────

interface ModalAUMProps {
  produtos: FinProduto[];
  competencia: string;
  userId: string;
  onSalvo: () => void;
  onFechar: () => void;
}

function ModalAUM({ produtos, competencia, userId, onSalvo, onFechar }: ModalAUMProps) {
  const [produtoId, setProdutoId]   = useState(produtos[0]?.id ?? "");
  const [frequencia, setFrequencia] = useState<"mensal" | "semanal">("mensal");
  const [comp, setComp]             = useState(competencia);
  const [aum, setAum]               = useState("");
  const [aportes, setAportes]       = useState("");
  const [resgates, setResgates]     = useState("");
  const [notas, setNotas]           = useState("");
  const [salvando, setSalvando]     = useState(false);
  const [carregandoSnap, setCarregandoSnap] = useState(false);
  const [isEdicao, setIsEdicao]     = useState(false);
  const [erro, setErro]             = useState("");

  // Pré-carrega snapshot existente ao trocar produto ou competência
  useEffect(() => {
    if (!produtoId || !comp) return;
    setCarregandoSnap(true);
    getSnapshotByKey(produtoId, "geral", comp)
      .then(snap => {
        if (snap) {
          setAum(String(snap.aum_total));
          setAportes(String(snap.total_aportes));
          setResgates(String(snap.total_resgates));
          setNotas(snap.notas ?? "");
          setIsEdicao(true);
        } else {
          setAum(""); setAportes(""); setResgates(""); setNotas("");
          setIsEdicao(false);
        }
      })
      .catch(() => {})
      .finally(() => setCarregandoSnap(false));
  }, [produtoId, comp]);

  const numAum      = parseFloat(aum)      || 0;
  const numAportes  = parseFloat(aportes)  || 0;
  const numResgates = parseFloat(resgates) || 0;
  const m = computarMetricas({ aum_total: numAum, total_aportes: numAportes, total_resgates: numResgates });

  async function handleSalvar() {
    if (!produtoId || !comp || !aum) { setErro("Preencha produto, competência e AUM."); return; }
    setSalvando(true);
    try {
      await upsertSnapshot({
        produto_id: produtoId, classe: "geral", competencia: comp,
        aum_total: numAum, total_aportes: numAportes, total_resgates: numResgates,
        notas: notas || null, fonte: "manual", criado_por: userId,
      });
      onSalvo();
      onFechar();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao salvar.");
    } finally { setSalvando(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-rise-surface border border-rise-line rounded-xl w-full max-w-[560px]">
        <div className="flex items-center justify-between p-6 border-b border-rise-line">
          <div className="flex items-center gap-3">
            <h2 className="text-rise-fg text-[20px] font-bold">Lançar AUM</h2>
            {isEdicao && !carregandoSnap && (
              <span className="bg-[#f59e0b]/15 text-[#f59e0b] text-[11px] font-semibold px-2 py-0.5 rounded-full border border-[#f59e0b]/30">
                Editando existente
              </span>
            )}
          </div>
          <button onClick={onFechar} className="text-rise-fg-4 hover:text-rise-fg transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">

          {/* Produto */}
          <div>
            <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Produto</label>
            <select value={produtoId} onChange={e => setProdutoId(e.target.value)}
              className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none">
              {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          {/* Frequência + Competência */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-rise-fg-2 text-[12px] font-semibold">Competência</label>
              <div className="flex items-center gap-1 bg-rise-surface border border-rise-line-2 rounded-lg p-0.5">
                {(["mensal", "semanal"] as const).map(f => (
                  <button key={f} onClick={() => { setFrequencia(f); setComp(f === "mensal" ? competencia : ""); }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      frequencia === f ? "bg-[#f59e0b] text-[#000]" : "text-rise-fg-4 hover:text-rise-fg-2"
                    }`}>
                    {f === "mensal" ? "Mensal" : "Semanal"}
                  </button>
                ))}
              </div>
            </div>
            <input
              type={frequencia === "mensal" ? "month" : "week"}
              value={comp} onChange={e => setComp(e.target.value)}
              className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none"
            />
            {frequencia === "semanal" && comp && (
              <p className="text-rise-fg-4 text-[11px] mt-1">Competência semanal: {comp}</p>
            )}
          </div>

          {/* Inputs AUM */}
          {carregandoSnap ? (
            <div className="flex items-center justify-center py-6 text-rise-fg-4 text-[13px] gap-2">
              <div className="w-4 h-4 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
              Verificando lançamento anterior...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total AUM",      val: aum,      set: setAum,      cor: "#14E9BC" },
                { label: "Total Aportes",  val: aportes,  set: setAportes,  cor: "#28d939" },
                { label: "Total Resgates", val: resgates, set: setResgates, cor: "#ec5d5e" },
              ].map(({ label, val, set, cor }) => (
                <div key={label}>
                  <label className="block text-[12px] font-semibold mb-1.5" style={{ color: cor }}>{label}</label>
                  <input value={val} onChange={e => set(e.target.value)} placeholder="0.00" type="number" step="0.01"
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:outline-none transition-colors"
                    style={{ borderColor: val ? cor : undefined }} />
                </div>
              ))}
            </div>
          )}

          {/* Computed preview */}
          <div className="bg-rise-raised border border-rise-line-2 rounded-lg p-4 grid grid-cols-3 gap-3">
            {[
              { label: "Total Investido",     val: m.total_investido,      cor: "#6B8AFF" },
              { label: "Fees Gerados",        val: m.fees_gerados,         cor: "#f59e0b" },
              { label: "Vol. Transacionado",  val: m.volume_transacionado, cor: "#bdbdbd" },
            ].map(({ label, val, cor }) => (
              <div key={label} className="text-center">
                <p className="text-[11px] mb-1" style={{ color: cor }}>{label}</p>
                <p className="text-rise-fg text-[13px] font-bold">{fmt(val)}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Notas (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
              className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none resize-none" />
          </div>

          {erro && <p className="text-[#ec5d5e] text-[13px]">{erro}</p>}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onFechar} className="px-4 py-2.5 rounded-lg bg-rise-raised text-rise-fg-2 text-[14px] hover:bg-rise-raised">Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando}
            className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#000] font-semibold text-[14px] hover:bg-[#d97706] disabled:opacity-50">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal: Lançar Transação ─────────────────────────────────────────────────

interface ModalTransacaoProps {
  userId: string;
  onSalvo: () => void;
  onFechar: () => void;
}

function ModalTransacao({ userId, onSalvo, onFechar }: ModalTransacaoProps) {
  const [tipo, setTipo]         = useState<"receita" | "despesa">("receita");
  const [categoria, setCategoria] = useState(CATEGORIAS_RECEITA[0].id);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor]       = useState("");
  const [data, setData]         = useState(new Date().toISOString().split("T")[0]);
  const [competencia, setComp]  = useState(competenciaAtual());
  const [status, setStatus]     = useState<"confirmado" | "pendente" | "pago">("pendente");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]         = useState("");

  const categorias = tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;

  useEffect(() => {
    setCategoria(categorias[0].id);
  }, [tipo]);

  async function handleSalvar() {
    if (!descricao || !valor || !data) { setErro("Preencha todos os campos."); return; }
    setSalvando(true);
    try {
      await createTransacao({
        tipo, categoria, descricao, valor: parseFloat(valor),
        data, competencia, status, fonte: "manual", criado_por: userId,
      });
      onSalvo();
      onFechar();
    } catch (e: any) {
      setErro(e?.message ?? "Erro ao salvar.");
    } finally { setSalvando(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-rise-surface border border-rise-line rounded-xl w-full max-w-[480px]">
        <div className="flex items-center justify-between p-6 border-b border-rise-line">
          <h2 className="text-rise-fg text-[20px] font-bold">Nova Transação</h2>
          <button onClick={onFechar} className="text-rise-fg-4 hover:text-rise-fg"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            {(["receita", "despesa"] as const).map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 py-2 rounded-lg text-[14px] font-semibold transition-colors ${
                  tipo === t
                    ? t === "receita" ? "bg-[#28d939]/20 text-[#28d939] border border-[#28d939]/40" : "bg-[#ec5d5e]/20 text-[#ec5d5e] border border-[#ec5d5e]/40"
                    : "bg-rise-raised text-rise-fg-4 border border-transparent"
                }`}>
                {t === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none">
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Descrição</label>
            <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição da transação"
              className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Valor (R$)</label>
              <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00"
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none">
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)}
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-rise-fg-2 text-[12px] font-semibold mb-1.5">Competência</label>
              <input type="month" value={competencia} onChange={e => setComp(e.target.value)}
                className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none" />
            </div>
          </div>
          {erro && <p className="text-[#ec5d5e] text-[13px]">{erro}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onFechar} className="px-4 py-2.5 rounded-lg bg-rise-raised text-rise-fg-2 text-[14px] hover:bg-rise-raised">Cancelar</button>
          <button onClick={handleSalvar} disabled={salvando}
            className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#000] font-semibold text-[14px] hover:bg-[#d97706] disabled:opacity-50">
            {salvando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function DepartamentoFinanceiro() {
  const { usuario } = useAuth();
  const podeEditar =
    usuario?.permissoes.includes("admin") ||
    usuario?.permissoes.includes("editar-financeiro");

  const [vista, setVista]           = useState<"operacional" | "executiva">("operacional");
  const [competencia, setCompetencia] = useState(competenciaAtual());
  const [produtos, setProdutos]     = useState<FinProduto[]>([]);
  const [snapshots, setSnapshots]   = useState<FinSnapshot[]>([]);
  const [transacoes, setTransacoes] = useState<FinTransacao[]>([]);
  const [fluxo, setFluxo]           = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [modalAUM, setModalAUM]     = useState(false);
  const [modalTrans, setModalTrans] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [csvFile, setCsvFile]       = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "success">("upload");
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importando, setImportando] = useState(false);

  const userId = usuario?.id ?? "";

  const carregarTudo = useCallback(async () => {
    setCarregando(true);
    try {
      const meses = ultimasSeisCom();
      const [prods, snaps, trans, fl] = await Promise.all([
        getProdutos(),
        getSnapshots(competencia),
        getTransacoes({ competencia, tipo: filtroTipo }),
        getFluxoCaixaMensal(meses),
      ]);
      setProdutos(prods);
      setSnapshots(snaps);
      setTransacoes(trans);
      setFluxo(fl);
    } catch (e) { console.error(e); }
    finally { setCarregando(false); }
  }, [competencia, filtroTipo]);

  // Recarrega sempre que mudar competência OU filtro de tipo
  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const recarregarTransacoes = useCallback(async () => {
    const trans = await getTransacoes({ competencia, tipo: filtroTipo });
    setTransacoes(trans);
    const fl = await getFluxoCaixaMensal(ultimasSeisCom());
    setFluxo(fl);
  }, [competencia, filtroTipo]);

  // ── Computed AUM metrics ─────────────────────────────────────────────────

  const totalAUM      = snapshots.reduce((s, x) => s + Number(x.aum_total), 0);
  const totalAportes  = snapshots.reduce((s, x) => s + Number(x.total_aportes), 0);
  const totalResgates = snapshots.reduce((s, x) => s + Number(x.total_resgates), 0);
  const { total_investido, fees_gerados, volume_transacionado } =
    computarMetricas({ aum_total: totalAUM, total_aportes: totalAportes, total_resgates: totalResgates });

  // ── Computed operational metrics ─────────────────────────────────────────

  const receitaTotal  = transacoes.filter(t => t.tipo === "receita").reduce((s, t) => s + Number(t.valor), 0);
  const despesaTotal  = transacoes.filter(t => t.tipo === "despesa").reduce((s, t) => s + Number(t.valor), 0);
  const lucroLiquido  = receitaTotal - despesaTotal;
  const margem        = receitaTotal > 0 ? (lucroLiquido / receitaTotal) * 100 : 0;

  const receitasPorCat = CATEGORIAS_RECEITA.map(cat => ({
    ...cat, total: transacoes.filter(t => t.tipo === "receita" && t.categoria === cat.id).reduce((s, t) => s + Number(t.valor), 0),
  }));
  const despesasPorCat = CATEGORIAS_DESPESA.map(cat => ({
    ...cat, total: transacoes.filter(t => t.tipo === "despesa" && t.categoria === cat.id).reduce((s, t) => s + Number(t.valor), 0),
  }));

  // ── AUM Insights + Chart Data ─────────────────────────────────────────────

  const insightsAUM = (() => {
    if (snapshots.length === 0) return null;

    const shortNome = (nome: string) => {
      if (nome.includes("Rise Fixed Yield") && nome.includes("Sênior")) return "RFY Sênior";
      if (nome.includes("Rise Fixed Yield") && nome.includes("Sub"))    return "RFY Sub";
      if (nome.includes("RFY18") && nome.includes("Sub"))                 return "RFY18 Sub";
      if (nome.includes("RFY18") && nome.includes("Sênior"))              return "RFY18 Sênior";
      if (nome.includes("RFY18"))                                          return "RFY18";
      if (nome.includes("Rise Liquidity Yield 3"))                        return "RLY 3";
      if (nome.includes("Rise Liquidity Yield"))                          return "RLY";
      if (nome.includes("Capex Senior"))                                  return "Capex Sr";
      if (nome.includes("Capex Sub"))                                     return "Capex Sub";
      if (nome.includes("BATS"))                                          return "BATS";
      const parts = nome.split(" ");
      return parts.length > 2 ? `${parts[0]} ${parts[parts.length - 1]}` : nome;
    };

    const enriched = snapshots.map(s => {
      const prod = produtos.find(p => p.id === s.produto_id);
      const m = computarMetricas(s);
      return {
        ...s, ...m,
        nome:       prod?.nome  ?? s.produto_id,
        shortNome:  shortNome(prod?.nome ?? s.produto_id),
        cor:        prod?.cor   ?? "#f59e0b",
        feeRatioPct: s.aum_total > 0 ? (m.fees_gerados / s.aum_total) * 100 : 0,
        concentracaoPct: totalAUM > 0 ? (s.aum_total / totalAUM) * 100 : 0,
      };
    });

    const sorted = [...enriched].sort((a, b) => b.aum_total - a.aum_total);

    const maiorAUM      = enriched.reduce((a, b) => a.aum_total > b.aum_total ? a : b);
    const maiorFeeRatio = enriched.reduce((a, b) => a.feeRatioPct > b.feeRatioPct ? a : b);
    const maiorVolume   = enriched.reduce((a, b) => a.volume_transacionado > b.volume_transacionado ? a : b);
    const alertas       = enriched.filter(s => s.fees_gerados < 0);
    const feeRatioTotal = totalAUM > 0 ? (fees_gerados / totalAUM) * 100 : 0;

    // Chart data
    const aumChartData = sorted.map(s => ({
      name: s.shortNome, fullName: s.nome, aum: s.aum_total,
      fees: s.fees_gerados, cor: s.cor,
    }));
    const movChartData = [...enriched]
      .sort((a, b) => b.total_aportes - a.total_aportes)
      .map(s => ({ name: s.shortNome, aportes: s.total_aportes, resgates: s.total_resgates }));

    return { enriched, sorted, maiorAUM, maiorFeeRatio, maiorVolume,
             alertas, feeRatioTotal, aumChartData, movChartData };
  })();

  // ── Export AUM — Relatório Técnico Estruturado ────────────────────────────

  function exportarAUM() {
    const agora   = new Date().toLocaleString("pt-BR");
    const sep     = ",";
    const L: string[] = [];

    const row = (...cols: (string | number)[]) => L.push(cols.join(sep));
    const blank = () => L.push("");
    const sec = (title: string) => { blank(); row(`=== ${title} ===`); };

    // Cabeçalho
    row("RELATÓRIO DE AUM — Rise Finance");
    row(`Competência: ${formatarCompetencia(competencia)}  (${competencia})`);
    row(`Gerado em: ${agora}`);
    blank();

    // Sumário executivo
    sec("SUMÁRIO EXECUTIVO");
    row("Métrica", "Valor", "Observação");
    row("Total AUM", fmt(totalAUM), "Patrimônio sob gestão no período");
    row("Total Investido (Líquido)", fmt(total_investido), "Aportes − Resgates acumulados");
    row("Fees Gerados", fmt(fees_gerados), "AUM − Total Investido");
    row("Fee Ratio Total", `${totalAUM > 0 ? ((fees_gerados / totalAUM) * 100).toFixed(2) : "0.00"}%`, "Rendimento sobre AUM");
    row("Volume Total Transacionado", fmt(volume_transacionado), "Aportes + Resgates");
    row("Produtos Analisados", snapshots.length, "");
    if (insightsAUM) {
      row("Produtos com Alerta", insightsAUM.alertas.length, insightsAUM.alertas.length > 0 ? "AUM abaixo do capital investido" : "Nenhum");
    }

    // Detalhamento por produto
    sec("DETALHAMENTO POR PRODUTO");
    row("Produto", "AUM Total (R$)", "Aportes (R$)", "Resgates (R$)",
        "Investido Líquido (R$)", "Fees Gerados (R$)", "Fee Ratio (%)",
        "Volume Transacionado (R$)", "Conc. AUM (%)", "Status");
    (insightsAUM?.sorted ?? snapshots.map(s => ({
      ...s, ...computarMetricas(s),
      nome: produtos.find(p => p.id === s.produto_id)?.nome ?? s.produto_id,
      feeRatioPct: s.aum_total > 0 ? ((computarMetricas(s).fees_gerados / s.aum_total) * 100) : 0,
      concentracaoPct: totalAUM > 0 ? ((s.aum_total / totalAUM) * 100) : 0,
    }))).forEach(s => {
      row(
        s.nome,
        Number(s.aum_total).toFixed(2),
        Number(s.total_aportes).toFixed(2),
        Number(s.total_resgates).toFixed(2),
        s.total_investido.toFixed(2),
        s.fees_gerados.toFixed(2),
        s.feeRatioPct.toFixed(2),
        s.volume_transacionado.toFixed(2),
        s.concentracaoPct.toFixed(1),
        s.fees_gerados < 0 ? "ALERTA — AUM < Investido" : "OK",
      );
    });

    // Rankings
    if (insightsAUM) {
      sec("RANKINGS");
      row("Posição", "Critério", "Produto", "Valor");
      insightsAUM.sorted.forEach((s, i) => {
        row(`#${i + 1}`, "AUM", s.nome, Number(s.aum_total).toFixed(2));
      });
      blank();
      [...insightsAUM.enriched]
        .sort((a, b) => b.feeRatioPct - a.feeRatioPct)
        .forEach((s, i) => {
          row(`#${i + 1}`, "Fee Ratio (%)", s.nome, `${s.feeRatioPct.toFixed(2)}%`);
        });
      blank();
      [...insightsAUM.enriched]
        .sort((a, b) => b.volume_transacionado - a.volume_transacionado)
        .forEach((s, i) => {
          row(`#${i + 1}`, "Volume Transacionado", s.nome, Number(s.volume_transacionado).toFixed(2));
        });

      // Concentração
      sec("ANÁLISE DE CONCENTRAÇÃO");
      const top3 = insightsAUM.sorted.slice(0, 3).reduce((s, x) => s + x.aum_total, 0);
      row("Observação", "Valor");
      row("Top 3 produtos representam", `${totalAUM > 0 ? ((top3 / totalAUM) * 100).toFixed(1) : "0.0"}% do AUM total`);
      insightsAUM.sorted.forEach((s, i) => {
        row(`#${i + 1} — ${s.nome}`, `${s.concentracaoPct.toFixed(1)}% (${fmt(s.aum_total)})`);
      });

      // Alertas
      if (insightsAUM.alertas.length > 0) {
        sec("ALERTAS");
        row("Produto", "AUM (R$)", "Investido (R$)", "Diferença (R$)", "Detalhe");
        insightsAUM.alertas.forEach(a => {
          row(a.nome, Number(a.aum_total).toFixed(2), a.total_investido.toFixed(2),
              (a.aum_total - a.total_investido).toFixed(2), "AUM abaixo do capital aportado líquido");
        });
      }
    }

    const csv = L.join("\n");
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
    el.download = `relatorio-aum-${competencia}.csv`;
    el.click();
  }

  // ── Import helpers ────────────────────────────────────────────────────────

  const handleDragOver  = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === "text/csv") processCSV(f);
  };
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processCSV(f);
  };

  function processCSV(file: File) {
    setCsvFile(file); setImportErrors([]);
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: ({ data: rows }) => {
        const errors: string[] = []; const valid: any[] = [];
        (rows as any[]).forEach((row, i) => {
          if (!row.tipo || !row.descricao || !row.valor || !row.data || !row.competencia || !row.categoria) {
            errors.push(`Linha ${i + 2}: campos obrigatórios faltando`); return;
          }
          const tipo = row.tipo.toLowerCase().trim();
          if (tipo !== "receita" && tipo !== "despesa") { errors.push(`Linha ${i + 2}: tipo inválido`); return; }
          const cats = tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
          if (!cats.find(c => c.id === row.categoria.trim())) { errors.push(`Linha ${i + 2}: categoria inválida`); return; }
          valid.push({ tipo, categoria: row.categoria.trim(), descricao: row.descricao.trim(),
            valor: parseFloat(row.valor), data: row.data.trim(), competencia: row.competencia.trim(),
            status: "pendente", fonte: "csv", criado_por: userId });
        });
        if (errors.length) { setImportErrors(errors); }
        else if (valid.length) { setParsedData(valid); setImportStep("preview"); }
        else { setImportErrors(["Nenhuma transação válida encontrada"]); }
      },
      error: (err) => setImportErrors([`Erro: ${err.message}`]),
    });
  }

  async function handleConfirmImport() {
    setImportando(true);
    try {
      await bulkCreateTransacoes(parsedData);
      await recarregarTransacoes();
      setImportStep("success");
      setTimeout(() => { setIsImportModalOpen(false); setImportStep("upload"); setCsvFile(null); setParsedData([]); }, 2000);
    } catch { setImportErrors(["Erro ao importar. Tente novamente."]); setImportStep("upload"); }
    finally { setImportando(false); }
  }

  const downloadExemploCSV = () => {
    const content = `tipo,categoria,descricao,valor,data,competencia\nreceita,rec-assinaturas,Assinaturas mensais,125000.50,2026-02-01,2026-02\ndespesa,desp-tecnologia,Serviços de nuvem,45000.00,2026-02-05,2026-02`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8;" }));
    a.download = "exemplo-transacoes.csv"; a.click();
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-rise-fg text-[32px] mb-1">Financeiro</h1>
            <p className="text-rise-fg-2 text-[15px]">
              {formatarCompetencia(competencia)} · {vista === "operacional" ? "Vista Operacional" : "Vista Executiva"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Competência */}
            <input type="month" value={competencia} onChange={e => setCompetencia(e.target.value)}
              className="bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] focus:border-[#f59e0b] focus:outline-none" />

            {/* Vista toggle */}
            <div className="flex items-center gap-1 bg-rise-surface border border-rise-line rounded-lg p-1">
              {(["operacional", "executiva"] as const).map(v => (
                <button key={v} onClick={() => setVista(v)}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    vista === v ? "bg-[#f59e0b] text-[#000]" : "text-rise-fg-2 hover:text-rise-fg"
                  }`}>
                  {v === "operacional" ? "Operacional" : "Executiva"}
                </button>
              ))}
            </div>

            {podeEditar && vista === "operacional" && (
              <>
                <button onClick={() => setModalAUM(true)}
                  className="bg-[#f59e0b] text-[#000] px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:bg-[#d97706]">
                  <Layers size={16} /> Lançar AUM
                </button>
                {snapshots.length > 0 && (
                  <button onClick={exportarAUM}
                    className="bg-rise-raised border border-rise-line text-rise-fg px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:border-[#f59e0b]">
                    <Download size={16} /> Exportar AUM
                  </button>
                )}
                <button onClick={() => setModalTrans(true)}
                  className="bg-rise-raised border border-rise-line text-rise-fg px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:border-[#f59e0b]">
                  <Plus size={16} /> Transação
                </button>
                <button onClick={() => setIsImportModalOpen(true)}
                  className="bg-rise-raised border border-rise-line text-rise-fg px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:border-[#f59e0b]">
                  <Upload size={16} /> Importar CSV
                </button>
              </>
            )}
          </div>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#f59e0b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                MÓDULO AUM (Investment)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Layers size={18} className="text-[#f59e0b]" />
                <h2 className="text-rise-fg text-[18px] font-bold">Assets Under Management</h2>
                <span className="text-rise-fg-4 text-[13px]">· {formatarCompetencia(competencia)}</span>
              </div>

              {/* KPIs AUM */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total AUM", val: totalAUM, cor: "#14E9BC", icon: TrendingUp, desc: "Valor sob gestão" },
                  { label: "Total Investido", val: total_investido, cor: "#6B8AFF", icon: DollarSign, desc: "Aportes − Resgates" },
                  { label: "Fees Gerados", val: fees_gerados, cor: "#f59e0b", icon: TrendingUp, desc: "AUM − Total Investido" },
                  { label: "Volume Transacionado", val: volume_transacionado, cor: "#bdbdbd", icon: LayoutGrid, desc: "Aportes + Resgates" },
                ].map(({ label, val, cor, icon: Icon, desc }) => (
                  <div key={label} className="bg-rise-surface border border-rise-line rounded-xl p-5 hover:border-rise-line-3 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-rise-fg-2 text-[13px]">{label}</p>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cor}20` }}>
                        <Icon size={17} style={{ color: cor }} />
                      </div>
                    </div>
                    <p className="text-rise-fg text-[22px] font-bold mb-1">{fmt(val)}</p>
                    <p className="text-rise-fg-4 text-[11px]">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown por produto */}
              {snapshots.length === 0 ? (
                <div className="bg-rise-surface border border-rise-line-2 border-dashed rounded-xl p-10 text-center">
                  <Layers size={32} className="text-rise-fg-4 mx-auto mb-3" />
                  <p className="text-rise-fg-4 text-[14px]">Nenhum snapshot para {formatarCompetencia(competencia)}.</p>
                  {podeEditar && <p className="text-rise-fg-4 text-[13px] mt-1">Clique em "Lançar AUM" para adicionar.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {snapshots.map(snap => {
                    const produto = produtos.find(p => p.id === snap.produto_id);
                    const m = computarMetricas(snap);
                    return (
                      <div key={snap.id} className="bg-rise-surface border border-rise-line rounded-xl p-5 hover:border-rise-line-3 transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${produto?.cor ?? "#f59e0b"}20` }}>
                            <Package size={18} style={{ color: produto?.cor ?? "#f59e0b" }} />
                          </div>
                          <div>
                            <p className="text-rise-fg text-[15px] font-bold">{produto?.nome ?? snap.produto_id}</p>
                            <p className="text-rise-fg-4 text-[12px]">{snap.classe} · {formatarCompetencia(snap.competencia)}</p>
                          </div>
                          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f59e0b]/10 text-[#f59e0b]">AUM</span>
                        </div>
                        <div className="space-y-2">
                          {[
                            { label: "Total AUM",      val: snap.aum_total,      cor: "#14E9BC" },
                            { label: "Total Aportes",  val: snap.total_aportes,  cor: "#28d939" },
                            { label: "Total Resgates", val: snap.total_resgates, cor: "#ec5d5e" },
                            { label: "Total Investido",val: m.total_investido,   cor: "#6B8AFF" },
                            { label: "Fees Gerados",   val: m.fees_gerados,      cor: "#f59e0b" },
                            { label: "Vol. Transacionado", val: m.volume_transacionado, cor: "#bdbdbd" },
                          ].map(({ label, val, cor }) => (
                            <div key={label} className="flex items-center justify-between">
                              <span className="text-rise-fg-3 text-[12px]">{label}</span>
                              <span className="text-[13px] font-semibold" style={{ color: cor }}>{fmt(Number(val))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                INSIGHTS-CHAVE AUM
            ═══════════════════════════════════════════════════════════════ */}
            {insightsAUM && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={18} className="text-[#f59e0b]" />
                  <h2 className="text-rise-fg text-[18px] font-bold">Insights-Chave</h2>
                  <span className="text-rise-fg-4 text-[13px]">· {formatarCompetencia(competencia)}</span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-rise-surface border border-[#14E9BC]/30 rounded-xl p-5">
                    <p className="text-rise-fg-4 text-[11px] uppercase tracking-wider mb-2">Maior AUM</p>
                    <p className="text-rise-fg-2 text-[13px] font-semibold truncate mb-1">{insightsAUM.maiorAUM.shortNome}</p>
                    <p className="text-[#14E9BC] text-[20px] font-bold leading-tight">{fmt(insightsAUM.maiorAUM.aum_total)}</p>
                    <p className="text-rise-fg-4 text-[11px] mt-1">{insightsAUM.maiorAUM.concentracaoPct.toFixed(1)}% do AUM total</p>
                  </div>
                  <div className="bg-rise-surface border border-[#f59e0b]/30 rounded-xl p-5">
                    <p className="text-rise-fg-4 text-[11px] uppercase tracking-wider mb-2">Maior Rendimento</p>
                    <p className="text-rise-fg-2 text-[13px] font-semibold truncate mb-1">{insightsAUM.maiorFeeRatio.shortNome}</p>
                    <p className="text-[#f59e0b] text-[20px] font-bold leading-tight">{insightsAUM.maiorFeeRatio.feeRatioPct.toFixed(2)}%</p>
                    <p className="text-rise-fg-4 text-[11px] mt-1">fees / AUM · {fmt(insightsAUM.maiorFeeRatio.fees_gerados)}</p>
                  </div>
                  <div className="bg-rise-surface border border-[#6B8AFF]/30 rounded-xl p-5">
                    <p className="text-rise-fg-4 text-[11px] uppercase tracking-wider mb-2">Maior Atividade</p>
                    <p className="text-rise-fg-2 text-[13px] font-semibold truncate mb-1">{insightsAUM.maiorVolume.shortNome}</p>
                    <p className="text-[#6B8AFF] text-[20px] font-bold leading-tight">{fmt(insightsAUM.maiorVolume.volume_transacionado)}</p>
                    <p className="text-rise-fg-4 text-[11px] mt-1">volume transacionado</p>
                  </div>
                  <div className="bg-rise-surface border border-[#28d939]/30 rounded-xl p-5">
                    <p className="text-rise-fg-4 text-[11px] uppercase tracking-wider mb-2">Fee Ratio Consolidado</p>
                    <p className="text-rise-fg-2 text-[13px] font-semibold mb-1">{snapshots.length} produto{snapshots.length !== 1 ? "s" : ""}</p>
                    <p className="text-[#28d939] text-[20px] font-bold leading-tight">{insightsAUM.feeRatioTotal.toFixed(2)}%</p>
                    <p className="text-rise-fg-4 text-[11px] mt-1">fees / AUM total · {fmt(fees_gerados)}</p>
                  </div>
                </div>

                {/* Gráficos lado a lado */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

                  {/* AUM por Produto — barras horizontais */}
                  <div className="bg-rise-surface border border-rise-line rounded-xl p-5">
                    <p className="text-rise-fg text-[14px] font-semibold mb-4">AUM por Produto</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={insightsAUM.aumChartData} layout="vertical"
                        margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" width={72}
                          tick={{ fill: "#bdbdbd", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--rise-raised)", border: "1px solid var(--rise-line)", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number, _: string, p: any) => [fmt(v), p.payload.fullName]}
                          cursor={{ fill: "#ffffff08" }}
                        />
                        <Bar dataKey="aum" radius={[0, 4, 4, 0]}>
                          {insightsAUM.aumChartData.map((e, i) => (
                            <Cell key={i} fill={e.cor} fillOpacity={0.85} />
                          ))}
                          <LabelList dataKey="aum" position="right"
                            formatter={(v: number) => `${totalAUM > 0 ? ((v / totalAUM) * 100).toFixed(0) : 0}%`}
                            style={{ fill: "#666", fontSize: 11 }} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Aportes vs Resgates — barras agrupadas */}
                  <div className="bg-rise-surface border border-rise-line rounded-xl p-5">
                    <p className="text-rise-fg text-[14px] font-semibold mb-4">Aportes vs Resgates</p>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={insightsAUM.movChartData}
                        margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#bdbdbd", fontSize: 10 }}
                          axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{ backgroundColor: "var(--rise-raised)", border: "1px solid var(--rise-line)", borderRadius: 8, fontSize: 12 }}
                          formatter={(v: number) => fmt(v)}
                          cursor={{ fill: "#ffffff08" }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                        <Bar dataKey="aportes" name="Aportes"  fill="#28d939" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
                        <Bar dataKey="resgates" name="Resgates" fill="#ec5d5e" fillOpacity={0.85} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Tabela de análise cruzada */}
                <div className="bg-rise-surface border border-rise-line rounded-xl overflow-hidden mb-4">
                  <div className="px-5 py-3.5 border-b border-rise-line-2">
                    <p className="text-rise-fg text-[14px] font-semibold">Análise Cruzada por Produto</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-rise-raised">
                          {["Produto", "AUM", "Conc.", "Aportes", "Resgates", "Investido", "Fees", "Fee %"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-rise-fg-4 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {insightsAUM.sorted.map((s, i) => {
                          const feeOk = s.fees_gerados >= 0;
                          return (
                            <tr key={s.produto_id} className={`border-b border-[#111] hover:bg-rise-surface transition-colors ${i === 0 ? "bg-[#f59e0b]/4" : ""}`}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.cor }} />
                                  <span className="text-rise-fg text-[13px] font-medium">{s.shortNome}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#14E9BC] text-[13px] font-semibold">{fmt(s.aum_total)}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 bg-rise-raised rounded-full h-1.5">
                                    <div className="h-1.5 rounded-full" style={{ width: `${s.concentracaoPct}%`, backgroundColor: s.cor }} />
                                  </div>
                                  <span className="text-rise-fg-4 text-[11px]">{s.concentracaoPct.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-[#28d939] text-[13px]">{fmt(s.total_aportes)}</td>
                              <td className="px-4 py-3 text-[#ec5d5e] text-[13px]">{fmt(s.total_resgates)}</td>
                              <td className="px-4 py-3 text-[#6B8AFF] text-[13px]">{fmt(s.total_investido)}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[13px] font-semibold ${feeOk ? "text-[#f59e0b]" : "text-[#ec5d5e]"}`}>
                                  {fmt(s.fees_gerados)}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                  feeOk ? "bg-[#f59e0b]/15 text-[#f59e0b]" : "bg-[#ec5d5e]/15 text-[#ec5d5e]"
                                }`}>
                                  {s.feeRatioPct.toFixed(2)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Alertas */}
                {insightsAUM.alertas.length > 0 && (
                  <div className="bg-[#ec5d5e]/8 border border-[#ec5d5e]/30 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-[#ec5d5e] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[#ec5d5e] text-[13px] font-semibold mb-1">
                        {insightsAUM.alertas.length} produto{insightsAUM.alertas.length > 1 ? "s" : ""} com AUM abaixo do capital investido
                      </p>
                      <p className="text-[#ec5d5e]/70 text-[12px]">
                        {insightsAUM.alertas.map(a => a.shortNome).join(", ")} — fees negativos indicam patrimônio atual menor que o capital aportado líquido.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                MÓDULO OPERACIONAL
            ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={18} className="text-[#28d939]" />
                <h2 className="text-rise-fg text-[18px] font-bold">Financeiro Operacional</h2>
                <span className="text-rise-fg-4 text-[13px]">· {formatarCompetencia(competencia)}</span>
              </div>

              {/* KPIs operacionais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Receita Total", val: receitaTotal, cor: "#28d939", arrow: "up", diff: null },
                  { label: "Despesas",      val: despesaTotal, cor: "#ec5d5e", arrow: "down", diff: null },
                  { label: "Lucro Líquido", val: lucroLiquido, cor: "#14E9BC", arrow: lucroLiquido >= 0 ? "up" : "down", diff: null },
                  { label: "Margem", val: null, pctVal: margem, cor: "#f59e0b", arrow: "up", diff: null },
                ].map(({ label, val, pctVal, cor, arrow }) => (
                  <div key={label} className="bg-rise-surface border border-rise-line rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-rise-fg-2 text-[13px]">{label}</p>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cor}20` }}>
                        {arrow === "up" ? <TrendingUp size={17} style={{ color: cor }} /> : <TrendingDown size={17} style={{ color: cor }} />}
                      </div>
                    </div>
                    <p className="text-rise-fg text-[22px] font-bold">
                      {pctVal !== undefined ? `${pctVal.toFixed(1)}%` : fmt(val ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico fluxo de caixa — visível nas duas vistas */}
            <div className="bg-rise-surface border border-rise-line rounded-xl p-6 mb-6">
              <h2 className="text-rise-fg text-[18px] font-bold mb-6">Fluxo de Caixa — Últimos 6 meses</h2>
              {fluxo.every(f => f.receitas === 0 && f.despesas === 0) ? (
                <div className="flex items-center justify-center h-[200px] text-rise-fg-4 text-[14px]">
                  Sem transações no período. Lance os dados para ver o gráfico.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fluxo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="mesNome" stroke="#555" style={{ fontSize: 12 }} />
                    <YAxis stroke="#555" style={{ fontSize: 12 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--rise-raised)", border: "1px solid var(--rise-line)", borderRadius: 8 }}
                      formatter={(v: any) => fmt(v)} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#28d939" strokeWidth={2} dot={{ r: 4, fill: "#28d939" }} />
                    <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#ec5d5e" strokeWidth={2} dot={{ r: 4, fill: "#ec5d5e" }} />
                    <Line type="monotone" dataKey="lucro"    name="Lucro"    stroke="#14E9BC" strokeWidth={2} dot={{ r: 4, fill: "#14E9BC" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Categorias + Transações (somente vista operacional) */}
            {vista === "operacional" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {[
                    { titulo: "Receitas por Categoria", cats: receitasPorCat },
                    { titulo: "Despesas por Categoria", cats: despesasPorCat },
                  ].map(({ titulo, cats }) => {
                    const max = Math.max(...cats.map(c => c.total), 1);
                    return (
                      <div key={titulo} className="bg-rise-surface border border-rise-line rounded-xl p-6">
                        <h3 className="text-rise-fg text-[16px] font-bold mb-4">{titulo}</h3>
                        <div className="space-y-3">
                          {cats.map(cat => (
                            <div key={cat.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-rise-fg text-[13px]">{cat.nome}</span>
                                <span className="text-rise-fg text-[13px] font-semibold">{fmt(cat.total)}</span>
                              </div>
                              <div className="w-full bg-rise-raised rounded-full h-1.5">
                                <div className="h-1.5 rounded-full transition-all" style={{ width: `${(cat.total / max) * 100}%`, backgroundColor: cat.cor }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabela de transações */}
                <div className="bg-rise-surface border border-rise-line rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <h2 className="text-rise-fg text-[18px] font-bold">Transações</h2>
                    <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value as any); }}
                      className="bg-rise-raised border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[13px] focus:border-[#f59e0b] focus:outline-none">
                      <option value="todos">Todos os Tipos</option>
                      <option value="receita">Receitas</option>
                      <option value="despesa">Despesas</option>
                    </select>
                  </div>

                  {transacoes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-rise-fg-4 text-[14px]">Nenhuma transação em {formatarCompetencia(competencia)}.</p>
                      {podeEditar && <p className="text-rise-fg-4 text-[13px] mt-1">Use "+ Transação" ou "Importar CSV" para adicionar.</p>}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-rise-line-2">
                            {["Data", "Tipo", "Descrição", "Categoria", "Status", "Valor"].map(h => (
                              <th key={h} className={`px-4 py-3 text-[13px] font-semibold text-rise-fg ${h === "Valor" ? "text-right" : "text-left"}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transacoes.slice(0, 20).map(t => {
                            const cats = t.tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
                            const cat = cats.find(c => c.id === t.categoria);
                            return (
                              <tr key={t.id} className="border-b border-rise-raised hover:bg-rise-surface transition-colors">
                                <td className="px-4 py-3 text-rise-fg-2 text-[13px]">{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${t.tipo === "receita" ? "bg-[#28d939]/20 text-[#28d939]" : "bg-[#ec5d5e]/20 text-[#ec5d5e]"}`}>
                                    {t.tipo === "receita" ? "RECEITA" : "DESPESA"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-rise-fg text-[13px]">{t.descricao}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-0.5 rounded text-[11px]" style={{ backgroundColor: `${cat?.cor}20`, color: cat?.cor }}>{cat?.nome ?? t.categoria}</span>
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                    t.status === "confirmado" || t.status === "pago" ? "bg-[#28d939]/10 text-[#28d939]" : "bg-[#f59e0b]/10 text-[#f59e0b]"
                                  }`}>{t.status}</span>
                                </td>
                                <td className={`px-4 py-3 text-right text-[14px] font-semibold ${t.tipo === "receita" ? "text-[#28d939]" : "text-[#ec5d5e]"}`}>
                                  {t.tipo === "receita" ? "+" : "-"}{fmt(Number(t.valor))}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modais */}
      {modalAUM && <ModalAUM produtos={produtos} competencia={competencia} userId={userId} onSalvo={carregarTudo} onFechar={() => setModalAUM(false)} />}
      {modalTrans && <ModalTransacao userId={userId} onSalvo={recarregarTransacoes} onFechar={() => setModalTrans(false)} />}

      {/* Modal CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-rise-surface border border-rise-line rounded-xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-rise-line">
              <h2 className="text-rise-fg text-[22px] font-bold">Importar Transações CSV</h2>
              <button onClick={() => { setIsImportModalOpen(false); setImportStep("upload"); setCsvFile(null); setParsedData([]); setImportErrors([]); }}
                className="text-rise-fg-4 hover:text-rise-fg"><X size={20} /></button>
            </div>

            {importStep === "upload" && (
              <div className="p-6">
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 mb-5 text-[13px] text-rise-fg-2 space-y-1">
                  <p><strong className="text-rise-fg">Colunas obrigatórias:</strong> tipo, categoria, descricao, valor, data (AAAA-MM-DD), competencia (AAAA-MM)</p>
                  <p><strong className="text-rise-fg">Tipo:</strong> receita | despesa</p>
                  <button onClick={downloadExemploCSV} className="mt-2 text-[#f59e0b] hover:underline flex items-center gap-2 text-[12px]">
                    <FileSpreadsheet size={14} /> Baixar CSV de exemplo
                  </button>
                </div>
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${isDragging ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-rise-line hover:border-rise-fg-4"}`}>
                  <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="fin-csv" />
                  <label htmlFor="fin-csv" className="cursor-pointer">
                    <FileSpreadsheet size={40} className="text-[#f59e0b] mx-auto mb-3" />
                    {csvFile ? <p className="text-rise-fg text-[15px]">{csvFile.name}</p> : (
                      <><p className="text-rise-fg text-[16px] mb-1">Arraste ou clique para selecionar</p><p className="text-rise-fg-4 text-[13px]">Apenas .csv</p></>
                    )}
                  </label>
                </div>
                {importErrors.length > 0 && (
                  <div className="mt-4 bg-[#ec5d5e]/10 border border-[#ec5d5e]/30 rounded-lg p-4">
                    {importErrors.map((e, i) => <p key={i} className="text-[#ec5d5e] text-[13px]">• {e}</p>)}
                  </div>
                )}
              </div>
            )}

            {importStep === "preview" && (
              <div className="p-6">
                <p className="text-rise-fg-2 text-[14px] mb-4">{parsedData.length} transações prontas para importar.</p>
                <div className="overflow-x-auto border border-rise-line rounded-lg mb-4 max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-rise-surface sticky top-0">
                      <tr>{["Tipo","Categoria","Descrição","Valor","Data","Comp."].map(h => <th key={h} className="px-3 py-2 text-left text-[12px] text-rise-fg-2 border-b border-rise-line">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {parsedData.map((t, i) => (
                        <tr key={i} className="border-b border-rise-raised">
                          <td className="px-3 py-2 text-[12px]"><span className={t.tipo === "receita" ? "text-[#28d939]" : "text-[#ec5d5e]"}>{t.tipo}</span></td>
                          <td className="px-3 py-2 text-rise-fg-2 text-[12px]">{t.categoria}</td>
                          <td className="px-3 py-2 text-rise-fg text-[12px]">{t.descricao}</td>
                          <td className="px-3 py-2 text-rise-fg text-[12px]">{fmt(t.valor)}</td>
                          <td className="px-3 py-2 text-rise-fg-2 text-[12px]">{t.data}</td>
                          <td className="px-3 py-2 text-rise-fg-2 text-[12px]">{t.competencia}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importStep === "success" && (
              <div className="p-10 text-center">
                <CheckCircle size={48} className="text-[#28d939] mx-auto mb-4" />
                <p className="text-rise-fg text-[20px] font-bold">{parsedData.length} transações importadas!</p>
              </div>
            )}

            {importStep !== "success" && (
              <div className="flex justify-end gap-3 p-6 border-t border-rise-line">
                <button onClick={() => { setIsImportModalOpen(false); setImportStep("upload"); setCsvFile(null); setParsedData([]); setImportErrors([]); }}
                  className="px-4 py-2.5 rounded-lg bg-rise-raised text-rise-fg-2 text-[14px] hover:bg-rise-raised">Cancelar</button>
                {importStep === "preview" && (
                  <button onClick={handleConfirmImport} disabled={importando}
                    className="px-5 py-2.5 rounded-lg bg-[#f59e0b] text-[#000] font-semibold text-[14px] hover:bg-[#d97706] disabled:opacity-50">
                    {importando ? "Importando..." : `Importar ${parsedData.length} transações`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
