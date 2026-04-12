import { useState, useEffect, useRef, FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getDocumentos,
  uploadDocumento,
  criarDocumentoLink,
  deletarDocumento,
  getDocumentoUrl,
  formatarTamanho,
  type DocumentoDB,
} from "../../lib/services/documentos";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import {
  FileText, Upload, Search, Filter, Grid, List, X, Link2,
  FileUp, Trash2, Download, ExternalLink, Plus, File,
} from "lucide-react";

const TIPO_LABELS: Record<string, string> = {
  documento: "Documento",
  manual: "Manual",
  apresentacao: "Apresentação",
  especificacao: "Especificação",
  guia: "Guia",
  diagrama: "Diagrama",
};

const TIPO_ICONE: Record<string, string> = {
  documento: "📄",
  manual: "📚",
  apresentacao: "📊",
  especificacao: "📋",
  guia: "🗺️",
  diagrama: "🔷",
};

export default function Documentos() {
  const { usuario } = useAuth();
  const [documentos, setDocumentos] = useState<DocumentoDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [selectedDept, setSelectedDept] = useState("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<"arquivo" | "link">("arquivo");
  const [isDragging, setIsDragging] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: "",
    departamento_id: "",
    tipo: "documento",
    url: "",
    file: null as File | null,
  });

  useEffect(() => {
    Promise.all([getDocumentos(), getDepartamentos()])
      .then(([docs, depts]) => {
        setDocumentos(docs);
        setDepartamentos(depts);
        if (depts.length > 0) setForm((f) => ({ ...f, departamento_id: depts[0].id }));
      })
      .catch(console.error)
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = documentos.filter((d) => {
    if (selectedDept !== "todos" && d.departamento_id !== selectedDept) return false;
    if (searchTerm && !d.titulo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }
  function handleDragLeave() { setIsDragging(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setForm((f) => ({ ...f, file, titulo: f.titulo || file.name.replace(/\.[^.]+$/, "") }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setForm((f) => ({ ...f, file, titulo: f.titulo || file.name.replace(/\.[^.]+$/, "") }));
  }

  function resetForm() {
    setForm({ titulo: "", departamento_id: departamentos[0]?.id ?? "", tipo: "documento", url: "", file: null });
    setErroForm(null);
    setUploadType("arquivo");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.titulo.trim()) { setErroForm("Título é obrigatório"); return; }
    if (!form.departamento_id) { setErroForm("Selecione um departamento"); return; }
    if (uploadType === "arquivo" && !form.file) { setErroForm("Selecione um arquivo"); return; }
    if (uploadType === "link" && !form.url.trim()) { setErroForm("Informe a URL do documento"); return; }
    if (!usuario?.id) return;

    setSalvando(true);
    setErroForm(null);
    try {
      let doc: DocumentoDB;
      if (uploadType === "arquivo" && form.file) {
        doc = await uploadDocumento(form.file, form.titulo, form.departamento_id, form.tipo, usuario.id);
      } else {
        doc = await criarDocumentoLink({
          titulo: form.titulo,
          departamento_id: form.departamento_id,
          tipo: form.tipo,
          autor_id: usuario.id,
          gitbook_url: form.url,
        });
      }
      setDocumentos((prev) => [doc, ...prev]);
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      setErroForm(err instanceof Error ? err.message : "Erro ao salvar documento");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(doc: DocumentoDB) {
    if (!window.confirm(`Excluir "${doc.titulo}"?`)) return;
    setExcluindo(doc.id);
    try {
      await deletarDocumento(doc.id, doc.storage_path);
      setDocumentos((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      console.error("Erro ao excluir:", err);
    } finally {
      setExcluindo(null);
    }
  }

  async function handleDownload(doc: DocumentoDB) {
    try {
      if (doc.gitbook_url) {
        window.open(doc.gitbook_url, "_blank");
        return;
      }
      if (doc.storage_path) {
        const url = await getDocumentoUrl(doc.storage_path);
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Erro ao abrir documento:", err);
    }
  }

  const isOwner = (doc: DocumentoDB) => doc.autor_id === usuario?.id;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-1">
              Documentos
            </h1>
            <p className="text-[#bdbdbd] text-[16px] font-['Inter:Regular',sans-serif]">
              {documentos.length} documento{documentos.length !== 1 ? "s" : ""} cadastrado{documentos.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-[#14E9BC] text-[#000] px-5 py-2.5 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors"
          >
            <Plus size={18} />
            Novo Documento
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
            <input
              type="text"
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-[#bdbdbd]" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-[#0f0f0f] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none"
            >
              <option value="todos">Todos os Departamentos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[#0f0f0f] border border-[#333] rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-[#14E9BC] text-[#000]" : "text-[#bdbdbd] hover:text-[#eee]"}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#14E9BC] text-[#000]" : "text-[#bdbdbd] hover:text-[#eee]"}`}
            >
              <Grid size={16} />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-[#555] text-[16px]">Carregando documentos...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-16 text-center">
            <FileText size={48} className="text-[#333] mx-auto mb-4" />
            <p className="text-[#eee] text-[18px] font-['Inter:Semi_Bold',sans-serif] mb-2">
              {searchTerm || selectedDept !== "todos" ? "Nenhum documento encontrado" : "Nenhum documento cadastrado"}
            </p>
            <p className="text-[#555] text-[14px] mb-6">
              {searchTerm || selectedDept !== "todos"
                ? "Tente ajustar os filtros"
                : "Adicione o primeiro documento clicando em Novo Documento"}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#222]">
                  <th className="text-left px-6 py-3 text-[#555] text-[12px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Documento</th>
                  <th className="text-left px-6 py-3 text-[#555] text-[12px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Tipo</th>
                  <th className="text-left px-6 py-3 text-[#555] text-[12px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Departamento</th>
                  <th className="text-left px-6 py-3 text-[#555] text-[12px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Autor</th>
                  <th className="text-left px-6 py-3 text-[#555] text-[12px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Tamanho</th>
                  <th className="text-left px-6 py-3 text-[#555] text-[12px] uppercase tracking-wider font-['Inter:Medium',sans-serif]">Data</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtrados.map((doc, i) => (
                  <tr
                    key={doc.id}
                    className={`hover:bg-[#141414] transition-colors ${i !== 0 ? "border-t border-[#1a1a1a]" : ""}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{TIPO_ICONE[doc.tipo] ?? "📄"}</span>
                        <div>
                          <p className="text-[#eee] text-[14px] font-['Inter:Medium',sans-serif]">{doc.titulo}</p>
                          {doc.gitbook_url && (
                            <p className="text-[#555] text-[11px] truncate max-w-[200px]">{doc.gitbook_url}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-[#1a1a1a] text-[#bdbdbd] px-2 py-1 rounded text-[12px]">
                        {TIPO_LABELS[doc.tipo] ?? doc.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {doc.departamento && (
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doc.departamento.cor }} />
                        )}
                        <span className="text-[#bdbdbd] text-[13px]">{doc.departamento?.nome ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#bdbdbd] text-[13px]">{doc.autor?.nome ?? "—"}</td>
                    <td className="px-6 py-4 text-[#bdbdbd] text-[13px]">{formatarTamanho(doc.tamanho_bytes)}</td>
                    <td className="px-6 py-4 text-[#555] text-[13px]">
                      {new Date(doc.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        {(doc.storage_path || doc.gitbook_url) && (
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 text-[#bdbdbd] hover:text-[#14E9BC] transition-colors"
                            title={doc.gitbook_url ? "Abrir link" : "Download"}
                          >
                            {doc.gitbook_url ? <ExternalLink size={15} /> : <Download size={15} />}
                          </button>
                        )}
                        {isOwner(doc) && (
                          <button
                            onClick={() => handleExcluir(doc)}
                            disabled={excluindo === doc.id}
                            className="p-1.5 text-[#bdbdbd] hover:text-[#ec5d5e] transition-colors disabled:opacity-40"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtrados.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#0f0f0f] border border-[#333] rounded-lg p-5 hover:border-[#555] transition-all flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{TIPO_ICONE[doc.tipo] ?? "📄"}</span>
                  <div className="flex items-center gap-1">
                    {(doc.storage_path || doc.gitbook_url) && (
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-[#555] hover:text-[#14E9BC] transition-colors"
                      >
                        {doc.gitbook_url ? <ExternalLink size={14} /> : <Download size={14} />}
                      </button>
                    )}
                    {isOwner(doc) && (
                      <button
                        onClick={() => handleExcluir(doc)}
                        disabled={excluindo === doc.id}
                        className="p-1.5 text-[#555] hover:text-[#ec5d5e] transition-colors disabled:opacity-40"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <h3 className="text-[#eee] text-[14px] font-['Inter:Medium',sans-serif] mb-2 line-clamp-2">{doc.titulo}</h3>
                <div className="mt-auto pt-3 border-t border-[#1a1a1a] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {doc.departamento && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: doc.departamento.cor }} />
                    )}
                    <span className="text-[#555] text-[12px]">{doc.departamento?.nome ?? "—"}</span>
                  </div>
                  <span className="text-[#555] text-[11px]">{formatarTamanho(doc.tamanho_bytes)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo documento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000]/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg w-full max-w-[560px]">
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#14E9BC]/20 flex items-center justify-center">
                  <FileText size={18} className="text-[#14E9BC]" />
                </div>
                <h2 className="text-[#eee] text-[20px] font-['Inter:Semi_Bold',sans-serif]">Novo Documento</h2>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); resetForm(); }}
                className="text-[#bdbdbd] hover:text-[#eee] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Tipo de upload */}
              <div className="flex gap-2 bg-[#1a1a1a] rounded-lg p-1">
                {(["arquivo", "link"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setUploadType(t)}
                    className={`flex-1 py-2 rounded-md text-[13px] font-['Inter:Medium',sans-serif] flex items-center justify-center gap-2 transition-all ${
                      uploadType === t ? "bg-[#14E9BC] text-[#000]" : "text-[#bdbdbd] hover:text-[#eee]"
                    }`}
                  >
                    {t === "arquivo" ? <FileUp size={14} /> : <Link2 size={14} />}
                    {t === "arquivo" ? "Upload de Arquivo" : "Link Externo"}
                  </button>
                ))}
              </div>

              {/* Título */}
              <div>
                <label className="block text-[#bdbdbd] text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">Título *</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  placeholder="Nome do documento"
                  className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                />
              </div>

              {/* Departamento + Tipo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#bdbdbd] text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">Departamento *</label>
                  <select
                    value={form.departamento_id}
                    onChange={(e) => setForm((f) => ({ ...f, departamento_id: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    {departamentos.map((d) => (
                      <option key={d.id} value={d.id}>{d.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#bdbdbd] text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-3 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  >
                    {Object.entries(TIPO_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Arquivo ou Link */}
              {uploadType === "arquivo" ? (
                <div>
                  <label className="block text-[#bdbdbd] text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">Arquivo *</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      isDragging ? "border-[#14E9BC] bg-[#14E9BC]/5" : "border-[#333] hover:border-[#555]"
                    }`}
                  >
                    {form.file ? (
                      <div className="flex items-center justify-center gap-3">
                        <File size={20} className="text-[#14E9BC]" />
                        <div className="text-left">
                          <p className="text-[#eee] text-[13px] font-['Inter:Medium',sans-serif]">{form.file.name}</p>
                          <p className="text-[#555] text-[11px]">{formatarTamanho(form.file.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setForm((f) => ({ ...f, file: null })); }}
                          className="ml-2 text-[#555] hover:text-[#ec5d5e]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="text-[#555] mx-auto mb-2" />
                        <p className="text-[#bdbdbd] text-[13px]">Arraste um arquivo ou <span className="text-[#14E9BC]">clique aqui</span></p>
                        <p className="text-[#555] text-[11px] mt-1">PDF, Word, Excel, PowerPoint, imagens — até 50MB</p>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
                </div>
              ) : (
                <div>
                  <label className="block text-[#bdbdbd] text-[13px] mb-1.5 font-['Inter:Medium',sans-serif]">URL do Documento *</label>
                  <input
                    type="url"
                    value={form.url}
                    onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-2.5 text-[#eee] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                  />
                </div>
              )}

              {erroForm && (
                <p className="text-[#ec5d5e] text-[13px] bg-[#ec5d5e]/10 rounded-lg px-4 py-2.5">{erroForm}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
                  className="flex-1 py-2.5 border border-[#333] rounded-lg text-[#bdbdbd] text-[14px] hover:text-[#eee] hover:border-[#555] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 py-2.5 bg-[#14E9BC] rounded-lg text-[#000] text-[14px] font-['Inter:Semi_Bold',sans-serif] font-semibold hover:bg-[#12d4a8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {salvando ? (
                    <>Salvando...</>
                  ) : (
                    <><Plus size={16} /> Adicionar</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
