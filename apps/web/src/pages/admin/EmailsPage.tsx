import { useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminSelect, StatusPill } from "@/components/admin/ui";
import { DataTable, Pagination, type Column } from "@/components/admin/DataTable";
import { useAdminList } from "@/hooks/useAdmin";
import { formatDate } from "@/lib/format";
import type { EmailLogRow } from "@/lib/types";
import { Mail } from "lucide-react";

export function EmailsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data, isLoading } = useAdminList<EmailLogRow>("emails", "/api/admin/emails", { page, status });
  const columns: Column<EmailLogRow>[] = [
    { key: "createdAt", header: "Sent", render: (e) => <span className="whitespace-nowrap text-xs text-mist/50">{formatDate(e.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
    { key: "to", header: "Recipient", render: (e) => <span className="text-mist/80">{e.to}</span> },
    { key: "subject", header: "Subject", render: (e) => <div><div className="text-mist/80">{e.subject}</div><div className="text-xs text-mist/30">{e.template}</div></div> },
    { key: "status", header: "Status", render: (e) => <div><StatusPill value={e.status} />{e.error && <div className="mt-0.5 max-w-[200px] truncate text-xs text-red-400/70" title={e.error}>{e.error}</div>}</div> },
    { key: "provider", header: "Provider", render: (e) => <span className="text-xs text-mist/40">{e.provider}</span> },
  ];
  return (
    <>
      <PageHeader title="Email log" description="Every email the system has attempted to send." />
      <div className="mb-4"><AdminSelect value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="w-auto"><option value="">All statuses</option><option value="SENT">Sent</option><option value="FAILED">Failed</option><option value="SKIPPED">Skipped</option></AdminSelect></div>
      <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} empty={<div className="flex flex-col items-center gap-2 py-6"><Mail className="h-8 w-8 text-mist/20" /><span>No emails logged yet.</span></div>} />
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={setPage} />}
    </>
  );
}
