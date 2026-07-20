import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Bell, MessageSquare, MessageCircle, Target,
  FileText, AlertCircle, CheckCheck, X,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import {
  getNotificacoes,
  marcarLida,
  marcarTodasLidas,
  type NotificacaoDB,
} from "../../../lib/services/notificacoes";

const NOTIF_CONFIG: Record<string, { icon: typeof Bell; cor: string }> = {
  nova_mensagem:  { icon: MessageSquare, cor: "#14E9BC" },
  novo_comentario:{ icon: MessageCircle, cor: "#6B8AFF" },
  okr_atualizado: { icon: Target,        cor: "#E879F9" },
  novo_documento: { icon: FileText,      cor: "#f59e0b" },
  tarefa_atrasada:{ icon: AlertCircle,   cor: "#ec5d5e" },
};

function tempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const h   = Math.floor(diff / 3600000);
  const d   = Math.floor(diff / 86400000);
  if (min < 1)  return "agora";
  if (min < 60) return `há ${min}m`;
  if (h < 24)   return `há ${h}h`;
  if (d < 7)    return `há ${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface Props { userId: string }

export function NotificacoesBell({ userId }: Props) {
  const navigate = useNavigate();
  const [notifs, setNotifs]       = useState<NotificacaoDB[]>([]);
  const [open, setOpen]           = useState(false);
  const [carregando, setCarregando] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifs.filter((n) => !n.lida).length;

  // Carrega notificações e assina Realtime
  useEffect(() => {
    if (!userId) return;

    setCarregando(true);
    getNotificacoes(userId)
      .then(setNotifs)
      .catch(() => {})
      .finally(() => setCarregando(false));

    const channel = supabase
      .channel(`notif-bell-${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes", filter: `usuario_id=eq.${userId}` },
        (payload) => {
          setNotifs((prev) => [payload.new as NotificacaoDB, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  // Fecha painel ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  async function handleClickNotif(notif: NotificacaoDB) {
    if (!notif.lida) {
      await marcarLida(notif.id);
      setNotifs((prev) => prev.map((n) => n.id === notif.id ? { ...n, lida: true } : n));
    }
    if (notif.link_interno) navigate(notif.link_interno);
    setOpen(false);
  }

  async function handleMarcarTodas() {
    await marcarTodasLidas(userId);
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Botão do sino */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          open
            ? "bg-rise-raised text-[#14E9BC] border border-[#14E9BC]/30"
            : "text-rise-fg-2 hover:bg-rise-raised hover:text-rise-fg"
        }`}
      >
        <div className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 bg-[#ec5d5e] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        <span className="font-['Inter:Medium',sans-serif] font-medium text-[14px]">Notificações</span>
      </button>

      {/* Painel */}
      {open && (
        <div className="absolute left-full bottom-0 ml-2 w-[360px] bg-rise-surface border border-rise-line rounded-xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-rise-line">
            <div className="flex items-center gap-2">
              <span className="text-rise-fg text-[15px] font-['Inter:Semi_Bold',sans-serif]">
                Notificações
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#ec5d5e] text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarcarTodas}
                  className="flex items-center gap-1 text-[#14E9BC] text-[12px] hover:opacity-80 transition-opacity"
                >
                  <CheckCheck size={13} />
                  Marcar todas como lidas
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-rise-fg-4 hover:text-rise-fg transition-colors">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-[440px] overflow-y-auto">
            {carregando ? (
              <div className="p-6 text-center text-rise-fg-4 text-[13px]">Carregando...</div>
            ) : notifs.length === 0 ? (
              <div className="p-10 text-center">
                <Bell size={32} className="text-rise-fg-4 mx-auto mb-3" />
                <p className="text-rise-fg-4 text-[13px]">Nenhuma notificação ainda</p>
              </div>
            ) : (
              notifs.map((notif) => {
                const cfg = NOTIF_CONFIG[notif.tipo] ?? NOTIF_CONFIG.nova_mensagem;
                const Icon = cfg.icon;
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleClickNotif(notif)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-rise-raised hover:bg-rise-raised transition-colors ${
                      !notif.lida ? "bg-rise-bg" : ""
                    }`}
                  >
                    {/* Indicador de não lida */}
                    <div className="flex-shrink-0 pt-2">
                      {!notif.lida
                        ? <span className="w-2 h-2 rounded-full bg-[#ec5d5e] block" />
                        : <span className="w-2 h-2 block" />
                      }
                    </div>

                    {/* Ícone do tipo */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: `${cfg.cor}20`, color: cfg.cor }}
                    >
                      <Icon size={15} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] truncate leading-snug ${
                        !notif.lida ? "text-rise-fg font-semibold" : "text-rise-fg-2"
                      }`}>
                        {notif.titulo}
                      </p>
                      {notif.corpo && (
                        <p className="text-rise-fg-4 text-[12px] truncate mt-0.5">
                          {notif.corpo}
                        </p>
                      )}
                      <p className="text-rise-fg-4 text-[11px] mt-1">
                        {tempoRelativo(notif.criada_em)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
