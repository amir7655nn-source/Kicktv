import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export type EmoteMap = Record<string, string>;
const CDN = (id: string) => `https://cdn.7tv.app/emote/${id}/2x.webp`;
const TTL = 30 * 60 * 1000;

async function getCached(key: string): Promise<EmoteMap | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { map, ts } = JSON.parse(raw);
    return Date.now() - ts < TTL ? map : null;
  } catch { return null; }
}
async function saveCache(key: string, map: EmoteMap) {
  try { await AsyncStorage.setItem(key, JSON.stringify({ map, ts: Date.now() })); } catch {}
}

async function fetch7TVGlobal(): Promise<EmoteMap> {
  const c = await getCached('7tv_global');
  if (c) return c;
  const { data } = await axios.get('https://7tv.io/v3/emote-sets/global');
  const map: EmoteMap = {};
  for (const e of data?.emotes ?? []) map[e.name] = CDN(e.id);
  await saveCache('7tv_global', map);
  return map;
}

async function fetch7TVChannel(userId: number): Promise<EmoteMap> {
  const c = await getCached(`7tv_ch_${userId}`);
  if (c) return c;
  try {
    const { data } = await axios.get(`https://7tv.io/v3/users/kick/${userId}`);
    const map: EmoteMap = {};
    for (const e of data?.emote_set?.emotes ?? []) map[e.name] = CDN(e.id);
    await saveCache(`7tv_ch_${userId}`, map);
    return map;
  } catch { return {}; }
}

async function fetchKickEmotes(slug: string): Promise<EmoteMap> {
  const c = await getCached(`kick_em_${slug}`);
  if (c) return c;
  try {
    const { data } = await axios.get(`https://kick.com/api/v2/channels/${slug}/emotes`);
    const map: EmoteMap = {};
    for (const group of data ?? []) {
      for (const e of group.emotes ?? [group]) {
        if (e.name && e.id) map[e.name] = `https://files.kick.com/emotes/${e.id}/fullsize`;
      }
    }
    await saveCache(`kick_em_${slug}`, map);
    return map;
  } catch { return {}; }
}

export function useEmoteMap(userId?: number, slug?: string) {
  const [emoteMap, setEmoteMap] = useState<EmoteMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !slug) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [g, ch, k] = await Promise.all([fetch7TVGlobal(), fetch7TVChannel(userId), fetchKickEmotes(slug)]);
        if (!cancelled) setEmoteMap({ ...k, ...g, ...ch });
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId, slug]);

  return { emoteMap, loading };
}
