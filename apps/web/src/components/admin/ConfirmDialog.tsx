import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Modal } from "./Drawer";
import { AdminButton } from "./ui";
import { AlertTriangle } from "lucide-react";

interface ConfirmOptions { title: string; message: string; confirmLabel?: string; danger?: boolean }
const ConfirmContext = createContext<(o: ConfirmOptions) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(v: boolean) => void>();

  const confirm = useCallback((o: ConfirmOptions) => {
    setOptions(o);
    return new Promise<boolean>((resolve) => { resolver.current = resolve; });
  }, []);
  const close = (result: boolean) => { resolver.current?.(result); setOptions(null); };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal open={!!options} onClose={() => close(false)} width="max-w-md">
        {options && (
          <div>
            <div className="flex gap-4">
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${options.danger ? "bg-red-500/15 text-red-400" : "bg-brand-500/15 text-brand-400"}`}><AlertTriangle className="h-5 w-5" /></div>
              <div>
                <h3 className="text-lg font-semibold text-mist">{options.title}</h3>
                <p className="mt-1 text-sm text-mist/60">{options.message}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <AdminButton variant="secondary" onClick={() => close(false)}>Cancel</AdminButton>
              <AdminButton variant={options.danger ? "danger" : "primary"} onClick={() => close(true)}>{options.confirmLabel ?? "Confirm"}</AdminButton>
            </div>
          </div>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}
