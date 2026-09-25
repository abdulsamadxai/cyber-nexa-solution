import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type Paged, type Wrapped } from "@/lib/api";

/** Generic admin list hook for the CRUD/content endpoints. */
export function useAdminList<T>(key: string, path: string, params: Record<string, string | number | boolean | undefined> = {}) {
  return useQuery({ queryKey: [key, params], queryFn: () => api<Paged<T>>(path, { params }), placeholderData: (prev) => prev });
}

export function useAdminItem<T>(key: string, path: string, enabled = true) {
  return useQuery({ queryKey: [key], queryFn: () => api<Wrapped<T>>(path).then((r) => r.data), enabled });
}

export function useInvalidate() {
  const qc = useQueryClient();
  return (keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

/** Thin wrapper around a mutating request with cache invalidation. */
export function useApiMutation<TInput, TOutput = unknown>(fn: (input: TInput) => Promise<TOutput>, invalidate: string[] = []) {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: () => invalidate.forEach((k) => qc.invalidateQueries({ queryKey: [k] })) });
}
