import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import { CURRENCY_SYMBOL } from '../utils/constants';
import { COLORS, RADIUS, SHADOW } from '../theme';

const CARD_WIDTH = '48.5%';

export default function ProductCard({ product, isFavourite, onToggleFavourite, onPress }) {
  const image = product.images?.[0]?.url;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imageWrap}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        {onToggleFavourite && (
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => onToggleFavourite(product._id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Heart size={15} color={isFavourite ? COLORS.danger : '#404040'} fill={isFavourite ? COLORS.danger : 'none'} />
          </TouchableOpacity>
        )}
        {product.condition && (
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{product.condition}</Text>
          </View>
        )}
        {product.status === 'sold' && (
          <View style={styles.soldOverlay}>
            <Text style={styles.soldText}>SOLD</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.price} numberOfLines={1}>
          {CURRENCY_SYMBOL}
          {Number(product.price).toLocaleString()}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <View style={styles.locationRow}>
          <MapPin size={11} color={COLORS.textFaint} />
          <Text style={styles.location} numberOfLines={1}>
            {product.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: 12,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#e5e5e5',
  },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: RADIUS.pill,
    padding: 6,
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(23,23,23,0.75)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  conditionText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  soldOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(23,23,23,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soldText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  body: {
    padding: 10,
    gap: 3,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  title: {
    fontSize: 12.5,
    color: '#404040',
    lineHeight: 17,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  location: {
    fontSize: 10.5,
    color: COLORS.textFaint,
  },
});
