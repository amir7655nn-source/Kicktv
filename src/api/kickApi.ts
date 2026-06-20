import axios from 'axios';
import { KickUser } from '../context/AuthContext';

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
    const { data } = await axios.get('https://kick.com/api/v2/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return { id: data.id, username: data.username, profile_pic: data.profile_pic };
  },
  async getChannel(slug: string): Promise<KickChannel> {
    const { data } = await axios.get(`https://kick.com/api/v2/channels/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': `https://kick.com/${slug}`,
        'Origin': 'https://kick.com',
      },
    });
    return data;
  },
};
