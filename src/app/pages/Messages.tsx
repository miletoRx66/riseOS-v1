import { useState } from "react";
import {
  usuarios,
  conversasP2P,
  mensagensP2P,
  canaisDepartamento,
  mensagensCanais,
  departamentos,
} from "../data/mockData";
import {
  MessageSquare,
  Hash,
  Search,
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Users,
  Circle,
  Pin,
  Filter,
  X,
} from "lucide-react";

export default function Messages() {
  const [activeTab, setActiveTab] = useState<"conversas" | "canais">("conversas");
  const [conversaAtiva, setConversaAtiva] = useState<string | null>("conv-1");
  const [canalAtivo, setCanalAtivo] = useState<string | null>(null);
  const [novaMensagem, setNovaMensagem] = useState("");
  const [buscaUsuarios, setBuscaUsuarios] = useState("");

  const usuarioAtual = "user-1"; // Admin atual (Ana Silva)

  // Obter informações da conversa ativa
  const getConversaInfo = (conversaId: string) => {
    const conversa = conversasP2P.find((c) => c.id === conversaId);
    if (!conversa) return null;

    const outroParticipanteId = conversa.participantes.find((p) => p !== usuarioAtual);
    const outroParticipante = usuarios.find((u) => u.id === outroParticipanteId);

    return {
      ...conversa,
      outroParticipante,
    };
  };

  // Obter mensagens da conversa ativa
  const getMensagensConversa = (conversaId: string) => {
    return mensagensP2P.filter((m) => m.conversaId === conversaId);
  };

  // Obter mensagens do canal ativo
  const getMensagensCanal = (canalId: string) => {
    return mensagensCanais.filter((m) => m.canalId === canalId);
  };

  // Obter informações do canal ativo
  const getCanalInfo = (canalId: string) => {
    const canal = canaisDepartamento.find((c) => c.id === canalId);
    if (!canal) return null;

    const dept = departamentos.find((d) => d.id === canal.departamentoId);
    return { ...canal, departamento: dept };
  };

  // Formatar data/hora
  const formatarHora = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatarDataRelativa = (dataString: string) => {
    const data = new Date(dataString);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return formatarHora(dataString);
    } else if (data.toDateString() === ontem.toDateString()) {
      return "Ontem";
    } else {
      return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }
  };

  const handleEnviarMensagem = () => {
    if (novaMensagem.trim()) {
      setNovaMensagem("");
    }
  };

  // Filtrar usuários na busca
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.id !== usuarioAtual &&
      (u.nome.toLowerCase().includes(buscaUsuarios.toLowerCase()) ||
        u.cargo.toLowerCase().includes(buscaUsuarios.toLowerCase()))
  );

  const conversaInfo = conversaAtiva ? getConversaInfo(conversaAtiva) : null;
  const mensagensConversa = conversaAtiva ? getMensagensConversa(conversaAtiva) : [];
  
  const canalInfo = canalAtivo ? getCanalInfo(canalAtivo) : null;
  const mensagensDoCanal = canalAtivo ? getMensagensCanal(canalAtivo) : [];

  return (
    <div className="h-screen bg-[#0a0a0a] flex">
      {/* Sidebar Esquerda - Lista de Conversas/Canais */}
      <div className="w-[320px] bg-[#0f0f0f] border-r border-[#333] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333]">
          <h1 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px] mb-4">
            Mensagens
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab("conversas");
                setCanalAtivo(null);
              }}
              className={`flex-1 px-4 py-2 rounded-md font-['Inter:Medium',sans-serif] text-[13px] transition-all ${
                activeTab === "conversas"
                  ? "bg-[#14E9BC] text-[#000]"
                  : "text-[#bdbdbd] hover:text-[#eee]"
              }`}
            >
              <MessageSquare size={16} className="inline mr-2" />
              Diretas
            </button>
            <button
              onClick={() => {
                setActiveTab("canais");
                setConversaAtiva(null);
              }}
              className={`flex-1 px-4 py-2 rounded-md font-['Inter:Medium',sans-serif] text-[13px] transition-all ${
                activeTab === "canais"
                  ? "bg-[#14E9BC] text-[#000]"
                  : "text-[#bdbdbd] hover:text-[#eee]"
              }`}
            >
              <Hash size={16} className="inline mr-2" />
              Canais
            </button>
          </div>
        </div>

        {/* Busca */}
        <div className="p-4 border-b border-[#333]">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#bdbdbd]" />
            <input
              type="text"
              placeholder={activeTab === "conversas" ? "Buscar pessoas..." : "Buscar canais..."}
              value={buscaUsuarios}
              onChange={(e) => setBuscaUsuarios(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg pl-10 pr-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            />
          </div>
        </div>

        {/* Lista de Conversas P2P */}
        {activeTab === "conversas" && (
          <div className="flex-1 overflow-y-auto">
            {conversasP2P.map((conversa) => {
              const outroParticipanteId = conversa.participantes.find((p) => p !== usuarioAtual);
              const outroParticipante = usuarios.find((u) => u.id === outroParticipanteId);
              if (!outroParticipante) return null;

              const isAtiva = conversaAtiva === conversa.id;

              return (
                <button
                  key={conversa.id}
                  onClick={() => {
                    setConversaAtiva(conversa.id);
                    setCanalAtivo(null);
                  }}
                  className={`w-full p-4 border-b border-[#333] hover:bg-[#1a1a1a] transition-colors text-left ${
                    isAtiva ? "bg-[#1a1a1a]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-['Inter:Semi_Bold',sans-serif] text-[#000] text-[14px]"
                        style={{
                          backgroundColor:
                            departamentos.find((d) => d.id === outroParticipante.departamento)?.cor ||
                            "#14E9BC",
                        }}
                      >
                        {outroParticipante.avatar}
                      </div>
                      <Circle
                        size={12}
                        className={`absolute bottom-0 right-0 ${
                          outroParticipante.status === "online"
                            ? "text-[#28d939] fill-[#28d939]"
                            : outroParticipante.status === "away"
                            ? "text-[#f59e0b] fill-[#f59e0b]"
                            : "text-[#555] fill-[#555]"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] truncate">
                          {outroParticipante.nome}
                        </h3>
                        <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[11px]">
                          {formatarDataRelativa(conversa.dataUltimaMensagem)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px] truncate">
                          {conversa.ultimaMensagem}
                        </p>
                        {conversa.naoLidas > 0 && (
                          <span className="ml-2 bg-[#14E9BC] text-[#000] rounded-full px-2 py-0.5 text-[10px] font-['Inter:Semi_Bold',sans-serif] flex-shrink-0">
                            {conversa.naoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Lista de Canais */}
        {activeTab === "canais" && (
          <div className="flex-1 overflow-y-auto">
            {canaisDepartamento.map((canal) => {
              const dept = departamentos.find((d) => d.id === canal.departamentoId);
              if (!dept) return null;

              const isAtivo = canalAtivo === canal.id;

              return (
                <button
                  key={canal.id}
                  onClick={() => {
                    setCanalAtivo(canal.id);
                    setConversaAtiva(null);
                  }}
                  className={`w-full p-4 border-b border-[#333] hover:bg-[#1a1a1a] transition-colors text-left ${
                    isAtivo ? "bg-[#1a1a1a]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${dept.cor}20` }}
                    >
                      <Hash size={24} style={{ color: dept.cor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                          {canal.nome}
                        </h3>
                        {canal.mensagensNaoLidas > 0 && (
                          <span className="bg-[#14E9BC] text-[#000] rounded-full px-2 py-0.5 text-[10px] font-['Inter:Semi_Bold',sans-serif]">
                            {canal.mensagensNaoLidas}
                          </span>
                        )}
                      </div>
                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px] truncate">
                        {canal.membros} membros
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Área Central - Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header da Conversa/Canal */}
        {(conversaInfo || canalInfo) && (
          <div className="h-[72px] bg-[#0f0f0f] border-b border-[#333] px-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {conversaInfo && (
                <>
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-['Inter:Semi_Bold',sans-serif] text-[#000] text-[14px]"
                      style={{
                        backgroundColor:
                          departamentos.find(
                            (d) => d.id === conversaInfo.outroParticipante?.departamento
                          )?.cor || "#14E9BC",
                      }}
                    >
                      {conversaInfo.outroParticipante?.avatar}
                    </div>
                    <Circle
                      size={12}
                      className={`absolute bottom-0 right-0 ${
                        conversaInfo.outroParticipante?.status === "online"
                          ? "text-[#28d939] fill-[#28d939]"
                          : conversaInfo.outroParticipante?.status === "away"
                          ? "text-[#f59e0b] fill-[#f59e0b]"
                          : "text-[#555] fill-[#555]"
                      }`}
                    />
                  </div>
                  <div>
                    <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                      {conversaInfo.outroParticipante?.nome}
                    </h2>
                    <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                      {conversaInfo.outroParticipante?.cargo} •{" "}
                      {conversaInfo.outroParticipante?.status === "online"
                        ? "Online"
                        : conversaInfo.outroParticipante?.status === "away"
                        ? "Ausente"
                        : "Offline"}
                    </p>
                  </div>
                </>
              )}

              {canalInfo && (
                <>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${canalInfo.departamento?.cor}20` }}
                  >
                    <Hash size={24} style={{ color: canalInfo.departamento?.cor }} />
                  </div>
                  <div>
                    <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                      {canalInfo.nome}
                    </h2>
                    <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                      {canalInfo.membros} membros • {canalInfo.descricao}
                    </p>
                  </div>
                </>
              )}
            </div>
            <button className="text-[#bdbdbd] hover:text-[#eee] transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        )}

        {/* Área de Mensagens */}
        {(conversaAtiva || canalAtivo) ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Mensagens P2P */}
              {conversaAtiva &&
                mensagensConversa.map((mensagem) => {
                  const remetente = usuarios.find((u) => u.id === mensagem.remetenteId);
                  const isMinha = mensagem.remetenteId === usuarioAtual;

                  return (
                    <div
                      key={mensagem.id}
                      className={`flex ${isMinha ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex gap-3 max-w-[70%] ${isMinha ? "flex-row-reverse" : ""}`}>
                        {!isMinha && (
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-['Inter:Semi_Bold',sans-serif] text-[#000] text-[12px] flex-shrink-0"
                            style={{
                              backgroundColor:
                                departamentos.find((d) => d.id === remetente?.departamento)?.cor ||
                                "#14E9BC",
                            }}
                          >
                            {remetente?.avatar}
                          </div>
                        )}
                        <div>
                          {!isMinha && (
                            <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[13px] mb-1">
                              {remetente?.nome}
                            </p>
                          )}
                          <div
                            className={`rounded-lg px-4 py-2.5 ${
                              isMinha
                                ? "bg-[#14E9BC] text-[#000]"
                                : "bg-[#1a1a1a] text-[#eee] border border-[#333]"
                            }`}
                          >
                            <p className="font-['Inter:Regular',sans-serif] text-[14px]">
                              {mensagem.conteudo}
                            </p>
                          </div>
                          <p
                            className={`font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[11px] mt-1 ${
                              isMinha ? "text-right" : ""
                            }`}
                          >
                            {formatarHora(mensagem.data)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

              {/* Mensagens de Canal */}
              {canalAtivo &&
                mensagensDoCanal.map((mensagem) => {
                  const autor = usuarios.find((u) => u.id === mensagem.autorId);
                  const dept = departamentos.find((d) => d.id === autor?.departamento);

                  return (
                    <div key={mensagem.id} className="flex gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-['Inter:Semi_Bold',sans-serif] text-[#000] text-[12px] flex-shrink-0"
                        style={{ backgroundColor: dept?.cor || "#14E9BC" }}
                      >
                        {autor?.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                            {autor?.nome}
                          </p>
                          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[11px]">
                            {formatarHora(mensagem.data)}
                          </p>
                          {mensagem.fixada && (
                            <Pin size={14} className="text-[#14E9BC]" />
                          )}
                        </div>
                        <p className="font-['Inter:Regular',sans-serif] text-[#eee] text-[14px] mb-2">
                          {mensagem.conteudo}
                        </p>
                        {/* Reações */}
                        {mensagem.reacoes && mensagem.reacoes.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {mensagem.reacoes.map((reacao, idx) => (
                              <button
                                key={idx}
                                className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded-full px-2 py-1 hover:border-[#14E9BC] transition-colors"
                              >
                                <span className="text-[14px]">{reacao.emoji}</span>
                                <span className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[11px]">
                                  {reacao.usuarios.length}
                                </span>
                              </button>
                            ))}
                            <button className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded-full px-2 py-1 hover:border-[#14E9BC] transition-colors">
                              <Smile size={14} className="text-[#bdbdbd]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Input de Nova Mensagem */}
            <div className="p-4 bg-[#0f0f0f] border-t border-[#333]">
              <div className="flex items-end gap-3">
                <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-lg p-3 focus-within:border-[#14E9BC] transition-colors">
                  <textarea
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleEnviarMensagem();
                      }
                    }}
                    placeholder={
                      activeTab === "conversas"
                        ? `Mensagem para ${conversaInfo?.outroParticipante?.nome}...`
                        : `Mensagem em #${canalInfo?.nome}...`
                    }
                    rows={1}
                    className="w-full bg-transparent text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] resize-none focus:outline-none"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <button className="text-[#bdbdbd] hover:text-[#14E9BC] transition-colors">
                      <Paperclip size={18} />
                    </button>
                    <button className="text-[#bdbdbd] hover:text-[#14E9BC] transition-colors">
                      <Smile size={18} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleEnviarMensagem}
                  disabled={!novaMensagem.trim()}
                  className="bg-[#14E9BC] text-[#000] p-3 rounded-lg hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={64} className="text-[#555] mx-auto mb-4" />
              <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-2">
                Selecione uma conversa
              </h3>
              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                Escolha uma conversa direta ou canal para começar
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Direita - Informações */}
      {(conversaInfo || canalInfo) && (
        <div className="w-[280px] bg-[#0f0f0f] border-l border-[#333] p-6">
          {conversaInfo && (
            <>
              <div className="text-center mb-6">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center font-['Inter:Bold',sans-serif] text-[#000] text-[24px] mx-auto mb-3"
                  style={{
                    backgroundColor:
                      departamentos.find((d) => d.id === conversaInfo.outroParticipante?.departamento)
                        ?.cor || "#14E9BC",
                  }}
                >
                  {conversaInfo.outroParticipante?.avatar}
                </div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px] mb-1">
                  {conversaInfo.outroParticipante?.nome}
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px] mb-1">
                  {conversaInfo.outroParticipante?.cargo}
                </p>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
                  {conversaInfo.outroParticipante?.email}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] mb-2 uppercase tracking-wider">
                    Departamento
                  </h4>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          departamentos.find(
                            (d) => d.id === conversaInfo.outroParticipante?.departamento
                          )?.cor || "#14E9BC",
                      }}
                    />
                    <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                      {
                        departamentos.find((d) => d.id === conversaInfo.outroParticipante?.departamento)
                          ?.nome
                      }
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] mb-2 uppercase tracking-wider">
                    Status
                  </h4>
                  <div className="flex items-center gap-2">
                    <Circle
                      size={12}
                      className={`${
                        conversaInfo.outroParticipante?.status === "online"
                          ? "text-[#28d939] fill-[#28d939]"
                          : conversaInfo.outroParticipante?.status === "away"
                          ? "text-[#f59e0b] fill-[#f59e0b]"
                          : "text-[#555] fill-[#555]"
                      }`}
                    />
                    <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                      {conversaInfo.outroParticipante?.status === "online"
                        ? "Online"
                        : conversaInfo.outroParticipante?.status === "away"
                        ? "Ausente"
                        : "Offline"}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {canalInfo && (
            <>
              <div className="mb-6">
                <div
                  className="w-20 h-20 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: `${canalInfo.departamento?.cor}20` }}
                >
                  <Hash size={40} style={{ color: canalInfo.departamento?.cor }} />
                </div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px] text-center mb-2">
                  {canalInfo.nome}
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px] text-center">
                  {canalInfo.descricao}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[13px] mb-2 uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} />
                    Membros ({canalInfo.membros})
                  </h4>
                  <div className="space-y-2">
                    {usuarios
                      .filter((u) => u.departamento === canalInfo.departamentoId)
                      .slice(0, 5)
                      .map((membro) => (
                        <div key={membro.id} className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-['Inter:Semi_Bold',sans-serif] text-[#000] text-[11px]"
                            style={{ backgroundColor: canalInfo.departamento?.cor }}
                          >
                            {membro.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[12px] truncate">
                              {membro.nome}
                            </p>
                          </div>
                          <Circle
                            size={8}
                            className={`flex-shrink-0 ${
                              membro.status === "online"
                                ? "text-[#28d939] fill-[#28d939]"
                                : membro.status === "away"
                                ? "text-[#f59e0b] fill-[#f59e0b]"
                                : "text-[#555] fill-[#555]"
                            }`}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
