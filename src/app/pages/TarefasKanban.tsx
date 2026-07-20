import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { getTarefas, atualizarTarefa, type TarefaDB } from "../../lib/services/tarefas";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { Plus, Filter, List } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  "planejamento":  { label: "Planejamento",  color: "#6B8AFF" },
  "em-andamento":  { label: "Em Andamento",  color: "#28d939" },
  "concluido":     { label: "Concluído",     color: "#bdbdbd" },
};

const PRIORIDADE_COLOR: Record<string, string> = {
  alta:  "#ec5d5e",
  media: "#f59e0b",
  baixa: "#6B8AFF",
};

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function isAtrasada(tarefa: TarefaDB): boolean {
  if (!tarefa.prazo || tarefa.status === "concluido") return false;
  return new Date(tarefa.prazo) < new Date();
}

export default function TarefasKanban() {
  const { usuario } = useAuth();
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverDept, setDragOverDept] = useState<string | null>(null);
  const dragItem = useRef<string | null>(null);

  useEffect(() => {
    if (!usuario) return;
    const filtro = usuario.isAdmin ? {} : { departamento_id: usuario.departamento };
    getTarefas(filtro).then(setTarefas).catch(console.error);
    getDepartamentos().then(setDepartamentos).catch(console.error);
  }, [usuario?.id, usuario?.isAdmin, usuario?.departamento]);

  const tarefasFiltradas = tarefas.filter((t) => {
    if (filtroStatus === "todos") return true;
    if (filtroStatus === "atrasadas") return isAtrasada(t);
    return t.status === filtroStatus;
  });

  const getTarefasPorDept = (deptId: string) =>
    tarefasFiltradas.filter((t) => t.departamento_id === deptId);

  const getSemDept = () =>
    tarefasFiltradas.filter((t) => !t.departamento_id);

  // ── Drag & drop ────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, tarefaId: string) => {
    dragItem.current = tarefaId;
    setDraggingId(tarefaId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverDept(null);
    dragItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, deptId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverDept(deptId);
  };

  const handleDrop = async (e: React.DragEvent, novoDeptId: string | null) => {
    e.preventDefault();
    const id = dragItem.current;
    if (!id) return;

    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa || tarefa.departamento_id === novoDeptId) {
      handleDragEnd();
      return;
    }

    // Optimistic update
    setTarefas((prev) =>
      prev.map((t) => (t.id === id ? { ...t, departamento_id: novoDeptId } : t))
    );
    handleDragEnd();

    try {
      await atualizarTarefa(id, { departamento_id: novoDeptId } as Partial<TarefaDB>);
    } catch (err) {
      console.error("Erro ao mover tarefa:", err);
      setTarefas((prev) =>
        prev.map((t) => (t.id === id ? { ...t, departamento_id: tarefa.departamento_id } : t))
      );
    }
  };

  const semDept = getSemDept();

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-full mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 max-w-[1400px]">
          <div>
            <h1 className="font-bold text-rise-fg text-[32px] mb-1">Tarefas por Área</h1>
            <p className="text-rise-fg-2 text-[15px]">
              Cada coluna representa um departamento — arraste para transferir
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/tarefas"
              className="bg-rise-raised border border-rise-line text-rise-fg-2 px-4 py-2 rounded-lg text-[14px] flex items-center gap-2 hover:bg-rise-subtle hover:text-rise-fg transition-colors"
            >
              <List size={16} />
              Todas as Tarefas
            </Link>
            <Link to="/tarefas/nova">
              <button className="bg-[#14E9BC] text-[#000] px-5 py-2.5 rounded-lg font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
                <Plus size={18} />
                Nova Tarefa
              </button>
            </Link>
          </div>
        </div>

        {/* Filtro por status */}
        <div className="bg-rise-surface border border-rise-line rounded-lg px-5 py-3 mb-6 max-w-[1400px] flex items-center gap-4">
          <div className="flex items-center gap-2 text-rise-fg-2">
            <Filter size={16} />
            <span className="text-[14px]">Status:</span>
          </div>
          {[
            { value: "todos",        label: "Todos" },
            { value: "planejamento", label: "Planejamento" },
            { value: "em-andamento", label: "Em Andamento" },
            { value: "concluido",    label: "Concluído" },
            { value: "atrasadas",    label: "Atrasadas" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFiltroStatus(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                filtroStatus === opt.value
                  ? "bg-[#14E9BC]/15 border border-[#14E9BC]/40 text-[#14E9BC]"
                  : "text-rise-fg-3 hover:text-rise-fg-2"
              }`}
            >
              {opt.label}
              {opt.value !== "todos" && (
                <span className="ml-1.5 text-[11px] opacity-70">
                  {opt.value === "atrasadas"
                    ? tarefas.filter(isAtrasada).length
                    : opt.value === "planejamento" || opt.value === "em-andamento" || opt.value === "concluido"
                      ? tarefas.filter((t) => t.status === opt.value).length
                      : ""}
                </span>
              )}
            </button>
          ))}
          <span className="ml-auto text-rise-fg-4 text-[12px]">
            {tarefasFiltradas.length} tarefa{tarefasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Board — scroll horizontal */}
        <div className="flex gap-5 overflow-x-auto pb-6" style={{ minWidth: "min-content" }}>

          {/* Colunas por departamento */}
          {departamentos.map((dept) => {
            const deptTarefas = getTarefasPorDept(dept.id);
            const isOver = dragOverDept === dept.id;

            return (
              <div
                key={dept.id}
                className="flex flex-col flex-shrink-0"
                style={{ width: "260px" }}
                onDragOver={(e) => handleDragOver(e, dept.id)}
                onDrop={(e) => handleDrop(e, dept.id)}
                onDragLeave={() => setDragOverDept(null)}
              >
                {/* Cabeçalho da coluna */}
                <div
                  className="rounded-xl p-4 mb-3 transition-colors border"
                  style={{
                    backgroundColor: `${dept.cor}08`,
                    borderColor: isOver ? dept.cor : `${dept.cor}30`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.cor }}
                      />
                      <span
                        className="font-semibold text-[14px] truncate max-w-[160px]"
                        style={{ color: dept.cor }}
                      >
                        {dept.nome}
                      </span>
                    </div>
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${dept.cor}20`, color: dept.cor }}
                    >
                      {deptTarefas.length}
                    </span>
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  className={`flex-1 space-y-2.5 min-h-[180px] rounded-xl p-2 transition-colors ${
                    isOver ? "bg-[#14E9BC]/5 ring-1 ring-[#14E9BC]/25" : ""
                  }`}
                >
                  {deptTarefas.length > 0 ? (
                    deptTarefas.map((tarefa) => (
                      <KanbanCard
                        key={tarefa.id}
                        tarefa={tarefa}
                        isDragging={draggingId === tarefa.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                      />
                    ))
                  ) : (
                    <div
                      className={`border border-dashed rounded-xl p-6 text-center transition-colors ${
                        isOver
                          ? "border-[#14E9BC]/40 bg-[#14E9BC]/5"
                          : "border-rise-line-2"
                      }`}
                    >
                      <p className="text-rise-fg-4 text-[12px]">
                        {isOver ? "Soltar aqui" : "Sem tarefas"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Coluna "Sem Departamento" — só exibe se houver tarefas */}
          {semDept.length > 0 && (
            <div
              className="flex flex-col flex-shrink-0"
              style={{ width: "260px" }}
              onDragOver={(e) => handleDragOver(e, "__sem_dept__")}
              onDrop={(e) => handleDrop(e, null)}
              onDragLeave={() => setDragOverDept(null)}
            >
              <div
                className={`rounded-xl p-4 mb-3 border transition-colors ${
                  dragOverDept === "__sem_dept__"
                    ? "border-rise-fg-4 bg-rise-raised"
                    : "border-rise-line-2 bg-rise-surface"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#555]" />
                    <span className="text-rise-fg-4 font-semibold text-[14px]">Sem Área</span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rise-subtle text-rise-fg-4">
                    {semDept.length}
                  </span>
                </div>
              </div>
              <div
                className={`flex-1 space-y-2.5 min-h-[180px] rounded-xl p-2 transition-colors ${
                  dragOverDept === "__sem_dept__" ? "bg-[#ffffff08] ring-1 ring-[#555]/25" : ""
                }`}
              >
                {semDept.map((tarefa) => (
                  <KanbanCard
                    key={tarefa.id}
                    tarefa={tarefa}
                    isDragging={draggingId === tarefa.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ── Card component ─────────────────────────────────────────────────────────────

function KanbanCard({
  tarefa,
  isDragging,
  onDragStart,
  onDragEnd,
}: {
  tarefa: TarefaDB;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  const status = STATUS_CONFIG[tarefa.status] ?? STATUS_CONFIG["planejamento"];
  const atrasada = isAtrasada(tarefa);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, tarefa.id)}
      onDragEnd={onDragEnd}
      className={`transition-all ${isDragging ? "opacity-40 scale-95" : ""}`}
    >
      <Link to={`/tarefas/${tarefa.id}`}>
        <div className="bg-rise-surface border border-rise-line-2 rounded-xl p-4 hover:border-rise-line-3 transition-all cursor-grab active:cursor-grabbing group">

          {/* Status badge */}
          <div className="flex items-center justify-between mb-2.5">
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${status.color}18`, color: status.color }}
            >
              {status.label}
            </span>
            {tarefa.prioridade === "alta" && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PRIORIDADE_COLOR[tarefa.prioridade] }}
              />
            )}
          </div>

          {/* Título */}
          <h4 className="text-rise-fg text-[13px] font-semibold leading-snug mb-3 group-hover:text-[#14E9BC] transition-colors line-clamp-2">
            {tarefa.titulo}
          </h4>

          {/* Progresso */}
          {tarefa.progresso !== undefined && tarefa.progresso > 0 && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-rise-fg-4 text-[10px]">Progresso</span>
                <span className="text-[#14E9BC] text-[10px] font-semibold">{tarefa.progresso}%</span>
              </div>
              <div className="w-full bg-rise-raised rounded-full h-1">
                <div
                  className="bg-[#14E9BC] h-1 rounded-full"
                  style={{ width: `${tarefa.progresso}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2.5 border-t border-rise-raised">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#14E9BC]/15 flex items-center justify-center">
                <span className="text-[#14E9BC] text-[9px] font-bold">
                  {tarefa.responsavel?.nome?.charAt(0) ?? "?"}
                </span>
              </div>
              <span className="text-rise-fg-3 text-[11px]">
                {tarefa.responsavel?.nome?.split(" ")[0] ?? "—"}
              </span>
            </div>
            {tarefa.prazo && (
              <span
                className={`text-[10px] font-medium ${atrasada ? "text-[#ec5d5e]" : "text-rise-fg-3"}`}
              >
                {atrasada ? "⚠ " : ""}{formatarData(tarefa.prazo)}
              </span>
            )}
          </div>

        </div>
      </Link>
    </div>
  );
}
