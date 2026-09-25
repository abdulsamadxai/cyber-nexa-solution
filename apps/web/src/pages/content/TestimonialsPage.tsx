import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSelect, AdminSpinner, AdminEmpty, Field } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { MediaPicker } from "../admin/MediaPicker";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList } from "@/hooks/useAdmin";
import { useCrudForm, Toggle } from "./_shared";
import { api } from "@/lib/api";
import type { Testimonial } from "@/lib/types";
import { MessageSquareQuote, Star, Trash2 } from "lucide-react";

const empty: Partial<Testimonial & { published: boolean; order: number }> = { name: "", company: "", role: "", content: "", rating: 5, isSample: false, published: false };

export function TestimonialsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useAdminList<Testimonial & { published: boolean }>("testimonials", "/api/admin/content/testimonials");
  const confirm = useConfirm();
  const toast = useToast();

  async function remove(t: Testimonial) {
    if (!(await confirm({ title: "Delete testimonial", message: `Remove the testimonial from ${t.name}?`, danger: true, confirmLabel: "Delete" }))) return;
    await api(`/api/admin/content/testimonials/${t.id}`, { method: "DELETE" }); toast.success("Testimonial deleted"); refetch();
  }

  return (
    <>
      <PageHeader title="Testimonials" description="Client quotes. Only publish real ones — mark any placeholder as a sample." actions={<AdminButton size="sm" onClick={() => nav("/admin/testimonials/new")}>Add testimonial</AdminButton>} />
      {isLoading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-7 w-7" /></div>
        : data?.data.length === 0 ? <AdminEmpty icon={MessageSquareQuote} title="No testimonials yet" description="Add client quotes as you collect them. Nothing shows on the site until it's published and not a sample." />
        : (
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.data.map((t) => (
              <div key={t.id} className="rounded-xl border border-white/5 bg-night-800 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1 text-amber-300">{[...Array(t.rating ?? 5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}</div>
                  <div className="flex gap-1">{t.isSample && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">Sample</span>}{!t.published && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">Hidden</span>}</div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-mist/80 line-clamp-4">“{t.content}”</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm"><span className="font-medium text-mist">{t.name}</span>{t.company && <span className="text-mist/40"> · {t.company}</span>}</div>
                  <div className="flex gap-1"><AdminButton size="sm" variant="ghost" onClick={() => nav(`/admin/testimonials/${t.id}`)}>Edit</AdminButton><button onClick={() => remove(t)} className="grid h-8 w-8 place-items-center rounded-lg text-mist/40 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div>
                </div>
              </div>
            ))}
          </div>
        )}
      <TestimonialDrawer id={id} onClose={() => nav("/admin/testimonials")} onSaved={refetch} />
    </>
  );
}

function TestimonialDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const { item, setItem, loading, saving, save, editing, field } = useCrudForm<Testimonial & { published: boolean; order: number }>("testimonials", id, empty, onSaved, onClose);
  return (
    <Drawer open={!!id} onClose={onClose} title={editing ? "Edit testimonial" : "Add testimonial"}>
      {loading ? <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" required><AdminInput {...field("name")} /></Field><Field label="Company"><AdminInput {...field("company")} /></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Role"><AdminInput {...field("role")} /></Field><Field label="Rating"><AdminSelect value={String(item.rating ?? 5)} onChange={(e) => setItem((s) => ({ ...s, rating: Number(e.target.value) }))}>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>)}</AdminSelect></Field></div>
          <Field label="Photo"><MediaPicker value={item.photo ?? ""} folder="testimonials" onChange={(url) => setItem((s) => ({ ...s, photo: url }))} /></Field>
          <Field label="Quote" required><AdminTextarea {...field("content")} rows={5} /></Field>
          <div className="flex flex-wrap gap-6 rounded-xl border border-white/5 bg-night-900/40 p-4">
            <Toggle checked={item.isSample ?? false} onChange={(v) => setItem((s) => ({ ...s, isSample: v }))} label="Sample content" />
            <Toggle checked={item.published ?? false} onChange={(v) => setItem((s) => ({ ...s, published: v }))} label="Published" />
          </div>
          <div className="flex justify-end gap-2 pt-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!item.name || !item.content}>Save</AdminButton></div>
        </div>
      )}
    </Drawer>
  );
}
