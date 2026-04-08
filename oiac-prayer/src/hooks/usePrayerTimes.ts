import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchPrayerTimes,
  getNextPrayer,
  type PrayerTimesData,
} from '../services/prayerTimes';
import { scheduleAllPrayerNotifications } from '../services/notifications';

export function usePrayerTimes() {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<ReturnType<typeof getNextPrayer>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPrayerTimes();
      setData(result);
      setNextPrayer(getNextPrayer(result.timings));
      await scheduleAllPrayerNotifications(result.timings);
    } catch (err: any) {
      setError(err.message || 'Failed to load prayer times');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!data) return;

    intervalRef.current = setInterval(() => {
      setNextPrayer(getNextPrayer(data.timings));
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [data]);

  return { data, loading, error, nextPrayer, refresh: load };
}
