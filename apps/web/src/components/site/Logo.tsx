import { Link } from "react-router-dom";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/format";

/**
 * Cyber Nexa Solution logo. If a logo image URL is set in Settings it is used
 * directly; otherwise we render the built-in "CN" monogram + wordmark, which
 * stays crisp at any size and adapts to light and dark surfaces.
 */
export function Logo({
  variant = "dark",
  className,
  showWordmark = true,
}: {
  variant?: "dark" | "light";
  className?: string;
  showWordmark?: boolean;
}) {
  const { data } = useSettings();
  const name = data?.general.companyName ?? "Cyber Nexa Solution";
  const [first, second, ...rest] = name.split(" ");
  const subtitle = rest.join(" ");
  const light = variant === "light";
  const logoSrc = data?.general.logoUrl || "/logo.png";

  return (
    <Link
      to="/"
      className={cn("group inline-flex items-center gap-2 sm:gap-2.5 shrink-0 select-none", className)}
      aria-label={name}
    >
      {/* Official CN brand logo icon badge */}
      <div className="relative flex shrink-0 items-center justify-center">
        <img
          src={logoSrc}
          alt={name}
          className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl object-contain drop-shadow-[0_2px_8px_rgba(43,132,239,0.35)] transition-transform duration-200 group-hover:scale-105"
          onError={(e) => {
            if (e.currentTarget.src !== window.location.origin + "/logo.png") {
              e.currentTarget.src = "/logo.png";
            }
          }}
        />
      </div>

      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] sm:text-[17px] font-bold tracking-tight">
            <span className={light ? "text-white" : "text-ink"}>{first} </span>
            <span className="bg-gradient-to-r from-brand-500 to-plum bg-clip-text text-transparent">{second}</span>
          </span>
          {subtitle && (
            <span
              className={cn(
                "mt-[3px] text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.28em] sm:tracking-[0.32em]",
                light ? "text-white/60" : "text-slate/75"
              )}
            >
              {subtitle}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
