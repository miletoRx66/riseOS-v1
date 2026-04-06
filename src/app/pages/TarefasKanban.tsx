import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { getTarefas, atualizarTarefa, type TarefaDB } from "../../lib/services/tarefas";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { Plus, Filter, LayoutGrid, List } from "lucide-react";
import type { TarefaStatus } from "../types";

export default function TarefasKanban() {
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>("todos");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TarefaStatus | null>(null);
  const dragItem = useRef<string | null>(null);

  useEffect(() => {
    getTarefas().then(setTarefas).catch(console.error);
    getDepartamentos().then(setDepartamentos).catch(console.error);
  }, []);

  const filteredTasks = tarefas.filter((task) => {
    if (selectedDept !== "todos" && task.departamento_id !== selectedDept) return false;
    return true;
  });

  const colunas: { status: TarefaStatus; label: string; color: string }[] = [
    { status: "planejamento", label: "Planejamento", color: "#6B8AFF" },
    { status: "em-andamento", label: "Em Andamento", color: "#28d939" },
    { status: "concluido", label: "Concluído", color: "#bdbdbd" },
  ];

  const getTarefasPorStatus = (status: TarefaStatus) =>
    filteredTasks.filter((t) => t.status === status);

  const getDepartamentoNome = (deptId: string | null) => {
    if (!deptId) return "—";
    return departamentos.find((d) => d.id === deptId)?.nome || deptId;
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return "#ff6b6b";
      case "media": return "#FFA500";
      case "baixa": return "#6B8AFF";
      default: return "#bdbdbd";
    }
  };

  const formatarData = (data: string) =>
    new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  // ── Drag handlers ──────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, tarefaId: string) => {
    dragItem.current = tarefaId;
    setDraggingId(tarefaId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverCol(null);
    dragItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, status: TarefaStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(status);
  };

  const handleDrop = async (e: React.DragEvent, novoStatus: TarefaStatus) => {
    e.preventDefault();
    const id = dragItem.current;
    if (!id) return;

    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa || tarefa.status === novoStatus) {
      handleDragEnd();
      return;
    }

    // Optimistic update
    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: novoStatus } : t))
    );
    handleDragEnd();

    try {
      await atualizarTarefa(id, { status: novoStatus });
    } catch (err) {
      // Reverte em caso de erro
      console.error("Erro ao mover tarefa:", err);
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: tarefa.status } : t))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
              Tarefas — Kanban
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
              Arraste os cards entre colunas para mudar o status
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
                <option key={dept.id} value={dept.id}>{dept.nome}</option>
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
            const isOver = dragOverCol === coluna.status;

            return (
              <div
                key={coluna.status}
                className="flex flex-col"
                onDragOver={(e) => handleDragOver(e, coluna.status)}
                onDrop={(e) => handleDrop(e, coluna.status)}
                onDragLeave={() => setDragOverCol(null)}
              >
                {/* Column Header */}
                <div
                  className="bg-[#0f0f0f] border rounded-lg p-4 mb-4 transition-colors"
                  style={{ borderColor: isOver ? coluna.color : "#333" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: coluna.color }} />
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                        {coluna.label}
                      </h3>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-[#1a1a1a] text-[#bdbdbd] text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                      {tarefasColuna.length}
                    </span>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={`flex-1 space-y-3 min-h-[120px] rounded-lg transition-colors p-1 ${
                    isOver ? "bg-[#14E9BC]/5 ring-1 ring-[#14E9BC]/30" : ""
                  }`}
                >
                  {tarefasColuna.length > 0 ? (
                    tarefasColuna.map((tarefa) => (
                      <div
                        key={tarefa.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tarefa.id)}
                        onDragEnd={handleDragEnd}
                        className={`transition-all ${
                          draggingId === tarefa.id ? "opacity-40 scale-95" : ""
                        }`}
                      >
                        <Link to={`/tarefas/${tarefa.id}`}>
                          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 hover:border-[#14E9BC] transition-all cursor-grab active:cursor-grabbing">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] flex-1 pr-2">
                                {tarefa.titulo}
                              </h4>
                              {tarefa.prioridade === "alta" && (
                                <div
                                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                                  style={{ backgroundColor: getPrioridadeColor(tarefa.prioridade) }}
                                />
                              )}
                            </div>

                            {/* Departamento */}
                            <div className="mb-3">
                              <span className="px-2 py-1 rounded bg-[#1a1a1a] text-[#bdbdbd] text-[11px] font-['Inter:Regular',sans-serif]">
                                {getDepartamentoNome(tarefa.departamento_id)}
                              </span>
                            </div>

                            {/* Progresso */}
                            {tarefa.progresso !== undefined && tarefa.progresso > 0 && (
                              <div className="mb-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">Progresso</span>
                                  <span className="text-[#14E9BC] text-[11px] font-['Inter:Semi_Bold',sans-serif]">{tarefa.progresso}%</span>
                                </div>
                                <div className="w-full bg-[#1a1a1a] rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="bg-[#14E9BC] h-full rounded-full"
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
                                    {tarefa.responsavel?.nome?.charAt(0) ?? "?"}
                                  </span>
                                </div>
                                <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif] ml-1">
                                  {tarefa.responsavel?.nome?.split(" ")[0] ?? "—"}
                                </span>
                              </div>
                              <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                                {tarefa.prazo ? formatarData(tarefa.prazo) : "—"}
                              </span>
                            </div>

                            {/* Subtarefas e Comentários */}
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((tarefa as any).subtarefas?.length || (tarefa as any).comentarios?.length) ? (
                              <div className="flex items-center gap-3 pt-3 border-t border-[#1a1a1a] mt-3">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(tarefa as any).subtarefas?.length > 0 && (
                                  <div className="flex items-center gap-1 text-[#666] text-[11px]">
                                    <span>☑</span>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <span>{(tarefa as any).subtarefas.filter((s: any) => s.concluida).length}/{(tarefa as any).subtarefas.length}</span>
                                  </div>
                                )}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(tarefa as any).comentarios?.length > 0 && (
                                  <div className="flex items-center gap-1 text-[#666] text-[11px]">
                                    <span>💬</span>
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    <span>{(tarefa as any).comentarios.length}</span>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </Link>
                      </div>
                    ))
                  ) : (
                    <div
                      className={`border border-dashed rounded-lg p-8 text-center transition-colors ${
                        isOver ? "border-[#14E9BC]/40 bg-[#14E9BC]/5" : "border-[#333] bg-[#0f0f0f]"
                      }`}
                    >
                      <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif]">
                        {isOver ? "Solte aqui" : "Nenhuma tarefa"}
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
