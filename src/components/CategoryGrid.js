import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getCategoryVisual } from '../utils/categoryIcons';
import { COLORS, RADIUS } from '../theme';

const COLUMNS = 4;

// Splits the flat category list into fixed-size rows of 4, so the grid
// always aligns 4-across regardless of how many categories exist (the
// last row is left-aligned instead of stretching to fill the row).
function chunk(items, size) {
  const rows = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

export default function CategoryGrid({ categories, onSelect }) {
  const rows = chunk(categories, COLUMNS);

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cat) => {
            const { Icon, color } = getCategoryVisual(cat.icon, cat._id);
            return (
              <TouchableOpacity key={cat._id} style={styles.item} onPress={() => onSelect(cat)} activeOpacity={0.7}>
                <View style={[styles.iconWrap, { backgroundColor: color + '1a' }]}>
                  <Icon size={22} color={color} strokeWidth={2} />
                </View>
                <Text style={styles.label} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Pad the last row with invisible spacers so items stay left-aligned in a 4-column grid */}
          {row.length < COLUMNS &&
            Array.from({ length: COLUMNS - row.length }).map((_, i) => <View key={`spacer-${i}`} style={styles.item} />)}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    width: '22%',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});