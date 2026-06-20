import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

export default function StreamScreen() {
  const route = useRoute<any>();
  const channel = route.params?.channel;
  const slug = channel?.slug ?? '';
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<any>(null);

  const inject7TV = `
  (async function() {
    const emoteMap = {};

    async function loadEmotes() {
      try {
        const g = await fetch('https://7tv.io/v3/emote-sets/global').then(r=>r.json());
        for (const e of g?.emotes ?? []) emoteMap[e.name] = 'https://cdn.7tv.app/emote/'+e.id+'/1x.webp';
      } catch(e) {}
      try {
        const c = await fetch('https://7tv.io/v3/users/kick/${slug}').then(r=>r.json());
        for (const e of c?.emote_set?.emotes ?? []) emoteMap[e.name] = 'https://cdn.7tv.app/emote/'+e.id+'/1x.webp';
      } catch(e) {}
      console.log('7TV emotes loaded:', Object.keys(emoteMap).length);
    }

    function processNode(node) {
      if (!node || node._7tv) return;
      const texts = [];
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
      let n;
      while (n = walker.nextNode()) texts.push(n);
      
      for (const textNode of texts) {
        const words = textNode.textContent.split(' ');
        if (!words.some(w => emoteMap[w])) continue;
        const span = document.createElement('span');
        span._7tv = true;
        for (let i = 0; i < words.length; i++) {
          const w = words[i];
          if (emoteMap[w]) {
            const img = document.createElement('img');
            img.src = emoteMap[w];
            img.alt = w;
            img.title = w;
            img.style.cssText = 'width:22px;height:22px;vertical-align:middle;margin:0 1px;display:inline-block;';
            span.appendChild(img);
          } else {
            span.appendChild(document.createTextNode((i > 0 ? ' ' : '') + w));
          }
        }
        if (textNode.parentNode) textNode.parentNode.replaceChild(span, textNode);
      }
    }

    await loadEmotes();

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) processNode(node);
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // process existing messages
    document.querySelectorAll('[data-chat-entry], [class*="message"], [class*="chat-entry"]').forEach(processNode);
  })();
  true;
  `;

  return (
    <View style={s.container}>
      {loading && (
        <View style={s.loadingOverlay}>
          <ActivityIndicator color="#53fc18" size="large" />
          <Text style={s.loadingText}>Loading stream...</Text>
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri: `https://kick.com/${slug}` }}
        style={s.webview}
        onLoadEnd={() => {
          setLoading(false);
          setTimeout(() => {
            webviewRef.current?.injectJavaScript(inject7TV);
          }, 2000);
        }}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e0e0e' },
  webview: { flex: 1 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0e0e0e',
    alignItems: 'center', justifyContent: 'center',
    gap: 12, zIndex: 10,
  },
  loadingText: { color: '#5a5a6e', fontSize: 14 },
});
