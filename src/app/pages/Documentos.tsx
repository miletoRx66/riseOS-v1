import { useState } from "react";
import { documentos as initialDocumentos, departamentos } from "../data/mockData";
import { FileText, Upload, Search, Filter, Grid, List, X, Link2, FileUp, CheckCircle } from "lucide-react";
import { ContentCard } from "../components/common/ContentCard";

type UploadType = "link" | "pdf";

interface NovoDocumento {
  titulo: string;
  departamento: string;
  tipo: string;
  autor: string;
  url?: string;
  descricao?: string;
  file?: File | null;
}

export default function Documentos() {
  const [documentos, setDocumentos] = useState(initialDocumentos);
  const [selectedDept, setSelectedDept] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<UploadType>("link");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [novoDoc, setNovoDoc] = useState<NovoDocumento>({
    titulo: "",
    departamento: "marketing",
    tipo: "documento",
    autor: "Você",
    url: "",
    descricao: "",
    file: null,
  });

  const filteredDocs = documentos.filter((doc) => {
    if (selectedDept !== "todos" && doc.departamento !== selectedDept) return false;
    if (searchTerm && !doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const departamentoLabels: Record<string, string> = {
    marketing: "Marketing",
    ops: "Operações",
    comercial: "Comercial",
    produto: "Produto",
  };

  const tipoLabels: Record<string, string> = {
    documento: "Documento",
    manual: "Manual",
    apresentacao: "Apresentação",
    especificacao: "Especificação",
    guia: "Guia",
    diagrama: "Diagrama",
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setUploadSuccess(false);
    setNovoDoc({
      titulo: "",
      departamento: "marketing",
      tipo: "documento",
      autor: "Você",
      url: "",
      descricao: "",
      file: null,
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUploadType("link");
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      setNovoDoc({ ...novoDoc, file: files[0], titulo: novoDoc.titulo || files[0].name });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setNovoDoc({ ...novoDoc, file: files[0], titulo: novoDoc.titulo || files[0].name });
    }
  };

  const handleSubmit = () => {
    const errors: Record<string, string> = {};
    if (!novoDoc.titulo.trim()) errors.titulo = "Título é obrigatório";
    if (uploadType === "link" && !novoDoc.url?.trim()) errors.url = "URL do documento é obrigatória";
    if (uploadType === "pdf" && !novoDoc.file) errors.file = "Selecione um arquivo PDF";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});

    // Criar novo documento
    const newDocument = {
      id: `doc-${Date.now()}`,
      titulo: novoDoc.titulo,
      departamento: novoDoc.departamento,
      tipo: novoDoc.tipo,
      autor: novoDoc.autor,
      dataModificacao: new Date().toISOString(),
      tamanho: uploadType === "pdf" && novoDoc.file ? `${(novoDoc.file.size / 1024).toFixed(0)} KB` : "Link",
      url: uploadType === "link" ? novoDoc.url : undefined,
    };

    setDocumentos([newDocument, ...documentos]);
    setUploadSuccess(true);

    // Fechar modal após 2 segundos
    setTimeout(() => {
      handleCloseModal();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-['Inter:Bold',sans-serif] font-bold text-[#eee] text-[32px] mb-2">
              Documentos
            </h1>
            <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[16px]">
              Gerencie documentos e conteúdos de todos os departamentos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#333] rounded p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "list" ? "bg-[#292929] text-[#14E9BC]" : "text-[#bdbdbd] hover:text-[#eee]"
                }`}
              >
                <List size={18} />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid" ? "bg-[#292929] text-[#14E9BC]" : "text-[#bdbdbd] hover:text-[#eee]"
                }`}
              >
                <Grid size={18} />
              </button>
            </div>
            <button
              onClick={handleOpenModal}
              className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors"
            >
              <Upload size={20} />
              Upload Documento
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {departamentos.map((dept) => {
            const deptDocs = documentos.filter((d) => d.departamento === dept.id);
            return (
              <div
                key={dept.id}
                className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#555] transition-all cursor-pointer"
                onClick={() => setSelectedDept(dept.id)}
              >
                <div
                  className="w-10 h-10 rounded mb-3 flex items-center justify-center"
                  style={{ backgroundColor: `${dept.cor}20`, color: dept.cor }}
                >
                  <FileText size={20} />
                </div>
                <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[14px] mb-1">
                  {dept.nome}
                </p>
                <p className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
                  {deptDocs.length}
                </p>
              </div>
            );
          })}
        </div>

        {/* Filters & Search */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-1 min-w-[300px]">
              <Search size={20} className="text-[#bdbdbd]" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] flex-1"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-[#bdbdbd]" />
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#333] rounded px-4 py-2 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                >
                  <option value="todos">Todos os Departamentos</option>
                  {departamentos.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nome}
                    </option>
                  ))}
                </select>
              </div>

              {(selectedDept !== "todos" || searchTerm) && (
                <button
                  onClick={() => {
                    setSelectedDept("todos");
                    setSearchTerm("");
                  }}
                  className="text-[#14E9BC] hover:underline font-['Inter:Medium',sans-serif] text-[14px]"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Documents Display */}
        {filteredDocs.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => (
                <ContentCard key={doc.id} title={doc.titulo} />
              ))}
            </div>
          ) : (
            <div className="bg-[#0f0f0f] border border-[#333] rounded-lg overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#1a1a1a] border-b border-[#333]">
                <div className="col-span-5">
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    Nome
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    Departamento
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    Autor
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    Tipo
                  </p>
                </div>
                <div className="col-span-1">
                  <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                    Tamanho
                  </p>
                </div>
              </div>

              {/* Table Body */}
              {filteredDocs.map((doc) => {
                const dept = departamentos.find((d) => d.id === doc.departamento);
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#333] last:border-b-0 hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1a1a1a] rounded flex items-center justify-center">
                        <FileText size={20} className="text-[#14E9BC]" />
                      </div>
                      <div>
                        <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[14px]">
                          {doc.titulo}
                        </p>
                        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px]">
                          Modificado em {new Date(doc.dataModificacao).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      {dept && (
                        <span
                          className="px-2 py-1 rounded text-[12px] font-['Inter:Medium',sans-serif]"
                          style={{ backgroundColor: `${dept.cor}20`, color: dept.cor }}
                        >
                          {departamentoLabels[doc.departamento] || doc.departamento}
                        </span>
                      )}
                    </div>
                    <div className="col-span-2 flex items-center">
                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                        {doc.autor}
                      </p>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="px-2 py-1 rounded bg-[#1a1a1a] text-[#bdbdbd] text-[12px] font-['Inter:Regular',sans-serif]">
                        {tipoLabels[doc.tipo] || doc.tipo}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center">
                      <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                        {doc.tamanho}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-12 text-center">
            <FileText size={48} className="text-[#333] mx-auto mb-4" />
            <p className="text-[#bdbdbd] font-['Inter:Regular',sans-serif] text-[16px]">
              Nenhum documento encontrado
            </p>
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#333] rounded-xl max-w-[600px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#333]">
              <div>
                <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px]">
                  Adicionar Documento
                </h2>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mt-1">
                  Insira um link ou faça upload de um arquivo PDF
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={20} className="text-[#bdbdbd]" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-[#28d939]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-[#28d939]" />
                </div>
                <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[20px] mb-2">
                  Documento Adicionado!
                </h3>
                <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                  O documento foi adicionado com sucesso à sua biblioteca.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex gap-2 px-6 pt-6">
                  <button
                    onClick={() => setUploadType("link")}
                    className={`flex-1 px-4 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center justify-center gap-2 transition-colors ${
                      uploadType === "link"
                        ? "bg-[#14E9BC] text-[#000]"
                        : "bg-[#1a1a1a] text-[#bdbdbd] hover:bg-[#292929]"
                    }`}
                  >
                    <Link2 size={18} />
                    Inserir Link
                  </button>
                  <button
                    onClick={() => setUploadType("pdf")}
                    className={`flex-1 px-4 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center justify-center gap-2 transition-colors ${
                      uploadType === "pdf"
                        ? "bg-[#14E9BC] text-[#000]"
                        : "bg-[#1a1a1a] text-[#bdbdbd] hover:bg-[#292929]"
                    }`}
                  >
                    <FileUp size={18} />
                    Upload PDF
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-6 space-y-5">
                  {/* Link Tab */}
                  {uploadType === "link" && (
                    <>
                      <div>
                        <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                          URL do Documento *
                        </label>
                        <input
                          type="url"
                          placeholder="https://gitbook.com/doc/exemplo ou https://docs.google.com..."
                          value={novoDoc.url}
                          onChange={(e) => { setNovoDoc({ ...novoDoc, url: e.target.value }); setFormErrors((p) => ({ ...p, url: "" })); }}
                          className={`w-full bg-[#1a1a1a] border ${formErrors.url ? "border-[#ff6b6b]" : "border-[#333]"} rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                        />
                        {formErrors.url && <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">{formErrors.url}</p>}
                        <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[12px] mt-2">
                          Exemplos: Gitbook, Google Docs, Notion, Confluence, etc.
                        </p>
                      </div>
                    </>
                  )}

                  {/* PDF Tab */}
                  {uploadType === "pdf" && (
                    <>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                          isDragging
                            ? "border-[#14E9BC] bg-[#14E9BC]/10"
                            : "border-[#333] hover:border-[#555] hover:bg-[#1a1a1a]"
                        }`}
                      >
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ backgroundColor: "#14E9BC20" }}
                          >
                            <FileUp size={32} className="text-[#14E9BC]" />
                          </div>
                          {novoDoc.file ? (
                            <div>
                              <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px] mb-1">
                                {novoDoc.file.name}
                              </p>
                              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px]">
                                {(novoDoc.file.size / 1024).toFixed(0)} KB
                              </p>
                            </div>
                          ) : (
                            <>
                              <p className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[16px] mb-2">
                                Arraste e solte seu PDF aqui
                              </p>
                              <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-3">
                                ou clique para selecionar
                              </p>
                              <p className="font-['Inter:Regular',sans-serif] text-[#555] text-[12px]">
                                Apenas arquivos PDF
                              </p>
                            </>
                          )}
                        </label>
                      </div>
                    </>
                  )}

                  {/* Common Fields */}
                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Título do Documento *
                    </label>
                    <input
                      type="text"
                      placeholder="Digite o título..."
                      value={novoDoc.titulo}
                      onChange={(e) => { setNovoDoc({ ...novoDoc, titulo: e.target.value }); setFormErrors((p) => ({ ...p, titulo: "" })); }}
                      className={`w-full bg-[#1a1a1a] border ${formErrors.titulo ? "border-[#ff6b6b]" : "border-[#333]"} rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none`}
                    />
                    {formErrors.titulo && <p className="text-[#ff6b6b] text-[12px] font-['Inter:Regular',sans-serif] mt-1">{formErrors.titulo}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                        Departamento *
                      </label>
                      <select
                        value={novoDoc.departamento}
                        onChange={(e) => setNovoDoc({ ...novoDoc, departamento: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                      >
                        {departamentos.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                        Tipo *
                      </label>
                      <select
                        value={novoDoc.tipo}
                        onChange={(e) => setNovoDoc({ ...novoDoc, tipo: e.target.value })}
                        className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
                      >
                        <option value="documento">Documento</option>
                        <option value="manual">Manual</option>
                        <option value="apresentacao">Apresentação</option>
                        <option value="especificacao">Especificação</option>
                        <option value="guia">Guia</option>
                        <option value="diagrama">Diagrama</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-['Inter:Medium',sans-serif] text-[#eee] text-[14px] mb-2">
                      Descrição (opcional)
                    </label>
                    <textarea
                      placeholder="Adicione uma breve descrição..."
                      value={novoDoc.descricao}
                      onChange={(e) => setNovoDoc({ ...novoDoc, descricao: e.target.value })}
                      rows={3}
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-lg px-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-[#333]">
                  <button
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 rounded-lg bg-[#1a1a1a] text-[#bdbdbd] font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#292929] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-5 py-2.5 rounded-lg bg-[#14E9BC] text-[#000] font-['Inter:Semi_Bold',sans-serif] text-[14px] hover:bg-[#12d4a8] transition-colors"
                  >
                    Adicionar Documento
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
