import { useEffect, useRef, useState } from 'react';
import Pusher from 'pusher-js/react-native';

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: number;
    username: string;
    identity?: { color: string; badges: { type: string; text?: string }[] };
  };
}

export function usePusherChat(chatroomId?: number) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!chatroomId) return;
    const pusher = new Pusher('eb1d5f283081a78b932c', { cluster: 'us2', forceTLS: true });
    pusherRef.current = pusher;
    const ch = pusher.subscribe(`chatrooms.${chatroomId}.v2`);
    ch.bind('App\\Events\\ChatMessageEvent', (data: any) => {
      setMessages(prev => {
        const next = [...prev, {
          id: data.id ?? String(Date.now()),
          content: data.content ?? '',
          sender: { id: data.sender?.id ?? 0, username: data.sender?.username ?? 'unknown', identity: data.sender?.identity },
        }];
        return next.length > 150 ? next.slice(-150) : next;
      });
    });
    return () => { ch.unbind_all(); pusher.disconnect(); };
  }, [chatroomId]);

  return { messages };
}
