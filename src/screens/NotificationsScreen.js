import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bell, CheckCheck, Trash2 } from 'lucide-react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import notificationService from '../services/notificationService';
import { formatTimeAgo } from '../utils/formatDate';

export default function NotificationsScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    notificationService
      .getAll()
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handlePress = async (item) => {
    if (!item.isRead) {
      notificationService.markAsRead(item._id).catch(() => {});
      setState((prev) => ({ ...prev, items: prev.items.map((n) => (n._id === item._id ? { ...n, isRead: true } : n)) }));
    }
    if (item.link?.includes('/products/')) {
      const id = item.link.split('/products/')[1]?.split(/[/?]/)[0];
      if (id) navigation.navigate('ProductDetails', { id });
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setState((prev) => ({ ...prev, items: prev.items.map((n) => ({ ...n, isRead: true })) }));
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  const handleDelete = async (item) => {
    try {
      await notificationService.remove(item._id);
      setState((prev) => ({ ...prev, items: prev.items.filter((n) => n._id !== item._id) }));
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  if (state.status === 'loading') return <Loader />;
  if (state.status === 'failed') return <ErrorMessage message={state.error} onRetry={load} />;

  return (
    <FlatList
      data={state.items}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      ListHeaderComponent={
        state.items.length > 0 ? (
          <TouchableOpacity style={styles.markAllButton} onPress={handleMarkAllRead}>
            <CheckCheck size={14} color="#0f766e" />
            <Text style={styles.markAllText}>Mark all as read</Text>
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Bell size={28} color="#d4d4d4" />
          <Text style={styles.emptyText}>No notifications yet.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={[styles.row, !item.isRead && styles.rowUnread]} onPress={() => handlePress(item)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            {item.message ? (
              <Text style={styles.message} numberOfLines={2}>
                {item.message}
              </Text>
            ) : null}
            <Text style={styles.time}>{formatTimeAgo(item.createdAt)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Trash2 size={16} color="#a3a3a3" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  markAllButton: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginBottom: 10 },
  markAllText: { fontSize: 12, fontWeight: '600', color: '#0f766e' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  rowUnread: { backgroundColor: '#f0fdfa', borderColor: '#ccfbf1' },
  title: { fontSize: 13, fontWeight: '700', color: '#171717' },
  message: { fontSize: 12, color: '#525252', marginTop: 2 },
  time: { fontSize: 10, color: '#a3a3a3', marginTop: 4 },
  empty: { paddingVertical: 80, alignItems: 'center', gap: 8 },
  emptyText: { color: '#a3a3a3', fontSize: 13 },
});
