import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useTransactions = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const transactions = await apiService.getTransactions(params);
      setData(transactions);
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [JSON.stringify(params)]); // Convert params to string for dependency array

  return { data, loading, error, refetch: fetchTransactions };
};