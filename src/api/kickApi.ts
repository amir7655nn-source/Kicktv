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

export async function fetchChannelData(slug: string): Promise<KickChannel> {
  // fetch مستقیم از صفحه kick.com
  const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://kick.com/',
      'Origin': 'https://kick.com',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
    },
  });
  const data = await res.json();
  return data;
}

export const kickApi = {
  async getMe(token: string): Promise<KickUser> {
    const res = await fetch('https://kick.com/api/v2/user', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return { id: data.id, username: data.username, profile_pic: data.profile_pic };
  },
  async getChannel(slug: string): Promise<KickChannel> {
    return fetchChannelData(slug);
  },
};
