import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSpinner, Field } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { useAdminList } from "@/hooks/useAdmin";
import { useCrudForm, TagsInput, Toggle } from "./_shared";
import { iconOptions } from "@/lib/icons";
import type { Solution } from "@/lib/types";
import { Boxes } from "lucide-react";

const empty: Partial<Solution> = { title: "", icon: "Boxes", industry: "", summary: "", description: "", challenges: [], features: [], technologies: [], published: true };

export function SolutionsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useAdminList<Solution>("solutions", "/api/admin/content/solutions");
  return (
    <>
      <PageHeader title="Solutions" description="Ready-shaped solutions mapped to industries." actions={<AdminButton size="sm" onClick={() => nav("/admin/solutions/new")}>Add solution</AdminButton>} />
      <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-night-800">
        {isLoading && <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div>}
        {data?.data.map((s) => (
          <button key={s.id} onClick={() => nav(`/admin/solutions/${s.id}`)} className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300"><Boxes className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-medium text-mist">{s.title}<span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/50">{s.industry}</span>{!s.published && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">Draft</span>}</span><span className="mt-0.5 block truncate text-sm text-mist/50">{s.summary}</span></span>
          </button>
        ))}
        {data?.data.length === 0 && <div className="py-16 text-center text-sm text-mist/40">No solutions yet.</div>}
      </div>
      <SolutionDrawer id={id} onClose={() => nav("/admin/solutions")} onSaved={refetch} />
    </>
  );
}

function SolutionDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const { item, setItem, loading, saving, save, editing, field } = useCrudForm<Solution>("solutions", id, empty, onSaved, onClose);
  return (
    <Drawer open={!!id} onClose={onClose} width="max-w-2xl" title={editing ? "Edit solution" : "Add solution"}>
      {loading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Title" required><AdminInput {...field("title")} /></Field><Field label="Industry" required><AdminInput {...field("industry")} placeholder="Retail, Healthcare…" /></Field></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Icon"><select {...field("icon")} className="h-10 w-full rounded-lg border border-white/10 bg-night-900/60 px-3 text-sm text-mist">{iconOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
            <Field label="Published"><div className="pt-2"><Toggle checked={item.published ?? true} onChange={(v) => setItem((s) => ({ ...s, published: v }))} label={item.published ?? true ? "Visible on site" : "Hidden"} /></div></Field>
          </div>
          <Field label="Summary" required><AdminTextarea {...field("summary")} rows={2} /></Field>
          <Field label="Full description"><AdminTextarea {...field("description")} rows={7} /></Field>
          <Field label="Challenges it solves"><TagsInput value={item.challenges ?? []} onChange={(v) => setItem((s) => ({ ...s, challenges: v }))} /></Field>
          <Field label="What it includes"><TagsInput value={item.features ?? []} onChange={(v) => setItem((s) => ({ ...s, features: v }))} /></Field>
          <Field label="Technologies"><TagsInput value={item.technologies ?? []} onChange={(v) => setItem((s) => ({ ...s, technologies: v }))} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="SEO title"><AdminInput {...field("seoTitle")} /></Field><Field label="SEO description"><AdminInput {...field("seoDescription")} /></Field></div>
          <div className="flex justify-end gap-2 pt-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!item.title || !item.summary || !item.industry}>Save</AdminButton></div>
        </div>
      )}
    </Drawer>
  );
}
