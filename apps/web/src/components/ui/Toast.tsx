import { createContext, useCallback, useContext, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/format";

type ToastType = "success" | "error" | "info";
interface Toast { id: number; type: ToastType; title: string; description?: string }
interface ToastApi { toast: (t: Omit<Toast, "id">) => void; success: (title: string, description?: string) => void; error: (title: string, description?: string) => void }

const ToastContext = createContext<ToastApi | null>(null);
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const accents = { success: "text-emerald-600", error: "text-red-600", info: "text-brand-600" };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => remove(id), 5000);
  }, []);
  const api: ToastApi = {
    toast,
    success: (title, description) => toast({ type: "success", title, description }),
    error: (title, description) => toast({ type: "error", title, description }),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end sm:p-6">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-mist bg-white p-4 shadow-lift"
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", accents[t.type])} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-slate">{t.description}</p>}
                </div>
                <button onClick={() => remove(t.id)} className="text-slate/60 hover:text-ink" aria-label="Dismiss"><X className="h-4 w-4" /></button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
