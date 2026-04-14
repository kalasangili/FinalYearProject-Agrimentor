/**
 * useMarketPrices - real-time commodity prices with auto-refresh and error handling
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchMarketPrices } from '../services/api';

const AUTO_REFRESH_MS = 15 * 60 * 1000; // 15 minutes

export function useMarketPrices(crops = null, autoRefresh = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    if (!isRefresh) setError(null);
    try {
      const result = await fetchMarketPrices(crops);
      setData(result);
      setError(null);
      return result;
    } catch (err) {
      const msg = err.message || 'Failed to load market prices';
      setError(msg);
      if (!isRefresh) setData(null);
      throw err;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [crops?.join(',')]);

  useEffect(() => {
    load(false);
  }, [load]);

  // Auto-refresh for dynamic updates
  useEffect(() => {
    if (!autoRefresh || !data) return;
    refreshTimerRef.current = setInterval(() => {
      load(true).catch(() => {});
    }, AUTO_REFRESH_MS);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefresh, data, load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, loading, error, refresh, isRefreshing };
}
