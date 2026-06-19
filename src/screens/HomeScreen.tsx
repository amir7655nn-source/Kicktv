import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, ActivityIndicator, Image, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { kickApi, KickChannel } from '../api/kickApi';
import { useAuth } from '../context/AuthContext';

function SearchIcon() {
  return <Text style={{ color: '#5a5a6e', fontSize: 15 }}>⌕</Text>;
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [channel, setChannel] = useState<KickChannel | null>(null);
  const [searched, setSearched] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    setChannel(null);
    try {
      const ch = await kickApi.getChannel(query.trim().toLowerCase());
      setChannel(ch);
    } catch {
      Alert.alert('Not found', `Channel "${query}" does not exist.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Text style={s.logo}>kick</Text>
        <View style={s.searchWrap}>
          <SearchIcon />
          <TextInput
            style={s.searchInput}
            placeholder="Search channels..."
            placeholderTextColor="#5a5a6e"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={search}
            returnKeyType="search"
            autoCapitalize="none"
          />
        </View>
        <TouchableOpacity onPress={logout}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{user?.username?.[0]?.toUpperCase() ?? 'U'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={s.content}>
        {loading && (
          <View style={s.center}>
            <ActivityIndicator color="#53fc18" size="large" />
            <Text style={s.loadingText}>Searching...</Text>
          </View>
        )}

        {!loading && channel && (
          <TouchableOpacity
            style={s.card}
            onPress={() => navigation.navigate('Stream', { channel })}
          >
            {/* Thumbnail */}
            <View style={s.thumbnail}>
              <Text style={s.thumbEmoji}>🎮</Text>
              {channel.livestream && (
                <View style={s.liveBadge}>
                  <Text style={s.liveText}>LIVE</Text>
                </View>
              )}
            </View>
            {/* Info */}
            <View style={s.cardInfo}>
              <View style={s.cardAvatarRow}>
                <View style={s.cardAvatar}>
                  <Text style={s.cardAvatarText}>
                    {(channel.user?.username ?? channel.slug)[0].toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={s.channelName}>{channel.user?.username ?? channel.slug}</Text>
                  <Text style={s.gameText}>{channel.livestream?.session_title ?? 'Offline'}</Text>
                </View>
              </View>
              {channel.livestream ? (
                <View style={s.viewerRow}>
                  <View style={s.liveDot} />
                  <Text style={s.liveGreen}>LIVE</Text>
                  <Text style={s.viewers}>
                    {channel.livestream.viewer_count?.toLocaleString()} viewers
                  </Text>
                </View>
              ) : (
                <Text style={s.offline}>Offline</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {!loading && !channel && !searched && (
          <View style={s.center}>
            <Text style={s.hintEmoji}>📡</Text>
            <Text style={s.hint}>Search for a Kick channel</Text>
            <Text style={s.hintSub}>Type a channel name above and press Search</Text>
          </View>
        )}

        {!loading && searched && !channel && (
          <View style={s.center}>
            <Text style={s.hintEmoji}>🔍</Text>
            <Text style={s.hint}>No channel found</Text>
          </View>
        )}
      </View>

      {/* Bottom nav */}
      <View style={s.bottomNav}>
        {[
          { icon: '🏠', label: 'Home', active: true },
          { icon: '🔍', label: 'Discover', active: false },
          { icon: '❤️', label: 'Following', active: false },
          { icon: '👤', label: 'Profile', active: false },
        ].map(tab => (
          <TouchableOpacity key={tab.label} style={s.navTab}>
            <Text style={{ fontSize: 20 }}>{tab.icon}</Text>
            <Text style={[s.navLabel, tab.active && s.navActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10,
  },
  logo: { color: '#53fc18', fontWeight: '900', fontSize: 22, letterSpacing: -0.5 },
  searchWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 8, gap: 6,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  searchInput: { flex: 1, color: '#efeff1', fontSize: 13, padding: 0 },
  avatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#53fc18', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#0e0e0e', fontWeight: '800', fontSize: 14 },
  content: { flex: 1, padding: 14 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadingText: { color: '#5a5a6e', fontSize: 13, marginTop: 8 },
  hintEmoji: { fontSize: 40, marginBottom: 8 },
  hint: { color: '#efeff1', fontSize: 16, fontWeight: '600' },
  hintSub: { color: '#5a5a6e', fontSize: 13, textAlign: 'center', marginTop: 4 },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a',
  },
  thumbnail: {
    height: 160, backgroundColor: '#111',
    alignItems: 'center', justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 48 },
  liveBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: '#eb0400', borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2,
  },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cardInfo: { padding: 12, gap: 8 },
  cardAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardAvatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#53fc18', alignItems: 'center', justifyContent: 'center',
  },
  cardAvatarText: { color: '#0e0e0e', fontWeight: '800', fontSize: 16 },
  channelName: { color: '#efeff1', fontWeight: '700', fontSize: 15 },
  gameText: { color: '#adadb8', fontSize: 12, marginTop: 2 },
  viewerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#eb0400' },
  liveGreen: { color: '#53fc18', fontSize: 11, fontWeight: '700' },
  viewers: { color: '#adadb8', fontSize: 11 },
  offline: { color: '#5a5a6e', fontSize: 12 },
  bottomNav: {
    flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1a1a1a',
    backgroundColor: '#141414',
  },
  navTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10, paddingBottom: 16, gap: 3,
  },
  navLabel: { color: '#5a5a6e', fontSize: 10 },
  navActive: { color: '#53fc18', fontWeight: '700' },
});
