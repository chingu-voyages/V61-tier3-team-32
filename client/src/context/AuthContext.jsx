import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api, { setAccessToken } from "../lib/api";

const AuthContext = createContext(null);

// --- Token storage strategy ---
// Access token: held in memory only, inside lib/api.js. Never written to
// localStorage/sessionStorage, so it isn't readable by an XSS payload that
// can only read storage/DOM, and it disappears automatically on refresh.
// Refresh token: an httpOnly, secure cookie set by the server. JS can never
// read or write it directly — the browser attaches it automatically to
// requests against /api/auth/* because of `withCredentials: true` + the
// cookie's `path` scoping on the server side.
//
// Net effect: a hard page refresh clears the in-memory access token, so on
// mount we call /auth/refresh once to silently exchange the refresh cookie
// (if still valid) for a new access token, rehydrating the session without
// ever exposing a long-lived token to JS.

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true until the initial silent refresh resolves

  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      try {
        const { data } = await api.post("/auth/refresh");
        if (cancelled) return;
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No valid refresh cookie — user is simply logged out. Not an error.
        if (!cancelled) setAccessToken(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(async ({ name, email, password, role }) => {
    const { data } = await api.post("/auth/signup", {
      name,
      email,
      password,
      role,
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
