import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function Drawer({ open, onClose, title, children, width = "max-w-xl" }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; width?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className={`absolute right-0 top-0 flex h-full w-full ${width} flex-col border-l border-white/10 bg-night-800 shadow-2xl`}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="min-w-0 text-lg font-semibold text-mist">{title}</div>
              <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-mist/60 hover:bg-white/5 hover:text-mist" aria-label="Close"><X className="h-4 w-4" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-lg" }: { open: boolean; onClose: () => void; title?: React.ReactNode; children: React.ReactNode; width?: string }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ duration: 0.2 }} className={`relative w-full ${width} overflow-hidden rounded-2xl border border-white/10 bg-night-800 shadow-2xl`}>
            {title && <header className="border-b border-white/10 px-6 py-4 text-lg font-semibold text-mist">{title}</header>}
            <div className="p-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
