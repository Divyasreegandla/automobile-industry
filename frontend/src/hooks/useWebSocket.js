import { useEffect, useRef, useState } from 'react';

export const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(url);
    wsRef.current.onmessage = (event) => { setData(JSON.parse(event.data)); };
    return () => wsRef.current?.close();
  }, [url]);

  const sendMessage = (msg) => { if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.send(JSON.stringify(msg)); };
  return { data, sendMessage };
};