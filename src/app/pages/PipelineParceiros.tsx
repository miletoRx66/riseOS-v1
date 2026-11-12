import { useState, useEffect, useRef } from "react";
import {
  getParceiros, criarParceiro, atualizarParceiro, deletarParceiro,
  getComentariosParceiro, criarComentarioParceiro, atualizarDistribuicao,
  PIPELINE_STATUS, CLASSIFICACAO_LABEL, IMPACTO_COLOR, TRILHA_CONFIG, MODULO_INFRA, fmtAum, fmtForecast,
  type PipelineParceiro, type PipelineComentario, type PipelineStatus, type Classificacao, type Impacto,
  type Trilha, type TipoInteracao, type ModuloInfra,
} from "../../lib/services/pipeline";
import { FeedInteracoes } from "../components/comercial/FeedInteracoes";
import { ContatosParceiro } from "../components/comercial/ContatosParceiro";
import { formatBRLCompact } from "../../lib/format";
import { exportarRelatorioPipeline } from "../utils/pdfGenerator";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  Plus, X, Filter, Loader2, ChevronRight, Edit2, Trash2, ShieldAlert, UserRound,
  TrendingUp, DollarSign, Target, Users, Calendar, CheckCircle,
  AlertCircle, Clock, LayoutGrid, List, MessageCircle, FileText,
  CheckSquare,
} from "lucide-react";

// ── Constantes ───────────────────────────────────────────────────────────────

const KANBAN_COLUNAS: PipelineStatus[] = [
  "on_hold", "conversa", "em_avanco", "em_listagem", "em_producao", "lancado", "distribuicao_consolidada",
];

const CLASSIFICACAO_COLOR: Record<Classificacao, string> = {
  originador:   "#14E9BC",
  distribuidor: "#6B8AFF",
  infra_outros: "#E879F9",
};

const FORM_INICIAL = {
  parceiro: "", produto: "", classificacao: "originador" as Classificacao,
  responsavel_nome: "", originador: "", nda_assinado: false, aum: "", valor_distribuido: "",
  status: "conversa" as PipelineStatus,
  data_inicial: "", estimativa_lancamento: "", proximos_passos: "",
  gargalo: "", impacto: "alto" as Impacto, forecast_anual: "", fee_parceiro: "",
  despesas: "", forecast_ytd: "", observacoes: "", ordem: 0,
  trilha: "infraestrutura" as Trilha,
  modulos_infra: [] as ModuloInfra[],
  administradora_apex: true, usa_software_rise: true,
  contrato_assinado: false, api_em_uso: false,
};

// ── Sub-componente: Módulos de Infraestrutura (seleção múltipla) ─────────────

