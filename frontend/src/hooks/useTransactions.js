import { useState, useEffect, useCallback } from 'react';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../api';
import toast from 'react-hot-toast';

export function useTransactions(filters) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const filterKey = JSON.stringify(filters);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTransactions(filters);
      setTransactions(Array.isArray(data) ? data : (data?.content || []));
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const add = async (data) => {
    const res = await createTransaction(data);
    toast.success('Transaction added');
    fetch();
    return res;
  };

  const update = async (id, data) => {
    const res = await updateTransaction(id, data);
    toast.success('Transaction updated');
    fetch();
    return res;
  };

  const remove = async (id) => {
    await deleteTransaction(id);
    toast.success('Transaction deleted');
    fetch();
  };

  return { transactions, loading, error, refetch: fetch, add, update, remove };
}
