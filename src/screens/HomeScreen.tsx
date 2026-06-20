import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { logout, user } = useAuth();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const webviewRef = useRef<any>(null);

  const search = () => {
    if (!query.trim()) return;
    setLoading(true);
    setFetching(true);
  };

  const onMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setLoading(false);
      setFetching(false);
      if (data.error) {
        Alert.alert('Not found', `Channel "${query}" does not exist.`);
        return;
      }
      navigation.navigate('Stream', { channel: data });
    } catch {
      setLoading(false);
      setFetching(false);
    }
  };

  const injectedJS = `
    fetch('https://kick.com/api/v2/channels/${query.trim().toLowerCase()}')
      .then(r => r.json())
      .then(d => window.ReactNativeWebView.postMessage(JSON.stringify(d)))
      .catch(e => window.ReactNativeWebView.postMessage(JSON.stringify({error: true})));
    true;
  `;

  return (
    <View style={s.container}>
      {fetching && (
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://kick.com' }}
          injectedJavaScriptBeforeContentLoaded={injectedJS}
          onMessage={onMessage}
          style={{ width: 0, height: 0, opacity: 0 }}
          javaScriptEnabled
        />
      )}

      <View style={s.topBar}>
        <Text style={s.logo}>kick</Text>
        <View style={s.searchWrap}>
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
            <Text style={s.avatarText}>{user?.username?.[0]?.toUpperCase() ?? 'G'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={s.content}>
        {loading ? (
          <View style={s.center}>
            <ActivityIndicator color="#53fc18" size="large" />
            <Text style={s.loadingText}>Searching...</Text>
          </View>
        ) : (
          <View style={s.center}>
            <Text style={s.hintEmoji}>📡</Text>
            <Text style={s.hint}>Search for a Kick channel</Text>
          </View>
        )}
      </View>

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
    paddingHorizontal: 12, paddingVertical: 8,
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
