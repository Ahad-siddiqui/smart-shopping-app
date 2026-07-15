import { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Bookmark, Trash2 } from 'lucide-react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import savedSearchService from '../services/savedSearchService';

export default function SavedSearchScreen({ navigation }) {
  const [state, setState] = useState({ items: [], status: 'loading', error: null });

  const load = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));
    savedSearchService
      .getAll()
      .then((data) => setState({ items: data.items || [], status: 'succeeded', error: null }))
      .catch((err) => setState({ items: [], status: 'failed', error: err.message }));
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const handleDelete = async (item) => {
    try {
      await savedSearchService.remove(item._id);
      setState((prev) => ({ ...prev, items: prev.items.filter((s) => s._id !== item._id) }));
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  const handleOpen = (item) => {
    if (item.filters?.category) {
      navigation.navigate('CategoryProducts', { slug: item.filters.category, name: item.name });
    } else if (item.keyword) {
      navigation.navigate('SearchResults', { query: item.keyword });
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
          <Bookmark size={28} color="#d4d4d4" />
          <Text style={styles.emptyText}>No saved searches yet.</Text>
          <Text style={styles.emptySubtext}>Tap "Save this search" on any search results page.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => handleOpen(item)}>
          <Bookmark size={16} color="#0f766e" />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name || item.keyword || 'Saved search'}</Text>
            {item.keyword ? <Text style={styles.keyword}>"{item.keyword}"</Text> : null}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
  },
  name: { fontSize: 14, fontWeight: '600', color: '#171717' },
  keyword: { fontSize: 12, color: '#737373', marginTop: 2 },
  empty: { paddingVertical: 80, alignItems: 'center', gap: 6, paddingHorizontal: 24 },
  emptyText: { color: '#404040', fontSize: 13, fontWeight: '600' },
  emptySubtext: { color: '#a3a3a3', fontSize: 12, textAlign: 'center' },
});
