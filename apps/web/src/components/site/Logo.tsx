import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/format";

/**
 * Cyber Nexa Solution logo. If a logo image URL is set in Settings it is used
 * directly; otherwise we render the built-in "CN" monogram + wordmark, which
 * stays crisp at any size and adapts to light and dark surfaces.
 */
export function Logo({ variant = "dark", className }: { variant?: "dark" | "light"; className?: string }) {
  const { data } = useSettings();
  const name = data?.general.companyName ?? "Cyber Nexa Solution";
  const [first, second, ...rest] = name.split(" ");
  const subtitle = rest.join(" ");
  const light = variant === "light";

  if (data?.general.logoUrl) {
    return (
      <Link to="/" className={cn("inline-flex items-center", className)} aria-label={name}>
        <img src={data.general.logoUrl} alt={name} className="h-9 w-auto" />
      </Link>
    );
  }

  return (
    <Link to="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label={name}>
      {/* CN monogram tile with the brand blue→purple gradient + pixel accent */}
      <span className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-plum shadow-soft">
        <span className="font-display text-[15px] font-extrabold leading-none tracking-tight text-white">CN</span>
        <span className="absolute right-1 top-1 flex gap-[2px]" aria-hidden>
          <span className="h-[3px] w-[3px] rounded-[1px] bg-white/90" />
          <span className="h-[3px] w-[3px] rounded-[1px] bg-white/50" />
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-tight">
          <span className={light ? "text-white" : "text-ink"}>{first} </span>
          <span className="bg-gradient-to-r from-brand-500 to-plum bg-clip-text text-transparent">{second}</span>
        </span>
        {subtitle && (
          <span className={cn("mt-[3px] text-[9px] font-semibold uppercase tracking-[0.32em]", light ? "text-white/55" : "text-slate/70")}>{subtitle}</span>
        )}
      </span>
    </Link>
  );
}
