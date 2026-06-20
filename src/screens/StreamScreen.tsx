import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

export default function StreamScreen() {
  const route = useRoute<any>();
  const slug = route.params?.channel?.slug ?? '';
  const [loading, setLoading] = useState(true);
  const webviewRef = useRef<any>(null);

  const inject = `
(async function() {
  const map = {};
  try {
    const g = await fetch('https://7tv.io/v3/emote-sets/global').then(r=>r.json());
    for (const e of g?.emotes??[]) map[e.name]='https://cdn.7tv.app/emote/'+e.id+'/1x.avif';
  } catch(e){}
  try {
    const c = await fetch('https://7tv.io/v3/users/kick/${slug}').then(r=>r.json());
    for (const e of c?.emote_set?.emotes??[]) map[e.name]='https://cdn.7tv.app/emote/'+e.id+'/1x.avif';
  } catch(e){}

  function process(node) {
    if (!node || node._7) return;
    node._7 = 1;
    const tw = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const ns = []; let n;
    while(n=tw.nextNode()) ns.push(n);
    for (const t of ns) {
      if (!t.parentNode || t.parentNode._7) continue;
      const ws = t.textContent.split(' ');
      if (!ws.some(w=>map[w])) continue;
      const s = document.createElement('span');
      s._7 = 1;
      ws.forEach((w,i) => {
        if (i>0) s.appendChild(document.createTextNode(' '));
        if (map[w]) {
          const img = document.createElement('img');
          img.src = map[w];
          img.style.cssText = 'width:20px;height:20px;vertical-align:middle;';
          img.title = w;
          s.appendChild(img);
        } else {
          s.appendChild(document.createTextNode(w));
        }
      });
      t.parentNode.replaceChild(s, t);
    }
  }

  new MutationObserver(ms => {
    for (const m of ms)
      for (const n of m.addedNodes)
        if (n.nodeType===1) process(n);
  }).observe(document.body, {childList:true, subtree:true});

  // process existing
  document.body.querySelectorAll('*').forEach(process);
})();
true;
  `;

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
          setTimeout(() => { webviewRef.current?.injectJavaScript(`alert("inject works!");true;`); }, 3000);
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
// debug
