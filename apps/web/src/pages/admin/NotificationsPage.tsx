import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/admin/AdminLayout";
import { AdminButton, AdminSpinner, AdminEmpty } from "@/components/admin/ui";
import { Pagination } from "@/components/admin/DataTable";
import { useAdminList, useInvalidate } from "@/hooks/useAdmin";
import { api } from "@/lib/api";
import { relativeTime, cn } from "@/lib/format";
import type { Notification } from "@/lib/types";
import { Bell, Check, Inbox, MessageSquare, UserPlus, AlertTriangle } from "lucide-react";

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = { INQUIRY: Inbox, CONTACT: MessageSquare, NEWSLETTER: UserPlus, SYSTEM: AlertTriangle };

export function NotificationsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useAdminList<Notification>("notifications", "/api/admin/notifications", { page });
  const invalidate = useInvalidate();

  async function markAll() { await api("/api/admin/notifications/read-all", { method: "POST" }); invalidate(["notif-count"]); refetch(); }
  async function markOne(n: Notification) { if (n.readAt) return; await api(`/api/admin/notifications/${n.id}`, { method: "PATCH", body: { read: true } }); invalidate(["notif-count"]); refetch(); }

  return (
    <>
      <PageHeader title="Notifications" description="New inquiries, subscribers and system alerts." actions={<AdminButton size="sm" variant="secondary" onClick={markAll}><Check className="h-4 w-4" /> Mark all read</AdminButton>} />
      {isLoading ? <div className="grid place-items-center py-20"><AdminSpinner className="h-7 w-7" /></div>
        : data?.data.length === 0 ? <AdminEmpty icon={Bell} title="You're all caught up" description="Notifications about new activity will appear here." />
        : (
          <div className="divide-y divide-white/5 rounded-xl border border-white/5 bg-night-800">
            {data?.data.map((n) => {
              const Icon = typeIcon[n.type] ?? Bell;
              const body = (
                <div className={cn("flex items-start gap-3 px-5 py-4 transition-colors", !n.readAt && "bg-brand-500/[0.04]")} onClick={() => markOne(n)}>
                  <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg", n.readAt ? "bg-white/5 text-mist/40" : "bg-brand-500/15 text-brand-300")}><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="font-medium text-mist">{n.title}</span>{!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />}</div><p className="mt-0.5 text-sm text-mist/60">{n.message}</p><p className="mt-1 text-xs text-mist/30">{relativeTime(n.createdAt)}</p></div>
                </div>
              );
              return n.link ? <Link key={n.id} to={n.link} className="block cursor-pointer">{body}</Link> : <div key={n.id} className="cursor-pointer">{body}</div>;
            })}
          </div>
        )}
      {data && <Pagination page={data.meta.page} totalPages={data.meta.totalPages} total={data.meta.total} onPage={setPage} />}
    </>
  );
}
