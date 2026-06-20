import axios from 'axios';
import { KickUser } from '../context/AuthContext';

const BASE = 'https://kick.com/api/v2';

const headers = {
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
  'Accept': 'application/json',
  'Referer': 'https://kick.com',
};

export interface KickLivestream {
  id: number;
  session_title: string;
  is_live: boolean;
  viewer_count: number;
  playback_url: string;
}

export interface KickChannel {
  id: number;
  slug: string;
  playback_url: string;
  user?: KickUser & { id: number };
  chatroom?: { id: number };
  livestream?: KickLivestream;
}

export const kickApi = {
  async getMe(token: string): Promise<KickUser> {
    const { data } = await axios.get(`${BASE}/user`, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
    });
    return { id: data.id, username: data.username, profile_pic: data.profile_pic };
  },
  async getChannel(slug: string): Promise<KickChannel> {
    const { data } = await axios.get(`${BASE}/channels/${slug}`, { headers });
    console.log('Channel data:', JSON.stringify({
      playback_url: data.playback_url,
      chatroom_id: data.chatroom?.id,
      livestream: data.livestream?.session_title,
    }));
    return data;
  },
};
