import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, X } from 'lucide-react-native';
import { registerUser, clearAuthError } from '../store/slices/authSlice';
import { COLORS, RADIUS, SHADOW } from '../theme';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = status === 'loading';

  const onSubmit = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Check your details', 'Name and email are required, and password must be at least 6 characters.');
      return;
    }
    dispatch(clearAuthError());
    const result = await dispatch(registerUser({ name: name.trim(), email: email.trim(), phone: phone.trim(), password }));
    if (registerUser.fulfilled.match(result)) {
      Alert.alert(
        'Registration successful',
        result.payload?.message || 'Please check your email to verify your account.'
      );
    } else if (registerUser.rejected.match(result)) {
      Alert.alert('Registration failed', result.payload || 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.brandDarker} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <X size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.logoWrap}>
          <ShoppingBag size={26} color="#fff" strokeWidth={2} />
        </View>
        <Text style={styles.brand}>Smart Shopping</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start buying and selling in minutes.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Ahad Siddiqui" placeholderTextColor={COLORS.textFaint} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.textFaint}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="03xx-xxxxxxx" placeholderTextColor={COLORS.textFaint} keyboardType="phone-pad" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={COLORS.textFaint}
            secureTextEntry
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={isLoading} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{isLoading ? 'Creating account...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkWrap}>
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    backgroundColor: COLORS.brandDarker,
    paddingTop: 48,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  closeButton: { position: 'absolute', top: 46, right: 20, zIndex: 1 },
  logoWrap: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brand: { fontSize: 16, fontWeight: '800', color: '#fff' },
  container: { flexGrow: 1, padding: 24, paddingTop: 28 },
  title: { fontSize: 23, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: COLORS.textMuted, marginBottom: 22 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#404040', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: '#fafafa',
  },
  error: { color: COLORS.danger, fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: COLORS.brand,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOW.raised,
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15.5 },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  linkText: { fontSize: 13.5, color: '#525252' },
  linkBold: { color: COLORS.brand, fontWeight: '700' },
});
