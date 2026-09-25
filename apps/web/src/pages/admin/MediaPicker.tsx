import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { AdminButton, AdminInput } from "@/components/admin/ui";
import { Upload, X, ImageIcon } from "lucide-react";
import type { MediaItem } from "@/lib/types";

/** Inline image field: shows a preview, uploads a new file, or accepts a pasted URL. */
export function MediaPicker({ value, onChange, folder = "general" }: { value: string; onChange: (url: string) => void; folder?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  async function upload(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("files", file);
      fd.append("folder", folder);
      const res = await api<{ data: MediaItem[] }>("/api/admin/media", { method: "POST", body: fd });
      const url = res.data[0]?.url;
      if (url) { onChange(url); toast.success("Image uploaded"); }
    } catch (e) { toast.error("Upload failed", e instanceof Error ? e.message : undefined); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-night-900/60">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-mist/25" />}
        </div>
        <div className="flex flex-1 gap-2">
          <AdminButton type="button" size="sm" variant="secondary" loading={busy} onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" /> Upload</AdminButton>
          {value && <AdminButton type="button" size="sm" variant="ghost" onClick={() => onChange("")}><X className="h-4 w-4" /></AdminButton>}
        </div>
      </div>
      <AdminInput value={value} onChange={(e) => onChange(e.target.value)} placeholder="…or paste an image URL" />
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
    </div>
  );
}
