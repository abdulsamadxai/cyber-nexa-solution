import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSpinner, Field } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { Badge } from "@/components/ui/Badge";
import { useAdminList } from "@/hooks/useAdmin";
import { useCrudForm, TagsInput, Toggle } from "./_shared";
import { MediaPicker } from "../admin/MediaPicker";
import type { Project } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ImageIcon } from "lucide-react";

const empty: Partial<Project> = { title: "", category: "", summary: "", description: "", problem: "", solution: "", features: [], technologies: [], clientName: "", projectUrl: "", githubUrl: "", coverImage: "", isSample: false, featured: false, published: true, date: new Date().toISOString() };

export function ProjectsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useAdminList<Project>("projects", "/api/admin/content/projects");
  return (
    <>
      <PageHeader title="Projects" description="Case studies and portfolio pieces. Sample projects are clearly marked." actions={<AdminButton size="sm" onClick={() => nav("/admin/projects/new")}>Add project</AdminButton>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading && [...Array(6)].map((_, i) => <div key={i} className="aspect-[16/12] animate-pulse rounded-xl bg-white/5" />)}
        {data?.data.map((p) => (
          <button key={p.id} onClick={() => nav(`/admin/projects/${p.id}`)} className="group overflow-hidden rounded-xl border border-white/5 bg-night-800 text-left transition-colors hover:border-white/10">
            <div className="relative aspect-[16/10] overflow-hidden bg-night-700">
              {p.coverImage ? <img src={p.coverImage} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" /> : <div className="grid h-full place-items-center text-mist/20"><ImageIcon className="h-8 w-8" /></div>}
              <div className="absolute left-2 top-2 flex gap-1.5">{p.isSample && <Badge tone="amber">Sample</Badge>}{!p.published && <Badge tone="neutral">Draft</Badge>}</div>
            </div>
            <div className="p-4"><div className="flex items-center gap-2 text-xs text-brand-300">{p.category}{p.date && <span className="text-mist/30">· {formatDate(p.date)}</span>}</div><h3 className="mt-1 font-medium text-mist">{p.title}</h3><p className="mt-1 line-clamp-2 text-sm text-mist/50">{p.summary}</p></div>
          </button>
        ))}
        {data?.data.length === 0 && <div className="col-span-full py-16 text-center text-sm text-mist/40">No projects yet.</div>}
      </div>
      <ProjectDrawer id={id} onClose={() => nav("/admin/projects")} onSaved={refetch} />
    </>
  );
}

function ProjectDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const { item, setItem, loading, saving, save, editing, field } = useCrudForm<Project>("projects", id, empty, onSaved, onClose);
  return (
    <Drawer open={!!id} onClose={onClose} width="max-w-3xl" title={editing ? "Edit project" : "Add project"}>
      {loading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Title" required><AdminInput {...field("title")} /></Field><Field label="Category" required><AdminInput {...field("category")} placeholder="Web app, Mobile app…" /></Field></div>
          <Field label="Cover image"><MediaPicker value={item.coverImage ?? ""} onChange={(url) => setItem((s) => ({ ...s, coverImage: url }))} /></Field>
          <Field label="Summary" required><AdminTextarea {...field("summary")} rows={2} /></Field>
          <Field label="Overview"><AdminTextarea {...field("description")} rows={5} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="The challenge"><AdminTextarea {...field("problem")} rows={4} /></Field><Field label="Our solution"><AdminTextarea {...field("solution")} rows={4} /></Field></div>
          <Field label="Key features"><TagsInput value={item.features ?? []} onChange={(v) => setItem((s) => ({ ...s, features: v }))} /></Field>
          <Field label="Technologies"><TagsInput value={item.technologies ?? []} onChange={(v) => setItem((s) => ({ ...s, technologies: v }))} /></Field>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="Client name"><AdminInput {...field("clientName")} placeholder="Leave blank if none" /></Field><Field label="Live URL"><AdminInput {...field("projectUrl")} placeholder="https://" /></Field><Field label="Repo URL"><AdminInput {...field("githubUrl")} placeholder="https://" /></Field></div>
          <div className="flex flex-wrap gap-6 rounded-xl border border-white/5 bg-night-900/40 p-4">
            <Toggle checked={item.isSample ?? false} onChange={(v) => setItem((s) => ({ ...s, isSample: v }))} label="Sample project" />
            <Toggle checked={item.featured ?? false} onChange={(v) => setItem((s) => ({ ...s, featured: v }))} label="Featured" />
            <Toggle checked={item.published ?? true} onChange={(v) => setItem((s) => ({ ...s, published: v }))} label="Published" />
          </div>
          <div className="flex justify-end gap-2 pt-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!item.title || !item.summary || !item.category}>Save</AdminButton></div>
        </div>
      )}
    </Drawer>
  );
}
