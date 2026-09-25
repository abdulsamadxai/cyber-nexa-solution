import { useRef, useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminSelect, AdminSpinner, AdminEmpty } from "@/components/admin/ui";
import { Pagination } from "@/components/admin/DataTable";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList, useInvalidate } from "@/hooks/useAdmin";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatBytes, relativeTime } from "@/lib/format";
import type { MediaItem } from "@/lib/types";
import { Upload, Copy, Trash2, ImageIcon, Check } from "lucide-react";

const FOLDERS = ["general", "projects", "blog", "team", "logos", "testimonials", "documents"];

export function MediaLibraryPage() {
  const { can } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [folder, setFolder] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { data, isLoading, refetch } = useAdminList<MediaItem>("media", "/api/admin/media", { page, folder });
  const toast = useToast();
  const confirm = useConfirm();
  const invalidate = useInvalidate();

  async function upload(files: FileList) {
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      fd.append("folder", folder || "general");
      await api("/api/admin/media", { method: "POST", body: fd });
      toast.success(`Uploaded ${files.length} file${files.length > 1 ? "s" : ""}`); invalidate(["media"]); refetch();
    } catch (e) { toast.error("Upload failed", e instanceof Error ? e.message : undefined); }
    finally { setBusy(false); }
  }

  async function remove(item: MediaItem) {
    if (!(await confirm({ title: "Delete file", message: `Remove "${item.originalName}"? Anything using it will show a broken image.`, danger: true, confirmLabel: "Delete" }))) return;
    await api(`/api/admin/media/${item.id}`, { method: "DELETE" }); toast.success("File deleted"); refetch();
  }

  function copy(url: string) { navigator.clipboard.writeText(url); setCopied(url); setTimeout(() => setCopied(null), 1500); }

  return (
    <>
      <PageHeader title="Media library" description="Images and files used across your site." actions={can("media.write") && <AdminButton size="sm" loading={busy} onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" /> Upload</AdminButton>} />
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => { if (e.target.files?.length) upload(e.target.files); e.target.value = ""; }} />

      <div className="mb-4"><AdminSelect value={folder} onChange={(e) => { setFolder(e.target.value); setPage(1); }} className="w-auto"><option value="">All folders</option>{FOLDERS.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}</AdminSelect></div>

      {isLoading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-7 w-7" /></div>
        : data?.data.length === 0 ? <AdminEmpty icon={ImageIcon} title="No media yet" description="Upload images to use them in projects, blog posts and more." />
        : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data?.data.map((m) => (
              <div key={m.id} className="group overflow-hidden rounded-xl border border-white/5 bg-night-800">
                <div className="relative aspect-square overflow-hidden bg-night-700">
                  {m.mimeType.startsWith("image/") ? <img src={m.url} alt={m.originalName} className="h-full w-full object-cover" loading="lazy" /> : <div className="grid h-full place-items-center text-mist/25"><ImageIcon className="h-8 w-8" /></div>}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => copy(m.url)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-white hover:bg-white/20" title="Copy URL">{copied === m.url ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}</button>
                    {can("media.delete") && <button onClick={() => remove(m)} className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-red-300 hover:bg-red-500/30" title="Delete"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                </div>
                <div className="p-2.5"><p className="truncate text-xs font-medium text-mist/80" title={m.originalName}>{m.originalName}</p><p className="mt-0.5 text-[11px] text-mist/35">{formatBytes(m.size)}{m.width ? ` · ${m.width}×${m.height}` : ""} · {relativeTime(m.createdAt)}</p></div>
              </div>
            ))}
          </div>
        )}
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={setPage} />}
    </>
  );
}
