import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

export default function StreamScreen() {
  const route = useRoute<any>();
  const slug = route.params?.channel?.slug ?? '';
  const [loading, setLoading] = useState(true);
  const [emoteMap, setEmoteMap] = useState<Record<string,string>>({});
  const webviewRef = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const map: Record<string,string> = {};
      try {
        const g = await fetch('https://7tv.io/v3/emote-sets/global').then(r=>r.json());
        for (const e of g?.emotes??[]) map[e.name] = `https://cdn.7tv.app/emote/${e.id}/1x.avif`;
      } catch(e){}
      try {
        const c = await fetch(`https://7tv.io/v3/users/kick/${slug}`).then(r=>r.json());
        for (const e of c?.emote_set?.emotes??[]) map[e.name] = `https://cdn.7tv.app/emote/${e.id}/1x.avif`;
      } catch(e){}
      setEmoteMap(map);
    })();
  }, [slug]);

  const getInject = () => {
    const mapStr = JSON.stringify(emoteMap);
    return `
(function() {
  const map = ${mapStr};
  console.log('7TV emotes:', Object.keys(map).length);

  function process(node) {
    if (!node || node._7tv) return;
    node._7tv = true;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    let n;
    while(n = walker.nextNode()) nodes.push(n);
    for (const t of nodes) {
      if (!t.parentNode || t.parentNode._7tv) continue;
      const words = t.textContent.split(' ');
      if (!words.some(w => map[w])) continue;
      const span = document.createElement('span');
      span._7tv = true;
      for (let i = 0; i < words.length; i++) {
        if (i > 0) span.appendChild(document.createTextNode(' '));
        if (map[words[i]]) {
          const img = document.createElement('img');
          img.src = map[words[i]];
          img.style.width = '22px';
          img.style.height = '22px';
          img.style.verticalAlign = 'middle';
          img.title = words[i];
          span.appendChild(img);
        } else {
          span.appendChild(document.createTextNode(words[i]));
        }
      }
      t.parentNode.replaceChild(span, t);
    }
  }

  new MutationObserver(ms => {
    for (const m of ms)
      for (const n of m.addedNodes)
        if (n.nodeType === 1) process(n);
  }).observe(document.body, { childList: true, subtree: true });

  document.body.querySelectorAll('p,span,div').forEach(process);
})();
true;
    `;
  };

  return (
    <View style={s.c}>
      {loading && (
        <View style={s.o}>
          <ActivityIndicator color="#53fc18" size="large" />
          <Text style={s.t}>Loading...</Text>
        </View>
      )}
      <WebView
        ref={webviewRef}
        source={{ uri: `https://kick.com/${slug}` }}
        style={s.w}
        onLoadEnd={() => {
          setLoading(false);
          if (Object.keys(emoteMap).length > 0) {
            setTimeout(() => webviewRef.current?.injectJavaScript(getInject()), 2000);
          } else {
            const interval = setInterval(() => {
              if (Object.keys(emoteMap).length > 0) {
                clearInterval(interval);
                webviewRef.current?.injectJavaScript(getInject());
              }
            }, 500);
          }
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
  c:{flex:1,backgroundColor:'#0e0e0e'},
  w:{flex:1},
  o:{...StyleSheet.absoluteFillObject,backgroundColor:'#0e0e0e',alignItems:'center',justifyContent:'center',gap:12,zIndex:10},
  t:{color:'#5a5a6e',fontSize:14},
});
