import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminInput, AdminSelect, StatusPill } from "@/components/admin/ui";
import { DataTable, Pagination, type Column } from "@/components/admin/DataTable";
import { InquiryDrawer } from "./InquiryDrawer";
import { api, downloadUrl, type Paged } from "@/lib/api";
import type { Inquiry } from "@/lib/types";
import { relativeTime } from "@/lib/format";
import { Download, Search, Inbox } from "lucide-react";

const STATUSES = ["NEW", "CONTACTED", "IN_DISCUSSION", "PROPOSAL", "WON", "LOST", "ARCHIVED"];
const TYPES = ["CONTACT", "PROJECT"];

export function InquiriesPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { id } = useParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const page = Number(params.get("page") ?? 1);
  const status = params.get("status") ?? "";
  const type = params.get("type") ?? "";

  const patch = (next: Record<string, string>) => {
    const merged = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => { if (v) merged.set(k, v); else merged.delete(k); });
    if (!("page" in next)) merged.set("page", "1");
    setParams(merged);
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["inquiries", { page, status, type, q: params.get("q") }],
    queryFn: () => api<Paged<Inquiry>>("/api/admin/inquiries", { params: { page, status, type, q: params.get("q") ?? undefined } }),
    placeholderData: (p) => p,
  });

  const columns: Column<Inquiry>[] = [
    { key: "number", header: "Ref", width: "w-20", render: (r) => <span className="font-mono text-xs text-mist/50">#AS{r.number}</span> },
    { key: "name", header: "From", render: (r) => <div><div className="font-medium text-mist">{r.name}</div><div className="text-xs text-mist/40">{r.email}</div></div> },
    { key: "type", header: "Type", render: (r) => <span className="text-xs text-mist/60">{r.type === "PROJECT" ? r.projectType || "Project" : "Contact"}</span> },
    { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
    { key: "priority", header: "Priority", render: (r) => <StatusPill value={r.priority} /> },
    { key: "assignedTo", header: "Owner", render: (r) => <span className="text-xs text-mist/60">{r.assignedTo?.name ?? "—"}</span> },
    { key: "createdAt", header: "Received", render: (r) => <span className="text-xs text-mist/40">{relativeTime(r.createdAt)}</span> },
  ];

  return (
    <>
      <PageHeader title="Inquiries" description="Every contact message and project request, tracked from first touch to won or lost."
        actions={<a href={downloadUrl(`/api/admin/inquiries/export/csv${status ? `?status=${status}` : ""}`)}><AdminButton variant="secondary" size="sm"><Download className="h-4 w-4" /> Export CSV</AdminButton></a>} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); patch({ q: search }); }} className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist/30" />
          <AdminInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, #AS1024…" className="pl-9" />
        </form>
        <AdminSelect value={status} onChange={(e) => patch({ status: e.target.value })} className="w-auto"><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}</AdminSelect>
        <AdminSelect value={type} onChange={(e) => patch({ type: e.target.value })} className="w-auto"><option value="">All types</option>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</AdminSelect>
      </div>

      <DataTable columns={columns} rows={data?.data ?? []} loading={isLoading} onRowClick={(r) => navigate(`/admin/inquiries/${r.id}`)} empty={<div className="flex flex-col items-center gap-2 py-6"><Inbox className="h-8 w-8 text-mist/20" /><span>No inquiries match your filters.</span></div>} />
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={(p) => patch({ page: String(p) })} />}

      <InquiryDrawer id={id} onClose={() => navigate("/admin/inquiries")} onChanged={() => refetch()} />
    </>
  );
}
