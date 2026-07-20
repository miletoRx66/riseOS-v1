import { useState } from "react";
import { Plus, Zap, Play, Pause, Edit2, Trash2, Clock } from "lucide-react";

interface WorkspaceAutomacoesProps {
  departamento: {
    id: string;
    nome: string;
    cor: string;
  };
  temPermissao: boolean;
}

export function WorkspaceAutomacoes({ departamento, temPermissao }: WorkspaceAutomacoesProps) {
  const [automacoes] = useState([
    {
      id: "auto-1",
      nome: "Notificar equipe sobre nova tarefa",
      trigger: "Tarefa criada",
      acao: "Enviar email para membros",
      status: "ativa",
      execucoes: 47,
      ultimaExecucao: "2026-02-16T14:30:00",
    },
    {
      id: "auto-2",
      nome: "Backup semanal de documentos",
      trigger: "Toda segunda-feira às 08:00",
      acao: "Exportar documentos para cloud",
      status: "ativa",
      execucoes: 12,
      ultimaExecucao: "2026-02-16T08:00:00",
    },
    {
      id: "auto-3",
      nome: "Lembrete de OKRs pendentes",
      trigger: "Progresso < 30% após 15 dias",
      acao: "Notificar responsável",
      status: "pausada",
      execucoes: 3,
      ultimaExecucao: "2026-02-10T09:00:00",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px] mb-2">
            Automações
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[15px]">
            Configure triggers e ações automáticas baseadas em eventos
          </p>
        </div>
        {temPermissao && (
          <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
            <Plus size={20} />
            Nova Automação
          </button>
        )}
      </div>

      {/* Lista de Automações */}
      <div className="grid grid-cols-1 gap-4">
        {automacoes.map((auto) => (
          <div
            key={auto.id}
            className="bg-rise-surface border border-rise-line rounded-lg p-6 hover:border-rise-fg-4 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    auto.status === "ativa" ? "bg-[#28d939]/20" : "bg-[#666]/20"
                  }`}
                >
                  <Zap size={24} className={auto.status === "ativa" ? "text-[#28d939]" : "text-rise-fg-3"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px]">
                      {auto.nome}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-['Inter:Semi_Bold',sans-serif] ${
                        auto.status === "ativa"
                          ? "bg-[#28d939]/20 text-[#28d939] border border-[#28d939]/40"
                          : "bg-[#666]/20 text-[#999] border border-[#666]/40"
                      }`}
                    >
                      {auto.status === "ativa" ? "ATIVA" : "PAUSADA"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-1">
                        TRIGGER
                      </p>
                      <p className="font-['Inter:Regular',sans-serif] text-rise-fg text-[14px]">
                        {auto.trigger}
                      </p>
                    </div>
                    <div>
                      <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-1">
                        AÇÃO
                      </p>
                      <p className="font-['Inter:Regular',sans-serif] text-rise-fg text-[14px]">
                        {auto.acao}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-rise-fg-3 text-[13px]">
                    <div className="flex items-center gap-2">
                      <Play size={14} />
                      <span>{auto.execucoes} execuções</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>
                        Última: {new Date(auto.ultimaExecucao).toLocaleDateString("pt-BR")}{" "}
                        {new Date(auto.ultimaExecucao).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {temPermissao && (
                <div className="flex items-center gap-2">
                  <button
                    className="p-2 rounded-lg bg-rise-raised hover:bg-rise-raised transition-colors"
                    title={auto.status === "ativa" ? "Pausar" : "Ativar"}
                  >
                    {auto.status === "ativa" ? (
                      <Pause size={18} className="text-[#f59e0b]" />
                    ) : (
                      <Play size={18} className="text-[#28d939]" />
                    )}
                  </button>
                  <button
                    className="p-2 rounded-lg bg-rise-raised hover:bg-rise-raised transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} className="text-rise-fg-2" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-rise-raised hover:bg-rise-raised transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} className="text-[#ec5d5e]" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Triggers Disponíveis */}
      <div className="bg-rise-surface border border-rise-line rounded-lg p-6">
        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px] mb-4">
          Triggers Disponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "Tarefa criada",
            "Tarefa concluída",
            "Documento enviado",
            "OKR atualizado",
            "Formulário respondido",
            "Agendamento (diário/semanal/mensal)",
          ].map((trigger) => (
            <div
              key={trigger}
              className="bg-rise-raised border border-rise-line rounded-lg px-4 py-2 font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px]"
            >
              {trigger}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
