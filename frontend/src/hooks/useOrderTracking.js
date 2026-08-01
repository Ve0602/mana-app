import { useState, useEffect, useRef, useCallback } from 'react';
import { orderService } from '../services';

/**
 * useOrderTracking — real-time order status via WebSocket with polling fallback.
 *
 * Usage:
 *   const { order, status, loading } = useOrderTracking(orderId);
 */
export default function useOrderTracking(orderId) {
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const wsRef                 = useRef(null);
  const pollRef               = useRef(null);
  const mountedRef            = useRef(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    try {
      const data = await orderService.getById(orderId);
      if (mountedRef.current) {
        setOrder(data);
        setLoading(false);
      }
    } catch (e) {
      if (mountedRef.current) {
        setError('Failed to load order');
        setLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch
    fetchOrder();

    // Try WebSocket connection
    const wsUrl = (process.env.REACT_APP_API_URL || 'http://localhost:8080')
      .replace('http', 'ws')
      .replace('/api/v1', '');

    try {
      // Using native WebSocket (no SockJS dependency needed for simple polling fallback)
      const ws = new WebSocket(`${wsUrl}/ws/order/${orderId}`);

      ws.onopen = () => {
        console.log('[Mana WS] Connected to order tracking');
        // Clear polling if WS connected
        if (pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);
          if (mountedRef.current && update.orderId === orderId) {
            setOrder(prev => prev ? { ...prev, status: update.status } : prev);
          }
        } catch (_) {}
      };

      ws.onerror = () => {
        // WebSocket failed → fall back to polling every 15 seconds
        startPolling();
      };

      ws.onclose = () => {
        // Connection closed → fall back to polling
        startPolling();
      };

      wsRef.current = ws;
    } catch (_) {
      // WebSocket not available → start polling
      startPolling();
    }

    function startPolling() {
      if (!pollRef.current) {
        pollRef.current = setInterval(fetchOrder, 15000);
      }
    }

    return () => {
      mountedRef.current = false;
      if (wsRef.current) wsRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, fetchOrder]);

  const isActive = order && !['DELIVERED', 'CANCELLED'].includes(order?.status);

  return { order, loading, error, isActive, refetch: fetchOrder };
}
