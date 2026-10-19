import { useState, useEffect, useCallback } from 'react';
import { getBudget, updateBudget } from '../api';
import toast from 'react-hot-toast';

export function useBudget() {
  const [budget, setBudget] = useState({ amount: 0, currency: 'USD' });
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const b = await getBudget();
      if (b) {
        setBudget(b);
      }
    } catch (e) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = async (data) => {
    const b = await updateBudget(data);
    if (b) {
      setBudget(b);
    }
    toast.success('Budget updated');
    return b;
  };

  return { budget, update, refetch: fetch, loading };
}
