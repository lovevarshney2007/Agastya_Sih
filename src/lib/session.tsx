import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, sessionStore, setUnauthorizedHandler } from '../api/client';
import type { LoginResponse, Role, SessionUser } from '../api/types';

export type Portal = 'institution' | 'aicte' | 'verifier' | 'student';

export const PORTAL_FOR_ROLE: Record<Role, Portal> = {
  INSTITUTION_REGISTRAR: 'institution',
  AICTE_MAKER: 'aicte',
  AICTE_CHECKER: 'aicte',
  VERIFIER: 'verifier',
  STUDENT: 'student',
};

export const ROLE_LABEL: Record<Role, string> = {
  INSTITUTION_REGISTRAR: 'Institution registrar',
  AICTE_MAKER: 'AICTE officer',
  AICTE_CHECKER: 'AICTE senior officer',
  VERIFIER: 'Verifier',
  STUDENT: 'Student',
};

interface SessionState {
  user: SessionUser | null;
  portal: Portal | null;
  expired: boolean;
  signIn: (res: LoginResponse) => void;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => (sessionStore.token() ? sessionStore.user() : null));
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      sessionStore.clear();
      setUser(null);
      setExpired(true);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  // Confirm a restored session is still valid and refresh the stored profile.
  useEffect(() => {
    if (!sessionStore.token()) return;
    api.auth.me()
      .then((fresh) => {
        const token = sessionStore.token();
        if (token) sessionStore.save(token, fresh);
        setUser(fresh);
      })
      .catch(() => { /* 401 is handled by the unauthorized handler; network errors keep the cached session */ });
  }, []);

  const signIn = useCallback((res: LoginResponse) => {
    sessionStore.save(res.access_token, res.user);
    setExpired(false);
    setUser(res.user);
  }, []);

  const signOut = useCallback(async () => {
    try { await api.auth.logout(); } catch { /* signing out locally is enough */ }
    sessionStore.clear();
    setUser(null);
  }, []);

  const value = useMemo<SessionState>(() => ({
    user,
    portal: user ? PORTAL_FOR_ROLE[user.role] ?? null : null,
    expired,
    signIn,
    signOut,
  }), [user, expired, signIn, signOut]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}

export function portalHome(portal: Portal | null) {
  return portal ? `/${portal}` : '/sign-in';
}
