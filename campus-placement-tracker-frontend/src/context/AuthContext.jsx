import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { api, storage } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(storage.getToken());
  const [user, setUser] = useState(storage.getUser());
  const [initializing, setInitializing] = useState(Boolean(storage.getToken()));

  const saveSession = useCallback((session) => {
    storage.setSession(session.token, session.user);
    setToken(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  const clearSession = useCallback(() => {
    storage.clearSession();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUser() {
      if (!storage.getToken()) {
        setInitializing(false);
        return;
      }

      try {
        const profile = await api.me();
        if (mounted) {
          setUser(profile);
          localStorage.setItem("campus_placement_user", JSON.stringify(profile));
        }
      } catch {
        if (mounted) clearSession();
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    loadCurrentUser();
    return () => {
      mounted = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials) => {
      const session = await api.login(credentials);
      return saveSession(session);
    },
    [saveSession]
  );

  const registerStudent = useCallback(
    async (payload) => {
      const session = await api.registerStudent(payload);
      return saveSession(session);
    },
    [saveSession]
  );

  const registerRecruiter = useCallback(
    async (payload) => {
      const session = await api.registerRecruiter(payload);
      return saveSession(session);
    },
    [saveSession]
  );

  const logout = useCallback(async () => {
    try {
      if (storage.getToken()) await api.logout();
    } catch {
      // Client-side token removal is the source of truth for JWT logout.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      initializing,
      login,
      registerStudent,
      registerRecruiter,
      logout,
      setUser
    }),
    [
      token,
      user,
      initializing,
      login,
      registerStudent,
      registerRecruiter,
      logout
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
