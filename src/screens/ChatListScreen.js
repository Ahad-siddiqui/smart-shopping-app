import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import chatService from '../services/chatService';
import useAuth from '../hooks/useAuth';
import { formatTimeAgo } from '../utils/formatDate';

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    chatService
      .getConversations()
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  if (state.status === 'loading') return <Loader />;
  if (state.status === 'failed') return <ErrorMessage message={state.error} onRetry={load} />;

  return (
    <FlatList
      data={state.items}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet.</Text>
          <Text style={styles.emptySubtext}>Contact a seller from a product page to start chatting.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const other = (item.participants || []).find((p) => p._id !== user?._id) || {};
        const unread = item.unreadCount > 0;
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('Chat', { conversationId: item._id, otherUser: other, product: item.product })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(other.name || 'U')[0]?.toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.rowTop}>
                <Text style={styles.name} numberOfLines={1}>
                  {other.name || 'User'}
                </Text>
                <Text style={styles.time}>{formatTimeAgo(item.lastMessageAt)}</Text>
              </View>
              {item.product?.title && (
                <Text style={styles.productTitle} numberOfLines={1}>
                  Re: {item.product.title}
                </Text>
              )}
              <Text style={[styles.lastMessage, unread && styles.unreadMessage]} numberOfLines={1}>
                {item.lastMessage?.text || 'Say hello 👋'}
              </Text>
            </View>
            {unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  avatar: { width: 48, height: 48, borderRadius: 999, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 14, fontWeight: '700', color: '#171717', flex: 1 },
  time: { fontSize: 11, color: '#a3a3a3' },
  productTitle: { fontSize: 11, color: '#0f766e', marginTop: 1 },
  lastMessage: { fontSize: 13, color: '#737373', marginTop: 2 },
  unreadMessage: { color: '#171717', fontWeight: '600' },
  unreadDot: { width: 10, height: 10, borderRadius: 999, backgroundColor: '#0f766e' },
  empty: { paddingVertical: 80, alignItems: 'center', gap: 6, paddingHorizontal: 24 },
  emptyText: { color: '#404040', fontSize: 14, fontWeight: '600' },
  emptySubtext: { color: '#a3a3a3', fontSize: 12, textAlign: 'center' },
});
