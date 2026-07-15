import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import adminService from '../../services/adminService';
import { CURRENCY_SYMBOL } from '../../utils/constants';

export default function AdminPaymentsScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    adminService
      .getPayments()
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleVerify = async (item) => {
    try {
      await adminService.verifyPayment(item._id);
      setState((prev) => ({ ...prev, items: prev.items.filter((p) => p._id !== item._id) }));
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  const submitReject = async (item) => {
    if (!rejectReason.trim()) {
      Alert.alert('Reason required', 'Please enter a rejection reason.');
      return;
    }
    try {
      await adminService.rejectPayment(item._id, rejectReason.trim());
      setState((prev) => ({ ...prev, items: prev.items.filter((p) => p._id !== item._id) }));
      setRejectingId(null);
      setRejectReason('');
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
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No pending payments.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.cardBody}>
            {item.screenshot?.url ? (
              <Image source={{ uri: item.screenshot.url }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{item.product?.title}</Text>
              <Text style={styles.amount}>{CURRENCY_SYMBOL}{item.amount}</Text>
              <Text style={styles.meta}>{item.method} • TXN: {item.transactionId}</Text>
              <Text style={styles.meta}>By {item.user?.name}</Text>
            </View>
          </View>

          {rejectingId === item._id ? (
            <View style={styles.rejectBox}>
              <TextInput
                style={styles.rejectInput}
                value={rejectReason}
                onChangeText={setRejectReason}
                placeholder="Reason for rejection..."
              />
              <View style={styles.rejectActions}>
                <TouchableOpacity style={styles.smallButton} onPress={() => submitReject(item)}>
                  <Text style={styles.smallButtonText}>Confirm Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.smallButtonGhost} onPress={() => setRejectingId(null)}>
                  <Text style={styles.smallButtonGhostText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.approveButton} onPress={() => handleVerify(item)}>
                <Text style={styles.approveText}>Verify</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={() => setRejectingId(item._id)}>
                <Text style={styles.rejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 12, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', gap: 12, padding: 12 },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#e5e5e5' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '600', color: '#171717' },
  amount: { fontSize: 13, fontWeight: '700', color: '#0f766e', marginTop: 2 },
  meta: { fontSize: 11, color: '#a3a3a3', marginTop: 1 },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  approveButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#f5f5f5' },
  approveText: { fontSize: 12, fontWeight: '700', color: '#16a34a' },
  rejectButton: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  rejectText: { fontSize: 12, fontWeight: '700', color: '#dc2626' },
  rejectBox: { padding: 12, borderTopWidth: 1, borderTopColor: '#f5f5f5', gap: 8 },
  rejectInput: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13 },
  rejectActions: { flexDirection: 'row', gap: 8 },
  smallButton: { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  smallButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  smallButtonGhost: { flex: 1, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  smallButtonGhostText: { color: '#525252', fontSize: 12, fontWeight: '600' },
  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyText: { color: '#737373', fontSize: 13 },
});
