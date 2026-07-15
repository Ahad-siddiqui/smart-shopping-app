import { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, RefreshControl, Alert, StatusBar } from 'react-native';
import { Search, ChevronRight, MapPin, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import favouriteService from '../services/favouriteService';
import useAuth from '../hooks/useAuth';
import { COLORS, RADIUS, SHADOW } from '../theme';

const ROW_SIZE = 4;

export default function HomeScreen({ navigation }) {
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [categories, setCategories] = useState({ data: [], status: 'loading', error: null });
  const [featured, setFeatured] = useState({ data: [], status: 'loading', error: null });
  const [categoryRows, setCategoryRows] = useState({ data: [], status: 'loading', error: null });
  const [favouriteIds, setFavouriteIds] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadCategories = useCallback(() => {
    setCategories((prev) => ({ ...prev, status: 'loading', error: null }));
    categoryService
      .getAll()
      .then((data) => {
        const all = data.items || [];
        setCategories({ data: all.filter((c) => !c.parent), status: 'succeeded', error: null });
      })
      .catch((err) => setCategories({ data: [], status: 'failed', error: err.message }));
  }, []);

  const loadFeatured = useCallback(() => {
    setFeatured((prev) => ({ ...prev, status: 'loading', error: null }));
    productService
      .getFeatured()
      .then((data) => setFeatured({ data: (data.items || []).slice(0, ROW_SIZE), status: 'succeeded', error: null }))
      .catch((err) => setFeatured({ data: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    loadCategories();
    loadFeatured();
  }, [loadCategories, loadFeatured]);

  useEffect(() => {
    if (categories.status !== 'succeeded') return;
    if (categories.data.length === 0) {
      setCategoryRows({ data: [], status: 'succeeded', error: null });
      return;
    }
    setCategoryRows((prev) => ({ ...prev, status: 'loading', error: null }));
    Promise.all(
      categories.data.map((category) =>
        productService
          .getByCategory(category.slug, { limit: ROW_SIZE, sort: 'newest' })
          .then((data) => ({ category, products: data.items || [] }))
          .catch(() => ({ category, products: [] }))
      )
    )
      .then((rows) => setCategoryRows({ data: rows, status: 'succeeded', error: null }))
      .catch((err) => setCategoryRows({ data: [], status: 'failed', error: err.message }));
  }, [categories.status, categories.data]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavouriteIds([]);
      return;
    }
    favouriteService
      .getAll({ limit: 100 })
      .then((data) => setFavouriteIds((data.items || []).map((f) => f.product?._id || f.product)))
      .catch(() => {});
  }, [isAuthenticated]);

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

  const onRefresh = () => {
    setRefreshing(true);
    loadCategories();
    loadFeatured();
    setTimeout(() => setRefreshing(false), 600);
  };

  const goToSearch = () => {
    if (!searchText.trim()) return;
    navigation.navigate('SearchResults', { query: searchText.trim() });
  };

  const goToProduct = (product) => navigation.navigate('ProductDetails', { id: product._id });
  const goToCategory = (category) => navigation.navigate('CategoryProducts', { slug: category.slug, name: category.name });

  return (
    <View style={styles.flex}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.brandDarker} />
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.brandName}>Smart Shopping</Text>
            {user?.location ? (
              <View style={styles.locationRow}>
                <MapPin size={12} color="#a7f3ec" />
                <Text style={styles.locationText}>{user.location}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.searchBar}>
          <Search size={18} color={COLORS.textFaint} />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search for anything..."
            placeholderTextColor={COLORS.textFaint}
            onSubmitEditing={goToSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.brand} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          {categories.status === 'loading' && <Loader />}
          {categories.status === 'failed' && <ErrorMessage message={categories.error} onRetry={loadCategories} />}
          {categories.status === 'succeeded' && <CategoryGrid categories={categories.data} onSelect={goToCategory} />}
        </View>

        {featured.status === 'succeeded' && featured.data.length > 0 && (
          <ProductRow
            title="Featured Ads"
            icon={Sparkles}
            products={featured.data}
            onProductPress={goToProduct}
            favouriteIds={favouriteIds}
            onToggleFavourite={handleToggleFavourite}
          />
        )}
        {featured.status === 'loading' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Ads</Text>
            <Loader />
          </View>
        )}

        {categoryRows.status === 'loading' && <Loader />}
        {categoryRows.status === 'failed' && <ErrorMessage message={categoryRows.error} onRetry={loadCategories} />}
        {categoryRows.status === 'succeeded' &&
          categoryRows.data.map(({ category, products }) =>
            products.length > 0 ? (
              <ProductRow
                key={category._id}
                title={category.name}
                products={products}
                onProductPress={goToProduct}
                onViewMore={() => goToCategory(category)}
                favouriteIds={favouriteIds}
                onToggleFavourite={handleToggleFavourite}
              />
            ) : null
          )}

        {categoryRows.status === 'succeeded' && categoryRows.data.every((row) => row.products.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No ads yet — be the first to post one!</Text>
            <TouchableOpacity onPress={() => navigation.navigate('PostAd')}>
              <Text style={styles.emptyLink}>Post an Ad →</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ProductRow({ title, icon: SectionIcon, products, onProductPress, onViewMore, favouriteIds = [], onToggleFavourite }) {
  return (
    <View style={styles.section}>
      <View style={styles.rowHeader}>
        <View style={styles.rowHeaderLeft}>
          {SectionIcon && <SectionIcon size={16} color={COLORS.accent} />}
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        {onViewMore && (
          <TouchableOpacity onPress={onViewMore} style={styles.viewMore}>
            <Text style={styles.viewMoreText}>View More</Text>
            <ChevronRight size={14} color={COLORS.brand} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.grid}>
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onPress={() => onProductPress(product)}
            isFavourite={favouriteIds.includes(product._id)}
            onToggleFavourite={onToggleFavourite}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    backgroundColor: COLORS.brandDarker,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTopRow: { marginBottom: 12 },
  brandName: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { fontSize: 11, color: '#a7f3ec' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
    ...SHADOW.card,
  },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, padding: 0 },
  container: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    marginBottom: 14,
    ...SHADOW.card,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  rowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  rowHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  viewMore: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewMoreText: { fontSize: 12, fontWeight: '600', color: COLORS.brand },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  emptyState: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 13 },
  emptyLink: { color: COLORS.brand, fontWeight: '700', fontSize: 13 },
});
