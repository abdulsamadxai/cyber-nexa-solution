import { cn } from "@/lib/format";

const tones = {
  neutral: "bg-mist/60 text-slate",
  brand: "bg-brand-50 text-brand-700",
  green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/10",
  red: "bg-red-50 text-red-600 ring-1 ring-red-600/10",
  blue: "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10",
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-600/10",
  slate: "bg-slate-100 text-slate-600",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "neutral", className, children, dot }: { tone?: BadgeTone; className?: string; children: React.ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />}
      {children}
    </span>
  );
}
