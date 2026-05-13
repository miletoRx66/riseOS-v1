import { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getMeusCanais,
  getOutroParticipante,
  getMensagens,
  getMembrosCanal,
  enviarMensagem,
  iniciarConversaP2P,
  entrarCanalDepartamento,
  subscribeToMensagens,
  type CanalDB,
  type MensagemDB,
} from "../../lib/services/mensagens";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { getUsuarios, type UsuarioDB } from "../../lib/services/usuarios";
import { MessageSquare, Hash, Search, Send, Users, Plus, X, ChevronDown } from "lucide-react";

interface CanalEnriquecido extends CanalDB {
  outroUsuario?: { id: string; nome: string; avatar_url: string | null } | null;
  departamentoInfo?: { id: string; nome: string; cor: string } | null;
  ultimaMensagem?: string | null;
}

function getIniciais(nome: string): string {
  return nome.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatarHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function formatarDataRelativa(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return formatarHora(iso);
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatarDataGrupo(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(ontem.getDate() - 1);
  if (d.toDateString() === hoje.toDateString()) return "Hoje";
  if (d.toDateString() === ontem.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function Messages() {
  const { usuario } = useAuth();
  const [activeTab, setActiveTab] = useState<"conversas" | "canais">("conversas");
  const [canais, setCanais] = useState<CanalEnriquecido[]>([]);
  const [canalAtivo, setCanalAtivo] = useState<CanalEnriquecido | null>(null);
  const [mensagens, setMensagens] = useState<MensagemDB[]>([]);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMsgs, setCarregandoMsgs] = useState(false);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);
  const [buscaUsuario, setBuscaUsuario] = useState("");
  const [mostrarNovaConversa, setMostrarNovaConversa] = useState(false);
  const [iniciandoConversa, setIniciandoConversa] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // INC-003: painel de membros
  const [mostrarMembros, setMostrarMembros] = useState(false);
  const [membrosCanal, setMembrosCanal] = useState<{ id: string; nome: string; cargo: string | null; avatar_url: string | null }[]>([]);

  // INC-004: @menção
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(0);

  const userId = usuario?.id ?? "";

  // Carregar canais, departamentos e usuários
  useEffect(() => {
    if (!userId) return;

    async function carregar() {
      try {
        const [depts, users] = await Promise.all([
          getDepartamentos(),
          getUsuarios(),
        ]);
        setDepartamentos(depts);
        setUsuarios(users);

        // Entrar automaticamente nos canais de departamento
        for (const d of depts) {
          await entrarCanalDepartamento(d.id, userId).catch(() => {});
        }

        // Recarregar canais após entrar nos departamentos
        const meusCanais = await getMeusCanais(userId);

        // Enriquecer canais p2p com dados do outro participante
        const enriquecidos = await Promise.all(
          meusCanais.map(async (c) => {
            if (c.tipo === "p2p") {
              const outro = await getOutroParticipante(c.id, userId);
              return { ...c, outroUsuario: outro } as CanalEnriquecido;
            } else if (c.tipo === "departamento") {
              const dept = depts.find((d) => d.id === c.departamento_id);
              return { ...c, departamentoInfo: dept ?? null } as CanalEnriquecido;
            }
            return c as CanalEnriquecido;
          })
        );

        setCanais(enriquecidos);

        // Abrir o primeiro canal disponível
        const primeiroP2P = enriquecidos.find((c) => c.tipo === "p2p");
        if (primeiroP2P) {
          selecionarCanal(primeiroP2P);
        } else {
          const primeiroDept = enriquecidos.find((c) => c.tipo === "departamento");
          if (primeiroDept) {
            setActiveTab("canais");
            selecionarCanal(primeiroDept);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar mensagens:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Scroll automático ao chegar novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  function selecionarCanal(canal: CanalEnriquecido) {
    setCanalAtivo(canal);
    carregarMensagens(canal.id);
    carregarMembros(canal.id);

    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    unsubscribeRef.current = subscribeToMensagens(canal.id, (msg) => {
      setMensagens((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
  }

  async function carregarMembros(canalId: string) {
    try {
      const membros = await getMembrosCanal(canalId);
      setMembrosCanal(membros);
    } catch {
      setMembrosCanal([]);
    }
  }

  function handleMensagemChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart ?? value.length;
    setNovaMensagem(value);

    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@([^\s@]*)$/);
    if (mentionMatch) {
      setShowMentions(true);
      setMentionQuery(mentionMatch[1]);
      setMentionStart(cursorPos - mentionMatch[0].length);
    } else {
      setShowMentions(false);
      setMentionQuery("");
    }
  }

  function handleSelectMention(u: UsuarioDB) {
    const primeiroNome = u.nome.split(" ")[0];
    const mention = `@${primeiroNome} `;
    const before = novaMensagem.slice(0, mentionStart);
    const after = novaMensagem.slice(mentionStart + 1 + mentionQuery.length);
    setNovaMensagem(before + mention + after);
    setShowMentions(false);
    setMentionQuery("");
    textareaRef.current?.focus();
  }


  async function carregarMensagens(canalId: string) {
    setCarregandoMsgs(true);
    try {
      const msgs = await getMensagens(canalId);
      setMensagens(msgs);
    } catch (err) {
      console.error("Erro ao carregar mensagens:", err);
    } finally {
      setCarregandoMsgs(false);
    }
  }

  async function handleEnviar() {
    if (!novaMensagem.trim() || !canalAtivo || !userId || enviando) return;
    const texto = novaMensagem.trim();
    setNovaMensagem("");
    setEnviando(true);
    try {
      const msg = await enviarMensagem(canalAtivo.id, userId, texto);
      setMensagens((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setNovaMensagem(texto); // Restaura se falhar
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (showMentions && e.key === "Escape") {
      setShowMentions(false);
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !showMentions) {
      e.preventDefault();
      handleEnviar();
    }
  }

  async function handleIniciarConversaP2P(outroUserId: string) {
    if (!userId || iniciandoConversa) return;
    setIniciandoConversa(true);
    try {
      const canalId = await iniciarConversaP2P(userId, outroUserId);
      // Recarregar canais
      const meusCanais = await getMeusCanais(userId);
      const enriquecidos = await Promise.all(
        meusCanais.map(async (c) => {
          if (c.tipo === "p2p") {
            const outro = await getOutroParticipante(c.id, userId);
            return { ...c, outroUsuario: outro } as CanalEnriquecido;
          }
          const dept = departamentos.find((d) => d.id === c.departamento_id);
          return { ...c, departamentoInfo: dept ?? null } as CanalEnriquecido;
        })
      );
      setCanais(enriquecidos);
      const novoCanal = enriquecidos.find((c) => c.id === canalId);
      if (novoCanal) {
        setActiveTab("conversas");
        selecionarCanal(novoCanal);
      }
      setMostrarNovaConversa(false);
      setBuscaUsuario("");
    } catch (err) {
      console.error("Erro ao iniciar conversa:", err);
    } finally {
      setIniciandoConversa(false);
    }
  }

  // Agrupar mensagens por data
  function agruparMensagensPorData(msgs: MensagemDB[]) {
    const grupos: { data: string; mensagens: MensagemDB[] }[] = [];
    for (const msg of msgs) {
      const dataLabel = formatarDataGrupo(msg.criado_em);
      const ultimo = grupos[grupos.length - 1];
      if (ultimo && ultimo.data === dataLabel) {
        ultimo.mensagens.push(msg);
      } else {
        grupos.push({ data: dataLabel, mensagens: [msg] });
      }
    }
    return grupos;
  }

  const canaisP2P = canais.filter((c) => c.tipo === "p2p");
  const canaisDept = canais.filter((c) => c.tipo === "departamento");
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.id !== userId &&
      (u.nome.toLowerCase().includes(buscaUsuario.toLowerCase()) ||
        (u.cargo ?? "").toLowerCase().includes(buscaUsuario.toLowerCase()))
  );

  const nomeCanalAtivo =
    canalAtivo?.tipo === "p2p"
      ? canalAtivo.outroUsuario?.nome ?? "Conversa"
      : canalAtivo?.departamentoInfo?.nome ?? canalAtivo?.nome ?? "Canal";

  const corCanalAtivo = canalAtivo?.departamentoInfo?.cor ?? "#14E9BC";
  const gruposMensagens = agruparMensagensPorData(mensagens);

  return (
    <div className="h-screen bg-[#0a0a0a] flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-[300px] bg-[#0f0f0f] border-r border-[#333] flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-[#333]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[22px]">Mensagens</h1>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-[#1a1a1a] rounded-lg p-1">
            {(["conversas", "canais"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-md text-[13px] font-['Inter:Medium',sans-serif] transition-all ${
                  activeTab === tab ? "bg-[#14E9BC] text-[#000]" : "text-[#bdbdbd] hover:text-[#eee]"
                }`}
              >
                {tab === "conversas" ? "Diretas" : "Canais"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {carregando ? (
            <div className="p-4 text-center text-[#555] text-[13px]">Carregando...</div>
          ) : activeTab === "conversas" ? (
            <div>
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[#555] text-[11px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">
                  Mensagens Diretas
                </span>
                <button
                  onClick={() => setMostrarNovaConversa(!mostrarNovaConversa)}
                  className="text-[#bdbdbd] hover:text-[#14E9BC] transition-colors"
                  title="Nova conversa"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Busca de usuário para nova conversa */}
              {mostrarNovaConversa && (
                <div className="px-3 mb-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Buscar usuário..."
                      value={buscaUsuario}
                      onChange={(e) => setBuscaUsuario(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-8 pr-3 py-2 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>
                  {buscaUsuario.length > 0 && (
                    <div className="mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg overflow-hidden">
                      {usuariosFiltrados.slice(0, 5).map((u) => (
                        <button
                          key={u.id}
                          disabled={iniciandoConversa}
                          onClick={() => handleIniciarConversaP2P(u.id)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#252525] transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#14E9BC]/20 flex items-center justify-center text-[11px] font-bold text-[#14E9BC]">
                            {getIniciais(u.nome)}
                          </div>
                          <div>
                            <p className="text-[#eee] text-[13px] font-['Inter:Medium',sans-serif]">{u.nome}</p>
                            <p className="text-[#555] text-[11px]">{u.cargo ?? ""}</p>
                          </div>
                        </button>
                      ))}
                      {usuariosFiltrados.length === 0 && (
                        <p className="text-[#555] text-[12px] p-3 text-center">Nenhum usuário encontrado</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Lista de conversas P2P */}
              {canaisP2P.length === 0 ? (
                <p className="text-[#555] text-[13px] px-4 py-3">
                  Nenhuma conversa ainda. Clique em + para começar.
                </p>
              ) : (
                canaisP2P.map((c) => {
                  const outro = c.outroUsuario;
                  const isAtivo = canalAtivo?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setActiveTab("conversas"); selecionarCanal(c); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                        isAtivo ? "bg-[#14E9BC]/10 border-r-2 border-[#14E9BC]" : "hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#252525] flex items-center justify-center text-[12px] font-bold text-[#14E9BC] flex-shrink-0">
                        {outro ? getIniciais(outro.nome) : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#eee] text-[14px] font-['Inter:Medium',sans-serif] truncate">
                          {outro?.nome ?? "Conversa"}
                        </p>
                      </div>
                      <MessageSquare size={14} className="text-[#555] flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div>
              <div className="px-4 py-3">
                <span className="text-[#555] text-[11px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">
                  Canais de Departamento
                </span>
              </div>
              {canaisDept.length === 0 ? (
                <p className="text-[#555] text-[13px] px-4 py-3">Nenhum canal disponível.</p>
              ) : (
                canaisDept.map((c) => {
                  const dept = c.departamentoInfo;
                  const isAtivo = canalAtivo?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setActiveTab("canais"); selecionarCanal(c); }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                        isAtivo ? "bg-[#14E9BC]/10 border-r-2 border-[#14E9BC]" : "hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${dept?.cor ?? "#14E9BC"}20`, color: dept?.cor ?? "#14E9BC" }}
                      >
                        <Hash size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#eee] text-[14px] font-['Inter:Medium',sans-serif] truncate">
                          {dept?.nome ?? "Canal"}
                        </p>
                      </div>
                      <Users size={14} className="text-[#555] flex-shrink-0" />
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Área principal de chat */}
      {canalAtivo ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header do chat */}
          <div className="h-[64px] border-b border-[#333] flex items-center px-6 gap-4 flex-shrink-0 bg-[#0f0f0f]">
            {canalAtivo.tipo === "p2p" ? (
              <>
                <div className="w-9 h-9 rounded-full bg-[#14E9BC]/20 flex items-center justify-center text-[12px] font-bold text-[#14E9BC]">
                  {getIniciais(nomeCanalAtivo)}
                </div>
                <div>
                  <p className="text-[#eee] text-[15px] font-['Inter:Semi_Bold',sans-serif]">{nomeCanalAtivo}</p>
                  <p className="text-[#555] text-[12px]">Mensagem direta</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${corCanalAtivo}20`, color: corCanalAtivo }}
                >
                  <Hash size={18} />
                </div>
                <div>
                  <p className="text-[#eee] text-[15px] font-['Inter:Semi_Bold',sans-serif]">{nomeCanalAtivo}</p>
                  <p className="text-[#555] text-[12px]">Canal do departamento • {membrosCanal.length} membros</p>
                </div>
              </>
            )}
            <button
              onClick={() => setMostrarMembros((v) => !v)}
              className={`ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                mostrarMembros
                  ? "bg-[#14E9BC]/10 text-[#14E9BC] border border-[#14E9BC]/30"
                  : "text-[#bdbdbd] hover:bg-[#1a1a1a] hover:text-[#eee]"
              }`}
              title="Ver membros"
            >
              <Users size={16} />
              <span className="font-['Inter:Medium',sans-serif]">Membros</span>
            </button>
          </div>

          {/* Corpo: mensagens + painel de membros */}
          <div className="flex flex-1 min-h-0">

            {/* Coluna de mensagens + input */}
            <div className="flex flex-col flex-1 min-w-0">
              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
                {carregandoMsgs ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[#555] text-[14px]">Carregando mensagens...</p>
                  </div>
                ) : mensagens.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${corCanalAtivo}15` }}
                    >
                      <MessageSquare size={24} style={{ color: corCanalAtivo }} />
                    </div>
                    <p className="text-[#555] text-[14px]">Nenhuma mensagem ainda. Seja o primeiro!</p>
                  </div>
                ) : (
                  gruposMensagens.map(({ data, mensagens: msgs }) => (
                    <div key={data}>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-[#222]" />
                        <span className="text-[#555] text-[11px] font-['Inter:Medium',sans-serif] whitespace-nowrap">
                          {data}
                        </span>
                        <div className="flex-1 h-px bg-[#222]" />
                      </div>

                      {msgs.map((msg, i) => {
                        const isOwn = msg.autor_id === userId;
                        const prevMsg = msgs[i - 1];
                        const sameSender = prevMsg?.autor_id === msg.autor_id;
                        const nomeAutor = msg.autor?.nome ?? "Usuário";

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-3 ${isOwn ? "flex-row-reverse" : ""} ${sameSender ? "mt-1" : "mt-4"}`}
                          >
                            {!sameSender ? (
                              <div className="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center text-[10px] font-bold text-[#14E9BC] flex-shrink-0 mb-0.5">
                                {getIniciais(nomeAutor)}
                              </div>
                            ) : (
                              <div className="w-8 flex-shrink-0" />
                            )}

                            <div className={`max-w-[65%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                              {!sameSender && (
                                <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                                  <span className="text-[#eee] text-[13px] font-['Inter:Semi_Bold',sans-serif]">
                                    {isOwn ? "Você" : nomeAutor}
                                  </span>
                                  <span className="text-[#555] text-[11px]">{formatarHora(msg.criado_em)}</span>
                                </div>
                              )}
                              <div
                                className={`px-4 py-2.5 rounded-2xl text-[14px] font-['Inter:Regular',sans-serif] leading-relaxed ${
                                  isOwn
                                    ? "bg-[#14E9BC] text-[#000] rounded-br-sm"
                                    : "bg-[#1a1a1a] text-[#eee] rounded-bl-sm"
                                }`}
                              >
                                {(msg.conteudo ?? "").split(/(@\S+)/g).map((part, pi) =>
                                  part.startsWith("@")
                                    ? <span key={pi} className={`font-semibold rounded px-0.5 ${isOwn ? "bg-black/10 text-[#004d40]" : "bg-[#14E9BC]/10 text-[#14E9BC]"}`}>{part}</span>
                                    : part
                                )}
                              </div>
                              {sameSender && (
                                <span className="text-[#555] text-[10px] mt-0.5 px-1">{formatarHora(msg.criado_em)}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input de mensagem */}
              <div className="border-t border-[#333] p-4 bg-[#0f0f0f] flex-shrink-0">
                {/* Dropdown de @menção */}
                {showMentions && (
                  <div className="mb-2 bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden shadow-lg">
                    <div className="px-3 py-1.5 border-b border-[#333]">
                      <span className="text-[#555] text-[11px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Mencionar</span>
                    </div>
                    {usuarios
                      .filter((u) => u.id !== userId && (mentionQuery === "" || u.nome.toLowerCase().includes(mentionQuery.toLowerCase())))
                      .slice(0, 5)
                      .map((u) => (
                        <button
                          key={u.id}
                          onMouseDown={(e) => { e.preventDefault(); handleSelectMention(u); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#252525] transition-colors text-left"
                        >
                          <div className="w-7 h-7 rounded-full bg-[#14E9BC]/20 flex items-center justify-center text-[10px] font-bold text-[#14E9BC] flex-shrink-0">
                            {getIniciais(u.nome)}
                          </div>
                          <div>
                            <p className="text-[#eee] text-[13px] font-['Inter:Medium',sans-serif]">{u.nome}</p>
                            {u.cargo && <p className="text-[#555] text-[11px]">{u.cargo}</p>}
                          </div>
                        </button>
                      ))}
                    {usuarios.filter((u) => u.id !== userId && u.nome.toLowerCase().includes(mentionQuery.toLowerCase())).length === 0 && (
                      <p className="text-[#555] text-[12px] p-3 text-center">Nenhum usuário encontrado</p>
                    )}
                  </div>
                )}

                <div className="flex items-end gap-3">
                  <textarea
                    ref={textareaRef}
                    value={novaMensagem}
                    onChange={handleMensagemChange}
                    onKeyDown={handleKeyDown}
                    placeholder={`Mensagem para ${nomeCanalAtivo}... (use @ para mencionar)`}
                    rows={1}
                    className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-[#eee] text-[14px] placeholder-[#555] focus:border-[#14E9BC] focus:outline-none resize-none font-['Inter:Regular',sans-serif] leading-relaxed"
                    style={{ maxHeight: "120px" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "auto";
                      t.style.height = Math.min(t.scrollHeight, 120) + "px";
                    }}
                  />
                  <button
                    onClick={handleEnviar}
                    disabled={!novaMensagem.trim() || enviando}
                    className="w-10 h-10 bg-[#14E9BC] rounded-xl flex items-center justify-center hover:bg-[#12d4a8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <Send size={18} className="text-[#000]" />
                  </button>
                </div>
                <p className="text-[#555] text-[11px] mt-2 font-['Inter:Regular',sans-serif]">
                  Enter para enviar • Shift+Enter para nova linha • @ para mencionar
                </p>
              </div>
            </div>

            {/* Painel de membros */}
            {mostrarMembros && (
              <div className="w-[220px] border-l border-[#333] bg-[#0f0f0f] flex flex-col flex-shrink-0">
                <div className="p-4 border-b border-[#333] flex items-center justify-between">
                  <span className="text-[#eee] text-[14px] font-['Inter:Semi_Bold',sans-serif]">
                    Membros ({membrosCanal.length})
                  </span>
                  <button
                    onClick={() => setMostrarMembros(false)}
                    className="text-[#555] hover:text-[#eee] transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {membrosCanal.length === 0 ? (
                    <p className="text-[#555] text-[12px] p-3 text-center">Sem membros</p>
                  ) : (
                    membrosCanal.map((m) => (
                      <div key={m.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-[#14E9BC]/20 flex items-center justify-center text-[10px] font-bold text-[#14E9BC] flex-shrink-0">
                          {getIniciais(m.nome)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#eee] text-[13px] font-['Inter:Medium',sans-serif] truncate">{m.nome}</p>
                          {m.cargo && <p className="text-[#555] text-[11px] truncate">{m.cargo}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-4">
          {carregando ? (
            <p className="text-[#555] text-[14px]">Carregando...</p>
          ) : (
            <>
              <MessageSquare size={48} className="text-[#333]" />
              <p className="text-[#555] text-[16px]">Selecione uma conversa ou canal</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
