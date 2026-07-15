import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ProductCard from '../components/ProductCard';
import favouriteService from '../services/favouriteService';

export default function FavouritesScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    favouriteService
      .getAll({ limit: 100 })
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleRemove = async (favourite) => {
    const productId = favourite.product?._id || favourite.product;
    try {
      await favouriteService.remove(productId);
      setState((prev) => ({ ...prev, items: prev.items.filter((f) => (f.product?._id || f.product) !== productId) }));
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
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <ProductCard
          product={item.product}
          isFavourite
          onToggleFavourite={() => handleRemove(item)}
          onPress={() => navigation.navigate('ProductDetails', { id: item.product._id })}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No saved favourites yet.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#737373', fontSize: 14 },
});
