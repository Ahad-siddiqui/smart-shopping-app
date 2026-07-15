import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import productService from '../services/productService';
import { CURRENCY_SYMBOL, PRODUCT_STATUS_LABELS } from '../utils/constants';

const STATUS_COLORS = {
  pending_payment: '#f59e0b',
  pending: '#3b82f6',
  approved: '#16a34a',
  rejected: '#dc2626',
  sold: '#525252',
};

export default function MyAdsScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    productService
      .getMyAds()
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleMarkSold = (product) => {
    Alert.alert('Mark as sold?', `"${product.title}" will be marked as sold.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark Sold',
        onPress: async () => {
          try {
            await productService.markAsSold(product._id);
            load();
          } catch (err) {
            Alert.alert('Failed', err.message);
          }
        },
      },
    ]);
  };

  const handleDelete = (product) => {
    Alert.alert('Delete ad?', `"${product.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await productService.remove(product._id);
            load();
          } catch (err) {
            Alert.alert('Failed', err.message);
          }
        },
      },
    ]);
  };

  const handleCompletePayment = (product) => {
    navigation.navigate('Payment', { product });
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
          <Text style={styles.emptyText}>You haven't posted any ads yet.</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'PostAd' })}>
            <Text style={styles.emptyLink}>Post an Ad →</Text>
          </TouchableOpacity>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.cardBody}
            onPress={() => navigation.navigate('ProductDetails', { id: item._id })}
          >
            <Image source={{ uri: item.images?.[0]?.url }} style={styles.thumb} />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.price}>
                {CURRENCY_SYMBOL}
                {Number(item.price).toLocaleString()}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[item.status] + '22' }]}>
                <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                  {PRODUCT_STATUS_LABELS[item.status] || item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.actionsRow}>
            {item.status === 'pending_payment' && (
              <TouchableOpacity style={styles.actionButton} onPress={() => handleCompletePayment(item)}>
                <Text style={styles.actionText}>Complete Payment</Text>
              </TouchableOpacity>
            )}
            {item.status === 'approved' && (
              <TouchableOpacity style={styles.actionButton} onPress={() => handleMarkSold(item)}>
                <Text style={styles.actionText}>Mark Sold</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('EditAd', { product: item })}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item)}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#f0f0f0', marginBottom: 12, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', gap: 12, padding: 12 },
  thumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#e5e5e5' },
  title: { fontSize: 14, fontWeight: '600', color: '#171717' },
  price: { fontSize: 14, fontWeight: '700', color: '#0f766e' },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusText: { fontSize: 10, fontWeight: '700' },
  actionsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  actionButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#f5f5f5' },
  actionText: { fontSize: 12, fontWeight: '600', color: '#0f766e' },
  deleteButton: { borderRightWidth: 0 },
  deleteText: { color: '#dc2626' },
  empty: { paddingVertical: 80, alignItems: 'center', gap: 8 },
  emptyText: { color: '#737373', fontSize: 13 },
  emptyLink: { color: '#0f766e', fontWeight: '700', fontSize: 13 },
});
