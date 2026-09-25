import { useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminSelect, StatusPill } from "@/components/admin/ui";
import { DataTable, Pagination, type Column } from "@/components/admin/DataTable";
import { useConfirm } from "@/components/admin/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useAdminList } from "@/hooks/useAdmin";
import { api, downloadUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDate } from "@/lib/format";
import type { Subscriber } from "@/lib/types";
import { Download, Trash2, Users } from "lucide-react";

export function SubscribersPage() {
  const { can } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, isLoading, refetch } = useAdminList<Subscriber>("subscribers", "/api/admin/subscribers", { page, status });
  const confirm = useConfirm();
  const toast = useToast();

  async function remove(s: Subscriber) {
    if (!(await confirm({ title: "Remove subscriber", message: `Remove ${s.email} from the list?`, danger: true, confirmLabel: "Remove" }))) return;
    await api(`/api/admin/subscribers/${s.id}`, { method: "DELETE" }); toast.success("Removed"); refetch();
  }

  const columns: Column<Subscriber>[] = [
    { key: "email", header: "Email", render: (s) => <span className="text-mist/80">{s.email}</span> },
    { key: "status", header: "Status", render: (s) => <StatusPill value={s.status} /> },
    { key: "source", header: "Source", render: (s) => <span className="text-xs text-mist/40">{s.source ?? "—"}</span> },
    { key: "createdAt", header: "Subscribed", render: (s) => <span className="text-xs text-mist/40">{formatDate(s.createdAt)}</span> },
    { key: "actions", header: "", width: "w-12", render: (s) => can("subscribers.write") ? <button onClick={() => remove(s)} className="grid h-8 w-8 place-items-center rounded-lg text-mist/40 hover:bg-red-500/10 hover:text-red-300"><Trash2 className="h-4 w-4" /></button> : null },
  ];

  return (
    <>
      <PageHeader title="Newsletter subscribers" description="People who've signed up for updates." actions={<a href={downloadUrl(`/api/admin/subscribers/export${status ? `?status=${status}` : ""}`)}><AdminButton size="sm" variant="secondary"><Download className="h-4 w-4" /> Export CSV</AdminButton></a>} />
      <div className="mb-4"><AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto"><option value="">All</option><option value="CONFIRMED">Confirmed</option><option value="PENDING">Pending</option><option value="UNSUBSCRIBED">Unsubscribed</option></AdminSelect></div>
      <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} empty={<div className="flex flex-col items-center gap-2 py-6"><Users className="h-8 w-8 text-mist/20" /><span>No subscribers yet.</span></div>} />
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={setPage} />}
    </>
  );
}
