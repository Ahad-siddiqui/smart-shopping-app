import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, ChevronRight, ChevronLeft } from 'lucide-react-native';
import categoryService from '../services/categoryService';
import productService, { buildProductFormData } from '../services/productService';
import { CONDITION_OPTIONS, MAX_IMAGE_UPLOAD_COUNT } from '../utils/constants';
import { getCategoryVisual } from '../utils/categoryIcons';
import { COLORS, RADIUS, SHADOW } from '../theme';

export default function PostAdScreen({ navigation }) {
  const [allCategories, setAllCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Wizard state: 'category' step drills down through the category tree,
  // 'details' step shows the rest of the ad form once a leaf category
  // (one with no subcategories) has been picked.
  const [step, setStep] = useState('category');
  const [categoryPath, setCategoryPath] = useState([]); // breadcrumb of selected categories

  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('used');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService
      .getAll()
      .then((data) => setAllCategories(data.items || []))
      .catch(() => setAllCategories([]))
      .finally(() => setCategoriesLoading(false));
  }, []);

  const selectedCategory = categoryPath[categoryPath.length - 1] || null;

  const currentLevelCategories = useMemo(() => {
    const parentId = selectedCategory?._id || null;
    return allCategories.filter((c) => (c.parent || null) === parentId);
  }, [allCategories, selectedCategory]);

  const handleSelectCategory = (category) => {
    const children = allCategories.filter((c) => (c.parent || null) === category._id);
    const nextPath = [...categoryPath, category];
    setCategoryPath(nextPath);
    if (children.length === 0) {
      // Leaf category reached - move on to the rest of the ad details.
      setStep('details');
    }
    // Otherwise stay on the category step; currentLevelCategories will
    // recompute to show this category's children next.
  };

  const handleBackOneLevel = () => {
    setCategoryPath((prev) => prev.slice(0, -1));
  };

  const handleChangeCategory = () => {
    setStep('category');
  };

  const totalImageCount = images.length;

  const pickImages = async () => {
    if (totalImageCount >= MAX_IMAGE_UPLOAD_COUNT) {
      Alert.alert('Limit reached', `You can add up to ${MAX_IMAGE_UPLOAD_COUNT} photos.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to add images.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: MAX_IMAGE_UPLOAD_COUNT - totalImageCount,
    });
    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets].slice(0, MAX_IMAGE_UPLOAD_COUNT));
    }
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    setStep('category');
    setCategoryPath([]);
    setImages([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setLocation('');
    setCondition('used');
  };

  const onSubmit = async () => {
    if (images.length === 0) {
      Alert.alert('Photo required', 'Please add at least one photo.');
      return;
    }
    if (!title.trim() || !description.trim() || !price || !location.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = buildProductFormData(
        {
          title: title.trim(),
          description: description.trim(),
          price,
          category: selectedCategory._id,
          condition,
          location: location.trim(),
        },
        images
      );
      const created = await productService.create(formData);
      Alert.alert('Ad submitted', 'Now complete the posting fee payment to publish your ad.');
      resetForm();
      navigation.replace('Payment', { product: created });
    } catch (err) {
      Alert.alert('Failed to post ad', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- STEP 1: Category picker (drills down through subcategories) ---
  if (step === 'category') {
    return (
      <View style={styles.flex}>
        <View style={styles.categoryHeader}>
          {categoryPath.length > 0 ? (
            <TouchableOpacity style={styles.backRow} onPress={handleBackOneLevel}>
              <ChevronLeft size={18} color={COLORS.brand} />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.heading}>Choose a Category</Text>
          )}
          {categoryPath.length > 0 && (
            <Text style={styles.breadcrumb} numberOfLines={1}>
              {categoryPath.map((c) => c.name).join(' > ')}
            </Text>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.categoryList}>
          {categoriesLoading && <Text style={styles.helperText}>Loading categories...</Text>}
          {!categoriesLoading && currentLevelCategories.length === 0 && (
            <Text style={styles.helperText}>No categories available.</Text>
          )}
          {currentLevelCategories.map((cat) => {
            const { Icon, color } = getCategoryVisual(cat.icon, cat._id);
            const hasChildren = allCategories.some((c) => c.parent === cat._id);
            return (
              <TouchableOpacity key={cat._id} style={styles.categoryRow} onPress={() => handleSelectCategory(cat)}>
                <View style={[styles.categoryIconWrap, { backgroundColor: color + '1a' }]}>
                  <Icon size={20} color={color} />
                </View>
                <Text style={styles.categoryName}>{cat.name}</Text>
                {hasChildren && <ChevronRight size={18} color="#a3a3a3" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // --- STEP 2: Ad details form (title, photos, price, location, condition) ---
  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Post a New Ad</Text>

      <TouchableOpacity style={styles.selectedCategoryBox} onPress={handleChangeCategory}>
        <View style={{ flex: 1 }}>
          <Text style={styles.selectedCategoryLabel}>Category</Text>
          <Text style={styles.selectedCategoryValue}>{categoryPath.map((c) => c.name).join(' > ')}</Text>
        </View>
        <Text style={styles.changeLink}>Change</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={styles.imagesRow}>
          {images.map((img, index) => (
            <View key={index} style={styles.imageThumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
                <X size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {images.length < MAX_IMAGE_UPLOAD_COUNT && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <Camera size={22} color={COLORS.brand} />
              <Text style={styles.addImageText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Field label="Title" value={title} onChangeText={setTitle} placeholder="e.g. iPhone 13 Pro Max - 256GB" />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Describe your item in detail..."
        multiline
      />

      <Field label="Price (Rs.)" value={price} onChangeText={setPrice} placeholder="0.00" keyboardType="numeric" />

      <Text style={styles.label}>Condition</Text>
      <View style={[styles.chipsRow, { marginBottom: 16 }]}>
        {CONDITION_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, condition === opt.value && styles.chipActive]}
            onPress={() => setCondition(opt.value)}
          >
            <Text style={[styles.chipText, condition === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Lahore, Punjab" />

      <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Continue to Payment'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea]}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        placeholderTextColor="#a3a3a3"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.surface },
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 20, fontWeight: '700', color: COLORS.text },

  categoryHeader: { padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 4 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  backText: { fontSize: 15, fontWeight: '700', color: COLORS.brand },
  breadcrumb: { fontSize: 12, color: '#a3a3a3' },
  categoryList: { padding: 16, paddingTop: 12 },
  helperText: { color: '#a3a3a3', fontSize: 13, textAlign: 'center', marginTop: 24 },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 10,
    ...SHADOW.card,
  },
  categoryIconWrap: { width: 42, height: 42, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  categoryName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },

  selectedCategoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: RADIUS.md,
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  selectedCategoryLabel: { fontSize: 11, color: COLORS.brand, fontWeight: '600' },
  selectedCategoryValue: { fontSize: 13.5, color: COLORS.text, fontWeight: '700', marginTop: 2 },
  changeLink: { fontSize: 12, fontWeight: '700', color: COLORS.brand },

  label: { fontSize: 13, fontWeight: '600', color: '#404040', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  imagesRow: { flexDirection: 'row', gap: 10 },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 10 },
  removeButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#171717',
    borderRadius: 999,
    padding: 4,
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.brand,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: { fontSize: 11, color: COLORS.brand, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  chipActive: { backgroundColor: COLORS.brand, borderColor: COLORS.brand },
  chipText: { fontSize: 12, color: '#404040' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  submitButton: {
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOW.raised,
  },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});