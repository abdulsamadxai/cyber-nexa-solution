import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminSelect, AdminSpinner, Field, StatusPill } from "@/components/admin/ui";
import { Modal } from "@/components/admin/Drawer";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { api, type Wrapped } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { initials, relativeTime } from "@/lib/format";
import type { AdminUser, Role } from "@/lib/types";
import { UserPlus, Mail, Lock, Trash2, Copy, Check } from "lucide-react";

export function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["admin-users"], queryFn: () => api<Wrapped<AdminUser[]> & { meta: { roles: Record<string, string> } }>("/api/admin/users") });
  const roles = (data?.meta?.roles ?? {}) as Record<Role, string>;

  async function update(u: AdminUser, body: Record<string, unknown>) {
    try { await api(`/api/admin/users/${u.id}`, { method: "PATCH", body }); toast.success("User updated"); refetch(); }
    catch (e) { toast.error("Update failed", e instanceof Error ? e.message : undefined); }
  }
  async function remove(u: AdminUser) {
    if (!(await confirm({ title: "Delete user", message: `Remove ${u.name}'s access entirely? This can't be undone.`, danger: true, confirmLabel: "Delete" }))) return;
    try { await api(`/api/admin/users/${u.id}`, { method: "DELETE" }); toast.success("User deleted"); refetch(); }
    catch (e) { toast.error("Couldn't delete", e instanceof Error ? e.message : undefined); }
  }
  async function resend(u: AdminUser) {
    try { const r = await api<Wrapped<{ emailSent: boolean; inviteUrl?: string }>>(`/api/admin/users/${u.id}/resend-invite`, { method: "POST" }); if (r.data.inviteUrl) setInviteLink(r.data.inviteUrl); toast.success(r.data.emailSent ? "Invitation resent" : "Invite link generated"); }
    catch (e) { toast.error("Couldn't resend", e instanceof Error ? e.message : undefined); }
  }

  return (
    <>
      <PageHeader title="Admin users" description="Manage who can access this dashboard and what they can do." actions={<AdminButton size="sm" onClick={() => setInviteOpen(true)}><UserPlus className="h-4 w-4" /> Invite user</AdminButton>} />
      {isLoading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-7 w-7" /></div> : (
        <div className="overflow-hidden rounded-xl border border-white/5 bg-night-800">
          <div className="divide-y divide-white/5">
            {data?.data.map((u) => (
              <div key={u.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-500/15 font-semibold text-brand-300">{initials(u.name)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2"><span className="font-medium text-mist">{u.name}</span>{u.id === me?.id && <span className="rounded bg-brand-500/15 px-1.5 py-0.5 text-[10px] text-brand-300">You</span>}{u.invitePending && <StatusPill value="PENDING" />}{!u.isActive && <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] text-red-300">Disabled</span>}{u.lockedUntil && new Date(u.lockedUntil) > new Date() && <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-300">Locked</span>}</div>
                  <div className="text-xs text-mist/40">{u.email} · {u.lastLoginAt ? `last seen ${relativeTime(u.lastLoginAt)}` : "never signed in"}</div>
                </div>
                <AdminSelect value={u.role} disabled={u.id === me?.id} onChange={(e) => update(u, { role: e.target.value })} className="w-auto">{Object.entries(roles).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</AdminSelect>
                <div className="flex items-center gap-1">
                  {u.invitePending && <button onClick={() => resend(u)} title="Resend invite" className="grid h-8 w-8 place-items-center rounded-lg text-mist/50 hover:bg-white/5 hover:text-brand-300"><Mail className="h-4 w-4" /></button>}
                  {u.lockedUntil && new Date(u.lockedUntil) > new Date() && <button onClick={() => update(u, { unlock: true })} title="Unlock" className="grid h-8 w-8 place-items-center rounded-lg text-mist/50 hover:bg-white/5 hover:text-amber-300"><Lock className="h-4 w-4" /></button>}
                  {u.id !== me?.id && <button onClick={() => update(u, { isActive: !u.isActive })} title={u.isActive ? "Disable" : "Enable"} className="rounded-lg px-2 py-1.5 text-xs text-mist/50 hover:bg-white/5 hover:text-mist">{u.isActive ? "Disable" : "Enable"}</button>}
                  {u.id !== me?.id && <button onClick={() => remove(u)} title="Delete" className="grid h-8 w-8 place-items-center rounded-lg text-mist/40 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <InviteModal open={inviteOpen} roles={roles} onClose={() => setInviteOpen(false)} onInvited={(link) => { refetch(); if (link) setInviteLink(link); }} />
      <InviteLinkModal link={inviteLink} onClose={() => setInviteLink(null)} />
    </>
  );
}

function InviteModal({ open, roles, onClose, onInvited }: { open: boolean; roles: Record<string, string>; onClose: () => void; onInvited: (link: string | null) => void }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", role: "EDITOR" });
  const [loading, setLoading] = useState(false);
  async function submit() {
    setLoading(true);
    try {
      const r = await api<Wrapped<{ emailSent: boolean; inviteUrl?: string }>>("/api/admin/users/invite", { method: "POST", body: form });
      toast.success(r.data.emailSent ? "Invitation sent" : "User created", r.data.emailSent ? `${form.email} will receive an email.` : "Share the invite link shown next.");
      onInvited(r.data.inviteUrl ?? null); onClose(); setForm({ name: "", email: "", role: "EDITOR" });
    } catch (e) { toast.error("Couldn't invite", e instanceof Error ? e.message : undefined); }
    finally { setLoading(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="Invite a user">
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" required><AdminInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Email" required><AdminInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field></div>
        <Field label="Role"><AdminSelect value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{Object.entries(roles).map(([v, label]) => <option key={v} value={v}>{label}</option>)}</AdminSelect></Field>
        <p className="text-xs text-mist/40">They'll receive a secure link to set their password. Links expire after 72 hours.</p>
        <div className="flex justify-end gap-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={submit} loading={loading} disabled={!form.name || !form.email}>Send invitation</AdminButton></div>
      </div>
    </Modal>
  );
}

function InviteLinkModal({ link, onClose }: { link: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal open={!!link} onClose={onClose} title="Invite link">
      <p className="text-sm text-mist/60">Email isn't configured yet, so share this secure link with the new user directly. It expires in 72 hours.</p>
      <div className="mt-4 flex gap-2">
        <AdminInput value={link ?? ""} readOnly className="font-mono text-xs" />
        <AdminButton onClick={() => { if (link) { navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1500); } }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</AdminButton>
      </div>
      <div className="mt-4 flex justify-end"><AdminButton variant="secondary" onClick={onClose}>Done</AdminButton></div>
    </Modal>
  );
}
