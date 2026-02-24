import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '@/services/authService';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

type AuthContextType = AuthState & AuthActions;

const AuthContext = createContext<AuthContextType | null>(null);

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('jwt_token')
  );
  const [loading, setLoading] = useState(false);

  const isAuthenticated = !!token;

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      localStorage.setItem('jwt_token', data.token);
      setToken(data.token);
      const userResponse = await authService.getUser();
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      setUser(userResponse.data);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setLoading(true);
      try {
        await authService.register({ email, password, name });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await authService.getUser();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      logout();
    }
  }, [token, logout]);

  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token, user, fetchUser]);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, loading, login, register, logout, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
