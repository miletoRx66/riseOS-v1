import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getDepartamentosComStats, type DepartamentoComStats } from "../../lib/services/departamentos";
import { getTarefas, type TarefaDB } from "../../lib/services/tarefas";
import { getOkrs, type OkrDB } from "../../lib/services/okrs";
import { ArrowLeft, TrendingUp, Users, FileText, CheckCircle2, Clock, Target, Download } from "lucide-react";
import { exportarRelatorioDepartamento } from "../utils/pdfGenerator";

export default function RelatorioDepartamento() {
  const { id } = useParams<{ id: string }>();
  const [dept, setDept] = useState<DepartamentoComStats | null>(null);
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [okrs, setOkrs] = useState<OkrDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportando, setExportando] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getDepartamentosComStats(),
      getTarefas({ departamento_id: id }),
      getOkrs(id),
    ])
      .then(([depts, t, o]) => {
        setDept(depts.find((d) => d.id === id) ?? null);
        setTarefas(t);
        setOkrs(o);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleExportar = () => {
    if (!id || !dept) return;
    setExportando(true);
    setTimeout(() => {
      exportarRelatorioDepartamento(id, dept, tarefas, okrs);
      setExportando(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-[#bdbdbd] text-[16px]">Carregando...</p>
      </div>
    );
  }

  if (!dept) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px] mb-4">
            Departamento não encontrado
          </h1>
          <Link
            to="/relatorios"
            className="text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif]"
          >
            Voltar para Relatórios
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = tarefas.filter((t) => t.status === "concluido").length;
  const inProgressTasks = tarefas.filter((t) => t.status === "em-andamento").length;
  const plannedTasks = tarefas.filter((t) => t.status === "planejamento").length;
  const completionRate = tarefas.length > 0 ? ((completedTasks / tarefas.length) * 100).toFixed(1) : "0";

  // Principal OKR para exibição (primeiro da lista)
  const principalOkr = okrs[0] ?? null;

  // Dados de tendência mensal (mock fixo — sem tabela de histórico)
  const monthlyTrend = [
    { mes: "Set", valor: 45 },
    { mes: "Out", valor: 52 },
    { mes: "Nov", valor: 48 },
    { mes: "Dez", valor: 61 },
    { mes: "Jan", valor: 58 },
    { mes: "Fev", atual: true, valor: parseInt(completionRate) },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/relatorios"
            className="inline-flex items-center gap-2 text-[#bdbdbd] hover:text-[#14E9BC] font-['Inter:Medium',sans-serif] text-[14px] mb-4 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para Relatórios
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${dept.cor}20`, color: dept.cor }}
              >
                <span className="font-['Inter:Bold',sans-serif] text-[24px]">
                  {dept.nome[0]}
                </span>
              </div>
              <div>
                <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px]">
                  Relatório - {dept.nome}
                </h1>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
                  Análise detalhada de performance e métricas
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px] mb-1">
                  Período de análise
                </p>
                <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                  Último mês
                </p>
              </div>
              <button
                onClick={handleExportar}
                disabled={exportando}
                className="bg-[#14E9BC] text-[#000] px-5 py-2.5 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download size={18} />
                {exportando ? "Gerando PDF..." : "Exportar Relatório"}
              </button>
            </div>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${dept.cor}15` }}
              >
                <Users size={20} style={{ color: dept.cor }} />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Membros
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {dept.membros}
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${dept.cor}15` }}
              >
                <CheckCircle2 size={20} style={{ color: dept.cor }} />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Taxa de Conclusão
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px] mb-1">
              {completionRate}%
            </p>
            <div className="flex items-center gap-1 text-[#28d939]">
              <TrendingUp size={14} />
              <span className="font-['Inter:Regular',sans-serif] text-[12px]">
                +8% vs mês anterior
              </span>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${dept.cor}15` }}
              >
                <Clock size={20} style={{ color: dept.cor }} />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Tarefas Ativas
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {tarefas.length - completedTasks}
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${dept.cor}15` }}
              >
                <FileText size={20} style={{ color: dept.cor }} />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Documentos
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {dept.documentos}
            </p>
          </div>
        </div>

        {/* OKR Principal e Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* OKR Principal */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6 flex items-center gap-2">
              <Target size={20} style={{ color: dept.cor }} />
              OKR Principal
            </h2>
            {principalOkr ? (
              <>
                <div className="mb-6">
                  <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                    Objetivo
                  </p>
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[20px] mb-4">
                    {principalOkr.titulo}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-[#1a1a1a] rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${principalOkr.progresso}%`,
                          backgroundColor: dept.cor,
                        }}
                      />
                    </div>
                    <span className="font-['Inter:Bold',sans-serif] text-[#eee] text-[18px]">
                      {principalOkr.progresso}%
                    </span>
                  </div>
                </div>
                {principalOkr.key_results && principalOkr.key_results.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] uppercase tracking-wider">
                      Key Results
                    </p>
                    {principalOkr.key_results.map((kr) => (
                      <div key={kr.id} className="border-l-2 pl-4" style={{ borderColor: dept.cor }}>
                        <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                          {kr.descricao}
                        </p>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
                            {kr.valor_atual} / {kr.valor_meta} {kr.unidade}
                          </span>
                          <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[12px]">
                            {kr.progresso}%
                          </span>
                        </div>
                        <div className="w-full bg-[#1a1a1a] rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${kr.progresso}%`,
                              backgroundColor: dept.cor,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-[#666] font-['Inter:Regular',sans-serif] text-[14px]">
                Nenhum OKR cadastrado para este departamento.
              </p>
            )}
          </div>

          {/* Distribuição de Status */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6">
              Status das Tarefas
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#6B8AFF]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                      Planejamento
                    </span>
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    {plannedTasks} tarefas
                  </span>
                </div>
                <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                  <div
                    className="bg-[#6B8AFF] h-2 rounded-full"
                    style={{ width: tarefas.length > 0 ? `${(plannedTasks / tarefas.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#28d939]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                      Em Andamento
                    </span>
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    {inProgressTasks} tarefas
                  </span>
                </div>
                <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                  <div
                    className="bg-[#28d939] h-2 rounded-full"
                    style={{ width: tarefas.length > 0 ? `${(inProgressTasks / tarefas.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#bdbdbd]" />
                    <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                      Concluído
                    </span>
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    {completedTasks} tarefas
                  </span>
                </div>
                <div className="w-full bg-[#1a1a1a] rounded-full h-2">
                  <div
                    className="bg-[#bdbdbd] h-2 rounded-full"
                    style={{ width: tarefas.length > 0 ? `${(completedTasks / tarefas.length) * 100}%` : "0%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tendência Mensal */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 mb-8">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6">
            Tendência de Conclusão (6 meses)
          </h2>
          <div className="flex items-end gap-4 h-[200px]">
            {monthlyTrend.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="flex-1 flex items-end w-full">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      height: `${item.valor}%`,
                      backgroundColor: item.atual ? dept.cor : `${dept.cor}40`,
                    }}
                  />
                </div>
                <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mt-2">
                  {item.mes}
                </p>
                <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[11px]">
                  {item.valor}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tarefas Recentes */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6">
            Tarefas Recentes
          </h2>
          {tarefas.length > 0 ? (
            <div className="space-y-3">
              {tarefas.slice(0, 5).map((tarefa) => (
                <Link
                  key={tarefa.id}
                  to={`/tarefas/${tarefa.id}`}
                  className="flex items-center justify-between p-4 border border-[#333] rounded-lg hover:border-[#555] hover:bg-[#1a1a1a] transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor:
                          tarefa.status === "concluido"
                            ? "#bdbdbd"
                            : tarefa.status === "em-andamento"
                            ? "#28d939"
                            : "#6B8AFF",
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] group-hover:text-[#14E9BC] transition-colors">
                        {tarefa.titulo}
                      </h3>
                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px] mt-1">
                        {tarefa.responsavel?.nome ?? "—"} • Prazo:{" "}
                        {tarefa.prazo ? new Date(tarefa.prazo).toLocaleDateString("pt-BR") : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-['Inter:Medium',sans-serif] ${
                        tarefa.prioridade === "alta"
                          ? "bg-[#ec5d5e]/20 text-[#ec5d5e]"
                          : tarefa.prioridade === "media"
                          ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                          : "bg-[#6B8AFF]/20 text-[#6B8AFF]"
                      }`}
                    >
                      {tarefa.prioridade === "alta" ? "Alta" : tarefa.prioridade === "media" ? "Média" : "Baixa"}
                    </span>
                    <div className="w-16">
                      <div className="flex items-center justify-end gap-1 mb-1">
                        <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[12px]">
                          {tarefa.progresso ?? 0}%
                        </span>
                      </div>
                      <div className="w-full bg-[#1a1a1a] rounded-full h-1">
                        <div
                          className="h-1 rounded-full"
                          style={{ width: `${tarefa.progresso ?? 0}%`, backgroundColor: dept.cor }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-[#666] font-['Inter:Regular',sans-serif] text-[14px]">
              Nenhuma tarefa encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
