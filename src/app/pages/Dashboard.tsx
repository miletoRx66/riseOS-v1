import { useState, useEffect } from "react";
import { MetricCard } from "../components/common/MetricCard";
import { getTarefas, type TarefaDB } from "../../lib/services/tarefas";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { TaskCard } from "../components/common/TaskCard";
import { FileText, TrendingUp, Building2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { usuario } = useAuth();
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    const filtro = usuario.isAdmin ? {} : { departamento_id: usuario.departamento };
    Promise.all([getTarefas(filtro), getDepartamentos()])
      .then(([t, d]) => {
        setTarefas(t);
        setDepartamentos(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [usuario?.id, usuario?.isAdmin, usuario?.departamento]);

  // KPIs calculados a partir de dados reais
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.status === "concluido").length;
  const emAndamento = tarefas.filter((t) => t.status === "em-andamento").length;
  const atrasadas = tarefas.filter((t) => {
    if (!t.prazo || t.status === "concluido") return false;
    return new Date(t.prazo) < new Date();
  }).length;
  const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;

  const recentTasks = tarefas.filter((t) => t.status === "em-andamento").slice(0, 4);

  return (
    <div className="min-h-screen bg-rise-bg px-4 py-6 sm:px-6 sm:py-8 lg:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[24px] sm:text-[32px] mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px] sm:text-[16px]">
            Visão geral do sistema administrativo Rise
          </p>
        </div>

        {/* KPIs Reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Total de Tarefas"
            value={loading ? "—" : total}
            variation="Total cadastradas no sistema"
            isPositive={true}
          />
          <MetricCard
            title="Taxa de Conclusão"
            value={loading ? "—" : `${taxaConclusao}%`}
            variation={`${concluidas} de ${total} concluídas`}
            isPositive={taxaConclusao >= 50}
            gradient={true}
          />
          <MetricCard
            title="Em Andamento"
            value={loading ? "—" : emAndamento}
            variation="Tarefas sendo executadas"
            isPositive={true}
          />
          <MetricCard
            title="Atrasadas"
            value={loading ? "—" : atrasadas}
            variation="Prazo vencido e não concluídas"
            isPositive={atrasadas === 0}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/tarefas"
            className="bg-rise-surface border border-rise-line rounded-lg p-6 hover:border-rise-fg-4 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#28d939]/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-[#28d939]" />
              </div>
              <div>
                <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                  Tarefas Ativas
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
                  {loading ? "—" : tarefas.filter((t) => t.status !== "concluido").length}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/tarefas"
            className="bg-rise-surface border border-rise-line rounded-lg p-6 hover:border-rise-fg-4 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#14E9BC]/20 rounded-lg flex items-center justify-center">
                <CheckCircle size={24} className="text-[#14E9BC]" />
              </div>
              <div>
                <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                  Concluídas
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
                  {loading ? "—" : concluidas}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/departamentos"
            className="bg-rise-surface border border-rise-line rounded-lg p-6 hover:border-rise-fg-4 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6B8AFF]/20 rounded-lg flex items-center justify-center">
                <Building2 size={24} className="text-[#6B8AFF]" />
              </div>
              <div>
                <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                  Departamentos
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
                  {loading ? "—" : departamentos.length}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Distribuição por Status */}
        {!loading && total > 0 && (
          <div className="bg-rise-surface border border-rise-line rounded-lg p-6 mb-8">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px] mb-4">
              Distribuição por Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Planejamento", status: "planejamento", color: "#6B8AFF", icon: Clock },
                { label: "Em Andamento", status: "em-andamento", color: "#28d939", icon: TrendingUp },
                { label: "Concluído", status: "concluido", color: "#14E9BC", icon: CheckCircle },
                { label: "Atrasadas", status: "_atrasadas", color: "#ff6b6b", icon: AlertCircle },
              ].map(({ label, status, color, icon: Icon }) => {
                const count = status === "_atrasadas"
                  ? atrasadas
                  : tarefas.filter((t) => t.status === status).length;
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={status} className="bg-rise-raised rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon size={16} style={{ color }} />
                      <span className="text-rise-fg-2 text-[13px] font-['Inter:Medium',sans-serif]">
                        {label}
                      </span>
                    </div>
                    <p className="text-rise-fg text-[24px] font-['Inter:Bold',sans-serif]">{count}</p>
                    <div className="mt-2 w-full bg-rise-line rounded-full h-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                    <p className="text-rise-fg-4 text-[11px] mt-1 font-['Inter:Regular',sans-serif]">
                      {pct}% do total
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tarefas em Andamento + Links Rápidos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tarefas em andamento */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px]">
                Tarefas em Andamento
              </h2>
              <Link to="/tarefas" className="font-['Inter:Medium',sans-serif] text-[#14E9BC] text-[14px] hover:underline">
                Ver todas
              </Link>
            </div>
            {loading ? (
              <div className="bg-rise-surface border border-rise-line rounded-lg p-8 text-center">
                <p className="text-rise-fg-4 text-[14px]">Carregando...</p>
              </div>
            ) : recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task) => {
                  const dept = departamentos.find((d) => d.id === task.departamento_id);
                  return (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      titulo={task.titulo}
                      departamento={dept?.nome ?? task.departamento_id}
                      status={task.status}
                      prioridade={task.prioridade}
                      responsavel={task.responsavel?.nome ?? "—"}
                      prazo={task.prazo ?? ""}
                      descricao={task.descricao ?? undefined}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="bg-rise-surface border border-rise-line rounded-lg p-8 text-center">
                <p className="text-rise-fg-4 text-[14px] font-['Inter:Regular',sans-serif]">
                  Nenhuma tarefa em andamento
                </p>
              </div>
            )}
          </div>

          {/* Links rápidos / Conteúdos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px]">
                Conteúdos em Destaque
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Tarefas", icon: TrendingUp, color: "#28d939", to: "/tarefas", desc: "Gerenciar tarefas" },
                { label: "OKRs", icon: CheckCircle, color: "#14E9BC", to: "/okrs", desc: "Objetivos e resultados" },
                { label: "Relatórios", icon: FileText, color: "#6B8AFF", to: "/relatorios", desc: "Análises e métricas" },
                { label: "Departamentos", icon: Building2, color: "#E879F9", to: "/departamentos", desc: "Gestão de times" },
              ].map(({ label, icon: Icon, color, to, desc }) => (
                <Link
                  key={label}
                  to={to}
                  className="bg-rise-surface border border-rise-line rounded-lg p-4 hover:border-rise-fg-4 transition-all group"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon size={20} style={{ color }} />
                  </div>
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] group-hover:text-[#14E9BC] transition-colors">
                    {label}
                  </p>
                  <p className="text-rise-fg-4 text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                    {desc}
                  </p>
                </Link>
              ))}
            </div>

            {/* Governança */}
            <a
              href="https://rise-finance-2.gitbook.io/rise-l-internal/93hIPck7wPVGbXmFrkis"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-3 bg-rise-surface border border-rise-line rounded-lg p-4 hover:border-[#14E9BC] transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/10 flex items-center justify-center text-[20px]">
                📋
              </div>
              <div>
                <p className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] group-hover:text-[#14E9BC] transition-colors">
                  Governança
                </p>
                <p className="text-rise-fg-4 text-[12px] font-['Inter:Regular',sans-serif]">
                  Documentação interna · GitBook
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
