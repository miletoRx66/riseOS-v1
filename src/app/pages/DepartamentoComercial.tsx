import { useState, useEffect, useRef } from "react";
import {
  getClientes, criarCliente, atualizarCliente,
  getOperacoes, criarOperacao, atualizarOperacao,
  getComentarios, criarComentario, fmtValor,
  type CRMCliente, type CRMOperacao, type CRMComentario,
} from "../../lib/services/crm";
import { getUsuarios, type UsuarioDB } from "../../lib/services/usuarios";
import { useAuth } from "../context/AuthContext";
import {
  Users, TrendingUp, Plus, X, Filter,
  Loader2, Building2, Phone, Mail,
  ChevronRight, Calendar, Tag, User, MessageCircle, Send, Network,
} from "lucide-react";
import PipelineParceiros from "./PipelineParceiros";

// ── Config ────────────────────────────────────────────────────────────────────

const CLIENTE_STATUS = {
  lead:        { label: "Lead",        color: "#6B8AFF" },
  prospecto:   { label: "Prospecto",   color: "#f59e0b" },
  qualificado: { label: "Qualificado", color: "#14E9BC" },
  ativo:       { label: "Ativo",       color: "#28d939" },
  inativo:     { label: "Inativo",     color: "#555"    },
};

const OP_STATUS = {
  aberta:      { label: "Aberta",      color: "#6B8AFF" },
  negociacao:  { label: "Negociação",  color: "#f59e0b" },
  proposta:    { label: "Proposta",    color: "#14E9BC" },
  fechada:     { label: "Fechada",     color: "#28d939" },
  perdida:     { label: "Perdida",     color: "#ec5d5e" },
};

const PRIORIDADE_COLOR = { baixa: "#6B8AFF", media: "#f59e0b", alta: "#ec5d5e" };

// ── Component ─────────────────────────────────────────────────────────────────

