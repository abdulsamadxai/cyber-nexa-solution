import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Drawer, Modal } from "@/components/admin/Drawer";
import { AdminButton, AdminInput, AdminSelect, AdminTextarea, StatusPill, AdminSpinner, Field } from "@/components/admin/ui";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { api, type Wrapped } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useInvalidate } from "@/hooks/useAdmin";
import type { Inquiry, AdminUser } from "@/lib/types";
import { formatDate, relativeTime } from "@/lib/format";
import { Mail, Phone, Building2, Globe, MessageSquarePlus, Send, Trash2, Clock, User, Link2, Tag } from "lucide-react";

const STATUSES = ["NEW", "CONTACTED", "IN_DISCUSSION", "PROPOSAL", "WON", "LOST", "ARCHIVED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function InquiryDrawer({ id, onClose, onChanged }: { id?: string; onClose: () => void; onChanged: () => void }) {
  const { can } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const invalidate = useInvalidate();
  const [note, setNote] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: inquiry, isLoading, refetch } = useQuery({
    queryKey: ["inquiry", id],
    queryFn: () => api<Wrapped<Inquiry>>(`/api/admin/inquiries/${id}`).then((r) => r.data),
    enabled: !!id,
  });
  const { data: assignees } = useQuery({
    queryKey: ["assignable-users"],
    queryFn: () => api<Wrapped<AdminUser[]>>("/api/admin/inquiries/meta/assignees").then((r) => r.data).catch(() => [] as AdminUser[]),
    enabled: !!id && can("inquiries.write"),
  });

  async function update(body: Record<string, unknown>) {
    setBusy(true);
    try {
      await api(`/api/admin/inquiries/${id}`, { method: "PATCH", body });
      await refetch(); onChanged(); invalidate(["dashboard", "notif-count"]);
    } catch (e) { toast.error("Update failed", e instanceof Error ? e.message : undefined); }
    finally { setBusy(false); }
  }

  async function addNote() {
    if (!note.trim()) return;
    setBusy(true);
    try { await api(`/api/admin/inquiries/${id}/notes`, { method: "POST", body: { content: note } }); setNote(""); await refetch(); toast.success("Note added"); }
    catch (e) { toast.error("Couldn't add note", e instanceof Error ? e.message : undefined); }
    finally { setBusy(false); }
  }

  async function remove() {
    if (!(await confirm({ title: "Delete inquiry", message: "This permanently removes the inquiry and its notes. This cannot be undone.", danger: true, confirmLabel: "Delete" }))) return;
    await api(`/api/admin/inquiries/${id}`, { method: "DELETE" });
    toast.success("Inquiry deleted"); onChanged(); onClose();
  }

  return (
    <>
      <Drawer open={!!id} onClose={onClose} width="max-w-2xl" title={inquiry ? <div className="flex items-center gap-2.5"><span>{inquiry.name}</span><span className="font-mono text-sm text-mist/40">#AS{inquiry.number}</span></div> : "Inquiry"}>
        {isLoading || !inquiry ? <div className="grid place-items-center py-20"><AdminSpinner className="h-7 w-7" /></div> : (
          <div className="space-y-6">
            {/* Controls */}
            {can("inquiries.write") && (
              <div className="grid gap-3 rounded-xl border border-white/10 bg-night-900/40 p-4 sm:grid-cols-3">
                <Field label="Status"><AdminSelect value={inquiry.status} disabled={busy} onChange={(e) => update({ status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</AdminSelect></Field>
                <Field label="Priority"><AdminSelect value={inquiry.priority} disabled={busy} onChange={(e) => update({ priority: e.target.value })}>{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}</AdminSelect></Field>
                <Field label="Owner"><AdminSelect value={inquiry.assignedTo?.id ?? ""} disabled={busy} onChange={(e) => update({ assignedToId: e.target.value || null })}><option value="">Unassigned</option>{assignees?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</AdminSelect></Field>
              </div>
            )}
            {!can("inquiries.write") && <div className="flex gap-2"><StatusPill value={inquiry.status} /><StatusPill value={inquiry.priority} /></div>}

            {/* Contact details */}
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <a href={`mailto:${inquiry.email}`} className="flex items-center gap-2 text-mist/70 hover:text-brand-300"><Mail className="h-4 w-4 text-mist/40" />{inquiry.email}</a>
              {inquiry.phone && <a href={`tel:${inquiry.phone}`} className="flex items-center gap-2 text-mist/70 hover:text-brand-300"><Phone className="h-4 w-4 text-mist/40" />{inquiry.phone}</a>}
              {inquiry.company && <span className="flex items-center gap-2 text-mist/70"><Building2 className="h-4 w-4 text-mist/40" />{inquiry.company}</span>}
              {inquiry.country && <span className="flex items-center gap-2 text-mist/70"><Globe className="h-4 w-4 text-mist/40" />{inquiry.country}</span>}
              {inquiry.contact && <span className="flex items-center gap-2 text-mist/70"><User className="h-4 w-4 text-mist/40" />{inquiry.contact._count.inquiries} total {inquiry.contact._count.inquiries === 1 ? "inquiry" : "inquiries"} from this contact</span>}
            </div>

            {/* Project meta */}
            {inquiry.type === "PROJECT" && (
              <div className="flex flex-wrap gap-2">
                {inquiry.projectType && <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-mist/70"><Tag className="h-3 w-3" />{inquiry.projectType}</span>}
                {inquiry.budget && <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-mist/70">Budget: {inquiry.budget}</span>}
                {inquiry.timeline && <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-mist/70">Timeline: {inquiry.timeline}</span>}
                {inquiry.heardFrom && <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-mist/70">Via: {inquiry.heardFrom}</span>}
              </div>
            )}

            {/* Message */}
            <div>
              {inquiry.subject && <div className="mb-1.5 text-sm font-medium text-mist">{inquiry.subject}</div>}
              <div className="whitespace-pre-line rounded-xl border border-white/5 bg-night-900/40 p-4 text-sm leading-relaxed text-mist/80">{inquiry.message}</div>
              {inquiry.requiredFeatures && <div className="mt-2"><div className="mb-1 text-xs font-medium text-mist/50">Required features</div><div className="whitespace-pre-line rounded-xl border border-white/5 bg-night-900/40 p-3 text-sm text-mist/70">{inquiry.requiredFeatures}</div></div>}
              {inquiry.referenceUrl && <a href={inquiry.referenceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300"><Link2 className="h-3.5 w-3.5" />{inquiry.referenceUrl}</a>}
            </div>

            {/* Actions */}
            {can("inquiries.write") && (
              <div className="flex flex-wrap gap-2">
                <AdminButton size="sm" onClick={() => setEmailOpen(true)}><Send className="h-4 w-4" /> Reply by email</AdminButton>
                <FollowUpButton current={inquiry.followUpAt} onSet={(d) => update({ followUpAt: d })} />
                {can("inquiries.delete") && <AdminButton size="sm" variant="danger" onClick={remove} className="ml-auto"><Trash2 className="h-4 w-4" /> Delete</AdminButton>}
              </div>
            )}

            {/* Notes */}
            <div>
              <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-mist"><MessageSquarePlus className="h-4 w-4" /> Internal notes</h4>
              {can("inquiries.write") && (
                <div className="mb-3 flex gap-2">
                  <AdminInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note…" onKeyDown={(e) => e.key === "Enter" && addNote()} />
                  <AdminButton size="sm" onClick={addNote} loading={busy} disabled={!note.trim()}>Add</AdminButton>
                </div>
              )}
              <div className="space-y-2">
                {inquiry.notes?.length ? inquiry.notes.map((n) => (
                  <div key={n.id} className="rounded-lg border border-white/5 bg-night-900/40 p-3">
                    <p className="whitespace-pre-line text-sm text-mist/80">{n.content}</p>
                    <p className="mt-1.5 text-xs text-mist/30">{n.author?.name ?? "Someone"} · {relativeTime(n.createdAt)}</p>
                  </div>
                )) : <p className="text-sm text-mist/30">No notes yet.</p>}
              </div>
            </div>

            {/* Activity timeline */}
            {inquiry.activities && inquiry.activities.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-mist"><Clock className="h-4 w-4" /> Timeline</h4>
                <ol className="relative space-y-3 border-l border-white/10 pl-4">
                  {inquiry.activities.map((a) => (
                    <li key={a.id} className="relative"><span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-brand-400 ring-4 ring-night-800" /><p className="text-sm text-mist/70">{a.message}</p><p className="text-xs text-mist/30">{a.user?.name ?? "System"} · {formatDate(a.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p></li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </Drawer>
      {inquiry && <EmailModal open={emailOpen} onClose={() => setEmailOpen(false)} inquiry={inquiry} onSent={() => { setEmailOpen(false); refetch(); }} />}
    </>
  );
}

function FollowUpButton({ current, onSet }: { current: string | null; onSet: (d: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(current ? current.slice(0, 10) : "");
  return (
    <>
      <AdminButton size="sm" variant="secondary" onClick={() => setOpen(true)}><Clock className="h-4 w-4" /> {current ? `Follow-up ${formatDate(current)}` : "Set follow-up"}</AdminButton>
      <Modal open={open} onClose={() => setOpen(false)} title="Schedule follow-up" width="max-w-sm">
        <Field label="Follow-up date"><AdminInput type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <div className="mt-4 flex justify-between">
          <AdminButton variant="ghost" size="sm" onClick={() => { onSet(null); setOpen(false); }}>Clear</AdminButton>
          <AdminButton size="sm" onClick={() => { onSet(date ? new Date(date).toISOString() : null); setOpen(false); }}>Save</AdminButton>
        </div>
      </Modal>
    </>
  );
}

function EmailModal({ open, onClose, inquiry, onSent }: { open: boolean; onClose: () => void; inquiry: Inquiry; onSent: () => void }) {
  const toast = useToast();
  const [subject, setSubject] = useState(`Re: your inquiry with Cyber Nexa Solution (#AS${inquiry.number})`);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function send() {
    setLoading(true);
    try { await api(`/api/admin/inquiries/${inquiry.id}/email`, { method: "POST", body: { subject, message } }); toast.success("Email sent", `Your reply to ${inquiry.email} is on its way.`); onSent(); }
    catch (e) { toast.error("Couldn't send", e instanceof Error ? e.message : undefined); }
    finally { setLoading(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title={`Email ${inquiry.name}`} width="max-w-xl">
      <div className="space-y-4">
        <div className="rounded-lg bg-night-900/40 px-3 py-2 text-sm text-mist/50">To: <span className="text-mist/80">{inquiry.email}</span></div>
        <Field label="Subject" required><AdminInput value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
        <Field label="Message" required><AdminTextarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} placeholder="Write your reply…" className="min-h-[160px]" /></Field>
        <p className="text-xs text-mist/40">This sends a branded email from your configured address and logs the reply on the inquiry timeline.</p>
        <div className="flex justify-end gap-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={send} loading={loading} disabled={!message.trim()}><Send className="h-4 w-4" /> Send email</AdminButton></div>
      </div>
    </Modal>
  );
}
