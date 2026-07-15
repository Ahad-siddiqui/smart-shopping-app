import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Loader() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color="#0f766e" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
