import { useState } from "react";
import { Link } from "react-router";
import { departamentos, okrs, tarefas } from "../data/mockData";
import { Target, TrendingUp, Calendar, User, CheckSquare, Plus, Filter, X, Trash2, LayoutList, CalendarDays, LayoutGrid, ChevronDown, ChevronUp } from "lucide-react";

interface KeyResult {
  id: string;
  descricao: string;
  metrica: string;
  valorInicial: number;
  valorMeta: number;
  unidade: string;
}

export default function OKRs() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("todos");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("Q1 2026");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<string>("lista");
  const [expandedOKRs, setExpandedOKRs] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    titulo: "",
    departamento: "",
    periodo: "Q1 2026",
    responsavel: "",
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
    const matchDept = selectedDepartment === "todos" || okr.departamento === selectedDepartment;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para salvar o novo OKR
    // Fechar modal e resetar form
    setIsModalOpen(false);
    setFormData({
      titulo: "",
      departamento: "",
      periodo: "Q1 2026",
      responsavel: "",
      dataInicio: "",
      dataFim: "",
    });
    setKeyResults([
      {
        id: "kr-temp-1",
        descricao: "",
        metrica: "",
        valorInicial: 0,
        valorMeta: 0,
        unidade: "",
      },
    ]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      titulo: "",
      departamento: "",
      periodo: "Q1 2026",
      responsavel: "",
      dataInicio: "",
      dataFim: "",
    });
    setKeyResults([
      {
        id: "kr-temp-1",
        descricao: "",
        metrica: "",
        valorInicial: 0,
        valorMeta: 0,
        unidade: "",
      },
    ]);
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
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
                Gestão de OKRs
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
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
              <Filter size={18} className="text-[#bdbdbd]" />
              <span className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Filtros:
              </span>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
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
              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Períodos</option>
              <option value="Q1 2026">Q1 2026</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q4 2026">Q4 2026</option>
            </select>

            {/* Divisor */}
            <div className="h-6 w-px bg-[#333]"></div>

            {/* Modo de Visualização */}
            <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#333] rounded-lg p-1">
              <button
                onClick={() => setViewMode("lista")}
                className={`px-3 py-1.5 rounded-md flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[13px] transition-all ${
                  viewMode === "lista"
                    ? "bg-[#14E9BC] text-[#000]"
                    : "text-[#bdbdbd] hover:text-[#eee]"
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
                    : "text-[#bdbdbd] hover:text-[#eee]"
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
                    : "text-[#bdbdbd] hover:text-[#eee]"
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
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/15 flex items-center justify-center">
                <Target size={20} className="text-[#14E9BC]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Total de OKRs
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {okrs.length}
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#28d939]/15 flex items-center justify-center">
                <TrendingUp size={20} className="text-[#28d939]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                No Caminho
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {okrs.filter((o) => o.progresso >= 80).length}
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#f59e0b]/15 flex items-center justify-center">
                <Target size={20} className="text-[#f59e0b]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Atenção
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {okrs.filter((o) => o.progresso >= 50 && o.progresso < 80).length}
            </p>
          </div>

          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#ec5d5e]/15 flex items-center justify-center">
                <Target size={20} className="text-[#ec5d5e]" />
              </div>
              <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px]">
                Em Risco
              </p>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px]">
              {okrs.filter((o) => o.progresso < 50).length}
            </p>
          </div>
        </div>

        {/* Lista de OKRs */}
        <div className="space-y-6">
          {filteredOKRs.map((okr) => {
            const dept = departamentos.find((d) => d.id === okr.departamento);
            if (!dept) return null;

            const tarefasVinculadas = tarefas.filter((t) => okr.tarefasVinculadas.includes(t.id));
            const isExpanded = expandedOKRs.has(okr.id);

            return (
              <div
                key={okr.id}
                className="bg-[#0f0f0f] border border-[#333] rounded-lg hover:border-[#555] transition-all overflow-hidden"
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
                        <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[20px]">
                          {okr.titulo}
                        </h2>
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
                      <div className="flex items-center gap-4 text-[#bdbdbd] text-[14px] flex-wrap">
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
                            {okr.responsavel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px] mb-1">
                        Progresso Geral
                      </p>
                      <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[32px]">
                        {okr.progresso}%
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOKR(okr.id);
                      }}
                      className="text-[#bdbdbd] hover:text-[#14E9BC] transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </button>
                  </div>
                </div>

                {/* Barra de Progresso Geral - Sempre visível */}
                <div className="px-6 pb-6">
                  <div className="w-full bg-[#1a1a1a] rounded-full h-3">
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
                  <div className="px-6 pb-6 space-y-6 border-t border-[#333] pt-6">
                    {/* Key Results */}
                    <div>
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] mb-4 uppercase tracking-wider">
                        Key Results
                      </h3>
                      <div className="space-y-4">
                        {okr.keyResults.map((kr) => (
                          <div
                            key={kr.id}
                            className="border-l-2 pl-4 py-2"
                            style={{ borderColor: dept.cor }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] flex-1">
                                {kr.descricao}
                              </p>
                              <div className="text-right ml-4">
                                <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px]">
                                  {kr.progresso}%
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="flex-1 bg-[#1a1a1a] rounded-full h-2">
                                <div
                                  className="h-2 rounded-full"
                                  style={{
                                    width: `${kr.progresso}%`,
                                    backgroundColor: dept.cor,
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
                                {kr.valorAtual.toLocaleString()} / {kr.valorMeta.toLocaleString()}{" "}
                                {kr.unidade}
                              </p>
                              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
                                {kr.metrica}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tarefas Vinculadas */}
                    <div className="border-t border-[#333] pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px] flex items-center gap-2">
                          <CheckSquare size={16} />
                          Tarefas Vinculadas ({tarefasVinculadas.length})
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {tarefasVinculadas.map((tarefa) => (
                          <Link
                            key={tarefa.id}
                            to={`/tarefas/${tarefa.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-between p-3 border border-[#333] rounded-lg hover:border-[#555] hover:bg-[#1a1a1a] transition-all group"
                          >
                            <div className="flex items-center gap-3 flex-1">
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
                              <div className="flex-1 min-w-0">
                                <h4 className="font-['Inter:Medium',sans-serif] text-[#eee] text-[13px] group-hover:text-[#14E9BC] transition-colors truncate">
                                  {tarefa.titulo}
                                </h4>
                                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[11px]">
                                  {tarefa.responsavel}
                                </p>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="w-12 bg-[#1a1a1a] rounded-full h-1.5">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{ width: `${tarefa.progresso}%`, backgroundColor: dept.cor }}
                                />
                              </div>
                              <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[10px] text-right mt-1">
                                {tarefa.progresso}%
                              </p>
                            </div>
                          </Link>
                        ))}
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
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-12 text-center">
            <Target size={48} className="text-[#555] mx-auto mb-4" />
            <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-2">
              Nenhum OKR encontrado
            </h3>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-6">
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
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg max-w-[900px] w-full my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#14E9BC]/20 flex items-center justify-center">
                  <Target size={20} className="text-[#14E9BC]" />
                </div>
                <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[24px]">
                  Novo OKR
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-[#bdbdbd] hover:text-[#eee] transition-colors"
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
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Título do Objetivo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Aumentar Brand Awareness no mercado B2B"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>

                  {/* Departamento */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Departamento *
                    </label>
                    <select
                      required
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
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
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Período *
                    </label>
                    <select
                      required
                      value={formData.periodo}
                      onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
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
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Responsável *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.responsavel}
                      onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                      placeholder="Nome do responsável"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>

                  {/* Data de Início */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dataInicio}
                      onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>

                  {/* Data de Fim */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dataFim}
                      onChange={(e) => setFormData({ ...formData, dataFim: e.target.value })}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Key Results */}
                <div className="border-t border-[#333] pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px] mb-1">
                        Key Results (Resultados-Chave)
                      </h3>
                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[13px]">
                        Defina de 3 a 5 resultados mensuráveis que indicam o sucesso do objetivo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddKeyResult}
                      className="bg-[#1a1a1a] border border-[#333] text-[#14E9BC] px-4 py-2 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[13px] flex items-center gap-2 hover:bg-[#222] transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar KR
                    </button>
                  </div>

                  <div className="space-y-4">
                    {keyResults.map((kr, index) => (
                      <div key={kr.id} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-4">
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
                            <label className="block font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mb-2">
                              Descrição do Resultado *
                            </label>
                            <input
                              type="text"
                              required
                              value={kr.descricao}
                              onChange={(e) => handleKeyResultChange(kr.id, "descricao", e.target.value)}
                              placeholder="Ex: Alcançar 100k seguidores nas redes sociais"
                              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Métrica */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mb-2">
                              Métrica *
                            </label>
                            <input
                              type="text"
                              required
                              value={kr.metrica}
                              onChange={(e) => handleKeyResultChange(kr.id, "metrica", e.target.value)}
                              placeholder="Ex: Seguidores"
                              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Unidade */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mb-2">
                              Unidade *
                            </label>
                            <input
                              type="text"
                              required
                              value={kr.unidade}
                              onChange={(e) => handleKeyResultChange(kr.id, "unidade", e.target.value)}
                              placeholder="Ex: seguidores, %, R$, leads"
                              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Valor Inicial */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mb-2">
                              Valor Inicial *
                            </label>
                            <input
                              type="number"
                              required
                              value={kr.valorInicial}
                              onChange={(e) => handleKeyResultChange(kr.id, "valorInicial", parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>

                          {/* Valor Meta */}
                          <div>
                            <label className="block font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[12px] mb-2">
                              Valor Meta *
                            </label>
                            <input
                              type="number"
                              required
                              value={kr.valorMeta}
                              onChange={(e) => handleKeyResultChange(kr.id, "valorMeta", parseFloat(e.target.value) || 0)}
                              placeholder="100000"
                              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg px-3 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#333]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] text-[#bdbdbd] hover:text-[#eee] hover:bg-[#1a1a1a] transition-colors"
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