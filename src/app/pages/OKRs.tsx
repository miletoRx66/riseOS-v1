import { useState, useEffect, FormEvent, MouseEvent } from "react";
import { Link } from "react-router";
import { getOkrs, criarOkr, criarKeyResult, deletarOkr, atualizarProgresso, type OkrDB } from "../../lib/services/okrs";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { getUsuarios, type UsuarioDB } from "../../lib/services/usuarios";
import { useAuth } from "../context/AuthContext";
import { Target, TrendingUp, Calendar, User, Plus, Filter, X, Trash2, LayoutList, CalendarDays, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";

interface KeyResult {
  id: string;
  descricao: string;
  metrica: string;
  valorInicial: number;
  valorMeta: number;
  unidade: string;
}

export default function OKRs() {
  const { usuario } = useAuth();
  const [okrs, setOkrs] = useState<OkrDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("todos");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Q1 2026");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<string>("lista");
  const [expandedOKRs, setExpandedOKRs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!usuario) return;
    const deptFiltro = usuario.isAdmin ? undefined : usuario.departamento || undefined;
    getOkrs(deptFiltro).then(setOkrs).catch(console.error);
    getDepartamentos().then(setDepartamentos).catch(console.error);
    getUsuarios().then(setUsuarios).catch(console.error);
  }, [usuario?.id, usuario?.isAdmin, usuario?.departamento]);
  const [formData, setFormData] = useState({
    titulo: "",
    departamento: "",
    periodo: "Q1 2026",
    responsavel_id: "",
    dataInicio: "",
    dataFim: "",
  });
  const [keyResults, setKeyResults] = useState<KeyResult[]>([
    {
      id: "kr-temp-1",
      descricao: "",
      metrica: "",
      valorInicial: 0,
      valorMeta: 0,
      unidade: "",
    },
  ]);

  const filteredOKRs = okrs.filter((okr) => {
    const matchDept = selectedDepartment === "todos" || okr.departamento_id === selectedDepartment;
    const matchPeriod = selectedPeriod === "todos" || okr.periodo === selectedPeriod;
    return matchDept && matchPeriod;
  });

  const getStatusColor = (progresso: number) => {
    if (progresso >= 80) return "#28d939";
    if (progresso >= 50) return "#f59e0b";
    return "#ec5d5e";
  };

  const getStatusLabel = (progresso: number) => {
    if (progresso >= 80) return "No Caminho";
    if (progresso >= 50) return "Atenção";
    return "Em Risco";
  };

  const handleAddKeyResult = () => {
    setKeyResults([
      ...keyResults,
      {
        id: `kr-temp-${Date.now()}`,
        descricao: "",
        metrica: "",
        valorInicial: 0,
        valorMeta: 0,
        unidade: "",
      },
    ]);
  };

  const handleRemoveKeyResult = (id: string) => {
    if (keyResults.length > 1) {
      setKeyResults(keyResults.filter((kr) => kr.id !== id));
    }
  };

  const handleKeyResultChange = (id: string, field: keyof KeyResult, value: string | number) => {
    setKeyResults(
      keyResults.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr))
    );
  };

  const resetForm = () => {
    setFormData({ titulo: "", departamento: "", periodo: "Q1 2026", responsavel_id: "", dataInicio: "", dataFim: "" });
    setKeyResults([{ id: "kr-temp-1", descricao: "", metrica: "", valorInicial: 0, valorMeta: 0, unidade: "" }]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const okr = await criarOkr({
        titulo: formData.titulo,
        departamento_id: formData.departamento,
        periodo: formData.periodo,
        responsavel_id: formData.responsavel_id,
        data_inicio: formData.dataInicio || undefined,
        data_fim: formData.dataFim || undefined,
      });
      await Promise.all(
        keyResults.map((kr) =>
          criarKeyResult({
            okr_id: okr.id,
            descricao: kr.descricao,
            metrica: kr.metrica || undefined,
            valor_inicial: kr.valorInicial,
            valor_meta: kr.valorMeta,
            unidade: kr.unidade || undefined,
          })
        )
      );
      setOkrs((prev) => [...prev, { ...okr, key_results: [] }]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Erro ao criar OKR:", err);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const [editingKr, setEditingKr] = useState<{ okrId: string; krId: string; valor: number } | null>(null);
  const [salvandoKr, setSalvandoKr] = useState(false);

  const handleSalvarProgresso = async (okrId: string, krId: string, valorMeta: number) => {
    if (!editingKr) return;
    setSalvandoKr(true);
    try {
      const novoProgresso = Math.min(100, Math.round((editingKr.valor / valorMeta) * 100));
      await atualizarProgresso(krId, editingKr.valor, novoProgresso);
      setOkrs((prev) => prev.map((o) => {
        if (o.id !== okrId) return o;
        const krs = (o.key_results ?? []).map((kr) =>
          kr.id === krId ? { ...kr, valor_atual: editingKr.valor, progresso: novoProgresso } : kr
        );
        const progressoOkr = krs.length > 0
          ? Math.round(krs.reduce((acc, kr) => acc + kr.progresso, 0) / krs.length)
          : o.progresso;
        return { ...o, key_results: krs, progresso: progressoOkr };
      }));
      setEditingKr(null);
    } catch (err) {
      console.error("Erro ao atualizar progresso:", err);
    } finally {
      setSalvandoKr(false);
    }
  };

  const handleExcluirOkr = async (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir este OKR? Esta ação não pode ser desfeita.")) return;
    try {
      await deletarOkr(id);
      setOkrs((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error("Erro ao excluir OKR:", err);
    }
  };

  const toggleOKR = (id: string) => {
    const newExpandedOKRs = new Set(expandedOKRs);
    if (newExpandedOKRs.has(id)) {
      newExpandedOKRs.delete(id);
    } else {
      newExpandedOKRs.add(id);
    }
    setExpandedOKRs(newExpandedOKRs);
  };

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px] mb-2">
                Gestão de OKRs
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[16px]">
                Orquestre objetivos e resultados-chave por departamento
              </p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors"
            >
              <Plus size={20} />
              Novo OKR
            </button>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-rise-fg-2" />
              <span className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Filtros:
              </span>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded-lg px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Departamentos</option>
              {departamentos.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nome}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded-lg px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="Q1 2026">Q1 2026</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q4 2026">Q4 2026</option>
            </select>

            {/* Divisor */}
            <div className="h-6 w-px bg-rise-line"></div>

            {/* Modo de Visualização */}
            <div className="flex items-center gap-2 bg-rise-raised border border-rise-line rounded-lg p-1">
              <button
                onClick={() => setViewMode("lista")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[13px] transition-all ${
                  viewMode === "lista"
                    ? "bg-[#14E9BC] text-[#000]"
                    : "text-rise-fg-2 hover:text-rise-fg"
                }`}
              >
                <LayoutList size={16} />
                Lista
              </button>
              <button
                onClick={() => setViewMode("calendario")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[13px] transition-all ${
                  viewMode === "calendario"
                    ? "bg-[#14E9BC] text-[#000]"
                    : "text-rise-fg-2 hover:text-rise-fg"
                }`}
              >
                <CalendarDays size={16} />
                Calendário
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[13px] transition-all ${
                  viewMode === "kanban"
                    ? "bg-[#14E9BC] text-[#000]"
                    : "text-rise-fg-2 hover:text-rise-fg"
                }`}
              >
                <LayoutGrid size={16} />
                Kanban
              </button>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-rise-surface border border-rise-line rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/15 flex items-center justify-center">
                <Target size={20} className="text-[#14E9BC]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Total de OKRs
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {okrs.length}
            </p>
          </div>

          <div className="bg-rise-surface border border-rise-line rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#28d939]/15 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#28d939]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                No Caminho
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {okrs.filter((o) => o.progresso >= 80).length}
            </p>
          </div>

          <div className="bg-rise-surface border border-rise-line rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center">
                <Target size={20} className="text-[#f59e0b]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Atenção
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {okrs.filter((o) => o.progresso >= 50 && o.progresso < 80).length}
            </p>
          </div>

          <div className="bg-rise-surface border border-rise-line rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#ec5d5e]/15 flex items-center justify-center">
                <Target size={20} className="text-[#ec5d5e]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Em Risco
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {okrs.filter((o) => o.progresso < 50).length}
            </p>
          </div>
        </div>

        {/* Lista de OKRs */}
        <div className="space-y-6">
          {filteredOKRs.map((okr) => {
            const dept = departamentos.find((d) => d.id === okr.departamento_id);
            if (!dept) return null;

            const isExpanded = expandedOKRs.has(okr.id);

            return (
              <div
                key={okr.id}
                className="bg-rise-surface border border-rise-line rounded-lg hover:border-rise-fg-4 transition-all overflow-hidden"
              >
                {/* Header do OKR - Clicável */}
                <div
                  onClick={() => toggleOKR(okr.id)}
                  className="flex items-start justify-between p-6 cursor-pointer"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${dept.cor}20`, color: dept.cor }}
                    >
                      <Target size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Link
                          to={`/okrs/${okr.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[20px] hover:text-[#14E9BC] transition-colors"
                        >
                          {okr.titulo}
                        </Link>
                        <span
                          className="px-3 py-1 rounded-full text-[11px] font-['Inter:Medium',sans-serif]"
                          style={{
                            backgroundColor: `${getStatusColor(okr.progresso)}20`,
                            color: getStatusColor(okr.progresso),
                          }}
                        >
                          {getStatusLabel(okr.progresso)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-rise-fg-2 text-[14px] flex-wrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: dept.cor }}
                          />
                          <span className="font-['Inter:Regular',sans-serif]">{dept.nome}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          <span className="font-['Inter:Regular',sans-serif]">{okr.periodo}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          <span className="font-['Inter:Regular',sans-serif]">
                            {okr.responsavel?.nome ?? "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px] mb-1">
                        Progresso Geral
                      </p>
                      <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[32px]">
                        {okr.progresso}%
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleExcluirOkr(e, okr.id)}
                      className="text-rise-fg-2 hover:text-[#ec5d5e] transition-colors p-1"
                      title="Excluir OKR"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOKR(okr.id);
                      }}
                      className="text-rise-fg-2 hover:text-[#14E9BC] transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso Geral - Sempre visível */}
                <div className="px-6 pb-6">
                  <div className="w-full bg-rise-raised rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${okr.progresso}%`,
                        backgroundColor: dept.cor,
                      }}
                    />
                  </div>
                </div>

                {/* Conteúdo Expansível - Key Results e Tarefas */}
                {isExpanded && (
                  <div className="px-6 pb-6 space-y-6 border-t border-rise-line pt-6">
                    {/* Key Results */}
                    <div>
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] mb-4 uppercase tracking-wider">
                        Key Results
                      </h3>
                      <div className="space-y-4">
                        {okr.key_results.map((kr) => {
                          const isEditingThis = editingKr?.krId === kr.id;
                          return (
                            <div
                              key={kr.id}
                              className="border-l-2 pl-4 py-2"
                              style={{ borderColor: dept.cor }}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] flex-1">
                                  {kr.descricao}
                                </p>
                                <div className="text-right ml-4">
                                  <p className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px]">
                                    {kr.progresso}%
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="flex-1 bg-rise-raised rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all"
                                    style={{ width: `${kr.progresso}%`, backgroundColor: dept.cor }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
                                  {kr.valor_atual.toLocaleString()} / {kr.valor_meta.toLocaleString()}{" "}
                                  {kr.unidade}
                                </p>
                                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[12px]">
                                  {kr.metrica}
                                </p>
                              </div>
                              {/* Inline progress update */}
                              {isEditingThis ? (
                                <div className="mt-3 flex items-center gap-2">
                                  <input
                                    type="number"
                                    min={0}
                                    max={kr.valor_meta}
                                    value={editingKr.valor}
                                    onChange={(e) => setEditingKr({ ...editingKr, valor: parseFloat(e.target.value) || 0 })}
                                    className="w-28 bg-rise-raised border border-rise-line rounded px-3 py-1.5 text-rise-fg text-[13px] focus:border-[#14E9BC] focus:outline-none"
                                  />
                                  <span className="text-rise-fg-2 text-[12px]">/ {kr.valor_meta} {kr.unidade}</span>
                                  <button
                                    onClick={() => handleSalvarProgresso(okr.id, kr.id, kr.valor_meta)}
                                    disabled={salvandoKr}
                                    className="bg-[#14E9BC] text-[#000] px-3 py-1.5 rounded text-[12px] font-semibold hover:bg-[#12d4a8] transition-colors disabled:opacity-50"
                                  >
                                    {salvandoKr ? "..." : "Salvar"}
                                  </button>
                                  <button
                                    onClick={() => setEditingKr(null)}
                                    className="text-rise-fg-2 hover:text-rise-fg px-2 py-1.5 text-[12px] transition-colors"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setEditingKr({ okrId: okr.id, krId: kr.id, valor: kr.valor_atual })}
                                  className="mt-2 text-[#14E9BC] text-[12px] font-['Inter:Medium',sans-serif] hover:underline"
                                >
                                  Atualizar progresso
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredOKRs.length === 0 && (
          <div className="bg-rise-surface border border-rise-line rounded-lg p-12 text-center">
            <Target size={48} className="text-rise-fg-4 mx-auto mb-4" />
            <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px] mb-2">
              Nenhum OKR encontrado
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px] mb-6">
              Tente ajustar os filtros ou crie um novo OKR
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors mx-auto"
            >
              <Plus size={20} />
              Criar Primeiro OKR
            </button>
          </div>
        )}
      </div>

      {/* Modal - Novo OKR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000]/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-rise-surface border border-rise-line rounded-lg max-w-[900px] w-full my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-rise-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/20 flex items-center justify-center">
                  <Target size={20} className="text-[#14E9BC]" />
                </div>
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[24px]">
                  Novo OKR
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-rise-fg-2 hover:text-rise-fg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Título do Objetivo */}
                  <div className="lg:col-span-2">
                    <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                      Título do Objetivo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Aumentar Brand Awareness no mercado B2B"
                      className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                      Departamento *
                    </label>
                    <select
                      required
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    >
                      <option value="">Selecione um departamento</option>
                      {departamentos.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Período */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                      Período *
                    </label>
                    <select
                      required
                      value={formData.periodo}
                      onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                      className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    >
                      <option value="Q1 2026">Q1 2026</option>
                      <option value="Q2 2026">Q2 2026</option>
                      <option value="Q3 2026">Q3 2026</option>
                      <option value="Q4 2026">Q4 2026</option>
                      <option value="2026">Anual 2026</option>
                    </select>
                  </div>

                  {/* Responsável */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                      Responsável *
                    </label>
                    <select
                      required
                      value={formData.responsavel_id}
                      onChange={(e) => setFormData({ ...formData, responsavel_id: e.target.value })}
                      className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    >
                      <option value="">Selecione o responsável</option>
                      {usuarios.map((u) => (
                        <option key={u.id} value={u.id}>{u.nome}</option>
                      ))}
                    </select>
                  </div>

                  {/* Data de Início */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>

                  {/* Data de Fim */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Key Results */}
                <div className="border-t border-rise-line pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px] mb-1">
                        Key Results (Resultados-Chave)
                      </h3>
                      <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px]">
                        Defina de 3 a 5 resultados mensuráveis que indicam o sucesso do objetivo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKeyResult}
                      className="bg-rise-raised border border-rise-line text-[#14E9BC] px-4 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[13px] flex items-center gap-2 hover:bg-rise-subtle transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar KR
                    </button>
                  </div>

                  <div className="space-y-4">
                    {keyResults.map((kr, index) => (
                      <div key={kr.id} className="bg-rise-raised border border-rise-line rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-['Inter:Semi_Bold',sans-serif] text-[#14E9BC] text-[13px]">
                            Key Result #{index + 1}
                          </span>
                          {keyResults.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveKeyResult(kr.id)}
                              className="text-[#ec5d5e] hover:text-[#ff6b6b] transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Descrição */}
                          <div className="md:col-span-2">
                            <label className="block font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-2">
                              Descrição do Resultado *
                            </label>
                            <input
                              type="text"
                              required
                              value={kr.descricao}
                              onChange={(e) => handleKeyResultChange(kr.id, "descricao", e.target.value)}
                              placeholder="Ex: Alcançar 100k seguidores nas redes sociais"
                              className="w-full bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Métrica */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-2">
                              Métrica *
                            </label>
                            <input
                              type="text"
                              required
                              value={kr.metrica}
                              onChange={(e) => handleKeyResultChange(kr.id, "metrica", e.target.value)}
                              placeholder="Ex: Seguidores"
                              className="w-full bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Unidade */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-2">
                              Unidade *
                            </label>
                            <input
                              type="text"
                              required
                              value={kr.unidade}
                              onChange={(e) => handleKeyResultChange(kr.id, "unidade", e.target.value)}
                              placeholder="Ex: seguidores, %, R$, leads"
                              className="w-full bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Valor Inicial */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-2">
                              Valor Inicial *
                            </label>
                            <input
                              type="number"
                              required
                              value={kr.valorInicial}
                              onChange={(e) => handleKeyResultChange(kr.id, "valorInicial", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Valor Meta */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[12px] mb-2">
                              Valor Meta *
                            </label>
                            <input
                              type="number"
                              required
                              value={kr.valorMeta}
                              onChange={(e) => handleKeyResultChange(kr.id, "valorMeta", parseFloat(e.target.value) || 0)}
                              placeholder="100000"
                              className="w-full bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-rise-line">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] text-rise-fg-2 hover:text-rise-fg hover:bg-rise-raised transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] hover:bg-[#12d4a8] transition-colors flex items-center gap-2"
                >
                  <Target size={18} />
                  Criar OKR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}