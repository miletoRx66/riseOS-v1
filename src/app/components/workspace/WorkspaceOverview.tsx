import { Users, CheckSquare, FileText, TrendingUp, Target, Zap } from "lucide-react";
import { tarefas, documentos, okrs } from "../../data/mockData";

interface WorkspaceOverviewProps {
  departamento: {
    id: string;
    nome: string;
    cor: string;
    membros: number;
    tarefasAbertas: number;
    documentos: number;
  };
  temPermissao: boolean;
}

export function WorkspaceOverview({ departamento, temPermissao }: WorkspaceOverviewProps) {
  const tarefasDept = tarefas.filter((t) => t.departamento === departamento.id);
  const docsDept = documentos.filter((d) => d.departamento === departamento.id);
  const okrsDept = okrs.filter((o) => o.departamento === departamento.id);

  const tarefasEmAndamento = tarefasDept.filter((t) => t.status === "em-andamento").length;
  const tarefasConcluidas = tarefasDept.filter((t) => t.status === "concluido").length;
  const progressoMedioOKRs =
    okrsDept.length > 0
      ? okrsDept.reduce((acc, okr) => acc + okr.progresso, 0) / okrsDept.length
      : 0;

  const stats = [
    {
      label: "Membros do Time",
      valor: departamento.membros,
      icon: Users,
      cor: "#14E9BC",
      descricao: "colaboradores ativos",
    },
    {
      label: "Tarefas em Andamento",
      valor: tarefasEmAndamento,
      icon: CheckSquare,
      cor: "#28d939",
      descricao: "tarefas ativas",
    },
    {
      label: "Tarefas Concluídas",
      valor: tarefasConcluidas,
      icon: TrendingUp,
      cor: "#6B8AFF",
      descricao: "tarefas finalizadas",
    },
    {
      label: "Documentos",
      valor: docsDept.length,
      icon: FileText,
      cor: "#E879F9",
      descricao: "documentos disponíveis",
    },
    {
      label: "OKRs Ativos",
      valor: okrsDept.length,
      icon: Target,
      cor: "#f59e0b",
      descricao: `${progressoMedioOKRs.toFixed(0)}% de progresso médio`,
    },
    {
      label: "Automações",
      valor: 0,
      icon: Zap,
      cor: "#ec5d5e",
      descricao: "automações configuradas",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-[#14E9BC]/10 to-transparent border border-[#14E9BC]/20 rounded-lg p-6">
        <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px] mb-2">
          Bem-vindo ao Workspace {departamento.nome}!
        </h2>
        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[15px] leading-relaxed">
          {temPermissao
            ? "Você tem permissão total para criar e gerenciar formulários, documentos, automações e objetivos deste departamento."
            : "Você pode visualizar todas as informações, mas apenas executivos do departamento podem editar e criar novos itens."}
        </p>
      </div>

      {/* Stats Grid */}
      <div>
        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[20px] mb-4">
          Estatísticas do Workspace
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#555] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.cor}20` }}
                  >
                    <Icon size={24} style={{ color: stat.cor }} />
                  </div>
                </div>
                <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                  {stat.label}
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[32px] mb-1">
                  {stat.valor}
                </p>
                <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[13px]">
                  {stat.descricao}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funcionalidades Disponíveis */}
      <div>
        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[20px] mb-4">
          Funcionalidades do Workspace
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={24} className="text-[#14E9BC]" />
              <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                Formulários Personalizados
              </h4>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] leading-relaxed">
              Crie formulários customizados para coleta de dados, pesquisas internas e processos do
              departamento.
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <FileText size={24} className="text-[#28d939]" />
              <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                Gestão de Documentos
              </h4>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] leading-relaxed">
              Importe, exporte e edite documentos. Organize arquivos por categorias e mantenha tudo
              centralizado.
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Zap size={24} className="text-[#f59e0b]" />
              <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                Automações Inteligentes
              </h4>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] leading-relaxed">
              Configure triggers e ações automáticas baseadas em eventos. Economize tempo em tarefas
              repetitivas.
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <Target size={24} className="text-[#6B8AFF]" />
              <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                Objetivos e Metas
              </h4>
            </div>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] leading-relaxed">
              Defina objetivos semanais, mensais e anuais. Acompanhe o progresso e mantenha o time
              alinhado.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {temPermissao && (
        <div className="bg-[#0f0f0f] border border-[#14E9BC]/40 rounded-lg p-6">
          <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-4">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <button className="bg-[#14E9BC] text-[#000] px-4 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#12d4a8] transition-colors">
              Criar Formulário
            </button>
            <button className="bg-[#28d939] text-[#000] px-4 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#20b82e] transition-colors">
              Upload Documento
            </button>
            <button className="bg-[#f59e0b] text-[#000] px-4 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#d97706] transition-colors">
              Nova Automação
            </button>
            <button className="bg-[#6B8AFF] text-[#fff] px-4 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#5578ff] transition-colors">
              Novo Objetivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
