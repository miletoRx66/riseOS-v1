import { useState, useEffect, ChangeEvent, DragEvent } from "react";
import { Link } from "react-router";
import { getTarefas, criarTarefa, type TarefaDB } from "../../lib/services/tarefas";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { TaskCard } from "../components/common/TaskCard";
import { Plus, Filter, LayoutGrid, List, Upload, X, CheckCircle, AlertCircle, FileSpreadsheet, Search, User } from "lucide-react";
import Papa from "papaparse";
import { useAuth } from "../context/AuthContext";

interface CSVTarefa {
  titulo: string;
  departamento: string;
  status: string;
  prioridade: string;
  responsavel: string;
  prazo: string;
  descricao?: string;
}

export default function Tarefas() {
  const { usuario } = useAuth();
  const [tarefas, setTarefas] = useState<TarefaDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);

  useEffect(() => {
    if (!usuario) return;
    const filtro = usuario.isAdmin ? {} : { departamento_id: usuario.departamento };
    getTarefas(filtro).then(setTarefas).catch(console.error);
    getDepartamentos().then(setDepartamentos).catch(console.error);
  }, [usuario?.id, usuario?.isAdmin, usuario?.departamento]);
  const [activeTab, setActiveTab] = useState<"todas" | "minhas">("todas");
  const [selectedDept, setSelectedDept] = useState<string>("todos");
  const [selectedStatus, setSelectedStatus] = useState<string>("todos");
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>("todos");
  const [selectedTipo, setSelectedTipo] = useState<string>("todos");
  const [busca, setBusca] = useState<string>("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVTarefa[]>([]);
  const [importStep, setImportStep] = useState<"upload" | "preview" | "success">("upload");
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importando, setImportando] = useState(false);
  const [importCount, setImportCount] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  const filteredTasks = tarefas.filter((task) => {
    if (activeTab === "minhas" && usuario) {
      const isResponsavel = task.responsavel_id === usuario.id;
      const isPessoal = task.visibilidade === "pessoal";
      if (!isResponsavel && !isPessoal) return false;
    }
    if (selectedDept !== "todos" && task.departamento_id !== selectedDept) return false;
    if (selectedStatus === "atrasadas") {
      if (!task.prazo || task.prazo >= today || task.status === "concluido") return false;
    } else if (selectedStatus !== "todos" && task.status !== selectedStatus) return false;
    if (selectedPrioridade !== "todos" && task.prioridade !== selectedPrioridade) return false;
    if (selectedTipo !== "todos" && task.tipo !== selectedTipo) return false;
    if (busca.trim()) {
      const q = busca.toLowerCase();
      const matches =
        task.titulo.toLowerCase().includes(q) ||
        task.responsavel?.nome.toLowerCase().includes(q) ||
        task.tags?.some((tag) => tag.toLowerCase().includes(q));
      if (!matches) return false;
    }
    return true;
  });

  const statusCount = {
    planejamento: tarefas.filter((t) => t.status === "planejamento").length,
    "em-andamento": tarefas.filter((t) => t.status === "em-andamento").length,
    concluido: tarefas.filter((t) => t.status === "concluido").length,
    atrasadas: tarefas.filter((t) => t.prazo && t.prazo < today && t.status !== "concluido").length,
  };

  const toggleStatus = (status: string) =>
    setSelectedStatus((prev) => (prev === status ? "todos" : status));

  const handleOpenImportModal = () => {
    setIsImportModalOpen(true);
    setImportStep("upload");
    setCsvFile(null);
    setParsedData([]);
    setImportErrors([]);
  };

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
    setIsDragging(false);
    setCsvFile(null);
    setParsedData([]);
    setImportErrors([]);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "text/csv") {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    setCsvFile(file);
    setImportErrors([]);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const validData: CSVTarefa[] = [];

        results.data.forEach((row: any, index) => {
          // Validação de campos obrigatórios
          if (!row.titulo || !row.titulo.trim()) {
            errors.push(`Linha ${index + 2}: Título é obrigatório`);
            return;
          }
          if (!row.departamento || !row.departamento.trim()) {
            errors.push(`Linha ${index + 2}: Departamento é obrigatório`);
            return;
          }
          if (!row.responsavel || !row.responsavel.trim()) {
            errors.push(`Linha ${index + 2}: Responsável é obrigatório`);
            return;
          }
          if (!row.prazo || !row.prazo.trim()) {
            errors.push(`Linha ${index + 2}: Prazo é obrigatório`);
            return;
          }

          // Validação de departamento válido
          const deptIds = departamentos.map((d) => d.id);
          const deptNomes = departamentos.map((d) => d.nome.toLowerCase());
          const dept = row.departamento.toLowerCase().trim();
          
          let deptId = "";
          if (deptIds.includes(dept)) {
            deptId = dept;
          } else {
            const deptIndex = deptNomes.indexOf(dept);
            if (deptIndex >= 0) {
              deptId = deptIds[deptIndex];
            } else {
              errors.push(`Linha ${index + 2}: Departamento "${row.departamento}" inválido. Use: marketing, ops, comercial ou produto`);
              return;
            }
          }

          // Validação de status
          const validStatus = ["planejamento", "em-andamento", "concluido"];
          const status = row.status ? row.status.toLowerCase().trim() : "planejamento";
          if (!validStatus.includes(status)) {
            errors.push(`Linha ${index + 2}: Status "${row.status}" inválido. Use: planejamento, em-andamento ou concluido`);
            return;
          }

          // Validação de prioridade
          const validPrioridade = ["baixa", "media", "alta"];
          const prioridade = row.prioridade ? row.prioridade.toLowerCase().trim() : "media";
          if (!validPrioridade.includes(prioridade)) {
            errors.push(`Linha ${index + 2}: Prioridade "${row.prioridade}" inválida. Use: baixa, media ou alta`);
            return;
          }

          validData.push({
            titulo: row.titulo.trim(),
            departamento: deptId,
            status: status,
            prioridade: prioridade,
            responsavel: row.responsavel.trim(),
            prazo: row.prazo.trim(),
            descricao: row.descricao ? row.descricao.trim() : "",
          });
        });

        if (errors.length > 0) {
          setImportErrors(errors);
        } else if (validData.length > 0) {
          setParsedData(validData);
          setImportStep("preview");
        } else {
          setImportErrors(["Nenhuma tarefa válida encontrada no arquivo CSV"]);
        }
      },
      error: (error) => {
        setImportErrors([`Erro ao processar arquivo: ${error.message}`]);
      },
    });
  };

  const handleConfirmImport = async () => {
    if (!usuario) return;
    setImportando(true);
    setImportCount(0);

    const erros: string[] = [];
    let salvos = 0;

    for (const task of parsedData) {
      try {
        await criarTarefa({
          titulo: task.titulo,
          descricao: task.descricao || undefined,
          departamento_id: task.departamento,
          status: task.status,
          prioridade: task.prioridade,
          prazo: task.prazo || undefined,
          tags: [],
          tipo: "outro",
          visibilidade: "departamento",
          criado_por: usuario.id,
        });
        salvos++;
        setImportCount(salvos);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro desconhecido";
        erros.push(`"${task.titulo}": ${msg}`);
      }
    }

    setImportando(false);

    if (erros.length > 0) {
      setImportErrors(erros);
      setImportStep("upload");
    } else {
      // Recarrega a lista do banco após importar tudo
      const novas = await getTarefas();
      setTarefas(novas);
      setImportStep("success");
      setTimeout(() => handleCloseImportModal(), 2500);
    }
  };

  const downloadExemploCSV = () => {
    const csvContent = `titulo,departamento,status,prioridade,responsavel,prazo,descricao
Revisar proposta comercial,comercial,planejamento,alta,João Silva,2026-03-01,Revisar proposta enviada para cliente XYZ
Atualizar documentação técnica,produto,em-andamento,media,Maria Santos,2026-02-25,Atualizar docs da API v2
Planejar evento de networking,marketing,planejamento,baixa,Ana Costa,2026-03-15,Organizar evento para parceiros
Configurar novo servidor,ops,em-andamento,alta,Carlos Lima,2026-02-20,Setup do servidor de produção`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "exemplo-tarefas.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusLabels: Record<string, string> = {
    planejamento: "Planejamento",
    "em-andamento": "Em Andamento",
    concluido: "Concluído",
  };

  const prioridadeLabels: Record<string, string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
  };

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px] mb-2">
              Tarefas
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[16px]">
              Gerencie todas as tarefas dos departamentos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/tarefas/kanban"
              className="bg-rise-raised border border-rise-line text-rise-fg px-4 py-2 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-rise-subtle hover:border-[#14E9BC] transition-colors"
            >
              <LayoutGrid size={18} />
              Ver Kanban por Área
            </Link>
            <button
              onClick={handleOpenImportModal}
              className="bg-rise-raised border border-rise-line text-rise-fg px-5 py-2.5 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-rise-subtle hover:border-[#14E9BC] transition-colors"
            >
              <Upload size={18} />
              Importar Tarefas
            </button>
            <Link to="/tarefas/nova">
              <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
                <Plus size={20} />
                Nova Tarefa
              </button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-rise-surface border border-rise-line rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("todas")}
            className={`px-5 py-2 rounded-md font-['Inter:Medium',sans-serif] text-[14px] transition-colors ${
              activeTab === "todas"
                ? "bg-[#14E9BC] text-[#000]"
                : "text-rise-fg-2 hover:text-rise-fg"
            }`}
          >
            Todas as Tarefas
          </button>
          <button
            onClick={() => setActiveTab("minhas")}
            className={`flex items-center gap-2 px-5 py-2 rounded-md font-['Inter:Medium',sans-serif] text-[14px] transition-colors ${
              activeTab === "minhas"
                ? "bg-[#14E9BC] text-[#000]"
                : "text-rise-fg-2 hover:text-rise-fg"
            }`}
          >
            <User size={16} />
            Minhas Tarefas
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => toggleStatus("planejamento")}
            className={`bg-rise-surface border rounded-lg p-6 text-left transition-colors hover:border-[#6B8AFF]/60 ${selectedStatus === "planejamento" ? "border-[#6B8AFF]" : "border-rise-line"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Planejamento
              </p>
              <span className="px-2 py-1 rounded bg-[#6B8AFF]/20 text-[#6B8AFF] text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                {statusCount.planejamento}
              </span>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {statusCount.planejamento}
            </p>
          </button>

          <button
            onClick={() => toggleStatus("em-andamento")}
            className={`bg-rise-surface border rounded-lg p-6 text-left transition-colors hover:border-[#28d939]/60 ${selectedStatus === "em-andamento" ? "border-[#28d939]" : "border-rise-line"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Em Andamento
              </p>
              <span className="px-2 py-1 rounded bg-[#28d939]/20 text-[#28d939] text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                {statusCount["em-andamento"]}
              </span>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {statusCount["em-andamento"]}
            </p>
          </button>

          <button
            onClick={() => toggleStatus("concluido")}
            className={`bg-rise-surface border rounded-lg p-6 text-left transition-colors hover:border-[#bdbdbd]/60 ${selectedStatus === "concluido" ? "border-[#bdbdbd]" : "border-rise-line"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Concluídas
              </p>
              <span className="px-2 py-1 rounded bg-[#bdbdbd]/20 text-rise-fg-2 text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                {statusCount.concluido}
              </span>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-rise-fg text-[28px]">
              {statusCount.concluido}
            </p>
          </button>

          <button
            onClick={() => toggleStatus("atrasadas")}
            className={`bg-rise-surface border rounded-lg p-6 text-left transition-colors hover:border-[#ec5d5e]/60 ${selectedStatus === "atrasadas" ? "border-[#ec5d5e]" : "border-rise-line"}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Atrasadas
              </p>
              <span className="px-2 py-1 rounded bg-[#ec5d5e]/20 text-[#ec5d5e] text-[12px] font-['Inter:Semi_Bold',sans-serif]">
                {statusCount.atrasadas}
              </span>
            </div>
            <p className="font-['Inter:Bold',sans-serif] text-[#ec5d5e] text-[28px]">
              {statusCount.atrasadas}
            </p>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-rise-surface border border-rise-line rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Filter size={20} className="text-rise-fg-2" />
              <span className="font-['Inter:Medium',sans-serif] text-rise-fg-2 text-[14px]">
                Filtros:
              </span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-rise-fg-4" />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar tarefas..."
                className="bg-rise-raised border border-rise-line rounded pl-9 pr-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none w-52"
              />
            </div>

            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Departamentos</option>
              {departamentos.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.nome}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Status</option>
              <option value="planejamento">Planejamento</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="atrasadas">Atrasadas</option>
            </select>

            <select
              value={selectedPrioridade}
              onChange={(e) => setSelectedPrioridade(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todas as Prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>

            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="bg-rise-raised border border-rise-line rounded px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Tipos</option>
              <option value="backend">Backend</option>
              <option value="frontend">Frontend</option>
              <option value="infra">Infra</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="comercial">Comercial</option>
              <option value="ops">Operações</option>
              <option value="pesquisa">Pesquisa</option>
              <option value="outro">Outro</option>
            </select>

            {(selectedDept !== "todos" || selectedStatus !== "todos" || selectedPrioridade !== "todos" || selectedTipo !== "todos" || busca.trim()) && (
              <button
                onClick={() => {
                  setSelectedDept("todos");
                  setSelectedStatus("todos");
                  setSelectedPrioridade("todos");
                  setSelectedTipo("todos");
                  setBusca("");
                }}
                className="text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif] text-[14px]"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Tasks Grid */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map((task) => {
              const dept = departamentos.find((d) => d.id === task.departamento_id);
              return (
                <TaskCard
                  key={task.id}
                  id={task.id}
                  titulo={task.titulo}
                  departamento={dept?.nome ?? task.departamento_id}
                  status={task.status}
                  prioridade={task.prioridade}
                  responsavel={task.responsavel?.nome ?? "—"}
                  prazo={task.prazo ?? ""}
                  descricao={task.descricao ?? undefined}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-rise-surface border border-rise-line rounded-lg p-12 text-center">
            <p className="text-rise-fg-2 font-['Inter:Regular',sans-serif] text-[16px]">
              Nenhuma tarefa encontrada com os filtros selecionados
            </p>
          </div>
        )}
      </div>

      {/* Modal de Importação */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-rise-surface border border-rise-line rounded-xl max-w-[900px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-rise-line">
              <div>
                <h2 className="font-['Inter:Bold',sans-serif] text-rise-fg text-[24px]">
                  Importar Tarefas via CSV
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px] mt-1">
                  {importStep === "upload" && "Faça upload do arquivo CSV com suas tarefas"}
                  {importStep === "preview" && `${parsedData.length} tarefas encontradas - Revise antes de importar`}
                  {importStep === "success" && "Importação concluída com sucesso!"}
                </p>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-rise-raised transition-colors"
              >
                <X size={20} className="text-rise-fg-2" />
              </button>
            </div>

            {/* Step: Upload */}
            {importStep === "upload" && (
              <div className="p-6">
                {/* Instruções */}
                <div className="bg-rise-raised border border-rise-line rounded-lg p-4 mb-6">
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[14px] mb-3">
                    Formato do arquivo CSV
                  </h3>
                  <div className="space-y-2 text-[13px] font-['Inter:Regular',sans-serif] text-rise-fg-2">
                    <p>• <strong className="text-rise-fg">Colunas obrigatórias:</strong> titulo, departamento, responsavel, prazo</p>
                    <p>• <strong className="text-rise-fg">Colunas opcionais:</strong> status, prioridade, descricao</p>
                    <p>• <strong className="text-rise-fg">Departamentos válidos:</strong> marketing, ops, comercial, produto</p>
                    <p>• <strong className="text-rise-fg">Status válidos:</strong> planejamento, em-andamento, concluido</p>
                    <p>• <strong className="text-rise-fg">Prioridades válidas:</strong> baixa, media, alta</p>
                    <p>• <strong className="text-rise-fg">Formato de data:</strong> AAAA-MM-DD (ex: 2026-03-15)</p>
                  </div>
                  <button
                    onClick={downloadExemploCSV}
                    className="mt-4 text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif] text-[13px] flex items-center gap-2"
                  >
                    <FileSpreadsheet size={16} />
                    Baixar arquivo CSV de exemplo
                  </button>
                </div>

                {/* Upload Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-10 text-center transition-all cursor-pointer ${
                    isDragging
                      ? "border-[#14E9BC] bg-[#14E9BC]/10"
                      : "border-rise-line hover:border-rise-fg-4 hover:bg-rise-raised"
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <label htmlFor="csv-upload" className="cursor-pointer">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: "#14E9BC20" }}
                    >
                      <FileSpreadsheet size={40} className="text-[#14E9BC]" />
                    </div>
                    {csvFile ? (
                      <div>
                        <p className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[16px] mb-1">
                          {csvFile.name}
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px]">
                          {(csvFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    ) : (
                      <>
                        <p className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[18px] mb-2">
                          Arraste e solte seu arquivo CSV aqui
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[14px] mb-3">
                          ou clique para selecionar
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-rise-fg-4 text-[12px]">
                          Apenas arquivos .csv
                        </p>
                      </>
                    )}
                  </label>
                </div>

                {/* Erros */}
                {importErrors.length > 0 && (
                  <div className="mt-6 bg-[#ec5d5e]/10 border border-[#ec5d5e]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={20} className="text-[#ec5d5e] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#ec5d5e] text-[14px] mb-2">
                          Erros encontrados no arquivo:
                        </h4>
                        <ul className="space-y-1">
                          {importErrors.map((error, index) => (
                            <li
                              key={index}
                              className="font-['Inter:Regular',sans-serif] text-[#ec5d5e] text-[13px]"
                            >
                              • {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Preview */}
            {importStep === "preview" && (
              <div className="p-6">
                <div className="bg-rise-raised border border-rise-line rounded-lg overflow-hidden mb-6">
                  <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-rise-surface sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[13px] border-b border-rise-line">
                            Título
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[13px] border-b border-rise-line">
                            Departamento
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[13px] border-b border-rise-line">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[13px] border-b border-rise-line">
                            Prioridade
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[13px] border-b border-rise-line">
                            Responsável
                          </th>
                          <th className="px-4 py-3 text-left font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[13px] border-b border-rise-line">
                            Prazo
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.map((task, index) => (
                          <tr key={index} className="border-b border-rise-line hover:bg-rise-raised">
                            <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-rise-fg text-[13px]">
                              {task.titulo}
                            </td>
                            <td className="px-4 py-3">
                              {(() => {
                                const dept = departamentos.find((d) => d.id === task.departamento);
                                return (
                                  <span
                                    className="px-2 py-1 rounded text-[11px] font-['Inter:Medium',sans-serif]"
                                    style={{
                                      backgroundColor: `${dept?.cor ?? "#14E9BC"}20`,
                                      color: dept?.cor ?? "#14E9BC",
                                    }}
                                  >
                                    {dept?.nome ?? task.departamento}
                                  </span>
                                );
                              })()}
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 rounded bg-rise-raised text-rise-fg-2 text-[11px] font-['Inter:Regular',sans-serif]">
                                {statusLabels[task.status]}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-[11px] font-['Inter:Medium',sans-serif] ${
                                  task.prioridade === "alta"
                                    ? "bg-[#ec5d5e]/20 text-[#ec5d5e]"
                                    : task.prioridade === "media"
                                    ? "bg-[#f59e0b]/20 text-[#f59e0b]"
                                    : "bg-[#6B8AFF]/20 text-[#6B8AFF]"
                                }`}
                              >
                                {prioridadeLabels[task.prioridade]}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px]">
                              {task.responsavel}
                            </td>
                            <td className="px-4 py-3 font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[13px]">
                              {new Date(task.prazo).toLocaleDateString("pt-BR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#14E9BC]/10 border border-[#14E9BC]/30 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle size={20} className="text-[#14E9BC]" />
                    <p className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
                      {parsedData.length} {parsedData.length === 1 ? "tarefa pronta" : "tarefas prontas"} para importação
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Success */}
            {importStep === "success" && (
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-[#28d939]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} className="text-[#28d939]" />
                </div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-rise-fg text-[24px] mb-3">
                  {parsedData.length} {parsedData.length === 1 ? "Tarefa Importada" : "Tarefas Importadas"}!
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[15px]">
                  As tarefas foram adicionadas com sucesso ao sistema.
                </p>
              </div>
            )}

            {/* Modal Footer */}
            {importStep !== "success" && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-rise-line">
                <button
                  onClick={handleCloseImportModal}
                  className="px-5 py-2.5 rounded-lg bg-rise-raised text-rise-fg-2 font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-rise-raised transition-colors"
                >
                  Cancelar
                </button>
                {importStep === "preview" && (
                  <button
                    onClick={handleConfirmImport}
                    disabled={importando}
                    className="px-5 py-2.5 rounded-lg bg-[#14E9BC] text-[#000] font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importando
                      ? `Importando... (${importCount}/${parsedData.length})`
                      : `Importar ${parsedData.length} tarefa${parsedData.length !== 1 ? "s" : ""}`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
