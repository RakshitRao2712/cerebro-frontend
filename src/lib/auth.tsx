import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, ApiError, errorMessage, post, type User, type Health } from './api';

interface AuthState { user: User | null; loading: boolean; error: string; health: Health | null; setUser: (user: User | null) => void; refresh: () => Promise<void>; refreshHealth: () => Promise<void>; logout: () => Promise<void> }
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [health, setHealth] = useState<Health | null>(null);
  const refresh = useCallback(async () => {
    try { setUser(await api<User>('/auth/me')); setError(''); }
    catch (e) { if (e instanceof ApiError && e.status === 401) { setUser(null); setError(''); } else setError(errorMessage(e)); }
    finally { setLoading(false); }
  }, []);
  const refreshHealth = useCallback(async () => { try { setHealth(await api<Health>('/health')); } catch { setHealth(null); } }, []);
  useEffect(() => { void refresh(); void refreshHealth(); }, [refresh, refreshHealth]);
  const logout = async () => { await post('/auth/logout'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, error, health, setUser, refresh, refreshHealth, logout }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const state = useContext(AuthContext); if (!state) throw new Error('AuthProvider is required'); return state; }
