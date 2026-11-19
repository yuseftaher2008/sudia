import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authApi, tokenStore, type User } from "../lib/api";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const refreshed = await authApi.refresh();
        if (!refreshed) throw new Error("No active session");
        const { user } = await authApi.me();
        if (cancelled) return;
        setUser(user);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        tokenStore.clear();
        setUser(null);
        setStatus("anonymous");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { user } = await authApi.login({ email, password });
    setUser(user);
    setStatus("authenticated");
    return user;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } finally {
      tokenStore.clear();
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  const value = useMemo(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
