import { useCallback, useState } from 'react';

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export type AsyncState<T> =
  | { status: 'idle'; data: T | null; error: null; isLoading: false; isSuccess: false; isError: false }
  | { status: 'loading'; data: T | null; error: null; isLoading: true; isSuccess: false; isError: false }
  | { status: 'success'; data: T; error: null; isLoading: false; isSuccess: true; isError: false }
  | { status: 'error'; data: T | null; error: Error; isLoading: false; isSuccess: false; isError: true };

/**
 * Predictable Discriminated Union Async State Hook.
 * Eliminates ad-hoc boolean loading flags and hardcoded timeouts.
 */
export function useAsyncState<T>(initialData: T | null = null) {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: initialData,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const setIdle = useCallback(() => {
    setState({
      status: 'idle',
      data: initialData,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, [initialData]);

  const setLoading = useCallback(() => {
    setState((prev) => ({
      status: 'loading',
      data: prev.data,
      error: null,
      isLoading: true,
      isSuccess: false,
      isError: false,
    }));
  }, []);

  const setSuccess = useCallback((data: T) => {
    setState({
      status: 'success',
      data,
      error: null,
      isLoading: false,
      isSuccess: true,
      isError: false,
    });
  }, []);

  const setError = useCallback((error: Error | string) => {
    setState((prev) => ({
      status: 'error',
      data: prev.data,
      error: typeof error === 'string' ? new Error(error) : error,
      isLoading: false,
      isSuccess: false,
      isError: true,
    }));
  }, []);

  const execute = useCallback(
    async (promiseFactory: () => Promise<T>): Promise<T | null> => {
      setLoading();
      try {
        const result = await promiseFactory();
        setSuccess(result);
        return result;
      } catch (err) {
        const parsedError = err instanceof Error ? err : new Error(String(err));
        setError(parsedError);
        return null;
      }
    },
    [setLoading, setSuccess, setError]
  );

  return {
    ...state,
    setIdle,
    setLoading,
    setSuccess,
    setError,
    execute,
  };
}
