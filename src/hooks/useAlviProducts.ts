import { useState, useEffect } from 'react';
import type { AlviData } from '../types';

export function useAlviProducts() {
  const [data, setData] = useState<AlviData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/data/alvi-products.json')
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json() as Promise<AlviData>;
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
