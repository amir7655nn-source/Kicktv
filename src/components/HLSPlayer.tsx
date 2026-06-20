import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  url: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function HLSPlayer({ url, isFullscreen, onToggleFullscreen }: Props) {
  const [loading, setLoading] = useState(true);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin:0; padding:0; background:#000; }
        video { width:100vw; height:100vh; object-fit:contain; }
      </style>
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
    </head>
    <body>
      <video id="video" autoplay playsinline controls></video>
      <script>
        var video = document.getElementById('video');
        if (Hls.isSupported()) {
          var hls = new Hls();
          hls.loadSource('${url}');
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = '${url}';
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={s.wrap}>
      <WebView
        source={{ html }}
        style={s.webview}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
      />
      {loading && (
        <View style={s.overlay}>
          <ActivityIndicator color="#53fc18" size="large" />
        </View>
      )}
      <TouchableOpacity style={s.fsBtn} onPress={onToggleFullscreen}>
        <Text style={s.fsIcon}>{isFullscreen ? '⊡' : '⛶'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fsBtn: {
    position: 'absolute', bottom: 10, right: 10,
    padding: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 6,
  },
  fsIcon: { color: '#fff', fontSize: 18 },
});
