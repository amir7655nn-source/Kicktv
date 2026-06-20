import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { KickChannel } from '../api/kickApi';
import ChatView from '../components/ChatView';
import { useEmoteMap } from '../hooks/useEmoteMap';
import { usePusherChat } from '../hooks/usePusherChat';
import { WebView } from 'react-native-webview';

export default function StreamScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const channel: KickChannel = route.params?.channel;
  const [chatTab, setChatTab] = useState<'chat' | 'info'>('chat');

  const { emoteMap, loading: emotesLoading } = useEmoteMap(
    channel?.user?.id,
    channel?.slug,
  );
  const { messages } = usePusherChat(channel?.chatroom?.id);
  const hlsUrl = channel?.playback_url ?? channel?.livestream?.playback_url ?? null;

  const playerHtml = hlsUrl ? `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>* { margin:0; padding:0; background:#000; } video { width:100vw; height:100vh; object-fit:contain; }</style>
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    </head>
    <body>
      <video id="v" autoplay playsinline controls></video>
      <script>
        var v = document.getElementById('v');
        if (Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource('${hlsUrl}');
          hls.attachMedia(v);
        } else { v.src = '${hlsUrl}'; }
      </script>
    </body>
    </html>
  ` : null;

  if (!channel) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Channel not found</Text>
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Player */}
      <View style={s.playerWrap}>
        {playerHtml ? (
          <WebView
            source={{ html: playerHtml }}
            style={s.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
          />
        ) : (
          <View style={s.offlineBg}>
            <Text style={s.offlineText}>Stream is offline</Text>
          </View>
        )}
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
      </View>

      {/* Channel strip */}
      <View style={s.strip}>
        <View style={s.stripAvatar}>
          <Text style={s.stripAvatarText}>
            {(channel?.user?.username ?? channel?.slug ?? 'K')[0].toUpperCase()}
          </Text>
        </View>
        <View style={s.stripInfo}>
          <Text style={s.stripName}>{channel?.user?.username ?? channel?.slug}</Text>
          <Text style={s.stripGame}>{channel?.livestream?.session_title ?? 'Live'}</Text>
        </View>
        <TouchableOpacity style={s.followBtn}>
          <Text style={s.followText}>Follow</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {(['chat', 'info'] as const).map(t => (
          <TouchableOpacity key={t} style={s.tab} onPress={() => setChatTab(t)}>
            <Text style={[s.tabText, chatTab === t && s.tabActive]}>
              {t === 'chat' ? 'Chat' : 'Info'}
            </Text>
            {chatTab === t && <View style={s.tabUnderline} />}
          </TouchableOpacity>
        ))}
      </View>

      {chatTab === 'chat' && (
        emotesLoading ? (
          <View style={s.center}>
            <ActivityIndicator color="#53fc18" />
            <Text style={s.loadingText}>Loading emotes...</Text>
          </View>
        ) : (
          <ChatView messages={messages} emoteMap={emoteMap} />
        )
      )}

      {chatTab === 'info' && (
        <View style={s.infoTab}>
          <Text style={s.infoTitle}>About {channel?.user?.username ?? channel?.slug}</Text>
          <Text style={s.infoBody}>Welcome to the channel!</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  playerWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  webview: { flex: 1 },
  offlineBg: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  offlineText: { color: '#5a5a6e', fontSize: 14 },
  backBtn: {
    position: 'absolute', top: 10, left: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: '#fff', fontSize: 22, lineHeight: 28 },
  strip: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  stripAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#53fc18', alignItems: 'center', justifyContent: 'center',
  },
  stripAvatarText: { color: '#0e0e0e', fontWeight: '800', fontSize: 18 },
  stripInfo: { flex: 1 },
  stripName: { color: '#efeff1', fontWeight: '700', fontSize: 14 },
  stripGame: { color: '#adadb8', fontSize: 12 },
  followBtn: {
    backgroundColor: '#53fc18', borderRadius: 6,
    paddingHorizontal: 16, paddingVertical: 7,
  },
  followText: { color: '#0e0e0e', fontWeight: '800', fontSize: 13 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, position: 'relative' },
  tabText: { color: '#adadb8', fontSize: 13 },
  tabActive: { color: '#53fc18', fontWeight: '700' },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: '25%', right: '25%',
    height: 2, backgroundColor: '#53fc18', borderRadius: 1,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: '#5a5a6e', fontSize: 12 },
  errorText: { color: '#5a5a6e', fontSize: 15 },
  infoTab: { padding: 16, gap: 8 },
  infoTitle: { color: '#efeff1', fontWeight: '700', fontSize: 15 },
  infoBody: { color: '#adadb8', fontSize: 13, lineHeight: 20 },
});
