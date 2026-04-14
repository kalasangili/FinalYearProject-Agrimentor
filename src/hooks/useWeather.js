/**
 * useWeather - real-time weather data with auto-refresh and error handling
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchWeather } from '../services/api';

const DEFAULT_LOCATION = 'New Delhi';
const AUTO_REFRESH_MS = 30 * 60 * 1000; // 30 minutes

export function useWeather(initialLocation = DEFAULT_LOCATION, useGeolocation = true, autoRefresh = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [errorHint, setErrorHint] = useState(null);
  const [location, setLocation] = useState(initialLocation);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);
  const lastFetchRef = useRef({ lat: null, lon: null, loc: null });

  const load = useCallback(async (lat, lon, loc, isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);
    if (!isRefresh) {
      setError(null);
      setErrorCode(null);
      setErrorHint(null);
    }
    try {
      let result;
      if (lat != null && lon != null) {
        result = await fetchWeather({ lat, lon });
        lastFetchRef.current = { lat, lon, loc: null };
      } else {
        const searchLoc = loc || location || DEFAULT_LOCATION;
        result = await fetchWeather({ location: searchLoc });
        lastFetchRef.current = { lat: null, lon: null, loc: searchLoc };
      }
      setData(result);
      setError(null);
      setErrorCode(null);
      setErrorHint(null);
      return result;
    } catch (err) {
      const payload = err.data || {};
      const msg = payload.error || err.message || 'Failed to load weather';
      setError(msg);
      setErrorCode(payload.code || null);
      setErrorHint(payload.hint || null);
      if (!isRefresh) setData(null);
      throw err;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [location]);

  useEffect(() => {
    if (useGeolocation && navigator?.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, null, false),
        () => load(null, null, location, false),
        { enableHighAccuracy: false, timeout: 5000 }
      );
    } else {
      load(null, null, location, false);
    }
  }, []);

  // Auto-refresh for dynamic updates (uses last successful fetch params)
  useEffect(() => {
    if (!autoRefresh || !data) return;
    refreshTimerRef.current = setInterval(() => {
      const { lat, lon, loc } = lastFetchRef.current;
      load(lat, lon, loc, true).catch(() => {});
    }, AUTO_REFRESH_MS);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [autoRefresh, data, load]);

  const refresh = useCallback((newLocation) => {
    if (newLocation) setLocation(newLocation);
    return load(null, null, newLocation || location, true);
  }, [location, load]);

  return {
    data,
    loading,
    error,
    errorCode,
    errorHint,
    refresh,
    location,
    setLocation,
    isRefreshing,
  };
}
