import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';

interface Props {
  url: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function HLSPlayer({ url, isFullscreen, onToggleFullscreen }: Props) {
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [controls, setControls] = useState(true);
  const timer = React.useRef<any>(null);

  const showControls = () => {
    setControls(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setControls(false), 3000);
  };

  return (
    <View style={s.wrap}>
      <Video
        source={{ uri: url }}
        style={StyleSheet.absoluteFill}
        paused={paused}
        resizeMode="contain"
        onLoad={() => { setLoading(false); showControls(); }}
        onError={() => { setLoading(false); setError(true); }}
        onBuffer={({ isBuffering }: { isBuffering: boolean }) => setLoading(isBuffering)}
        controls={false}
      />

      {loading && (
        <View style={s.overlay}>
          <ActivityIndicator color="#53fc18" size="large" />
        </View>
      )}
      {error && (
        <View style={s.overlay}>
          <Text style={s.errorText}>Failed to load stream</Text>
        </View>
      )}

      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => { if (controls) setControls(false); else showControls(); }}
      >
        {controls && !loading && !error && (
          <View style={s.controls}>
            <View style={s.topLeft}>
              <View style={s.liveBadge}>
                <View style={s.liveDot} />
                <Text style={s.liveText}>LIVE</Text>
              </View>
            </View>
            <TouchableOpacity style={s.playBtn} onPress={() => setPaused(v => !v)}>
              <Text style={s.playIcon}>{paused ? '▶' : '⏸'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.fsBtn} onPress={onToggleFullscreen}>
              <Text style={s.fsIcon}>{isFullscreen ? '⊡' : '⛶'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  errorText: { color: '#ff5555', fontSize: 14 },
  controls: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topLeft: { position: 'absolute', top: 10, left: 10 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#eb0400' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  playBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center', justifyContent: 'center',
  },
  playIcon: { color: '#fff', fontSize: 20 },
  fsBtn: { position: 'absolute', bottom: 10, right: 10, padding: 8 },
  fsIcon: { color: '#fff', fontSize: 18 },
});
