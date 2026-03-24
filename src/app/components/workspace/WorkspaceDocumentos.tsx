import { useState } from "react";
import { Upload, Download, Edit2, Trash2, FileText, Search } from "lucide-react";
import { documentos } from "../../data/mockData";

interface WorkspaceDocumentosProps {
  departamento: {
    id: string;
    nome: string;
    cor: string;
  };
  temPermissao: boolean;
}

export function WorkspaceDocumentos({ departamento, temPermissao }: WorkspaceDocumentosProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const docsDept = documentos.filter((d) => d.departamento === departamento.id);
  const docsFiltrados = docsDept.filter((doc) =>
    doc.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px] mb-2">
            Documentos
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[15px]">
            Gerencie todos os documentos do departamento
          </p>
        </div>
        {temPermissao && (
          <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
            <Upload size={20} />
            Upload Documento
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
        <input
          type="text"
          placeholder="Pesquisar documentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0f0f0f] border border-[#333] rounded-lg pl-12 pr-4 py-3 text-[#eee] font-['Inter:Regular',sans-serif] text-[14px] focus:border-[#14E9BC] focus:outline-none"
        />
      </div>

      {/* Lista de Documentos */}
      <div className="grid grid-cols-1 gap-3">
        {docsFiltrados.map((doc) => (
          <div
            key={doc.id}
            className="bg-[#0f0f0f] border border-[#333] rounded-lg p-4 hover:border-[#555] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${departamento.cor}20`, color: departamento.cor }}
              >
                <FileText size={20} />
              </div>
              <div>
                <h4 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[15px] mb-1">
                  {doc.titulo}
                </h4>
                <div className="flex items-center gap-3 text-[#bdbdbd] text-[13px]">
                  <span>{doc.autor}</span>
                  <span>•</span>
                  <span>{doc.tamanho}</span>
                  <span>•</span>
                  <span>{doc.tipo}</span>
                  <span>•</span>
                  <span>{new Date(doc.dataModificacao).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
                title="Download"
              >
                <Download size={18} className="text-[#14E9BC]" />
              </button>
              {temPermissao && (
                <>
                  <button
                    className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
                    title="Editar"
                  >
                    <Edit2 size={18} className="text-[#bdbdbd]" />
                  </button>
                  <button
                    className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} className="text-[#ec5d5e]" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {docsFiltrados.length === 0 && (
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-12 text-center">
          <FileText size={48} className="text-[#666] mx-auto mb-4" />
          <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[16px] mb-2">
            {searchTerm ? "Nenhum documento encontrado" : "Nenhum documento disponível"}
          </p>
          <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[14px]">
            {searchTerm ? "Tente usar outros termos de busca" : "Faça upload do primeiro documento"}
          </p>
        </div>
      )}
    </div>
  );
}