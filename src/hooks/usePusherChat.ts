import { useEffect, useRef, useState } from 'react';

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
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!chatroomId) return;

    const ws = new WebSocket('wss://ws-us2.pusher.com/app/eb1d5f283081a78b932c?protocol=7&client=js&version=8.4.0&flash=false');
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { auth: '', channel: `chatrooms.${chatroomId}.v2` }
      }));
    };

    ws.onmessage = (e) => {
      try {
        const parsed = JSON.parse(e.data);
        if (parsed.event === 'App\\Events\\ChatMessageEvent') {
          const data = JSON.parse(parsed.data);
          setMessages(prev => {
            const next = [...prev, {
              id: data.id ?? String(Date.now()),
              content: data.content ?? '',
              sender: {
                id: data.sender?.id ?? 0,
                username: data.sender?.username ?? 'unknown',
                identity: data.sender?.identity,
              },
            }];
            return next.length > 150 ? next.slice(-150) : next;
          });
        }
      } catch {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {};

    return () => { ws.close(); };
  }, [chatroomId]);

  return { messages };
}
