import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { tarefas, departamentos, okrs } from "../data/mockData";
import { Comentario } from "../types";
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
  Download,
  Send,
  Activity,
  Target,
  ExternalLink,
  Eye,
  Reply
} from "lucide-react";

export default function TarefaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [novoComentario, setNovoComentario] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  const tarefa = tarefas.find((t) => t.id === id);
  const [localComentarios, setLocalComentarios] = useState<Comentario[]>(
    () => tarefa?.comentarios ?? []
  );

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

  const departamento = departamentos.find((d) => d.id === tarefa.departamento);
  const subtarefasConcluidas = tarefa.subtarefas?.filter((s) => s.concluida).length || 0;
  const totalSubtarefas = tarefa.subtarefas?.length || 0;

  // Filtrar OKRs que possuem esta tarefa vinculada
  const okrsRelacionados = okrs.filter((okr) => okr.tarefasVinculadas?.includes(id || ""));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planejamento":
        return "#6B8AFF";
      case "em-andamento":
        return "#28d939";
      case "concluido":
        return "#bdbdbd";
      case "pausado":
        return "#ff6b6b";
      default:
        return "#bdbdbd";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "planejamento":
        return "Planejamento";
      case "em-andamento":
        return "Em Andamento";
      case "concluido":
        return "Concluído";
      case "pausado":
        return "Pausado";
      default:
        return status;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta":
        return "#ff6b6b";
      case "media":
        return "#FFA500";
      case "baixa":
        return "#6B8AFF";
      default:
        return "#bdbdbd";
    }
  };

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatarDataHora = (data: string) => {
    const date = new Date(data);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAdicionarComentario = () => {
    if (!novoComentario.trim()) return;
    const novo: Comentario = {
      id: `c-${Date.now()}`,
      autor: "Você",
      conteudo: novoComentario.trim(),
      data: new Date().toISOString(),
    };
    setLocalComentarios((prev) => [...prev, novo]);
    setNovoComentario("");
  };

  const handleAdicionarResposta = (parentId: string) => {
    const texto = replyTexts[parentId]?.trim();
    if (!texto) return;
    const nova: Comentario = {
      id: `c-${Date.now()}`,
      autor: "Você",
      conteudo: texto,
      data: new Date().toISOString(),
      parentId,
    };
    setLocalComentarios((prev) => [...prev, nova]);
    setReplyTexts((prev) => ({ ...prev, [parentId]: "" }));
    setReplyingTo(null);
  };

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
            {/* Informações Principais */}
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
            {tarefa.links && tarefa.links.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4 flex items-center gap-2">
                  <ExternalLink size={20} />
                  Links ({tarefa.links.length})
                </h2>
                <div className="space-y-2">
                  {tarefa.links.map((link) => (
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
            {tarefa.subtarefas && tarefa.subtarefas.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px]">
                    Subtarefas
                  </h2>
                  <span className="text-[#bdbdbd] text-[14px] font-['Inter:Regular',sans-serif]">
                    {subtarefasConcluidas}/{totalSubtarefas}
                  </span>
                </div>

                <div className="space-y-3">
                  {tarefa.subtarefas.map((subtarefa) => (
                    <div
                      key={subtarefa.id}
                      className="flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors"
                    >
                      {subtarefa.concluida ? (
                        <CheckCircle2 size={20} className="text-[#28d939] mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle size={20} className="text-[#555] mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p
                          className={`font-['Inter:Regular',sans-serif] text-[14px] ${
                            subtarefa.concluida
                              ? "text-[#888] line-through"
                              : "text-[#eee]"
                          }`}
                        >
                          {subtarefa.titulo}
                        </p>
                        {subtarefa.responsavel && (
                          <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                            {subtarefa.responsavel}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anexos */}
            {tarefa.anexos && tarefa.anexos.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4 flex items-center gap-2">
                  <Paperclip size={20} />
                  Anexos ({tarefa.anexos.length})
                </h2>

                <div className="space-y-2">
                  {tarefa.anexos.map((anexo) => (
                    <div
                      key={anexo.id}
                      className="flex items-center justify-between p-4 bg-[#1a1a1a] rounded-lg hover:bg-[#222] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#14E9BC]/20 rounded flex items-center justify-center">
                          <Paperclip size={20} className="text-[#14E9BC]" />
                        </div>
                        <div>
                          <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px]">
                            {anexo.nome}
                          </p>
                          <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif]">
                            {anexo.tipo} • {anexo.tamanho} • {formatarData(anexo.dataUpload)}
                          </p>
                        </div>
                      </div>
                      <button className="text-[#14E9BC] hover:text-[#12d4a8] transition-colors">
                        <Download size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comentários */}
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Comentários ({localComentarios.length})
              </h2>

              {/* Novo comentário raiz */}
              <div className="mb-6">
                <textarea
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  placeholder="Adicione um comentário..."
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg p-4 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAdicionarComentario}
                    disabled={!novoComentario.trim()}
                    className="bg-[#14E9BC] text-[#000] px-4 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={16} />
                    Comentar
                  </button>
                </div>
              </div>

              {/* Lista de comentários com threading */}
              {localComentarios.filter((c) => !c.parentId).length > 0 ? (
                <div className="space-y-4">
                  {localComentarios
                    .filter((c) => !c.parentId)
                    .map((comentario) => {
                      const respostas = localComentarios.filter(
                        (c) => c.parentId === comentario.id
                      );
                      const isReplying = replyingTo === comentario.id;

                      return (
                        <div key={comentario.id}>
                          {/* Comentário principal */}
                          <div className="bg-[#1a1a1a] rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#14E9BC]/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif] text-[14px]">
                                  {comentario.autor.charAt(0)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                                    {comentario.autor}
                                  </span>
                                  <span className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif]">
                                    {formatarDataHora(comentario.data)}
                                  </span>
                                </div>
                                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                                  {comentario.conteudo}
                                </p>
                                <button
                                  onClick={() =>
                                    setReplyingTo(isReplying ? null : comentario.id)
                                  }
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
                                  placeholder={`Respondendo a ${comentario.autor}...`}
                                  className="flex-1 bg-[#1a1a1a] border border-[#14E9BC]/30 rounded-lg p-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none resize-none"
                                  rows={2}
                                />
                                <button
                                  onClick={() => handleAdicionarResposta(comentario.id)}
                                  disabled={!replyTexts[comentario.id]?.trim()}
                                  className="bg-[#14E9BC] text-[#000] px-3 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[13px] flex items-center gap-1 hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                                >
                                  <Send size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Respostas aninhadas */}
                          {respostas.length > 0 && (
                            <div className="ml-10 mt-2 space-y-2 border-l-2 border-[#333] pl-4">
                              {respostas.map((resposta) => (
                                <div key={resposta.id} className="bg-[#161616] rounded-lg p-3">
                                  <div className="flex items-start gap-2">
                                    <div className="w-6 h-6 rounded-full bg-[#6B8AFF]/20 flex items-center justify-center flex-shrink-0">
                                      <span className="text-[#6B8AFF] font-['Inter:Semi_Bold',sans-serif] text-[11px]">
                                        {resposta.autor.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px]">
                                          {resposta.autor}
                                        </span>
                                        <span className="text-[#555] text-[11px] font-['Inter:Regular',sans-serif]">
                                          {formatarDataHora(resposta.data)}
                                        </span>
                                      </div>
                                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                                        {resposta.conteudo}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
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

            {/* Atividades */}
            {tarefa.atividades && tarefa.atividades.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4 flex items-center gap-2">
                  <Activity size={20} />
                  Histórico de Atividades
                </h2>

                <div className="space-y-3">
                  {tarefa.atividades.map((atividade, index) => (
                    <div key={atividade.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#14E9BC]" />
                        {index < tarefa.atividades!.length - 1 && (
                          <div className="w-0.5 h-full bg-[#333] mt-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px]">
                          {atividade.descricao}
                        </p>
                        <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                          {atividade.usuario} • {formatarDataHora(atividade.data)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* OKRs Correlacionados */}
            {okrsRelacionados.length > 0 && (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4 flex items-center gap-2">
                  <Target size={20} />
                  OKRs Correlacionados ({okrsRelacionados.length})
                </h2>

                <div className="space-y-4">
                  {okrsRelacionados.map((okr) => {
                    const okrDepartamento = departamentos.find((d) => d.id === okr.departamento);
                    return (
                      <Link 
                        key={okr.id} 
                        to={`/okrs`}
                        className="block"
                      >
                        <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4 hover:border-[#14E9BC] transition-all cursor-pointer">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[15px] mb-2">
                                {okr.titulo}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="px-2 py-1 rounded-full text-[11px] font-['Inter:Semi_Bold',sans-serif]"
                                  style={{
                                    backgroundColor: `${okrDepartamento?.cor}20`,
                                    color: okrDepartamento?.cor,
                                  }}
                                >
                                  {okrDepartamento?.nome}
                                </span>
                                <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                                  {okr.periodo}
                                </span>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-[#14E9BC] text-[18px] font-['Inter:Semi_Bold',sans-serif]">
                                {okr.progresso}%
                              </p>
                            </div>
                          </div>

                          {/* Barra de Progresso */}
                          <div className="w-full bg-[#0f0f0f] rounded-full h-1.5 overflow-hidden mb-3">
                            <div
                              className="bg-[#14E9BC] h-full rounded-full transition-all duration-500"
                              style={{ width: `${okr.progresso}%` }}
                            />
                          </div>

                          {/* Key Results */}
                          {okr.keyResults && okr.keyResults.length > 0 && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-[#333]">
                              <p className="text-[#bdbdbd] text-[11px] font-['Inter:Medium',sans-serif] mb-2">
                                KEY RESULTS
                              </p>
                              {okr.keyResults.slice(0, 2).map((kr) => (
                                <div key={kr.id} className="flex items-center justify-between">
                                  <p className="text-[#bdbdbd] text-[12px] font-['Inter:Regular',sans-serif] flex-1">
                                    {kr.descricao}
                                  </p>
                                  <span className="text-[#28d939] text-[12px] font-['Inter:Semi_Bold',sans-serif] ml-2">
                                    {kr.progresso}%
                                  </span>
                                </div>
                              ))}
                              {okr.keyResults.length > 2 && (
                                <p className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif] italic">
                                  +{okr.keyResults.length - 2} outros key results
                                </p>
                              )}
                            </div>
                          )}

                          {/* Responsável e Período */}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#333]">
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-[#666]" />
                              <span className="text-[#bdbdbd] text-[12px] font-['Inter:Regular',sans-serif]">
                                {okr.responsavel}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar size={14} className="text-[#666]" />
                              <span className="text-[#bdbdbd] text-[12px] font-['Inter:Regular',sans-serif]">
                                {formatarData(okr.dataInicio)} - {formatarData(okr.dataFim)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-[#333]">
                  <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif]">
                    Esta tarefa contribui diretamente para o progresso {okrsRelacionados.length === 1 ? 'deste OKR' : 'destes OKRs'}.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações */}
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
                    {tarefa.responsavel}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                    <Calendar size={16} />
                    Prazo
                  </div>
                  <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px]">
                    {formatarData(tarefa.prazo)}
                  </p>
                </div>

                {tarefa.dataCriacao && (
                  <div>
                    <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                      <Clock size={16} />
                      Data de Criação
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px]">
                      {formatarData(tarefa.dataCriacao)}
                    </p>
                  </div>
                )}

                {tarefa.visibilidade && (
                  <div>
                    <div className="flex items-center gap-2 text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] mb-2">
                      <Eye size={16} />
                      Visibilidade
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px] capitalize">
                      {tarefa.visibilidade === "publica" ? "Pública" : tarefa.visibilidade === "departamento" ? "Departamento" : "Pessoal"}
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
                <button className="w-full bg-[#1a1a1a] border border-[#333] text-[#eee] px-4 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#222] transition-colors">
                  <CheckCircle2 size={16} />
                  Adicionar Subtarefa
                </button>
                <button className="w-full bg-[#1a1a1a] border border-[#ff6b6b] text-[#ff6b6b] px-4 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#ff6b6b]/10 transition-colors">
                  <Trash2 size={16} />
                  Excluir Tarefa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}