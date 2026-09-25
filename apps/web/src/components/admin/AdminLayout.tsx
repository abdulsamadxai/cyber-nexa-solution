import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard, Inbox, Contact2, Briefcase, Layers, Boxes, MessageSquareQuote,
  Users, ImageIcon, Mail, Bell, BarChart3, Settings, UserCog, LogOut, Menu,  ChevronDown, Search, ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, type Wrapped } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/site/Logo";
import { initials, cn } from "@/lib/format";

interface NavItem { to: string; label: string; icon: React.ComponentType<{ className?: string }>; permission?: string; badge?: "notifications" }
const NAV: { section: string; items: NavItem[] }[] = [
  { section: "Overview", items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard }] },
  { section: "Sales", items: [
    { to: "/admin/inquiries", label: "Inquiries", icon: Inbox, permission: "inquiries.read" },
    { to: "/admin/contacts", label: "Contacts", icon: Contact2, permission: "contacts.read" },
  ] },
  { section: "Content", items: [
    { to: "/admin/projects", label: "Projects", icon: Briefcase, permission: "content.read" },
    { to: "/admin/services", label: "Services", icon: Layers, permission: "content.read" },
    { to: "/admin/solutions", label: "Solutions", icon: Boxes, permission: "content.read" },
    { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, permission: "content.read" },
    { to: "/admin/team", label: "Team", icon: Users, permission: "content.read" },
    { to: "/admin/faqs", label: "FAQs", icon: MessageSquareQuote, permission: "content.read" },
    { to: "/admin/media", label: "Media", icon: ImageIcon, permission: "media.read" },
  ] },
  { section: "System", items: [
    { to: "/admin/notifications", label: "Notifications", icon: Bell, badge: "notifications" },
    { to: "/admin/emails", label: "Email log", icon: Mail, permission: "emails.read" },
    { to: "/admin/subscribers", label: "Subscribers", icon: Users, permission: "subscribers.read" },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: "analytics.read" },
    { to: "/admin/users", label: "Admin users", icon: UserCog, permission: "users.read" },
    { to: "/admin/audit", label: "Audit log", icon: Search, permission: "audit.read" },
    { to: "/admin/settings", label: "Settings", icon: Settings, permission: "settings.read" },
  ] },
];

function useNotificationCount() {
  return useQuery({
    queryKey: ["notif-count"],
    queryFn: () => api<Wrapped<{ unread: number }>>("/api/admin/notifications/unread-count").then((r) => r.data.unread),
    refetchInterval: 60_000,
  });
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { data: unread } = useNotificationCount();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const visibleNav = NAV.map((group) => ({ ...group, items: group.items.filter((i) => !i.permission || can(i.permission)) })).filter((g) => g.items.length > 0);

  async function handleLogout() { await logout(); navigate("/admin/login", { replace: true }); }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-white/5 px-5 [&_a]:!text-mist"><Logo variant="light" /></div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {visibleNav.map((group) => (
          <div key={group.section}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-mist/30">{group.section}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to === "/admin"} className={({ isActive }) => cn("group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isActive ? "bg-brand-500/15 text-brand-300" : "text-mist/60 hover:bg-white/5 hover:text-mist")}>
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge === "notifications" && unread ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-[11px] font-semibold text-white">{unread}</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/5 p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-mist/50 transition-colors hover:bg-white/5 hover:text-mist"><ExternalLink className="h-[18px] w-[18px]" /> View website</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-night-900 text-mist">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-white/5 bg-night-800/60 lg:block">{sidebar}</aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} className="absolute inset-y-0 left-0 w-64 border-r border-white/5 bg-night-800">{sidebar}</motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-white/5 bg-night-900/80 px-4 backdrop-blur sm:px-6">
          <button onClick={() => setMobileOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg text-mist/60 hover:bg-white/5 lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden text-sm text-mist/40 sm:block">{user?.roleLabel} workspace</div>
          <div className="relative ml-auto">
            <button onClick={() => setUserMenu((v) => !v)} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-500/20 text-sm font-semibold text-brand-300">{user ? initials(user.name) : "?"}</span>
              <span className="hidden text-left sm:block"><span className="block text-sm font-medium leading-tight text-mist">{user?.name}</span><span className="block text-xs leading-tight text-mist/40">{user?.email}</span></span>
              <ChevronDown className="h-4 w-4 text-mist/40" />
            </button>
            <AnimatePresence>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-night-800 py-1 shadow-2xl">
                    <Link to="/admin/profile" className="block px-4 py-2.5 text-sm text-mist/80 hover:bg-white/5">Profile & security</Link>
                    <Link to="/admin/settings" className="block px-4 py-2.5 text-sm text-mist/80 hover:bg-white/5">Settings</Link>
                    <button onClick={handleLogout} className="flex w-full items-center gap-2 border-t border-white/5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5"><LogOut className="h-4 w-4" /> Sign out</button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-mist">{title}</h1>
        {description && <p className="mt-1 text-sm text-mist/50">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
