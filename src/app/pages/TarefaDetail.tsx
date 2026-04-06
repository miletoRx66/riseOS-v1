import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { getTarefaById, type TarefaDB } from "../../lib/services/tarefas";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { criarComentario, type ComentarioDB } from "../../lib/services/comentarios";
import { toggleSubtarefa, deletarTarefa } from "../../lib/services/tarefas";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Calendar,
  User,
  Tag,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  Paperclip,
  MoreVertical,
  Edit,
  Trash2,
  Send,
  ExternalLink,
  Eye,
  Reply,
  Loader2,
} from "lucide-react";

export default function TarefaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [tarefa, setTarefa] = useState<TarefaDB | null>(null);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [comentarios, setComentarios] = useState<ComentarioDB[]>([]);

  const [subtarefas, setSubtarefas] = useState<any[]>([]);
  const [togglingSubtarefa, setTogglingSubtarefa] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);

  const [novoComentario, setNovoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [erroComentario, setErroComentario] = useState<string | null>(null);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [enviandoResposta, setEnviandoResposta] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      id ? getTarefaById(id) : Promise.resolve(null),
      getDepartamentos(),
    ])
      .then(([t, depts]) => {
        setTarefa(t);
        setDepartamentos(depts);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawComentarios = (t as any)?.comentarios ?? [];
        setComentarios(rawComentarios);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawSubtarefas = (t as any)?.subtarefas ?? [];
        setSubtarefas(rawSubtarefas);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-[#bdbdbd] text-[16px]">Carregando...</p>
      </div>
    );
  }

  if (!tarefa) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-12 text-center">
            <p className="text-[#bdbdbd] font-['Inter:Regular',sans-serif] text-[16px] mb-6">
              Tarefa não encontrada
            </p>
            <Link
              to="/tarefas"
              className="text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif] text-[14px]"
            >
              Voltar para Tarefas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const departamento = departamentos.find((d) => d.id === tarefa.departamento_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tarefaExt = tarefa as any;
  const subtarefasConcluidas = tarefaExt.subtarefas?.filter((s: any) => s.concluida).length || 0;
  const totalSubtarefas = tarefaExt.subtarefas?.length || 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejamento": return "#6B8AFF";
      case "em-andamento": return "#28d939";
      case "concluido": return "#bdbdbd";
      case "pausado": return "#ff6b6b";
      default: return "#bdbdbd";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planejamento": return "Planejamento";
      case "em-andamento": return "Em Andamento";
      case "concluido": return "Concluído";
      case "pausado": return "Pausado";
      default: return status;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "#ff6b6b";
      case "media": return "#FFA500";
      case "baixa": return "#6B8AFF";
      default: return "#bdbdbd";
    }
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatarDataHora = (data: string) => {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAdicionarComentario = async () => {
    if (!novoComentario.trim() || !usuario || !id) return;
    setEnviandoComentario(true);
    setErroComentario(null);
    try {
      const novo = await criarComentario({
        tarefa_id: id,
        autor_id: usuario.id,
        conteudo: novoComentario.trim(),
      });
      // Garante que o join do autor está presente mesmo que o backend não retorne
      if (!novo.autor) {
        novo.autor = { id: usuario.id, nome: usuario.nome, avatar_url: usuario.avatar };
      }
      setComentarios((prev) => [...prev, novo]);
      setNovoComentario("");
    } catch (err) {
      setErroComentario("Erro ao enviar comentário. Tente novamente.");
      console.error("Erro ao criar comentário:", err);
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleAdicionarResposta = async (parentId: string) => {
    const texto = replyTexts[parentId]?.trim();
    if (!texto || !usuario || !id) return;
    setEnviandoResposta(parentId);
    try {
      const nova = await criarComentario({
        tarefa_id: id,
        autor_id: usuario.id,
        conteudo: texto,
        parent_id: parentId,
      });
      if (!nova.autor) {
        nova.autor = { id: usuario.id, nome: usuario.nome, avatar_url: usuario.avatar };
      }
      setComentarios((prev) => [...prev, nova]);
      setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
      setReplyingTo(null);
    } catch (err) {
      console.error("Erro ao criar resposta:", err);
    } finally {
      setEnviandoResposta(null);
    }
  };

  const handleToggleSubtarefa = async (subtarefaId: string, concluida: boolean) => {
    setTogglingSubtarefa(subtarefaId);
    try {
      await toggleSubtarefa(subtarefaId, !concluida);
      setSubtarefas((prev: any[]) =>
        prev.map((s) => s.id === subtarefaId ? { ...s, concluida: !concluida } : s)
      );
    } catch (err) {
      console.error("Erro ao atualizar subtarefa:", err);
    } finally {
      setTogglingSubtarefa(null);
    }
  };

  const handleExcluirTarefa = async () => {
    if (!id || !window.confirm("Tem certeza que deseja excluir esta tarefa?")) return;
    setExcluindo(true);
    try {
      await deletarTarefa(id);
      navigate("/tarefas");
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
      setExcluindo(false);
    }
  };

  const comentariosRaiz = comentarios.filter((c) => !c.parent_id);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/tarefas")}
            className="flex items-center gap-2 text-[#bdbdbd] hover:text-[#14E9BC] transition-colors mb-4 font-['Inter:Medium',sans-serif] text-[14px]"
          >
            <ArrowLeft size={20} />
            Voltar para Tarefas
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
                {tarefa.titulo}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-['Inter:Semi_Bold',sans-serif]"
                  style={{
                    backgroundColor: `${departamento?.cor}20`,
                    color: departamento?.cor,
                  }}
                >
                  {departamento?.nome}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-['Inter:Semi_Bold',sans-serif]"
                  style={{
                    backgroundColor: `${getStatusColor(tarefa.status)}20`,
                    color: getStatusColor(tarefa.status),
                  }}
                >
                  {getStatusLabel(tarefa.status)}
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[12px] font-['Inter:Semi_Bold',sans-serif]"
                  style={{
                    backgroundColor: `${getPrioridadeColor(tarefa.prioridade)}20`,
                    color: getPrioridadeColor(tarefa.prioridade),
                  }}
                >
                  Prioridade: {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
                </span>
                {tarefa.tipo && (
                  <span className="px-3 py-1 rounded-full text-[12px] font-['Inter:Semi_Bold',sans-serif] bg-[#1a1a1a] border border-[#333] text-[#bdbdbd]">
                    {tarefa.tipo.charAt(0).toUpperCase() + tarefa.tipo.slice(1)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/tarefas/${id}/editar`)}
                className="bg-[#1a1a1a] border border-[#333] text-[#eee] px-4 py-2 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#222] transition-colors"
              >
                <Edit size={16} />
                Editar
              </button>
              <button className="bg-[#1a1a1a] border border-[#333] text-[#eee] px-3 py-2 rounded-lg hover:bg-[#222] transition-colors">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descrição */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4">
                Descrição
              </h2>
              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] leading-relaxed">
                {tarefa.descricao || "Nenhuma descrição disponível."}
              </p>

              {tarefa.tags && tarefa.tags.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#333]">
                  <h3 className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-3 flex items-center gap-2">
                    <Tag size={16} />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tarefa.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#1a1a1a] border border-[#333] rounded-full text-[#14E9BC] text-[12px] font-['Inter:Medium',sans-serif]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Links Externos */}
            {tarefaExt.tarefa_links && tarefaExt.tarefa_links.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4 flex items-center gap-2">
                  <ExternalLink size={20} />
                  Links ({tarefaExt.tarefa_links.length})
                </h2>
                <div className="space-y-2">
                  {tarefaExt.tarefa_links.map((link: any) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#14E9BC]/10 rounded flex items-center justify-center flex-shrink-0">
                          <ExternalLink size={16} className="text-[#14E9BC]" />
                        </div>
                        <div>
                          <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] group-hover:text-[#14E9BC] transition-colors">
                            {link.titulo}
                          </p>
                          <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] capitalize">
                            {link.tipo}
                          </p>
                        </div>
                      </div>
                      <ExternalLink size={14} className="text-[#555] group-hover:text-[#14E9BC] transition-colors flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Subtarefas */}
            {subtarefas.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px]">
                    Subtarefas
                  </h2>
                  <span className="text-[#bdbdbd] text-[14px] font-['Inter:Regular',sans-serif]">
                    {subtarefas.filter((s: any) => s.concluida).length}/{subtarefas.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {subtarefas.map((subtarefa: any) => (
                    <button
                      key={subtarefa.id}
                      onClick={() => handleToggleSubtarefa(subtarefa.id, subtarefa.concluida)}
                      disabled={togglingSubtarefa === subtarefa.id}
                      className="w-full flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors text-left disabled:opacity-60"
                    >
                      {subtarefa.concluida ? (
                        <CheckCircle2 size={20} className="text-[#28d939] mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-[#555] mt-0.5 flex-shrink-0" />
                      )}
                      <span
                        className={`font-['Inter:Regular',sans-serif] text-[14px] ${
                          subtarefa.concluida ? "text-[#888] line-through" : "text-[#eee]"
                        }`}
                      >
                        {subtarefa.titulo}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Comentários */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-6 flex items-center gap-2">
                <MessageSquare size={20} />
                Comentários ({comentariosRaiz.length})
              </h2>

              {/* Novo comentário */}
              <div className="mb-6">
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleAdicionarComentario();
                    }
                  }}
                  placeholder="Adicione um comentário... (Ctrl+Enter para enviar)"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-4 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none resize-none"
                  rows={3}
                  disabled={enviandoComentario}
                />
                {erroComentario && (
                  <p className="text-[#ec5d5e] text-[12px] mt-1 font-['Inter:Regular',sans-serif]">
                    {erroComentario}
                  </p>
                )}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAdicionarComentario}
                    disabled={!novoComentario.trim() || enviandoComentario}
                    className="bg-[#14E9BC] text-[#000] px-4 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {enviandoComentario ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {enviandoComentario ? "Enviando..." : "Comentar"}
                  </button>
                </div>
              </div>

              {/* Lista de comentários com threading */}
              {comentariosRaiz.length > 0 ? (
                <div className="space-y-4">
                  {comentariosRaiz.map((comentario) => {
                    const respostas = comentarios.filter((c) => c.parent_id === comentario.id);
                    const isReplying = replyingTo === comentario.id;
                    const nomeAutor = comentario.autor?.nome ?? "Usuário";
                    const inicialAutor = nomeAutor.charAt(0).toUpperCase();

                    return (
                      <div key={comentario.id}>
                        {/* Comentário principal */}
                        <div className="bg-[#1a1a1a] rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#14E9BC]/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif] text-[14px]">
                                {inicialAutor}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                                  {nomeAutor}
                                </span>
                                <span className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif]">
                                  {formatarDataHora(comentario.criado_em)}
                                </span>
                                {comentario.editado && (
                                  <span className="text-[#555] text-[11px] font-['Inter:Regular',sans-serif]">
                                    (editado)
                                  </span>
                                )}
                              </div>
                              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] whitespace-pre-wrap">
                                {comentario.conteudo}
                              </p>
                              <button
                                onClick={() => setReplyingTo(isReplying ? null : comentario.id)}
                                className="mt-2 flex items-center gap-1 text-[#555] hover:text-[#14E9BC] transition-colors text-[12px] font-['Inter:Medium',sans-serif]"
                              >
                                <Reply size={14} />
                                {isReplying ? "Cancelar" : "Responder"}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Input de resposta */}
                        {isReplying && (
                          <div className="ml-10 mt-2">
                            <div className="flex gap-2">
                              <textarea
                                value={replyTexts[comentario.id] || ""}
                                onChange={(e) =>
                                  setReplyTexts((prev) => ({
                                    ...prev,
                                    [comentario.id]: e.target.value,
                                  }))
                                }
                                placeholder={`Respondendo a ${nomeAutor}...`}
                                className="flex-1 bg-[#1a1a1a] border border-[#14E9BC]/30 rounded-lg p-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none resize-none"
                                rows={2}
                                disabled={enviandoResposta === comentario.id}
                              />
                              <button
                                onClick={() => handleAdicionarResposta(comentario.id)}
                                disabled={!replyTexts[comentario.id]?.trim() || enviandoResposta === comentario.id}
                                className="bg-[#14E9BC] text-[#000] px-3 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[13px] flex items-center gap-1 hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                              >
                                {enviandoResposta === comentario.id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Send size={14} />
                                )}
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Respostas aninhadas */}
                        {respostas.length > 0 && (
                          <div className="ml-10 mt-2 space-y-2 border-l-2 border-[#333] pl-4">
                            {respostas.map((resposta) => {
                              const nomeResposta = resposta.autor?.nome ?? "Usuário";
                              return (
                                <div key={resposta.id} className="bg-[#161616] rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#6B8AFF]/20 flex items-center justify-center flex-shrink-0">
                                      <span className="text-[#6B8AFF] font-['Inter:Semi_Bold',sans-serif] text-[11px]">
                                        {nomeResposta.charAt(0).toUpperCase()}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                                          {nomeResposta}
                                        </span>
                                        <span className="text-[#555] text-[11px] font-['Inter:Regular',sans-serif]">
                                          {formatarDataHora(resposta.criado_em)}
                                        </span>
                                      </div>
                                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px] whitespace-pre-wrap">
                                        {resposta.conteudo}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[#666] text-[14px] font-['Inter:Regular',sans-serif] text-center py-8">
                  Nenhum comentário ainda. Seja o primeiro a comentar!
                </p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Detalhes */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4">
                Detalhes
              </h2>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                    <User size={16} />
                    Responsável
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px]">
                    {tarefa.responsavel?.nome ?? "—"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                    <Calendar size={16} />
                    Prazo
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px]">
                    {tarefa.prazo ? formatarData(tarefa.prazo) : "—"}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                    <Clock size={16} />
                    Data de Criação
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px]">
                    {formatarData(tarefa.criado_em)}
                  </p>
                </div>
                {tarefa.visibilidade && (
                  <div>
                    <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                      <Eye size={16} />
                      Visibilidade
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px] capitalize">
                      {tarefa.visibilidade === "publica"
                        ? "Pública"
                        : tarefa.visibilidade === "departamento"
                        ? "Departamento"
                        : "Pessoal"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Progresso */}
            {tarefa.progresso !== undefined && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4">
                  Progresso
                </h2>
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[#bdbdbd] text-[12px] font-['Inter:Regular',sans-serif]">
                      Conclusão
                    </span>
                    <span className="text-[#14E9BC] text-[16px] font-['Inter:Semi_Bold',sans-serif]">
                      {tarefa.progresso}%
                    </span>
                  </div>
                  <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#14E9BC] h-full rounded-full transition-all duration-500"
                      style={{ width: `${tarefa.progresso}%` }}
                    />
                  </div>
                </div>
                {totalSubtarefas > 0 && (
                  <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] mt-3">
                    {subtarefasConcluidas} de {totalSubtarefas} subtarefas concluídas
                  </p>
                )}
              </div>
            )}

            {/* Ações Rápidas */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4">
                Ações
              </h2>
              <div className="space-y-2">
                <button className="w-full bg-[#1a1a1a] border border-[#333] text-[#eee] px-4 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#222] transition-colors">
                  <Paperclip size={16} />
                  Adicionar Anexo
                </button>
                <button
                  onClick={handleExcluirTarefa}
                  disabled={excluindo}
                  className="w-full bg-[#1a1a1a] border border-[#ff6b6b] text-[#ff6b6b] px-4 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#ff6b6b]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {excluindo ? "Excluindo..." : "Excluir Tarefa"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
