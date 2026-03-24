import { useParams, Link } from "react-router";
import { departamentos, tarefas, documentos, kpisDepartamento, okrs } from "../data/mockData";
import { ArrowLeft, Users, CheckSquare, FileText, TrendingUp, Target, Calendar, User } from "lucide-react";
import { TaskCard } from "../components/common/TaskCard";
import { ParceirosB2B } from "../components/common/ParceirosB2B";
import DepartamentoFinanceiro from "./DepartamentoFinanceiro";

export default function DepartamentoDetail() {
  const { id } = useParams();
  
  // Se for o departamento financeiro, renderizar o componente especial
  if (id === "financeiro") {
    return <DepartamentoFinanceiro />;
  }
  
  const departamento = departamentos.find((d) => d.id === id);

  if (!departamento) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-[#bdbdbd] text-[18px]">Departamento não encontrado</p>
      </div>
    );
  }

  const deptTasks = tarefas.filter((t) => t.departamento === id);
  const deptDocs = documentos.filter((d) => d.departamento === id);
  const kpis = kpisDepartamento[id as keyof typeof kpisDepartamento];

  // Filtrar OKRs do departamento
  const deptOkrs = okrs.filter((okr) => okr.departamento === id);

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderKPIs = () => {
    if (!kpis) return null;

    const kpiEntries = Object.entries(kpis);
    const kpiLabels: Record<string, string> = {
      // Marketing
      leads: "Leads Gerados",
      conversao: "Taxa de Conversão",
      roi: "ROI",
      engajamento: "Engajamento",
      // Ops
      eficiencia: "Eficiência",
      tempoMedio: "Tempo Médio (h)",
      satisfacao: "Satisfação",
      automacao: "Automação",
      // Comercial
      vendas: "Vendas (R$)",
      ticket: "Ticket Médio (R$)",
      pipeline: "Pipeline (R$)",
      // Produto
      usuarios: "Usuários Ativos",
      retencao: "Retenção",
      nps: "NPS",
      features: "Features Lançadas",
    };

    return kpiEntries.map(([key, value]) => {
      const label = kpiLabels[key] || key;
      let displayValue = value;

      if (key === "vendas" || key === "pipeline") {
        displayValue = `R$ ${Number(value).toLocaleString('pt-BR')}`;
      } else if (key === "ticket") {
        displayValue = `R$ ${Number(value).toLocaleString('pt-BR')}`;
      } else if (key === "conversao" || key === "eficiencia" || key === "retencao") {
        displayValue = `${value}%`;
      } else if (key === "roi") {
        displayValue = `${value}x`;
      } else if (key === "automacao") {
        displayValue = `${value}%`;
      }

      return (
        <div key={key} className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4">
          <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
            {label}
          </p>
          <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
            {displayValue}
          </p>
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/departamentos"
            className="flex items-center gap-2 text-[#14E9BC] hover:underline mb-4 font-['Inter:Medium',sans-serif] text-[14px]"
          >
            <ArrowLeft size={16} />
            Voltar para Departamentos
          </Link>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center text-[32px]"
              style={{ backgroundColor: `${departamento.cor}20`, color: departamento.cor }}
            >
              {departamento.nome[0]}
            </div>
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px]">
                {departamento.nome}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-[#bdbdbd]">
                  <Users size={16} />
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                    {departamento.membros} membros
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#bdbdbd]">
                  <CheckSquare size={16} />
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                    {departamento.tarefasAbertas} tarefas
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[#bdbdbd]">
                  <FileText size={16} />
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                    {departamento.documentos} documentos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        {kpis && (
          <div className="mb-8">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px] mb-4">
              KPIs do Departamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderKPIs()}
            </div>
          </div>
        )}

        {/* OKRs do Departamento */}
        {deptOkrs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px] flex items-center gap-2">
                <Target size={24} />
                OKRs do Departamento
              </h2>
              <Link
                to="/okrs"
                className="text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif] text-[14px]"
              >
                Ver todos os OKRs
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {deptOkrs.map((okr) => (
                <Link key={okr.id} to="/okrs" className="block">
                  <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#14E9BC] transition-all cursor-pointer">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-2">
                          {okr.titulo}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-[#bdbdbd] text-[13px] font-['Inter:Regular',sans-serif]">
                            {okr.periodo}
                          </span>
                          <span className="text-[#666]">•</span>
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-[#666]" />
                            <span className="text-[#bdbdbd] text-[13px] font-['Inter:Regular',sans-serif]">
                              {okr.responsavel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-[#14E9BC] text-[28px] font-['Inter:Bold',sans-serif]">
                          {okr.progresso}%
                        </p>
                        <p className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                          progresso
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#14E9BC] h-full rounded-full transition-all duration-500"
                          style={{ width: `${okr.progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Results */}
                    {okr.keyResults && okr.keyResults.length > 0 && (
                      <div className="space-y-3 mb-4 pb-4 border-b border-[#333]">
                        <p className="text-[#bdbdbd] text-[12px] font-['Inter:Medium',sans-serif] uppercase tracking-wide">
                          Key Results
                        </p>
                        {okr.keyResults.map((kr) => (
                          <div key={kr.id} className="bg-[#1a1a1a] rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-[#eee] text-[13px] font-['Inter:Regular',sans-serif] flex-1 pr-2">
                                {kr.descricao}
                              </p>
                              <span className="text-[#28d939] text-[14px] font-['Inter:Semi_Bold',sans-serif] whitespace-nowrap">
                                {kr.progresso}%
                              </span>
                            </div>
                            <div className="w-full bg-[#0f0f0f] rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#28d939] h-full rounded-full transition-all duration-500"
                                style={{ width: `${kr.progresso}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                                {kr.metrica}
                              </p>
                              <p className="text-[#bdbdbd] text-[11px] font-['Inter:Regular',sans-serif]">
                                {kr.valorAtual.toLocaleString('pt-BR')} / {kr.valorMeta.toLocaleString('pt-BR')} {kr.unidade}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer - Tarefas Vinculadas e Datas */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckSquare size={14} className="text-[#14E9BC]" />
                        <span className="text-[#bdbdbd] text-[12px] font-['Inter:Regular',sans-serif]">
                          {okr.tarefasVinculadas?.length || 0} {okr.tarefasVinculadas?.length === 1 ? 'tarefa vinculada' : 'tarefas vinculadas'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#666]" />
                        <span className="text-[#666] text-[11px] font-['Inter:Regular',sans-serif]">
                          {formatarData(okr.dataInicio)} - {formatarData(okr.dataFim)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Parceiros B2B - Exclusivo para Comercial */}
        {id === 'comercial' && <ParceirosB2B />}

        {/* Tasks and Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks */}
          <div>
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px] mb-4">
              Tarefas
            </h2>
            {deptTasks.length > 0 ? (
              <div className="space-y-3">
                {deptTasks.map((task) => (
                  <TaskCard key={task.id} {...task} />
                ))}
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-8 text-center">
                <p className="text-[#bdbdbd] font-['Inter:Regular',sans-serif]">
                  Nenhuma tarefa encontrada
                </p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px] mb-4">
              Documentos
            </h2>
            {deptDocs.length > 0 ? (
              <div className="space-y-3">
                {deptDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 hover:border-[#555] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded flex items-center justify-center">
                        <FileText size={20} className="text-[#14E9BC]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[15px] mb-1">
                          {doc.titulo}
                        </h4>
                        <div className="flex items-center gap-3 text-[#bdbdbd] text-[13px]">
                          <span className="font-['Inter:Regular',sans-serif]">{doc.autor}</span>
                          <span>•</span>
                          <span className="font-['Inter:Regular',sans-serif]">{doc.tamanho}</span>
                          <span>•</span>
                          <span className="font-['Inter:Regular',sans-serif]">{doc.tipo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-8 text-center">
                <p className="text-[#bdbdbd] font-['Inter:Regular',sans-serif]">
                  Nenhum documento encontrado
                </p>
              </div>
            )}\
          </div>
        </div>
      </div>
    </div>
  );
}