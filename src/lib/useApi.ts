import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  /** When the current data arrived (ISO string). */
  loadedAt: string | null;
  /** Re-runs the request. Existing data stays on screen while it loads. */
  reload: () => Promise<void>;
  setData: (value: T) => void;
}

/**
 * Loads data for a page. `deps` re-trigger the request; responses from a stale request are ignored.
 * Pass `null` as the loader to skip loading (e.g. while a required id is missing).
 */
export function useApi<T>(loader: (() => Promise<T>) | null, deps: unknown[]): ApiState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(loader !== null);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const requestId = useRef(0);
  const loaderRef = useRef(loader);
  useLayoutEffect(() => { loaderRef.current = loader; });

  const run = useCallback(async () => {
    const fn = loaderRef.current;
    if (!fn) { setLoading(false); return; }
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (id === requestId.current) {
        setData(result);
        setLoadedAt(new Date().toISOString());
      }
    } catch (err) {
      if (id === requestId.current) setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error, loading, loadedAt, reload: run, setData };
}

/** Wraps a mutation with pending/error state. */
export function useAction<A extends unknown[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fnRef = useRef(fn);
  useLayoutEffect(() => { fnRef.current = fn; });

  const run = useCallback(async (...args: A): Promise<R | undefined> => {
    setPending(true);
    setError(null);
    try {
      return await fnRef.current(...args);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  return { run, pending, error, clearError: () => setError(null) };
}
