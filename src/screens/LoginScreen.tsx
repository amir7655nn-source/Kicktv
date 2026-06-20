import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { setToken, setUser } = useAuth();

  const continueAsGuest = async () => {
    await setToken('guest');
    await setUser({ id: 0, username: 'Guest', profile_pic: '' });
  };

  return (
    <View style={s.container}>
      <View style={s.logoWrap}>
        <Text style={s.logo}>kick</Text>
        <View style={s.tvBadge}>
          <Text style={s.tvText}>TV</Text>
        </View>
      </View>
      <Text style={s.tagline}>Watch live streams with 7TV emotes</Text>

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

      <TouchableOpacity style={s.btn} onPress={continueAsGuest}>
        <Text style={s.btnText}>Continue as Guest</Text>
      </TouchableOpacity>

      <Text style={s.disclaimer}>Third-party app · Not affiliated with Kick.com</Text>
    </View>
  );
}

const s = StyleSheet.create({
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
  disclaimer: {
    position: 'absolute', bottom: 28,
    color: '#3a3a3a', fontSize: 11,
  },
});
