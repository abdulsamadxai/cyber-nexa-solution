import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api";

/** Sends a privacy-friendly page view on each route change (no cookies, honours DNT/GPC). */
export function Analytics() {
  const location = useLocation();
  const last = useRef<string>("");

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/admin") || path === last.current) return;
    last.current = path;
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const timer = setTimeout(() => {
      const internal = document.referrer && new URL(document.referrer).host === window.location.host;
      void api("/api/analytics/track", {
        method: "POST",
        body: { path, referrer: internal ? undefined : document.referrer || undefined, utmSource: new URLSearchParams(window.location.search).get("utm_source") || undefined },
      }).catch(() => {});
    }, 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}
