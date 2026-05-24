import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { fetchDolarRate } from '../services/exchangeRate';

interface RateMeta {
  rate: number;
  fetchedAt: number;
}

const THREE_HOURS = 3 * 60 * 60 * 1000;
const DEFAULT_META: RateMeta = { rate: 950, fetchedAt: 0 };

export function useExchangeRate() {
  const [meta, setMeta] = useLocalStorage<RateMeta>('rc_exchange_rate_meta', DEFAULT_META);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const rate = await fetchDolarRate();
      setMeta({ rate, fetchedAt: Date.now() });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [setMeta]);

  useEffect(() => {
    const stale = Date.now() - meta.fetchedAt > THREE_HOURS;
    if (stale) refresh();
  }, []);

  function setRate(rate: number) {
    setMeta({ rate, fetchedAt: Date.now() });
  }

  return {
    rate: meta.rate,
    setRate,
    loading,
    error,
    lastUpdated: meta.fetchedAt,
    refresh,
  };
}
