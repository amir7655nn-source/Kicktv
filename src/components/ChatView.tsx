import React, { useRef, useEffect, memo, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet, ListRenderItemInfo } from 'react-native';
import FastImage from 'react-native-fast-image';
import { ChatMessage } from '../hooks/usePusherChat';
import { EmoteMap } from '../hooks/useEmoteMap';

interface Props {
  messages: ChatMessage[];
  emoteMap: EmoteMap;
}

function parseTokens(text: string, emoteMap: EmoteMap) {
  return text.split(' ').map((tok, i) => {
    const url = emoteMap[tok];
    return url
      ? { type: 'emote' as const, tok, url, key: i }
      : { type: 'text' as const, tok, key: i };
  });
}

const ChatRow = memo(({ msg, emoteMap }: { msg: ChatMessage; emoteMap: EmoteMap }) => {
  const tokens = parseTokens(msg.content, emoteMap);
  const color = msg.sender.identity?.color ?? '#53fc18';
  return (
    <View style={s.row}>
      {msg.sender.identity?.badges?.map((b, i) => (
        <View key={i} style={s.badge}>
          <Text style={s.badgeText}>{b.text ?? '★'}</Text>
        </View>
      ))}
      <Text style={[s.username, { color }]}>{msg.sender.username}</Text>
      <Text style={s.colon}>: </Text>
      {tokens.map(tok =>
        tok.type === 'emote' ? (
          <FastImage
            key={tok.key}
            source={{ uri: tok.url, cache: FastImage.cacheControl.immutable }}
            style={s.emote}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <Text key={tok.key} style={s.msgText}>{tok.tok} </Text>
        )
      )}
    </View>
  );
});

export default function ChatView({ messages, emoteMap }: Props) {
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: false });
  }, [messages.length]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ChatMessage>) => <ChatRow msg={item} emoteMap={emoteMap} />,
    [emoteMap],
  );

  if (messages.length === 0) {
    return (
      <View style={s.empty}>
        <Text style={s.emptyText}>Waiting for chat messages...</Text>
      </View>
    );
  }

  return (
    <>
      {/* 7TV indicator */}
      <View style={s.emoteBadge}>
        <View style={s.purpleDot} />
        <Text style={s.emoteCount}>
          7TV active · {Object.keys(emoteMap).length.toLocaleString()} emotes
        </Text>
      </View>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        style={s.list}
        contentContainerStyle={s.content}
        removeClippedSubviews
        maxToRenderPerBatch={20}
        windowSize={10}
      />
      {/* Chat input bar */}
      <View style={s.inputBar}>
        <View style={s.inputFake}>
          <Text style={s.inputPlaceholder}>Send a message...</Text>
        </View>
        <View style={s.emojiBtn}>
          <Text style={{ fontSize: 18 }}>🙂</Text>
        </View>
      </View>
    </>
  );
}

const s = StyleSheet.create({
  list: { flex: 1, backgroundColor: '#0e0e0e' },
  content: { paddingVertical: 4 },
  row: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 3,
  },
  badge: {
    backgroundColor: '#2a2a2a', borderRadius: 3,
    paddingHorizontal: 4, paddingVertical: 1, marginRight: 3,
  },
  badgeText: { color: '#adadb8', fontSize: 9 },
  username: { fontSize: 13, fontWeight: '700' },
  colon: { color: '#5a5a6e' },
  msgText: { color: '#efeff1', fontSize: 13, lineHeight: 20 },
  emote: { width: 24, height: 24, marginHorizontal: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#3a3a3a', fontSize: 14 },
  emoteBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
    backgroundColor: '#141414',
  },
  purpleDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#a855f7' },
  emoteCount: { color: '#5a5a6e', fontSize: 11 },
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderTopWidth: 1, borderTopColor: '#1a1a1a',
    backgroundColor: '#141414',
  },
  inputFake: {
    flex: 1, backgroundColor: '#1a1a1a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  inputPlaceholder: { color: '#3a3a3a', fontSize: 13 },
  emojiBtn: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#2a2a2a',
    alignItems: 'center', justifyContent: 'center',
  },
});
