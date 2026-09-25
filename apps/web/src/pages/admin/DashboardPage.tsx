import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, type Wrapped } from "@/lib/api";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card, AdminSpinner, StatusPill } from "@/components/admin/ui";
import { AreaChart, DonutChart, BarList } from "@/components/admin/Charts";
import { useAuth } from "@/context/AuthContext";
import { relativeTime, formatDate } from "@/lib/format";
import { Inbox, Users, TrendingUp, Clock, ArrowUpRight, Activity as ActivityIcon } from "lucide-react";

interface Dashboard {
  stats: Record<string, number>;
  charts: { inquiriesOverTime: { date: string; count: number }[]; projectTypes: { label: string; value: number }[]; leadSources: { label: string; value: number }[]; topPosts: { label: string; value: number }[] };
  recentInquiries: { id: string; number: number; name: string; type: string; status: string; createdAt: string; projectType: string | null }[];
  followUps: { id: string; number: number; name: string; followUpAt: string; status: string }[];
  recentActivity: { id: string; message: string; createdAt: string; user: { name: string } | null }[];
}

const statCards = [
  { key: "newInquiries", label: "New inquiries", icon: Inbox, tone: "text-sky-300 bg-sky-500/10", to: "/admin/inquiries?status=NEW" },
  { key: "totalInquiries", label: "Total inquiries", icon: TrendingUp, tone: "text-brand-300 bg-brand-500/10", to: "/admin/inquiries" },
  { key: "contacts", label: "Contacts", icon: Users, tone: "text-violet-300 bg-violet-500/10", to: "/admin/contacts" },
];

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => api<Wrapped<Dashboard>>("/api/admin/dashboard", { params: { days: 30 } }).then((r) => r.data) });

  if (isLoading || !data) return <div className="grid place-items-center py-32"><AdminSpinner className="h-8 w-8" /></div>;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader title={`${greeting}, ${user?.name.split(" ")[0]}`} description="Here's what's happening across your website today." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.key} to={card.to}>
            <Card className="group p-5 transition-colors hover:border-white/10">
              <div className="flex items-center justify-between">
                <span className={`grid h-10 w-10 place-items-center rounded-lg ${card.tone}`}><card.icon className="h-5 w-5" /></span>
                <ArrowUpRight className="h-4 w-4 text-mist/20 transition-colors group-hover:text-mist/50" />
              </div>
              <div className="mt-4 font-display text-3xl font-semibold text-mist">{data.stats[card.key] ?? 0}</div>
              <div className="text-sm text-mist/50">{card.label}</div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-medium text-mist">Inquiries over time</h3><span className="text-xs text-mist/40">Last 30 days</span></div>
          <AreaChart data={data.charts.inquiriesOverTime} />
        </Card>
        <Card className="p-5">
          <h3 className="mb-4 font-medium text-mist">Project types</h3>
          <DonutChart data={data.charts.projectTypes} />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h3 className="font-medium text-mist">Recent inquiries</h3><Link to="/admin/inquiries" className="text-sm text-brand-400 hover:text-brand-300">View all</Link></div>
          {data.recentInquiries.length === 0 ? <p className="py-10 text-center text-sm text-mist/40">No inquiries yet.</p> : (
            <div className="space-y-1">
              {data.recentInquiries.map((inq) => (
                <Link key={inq.id} to={`/admin/inquiries/${inq.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/5 text-xs font-semibold text-mist/70">{inq.name[0]}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><span className="truncate text-sm font-medium text-mist">{inq.name}</span><span className="text-xs text-mist/30">#AS{inq.number}</span></div>
                    <div className="truncate text-xs text-mist/40">{inq.type === "PROJECT" ? inq.projectType || "Project inquiry" : "Contact message"}</div>
                  </div>
                  <StatusPill value={inq.status} />
                  <span className="hidden shrink-0 text-xs text-mist/30 sm:block">{relativeTime(inq.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-3 flex items-center gap-2 font-medium text-mist"><Clock className="h-4 w-4 text-amber-300" /> Upcoming follow-ups</h3>
            {data.followUps.length === 0 ? <p className="py-6 text-center text-sm text-mist/40">Nothing scheduled.</p> : (
              <ul className="space-y-2">
                {data.followUps.map((f) => (
                  <li key={f.id}><Link to={`/admin/inquiries/${f.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-white/[0.03]"><span className="truncate text-sm text-mist/80">{f.name}</span><span className="shrink-0 text-xs text-amber-300/80">{formatDate(f.followUpAt)}</span></Link></li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-5">
            <h3 className="mb-3 font-medium text-mist">Lead sources</h3>
            <BarList data={data.charts.leadSources} />
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 font-medium text-mist"><ActivityIcon className="h-4 w-4 text-brand-300" /> Recent activity</h3>
          {data.recentActivity.length === 0 ? <p className="py-6 text-center text-sm text-mist/40">No recent activity.</p> : (
            <ul className="space-y-3">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                  <div><span className="text-mist/80">{a.message}</span> <span className="text-mist/30">· {a.user?.name ?? "System"} · {relativeTime(a.createdAt)}</span></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
