import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.25rem", screens: { "2xl": "1200px" } },
    extend: {
      colors: {
        ink: "#0B1020",
        petrol: { DEFAULT: "#0B1024", 600: "#182452" },
        brand: { DEFAULT: "#1E6FE0", 50: "#EAF2FE", 100: "#D2E4FD", 200: "#A9CBFB", 400: "#4F9BF5", 500: "#2B84EF", 600: "#1E6FE0", 700: "#1857BE", 800: "#173F86" },
        spring: "#38BDF8",
        plum: { DEFAULT: "#7C3AED", 500: "#8B5CF6", 600: "#7C3AED" },
        gold: "#E7B24C",
        paper: "#F5F7FB",
        mist: "#DCE4F1",
        slate: { DEFAULT: "#5B6675", 600: "#5B6675" },
        // Admin dark surface tokens
        night: { 900: "#0A0F1E", 800: "#101728", 700: "#1C2742", 600: "#283350" },
      },
      fontFamily: {
        display: ['"Sora"', "system-ui", "sans-serif"],
        sans: ['"Inter"', "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "display-lg": ["clamp(2.6rem, 5.2vw, 4.4rem)", { lineHeight: "1.03", letterSpacing: "-0.03em" }],
        "display": ["clamp(2rem, 4vw, 3.1rem)", { lineHeight: "1.08", letterSpacing: "-0.025em" }],
        "heading": ["clamp(1.5rem, 2.6vw, 2.1rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(10,22,19,0.04), 0 8px 24px -12px rgba(10,22,19,0.12)",
        lift: "0 2px 4px rgba(10,22,19,0.04), 0 18px 40px -20px rgba(10,22,19,0.22)",
        glow: "0 0 0 1px rgba(56,189,248,0.2), 0 0 40px -8px rgba(56,189,248,0.35)",
      },
      backgroundImage: {
        "grid-faint": "radial-gradient(circle at 1px 1px, rgba(10,22,19,0.05) 1px, transparent 0)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "pulse-soft": { "0%,100%": { opacity: "0.4" }, "50%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
      transitionTimingFunction: { spring: "cubic-bezier(0.22, 1, 0.36, 1)" },
    },
  },
  plugins: [typography],
};
