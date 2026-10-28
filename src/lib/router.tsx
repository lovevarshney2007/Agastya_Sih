import { createContext, useCallback, useContext, useEffect, useMemo, useState, type AnchorHTMLAttributes, type ReactNode } from 'react';

// A small History-API router. The app has a fixed set of routes, so a dependency isn't worth it.

interface RouterState {
  path: string;
  search: URLSearchParams;
  navigate: (to: string, opts?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterState | null>(null);

function currentLocation() {
  return { path: window.location.pathname.replace(/\/+$/, '') || '/', search: window.location.search };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState(currentLocation);

  useEffect(() => {
    const onPop = () => setLoc(currentLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (to === window.location.pathname + window.location.search) return;
    if (opts?.replace) window.history.replaceState(null, '', to);
    else window.history.pushState(null, '', to);
    setLoc(currentLocation());
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(() => ({ path: loc.path, search: new URLSearchParams(loc.search), navigate }), [loc, navigate]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used inside RouterProvider');
  return ctx;
}

/** Matches "/aicte/cases/:id" against a path and returns the params, or null. */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const p = pattern.split('/').filter(Boolean);
  const a = path.split('/').filter(Boolean);
  if (p.length !== a.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(a[i]);
    else if (p[i] !== a[i]) return null;
  }
  return params;
}

export function Link({ to, children, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const { navigate } = useRouter();
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
