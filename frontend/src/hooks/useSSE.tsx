import { useState, useEffect, useCallback, useRef } from 'react';

export function useSSE<DataType>(url: string) {
    const [data, setData] = useState<DataType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const eventSourceRef = useRef<EventSource>(null);
    const reconnectTimeoutRef = useRef<number>(null);

    const connect = useCallback(() => {
        try {
            
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            eventSource.onopen = () => {
                console.log('SSE connection opened');
                setIsConnected(true);
                setError(null);
            };
            
            eventSource.onmessage = (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    setData(parsedData);
                } catch (parseError) {
                    console.error('Error parsing SSE data:', parseError);
                    setError('Data parsing error');
                }
            };

            eventSource.onerror = (event) => {
                console.error('SSE connection error:', event);
                setIsConnected(false);

                if (eventSource.readyState === EventSource.CLOSED) {
                    setError('Connection lost. Attempting to reconnect...');

                    reconnectTimeoutRef.current = setTimeout(() => {
                        // eslint-disable-next-line react-hooks/immutability
                        connect();
                    }, 3000);
                }
            };

        } catch (err) {
            console.error('Error creating SSE connection:', err);
            setError('Connection creation error');
        }
    }, [url]);

    const disconnect = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }

        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        setIsConnected(false);
    }, []);

    useEffect(() => {
        connect();

        return () => {
            disconnect();
        };
    }, [connect, disconnect]);

    return {
        data,
        error,
        isConnected,
        connect,
        disconnect
    };
};