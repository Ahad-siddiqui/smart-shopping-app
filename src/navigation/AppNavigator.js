import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { Home, PlusCircle, User, MessageCircle, Bell } from 'lucide-react-native';
import { useSelector } from 'react-redux';

import HomeScreen from '../screens/HomeScreen';
import PostAdScreen from '../screens/PostAdScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import ProductListScreen from '../screens/ProductListScreen';
import PaymentScreen from '../screens/PaymentScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import FavouritesScreen from '../screens/FavouritesScreen';
import SavedSearchScreen from '../screens/SavedSearchScreen';
import MyAdsScreen from '../screens/MyAdsScreen';
import EditAdScreen from '../screens/EditAdScreen';
import AdminHomeScreen from '../screens/admin/AdminHomeScreen';
import AdminPendingAdsScreen from '../screens/admin/AdminPendingAdsScreen';
import AdminPaymentsScreen from '../screens/admin/AdminPaymentsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import { COLORS } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const NAV_THEME = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: COLORS.bg, primary: COLORS.brand },
};

// Renders the center "Post Ad" tab icon as a raised circular button,
// floating above the tab bar - the classic OLX "SELL" affordance.
function PostAdTabIcon({ focused }) {
  return (
    <View style={styles.fabWrap}>
      <View style={[styles.fab, focused && styles.fabFocused]}>
        <PlusCircle color="#fff" size={26} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function MainTabs() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  // Gate the Post Ad / Chat / Notifications / Profile tabs behind login,
  // same as the web app's ProtectedRoute - tapping them while logged out
  // sends you to Login instead of switching tabs. Home stays public.
  const guardTab = (navigation) => (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigation.navigate('Login');
    }
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleStyle: { fontWeight: '700' },
        tabBarActiveTintColor: COLORS.brand,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <Home color={color} size={size - 2} /> }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Chat', tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size - 2} /> }}
        listeners={({ navigation }) => ({ tabPress: guardTab(navigation) })}
      />
      <Tab.Screen
        name="PostAd"
        component={PostAdScreen}
        options={{
          headerShown: false,
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => <PostAdTabIcon focused={focused} />,
        }}
        listeners={({ navigation }) => ({ tabPress: guardTab(navigation) })}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Bell color={color} size={size - 2} /> }}
        listeners={({ navigation }) => ({ tabPress: guardTab(navigation) })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false, tabBarIcon: ({ color, size }) => <User color={color} size={size - 2} /> }}
        listeners={({ navigation }) => ({ tabPress: guardTab(navigation) })}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={NAV_THEME}>
      <Stack.Navigator screenOptions={{ headerTitleStyle: { fontWeight: '700' }, headerTintColor: COLORS.text }}>
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Ad Details' }} />
        <Stack.Screen name="CategoryProducts" component={ProductListScreen} />
        <Stack.Screen name="SearchResults" component={ProductListScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment' }} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="MyAds" component={MyAdsScreen} options={{ title: 'My Ads' }} />
        <Stack.Screen name="EditAd" component={EditAdScreen} options={{ title: 'Edit Ad' }} />
        <Stack.Screen name="Favourites" component={FavouritesScreen} options={{ title: 'Favourites' }} />
        <Stack.Screen name="SavedSearches" component={SavedSearchScreen} options={{ title: 'Saved Searches' }} />
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
        <Stack.Screen name="AdminPendingAds" component={AdminPendingAdsScreen} options={{ title: 'Pending Ads' }} />
        <Stack.Screen name="AdminPayments" component={AdminPaymentsScreen} options={{ title: 'Payments' }} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Users' }} />
        <Stack.Screen name="AdminReports" component={AdminReportsScreen} options={{ title: 'Reports' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ presentation: 'modal', headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 62,
    paddingTop: 6,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#ececec',
  },
  tabBarLabel: { fontSize: 10.5, fontWeight: '600' },
  fabWrap: { alignItems: 'center', justifyContent: 'center', top: -18 },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 999,
    backgroundColor: COLORS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#fff',
  },
  fabFocused: { backgroundColor: COLORS.brandDark },
});
