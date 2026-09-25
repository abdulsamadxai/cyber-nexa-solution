import { useState } from "react";
import { PageHeader } from "@/components/admin/AdminLayout";
import { DataTable, Pagination, type Column } from "@/components/admin/DataTable";
import { useAdminList } from "@/hooks/useAdmin";
import { formatDate } from "@/lib/format";
import type { AuditRow } from "@/lib/types";
import { ShieldCheck } from "lucide-react";

export function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminList<AuditRow>("audit", "/api/admin/audit", { page });
  const columns: Column<AuditRow>[] = [
    { key: "createdAt", header: "When", render: (a) => <span className="whitespace-nowrap text-xs text-mist/50">{formatDate(a.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> },
    { key: "user", header: "Who", render: (a) => <span className="text-mist/80">{a.user?.name ?? "System"}</span> },
    { key: "action", header: "Action", render: (a) => <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-brand-200">{a.action}</span> },
    { key: "resource", header: "Resource", render: (a) => <span className="text-xs text-mist/50">{a.resource}{a.resourceId ? ` · ${a.resourceId.slice(0, 8)}` : ""}</span> },
    { key: "ip", header: "IP", render: (a) => <span className="text-xs text-mist/30">{a.ip ?? "—"}</span> },
  ];
  return (
    <>
      <PageHeader title="Audit log" description="A record of sensitive actions taken in the dashboard." />
      <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} empty={<div className="flex flex-col items-center gap-2 py-6"><ShieldCheck className="h-8 w-8 text-mist/20" /><span>No audit entries yet.</span></div>} />
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={setPage} />}
    </>
  );
}
