import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { getOkrs, atualizarProgresso, deletarOkr, type OkrDB } from "../../lib/services/okrs";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { ArrowLeft, Target, Calendar, User, Trash2 } from "lucide-react";

export default function OKRDetail() {
  const { id } = useParams();
  const [okr, setOkr] = useState<OkrDB | null>(null);
  const [dept, setDept] = useState<DepartamentoDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingKr, setEditingKr] = useState<{ krId: string; valor: number } | null>(null);
  const [salvandoKr, setSalvandoKr] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([getOkrs(), getDepartamentos()])
      .then(([okrs, depts]) => {
        const found = okrs.find((o) => o.id === id) ?? null;
        setOkr(found);
        if (found) setDept(depts.find((d) => d.id === found.departamento_id) ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSalvarProgresso = async (krId: string, valorMeta: number) => {
    if (!editingKr || !okr) return;
    setSalvandoKr(true);
    try {
      const novoProgresso = Math.min(100, Math.round((editingKr.valor / valorMeta) * 100));
      await atualizarProgresso(krId, editingKr.valor, novoProgresso);
      const krs = (okr.key_results ?? []).map((kr) =>
        kr.id === krId ? { ...kr, valor_atual: editingKr.valor, progresso: novoProgresso } : kr
      );
      const progressoOkr = krs.length > 0
        ? Math.round(krs.reduce((acc, kr) => acc + kr.progresso, 0) / krs.length)
        : okr.progresso;
      setOkr({ ...okr, key_results: krs, progresso: progressoOkr });
      setEditingKr(null);
    } catch (err) {
      console.error("Erro ao atualizar progresso:", err);
    } finally {
      setSalvandoKr(false);
    }
  };

  const handleExcluir = async () => {
    if (!okr) return;
    if (!window.confirm("Tem certeza que deseja excluir este OKR? Esta ação não pode ser desfeita.")) return;
    try {
      await deletarOkr(okr.id);
      window.history.back();
    } catch (err) {
      console.error("Erro ao excluir OKR:", err);
    }
  };

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

  const formatarData = (data: string | null) => {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-[#bdbdbd]">Carregando...</p>
      </div>
    );
  }

  if (!okr) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center">
        <p className="text-[#bdbdbd] text-[18px]">OKR não encontrado</p>
      </div>
    );
  }

  const cor = dept?.cor ?? "#14E9BC";

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8">
      <div className="max-w-[900px] mx-auto">
        {/* Back */}
        <Link
          to="/okrs"
          className="flex items-center gap-2 text-[#14E9BC] hover:underline mb-6 font-['Inter:Medium',sans-serif] text-[14px]"
        >
          <ArrowLeft size={16} />
          Voltar para OKRs
        </Link>

        {/* Header */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-4 flex-1">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${cor}20`, color: cor }}
              >
                <Target size={28} />
              </div>
              <div className="flex-1">
                <h1 className="font-['Inter:Bold',sans-serif] text-[#eee] text-[28px] mb-2">
                  {okr.titulo}
                </h1>
                <div className="flex items-center gap-4 flex-wrap text-[14px] text-[#bdbdbd]">
                  {dept && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cor }} />
                      <span>{dept.nome}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{okr.periodo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    <span>{okr.responsavel?.nome ?? "—"}</span>
                  </div>
                  {(okr.data_inicio || okr.data_fim) && (
                    <span className="text-[#555]">
                      {formatarData(okr.data_inicio)} — {formatarData(okr.data_fim)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleExcluir}
              className="text-[#bdbdbd] hover:text-[#ec5d5e] transition-colors p-2 ml-4"
              title="Excluir OKR"
            >
              <Trash2 size={20} />
            </button>
          </div>

          {/* Progresso geral */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#bdbdbd] text-[14px] font-['Inter:Medium',sans-serif]">
                Progresso Geral
              </span>
              <div className="flex items-center gap-3">
                <span
                  className="px-3 py-1 rounded-full text-[11px] font-['Inter:Medium',sans-serif]"
                  style={{
                    backgroundColor: `${getStatusColor(okr.progresso)}20`,
                    color: getStatusColor(okr.progresso),
                  }}
                >
                  {getStatusLabel(okr.progresso)}
                </span>
                <span className="text-[#eee] text-[28px] font-['Inter:Bold',sans-serif]">
                  {okr.progresso}%
                </span>
              </div>
            </div>
            <div className="w-full bg-[#1a1a1a] rounded-full h-3">
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{ width: `${okr.progresso}%`, backgroundColor: cor }}
              />
            </div>
          </div>
        </div>

        {/* Key Results */}
        <div className="bg-[#0f0f0f] border border-[#333] rounded-lg p-6">
          <h2 className="font-['Inter:Semi_Bold',sans-serif] text-[#eee] text-[18px] mb-6 uppercase tracking-wider text-[14px]">
            Key Results
          </h2>
          <div className="space-y-6">
            {(okr.key_results ?? []).map((kr) => {
              const isEditingThis = editingKr?.krId === kr.id;
              const statusColor = getStatusColor(kr.progresso);
              return (
                <div key={kr.id} className="border-l-2 pl-5 py-1" style={{ borderColor: cor }}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-['Inter:Medium',sans-serif] text-[#eee] text-[15px] flex-1 pr-4">
                      {kr.descricao}
                    </p>
                    <span
                      className="text-[18px] font-['Inter:Bold',sans-serif] whitespace-nowrap"
                      style={{ color: statusColor }}
                    >
                      {kr.progresso}%
                    </span>
                  </div>
                  {kr.metrica && (
                    <p className="text-[#555] text-[12px] mb-2 font-['Inter:Regular',sans-serif]">
                      {kr.metrica}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1 bg-[#1a1a1a] rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${kr.progresso}%`, backgroundColor: statusColor }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#bdbdbd] text-[13px] font-['Inter:Regular',sans-serif]">
                      {kr.valor_atual.toLocaleString("pt-BR")} / {kr.valor_meta.toLocaleString("pt-BR")} {kr.unidade}
                    </p>
                  </div>
                  {isEditingThis ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="number"
                        min={0}
                        max={kr.valor_meta}
                        value={editingKr.valor}
                        onChange={(e) => setEditingKr({ ...editingKr, valor: parseFloat(e.target.value) || 0 })}
                        className="w-32 bg-[#1a1a1a] border border-[#333] rounded px-3 py-1.5 text-[#eee] text-[13px] focus:border-[#14E9BC] focus:outline-none"
                      />
                      <span className="text-[#bdbdbd] text-[12px]">/ {kr.valor_meta} {kr.unidade}</span>
                      <button
                        onClick={() => handleSalvarProgresso(kr.id, kr.valor_meta)}
                        disabled={salvandoKr}
                        className="bg-[#14E9BC] text-[#000] px-3 py-1.5 rounded text-[13px] font-semibold hover:bg-[#12d4a8] transition-colors disabled:opacity-50"
                      >
                        {salvandoKr ? "..." : "Salvar"}
                      </button>
                      <button
                        onClick={() => setEditingKr(null)}
                        className="text-[#bdbdbd] hover:text-[#eee] px-2 py-1.5 text-[13px] transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingKr({ krId: kr.id, valor: kr.valor_atual })}
                      className="text-[#14E9BC] text-[12px] font-['Inter:Medium',sans-serif] hover:underline"
                    >
                      Atualizar progresso
                    </button>
                  )}
                </div>
              );
            })}
            {(okr.key_results ?? []).length === 0 && (
              <p className="text-[#555] text-[14px] font-['Inter:Regular',sans-serif]">
                Nenhum Key Result cadastrado.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
