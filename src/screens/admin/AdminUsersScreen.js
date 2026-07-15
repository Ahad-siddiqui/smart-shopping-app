import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import adminService from '../../services/adminService';

export default function AdminUsersScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    adminService
      .getUsers()
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleToggleBan = async (user) => {
    try {
      const updated = await adminService.toggleBanUser(user._id);
      setState((prev) => ({
        ...prev,
        items: prev.items.map((u) => (u._id === user._id ? { ...u, isBanned: updated.isBanned ?? !u.isBanned } : u)),
      }));
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  const handleDelete = (user) => {
    Alert.alert('Delete user?', `"${user.name}" and their data will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await adminService.deleteUser(user._id);
            setState((prev) => ({ ...prev, items: prev.items.filter((u) => u._id !== user._id) }));
          } catch (err) {
            Alert.alert('Failed', err.message);
          }
        },
      },
    ]);
  };

  if (state.status === 'loading') return <Loader />;
  if (state.status === 'failed') return <ErrorMessage message={state.error} onRetry={load} />;

  return (
    <FlatList
      data={state.items}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(item.name || 'U')[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.badgeRow}>
              {item.role === 'admin' && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>Admin</Text>
                </View>
              )}
              {item.isBanned && (
                <View style={styles.bannedBadge}>
                  <Text style={styles.bannedBadgeText}>Banned</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleToggleBan(item)}>
              <Text style={[styles.actionText, item.isBanned && styles.unbanText]}>{item.isBanned ? 'Unban' : 'Ban'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item)}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: '#0f766e', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700' },
  name: { fontSize: 13, fontWeight: '700', color: '#171717' },
  email: { fontSize: 11, color: '#737373' },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  adminBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  adminBadgeText: { fontSize: 9, fontWeight: '700', color: '#4338ca' },
  bannedBadge: { backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  bannedBadgeText: { fontSize: 9, fontWeight: '700', color: '#dc2626' },
  actions: { gap: 6, alignItems: 'flex-end' },
  actionButton: { paddingVertical: 4 },
  actionText: { fontSize: 11, fontWeight: '700', color: '#d97706' },
  unbanText: { color: '#16a34a' },
  deleteText: { color: '#dc2626' },
});
