import { useState } from "react";
import { Plus, FileText, Edit2, Trash2, Copy, Eye } from "lucide-react";

interface WorkspaceFormulariosProps {
  departamento: {
    id: string;
    nome: string;
    cor: string;
  };
  temPermissao: boolean;
}

export function WorkspaceFormularios({ departamento, temPermissao }: WorkspaceFormulariosProps) {
  const [formularios] = useState([
    {
      id: "form-1",
      titulo: "Pesquisa de Satisfação Interna",
      descricao: "Avaliação trimestral de satisfação dos colaboradores",
      campos: 8,
      respostas: 24,
      status: "ativo",
      dataCriacao: "2026-01-15",
    },
    {
      id: "form-2",
      titulo: "Solicitação de Recursos",
      descricao: "Formulário para requisição de recursos e materiais",
      campos: 6,
      respostas: 12,
      status: "ativo",
      dataCriacao: "2026-02-01",
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[24px] mb-2">
            Formulários
          </h2>
          <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[15px]">
            Crie e gerencie formulários personalizados para o departamento
          </p>
        </div>
        {temPermissao && (
          <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
            <Plus size={20} />
            Novo Formulário
          </button>
        )}
      </div>

      {/* Lista de Formulários */}
      <div className="grid grid-cols-1 gap-4">
        {formularios.map((form) => (
          <div
            key={form.id}
            className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 hover:border-[#555] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${departamento.cor}20`, color: departamento.cor }}
                >
                  <FileText size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-1">
                    {form.titulo}
                  </h3>
                  <p className="font-['Inter:Regular',sans-serif] text-[#bdbdbd] text-[14px] mb-3">
                    {form.descricao}
                  </p>
                  <div className="flex items-center gap-4 text-[#bdbdbd] text-[13px]">
                    <span>{form.campos} campos</span>
                    <span>•</span>
                    <span>{form.respostas} respostas</span>
                    <span>•</span>
                    <span>Criado em {new Date(form.dataCriacao).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
                  title="Visualizar"
                >
                  <Eye size={18} className="text-[#14E9BC]" />
                </button>
                <button
                  className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#252525] transition-colors"
                  title="Copiar"
                >
                  <Copy size={18} className="text-[#bdbdbd]" />
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
          </div>
        ))}
      </div>

      {/* Empty State quando não tem permissão */}
      {!temPermissao && formularios.length === 0 && (
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-12 text-center">
          <FileText size={48} className="text-[#666] mx-auto mb-4" />
          <p className="font-['Inter:Medium',sans-serif] text-[#bdbdbd] text-[16px] mb-2">
            Nenhum formulário criado ainda
          </p>
          <p className="font-['Inter:Regular',sans-serif] text-[#666] text-[14px]">
            Apenas executivos do departamento podem criar formulários
          </p>
        </div>
      )}
    </div>
  );
}
