import React, { useState, useEffect, FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { criarTarefa, criarTarefaLinks } from "../../lib/services/tarefas";
import { criarRecorrencia } from "../../lib/services/tarefaRecorrencias";
import { getUsuarios, type UsuarioDB } from "../../lib/services/usuarios";
import { useAuth } from "../context/AuthContext";
import { TarefaLink } from "../types";
import { ArrowLeft, Save, X, Plus, ExternalLink, Trash2 } from "lucide-react";

export default function NovaTarefa() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioDB[]>([]);

  useEffect(() => {
    getDepartamentos().then(setDepartamentos).catch(console.error);
    getUsuarios().then(setUsuarios).catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    departamento: "",
    status: "planejamento",
    prioridade: "media",
    responsavel_id: "",
    prazo: "",
    tags: "",
    tipo: "outro",
    visibilidade: "departamento",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [links, setLinks] = useState<TarefaLink[]>([]);
  const [novoLink, setNovoLink] = useState({ titulo: "", url: "", tipo: "outro" as TarefaLink["tipo"] });

  const [repetir, setRepetir] = useState(false);
  const [recorrencia, setRecorrencia] = useState({
    frequencia: "semanal" as "diaria" | "semanal" | "mensal",
    dia_semana: String(new Date().getDay()),
    dia_mes: String(new Date().getDate()),
    data_inicio: new Date().toISOString().split("T")[0],
    data_fim: "",
    antecedencia_dias: "0",
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.departamento) {
      newErrors.departamento = "Selecione um departamento";
    }

    if (!repetir && !formData.prazo) {
      newErrors.prazo = "Data de prazo é obrigatória";
    }

    if (repetir) {
      if (!recorrencia.data_inicio) {
        newErrors.data_inicio = "Data de início é obrigatória";
      }
      if (recorrencia.frequencia === "mensal") {
        const d = Number(recorrencia.dia_mes);
        if (!d || d < 1 || d > 31) {
          newErrors.dia_mes = "Informe um dia do mês entre 1 e 31";
        }
      }
      if (recorrencia.data_fim && recorrencia.data_fim < recorrencia.data_inicio) {
        newErrors.data_fim = "Data de término deve ser após a data de início";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !usuario) return;

    try {
      if (repetir) {
        await criarRecorrencia({
          titulo: formData.titulo,
          descricao: formData.descricao || undefined,
          departamento_id: formData.departamento,
          prioridade: formData.prioridade,
          tipo: formData.tipo,
          visibilidade: formData.visibilidade,
          responsavel_id: formData.responsavel_id || undefined,
          tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
          frequencia: recorrencia.frequencia,
          dia_semana: recorrencia.frequencia === "semanal" ? Number(recorrencia.dia_semana) : undefined,
          dia_mes: recorrencia.frequencia === "mensal" ? Number(recorrencia.dia_mes) : undefined,
          data_inicio: recorrencia.data_inicio,
          data_fim: recorrencia.data_fim || undefined,
          antecedencia_dias: Number(recorrencia.antecedencia_dias) || 0,
          criado_por: usuario.id,
        });
        navigate("/tarefas/recorrencias");
        return;
      }

      const tarefa = await criarTarefa({
        titulo: formData.titulo,
        descricao: formData.descricao || undefined,
        departamento_id: formData.departamento,
        status: formData.status,
        prioridade: formData.prioridade,
        responsavel_id: formData.responsavel_id || undefined,
        prazo: formData.prazo || undefined,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        tipo: formData.tipo,
        visibilidade: formData.visibilidade,
        criado_por: usuario.id,
      });

      // Salva os links no banco após criar a tarefa
      if (links.length > 0) {
        await criarTarefaLinks(tarefa.id, links);
      }

      navigate("/tarefas");
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
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
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/tarefas"
            className="flex items-center gap-2 text-rise-fg-2 hover:text-[#14E9BC] transition-colors mb-4 font-['Inter:Medium',sans-serif] text-[14px]"
          >
            <ArrowLeft size={20} />
            Voltar para Tarefas
          </Link>

          <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px] mb-2">
            Nova Tarefa
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[16px]">
            Preencha os dados abaixo para criar uma nova tarefa
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-rise-surface border border-rise-line rounded-lg p-8">
            <div className="space-y-6">
              {/* Título */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => handleChange("titulo", e.target.value)}
                  placeholder="Ex: Campanha de lançamento Q1"
                  className={`w-full bg-rise-raised border ${
                    errors.titulo ? "border-[#ff6b6b]" : "border-rise-line"
                  } rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                />
                {errors.titulo && (
                  <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                    {errors.titulo}
                  </p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => handleChange("descricao", e.target.value)}
                  placeholder="Descreva os detalhes e objetivos da tarefa..."
                  rows={4}
                  className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none resize-none"
                />
              </div>

              {/* Departamento e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Departamento *
                  </label>
                  <select
                    value={formData.departamento}
                    onChange={(e) => handleChange("departamento", e.target.value)}
                    className={`w-full bg-rise-raised border ${
                      errors.departamento ? "border-[#ff6b6b]" : "border-rise-line"
                    } rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
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
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
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
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) => handleChange("prioridade", e.target.value)}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Responsável
                  </label>
                  <select
                    value={formData.responsavel_id}
                    onChange={(e) => handleChange("responsavel_id", e.target.value)}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="">Sem responsável</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prazo */}
              {!repetir && (
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Data de Prazo *
                  </label>
                  <input
                    type="date"
                    value={formData.prazo}
                    onChange={(e) => handleChange("prazo", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full bg-rise-raised border ${
                      errors.prazo ? "border-[#ff6b6b]" : "border-rise-line"
                    } rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                  />
                  {errors.prazo && (
                    <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                      {errors.prazo}
                    </p>
                  )}
                </div>
              )}

              {/* Repetir tarefa */}
              <div className="border-t border-rise-line pt-6">
                <label className="flex items-center gap-3 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={repetir}
                    onChange={(e) => setRepetir(e.target.checked)}
                    className="w-4 h-4 accent-[#14E9BC]"
                  />
                  <span className="font-['Inter:Medium',sans-serif] text-rise-fg text-[14px]">
                    🔁 Repetir tarefa
                  </span>
                </label>
                <p className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] mb-4">
                  Cria automaticamente uma nova tarefa a cada ocorrência, sem precisar recriar manualmente.
                </p>

                {repetir && (
                  <div className="space-y-6 bg-rise-raised/40 border border-rise-line rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                          Frequência
                        </label>
                        <select
                          value={recorrencia.frequencia}
                          onChange={(e) =>
                            setRecorrencia((prev) => ({
                              ...prev,
                              frequencia: e.target.value as "diaria" | "semanal" | "mensal",
                            }))
                          }
                          className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                        >
                          <option value="diaria">Diariamente</option>
                          <option value="semanal">Semanalmente</option>
                          <option value="mensal">Mensalmente</option>
                        </select>
                      </div>

                      {recorrencia.frequencia === "semanal" && (
                        <div>
                          <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                            Dia da semana
                          </label>
                          <select
                            value={recorrencia.dia_semana}
                            onChange={(e) =>
                              setRecorrencia((prev) => ({ ...prev, dia_semana: e.target.value }))
                            }
                            className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                          >
                            <option value="0">Domingo</option>
                            <option value="1">Segunda-feira</option>
                            <option value="2">Terça-feira</option>
                            <option value="3">Quarta-feira</option>
                            <option value="4">Quinta-feira</option>
                            <option value="5">Sexta-feira</option>
                            <option value="6">Sábado</option>
                          </select>
                        </div>
                      )}

                      {recorrencia.frequencia === "mensal" && (
                        <div>
                          <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                            Dia do mês
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={31}
                            value={recorrencia.dia_mes}
                            onChange={(e) =>
                              setRecorrencia((prev) => ({ ...prev, dia_mes: e.target.value }))
                            }
                            className={`w-full bg-rise-raised border ${
                              errors.dia_mes ? "border-[#ff6b6b]" : "border-rise-line"
                            } rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                          />
                          {errors.dia_mes && (
                            <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                              {errors.dia_mes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                          Data de início *
                        </label>
                        <input
                          type="date"
                          value={recorrencia.data_inicio}
                          min={new Date().toISOString().split("T")[0]}
                          onChange={(e) =>
                            setRecorrencia((prev) => ({ ...prev, data_inicio: e.target.value }))
                          }
                          className={`w-full bg-rise-raised border ${
                            errors.data_inicio ? "border-[#ff6b6b]" : "border-rise-line"
                          } rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                        />
                        {errors.data_inicio && (
                          <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                            {errors.data_inicio}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                          Data de término (opcional)
                        </label>
                        <input
                          type="date"
                          value={recorrencia.data_fim}
                          min={recorrencia.data_inicio}
                          onChange={(e) =>
                            setRecorrencia((prev) => ({ ...prev, data_fim: e.target.value }))
                          }
                          className={`w-full bg-rise-raised border ${
                            errors.data_fim ? "border-[#ff6b6b]" : "border-rise-line"
                          } rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                        />
                        {errors.data_fim && (
                          <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                            {errors.data_fim}
                          </p>
                        )}
                        <p className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                          Deixe em branco para repetir indefinidamente
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                        Antecedência (dias)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={recorrencia.antecedencia_dias}
                        onChange={(e) =>
                          setRecorrencia((prev) => ({ ...prev, antecedencia_dias: e.target.value }))
                        }
                        className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                      />
                      <p className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                        Quantos dias antes da data a tarefa já deve aparecer criada. 0 = criada no próprio dia.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Tipo e Visibilidade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Tipo
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
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
                  <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                    Visibilidade
                  </label>
                  <select
                    value={formData.visibilidade}
                    onChange={(e) => handleChange("visibilidade", e.target.value)}
                    className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    <option value="publica">Pública</option>
                    <option value="departamento">Departamento</option>
                    <option value="pessoal">Pessoal</option>
                  </select>
                </div>
              </div>

              {/* Links */}
              {!repetir && (
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                  Links Externos
                </label>

                {links.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {links.map((link) => (
                      <div key={link.id} className="flex items-center gap-3 bg-rise-raised border border-rise-line rounded-lg px-4 py-2">
                        <ExternalLink size={14} className="text-[#14E9BC] shrink-0" />
                        <span className="text-rise-fg text-[13px] font-['Inter:Regular',sans-serif] flex-1 truncate">
                          {link.titulo}
                        </span>
                        <span className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] truncate max-w-[180px]">
                          {link.url}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoverLink(link.id)}
                          className="text-rise-fg-3 hover:text-[#ff6b6b] transition-colors shrink-0"
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
                    className="bg-rise-raised border border-rise-line rounded-lg px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={novoLink.url}
                    onChange={(e) => setNovoLink((prev) => ({ ...prev, url: e.target.value }))}
                    placeholder="URL (ex: https://...)"
                    className="bg-rise-raised border border-rise-line rounded-lg px-4 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                  <select
                    value={novoLink.tipo}
                    onChange={(e) => setNovoLink((prev) => ({ ...prev, tipo: e.target.value as TarefaLink["tipo"] }))}
                    className="bg-rise-raised border border-rise-line rounded-lg px-3 py-2 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
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
                    className="bg-rise-raised border border-rise-line text-[#14E9BC] px-4 py-2 rounded-lg hover:bg-rise-subtle transition-colors flex items-center gap-2 font-['Inter:Medium',sans-serif] text-[14px] whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Adicionar
                  </button>
                </div>
              </div>
              )}

              {/* Tags */}
              <div>
                <label className="block font-['Inter:Medium',sans-serif] text-rise-fg text-[14px] mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange("tags", e.target.value)}
                  placeholder="Separe as tags com vírgulas (ex: campanha, marketing, Q1)"
                  className="w-full bg-rise-raised border border-rise-line rounded-lg px-4 py-3 text-rise-fg font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                />
                <p className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] mt-1">
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
              {repetir ? "Criar Recorrência" : "Criar Tarefa"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/tarefas")}
              className="bg-rise-raised border border-rise-line text-rise-fg px-6 py-3 rounded-lg font-['Inter:Medium',sans-serif] text-[14px] flex items-center gap-2 hover:bg-rise-subtle transition-colors"
            >
              <X size={20} />
              Cancelar
            </button>
          </div>

          <p className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] mt-4">
            * Campos obrigatórios
          </p>
        </form>
      </div>
    </div>
  );
}
