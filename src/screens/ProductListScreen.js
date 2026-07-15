import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { BookmarkPlus } from 'lucide-react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import ProductCard from '../components/ProductCard';
import productService from '../services/productService';
import favouriteService from '../services/favouriteService';
import savedSearchService from '../services/savedSearchService';
import useAuth from '../hooks/useAuth';

// Handles both:
//  - CategoryProducts: route.params = { slug, name }
//  - SearchResults:    route.params = { query }
export default function ProductListScreen({ route, navigation }) {
  const { slug, name, query } = route.params || {};
  const isCategoryMode = Boolean(slug);
  const { isAuthenticated } = useAuth();

  const [state, setState] = useState({ items: [], status: 'loading', error: null });
  const [favouriteIds, setFavouriteIds] = useState([]);

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    const request = isCategoryMode
      ? productService.getByCategory(slug, { sort: 'newest' })
      : productService.search({ q: query });

    request
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, [slug, query, isCategoryMode]);

  useEffect(() => {
    navigation.setOptions({ title: isCategoryMode ? name || 'Category' : `"${query}"` });
    load();
  }, [load, navigation, isCategoryMode, name, query]);

  useEffect(() => {
    if (!isAuthenticated) return;
    favouriteService
      .getAll({ limit: 100 })
      .then((data) => setFavouriteIds((data.items || []).map((f) => f.product?._id || f.product)))
      .catch(() => {});
  }, [isAuthenticated]);

  const goToProduct = (product) => navigation.navigate('ProductDetails', { id: product._id });

  const handleToggleFavourite = async (productId) => {
    if (!isAuthenticated) {
      Alert.alert('Please log in', 'Log in to save favourites.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    try {
      if (favouriteIds.includes(productId)) {
        await favouriteService.remove(productId);
        setFavouriteIds((prev) => prev.filter((id) => id !== productId));
      } else {
        await favouriteService.add(productId);
        setFavouriteIds((prev) => [...prev, productId]);
      }
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  const handleSaveSearch = async () => {
    if (!isAuthenticated) {
      Alert.alert('Please log in', 'Log in to save searches.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    try {
      await savedSearchService.create({
        name: isCategoryMode ? name : query,
        keyword: isCategoryMode ? '' : query,
        filters: isCategoryMode ? { category: slug } : {},
      });
      Alert.alert('Saved', 'This search has been saved.');
    } catch (err) {
      Alert.alert('Failed to save search', err.message);
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
      ListHeaderComponent={
        !isCategoryMode && query ? (
          <TouchableOpacity style={styles.saveSearchButton} onPress={handleSaveSearch}>
            <BookmarkPlus size={16} color="#0f766e" />
            <Text style={styles.saveSearchText}>Save this search</Text>
          </TouchableOpacity>
        ) : null
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() => goToProduct(item)}
          isFavourite={favouriteIds.includes(item._id)}
          onToggleFavourite={handleToggleFavourite}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No ads found.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  saveSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12,
  },
  saveSearchText: { fontSize: 12, fontWeight: '600', color: '#0f766e' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: '#737373', fontSize: 14 },
});
