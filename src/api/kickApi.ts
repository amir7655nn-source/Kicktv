import axios from 'axios';
import { KickUser } from '../context/AuthContext';

const BASE = 'https://kick.com/api/v2';

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
      headers: { Authorization: `Bearer ${token}` },
    });
    return { id: data.id, username: data.username, profile_pic: data.profile_pic };
  },
  async getChannel(slug: string): Promise<KickChannel> {
    const { data } = await axios.get(`${BASE}/channels/${slug}`);
    return data;
  },
};
