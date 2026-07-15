import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send } from 'lucide-react-native';
import chatService from '../services/chatService';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

const POLL_INTERVAL_MS = 4000;

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUser, product } = route.params;
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('loading');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: otherUser?.name || 'Chat' });
  }, [navigation, otherUser]);

  const loadMessages = useCallback((silent = false) => {
    if (!silent) setStatus('loading');
    chatService
      .getMessages(conversationId)
      .then((data) => {
        setMessages((data.items || []).slice().reverse());
        setStatus('succeeded');
      })
      .catch(() => setStatus((prev) => (prev === 'loading' ? 'failed' : prev)));
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
    chatService.markAsRead(conversationId).catch(() => {});

    pollRef.current = setInterval(() => loadMessages(true), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [loadMessages, conversationId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    setText('');
    try {
      const sent = await chatService.sendMessage(conversationId, { text: trimmed });
      setMessages((prev) => [sent, ...prev]);
    } catch (err) {
      setText(trimmed);
    } finally {
      setSending(false);
    }
  };

  if (status === 'loading') return <Loader />;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      {product?.title && (
        <View style={styles.productBanner}>
          <Text style={styles.productBannerText} numberOfLines={1}>
            Re: {product.title}
          </Text>
        </View>
      )}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item._id}
        inverted
        contentContainerStyle={styles.messagesList}
        renderItem={({ item }) => {
          const isMine = item.sender === user?._id || item.sender?._id === user?._id;
          return (
            <View style={[styles.bubbleRow, isMine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
              <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <Text style={[styles.bubbleText, isMine && styles.bubbleTextMine]}>{item.text}</Text>
              </View>
            </View>
          );
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={sending || !text.trim()}>
          <Send size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fafafa' },
  productBanner: { backgroundColor: '#f0fdfa', paddingHorizontal: 14, paddingVertical: 8 },
  productBannerText: { fontSize: 12, color: '#0f766e', fontWeight: '600' },
  messagesList: { padding: 14, gap: 8 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '78%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMine: { backgroundColor: '#0f766e', borderBottomRightRadius: 4 },
  bubbleTheirs: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: '#171717' },
  bubbleTextMine: { color: '#fff' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: { backgroundColor: '#0f766e', borderRadius: 999, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
