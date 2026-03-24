import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { departamentos } from "../data/mockData";
import { TarefaLink } from "../types";
import { ArrowLeft, Save, X, Plus, ExternalLink, Trash2 } from "lucide-react";

export default function NovaTarefa() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    departamento: "",
    status: "planejamento",
    prioridade: "media",
    responsavel: "",
    prazo: "",
    tags: "",
    tipo: "outro",
    visibilidade: "departamento",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<TarefaLink[]>([]);
  const [novoLink, setNovoLink] = useState({ titulo: "", url: "", tipo: "outro" as TarefaLink["tipo"] });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.departamento) {
      newErrors.departamento = "Selecione um departamento";
    }

    if (!formData.responsavel.trim()) {
      newErrors.responsavel = "Responsável é obrigatório";
    }

    if (!formData.prazo) {
      newErrors.prazo = "Data de prazo é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      navigate("/tarefas");
    }
  };

  const handleAdicionarLink = () => {
    if (!novoLink.titulo.trim() || !novoLink.url.trim()) return;
    const url = novoLink.url.startsWith("http") ? novoLink.url : `https://${novoLink.url}`;
    setLinks((prev) => [...prev, { id: `link-${Date.now()}`, ...novoLink, url }]);
    setNovoLink({ titulo: "", url: "", tipo: "outro" });
  };

  const handleRemoverLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/tarefas"
            className="flex items-center gap-2 text-[#bdbdbd] hover:text-[#14E9BC] transition-colors mb-4 font-['Inter:Medium',sans-serif] text-[14px]"
          >
            <ArrowLeft size={20} />
            Voltar para Tarefas
          </Link>

          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
            Nova Tarefa
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
            Preencha os dados abaixo para criar uma nova tarefa
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-8">
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Ex: Campanha de lançamento Q1"
                  className={`w-full bg-[#1a1a1a] border ${
                    errors.titulo ? "border-[#ff6b6b]" : "border-[#333]"
                  } rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                />
                {errors.titulo && (
                  <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                    {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descreva os detalhes e objetivos da tarefa..."
                  rows={4}
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none resize-none"
                />
              </div>

              {/* Departamento e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Departamento *
                  </label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => handleChange("departamento", e.target.value)}
                    className={`w-full bg-[#1a1a1a] border ${
                      errors.departamento ? "border-[#ff6b6b]" : "border-[#333]"
                    } rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                  >
                    <option value="">Selecione um departamento</option>
                    {departamentos.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nome}
                      </option>
                    ))}
                  </select>
                  {errors.departamento && (
                    <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                      {errors.departamento}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="planejamento">Planejamento</option>
                    <option value="em-andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="pausado">Pausado</option>
                  </select>
                </div>
              </div>

              {/* Prioridade e Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => handleChange("prioridade", e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Responsável *
                  </label>
                  <input
                    type="text"
                    value={formData.responsavel}
                    onChange={(e) => handleChange("responsavel", e.target.value)}
                    placeholder="Nome do responsável"
                    className={`w-full bg-[#1a1a1a] border ${
                      errors.responsavel ? "border-[#ff6b6b]" : "border-[#333]"
                    } rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                  />
                  {errors.responsavel && (
                    <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                      {errors.responsavel}
                    </p>
                  )}
                </div>
              </div>

              {/* Prazo */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                  Data de Prazo *
                </label>
                <input
                  type="date"
                  value={formData.prazo}
                  onChange={(e) => handleChange("prazo", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full bg-[#1a1a1a] border ${
                    errors.prazo ? "border-[#ff6b6b]" : "border-[#333]"
                  } rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                />
                {errors.prazo && (
                  <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                    {errors.prazo}
                  </p>
                )}
              </div>

              {/* Tipo e Visibilidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
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
                </div>

                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                    Visibilidade
                  </label>
                  <select
                    value={formData.visibilidade}
                    onChange={(e) => handleChange("visibilidade", e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="publica">Pública</option>
                    <option value="departamento">Departamento</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
              </div>

              {/* Links */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                  Links Externos
                </label>

                {links.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {links.map((link) => (
                      <div key={link.id} className="flex items-center gap-3 bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2">
                        <ExternalLink size={14} className="text-[#14E9BC] shrink-0" />
                        <span className="text-[#eee] text-[13px] font-['Inter:Regular',sans-serif] flex-1 truncate">
                          {link.titulo}
                        </span>
                        <span className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] truncate max-w-[180px]">
                          {link.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverLink(link.id)}
                          className="text-[#666] hover:text-[#ff6b6b] transition-colors shrink-0"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-3">
                  <input
                    type="text"
                    value={novoLink.titulo}
                    onChange={(e) => setNovoLink((prev) => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título do link"
                    className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={novoLink.url}
                    onChange={(e) => setNovoLink((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="URL (ex: https://...)"
                    className="bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                  <select
                    value={novoLink.tipo}
                    onChange={(e) => setNovoLink((prev) => ({ ...prev, tipo: e.target.value as TarefaLink["tipo"] }))}
                    className="bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="figma">Figma</option>
                    <option value="drive">Drive</option>
                    <option value="notion">Notion</option>
                    <option value="github">GitHub</option>
                    <option value="jira">Jira</option>
                    <option value="outro">Outro</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAdicionarLink}
                    className="bg-[#1a1a1a] border border-[#333] text-[#14E9BC] px-4 py-2 rounded-lg hover:bg-[#222] transition-colors flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[14px] whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="Separe as tags com vírgulas (ex: campanha, marketing, Q1)"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                />
                <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                  Use vírgulas para separar múltiplas tags
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-6">
            <button
              type="submit"
              className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors"
            >
              <Save size={20} />
              Criar Tarefa
            </button>
            <button
              type="button"
              onClick={() => navigate("/tarefas")}
              className="bg-[#1a1a1a] border border-[#333] text-[#eee] px-6 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#222] transition-colors"
            >
              <X size={20} />
              Cancelar
            </button>
          </div>

          <p className="text-[#666] text-[12px] font-['Inter:Regular',sans-serif] mt-4">
            * Campos obrigatórios
          </p>
        </form>
      </div>
    </div>
  );
}
