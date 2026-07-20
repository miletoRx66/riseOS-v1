import { useState } from "react";
import { Plus, Target, Calendar, TrendingUp, Edit2, Trash2 } from "lucide-react";

interface WorkspaceObjetivosProps {
  departamento: {
    id: string;
    nome: string;
    cor: string;
  };
  temPermissao: boolean;
}

export function WorkspaceObjetivos({ departamento, temPermissao }: WorkspaceObjetivosProps) {
  const [filtro, setFiltro] = useState<"todos" | "semanal" | "mensal" | "anual">("todos");
  
  const [objetivos] = useState([
    {
      id: "obj-1",
      titulo: "Aumentar produtividade da equipe",
      tipo: "mensal",
      meta: "Reduzir tempo médio de entrega em 15%",
      progresso: 72,
      dataInicio: "2026-02-01",
      dataFim: "2026-02-28",
      responsavel: "Carlos Oliveira",
      status: "em-andamento",
    },
    {
      id: "obj-2",
      titulo: "Capacitar time em novas ferramentas",
      tipo: "semanal",
      meta: "100% da equipe treinada na nova plataforma",
      progresso: 85,
      dataInicio: "2026-02-14",
      dataFim: "2026-02-21",
      responsavel: "Ana Silva",
      status: "em-andamento",
    },
    {
      id: "obj-3",
      titulo: "Atingir metas de receita anual",
      tipo: "anual",
      meta: "R$ 30M em receita recorrente",
      progresso: 42,
      dataInicio: "2026-01-01",
      dataFim: "2026-12-31",
      responsavel: "Maria Oliveira",
      status: "em-andamento",
    },
    {
      id: "obj-4",
      titulo: "Otimizar processos internos",
      tipo: "mensal",
      meta: "Automatizar 3 processos manuais",
      progresso: 100,
      dataInicio: "2026-01-01",
      dataFim: "2026-01-31",
      responsavel: "Roberto Lima",
      status: "concluido",
    },
  ]);

  const objetivosFiltrados =
    filtro === "todos" ? objetivos : objetivos.filter((obj) => obj.tipo === filtro);

  const getCorProgresso = (progresso: number) => {
    if (progresso >= 80) return "#28d939";
    if (progresso >= 50) return "#f59e0b";
    return "#ec5d5e";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px] mb-2">
            Objetivos e Metas
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[15px]">
            Defina e acompanhe objetivos semanais, mensais e anuais
          </p>
        </div>
        {temPermissao && (
          <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
            <Plus size={20} />
            Novo Objetivo
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        {[
          { id: "todos", label: "Todos" },
          { id: "semanal", label: "Semanais" },
          { id: "mensal", label: "Mensais" },
          { id: "anual", label: "Anuais" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id as any)}
            className={`px-4 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[13px] transition-all ${
              filtro === f.id
                ? "bg-[#14E9BC] text-[#000]"
                : "bg-rise-surface border border-rise-line text-rise-fg-2 hover:border-rise-fg-4"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de Objetivos */}
      <div className="grid grid-cols-1 gap-4">
        {objetivosFiltrados.map((obj) => {
          const corProgresso = getCorProgresso(obj.progresso);
          return (
            <div
              key={obj.id}
              className={`bg-rise-surface border rounded-lg p-6 transition-all ${
                obj.status === "concluido"
                  ? "border-[#28d939]/40 bg-[#28d939]/5"
                  : "border-rise-line hover:border-rise-fg-4"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${departamento.cor}20`, color: departamento.cor }}
                  >
                    <Target size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px]">
                        {obj.titulo}
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-[#14E9BC]/20 text-[#14E9BC] border border-[#14E9BC]/40 text-[11px] font-['Inter:Semi_Bold',sans-serif] uppercase">
                        {obj.tipo}
                      </span>
                      {obj.status === "concluido" && (
                        <span className="px-3 py-1 rounded-full bg-[#28d939]/20 text-[#28d939] border border-[#28d939]/40 text-[11px] font-['Inter:Semi_Bold',sans-serif]">
                          CONCLUÍDO
                        </span>
                      )}
                    </div>
                    <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px] mb-4">
                      Meta: {obj.meta}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[13px]">
                          Progresso
                        </span>
                        <span
                          className="font-['Inter:Bold',sans-serif] text-[18px]"
                          style={{ color: corProgresso }}
                        >
                          {obj.progresso}%
                        </span>
                      </div>
                      <div className="w-full bg-rise-raised rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${obj.progresso}%`, backgroundColor: corProgresso }}
                        />
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center gap-4 text-rise-fg-3 text-[13px]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        <span>
                          {new Date(obj.dataInicio).toLocaleDateString("pt-BR")} -{" "}
                          {new Date(obj.dataFim).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <span>•</span>
                      <span>Responsável: {obj.responsavel}</span>
                    </div>
                  </div>
                </div>
                {temPermissao && obj.status !== "concluido" && (
                  <div className="flex items-center gap-2">
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
          );
        })}
      </div>

      {/* Stats resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-[#28d939]" />
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
              Em Andamento
            </p>
          </div>
          <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
            {objetivos.filter((o) => o.status === "em-andamento").length}
          </p>
        </div>
        <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Target size={20} className="text-[#14E9BC]" />
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
              Concluídos
            </p>
          </div>
          <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
            {objetivos.filter((o) => o.status === "concluido").length}
          </p>
        </div>
        <div className="bg-rise-surface border border-rise-line rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <Calendar size={20} className="text-[#f59e0b]" />
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
              Taxa de Sucesso
            </p>
          </div>
          <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
            {Math.round((objetivos.filter((o) => o.status === "concluido").length / objetivos.length) * 100)}%
          </p>
        </div>
      </div>
    </div>
  );
}
