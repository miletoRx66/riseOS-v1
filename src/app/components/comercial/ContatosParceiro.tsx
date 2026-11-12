import { useEffect, useState } from "react";
import { Loader2, Mail, Phone, Plus, Star, Trash2, UserRound } from "lucide-react";
import {
  getContatos, criarContato, deletarContato, type PipelineContato,
} from "../../../lib/services/pipeline";

const FORM_VAZIO = { nome: "", papel: "", telefone: "", email: "", decisor: true };

/**
 * Pontos focais P2P de um parceiro: quem decide na gestora/escritório,
 * no lugar de rótulos genéricos B2B/B2C.
 */
export function ContatosParceiro({ parceiroId }: { parceiroId: string }) {
  const [contatos, setContatos] = useState<PipelineContato[]>([]);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ ...FORM_VAZIO });

  useEffect(() => {
    getContatos(parceiroId).then(setContatos).catch(console.error).finally(() => setLoading(false));
  }, [parceiroId]);

  async function handleSalvar() {
    if (!form.nome.trim()) return;
    setSalvando(true);
    try {
      const novo = await criarContato({
        parceiro_id: parceiroId,
        nome: form.nome.trim(),
        papel: form.papel.trim() || null,
        telefone: form.telefone.trim() || null,
        email: form.email.trim() || null,
        decisor: form.decisor,
      });
      setContatos((prev) => [...prev, novo].sort((a, b) => Number(b.decisor) - Number(a.decisor)));
      setForm({ ...FORM_VAZIO });
      setAdicionando(false);
    } finally { setSalvando(false); }
  }

  async function handleRemover(c: PipelineContato) {
    if (!confirm(`Remover ${c.nome} dos contatos?`)) return;
    await deletarContato(c.id);
    setContatos((prev) => prev.filter((x) => x.id !== c.id));
  }

  if (loading) {
    return <div className="flex justify-center py-10"><Loader2 size={20} className="text-[#14E9BC] animate-spin" /></div>;
  }

  return (
    <div className="space-y-3">
      {contatos.length === 0 && !adicionando && (
        <div className="text-center py-8 text-rise-fg-4">
          <UserRound size={28} className="mx-auto mb-2 opacity-30" />
          <p>Nenhum ponto focal mapeado</p>
          <p className="text-[12px] mt-1">Registre quem decide do lado do parceiro.</p>
        </div>
      )}

      {contatos.map((c) => (
        <div key={c.id} className="bg-rise-bg border border-rise-line-2 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-rise-fg text-[14px] font-semibold">{c.nome}</p>
              {c.decisor && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#f59e0b] flex items-center gap-0.5">
                  <Star size={9} /> Decisor
                </span>
              )}
            </div>
            {c.papel && <p className="text-rise-fg-4 text-[12px] mt-0.5">{c.papel}</p>}
            <div className="flex gap-4 mt-1.5 flex-wrap">
              {c.telefone && <span className="text-rise-fg-3 text-[12px] flex items-center gap-1"><Phone size={11} />{c.telefone}</span>}
              {c.email && <span className="text-rise-fg-3 text-[12px] flex items-center gap-1"><Mail size={11} />{c.email}</span>}
            </div>
          </div>
          <button onClick={() => handleRemover(c)} className="p-1.5 rounded-lg text-rise-fg-4 hover:text-[#ec5d5e] transition-colors flex-shrink-0">
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {adicionando ? (
        <div className="bg-rise-bg border border-rise-line-2 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome *"
              className="bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[13px] outline-none focus:border-[#14E9BC]" />
            <input value={form.papel} onChange={(e) => setForm({ ...form, papel: e.target.value })} placeholder="Papel (ex.: sócio, família fundadora)"
              className="bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[13px] outline-none focus:border-[#14E9BC]" />
            <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="Telefone"
              className="bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[13px] outline-none focus:border-[#14E9BC]" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="E-mail"
              className="bg-rise-surface border border-rise-line rounded-lg px-3 py-2 text-rise-fg text-[13px] outline-none focus:border-[#14E9BC]" />
          </div>
          <label className="flex items-center gap-2 text-rise-fg-2 text-[13px]">
            <input type="checkbox" checked={form.decisor} onChange={(e) => setForm({ ...form, decisor: e.target.checked })} className="accent-[#14E9BC]" />
            Tomador de decisão
          </label>
          <div className="flex gap-2">
            <button onClick={handleSalvar} disabled={!form.nome.trim() || salvando}
              className="flex-1 bg-[#14E9BC] text-[#000] py-2 rounded-lg font-semibold text-[13px] hover:bg-[#12d4a8] transition-colors disabled:opacity-50">
              {salvando ? "Salvando..." : "Adicionar contato"}
            </button>
            <button onClick={() => { setAdicionando(false); setForm({ ...FORM_VAZIO }); }}
              className="px-4 py-2 bg-rise-raised text-rise-fg-2 rounded-lg font-semibold text-[13px] hover:bg-rise-subtle transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdicionando(true)}
          className="w-full border border-dashed border-rise-line-3 rounded-xl py-2.5 text-[13px] text-rise-fg-3 hover:text-[#14E9BC] hover:border-[#14E9BC]/50 transition-colors flex items-center justify-center gap-1.5">
          <Plus size={14} /> Adicionar ponto focal
        </button>
      )}
    </div>
  );
}
