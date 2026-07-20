import { useState, useEffect } from "react";
import { Link } from "react-router";

import { getDepartamentosComStats, type DepartamentoComStats } from "../../lib/services/departamentos";
import { getTarefas, type TarefaDB } from "../../lib/services/tarefas";
import { getOkrs, type OkrDB } from "../../lib/services/okrs";
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  Clock,
  FileText,
  Users,
  ArrowRight,
} from "lucide-react";
import { exportarRelatorioGeral } from "../utils/pdfGenerator";

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("mes");
  const [exportando, setExportando] = useState(false);
  const [departamentos, setDepartamentos] = useState<DepartamentoComStats[]>([]);
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [okrs, setOkrs] = useState<OkrDB[]>([]);

  useEffect(() => {
    getDepartamentosComStats().then(setDepartamentos).catch(console.error);
    getTarefas().then(setTarefas).catch(console.error);
    getOkrs().then(setOkrs).catch(console.error);
  }, []);

  const handleExportar = () => {
    setExportando(true);
    setTimeout(() => {
      exportarRelatorioGeral(departamentos, tarefas, okrs);
      setExportando(false);
    }, 500);
  };

  const getStatusDistribution = () => {
    const planejamento = tarefas.filter((t) => t.status === "planejamento").length;
    const emAndamento = tarefas.filter((t) => t.status === "em-andamento").length;
    const concluido = tarefas.filter((t) => t.status === "concluido").length;
    const total = tarefas.length;

    return {
      planejamento: ((planejamento / total) * 100).toFixed(1),
      emAndamento: ((emAndamento / total) * 100).toFixed(1),
      concluido: ((concluido / total) * 100).toFixed(1),
    };
  };

  const statusDist = getStatusDistribution();

  const getDeptPerformance = () => {
    return departamentos.map((dept) => {
      const deptTasks = tarefas.filter((t) => t.departamento_id === dept.id);
      const completed = deptTasks.filter((t) => t.status === "concluido").length;
      const total = deptTasks.length;
      const completion = total > 0 ? ((completed / total) * 100).toFixed(1) : "0";

      return {
        ...dept,
        completion,
        trend: Math.random() > 0.5 ? "up" : Math.random() > 0.3 ? "down" : "stable",
      };
    });
  };

  const deptPerformance = getDeptPerformance();

  // Calcular métricas consolidadas
  const totalTarefas = tarefas.length;
  const tarefasConcluidas = tarefas.filter((t) => t.status === "concluido").length;
  const tarefasAtivas = totalTarefas - tarefasConcluidas;
  const totalDocumentos = departamentos.reduce((acc, d) => acc + d.documentos, 0);
  const totalMembros = departamentos.reduce((acc, d) => acc + d.membros, 0);
  const mediaMembros = (totalMembros / departamentos.length).toFixed(0);

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px] mb-2">
              Relatórios Consolidados
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[16px]">
              Análise de performance e insights estratégicos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="semana">Última Semana</option>
              <option value="mes">Último Mês</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="ano">Último Ano</option>
            </select>
            <button
              onClick={handleExportar}
              disabled={exportando}
              className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={20} />
              {exportando ? "Gerando PDF..." : "Exportar Relatório"}
            </button>
          </div>
        </div>

        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-rise-surface border border-rise-line rounded-xl p-6 hover:border-[#14E9BC]/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#28d93915" }}
              >
                <CheckCircle2 size={24} className="text-[#28d939]" />
              </div>
              <div className="flex items-center gap-1 text-[#28d939] text-[12px] font-['Inter:Medium',sans-serif]">
                <TrendingUp size={14} />
                +12%
              </div>
            </div>
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[13px] mb-2">
              Taxa de Conclusão
            </p>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[32px]">
              {statusDist.concluido}%
            </p>
          </div>

          <div className="bg-rise-surface border border-rise-line rounded-xl p-6 hover:border-[#14E9BC]/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#14E9BC15" }}
              >
                <Clock size={24} className="text-[#14E9BC]" />
              </div>
            </div>
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[13px] mb-2">
              Tarefas Ativas
            </p>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[32px] mb-1">
              {tarefasAtivas}
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
              {departamentos.length} departamentos
            </p>
          </div>

          <div className="bg-rise-surface border border-rise-line rounded-xl p-6 hover:border-[#14E9BC]/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#6B8AFF15" }}
              >
                <Users size={24} className="text-[#6B8AFF]" />
              </div>
            </div>
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[13px] mb-2">
              Total de Membros
            </p>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[32px] mb-1">
              {totalMembros}
            </p>
            <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
              Média: {mediaMembros}/dept
            </p>
          </div>

          <div className="bg-rise-surface border border-rise-line rounded-xl p-6 hover:border-[#14E9BC]/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#E879F915" }}
              >
                <FileText size={24} className="text-[#E879F9]" />
              </div>
              <div className="flex items-center gap-1 text-[#28d939] text-[12px] font-['Inter:Medium',sans-serif]">
                <TrendingUp size={14} />
                +8%
              </div>
            </div>
            <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[13px] mb-2">
              Documentos Totais
            </p>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[32px]">
              {totalDocumentos}
            </p>
          </div>
        </div>

        {/* Dashboards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance por Departamento */}
          <div className="bg-rise-surface border border-rise-line rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[18px] flex items-center gap-2">
                <BarChart3 size={20} className="text-[#14E9BC]" />
                Performance por Departamento
              </h2>
            </div>
            <div className="space-y-5">
              {deptPerformance.map((dept) => {
                const TrendIcon =
                  dept.trend === "up" ? TrendingUp : dept.trend === "down" ? TrendingDown : null;
                const trendColor =
                  dept.trend === "up" ? "#28d939" : dept.trend === "down" ? "#ec5d5e" : "#bdbdbd";

                return (
                  <div key={dept.id} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${dept.cor}20` }}
                        >
                          <span
                            className="font-['Inter:Semi_Bold',sans-serif] text-[14px]"
                            style={{ color: dept.cor }}
                          >
                            {dept.nome[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
                            {dept.nome}
                          </p>
                          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
                            {dept.membros} membros
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                          {dept.completion}%
                        </span>
                        {TrendIcon && <TrendIcon size={16} style={{ color: trendColor }} />}
                      </div>
                    </div>
                    <div className="w-full bg-rise-raised rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${dept.completion}%`, backgroundColor: dept.cor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Distribuição de Status */}
          <div className="bg-rise-surface border border-rise-line rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[18px] flex items-center gap-2">
                <Target size={20} className="text-[#14E9BC]" />
                Distribuição de Status
              </h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#6B8AFF]" />
                    <span className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
                      Planejamento
                    </span>
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    {statusDist.planejamento}%
                  </span>
                </div>
                <div className="w-full bg-rise-raised rounded-full h-3">
                  <div
                    className="bg-[#6B8AFF] h-3 rounded-full transition-all"
                    style={{ width: `${statusDist.planejamento}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#28d939]" />
                    <span className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
                      Em Andamento
                    </span>
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    {statusDist.emAndamento}%
                  </span>
                </div>
                <div className="w-full bg-rise-raised rounded-full h-3">
                  <div
                    className="bg-[#28d939] h-3 rounded-full transition-all"
                    style={{ width: `${statusDist.emAndamento}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#bdbdbd]" />
                    <span className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
                      Concluído
                    </span>
                  </div>
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                    {statusDist.concluido}%
                  </span>
                </div>
                <div className="w-full bg-rise-raised rounded-full h-3">
                  <div
                    className="bg-[#bdbdbd] h-3 rounded-full transition-all"
                    style={{ width: `${statusDist.concluido}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Estratégicos */}
        <div className="bg-rise-surface border border-rise-line rounded-xl p-6 mb-8">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[18px] mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-[#14E9BC]" />
            Insights Estratégicos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-1 bg-[#28d939] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] mb-2">
                  Performance Acima da Meta
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px] leading-relaxed">
                  Taxa de conclusão está 12% acima do período anterior, indicando melhora
                  significativa na produtividade geral dos times.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1 bg-[#14E9BC] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] mb-2">
                  Destaque em OKRs
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px] leading-relaxed">
                  Departamento de Produto lidera com 91% de progresso, seguido por Comercial (82%)
                  e Marketing (78%).
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1 bg-[#6B8AFF] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] mb-2">
                  Automação em Progresso
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px] leading-relaxed">
                  Operações está implementando processos de automação que devem impactar
                  positivamente os próximos trimestres.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1 bg-[#E879F9] rounded-full flex-shrink-0" />
              <div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] mb-2">
                  Foco em Execução
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px] leading-relaxed">
                  Recomenda-se manter o foco na execução de tarefas críticas para atingir as metas
                  de Q1 2026.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Relatórios por Departamento */}
        <div className="bg-rise-surface border border-rise-line rounded-xl p-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px] mb-6">
            Relatórios Detalhados por Departamento
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departamentos.map((dept) => {
              const deptTasksCount = tarefas.filter((t) => t.departamento_id === dept.id).length;

              return (
                <Link
                  key={dept.id}
                  to={`/relatorio/${dept.id}`}
                  className="block border border-rise-line rounded-xl p-5 hover:border-[#14E9BC] hover:bg-[#14E9BC]/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${dept.cor}20` }}
                    >
                      <span
                        className="font-['Inter:Semi_Bold',sans-serif] text-[16px]"
                        style={{ color: dept.cor }}
                      >
                        {dept.nome[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px] group-hover:text-[#14E9BC] transition-colors">
                        {dept.nome}
                      </h3>
                      <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
                        {dept.membros} membros
                      </p>
                    </div>
                    <ArrowRight
                      size={20}
                      className="text-rise-fg-4 group-hover:text-[#14E9BC] transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[11px] mb-1 uppercase tracking-wider">
                        Tarefas
                      </p>
                      <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[20px]">
                        {deptTasksCount}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
