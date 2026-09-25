import { motion, useReducedMotion } from "framer-motion";
import { BrainCircuit, Cloud, Database, Globe, Smartphone, Workflow, Boxes } from "lucide-react";

/**
 * The hero's centrepiece: the value proposition drawn as a literal system.
 * A central "Your business" hub links to the capabilities Cyber Nexa builds around it.
 * On load, links draw in and nodes pop once (staggered), then links breathe slowly.
 * Fully static when the visitor prefers reduced motion.
 */
const NODES = [
  { key: "ai", label: "AI", icon: BrainCircuit, angle: -90 },
  { key: "web", label: "Web", icon: Globe, angle: -38 },
  { key: "mobile", label: "Mobile", icon: Smartphone, angle: 14 },
  { key: "cloud", label: "Cloud", icon: Cloud, angle: 66 },
  { key: "automation", label: "Automation", icon: Workflow, angle: 118 },
  { key: "data", label: "Data", icon: Database, angle: 170 },
  { key: "systems", label: "Systems", icon: Boxes, angle: 222 },
];

const CX = 260;
const CY = 260;
const R = 180;

function polar(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

export function SystemMap() {
  const reduce = useReducedMotion();
  const positions = NODES.map((n) => ({ ...n, ...polar(n.angle, R) }));

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {/* soft aura */}
      <div className="absolute inset-8 rounded-full bg-spring/10 blur-3xl" aria-hidden />
      <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label="Cyber Nexa Solution connects AI, web, mobile, cloud, automation, data and business systems around your business.">
        <defs>
          <radialGradient id="hub" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="60%" stopColor="#2B84EF" />
            <stop offset="100%" stopColor="#7C3AED" />
          </radialGradient>
          <linearGradient id="link" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* orbit ring */}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#38BDF8" strokeOpacity="0.12" strokeDasharray="2 7" />

        {positions.map((n, i) => (
          <motion.line
            key={`l-${n.key}`}
            x1={CX} y1={CY} x2={n.x} y2={n.y}
            stroke="url(#link)" strokeWidth={1.6} strokeLinecap="round"
            initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
            animate={reduce ? undefined : { pathLength: 1, opacity: [0, 1, 0.55] }}
            transition={reduce ? undefined : { duration: 1.1, delay: 0.3 + i * 0.09, ease: "easeInOut", opacity: { duration: 3.5, delay: 0.3 + i * 0.09, repeat: Infinity, repeatType: "reverse", times: [0, 0.4, 1] } }}
          />
        ))}

        {/* travelling pulse dots along each link */}
        {!reduce &&
          positions.map((n, i) => (
            <motion.circle
              key={`p-${n.key}`}
              r={3} fill="#38BDF8"
              initial={{ cx: CX, cy: CY, opacity: 0 }}
              animate={{ cx: [CX, n.x], cy: [CY, n.y], opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, delay: 1.2 + i * 0.35, repeat: Infinity, repeatDelay: NODES.length * 0.35, ease: "easeInOut" }}
            />
          ))}
      </svg>

      {/* central hub */}
      <motion.div
        className="absolute left-1/2 top-1/2 flex h-[128px] w-[128px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center text-white shadow-[0_18px_50px_-12px_rgba(15,124,107,0.6)]"
        style={{ background: "url(#hub)" }}
        initial={reduce ? undefined : { scale: 0, opacity: 0 }}
        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
        transition={reduce ? undefined : { type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle at 50% 40%, #38BDF8, #2B84EF 55%, #7C3AED)" }} />
        <div className="relative">
          <div className="text-[11px] font-medium uppercase tracking-wider text-white/70">Your</div>
          <div className="font-display text-lg font-semibold leading-tight">Business</div>
        </div>
      </motion.div>

      {/* capability nodes */}
      {positions.map((n, i) => {
        const Icon = n.icon;
        return (
          <motion.div
            key={n.key}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
            style={{ left: `${(n.x / 520) * 100}%`, top: `${(n.y / 520) * 100}%` }}
            initial={reduce ? undefined : { scale: 0, opacity: 0 }}
            animate={reduce ? undefined : { scale: 1, opacity: 1 }}
            transition={reduce ? undefined : { type: "spring", stiffness: 260, damping: 18, delay: 0.5 + i * 0.09 }}
          >
            <motion.div
              className="grid h-[52px] w-[52px] place-items-center rounded-2xl border border-white/10 bg-white/95 text-brand-700 shadow-soft backdrop-blur"
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={reduce ? undefined : { duration: 4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </motion.div>
            <span className="rounded-md bg-petrol/40 px-1.5 text-[11px] font-medium text-white/90 backdrop-blur-sm">{n.label}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
