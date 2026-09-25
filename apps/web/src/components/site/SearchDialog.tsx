import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Layers, Loader2, Search, Boxes, Briefcase, X } from "lucide-react";
import { api, type Wrapped } from "@/lib/api";

interface SearchResult {
  query: string;
  total: number;
  services: Item[];
  solutions: Item[];
  projects: Item[];
  posts: Item[];
}
interface Item { title: string; url: string; description: string; label?: string }

const groups = [
  { key: "services", label: "Services", icon: Layers },
  { key: "solutions", label: "Solutions", icon: Boxes },
  { key: "projects", label: "Work", icon: Briefcase },
  { key: "posts", label: "Articles", icon: FileText },
] as const;

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResult(null); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (query.trim().length < 2) { setResult(null); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api<Wrapped<SearchResult>>("/api/search", { params: { q: query.trim() } });
        setResult(res.data);
      } catch { setResult(null); } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[10vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-mist bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-mist px-4">
              <Search className="h-5 w-5 shrink-0 text-slate" />
              <input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search services, solutions, work, articles…" className="h-14 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-slate/60" />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-slate" />}
              <button onClick={onClose} className="rounded-md p-1 text-slate hover:text-ink" aria-label="Close"><X className="h-4 w-4" /></button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto p-2">
              {query.trim().length < 2 && <p className="px-3 py-8 text-center text-sm text-slate">Type at least two characters to search.</p>}
              {result && result.total === 0 && <p className="px-3 py-8 text-center text-sm text-slate">No results for “{result.query}”.</p>}
              {result && groups.map(({ key, label, icon: Icon }) => {
                const items = result[key] as Item[];
                if (!items.length) return null;
                return (
                  <div key={key} className="mb-1">
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate/70">{label}</p>
                    {items.map((item) => (
                      <Link key={item.url} to={item.url} onClick={onClose} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-brand-50/60">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">{item.title}</span>
                          <span className="block truncate text-xs text-slate">{item.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
