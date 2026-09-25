import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, MapPin, Phone, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { Newsletter } from "./Newsletter";
import { useSettings } from "@/hooks/useSettings";
import { waLink } from "@/lib/whatsapp";

const columns = [
  { title: "Services", links: [["Web Development", "/services/web-development"], ["Mobile Apps", "/services/mobile-app-development"], ["AI Solutions", "/services/ai-solutions"], ["Custom Software", "/services/custom-software"], ["All services", "/services"]] },
  { title: "Company", links: [["About", "/about"], ["Our work", "/projects"], ["Industries", "/industries"], ["Contact", "/contact"]] },
  { title: "Support", links: [["Start a project", "/start-a-project"], ["FAQ", "/faq"], ["Privacy Policy", "/privacy"], ["Terms of Service", "/terms"]] },
];

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
);

export function Footer() {
  const { data } = useSettings();
  const g = data?.general;
  const s = data?.social;
  const socials = [
    [s?.linkedin, Linkedin, "LinkedIn"], [s?.github, Github, "GitHub"], [s?.x, XIcon, "X"],
    [s?.instagram, Instagram, "Instagram"], [s?.facebook, Facebook, "Facebook"], [s?.youtube, Youtube, "YouTube"],
  ].filter(([url]) => url) as [string, React.ComponentType<{ className?: string }>, string][];

  return (
    <footer className="relative overflow-hidden bg-petrol text-white/70">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-spring/30 to-transparent" />
      <div className="container-tight py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
          <div className="max-w-sm">
            <Logo variant="light" />
            <p className="mt-4 text-sm leading-relaxed text-white/60">{g?.footerText ?? "Technology built around your business."}</p>
            <div className="mt-6 space-y-2.5 text-sm">
              {g?.email && <a href={`mailto:${g.email}`} className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-spring"><Mail className="h-4 w-4 text-spring/80" />{g.email}</a>}
              {g?.whatsapp && <a href={waLink(g.whatsapp)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-spring"><MessageCircle className="h-4 w-4 text-spring/80" />{g.whatsapp}</a>}
              {g?.whatsapp2 && <a href={waLink(g.whatsapp2)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-spring"><MessageCircle className="h-4 w-4 text-spring/80" />{g.whatsapp2}</a>}
              {g?.phone && <a href={`tel:${g.phone}`} className="flex items-center gap-2.5 text-white/70 transition-colors hover:text-spring"><Phone className="h-4 w-4 text-spring/80" />{g.phone}</a>}
              {g?.address && <p className="flex items-start gap-2.5 text-white/60"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-spring/80" />{g.address}</p>}
            </div>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-3 font-display text-sm font-semibold text-white">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(([label, to]) => (
                    <li key={to}><Link to={to} className="text-sm text-white/60 transition-colors hover:text-spring">{label}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-2 md:items-center">
          <div className="max-w-md">
            <h4 className="font-display text-base font-semibold text-white">Useful technology insights</h4>
            <p className="mt-1 text-sm text-white/60">Occasional, practical notes on building better business technology. No spam.</p>
          </div>
          <Newsletter />
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <p>© {new Date().getFullYear()} {g?.companyName ?? "Cyber Nexa Solution"}. All rights reserved.</p>
          {socials.length > 0 && (
            <div className="flex items-center gap-1">
              {socials.map(([url, Icon, label]) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/5 hover:text-spring">
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
