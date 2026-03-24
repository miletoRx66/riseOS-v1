import { MetricCard } from "../components/common/MetricCard";
import { kpisDashboard, tarefas, documentos } from "../data/mockData";
import { TaskCard } from "../components/common/TaskCard";
import { ContentCard } from "../components/common/ContentCard";
import { FileText, TrendingUp, Users, Building2 } from "lucide-react";
import { Link } from "react-router";

export default function Dashboard() {
  const recentTasks = tarefas.filter(t => t.status === "em-andamento").slice(0, 4);
  const recentDocs = documentos.slice(0, 3);
  const featuredContent = documentos.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
            Dashboard
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
            Visão geral do sistema administrativo Rise
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Receita da empresa"
            value={`R$ ${kpisDashboard.receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            variation={`${kpisDashboard.variacaoReceita} na última semana`}
            isPositive={true}
            gradient={true}
          />
          <MetricCard
            title="Quantidade de escritórios"
            value={kpisDashboard.escritorios}
            variation={kpisDashboard.variacaoEscritorios}
            isPositive={true}
          />
          <MetricCard
            title="Quantidade de assessores"
            value={kpisDashboard.assessores}
            variation={kpisDashboard.variacaoAssessores}
            isPositive={false}
          />
          <MetricCard
            title="Quantidade de clientes"
            value={kpisDashboard.clientes}
            variation={kpisDashboard.variacaoClientes}
            isPositive={false}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/tarefas"
            className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#555] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#28d939]/20 rounded-lg flex items-center justify-center">
                <TrendingUp size={24} className="text-[#28d939]" />
              </div>
              <div>
                <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                  Tarefas Ativas
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
                  {tarefas.filter(t => t.status !== "concluido").length}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/documentos"
            className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#555] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#14E9BC]/20 rounded-lg flex items-center justify-center">
                <FileText size={24} className="text-[#14E9BC]" />
              </div>
              <div>
                <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                  Documentos
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
                  {documentos.length}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/departamentos"
            className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#555] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#6B8AFF]/20 rounded-lg flex items-center justify-center">
                <Building2 size={24} className="text-[#6B8AFF]" />
              </div>
              <div>
                <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                  Departamentos
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
                  4
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Tasks & Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Tasks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px]">
                Tarefas em Andamento
              </h2>
              <Link
                to="/tarefas"
                className="font-['Inter:Medium',sans-serif] text-[#14E9BC] text-[14px] hover:underline"
              >
                Ver todas
              </Link>
            </div>
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <TaskCard key={task.id} {...task} />
              ))}
            </div>
          </div>

          {/* Recent Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px]">
                Documentos Recentes
              </h2>
              <Link
                to="/documentos"
                className="font-['Inter:Medium',sans-serif] text-[#14E9BC] text-[14px] hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-3">
              {recentDocs.map((doc) => (
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
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Content */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px]">
              Conteúdos em Destaque
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredContent.map((doc) => (
              <ContentCard key={doc.id} title={doc.titulo} />
            ))}
            {/* Governança Card - Link externo para GitBook */}
            <a
              href="https://rise-finance-2.gitbook.io/rise-l-internal/93hIPck7wPVGbXmFrkis"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0f0f0f] border border-[#333] rounded-lg overflow-hidden hover:border-[#14E9BC] transition-all group cursor-pointer"
            >
              <div className="aspect-video bg-gradient-to-br from-[#14E9BC]/20 to-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-[48px]">📋</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent opacity-60" />
              </div>
              <div className="p-4">
                <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] group-hover:text-[#14E9BC] transition-colors">
                  Governança
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}