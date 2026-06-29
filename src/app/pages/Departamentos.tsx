import { useState, useEffect, FormEvent } from "react";
import { DepartmentCard } from "../components/common/DepartmentCard";
import { getDepartamentosComStats, criarDepartamento, atualizarDepartamento, type DepartamentoComStats } from "../../lib/services/departamentos";
import { Plus, X, Megaphone, Settings, TrendingUp, Package, Users, Briefcase, Lightbulb, HeadphonesIcon, DollarSign, Pencil } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Departamentos() {
  const { usuario, podeEditar } = useAuth();
  const [departamentos, setDepartamentos] = useState<DepartamentoComStats[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  useEffect(() => {
    getDepartamentosComStats()
      .then(setDepartamentos)
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);
  const [formData, setFormData] = useState({
    nome: "",
    cor: "#14E9BC",
    icon: "briefcase",
    membros: 0,
    descricao: "",
  });

  const availableIcons = [
    { id: "megaphone", name: "Megaphone", component: Megaphone },
    { id: "settings", name: "Settings", component: Settings },
    { id: "trending-up", name: "Trending Up", component: TrendingUp },
    { id: "package", name: "Package", component: Package },
    { id: "briefcase", name: "Briefcase", component: Briefcase },
    { id: "users", name: "Users", component: Users },
    { id: "lightbulb", name: "Lightbulb", component: Lightbulb },
    { id: "headphones", name: "Headphones", component: HeadphonesIcon },
    { id: "dollar-sign", name: "Dollar Sign", component: DollarSign },
  ];

  const availableColors = [
    "#14E9BC", // Teal
    "#28d939", // Verde
    "#6B8AFF", // Azul
    "#E879F9", // Rosa
    "#f59e0b", // Laranja
    "#ec5d5e", // Vermelho
    "#8b5cf6", // Roxo
    "#06b6d4", // Cyan
  ];

  const handleAbrirEdicao = (dept: DepartamentoComStats) => {
    setEditandoId(dept.id);
    setFormData({ nome: dept.nome, cor: dept.cor, icon: dept.icon, membros: dept.membros, descricao: "" });
    setErroForm(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    setErroForm(null);
    try {
      if (editandoId) {
        const atualizado = await atualizarDepartamento(editandoId, { nome: formData.nome, cor: formData.cor, icon: formData.icon });
        setDepartamentos((prev) => prev.map((d) => d.id === editandoId ? { ...d, ...atualizado } : d));
      } else {
        const novo = await criarDepartamento({ nome: formData.nome, cor: formData.cor, icon: formData.icon });
        setDepartamentos((prev) => [...prev, { ...novo, membros: 0, tarefasAbertas: 0, documentos: 0 }]);
      }
      setIsModalOpen(false);
      setEditandoId(null);
      setFormData({ nome: "", cor: "#14E9BC", icon: "briefcase", membros: 0, descricao: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setErroForm(`Falha ao ${editandoId ? "atualizar" : "criar"} departamento: ${msg}`);
      console.error("Erro ao salvar departamento:", err);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
              Departamentos
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
              Gerencie os espaços de trabalho de cada departamento
            </p>
          </div>
          {usuario?.isAdmin && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors"
            >
              <Plus size={20} />
              Novo Departamento
            </button>
          )}
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {carregando ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-lg p-6 animate-pulse h-[148px]" />
            ))
          ) : departamentos.length === 0 ? (
            <div className="col-span-4 py-16 text-center text-[#444] text-[14px]">
              Nenhum departamento encontrado
            </div>
          ) : departamentos.map((dept) => {
            const temAcesso = usuario?.isAdmin || podeEditar(dept.id);
            const isOwn = dept.id === usuario?.departamento;
            return (
              <div key={dept.id} className="relative group/card">
                <DepartmentCard
                  {...dept}
                  locked={!temAcesso}
                  isOwn={isOwn}
                />
                {usuario?.isAdmin && (
                  <button
                    onClick={() => handleAbrirEdicao(dept)}
                    className="absolute top-3 right-3 w-8 h-8 bg-[#1a1a1a] border border-[#333] rounded-lg flex items-center justify-center text-[#bdbdbd] hover:text-[#eee] hover:border-[#555] transition-all opacity-0 group-hover/card:opacity-100"
                    title="Editar departamento"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Overview Stats */}
        <div className="mt-12 bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-[#eee] text-[20px] mb-6">
            Visão Geral
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                Total de Membros
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
                {departamentos.reduce((acc, dept) => acc + dept.membros, 0)}
              </p>
            </div>
            <div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                Tarefas Abertas
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
                {departamentos.reduce((acc, dept) => acc + dept.tarefasAbertas, 0)}
              </p>
            </div>
            <div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                Total de Documentos
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
                {departamentos.reduce((acc, dept) => acc + dept.documentos, 0)}
              </p>
            </div>
            <div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-2">
                Departamentos Ativos
              </p>
              <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
                {departamentos.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Novo Departamento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000]/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[24px]">
                {editandoId ? "Editar Departamento" : "Novo Departamento"}
              </h2>
              <button
                onClick={() => { setIsModalOpen(false); setEditandoId(null); setErroForm(null); }}
                className="text-[#bdbdbd] hover:text-[#eee] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Nome do Departamento */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Nome do Departamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Marketing, Vendas, TI..."
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                </div>

                {/* Cor do Departamento */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-3">
                    Cor do Departamento *
                  </label>
                  <div className="grid grid-cols-8 gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, cor: color })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          formData.cor === color
                            ? "ring-2 ring-[#eee] ring-offset-2 ring-offset-[#0f0f0f]"
                            : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Ícone do Departamento */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-3">
                    Ícone do Departamento *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {availableIcons.map((icon) => {
                      const IconComponent = icon.component;
                      return (
                        <button
                          key={icon.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, icon: icon.id })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                            formData.icon === icon.id
                              ? "border-[#14E9BC] bg-[#14E9BC]/10"
                              : "border-[#333] hover:border-[#555] bg-[#1a1a1a]"
                          }`}
                        >
                          <IconComponent
                            size={24}
                            style={{ color: formData.icon === icon.id ? formData.cor : "#bdbdbd" }}
                          />
                          <span className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[10px]">
                            {icon.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Número de Membros */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Número de Membros Inicial
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.membros}
                    onChange={(e) => setFormData({ ...formData, membros: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva o propósito e responsabilidades deste departamento..."
                    rows={4}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none resize-none"
                  />
                </div>

                {/* Preview */}
                <div className="border-t border-[#333] pt-6">
                  <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mb-3">
                    PREVIEW
                  </p>
                  <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${formData.cor}20`, color: formData.cor }}
                      >
                        {(() => {
                          const SelectedIcon = availableIcons.find((i) => i.id === formData.icon)?.component || Briefcase;
                          return <SelectedIcon size={24} />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                          {formData.nome || "Nome do Departamento"}
                        </h3>
                        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                          {formData.membros} membro{formData.membros !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-8 pt-6 border-t border-[#333]">
                {erroForm && (
                  <p className="text-[#ec5d5e] text-[13px] font-['Inter:Regular',sans-serif] mb-4 p-3 bg-[#ec5d5e]/10 border border-[#ec5d5e]/30 rounded-lg">
                    {erroForm}
                  </p>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditandoId(null); setErroForm(null); }}
                    className="px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] text-[#bdbdbd] hover:text-[#eee] hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvando}
                    className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvando ? (editandoId ? "Salvando..." : "Criando...") : (editandoId ? "Salvar Alterações" : "Criar Departamento")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}