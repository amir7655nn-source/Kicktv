import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useAuth } from '../context/AuthContext';
import { kickApi } from '../api/kickApi';

const CLIENT_ID = 'YOUR_KICK_CLIENT_ID';
const REDIRECT = 'kicktv://auth/callback';
const AUTH_URL =
  `https://kick.com/oauth2/authorize?client_id=${CLIENT_ID}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT)}&response_type=token&scope=user:read`;

export default function LoginScreen() {
  const { setToken, setUser } = useAuth();
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);

  const onNav = async (nav: WebViewNavigation) => {
    const url = nav.url;
    if (url.startsWith(REDIRECT) || url.includes('access_token=')) {
      const match = url.match(/access_token=([^&]+)/);
      if (match) {
        setShowWebView(false);
        setLoading(true);
        try {
          await setToken(match[1]);
          const u = await kickApi.getMe(match[1]);
          await setUser(u);
        } catch {
          Alert.alert('Error', 'Login failed. Please try again.');
          await setToken(null);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  if (showWebView) {
    return (
      <View style={s.flex}>
        <TouchableOpacity style={s.closeBar} onPress={() => setShowWebView(false)}>
          <Text style={s.closeText}>✕  Close</Text>
        </TouchableOpacity>
        <WebView
          source={{ uri: AUTH_URL }}
          onNavigationStateChange={onNav}
          style={s.flex}
          startInLoadingState
          renderLoading={() => (
            <View style={s.webLoading}>
              <ActivityIndicator color="#53fc18" size="large" />
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Logo */}
      <View style={s.logoWrap}>
        <Text style={s.logo}>kick</Text>
        <View style={s.tvBadge}>
          <Text style={s.tvText}>TV</Text>
        </View>
      </View>
      <Text style={s.tagline}>Watch live streams with 7TV emotes</Text>

      {/* Features */}
      <View style={s.features}>
        {[
          { icon: '📺', text: 'Live HLS streaming' },
          { icon: '💬', text: 'Real-time chat' },
          { icon: '✨', text: '7TV emotes support' },
        ].map(f => (
          <View key={f.text} style={s.featureRow}>
            <Text style={s.featureIcon}>{f.icon}</Text>
            <Text style={s.featureText}>{f.text}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#53fc18" size="large" />
      ) : (
        <TouchableOpacity style={s.btn} onPress={() => setShowWebView(true)}>
          <Text style={s.btnText}>Sign in with Kick</Text>
        </TouchableOpacity>
      )}

      <Text style={s.disclaimer}>Third-party app · Not affiliated with Kick.com</Text>
    </View>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0e0e0e' },
  container: {
    flex: 1, backgroundColor: '#0e0e0e',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  logo: { fontSize: 56, fontWeight: '900', color: '#53fc18', letterSpacing: -2 },
  tvBadge: {
    backgroundColor: '#53fc18', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  tvText: { color: '#0e0e0e', fontWeight: '900', fontSize: 14 },
  tagline: { color: '#adadb8', fontSize: 14, marginBottom: 36 },
  features: {
    width: '100%', backgroundColor: '#1a1a1a',
    borderRadius: 14, padding: 18, gap: 14, marginBottom: 32,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20 },
  featureText: { color: '#efeff1', fontSize: 14 },
  btn: {
    backgroundColor: '#53fc18', width: '100%',
    paddingVertical: 15, borderRadius: 10, alignItems: 'center',
  },
  btnText: { color: '#0e0e0e', fontSize: 16, fontWeight: '800' },
  closeBar: {
    paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12,
    backgroundColor: '#0e0e0e',
  },
  closeText: { color: '#53fc18', fontSize: 14 },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e0e0e',
  },
  disclaimer: {
    position: 'absolute', bottom: 28,
    color: '#3a3a3a', fontSize: 11,
  },
});
