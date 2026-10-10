import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from './api';

export function useResource<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion(v => v + 1), []);
  useEffect(() => {
    if (!path) { setData(null); setLoading(false); setError(''); return; }
    const controller = new AbortController(); setLoading(true); setError(''); setData(null);
    api<T>(path, { signal: controller.signal }).then(setData).catch(e => { if (!controller.signal.aborted) setError(errorMessage(e)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [path, version]);
  return { data, setData, loading, error, reload };
}
