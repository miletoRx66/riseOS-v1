import { useState, useEffect } from "react";
import {
  getTickets, criarTicket, atualizarTicket, fecharTicket,
  type TicketDB,
} from "../../lib/services/tickets";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { getUsuarios, type UsuarioDB } from "../../lib/services/usuarios";
import { useAuth } from "../context/AuthContext";
import {
  Ticket, Plus, X, Filter, ChevronRight,
  AlertTriangle, Bug, Lightbulb, Wrench,
  Clock, CheckCircle2, Loader2,
} from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────

const TIPO_CONFIG = {
  incidente:  { label: "Incidente",   icon: AlertTriangle, color: "#ec5d5e" },
  bug:        { label: "Bug",         icon: Bug,           color: "#f59e0b" },
  solicitacao:{ label: "Solicitação", icon: Wrench,        color: "#6B8AFF" },
  melhoria:   { label: "Melhoria",    icon: Lightbulb,     color: "#14E9BC" },
};

const STATUS_CONFIG = {
  aberto:       { label: "Aberto",       color: "#ec5d5e" },
  em_analise:   { label: "Em Análise",   color: "#f59e0b" },
  em_progresso: { label: "Em Progresso", color: "#6B8AFF" },
  resolvido:    { label: "Resolvido",    color: "#28d939" },
  fechado:      { label: "Fechado",      color: "#555"    },
};

const PRIORIDADE_CONFIG = {
  baixa:   { label: "Baixa",    color: "#6B8AFF" },
  media:   { label: "Média",    color: "#f59e0b" },
  alta:    { label: "Alta",     color: "#ec5d5e" },
  critica: { label: "Crítica",  color: "#ff0040" },
};

const STATUS_FLOW = ["aberto", "em_analise", "em_progresso", "resolvido", "fechado"] as const;

