import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSpinner, Field } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { useAdminList } from "@/hooks/useAdmin";
import { useCrudForm, TagsInput, Toggle } from "./_shared";
import { iconOptions } from "@/lib/icons";
import type { Service } from "@/lib/types";
import { Layers } from "lucide-react";

const empty: Partial<Service> = { title: "", icon: "Sparkles", shortDescription: "", description: "", features: [], technologies: [], published: true };

export function ServicesPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useAdminList<Service>("services", "/api/admin/content/services");
  return (
    <>
      <PageHeader title="Services" description="The core services you offer clients." actions={<AdminButton size="sm" onClick={() => nav("/admin/services/new")}>Add service</AdminButton>} />
      <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-night-800">
        {isLoading && <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div>}
        {data?.data.map((s) => (
          <button key={s.id} onClick={() => nav(`/admin/services/${s.id}`)} className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-500/10 text-brand-300"><Layers className="h-4 w-4" /></span>
            <span className="min-w-0 flex-1"><span className="flex items-center gap-2 font-medium text-mist">{s.title}{!s.published && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">Draft</span>}</span><span className="mt-0.5 block truncate text-sm text-mist/50">{s.shortDescription}</span></span>
          </button>
        ))}
        {data?.data.length === 0 && <div className="py-16 text-center text-sm text-mist/40">No services yet.</div>}
      </div>
      <ServiceDrawer id={id} onClose={() => nav("/admin/services")} onSaved={refetch} />
    </>
  );
}

function ServiceDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const { item, setItem, loading, saving, save, editing, field } = useCrudForm<Service>("services", id, empty, onSaved, onClose);
  return (
    <Drawer open={!!id} onClose={onClose} width="max-w-2xl" title={editing ? "Edit service" : "Add service"}>
      {loading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <Field label="Title" required><AdminInput {...field("title")} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Icon"><select {...field("icon")} className="h-10 w-full rounded-lg border border-white/10 bg-night-900/60 px-3 text-sm text-mist">{iconOptions.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>
            <Field label="Published"><div className="pt-2"><Toggle checked={item.published ?? true} onChange={(v) => setItem((s) => ({ ...s, published: v }))} label={item.published ?? true ? "Visible on site" : "Hidden"} /></div></Field>
          </div>
          <Field label="Short description" required><AdminTextarea {...field("shortDescription")} rows={2} /></Field>
          <Field label="Full description"><AdminTextarea {...field("description")} rows={7} /></Field>
          <Field label="Features"><TagsInput value={item.features ?? []} onChange={(v) => setItem((s) => ({ ...s, features: v }))} placeholder="Discovery, Design, Build, Support" /></Field>
          <Field label="Technologies"><TagsInput value={item.technologies ?? []} onChange={(v) => setItem((s) => ({ ...s, technologies: v }))} /></Field>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="SEO title"><AdminInput {...field("seoTitle")} /></Field><Field label="SEO description"><AdminInput {...field("seoDescription")} /></Field></div>
          <div className="flex justify-end gap-2 pt-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!item.title || !item.shortDescription}>Save</AdminButton></div>
        </div>
      )}
    </Drawer>
  );
}
