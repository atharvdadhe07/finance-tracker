import { useState, useEffect, useCallback } from 'react';
import { getSummary, getMonthlyHistory } from '../api';

export function useSummary(month) {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [s, h] = await Promise.all([getSummary(month), getMonthlyHistory(6)]);
      setSummary(s);
      setHistory(Array.isArray(h) ? h : []);
    } catch (e) {
      // Handled globally by axios interceptor
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { summary, history, loading, refetch: fetch };
}
