import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, ApiError, type Wrapped } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: AuthUser | null) => void;
  can: (permission: string) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api<Wrapped<AuthUser>>("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<Wrapped<AuthUser>>("/api/auth/login", { method: "POST", body: { email, password } });
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  const can = useCallback((permission: string) => user?.permissions.includes(permission) ?? false, [user]);

  return <AuthContext.Provider value={{ user, loading, login, logout, refresh, setUser, can }}>{children}</AuthContext.Provider>;
}
