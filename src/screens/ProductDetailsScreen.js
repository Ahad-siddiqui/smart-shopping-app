import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { MapPin, Clock, ShieldCheck, Heart } from 'lucide-react-native';
import Loader from '../components/Loader';
import ErrorMessage from '../components/ErrorMessage';
import productService from '../services/productService';
import favouriteService from '../services/favouriteService';
import chatService from '../services/chatService';
import useAuth from '../hooks/useAuth';
import { CURRENCY_SYMBOL } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function ProductDetailsScreen({ route, navigation }) {
  const { id } = route.params;
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [isContacting, setIsContacting] = useState(false);

  const load = useCallback(() => {
    setStatus('loading');
    setError(null);
    productService
      .getById(id)
      .then((data) => {
        setProduct(data.product || data);
        setActiveImage(0);
        setStatus('succeeded');
      })
      .catch((err) => {
        setError(err.message);
        setStatus('failed');
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isAuthenticated) return;
    favouriteService
      .getAll({ limit: 100 })
      .then((data) => setIsFavourite((data.items || []).some((f) => (f.product?._id || f.product) === id)))
      .catch(() => {});
  }, [isAuthenticated, id]);

  const toggleFavourite = async () => {
    if (!isAuthenticated) {
      Alert.alert('Please log in', 'Log in to save favourites.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    try {
      if (isFavourite) {
        await favouriteService.remove(id);
        setIsFavourite(false);
      } else {
        await favouriteService.add(id);
        setIsFavourite(true);
      }
    } catch (err) {
      Alert.alert('Failed', err.message);
    }
  };

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      Alert.alert('Please log in', 'Log in to contact the seller.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log In', onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }
    if (product.owner?._id === user?._id) {
      Alert.alert('This is your own ad');
      return;
    }
    setIsContacting(true);
    try {
      const conversation = await chatService.startConversation({ recipientId: product.owner._id, productId: product._id });
      navigation.navigate('Chat', { conversationId: conversation._id || conversation.conversation?._id });
    } catch (err) {
      Alert.alert('Could not start chat', err.message);
    } finally {
      setIsContacting(false);
    }
  };

  if (status === 'loading') return <Loader />;
  if (status === 'failed') return <ErrorMessage message={error} onRetry={load} />;
  if (!product) return null;

  const images = product.images || [];

  return (
    <ScrollView style={styles.flex}>
      <View style={styles.imageWrap}>
        {images.length > 0 ? (
          <Image source={{ uri: images[activeImage]?.url }} style={styles.mainImage} resizeMode="cover" />
        ) : (
          <View style={[styles.mainImage, styles.imagePlaceholder]} />
        )}
        <TouchableOpacity style={styles.heartButton} onPress={toggleFavourite}>
          <Heart size={20} color={isFavourite ? '#ef4444' : '#404040'} fill={isFavourite ? '#ef4444' : 'none'} />
        </TouchableOpacity>
      </View>

      {images.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {images.map((img, index) => (
            <TouchableOpacity key={index} onPress={() => setActiveImage(index)}>
              <Image
                source={{ uri: img.url }}
                style={[styles.thumb, activeImage === index && styles.thumbActive]}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        <Text style={styles.price}>
          {CURRENCY_SYMBOL}
          {Number(product.price).toLocaleString()}
        </Text>
        <Text style={styles.title}>{product.title}</Text>

        <View style={styles.metaRow}>
          <MapPin size={14} color="#737373" />
          <Text style={styles.metaText}>{product.location}</Text>
          <Clock size={14} color="#737373" style={{ marginLeft: 12 }} />
          <Text style={styles.metaText}>{new Date(product.createdAt).toLocaleDateString()}</Text>
        </View>

        {product.condition && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{product.condition}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>Description</Text>
        <Text style={styles.description}>{product.description}</Text>

        {product.owner && (
          <View style={styles.sellerCard}>
            <View style={styles.sellerAvatar}>
              <Text style={styles.sellerInitial}>{(product.owner.name || 'U')[0].toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.sellerNameRow}>
                <Text style={styles.sellerName}>{product.owner.name}</Text>
                {product.owner.isVerified && <ShieldCheck size={14} color="#0f766e" />}
              </View>
              <Text style={styles.sellerMeta}>Seller</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.contactButton} onPress={handleContactSeller} disabled={isContacting}>
          <Text style={styles.contactButtonText}>{isContacting ? 'Starting chat...' : 'Contact Seller'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  imageWrap: { width, height: width, position: 'relative' },
  heartButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 999,
    padding: 10,
  },
  mainImage: { width: '100%', height: '100%' },
  imagePlaceholder: { backgroundColor: '#e5e5e5' },
  thumbRow: { marginTop: 10 },
  thumb: { width: 56, height: 56, borderRadius: 8, borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: '#0f766e' },
  content: { padding: 16 },
  price: { fontSize: 22, fontWeight: '800', color: '#171717' },
  title: { fontSize: 17, fontWeight: '600', color: '#262626', marginTop: 4, marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  metaText: { fontSize: 12, color: '#737373', marginLeft: 4 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: { color: '#0f766e', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  sectionLabel: { fontSize: 14, fontWeight: '700', color: '#171717', marginBottom: 6 },
  description: { fontSize: 14, color: '#404040', lineHeight: 20, marginBottom: 20 },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 20,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerInitial: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sellerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sellerName: { fontSize: 14, fontWeight: '700', color: '#171717' },
  sellerMeta: { fontSize: 12, color: '#737373' },
  contactButton: {
    backgroundColor: '#0f766e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
