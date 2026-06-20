import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

export default function StreamScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const channel = route.params?.channel;
  const slug = channel?.slug ?? route.params?.slug ?? '';
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<any>(null);

  // اسکریپت inject برای 7TV
  const inject7TV = `
  (async function() {
    // صبر میکنیم چت لود بشه
    function waitForChat() {
      return new Promise(resolve => {
        const check = setInterval(() => {
          const chatContainer = document.querySelector('[data-testid="chat-container"]') 
            || document.querySelector('.chat-container')
            || document.querySelector('[class*="chat"]');
          if (chatContainer) { clearInterval(check); resolve(chatContainer); }
        }, 1000);
      });
    }

    // لود ایموت‌های 7TV
    async function load7TVEmotes() {
      const emoteMap = {};
      try {
        // global emotes
        const global = await fetch('https://7tv.io/v3/emote-sets/global').then(r => r.json());
        for (const e of global?.emotes ?? []) {
          emoteMap[e.name] = 'https://cdn.7tv.app/emote/' + e.id + '/1x.webp';
        }
        // channel emotes
        const channel = await fetch('https://7tv.io/v3/users/kick/${slug}').then(r => r.json());
        for (const e of channel?.emote_set?.emotes ?? []) {
          emoteMap[e.name] = 'https://cdn.7tv.app/emote/' + e.id + '/1x.webp';
        }
      } catch(e) {}
      return emoteMap;
    }

    // replace متن ایموت با عکس
    function replaceEmotes(element, emoteMap) {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      
      for (const node of nodes) {
        const words = node.textContent.split(' ');
        let changed = false;
        const span = document.createElement('span');
        
        for (const word of words) {
          if (emoteMap[word]) {
            const img = document.createElement('img');
            img.src = emoteMap[word];
            img.style.cssText = 'width:24px;height:24px;vertical-align:middle;margin:0 2px;';
            img.title = word;
            span.appendChild(img);
            changed = true;
          } else {
            span.appendChild(document.createTextNode(word + ' '));
          }
        }
        
        if (changed && node.parentNode) {
          node.parentNode.replaceChild(span, node);
        }
      }
    }

    const emoteMap = await load7TVEmotes();
    
    // watch برای پیام‌های جدید
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) replaceEmotes(node, emoteMap);
        }
      }
    });

    const chat = await waitForChat();
    observer.observe(chat, { childList: true, subtree: true });
    
    console.log('7TV loaded:', Object.keys(emoteMap).length, 'emotes');
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
          webviewRef.current?.injectJavaScript(inject7TV);
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    zIndex: 10,
  },
  loadingText: { color: '#5a5a6e', fontSize: 14 },
});
