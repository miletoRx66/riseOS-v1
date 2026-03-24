import { useParams, Link } from "react-router";
import { departamentos, kpisDepartamento, tarefas } from "../data/mockData";
import { ArrowLeft, TrendingUp, TrendingDown, Users, FileText, CheckCircle2, Clock, Target, BarChart3, Download } from "lucide-react";
import { exportarRelatorioDepartamento } from "../utils/pdfGenerator";
import { useState } from "react";

export default function RelatorioDepartamento() {
  const { id } = useParams<{ id: string }>();
  const dept = departamentos.find((d) => d.id === id);
  const [exportando, setExportando] = useState(false);

  const handleExportar = () => {
    if (!id) return;
    setExportando(true);
    setTimeout(() => {
      exportarRelatorioDepartamento(id);
      setExportando(false);
    }, 500);
  };

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

  const kpis = kpisDepartamento[dept.id as keyof typeof kpisDepartamento];
  const deptTasks = tarefas.filter((t) => t.departamento === dept.id);
  const completedTasks = deptTasks.filter((t) => t.status === "concluido").length;
  const inProgressTasks = deptTasks.filter((t) => t.status === "em-andamento").length;
  const plannedTasks = deptTasks.filter((t) => t.status === "planejamento").length;
  const completionRate = deptTasks.length > 0 ? ((completedTasks / deptTasks.length) * 100).toFixed(1) : "0";

  // OKRs por departamento
  const okrsData: Record<string, { objetivo: string; progresso: number; keyResults: { descricao: string; meta: string; atual: string; progresso: number }[] }> = {
    marketing: {
      objetivo: "Aumentar Brand Awareness",
      progresso: 78,
      keyResults: [
        { descricao: "Alcançar 100k seguidores nas redes sociais", meta: "100k", atual: "78k", progresso: 78 },
        { descricao: "Gerar 500 leads qualificados/mês", meta: "500", atual: "420", progresso: 84 },
        { descricao: "Taxa de conversão de 15%", meta: "15%", atual: "12.8%", progresso: 85 },
      ],
    },
    ops: {
      objetivo: "Otimizar Processos Internos",
      progresso: 65,
      keyResults: [
        { descricao: "Reduzir tempo médio de processo em 30%", meta: "30%", atual: "19.5%", progresso: 65 },
        { descricao: "Aumentar eficiência operacional para 95%", meta: "95%", atual: "89.4%", progresso: 94 },
        { descricao: "Automatizar 80% dos relatórios", meta: "80%", atual: "48%", progresso: 60 },
      ],
    },
    comercial: {
      objetivo: "Expandir Base de Parceiros",
      progresso: 82,
      keyResults: [
        { descricao: "Fechar 50 novas parcerias B2B", meta: "50", atual: "41", progresso: 82 },
        { descricao: "Aumentar receita recorrente em 40%", meta: "40%", atual: "35%", progresso: 88 },
        { descricao: "Manter health score médio acima de 85", meta: "85", atual: "87", progresso: 100 },
      ],
    },
    produto: {
      objetivo: "Lançar 3 Features Principais",
      progresso: 91,
      keyResults: [
        { descricao: "Concluir Feature A - Dashboard Analytics", meta: "100%", atual: "100%", progresso: 100 },
        { descricao: "Concluir Feature B - Integração API", meta: "100%", atual: "95%", progresso: 95 },
        { descricao: "Concluir Feature C - Mobile App", meta: "100%", atual: "78%", progresso: 78 },
      ],
    },
  };

  const okr = okrsData[dept.id as keyof typeof okrsData];

  // Dados de tendência mensal (mock)
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
              {deptTasks.length - completedTasks}
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

        {/* KPIs e OKR */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* KPIs Específicos */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6 flex items-center gap-2">
              <BarChart3 size={20} style={{ color: dept.cor }} />
              KPIs Específicos
            </h2>
            <div className="space-y-6">
              {kpis && Object.entries(kpis).map(([key, value], index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                      {key}
                    </p>
                    {index === 0 && (
                      <div className="flex items-center gap-1 text-[#28d939]">
                        <TrendingUp size={14} />
                        <span className="font-['Inter:Regular',sans-serif] text-[12px]">+12%</span>
                      </div>
                    )}
                    {index === 1 && (
                      <div className="flex items-center gap-1 text-[#ec5d5e]">
                        <TrendingDown size={14} />
                        <span className="font-['Inter:Regular',sans-serif] text-[12px]">-3%</span>
                      </div>
                    )}
                  </div>
                  <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[32px]">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* OKR Principal */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6 flex items-center gap-2">
              <Target size={20} style={{ color: dept.cor }} />
              OKR Principal - Q1 2026
            </h2>
            <div className="mb-6">
              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                Objetivo
              </p>
              <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[20px] mb-4">
                {okr.objetivo}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-[#1a1a1a] rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{
                      width: `${okr.progresso}%`,
                      backgroundColor: dept.cor,
                    }}
                  />
                </div>
                <span className="font-['Inter:Bold',sans-serif] text-[#eee] text-[18px]">
                  {okr.progresso}%
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] uppercase tracking-wider">
                Key Results
              </p>
              {okr.keyResults.map((kr, index) => (
                <div key={index} className="border-l-2 pl-4" style={{ borderColor: dept.cor }}>
                  <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    {kr.descricao}
                  </p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
                      {kr.atual} / {kr.meta}
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
          </div>
        </div>

        {/* Tendência e Status das Tarefas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tendência Mensal */}
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
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
                    style={{ width: `${(plannedTasks / deptTasks.length) * 100}%` }}
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
                    style={{ width: `${(inProgressTasks / deptTasks.length) * 100}%` }}
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
                    style={{ width: `${(completedTasks / deptTasks.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarefas Recentes */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[18px] mb-6">
            Tarefas Recentes
          </h2>
          <div className="space-y-3">
            {deptTasks.slice(0, 5).map((tarefa) => (
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
                      {tarefa.responsavel} • Prazo: {new Date(tarefa.prazo).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
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
                  </div>
                  <div className="w-16">
                    <div className="flex items-center justify-end gap-1 mb-1">
                      <span className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[12px]">
                        {tarefa.progresso}%
                      </span>
                    </div>
                    <div className="w-full bg-[#1a1a1a] rounded-full h-1">
                      <div
                        className="h-1 rounded-full"
                        style={{ width: `${tarefa.progresso}%`, backgroundColor: dept.cor }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}