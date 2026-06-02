import { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  DollarSign, TrendingUp, TrendingDown, Upload, Download, X,
  CheckCircle, AlertCircle, FileSpreadsheet, ArrowUpRight, ArrowDownRight,
  Package, Plus, LayoutGrid, Layers, ChevronDown,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Papa from "papaparse";
import {
  getProdutos, getSnapshots, getTransacoes, getFluxoCaixaMensal,
  createTransacao, bulkCreateTransacoes, upsertSnapshot,
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
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? "");
  const [comp, setComp]           = useState(competencia);
  const [aum, setAum]             = useState("");
  const [aportes, setAportes]     = useState("");
  const [resgates, setResgates]   = useState("");
  const [notas, setNotas]         = useState("");
  const [salvando, setSalvando]   = useState(false);
  const [erro, setErro]           = useState("");

  const numAum      = parseFloat(aum.replace(",", ".")) || 0;
  const numAportes  = parseFloat(aportes.replace(",", ".")) || 0;
  const numResgates = parseFloat(resgates.replace(",", ".")) || 0;
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
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0f0f0f] border border-[#333] rounded-xl w-full max-w-[560px]">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-[#eee] text-[20px] font-bold">Lançar AUM</h2>
          <button onClick={onFechar} className="text-[#555] hover:text-[#eee] transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Produto</label>
            <select value={produtoId} onChange={e => setProdutoId(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none">
              {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Competência</label>
            <input type="month" value={comp} onChange={e => setComp(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total AUM", val: aum, set: setAum, cor: "#14E9BC" },
              { label: "Total Aportes", val: aportes, set: setAportes, cor: "#28d939" },
              { label: "Total Resgates", val: resgates, set: setResgates, cor: "#ec5d5e" },
            ].map(({ label, val, set, cor }) => (
              <div key={label}>
                <label className="block text-[12px] font-semibold mb-1.5" style={{ color: cor }}>{label}</label>
                <input value={val} onChange={e => set(e.target.value)} placeholder="0,00" type="number" step="0.01"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:outline-none"
                  style={{ borderColor: val ? cor : undefined }} />
              </div>
            ))}
          </div>

          {/* Computed preview */}
          <div className="bg-[#1a1a1a] border border-[#222] rounded-lg p-4 grid grid-cols-3 gap-3">
            {[
              { label: "Total Investido", val: m.total_investido, cor: "#6B8AFF" },
              { label: "Fees Gerados",    val: m.fees_gerados,    cor: "#f59e0b" },
              { label: "Vol. Transacionado", val: m.volume_transacionado, cor: "#bdbdbd" },
            ].map(({ label, val, cor }) => (
              <div key={label} className="text-center">
                <p className="text-[11px] mb-1" style={{ color: cor }}>{label}</p>
                <p className="text-[#eee] text-[13px] font-bold">{fmt(val)}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Notas (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none resize-none" />
          </div>

          {erro && <p className="text-[#ec5d5e] text-[13px]">{erro}</p>}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onFechar} className="px-4 py-2.5 rounded-lg bg-[#1a1a1a] text-[#bdbdbd] text-[14px] hover:bg-[#252525]">Cancelar</button>
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
      <div className="bg-[#0f0f0f] border border-[#333] rounded-xl w-full max-w-[480px]">
        <div className="flex items-center justify-between p-6 border-b border-[#333]">
          <h2 className="text-[#eee] text-[20px] font-bold">Nova Transação</h2>
          <button onClick={onFechar} className="text-[#555] hover:text-[#eee]"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-2">
            {(["receita", "despesa"] as const).map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`flex-1 py-2 rounded-lg text-[14px] font-semibold transition-colors ${
                  tipo === t
                    ? t === "receita" ? "bg-[#28d939]/20 text-[#28d939] border border-[#28d939]/40" : "bg-[#ec5d5e]/20 text-[#ec5d5e] border border-[#ec5d5e]/40"
                    : "bg-[#1a1a1a] text-[#555] border border-transparent"
                }`}>
                {t === "receita" ? "Receita" : "Despesa"}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Categoria</label>
            <select value={categoria} onChange={e => setCategoria(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none">
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Descrição</label>
            <input value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Descrição da transação"
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Valor (R$)</label>
              <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none">
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Data</label>
              <input type="date" value={data} onChange={e => setData(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none" />
            </div>
            <div>
              <label className="block text-[#bdbdbd] text-[12px] font-semibold mb-1.5">Competência</label>
              <input type="month" value={competencia} onChange={e => setComp(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none" />
            </div>
          </div>
          {erro && <p className="text-[#ec5d5e] text-[13px]">{erro}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onFechar} className="px-4 py-2.5 rounded-lg bg-[#1a1a1a] text-[#bdbdbd] text-[14px] hover:bg-[#252525]">Cancelar</button>
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

  useEffect(() => { carregarTudo(); }, [competencia]);

  async function carregarTudo() {
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
  }

  async function recarregarTransacoes() {
    const trans = await getTransacoes({ competencia, tipo: filtroTipo });
    setTransacoes(trans);
    const fl = await getFluxoCaixaMensal(ultimasSeisCom());
    setFluxo(fl);
  }

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
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-bold text-[#eee] text-[32px] mb-1">Financeiro</h1>
            <p className="text-[#bdbdbd] text-[15px]">
              {formatarCompetencia(competencia)} · {vista === "operacional" ? "Vista Operacional" : "Vista Executiva"}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Competência */}
            <input type="month" value={competencia} onChange={e => setCompetencia(e.target.value)}
              className="bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-[#eee] text-[14px] focus:border-[#f59e0b] focus:outline-none" />

            {/* Vista toggle */}
            <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#333] rounded-lg p-1">
              {(["operacional", "executiva"] as const).map(v => (
                <button key={v} onClick={() => setVista(v)}
                  className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors ${
                    vista === v ? "bg-[#f59e0b] text-[#000]" : "text-[#bdbdbd] hover:text-[#eee]"
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
                <button onClick={() => setModalTrans(true)}
                  className="bg-[#1a1a1a] border border-[#333] text-[#eee] px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:border-[#f59e0b]">
                  <Plus size={16} /> Transação
                </button>
                <button onClick={() => setIsImportModalOpen(true)}
                  className="bg-[#1a1a1a] border border-[#333] text-[#eee] px-4 py-2 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:border-[#f59e0b]">
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
                <h2 className="text-[#eee] text-[18px] font-bold">Assets Under Management</h2>
                <span className="text-[#555] text-[13px]">· {formatarCompetencia(competencia)}</span>
              </div>

              {/* KPIs AUM */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total AUM", val: totalAUM, cor: "#14E9BC", icon: TrendingUp, desc: "Valor sob gestão" },
                  { label: "Total Investido", val: total_investido, cor: "#6B8AFF", icon: DollarSign, desc: "Aportes − Resgates" },
                  { label: "Fees Gerados", val: fees_gerados, cor: "#f59e0b", icon: TrendingUp, desc: "AUM − Total Investido" },
                  { label: "Volume Transacionado", val: volume_transacionado, cor: "#bdbdbd", icon: LayoutGrid, desc: "Aportes + Resgates" },
                ].map(({ label, val, cor, icon: Icon, desc }) => (
                  <div key={label} className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5 hover:border-[#444] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#bdbdbd] text-[13px]">{label}</p>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cor}20` }}>
                        <Icon size={17} style={{ color: cor }} />
                      </div>
                    </div>
                    <p className="text-[#eee] text-[22px] font-bold mb-1">{fmt(val)}</p>
                    <p className="text-[#555] text-[11px]">{desc}</p>
                  </div>
                ))}
              </div>

              {/* Breakdown por produto */}
              {snapshots.length === 0 ? (
                <div className="bg-[#0f0f0f] border border-[#222] border-dashed rounded-xl p-10 text-center">
                  <Layers size={32} className="text-[#333] mx-auto mb-3" />
                  <p className="text-[#555] text-[14px]">Nenhum snapshot para {formatarCompetencia(competencia)}.</p>
                  {podeEditar && <p className="text-[#333] text-[13px] mt-1">Clique em "Lançar AUM" para adicionar.</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {snapshots.map(snap => {
                    const produto = produtos.find(p => p.id === snap.produto_id);
                    const m = computarMetricas(snap);
                    return (
                      <div key={snap.id} className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5 hover:border-[#444] transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${produto?.cor ?? "#f59e0b"}20` }}>
                            <Package size={18} style={{ color: produto?.cor ?? "#f59e0b" }} />
                          </div>
                          <div>
                            <p className="text-[#eee] text-[15px] font-bold">{produto?.nome ?? snap.produto_id}</p>
                            <p className="text-[#555] text-[12px]">{snap.classe} · {formatarCompetencia(snap.competencia)}</p>
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
                              <span className="text-[#666] text-[12px]">{label}</span>
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
                MÓDULO OPERACIONAL
            ═══════════════════════════════════════════════════════════════ */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={18} className="text-[#28d939]" />
                <h2 className="text-[#eee] text-[18px] font-bold">Financeiro Operacional</h2>
                <span className="text-[#555] text-[13px]">· {formatarCompetencia(competencia)}</span>
              </div>

              {/* KPIs operacionais */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Receita Total", val: receitaTotal, cor: "#28d939", arrow: "up", diff: null },
                  { label: "Despesas",      val: despesaTotal, cor: "#ec5d5e", arrow: "down", diff: null },
                  { label: "Lucro Líquido", val: lucroLiquido, cor: "#14E9BC", arrow: lucroLiquido >= 0 ? "up" : "down", diff: null },
                  { label: "Margem", val: null, pctVal: margem, cor: "#f59e0b", arrow: "up", diff: null },
                ].map(({ label, val, pctVal, cor, arrow }) => (
                  <div key={label} className="bg-[#0f0f0f] border border-[#333] rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#bdbdbd] text-[13px]">{label}</p>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cor}20` }}>
                        {arrow === "up" ? <TrendingUp size={17} style={{ color: cor }} /> : <TrendingDown size={17} style={{ color: cor }} />}
                      </div>
                    </div>
                    <p className="text-[#eee] text-[22px] font-bold">
                      {pctVal !== undefined ? `${pctVal.toFixed(1)}%` : fmt(val ?? 0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico fluxo de caixa — visível nas duas vistas */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6 mb-6">
              <h2 className="text-[#eee] text-[18px] font-bold mb-6">Fluxo de Caixa — Últimos 6 meses</h2>
              {fluxo.every(f => f.receitas === 0 && f.despesas === 0) ? (
                <div className="flex items-center justify-center h-[200px] text-[#555] text-[14px]">
                  Sem transações no período. Lance os dados para ver o gráfico.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={fluxo}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="mesNome" stroke="#555" style={{ fontSize: 12 }} />
                    <YAxis stroke="#555" style={{ fontSize: 12 }} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 8 }}
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
                      <div key={titulo} className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
                        <h3 className="text-[#eee] text-[16px] font-bold mb-4">{titulo}</h3>
                        <div className="space-y-3">
                          {cats.map(cat => (
                            <div key={cat.id}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[#eee] text-[13px]">{cat.nome}</span>
                                <span className="text-[#eee] text-[13px] font-semibold">{fmt(cat.total)}</span>
                              </div>
                              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
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
                <div className="bg-[#0f0f0f] border border-[#333] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                    <h2 className="text-[#eee] text-[18px] font-bold">Transações</h2>
                    <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value as any); }}
                      className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#eee] text-[13px] focus:border-[#f59e0b] focus:outline-none">
                      <option value="todos">Todos os Tipos</option>
                      <option value="receita">Receitas</option>
                      <option value="despesa">Despesas</option>
                    </select>
                  </div>

                  {transacoes.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-[#555] text-[14px]">Nenhuma transação em {formatarCompetencia(competencia)}.</p>
                      {podeEditar && <p className="text-[#333] text-[13px] mt-1">Use "+ Transação" ou "Importar CSV" para adicionar.</p>}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-[#222]">
                            {["Data", "Tipo", "Descrição", "Categoria", "Status", "Valor"].map(h => (
                              <th key={h} className={`px-4 py-3 text-[13px] font-semibold text-[#eee] ${h === "Valor" ? "text-right" : "text-left"}`}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {transacoes.slice(0, 20).map(t => {
                            const cats = t.tipo === "receita" ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA;
                            const cat = cats.find(c => c.id === t.categoria);
                            return (
                              <tr key={t.id} className="border-b border-[#1a1a1a] hover:bg-[#111] transition-colors">
                                <td className="px-4 py-3 text-[#bdbdbd] text-[13px]">{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${t.tipo === "receita" ? "bg-[#28d939]/20 text-[#28d939]" : "bg-[#ec5d5e]/20 text-[#ec5d5e]"}`}>
                                    {t.tipo === "receita" ? "RECEITA" : "DESPESA"}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[#eee] text-[13px]">{t.descricao}</td>
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
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="text-[#eee] text-[22px] font-bold">Importar Transações CSV</h2>
              <button onClick={() => { setIsImportModalOpen(false); setImportStep("upload"); setCsvFile(null); setParsedData([]); setImportErrors([]); }}
                className="text-[#555] hover:text-[#eee]"><X size={20} /></button>
            </div>

            {importStep === "upload" && (
              <div className="p-6">
                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 mb-5 text-[13px] text-[#bdbdbd] space-y-1">
                  <p><strong className="text-[#eee]">Colunas obrigatórias:</strong> tipo, categoria, descricao, valor, data (AAAA-MM-DD), competencia (AAAA-MM)</p>
                  <p><strong className="text-[#eee]">Tipo:</strong> receita | despesa</p>
                  <button onClick={downloadExemploCSV} className="mt-2 text-[#f59e0b] hover:underline flex items-center gap-2 text-[12px]">
                    <FileSpreadsheet size={14} /> Baixar CSV de exemplo
                  </button>
                </div>
                <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${isDragging ? "border-[#f59e0b] bg-[#f59e0b]/5" : "border-[#333] hover:border-[#555]"}`}>
                  <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" id="fin-csv" />
                  <label htmlFor="fin-csv" className="cursor-pointer">
                    <FileSpreadsheet size={40} className="text-[#f59e0b] mx-auto mb-3" />
                    {csvFile ? <p className="text-[#eee] text-[15px]">{csvFile.name}</p> : (
                      <><p className="text-[#eee] text-[16px] mb-1">Arraste ou clique para selecionar</p><p className="text-[#555] text-[13px]">Apenas .csv</p></>
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
                <p className="text-[#bdbdbd] text-[14px] mb-4">{parsedData.length} transações prontas para importar.</p>
                <div className="overflow-x-auto border border-[#333] rounded-lg mb-4 max-h-[300px] overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-[#111] sticky top-0">
                      <tr>{["Tipo","Categoria","Descrição","Valor","Data","Comp."].map(h => <th key={h} className="px-3 py-2 text-left text-[12px] text-[#bdbdbd] border-b border-[#333]">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {parsedData.map((t, i) => (
                        <tr key={i} className="border-b border-[#1a1a1a]">
                          <td className="px-3 py-2 text-[12px]"><span className={t.tipo === "receita" ? "text-[#28d939]" : "text-[#ec5d5e]"}>{t.tipo}</span></td>
                          <td className="px-3 py-2 text-[#bdbdbd] text-[12px]">{t.categoria}</td>
                          <td className="px-3 py-2 text-[#eee] text-[12px]">{t.descricao}</td>
                          <td className="px-3 py-2 text-[#eee] text-[12px]">{fmt(t.valor)}</td>
                          <td className="px-3 py-2 text-[#bdbdbd] text-[12px]">{t.data}</td>
                          <td className="px-3 py-2 text-[#bdbdbd] text-[12px]">{t.competencia}</td>
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
                <p className="text-[#eee] text-[20px] font-bold">{parsedData.length} transações importadas!</p>
              </div>
            )}

            {importStep !== "success" && (
              <div className="flex justify-end gap-3 p-6 border-t border-[#333]">
                <button onClick={() => { setIsImportModalOpen(false); setImportStep("upload"); setCsvFile(null); setParsedData([]); setImportErrors([]); }}
                  className="px-4 py-2.5 rounded-lg bg-[#1a1a1a] text-[#bdbdbd] text-[14px] hover:bg-[#252525]">Cancelar</button>
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