function fmtData(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Tickets() {
  const { usuario } = useAuth();
  const [tickets, setTickets]           = useState<TicketDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [usuarios, setUsuarios]         = useState<UsuarioDB[]>([]);
  const [loading, setLoading]           = useState(true);

  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroTipo, setFiltroTipo]     = useState("todos");

  const [modalAberto, setModalAberto]   = useState(false);
  const [detalhe, setDetalhe]           = useState<TicketDB | null>(null);
  const [salvando, setSalvando]         = useState(false);

  const [form, setForm] = useState({
    titulo: "", descricao: "", tipo: "incidente" as TicketDB["tipo"],
    prioridade: "media" as TicketDB["prioridade"], departamento_id: "",
    responsavel_id: "", prazo: "",
  });

  useEffect(() => {
    Promise.all([getTickets(), getDepartamentos(), getUsuarios()])
      .then(([t, d, u]) => { setTickets(t); setDepartamentos(d); setUsuarios(u); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reload = () => getTickets().then(setTickets).catch(console.error);

  const filtrados = tickets.filter((t) => {
    if (filtroStatus !== "todos" && t.status !== filtroStatus) return false;
    if (filtroTipo   !== "todos" && t.tipo   !== filtroTipo)   return false;
    return true;
  });

  // Kanban-style: agrupar por status
  const porStatus = STATUS_FLOW.map((s) => ({
    status: s,
    ...STATUS_CONFIG[s],
    items: filtrados.filter((t) => t.status === s),
  }));

  async function handleCriar() {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    try {
      await criarTicket({
        titulo: form.titulo,
        descricao: form.descricao || null,
        tipo: form.tipo,
        prioridade: form.prioridade,
        status: "aberto",
        departamento_id: form.departamento_id || null,
        responsavel_id: form.responsavel_id || null,
        reportado_por: usuario?.id ?? null,
        prazo: form.prazo || null,
      });
      setModalAberto(false);
      setForm({ titulo: "", descricao: "", tipo: "incidente", prioridade: "media", departamento_id: "", responsavel_id: "", prazo: "" });
      await reload();
    } finally {
      setSalvando(false);
    }
  }

  async function avancarStatus(ticket: TicketDB) {
    const idx = STATUS_FLOW.indexOf(ticket.status);
    if (idx >= STATUS_FLOW.length - 1) return;
    const novoStatus = STATUS_FLOW[idx + 1];
    setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, status: novoStatus } : t));
    await atualizarTicket(ticket.id, { status: novoStatus });
    if (detalhe?.id === ticket.id) setDetalhe((d) => d ? { ...d, status: novoStatus } : d);
  }

  async function handleFechar(id: string) {
    await fecharTicket(id);
    setDetalhe(null);
    await reload();
  }

  const counts = {
    abertos: tickets.filter((t) => t.status === "aberto").length,
    criticos: tickets.filter((t) => t.prioridade === "critica" && t.status !== "fechado").length,
    resolvidos: tickets.filter((t) => t.status === "resolvido" || t.status === "fechado").length,
  };

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#ec5d5e]/15 flex items-center justify-center">
                <Ticket size={20} className="text-[#ec5d5e]" />
              </div>
              <h1 className="font-bold text-rise-fg text-[32px]">Tickets</h1>
            </div>
            <p className="text-rise-fg-2 text-[15px] ml-[52px]">
              Acompanhamento de incidentes, bugs e solicitações
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="bg-[#14E9BC] text-[#000] px-5 py-2.5 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors mt-1"
          >
            <Plus size={18} />
            Novo Ticket
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Abertos",   value: counts.abertos,   color: "#ec5d5e" },
            { label: "Críticos",  value: counts.criticos,  color: "#ff0040" },
            { label: "Resolvidos",value: counts.resolvidos, color: "#28d939" },
          ].map((k) => (
            <div key={k.label} className="bg-rise-surface border border-rise-line-2 rounded-xl p-5">
              <p className="text-rise-fg-4 text-[12px] mb-1">{k.label}</p>
              <p className="text-[28px] font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-rise-surface border border-rise-line rounded-lg px-5 py-3 mb-6 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-rise-fg-2">
            <Filter size={15} />
            <span className="text-[13px]">Filtros:</span>
          </div>
          <div className="flex gap-2">
            {["todos", ...Object.keys(STATUS_CONFIG)].map((s) => (
              <button key={s} onClick={() => setFiltroStatus(s)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                  filtroStatus === s ? "bg-[#14E9BC]/15 border border-[#14E9BC]/40 text-[#14E9BC]" : "text-rise-fg-3 hover:text-rise-fg-2"
                }`}>
                {s === "todos" ? "Todos" : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label}
              </button>
            ))}
          </div>
          <div className="w-px h-4 bg-rise-line" />
          <div className="flex gap-2">
            {["todos", ...Object.keys(TIPO_CONFIG)].map((t) => (
              <button key={t} onClick={() => setFiltroTipo(t)}
                className={`px-3 py-1 rounded-lg text-[12px] font-medium transition-colors ${
                  filtroTipo === t ? "bg-[#14E9BC]/15 border border-[#14E9BC]/40 text-[#14E9BC]" : "text-rise-fg-3 hover:text-rise-fg-2"
                }`}>
                {t === "todos" ? "Todos tipos" : TIPO_CONFIG[t as keyof typeof TIPO_CONFIG]?.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-rise-fg-4 text-[12px]">{filtrados.length} ticket{filtrados.length !== 1 ? "s" : ""}</span>
        </div>

        {/* Board por status */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-[#14E9BC] animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-6">
            {porStatus.map((col) => (
              <div key={col.status} className="flex-shrink-0" style={{ width: "280px" }}>
                <div className="rounded-xl p-3 mb-3 border" style={{ borderColor: `${col.color}30`, backgroundColor: `${col.color}08` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                      <span className="font-semibold text-[13px]" style={{ color: col.color }}>{col.label}</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${col.color}20`, color: col.color }}>
                      {col.items.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {col.items.length === 0 ? (
                    <div className="border border-dashed border-rise-line-2 rounded-xl p-6 text-center">
                      <p className="text-rise-fg-4 text-[12px]">Sem tickets</p>
                    </div>
                  ) : col.items.map((ticket) => {
                    const TipoIcon = TIPO_CONFIG[ticket.tipo]?.icon ?? AlertTriangle;
                    const tipoColor = TIPO_CONFIG[ticket.tipo]?.color ?? "#555";
                    const priorColor = PRIORIDADE_CONFIG[ticket.prioridade]?.color ?? "#555";
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setDetalhe(ticket)}
                        className="bg-rise-surface border border-rise-line-2 rounded-xl p-4 hover:border-rise-line-3 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <TipoIcon size={13} style={{ color: tipoColor }} />
                            <span className="text-[10px] font-semibold" style={{ color: tipoColor }}>
                              {TIPO_CONFIG[ticket.tipo]?.label}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${priorColor}20`, color: priorColor }}>
                            {PRIORIDADE_CONFIG[ticket.prioridade]?.label}
                          </span>
                        </div>

                        <h4 className="text-rise-fg text-[13px] font-semibold leading-snug mb-2 line-clamp-2">
                          {ticket.titulo}
                        </h4>

                        <div className="flex items-center justify-between pt-2 border-t border-rise-raised">
                          <span className="text-rise-fg-4 text-[10px]">
                            {ticket.responsavel?.nome?.split(" ")[0] ?? "Sem responsável"}
                          </span>
                          <span className="text-rise-fg-4 text-[10px]">{fmtData(ticket.criado_em)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Novo Ticket */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-rise-surface border border-rise-line rounded-2xl p-6 w-full max-w-[520px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-rise-fg text-[18px] font-semibold">Novo Ticket</h2>
              <button onClick={() => setModalAberto(false)} className="text-rise-fg-4 hover:text-rise-fg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Título *</label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Descreva o problema ou solicitação"
                  className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[14px] focus:border-[#14E9BC] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Tipo</label>
                  <select value={form.tipo} onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as TicketDB["tipo"] }))}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    {Object.entries(TIPO_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Prioridade</label>
                  <select value={form.prioridade} onChange={(e) => setForm((f) => ({ ...f, prioridade: e.target.value as TicketDB["prioridade"] }))}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    {Object.entries(PRIORIDADE_CONFIG).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Departamento</label>
                  <select value={form.departamento_id} onChange={(e) => setForm((f) => ({ ...f, departamento_id: e.target.value }))}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Responsável</label>
                  <select value={form.responsavel_id} onChange={(e) => setForm((f) => ({ ...f, responsavel_id: e.target.value }))}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-3 py-2.5 text-rise-fg text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Prazo</label>
                <input type="date" value={form.prazo} onChange={(e) => setForm((f) => ({ ...f, prazo: e.target.value }))}
                  className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[13px] focus:border-[#14E9BC] focus:outline-none" />
              </div>

              <div>
                <label className="text-rise-fg-2 text-[12px] mb-1.5 block">Descrição</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
                  rows={3}
                  placeholder="Contexto adicional..."
                  className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-2.5 text-rise-fg text-[13px] resize-none focus:border-[#14E9BC] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalAberto(false)}
                className="flex-1 bg-rise-raised border border-rise-line text-rise-fg-2 py-2.5 rounded-lg text-[14px] hover:text-rise-fg transition-colors">
                Cancelar
              </button>
              <button onClick={handleCriar} disabled={!form.titulo.trim() || salvando}
                className="flex-1 bg-[#14E9BC] text-[#000] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {salvando ? "Criando..." : "Criar Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhe do Ticket */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-rise-surface border border-rise-line rounded-2xl p-6 w-full max-w-[560px]">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-2">
                {(() => { const TipoIcon = TIPO_CONFIG[detalhe.tipo]?.icon ?? AlertTriangle; return <TipoIcon size={16} style={{ color: TIPO_CONFIG[detalhe.tipo]?.color }} />; })()}
                <span className="text-[12px] font-semibold" style={{ color: TIPO_CONFIG[detalhe.tipo]?.color }}>
                  {TIPO_CONFIG[detalhe.tipo]?.label}
                </span>
              </div>
              <button onClick={() => setDetalhe(null)} className="text-rise-fg-4 hover:text-rise-fg transition-colors">
                <X size={20} />
              </button>
            </div>

            <h2 className="text-rise-fg text-[18px] font-semibold mb-4">{detalhe.titulo}</h2>

            {detalhe.descricao && (
              <p className="text-rise-fg-2 text-[14px] leading-relaxed mb-5 bg-rise-surface rounded-xl p-4">
                {detalhe.descricao}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5 text-[13px]">
              {[
                { label: "Status",      value: STATUS_CONFIG[detalhe.status]?.label,          color: STATUS_CONFIG[detalhe.status]?.color },
                { label: "Prioridade",  value: PRIORIDADE_CONFIG[detalhe.prioridade]?.label,  color: PRIORIDADE_CONFIG[detalhe.prioridade]?.color },
                { label: "Responsável", value: detalhe.responsavel?.nome ?? "—",              color: "#eee" },
                { label: "Aberto em",   value: fmtData(detalhe.criado_em),                   color: "#bdbdbd" },
              ].map((row) => (
                <div key={row.label} className="bg-rise-surface rounded-xl p-3">
                  <p className="text-rise-fg-4 text-[11px] mb-1">{row.label}</p>
                  <p className="font-semibold" style={{ color: row.color }}>{row.value}</p>
                </div>
              ))}
            </div>

            {/* Fluxo de status */}
            <div className="flex items-center gap-1 mb-5 overflow-x-auto">
              {STATUS_FLOW.map((s, i) => {
                const current = STATUS_FLOW.indexOf(detalhe.status);
                const done = i <= current;
                return (
                  <div key={s} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${done ? "" : "opacity-30"}`}
                      style={{ backgroundColor: STATUS_CONFIG[s].color }} />
                    <span className={`text-[10px] whitespace-nowrap ${done ? "text-rise-fg-2" : "text-rise-fg-4"}`}>
                      {STATUS_CONFIG[s].label}
                    </span>
                    {i < STATUS_FLOW.length - 1 && <ChevronRight size={10} className="text-rise-fg-4" />}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              {detalhe.status !== "fechado" && detalhe.status !== "resolvido" && (
                <button onClick={() => avancarStatus(detalhe)}
                  className="flex-1 bg-[#6B8AFF]/15 border border-[#6B8AFF]/30 text-[#6B8AFF] py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#6B8AFF]/25 transition-colors flex items-center justify-center gap-2">
                  <ChevronRight size={15} />
                  Avançar Status
                </button>
              )}
              {(detalhe.status === "resolvido" || detalhe.status === "em_progresso") && (
                <button onClick={() => handleFechar(detalhe.id)}
                  className="flex-1 bg-[#28d939]/15 border border-[#28d939]/30 text-[#28d939] py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#28d939]/25 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 size={15} />
                  Fechar Ticket
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
