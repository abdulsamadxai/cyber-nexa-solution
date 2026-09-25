import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSpinner, Field } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList } from "@/hooks/useAdmin";
import { useCrudForm, Toggle } from "./_shared";
import { api } from "@/lib/api";
import type { Faq } from "@/lib/types";
import { HelpCircle, Trash2 } from "lucide-react";

const empty: Partial<Faq & { published: boolean; order: number }> = { question: "", answer: "", category: "General", published: true };

export function FaqsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useAdminList<Faq & { published: boolean }>("faqs", "/api/admin/content/faqs", { pageSize: 100 });
  const confirm = useConfirm();
  const toast = useToast();

  async function remove(f: Faq) {
    if (!(await confirm({ title: "Delete FAQ", message: "Remove this question?", danger: true, confirmLabel: "Delete" }))) return;
    await api(`/api/admin/content/faqs/${f.id}`, { method: "DELETE" }); toast.success("FAQ deleted"); refetch();
  }

  return (
    <>
      <PageHeader title="FAQs" description="Answer common questions before people have to ask." actions={<AdminButton size="sm" onClick={() => nav("/admin/faqs/new")}>Add FAQ</AdminButton>} />
      <div className="space-y-2.5">
        {isLoading && <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div>}
        {data?.data.map((f) => (
          <div key={f.id} className="rounded-xl border border-white/5 bg-night-800 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-medium text-mist">{f.question}</span><span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">{f.category}</span>{!f.published && <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">Hidden</span>}</div><p className="mt-1 text-sm text-mist/50 line-clamp-2">{f.answer}</p></div>
              <div className="flex shrink-0 gap-1"><AdminButton size="sm" variant="ghost" onClick={() => nav(`/admin/faqs/${f.id}`)}>Edit</AdminButton><button onClick={() => remove(f)} className="grid h-8 w-8 place-items-center rounded-lg text-mist/40 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          </div>
        ))}
        {data?.data.length === 0 && <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 py-16 text-mist/40"><HelpCircle className="h-8 w-8" /><span>No FAQs yet.</span></div>}
      </div>
      <FaqDrawer id={id} onClose={() => nav("/admin/faqs")} onSaved={refetch} />
    </>
  );
}

function FaqDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const { item, setItem, loading, saving, save, editing, field } = useCrudForm<Faq & { published: boolean; order: number }>("faqs", id, empty, onSaved, onClose);
  return (
    <Drawer open={!!id} onClose={onClose} title={editing ? "Edit FAQ" : "Add FAQ"}>
      {loading ? <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <Field label="Question" required><AdminInput {...field("question")} /></Field>
          <Field label="Answer" required><AdminTextarea {...field("answer")} rows={6} /></Field>
          <Field label="Category"><AdminInput {...field("category")} placeholder="General, Pricing, Process…" /></Field>
          <div className="rounded-xl border border-white/5 bg-night-900/40 p-4"><Toggle checked={item.published ?? true} onChange={(v) => setItem((s) => ({ ...s, published: v }))} label="Published" /></div>
          <div className="flex justify-end gap-2 pt-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!item.question || !item.answer}>Save</AdminButton></div>
        </div>
      )}
    </Drawer>
  );
}
