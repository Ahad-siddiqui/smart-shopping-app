import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X } from 'lucide-react-native';
import categoryService from '../services/categoryService';
import productService from '../services/productService';
import { CONDITION_OPTIONS, MAX_IMAGE_UPLOAD_COUNT } from '../utils/constants';

export default function EditAdScreen({ route, navigation }) {
  const { product } = route.params;

  const [categories, setCategories] = useState([]);
  const [existingImages, setExistingImages] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [location, setLocation] = useState(product.location);
  const [category, setCategory] = useState(product.category);
  const [condition, setCondition] = useState(product.condition || 'used');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    categoryService
      .getAll()
      .then((data) => setCategories(data.items || []))
      .catch(() => setCategories([]));
  }, []);

  const totalImageCount = existingImages.length + newImages.length;

  const pickImages = async () => {
    if (totalImageCount >= MAX_IMAGE_UPLOAD_COUNT) {
      Alert.alert('Limit reached', `You can have up to ${MAX_IMAGE_UPLOAD_COUNT} photos.`);
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: MAX_IMAGE_UPLOAD_COUNT - totalImageCount,
    });
    if (!result.canceled) setNewImages((prev) => [...prev, ...result.assets]);
  };

  const removeExisting = (index) => setExistingImages((prev) => prev.filter((_, i) => i !== index));
  const removeNew = (index) => setNewImages((prev) => prev.filter((_, i) => i !== index));

  const onSubmit = async () => {
    if (existingImages.length + newImages.length === 0) {
      Alert.alert('Photo required', 'Please keep at least one photo.');
      return;
    }
    if (!title.trim() || !description.trim() || !price || !category || !location.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('price', price);
      formData.append('category', category._id || category);
      formData.append('condition', condition);
      formData.append('location', location.trim());
      formData.append('existingImages', JSON.stringify(existingImages.map((img) => img.url)));
      newImages.forEach((asset, index) =>
        formData.append('images', { uri: asset.uri, name: asset.fileName || `photo_${index}.jpg`, type: asset.mimeType || 'image/jpeg' })
      );

      await productService.update(product._id, formData);
      Alert.alert('Ad updated', 'Your changes have been saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Failed to update ad', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const categoryId = typeof category === 'string' ? category : category?._id;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Edit Ad</Text>

      <Text style={styles.label}>Photos</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={styles.imagesRow}>
          {existingImages.map((img, index) => (
            <View key={`existing-${index}`} style={styles.imageThumbWrap}>
              <Image source={{ uri: img.url }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeExisting(index)}>
                <X size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {newImages.map((img, index) => (
            <View key={`new-${index}`} style={styles.imageThumbWrap}>
              <Image source={{ uri: img.uri }} style={styles.imageThumb} />
              <TouchableOpacity style={styles.removeButton} onPress={() => removeNew(index)}>
                <X size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {totalImageCount < MAX_IMAGE_UPLOAD_COUNT && (
            <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
              <Camera size={22} color="#0f766e" />
              <Text style={styles.addImageText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <Field label="Title" value={title} onChangeText={setTitle} />
      <Field label="Description" value={description} onChangeText={setDescription} multiline />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
        <View style={styles.chipsRow}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat._id}
              style={[styles.chip, categoryId === cat._id && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, categoryId === cat._id && styles.chipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Field label="Price (Rs.)" value={price} onChangeText={setPrice} keyboardType="numeric" />

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

      <Field label="Location" value={location} onChangeText={setLocation} />

      <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Saving...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.textarea]} multiline={multiline} numberOfLines={multiline ? 5 : 1} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', color: '#171717', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#404040', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14 },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  imagesRow: { flexDirection: 'row', gap: 10 },
  imageThumbWrap: { position: 'relative' },
  imageThumb: { width: 80, height: 80, borderRadius: 10 },
  removeButton: { position: 'absolute', top: -6, right: -6, backgroundColor: '#171717', borderRadius: 999, padding: 4 },
  addImageButton: { width: 80, height: 80, borderRadius: 10, borderWidth: 1, borderColor: '#0f766e', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageText: { fontSize: 11, color: '#0f766e', fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#e5e5e5' },
  chipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  chipText: { fontSize: 12, color: '#404040' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  submitButton: { backgroundColor: '#0f766e', borderRadius: 12, paddingVertical: 15, alignItems: 'center', marginTop: 8 },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
