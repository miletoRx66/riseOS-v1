import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const ctx: ToastContextType = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    info: (msg) => addToast(msg, "info"),
  };

  const ICONS = { success: CheckCircle, error: XCircle, info: Info };
  const COLORS = {
    success: { bg: "#0d2e1a", border: "#28d939", icon: "#28d939" },
    error: { bg: "#2e0d0d", border: "#ec5d5e", icon: "#ec5d5e" },
    info: { bg: "#0d1f2e", border: "#14E9BC", icon: "#14E9BC" },
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-[360px]">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              className="flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm animate-in slide-in-from-right-4"
              style={{ backgroundColor: c.bg, borderColor: c.border }}
            >
              <Icon size={18} style={{ color: c.icon }} className="flex-shrink-0 mt-0.5" />
              <p className="text-[#eee] text-[13px] font-['Inter:Regular',sans-serif] flex-1 leading-relaxed">
                {t.message}
              </p>
              <button onClick={() => dismiss(t.id)} className="text-[#555] hover:text-[#eee] transition-colors flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
