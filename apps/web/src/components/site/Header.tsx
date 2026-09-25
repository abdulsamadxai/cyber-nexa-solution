import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "./Logo";
import { LinkButton } from "@/components/ui/Button";
import { SearchDialog } from "./SearchDialog";
import { cn } from "@/lib/format";

const NAV = [
  { label: "Services", to: "/services" },
  { label: "Solutions", to: "/solutions" },
  { label: "Industries", to: "/industries" },
  { label: "Work", to: "/projects" },
  { label: "About", to: "/about" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "border-b border-mist bg-paper/85 backdrop-blur-lg" : "border-b border-transparent bg-transparent")}>
        <div className="container-tight flex h-[68px] items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("relative rounded-lg px-3 py-2 text-[15px] font-medium transition-colors", isActive ? "text-brand-700" : "text-ink/70 hover:text-ink")
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && <motion.span layoutId="nav-active" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-600" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setSearch(true)} className="grid h-10 w-10 place-items-center rounded-lg text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink" aria-label="Search">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <LinkButton to="/start-a-project" size="sm" className="hidden sm:inline-flex">Start a project</LinkButton>
            <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg text-ink lg:hidden" aria-label="Menu" aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border-t border-mist bg-paper lg:hidden">
              <nav className="container-tight flex flex-col gap-1 py-4">
                {NAV.map((item) => (
                  <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("rounded-lg px-3 py-2.5 text-base font-medium", isActive ? "bg-brand-50 text-brand-700" : "text-ink/80")}>
                    {item.label}
                  </NavLink>
                ))}
                <Link to="/contact" className="rounded-lg px-3 py-2.5 text-base font-medium text-ink/80">Contact</Link>
                <LinkButton to="/start-a-project" className="mt-2 w-full">Start a project</LinkButton>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <SearchDialog open={search} onClose={() => setSearch(false)} />
    </>
  );
}
