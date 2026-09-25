import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { AdminInput } from "@/components/admin/ui";
import { cn } from "@/lib/format";

/** Fetch-on-edit + create/update save, shared by every content drawer. */
export function useCrudForm<T extends object>(type: string, id: string | undefined, initial: Partial<T>, onSaved: () => void, onClose: () => void) {
  const [item, setItem] = useState<Partial<T>>(initial);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const editing = !!id && id !== "new";

  useEffect(() => {
    if (!id) return;
    if (id === "new") { setItem(initial); return; }
    setLoading(true);
    api<{ data: T }>(`/api/admin/content/${type}/${id}`).then((r) => setItem(r.data)).catch(() => { toast.error("Couldn't load item"); onClose(); }).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  async function save() {
    setSaving(true);
    try {
      if (editing) await api(`/api/admin/content/${type}/${id}`, { method: "PUT", body: item });
      else await api(`/api/admin/content/${type}`, { method: "POST", body: item });
      toast.success(editing ? "Saved" : "Created"); onSaved(); onClose();
    } catch (e) { toast.error("Save failed", e instanceof Error ? e.message : undefined); }
    finally { setSaving(false); }
  }

  const field = <K extends keyof T>(key: K) => ({
    value: (item[key] ?? "") as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setItem((s) => ({ ...s, [key]: e.target.value })),
  });

  return { item, setItem, loading, saving, save, editing, field };
}

export function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return <AdminInput value={value.join(", ")} onChange={(e) => onChange(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} placeholder={placeholder ?? "Comma-separated"} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3 text-sm text-mist/80">
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-brand-500" : "bg-white/10")}><span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", checked ? "left-[22px]" : "left-0.5")} /></span>
      {label}
    </button>
  );
}
