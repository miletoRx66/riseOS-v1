import { useState } from "react";
import { Link } from "react-router";
import { tarefas, departamentos } from "../data/mockData";
import { Plus, Filter, LayoutGrid, List } from "lucide-react";
import type { TarefaStatus } from "../types";

export default function TarefasKanban() {
  const [selectedDept, setSelectedDept] = useState<string>("todos");

  const filteredTasks = tarefas.filter((task) => {
    if (selectedDept !== "todos" && task.departamento !== selectedDept) return false;
    return true;
  });

  const colunas: { status: TarefaStatus; label: string; color: string }[] = [
    { status: "planejamento", label: "Planejamento", color: "#6B8AFF" },
    { status: "em-andamento", label: "Em Andamento", color: "#28d939" },
    { status: "concluido", label: "Concluído", color: "#bdbdbd" },
  ];

  const getTarefasPorStatus = (status: TarefaStatus) => {
    return filteredTasks.filter((t) => t.status === status);
  };

  const getDepartamentoNome = (deptId: string) => {
    return departamentos.find((d) => d.id === deptId)?.nome || deptId;
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
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
              Tarefas - Kanban
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
              Visualização em quadro das tarefas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/tarefas"
              className="bg-[#1a1a1a] border border-[#333] text-[#eee] px-4 py-2 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#222] transition-colors"
            >
              <List size={18} />
              Vista Lista
            </Link>
            <button className="bg-[#1a1a1a] border border-[#14E9BC] text-[#14E9BC] px-4 py-2 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2">
              <LayoutGrid size={18} />
              Vista Kanban
            </button>
            <Link to="/tarefas/nova">
              <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
                <Plus size={20} />
                Nova Tarefa
              </button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-[#bdbdbd]" />
              <span className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Filtrar por:
              </span>
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Departamentos</option>
              {departamentos.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nome}
                </option>
              ))}
            </select>

            {selectedDept !== "todos" && (
              <button
                onClick={() => setSelectedDept("todos")}
                className="text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif] text-[14px]"
              >
                Limpar filtro
              </button>
            )}
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {colunas.map((coluna) => {
            const tarefasColuna = getTarefasPorStatus(coluna.status);

            return (
              <div key={coluna.status} className="flex flex-col">
                {/* Column Header */}
                <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: coluna.color }}
                      />
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                        {coluna.label}
                      </h3>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-[#1a1a1a] text-[#bdbdbd] text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                      {tarefasColuna.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {tarefasColuna.length > 0 ? (
                    tarefasColuna.map((tarefa) => (
                      <Link key={tarefa.id} to={`/tarefas/${tarefa.id}`}>
                        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 hover:border-[#14E9BC] transition-all cursor-pointer">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] flex-1 pr-2">
                              {tarefa.titulo}
                            </h4>
                            {tarefa.prioridade === "alta" && (
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                style={{
                                  backgroundColor: getPrioridadeColor(tarefa.prioridade),
                                }}
                              />
                            )}
                          </div>

                          {/* Departamento */}
                          <div className="mb-3">
                            <span className="px-2 py-1 rounded bg-[#1a1a1a] text-[#bdbdbd] text-[11px] font-['Inter:Regular',sans-serif]">
                              {getDepartamentoNome(tarefa.departamento)}
                            </span>
                          </div>

                          {/* Progresso */}
                          {tarefa.progresso !== undefined && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                                  Progresso
                                </span>
                                <span className="text-[#14E9BC] text-[11px] font-['Inter:Semi_Bold',sans-serif]">
                                  {tarefa.progresso}%
                                </span>
                              </div>
                              <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                                <div
                                  className="bg-[#14E9BC] h-full rounded-full transition-all"
                                  style={{ width: `${tarefa.progresso}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]">
                            <div className="flex items-center gap-1">
                              <div className="w-6 h-6 rounded-full bg-[#14E9BC]/20 flex items-center justify-center">
                                <span className="text-[#14E9BC] font-['Inter:Semi_Bold',sans-serif] text-[10px]">
                                  {tarefa.responsavel.charAt(0)}
                                </span>
                              </div>
                              <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif] ml-1">
                                {tarefa.responsavel.split(" ")[0]}
                              </span>
                            </div>
                            <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                              {formatarData(tarefa.prazo)}
                            </span>
                          </div>

                          {/* Subtarefas e Comentários */}
                          {(tarefa.subtarefas?.length || tarefa.comentarios?.length) ? (
                            <div className="flex items-center gap-3 pt-3 border-t border-[#1a1a1a] mt-3">
                              {tarefa.subtarefas && tarefa.subtarefas.length > 0 && (
                                <div className="flex items-center gap-1 text-[#666] text-[11px]">
                                  <span>☑</span>
                                  <span>
                                    {tarefa.subtarefas.filter((s) => s.concluida).length}/
                                    {tarefa.subtarefas.length}
                                  </span>
                                </div>
                              )}
                              {tarefa.comentarios && tarefa.comentarios.length > 0 && (
                                <div className="flex items-center gap-1 text-[#666] text-[11px]">
                                  <span>💬</span>
                                  <span>{tarefa.comentarios.length}</span>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="bg-[#0f0f0f] border border-[#333] border-dashed rounded-lg p-8 text-center">
                      <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif]">
                        Nenhuma tarefa
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
