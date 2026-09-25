import { Seo } from "@/components/Seo";
import { Reveal, SectionHeading } from "@/components/site/Section";
import { LinkButton } from "@/components/ui/Button";
import { useSettings } from "@/hooks/useSettings";
import { useTeam } from "@/hooks/useContent";
import { initials } from "@/lib/format";
import { Github, Linkedin, Mail, ArrowRight, ShieldCheck, Target, Gem, Lightbulb, Users2 } from "lucide-react";

const valueIcons = [ShieldCheck, Gem, Lightbulb, Target, Users2];

export function AboutPage() {
  const { data: settings } = useSettings();
  const { data: team } = useTeam();
  const about = settings?.about;

  return (
    <>
      <Seo title="About" description={about?.intro || "Learn about Cyber Nexa Solution — our mission, values and the people who build technology you can trust."} path="/about" />
      <section className="relative overflow-hidden bg-gradient-to-b from-petrol to-petrol-600 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)", backgroundSize: "38px 38px" }} />
        <div className="container-tight relative py-20">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2"><span className="h-px w-6 bg-spring" /><span className="text-sm font-semibold text-spring">About us</span></div>
            <h1 className="text-display font-bold text-white">{about?.heading || "Technology you can trust, from a team that listens"}</h1>
            <p className="mt-5 text-lg leading-relaxed text-white/70">{about?.intro || "At Cyber Nexa Solution, trust is the foundation. We build technology around your business, not the other way around — and we stand behind it after launch."}</p>
          </div>
        </div>
      </section>

      {about?.body && (
        <section className="container-tight py-16">
          <div className="prose-amanah mx-auto max-w-3xl whitespace-pre-line">{about.body}</div>
        </section>
      )}

      {about?.mission && (
        <section className="border-y border-mist bg-white">
          <div className="container-tight py-16">
            <div className="mx-auto max-w-3xl rounded-2xl border border-brand-100 bg-brand-50/50 p-8 text-center sm:p-12">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-600 text-white"><Target className="h-6 w-6" /></div>
              <h2 className="font-display text-xl font-semibold text-ink">Our mission</h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg leading-relaxed text-ink/80">{about.mission}</p>
            </div>
          </div>
        </section>
      )}

      {about?.values && about.values.length > 0 && (
        <section className="container-tight py-16">
          <SectionHeading eyebrow="What guides us" title="Our values" align="center" />
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {about.values.map((value, i) => {
              const Icon = valueIcons[i % valueIcons.length];
              return (
                <Reveal key={value.title} delay={i * 0.06}>
                  <div className="h-full rounded-2xl border border-mist bg-white p-6">
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" strokeWidth={1.75} /></div>
                    <h3 className="font-display text-base font-semibold text-ink">{value.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate">{value.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {team && team.length > 0 && (
        <section className="border-t border-mist bg-white">
          <div className="container-tight py-16">
            <SectionHeading eyebrow="Our team" title="The people behind Cyber Nexa" align="center" />
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member, i) => (
                <Reveal key={member.id} delay={i * 0.05}>
                  <div className="rounded-2xl border border-mist bg-paper p-6 text-center">
                    <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-brand-100">
                      {member.photo ? <img src={member.photo} alt={member.name} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center font-display text-xl font-semibold text-brand-700">{initials(member.name)}</div>}
                    </div>
                    <h3 className="mt-4 font-display text-base font-semibold text-ink">{member.name}</h3>
                    <p className="text-sm text-brand-600">{member.role}</p>
                    {member.bio && <p className="mt-2 text-sm leading-relaxed text-slate">{member.bio}</p>}
                    <div className="mt-3 flex justify-center gap-1">
                      {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-slate hover:bg-white hover:text-brand-600" aria-label="LinkedIn"><Linkedin className="h-4 w-4" /></a>}
                      {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-lg text-slate hover:bg-white hover:text-brand-600" aria-label="GitHub"><Github className="h-4 w-4" /></a>}
                      {member.email && <a href={`mailto:${member.email}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate hover:bg-white hover:text-brand-600" aria-label="Email"><Mail className="h-4 w-4" /></a>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-tight py-20">
        <div className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-8 py-14 text-center text-white sm:px-16">
          <h2 className="font-display text-2xl font-semibold">Let's build something you can rely on</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">Start with a free, no-obligation conversation about your project.</p>
          <LinkButton to="/start-a-project" size="lg" className="mt-8 bg-white !text-brand-700 hover:bg-white/90">Start a project <ArrowRight className="h-4 w-4" /></LinkButton>
        </div>
      </section>
    </>
  );
}
