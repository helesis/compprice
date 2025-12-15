import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseDataOptions {
  onError?: (error: Error) => void;
  deps?: any[];
}

export function useData<T>(
  url: string,
  options: UseDataOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(url);
        if (mounted) {
          setData(response.data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          options.onError?.(error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, options.deps || [url]);

  return { data, loading, error };
}
