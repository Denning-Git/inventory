import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useProducts = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const products = await apiService.getProducts(params);
      setData(products);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchProducts };
};

export const useAnomalies = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnomalies = async () => {
    try {
      setLoading(true);
      const anomalies = await apiService.getAnomalies(params);
      setData(anomalies);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch anomalies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalies();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: fetchAnomalies };
};

export const useDashboardAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await apiService.getDashboardAnalytics();
      setData(analytics);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh analytics every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refetch: fetchAnalytics };
};
