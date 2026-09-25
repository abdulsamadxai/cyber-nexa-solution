import { useQuery } from "@tanstack/react-query";
import { api, type Wrapped } from "@/lib/api";
import type { PublicSettings } from "@/lib/types";

export function useSettings() {
  return useQuery({
    queryKey: ["public-settings"],
    queryFn: () => api<Wrapped<PublicSettings>>("/api/settings/public").then((r) => r.data),
    staleTime: 5 * 60_000,
  });
}
