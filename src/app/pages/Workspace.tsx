import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { getDepartamentosComStats, type DepartamentoComStats } from "../../lib/services/departamentos";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  LayoutDashboard,
  FileText,
  Zap,
  Target,
  Upload,
  Lock,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { WorkspaceOverview } from "../components/workspace/WorkspaceOverview";
import { WorkspaceFormularios } from "../components/workspace/WorkspaceFormularios";
import { WorkspaceDocumentos } from "../components/workspace/WorkspaceDocumentos";
import { WorkspaceAutomacoes } from "../components/workspace/WorkspaceAutomacoes";
import { WorkspaceObjetivos } from "../components/workspace/WorkspaceObjetivos";

type TabType = "overview" | "formularios" | "documentos" | "automacoes" | "objetivos";

export default function Workspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, podeEditar, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [departamento, setDepartamento] = useState<DepartamentoComStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDepartamentosComStats()
      .then((depts) => setDepartamento(depts.find((d) => d.id === id) ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const temPermissao = podeEditar(id || "");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-[#bdbdbd] text-[16px]">Carregando...</p>
      </div>
    );
  }

  if (!departamento) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="text-[#ec5d5e] mx-auto mb-4" />
          <p className="text-[#bdbdbd] text-[18px]">Departamento não encontrado</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
    { id: "formularios", label: "Formulários", icon: FileText },
    { id: "documentos", label: "Documentos", icon: Upload },
    { id: "automacoes", label: "Automações", icon: Zap },
    { id: "objetivos", label: "Objetivos", icon: Target },
  ];

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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${departamento.cor}20`, color: departamento.cor }}
              >
                {departamento.nome[0]}
              </div>
              <div>
                <h1 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[32px] mb-1">
                  Workspace {departamento.nome}
                </h1>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
                  Gerencie formulários, documentos, automações e objetivos
                </p>
              </div>
            </div>

            {/* Badge de Permissão */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                temPermissao
                  ? "bg-[#28d939]/10 border-[#28d939]/40"
                  : "bg-[#ec5d5e]/10 border-[#ec5d5e]/40"
              }`}
            >
              {temPermissao ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-[#28d939]" />
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[#28d939] text-[13px]">
                    Permissão de Edição
                  </span>
                </>
              ) : (
                <>
                  <Lock size={16} className="text-[#ec5d5e]" />
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[#ec5d5e] text-[13px]">
                    Somente Visualização
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Informações do Usuário Logado */}
        {usuario && (
          <div className="mb-6 bg-[#0f0f0f] border border-[#333] rounded-lg p-4 flex items-center gap-4">
            <img
              src={usuario.avatar}
              alt={usuario.nome}
              className="w-12 h-12 rounded-full bg-[#1a1a1a]"
            />
            <div className="flex-1">
              <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[15px]">
                {usuario.nome}
              </p>
              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                {usuario.cargo} • {usuario.email}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#14E9BC]/10 border border-[#14E9BC]/40">
              <span className="font-['Inter:Semi_Bold',sans-serif] text-[#14E9BC] text-[12px]">
                {usuario.permissoes.includes("admin") ? "ADMIN" : "EXECUTIVO"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="ml-4 px-3 py-2 rounded-lg bg-[#ec5d5e]/10 border border-[#ec5d5e]/40 flex items-center gap-2 hover:bg-[#ec5d5e]/20 transition-colors"
            >
              <LogOut size={14} className="text-[#ec5d5e]" />
              <span className="font-['Inter:Semi_Bold',sans-serif] text-[#ec5d5e] text-[12px]">
                Sair
              </span>
            </button>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-8 border-b border-[#333]">
          <div className="flex gap-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all ${
                    isActive
                      ? "border-[#14E9BC] text-[#14E9BC]"
                      : "border-transparent text-[#bdbdbd] hover:text-[#eee]"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-['Inter:Semi_Bold',sans-serif] text-[14px]">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && (
            <WorkspaceOverview departamento={departamento} temPermissao={temPermissao} />
          )}
          {activeTab === "formularios" && (
            <WorkspaceFormularios departamento={departamento} temPermissao={temPermissao} />
          )}
          {activeTab === "documentos" && (
            <WorkspaceDocumentos departamento={departamento} temPermissao={temPermissao} />
          )}
          {activeTab === "automacoes" && (
            <WorkspaceAutomacoes departamento={departamento} temPermissao={temPermissao} />
          )}
          {activeTab === "objetivos" && (
            <WorkspaceObjetivos departamento={departamento} temPermissao={temPermissao} />
          )}
        </div>
      </div>
    </div>
  );
}