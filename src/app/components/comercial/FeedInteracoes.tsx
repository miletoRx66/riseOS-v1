import { useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { TIPO_INTERACAO, type TipoInteracao } from "../../../lib/services/pipeline";

export interface ItemFeed {
  id: string;
  tipo: TipoInteracao;
  conteudo: string;
  criado_em: string;
  usuario?: { nome: string } | null;
}

/**
 * Linha do tempo de interações (notas, reuniões, ligações, WhatsApp, e-mail).
 * Usada nos cards de parceiros e de assessores do módulo Comercial.
 */
export function FeedInteracoes({
  itens,
  usuarioNome,
  placeholder,
  onEnviar,
}: {
  itens: ItemFeed[];
  usuarioNome?: string;
  placeholder: string;
  onEnviar: (conteudo: string, tipo: TipoInteracao) => Promise<void>;
}) {
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState<TipoInteracao>("nota");
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar() {
    if (!texto.trim()) return;
    setEnviando(true);
    try {
      await onEnviar(texto.trim(), tipo);
      setTexto("");
      setTipo("nota");
    } finally { setEnviando(false); }
  }

  return (
    <div className="space-y-4">
      {itens.length === 0 && (
        <div className="text-center py-8 text-rise-fg-4">
          <MessageCircle size={28} className="mx-auto mb-2 opacity-30" />
          <p>Nenhuma interação registrada ainda</p>
        </div>
      )}
      {itens.map((c) => {
        const t = TIPO_INTERACAO[c.tipo] ?? TIPO_INTERACAO.nota;
        return (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-rise-raised flex items-center justify-center text-[12px] font-bold text-rise-fg-3 flex-shrink-0">
              {c.usuario?.nome ? c.usuario.nome[0].toUpperCase() : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-rise-fg-2 text-[13px] font-semibold">{c.usuario?.nome ?? "Usuário"}</span>
                {c.tipo !== "nota" && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${t.color}22`, color: t.color }}>
                    {t.label}
                  </span>
                )}
                <span className="text-rise-fg-4 text-[11px]">
                  {new Date(c.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="bg-rise-bg border border-rise-line-2 rounded-xl px-4 py-3">
                <p className="text-rise-fg-2 text-[13px] leading-relaxed whitespace-pre-wrap">{c.conteudo}</p>
              </div>
            </div>
          </div>
        );
      })}

      {/* Nova interação */}
      <div className="pt-2 border-t border-rise-line-2">
        <div className="flex gap-1 mb-2 flex-wrap">
          {(Object.entries(TIPO_INTERACAO) as [TipoInteracao, { label: string; color: string }][]).map(([v, cfg]) => (
            <button key={v} type="button" onClick={() => setTipo(v)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                tipo === v ? "" : "border-transparent text-rise-fg-4 hover:text-rise-fg-2"
              }`}
              style={tipo === v ? { background: `${cfg.color}18`, borderColor: `${cfg.color}50`, color: cfg.color } : undefined}>
              {cfg.label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-rise-raised flex items-center justify-center text-[12px] font-bold text-rise-fg-3 flex-shrink-0">
            {usuarioNome ? usuarioNome[0].toUpperCase() : "?"}
          </div>
          <div className="flex-1 flex gap-2">
            <textarea
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleEnviar(); }}}
              placeholder={placeholder}
              className="flex-1 bg-rise-bg border border-rise-line-2 rounded-xl px-4 py-3 text-rise-fg text-[13px] outline-none focus:border-[#14E9BC] resize-none"
            />
            <button
              onClick={handleEnviar}
              disabled={!texto.trim() || enviando}
              className="px-4 bg-[#14E9BC] text-[#000] rounded-xl font-semibold disabled:opacity-40 hover:bg-[#12d4a8] transition-colors self-end h-10"
            >
              {enviando ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
