import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (deviceId) => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestData, setLatestData] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket('ws://localhost:8080/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected to Go backend');
        setIsConnected(true);
        setError(null);
        
        // Subscribe to device telemetry
        if (deviceId) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            payload: { deviceId }
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'telemetry_update':
              if (message.payload && message.payload.deviceId === deviceId) {
                setLatestData(message.payload);
              }
              break;
              
            case 'telemetry_data':
              if (message.payload && message.payload.deviceId === deviceId) {
                setLatestData(message.payload);
              }
              break;
              
            case 'pong':
              // Handle pong response
              break;
              
            default:
              console.log('Unknown WebSocket message type:', message.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
        setIsConnected(false);
      };

    } catch (err) {
      console.error('Error creating WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
    }
  }, [deviceId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }, []);

  const ping = useCallback(() => {
    sendMessage({ type: 'ping' });
  }, [sendMessage]);

  useEffect(() => {
    if (deviceId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [deviceId, connect, disconnect]);

  // Keep connection alive with periodic ping
  useEffect(() => {
    if (isConnected) {
      const pingInterval = setInterval(ping, 30000); // Ping every 30 seconds
      
      return () => {
        clearInterval(pingInterval);
      };
    }
  }, [isConnected, ping]);

  return {
    isConnected,
    latestData,
    error,
    sendMessage,
    ping,
    connect,
    disconnect
  };
};
