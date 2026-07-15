import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider, useDispatch } from 'react-redux';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import store from './src/store/store';
import { bootstrapAuth } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';

function Bootstrapper({ children }) {
  const dispatch = useDispatch();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    dispatch(bootstrapAuth()).finally(() => setReady(true));
  }, [dispatch]);

  if (!ready) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Bootstrapper>
          <AppNavigator />
        </Bootstrapper>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
