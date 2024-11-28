import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { config } from '@config/env.ts';

function useChatSocket(channelId: string, onAir: boolean) {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!onAir) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socket = io(`${config.chatUrl}`, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('join', { channelId });
      setIsConnected(true);
    });

    socketRef.current = socket;

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [channelId, onAir]);

  return { socket: socketRef.current, isConnected };
}

export default useChatSocket;
