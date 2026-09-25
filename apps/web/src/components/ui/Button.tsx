import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 ease-spring focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none whitespace-nowrap select-none";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft hover:shadow-lift active:scale-[0.98]",
  secondary: "bg-white text-ink border border-mist hover:border-brand-200 hover:bg-brand-50/40 active:scale-[0.98]",
  ghost: "text-ink/80 hover:bg-ink/[0.05] hover:text-ink",
  subtle: "bg-brand-50 text-brand-700 hover:bg-brand-100",
  danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50 active:scale-[0.98]",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-[52px] px-7 text-base",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} {...props}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

interface LinkButtonProps extends CommonProps {
  to: string;
  external?: boolean;
}
export function LinkButton({ to, external, variant = "primary", size = "md", className, children }: LinkButtonProps) {
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external || /^https?:\/\//.test(to)) return <a href={to} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={cls}>{children}</a>;
  return <Link to={to} className={cls}>{children}</Link>;
}
