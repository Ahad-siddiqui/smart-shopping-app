import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';
import adminService from '../../services/adminService';

const REASON_LABELS = {
  spam: 'Spam',
  fraud: 'Fraud',
  inappropriate: 'Inappropriate',
  duplicate: 'Duplicate',
  'sold-elsewhere': 'Sold Elsewhere',
  other: 'Other',
};

export default function AdminReportsScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    adminService
      .getReports({ status: 'pending' })
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleResolve = async (report, status) => {
    try {
      await adminService.resolveReport(report._id, { status });
      setState((prev) => ({ ...prev, items: prev.items.filter((r) => r._id !== report._id) }));
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
          <Text style={styles.emptyText}>No pending reports.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity onPress={() => item.product?._id && navigation.navigate('ProductDetails', { id: item.product._id })}>
            <Text style={styles.productTitle} numberOfLines={1}>{item.product?.title || 'Deleted listing'}</Text>
          </TouchableOpacity>
          <View style={styles.reasonBadge}>
            <Text style={styles.reasonText}>{REASON_LABELS[item.reason] || item.reason}</Text>
          </View>
          {item.details ? <Text style={styles.details}>{item.details}</Text> : null}
          <Text style={styles.reportedBy}>Reported by {item.reportedBy?.name}</Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.resolveButton} onPress={() => handleResolve(item, 'resolved')}>
              <Text style={styles.resolveText}>Resolve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.dismissButton} onPress={() => handleResolve(item, 'dismissed')}>
              <Text style={styles.dismissText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', padding: 14, marginBottom: 12, gap: 6 },
  productTitle: { fontSize: 14, fontWeight: '700', color: '#171717' },
  reasonBadge: { alignSelf: 'flex-start', backgroundColor: '#fef2f2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  reasonText: { fontSize: 10, fontWeight: '700', color: '#dc2626' },
  details: { fontSize: 12, color: '#525252' },
  reportedBy: { fontSize: 11, color: '#a3a3a3' },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  resolveButton: { flex: 1, backgroundColor: '#16a34a', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  resolveText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  dismissButton: { flex: 1, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  dismissText: { color: '#525252', fontSize: 12, fontWeight: '600' },
  empty: { paddingVertical: 80, alignItems: 'center' },
  emptyText: { color: '#737373', fontSize: 13 },
});