function CamposModulos({
  form, setForm,
}: {
  form: typeof FORM_INICIAL;
  setForm: (f: typeof FORM_INICIAL) => void;
}) {
  if (form.trilha !== "infraestrutura") return null;
  return (
    <div>
      <label className="text-rise-fg-4 text-[12px] mb-2 block">
        Módulos contratados <span className="text-rise-fg-4">(múltipla escolha)</span>
      </label>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(MODULO_INFRA) as [ModuloInfra, { label: string; color: string }][]).map(([v, cfg]) => {
          const ativo = form.modulos_infra.includes(v);
          return (
            <button key={v} type="button"
              onClick={() => setForm({
                ...form,
                modulos_infra: ativo ? form.modulos_infra.filter((m) => m !== v) : [...form.modulos_infra, v],
              })}
              className={`px-3 py-2 rounded-lg text-[12px] font-semibold border text-left transition-all ${
                ativo ? "" : "bg-rise-bg border-rise-line text-rise-fg-3 hover:border-rise-fg-4"
              }`}
              style={ativo ? { background: `${cfg.color}15`, borderColor: `${cfg.color}50`, color: cfg.color } : undefined}>
              {ativo && <span className="mr-1">✓</span>}{cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Sub-componente: Conformidade (Apex + trava contratual) ───────────────────

function CamposConformidade({
  form, setForm,
}: {
  form: typeof FORM_INICIAL;
  setForm: (f: typeof FORM_INICIAL) => void;
}) {
  return (
    <div className="bg-rise-bg border border-rise-line-2 rounded-xl p-4 space-y-2.5">
      <p className="text-rise-fg-4 text-[11px] font-semibold uppercase tracking-wide">Conformidade</p>
      {form.trilha === "infraestrutura" && (
        <>
          <label className="flex items-center gap-2 text-rise-fg-2 text-[13px]">
            <input type="checkbox" checked={form.administradora_apex} className="accent-[#14E9BC]"
              // Apex exige RiseOS: marcar Apex marca o software junto
              onChange={(e) => setForm({ ...form, administradora_apex: e.target.checked, usa_software_rise: e.target.checked || form.usa_software_rise })} />
            Administradora padrão: Apex Group
          </label>
          <label className="flex items-center gap-2 text-rise-fg-2 text-[13px]">
            <input type="checkbox" checked={form.usa_software_rise} disabled={form.administradora_apex} className="accent-[#14E9BC]"
              onChange={(e) => setForm({ ...form, usa_software_rise: e.target.checked })} />
            Uso do software RiseOS
            {form.administradora_apex && <span className="text-rise-fg-4 text-[11px]">(obrigatório com Apex)</span>}
          </label>
        </>
      )}
      <label className="flex items-center gap-2 text-rise-fg-2 text-[13px]">
        <input type="checkbox" checked={form.api_em_uso} className="accent-[#14E9BC]"
          onChange={(e) => setForm({ ...form, api_em_uso: e.target.checked })} />
        Consome API da Rise em produção
      </label>
      <label className="flex items-center gap-2 text-rise-fg-2 text-[13px]">
        <input type="checkbox" checked={form.contrato_assinado} className="accent-[#14E9BC]"
          onChange={(e) => setForm({ ...form, contrato_assinado: e.target.checked })} />
        Contrato de licença/parceria assinado
      </label>
      {form.api_em_uso && !form.contrato_assinado && (
        <p className="text-[#ec5d5e] text-[12px] flex items-center gap-1.5 pt-1">
          <ShieldAlert size={13} /> O card ficará em Bloqueio Contratual até o contrato ser assinado.
        </p>
      )}
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtData(d: string | null | undefined): string {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function avatarInicial(nome: string): string {
  return nome ? nome[0].toUpperCase() : "?";
}

// ── Sub-componente: Column Summary ───────────────────────────────────────────

function ColumnSummary({
  cards, isDistribuicao,
}: {
  cards: PipelineParceiro[];
  isDistribuicao: boolean;
}) {
  const numDeals    = cards.length;
  const aumTotal    = cards.reduce((s, c) => s + (c.aum || 0), 0);
  const aumDist     = cards.reduce((s, c) => s + (c.aum || 0), 0);
  const forecast    = cards.reduce((s, c) => s + (c.forecast_anual || 0), 0);
  const aumLabel    = isDistribuicao ? "AuM distribuído"  : "AuM potencial";
  const aumValor    = isDistribuicao ? aumDist            : aumTotal;
  const fcastLabel  = isDistribuicao ? "Forecast consolidado" : "Forecast da esteira";

  return (
    <div className="mx-2 mb-2 rounded-xl border border-dashed border-rise-line-3 p-3 bg-rise-bg/60">
      <p className="text-[10px] font-semibold text-rise-fg-4 uppercase tracking-wide mb-2">Resumo</p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-rise-fg-4">Número de deals</span>
          <span className="text-[11px] font-bold text-rise-fg">{numDeals}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-rise-fg-4">{aumLabel}</span>
          <span className="text-[11px] font-bold text-[#04d95f]">{aumValor > 0 ? formatBRLCompact(aumValor) : "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-rise-fg-4">{fcastLabel}</span>
          <span className="text-[11px] font-bold text-rise-fg-2">{forecast > 0 ? formatBRLCompact(forecast) : "—"}</span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: Card Kanban ───────────────────────────────────────────────

function KanbanCard({
  p,
  dragging,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  p: PipelineParceiro;
  dragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onClick: () => void;
}) {
  const st = PIPELINE_STATUS[p.status];
  const icImpacto = p.impacto === "alto" ? "⬆" : p.impacto === "medio" ? "➡" : "⬇";

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, p.id)}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`bg-rise-surface border rounded-xl p-4 cursor-pointer transition-all select-none ${
        dragging ? "opacity-40 scale-95" : "hover:border-rise-line-3 hover:bg-rise-surface"
      }`}
      style={{ borderColor: p.bloqueio_contratual ? "#ec5d5e" : "#2a2a2a" }}
    >
      {p.bloqueio_contratual && (
        <div className="flex items-center gap-1.5 bg-[#ec5d5e]/15 text-[#ec5d5e] text-[10px] font-bold uppercase tracking-wide rounded-md px-2 py-1 mb-2">
          <ShieldAlert size={11} /> Bloqueio Contratual
        </div>
      )}
      {/* Topo: parceiro + classificação */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-bold text-rise-fg text-[14px] leading-tight">{p.parceiro}</p>
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block"
            style={{
              background: CLASSIFICACAO_COLOR[p.classificacao] + "22",
              color: CLASSIFICACAO_COLOR[p.classificacao],
            }}
          >
            {CLASSIFICACAO_LABEL[p.classificacao]}
          </span>
        </div>
        <span
          className="text-[10px] font-bold flex-shrink-0 ml-1"
          style={{ color: IMPACTO_COLOR[p.impacto] }}
          title={`Impacto ${p.impacto}`}
        >
          {icImpacto} {p.impacto.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Produto */}
      <p className="text-rise-fg-3 text-[12px] mb-3 line-clamp-2 leading-relaxed">{p.produto}</p>

      {/* Módulos de Infraestrutura */}
      {p.trilha === "infraestrutura" && p.modulos_infra?.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-3">
          {p.modulos_infra.map((m) => (
            <span key={m} className="text-[9px] font-semibold px-1.5 py-0.5 rounded"
              style={{ background: `${MODULO_INFRA[m].color}18`, color: MODULO_INFRA[m].color }}>
              {MODULO_INFRA[m].label.replace("Módulo de ", "")}
            </span>
          ))}
        </div>
      )}

      {/* Métricas */}
      <div className="flex items-center justify-between text-[11px] mb-3">
        <div>
          <p className="text-rise-fg-4">AuM</p>
          <p className="font-bold text-[#14E9BC]">{fmtAum(p.aum)}</p>
        </div>
        <div className="text-right">
          <p className="text-rise-fg-4">Forecast anual</p>
          <p className="font-bold text-[#28d939]">{fmtForecast(p.forecast_anual)}</p>
        </div>
      </div>

      {/* Originador */}
      {p.originador && (
        <p className="text-[10px] text-rise-fg-4 mb-2">
          Originador: <span className="text-rise-fg-3 font-medium">{p.originador}</span>
        </p>
      )}

      {/* Footer: responsável + NDA + estimativa */}
      <div className="flex items-center justify-between border-t border-rise-line-2 pt-3 mt-1">
        <div className="flex items-center gap-1.5">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: "var(--rise-raised)", color: "var(--rise-fg-3)" }}
          >
            {avatarInicial(p.responsavel_nome ?? "?")}
          </div>
          <span className="text-[11px] text-rise-fg-4 truncate max-w-[80px]">{p.responsavel_nome ?? "—"}</span>
        </div>
        <div className="flex items-center gap-2">
          {p.nda_assinado && (
            <span className="text-[#28d939] text-[10px] font-semibold flex items-center gap-0.5">
              <CheckCircle size={10} /> NDA
            </span>
          )}
          {p.estimativa_lancamento && (
            <span className="text-rise-fg-4 text-[10px] flex items-center gap-0.5">
              <Calendar size={9} /> {fmtData(p.estimativa_lancamento)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-componente: Modal de Detalhe/Edição ───────────────────────────────────

function ModalDetalhe({
  parceiro,
  onClose,
  onSalvar,
  onDeletar,
}: {
  parceiro: PipelineParceiro;
  onClose: () => void;
  onSalvar: (p: PipelineParceiro) => void;
  onDeletar: (id: string) => void;
}) {
  const { usuario, podeEditar } = useAuth();
  const podeGerenciarPipeline = podeEditar("comercial") || (usuario?.isAdmin ?? false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<typeof FORM_INICIAL>({
    parceiro: parceiro.parceiro,
    produto: parceiro.produto,
    classificacao: parceiro.classificacao,
    responsavel_nome: parceiro.responsavel_nome ?? "",
    originador: parceiro.originador ?? "",
    nda_assinado: parceiro.nda_assinado,
    aum: String(parceiro.aum || ""),
    valor_distribuido: String(parceiro.valor_distribuido ?? ""),
    status: parceiro.status,
    data_inicial: parceiro.data_inicial ?? "",
    estimativa_lancamento: parceiro.estimativa_lancamento ?? "",
    proximos_passos: parceiro.proximos_passos ?? "",
    gargalo: parceiro.gargalo ?? "",
    impacto: parceiro.impacto,
    forecast_anual: String(parceiro.forecast_anual || ""),
    fee_parceiro: String(parceiro.fee_parceiro || ""),
    despesas: String(parceiro.despesas || ""),
    forecast_ytd: String(parceiro.forecast_ytd || ""),
    observacoes: parceiro.observacoes ?? "",
    ordem: parceiro.ordem,
    trilha: parceiro.trilha,
    modulos_infra: parceiro.modulos_infra ?? [],
    administradora_apex: parceiro.administradora_apex,
    usa_software_rise: parceiro.usa_software_rise,
    contrato_assinado: parceiro.contrato_assinado,
    api_em_uso: parceiro.api_em_uso,
  });
  const [salvando, setSalvando] = useState(false);
  const [comentarios, setComentarios] = useState<PipelineComentario[]>([]);
  const [tabDetalhe, setTabDetalhe] = useState<"info" | "passos" | "contatos" | "comentarios">("info");

  useEffect(() => {
    getComentariosParceiro(parceiro.id).then(setComentarios).catch(console.error);
  }, [parceiro.id]);

  async function handleSalvar() {
    setSalvando(true);
    try {
      const updates: Partial<PipelineParceiro> = {
        parceiro: form.parceiro,
        produto: form.produto,
        classificacao: form.classificacao,
        responsavel_nome: form.responsavel_nome || null,
        nda_assinado: form.nda_assinado,
        aum: parseFloat(form.aum) || 0,
        status: form.status,
        data_inicial: form.data_inicial || null,
        estimativa_lancamento: form.estimativa_lancamento || null,
        proximos_passos: form.proximos_passos || null,
        gargalo: form.gargalo || null,
        impacto: form.impacto,
        forecast_anual: parseFloat(form.forecast_anual) || 0,
        fee_parceiro: parseFloat(form.fee_parceiro) || 0,
        despesas: parseFloat(form.despesas) || 0,
        forecast_ytd: parseFloat(form.forecast_ytd) || 0,
        observacoes: form.observacoes || null,
        trilha: form.trilha,
        modulos_infra: form.modulos_infra,
        administradora_apex: form.administradora_apex,
        usa_software_rise: form.usa_software_rise,
        contrato_assinado: form.contrato_assinado,
        api_em_uso: form.api_em_uso,
      };
      await atualizarParceiro(parceiro.id, updates);
      onSalvar({ ...parceiro, ...updates, bloqueio_contratual: form.api_em_uso && !form.contrato_assinado });
      setEditando(false);
    } finally { setSalvando(false); }
  }

  async function handleEnviarComentario(conteudo: string, tipo: TipoInteracao) {
    if (!usuario) return;
    const novo = await criarComentarioParceiro(parceiro.id, usuario.id, conteudo, tipo);
    setComentarios((prev) => [...prev, novo]);
  }

  const st = PIPELINE_STATUS[parceiro.status];

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-rise-surface border border-rise-line-2 rounded-2xl w-full max-w-[760px] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-rise-line-2">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-bold text-rise-fg text-[22px]">{parceiro.parceiro}</h2>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: st.bg, color: st.color }}
              >
                {st.label}
              </span>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: CLASSIFICACAO_COLOR[parceiro.classificacao] + "22",
                  color: CLASSIFICACAO_COLOR[parceiro.classificacao],
                }}
              >
                {CLASSIFICACAO_LABEL[parceiro.classificacao]}
              </span>
            </div>
            <p className="text-rise-fg-4 text-[13px]">{parceiro.produto}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editando && (
              <>
                <button
                  onClick={() => setEditando(true)}
                  className="p-2 rounded-lg bg-rise-raised text-rise-fg-3 hover:text-[#14E9BC] transition-colors"
                >
                  <Edit2 size={15} />
                </button>
                {podeGerenciarPipeline && (
                  <button
                    onClick={() => { if (confirm(`Deletar ${parceiro.parceiro}?`)) { onDeletar(parceiro.id); onClose(); }}}
                    className="p-2 rounded-lg bg-rise-raised text-rise-fg-3 hover:text-[#ec5d5e] transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-lg bg-rise-raised text-rise-fg-3 hover:text-rise-fg transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {([
            ["info",        "Informações",     <FileText size={13} />],
            ["passos",      "Próximos Passos", <CheckSquare size={13} />],
            ["contatos",    "Pontos Focais",   <UserRound size={13} />],
            ["comentarios", "Linha do Tempo",  <MessageCircle size={13} />],
          ] as const).map(([v, label, icon]) => (
            <button
              key={v}
              onClick={() => setTabDetalhe(v)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                tabDetalhe === v
                  ? "bg-[#14E9BC]/15 border border-[#14E9BC]/40 text-[#14E9BC]"
                  : "text-rise-fg-4 hover:text-rise-fg-2"
              }`}
            >
              {icon}{label}
              {v === "comentarios" && comentarios.length > 0 && (
                <span className="bg-rise-line text-rise-fg-3 text-[10px] px-1.5 rounded-full">{comentarios.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {editando ? (
            /* Formulário de edição */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Parceiro *</label>
                  <input value={form.parceiro} onChange={(e) => setForm({ ...form, parceiro: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Responsável</label>
                  <input value={form.responsavel_nome} onChange={(e) => setForm({ ...form, responsavel_nome: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Produto / Descrição *</label>
                <input value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Classificação</label>
                  <select value={form.classificacao} onChange={(e) => setForm({ ...form, classificacao: e.target.value as Classificacao })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                    <option value="originador">Originador</option>
                    <option value="distribuidor">Distribuidor</option>
                    <option value="infra_outros">Infra / Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PipelineStatus })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                    {Object.entries(PIPELINE_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Impacto</label>
                  <select value={form.impacto} onChange={(e) => setForm({ ...form, impacto: e.target.value as Impacto })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                    <option value="alto">Alto</option>
                    <option value="medio">Médio</option>
                    <option value="baixo">Baixo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">AuM (R$)</label>
                  <input type="number" value={form.aum} onChange={(e) => setForm({ ...form, aum: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Forecast Anual (R$)</label>
                  <input type="number" value={form.forecast_anual} onChange={(e) => setForm({ ...form, forecast_anual: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Fee Parceiro (R$)</label>
                  <input type="number" value={form.fee_parceiro} onChange={(e) => setForm({ ...form, fee_parceiro: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Despesas (R$)</label>
                  <input type="number" value={form.despesas} onChange={(e) => setForm({ ...form, despesas: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Forecast YTD (R$)</label>
                  <input type="number" value={form.forecast_ytd} onChange={(e) => setForm({ ...form, forecast_ytd: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Data Inicial</label>
                  <input type="date" value={form.data_inicial} onChange={(e) => setForm({ ...form, data_inicial: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Estimativa de Lançamento</label>
                  <input type="date" value={form.estimativa_lancamento} onChange={(e) => setForm({ ...form, estimativa_lancamento: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Gargalo</label>
                <input value={form.gargalo} onChange={(e) => setForm({ ...form, gargalo: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Próximos Passos</label>
                <textarea rows={4} value={form.proximos_passos} onChange={(e) => setForm({ ...form, proximos_passos: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC] resize-none" />
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Observações / Condicional</label>
                <textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC] resize-none" />
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Frente de negócio</label>
                <select value={form.trilha} onChange={(e) => setForm({ ...form, trilha: e.target.value as Trilha })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                  {Object.entries(TRILHA_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="nda_edit" checked={form.nda_assinado} onChange={(e) => setForm({ ...form, nda_assinado: e.target.checked })}
                  className="accent-[#14E9BC]" />
                <label htmlFor="nda_edit" className="text-rise-fg-2 text-[13px]">NDA Assinado</label>
              </div>
              <CamposModulos form={form} setForm={setForm} />
              <CamposConformidade form={form} setForm={setForm} />
              <div className="flex gap-3 pt-2">
                <button onClick={handleSalvar} disabled={salvando}
                  className="flex-1 bg-[#14E9BC] text-[#000] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50">
                  {salvando ? "Salvando..." : "Salvar Alterações"}
                </button>
                <button onClick={() => setEditando(false)}
                  className="px-5 py-2.5 bg-rise-raised text-rise-fg-2 rounded-lg font-semibold text-[14px] hover:bg-rise-subtle transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          ) : tabDetalhe === "info" ? (
            /* Vista de informações */
            <div className="space-y-5">
              {parceiro.bloqueio_contratual && (
                <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-xl p-4 flex items-start gap-3">
                  <ShieldAlert size={18} className="text-[#ec5d5e] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[#ec5d5e] text-[13px] font-bold">Bloqueio Contratual</p>
                    <p className="text-rise-fg-2 text-[12px] mt-0.5">
                      Este parceiro consome a API da Rise em produção sem contrato de licença/parceria assinado.
                    </p>
                  </div>
                </div>
              )}
              {/* KPIs financeiros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "AuM Total",       value: fmtAum(parceiro.aum),                 color: "#14E9BC" },
                  { label: "Forecast Anual",  value: fmtForecast(parceiro.forecast_anual),  color: "#28d939" },
                  { label: "Fee Parceiro",    value: fmtForecast(parceiro.fee_parceiro),    color: "#f59e0b" },
                  { label: "Forecast YTD",    value: fmtForecast(parceiro.forecast_ytd),    color: "#6B8AFF" },
                ].map((k) => (
                  <div key={k.label} className="bg-rise-bg border border-rise-line-2 rounded-xl p-3">
                    <p className="text-rise-fg-4 text-[11px] mb-1">{k.label}</p>
                    <p className="font-bold text-[18px]" style={{ color: k.color }}>{k.value}</p>
                  </div>
                ))}
              </div>

              {/* Campos descritivos */}
              <div className="grid grid-cols-2 gap-4">
                <Row label="Responsável" value={parceiro.responsavel_nome} />
                <Row label="Classificação" value={CLASSIFICACAO_LABEL[parceiro.classificacao]} />
                <Row label="NDA" value={parceiro.nda_assinado ? "✓ Assinado" : "Não assinado"} />
                <Row label="Contrato" value={parceiro.contrato_assinado ? "✓ Assinado" : "Não assinado"}
                  valueColor={parceiro.bloqueio_contratual ? "#ec5d5e" : undefined} />
                <Row label="API em produção" value={parceiro.api_em_uso ? "Sim" : "Não"} />
                {parceiro.trilha === "infraestrutura" && (
                  <Row label="Módulos"
                    value={parceiro.modulos_infra?.length ? parceiro.modulos_infra.map((m) => MODULO_INFRA[m].label.replace("Módulo de ", "")).join(" · ") : "A classificar"} />
                )}
                {parceiro.trilha === "infraestrutura" && (
                  <Row label="Esteira Apex"
                    value={parceiro.administradora_apex ? "Apex Group + RiseOS" : parceiro.usa_software_rise ? "Sem Apex · usa RiseOS" : "Sem Apex · sem RiseOS"} />
                )}
                <Row label="Impacto" value={parceiro.impacto.charAt(0).toUpperCase() + parceiro.impacto.slice(1)} valueColor={IMPACTO_COLOR[parceiro.impacto]} />
                <Row label="Data Inicial" value={fmtData(parceiro.data_inicial)} />
                <Row label="Estimativa Lançamento" value={fmtData(parceiro.estimativa_lancamento)} />
                {parceiro.despesas > 0 && <Row label="Despesas" value={fmtForecast(parceiro.despesas)} valueColor="#ec5d5e" />}
              </div>

              {parceiro.gargalo && (
                <div className="bg-[#ec5d5e]/5 border border-[#ec5d5e]/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={14} className="text-[#ec5d5e]" />
                    <p className="text-[#ec5d5e] text-[12px] font-semibold uppercase tracking-wide">Gargalo</p>
                  </div>
                  <p className="text-rise-fg-2 text-[13px] leading-relaxed">{parceiro.gargalo}</p>
                </div>
              )}

              {parceiro.observacoes && (
                <div className="bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-xl p-4">
                  <p className="text-[#f59e0b] text-[12px] font-semibold uppercase tracking-wide mb-2">OBS / Condicional</p>
                  <p className="text-rise-fg-2 text-[13px] leading-relaxed">{parceiro.observacoes}</p>
                </div>
              )}
            </div>
          ) : tabDetalhe === "passos" ? (
            /* Próximos passos */
            <div>
              {parceiro.proximos_passos ? (
                <div className="bg-rise-bg border border-rise-line-2 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={15} className="text-[#14E9BC]" />
                    <p className="text-[#14E9BC] text-[13px] font-semibold uppercase tracking-wide">Próximos Passos</p>
                  </div>
                  <div className="space-y-2">
                    {parceiro.proximos_passos.split("\n").filter(Boolean).map((linha, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <ChevronRight size={14} className="text-rise-fg-4 mt-0.5 flex-shrink-0" />
                        <p className="text-rise-fg-2 text-[13px] leading-relaxed">{linha}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-rise-fg-4">
                  <CheckSquare size={32} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhum próximo passo definido</p>
                  <button onClick={() => { setEditando(true); setTabDetalhe("info"); }}
                    className="mt-3 text-[#14E9BC] text-[13px] hover:underline">
                    Adicionar próximos passos →
                  </button>
                </div>
              )}
            </div>
          ) : tabDetalhe === "contatos" ? (
            <ContatosParceiro parceiroId={parceiro.id} />
          ) : (
            <FeedInteracoes
              itens={comentarios}
              usuarioNome={usuario?.nome}
              placeholder="Registre uma conversa ou atualização sobre este parceiro..."
              onEnviar={handleEnviarComentario}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string | null | undefined; valueColor?: string }) {
  return (
    <div>
      <p className="text-rise-fg-4 text-[11px] mb-0.5">{label}</p>
      <p className="text-[13px] font-medium" style={{ color: valueColor ?? "var(--rise-fg-2)" }}>{value || "—"}</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function PipelineParceiros({ trilha }: { trilha: Trilha }) {
  const { usuario } = useAuth();
  const { toast } = useToast();
  const [parceiros, setParceiros] = useState<PipelineParceiro[]>([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"kanban" | "lista">("kanban");
  const [filtroImpacto, setFiltroImpacto] = useState("todos");
  const [filtroResp, setFiltroResp] = useState("todos");
  const [filtroClass, setFiltroClass] = useState("todos");
  // Infraestrutura: sub-aba por módulo ("sem" = parceiros ainda sem módulo)
  const [moduloAtivo, setModuloAtivo] = useState<"todos" | "sem" | ModuloInfra>("todos");

  const [modalNovo, setModalNovo] = useState(false);
  const [detalhe, setDetalhe] = useState<PipelineParceiro | null>(null);
  const [salvandoNovo, setSalvandoNovo] = useState(false);
  const [formNovo, setFormNovo] = useState<typeof FORM_INICIAL>({ ...FORM_INICIAL, trilha });

  const [modalDist, setModalDist] = useState(false);
  const [distParceiroId, setDistParceiroId] = useState("");
  const [distValorNovo, setDistValorNovo] = useState("");
  const [distObs, setDistObs] = useState("");
  const [salvandoDist, setSalvandoDist] = useState(false);

  // drag-and-drop kanban
  const draggingRef = useRef<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setModuloAtivo("todos");
    setFormNovo({ ...FORM_INICIAL, trilha });
    getParceiros({ trilha }).then(setParceiros).catch(console.error).finally(() => setLoading(false));
  }, [trilha]);

  const bloqueados = parceiros.filter((p) => p.bloqueio_contratual);

  function noModulo(p: PipelineParceiro, m: typeof moduloAtivo) {
    if (m === "todos") return true;
    if (m === "sem") return !p.modulos_infra?.length;
    return p.modulos_infra?.includes(m) ?? false;
  }

  // Base de KPIs, kanban e relatório: a frente inteira ou o módulo selecionado
  const base = trilha === "infraestrutura" ? parceiros.filter((p) => noModulo(p, moduloAtivo)) : parceiros;

  // ── KPIs ─────────────────────────────────────────────────────────────────────

  const totalParceiros   = base.length;
  const aumPotencialTotal = base.reduce((s, p) => s + (p.aum || 0), 0);

  const aumEfetLancado =
    base.filter((p) => p.status === "lancado").reduce((s, p) => s + (p.aum || 0), 0) +
    base.filter((p) => p.status === "distribuicao_consolidada").reduce((s, p) => s + (p.valor_distribuido || 0), 0);

  const dealsDist        = base.filter((p) => p.status === "distribuicao_consolidada");
  const aumDistribuido   = dealsDist.reduce((s, p) => s + (p.aum || 0), 0);
  const forecastDist     = dealsDist.reduce((s, p) => s + (p.forecast_anual || 0), 0);

  const pctLancadoVsPot  = aumPotencialTotal > 0
    ? ((aumEfetLancado / aumPotencialTotal) * 100).toFixed(1) : "0";
  const pctDistVsLancado = aumEfetLancado > 0
    ? ((aumDistribuido / aumEfetLancado) * 100).toFixed(1) : "0";

  const responsaveis = [...new Set(base.map((p) => p.responsavel_nome).filter(Boolean))] as string[];

  // ── Atualizar distribuição ────────────────────────────────────────────────────

  async function handleAtualizarDistribuicao() {
    const val = parseFloat(distValorNovo);
    if (!distParceiroId || isNaN(val)) return;
    setSalvandoDist(true);
    try {
      await atualizarDistribuicao(distParceiroId, val, distObs || undefined);
      setParceiros((prev) =>
        prev.map((p) => p.id === distParceiroId ? { ...p, valor_distribuido: val } : p)
      );
      setModalDist(false);
      setDistParceiroId(""); setDistValorNovo(""); setDistObs("");
    } finally { setSalvandoDist(false); }
  }

  // ── Filtros ───────────────────────────────────────────────────────────────────

  const parceirosVisiveis = base.filter((p) => {
    if (filtroImpacto !== "todos" && p.impacto !== filtroImpacto) return false;
    if (filtroResp !== "todos" && p.responsavel_nome !== filtroResp) return false;
    if (filtroClass !== "todos" && p.classificacao !== filtroClass) return false;
    return true;
  });

  function porColuna(status: PipelineStatus) {
    return parceirosVisiveis.filter((p) => p.status === status);
  }

  // ── Drag handlers ─────────────────────────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, id: string) {
    draggingRef.current = id;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    // Obrigatório em Safari — sem setData o drop nunca dispara
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
    draggingRef.current = null;
  }

  function handleDragOver(e: React.DragEvent, col: string) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(col);
  }

  async function handleDrop(e: React.DragEvent, novoStatus: PipelineStatus) {
    e.preventDefault();
    e.stopPropagation();
    // Usa ref como fonte primária; getData como fallback (Safari)
    const id = draggingRef.current ?? e.dataTransfer.getData("text/plain");
    if (!id) return;
    const parceirosAtual = parceiros;
    const p = parceirosAtual.find((x) => x.id === id);
    if (!p || p.status === novoStatus) { handleDragEnd(); return; }
    setParceiros((prev) => prev.map((x) => x.id === id ? { ...x, status: novoStatus } : x));
    handleDragEnd();
    try {
      await atualizarParceiro(id, { status: novoStatus });
    } catch (err) {
      console.error("Erro ao mover parceiro:", err);
      setParceiros((prev) => prev.map((x) => x.id === id ? { ...x, status: p.status } : x));
      toast("Não foi possível mover o parceiro. Verifique as permissões ou contate o suporte.", "error");
    }
  }

  // ── Criar parceiro ────────────────────────────────────────────────────────────

  async function handleCriar() {
    if (!formNovo.parceiro.trim()) return;
    setSalvandoNovo(true);
    try {
      const novo = await criarParceiro({
        parceiro: formNovo.parceiro,
        produto: formNovo.produto,
        classificacao: formNovo.classificacao,
        responsavel_nome: formNovo.responsavel_nome || null,
        originador: formNovo.originador || null,
        nda_assinado: formNovo.nda_assinado,
        aum: parseFloat(formNovo.aum) || 0,
        valor_distribuido: parseFloat(formNovo.valor_distribuido) || null,
        status: formNovo.status,
        data_inicial: formNovo.data_inicial || null,
        estimativa_lancamento: formNovo.estimativa_lancamento || null,
        proximos_passos: formNovo.proximos_passos || null,
        gargalo: formNovo.gargalo || null,
        impacto: formNovo.impacto,
        forecast_anual: parseFloat(formNovo.forecast_anual) || 0,
        fee_parceiro: parseFloat(formNovo.fee_parceiro) || 0,
        despesas: parseFloat(formNovo.despesas) || 0,
        forecast_ytd: parseFloat(formNovo.forecast_ytd) || 0,
        observacoes: formNovo.observacoes || null,
        ordem: parceiros.length,
        trilha: formNovo.trilha,
        modulos_infra: formNovo.trilha === "infraestrutura" ? formNovo.modulos_infra : [],
        administradora_apex: formNovo.administradora_apex,
        usa_software_rise: formNovo.usa_software_rise,
        contrato_assinado: formNovo.contrato_assinado,
        api_em_uso: formNovo.api_em_uso,
      });
      if (novo.trilha === trilha) setParceiros((prev) => [novo, ...prev]);
      setModalNovo(false);
      setFormNovo({ ...FORM_INICIAL, trilha });
    } finally { setSalvandoNovo(false); }
  }

  // ── Deletar ───────────────────────────────────────────────────────────────────

  async function handleDeletar(id: string) {
    await deletarParceiro(id);
    setParceiros((prev) => prev.filter((p) => p.id !== id));
  }

  // ── Atualizar local ───────────────────────────────────────────────────────────

  function handleSalvarLocal(p: PipelineParceiro) {
    // Mudou de frente: sai desta aba
    if (p.trilha !== trilha) {
      setParceiros((prev) => prev.filter((x) => x.id !== p.id));
      setDetalhe(null);
      toast(`${p.parceiro} movido para ${TRILHA_CONFIG[p.trilha].label}`, "success");
      return;
    }
    setParceiros((prev) => prev.map((x) => x.id === p.id ? p : x));
    if (detalhe?.id === p.id) setDetalhe(p);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div>
      {bloqueados.length > 0 && (
        <div className="bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 rounded-xl px-4 py-3 mb-5 flex items-center gap-3 flex-wrap">
          <ShieldAlert size={18} className="text-[#ec5d5e] flex-shrink-0" />
          <p className="text-rise-fg-2 text-[13px]">
            <span className="text-[#ec5d5e] font-bold">
              {bloqueados.length} {bloqueados.length === 1 ? "parceiro usa" : "parceiros usam"} a API sem contrato assinado:
            </span>{" "}
            {bloqueados.map((p, i) => (
              <button key={p.id} onClick={() => setDetalhe(p)} className="underline hover:text-[#ec5d5e]">
                {p.parceiro}{i < bloqueados.length - 1 ? ", " : ""}
              </button>
            ))}
          </p>
        </div>
      )}

      {/* Módulos de Infraestrutura */}
      {trilha === "infraestrutura" && (
        <div className="flex items-center gap-1 mb-5 flex-wrap">
          {(["todos", "administracao", "gestao", "pagamento", "distribuicao", "sem"] as const).map((m) => {
            const cfg = m === "todos" || m === "sem" ? null : MODULO_INFRA[m];
            const count = parceiros.filter((p) => noModulo(p, m)).length;
            const isActive = moduloAtivo === m;
            return (
              <button key={m} onClick={() => setModuloAtivo(m)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all border ${
                  isActive ? "border-current" : "border-transparent text-rise-fg-4 hover:text-rise-fg-2 hover:bg-rise-raised"
                }`}
                style={isActive ? {
                  backgroundColor: cfg ? `${cfg.color}15` : "var(--rise-raised)",
                  color: cfg ? cfg.color : "var(--rise-fg)",
                  borderColor: cfg ? `${cfg.color}40` : "var(--rise-line)",
                } : undefined}>
                {m === "todos" ? "Todos os módulos" : m === "sem" ? "A classificar" : cfg!.label}
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isActive ? (cfg ? `${cfg.color}25` : "var(--rise-line)") : "var(--rise-raised)",
                    color: isActive ? (cfg ? cfg.color : "var(--rise-fg)") : "var(--rise-fg-4)",
                  }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* 1 — Número de deals */}
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-rise-fg-4 text-[12px]">Número de deals</p>
            <Users size={16} className="text-[#6B8AFF]" />
          </div>
          <p className="text-[22px] font-bold text-[#6B8AFF]">{totalParceiros}</p>
          <p className="text-[10px] text-rise-fg-4 mt-1">Soma de todas as colunas</p>
        </div>

        {/* 2 — AuM Potencial Total */}
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-rise-fg-4 text-[12px]">AuM potencial total</p>
            <DollarSign size={16} className="text-[#14E9BC]" />
          </div>
          <p className="text-[22px] font-bold text-[#14E9BC]">{fmtAum(aumPotencialTotal)}</p>
          <p className="text-[10px] text-rise-fg-4 mt-1">Captação e infraestrutura</p>
        </div>

        {/* 3 — AuM Efetivamente Lançado */}
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-rise-fg-4 text-[12px]">AuM efetivamente lançado</p>
            <TrendingUp size={16} className="text-[#04d95f]" />
          </div>
          <p className="text-[22px] font-bold text-[#04d95f]">{fmtAum(aumEfetLancado)}</p>
          <p className="text-[10px] text-rise-fg-4 mt-1">{pctLancadoVsPot}% do AuM potencial</p>
        </div>

        {/* 4 — AuM Distribuído */}
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-rise-fg-4 text-[12px]">AuM distribuído</p>
            <CheckCircle size={16} className="text-[#28d939]" />
          </div>
          <p className="text-[22px] font-bold text-[#28d939]">{fmtAum(aumDistribuido)}</p>
          <p className="text-[10px] text-rise-fg-4 mt-1">{pctDistVsLancado}% do AuM lançado</p>
        </div>

        {/* 5 — Forecast Distribuição Consolidada */}
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-rise-fg-4 text-[12px]">Forecast distribuição consolidada</p>
            <Target size={16} className="text-[#f59e0b]" />
          </div>
          <p className="text-[22px] font-bold text-[#f59e0b]">{fmtForecast(forecastDist)}</p>
          <p className="text-[10px] text-rise-fg-4 mt-1">Baseado no volume distribuído</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-rise-fg-4" />

          {/* Impacto */}
          <div className="flex gap-1">
            {[["todos","Todos"],["alto","Alto"],["medio","Médio"],["baixo","Baixo"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiltroImpacto(v)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${filtroImpacto === v ? "bg-[#14E9BC]/15 border border-[#14E9BC]/40 text-[#14E9BC]" : "text-rise-fg-3 hover:text-rise-fg-2"}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Classificação */}
          <div className="flex gap-1">
            {[["todos","Todos"],["originador","Orig."],["distribuidor","Distr."],["infra_outros","Infra"]].map(([v,l]) => (
              <button key={v} onClick={() => setFiltroClass(v)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${filtroClass === v ? "bg-[#6B8AFF]/15 border border-[#6B8AFF]/40 text-[#6B8AFF]" : "text-rise-fg-3 hover:text-rise-fg-2"}`}>
                {l}
              </button>
            ))}
          </div>

          {/* Responsável */}
          <select
            value={filtroResp}
            onChange={(e) => setFiltroResp(e.target.value)}
            className="bg-rise-surface border border-rise-line rounded-lg px-3 py-1 text-[12px] text-rise-fg-2 outline-none"
          >
            <option value="todos">Todos responsáveis</option>
            {responsaveis.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle view */}
          <div className="flex gap-1 bg-rise-surface border border-rise-line rounded-lg p-1">
            <button onClick={() => setView("kanban")}
              className={`p-1.5 rounded-md transition-colors ${view === "kanban" ? "bg-rise-subtle text-[#14E9BC]" : "text-rise-fg-4"}`}>
              <LayoutGrid size={14} />
            </button>
            <button onClick={() => setView("lista")}
              className={`p-1.5 rounded-md transition-colors ${view === "lista" ? "bg-rise-subtle text-[#14E9BC]" : "text-rise-fg-4"}`}>
              <List size={14} />
            </button>
          </div>

          <button
            onClick={() => exportarRelatorioPipeline(base)}
            disabled={base.length === 0}
            className="border border-rise-line text-rise-fg-2 px-4 py-2 rounded-lg font-semibold text-[13px] flex items-center gap-1.5 hover:bg-rise-subtle hover:border-[#14E9BC] hover:text-[#14E9BC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText size={15} /> Gerar Relatório
          </button>
          <button
            onClick={() => setModalDist(true)}
            className="border border-[#04d95f]/40 text-[#04d95f] px-4 py-2 rounded-lg font-semibold text-[13px] flex items-center gap-1.5 hover:bg-[#04d95f]/10 transition-colors"
          >
            <TrendingUp size={15} /> Atualizar Distribuição
          </button>
          <button
            onClick={() => {
              if (trilha === "infraestrutura" && moduloAtivo !== "todos" && moduloAtivo !== "sem") {
                setFormNovo((f) => ({ ...f, modulos_infra: [moduloAtivo] }));
              }
              setModalNovo(true);
            }}
            className="bg-[#14E9BC] text-[#000] px-4 py-2 rounded-lg font-semibold text-[13px] flex items-center gap-1.5 hover:bg-[#12d4a8] transition-colors"
          >
            <Plus size={15} /> Novo Parceiro
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="text-[#14E9BC] animate-spin" />
        </div>
      ) : view === "kanban" ? (
        /* ── Kanban ── */
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "500px" }}>
          {KANBAN_COLUNAS.map((col) => {
            const st = PIPELINE_STATUS[col];
            const cards = porColuna(col);
            const isOver = dragOverCol === col;
            return (
              <div
                key={col}
                onDragOver={(e) => handleDragOver(e, col)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, col)}
                className="flex-shrink-0 w-[280px] flex flex-col"
              >
                {/* Header coluna */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-t-xl mb-1"
                  style={{ background: st.bg, borderBottom: `2px solid ${st.color}40` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: st.color }} />
                    <span className="font-semibold text-[13px]" style={{ color: st.color }}>{st.label}</span>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: st.color + "33", color: st.color }}
                  >
                    {cards.length}
                  </span>
                </div>

                {/* Column Summary */}
                <ColumnSummary
                  cards={cards}
                  isDistribuicao={col === "distribuicao_consolidada"}
                />

                {/* Drop area */}
                <div
                  className={`flex-1 flex flex-col gap-2 p-2 rounded-b-xl transition-colors min-h-[120px] ${
                    isOver ? "bg-[#14E9BC]/5 border border-dashed border-[#14E9BC]/30" : "bg-rise-bg/40"
                  }`}
                >
                  {cards.map((p) => (
                    <KanbanCard
                      key={p.id}
                      p={p}
                      dragging={draggingId === p.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onClick={() => setDetalhe(p)}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div className="flex items-center justify-center h-20 text-[#2a2a2a] text-[12px]">
                      Arraste aqui
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Lista / Tabela ── */
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-rise-line-2">
                {["Parceiro", "Produto", "Classif.", "Responsável", "AuM", "Forecast", "Status", "Lançamento", "Impacto", "NDA"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-rise-fg-4 font-semibold text-[11px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parceirosVisiveis.map((p) => {
                const st = PIPELINE_STATUS[p.status];
                return (
                  <tr
                    key={p.id}
                    onClick={() => setDetalhe(p)}
                    className="border-b border-[#111] hover:bg-rise-surface cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold text-rise-fg">
                      <span className="flex items-center gap-1.5">
                        {p.bloqueio_contratual && <span title="Bloqueio Contratual"><ShieldAlert size={13} className="text-[#ec5d5e]" /></span>}
                        {p.parceiro}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-rise-fg-3 max-w-[200px] truncate">{p.produto}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: CLASSIFICACAO_COLOR[p.classificacao] + "22", color: CLASSIFICACAO_COLOR[p.classificacao] }}>
                        {CLASSIFICACAO_LABEL[p.classificacao]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-rise-fg-3">{p.responsavel_nome ?? "—"}</td>
                    <td className="px-4 py-3 font-semibold text-[#14E9BC]">{fmtAum(p.aum)}</td>
                    <td className="px-4 py-3 font-semibold text-[#28d939]">{fmtForecast(p.forecast_anual)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-rise-fg-4">{fmtData(p.estimativa_lancamento)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-semibold" style={{ color: IMPACTO_COLOR[p.impacto] }}>
                        {p.impacto.charAt(0).toUpperCase() + p.impacto.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.nda_assinado
                        ? <CheckCircle size={14} className="text-[#28d939]" />
                        : <Clock size={14} className="text-rise-fg-4" />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {parceirosVisiveis.length === 0 && (
            <div className="text-center py-12 text-rise-fg-4">Nenhum parceiro encontrado com os filtros selecionados</div>
          )}
        </div>
      )}

      {/* Modal Atualizar Distribuição */}
      {modalDist && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalDist(false); }}>
          <div className="bg-rise-surface border border-rise-line-2 rounded-2xl w-full max-w-[480px]">
            <div className="flex items-center justify-between p-6 border-b border-rise-line-2">
              <div>
                <h2 className="font-bold text-rise-fg text-[18px]">Atualizar Distribuição</h2>
                <p className="text-rise-fg-4 text-[12px] mt-0.5">Registra o novo valor e mantém histórico</p>
              </div>
              <button onClick={() => setModalDist(false)} className="text-rise-fg-4 hover:text-rise-fg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Selecionar deal */}
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Deal *</label>
                <select
                  value={distParceiroId}
                  onChange={(e) => {
                    setDistParceiroId(e.target.value);
                    setDistValorNovo("");
                  }}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#04d95f]"
                >
                  <option value="">Selecionar deal...</option>
                  {parceiros
                    .filter((p) => p.status === "lancado" || p.status === "distribuicao_consolidada")
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.parceiro} — {p.produto}</option>
                    ))}
                </select>
              </div>

              {/* Valor atual (read-only) */}
              {distParceiroId && (() => {
                const p = parceiros.find((x) => x.id === distParceiroId);
                return p ? (
                  <div>
                    <label className="text-rise-fg-4 text-[12px] mb-1 block">Valor atual distribuído</label>
                    <div className="bg-rise-raised border border-rise-line rounded-lg px-3 py-2 text-rise-fg-3 text-[14px]">
                      {p.valor_distribuido != null ? fmtAum(p.valor_distribuido) : "—"}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Novo valor */}
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Novo valor distribuído (R$) *</label>
                <input
                  type="number" step="0.01" min="0"
                  value={distValorNovo}
                  onChange={(e) => setDistValorNovo(e.target.value)}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#04d95f]"
                  placeholder="0.00"
                />
              </div>

              {/* Observação */}
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Observação (opcional)</label>
                <textarea
                  rows={2}
                  value={distObs}
                  onChange={(e) => setDistObs(e.target.value)}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#04d95f] resize-none"
                  placeholder="Ex: Atualização referente ao mês de Julho..."
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleAtualizarDistribuicao}
                  disabled={salvandoDist || !distParceiroId || !distValorNovo}
                  className="flex-1 bg-[#04d95f] text-[#000] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#03c254] transition-colors disabled:opacity-50"
                >
                  {salvandoDist ? "Salvando..." : "Confirmar atualização"}
                </button>
                <button onClick={() => setModalDist(false)}
                  className="px-5 py-2.5 bg-rise-raised text-rise-fg-2 rounded-lg font-semibold text-[14px] hover:bg-rise-subtle transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal novo parceiro */}
      {modalNovo && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModalNovo(false); }}
        >
          <div className="bg-rise-surface border border-rise-line-2 rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-rise-line-2">
              <div>
                <h2 className="font-bold text-rise-fg text-[18px]">Novo Parceiro</h2>
                <p className="text-rise-fg-4 text-[12px] mt-0.5">{TRILHA_CONFIG[trilha].label}</p>
              </div>
              <button onClick={() => setModalNovo(false)} className="text-rise-fg-4 hover:text-rise-fg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Parceiro *</label>
                  <input value={formNovo.parceiro} onChange={(e) => setFormNovo({ ...formNovo, parceiro: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]"
                    placeholder="Nome do parceiro" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Responsável</label>
                  <input value={formNovo.responsavel_nome} onChange={(e) => setFormNovo({ ...formNovo, responsavel_nome: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]"
                    placeholder="Nome do responsável" />
                </div>
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Originador</label>
                <input value={formNovo.originador} onChange={(e) => setFormNovo({ ...formNovo, originador: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]"
                  placeholder="Nome do originador (opcional)" />
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Produto / Descrição *</label>
                <input value={formNovo.produto} onChange={(e) => setFormNovo({ ...formNovo, produto: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]"
                  placeholder="Descrição do produto ou operação" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Classificação</label>
                  <select value={formNovo.classificacao} onChange={(e) => setFormNovo({ ...formNovo, classificacao: e.target.value as Classificacao })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                    <option value="originador">Originador</option>
                    <option value="distribuidor">Distribuidor</option>
                    <option value="infra_outros">Infra / Outros</option>
                  </select>
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Status Inicial</label>
                  <select value={formNovo.status} onChange={(e) => setFormNovo({ ...formNovo, status: e.target.value as PipelineStatus })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                    {Object.entries(PIPELINE_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Impacto</label>
                  <select value={formNovo.impacto} onChange={(e) => setFormNovo({ ...formNovo, impacto: e.target.value as Impacto })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]">
                    <option value="alto">Alto</option>
                    <option value="medio">Médio</option>
                    <option value="baixo">Baixo</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">AuM (R$)</label>
                  <input type="number" value={formNovo.aum} onChange={(e) => setFormNovo({ ...formNovo, aum: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
                <div>
                  <label className="text-rise-fg-4 text-[12px] mb-1 block">Forecast Anual (R$)</label>
                  <input type="number" value={formNovo.forecast_anual} onChange={(e) => setFormNovo({ ...formNovo, forecast_anual: e.target.value })}
                    className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
                </div>
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Estimativa de Lançamento</label>
                <input type="date" value={formNovo.estimativa_lancamento} onChange={(e) => setFormNovo({ ...formNovo, estimativa_lancamento: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC]" />
              </div>
              <div>
                <label className="text-rise-fg-4 text-[12px] mb-1 block">Próximos Passos</label>
                <textarea rows={3} value={formNovo.proximos_passos} onChange={(e) => setFormNovo({ ...formNovo, proximos_passos: e.target.value })}
                  className="w-full bg-rise-bg border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[14px] outline-none focus:border-[#14E9BC] resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="nda_novo" checked={formNovo.nda_assinado} onChange={(e) => setFormNovo({ ...formNovo, nda_assinado: e.target.checked })}
                  className="accent-[#14E9BC]" />
                <label htmlFor="nda_novo" className="text-rise-fg-2 text-[13px]">NDA Assinado</label>
              </div>
              <CamposModulos form={formNovo} setForm={setFormNovo} />
              <CamposConformidade form={formNovo} setForm={setFormNovo} />
              <div className="flex gap-3 pt-2">
                <button onClick={handleCriar} disabled={salvandoNovo || !formNovo.parceiro.trim()}
                  className="flex-1 bg-[#14E9BC] text-[#000] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50">
                  {salvandoNovo ? "Criando..." : "Criar Parceiro"}
                </button>
                <button onClick={() => setModalNovo(false)}
                  className="px-5 py-2.5 bg-rise-raised text-rise-fg-2 rounded-lg font-semibold text-[14px] hover:bg-rise-subtle transition-colors">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalhe */}
      {detalhe && (
        <ModalDetalhe
          parceiro={detalhe}
          onClose={() => setDetalhe(null)}
          onSalvar={handleSalvarLocal}
          onDeletar={handleDeletar}
        />
      )}
    </div>
  );
}
