// src/hooks/useNotifications.js
import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'https://waste-backend-3u9c.onrender.com';
const POLL_INTERVAL = 5 * 60 * 1000; // 5 minute

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({ total: 0, urgent: 0, warning: 0, info: 0 });
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('wasteAccessToken');
      if (!token) return;

      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications || []);
        setCounts(json.data.counts || { total: 0, urgent: 0, warning: 0, info: 0 });
        setLastFetched(new Date());
      }
    } catch (err) {
      console.error('useNotifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch la mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Poll la fiecare 5 minute
  useEffect(() => {
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return { notifications, counts, loading, lastFetched, refetch: fetchNotifications };
};

export default useNotifications;