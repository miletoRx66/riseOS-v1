import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  getRecorrencias,
  pausarRecorrencia,
  retomarRecorrencia,
  excluirRecorrencia,
  formatarFrequencia,
  type TarefaRecorrenciaDB,
} from "../../lib/services/tarefaRecorrencias";
import { getDepartamentos, type DepartamentoDB } from "../../lib/services/departamentos";
import { ArrowLeft, Plus, Pause, Play, Trash2, Repeat } from "lucide-react";

export default function TarefasRecorrencias() {
  const [recorrencias, setRecorrencias] = useState<TarefaRecorrenciaDB[]>([]);
  const [departamentos, setDepartamentos] = useState<DepartamentoDB[]>([]);
  const [loading, setLoading] = useState(true);

  async function carregar() {
    setLoading(true);
    try {
      const [rs, deps] = await Promise.all([getRecorrencias(), getDepartamentos()]);
      setRecorrencias(rs);
      setDepartamentos(deps);
    } catch (err) {
      console.error("Erro ao carregar recorrências:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleTogglePausa(r: TarefaRecorrenciaDB) {
    try {
      if (r.ativo) {
        await pausarRecorrencia(r.id);
      } else {
        await retomarRecorrencia(r.id);
      }
      await carregar();
    } catch (err) {
      console.error("Erro ao alterar recorrência:", err);
    }
  }

  async function handleExcluir(r: TarefaRecorrenciaDB) {
    if (!window.confirm(`Excluir a recorrência "${r.titulo}"? As tarefas já geradas não serão apagadas.`)) {
      return;
    }
    try {
      await excluirRecorrencia(r.id);
      await carregar();
    } catch (err) {
      console.error("Erro ao excluir recorrência:", err);
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-rise-bg p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-6">
          <Link
            to="/tarefas"
            className="flex items-center gap-2 text-rise-fg-2 hover:text-[#14E9BC] transition-colors mb-4 font-['Inter:Medium',sans-serif] text-[14px]"
          >
            <ArrowLeft size={20} />
            Voltar para Tarefas
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-['Inter:Bold',sans-serif] font-bold text-rise-fg text-[32px] mb-2">
                Recorrências de Tarefas
              </h1>
              <p className="font-['Inter:Regular',sans-serif] text-rise-fg-2 text-[16px]">
                Regras que geram tarefas automaticamente
              </p>
            </div>
            <Link to="/tarefas/nova">
              <button className="bg-[#14E9BC] text-[#000] px-6 py-3 rounded-lg font-['Inter:Semi_Bold',sans-serif] font-semibold text-[14px] flex items-center gap-2 hover:bg-[#12d4a8] transition-colors">
                <Plus size={20} />
                Nova Recorrência
              </button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-rise-surface border border-rise-line rounded-lg p-8 text-center">
            <p className="text-rise-fg-4 text-[14px]">Carregando...</p>
          </div>
        ) : recorrencias.length === 0 ? (
          <div className="bg-rise-surface border border-rise-line rounded-lg p-8 text-center">
            <p className="text-rise-fg-2 text-[14px]">Nenhuma recorrência cadastrada ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recorrencias.map((r) => {
              const dept = departamentos.find((d) => d.id === r.departamento_id);
              return (
                <div
                  key={r.id}
                  className="bg-rise-surface border border-rise-line rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Repeat size={18} className="text-[#14E9BC] shrink-0" />
                    <div>
                      <h4 className="font-['Inter:Semi_Bold',sans-serif] font-semibold text-rise-fg text-[16px]">
                        {r.titulo}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-1 rounded bg-rise-raised text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">
                          {formatarFrequencia(r)}
                        </span>
                        <span className="px-2 py-1 rounded bg-rise-raised text-rise-fg-2 text-[12px] font-['Inter:Regular',sans-serif]">
                          {dept?.nome ?? r.departamento_id}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-[12px] font-['Inter:Medium',sans-serif]"
                          style={{
                            backgroundColor: r.ativo ? "#28d93920" : "#6B8AFF20",
                            color: r.ativo ? "#28d939" : "#6B8AFF",
                          }}
                        >
                          {r.ativo ? "Ativa" : "Pausada"}
                        </span>
                      </div>
                      <p className="text-rise-fg-3 text-[12px] font-['Inter:Regular',sans-serif] mt-1">
                        Próxima geração: {formatDate(r.proxima_geracao)}
                        {r.data_fim && ` · Termina em ${formatDate(r.data_fim)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePausa(r)}
                      className="bg-rise-raised border border-rise-line text-rise-fg p-2 rounded-lg hover:bg-rise-subtle transition-colors"
                      title={r.ativo ? "Pausar" : "Retomar"}
                    >
                      {r.ativo ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                    <button
                      onClick={() => handleExcluir(r)}
                      className="bg-rise-raised border border-rise-line text-rise-fg p-2 rounded-lg hover:border-[#ff6b6b] hover:text-[#ff6b6b] transition-colors"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