export default function DepartamentoComercial() {
  const { usuario } = useAuth();
  const [tab, setTab] = useState<"clientes" | "operacoes" | "pipeline">("clientes");

  const [clientes, setClientes]     = useState<CRMCliente[]>([]);
  const [operacoes, setOperacoes]   = useState<CRMOperacao[]>([]);
  const [usuarios, setUsuarios]     = useState<UsuarioDB[]>([]);
  const [loading, setLoading]       = useState(true);

  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [modalCliente, setModalCliente] = useState(false);
  const [modalOp, setModalOp]           = useState(false);
  const [detalheCliente, setDetalheCliente] = useState<CRMCliente | null>(null);
  const [detalheOp, setDetalheOp]       = useState<CRMOperacao | null>(null);
  const [salvando, setSalvando]         = useState(false);

  // drag-and-drop operações
  const draggingOpRef                   = useRef<string | null>(null);
  const [draggingOpId, setDraggingOpId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  // comentários
  const [comentarios, setComentarios]       = useState<CRMComentario[]>([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  const [formCliente, setFormCliente] = useState({
    nome: "", email: "", telefone: "", empresa: "",
    tipo: "pj" as CRMCliente["tipo"],
    status: "lead" as CRMCliente["status"],
    responsavel_id: "", originador_id: "",
    persona: [] as string[],
    prioridade: "media" as CRMCliente["prioridade"],
    prazo: "", notas: "",
  });

  const [formOp, setFormOp] = useState({
    titulo: "", tipo: "", cliente_id: "",
    status: "aberta" as CRMOperacao["status"],
    responsavel_id: "", originador_id: "",
    valor: "", prioridade: "media" as CRMOperacao["prioridade"],
    prazo: "", descricao: "",
  });

  useEffect(() => {
    Promise.all([getClientes(), getOperacoes(), getUsuarios()])
      .then(([c, o, u]) => { setClientes(c); setOperacoes(o); setUsuarios(u); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const reloadAll = () =>
    Promise.all([getClientes(), getOperacoes()])
      .then(([c, o]) => { setClientes(c); setOperacoes(o); })
      .catch(console.error);

  useEffect(() => {
    if (!detalheOp) { setComentarios([]); return; }
    getComentarios(detalheOp.id).then(setComentarios).catch(console.error);
  }, [detalheOp?.id]);

  async function handleEnviarComentario() {
    if (!novoComentario.trim() || !detalheOp || !usuario) return;
    setEnviandoComentario(true);
    try {
      const novo = await criarComentario(detalheOp.id, usuario.id, novoComentario.trim());
      setComentarios((prev: CRMComentario[]) => [...prev, novo]);
      setNovoComentario("");
    } finally { setEnviandoComentario(false); }
  }

  // ── KPIs ────────────────────────────────────────────────────────

  const pipeline = operacoes
    .filter((o) => o.status !== "perdida" && o.status !== "fechada")
    .reduce((s, o) => s + Number(o.valor), 0);

  const receita = operacoes
    .filter((o) => o.status === "fechada")
    .reduce((s, o) => s + Number(o.valor), 0);

  const taxaConversao = clientes.length > 0
    ? Math.round((clientes.filter((c) => c.status === "ativo").length / clientes.length) * 100)
    : 0;

  // ── Filtered lists ───────────────────────────────────────────────

  const clientesVisiveis = clientes.filter((c: CRMCliente) =>
    filtroStatus === "todos" || c.status === filtroStatus
  );

  const opFiltradas = operacoes.filter((o) =>
    filtroStatus === "todos" ? true : o.status === filtroStatus
  );

  // ── Handlers ────────────────────────────────────────────────────

  async function handleCriarCliente() {
    if (!formCliente.nome.trim()) return;
    setSalvando(true);
    try {
      await criarCliente({
        nome: formCliente.nome,
        email: formCliente.email || null,
        telefone: formCliente.telefone || null,
        empresa: formCliente.empresa || null,
        tipo: formCliente.tipo,
        status: formCliente.status,
        responsavel_id: formCliente.responsavel_id || null,
        originador_id: formCliente.originador_id || null,
        valor_potencial: 0,
        persona: formCliente.persona.length > 0 ? formCliente.persona : null,
        prioridade: formCliente.prioridade,
        prazo: formCliente.prazo || null,
        notas: formCliente.notas || null,
      });
      setModalCliente(false);
      setFormCliente({ nome: "", email: "", telefone: "", empresa: "", tipo: "pj", status: "lead", responsavel_id: "", originador_id: "", persona: [], prioridade: "media", prazo: "", notas: "" });
      await reloadAll();
    } finally { setSalvando(false); }
  }

  async function handleCriarOp() {
    if (!formOp.titulo.trim()) return;
    setSalvando(true);
    try {
      await criarOperacao({
        titulo: formOp.titulo,
        tipo: formOp.tipo || null,
        cliente_id: formOp.cliente_id || null,
        status: formOp.status,
        responsavel_id: formOp.responsavel_id || null,
        originador_id: formOp.originador_id || null,
        valor: parseFloat(formOp.valor) || 0,
        prioridade: formOp.prioridade,
        prazo: formOp.prazo || null,
        descricao: formOp.descricao || null,
      });
      setModalOp(false);
      setFormOp({ titulo: "", tipo: "", cliente_id: "", status: "aberta", responsavel_id: "", originador_id: "", valor: "", prioridade: "media", prazo: "", descricao: "" });
      await reloadAll();
    } finally { setSalvando(false); }
  }

  // ── Drag handlers (operações) ────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleOpDragStart(e: any, opId: string) {
    draggingOpRef.current = opId;
    setDraggingOpId(opId);
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  }

  function handleOpDragEnd() {
    setDraggingOpId(null);
    setDragOverStatus(null);
    draggingOpRef.current = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleOpDragOver(e: any, status: string) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleOpDrop(e: any, novoStatus: CRMOperacao["status"]) {
    e.preventDefault();
    const id = draggingOpRef.current;
    if (!id) return;
    const op = operacoes.find((o) => o.id === id);
    if (!op || op.status === novoStatus) { handleOpDragEnd(); return; }

    setOperacoes((prev) => prev.map((o) => o.id === id ? { ...o, status: novoStatus } : o));
    handleOpDragEnd();
    try {
      await atualizarOperacao(id, { status: novoStatus });
      if (detalheOp?.id === id) setDetalheOp((d) => d ? { ...d, status: novoStatus } : d);
    } catch (err) {
      console.error("Erro ao mover operação:", err);
      setOperacoes((prev) => prev.map((o) => o.id === id ? { ...o, status: op.status } : o));
    }
  }

  async function handleAvancarOp(op: CRMOperacao) {
    const flow: CRMOperacao["status"][] = ["aberta", "negociacao", "proposta", "fechada"];
    const idx = flow.indexOf(op.status);
    if (idx < 0 || idx >= flow.length - 1) return;
    const novoStatus = flow[idx + 1];
    setOperacoes((prev) => prev.map((o) => o.id === op.id ? { ...o, status: novoStatus } : o));
    if (detalheOp?.id === op.id) setDetalheOp((d) => d ? { ...d, status: novoStatus } : d);
    await atualizarOperacao(op.id, { status: novoStatus });
  }

  async function handleMarcarPerdida(op: CRMOperacao) {
    setOperacoes((prev) => prev.map((o) => o.id === op.id ? { ...o, status: "perdida" } : o));
    setDetalheOp(null);
    await atualizarOperacao(op.id, { status: "perdida" });
  }

  // ── ────────────────────────────────────────────────────────────────

  async function handleAvancarCliente(cliente: CRMCliente) {
    const flow: CRMCliente["status"][] = ["lead", "prospecto", "qualificado", "ativo"];
    const idx = flow.indexOf(cliente.status);
    if (idx >= flow.length - 1) return;
    await atualizarCliente(cliente.id, { status: flow[idx + 1] });
    await reloadAll();
    if (detalheCliente?.id === cliente.id) setDetalheCliente((d) => d ? { ...d, status: flow[idx + 1] } : d);
  }

  // ── Render ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#28d939]/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#28d939]" />
              </div>
              <div>
                <h1 className="font-bold text-[#eee] text-[28px] leading-tight">CRM Comercial</h1>
                <p className="text-[#555] text-[13px]">Departamento Comercial</p>
              </div>
            </div>
          </div>
          {tab !== "pipeline" && (
            <button
              onClick={() => tab === "clientes" ? setModalCliente(true) : setModalOp(true)}
              className="bg-[#14E9BC] text-[#000] px-5 py-2.5 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors mt-1"
            >
              <Plus size={18} />
              {tab === "clientes" ? "Novo Investidor" : "Nova Operação"}
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Clientes",         value: clientes.length,                   color: "#6B8AFF",  suffix: "" },
            { label: "Pipeline",         value: fmtValor(pipeline),                color: "#f59e0b",  suffix: "" },
            { label: "Receita Fechada",  value: fmtValor(receita),                 color: "#28d939",  suffix: "" },
            { label: "Taxa Conversão",   value: `${taxaConversao}%`,               color: "#14E9BC",  suffix: "" },
          ].map((k) => (
            <div key={k.label} className="bg-[#0f0f0f] border border-[#222] rounded-xl p-5">
              <p className="text-[#555] text-[12px] mb-1">{k.label}</p>
              <p className="text-[22px] font-bold" style={{ color: k.color }}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs — underline style, sem caixas */}
        <div className="flex gap-0 mb-5 border-b border-[#1e1e1e]">
          {([
            ["clientes",  "Investidores",      <Users size={14} />,      clientes.length],
            ["operacoes", "Operações",          <TrendingUp size={14} />, operacoes.length],
            ["pipeline",  "Pipeline Parceiros", <Network size={14} />,    null],
          ] as const).map(([t, label, icon, count]) => (
            <button key={t} onClick={() => { setTab(t as typeof tab); setFiltroStatus("todos"); }}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold transition-all border-b-2 -mb-px ${
                tab === t
                  ? "border-[#14E9BC] text-[#14E9BC]"
                  : "border-transparent text-[#555] hover:text-[#bdbdbd]"
              }`}>
              {icon}
              {label}
              {count !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-0.5 ${
                  tab === t ? "bg-[#14E9BC]/20 text-[#14E9BC]" : "bg-[#1a1a1a] text-[#444]"
                }`}>{count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Filtro inline — sem caixa separada */}
        {tab !== "pipeline" && (
          <div className="flex items-center gap-1.5 mb-5 flex-wrap">
            <Filter size={12} className="text-[#444] mr-1" />
            {(tab === "clientes"
              ? [{ v: "todos", l: "Todos" }, ...Object.entries(CLIENTE_STATUS).map(([v, c]) => ({ v, l: c.label }))]
              : [{ v: "todos", l: "Todos" }, ...Object.entries(OP_STATUS).map(([v, c]) => ({ v, l: c.label }))]
            ).map(({ v, l }) => (
              <button key={v} onClick={() => setFiltroStatus(v)}
                className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                  filtroStatus === v
                    ? "bg-[#14E9BC]/15 text-[#14E9BC]"
                    : "text-[#555] hover:text-[#bdbdbd]"
                }`}>
                {l}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {tab === "pipeline" ? (
          <PipelineParceiros />
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="text-[#14E9BC] animate-spin" />
          </div>
        ) : tab === "clientes" ? (

          /* ── Investidores ── */
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientesVisiveis.length === 0 ? (
              <div className="col-span-3 text-center py-16 text-[#444]">Nenhum investidor encontrado</div>
            ) : clientesVisiveis.map((cliente: CRMCliente) => {
              const st = CLIENTE_STATUS[cliente.status];
              const pr = PRIORIDADE_COLOR[cliente.prioridade as keyof typeof PRIORIDADE_COLOR] ?? "#555";
              return (
                <div key={cliente.id} onClick={() => setDetalheCliente(cliente)}
                  className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#444] transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-[#eee] font-semibold text-[15px] truncate">{cliente.nome}</h3>
                      {cliente.empresa && <p className="text-[#555] text-[12px] mt-0.5 truncate">{cliente.empresa}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${st.color}18`, color: st.color }}>
                        {st.label}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: cliente.tipo === "pj" ? "#6B8AFF18" : "#f59e0b18", color: cliente.tipo === "pj" ? "#6B8AFF" : "#f59e0b" }}>
                        {cliente.tipo === "pj" ? "B2B" : "PF"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-[#666] text-[12px]">
                        <Mail size={12} />{cliente.email}
                      </div>
                    )}
                    {cliente.telefone && (
                      <div className="flex items-center gap-2 text-[#666] text-[12px]">
                        <Phone size={12} />{cliente.telefone}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pr }} />
                      <span className="text-[11px]" style={{ color: pr }}>
                        {cliente.prioridade.charAt(0).toUpperCase() + cliente.prioridade.slice(1)}
                      </span>
                    </div>
                    {cliente.persona && cliente.persona.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-end">
                        {cliente.persona.map((p) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-[#14E9BC]/10 text-[#14E9BC]">{p}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2.5 text-[11px] text-[#555]">
                    {cliente.responsavel && (
                      <span className="flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-[#14E9BC]/15 flex items-center justify-center text-[#14E9BC] text-[9px] font-bold">
                          {cliente.responsavel.nome.charAt(0)}
                        </span>
                        {cliente.responsavel.nome.split(" ")[0]}
                      </span>
                    )}
                    {cliente.originador && (
                      <span className="text-[#444]">via {cliente.originador.nome.split(" ")[0]}</span>
                    )}
                  </div>
                </div>
              );
            })}
            </div>
          </div>

        ) : (

          /* ── Operações board (drag-and-drop) ── */
          <div className="flex gap-4 overflow-x-auto pb-4 select-none">
            {Object.entries(OP_STATUS).map(([statusKey, stCfg]) => {
              const items = opFiltradas.filter((o) => o.status === statusKey);
              const total = items.reduce((s, o) => s + Number(o.valor), 0);
              const isOver = dragOverStatus === statusKey;
              return (
                <div
                  key={statusKey}
                  className="flex-shrink-0 transition-all"
                  style={{ width: "260px" }}
                  onDragOver={(e) => handleOpDragOver(e, statusKey)}
                  onDragLeave={() => setDragOverStatus(null)}
                  onDrop={(e) => handleOpDrop(e, statusKey as CRMOperacao["status"])}
                >
                  {/* Column header */}
                  <div
                    className="rounded-xl p-3 mb-3 border transition-all"
                    style={{
                      borderColor: isOver ? stCfg.color : `${stCfg.color}30`,
                      backgroundColor: isOver ? `${stCfg.color}18` : `${stCfg.color}08`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[13px]" style={{ color: stCfg.color }}>{stCfg.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${stCfg.color}20`, color: stCfg.color }}>
                        {items.length}
                      </span>
                    </div>
                    {total > 0 && (
                      <p className="text-[11px] mt-1" style={{ color: `${stCfg.color}99` }}>{fmtValor(total)}</p>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5 min-h-[60px]">
                    {items.length === 0 ? (
                      <div
                        className="border border-dashed rounded-xl p-5 text-center transition-all"
                        style={{ borderColor: isOver ? stCfg.color : "#222", backgroundColor: isOver ? `${stCfg.color}08` : "transparent" }}
                      >
                        <p className="text-[#444] text-[12px]">{isOver ? "Soltar aqui" : "Sem operações"}</p>
                      </div>
                    ) : items.map((op) => {
                      const isDragging = draggingOpId === op.id;
                      const prioColor = PRIORIDADE_COLOR[op.prioridade] ?? "#555";
                      return (
                        <div
                          key={op.id}
                          draggable
                          onDragStart={(e) => handleOpDragStart(e, op.id)}
                          onDragEnd={handleOpDragEnd}
                          onClick={() => setDetalheOp(op)}
                          className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl p-4 cursor-pointer hover:border-[#444] transition-all"
                          style={{ opacity: isDragging ? 0.4 : 1 }}
                        >
                          <div className="flex items-start gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: prioColor }} />
                            <h4 className="text-[#eee] text-[13px] font-semibold line-clamp-2 leading-snug">{op.titulo}</h4>
                          </div>

                          {op.tipo && (
                            <p className="text-[#555] text-[11px] mb-1.5 flex items-center gap-1">
                              <Tag size={9} />{op.tipo}
                            </p>
                          )}

                          {op.cliente && (
                            <p className="text-[#555] text-[11px] mb-2 flex items-center gap-1">
                              <Building2 size={9} />{op.cliente.nome}
                            </p>
                          )}

                          {op.prazo && (
                            <p className="text-[#555] text-[11px] mb-2 flex items-center gap-1">
                              <Calendar size={9} />
                              {new Date(op.prazo).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </p>
                          )}

                          <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
                            <div className="flex items-center gap-2 text-[11px] text-[#666]">
                              {op.responsavel ? (
                                <span className="flex items-center gap-1">
                                  <span className="w-5 h-5 rounded-full bg-[#6B8AFF]/15 flex items-center justify-center text-[#6B8AFF] text-[9px] font-bold">
                                    {op.responsavel.nome.charAt(0).toUpperCase()}
                                  </span>
                                  <span className="text-[#999]">{op.responsavel.nome.split(" ")[0]}</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-[#333]">
                                  <User size={11} />Sem resp.
                                </span>
                              )}
                              {op.originador && (
                                <span className="text-[#444]">/ {op.originador.nome.split(" ")[0]}</span>
                              )}
                            </div>
                            {Number(op.valor) > 0 && (
                              <span className="text-[#28d939] text-[11px] font-semibold">{fmtValor(Number(op.valor))}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Novo Cliente */}
      {modalCliente && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-[560px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#eee] text-[18px] font-semibold">Novo Cliente / Lead</h2>
              <button onClick={() => setModalCliente(false)} className="text-[#555] hover:text-[#eee]"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              {/* Tipo: B2B / PF */}
              <div>
                <label className="text-[#bdbdbd] text-[12px] mb-2 block">Tipo de Cliente</label>
                <div className="flex gap-2">
                  {([["pj", "B2B — Pessoa Jurídica"], ["pf", "PF — Pessoa Física"]] as const).map(([v, label]) => (
                    <button key={v} type="button"
                      onClick={() => setFormCliente((f: typeof formCliente) => ({ ...f, tipo: v }))}
                      className={`flex-1 py-2 rounded-lg text-[13px] font-semibold border transition-all ${
                        formCliente.tipo === v
                          ? "bg-[#14E9BC]/15 border-[#14E9BC]/50 text-[#14E9BC]"
                          : "bg-[#1a1a1a] border-[#333] text-[#666] hover:border-[#555]"
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Nome *</label>
                  <input value={formCliente.nome} onChange={(e) => setFormCliente((f) => ({ ...f, nome: e.target.value }))}
                    placeholder="Nome completo ou razão social"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Empresa</label>
                  <input value={formCliente.empresa} onChange={(e) => setFormCliente((f) => ({ ...f, empresa: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Status</label>
                  <select value={formCliente.status} onChange={(e) => setFormCliente((f) => ({ ...f, status: e.target.value as CRMCliente["status"] }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    {Object.entries(CLIENTE_STATUS).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Email</label>
                  <input type="email" value={formCliente.email} onChange={(e) => setFormCliente((f) => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Telefone</label>
                  <input value={formCliente.telefone} onChange={(e) => setFormCliente((f) => ({ ...f, telefone: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none" />
                </div>

                {/* Responsável + Originador */}
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Responsável</label>
                  <select value={formCliente.responsavel_id} onChange={(e) => setFormCliente((f) => ({ ...f, responsavel_id: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Originador</label>
                  <select value={formCliente.originador_id} onChange={(e) => setFormCliente((f) => ({ ...f, originador_id: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>

                {/* Personas + Prioridade */}
                <div className="col-span-2">
                  <label className="text-[#bdbdbd] text-[12px] mb-2 block">Persona <span className="text-[#555]">(múltipla escolha)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {["Gestora", "Administradora", "Escritórios", "Outros"].map((p) => {
                      const ativo = formCliente.persona.includes(p);
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            setFormCliente((f) => ({
                              ...f,
                              persona: ativo
                                ? f.persona.filter((x) => x !== p)
                                : [...f.persona, p],
                            }))
                          }
                          className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all border ${
                            ativo
                              ? "bg-[#14E9BC]/15 border-[#14E9BC]/50 text-[#14E9BC]"
                              : "bg-[#1a1a1a] border-[#333] text-[#777] hover:border-[#555] hover:text-[#bdbdbd]"
                          }`}
                        >
                          {ativo && <span className="mr-1.5">✓</span>}{p}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Prioridade</label>
                  <select value={formCliente.prioridade} onChange={(e) => setFormCliente((f) => ({ ...f, prioridade: e.target.value as CRMCliente["prioridade"] }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Prazo</label>
                  <input type="date" value={formCliente.prazo} onChange={(e) => setFormCliente((f) => ({ ...f, prazo: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Notas</label>
                  <textarea value={formCliente.notas} onChange={(e) => setFormCliente((f) => ({ ...f, notas: e.target.value }))}
                    rows={2} placeholder="Observações sobre o cliente..."
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] resize-none focus:border-[#14E9BC] focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalCliente(false)}
                className="flex-1 bg-[#1a1a1a] border border-[#333] text-[#bdbdbd] py-2.5 rounded-lg text-[14px] hover:text-[#eee] transition-colors">
                Cancelar
              </button>
              <button onClick={handleCriarCliente} disabled={!formCliente.nome.trim() || salvando}
                className="flex-1 bg-[#14E9BC] text-[#000] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {salvando ? "Salvando..." : "Cadastrar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Operação */}
      {modalOp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-[520px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[#eee] text-[18px] font-semibold">Nova Operação</h2>
              <button onClick={() => setModalOp(false)} className="text-[#555] hover:text-[#eee]"><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Título *</label>
                <input value={formOp.titulo} onChange={(e) => setFormOp((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ex: Contrato de Gestão — Empresa XYZ"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Cliente</label>
                  <select value={formOp.cliente_id} onChange={(e) => setFormOp((f) => ({ ...f, cliente_id: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Status</label>
                  <select value={formOp.status} onChange={(e) => setFormOp((f) => ({ ...f, status: e.target.value as CRMOperacao["status"] }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    {Object.entries(OP_STATUS).map(([v, c]) => <option key={v} value={v}>{c.label}</option>)}
                  </select>
                </div>

                {/* Responsável + Originador */}
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Responsável</label>
                  <select value={formOp.responsavel_id} onChange={(e) => setFormOp((f) => ({ ...f, responsavel_id: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Originador</label>
                  <select value={formOp.originador_id} onChange={(e) => setFormOp((f) => ({ ...f, originador_id: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="">Nenhum</option>
                    {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Valor (R$)</label>
                  <input type="number" value={formOp.valor} onChange={(e) => setFormOp((f) => ({ ...f, valor: e.target.value }))}
                    placeholder="0"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none" />
                </div>
                <div>
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Prioridade</label>
                  <select value={formOp.prioridade} onChange={(e) => setFormOp((f) => ({ ...f, prioridade: e.target.value as CRMOperacao["prioridade"] }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Prazo</label>
                  <input type="date" value={formOp.prazo} onChange={(e) => setFormOp((f) => ({ ...f, prazo: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="text-[#bdbdbd] text-[12px] mb-1.5 block">Descrição</label>
                  <textarea value={formOp.descricao} onChange={(e) => setFormOp((f) => ({ ...f, descricao: e.target.value }))}
                    rows={2} className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[13px] resize-none focus:border-[#14E9BC] focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalOp(false)}
                className="flex-1 bg-[#1a1a1a] border border-[#333] text-[#bdbdbd] py-2.5 rounded-lg text-[14px] hover:text-[#eee] transition-colors">
                Cancelar
              </button>
              <button onClick={handleCriarOp} disabled={!formOp.titulo.trim() || salvando}
                className="flex-1 bg-[#14E9BC] text-[#000] py-2.5 rounded-lg font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {salvando ? "Salvando..." : "Criar Operação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhe Operação */}
      {detalheOp && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-[520px] max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-3 flex-1 pr-4">
                <span
                  className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                  style={{ backgroundColor: PRIORIDADE_COLOR[detalheOp.prioridade as keyof typeof PRIORIDADE_COLOR] ?? "#555" }}
                />
                <div>
                  <h2 className="text-[#eee] text-[18px] font-semibold leading-snug">{detalheOp.titulo}</h2>
                  {detalheOp.tipo && (
                    <p className="text-[#555] text-[12px] mt-0.5 flex items-center gap-1.5">
                      <Tag size={11} />{detalheOp.tipo}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => setDetalheOp(null)} className="text-[#555] hover:text-[#eee] flex-shrink-0"><X size={20} /></button>
            </div>

            {/* Status flow */}
            <div className="flex items-center gap-1 mb-5 overflow-x-auto">
              {Object.entries(OP_STATUS).map(([sk, sc], i, arr) => {
                const statusKeys = Object.keys(OP_STATUS);
                const curIdx = statusKeys.indexOf(detalheOp.status);
                const thisIdx = statusKeys.indexOf(sk);
                const isPast = thisIdx < curIdx;
                const isCurrent = sk === detalheOp.status;
                return (
                  <div key={sk} className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all"
                      style={{
                        backgroundColor: isCurrent ? sc.color : isPast ? `${sc.color}30` : "#1a1a1a",
                        color: isCurrent ? "#000" : isPast ? sc.color : "#555",
                        border: `1px solid ${isCurrent ? sc.color : isPast ? `${sc.color}40` : "#2a2a2a"}`,
                      }}
                    >
                      {sc.label}
                    </div>
                    {i < arr.length - 1 && <ChevronRight size={10} className="text-[#333] flex-shrink-0" />}
                  </div>
                );
              })}
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: "Cliente",     value: detalheOp.cliente?.nome ?? "—",             color: "#eee" },
                { label: "Prioridade",  value: detalheOp.prioridade.charAt(0).toUpperCase() + detalheOp.prioridade.slice(1), color: PRIORIDADE_COLOR[detalheOp.prioridade as keyof typeof PRIORIDADE_COLOR] ?? "#eee" },
                { label: "Responsável", value: detalheOp.responsavel?.nome ?? "—",         color: "#eee" },
                { label: "Originador",  value: detalheOp.originador?.nome ?? "—",          color: "#bdbdbd" },
              ].map((row) => (
                <div key={row.label} className="bg-[#0f0f0f] rounded-xl p-3">
                  <p className="text-[#555] text-[11px] mb-1">{row.label}</p>
                  <p className="font-semibold text-[13px]" style={{ color: row.color }}>{row.value}</p>
                </div>
              ))}
            </div>

            {/* Valor + Prazo */}
            <div className="flex gap-3 mb-4">
              {Number(detalheOp.valor) > 0 && (
                <div className="flex-1 bg-[#0f0f0f] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[#555] text-[12px]">Valor</span>
                  <span className="text-[#28d939] font-bold text-[18px]">{fmtValor(Number(detalheOp.valor))}</span>
                </div>
              )}
              {detalheOp.prazo && (
                <div className="flex-1 bg-[#0f0f0f] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[#555] text-[12px] flex items-center gap-1"><Calendar size={11} />Prazo</span>
                  <span className="text-[#eee] font-semibold text-[13px]">
                    {new Date(detalheOp.prazo).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                  </span>
                </div>
              )}
            </div>

            {/* Descrição */}
            {detalheOp.descricao && (
              <div className="bg-[#0f0f0f] rounded-xl p-4 mb-5">
                <p className="text-[#555] text-[11px] mb-1.5">Descrição</p>
                <p className="text-[#bdbdbd] text-[13px] leading-relaxed">{detalheOp.descricao}</p>
              </div>
            )}

            {/* Criado em */}
            <p className="text-[#333] text-[11px] mb-5">
              Criada em {new Date(detalheOp.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              {detalheOp.status !== "fechada" && detalheOp.status !== "perdida" && (
                <>
                  <button
                    onClick={() => handleAvancarOp(detalheOp)}
                    className="flex-1 bg-[#14E9BC]/15 border border-[#14E9BC]/30 text-[#14E9BC] py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#14E9BC]/25 transition-colors flex items-center justify-center gap-2">
                    <ChevronRight size={16} />Avançar Status
                  </button>
                  <button
                    onClick={() => handleMarcarPerdida(detalheOp)}
                    className="px-4 bg-[#ec5d5e]/10 border border-[#ec5d5e]/30 text-[#ec5d5e] py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#ec5d5e]/20 transition-colors">
                    Perdida
                  </button>
                </>
              )}
            </div>

            {/* ── Comentários ── */}
            <div className="border-t border-[#1e1e1e] pt-5">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={15} className="text-[#555]" />
                <span className="text-[#bdbdbd] text-[13px] font-semibold">Comentários</span>
                {comentarios.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1a1a1a] text-[#555]">{comentarios.length}</span>
                )}
              </div>

              {/* Lista */}
              {comentarios.length === 0 ? (
                <p className="text-[#333] text-[12px] mb-4">Nenhum comentário ainda.</p>
              ) : (
                <div className="space-y-3 mb-4 max-h-[220px] overflow-y-auto pr-1">
                  {comentarios.map((c: CRMComentario) => (
                    <div key={c.id} className="flex gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#6B8AFF]/15 flex items-center justify-center text-[#6B8AFF] text-[11px] font-bold flex-shrink-0 mt-0.5">
                        {c.usuario?.nome?.charAt(0)?.toUpperCase() ?? "?"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="text-[#eee] text-[12px] font-semibold">{c.usuario?.nome ?? "Usuário"}</span>
                          <span className="text-[#333] text-[10px]">
                            {new Date(c.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-[#bdbdbd] text-[13px] leading-relaxed break-words">{c.conteudo}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleEnviarComentario(); }}
                  placeholder="Adicionar comentário... (Ctrl+Enter para enviar)"
                  rows={2}
                  className="flex-1 bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-[#eee] text-[13px] resize-none focus:border-[#6B8AFF] focus:outline-none placeholder-[#333]"
                />
                <button
                  onClick={handleEnviarComentario}
                  disabled={!novoComentario.trim() || enviandoComentario}
                  className="px-3 bg-[#6B8AFF]/15 border border-[#6B8AFF]/30 text-[#6B8AFF] rounded-xl hover:bg-[#6B8AFF]/25 transition-colors disabled:opacity-40 flex items-center justify-center"
                >
                  {enviandoComentario ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhe Cliente */}
      {detalheCliente && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 w-full max-w-[480px]">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-[#eee] text-[18px] font-semibold">{detalheCliente.nome}</h2>
                {detalheCliente.empresa && <p className="text-[#555] text-[13px] mt-0.5">{detalheCliente.empresa}</p>}
              </div>
              <button onClick={() => setDetalheCliente(null)} className="text-[#555] hover:text-[#eee]"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Status",       value: CLIENTE_STATUS[detalheCliente.status]?.label, color: CLIENTE_STATUS[detalheCliente.status]?.color },
                { label: "Prioridade",   value: detalheCliente.prioridade.charAt(0).toUpperCase() + detalheCliente.prioridade.slice(1), color: PRIORIDADE_COLOR[detalheCliente.prioridade] },
                { label: "Responsável",  value: detalheCliente.responsavel?.nome ?? "—",      color: "#eee" },
                { label: "Originador",   value: detalheCliente.originador?.nome ?? "—",       color: "#bdbdbd" },
              ].map((row) => (
                <div key={row.label} className="bg-[#0f0f0f] rounded-xl p-3">
                  <p className="text-[#555] text-[11px] mb-1">{row.label}</p>
                  <p className="font-semibold text-[13px]" style={{ color: row.color }}>{row.value}</p>
                </div>
              ))}
            </div>

            {detalheCliente.valor_potencial > 0 && (
              <div className="bg-[#0f0f0f] rounded-xl p-4 mb-4 flex items-center justify-between">
                <span className="text-[#555] text-[12px]">Valor Potencial</span>
                <span className="text-[#28d939] font-bold text-[18px]">{fmtValor(Number(detalheCliente.valor_potencial))}</span>
              </div>
            )}

            {detalheCliente.notas && (
              <div className="bg-[#0f0f0f] rounded-xl p-4 mb-4">
                <p className="text-[#555] text-[11px] mb-1">Notas</p>
                <p className="text-[#bdbdbd] text-[13px] leading-relaxed">{detalheCliente.notas}</p>
              </div>
            )}

            {detalheCliente.status !== "ativo" && detalheCliente.status !== "inativo" && (
              <button onClick={() => handleAvancarCliente(detalheCliente)}
                className="w-full bg-[#14E9BC]/15 border border-[#14E9BC]/30 text-[#14E9BC] py-2.5 rounded-lg text-[14px] font-semibold hover:bg-[#14E9BC]/25 transition-colors flex items-center justify-center gap-2 mb-5">
                <ChevronRight size={16} />
                Avançar no Funil
              </button>
            )}

            {/* ── Operações vinculadas ── */}
            {(() => {
              const opsCliente = operacoes.filter((o: CRMOperacao) => o.cliente_id === detalheCliente.id);
              if (opsCliente.length === 0) return null;
              return (
                <div className="border-t border-[#1e1e1e] pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-[#555]" />
                    <span className="text-[#bdbdbd] text-[13px] font-semibold">Operações vinculadas</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#1a1a1a] text-[#555]">{opsCliente.length}</span>
                  </div>
                  <div className="space-y-2">
                    {opsCliente.map((op: CRMOperacao) => {
                      const stCfg = OP_STATUS[op.status as keyof typeof OP_STATUS];
                      return (
                        <button key={op.id} onClick={() => { setDetalheCliente(null); setDetalheOp(op); }}
                          className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-xl px-4 py-3 flex items-center justify-between hover:border-[#444] transition-all text-left">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: stCfg.color }} />
                            <span className="text-[#eee] text-[13px] font-medium truncate">{op.titulo}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {Number(op.valor) > 0 && (
                              <span className="text-[#28d939] text-[11px] font-semibold">{fmtValor(Number(op.valor))}</span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                              style={{ backgroundColor: `${stCfg.color}18`, color: stCfg.color }}>
                              {stCfg.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
