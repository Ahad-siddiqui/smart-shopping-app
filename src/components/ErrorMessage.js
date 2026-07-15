import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message || 'Something went wrong.'}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  text: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: '#0f766e',
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
