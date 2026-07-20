import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getDepartamentosComStats, type DepartamentoComStats } from "../../lib/services/departamentos";
import { getTarefas, type TarefaDB } from "../../lib/services/tarefas";
import { getOkrs, type OkrDB } from "../../lib/services/okrs";
import { documentos } from "../data/mockData";
import { ArrowLeft, Users, CheckSquare, FileText, Target, Calendar, User, Lock } from "lucide-react";
import { TaskCard } from "../components/common/TaskCard";
import { ParceirosB2B } from "../components/common/ParceirosB2B";
import DepartamentoFinanceiro from "./DepartamentoFinanceiro";
import DepartamentoComercial from "./DepartamentoComercial";
import { useAuth } from "../context/AuthContext";

export default function DepartamentoDetail() {
  const { id } = useParams();
  const { usuario, podeEditar, isLoading: authLoading } = useAuth();

  const [departamento, setDepartamento] = useState<DepartamentoComStats | null>(null);
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [okrs, setOkrs] = useState<OkrDB[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getDepartamentosComStats(),
      getTarefas({ departamento_id: id }),
      getOkrs(id),
    ])
      .then(([depts, t, o]) => {
        setDepartamento(depts.find((d) => d.id === id) ?? null);
        setTarefas(t);
        setOkrs(o);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-rise-bg p-8 flex items-center justify-center">
        <p className="text-rise-fg-2 text-[16px]">Carregando...</p>
      </div>
    );
  }

  // Guard: só bloqueia quando o auth já resolveu — evita "Acesso Restrito"
  // durante transições de sessão (buildUsuario ainda em andamento)
  if (!authLoading && departamento && !usuario?.isAdmin && !podeEditar(departamento.id)) {
    return (
      <div className="min-h-screen bg-rise-bg p-8 flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#ec5d5e]/10 flex items-center justify-center">
          <Lock size={28} className="text-[#ec5d5e]" />
        </div>
        <h2 className="text-rise-fg text-[22px] font-bold">Acesso Restrito</h2>
        <p className="text-rise-fg-4 text-[14px] text-center max-w-[320px]">
          Você não tem permissão para acessar o departamento <span className="text-rise-fg-2 font-semibold">{departamento.nome}</span>.
        </p>
        <Link to="/departamentos" className="mt-2 text-[#14E9BC] text-[14px] hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Voltar para Departamentos
        </Link>
      </div>
    );
  }

  if (id === "financeiro" || departamento?.nome?.toLowerCase() === "financeiro") {
    return <DepartamentoFinanceiro />;
  }

  if (id === "comercial" || departamento?.nome?.toLowerCase() === "comercial") {
    return <DepartamentoComercial />;
  }

  if (!departamento) {
    return (
      <div className="min-h-screen bg-rise-bg p-8 flex items-center justify-center">
        <p className="text-rise-fg-2 text-[18px]">Departamento não encontrado</p>
      </div>
    );
  }

  // Documentos mock filtrados por departamento (sem tabela no DB)
  const deptDocs = documentos.filter((d) => (d as any).departamento === id);

  // KPIs calculados a partir de dados reais
  const total = tarefas.length;
  const concluidas = tarefas.filter((t) => t.status === "concluido").length;
  const emAndamento = tarefas.filter((t) => t.status === "em-andamento").length;
  const atrasadas = tarefas.filter((t) => {
    if (!t.prazo || t.status === "concluido") return false;
    return new Date(t.prazo) < new Date();
  }).length;
  const taxaConclusao = total > 0 ? Math.round((concluidas / total) * 100) : 0;
  const progressoMedioOkrs = okrs.length > 0
    ? Math.round(okrs.reduce((acc, o) => acc + o.progresso, 0) / okrs.length)
    : 0;

  const formatarData = (data: string) => {
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const kpiCards = [
    { label: "Total de Tarefas", value: total },
    { label: "Concluídas", value: concluidas },
    { label: "Taxa de Conclusão", value: `${taxaConclusao}%` },
    { label: "Em Andamento", value: emAndamento },
    { label: "Atrasadas", value: atrasadas },
    { label: "OKRs Ativos", value: okrs.length },
    { label: "Progresso Médio OKRs", value: `${progressoMedioOkrs}%` },
    { label: "Membros", value: departamento.membros },
  ];

  return (
    <div className="min-h-screen bg-rise-bg p-8">
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
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px]">
                {departamento.nome}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-rise-fg-2">
                  <Users size={16} />
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                    {departamento.membros} membros
                  </span>
                </div>
                <div className="flex items-center gap-2 text-rise-fg-2">
                  <CheckSquare size={16} />
                  <span className="font-['Inter:Regular',sans-serif] text-[14px]">
                    {departamento.tarefasAbertas} tarefas
                  </span>
                </div>
                <div className="flex items-center gap-2 text-rise-fg-2">
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
        <div className="mb-8">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px] mb-4">
            KPIs do Departamento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpiCards.map(({ label, value }) => (
              <div key={label} className="bg-rise-surface border border-rise-line rounded-lg p-4">
                <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px] mb-2">
                  {label}
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* OKRs do Departamento */}
        {okrs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px] flex items-center gap-2">
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
              {okrs.map((okr) => (
                <Link key={okr.id} to="/okrs" className="block">
                  <div className="bg-rise-surface border border-rise-line rounded-lg p-6 hover:border-[#14E9BC] transition-all cursor-pointer">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px] mb-2">
                          {okr.titulo}
                        </h3>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-rise-fg-2 text-[13px] font-['Inter:Regular',sans-serif]">
                            {okr.periodo}
                          </span>
                          <span className="text-rise-fg-3">•</span>
                          <div className="flex items-center gap-1">
                            <User size={14} className="text-rise-fg-3" />
                            <span className="text-rise-fg-2 text-[13px] font-['Inter:Regular',sans-serif]">
                              {okr.responsavel?.nome ?? "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-[#14E9BC] text-[28px] font-['Inter:Bold',sans-serif]">
                          {okr.progresso}%
                        </p>
                        <p className="text-rise-fg-3 text-[11px] font-['Inter:Regular',sans-serif]">
                          progresso
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-rise-raised rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#14E9BC] h-full rounded-full transition-all duration-500"
                          style={{ width: `${okr.progresso}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Results */}
                    {okr.key_results && okr.key_results.length > 0 && (
                      <div className="space-y-3 mb-4 pb-4 border-b border-rise-line">
                        <p className="text-rise-fg-2 text-[12px] font-['Inter:Medium',sans-serif] uppercase tracking-wide">
                          Key Results
                        </p>
                        {okr.key_results.map((kr) => (
                          <div key={kr.id} className="bg-rise-raised rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-rise-fg text-[13px] font-['Inter:Regular',sans-serif] flex-1 pr-2">
                                {kr.descricao}
                              </p>
                              <span className="text-[#28d939] text-[14px] font-['Inter:Semi_Bold',sans-serif] whitespace-nowrap">
                                {kr.progresso}%
                              </span>
                            </div>
                            <div className="w-full bg-rise-surface rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#28d939] h-full rounded-full transition-all duration-500"
                                style={{ width: `${kr.progresso}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-rise-fg-3 text-[11px] font-['Inter:Regular',sans-serif]">
                                {kr.metrica}
                              </p>
                              <p className="text-rise-fg-2 text-[11px] font-['Inter:Regular',sans-serif]">
                                {kr.valor_atual.toLocaleString("pt-BR")} / {kr.valor_meta.toLocaleString("pt-BR")} {kr.unidade}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer - Datas */}
                    <div className="flex items-center justify-end">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-rise-fg-3" />
                        <span className="text-rise-fg-3 text-[11px] font-['Inter:Regular',sans-serif]">
                          {formatarData(okr.data_inicio)} - {formatarData(okr.data_fim)}
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
        {departamento.nome.toLowerCase() === "comercial" && <ParceirosB2B />}

        {/* Tasks and Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tasks */}
          <div>
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px] mb-4">
              Tarefas
            </h2>
            {tarefas.length > 0 ? (
              <div className="space-y-3">
                {tarefas.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    titulo={task.titulo}
                    departamento={departamento.nome}
                    status={task.status}
                    prioridade={task.prioridade}
                    responsavel={task.responsavel?.nome ?? "—"}
                    prazo={task.prazo ?? ""}
                    descricao={task.descricao ?? undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-rise-surface border border-rise-line rounded-lg p-8 text-center">
                <p className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">
                  Nenhuma tarefa encontrada
                </p>
              </div>
            )}
          </div>

          {/* Documents */}
          <div>
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[20px] mb-4">
              Documentos
            </h2>
            {deptDocs.length > 0 ? (
              <div className="space-y-3">
                {deptDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-rise-surface border border-rise-line rounded-lg p-4 hover:border-rise-fg-4 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-rise-raised rounded flex items-center justify-center">
                        <FileText size={20} className="text-[#14E9BC]" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[15px] mb-1">
                          {doc.titulo}
                        </h4>
                        <div className="flex items-center gap-3 text-rise-fg-2 text-[13px]">
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
              <div className="bg-rise-surface border border-rise-line rounded-lg p-8 text-center">
                <p className="text-rise-fg-2 font-['Inter:Regular',sans-serif]">
                  Nenhum documento encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
