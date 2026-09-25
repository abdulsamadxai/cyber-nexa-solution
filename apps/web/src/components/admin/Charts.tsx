import { useMemo } from "react";
import { cn } from "@/lib/format";

/** Minimal dependency-free charts tuned for the dark admin surface. */
export function AreaChart({ data, height = 200, className }: { data: { date: string; count: number }[]; height?: number; className?: string }) {
  const { path, area, max, points } = useMemo(() => {
    const w = 640;
    const h = height;
    const pad = 8;
    const max = Math.max(1, ...data.map((d) => d.count));
    const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
    const pts = data.map((d, i) => ({ x: pad + i * step, y: h - pad - (d.count / max) * (h - pad * 2), ...d }));
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const area = `${path} L${pts[pts.length - 1]?.x.toFixed(1)},${h - pad} L${pts[0]?.x.toFixed(1)},${h - pad} Z`;
    return { path, area, max, points: pts };
  }, [data, height]);

  return (
    <div className={cn("w-full", className)}>
      <svg viewBox={`0 0 640 ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1="8" x2="632" y1={height * f} y2={height * f} stroke="white" strokeOpacity="0.05" />)}
        {data.length > 1 && <><path d={area} fill="url(#areaFill)" /><path d={path} fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinejoin="round" /></>}
        {points.map((p, i) => (data.length <= 31 || i % 3 === 0) && <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#0A0F1E" stroke="#38BDF8" strokeWidth="1.5"><title>{`${p.date}: ${p.count}`}</title></circle>)}
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-mist/30"><span>{data[0]?.date.slice(5)}</span><span>peak {max}</span><span>{data[data.length - 1]?.date.slice(5)}</span></div>
    </div>
  );
}

const DONUT_COLORS = ["#38BDF8", "#7C3AED", "#2B84EF", "#60A5FA", "#A78BFA", "#F472B6", "#34D399", "#FBBF24"];
export function DonutChart({ data }: { data: { label: string; value: number }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let acc = 0;
  const radius = 60, circ = 2 * Math.PI * radius;
  if (total === 0) return <p className="py-8 text-center text-sm text-mist/40">No data yet</p>;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 160 160" className="h-40 w-40 -rotate-90">
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * circ;
          const seg = <circle key={i} cx="80" cy="80" r={radius} fill="none" stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="20" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-acc * circ} />;
          acc += frac;
          return seg;
        })}
        <circle cx="80" cy="80" r="42" className="fill-night-800" />
      </svg>
      <ul className="flex-1 space-y-1.5">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2.5 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
            <span className="flex-1 truncate text-mist/70">{d.label}</span>
            <span className="font-medium text-mist">{d.value}</span>
            <span className="w-10 text-right text-xs text-mist/40">{Math.round((d.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarList({ data }: { data: { label: string; value: number; sublabel?: string }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="py-8 text-center text-sm text-mist/40">No data yet</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between gap-3 text-sm"><span className="truncate text-mist/80">{d.label}</span><span className="shrink-0 font-medium text-mist">{d.value}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-spring" style={{ width: `${(d.value / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}
