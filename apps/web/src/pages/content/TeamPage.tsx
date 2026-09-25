import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminTextarea, AdminSpinner, AdminEmpty, Field } from "@/components/admin/ui";
import { Drawer } from "@/components/admin/Drawer";
import { MediaPicker } from "../admin/MediaPicker";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList } from "@/hooks/useAdmin";
import { useCrudForm, Toggle } from "./_shared";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";
import type { TeamMember } from "@/lib/types";
import { Users, Trash2 } from "lucide-react";

const empty: Partial<TeamMember & { published: boolean; order: number }> = { name: "", role: "", bio: "", photo: "", linkedin: "", github: "", email: "", published: false };

export function TeamPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const { data, isLoading, refetch } = useAdminList<TeamMember & { published: boolean }>("team", "/api/admin/content/team");
  const confirm = useConfirm();
  const toast = useToast();

  async function remove(m: TeamMember) {
    if (!(await confirm({ title: "Remove team member", message: `Remove ${m.name} from the team?`, danger: true, confirmLabel: "Remove" }))) return;
    await api(`/api/admin/content/team/${m.id}`, { method: "DELETE" }); toast.success("Removed"); refetch();
  }

  return (
    <>
      <PageHeader title="Team" description="The people shown on your About page." actions={<AdminButton size="sm" onClick={() => nav("/admin/team/new")}>Add member</AdminButton>} />
      {isLoading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-7 w-7" /></div>
        : data?.data.length === 0 ? <AdminEmpty icon={Users} title="No team members yet" description="Add the people behind your company. Members stay hidden until published." />
        : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.data.map((m) => (
              <div key={m.id} className="rounded-xl border border-white/5 bg-night-800 p-5 text-center">
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-full bg-brand-500/15">{m.photo ? <img src={m.photo} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center font-semibold text-brand-300">{initials(m.name)}</div>}</div>
                <h3 className="mt-3 font-medium text-mist">{m.name}{!m.published && <span className="ml-1.5 rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-mist/40">Hidden</span>}</h3>
                <p className="text-sm text-brand-300">{m.role}</p>
                <div className="mt-3 flex justify-center gap-1"><AdminButton size="sm" variant="ghost" onClick={() => nav(`/admin/team/${m.id}`)}>Edit</AdminButton><button onClick={() => remove(m)} className="grid h-8 w-8 place-items-center rounded-lg text-mist/40 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            ))}
          </div>
        )}
      <MemberDrawer id={id} onClose={() => nav("/admin/team")} onSaved={refetch} />
    </>
  );
}

function MemberDrawer({ id, onClose, onSaved }: { id?: string; onClose: () => void; onSaved: () => void }) {
  const { item, setItem, loading, saving, save, editing, field } = useCrudForm<TeamMember & { published: boolean; order: number }>("team", id, empty, onSaved, onClose);
  return (
    <Drawer open={!!id} onClose={onClose} title={editing ? "Edit member" : "Add member"}>
      {loading ? <div className="grid place-items-center py-16"><AdminSpinner className="h-6 w-6" /></div> : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Name" required><AdminInput {...field("name")} /></Field><Field label="Role" required><AdminInput {...field("role")} placeholder="Founder, Lead Engineer…" /></Field></div>
          <Field label="Photo"><MediaPicker value={item.photo ?? ""} folder="team" onChange={(url) => setItem((s) => ({ ...s, photo: url }))} /></Field>
          <Field label="Short bio"><AdminTextarea {...field("bio")} rows={3} /></Field>
          <div className="grid gap-4 sm:grid-cols-3"><Field label="LinkedIn"><AdminInput {...field("linkedin")} placeholder="https://" /></Field><Field label="GitHub"><AdminInput {...field("github")} placeholder="https://" /></Field><Field label="Email"><AdminInput {...field("email")} type="email" /></Field></div>
          <div className="rounded-xl border border-white/5 bg-night-900/40 p-4"><Toggle checked={item.published ?? false} onChange={(v) => setItem((s) => ({ ...s, published: v }))} label="Published on About page" /></div>
          <div className="flex justify-end gap-2 pt-2"><AdminButton variant="secondary" onClick={onClose}>Cancel</AdminButton><AdminButton onClick={save} loading={saving} disabled={!item.name || !item.role}>Save</AdminButton></div>
        </div>
      )}
    </Drawer>
  );
}
