import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import paymentService from '../services/paymentService';
import { PAYMENT_METHODS, CURRENCY_SYMBOL } from '../utils/constants';
import Loader from '../components/Loader';

export default function PaymentScreen({ route, navigation }) {
  const { product } = route.params;

  const [settings, setSettings] = useState(null);
  const [method, setMethod] = useState('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    paymentService
      .getSettings()
      .then(setSettings)
      .catch(() => setSettings(null))
      .finally(() => setLoadingSettings(false));
  }, []);

  const pickScreenshot = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6 });
    if (!result.canceled) setScreenshot(result.assets[0]);
  };

  const onSubmit = async () => {
    if (!transactionId.trim()) {
      Alert.alert('Missing info', 'Please enter the transaction ID from your payment.');
      return;
    }
    setSubmitting(true);
    try {
      await paymentService.submit(
        { productId: product._id, method, transactionId: transactionId.trim() },
        screenshot
      );
      Alert.alert('Payment submitted', 'Your ad will go live after an admin verifies the payment.', [
        { text: 'OK', onPress: () => navigation.navigate('MainTabs', { screen: 'Home' }) },
      ]);
    } catch (err) {
      Alert.alert('Submission failed', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSettings) return <Loader />;

  const accountDetails = settings?.methods?.[method] || settings?.[method];

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Complete Your Payment</Text>
      <Text style={styles.subheading}>One last step before your ad goes live.</Text>

      {settings?.fee != null && (
        <View style={styles.feeBox}>
          <Text style={styles.feeLabel}>Ad Posting Fee</Text>
          <Text style={styles.feeAmount}>
            {CURRENCY_SYMBOL}
            {settings.fee}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Payment Method</Text>
      <View style={styles.chipsRow}>
        {PAYMENT_METHODS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.chip, method === opt.value && styles.chipActive]}
            onPress={() => setMethod(opt.value)}
          >
            <Text style={[styles.chipText, method === opt.value && styles.chipTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {accountDetails && (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>{typeof accountDetails === 'string' ? accountDetails : JSON.stringify(accountDetails)}</Text>
        </View>
      )}

      <Text style={styles.label}>Transaction ID</Text>
      <TextInput
        style={styles.input}
        value={transactionId}
        onChangeText={setTransactionId}
        placeholder="e.g. TXN123456789"
      />

      <Text style={styles.label}>Payment Screenshot (optional)</Text>
      <TouchableOpacity style={styles.screenshotButton} onPress={pickScreenshot}>
        {screenshot ? (
          <Image source={{ uri: screenshot.uri }} style={styles.screenshotPreview} />
        ) : (
          <>
            <Camera size={22} color="#0f766e" />
            <Text style={styles.screenshotText}>Attach screenshot</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={onSubmit} disabled={submitting}>
        <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit Payment Proof'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 22, fontWeight: '700', color: '#171717' },
  subheading: { fontSize: 13, color: '#737373', marginBottom: 20 },
  feeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  feeLabel: { fontSize: 13, color: '#0f766e', fontWeight: '600' },
  feeAmount: { fontSize: 15, color: '#0f766e', fontWeight: '800' },
  label: { fontSize: 13, fontWeight: '600', color: '#404040', marginBottom: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: '#e5e5e5' },
  chipActive: { backgroundColor: '#0f766e', borderColor: '#0f766e' },
  chipText: { fontSize: 12, color: '#404040' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  detailsBox: { backgroundColor: '#fafafa', borderRadius: 10, padding: 12, marginBottom: 16 },
  detailsText: { fontSize: 12, color: '#525252' },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  screenshotButton: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f766e',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 20,
    overflow: 'hidden',
  },
  screenshotText: { fontSize: 12, color: '#0f766e', fontWeight: '600' },
  screenshotPreview: { width: '100%', height: '100%' },
  submitButton: { backgroundColor: '#0f766e', borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
