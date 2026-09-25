import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/admin/AdminLayout";
import { Card, AdminSelect, AdminSpinner } from "@/components/admin/ui";
import { AreaChart, DonutChart, BarList } from "@/components/admin/Charts";
import { api, type Wrapped } from "@/lib/api";
import { Eye, Users, MessageSquare, TrendingUp } from "lucide-react";

interface Analytics {
  days: number;
  totals: { views: number; visitors: number; contactSubmissions: number; projectInquiries: number; conversionRate: number };
  series: { date: string; views: number; visitors: number; inquiries: number }[];
  topPages: { path: string; views: number }[];
  sources: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  topPosts: { title: string; slug: string; views: number }[];
}

export function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading } = useQuery({ queryKey: ["analytics", days], queryFn: () => api<Wrapped<Analytics>>("/api/admin/analytics", { params: { days } }).then((r) => r.data) });

  const cards = data ? [
    { label: "Page views", value: data.totals.views, icon: Eye, tone: "text-sky-300 bg-sky-500/10" },
    { label: "Visitors", value: data.totals.visitors, icon: Users, tone: "text-brand-300 bg-brand-500/10" },
    { label: "Inquiries", value: data.totals.contactSubmissions + data.totals.projectInquiries, icon: MessageSquare, tone: "text-violet-300 bg-violet-500/10" },
    { label: "Conversion", value: `${data.totals.conversionRate}%`, icon: TrendingUp, tone: "text-amber-300 bg-amber-500/10" },
  ] : [];

  return (
    <>
      <PageHeader title="Analytics" description="Privacy-friendly traffic insights — no cookies, no personal tracking." actions={<AdminSelect value={String(days)} onChange={(e) => setDays(Number(e.target.value))} className="w-auto"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></AdminSelect>} />
      {isLoading || !data ? <div className="grid place-items-center py-32"><AdminSpinner className="h-8 w-8" /></div> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => <Card key={c.label} className="p-5"><span className={`grid h-10 w-10 place-items-center rounded-lg ${c.tone}`}><c.icon className="h-5 w-5" /></span><div className="mt-4 font-display text-3xl font-semibold text-mist">{c.value}</div><div className="text-sm text-mist/50">{c.label}</div></Card>)}
          </div>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-4"><h3 className="font-medium text-mist">Traffic</h3><span className="flex items-center gap-1.5 text-xs text-mist/40"><span className="h-2 w-2 rounded-full bg-spring" /> views</span></div>
            <AreaChart data={data.series.map((s) => ({ date: s.date, count: s.views }))} height={220} />
          </Card>
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5"><h3 className="mb-4 font-medium text-mist">Top pages</h3><BarList data={data.topPages.map((p) => ({ label: p.path, value: p.views }))} /></Card>
            <Card className="p-5"><h3 className="mb-4 font-medium text-mist">Traffic sources</h3><DonutChart data={data.sources.map((s) => ({ label: s.name, value: s.value }))} /></Card>
            <Card className="p-5"><h3 className="mb-4 font-medium text-mist">Devices</h3><DonutChart data={data.devices.map((d) => ({ label: d.name, value: d.value }))} /></Card>
            <Card className="p-5"><h3 className="mb-4 font-medium text-mist">Most-read posts</h3><BarList data={data.topPosts.map((p) => ({ label: p.title, value: p.views }))} /></Card>
          </div>
        </div>
      )}
    </>
  );
}
