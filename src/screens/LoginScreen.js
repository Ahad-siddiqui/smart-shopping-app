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
import { loginUser, clearAuthError } from '../store/slices/authSlice';
import { COLORS, RADIUS, SHADOW } from '../theme';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isLoading = status === 'loading';

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing info', 'Please enter both email and password.');
      return;
    }
    dispatch(clearAuthError());
    const result = await dispatch(loginUser({ email: email.trim(), password }));
    if (loginUser.rejected.match(result)) {
      Alert.alert('Login failed', result.payload || 'Please check your credentials.');
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
          <ShoppingBag size={30} color="#fff" strokeWidth={2} />
        </View>
        <Text style={styles.brand}>Smart Shopping</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to buy, sell, and chat with sellers.</Text>

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
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textFaint}
            secureTextEntry
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={isLoading} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
          <Text style={styles.linkText}>
            Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
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
    paddingTop: 56,
    paddingBottom: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  closeButton: { position: 'absolute', top: 52, right: 20, zIndex: 1 },
  logoWrap: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  brand: { fontSize: 17, fontWeight: '800', color: '#fff' },
  container: { flexGrow: 1, padding: 24, paddingTop: 32 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 6 },
  subtitle: { fontSize: 13.5, color: COLORS.textMuted, marginBottom: 24 },
  field: { marginBottom: 16 },
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
  linkWrap: { marginTop: 22, alignItems: 'center' },
  linkText: { fontSize: 13.5, color: '#525252' },
  linkBold: { color: COLORS.brand, fontWeight: '700' },
});
