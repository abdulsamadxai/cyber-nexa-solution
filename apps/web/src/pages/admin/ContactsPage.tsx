import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminSpinner, StatusPill, Field } from "@/components/admin/ui";
import { DataTable, Pagination, type Column } from "@/components/admin/DataTable";
import { Drawer } from "@/components/admin/Drawer";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList } from "@/hooks/useAdmin";
import { api, type Wrapped } from "@/lib/api";
import type { Contact } from "@/lib/types";
import { relativeTime, formatDate } from "@/lib/format";
import { Users, Trash2 } from "lucide-react";

interface ContactForm { name: string; email: string; phone: string; company: string; country: string; notes: string }
const emptyForm: ContactForm = { name: "", email: "", phone: "", company: "", country: "", notes: "" };

export function ContactsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const page = Number(params.get("page") ?? 1);
  const { data, isLoading, refetch } = useAdminList<Contact>("contacts", "/api/admin/contacts", { page, q: params.get("q") ?? undefined });

  const columns: Column<Contact>[] = [
    { key: "name", header: "Name", render: (c) => <div><div className="font-medium text-mist">{c.name}</div><div className="text-xs text-mist/40">{c.email}</div></div> },
    { key: "inquiries", header: "Inquiries", render: (c) => <span className="text-xs text-mist/60">{c._count?.inquiries ?? 0}</span> },
    { key: "company", header: "Company", render: (c) => <span className="text-mist/60">{c.company || "—"}</span> },
    { key: "country", header: "Country", render: (c) => <span className="text-mist/60">{c.country || "—"}</span> },
    { key: "createdAt", header: "Added", render: (c) => <span className="text-xs text-mist/40">{relativeTime(c.createdAt)}</span> },
  ];

  const patch = (next: Record<string, string>) => { const m = new URLSearchParams(params); Object.entries(next).forEach(([k, v]) => (v ? m.set(k, v) : m.delete(k))); if (!("page" in next)) m.set("page", "1"); setParams(m); };

  return (
    <>
      <PageHeader title="Contacts" description="Everyone who's reached out — a lightweight CRM of your relationships." actions={<AdminButton size="sm" onClick={() => navigate("/admin/contacts/new")}>Add contact</AdminButton>} />
      <form onSubmit={(e) => { e.preventDefault(); patch({ q: search }); }} className="mb-4 flex max-w-md gap-2"><AdminInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email…" /><AdminButton type="submit">Search</AdminButton></form>
      <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} onRowClick={(c) => navigate(`/admin/contacts/${c.id}`)} empty={<div className="flex flex-col items-center gap-2 py-6"><Users className="h-8 w-8 text-mist/20" /><span>No contacts match your search.</span></div>} />
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={(p) => patch({ page: String(p) })} />}
      <ContactDrawer id={id} onClose={() => navigate("/admin/contacts")} onSaved={refetch} />
    </>
  );
}

function ContactDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<ContactForm>(emptyForm);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const editing = !!id && id !== "new";
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    if (!id) return;
    if (id === "new") { setForm(emptyForm); setDetail(null); return; }
    setLoading(true);
    api<Wrapped<Contact>>(`/api/admin/contacts/${id}`).then((r) => {
      const c = r.data; setDetail(c);
      setForm({ name: c.name, email: c.email, phone: c.phone ?? "", company: c.company ?? "", country: c.country ?? "", notes: c.notes ?? "" });
    }).catch(() => onClose()).finally(() => setLoading(false));
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      if (editing) await api(`/api/admin/contacts/${id}`, { method: "PUT", body: form });
      else await api("/api/admin/contacts", { method: "POST", body: form });
      toast.success(editing ? "Contact updated" : "Contact created"); onSaved(); onClose();
    } catch (e) { toast.error("Save failed", e instanceof Error ? e.message : undefined); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!(await confirm({ title: "Delete contact", message: "Remove this contact and their history? This cannot be undone.", danger: true, confirmLabel: "Delete" }))) return;
    await api(`/api/admin/contacts/${id}`, { method: "DELETE" }); toast.success("Contact deleted"); onSaved(); onClose();
  }

  return (
    <Drawer open={!!id} onClose={onClose} width="max-w-xl" title={editing ? "Edit contact" : "Add contact"}>
      {loading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" required><AdminInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email" required><AdminInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Phone"><AdminInput value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field><Field label="Company"><AdminInput value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Field></div>
          <Field label="Country"><AdminInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="w-full rounded-lg border border-white/10 bg-night-900/60 px-3 py-2.5 text-sm text-mist outline-none focus:border-brand-400" /></Field>

          {detail?.inquiries && detail.inquiries.length > 0 && (
            <div><h4 className="mb-2 text-sm font-medium text-mist">Inquiry history</h4><div className="space-y-1.5">
              {detail.inquiries.map((inq) => (
                <button key={inq.id} onClick={() => { onClose(); setTimeout(() => window.location.assign(`/admin/inquiries/${inq.id}`), 0); }} className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-night-900/40 px-3 py-2 text-left text-sm hover:bg-white/[0.03]">
                  <span className="text-mist/80">#AS{inq.number} · {inq.type === "PROJECT" ? inq.projectType || "Project" : inq.subject || "Contact"}</span>
                  <span className="flex items-center gap-2"><StatusPill value={inq.status} /><span className="text-xs text-mist/30">{formatDate(inq.createdAt)}</span></span>
                </button>
              ))}
            </div></div>
          )}

          <div className="flex items-center justify-between pt-2">
            {editing ? <AdminButton variant="danger" size="sm" onClick={remove}><Trash2 className="h-4 w-4" /> Delete</AdminButton> : <span />}
            <div className="flex gap-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!form.name || !form.email}>Save</AdminButton></div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
