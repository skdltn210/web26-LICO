import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { config } from '@config/env.ts';

function useChatSocket(channelId: string) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${config.chatUrl}`, {
      transports: ['websocket'],
    });

    socket.emit('join', { channelId });
    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [channelId]);

  return socketRef.current;
}

export default useChatSocket;
